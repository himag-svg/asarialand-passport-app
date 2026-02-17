"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Application } from "@/types";
import {
  Building2,
  CalendarClock,
  Hash,
  CheckCircle,
  Send,
} from "lucide-react";

interface Props {
  application: Application;
}

export function GovernmentSubmissionPanel({ application }: Props) {
  const [submissionDate, setSubmissionDate] = useState(
    application.government_submission_date ?? ""
  );
  const [expectedCompletion, setExpectedCompletion] = useState(
    application.expected_completion_date ?? ""
  );
  const [passportOfficeRef, setPassportOfficeRef] = useState(
    application.passport_office_reference ?? ""
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isSubmitted = !!application.government_submission_date;

  const handleSubmit = () => {
    if (!submissionDate) {
      toast.error("Please enter a submission date");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase
        .from("applications")
        .update({
          government_submission_date: submissionDate,
          expected_completion_date: expectedCompletion || null,
          passport_office_reference: passportOfficeRef || null,
          status: "government_submitted",
        })
        .eq("id", application.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Government submission recorded");
        router.refresh();
      }
    });
  };

  const handleUpdateTracking = () => {
    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase
        .from("applications")
        .update({
          expected_completion_date: expectedCompletion || null,
          passport_office_reference: passportOfficeRef || null,
        })
        .eq("id", application.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Tracking details updated");
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Government Submission (Step 8)
        </h2>
        {isSubmitted && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            Submitted
          </span>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <CalendarClock className="h-3 w-3" />
            Submission Date *
          </label>
          <input
            type="date"
            value={submissionDate}
            onChange={(e) => setSubmissionDate(e.target.value)}
            disabled={isSubmitted}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <CalendarClock className="h-3 w-3" />
            Expected Completion Date
          </label>
          <input
            type="date"
            value={expectedCompletion}
            onChange={(e) => setExpectedCompletion(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Hash className="h-3 w-3" />
            Passport Office Reference
          </label>
          <input
            type="text"
            value={passportOfficeRef}
            onChange={(e) => setPassportOfficeRef(e.target.value)}
            placeholder="Reference number from passport office"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none uppercase font-mono tracking-widest"
          />
        </div>

        {!isSubmitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !submissionDate}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isPending ? "Recording..." : "Record Government Submission"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleUpdateTracking}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <Building2 className="h-4 w-4" />
            {isPending ? "Updating..." : "Update Tracking Details"}
          </button>
        )}
      </div>

      {/* Submission info when already submitted */}
      {isSubmitted && (
        <div className="mt-4 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
          <div className="space-y-1 text-xs text-slate-400">
            <p>
              <span className="text-slate-500">Submitted:</span>{" "}
              <span className="text-emerald-400">
                {new Date(application.government_submission_date!).toLocaleDateString()}
              </span>
            </p>
            {application.expected_completion_date && (
              <p>
                <span className="text-slate-500">Expected:</span>{" "}
                <span className="text-white">
                  {new Date(application.expected_completion_date).toLocaleDateString()}
                </span>
              </p>
            )}
            {application.passport_office_reference && (
              <p>
                <span className="text-slate-500">Office Ref:</span>{" "}
                <span className="font-mono text-white">
                  {application.passport_office_reference}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
