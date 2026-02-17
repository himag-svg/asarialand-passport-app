"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Application } from "@/types";
import {
  BookOpen,
  CalendarCheck,
  Hash,
  CheckCircle,
  Sparkles,
} from "lucide-react";

interface Props {
  application: Application;
}

export function PassportIssuancePanel({ application }: Props) {
  const [newPassportNumber, setNewPassportNumber] = useState(
    application.new_passport_number ?? ""
  );
  const [issuedDate, setIssuedDate] = useState(
    application.passport_issued_date ?? ""
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isIssued = !!application.passport_issued_date;

  const handleRecordIssuance = () => {
    if (!newPassportNumber.trim()) {
      toast.error("Please enter the new passport number");
      return;
    }
    if (!issuedDate) {
      toast.error("Please enter the issuance date");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase
        .from("applications")
        .update({
          new_passport_number: newPassportNumber.trim().toUpperCase(),
          passport_issued_date: issuedDate,
          status: "passport_issued",
        })
        .eq("id", application.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Passport issuance recorded!");
        router.refresh();
      }
    });
  };

  const handleMarkCompleted = () => {
    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase
        .from("applications")
        .update({
          status: "completed",
          client_acknowledged: true,
          acknowledgment_signed_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Application marked as completed!");
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Passport Issuance (Steps 9-10)
        </h2>
        {isIssued && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            Issued
          </span>
        )}
      </div>

      {!isIssued ? (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-500">
            Record the new passport details once issued by the Passport Office.
          </p>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Hash className="h-3 w-3" />
              New Passport Number *
            </label>
            <input
              type="text"
              value={newPassportNumber}
              onChange={(e) => setNewPassportNumber(e.target.value)}
              placeholder="New passport number"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none uppercase font-mono tracking-widest"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <CalendarCheck className="h-3 w-3" />
              Date of Issuance *
            </label>
            <input
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleRecordIssuance}
            disabled={isPending || !newPassportNumber.trim() || !issuedDate}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isPending ? "Recording..." : "Record Passport Issuance"}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Issuance details */}
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-white">
                  Passport Issued
                </p>
                <div className="mt-1 space-y-1 text-xs text-slate-400">
                  <p>
                    <span className="text-slate-500">Number:</span>{" "}
                    <span className="font-mono text-emerald-400">
                      {application.new_passport_number}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">Issued:</span>{" "}
                    <span className="text-white">
                      {new Date(
                        application.passport_issued_date!
                      ).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mark completed */}
          {application.status !== "completed" && (
            <button
              type="button"
              onClick={handleMarkCompleted}
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {isPending ? "Completing..." : "Mark Application as Completed"}
            </button>
          )}

          {application.status === "completed" && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-400">
                  Application Completed
                </p>
                {application.acknowledgment_signed_at && (
                  <p className="text-xs text-slate-500">
                    Acknowledged on{" "}
                    {new Date(
                      application.acknowledgment_signed_at
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
