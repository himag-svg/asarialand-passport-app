import { getAllApplications } from "@/lib/queries/requests";
import { StatusBadge } from "@/components/domain/status-badge";
import type { ApplicationStatus } from "@/types";
import Link from "next/link";
import { Search, Filter } from "lucide-react";

export default async function AdminRequestsPage() {
  const applications = await getAllApplications();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">
            All Requests
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {applications.length} total application
            {applications.length !== 1 ? "s" : ""} in the pipeline.
          </p>
        </div>
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
              <th className="hidden sm:table-cell px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Service
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Status
              </th>
              <th className="hidden md:table-cell px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Created
              </th>
              <th className="hidden lg:table-cell px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Updated
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
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
                <td className="hidden sm:table-cell px-5 py-3.5 text-sm capitalize text-slate-500">
                  {app.service_type}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={app.status as ApplicationStatus} />
                </td>
                <td className="hidden md:table-cell px-5 py-3.5 text-xs text-slate-600">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="hidden lg:table-cell px-5 py-3.5 text-xs text-slate-600">
                  {new Date(app.updated_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/requests/${app.id}`}
                    className="text-xs font-medium text-accent transition hover:text-accent-light"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-slate-600"
                >
                  No applications in the pipeline yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
