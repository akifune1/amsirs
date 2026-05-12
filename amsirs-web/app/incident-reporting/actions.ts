'use server';

import { encrypt } from '@/lib/encryption';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function submitSecureIncident(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    
    // This client is "Cookie-Aware"
    const serverSupabase = createServerClient(
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

    // Grab the user
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();

    // DEBUG: Check this in your VS Code terminal
    console.log("SERVER AUTH CHECK - User ID:", user?.id);

    if (!user) {
      return { error: "Security Session Expired. Please log in again." };
    }

    // IMPORTANT: Perform the insert using 'serverSupabase', NOT the global 'supabase'
    const { error: dbError } = await serverSupabase
      .from('incident_reports')
      .insert([
        {
          first_name: formData.get('firstName'),
          last_name: formData.get('lastName'),
          location: formData.get('location'),
          severity: formData.get('severity'),
          description: encrypt(formData.get('description') as string),
          reported_by: user.id, // This must match auth.uid() in the policy
          status: 'Pending'
        },
      ]);

    if (dbError) {
      console.error("DATABASE ERROR:", dbError);
      return { error: dbError.message };
    }

    revalidatePath('/incident-reporting');
    return { success: true, message: "Report Encrypted and Filed." };

  } catch (err) {
    return { error: "A transmission error occurred." };
  }
}