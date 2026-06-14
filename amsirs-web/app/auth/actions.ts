'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
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
          )
        },
      },
    }
  );

  const sessionToken = cookieStore.get('amsirs_session_token')?.value;
  if (sessionToken) {
    await supabase.from('active_sessions').update({ is_active: false }).eq('session_id', sessionToken);
    cookieStore.delete('amsirs_session_token');
  }

  await supabase.auth.signOut();
  redirect('/login');
}