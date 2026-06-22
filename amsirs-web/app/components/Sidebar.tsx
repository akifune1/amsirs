"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid, Users, Shield, AlertTriangle, LogOut,
  DoorOpen, DoorClosed, FileText, User, Radio, Activity,
} from "lucide-react";
import { logout } from "../auth/actions";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

interface UserInfo {
  email: string;
  role: string;
  roleKey: string;
  initials: string;
}

interface SidebarProps {
  userInfo: UserInfo | null;
}

// Define all possible nav links
const allNavLinks = [
  { name: "Dashboard", href: "/admin-dashboard", icon: Grid, roles: ["it_admin", "super_admin"] },
  { name: "Active Sessions", href: "/active-sessions", icon: Activity, roles: ["super_admin"] },
  { name: "Access Gate", href: "/access-gate", icon: DoorOpen, roles: ["super_admin", "guard"] },
  { name: "Exit Gate", href: "/exit-gate", icon: DoorClosed, roles: ["super_admin", "guard"] },
  { name: "Access Logs", href: "/access-logs", icon: Shield, roles: ["it_admin", "school_admin", "super_admin", "guard"] },
  { name: "Incidents", href: "/incident-dashboard", icon: AlertTriangle, roles: ["school_admin", "super_admin", "guard"] },
  { name: "Student Support", href: "/student-support", icon: Users, roles: ["school_admin", "super_admin", "guidance"] },
  { name: "Campus Status", href: "/campus-status", icon: Radio, roles: ["it_admin", "school_admin", "super_admin", "guard", "guidance"] },
  { name: "My Profile", href: "/student-portal", icon: User, roles: ["student"] },
  { name: "Report Incident", href: "/incident-reporting", icon: FileText, roles: ["student"] }
];

export default function Sidebar({ userInfo }: SidebarProps) {
  const pathname = usePathname();

  // Do not render sidebar on login, register, or pending pages
  if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/pending-approval") return null;

  // Filter nav links based on user role
  const roleKey = userInfo?.roleKey || "unknown";
  const navLinks = allNavLinks.filter((link) => link.roles.includes(roleKey));

  return (
    <aside
      className="hidden lg:flex w-24 lg:w-64 flex-col justify-between rounded-r-[32px] my-4 ml-4 z-20 overflow-hidden flex-shrink-0 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--sys-nav-bg)',
        borderRight: '1px solid var(--sys-nav-border)',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
      }}
    >
      <div>
        {/* Logo Area */}
        <div
          className="h-24 flex items-center justify-between px-8"
          style={{ borderBottom: '1px solid var(--sys-nav-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-cavite-maroon rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ boxShadow: '0 10px 25px -5px rgba(122, 25, 27, 0.3)' }}
            >
              A
            </div>
            <span className="hidden lg:block font-bold text-xl tracking-tight" style={{ color: 'var(--sys-text-primary)' }}>
              AMSIRS
            </span>
          </div>
          <div className="hidden lg:block">
            <NotificationBell roleKey={userInfo?.roleKey} />
          </div>
        </div>

        {/* Nav Links */}
        <nav className="mt-8 px-4 flex flex-col gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-[var(--sys-maroon-tint)] text-cavite-maroon font-semibold"
                    : "font-medium hover:text-cavite-maroon hover:bg-[var(--sys-maroon-tint)]"
                }`}
                style={!isActive ? { color: 'var(--sys-text-muted)' } : undefined}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden lg:block">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Sign Out — calls server action to clear auth session */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-medium mb-4 w-full cursor-pointer mt-1"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </form>
        
        {/* Dynamic User Profile */}
        <div
          className="p-4 rounded-2xl flex items-center gap-3"
          style={{ backgroundColor: 'var(--sys-surface-muted)' }}
        >
          <div className="w-10 h-10 rounded-full bg-cavite-maroon flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm flex-shrink-0">
            {userInfo?.initials || "??"}
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-bold truncate" style={{ color: 'var(--sys-text-primary)' }}>{userInfo?.email || "Not signed in"}</p>
            <p className="text-xs font-medium truncate" style={{ color: 'var(--sys-text-muted)' }}>{userInfo?.role || "—"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
