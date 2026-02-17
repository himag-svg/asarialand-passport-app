"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreateRequestSchema = z.object({
  serviceType: z.enum(["normal", "expedited"]),
  currentPassportNumber: z.string().min(1, "Passport number is required"),
  passportExpiryDate: z.string().min(1, "Expiry date is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

export async function createRequest(formData: FormData) {
  const raw = {
    serviceType: formData.get("serviceType") as string,
    currentPassportNumber: formData.get("currentPassportNumber") as string,
    passportExpiryDate: formData.get("passportExpiryDate") as string,
    addressLine1: formData.get("addressLine1") as string,
    addressLine2: (formData.get("addressLine2") as string) || undefined,
    city: formData.get("city") as string,
    country: formData.get("country") as string,
    postalCode: formData.get("postalCode") as string,
  };

  const result = CreateRequestSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  // Generate reference number
  const year = new Date().getFullYear();
  const seq = String(Date.now()).slice(-4);
  const referenceNumber = `DM-${year}-${seq}`;

  const { data, error } = await supabase
    .from("applications")
    .insert({
      reference_number: referenceNumber,
      client_id: user.id,
      service_type: result.data.serviceType,
      current_passport_number: result.data.currentPassportNumber,
      passport_expiry_date: result.data.passportExpiryDate,
      current_address: {
        line1: result.data.addressLine1,
        line2: result.data.addressLine2 || "",
        city: result.data.city,
        country: result.data.country,
        postal_code: result.data.postalCode,
      },
      status: "client_request",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Log to audit trail
  await supabase.from("audit_log").insert({
    user_id: user.id,
    action: "application.create",
    resource_type: "application",
    resource_id: data.id,
    new_values: data,
  });

  revalidatePath("/dashboard");
  redirect(`/request/${data.id}`);
}

/** Statuses that allow the client to cancel */
const CANCELLABLE_STATUSES = [
  "client_request",
  "kyc_review",
  "invoice_sent",
  "payment_pending",
  "document_collection",
];

export async function cancelApplication(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // Verify ownership and status
  const { data: app } = await supabase
    .from("applications")
    .select("id, client_id, status")
    .eq("id", applicationId)
    .single();

  if (!app) return { error: "Application not found" };
  if (app.client_id !== user.id) return { error: "Unauthorized" };
  if (!CANCELLABLE_STATUSES.includes(app.status)) {
    return { error: "This application can no longer be cancelled" };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "cancelled" })
    .eq("id", applicationId);

  if (error) return { error: error.message };

  // Audit log
  await supabase.from("audit_log").insert({
    user_id: user.id,
    action: "application.cancel",
    resource_type: "application",
    resource_id: applicationId,
    new_values: { status: "cancelled", cancelled_by: "client" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin/requests");
  revalidatePath("/admin/dashboard");

  return { success: true };
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  reason?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("applications")
    .update({ status: newStatus })
    .eq("id", applicationId);

  if (error) return { error: error.message };

  // Audit log
  await supabase.from("audit_log").insert({
    user_id: user.id,
    action: "application.status_change",
    resource_type: "application",
    resource_id: applicationId,
    new_values: { status: newStatus, reason },
  });

  revalidatePath(`/admin/requests/${applicationId}`);
  revalidatePath("/admin/requests");
  revalidatePath("/admin/dashboard");

  return { success: true };
}
