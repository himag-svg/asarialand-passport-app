"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DOCUMENT_TYPES } from "@/lib/constants/document-types";
import type { ApplicationDocument } from "@/types";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Upload,
} from "lucide-react";

interface Props {
  documents: ApplicationDocument[];
  applicationId: string;
}

const statusConfig = {
  uploaded: { icon: Clock, color: "text-sky-400", label: "Uploaded" },
  under_review: { icon: Eye, color: "text-amber-400", label: "Under Review" },
  approved: {
    icon: CheckCircle,
    color: "text-emerald-400",
    label: "Approved",
  },
  rejected: { icon: XCircle, color: "text-red-400", label: "Rejected" },
  needs_reupload: {
    icon: AlertCircle,
    color: "text-orange-400",
    label: "Re-upload Needed",
  },
};

export function DocumentReviewList({ documents }: Props) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const docTypeMap = new Map(DOCUMENT_TYPES.map((d) => [d.type, d]));

  const updateDocStatus = (
    docId: string,
    status: string,
    rejectionReason?: string
  ) => {
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const updateData: Record<string, unknown> = {
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      };

      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from("application_documents")
        .update(updateData)
        .eq("id", docId);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(`Document ${status === "approved" ? "approved" : "rejected"}`);
        setRejectingId(null);
        setRejectReason("");
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
        Documents
      </h2>

      {documents.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Upload className="h-4 w-4" />
          No documents uploaded yet.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {documents.map((doc) => {
            const typeInfo = docTypeMap.get(doc.document_type);
            const config = statusConfig[doc.status];
            const StatusIcon = config.icon;

            return (
              <li
                key={doc.id}
                className="rounded-lg border border-white/5 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white">
                      {typeInfo?.name ?? doc.document_type}
                    </span>
                    <p className="text-xs text-slate-500">
                      {doc.file_name}
                      {doc.file_size &&
                        ` (${(doc.file_size / 1024).toFixed(0)} KB)`}
                    </p>
                    <div className="mt-1 flex gap-2">
                      {doc.is_certified && (
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">
                          Certified
                        </span>
                      )}
                      {doc.is_translated && (
                        <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] text-sky-400">
                          Translated
                        </span>
                      )}
                      {doc.requires_return && (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">
                          Return Required
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs ${config.color}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>
                </div>

                {/* Review actions for uploaded docs */}
                {(doc.status === "uploaded" ||
                  doc.status === "under_review") && (
                  <div className="mt-3">
                    {rejectingId === doc.id ? (
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
                            onClick={() =>
                              updateDocStatus(
                                doc.id,
                                "rejected",
                                rejectReason
                              )
                            }
                            disabled={isPending || !rejectReason.trim()}
                            className="flex-1 rounded-lg bg-red-500/20 py-1.5 text-xs font-medium text-red-400 disabled:opacity-50"
                          >
                            Confirm Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            className="flex-1 rounded-lg border border-white/10 py-1.5 text-xs text-slate-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateDocStatus(doc.id, "approved")
                          }
                          disabled={isPending}
                          className="flex-1 rounded-lg bg-emerald-500/20 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/30 disabled:opacity-50"
                        >
                          <CheckCircle className="mr-1 inline h-3 w-3" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingId(doc.id)}
                          className="flex-1 rounded-lg bg-red-500/20 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/30"
                        >
                          <XCircle className="mr-1 inline h-3 w-3" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {doc.rejection_reason && doc.status === "rejected" && (
                  <p className="mt-2 text-xs text-red-400">
                    Reason: {doc.rejection_reason}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
