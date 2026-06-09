import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NotificationCategory, NotificationSeverity } from "./mockNotifications";

export interface CreateNotificationPayload {
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  icon: string; // e.g. "AlertTriangle"
  link?: string;
  userId?: string; // If targeting a specific user
  targetRoles?: string[]; // If targeting multiple roles
}

export async function createNotification(payload: CreateNotificationPayload) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role to bypass RLS for inserting to other users
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  let targetUserIds: string[] = [];

  // 1. If a specific user is targeted
  if (payload.userId) {
    targetUserIds.push(payload.userId);
  }

  // 2. If roles are targeted, query those users
  if (payload.targetRoles && payload.targetRoles.length > 0) {
    // Check system_admins
    const { data: admins } = await supabase
      .from("system_admins")
      .select("id, role")
      .in("role", payload.targetRoles);
    
    if (admins) {
      targetUserIds.push(...admins.map(a => a.id));
    }

    // Check user_profiles (staff/guards/guidance)
    const { data: staff } = await supabase
      .from("user_profiles")
      .select("id, role")
      .in("role", payload.targetRoles);
    
    if (staff) {
      targetUserIds.push(...staff.map(s => s.id));
    }

    // Note: If 'student' is in targetRoles, it generally shouldn't broadcast to ALL students.
    // So 'student' role broadcast is ignored here to prevent spamming all students.
    // Targeted student notifications should use the `userId` payload explicitly.
  }

  // Remove duplicates
  targetUserIds = Array.from(new Set(targetUserIds));

  if (targetUserIds.length === 0) return { success: false, error: "No target users found" };

  // Prepare records for bulk insert
  const records = targetUserIds.map(uid => ({
    user_id: uid,
    category: payload.category,
    severity: payload.severity,
    title: payload.title,
    message: payload.message,
    icon: payload.icon,
    link: payload.link || null,
    is_read: false
  }));

  const { error } = await supabase.from("notifications").insert(records);

  if (error) {
    console.error("Failed to insert notifications:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
