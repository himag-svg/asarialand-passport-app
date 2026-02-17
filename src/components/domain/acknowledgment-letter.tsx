"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SignaturePad } from "./signature-pad";
import type { Application } from "@/types";
import { FileCheck, Printer, CheckCircle, Shield } from "lucide-react";

interface Props {
  application: Application;
}

export function AcknowledgmentLetter({ application }: Props) {
  const [signature, setSignature] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isAcknowledged = application.client_acknowledged;

  const handleAcknowledge = () => {
    if (!signature) {
      toast.error("Please sign the acknowledgment letter");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const signatureBlob = await fetch(signature).then((r) => r.blob());
      const signaturePath = `${application.id}/acknowledgment-signature.png`;

      const { error: uploadError } = await supabase.storage
        .from("passport-forms")
        .upload(signaturePath, signatureBlob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        toast.error(`Signature upload failed: ${uploadError.message}`);
        return;
      }

      const { error } = await supabase
        .from("applications")
        .update({
          client_acknowledged: true,
          acknowledgment_signed_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Acknowledgment signed successfully");
        router.refresh();
      }
    });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div className="section-label !mb-0">Acknowledgment Letter</div>
        {isAcknowledged && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            Signed
          </span>
        )}
      </div>

      {/* Letter content */}
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="space-y-4 text-sm text-slate-300">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-gold/5">
              <Shield className="h-6 w-6 text-gold" />
            </div>
            <p className="font-display font-bold text-white">
              REPUBLIC OF ASARIALAND
            </p>
            <p className="text-[11px] text-slate-500">
              Passport Renewal — Acknowledgment of Receipt
            </p>
          </div>

          <div className="h-px bg-white/[0.06]" />

          <p>
            Date:{" "}
            <span className="text-white">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>

          <p>
            Reference:{" "}
            <span className="font-mono text-accent">
              {application.reference_number}
            </span>
          </p>

          <p>
            Dear{" "}
            <span className="text-white">
              {application.client?.full_name ?? "Applicant"}
            </span>
            ,
          </p>

          <p>
            I hereby acknowledge receipt of my renewed passport
            {application.new_passport_number && (
              <>
                {" "}
                bearing number{" "}
                <span className="font-mono font-semibold text-white">
                  {application.new_passport_number}
                </span>
              </>
            )}
            , issued by the Passport and Immigration Office of the Republic of
            Asarialand.
          </p>

          <p>
            I confirm that all personal details contained in the passport are
            correct and accurate.
          </p>

          {application.passport_issued_date && (
            <p>
              Passport issued on:{" "}
              <span className="text-white">
                {new Date(
                  application.passport_issued_date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          )}

          <div className="h-px bg-white/[0.06]" />

          {isAcknowledged ? (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-600">Digitally signed on:</p>
              <p className="text-xs text-emerald-400">
                {application.acknowledgment_signed_at
                  ? new Date(
                      application.acknowledgment_signed_at
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle className="h-3 w-3" />
                Document signed and acknowledged
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <SignaturePad
                label="Applicant Signature"
                onSave={(dataUrl) => setSignature(dataUrl)}
                existingSignature={signature ?? undefined}
              />

              <button
                type="button"
                onClick={handleAcknowledge}
                disabled={isPending || !signature}
                className="btn-primary w-full py-2.5 text-sm"
              >
                <FileCheck className="mr-2 inline h-4 w-4" />
                {isPending ? "Signing..." : "Sign & Acknowledge Receipt"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Print button */}
      {isAcknowledged && (
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-3 flex items-center gap-2 text-xs text-slate-600 hover:text-white transition"
        >
          <Printer className="h-3 w-3" />
          Print Letter
        </button>
      )}
    </div>
  );
}
