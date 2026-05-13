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

export async function linkStudentToIncident(incidentId: string, studentId: string) {
  console.log(`🔗 [LINKING ATTEMPT] Incident: ${incidentId} -> Student: ${studentId}`);

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
      student_id: studentId 
    }]);

  if (error) {
    console.error("🚨 [DATABASE REJECTED LINK]:", error.message);
    console.error("Details:", error.details);
    throw new Error(error.message); // This will show up in your logs now
  }

  console.log("✅ [LINK SUCCESS] Database updated.");
  revalidatePath('/dashboard');
}

// 3. Remove a mistaken link
export async function unlinkStudentFromIncident(involvementId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  await supabase
    .from('incident_involvements')
    .delete()
    .eq('id', involvementId);

  // Refresh the dashboard to remove the link
  revalidatePath('/dashboard');
}