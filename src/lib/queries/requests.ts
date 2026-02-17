import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/types";

export async function getClientApplications(): Promise<Application[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Application[]) ?? [];
}

export async function getApplicationById(
  id: string
): Promise<Application | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      client:profiles!applications_client_id_fkey(*),
      documents:application_documents(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Application;
}

export async function getAllApplications(): Promise<Application[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      client:profiles!applications_client_id_fkey(id, full_name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Application[]) ?? [];
}

export async function getApplicationStats() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("status");

  if (error) throw error;

  const stats = {
    total: data?.length ?? 0,
    pending_kyc: 0,
    pending_payment: 0,
    in_progress: 0,
    completed: 0,
  };

  data?.forEach((app) => {
    if (app.status === "kyc_review") stats.pending_kyc++;
    if (app.status === "payment_pending") stats.pending_payment++;
    if (
      ["document_collection", "final_review", "government_submitted", "tracking"].includes(
        app.status
      )
    )
      stats.in_progress++;
    if (app.status === "completed") stats.completed++;
  });

  return stats;
}
