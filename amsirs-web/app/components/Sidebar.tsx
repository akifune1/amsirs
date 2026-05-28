"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid, Users, Shield, AlertTriangle, LogOut,
  DoorOpen, DoorClosed, FileText, User, Radio,
} from "lucide-react";
import { logout } from "../auth/actions";

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
  // Admin-only
  { name: "Dashboard", href: "/admin-dashboard", icon: Grid, roles: ["admin"] },
  // Guard pages
  { name: "Access Gate", href: "/access-gate", icon: DoorOpen, roles: ["admin", "guard"] },
  { name: "Exit Gate", href: "/exit-gate", icon: DoorClosed, roles: ["admin", "guard"] },
  { name: "Access Logs", href: "/access-logs", icon: Shield, roles: ["admin", "guard"] },
  { name: "Incidents", href: "/incident-dashboard", icon: AlertTriangle, roles: ["admin", "guard"] },
  // Guidance pages
  { name: "Student Support", href: "/student-support", icon: Users, roles: ["admin", "guidance"] },
  // Student pages
  { name: "My Profile", href: "/student-portal", icon: User, roles: ["student"] },
  { name: "Report Incident", href: "/incident-reporting", icon: FileText, roles: ["student"] },
];

export default function Sidebar({ userInfo }: SidebarProps) {
  const pathname = usePathname();

  // Do not render sidebar on login, register, or pending pages
  if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/pending-approval") return null;

  // Filter nav links based on user role
  const roleKey = userInfo?.roleKey || "unknown";
  const navLinks = allNavLinks.filter((link) => link.roles.includes(roleKey));

  return (
    <aside className="w-24 lg:w-64 bg-white flex flex-col justify-between rounded-r-[32px] my-4 ml-4 z-20 overflow-hidden flex-shrink-0" style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
      <div>
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8 border-b border-gray-100">
          <div className="w-10 h-10 bg-cavite-maroon rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ boxShadow: '0 10px 25px -5px rgba(122, 25, 27, 0.3)' }}>
            A
          </div>
          <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight text-gray-800">
            AMSIRS
          </span>
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
                    ? "bg-cavite-light text-cavite-maroon font-semibold"
                    : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 font-medium"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden lg:block">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4">
        {/* Sign Out — calls server action to clear auth session */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all font-medium mb-4 w-full cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </form>
        
        {/* Dynamic User Profile */}
        <div className="bg-zinc-50 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cavite-maroon flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm flex-shrink-0">
            {userInfo?.initials || "??"}
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-bold text-zinc-800 truncate">{userInfo?.email || "Not signed in"}</p>
            <p className="text-xs text-zinc-400 font-medium truncate">{userInfo?.role || "—"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
