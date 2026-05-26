import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  console.log(`\n=== 🚦 MIDDLEWARE HIT: ${path} ===`);

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

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  console.log("👤 User ID:", user?.id || "NOT LOGGED IN");
  if (userError) console.log("⚠️ Auth Error:", userError.message);

  const isProtected = path.startsWith('/incident-dashboard') ||
    path.startsWith('/admin-dashboard') ||
    path.startsWith('/incident-reporting') ||
    path.startsWith('/student-support');

  if (isProtected && !user) {
    console.log("🛑 Action: Redirecting to /login (Unauthenticated)");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user) {
    // TIER 1: SYSTEM ADMIN CHECK
    const { data: admin } = await supabase
      .from('system_admins')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    console.log("👑 Admin Check:", admin ? "YES" : "NO");

    if (admin) {
      console.log("✅ Action: Admin Pass");
      return response;
    }

    // TIER 2: STAFF CHECK
    const { data: staff, error: staffError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    console.log("🛡️ Staff Check:", staff || "NO");
    if (staffError) console.log("⚠️ Staff Query Error:", staffError.message);

    if (staff) {
      if (path.startsWith('/admin-dashboard')) {
        console.log("🛑 Action: Redirecting to /unauthorized (Staff cannot access Admin)");
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (staff.role === 'guard' && path.startsWith('/student-support')) {
         console.log("🛑 Action: Redirecting to /unauthorized (Guard cannot access Support)");
         return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      if (staff.role === 'guidance' && (path.startsWith('/incident-dashboard') || path.startsWith('/incident-reporting'))) {
         console.log("🛑 Action: Redirecting to /unauthorized (Guidance cannot access Guard tools)");
         return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (staff.role === 'guidance' && path === '/') {
        console.log("↪️ Action: Rerouting Guidance to /student-support");
        return NextResponse.redirect(new URL('/student-support', request.url));
      }
      
      if (staff.role === 'guard' && path === '/') {
        console.log("↪️ Action: Rerouting Guard to /incident-dashboard");
        return NextResponse.redirect(new URL('/incident-dashboard', request.url));
      }

      console.log("✅ Action: Staff Pass");
      return response;
    }

    // TIER 3: STUDENT CHECK
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('is_approved')
      .eq('account_id', user.id)
      .maybeSingle();

    console.log("🎓 Student Check:", student || "NO");
    if (studentError) console.log("⚠️ Student Query Error:", studentError.message);

    if (student) {
      if (!student.is_approved && path !== '/pending-approval') {
        console.log("🛑 Action: Redirecting to /pending-approval (Not approved)");
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
      if (isProtected) {
        console.log(`🛑 Action: Redirecting to /unauthorized (Student tried accessing protected route: ${path})`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      console.log("✅ Action: Student Pass");
      return response;
    }
    
    console.log("❓ Action: Default Pass (User has no known role in DB)");
  }

  return response;
}

export const config = {
matcher: [
  '/((?!api|_next/static|_next/image|favicon.ico|pending-approval|unauthorized|models).*)',
],}