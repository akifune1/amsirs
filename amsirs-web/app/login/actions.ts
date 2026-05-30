'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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