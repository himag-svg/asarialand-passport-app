"use client";

import { useState, useTransition } from "react";
import { updateKycStatus } from "@/lib/actions/documents";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Application, KycStatus } from "@/types";
import { ShieldCheck, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Props {
  application: Application;
}

const kycStatusConfig: Record<
  KycStatus,
  { icon: typeof ShieldCheck; label: string; color: string }
> = {
  pending: { icon: Clock, label: "Pending", color: "text-slate-400" },
  clear: { icon: CheckCircle, label: "Clear", color: "text-emerald-400" },
  flagged: { icon: AlertTriangle, label: "Flagged", color: "text-red-400" },
  review_required: {
    icon: ShieldCheck,
    label: "Review Required",
    color: "text-amber-400",
  },
};

export function KycPanel({ application }: Props) {
  const [kycStatus, setKycStatus] = useState<KycStatus>(
    application.kyc_status as KycStatus
  );
  const [kycNotes, setKycNotes] = useState(application.kyc_notes ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const config = kycStatusConfig[kycStatus];
  const StatusIcon = config.icon;

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateKycStatus({
        applicationId: application.id,
        kycStatus,
        kycNotes,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          kycStatus === "clear"
            ? "KYC approved — application advanced to Invoice Sent"
            : "KYC status updated"
        );
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
          KYC / World Check
        </h2>
        <span className={`flex items-center gap-1 text-xs ${config.color}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {config.label}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Manual KYC entry. A World Check API integration can be connected here in
        the future.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">
            KYC Result
          </label>
          <select
            value={kycStatus}
            onChange={(e) => setKycStatus(e.target.value as KycStatus)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="clear">Clear</option>
            <option value="flagged">Flagged</option>
            <option value="review_required">Review Required</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">
            Notes
          </label>
          <textarea
            value={kycNotes}
            onChange={(e) => setKycNotes(e.target.value)}
            placeholder="Add KYC review notes..."
            rows={3}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save KYC Result"}
        </button>

        {application.kyc_completed_at && (
          <p className="text-xs text-slate-500">
            Last updated:{" "}
            {new Date(application.kyc_completed_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
