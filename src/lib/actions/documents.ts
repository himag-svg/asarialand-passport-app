"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Register a document upload in the application_documents table.
 * Uses the admin client to bypass RLS policies.
 */
export async function registerDocumentUpload(params: {
  applicationId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  requiresReturn: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  // Verify the user owns this application
  const { data: app } = await supabase
    .from("applications")
    .select("id, client_id")
    .eq("id", params.applicationId)
    .single();

  if (!app || app.client_id !== user.id) {
    return { error: "Unauthorized" };
  }

  // Use admin client to bypass RLS for insert
  const admin = createAdminClient();
  const { error } = await admin.from("application_documents").insert({
    application_id: params.applicationId,
    document_type: params.documentType,
    file_name: params.fileName,
    file_path: params.filePath,
    file_size: params.fileSize,
    mime_type: params.mimeType,
    status: "uploaded",
    is_certified: false,
    is_translated: false,
    requires_return: params.requiresReturn,
    uploaded_by: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/documents");
  revalidatePath(`/request/${params.applicationId}`);
  revalidatePath("/admin/requests");

  return { success: true };
}

/**
 * Update a document's review status (admin).
 * Uses the admin client to bypass RLS policies.
 */
export async function updateDocumentStatus(
  docId: string,
  status: string,
  rejectionReason?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const admin = createAdminClient();

  const updateData: Record<string, unknown> = {
    status,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };

  if (rejectionReason) {
    updateData.rejection_reason = rejectionReason;
  }

  const { error } = await admin
    .from("application_documents")
    .update(updateData)
    .eq("id", docId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/documents");
  revalidatePath("/admin/requests");

  return { success: true };
}

/**
 * Update KYC status and optionally advance the application workflow.
 * When KYC is cleared, the application status advances from kyc_review to invoice_sent.
 */
export async function updateKycStatus(params: {
  applicationId: string;
  kycStatus: string;
  kycNotes: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const admin = createAdminClient();

  // Update KYC fields
  const updateData: Record<string, unknown> = {
    kyc_status: params.kycStatus,
    kyc_notes: params.kycNotes,
    kyc_completed_at:
      params.kycStatus !== "pending" ? new Date().toISOString() : null,
    kyc_completed_by: params.kycStatus !== "pending" ? user.id : null,
  };

  // If KYC is cleared, also advance the application status
  if (params.kycStatus === "clear") {
    // Check current application status to ensure valid transition
    const { data: app } = await admin
      .from("applications")
      .select("status")
      .eq("id", params.applicationId)
      .single();

    if (app && (app.status === "kyc_review" || app.status === "client_request")) {
      updateData.status = "invoice_sent";
    }
  }

  const { error } = await admin
    .from("applications")
    .update(updateData)
    .eq("id", params.applicationId);

  if (error) {
    return { error: error.message };
  }

  // Audit log
  await admin.from("audit_log").insert({
    user_id: user.id,
    action: "application.kyc_update",
    resource_type: "application",
    resource_id: params.applicationId,
    new_values: {
      kyc_status: params.kycStatus,
      status_advanced: params.kycStatus === "clear",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/request/${params.applicationId}`);
  revalidatePath(`/admin/requests/${params.applicationId}`);
  revalidatePath("/admin/requests");
  revalidatePath("/admin/dashboard");

  return { success: true };
}
