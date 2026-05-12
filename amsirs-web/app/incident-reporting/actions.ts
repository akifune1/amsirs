'use server';

import { encrypt } from '@/lib/encryption';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function submitSecureIncident(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const serverSupabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
        },
      }
    );

    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (!user || authError) return { error: "Security Session Expired." };

    // --- FILE SECURITY VALIDATION BLOCK ---
    const attachment = formData.get('attachment') as File | null;
    let imagePath = null;

    if (attachment && attachment.size > 0) {
      const allowedMimeTypes = ['image/jpeg', 'image/png'];
      if (!allowedMimeTypes.includes(attachment.type)) return { error: "SECURITY ALERT: Unauthorized file type." };
      if (attachment.size > 5 * 1024 * 1024) return { error: "SECURITY ALERT: Payload exceeds 5MB limit." };

      const fileExt = attachment.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await serverSupabase.storage
        .from('incident_attachments')
        .upload(filePath, attachment);

      if (uploadError) throw uploadError;
      imagePath = uploadData.path;
    }

    // ==========================================
    // 🛡️ NEW: DATA AGGREGATION BLOCK 🛡️
    // ==========================================
    // getAll() returns an array of strings. We join them with " & "
    const aggregatedFirstNames = formData.getAll('firstName').join(' & ');
    const aggregatedLastNames = formData.getAll('lastName').join(' & ');
    const aggregatedLocations = formData.getAll('location').join(' & ');

    const { error: dbError } = await serverSupabase
      .from('incident_reports')
      .insert([
        {
          first_name: aggregatedFirstNames,
          last_name: aggregatedLastNames,
          location: aggregatedLocations,
          severity: formData.get('severity'),
          description: encrypt(formData.get('description') as string),
          image_path: imagePath, 
          reported_by: user.id,
          status: 'Pending'
        },
      ]);

    if (dbError) throw dbError;

    revalidatePath('/incident-reporting');
    return { success: true, message: "Multi-subject report securely filed." };

  } catch (err) {
    console.error(err);
    return { error: "A transmission error occurred." };
  }
}