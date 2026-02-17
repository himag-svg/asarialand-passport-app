import { getAllNotifications } from "@/lib/queries/notifications";
import {
  Bell,
  CheckCircle,
  FileText,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import type { NotificationType } from "@/types";

const typeIcons: Record<NotificationType, typeof Bell> = {
  status_change: Bell,
  document_request: FileText,
  document_approved: CheckCircle,
  document_rejected: AlertCircle,
  payment_request: CreditCard,
  payment_confirmed: CheckCircle,
  message: Bell,
  reminder: Bell,
  passport_ready: CheckCircle,
  general: Bell,
};

const typeColors: Record<NotificationType, string> = {
  status_change: "text-accent",
  document_request: "text-sky-400",
  document_approved: "text-emerald-400",
  document_rejected: "text-red-400",
  payment_request: "text-orange-400",
  payment_confirmed: "text-emerald-400",
  message: "text-slate-400",
  reminder: "text-amber-400",
  passport_ready: "text-gold",
  general: "text-slate-400",
};

const typeBgs: Record<NotificationType, string> = {
  status_change: "bg-accent/10",
  document_request: "bg-sky-400/10",
  document_approved: "bg-emerald-400/10",
  document_rejected: "bg-red-400/10",
  payment_request: "bg-orange-400/10",
  payment_confirmed: "bg-emerald-400/10",
  message: "bg-white/[0.04]",
  reminder: "bg-amber-400/10",
  passport_ready: "bg-gold/10",
  general: "bg-white/[0.04]",
};

export default async function ClientNotificationsPage() {
  const notifications = await getAllNotifications();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-xl font-bold text-white">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Stay updated on your passport renewal progress.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">
            <Bell className="h-7 w-7 text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No notifications yet.</p>
          <p className="mt-1 text-xs text-slate-600">
            You&apos;ll be notified of any updates here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] ?? Bell;
            const iconColor = typeColors[n.type] ?? "text-slate-400";
            const iconBg = typeBgs[n.type] ?? "bg-white/[0.04]";
            return (
              <div
                key={n.id}
                className={`glass-card p-4 transition ${
                  !n.is_read ? "border-accent/20 bg-accent/[0.03]" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                  >
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-400">
                      {n.body}
                    </p>
                    <p className="mt-1.5 text-[11px] text-slate-600">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent shadow-glow" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
