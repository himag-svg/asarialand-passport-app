import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types";

export async function getUnreadNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_read", false)
    .eq("is_dismissed", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data as Notification[]) ?? [];
}

export async function getAllNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data as Notification[]) ?? [];
}
