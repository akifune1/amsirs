'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Add this line to debug:
  console.log("DEBUG: Login attempt for:", email);

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

const { data, error } = await supabase.auth.signInWithPassword({ email, password });

if (error) {
  console.log("SUPABASE ERROR:", error.message); // This will print the REAL reason in your VS Code terminal
  return { error: error.message }; 
}

  redirect('/incident-reporting');
}