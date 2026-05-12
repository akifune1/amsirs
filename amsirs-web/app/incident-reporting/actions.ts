'use server';

import { encrypt } from '@/lib/encryption'; // Adjust if your path alias is different
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function submitSecureIncident(prevState: any, formData: FormData) {
  try {
    // 1. Collect form data
    const studentId = formData.get('studentId') as string;
    const location = formData.get('location') as string;
    const severity = formData.get('severity') as string;
    const description = formData.get('description') as string;

    if (!description) {
      return { error: "Description is required." };
    }

    // 2. Encrypt the sensitive description (AES-256-GCM)
    // This happens ON THE SERVER, so the raw text never hits the database
    const encryptedDescription = encrypt(description);

    // 3. Insert into Supabase
    const { error } = await supabase
      .from('incident_reports')
      .insert([
        {
          student_id: studentId,
          location: location,
          severity: severity,
          description: encryptedDescription, // Saving the ciphertext
          status: 'Pending'
        },
      ]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      return { error: "Database connection failed. Please try again." };
    }

    // 4. Success! Refresh the page data
    revalidatePath('/incident-reporting');
    return { success: true, message: "Incident report encrypted and filed successfully." };

  } catch (err) {
    console.error("Encryption Error:", err);
    return { error: "An error occurred during secure data processing." };
  }
}