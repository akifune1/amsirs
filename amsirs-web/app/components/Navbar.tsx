import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { logout } from '@/app/auth/actions';

export default async function Navbar() {
  const cookieStore = await cookies();

  // Next.js static generation throws if we try to access cookies dynamically at build time for layout,
  // but since we are doing this in a layout that uses cookies, the layout becomes dynamic.
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user is logged in, don't show the authenticated navbar.
  // This effectively hides it on /login and /register pages.
  if (!user) {
    return null;
  }

  const userId = user.id;
  const userEmail = user.email || 'Unknown User';

  let roleLabel = 'User';
  let links: { label: string; href: string }[] = [];

  // Determine Role (Traffic Controller Logic)
  
  // 1. Root Admin
  const { data: admin } = await supabase
    .from('system_admins')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (admin) {
    roleLabel = 'Root Admin';
    links = [
      { label: 'Admin Dashboard', href: '/admin-dashboard' },
    ];
  } else {
    // 2. Staff (Guard / Guidance)
    const { data: staff } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (staff) {
      if (staff.role === 'guidance') {
        roleLabel = 'Guidance Counselor';
        links = [
          { label: 'Student Support', href: '/student-support' },
          { label: 'Incident Dashboard', href: '/incident-dashboard' },
          { label: 'Campus Status', href: '/campus-status' },
        ];
      } else {
        roleLabel = 'Guard';
        links = [
          { label: 'Incident Dashboard', href: '/incident-dashboard' },
          { label: 'Access Gate', href: '/access-gate' },
          { label: 'Exit Gate', href: '/exit-gate' },
          { label: 'Access Logs', href: '/access-logs' },
          { label: 'Campus Status', href: '/campus-status' },
        ];
      }
    } else {
      // 3. Student
      const { data: student } = await supabase
        .from('students')
        .select('is_approved')
        .eq('account_id', userId)
        .maybeSingle();

      if (student) {
        if (student.is_approved) {
          roleLabel = 'Student';
          links = [
            { label: 'Student Portal', href: '/student-portal' },
            { label: 'Incident Reporting', href: '/incident-reporting' },
          ];
        } else {
          roleLabel = 'Pending Student';
          links = [
            { label: 'Pending Approval', href: '/pending-approval' },
          ];
        }
      }
    }
  }

  return (
    <nav className="sys-navbar">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="badge-primary">AMSIRS</div>
          <div className="hidden md:block">
            <p className="sys-label leading-none">Cavite National High School</p>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">Integrated System</p>
          </div>
        </div>

        {/* Dynamic Links */}
        <div className="hidden lg:flex items-center gap-4 ml-6 pl-6 border-l border-cavite-border">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-bold text-gray-500 hover:text-cavite-maroon uppercase tracking-wider transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className="sys-label text-gray-400">{roleLabel}</p>
          <p className="text-xs font-bold text-cavite-maroon mt-0.5">{userEmail}</p>
        </div>

        <form action={logout}>
          <button type="submit" className="btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}
