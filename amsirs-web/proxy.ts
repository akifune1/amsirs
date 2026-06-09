import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  console.log(`\n=== 🚦 MIDDLEWARE HIT: ${path} ===`);

  // --- RATE LIMITING ---
  if (path.startsWith('/api/') || path === '/login') {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const isAllowed = rateLimit(ip, 10, 10000); // 10 req / 10 sec

    if (!isAllowed) {
      console.log(`🛑 Rate Limit Exceeded for IP: ${ip}`);
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      } else {
        return NextResponse.redirect(new URL('/login?error=Too%20many%20attempts.%20Please%20wait.', request.url));
      }
    }
  }

  // Skip auth checks for /api/ routes to avoid breaking them
  if (path.startsWith('/api/')) {
    return response;
  }

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
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle();

    console.log("👑 Admin Check:", admin ? `YES (${admin.role})` : "NO");

    if (admin) {
      const { role } = admin;

      if (role === 'it_admin') {
        if (path.startsWith('/incident-dashboard') || path.startsWith('/incident-reporting') || path.startsWith('/student-support') || path.startsWith('/access-gate') || path.startsWith('/exit-gate')) {
          console.log(`🛑 Action: Redirecting to /unauthorized (IT Admin cannot access ${path})`);
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      if (role === 'school_admin') {
        if (path.startsWith('/admin-dashboard') || path.startsWith('/access-gate') || path.startsWith('/exit-gate')) {
          console.log(`🛑 Action: Redirecting to /unauthorized (School Admin cannot access ${path})`);
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      console.log(`✅ Action: Admin Pass (${role})`);
      return response;
    }

    // TIER 2: STAFF CHECK
    const { data: staff, error: staffError } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .maybeSingle();

    console.log("🛡️ Staff Check:", staff || "NO");
    if (staffError) console.log("⚠️ Staff Query Error:", staffError.message);

    if (staff) {
      if (staff.is_active === false) {
        console.log("🛑 Action: Redirecting to /unauthorized (Staff is suspended)");
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (path.startsWith('/admin-dashboard')) {
        console.log("🛑 Action: Redirecting to /unauthorized (Staff cannot access Admin)");
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (staff.role === 'guard' && path.startsWith('/student-support')) {
        console.log("🛑 Action: Redirecting to /unauthorized (Guard cannot access Support)");
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Guidance can access incident-dashboard but NOT incident-reporting
      if (staff.role === 'guidance' && path.startsWith('/incident-reporting')) {
        console.log("🛑 Action: Redirecting to /unauthorized (Guidance cannot access reporting form)");
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Guard can access incident-dashboard but NOT incident-reporting
      if (staff.role === 'guard' && path.startsWith('/incident-reporting')) {
        console.log("🛑 Action: Redirecting to /unauthorized (Guard cannot access reporting form)");
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

      // Students can access their portal and incident-reporting
      if (isProtected && !path.startsWith('/incident-reporting')) {
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
    '/((?!_next/static|_next/image|favicon.ico|pending-approval|unauthorized|models).*)',
  ],
}