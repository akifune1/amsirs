import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { markAsRead as markAsReadServer, markAllAsRead as markAllAsReadServer } from "../notifications/actions";
import { 
  UserX, SearchX, AlertTriangle, FileWarning, 
  FileText, Activity, UserPlus, Fingerprint,
  Flag, ShieldAlert, CheckCircle, Calendar, 
  Clock, Stethoscope, HeartHandshake, UserCheck, 
  Key, Clock4, Bell, LogIn, LogOut
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  UserX, SearchX, AlertTriangle, FileWarning, 
  FileText, Activity, UserPlus, Fingerprint,
  Flag, ShieldAlert, CheckCircle, Calendar, 
  Clock, Stethoscope, HeartHandshake, UserCheck, 
  Key, Clock4, Bell, LogIn, LogOut
};

export interface RealNotification {
  id: string;
  created_at: string;
  user_id: string;
  category: string;
  severity: string;
  title: string;
  message: string;
  icon: string;
  link: string | null;
  is_read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<RealNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    async function fetchNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (mounted && data) {
        setNotifications(data);
        setLoading(false);
      } else if (mounted) {
        setLoading(false);
      }

      if (!mounted) return;

      // Subscribe to real-time changes
      channel = supabase
        .channel(`realtime_notifications_${Math.random()}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setNotifications(prev => [payload.new as RealNotification, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as RealNotification : n));
            } else if (payload.eventType === "DELETE") {
              setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    }

    fetchNotifications();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await markAsReadServer(id);
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await markAllAsReadServer();
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    ICON_MAP
  };
}
