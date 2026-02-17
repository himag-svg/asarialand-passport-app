"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { NotificationType, NotificationChannel } from "@/types";

export async function sendNotification({
  recipientId,
  applicationId,
  type,
  title,
  body,
  actionUrl,
  channel = "in_app",
}: {
  recipientId: string;
  applicationId?: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  channel?: NotificationChannel;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    recipient_id: recipientId,
    application_id: applicationId,
    type,
    title,
    body,
    action_url: actionUrl,
    channel,
  });

  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { success: true };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) return { error: error.message };

  revalidatePath("/notifications");
  return { success: true };
}
