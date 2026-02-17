"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SubmitPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  applicationId: z.string().uuid(),
  amount: z.number().min(0),
  paymentMethod: z.enum(["credit_card", "bank_transfer", "other"]),
  transactionReference: z.string().optional(),
  proofFilePath: z.string().optional(),
});

export async function submitPaymentProof(
  input: z.infer<typeof SubmitPaymentSchema>
) {
  const result = SubmitPaymentSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const data = result.data;

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: data.invoiceId,
      application_id: data.applicationId,
      amount: data.amount,
      currency: "USD",
      payment_method: data.paymentMethod,
      status: "submitted",
      proof_file_path: data.proofFilePath || null,
      transaction_reference: data.transactionReference || null,
      submitted_by: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Notify finance team — find all finance users
  const { data: financeUsers } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["finance", "admin"]);

  if (financeUsers) {
    const notifications = financeUsers.map((fu) => ({
      recipient_id: fu.id,
      application_id: data.applicationId,
      type: "payment_confirmed" as const,
      title: "Payment Proof Submitted",
      body: `A client has submitted proof of payment for invoice. Review and confirm.`,
      action_url: `/admin/requests/${data.applicationId}`,
      channel: "in_app" as const,
    }));

    await supabase.from("notifications").insert(notifications);
  }

  // Audit log
  await supabase.from("audit_log").insert({
    user_id: user.id,
    action: "payment.submit",
    resource_type: "payment",
    resource_id: payment.id,
    new_values: payment,
  });

  revalidatePath("/payments");
  revalidatePath(`/admin/requests/${data.applicationId}`);

  return { success: true, paymentId: payment.id };
}

export async function confirmPayment(paymentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Fetch payment with invoice
  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("*, invoice:invoices(*)")
    .eq("id", paymentId)
    .single();

  if (fetchError || !payment) return { error: "Payment not found" };

  // Update payment status
  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "confirmed",
      confirmed_by: user.id,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (paymentError) return { error: paymentError.message };

  // Update invoice status
  await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", payment.invoice_id);

  // Determine if this is a client or agent payment and update application status
  const invoice = payment.invoice as { invoice_type: string; application_id: string } | null;
  if (invoice) {
    if (invoice.invoice_type === "client") {
      await supabase
        .from("applications")
        .update({ status: "payment_confirmed" })
        .eq("id", payment.application_id);

      // Notify client
      await supabase.from("notifications").insert({
        recipient_id: payment.submitted_by,
        application_id: payment.application_id,
        type: "payment_confirmed",
        title: "Payment Confirmed",
        body: "Your payment has been confirmed. We are proceeding with your application.",
        action_url: "/payments",
        channel: "both",
      });
    } else if (invoice.invoice_type === "agent") {
      // Agent payment confirmed — move to document collection
      await supabase
        .from("applications")
        .update({ status: "document_collection" })
        .eq("id", payment.application_id);
    }
  }

  // Audit log
  await supabase.from("audit_log").insert({
    user_id: user.id,
    action: "payment.confirm",
    resource_type: "payment",
    resource_id: paymentId,
    new_values: { status: "confirmed" },
  });

  revalidatePath(`/admin/requests/${payment.application_id}`);
  revalidatePath("/admin/invoices");

  return { success: true };
}

export async function rejectPayment(paymentId: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (fetchError || !payment) return { error: "Payment not found" };

  const { error } = await supabase
    .from("payments")
    .update({
      status: "rejected",
      notes: reason,
    })
    .eq("id", paymentId);

  if (error) return { error: error.message };

  // Notify client
  await supabase.from("notifications").insert({
    recipient_id: payment.submitted_by,
    application_id: payment.application_id,
    type: "payment_request",
    title: "Payment Rejected",
    body: `Your payment proof was rejected. Reason: ${reason}. Please resubmit.`,
    action_url: "/payments",
    channel: "both",
  });

  revalidatePath(`/admin/requests/${payment.application_id}`);

  return { success: true };
}
