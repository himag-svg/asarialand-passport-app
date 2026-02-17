"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import { STATUS_LABELS } from "@/lib/constants/workflow-steps";
import type { ApplicationStatus } from "@/types";

/**
 * Subscribe to real-time status changes for a specific application.
 * When the status changes, it auto-refreshes the page and shows a toast.
 */
export function useRealtimeStatus(applicationId: string) {
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel(`status-${applicationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "status_history",
          filter: `application_id=eq.${applicationId}`,
        },
        (payload) => {
          const newStatus = payload.new.to_status as ApplicationStatus;
          const label = STATUS_LABELS[newStatus] ?? newStatus;

          toast.info(`Status updated to: ${label}`, {
            description: "Your application status has been updated.",
          });

          // Refresh page data
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, applicationId, router]);
}
