import { notFound } from "next/navigation";
import { getApplicationById } from "@/lib/queries/requests";
import { createClient } from "@/lib/supabase/server";
import { StatusTimeline } from "@/components/domain/status-timeline";
import { StatusBadge } from "@/components/domain/status-badge";
import { StatusControl } from "@/components/domain/status-control";
import { KycPanel } from "@/components/domain/kyc-panel";
import { CreateInvoiceForm } from "@/components/domain/create-invoice-form";
import { PaymentManagement } from "@/components/domain/payment-management";
import { AddNoteForm } from "@/components/domain/add-note-form";
import { DocumentReviewList } from "@/components/domain/document-review-list";
import { PassportFormEditor } from "@/components/domain/passport-form-editor";
import { CourierTracker } from "@/components/domain/courier-tracker";
import { GeneratePdfButton } from "@/components/domain/generate-pdf-button";
import { GovernmentSubmissionPanel } from "@/components/domain/government-submission-panel";
import { PassportIssuancePanel } from "@/components/domain/passport-issuance-panel";
import { AcknowledgmentLetter } from "@/components/domain/acknowledgment-letter";
import { StatusHistoryList } from "@/components/domain/status-history-list";
import { getServiceTypeInfo } from "@/lib/constants/service-types";
import type {
  ApplicationStatus,
  ApplicationNote,
  Invoice,
  Payment,
  CourierShipment,
  StatusHistoryEntry,
} from "@/types";
import Link from "next/link";
import { ArrowLeft, MapPin, FileText, MessageSquare } from "lucide-react";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();

  const supabase = await createClient();

  const [notesResult, invoicesResult, paymentsResult, shipmentsResult, historyResult] =
    await Promise.all([
      supabase
        .from("application_notes")
        .select(
          "*, author:profiles!application_notes_author_id_fkey(full_name, email)"
        )
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("*")
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("*")
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("courier_shipments")
        .select("*")
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("status_history")
        .select("*")
        .eq("application_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const notes = (notesResult.data as ApplicationNote[]) ?? [];
  const invoices = (invoicesResult.data as Invoice[]) ?? [];
  const payments = (paymentsResult.data as Payment[]) ?? [];
  const shipments = (shipmentsResult.data as CourierShipment[]) ?? [];
  const statusHistory = (historyResult.data as StatusHistoryEntry[]) ?? [];

  const serviceInfo = getServiceTypeInfo(application.service_type);
  const docs = application.documents ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/requests"
            className="flex items-center gap-1 text-xs text-slate-600 transition hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to requests
          </Link>
          <h1 className="mt-2 font-display text-xl font-bold text-white">
            {application.reference_number}
          </h1>
          <p className="text-sm text-slate-500">
            {application.client?.full_name ??
              application.client?.email ??
              "Client"}{" "}
            &middot; {serviceInfo.label}
          </p>
        </div>
        <StatusBadge status={application.status as ApplicationStatus} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="glass-card p-6">
            <div className="section-label">Status Timeline</div>
            <div className="mt-6">
              <StatusTimeline
                currentStatus={application.status as ApplicationStatus}
              />
            </div>
          </div>

          {/* Documents */}
          <DocumentReviewList
            documents={docs}
            applicationId={application.id}
          />

          {/* KYC Panel */}
          <KycPanel application={application} />

          {/* Invoices & Payments */}
          <div className="space-y-4">
            <div className="section-label">Invoices & Payments</div>

            {invoices.length > 0 && (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="glass-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {inv.invoice_number}
                        </p>
                        <p className="text-xs text-slate-500">
                          {inv.invoice_type === "client"
                            ? "Client invoice"
                            : "Agent invoice"}{" "}
                          &middot; {inv.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-sm font-bold text-white">
                          {inv.currency} {Number(inv.amount).toFixed(2)}
                        </p>
                        <span
                          className={`text-[11px] font-medium ${
                            inv.status === "paid"
                              ? "text-emerald-400"
                              : inv.status === "sent"
                                ? "text-amber-400"
                                : "text-slate-500"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <PaymentManagement
              payments={payments}
              invoices={invoices}
              applicationId={application.id}
            />

            <CreateInvoiceForm
              applicationId={application.id}
              clientId={application.client_id}
              invoiceType="client"
              recipientLabel={
                application.client?.full_name ??
                application.client?.email ??
                "Client"
              }
            />
          </div>

          {/* Passport Application Form (Step 6) */}
          <PassportFormEditor application={application} />

          {/* Generate PDF */}
          <GeneratePdfButton applicationId={application.id} />

          {/* Courier Tracking (Step 7) */}
          <CourierTracker
            shipments={shipments}
            applicationId={application.id}
          />

          {/* Government Submission (Step 8) */}
          <GovernmentSubmissionPanel application={application} />

          {/* Passport Issuance (Steps 9-10) */}
          <PassportIssuancePanel application={application} />

          {/* Acknowledgment Letter */}
          {(application.status === "passport_issued" ||
            application.status === "completed") && (
            <AcknowledgmentLetter application={application} />
          )}

          {/* Status History */}
          <StatusHistoryList history={statusHistory} />

          {/* Notes */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-accent" />
              <div className="section-label !mb-0">Notes</div>
            </div>
            <AddNoteForm applicationId={application.id} />
            {notes.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <p className="text-sm text-slate-300">{note.content}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-600">
                      <span>{note.author?.full_name ?? "Staff"}</span>
                      <span>&middot;</span>
                      <span>
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                      {note.is_internal && (
                        <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                          Internal
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No notes yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Control */}
          <StatusControl
            applicationId={application.id}
            currentStatus={application.status as ApplicationStatus}
          />

          {/* Details */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-accent" />
              <div className="section-label !mb-0">Details</div>
            </div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Created</dt>
                <dd className="text-slate-300">
                  {new Date(application.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Passport #</dt>
                <dd className="font-mono text-slate-300">
                  {application.current_passport_number ?? "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Expiry</dt>
                <dd className="text-slate-300">
                  {application.passport_expiry_date
                    ? new Date(
                        application.passport_expiry_date
                      ).toLocaleDateString()
                    : "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Service</dt>
                <dd className="capitalize text-slate-300">
                  {application.service_type}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">KYC Status</dt>
                <dd className="capitalize text-slate-300">
                  {application.kyc_status}
                </dd>
              </div>
              {application.government_submission_date && (
                <div className="flex justify-between">
                  <dt className="text-slate-600">Gov. Submitted</dt>
                  <dd className="text-slate-300">
                    {new Date(
                      application.government_submission_date
                    ).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {application.expected_completion_date && (
                <div className="flex justify-between">
                  <dt className="text-slate-600">Est. Completion</dt>
                  <dd className="text-slate-300">
                    {new Date(
                      application.expected_completion_date
                    ).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Address */}
          {application.current_address && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-accent" />
                <div className="section-label !mb-0">Client Address</div>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed">
                <p>{application.current_address.line1}</p>
                {application.current_address.line2 && (
                  <p>{application.current_address.line2}</p>
                )}
                <p>
                  {application.current_address.city},{" "}
                  {application.current_address.country}{" "}
                  {application.current_address.postal_code}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
