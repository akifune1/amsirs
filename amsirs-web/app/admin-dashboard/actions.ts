'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateStudent(formData: FormData) {
  const cookieStore = await cookies();
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

  const id = formData.get('id') as string;

  const { error } = await supabase
    .from('students')
    .update({
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      grade_level: formData.get('gradeLevel'),
      section: formData.get('section'),
      is_approved: formData.get('isApproved') === 'true'
    })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin-dashboard');
}

export async function updateStaff(formData: FormData) {
  const cookieStore = await cookies();
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

  const id = formData.get('id') as string;

  const { error } = await supabase
    .from('students')
    .update({
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      grade_level: formData.get('gradeLevel'),
      section: formData.get('section'),
      // THIS IS THE CRITICAL LINE
      is_approved: formData.get('isApproved') === 'true'
    })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin-dashboard');
}