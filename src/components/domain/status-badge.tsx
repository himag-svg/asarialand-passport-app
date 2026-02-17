import type { ApplicationStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants/workflow-steps";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
