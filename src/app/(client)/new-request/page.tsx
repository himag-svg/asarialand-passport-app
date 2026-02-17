"use client";

import { useActionState } from "react";
import { createRequest } from "@/lib/actions/requests";
import { SERVICE_TYPES } from "@/lib/constants/service-types";
import {
  FileText,
  MapPin,
  Zap,
  Clock,
  ChevronRight,
  Shield,
} from "lucide-react";

export default function NewRequestPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await createRequest(formData);
      return result ?? null;
    },
    null
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-xl font-bold text-white">
          New Passport Renewal
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill in your details to start the Asarialand passport renewal process.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            {state.error}
          </div>
        )}

        {/* Service Type */}
        <div className="glass-card p-6">
          <div className="section-label mb-4">Service Type</div>
          <div className="space-y-3">
            {SERVICE_TYPES.map((svc) => (
              <label
                key={svc.type}
                className="group flex cursor-pointer items-start gap-4 rounded-xl border border-white/[0.06] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.03] has-[:checked]:border-accent/30 has-[:checked]:bg-accent/5 has-[:checked]:shadow-glow"
              >
                <input
                  type="radio"
                  name="serviceType"
                  value={svc.type}
                  required
                  className="mt-1 h-4 w-4 accent-[#6c63ff]"
                  defaultChecked={svc.type === "normal"}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {svc.type === "expedited" ? (
                      <Zap className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-accent" />
                    )}
                    <p className="text-sm font-semibold text-white">
                      {svc.label}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {svc.description} — {svc.estimatedWeeks}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 text-slate-600 transition group-hover:text-slate-400" />
              </label>
            ))}
          </div>
        </div>

        {/* Passport Details */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="h-4 w-4 text-accent" />
            <div className="section-label !mb-0">Passport Details</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="currentPassportNumber"
                className="block text-sm font-medium text-slate-400"
              >
                Current Passport Number
              </label>
              <input
                id="currentPassportNumber"
                name="currentPassportNumber"
                type="text"
                required
                placeholder="e.g., AS-1234567"
                className="input-focus mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-600"
              />
            </div>
            <div>
              <label
                htmlFor="passportExpiryDate"
                className="block text-sm font-medium text-slate-400"
              >
                Passport Expiry Date
              </label>
              <input
                id="passportExpiryDate"
                name="passportExpiryDate"
                type="date"
                required
                className="input-focus mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Current Address */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="h-4 w-4 text-accent" />
            <div className="section-label !mb-0">Current Address</div>
          </div>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="addressLine1"
                className="block text-sm font-medium text-slate-400"
              >
                Address Line 1
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                required
                placeholder="Street address"
                className="input-focus mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-600"
              />
            </div>
            <div>
              <label
                htmlFor="addressLine2"
                className="block text-sm font-medium text-slate-400"
              >
                Address Line 2{" "}
                <span className="text-slate-600">(Optional)</span>
              </label>
              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                placeholder="Apartment, suite, unit, etc."
                className="input-focus mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-600"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-slate-400"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="input-focus mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-600"
                />
              </div>
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-slate-400"
                >
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  className="input-focus mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-600"
                />
              </div>
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-slate-400"
                >
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  className="input-focus mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="flex items-start gap-3 rounded-2xl border border-accent/10 bg-accent/5 p-4">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-medium text-white">Secure Submission</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Your data is encrypted and processed through the official
              Asarialand Passport Services Portal.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3 text-sm"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Renewal Request"
          )}
        </button>
      </form>
    </div>
  );
}
