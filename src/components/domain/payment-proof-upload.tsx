"use client";

import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { useSupabase } from "@/components/providers/supabase-provider";
import { submitPaymentProof } from "@/lib/actions/payments";
import { toast } from "sonner";
import type { Invoice } from "@/types";
import { Upload, CreditCard } from "lucide-react";

interface Props {
  invoice: Invoice;
}

export function PaymentProofUpload({ invoice }: Props) {
  const supabase = useSupabase();
  const [paymentMethod, setPaymentMethod] = useState<
    "credit_card" | "bank_transfer" | "other"
  >("credit_card");
  const [transactionRef, setTransactionRef] = useState("");
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      try {
        const filePath = `${invoice.application_id}/payments/${invoice.invoice_number}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("invoices-receipts")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        setUploadedPath(filePath);
        setUploadedName(file.name);
        toast.success("Proof of payment uploaded");
      } catch (err) {
        toast.error(
          `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setUploading(false);
      }
    },
    [supabase, invoice]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await submitPaymentProof({
        invoiceId: invoice.id,
        applicationId: invoice.application_id,
        amount: Number(invoice.amount),
        paymentMethod,
        transactionReference: transactionRef || undefined,
        proofFilePath: uploadedPath || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Payment proof submitted for review");
        setTransactionRef("");
        setUploadedPath(null);
        setUploadedName(null);
      }
    });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold text-white">
          Pay Invoice {invoice.invoice_number}
        </h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Amount due: USD {Number(invoice.amount).toFixed(2)}
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as "credit_card" | "bank_transfer" | "other"
              )
            }
            className="input-focus mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white"
          >
            <option value="credit_card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Transaction Reference{" "}
            <span className="text-slate-600">(Optional)</span>
          </label>
          <input
            type="text"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="e.g., TXN-12345"
            className="input-focus mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Proof of Payment
          </label>
          {uploadedName ? (
            <div className="mt-1.5 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <span className="text-sm text-emerald-400">{uploadedName}</span>
              <button
                type="button"
                onClick={() => {
                  setUploadedPath(null);
                  setUploadedName(null);
                }}
                className="text-xs text-slate-500 hover:text-white"
              >
                Replace
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`mt-1.5 flex h-20 cursor-pointer items-center justify-center rounded-xl border border-dashed transition ${
                isDragActive
                  ? "border-accent bg-accent/10"
                  : "border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]"
              }`}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <span className="text-xs text-slate-400">Uploading...</span>
              ) : (
                <span className="flex items-center gap-2 text-xs text-slate-500">
                  <Upload className="h-4 w-4" />
                  Drop proof of payment or click to upload
                </span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="btn-primary w-full py-2.5 text-sm"
        >
          {isPending ? "Submitting..." : "Submit Payment"}
        </button>
      </div>
    </div>
  );
}
