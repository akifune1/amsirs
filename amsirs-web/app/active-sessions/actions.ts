'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function revokeSession(formData: FormData) {
  const sessionId = formData.get('sessionId') as string;
  const userId = formData.get('userId') as string;
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll() { return cookieStore.getAll() } }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: adminAuth } = await supabase
    .from('system_admins')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminAuth || adminAuth.role !== 'super_admin') {
    return { error: "Only Super Admins can revoke sessions" };
  }

  // Ensure target is not a student
  const { data: studentCheck } = await supabase
    .from('students')
    .select('id')
    .eq('account_id', userId)
    .maybeSingle();

  if (studentCheck) {
    return { error: "Cannot revoke student sessions from this interface" };
  }

  // Revoke session
  await supabase
    .from('active_sessions')
    .update({ is_active: false })
    .eq('session_id', sessionId);

  // Optional: Audit log
  await supabase.from('audit_logs').insert({
    admin_id: user.id,
    action_type: 'REVOKE_SESSION',
    target_entity: 'active_sessions',
    target_id: sessionId,
    details: { user_id: userId, revoked_at: new Date().toISOString() }
  });

  revalidatePath('/active-sessions');
}
