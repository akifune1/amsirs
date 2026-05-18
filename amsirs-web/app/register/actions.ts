'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function registerStudent(
  prevState: any,
  formData: FormData
) {
  try {
    const cookieStore = await cookies();

    const serverSupabase =
      createServerClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,

        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,

        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },

            setAll(cookiesToSet) {
              cookiesToSet.forEach(
                ({
                  name,
                  value,
                  options,
                }) =>
                  cookieStore.set(
                    name,
                    value,
                    options
                  )
              );
            },
          },
        }
      );

    // ==========================================
    // FORM DATA
    // ==========================================

    const email =
      formData.get(
        'email'
      ) as string;

    const password =
      formData.get(
        'password'
      ) as string;

    const studentId =
      formData.get(
        'studentId'
      ) as string;

    const firstName =
      formData.get(
        'firstName'
      ) as string;

    const lastName =
      formData.get(
        'lastName'
      ) as string;

    // ==========================================
    // 1. CREATE AUTH ACCOUNT
    // ==========================================

    const {
      data: authData,
      error: authError,
    } =
      await serverSupabase.auth.signUp(
        {
          email,
          password,
        }
      );

    if (authError) {
      return {
        error: `Authentication Error: ${authError.message}`,
      };
    }

    const newUserId =
      authData.user?.id;

    if (!newUserId) {
      return {
        error:
          'Failed to generate secure account ID.',
      };
    }

    // ==========================================
    // 2. PROCESS FACE PHOTO
    // ==========================================

    const photo =
      formData.get(
        'facePhoto'
      ) as File | null;

    let facePhotoPath = null;

    if (photo && photo.size > 0) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
      ];

      if (
        !allowedMimeTypes.includes(
          photo.type
        )
      ) {
        return {
          error:
            'Photo must be standard JPG or PNG format.',
        };
      }

      if (
        photo.size >
        5 * 1024 * 1024
      ) {
        return {
          error:
            'Photo is too large. Maximum size is 5MB.',
        };
      }

      const fileExt =
        photo.name
          .split('.')
          .pop();

      // SAVE USING ACCOUNT ID
      const fileName =
        `${newUserId}/face_ref.${fileExt}`;

      const {
        data: uploadData,
        error: uploadError,
      } =
        await serverSupabase.storage
          .from(
            'student_faces'
          )
          .upload(
            fileName,
            photo,
            {
              upsert: true,
            }
          );

      if (uploadError) {
        console.error(
          uploadError
        );

        return {
          error:
            'Failed to upload biometric data.',
        };
      }

      facePhotoPath =
        uploadData.path;
    } else {
      return {
        error:
          'A clear facial reference photo is required.',
      };
    }

    // ==========================================
    // 3. SAVE STUDENT PROFILE
    // ==========================================

    const {
      data: studentData,
      error: dbError,
    } =
      await serverSupabase
        .from('students')
        .insert([
          {
            account_id:
              newUserId,

            student_id:
              studentId,

            first_name:
              firstName,

            last_name:
              lastName,

            grade_level:
              formData.get(
                'gradeLevel'
              ),

            section:
              formData.get(
                'section'
              ),

            face_photo_path:
              facePhotoPath,
          },
        ])
        .select()
        .single();

    if (dbError) {
      console.error(dbError);

      if (
        dbError.code ===
        '23505'
      ) {
        return {
          error: `Student ID ${studentId} is already registered.`,
        };
      }

      return {
        error:
          'Profile creation failed. Please contact IT support.',
      };
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    return {
      success: true,

      message:
        'Registration successful! Please check your email to confirm your account before logging in.',

      student: studentData,
    };
  } catch (err) {
    console.error(err);

    return {
      error:
        'A critical system error occurred. Please try again later.',
    };
  }
}