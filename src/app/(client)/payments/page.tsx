import { createClient } from "@/lib/supabase/server";
import { getClientApplications } from "@/lib/queries/requests";
import { PaymentProofUpload } from "@/components/domain/payment-proof-upload";
import Link from "next/link";
import type { Invoice, Payment } from "@/types";
import {
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  PlusCircle,
  Receipt,
} from "lucide-react";

export default async function ClientPaymentsPage() {
  const applications = await getClientApplications();
  const latest = applications[0];

  if (!latest) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center animate-fade-in">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <Wallet className="h-7 w-7 text-slate-500" />
          </div>
          <h1 className="font-display text-lg font-bold text-white">
            No Active Application
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            No active application found.
          </p>
          <Link
            href="/new-request"
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Start a new request
          </Link>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("application_id", latest.id)
    .eq("invoice_type", "client")
    .order("created_at", { ascending: false });

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("application_id", latest.id)
    .order("created_at", { ascending: false });

  const typedInvoices = (invoices as Invoice[]) ?? [];
  const typedPayments = (payments as Payment[]) ?? [];

  const paymentsByInvoice = new Map<string, Payment[]>();
  typedPayments.forEach((p) => {
    const existing = paymentsByInvoice.get(p.invoice_id) ?? [];
    existing.push(p);
    paymentsByInvoice.set(p.invoice_id, existing);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-xl font-bold text-white">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">
          View invoices and submit payment for your renewal.
        </p>
      </div>

      {typedInvoices.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">
            <Receipt className="h-7 w-7 text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">
            No invoices have been issued yet.
          </p>
          <p className="mt-1 text-xs text-slate-600">
            You will be notified when payment is required.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {typedInvoices.map((invoice) => {
            const invoicePayments = paymentsByInvoice.get(invoice.id) ?? [];
            const hasConfirmedPayment = invoicePayments.some(
              (p) => p.status === "confirmed"
            );
            const hasPendingPayment = invoicePayments.some(
              (p) => p.status === "submitted"
            );
            const needsPayment =
              invoice.status === "sent" &&
              !hasConfirmedPayment &&
              !hasPendingPayment;

            return (
              <div key={invoice.id} className="space-y-4">
                {/* Invoice Card */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-white">
                        {invoice.invoice_number}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {invoice.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-bold text-white">
                        {invoice.currency} {Number(invoice.amount).toFixed(2)}
                      </p>
                      <span
                        className={`flex items-center justify-end gap-1 text-xs font-medium ${
                          invoice.status === "paid"
                            ? "text-emerald-400"
                            : invoice.status === "sent"
                              ? "text-amber-400"
                              : "text-slate-500"
                        }`}
                      >
                        {invoice.status === "paid" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {invoice.due_date && (
                    <p className="mt-3 text-xs text-slate-600">
                      Due:{" "}
                      {new Date(invoice.due_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  {/* Line items */}
                  {invoice.line_items && invoice.line_items.length > 0 && (
                    <div className="mt-4 border-t border-white/[0.06] pt-4">
                      {invoice.line_items.map(
                        (
                          item: {
                            description: string;
                            quantity: number;
                            total: number;
                          },
                          idx: number
                        ) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-1.5 text-xs"
                          >
                            <span className="text-slate-400">
                              {item.description} &times;{item.quantity}
                            </span>
                            <span className="font-mono text-slate-300">
                              ${item.total.toFixed(2)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Payment status */}
                {invoicePayments.length > 0 && (
                  <div className="ml-4 space-y-2">
                    {invoicePayments.map((payment) => (
                      <div
                        key={payment.id}
                        className={`flex items-center justify-between rounded-2xl border px-5 py-3.5 text-sm ${
                          payment.status === "confirmed"
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : payment.status === "rejected"
                              ? "border-red-500/20 bg-red-500/5"
                              : "border-amber-500/20 bg-amber-500/5"
                        }`}
                      >
                        <div>
                          <span
                            className={`flex items-center gap-1.5 text-xs font-semibold ${
                              payment.status === "confirmed"
                                ? "text-emerald-400"
                                : payment.status === "rejected"
                                  ? "text-red-400"
                                  : "text-amber-400"
                            }`}
                          >
                            {payment.status === "confirmed" ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : payment.status === "rejected" ? (
                              <XCircle className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                            Payment{" "}
                            {payment.status.charAt(0).toUpperCase() +
                              payment.status.slice(1)}
                          </span>
                          {payment.notes && payment.status === "rejected" && (
                            <p className="mt-1 text-xs text-red-400">
                              {payment.notes}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-slate-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payment upload form */}
                {needsPayment && <PaymentProofUpload invoice={invoice} />}

                {/* Re-upload on rejection */}
                {invoicePayments.some((p) => p.status === "rejected") &&
                  !hasConfirmedPayment &&
                  !hasPendingPayment && (
                    <PaymentProofUpload invoice={invoice} />
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
