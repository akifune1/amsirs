'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

// Update the signature here: add 'prevState' as the first argument
export async function login(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createServerClient(
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

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    // Return an object that matches the structure of your initialState
    return { error: "Invalid credentials. Please check your email and password." };
  }

  const userId = authData.user.id;

  // --- SESSION CONTROL LOGIC ---
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown Device';
  const ip = headersList.get('x-forwarded-for') || 'Unknown IP';
  
  // Basic OS/Browser parsing to make it readable for Super Admin
  let device_info = 'Unknown Device';
  if (userAgent.includes('Windows')) device_info = 'Windows PC';
  else if (userAgent.includes('Macintosh')) device_info = 'Mac';
  else if (userAgent.includes('iPhone')) device_info = 'iPhone';
  else if (userAgent.includes('Android')) device_info = 'Android Device';
  else if (userAgent.includes('iPad')) device_info = 'iPad';
  else if (userAgent.includes('Linux')) device_info = 'Linux PC';

  if (userAgent.includes('Edge') || userAgent.includes('Edg/')) device_info += ' (Edge)';
  else if (userAgent.includes('Chrome')) device_info += ' (Chrome)';
  else if (userAgent.includes('Firefox')) device_info += ' (Firefox)';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) device_info += ' (Safari)';

  // 1. Invalidate previous sessions
  await supabase
    .from('active_sessions')
    .update({ is_active: false })
    .eq('user_id', userId);

  // 2. Create new session
  const { data: sessionData, error: sessionError } = await supabase
    .from('active_sessions')
    .insert({
      user_id: userId,
      device_info,
      ip_address: ip,
    })
    .select('session_id')
    .single();

  if (sessionData && !sessionError) {
    // 3. Set custom session cookie
    cookieStore.set('amsirs_session_token', sessionData.session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
  }

  // --- Redirect Logic ---

  // 1. Admin
  const { data: admin } = await supabase
    .from('system_admins')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle();

  if (admin) {
    if (admin.role === 'school_admin') {
      redirect('/incident-dashboard');
    } else {
      redirect('/admin-dashboard');
    }
  }

  // 2. Staff (Guard/Guidance)
  const { data: staff } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (staff) {
    if (staff.role === 'guidance') {
      redirect('/student-support');
    } else {
      redirect('/incident-dashboard'); // Defaults to guards
    }
  }

  // 3. Student
  const { data: student } = await supabase
    .from('students')
    .select('is_approved')
    .eq('account_id', userId)
    .maybeSingle();

  if (student) {
    if (!student.is_approved) redirect('/pending-approval');
    // ✅ This is the only line that needed changing
    redirect('/student-portal');
  }

  redirect('/unauthorized');
}