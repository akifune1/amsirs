'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { encrypt } from '@/lib/encryption';

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

// Ensure the caller is an it_admin or super_admin
async function verifyAdminAccess() {
  const supabase = await getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: admin } = await supabase
    .from('system_admins')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!admin || admin.role === 'school_admin') {
    throw new Error('Forbidden');
  }
  return { supabase, adminId: user.id };
}

async function insertAuditLog(
  adminId: string,
  actionType: string,
  targetEntity: string,
  targetId: string | null,
  details: any
) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  await supabaseAdmin.from('audit_logs').insert({
    admin_id: adminId,
    action_type: actionType,
    target_entity: targetEntity,
    target_id: targetId,
    details: details
  });
}

export async function updateStudent(formData: FormData) {
  const { supabase, adminId } = await verifyAdminAccess();
  const id = formData.get('id') as string;

  const { error } = await supabase
    .from('students')
    .update({
      student_id: formData.get('studentId'),
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      grade_level: formData.get('gradeLevel'),
      section: formData.get('section'),
      gender: formData.get('gender') || null,
      birthday: formData.get('birthday') ? encrypt(formData.get('birthday') as string) : null,
      address: formData.get('address') ? encrypt(formData.get('address') as string) : null,
      status: formData.get('status') as string,
      face_photo_path: formData.get('facePhotoPath') || null
    })
    .eq('id', id);

  if (error) throw error;
  
  await insertAuditLog(adminId, 'UPDATE_STUDENT', 'students', id, {
    student_id: formData.get('studentId'),
    status: formData.get('status')
  });

  revalidatePath('/admin-dashboard');
}

export async function updateStaff(formData: FormData) {
  const { supabase, adminId } = await verifyAdminAccess();
  const id = formData.get('id') as string;

  const { error } = await supabase
    .from('user_profiles') 
    .update({
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      role: formData.get('role'),
      is_active: formData.get('isActive') === 'true'
    })
    .eq('id', id);

  if (error) throw error;
  
  await insertAuditLog(adminId, 'UPDATE_STAFF', 'user_profiles', id, {
    role: formData.get('role'),
    is_active: formData.get('isActive') === 'true'
  });

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

    // VERIFY ADMIN ACCESS BEFORE PROCEEDING
    const { adminId: creatorAdminId } = await verifyAdminAccess();

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

    // 2. Create the User Profile or Admin Record
    console.log("⏳ Step 2: Creating User Record...");
    
    let dbError = null;
    
    if (role === 'it_admin' || role === 'school_admin' || role === 'super_admin') {
      const { error } = await supabaseAdmin
        .from('system_admins')
        .insert({
          id: authData.user.id,
          role: role
        });
      dbError = error;
    } else {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          role: role
        });
      dbError = error;
    }

    if (dbError) {
      console.error("❌ Supabase Database Insert Error:", dbError);
      // Let's also try to rollback the auth user so we don't end up with ghost accounts
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.log("🧹 Rolled back (deleted) the Auth user because profile creation failed.");
      return { error: `Profile Error: ${dbError.message}` };
    }

    console.log("✅ Profile Record Created Successfully!");
    
    await insertAuditLog(creatorAdminId, 'CREATE_STAFF', 'user_profiles', authData.user.id, {
      role: role,
      email: email
    });
    
    revalidatePath('/admin-dashboard');
    return { success: true, message: `Successfully created ${role} account for ${firstName} ${lastName}` };

  } catch (err) {
    console.error("💥 CATCH BLOCK TRIGGERED. Raw Error:", err);
    return { error: 'An unexpected error occurred during creation. Check server logs.' };
  }
}

// ==========================================
// 🔐 RESET USER PASSWORD
// ==========================================
export async function resetUserPassword(formData: FormData) {
  try {
    const { adminId } = await verifyAdminAccess();
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: "Server Configuration Error: Missing Service Role Key" };
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const userId = formData.get('userId') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!newPassword || newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      return { error: `Failed to reset password: ${error.message}` };
    }

    await insertAuditLog(adminId, 'RESET_PASSWORD', 'auth.users', userId, {});

    return { success: true, message: 'Password reset successfully!' };
  } catch (err) {
    return { error: 'Unauthorized or unexpected error occurred.' };
  }
}

// ==========================================
// 📦 BULK APPROVE STUDENTS
// ==========================================
export async function bulkApproveStudents(studentIds: string[]) {
  try {
    const { supabase, adminId } = await verifyAdminAccess();
    
    if (!studentIds || studentIds.length === 0) return { success: true };

    const { error } = await supabase
      .from('students')
      .update({ status: 'active' })
      .in('id', studentIds)
      .select('account_id, first_name'); // Need account_id to notify them

    if (error) throw error;
    
    // --- NOTIFICATIONS DISPATCH ---
    try {
      const { createNotification } = await import('../utils/notificationHelpers');
      // Fetch the updated students to get their account_ids
      const { data: updatedStudents } = await supabase
        .from('students')
        .select('account_id, first_name')
        .in('id', studentIds);

      if (updatedStudents) {
        for (const student of updatedStudents) {
          if (student.account_id) {
            await createNotification({
              category: "System",
              severity: "info",
              title: "Account Approved",
              message: `Welcome ${student.first_name}! Your student account has been approved.`,
              icon: "CheckCircle",
              userId: student.account_id
            });
          }
        }
      }
    } catch (notifErr) {
      console.error("Failed to dispatch approval notifications", notifErr);
    }
    // ------------------------------
    
    await insertAuditLog(adminId, 'BULK_APPROVE', 'students', null, { count: studentIds.length, ids: studentIds });

    revalidatePath('/admin-dashboard');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to bulk approve students.' };
  }
}