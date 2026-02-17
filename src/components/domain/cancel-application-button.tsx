"use client";

import { useState } from "react";
import { cancelApplication } from "@/lib/actions/requests";
import { XCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export function CancelApplicationButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCancel() {
    setIsPending(true);
    setError(null);
    const result = await cancelApplication(applicationId);
    setIsPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setShowConfirm(false);
    router.refresh();
  }

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-400 transition hover:border-red-500/30 hover:bg-red-500/10"
      >
        <XCircle className="h-4 w-4" />
        Cancel Application
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
        <div>
          <p className="text-sm font-medium text-red-400">
            Cancel this application?
          </p>
          <p className="mt-1 text-xs text-slate-500">
            This action cannot be undone. Your application will be permanently
            cancelled.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
              Cancelling...
            </>
          ) : (
            "Yes, cancel it"
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowConfirm(false);
            setError(null);
          }}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-300"
        >
          Keep application
        </button>
      </div>
    </div>
  );
}
