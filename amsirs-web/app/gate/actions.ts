'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ==========================================
// 🔐 HELPER: Create authenticated Supabase client
// ==========================================

async function getAuthenticatedClient() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );

  // Verify the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized: No active session');

  return { supabase, user };
}

// ==========================================
// 📡 FETCH ALL FACE EMBEDDINGS
// ==========================================

export async function fetchFaceEmbeddings(): Promise<{
  success: boolean;
  data?: { id: string; student_id: string; descriptor: number[] }[];
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from('face_embeddings')
      .select('id, student_id, descriptor');

    if (error) return { success: false, error: error.message };

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch embeddings' };
  }
}

// ==========================================
// 👤 LOOKUP STUDENT BY ID
// ==========================================

export async function lookupStudent(studentId: string): Promise<{
  success: boolean;
  data?: {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    is_approved: boolean;
    grade_level?: string;
    section?: string;
    photoUrl?: string | null;
  };
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from('students')
      .select('id, student_id, first_name, last_name, is_approved, grade_level, section, face_photo_path')
      .eq('id', studentId)
      .single();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Student not found' };

    let photoUrl = null;
    if (data.face_photo_path) {
      const { data: photoData } = await supabase.storage
        .from('student_faces')
        .createSignedUrl(data.face_photo_path, 3600);
      if (photoData) photoUrl = photoData.signedUrl;
    }

    return { success: true, data: { ...data, photoUrl } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to lookup student' };
  }
}

// ==========================================
// 🔁 CHECK DUPLICATE SCAN (15-second cooldown)
// ==========================================

export async function checkDuplicateScan(
  studentId: string,
  action: 'ENTRY' | 'EXIT'
): Promise<{ isDuplicate: boolean; error?: string }> {
  try {
    const { supabase } = await getAuthenticatedClient();

    const { data: recentLog } = await supabase
      .from('access_logs')
      .select('created_at')
      .eq('student_id', studentId)
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentLog) {
      const lastScan = new Date(recentLog.created_at).getTime();
      const now = Date.now();
      if ((now - lastScan) / 1000 < 15) {
        return { isDuplicate: true };
      }
    }

    return { isDuplicate: false };
  } catch (err) {
    return { isDuplicate: false, error: err instanceof Error ? err.message : 'Failed to check duplicate' };
  }
}

// ==========================================
// 📸 UPLOAD SNAPSHOT & LOG ACCESS
// ==========================================

export async function uploadSnapshotAndLog(params: {
  studentId: string;
  matchPercentage: number;
  faceDistance: number;
  action: 'ENTRY' | 'EXIT';
  snapshotBase64: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await getAuthenticatedClient();

    let snapshotPath: string | null = null;

    // Upload snapshot if provided
    if (params.snapshotBase64) {
      // Convert base64 to buffer
      const base64Data = params.snapshotBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const prefix = params.action === 'ENTRY' ? 'scan' : 'exit';
      const fileName = `${prefix}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('access-snapshots')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
        });

      if (!uploadError) {
        snapshotPath = fileName;
      }
    }

    // Insert access log
    const { error: logError } = await supabase
      .from('access_logs')
      .insert({
        student_id: params.studentId,
        match_percentage: params.matchPercentage,
        face_distance: params.faceDistance,
        snapshot_path: snapshotPath,
        action: params.action,
      });

    if (logError) return { success: false, error: logError.message };

    // --- NOTIFICATIONS DISPATCH ---
    try {
      const { createNotification } = await import('../utils/notificationHelpers');
      
      if (params.action === 'ENTRY') {
        // Check if student is flagged
        const { data: flag } = await supabase
          .from('student_flags')
          .select('is_flagged')
          .eq('student_id', params.studentId)
          .single();

        if (flag && flag.is_flagged) {
          await createNotification({
            category: "Attendance & gates",
            severity: "warning",
            title: "Flagged student scanned entry",
            message: `A student with an active flag has entered the campus.`,
            icon: "ShieldAlert",
            targetRoles: ["guidance", "admin", "school_admin", "super_admin"]
          });
        }
      } else if (params.action === 'EXIT') {
        // Check if they had an entry log today
        const todayStr = new Date().toISOString().split('T')[0]; // simple UTC date check
        const { data: entries } = await supabase
          .from('access_logs')
          .select('id')
          .eq('student_id', params.studentId)
          .eq('action', 'ENTRY')
          .gte('created_at', todayStr)
          .limit(1);

        if (!entries || entries.length === 0) {
          await createNotification({
            category: "Attendance & gates",
            severity: "critical",
            title: "Exit scanned with no entry record",
            message: `A student registered an EXIT but has no ENTRY log for today.`,
            icon: "AlertTriangle",
            targetRoles: ["guard", "admin", "school_admin", "super_admin"]
          });
        }
      }
    } catch (notifErr) {
      console.error("Failed to dispatch notification", notifErr);
    }
    // ------------------------------

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to log access' };
  }
}
// ==========================================
// 🚨 NOTIFY UNKNOWN FACE
// ==========================================

export async function notifyUnknownFace(): Promise<{ success: boolean; error?: string }> {
  try {
    const { createNotification } = await import('../utils/notificationHelpers');
    await createNotification({
      category: "Attendance & gates",
      severity: "warning",
      title: "Unknown face detected",
      message: `The scanner failed to match a detected face at an access gate.`,
      icon: "ScanFace",
      targetRoles: ["guard", "admin"]
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to notify unknown face' };
  }
}
