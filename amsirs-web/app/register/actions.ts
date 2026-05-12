'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function registerStudent(prevState: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const serverSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
        },
      }
    );

    // REMOVED: The auth.getUser() check. This is now a public endpoint.

    const studentId = formData.get('studentId') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    
    // 1. Handle Facial Recognition Photo Upload
    const photo = formData.get('facePhoto') as File | null;
    let facePhotoPath = null;

    if (photo && photo.size > 0) {
      const allowedMimeTypes = ['image/jpeg', 'image/png'];
      if (!allowedMimeTypes.includes(photo.type)) {
        return { error: "Photo must be standard JPG or PNG format." };
      }
      if (photo.size > 5 * 1024 * 1024) {
        return { error: "Photo is too large. Maximum size is 5MB." };
      }

      const fileExt = photo.name.split('.').pop();
      // Grouping uploads by Student ID for easy tracking
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `self_enrollment/${studentId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await serverSupabase.storage
        .from('student_faces')
        .upload(filePath, photo, { upsert: true });

      if (uploadError) throw uploadError;
      facePhotoPath = uploadData.path;
    } else {
       return { error: "A clear facial reference photo is required." };
    }

    // 2. Insert the Student Record
    const { error: dbError } = await serverSupabase
      .from('students')
      .insert([
        {
          student_id: studentId,
          first_name: firstName,
          last_name: lastName,
          grade_level: formData.get('gradeLevel'),
          section: formData.get('section'),
          face_photo_path: facePhotoPath
        },
      ]);

    // Handle duplicate LRNs gracefully
    if (dbError) {
      if (dbError.code === '23505') {
        return { error: `Student ID ${studentId} is already registered.` };
      }
      throw dbError;
    }

    revalidatePath('/student-registration');
    return { success: true, message: "Registration complete! Your data has been submitted." };

  } catch (err) {
    console.error(err);
    return { error: "A system error occurred. Please try again later." };
  }
}