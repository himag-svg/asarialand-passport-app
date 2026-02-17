import { getApplicationStats, getAllApplications } from "@/lib/queries/requests";
import { StatusBadge } from "@/components/domain/status-badge";
import type { ApplicationStatus } from "@/types";
import Link from "next/link";
import {
  FileStack,
  ShieldCheck,
  CreditCard,
  Loader,
  CheckCircle2,
  ArrowRight,
  Waves,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [stats, recentApplications] = await Promise.all([
    getApplicationStats(),
    getAllApplications(),
  ]);

  const recent = recentApplications.slice(0, 5);

  const cards = [
    {
      label: "Total",
      value: stats.total,
      icon: FileStack,
      color: "text-accent-light",
      bg: "bg-gradient-to-br from-accent/15 to-ocean-400/10",
      border: "border-accent/10",
    },
    {
      label: "KYC Pending",
      value: stats.pending_kyc,
      icon: ShieldCheck,
      color: "text-amber-400",
      bg: "bg-gradient-to-br from-amber-400/15 to-amber-500/10",
      border: "border-amber-400/10",
    },
    {
      label: "Payments",
      value: stats.pending_payment,
      icon: CreditCard,
      color: "text-orange-400",
      bg: "bg-gradient-to-br from-orange-400/15 to-coral/10",
      border: "border-orange-400/10",
    },
    {
      label: "In Progress",
      value: stats.in_progress,
      icon: Loader,
      color: "text-ocean-400",
      bg: "bg-gradient-to-br from-ocean-400/15 to-accent/10",
      border: "border-ocean-400/10",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-gradient-to-br from-emerald-400/15 to-palm/10",
      border: "border-emerald-400/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-white">
            Dashboard
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
            <Waves className="h-3.5 w-3.5 text-ocean-400" />
            Asarialand Passport Renewal Pipeline
          </p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`glass-card p-4 border ${card.border} transition-all duration-200 hover:border-white/[0.1]`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-white">
                  {card.value}
                </p>
                <p className="text-[11px] text-slate-600">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent applications */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="section-label">Recent Applications</div>
          <Link
            href="/admin/requests"
            className="flex items-center gap-1 text-xs font-medium text-accent transition hover:text-accent-light"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Reference
                </th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Client
                </th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Status
                </th>
                <th className="hidden sm:table-cell px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Updated
                </th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-white/[0.03] transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3.5 text-sm font-medium font-mono text-accent">
                    {app.reference_number}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">
                    {app.client?.full_name ?? app.client?.email ?? "\u2014"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={app.status as ApplicationStatus} />
                  </td>
                  <td className="hidden sm:table-cell px-5 py-3.5 text-xs text-slate-600">
                    {new Date(app.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/requests/${app.id}`}
                      className="text-xs font-medium text-accent transition hover:text-accent-light"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-600"
                  >
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
