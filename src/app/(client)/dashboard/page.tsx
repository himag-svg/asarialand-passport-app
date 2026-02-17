import Link from "next/link";
import { getClientApplications } from "@/lib/queries/requests";
import { StatusBadge } from "@/components/domain/status-badge";
import { StatusTimeline } from "@/components/domain/status-timeline";
import { CancelApplicationButton } from "@/components/domain/cancel-application-button";
import { getServiceTypeInfo } from "@/lib/constants/service-types";
import {
  PlusCircle,
  Upload,
  CreditCard,
  ArrowRight,
  Clock,
  Shield,
  Waves,
} from "lucide-react";
import type { ApplicationStatus } from "@/types";

const CANCELLABLE_STATUSES = [
  "client_request",
  "pending_kyc",
  "kyc_in_review",
  "pending_payment",
  "documents_required",
];

export default async function ClientDashboardPage() {
  const applications = await getClientApplications();
  const latest = applications[0];

  if (!latest) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center animate-fade-in">
          {/* Hero welcome card */}
          <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-brand-deep to-brand-navy p-8">
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1200&q=80")',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-transparent" />

            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 shadow-gold-glow">
                <Shield className="h-10 w-10 text-gold" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                <Waves className="h-3.5 w-3.5 text-ocean-400" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ocean-400">
                  Official Portal
                </span>
              </div>

              <h1 className="font-display text-2xl font-bold text-white">
                Welcome to Asarialand
              </h1>
              <p className="mt-2 text-base text-white/60">
                Passport Services Portal
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Begin your passport renewal application. Our streamlined digital
            process guides you through every step.
          </p>

          <Link
            href="/new-request"
            className="btn-primary mt-8 inline-flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Start New Application
          </Link>
        </div>
      </div>
    );
  }

  const serviceInfo = getServiceTypeInfo(latest.service_type);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">
            Your Application
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Reference:{" "}
            <span className="font-mono text-accent">{latest.reference_number}</span>
          </p>
        </div>
        <StatusBadge status={latest.status as ApplicationStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="section-label">Status Timeline</div>
            <div className="mt-6">
              <StatusTimeline
                currentStatus={latest.status as ApplicationStatus}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="section-label">Service Type</div>
            <p className="mt-3 font-display text-lg font-bold text-white">
              {serviceInfo.label}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {serviceInfo.estimatedWeeks}
            </p>
          </div>

          <div className="glass-card p-5">
            <div className="section-label">Estimated Completion</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/15 to-coral/10 border border-amber-400/10">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <p className="font-display text-xl font-bold text-white">
                {latest.expected_completion_date
                  ? new Date(
                      latest.expected_completion_date
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Pending"}
              </p>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="section-label">Quick Actions</div>
            <div className="mt-3 space-y-2">
              <Link
                href="/documents"
                className="flex items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2.5 text-sm text-slate-400 transition hover:border-accent/20 hover:bg-accent/5 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload documents
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/payments"
                className="flex items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2.5 text-sm text-slate-400 transition hover:border-accent/20 hover:bg-accent/5 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  View payments
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Cancel button — only for early-stage applications */}
          {CANCELLABLE_STATUSES.includes(latest.status) && (
            <CancelApplicationButton applicationId={latest.id} />
          )}
        </div>
      </div>

      {applications.length > 1 && (
        <div>
          <div className="section-label mb-4">All Applications</div>
          <div className="space-y-2">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/request/${app.id}`}
                className="glass-card-hover flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {app.reference_number}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={app.status as ApplicationStatus} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
