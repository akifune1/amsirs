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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized: No active session');

  return { supabase, user };
}

// ==========================================
// 📋 FETCH ACCESS LOGS (paginated, with filters)
// ==========================================

export async function fetchAccessLogs(params: {
  page: number;
  itemsPerPage: number;
  actionFilter: string;
  dateFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  sectionFilter?: string;
  studentIdFilter?: string;
}): Promise<{
  success: boolean;
  data?: any[];
  count?: number;
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();

    // Use INNER JOIN when filtering on student fields to exclude non-matching parent rows
    const hasStudentFilter =
      (params.sectionFilter && params.sectionFilter !== 'All') ||
      (params.studentIdFilter && params.studentIdFilter.trim() !== '');

    const studentJoin = hasStudentFilter ? 'students!inner' : 'students';

    let query = supabase
      .from('access_logs')
      .select(`
        *,
        ${studentJoin} (
          first_name,
          last_name,
          student_id,
          section,
          grade_level,
          face_photo_path
        )
      `, { count: 'exact' });

    if (params.actionFilter !== 'All') {
      query = query.eq('action', params.actionFilter);
    }

    if (params.sectionFilter && params.sectionFilter !== 'All') {
      query = query.eq('students.section', params.sectionFilter);
    }

    if (params.studentIdFilter && params.studentIdFilter.trim() !== '') {
      query = query.eq('students.student_id', params.studentIdFilter.trim());
    }

    // Custom date range takes precedence over presets
    if (params.dateFrom || params.dateTo) {
      if (params.dateFrom) {
        query = query.gte('created_at', new Date(params.dateFrom).toISOString());
      }
      if (params.dateTo) {
        const end = new Date(params.dateTo);
        end.setHours(23, 59, 59, 999);
        query = query.lte('created_at', end.toISOString());
      }
    } else if (params.dateFilter && params.dateFilter !== 'All') {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));

      if (params.dateFilter === 'Today') {
        query = query.gte('created_at', startOfDay.toISOString());
      } else if (params.dateFilter === 'Yesterday') {
        const yesterday = new Date(startOfDay);
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.gte('created_at', yesterday.toISOString()).lt('created_at', startOfDay.toISOString());
      } else if (params.dateFilter === 'This Week') {
        const thisWeek = new Date(startOfDay);
        thisWeek.setDate(thisWeek.getDate() - 7);
        query = query.gte('created_at', thisWeek.toISOString());
      }
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(
        (params.page - 1) * params.itemsPerPage,
        params.page * params.itemsPerPage - 1
      );

    if (error) return { success: false, error: error.message };

    return { success: true, data: data || [], count: count || 0 };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch logs' };
  }
}

// ==========================================
// 📤 FETCH ALL FILTERED LOGS (for export, max 5000)
// ==========================================

export async function fetchAllFilteredLogs(params: {
  actionFilter: string;
  dateFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  sectionFilter?: string;
  studentIdFilter?: string;
}): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();

    const hasStudentFilter =
      (params.sectionFilter && params.sectionFilter !== 'All') ||
      (params.studentIdFilter && params.studentIdFilter.trim() !== '');

    const studentJoin = hasStudentFilter ? 'students!inner' : 'students';

    let query = supabase
      .from('access_logs')
      .select(`
        *,
        ${studentJoin} (
          first_name,
          last_name,
          student_id,
          section,
          grade_level,
          face_photo_path
        )
      `);

    if (params.actionFilter !== 'All') {
      query = query.eq('action', params.actionFilter);
    }

    if (params.sectionFilter && params.sectionFilter !== 'All') {
      query = query.eq('students.section', params.sectionFilter);
    }

    if (params.studentIdFilter && params.studentIdFilter.trim() !== '') {
      query = query.eq('students.student_id', params.studentIdFilter.trim());
    }

    if (params.dateFrom || params.dateTo) {
      if (params.dateFrom) {
        query = query.gte('created_at', new Date(params.dateFrom).toISOString());
      }
      if (params.dateTo) {
        const end = new Date(params.dateTo);
        end.setHours(23, 59, 59, 999);
        query = query.lte('created_at', end.toISOString());
      }
    } else if (params.dateFilter && params.dateFilter !== 'All') {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));

      if (params.dateFilter === 'Today') {
        query = query.gte('created_at', startOfDay.toISOString());
      } else if (params.dateFilter === 'Yesterday') {
        const yesterday = new Date(startOfDay);
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.gte('created_at', yesterday.toISOString()).lt('created_at', startOfDay.toISOString());
      } else if (params.dateFilter === 'This Week') {
        const thisWeek = new Date(startOfDay);
        thisWeek.setDate(thisWeek.getDate() - 7);
        query = query.gte('created_at', thisWeek.toISOString());
      }
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) return { success: false, error: error.message };

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch logs for export' };
  }
}


// ==========================================
// 🏫 FETCH DISTINCT SECTIONS (for filter dropdown)
// ==========================================

export async function fetchDistinctSections(): Promise<{
  success: boolean;
  sections?: string[];
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();

    const { data, error } = await supabase
      .from('students')
      .select('section')
      .not('section', 'is', null)
      .neq('section', '');

    if (error) return { success: false, error: error.message };

    // Deduplicate and sort alphabetically
    const unique = Array.from(new Set((data || []).map((r: any) => r.section as string)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return { success: true, sections: unique };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch sections' };
  }
}

// ==========================================
// 🔍 SEARCH STUDENTS BY NAME (autocomplete, max 8)
// ==========================================

export async function searchStudentsByName(query: string): Promise<{
  success: boolean;
  students?: { id: string; first_name: string; last_name: string; student_id: string; section?: string }[];
  error?: string;
}> {
  if (!query || query.trim().length < 2) {
    return { success: true, students: [] };
  }

  try {
    const { supabase } = await getAuthenticatedClient();
    const term = query.trim();

    const { data, error } = await supabase
      .from('students')
      .select('id, first_name, last_name, student_id, section')
      .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
      .order('last_name', { ascending: true })
      .limit(8);

    if (error) return { success: false, error: error.message };

    return { success: true, students: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Search failed' };
  }
}

// ==========================================
// 📸 GET SNAPSHOT URLS (BULK)
// ==========================================

export async function getSnapshotSignedUrls(paths: string[]): Promise<Record<string, string>> {
  if (!paths || paths.length === 0) return {};
  
  try {
    const { supabase } = await getAuthenticatedClient();

    const { data, error } = await supabase.storage
      .from('access-snapshots')
      .createSignedUrls(paths, 3600);

    if (error || !data) return {};
    
    const urlMap: Record<string, string> = {};
    for (const item of data) {
      if (item.path && item.signedUrl) {
        urlMap[item.path] = item.signedUrl;
      }
    }
    
    return urlMap;
  } catch {
    return {};
  }
}

// ==========================================
// 🏫 FETCH CAMPUS STATUS (all logs for presence calculation)
// ==========================================

export async function fetchCampusStatus(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();

    const { data: logs, error } = await supabase
      .from('access_logs')
      .select(`
        *,
        students (
          first_name,
          last_name,
          student_id,
          grade_level,
          section,
          face_photo_path
        )
      `)
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error) return { success: false, error: error.message };

    if (!logs) return { success: true, data: [] };

    // Determine who is currently inside campus
    // (latest action per student = ENTRY means they're inside)
    const latestLogs = new Map();
    for (const log of logs) {
      if (!latestLogs.has(log.student_id)) {
        latestLogs.set(log.student_id, log);
      }
    }

    const insideCampus = Array.from(latestLogs.values()).filter(
      (log: any) => log.action === 'ENTRY'
    );

    const snapshotPaths = insideCampus.map((log: any) => log.image_path).filter(Boolean);
    const facePaths = insideCampus.map((log: any) => log.students.face_photo_path).filter(Boolean);
    
    const { data: snapshotUrls } = await supabase.storage.from('access-snapshots').createSignedUrls(snapshotPaths, 3600);
    const { data: faceUrls } = await supabase.storage.from('student_faces').createSignedUrls(facePaths, 3600);
    
    const snapMap = Object.fromEntries((snapshotUrls || []).filter(u => u.signedUrl).map(u => [u.path, u.signedUrl]));
    const faceMap = Object.fromEntries((faceUrls || []).filter(u => u.signedUrl).map(u => [u.path, u.signedUrl]));
    
    const enrichedData = insideCampus.map((log: any) => ({
      ...log,
      snapshotUrl: snapMap[log.image_path] || null,
      faceUrl: faceMap[log.students.face_photo_path] || null
    }));

    return { success: true, data: enrichedData };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch campus status' };
  }
}
