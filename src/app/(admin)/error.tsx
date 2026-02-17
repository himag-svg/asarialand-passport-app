"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">
          Admin Portal Error
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          An unexpected error occurred in the admin portal. Please try again.
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-slate-600">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
