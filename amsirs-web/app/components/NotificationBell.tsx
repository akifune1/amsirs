"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Bell, Check, CheckCheck, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationBell({ roleKey }: { roleKey?: string }) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, ICON_MAP } = useNotifications();

  const getSeverityColors = (severity: string, isRead: boolean) => {
    if (isRead) return "bg-gray-50 text-gray-400";
    switch (severity) {
      case "critical": return "bg-red-50 text-red-600";
      case "warning": return "bg-amber-50 text-amber-600";
      case "info": return "bg-blue-50 text-blue-600";
      default: return "bg-zinc-50 text-zinc-600";
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="relative flex items-center justify-center p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-all outline-none">
          <Bell className="w-6 h-6" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
              >
                {unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </Popover.Trigger>

      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              asChild
              align="end"
              sideOffset={8}
              className="z-[100] outline-none"
            >
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="w-screen max-w-[360px] lg:max-w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Header */}
                <div className="p-4 bg-zinc-900 text-white flex flex-col gap-3 rounded-t-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cavite-maroon/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                  
                  <div className="flex items-center justify-between z-10">
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors">
                        <span className="font-bold text-sm bg-white/20 px-2 py-0.5 rounded-full">{unreadCount}</span>
                        <span className="text-sm font-medium">all</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1 z-10">
                    <Link 
                      href="/notifications" 
                      onClick={() => setOpen(false)}
                      className="text-sm font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-1"
                    >
                      see all notifications
                    </Link>
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs flex items-center gap-1 text-white/60 hover:text-white transition-colors"
                    >
                      Clear all <CheckCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1 bg-zinc-50 p-2 hide-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 flex flex-col items-center gap-2">
                      <Bell className="w-8 h-8 opacity-20" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {notifications.map((notif) => {
                        const Icon = ICON_MAP[notif.icon] || Bell;
                        return (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              markAsRead(notif.id);
                              if (notif.link) {
                                setOpen(false); // Close popover if they might navigate manually via a link handler if added later
                              }
                            }}
                            className={cn(
                              "relative group p-3 rounded-2xl flex gap-3 cursor-pointer transition-all border",
                              notif.is_read 
                                ? "bg-white border-transparent opacity-70 hover:opacity-100" 
                                : "bg-white border-cavite-light shadow-sm"
                            )}
                          >
                            <div className={cn("w-12 h-12 shrink-0 rounded-xl flex items-center justify-center", getSeverityColors(notif.severity, notif.is_read))}>
                              <Icon className="w-6 h-6" strokeWidth={notif.is_read ? 1.5 : 2} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 mb-0.5">
                                  {notif.category}
                                </span>
                                <span className="text-[10px] font-medium text-zinc-400 shrink-0 whitespace-nowrap">
                                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className={cn("text-sm mb-1 truncate", notif.is_read ? "font-medium text-zinc-700" : "font-bold text-zinc-900")}>
                                {notif.title}
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-zinc-500 line-clamp-1 mr-2 leading-relaxed">
                                  {notif.message}
                                </p>
                                {notif.is_read && (
                                  <Check className="w-4 h-4 text-zinc-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </div>
                            
                            {!notif.is_read && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cavite-maroon rounded-r-full" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
