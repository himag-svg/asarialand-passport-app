import { createClient } from "@/lib/supabase/server";
import type { Invoice } from "@/types";
import { Receipt } from "lucide-react";

export default async function AdminInvoicesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  const invoices = (data as Invoice[]) ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-xl font-bold text-white">Invoices</h1>
        <p className="mt-1 text-sm text-slate-600">
          All invoices across applications.
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Invoice #
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Type
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Amount
              </th>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Status
              </th>
              <th className="hidden sm:table-cell px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Due Date
              </th>
              <th className="hidden md:table-cell px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-white/[0.03] transition hover:bg-white/[0.02]"
              >
                <td className="px-5 py-3.5 text-sm font-medium font-mono text-accent">
                  {inv.invoice_number}
                </td>
                <td className="px-5 py-3.5 text-sm capitalize text-slate-400">
                  {inv.invoice_type}
                </td>
                <td className="px-5 py-3.5 text-sm font-semibold text-white">
                  {inv.currency} {Number(inv.amount).toFixed(2)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      inv.status === "paid"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : inv.status === "sent"
                          ? "bg-amber-400/10 text-amber-400"
                          : inv.status === "overdue"
                            ? "bg-red-400/10 text-red-400"
                            : "bg-slate-400/10 text-slate-400"
                    }`}
                  >
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                </td>
                <td className="hidden sm:table-cell px-5 py-3.5 text-xs text-slate-600">
                  {inv.due_date
                    ? new Date(inv.due_date).toLocaleDateString()
                    : "\u2014"}
                </td>
                <td className="hidden md:table-cell px-5 py-3.5 text-xs text-slate-600">
                  {new Date(inv.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-slate-600"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Receipt className="h-8 w-8 text-slate-700" />
                    No invoices yet.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
