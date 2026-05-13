import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, block all protected routes
  const isProtected = path.startsWith('/incident-dashboard') ||
    path.startsWith('/admin-dashboard') ||
    path.startsWith('/incident-reporting');

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user) {
    // TIER 1: SYSTEM ADMIN CHECK
    const { data: admin } = await supabase
      .from('system_admins')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (admin) {
      // Admins have god mode
      return response;
    }

    // TIER 2: STAFF CHECK (Guard/Guidance)
    const { data: staff } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (staff) {
      // Staff cannot enter the Admin Dashboard
      if (path.startsWith('/admin-dashboard')) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      return response;
    }

    // TIER 3: STUDENT CHECK
    const { data: student } = await supabase
      .from('students')
      .select('is_approved')
      .eq('account_id', user.id)
      .maybeSingle();

    if (student) {
      // Force unapproved students to waiting room
      if (!student.is_approved && path !== '/pending-approval') {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
      // Approved students cannot see Staff or Admin dashboards
      if (path.startsWith('/incident-dashboard') || path.startsWith('/admin-dashboard')) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      return response;
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|pending-approval|unauthorized).*)'],
}