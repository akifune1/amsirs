import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function CampusStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Admin access bypass
  const { data: admin } = await supabase
    .from('system_admins')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (admin) {
    return <>{children}</>;
  }

  // Guard or Guidance access check
  const { data: staff } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .in('role', ['guard', 'guidance'])
    .maybeSingle();

  if (!staff) {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
