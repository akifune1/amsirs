import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import ToasterProvider from "./components/ToasterProvider";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "AMSIRS | Cavite National High School",
  description: "Attendance Monitoring and Incident Reporting Security System",
};

async function getUserInfo() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const email = user.email || "user@amsirs.com";

    // 1. Check admin
    const { data: admin } = await supabase
      .from("system_admins")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (admin) {
      return { email, role: "Administrator", roleKey: "admin", initials: email.substring(0, 2).toUpperCase() };
    }

    // 2. Check staff
    const { data: staff } = await supabase
      .from("user_profiles")
      .select("first_name, last_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (staff) {
      const roleMap: Record<string, string> = { guidance: "Guidance Counselor", guard: "Security Guard" };
      const initials = (staff.first_name?.[0] || "") + (staff.last_name?.[0] || "");
      return { email, role: roleMap[staff.role] || staff.role, roleKey: staff.role, initials: initials.toUpperCase() || email.substring(0, 2).toUpperCase() };
    }

    // 3. Check student
    const { data: student } = await supabase
      .from("students")
      .select("first_name, last_name")
      .eq("account_id", user.id)
      .maybeSingle();

    if (student) {
      const initials = (student.first_name?.[0] || "") + (student.last_name?.[0] || "");
      return { email, role: "Student", roleKey: "student", initials: initials.toUpperCase() || email.substring(0, 2).toUpperCase() };
    }

    return { email, role: "User", roleKey: "unknown", initials: email.substring(0, 2).toUpperCase() };
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userInfo = await getUserInfo();
  
  return (
    <html lang="en" className="h-full">
      <body
        className={`font-sans bg-[#F3F5F8] text-[#2D3748] antialiased flex h-screen overflow-hidden`}
      >
        <ToasterProvider />
        <Sidebar userInfo={userInfo} />
        <div className="flex-1 h-full overflow-y-auto hide-scrollbar relative">
          {children}
        </div>
      </body>
    </html>
  );
}