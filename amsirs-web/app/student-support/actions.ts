'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import type {
  StudentRecord,
  StudentCaseDetails,
  DashboardStats,
  ActionResponse,
  FlaggedStudent,
  SupportIntervention,
} from './types';

// ==========================================
// 🔐 AUTHORIZATION HELPER
// ==========================================

interface AuthorizedUser {
  user_id: string;
  role: 'counselor' | 'admin';
}

async function verifyStudentSupportAccess(): Promise<{ supabase: any; auth: AuthorizedUser }> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized: You must be logged in');

  // Check if user is a guidance counselor
  const { data: counselor } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .eq('role', 'Guidance Counselor')
    .maybeSingle();

  if (counselor) {
    return { supabase, auth: { user_id: user.id, role: 'counselor' } };
  }

  // Check if user is an admin
  const { data: admin } = await supabase
    .from('system_admins')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (admin) {
    return { supabase, auth: { user_id: user.id, role: 'admin' } };
  }

  throw new Error('Forbidden: You do not have permission to access student support');
}

// ==========================================
// 📊 FETCH DASHBOARD STATISTICS
// ==========================================

export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
  try {
    const { supabase } = await verifyStudentSupportAccess();

    // Fetch all support interventions
    const { data: interventions, error } = await supabase
      .from('support_interventions')
      .select('case_status')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const activeCases = interventions?.filter((i: any) => i.case_status === 'Active').length || 0;
    const resolvedCases = interventions?.filter((i: any) => i.case_status === 'Resolved').length || 0;
    const highRiskCases = interventions?.filter((i: any) => i.case_status === 'Escalated').length || 0;
    const pendingFollowUps = interventions?.filter((i: any) => i.case_status === 'Pending Review').length || 0;

    return {
      success: true,
      data: {
        activeCases,
        highRisk: highRiskCases,
        pendingFollowUps,
        resolvedCases,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    return { success: false, error: message };
  }
}

// ==========================================

export async function getFlaggedStudents(
  riskLevel?: string,
  filterType?: string,
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<ActionResponse<StudentRecord[]>> {
  try {
    const { supabase } = await verifyStudentSupportAccess();

    // Validate inputs
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const validFilterType = filterType || 'all';

    // Fetch from flagged_students_view
    let query = supabase
      .from('flagged_students_view')
      .select('*', { count: 'exact' })
      .order('risk_level', { ascending: false });

    // Apply risk level filter
    if (riskLevel && ['Low', 'Medium', 'High'].includes(riskLevel)) {
      query = query.eq('risk_level', riskLevel);
    }

    // Apply filter type
    if (validFilterType === 'attendance') {
      query = query.gt('absences_7d', 2);
    } else if (validFilterType === 'behavior') {
      query = query.gt('incident_count_30d', 1);
    }

    // Apply search
    if (search && search.trim()) {
      query = query.ilike('full_name', `%${search.trim()}%`);
    }

    // Apply pagination
    const offset = (validPage - 1) * validLimit;
    query = query.range(offset, offset + validLimit - 1);

    const { data: flaggedStudents, error, count } = await query;

    if (error) throw new Error(error.message);

    if (!flaggedStudents) {
      return { success: true, data: [] };
    }

    // Transform data to StudentRecord format
    const students: StudentRecord[] = flaggedStudents.map((student: FlaggedStudent) => ({
      id: student.student_id,
      studentId: student.student_id,
      name: student.full_name,
      gradeSection: student.grade_section,
      attendanceConcern: student.absences_7d >= 3,
      absenceCount: student.absences_7d,
      incidentCount: student.incident_count_30d,
      riskLevel: student.risk_level,
      counselingStatus: 'Not Started' as const,
    }));

    return {
      success: true,
      data: students,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch flagged students';
    return { success: false, error: message };
  }
}

// ==========================================
// 👤 FETCH SINGLE STUDENT CASE DETAILS & SUPPORT HISTORY
// ==========================================

export async function getStudentCaseDetails(studentId: string): Promise<ActionResponse<StudentCaseDetails>> {
  try {
    const { supabase } = await verifyStudentSupportAccess();

    // Validate student ID
    if (!studentId) throw new Error('Invalid input: student_id is required');

    // Fetch student with relations
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(
        `
        id,
        student_id,
        first_name,
        last_name,
        grade_level,
        guardian_email,
        attendance_records (id, is_absent, is_late, created_at),
        incident_involvements (
          id,
          incident_id,
          incident_reports (id, location, severity, description, status, created_at, reporting_staff)
        )
      `
      )
      .eq('id', studentId)
      .maybeSingle();

    if (studentError) throw new Error(studentError.message);
    if (!student) throw new Error('Not found: Student not found');

    // Calculate attendance stats
    const totalAbsences = student.attendance_records?.filter((a: any) => a.is_absent).length || 0;
    const lateRecords = student.attendance_records?.filter((a: any) => a.is_late).length || 0;
    const totalRecords = student.attendance_records?.length || 1;
    const attendancePercentage = Math.round(((totalRecords - totalAbsences) / totalRecords) * 100);

    // Transform incident data
    const incidentRecords = (student.incident_involvements || []).map((inv: any) => {
      const report = inv.incident_reports;
      return {
        id: inv.id,
        date: report?.created_at || new Date().toISOString(),
        title: report?.location || 'Incident',
        severity: report?.severity || 'Low',
        reporter: report?.reporting_staff || 'Unknown',
      };
    });

    // Fetch counseling history
    const { data: counselingSessions, error: counselingError } = await supabase
      .from('support_interventions')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (counselingError) throw new Error(counselingError.message);

    const counselingRecords = (counselingSessions || []).map((session: SupportIntervention) => ({
      date: session.created_at,
      type: session.intervention_type,
      notes: session.notes,
      counselor: session.counselor_id,
      followUpDate: session.follow_up_date,
      caseStatus: session.case_status,
    }));

    // Determine risk level
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    const absences7d = await getRecentAbsences(supabase, studentId, 7);
    const incidents30d = await getRecentIncidents(supabase, studentId, 30);
    
    if (absences7d >= 3 && incidents30d >= 2) {
      riskLevel = 'High';
    } else if (absences7d >= 3 || incidents30d >= 2) {
      riskLevel = 'Medium';
    }

    return {
      success: true,
      data: {
        studentName: `${student.first_name} ${student.last_name}`,
        studentId: student.id,
        gradeSection: student.grade_level,
        guardianContact: student.guardian_email || 'Not provided',
        riskLevel,
        attendanceStats: {
          totalAbsences,
          lateRecords,
          attendancePercentage,
        },
        recentIncidents: incidentRecords.slice(0, 5),
        counselingHistory: counselingRecords.slice(0, 10),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch student case details';
    return { success: false, error: message };
  }
}

// ==========================================
// 🆕 CREATE COUNSELING INTERVENTION
// ==========================================

export async function createIntervention(
  studentId: string,
  interventionType: string,
  notes: string,
  followUpDate: string
): Promise<ActionResponse<{ interventionId: string }>> {
  try {
    const { supabase, auth } = await verifyStudentSupportAccess();

    // Validate input
    if (!studentId || !interventionType || !notes) {
      return { success: false, error: 'Missing required fields: studentId, interventionType, and notes' };
    }

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', studentId)
      .maybeSingle();

    if (studentError) throw new Error(studentError.message);
    if (!student) throw new Error('Not found: Student not found');

    // Create intervention record
    const { data: intervention, error: insertError } = await supabase
      .from('support_interventions')
      .insert({
        student_id: studentId,
        counselor_id: auth.user_id,
        intervention_type: interventionType,
        notes,
        follow_up_date: followUpDate,
        case_status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) throw new Error(insertError.message);
    if (!intervention) throw new Error('Failed to create intervention');

    revalidatePath('/student-support');

    return {
      success: true,
      data: { interventionId: intervention.id },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create intervention';
    return { success: false, error: message };
  }
}

// ==========================================
// ✏️ UPDATE CASE STATUS
// ==========================================

export async function updateCaseStatus(
  interventionId: string,
  newStatus: string
): Promise<ActionResponse<void>> {
  try {
    const { supabase, auth } = await verifyStudentSupportAccess();

    // Validate input
    const validStatuses = ['Active', 'Pending Review', 'Resolved', 'Escalated'];
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return { success: false, error: 'Invalid case status' };
    }

    // Verify intervention exists and user has access
    const { data: intervention, error: fetchError } = await supabase
      .from('support_interventions')
      .select('*')
      .eq('id', interventionId)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!intervention) throw new Error('Not found: Intervention not found');

    // Check authorization (counselor can only update own, admin can update any)
    if (auth.role === 'counselor' && intervention.counselor_id !== auth.user_id) {
      throw new Error('Forbidden: You can only update your own interventions');
    }

    // Update case status
    const { error: updateError } = await supabase
      .from('support_interventions')
      .update({
        case_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', interventionId);

    if (updateError) throw new Error(updateError.message);

    revalidatePath('/student-support');

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update case status';
    return { success: false, error: message };
  }
}

// ==========================================
// 🔍 HELPER FUNCTIONS
// ==========================================

async function getRecentAbsences(supabase: any, studentId: string, days: number): Promise<number> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('student_id', studentId)
    .eq('is_absent', true)
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .limit(1, { count: 'exact' });

  return error ? 0 : (data?.length || 0);
}

async function getRecentIncidents(supabase: any, studentId: string, days: number): Promise<number> {
  const { data, error } = await supabase
    .from('incident_involvements')
    .select('id')
    .eq('student_id', studentId)
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .limit(1, { count: 'exact' });

  return error ? 0 : (data?.length || 0);
}


