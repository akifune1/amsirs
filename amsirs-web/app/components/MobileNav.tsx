'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid, Users, Shield, AlertTriangle, LogOut,
  DoorOpen, DoorClosed, FileText, User, Radio, Activity,
} from "lucide-react";
import { logout } from "../auth/actions";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import NotificationBell from "./NotificationBell";

interface UserInfo {
  email: string;
  role: string;
  roleKey: string;
  initials: string;
}

interface MobileNavProps {
  userInfo: UserInfo | null;
}

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

export default function MobileNav({ userInfo }: MobileNavProps) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/pending-approval") return null;

  const roleKey = userInfo?.roleKey || "unknown";
  const navLinks = allNavLinks.filter((link) => link.roles.includes(roleKey));

  return (
    <>
      {/* Top Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40" style={{ boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cavite-maroon rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ boxShadow: '0 5px 15px -3px rgba(122, 25, 27, 0.3)' }}>
            A
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-800">
            AMSIRS
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationBell roleKey={userInfo?.roleKey} />
          <div className="w-8 h-8 rounded-full bg-cavite-maroon flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-sm ml-1">
            {userInfo?.initials || "??"}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-red-400 hover:text-red-600 transition-colors p-1"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -4px 20px -10px rgba(0,0,0,0.05)' }}>
        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory">
          <div className="flex items-center justify-around w-full px-2 py-2 min-w-max mx-auto max-w-md">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all snap-center mx-1",
                    isActive ? "text-cavite-maroon" : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute inset-0 bg-cavite-light rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-1">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
