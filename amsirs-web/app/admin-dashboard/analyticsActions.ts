'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// Ensure the caller is an admin
async function verifyAdminAccess() {
  const supabase = await getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: admin } = await supabase
    .from('system_admins')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!admin) {
    throw new Error('Forbidden');
  }
  return { supabase, adminId: user.id };
}

export async function getAttendanceAnalytics() {
  try {
    const { supabase } = await verifyAdminAccess();

    // Fetch the last 7 days of access logs with student details
    const { data: logs, error } = await supabase
      .from('access_logs')
      .select(`
        created_at,
        action,
        student:students(id, first_name, last_name, grade_level, section)
      `)
      .order('created_at', { ascending: false })
      .limit(1000); // Rough limit for dashboard performance

    if (error) throw error;

    // Process data for charts
    // 1. Weekly trends (Entries vs Exits per day)
    const dailyTrends: Record<string, { entry: number, exit: number }> = {};
    
    // 2. Late arrivals (Entries after 8:00 AM)
    const lateArrivalsBySection: Record<string, number> = {};

    // 3. Most active students
    const studentActivity: Record<string, { name: string, count: number }> = {};

    logs?.forEach(log => {
      // Safely parse date and adjust to local timezone string (YYYY-MM-DD)
      const dateObj = new Date(log.created_at);
      const dateStr = dateObj.toISOString().split('T')[0];

      // Weekly Trends
      if (!dailyTrends[dateStr]) dailyTrends[dateStr] = { entry: 0, exit: 0 };
      if (log.action === 'ENTRY') dailyTrends[dateStr].entry += 1;
      if (log.action === 'EXIT') dailyTrends[dateStr].exit += 1;

      // Late Arrivals (Assuming 8:00 AM local time is late)
      const hour = dateObj.getHours();
      const studentInfo = log.student as any;
      if (log.action === 'ENTRY' && hour >= 8 && studentInfo?.section) {
        if (!lateArrivalsBySection[studentInfo.section]) {
          lateArrivalsBySection[studentInfo.section] = 0;
        }
        lateArrivalsBySection[studentInfo.section] += 1;
      }

      // Most Active Students
      if (studentInfo) {
        const studentName = `${studentInfo.first_name} ${studentInfo.last_name}`;
        if (!studentActivity[studentName]) studentActivity[studentName] = { name: studentName, count: 0 };
        studentActivity[studentName].count += 1;
      }
    });

    // Sort dates chronologically for the line chart
    const sortedDates = Object.keys(dailyTrends).sort();
    const trendData = {
      labels: sortedDates,
      entries: sortedDates.map(date => dailyTrends[date].entry),
      exits: sortedDates.map(date => dailyTrends[date].exit)
    };

    // Sort late arrivals by count (highest first)
    const sortedSections = Object.keys(lateArrivalsBySection).sort((a, b) => lateArrivalsBySection[b] - lateArrivalsBySection[a]);
    const lateData = {
      labels: sortedSections.slice(0, 10), // Top 10 sections
      counts: sortedSections.slice(0, 10).map(sec => lateArrivalsBySection[sec])
    };

    return {
      success: true,
      data: {
        trendData,
        lateData
      }
    };

  } catch (err) {
    console.error(err);
    return { error: 'Failed to fetch analytics data' };
  }
}
