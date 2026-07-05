'use server';

import { decrypt } from '@/lib/encryption';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// ==========================================
// 🔐 HELPER: Create authenticated Supabase client
// ==========================================

async function getAuthClient() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized: No active session');
  return { supabase, user };
}

// ==========================================
// 📋 FETCH INCIDENT REPORTS (paginated, with filters + student two-pass)
// ==========================================

export async function fetchIncidentReports(params: {
  page: number;
  itemsPerPage: number;
  categoryFilter?: string;
  timeframeFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  locationSearch?: string;
  studentId?: string;      // DB id of selected student (for verified link pass)
  studentName?: string;    // Name string (for unverified name match pass)
}): Promise<{
  success: boolean;
  data?: any[];
  count?: number;
  error?: string;
}> {
  try {
    const { supabase } = await getAuthClient();

    // ---- Student filter active → two-pass query ----
    if (params.studentId || params.studentName) {
      return await fetchWithStudentFilter(supabase, params);
    }

    // ---- Standard query (no student filter) ----
    let query = supabase
      .from('incident_reports')
      .select(`
        *,
        incident_involvements (
          id,
          role,
          students (
            id,
            student_id,
            first_name,
            last_name,
            grade_level,
            face_photo_path
          )
        )
      `, { count: 'exact' });

    query = applyCommonFilters(query, params);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(
        (params.page - 1) * params.itemsPerPage,
        params.page * params.itemsPerPage - 1
      );

    if (error) return { success: false, error: error.message };

    return { success: true, data: data || [], count: count || 0 };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch reports' };
  }
}

// ---- Helper: apply category, timeframe, date range, location filters ----
function applyCommonFilters(query: any, params: {
  categoryFilter?: string;
  timeframeFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  locationSearch?: string;
}) {
  if (params.categoryFilter && params.categoryFilter !== 'All') {
    query = query.eq('offense_category', params.categoryFilter);
  }

  if (params.locationSearch && params.locationSearch.trim()) {
    query = query.ilike('location', `%${params.locationSearch.trim()}%`);
  }

  // Custom date range takes precedence over preset
  if (params.dateFrom || params.dateTo) {
    if (params.dateFrom) {
      query = query.gte('created_at', new Date(params.dateFrom).toISOString());
    }
    if (params.dateTo) {
      const end = new Date(params.dateTo);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }
  } else if (params.timeframeFilter && params.timeframeFilter !== 'All') {
    const now = new Date();
    if (params.timeframeFilter === '7days') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      query = query.gte('created_at', d.toISOString());
    } else if (params.timeframeFilter === '30days') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      query = query.gte('created_at', d.toISOString());
    }
  }

  return query;
}

// ---- Helper: Two-pass student search ----
async function fetchWithStudentFilter(supabase: any, params: any) {
  const selectFields = `
    *,
    incident_involvements (
      id,
      role,
      students (
        id,
        student_id,
        first_name,
        last_name,
        grade_level,
        face_photo_path
      )
    )
  `;

  // Pass 1: Verified links (via incident_involvements)
  let verifiedIds: string[] = [];
  if (params.studentId) {
    const { data: involvements } = await supabase
      .from('incident_involvements')
      .select('incident_id')
      .eq('student_id', params.studentId);

    verifiedIds = (involvements || []).map((inv: any) => inv.incident_id);
  }

  let verifiedReports: any[] = [];
  if (verifiedIds.length > 0) {
    let q = supabase
      .from('incident_reports')
      .select(selectFields)
      .in('id', verifiedIds);

    q = applyCommonFilters(q, params);

    const { data } = await q.order('created_at', { ascending: false });
    verifiedReports = (data || []).map((r: any) => ({ ...r, _matchType: 'verified' }));
  }

  // Pass 2: Unverified name matches (free-text first_name / last_name on the report)
  let unverifiedReports: any[] = [];
  if (params.studentName && params.studentName.trim()) {
    const name = params.studentName.trim();
    const nameParts = name.split(/\s+/);
    
    // Build OR filter for each name part against both first_name and last_name
    const orClauses = nameParts
      .filter((p: string) => p.length >= 2)
      .flatMap((p: string) => [`first_name.ilike.%${p}%`, `last_name.ilike.%${p}%`]);

    if (orClauses.length > 0) {
      let q = supabase
        .from('incident_reports')
        .select(selectFields)
        .or(orClauses.join(','));

      // Exclude already-found verified IDs
      if (verifiedIds.length > 0) {
        // Supabase doesn't have a direct .not('id', 'in', ...) for arrays easily,
        // so we filter client-side
      }

      q = applyCommonFilters(q, params);

      const { data } = await q.order('created_at', { ascending: false });
      const verifiedIdSet = new Set(verifiedIds);
      unverifiedReports = (data || [])
        .filter((r: any) => !verifiedIdSet.has(r.id))
        .map((r: any) => ({ ...r, _matchType: 'unverified' }));
    }
  }

  // Merge: verified first, then unverified
  const merged = [...verifiedReports, ...unverifiedReports];

  // Client-side pagination on merged results
  const total = merged.length;
  const start = (params.page - 1) * params.itemsPerPage;
  const paged = merged.slice(start, start + params.itemsPerPage);

  return { success: true, data: paged, count: total };
}

// ==========================================
// 📊 FETCH INCIDENT STATS (for stat cards)
// ==========================================

export async function fetchIncidentStats(): Promise<{
  success: boolean;
  today: number;
  week: number;
  month: number;
  error?: string;
}> {
  try {
    const { supabase } = await getAuthClient();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date(startOfToday);
    startOfMonth.setMonth(startOfMonth.getMonth() - 1);

    const [todayRes, weekRes, monthRes] = await Promise.all([
      supabase.from('incident_reports').select('id', { count: 'exact', head: true })
        .gte('created_at', startOfToday.toISOString()),
      supabase.from('incident_reports').select('id', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString()),
      supabase.from('incident_reports').select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString()),
    ]);

    return {
      success: true,
      today: todayRes.count ?? 0,
      week: weekRes.count ?? 0,
      month: monthRes.count ?? 0,
    };
  } catch (err) {
    return { success: false, today: 0, week: 0, month: 0, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// ==========================================
// 🔍 SEARCH STUDENTS FOR FILTER (lightweight autocomplete)
// ==========================================

export async function searchStudentsForFilter(query: string): Promise<{
  success: boolean;
  students?: { id: string; first_name: string; last_name: string; student_id: string; section?: string }[];
  error?: string;
}> {
  if (!query || query.trim().length < 2) {
    return { success: true, students: [] };
  }

  try {
    const { supabase } = await getAuthClient();
    const term = query.trim();

    const { data, error } = await supabase
      .from('students')
      .select('id, first_name, last_name, student_id, section')
      .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,student_id.ilike.%${term}%`)
      .order('last_name', { ascending: true })
      .limit(8);

    if (error) return { success: false, error: error.message };
    return { success: true, students: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Search failed' };
  }
}

// ==========================================
// 🔒 DATA SECURITY & DECRYPTION
// ==========================================

export async function getDecryptedDescription(ciphertext: string) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // Security Check: Ensure the person clicking is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    return decrypt(ciphertext);
  } catch (error) {
    return "Error: Could not decrypt data. Key mismatch.";
  }
}

export async function getSecureImageUrl(imagePath: string | null) {
  if (!imagePath) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // Security check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Generate a URL that expires in 60 minutes
  const { data, error } = await supabase.storage
    .from('incident_attachments')
    .createSignedUrl(imagePath, 3600);
    
  if (error) {
    console.error("Error fetching image:", error);
    return null;
  }
  
  return data.signedUrl;
}

export async function getStudentPhoto(facePhotoPath: string | null) {
  if (!facePhotoPath) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data, error } = await supabase.storage
    .from('student_faces')
    .createSignedUrl(facePhotoPath, 3600);
    
  if (error) return null;
  return data.signedUrl;
}

// ==========================================
// 🔗 IDENTITY VERIFICATION & LINKING
// ==========================================

// 1. Search for students to link
export async function searchStudents(query: string) {
  if (!query || query.length < 2) return [];
  
  // 1. Check if the frontend is actually talking to the backend
  console.log(`🔍 [SEARCH INITIATED] Query: "${query}"`);
  
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // Security Check: Ensure the person clicking is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('students')
    .select('id, student_id, first_name, last_name, grade_level, section, face_photo_path')
    // I added first_name here so it searches all three fields!
    .or(`last_name.ilike.%${query}%,first_name.ilike.%${query}%,student_id.ilike.%${query}%`)
    .limit(5);

  // 2. Catch and log exact Supabase errors
  if (error) {
    console.error("🚨 [SUPABASE REJECTED SEARCH]:", error.message);
    console.error("Details:", error.details);
    return [];
  }

  // 3. Confirm how many records were actually pulled
  console.log(`✅ [SEARCH SUCCESS] Found ${data?.length || 0} matching records.`);
  
  const enrichedData = await Promise.all(
    (data || []).map(async (student: any) => {
      let photoUrl = null;
      if (student.face_photo_path) {
        const { data: photoData } = await supabase.storage
          .from('student_faces')
          .createSignedUrl(student.face_photo_path, 3600);
        if (photoData) photoUrl = photoData.signedUrl;
      }
      return { ...student, photoUrl };
    })
  );

  return enrichedData;
}

async function recalculateStudentFlags(studentId: string, supabase: any) {
  // 1. Fetch all involvements for this student where role is Offender
  const { data: involvements, error: invError } = await supabase
    .from('incident_involvements')
    .select('incident_id, incident_reports(status)')
    .eq('student_id', studentId)
    .eq('role', 'Offender');

  if (invError) {
    console.error("🚨 Error fetching involvements for recalculation:", invError.message);
    return;
  }

  // 2. Check if ANY incident is 'Under Investigation'
  let isFlagged = false;
  let flagReason = null;
  let reviewStatus = 'Pending';

  for (const inv of involvements || []) {
    const report = inv.incident_reports;
    if (report && report.status === 'Under Investigation') {
      isFlagged = true;
      flagReason = 'Involved in an incident currently Under Investigation';
      break;
    }
  }

  // 4. Update the student_flags table (Upsert logic to ensure record exists)
  const { data: existingFlag } = await supabase
    .from('student_flags')
    .select('id, review_status, is_flagged')
    .eq('student_id', studentId)
    .maybeSingle();

  let riskEscalated = false;

  if (existingFlag) {
    if (!existingFlag.is_flagged && isFlagged) {
      riskEscalated = true;
    }
    
    await supabase
      .from('student_flags')
      .update({
        is_flagged: isFlagged,
        flag_reason: flagReason,
        // If it's no longer flagged, reset review status. If it was already under review, keep it.
        review_status: isFlagged ? (existingFlag.review_status !== 'Resolved' ? existingFlag.review_status : 'Pending') : 'Pending',
        last_calculated_at: new Date().toISOString()
      })
      .eq('id', existingFlag.id);
  } else {
    if (isFlagged) riskEscalated = true;
    
    await supabase
      .from('student_flags')
      .insert({
        student_id: studentId,
        is_flagged: isFlagged,
        flag_reason: flagReason,
        review_status: reviewStatus,
        last_calculated_at: new Date().toISOString()
      });
  }

  // --- NOTIFICATION DISPATCH ---
  if (riskEscalated) {
    try {
      const { createNotification } = await import('../utils/notificationHelpers');
      const { data: student } = await supabase
        .from('students')
        .select('first_name, last_name')
        .eq('id', studentId)
        .single();
      
      if (student) {
        await createNotification({
          category: "Attendance & gates",
          severity: "critical",
          title: "EWS Risk Level Escalated",
          message: `${student.first_name} ${student.last_name}'s calculated risk score crossed the threshold.`,
          icon: "TrendingUp",
          targetRoles: ["guidance", "school_admin", "super_admin"]
        });
      }
    } catch (notifErr) {
      console.error("Failed to dispatch EWS escalation notification", notifErr);
    }
  }
}

export async function linkStudentToIncident(incidentId: string, studentId: string, role: string = 'Offender') {
  console.log(`🔗 [LINKING ATTEMPT] Incident: ${incidentId} -> Student: ${studentId} (${role})`);

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // Security Check: Ensure the person clicking is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // CRITICAL: We must capture 'error' here
  const { error } = await supabase
    .from('incident_involvements')
    .insert([{ 
      incident_id: incidentId, 
      student_id: studentId,
      role: role
    }]);

  if (error) {
    console.error("🚨 [DATABASE REJECTED LINK]:", error.message);
    console.error("Details:", error.details);
    throw new Error(error.message); // This will show up in your logs now
  }

  console.log("✅ [LINK SUCCESS] Database updated.");
  
  // --- NOTIFICATION DISPATCH ---
  try {
    const { createNotification } = await import('../utils/notificationHelpers');
    const { data: student } = await supabase
      .from('students')
      .select('first_name, last_name, account_id')
      .eq('id', studentId)
      .single();

    if (student) {
      // Notify guidance counselors that a student was linked
      await createNotification({
        category: "Incident management",
        severity: "warning",
        title: "Student linked to incident",
        message: `${student.first_name} ${student.last_name} was added as an involved party (${role}) to an incident.`,
        icon: "UserPlus",
        targetRoles: ["guidance", "admin"]
      });

      // Notify the student themselves if they have an account
      if (student.account_id) {
        await createNotification({
          category: "System",
          severity: "info",
          title: "Incident Update",
          message: `You have been listed as an involved party (${role}) in a recent incident report.`,
          icon: "FileWarning",
          userId: student.account_id
        });
      }
    }
  } catch (notifErr) {
    console.error("Failed to dispatch student link notification", notifErr);
  }
  // ------------------------------

  // Recalculate EWS Flags
  await recalculateStudentFlags(studentId, supabase);
  
  revalidatePath('/incident-dashboard');
}

// 3. Remove a mistaken link
export async function unlinkStudentFromIncident(involvementId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // Security Check: Ensure the person clicking is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // First get the student_id so we can recalculate later
  const { data: involvement } = await supabase
    .from('incident_involvements')
    .select('student_id')
    .eq('id', involvementId)
    .single();

  const { error } = await supabase
    .from('incident_involvements')
    .delete()
    .eq('id', involvementId);

  if (error) {
    console.error("🚨 [DATABASE REJECTED UNLINK]:", error.message);
    throw new Error(error.message);
  }

  // Recalculate EWS Flags for the student
  if (involvement?.student_id) {
    await recalculateStudentFlags(involvement.student_id, supabase);
  }

  // Refresh the dashboard to remove the link
  revalidatePath('/incident-dashboard');
}

// ==========================================
// 🤖 AI FACE MATCHING
// ==========================================

export async function getAiMatches(incidentId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('incident_ai_matches')
    .select(`*, students(id, first_name, last_name, student_id, face_photo_path)`)
    .eq('incident_id', incidentId);
    
  if (error) {
    console.error("Error fetching AI matches:", error);
    return [];
  }

  const enrichedData = await Promise.all(
    (data || []).map(async (match: any) => {
      let photoUrl = null;
      if (match.students?.face_photo_path) {
        const { data: photoData } = await supabase.storage
          .from('student_faces')
          .createSignedUrl(match.students.face_photo_path, 3600);
        if (photoData) photoUrl = photoData.signedUrl;
      }
      return { ...match, photoUrl };
    })
  );

  return enrichedData;
}

export async function getFaceEmbeddings() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase.from('face_embeddings').select('*');
  if (error) {
    console.error("Error fetching embeddings:", error);
    return [];
  }
  return data || [];
}

export async function saveAiMatch(incidentId: string, studentId: string, matchPercentage: number) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const { data, error } = await supabase
      .from('incident_ai_matches')
      .insert({
        incident_id: incidentId,
        student_id: studentId,
        match_percentage: matchPercentage
      })
      .select(`*, students(id, first_name, last_name, student_id, face_photo_path)`)
      .single();

    if (error) {
      console.error("Error saving AI match:", error);
      return null;
    }
    
    let photoUrl = null;
    if (data?.students?.face_photo_path) {
      const { data: photoData } = await supabase.storage
        .from('student_faces')
        .createSignedUrl(data.students.face_photo_path, 3600);
      if (photoData) photoUrl = photoData.signedUrl;
    }

    return { ...data, photoUrl };
  } catch (err) {
    console.error("AI Save Error:", err);
    return null;
  }
}

// ==========================================
// 🔄 INCIDENT STATUS MANAGEMENT
// ==========================================

export async function updateIncidentStatus(incidentId: string, newStatus: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('incident_reports')
    .update({ status: newStatus })
    .eq('id', incidentId);

  if (error) {
    console.error('Error updating status:', error);
    throw new Error('Failed to update status');
  }

  // Recalculate flags for all involved offenders
  const { data: involvements } = await supabase
    .from('incident_involvements')
    .select('student_id')
    .eq('incident_id', incidentId)
    .eq('role', 'Offender');

  if (involvements) {
    for (const inv of involvements) {
      if (inv.student_id) {
        await recalculateStudentFlags(inv.student_id, supabase);
      }
    }
  }

  revalidatePath('/incident-dashboard');
}

// ==========================================
// 📄 INTAKE SHEET DATA FETCH
// ==========================================

/**
 * Fetches all available data for an incident to pre-populate the intake sheet modal.
 * Decrypts the description server-side and maps linked students to victim/respondent roles.
 */
export async function fetchIntakeSheetData(incidentId: string): Promise<{
  success: boolean;
  data?: {
    victim: {
      name: string;
      dateOfBirth: string;
      age: string;
      sex: string;
      gradeYearSection: string;
      addressContact: string;
    };
    respondentStudent: {
      name: string;
      dateOfBirth: string;
      age: string;
      sex: string;
      gradeYearSection: string;
    };
    caseDetails: string;
    date: string;
  };
  error?: string;
}> {
  try {
    const { supabase } = await getAuthClient();

    // 1. Fetch the incident with linked students
    const { data: incident, error: incidentError } = await supabase
      .from('incident_reports')
      .select(`
        *,
        incident_involvements (
          id,
          role,
          students (
            id,
            first_name,
            last_name,
            grade_level,
            section,
            gender,
            birthday,
            address
          )
        )
      `)
      .eq('id', incidentId)
      .single();

    if (incidentError || !incident) {
      return { success: false, error: incidentError?.message || 'Incident not found' };
    }

    // 2. Decrypt the description
    let decryptedDescription = '';
    try {
      decryptedDescription = decrypt(incident.description);
    } catch {
      decryptedDescription = '[Could not decrypt description]';
    }

    // 3. Helper to compute age from birthday string
    function computeAge(birthday: string | null): string {
      if (!birthday) return '';
      try {
        const dob = new Date(birthday);
        if (isNaN(dob.getTime())) return '';
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age.toString();
      } catch {
        return '';
      }
    }

    // 4. Find victim and offender from involvements
    const involvements = incident.incident_involvements || [];
    const victimInv = involvements.find((inv: any) => inv.role === 'Victim');
    const offenderInv = involvements.find((inv: any) => inv.role === 'Offender');

    const victimStudent = victimInv?.students;
    const offenderStudent = offenderInv?.students;

    // 5. Build pre-fill data
    const victimData = {
      name: victimStudent
        ? `${victimStudent.last_name}, ${victimStudent.first_name}`
        : '',
      dateOfBirth: victimStudent?.birthday || '',
      age: victimStudent ? computeAge(victimStudent.birthday) : '',
      sex: victimStudent?.gender || '',
      gradeYearSection: victimStudent
        ? `${victimStudent.grade_level} - ${victimStudent.section}`
        : '',
      addressContact: victimStudent?.address || '',
    };

    const respondentStudentData = {
      name: offenderStudent
        ? `${offenderStudent.last_name}, ${offenderStudent.first_name}`
        : '',
      dateOfBirth: offenderStudent?.birthday || '',
      age: offenderStudent ? computeAge(offenderStudent.birthday) : '',
      sex: offenderStudent?.gender || '',
      gradeYearSection: offenderStudent
        ? `${offenderStudent.grade_level} - ${offenderStudent.section}`
        : '',
    };

    return {
      success: true,
      data: {
        victim: victimData,
        respondentStudent: respondentStudentData,
        caseDetails: decryptedDescription,
        date: new Date(incident.created_at).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch intake sheet data',
    };
  }
}