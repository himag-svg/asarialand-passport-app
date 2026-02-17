"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";

export function useRealtimeNotifications(userId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`user:${userId}:notifications`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          // Optimistically add to notification cache
          queryClient.setQueryData(
            ["notifications", userId],
            (old: Notification[] = []) => [
              payload.new as Notification,
              ...old,
            ]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, supabase]);
}
