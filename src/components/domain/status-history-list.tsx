"use client";

import type { StatusHistoryEntry, ApplicationStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/constants/workflow-steps";
import {
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  CreditCard,
  Send,
  Truck,
  BookOpen,
} from "lucide-react";

interface Props {
  history: StatusHistoryEntry[];
}

function getStatusIcon(status: ApplicationStatus) {
  switch (status) {
    case "client_request":
      return FileText;
    case "kyc_review":
      return AlertTriangle;
    case "invoice_sent":
    case "payment_pending":
    case "payment_confirmed":
    case "agent_payment_pending":
      return CreditCard;
    case "document_collection":
    case "final_review":
      return FileText;
    case "government_submitted":
      return Send;
    case "tracking":
      return Truck;
    case "passport_issued":
      return BookOpen;
    case "completed":
      return CheckCircle;
    default:
      return Clock;
  }
}

export function StatusHistoryList({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Status History
        </h2>
        <p className="mt-4 text-sm text-slate-500">
          No status changes recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
        Status History
      </h2>

      <div className="mt-4 space-y-0">
        {history.map((entry, index) => {
          const Icon = getStatusIcon(entry.to_status);
          const isLatest = index === 0;

          return (
            <div key={entry.id} className="relative flex gap-4 pb-6">
              {/* Vertical line */}
              {index < history.length - 1 && (
                <div className="absolute left-[15px] top-8 h-full w-px bg-white/10" />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  isLatest
                    ? "bg-accent/20 text-accent"
                    : "bg-white/5 text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  {entry.from_status && (
                    <>
                      <span className="text-xs text-slate-500">
                        {STATUS_LABELS[entry.from_status]}
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-600" />
                    </>
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isLatest ? "text-accent" : "text-slate-300"
                    }`}
                  >
                    {STATUS_LABELS[entry.to_status]}
                  </span>
                </div>

                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-600">
                  <span>
                    {new Date(entry.created_at).toLocaleDateString()}{" "}
                    {new Date(entry.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {entry.reason && (
                    <>
                      <span>&middot;</span>
                      <span className="text-slate-500">{entry.reason}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
