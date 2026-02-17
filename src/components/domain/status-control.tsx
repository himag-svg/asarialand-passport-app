"use client";

import { useState, useTransition } from "react";
import { updateApplicationStatus } from "@/lib/actions/requests";
import { VALID_TRANSITIONS, STATUS_LABELS } from "@/lib/constants/workflow-steps";
import type { ApplicationStatus } from "@/types";
import { toast } from "sonner";

interface Props {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

export function StatusControl({ applicationId, currentStatus }: Props) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const validNext = VALID_TRANSITIONS[currentStatus] ?? [];

  const handleUpdate = () => {
    if (selectedStatus === currentStatus) return;

    startTransition(async () => {
      const result = await updateApplicationStatus(
        applicationId,
        selectedStatus
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status updated to ${STATUS_LABELS[selectedStatus]}`);
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
        Status Control
      </h2>
      {validNext.length > 0 ? (
        <>
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as ApplicationStatus)
            }
            className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          >
            <option value={currentStatus}>
              {STATUS_LABELS[currentStatus]} (Current)
            </option>
            {validNext.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isPending || selectedStatus === currentStatus}
            className="mt-3 w-full rounded-lg bg-accent py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Update Status"}
          </button>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          No further status transitions available.
        </p>
      )}
    </div>
  );
}
