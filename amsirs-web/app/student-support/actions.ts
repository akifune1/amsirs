'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { encrypt, decrypt } from '@/lib/encryption';

import type {
  StudentRecord,
  StudentCaseDetails,
  DashboardStats,
  ActionResponse,
  SupportIntervention,
} from './types';

function getRiskLevelFromCounts(low: number, medium: number, high: number): 'Low' | 'Medium' | 'High' {
  if (high >= 1) return 'High';
  if (medium >= 2) return 'Medium'; // Or 'High' depending on specific policy
  return 'Low'; // If flagged but not medium/high, it's low
}

// ==========================================
// 🔐 AUTHORIZATION HELPER
// ==========================================

interface AuthorizedUser {
  user_id: string;
  role: 'counselor' | 'admin';
}

export async function verifyStudentSupportAccess(): Promise<{ supabase: any; auth: AuthorizedUser }> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized: You must be logged in');

  // Check if user is a guidance counselor
  const { data: counselor } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .eq('role', 'guidance') // <--- THIS WAS THE BUG! Fixed to match your DB exactly.
    .maybeSingle();

  if (counselor) {
    return { supabase, auth: { user_id: user.id, role: 'counselor' } };
  }

  // Check if user is an admin
  const { data: admin } = await supabase
    .from('system_admins')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (admin && admin.role !== 'it_admin') {
    return { supabase, auth: { user_id: user.id, role: 'admin' } };
  }

  throw new Error('Forbidden: You do not have permission to access student support');
}

// ==========================================
// 👤 FETCH CURRENT USER PROFILE
// ==========================================
export async function getCurrentUserProfile(): Promise<ActionResponse<{ name: string; roleLabel: string }>> {
  try {
    console.log("\n=== 👤 PROFILE FETCH START ===");
    const { supabase, auth } = await verifyStudentSupportAccess();
    console.log("1. Access Verified. Found Role:", auth.role);

    // If it's an admin, they don't have a name in user_profiles
    if (auth.role === 'admin') {
      console.log("2. Admin detected. Returning default admin profile.");
      return { success: true, data: { name: 'System Administrator', roleLabel: 'Admin Portal' } };
    }

    // Fetch the counselor's name
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', auth.user_id)
      .maybeSingle();

    if (profileError) {
      console.error("2. Supabase Query Error:", profileError.message);
      throw new Error(profileError.message);
    }

    console.log("3. DB Profile Data Found:", profile);

    const name = (profile?.first_name && profile?.last_name)
      ? `${profile.first_name} ${profile.last_name}`
      : 'Guidance Counselor';

    console.log("4. Final Name Resolved:", name);
    return { success: true, data: { name, roleLabel: 'Counselor Portal' } };
  } catch (error) {
    console.error("❌ Profile Fetch Caught Error:", error);
    return { success: false, error: 'Failed to fetch user profile' };
  }
}

// ==========================================
// 📊 FETCH DASHBOARD STATISTICS
// ==========================================

export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
  try {
    const { supabase } = await verifyStudentSupportAccess();

    const { data: interventions, error } = await supabase
      .from('support_interventions')
      .select('case_status')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Note: Checking for both 'Active' (UI) and 'ongoing' (DB schema) to be safe
    const activeCases = interventions?.filter((i: any) => i.case_status === 'Active' || i.case_status === 'ongoing').length || 0;
    const resolvedCases = interventions?.filter((i: any) => i.case_status === 'Resolved' || i.case_status === 'resolved').length || 0;
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
// 🚩 FETCH FLAGGED STUDENTS (UPDATED FOR MATH SYSTEM)
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
    console.log("\n=== 🚩 FETCHING FLAGGED STUDENTS ===");

    // 1. Fetch from the table 
    // NOTE: Make sure your table in Supabase is actually named 'student_flags'
    const { data: flaggedData, error } = await supabase
      .from('student_flags')
      .select(`
        low_severity_count,
        medium_severity_count,
        high_severity_count,
        flag_reason,
        is_flagged,
        student_id,
        students (
          first_name,
          last_name,
          grade_level,
          section,
          student_id,
          incident_involvements (id)
        )
      `)
      .eq('is_flagged', true);

    if (error) {
      console.error("❌ Supabase Query Error:", error.message);
      throw new Error(error.message);
    }

    // PRINT THE RAW DATA SO WE CAN SEE WHAT SUPABASE SEES
    console.log("📥 Raw Data from Supabase:", JSON.stringify(flaggedData, null, 2));

    if (!flaggedData || flaggedData.length === 0) {
      console.log("⚠️ No flagged students found in the database. Returning empty array.");
      return { success: true, data: [] };
    }

    // 2. Fetch latest interventions to determine Counseling Status
    const studentIds = flaggedData.map((f: any) => f.student_id);
    const { data: interventions } = await supabase
      .from('support_interventions')
      .select('student_id, case_status')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });

    // 3. Map into the StudentRecord format your UI expects
    let students: StudentRecord[] = flaggedData.map((flag: any) => {
      const studentInfo = flag.students;

      if (!studentInfo) {
        console.error(`⚠️ Missing student data for flag record: ${flag.student_id} (Foreign Key Issue)`);
      }

      // Find the latest intervention for this student
      const latestIntervention = interventions?.find((i: any) => i.student_id === flag.student_id);

      let cStatus: 'Active' | 'Pending' | 'Resolved' | 'Not Started' = 'Not Started';
      if (latestIntervention) {
        const dbStatus = latestIntervention.case_status?.toLowerCase();
        if (dbStatus === 'ongoing' || dbStatus === 'active') cStatus = 'Active';
        else if (dbStatus === 'resolved') cStatus = 'Resolved';
        else cStatus = 'Pending';
      }

      return {
        id: flag.student_id,
        studentId: studentInfo?.student_id || 'UNKNOWN',
        name: studentInfo ? `${studentInfo.first_name} ${studentInfo.last_name}` : 'Unknown Student',
        gradeSection: studentInfo ? `${studentInfo.grade_level} - ${studentInfo.section}` : 'Unknown',
        attendanceConcern: false,
        absenceCount: 0,
        incidentCount: studentInfo?.incident_involvements?.length || 0,
        lowCount: flag.low_severity_count || 0,
        mediumCount: flag.medium_severity_count || 0,
        highCount: flag.high_severity_count || 0,
        flagReason: flag.flag_reason || undefined,
        riskLevel: getRiskLevelFromCounts(
          flag.low_severity_count || 0, 
          flag.medium_severity_count || 0, 
          flag.high_severity_count || 0
        ),
        counselingStatus: cStatus,
      };
    });

    // 4. Sort High Risk to the top naturally
    students.sort((a, b) => {
      const riskWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
    });

    // 5. Apply In-Memory Filters (Search & Risk Level)
    if (riskLevel && ['Low', 'Medium', 'High'].includes(riskLevel)) {
      students = students.filter(s => s.riskLevel === riskLevel);
    }
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      students = students.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.studentId.toLowerCase().includes(term)
      );
    }

    // 6. Apply Pagination
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const offset = (validPage - 1) * validLimit;
    const paginatedStudents = students.slice(offset, offset + validLimit);

    console.log("✅ Successfully Mapped & Returned Students:", paginatedStudents.length);

    return {
      success: true,
      data: paginatedStudents,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch flagged students';
    console.error("❌ Action Caught Error:", message);
    return { success: false, error: message };
  }
}

// ==========================================
// 👤 FETCH SINGLE STUDENT CASE DETAILS
// ==========================================

export async function getStudentCaseDetails(studentId: string): Promise<ActionResponse<StudentCaseDetails>> {
  try {
    const { supabase } = await verifyStudentSupportAccess();
    if (!studentId) throw new Error('Invalid input: student_id is required');

    // 1. Fetch student with relations
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        lrn,
        first_name,
        last_name,
        grade_level,
        section,
        address,
        birthday,
        incident_involvements (
          id,
          incident_id,
          incident_reports (id, location, severity, description, status, created_at, reported_by, image_path)
        )
      `)
      .eq('id', studentId)
      .maybeSingle();

    if (studentError) {
      console.error("❌ Case Details Query Error:", studentError.message);
      throw new Error(studentError.message);
    }
    if (!student) throw new Error('Not found: Student not found');

    // 2. Fetch the mathematical flag score
    const { data: flagRecord } = await supabase
      .from('student_flags')
      .select('low_severity_count, medium_severity_count, high_severity_count, flag_reason')
      .eq('student_id', studentId)
      .maybeSingle();

    // 3. Transform incident data securely (ADDED DECRYPTION AND IMAGE URLS)
    const incidentRecords = await Promise.all((student.incident_involvements || []).map(async (inv: any) => {
      const report = inv.incident_reports;

      let incidentImageUrl = null;
      if (report?.image_path) {
        const { data: imgData } = await supabase.storage
          .from('incident_attachments')
          .createSignedUrl(report.image_path, 3600);
        if (imgData) incidentImageUrl = imgData.signedUrl;
      }

      let decryptedDescription = 'No description provided.';
      if (report?.description) {
        try {
          decryptedDescription = report.description.includes(':')
            ? decrypt(report.description)
            : report.description;
        } catch (error) {
          decryptedDescription = "⚠️ [SYSTEM ERROR]: Payload decryption failed.";
        }
      }

      return {
        id: inv.id,
        date: report?.created_at || new Date().toISOString(),
        title: report?.location || 'Incident',
        severity: report?.severity || 'Low',
        reporter: report?.reported_by || 'Staff',
        status: report?.status || 'Unknown',
        description: decryptedDescription,
        imageUrl: incidentImageUrl
      };
    }));

    // Sort incidents to show the newest first
    incidentRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 4. Fetch counseling history
    const { data: counselingSessions, error: counselingError } = await supabase
      .from('support_interventions')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (counselingError) throw new Error(counselingError.message);

    const counselingRecords = (counselingSessions || []).map((session: any) => ({
      date: session.created_at,
      type: session.intervention_type,
      notes: session.notes && session.notes.includes(':') ? decrypt(session.notes) : session.notes,
      counselor: session.counselor_id,
      followUpDate: session.follow_up_date,
      caseStatus: session.case_status,
    }));

    return {
      success: true,
      data: {
        studentName: `${student.first_name} ${student.last_name}`,
        studentId: student.student_id,
        lrn: student.lrn && student.lrn.includes(':') ? decrypt(student.lrn) : student.lrn,
        gradeSection: `${student.grade_level} - ${student.section}`,
        guardianContact: 'Pending Update',
        riskLevel: flagRecord ? getRiskLevelFromCounts(
          flagRecord.low_severity_count || 0,
          flagRecord.medium_severity_count || 0,
          flagRecord.high_severity_count || 0
        ) : 'Low',
        lowCount: flagRecord?.low_severity_count || 0,
        mediumCount: flagRecord?.medium_severity_count || 0,
        highCount: flagRecord?.high_severity_count || 0,
        flagReason: flagRecord?.flag_reason || undefined,
        attendanceStats: {
          totalAbsences: 0,
          lateRecords: 0,
          attendancePercentage: 100,
        },
        recentIncidents: incidentRecords, // Return all incidents for the case file
        counselingHistory: counselingRecords,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch student case details';
    console.error("❌ Action Caught Error:", message);
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
  followUpDate: string,
  caseStatus: string
): Promise<ActionResponse<{ interventionId: string }>> {
  try {
    const { supabase, auth } = await verifyStudentSupportAccess();

    if (!studentId || !interventionType || !notes) {
      return { success: false, error: 'Missing required fields' };
    }

    const { data: intervention, error: insertError } = await supabase
      .from('support_interventions')
      .insert({
        student_id: studentId,
        counselor_id: auth.user_id,
        intervention_type: interventionType,
        notes: encrypt(notes),
        follow_up_date: followUpDate,
        case_status: caseStatus === 'Active' ? 'ongoing' : caseStatus, // Aligning with your DB schema
      })
      .select('id')
      .single();

    if (insertError) throw new Error(insertError.message);

    // --- NOTIFICATIONS DISPATCH ---
    try {
      const { createNotification } = await import('../utils/notificationHelpers');
      const { data: student } = await supabase
        .from('students')
        .select('account_id, first_name')
        .eq('id', studentId)
        .single();
      
      if (student && student.account_id) {
        await createNotification({
          category: "Student support",
          severity: "info",
          title: "Counseling session scheduled",
          message: `Hi ${student.first_name}, a support intervention has been scheduled for you. Please check your portal.`,
          icon: "Calendar",
          userId: student.account_id
        });
      }
    } catch (notifErr) {
      console.error("Failed to dispatch counseling notification", notifErr);
    }
    // ------------------------------

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

    // Map UI statuses to DB statuses if needed
    const dbStatus = newStatus === 'Active' ? 'ongoing' : newStatus;

    const { error: updateError } = await supabase
      .from('support_interventions')
      .update({
        case_status: dbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', interventionId);

    if (updateError) throw new Error(updateError.message);

    // --- NOTIFICATIONS DISPATCH ---
    try {
      if (newStatus === 'Pending Review') {
        const { createNotification } = await import('../utils/notificationHelpers');
        await createNotification({
          category: "Student support",
          severity: "warning",
          title: "Follow-up Required",
          message: `A counseling case status was changed to 'Pending Review' by a counselor.`,
          icon: "CalendarAlert",
          targetRoles: ["guidance", "school_admin"]
        });
      }
    } catch (notifErr) {
      console.error("Failed to dispatch follow-up notification", notifErr);
    }
    // ------------------------------

    revalidatePath('/student-support');

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update case status';
    return { success: false, error: message };
  }
}