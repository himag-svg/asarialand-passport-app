import type { ApplicationStatus } from "@/types";
import { WORKFLOW_STEPS } from "@/lib/constants/workflow-steps";
import { Check } from "lucide-react";

interface StatusTimelineProps {
  currentStatus: ApplicationStatus;
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const statusOrder = WORKFLOW_STEPS.map((s) => s.status);
  const currentIndex = statusOrder.indexOf(currentStatus);

  const isCancelled = currentStatus === "cancelled";
  const isOnHold = currentStatus === "on_hold";

  return (
    <div className="relative">
      {isCancelled && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          This application has been cancelled.
        </div>
      )}
      {isOnHold && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          This application is on hold.
        </div>
      )}
      {WORKFLOW_STEPS.map((step, i) => {
        const isCompleted = currentIndex > i || currentStatus === "completed";
        const isCurrent = currentIndex === i && !isCancelled && !isOnHold;

        return (
          <div key={step.step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all ${
                  isCompleted
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    : isCurrent
                      ? "border-2 border-accent bg-accent/20 shadow-glow"
                      : "border border-white/[0.1] bg-transparent"
                }`}
              >
                {isCompleted && <Check className="h-3.5 w-3.5 text-white" />}
                {isCurrent && (
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                )}
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={`mt-1 w-px flex-1 ${
                    isCompleted
                      ? "bg-gradient-to-b from-emerald-500/40 to-emerald-500/10"
                      : "bg-white/[0.06]"
                  }`}
                  style={{ minHeight: 32 }}
                />
              )}
            </div>
            <div className="pb-8">
              <p
                className={`text-sm font-semibold ${
                  isCompleted || isCurrent ? "text-white" : "text-slate-600"
                }`}
              >
                Step {step.step}: {step.label}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  isCurrent ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {step.description}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-700">
                {step.responsibleParty}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
