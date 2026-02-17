"use client";

import { useState, useTransition } from "react";
import { confirmPayment, rejectPayment } from "@/lib/actions/payments";
import { toast } from "sonner";
import type { Payment, Invoice } from "@/types";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

interface Props {
  payments: Payment[];
  invoices: Invoice[];
  applicationId: string;
}

const paymentStatusConfig = {
  pending: { icon: Clock, label: "Pending", color: "text-slate-400" },
  submitted: { icon: DollarSign, label: "Submitted", color: "text-amber-400" },
  confirmed: { icon: CheckCircle, label: "Confirmed", color: "text-emerald-400" },
  rejected: { icon: XCircle, label: "Rejected", color: "text-red-400" },
};

export function PaymentManagement({ payments, invoices }: Props) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleConfirm = (paymentId: string) => {
    startTransition(async () => {
      const result = await confirmPayment(paymentId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Payment confirmed and receipt issued");
      }
    });
  };

  const handleReject = (paymentId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    startTransition(async () => {
      const result = await rejectPayment(paymentId, rejectReason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Payment rejected, client notified");
        setRejectingId(null);
        setRejectReason("");
      }
    });
  };

  const invoiceMap = new Map(invoices.map((inv) => [inv.id, inv]));

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
        Payments
      </h2>

      {payments.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No payments recorded yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {payments.map((payment) => {
            const invoice = invoiceMap.get(payment.invoice_id);
            const config = paymentStatusConfig[payment.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={payment.id}
                className="rounded-lg border border-white/5 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      USD {Number(payment.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {invoice?.invoice_number ?? "Unknown invoice"} &middot;{" "}
                      {payment.payment_method.replace(/_/g, " ")}
                    </p>
                    {payment.transaction_reference && (
                      <p className="text-xs text-slate-500">
                        Ref: {payment.transaction_reference}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs ${config.color}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>
                </div>

                {/* Actions for submitted payments */}
                {payment.status === "submitted" && (
                  <div className="mt-3 space-y-2">
                    {rejectingId === payment.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          rows={2}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-accent focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReject(payment.id)}
                            disabled={isPending}
                            className="flex-1 rounded-lg bg-red-500/20 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
                          >
                            Confirm Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            className="flex-1 rounded-lg border border-white/10 py-1.5 text-xs text-slate-400 hover:bg-white/5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirm(payment.id)}
                          disabled={isPending}
                          className="flex-1 rounded-lg bg-emerald-500/20 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/30 disabled:opacity-50"
                        >
                          <CheckCircle className="mr-1 inline h-3 w-3" />
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingId(payment.id)}
                          className="flex-1 rounded-lg bg-red-500/20 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/30"
                        >
                          <XCircle className="mr-1 inline h-3 w-3" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {payment.notes && payment.status === "rejected" && (
                  <p className="mt-2 text-xs text-red-400">
                    Reason: {payment.notes}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-600">
                  {new Date(payment.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
