import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function StudentSupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll() { return cookieStore.getAll() } }
    }
  );

  // 1. Check if a user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Check if they are a counselor
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  // 3. Check if they are an admin
  const { data: admin } = await supabase
    .from('system_admins')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  // 🛑 THE FIX: Strictly check for 'guidance' to match your database
  if (profile?.role !== 'guidance' && !admin) {
    // If a non-counselor (like a student) tries to access this URL, kick them to the portal
    redirect('/student-portal');
  }

  // If they pass, render the Student Support Page
  return <>{children}</>;
}