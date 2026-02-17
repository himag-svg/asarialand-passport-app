import { notFound } from "next/navigation";
import { getApplicationById } from "@/lib/queries/requests";
import { createClient } from "@/lib/supabase/server";
import { StatusTimeline } from "@/components/domain/status-timeline";
import { StatusBadge } from "@/components/domain/status-badge";
import { StatusHistoryList } from "@/components/domain/status-history-list";
import { AcknowledgmentLetter } from "@/components/domain/acknowledgment-letter";
import { RealtimeStatusListener } from "@/components/domain/realtime-status-listener";
import { DOCUMENT_TYPES } from "@/lib/constants/document-types";
import { getServiceTypeInfo } from "@/lib/constants/service-types";
import type { ApplicationStatus, StatusHistoryEntry } from "@/types";
import Link from "next/link";
import {
  BookOpen,
  CalendarClock,
  Building2,
  Truck,
  CheckCircle,
} from "lucide-react";

export default async function ClientRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();

  const supabase = await createClient();

  // Fetch status history
  const { data: historyData } = await supabase
    .from("status_history")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: false });

  const statusHistory = (historyData as StatusHistoryEntry[]) ?? [];

  const serviceInfo = getServiceTypeInfo(application.service_type);
  const docs = application.documents ?? [];
  const docTypeMap = new Map(DOCUMENT_TYPES.map((d) => [d.type, d]));

  const isTrackingOrLater = [
    "government_submitted",
    "tracking",
    "passport_issued",
    "completed",
  ].includes(application.status);

  const isPassportIssued = [
    "passport_issued",
    "completed",
  ].includes(application.status);

  return (
    <div className="space-y-8">
      {/* Realtime listener for live status updates */}
      <RealtimeStatusListener applicationId={id} />

      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-white"
          >
            &larr; Back to dashboard
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-white">
            {application.reference_number}
          </h1>
          <p className="text-sm text-slate-500">{serviceInfo.label}</p>
        </div>
        <StatusBadge status={application.status as ApplicationStatus} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
            <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Status Timeline
            </h2>
            <div className="mt-6">
              <StatusTimeline
                currentStatus={application.status as ApplicationStatus}
              />
            </div>
          </div>

          {/* Government Tracking Info */}
          {isTrackingOrLater && (
            <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
              <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Government Processing
              </h2>
              <div className="mt-4 space-y-3">
                {application.government_submission_date && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-slate-300">
                        Submitted to Passport Office
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(
                          application.government_submission_date
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {application.expected_completion_date && (
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarClock className="h-4 w-4 text-amber-400" />
                    <div>
                      <p className="text-slate-300">Expected Completion</p>
                      <p className="text-xs text-slate-500">
                        {new Date(
                          application.expected_completion_date
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {application.passport_office_reference && (
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="h-4 w-4 text-sky-400" />
                    <div>
                      <p className="text-slate-300">Office Reference</p>
                      <p className="font-mono text-xs text-slate-500">
                        {application.passport_office_reference}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passport Issued Info */}
          {isPassportIssued && application.new_passport_number && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                  <BookOpen className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-emerald-400">
                    Your New Passport Has Been Issued!
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Passport Number:{" "}
                    <span className="font-mono font-semibold text-white">
                      {application.new_passport_number}
                    </span>
                  </p>
                  {application.passport_issued_date && (
                    <p className="text-xs text-slate-500">
                      Issued on{" "}
                      {new Date(
                        application.passport_issued_date
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Acknowledgment Letter (client signs this) */}
          {isPassportIssued && (
            <AcknowledgmentLetter application={application} />
          )}

          {/* Documents */}
          <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
            <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Documents
            </h2>
            <ul className="mt-4 space-y-3">
              {docs.map((doc) => {
                const typeInfo = docTypeMap.get(doc.document_type);
                return (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <span className="text-sm text-white">
                        {typeInfo?.name ?? doc.document_type}
                      </span>
                      {doc.rejection_reason && doc.status === "rejected" && (
                        <p className="mt-0.5 text-xs text-red-400">
                          {doc.rejection_reason}
                        </p>
                      )}
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs ${
                        doc.status === "approved"
                          ? "text-emerald-500"
                          : doc.status === "rejected"
                            ? "text-red-400"
                            : doc.status === "needs_reupload"
                              ? "text-orange-400"
                              : doc.status === "uploaded"
                                ? "text-sky-500"
                                : "text-slate-500"
                      }`}
                    >
                      {doc.status === "approved" && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {doc.status.replace(/_/g, " ")}
                    </span>
                  </li>
                );
              })}
              {docs.length === 0 && (
                <li className="text-sm text-slate-500">
                  No documents uploaded yet.
                </li>
              )}
            </ul>
          </div>

          {/* Status History */}
          <StatusHistoryList history={statusHistory} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
            <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Details
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-300">
                  {new Date(application.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Passport</dt>
                <dd className="text-slate-300">
                  {application.current_passport_number ?? "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Service</dt>
                <dd className="text-slate-300 capitalize">
                  {application.service_type}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Est. Completion</dt>
                <dd className="text-slate-300">
                  {application.expected_completion_date
                    ? new Date(
                        application.expected_completion_date
                      ).toLocaleDateString()
                    : "Pending"}
                </dd>
              </div>
              {application.new_passport_number && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">New Passport</dt>
                  <dd className="font-mono text-emerald-400">
                    {application.new_passport_number}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
            <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Quick Actions
            </h2>
            <div className="mt-3 space-y-2">
              <Link
                href="/documents"
                className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
              >
                Upload Documents
              </Link>
              <Link
                href="/payments"
                className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
              >
                View Payments
              </Link>
              <Link
                href="/notifications"
                className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
              >
                View Notifications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
