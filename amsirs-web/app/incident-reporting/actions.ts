'use server';

import { encrypt } from '@/lib/encryption';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function submitSecureIncident(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    
    // 1. Initialize Supabase Server Client to check the session
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

    // 2. Get the authenticated user's ID
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication failed. Please log in again." };
    }

    // 3. Collect form data
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const location = formData.get('location') as string;
    const severity = formData.get('severity') as string;
    const description = formData.get('description') as string;

    // 4. Encrypt the sensitive description
    const encryptedDescription = encrypt(description);

    // 5. Insert into Supabase with 'reported_by' linked to the User ID
    const { error: dbError } = await supabase
      .from('incident_reports')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          location: location,
          severity: severity,
          description: encryptedDescription,
          reported_by: user.id, // <--- This links the report to the logged-in user
          status: 'Pending'
        },
      ]);

    if (dbError) throw dbError;

    revalidatePath('/incident-reporting');
    return { success: true, message: `Report successfully filed by Authorized User: ${user.email}` };

  } catch (err) {
    console.error("Critical System Error:", err);
    return { error: "A security error occurred during transmission." };
  }
}