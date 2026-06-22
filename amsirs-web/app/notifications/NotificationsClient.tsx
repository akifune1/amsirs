"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, Bell } from "lucide-react";
import { cn } from "../utils/cn";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationsClient() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, ICON_MAP, loading } = useNotifications();

  const getSeverityColors = (severity: string, isRead: boolean) => {
    if (isRead) return "bg-black/5 dark:bg-white/5 text-zinc-500";
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-500";
      case "warning": return "bg-amber-500/10 text-amber-500";
      case "info": return "bg-blue-500/10 text-blue-500";
      default: return "bg-zinc-500/10 text-zinc-500";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4" style={{ color: 'var(--sys-text-muted)' }}>
          <Bell className="w-12 h-12 opacity-50" />
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--sys-text-primary)' }}>
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2.5 py-0.5 rounded-full shadow-sm">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="mt-1" style={{ color: 'var(--sys-text-muted)' }}>View and manage your system alerts</p>
        </div>
        
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm font-medium self-start md:self-auto"
          style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-primary)' }}
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="rounded-[32px] shadow-sm border overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
        {notifications.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4" style={{ color: 'var(--sys-text-muted)' }}>
            <Bell className="w-16 h-16 opacity-20" />
            <p className="text-lg font-medium">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderTopColor: 'var(--sys-border-subtle)' }}>
            {notifications.map((notif) => {
              const Icon = ICON_MAP[notif.icon] || Bell;
              return (
                <div 
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "group p-6 flex flex-col md:flex-row gap-4 md:items-center transition-all cursor-pointer relative",
                    notif.is_read 
                      ? "hover:bg-black/5 dark:hover:bg-white/5" 
                      : "bg-blue-500/5 hover:bg-blue-500/10"
                  )}
                >
                  {!notif.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cavite-maroon" />
                  )}
                  
                  <div className={cn("w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-sm", getSeverityColors(notif.severity, notif.is_read))}>
                    <Icon className="w-7 h-7" strokeWidth={notif.is_read ? 1.5 : 2} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-lg" style={{ backgroundColor: 'var(--sys-surface-muted)', color: 'var(--sys-text-muted)' }}>
                          {notif.category}
                        </span>
                        <span className="text-sm font-medium" style={{ color: 'var(--sys-text-muted)' }}>
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <h3 className={cn("text-lg mb-1", notif.is_read ? "font-medium" : "font-bold")} style={notif.is_read ? { color: 'var(--sys-text-primary)' } : { color: 'var(--sys-text-primary)' }}>
                      {notif.title}
                    </h3>
                    <p className="leading-relaxed max-w-4xl" style={{ color: 'var(--sys-text-secondary)' }}>
                      {notif.message}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-end md:w-12">
                    {notif.is_read ? (
                      <Check className="w-6 h-6 text-green-500 md:opacity-0 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
