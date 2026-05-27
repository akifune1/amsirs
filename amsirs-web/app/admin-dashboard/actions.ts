'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// Helper to create the Supabase client
async function getClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

export async function updateStudent(formData: FormData) {
  const supabase = await getClient();
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
  const supabase = await getClient();
  const id = formData.get('id') as string;

  const { error } = await supabase
    .from('user_profiles') // FIXED: Was pointing to students table
    .update({
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      role: formData.get('role'),
    })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin-dashboard');
}

// ==========================================
// 🛠️ DEBUG VERSION: CREATE STAFF ACCOUNT
// ==========================================
export async function createStaffAccount(prevState: any, formData: FormData) {
  try {
    console.log("\n=== 🚀 START: CREATE STAFF ACCOUNT ===");
    
    // 0. Check Environment Variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ FATAL: SUPABASE_SERVICE_ROLE_KEY is missing from .env.local!");
      return { error: "Server Configuration Error: Missing Service Role Key" };
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const role = formData.get('role') as string;

    console.log(`📋 Payload Received: ${firstName} ${lastName} | ${email} | Role: ${role}`);

    // 1. Create the Auth user
    console.log("⏳ Step 1: Creating Auth User via Admin API...");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true 
    });

    if (authError) {
      console.error("❌ Supabase Auth Error:", authError);
      return { error: `Auth Error: ${authError.message}` };
    }
    if (!authData.user) {
      console.error("❌ Auth Error: No user object returned by Supabase.");
      return { error: 'Failed to create user ID' };
    }

    console.log(`✅ Auth User Created Successfully! ID: ${authData.user.id}`);

    // 2. Create the User Profile
    console.log("⏳ Step 2: Creating User Profile Record...");
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        role: role
      });

    if (profileError) {
      console.error("❌ Supabase Database Insert Error:", profileError);
      // Let's also try to rollback the auth user so we don't end up with ghost accounts
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.log("🧹 Rolled back (deleted) the Auth user because profile creation failed.");
      return { error: `Profile Error: ${profileError.message}` };
    }

    console.log("✅ Profile Record Created Successfully!");
    
    revalidatePath('/admin-dashboard');
    return { success: true, message: `Successfully created ${role} account for ${firstName} ${lastName}` };

  } catch (err) {
    console.error("💥 CATCH BLOCK TRIGGERED. Raw Error:", err);
    return { error: 'An unexpected error occurred during creation. Check server logs.' };
  }
}