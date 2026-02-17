"use client";

import { useRealtimeStatus } from "@/lib/hooks/use-realtime-status";

interface Props {
  applicationId: string;
}

/**
 * Invisible client component that subscribes to realtime status changes.
 * Drop this into any Server Component page to get live status updates.
 */
export function RealtimeStatusListener({ applicationId }: Props) {
  useRealtimeStatus(applicationId);
  return null;
}
