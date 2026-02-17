"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CourierShipment, CourierDirection, CourierStatus } from "@/types";
import { Truck, Package, MapPin, CheckCircle, Clock, Plus } from "lucide-react";

const directionLabels: Record<CourierDirection, string> = {
  client_to_processing: "Client -> Processing Office",
  processing_to_agent: "Processing -> Local Agent",
  agent_to_passport_office: "Local Agent -> Passport Office",
  passport_office_to_agent: "Passport Office -> Local Agent",
  agent_to_processing: "Local Agent -> Processing Office",
  processing_to_client: "Processing -> Client",
};

const statusConfig: Record<CourierStatus, { icon: typeof Clock; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-slate-400" },
  dispatched: { icon: Truck, label: "Dispatched", color: "text-sky-400" },
  in_transit: { icon: MapPin, label: "In Transit", color: "text-amber-400" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "text-emerald-400" },
  returned: { icon: Package, label: "Returned", color: "text-red-400" },
};

interface Props {
  shipments: CourierShipment[];
  applicationId: string;
}

export function CourierTracker({ shipments, applicationId }: Props) {
  const [showNew, setShowNew] = useState(false);
  const [direction, setDirection] = useState<CourierDirection>("client_to_processing");
  const [company, setCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = () => {
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      const { error } = await supabase.from("courier_shipments").insert({
        application_id: applicationId,
        direction,
        courier_company: company || null,
        tracking_number: trackingNumber || null,
        status: "pending",
        created_by: user.id,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Courier shipment created");
        setShowNew(false);
        setCompany("");
        setTrackingNumber("");
        router.refresh();
      }
    });
  };

  const updateStatus = (shipmentId: string, newStatus: CourierStatus) => {
    startTransition(async () => {
      const supabase = createClient();

      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === "dispatched") {
        updateData.dispatched_at = new Date().toISOString();
      }
      if (newStatus === "delivered") {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("courier_shipments")
        .update(updateData)
        .eq("id", shipmentId);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(`Shipment marked as ${newStatus}`);
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Courier Tracking
        </h2>
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1 text-xs text-accent hover:underline"
        >
          <Plus className="h-3 w-3" /> New Shipment
        </button>
      </div>

      {/* New shipment form */}
      {showNew && (
        <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Direction
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as CourierDirection)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
            >
              {Object.entries(directionLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Courier Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., DHL, FedEx"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking #"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={isPending}
              className="flex-1 rounded-lg bg-accent py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create Shipment"}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="flex-1 rounded-lg border border-white/10 py-1.5 text-xs text-slate-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Shipment list */}
      {shipments.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No courier shipments recorded yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {shipments.map((shipment) => {
            const config = statusConfig[shipment.status];
            const StatusIcon = config.icon;
            const nextStatuses: CourierStatus[] = {
              pending: ["dispatched"],
              dispatched: ["in_transit"],
              in_transit: ["delivered", "returned"],
              delivered: [],
              returned: [],
            }[shipment.status] as CourierStatus[];

            return (
              <div
                key={shipment.id}
                className="rounded-lg border border-white/5 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {directionLabels[shipment.direction]}
                    </p>
                    <div className="mt-0.5 flex gap-3 text-xs text-slate-500">
                      {shipment.courier_company && (
                        <span>{shipment.courier_company}</span>
                      )}
                      {shipment.tracking_number && (
                        <span>#{shipment.tracking_number}</span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs ${config.color}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>
                </div>

                {nextStatuses.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {nextStatuses.map((ns) => (
                      <button
                        key={ns}
                        type="button"
                        onClick={() => updateStatus(shipment.id, ns)}
                        disabled={isPending}
                        className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                      >
                        Mark as {statusConfig[ns].label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-1 flex gap-3 text-xs text-slate-600">
                  {shipment.dispatched_at && (
                    <span>
                      Dispatched:{" "}
                      {new Date(shipment.dispatched_at).toLocaleDateString()}
                    </span>
                  )}
                  {shipment.delivered_at && (
                    <span>
                      Delivered:{" "}
                      {new Date(shipment.delivered_at).toLocaleDateString()}
                    </span>
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
