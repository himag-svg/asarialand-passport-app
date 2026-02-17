"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const LineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1),
  unit_price: z.number().min(0),
  total: z.number().min(0),
});

const CreateInvoiceSchema = z.object({
  applicationId: z.string().uuid(),
  invoiceType: z.enum(["client", "agent"]),
  issuedTo: z.string().uuid(),
  description: z.string().min(1, "Description is required"),
  lineItems: z.array(LineItemSchema).min(1, "At least one line item is required"),
  dueDate: z.string().optional(),
});

export async function createInvoice(input: z.infer<typeof CreateInvoiceSchema>) {
  const result = CreateInvoiceSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const data = result.data;
  const totalAmount = data.lineItems.reduce((sum, item) => sum + item.total, 0);

  // Generate invoice number
  const year = new Date().getFullYear();
  const seq = String(Date.now()).slice(-4);
  const invoiceNumber = `INV-${year}-${seq}`;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      application_id: data.applicationId,
      invoice_number: invoiceNumber,
      invoice_type: data.invoiceType,
      issued_to: data.issuedTo,
      issued_by: user.id,
      amount: totalAmount,
      currency: "USD",
      description: data.description,
      line_items: data.lineItems,
      status: "draft",
      due_date: data.dueDate || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Audit log
  await supabase.from("audit_log").insert({
    user_id: user.id,
    action: "invoice.create",
    resource_type: "invoice",
    resource_id: invoice.id,
    new_values: invoice,
  });

  revalidatePath(`/admin/requests/${data.applicationId}`);
  revalidatePath("/admin/invoices");

  return { success: true, invoiceId: invoice.id };
}

export async function sendInvoice(invoiceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: invoice, error: fetchError } = await supabase
    .from("invoices")
    .select("*, application:applications(client_id, reference_number)")
    .eq("id", invoiceId)
    .single();

  if (fetchError || !invoice) return { error: "Invoice not found" };

  const { error } = await supabase
    .from("invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) return { error: error.message };

  // Send notification to the recipient
  const application = invoice.application as { client_id: string; reference_number: string } | null;
  if (application) {
    await supabase.from("notifications").insert({
      recipient_id: invoice.issued_to,
      application_id: invoice.application_id,
      type: "payment_request",
      title: "Invoice Ready",
      body: `An invoice (${invoice.invoice_number}) of USD ${Number(invoice.amount).toFixed(2)} has been issued for your application ${application.reference_number}.`,
      action_url: "/payments",
      channel: "both",
    });
  }

  // Update application status if it's a client invoice
  if (invoice.invoice_type === "client") {
    await supabase
      .from("applications")
      .update({ status: "payment_pending" })
      .eq("id", invoice.application_id);
  }

  revalidatePath(`/admin/requests/${invoice.application_id}`);
  revalidatePath("/admin/invoices");

  return { success: true };
}

export async function markInvoicePaid(invoiceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  if (error) return { error: error.message };

  revalidatePath("/admin/invoices");
  return { success: true };
}
