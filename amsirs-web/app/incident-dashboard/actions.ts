'use server';

import { decrypt } from '@/lib/encryption';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

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

  const { data, error } = await supabase
    .from('students')
    .select('id, student_id, first_name, last_name, grade_level, section')
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
  
  return data || [];
}

export async function recalculateStudentFlags(studentId: string, supabase: any) {
  // 1. Fetch all involvements for this student where role is Offender
  const { data: involvements, error: invError } = await supabase
    .from('incident_involvements')
    .select('incident_id, incident_reports(severity)')
    .eq('student_id', studentId)
    .eq('role', 'Offender');

  if (invError) {
    console.error("🚨 Error fetching involvements for recalculation:", invError.message);
    return;
  }

  // 2. Tally up the severities
  let low = 0, medium = 0, high = 0;
  for (const inv of involvements || []) {
    const severity = inv.incident_reports?.severity;
    if (severity === 'Low') low++;
    else if (severity === 'Medium') medium++;
    else if (severity === 'High') high++;
  }

  // 3. Apply ABC EWS Threshold Rules
  let isFlagged = false;
  let flagReason = null;
  let reviewStatus = 'Pending';

  if (high >= 1) {
    isFlagged = true;
    flagReason = `Triggered by ${high} High Severity Incident(s)`;
  } else if (medium >= 2) {
    isFlagged = true;
    flagReason = `Triggered by ${medium} Medium Severity Incident(s)`;
  } else if (low >= 3) {
    isFlagged = true;
    flagReason = `Triggered by ${low} Low Severity Incident(s)`;
  }

  // 4. Update the student_flags table (Upsert logic to ensure record exists)
  const { data: existingFlag } = await supabase
    .from('student_flags')
    .select('id, review_status')
    .eq('student_id', studentId)
    .maybeSingle();

  if (existingFlag) {
    await supabase
      .from('student_flags')
      .update({
        low_severity_count: low,
        medium_severity_count: medium,
        high_severity_count: high,
        is_flagged: isFlagged,
        flag_reason: flagReason,
        // If it's no longer flagged, reset review status. If it was already under review, keep it.
        review_status: isFlagged ? (existingFlag.review_status !== 'Resolved' ? existingFlag.review_status : 'Pending') : 'Pending',
        last_calculated_at: new Date().toISOString()
      })
      .eq('id', existingFlag.id);
  } else {
    await supabase
      .from('student_flags')
      .insert({
        student_id: studentId,
        low_severity_count: low,
        medium_severity_count: medium,
        high_severity_count: high,
        is_flagged: isFlagged,
        flag_reason: flagReason,
        review_status: reviewStatus,
        last_calculated_at: new Date().toISOString()
      });
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
    .select(`*, students(id, first_name, last_name, student_id)`)
    .eq('incident_id', incidentId);
    
  if (error) {
    console.error("Error fetching AI matches:", error);
    return [];
  }
  return data || [];
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

  const { data, error } = await supabase
    .from('incident_ai_matches')
    .insert({
      incident_id: incidentId,
      student_id: studentId,
      match_percentage: matchPercentage
    })
    .select(`*, students(id, first_name, last_name, student_id)`)
    .single();

  if (error) {
    console.error("Error saving AI match:", error);
    return null;
  }
  
  return data;
}