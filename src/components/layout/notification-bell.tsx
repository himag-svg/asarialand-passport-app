"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeNotifications } from "@/lib/hooks/use-realtime-notifications";
import { Bell } from "lucide-react";
import type { Notification } from "@/types";

interface Props {
  userId: string;
}

export function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  // Realtime subscription
  useRealtimeNotifications(userId);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_read", false)
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false })
        .limit(10);
      return (data as Notification[]) ?? [];
    },
  });

  const unreadCount = notifications.length;

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-white/10 bg-surface-900 shadow-lg">
            <div className="border-b border-white/10 px-4 py-3">
              <p className="text-sm font-medium text-white">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  No new notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      markAsRead(n.id);
                      setOpen(false);
                    }}
                    className="block w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5"
                  >
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{n.body}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
