"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/lib/actions/auth";
import { UserPlus, Mail, Lock, User, ArrowLeft, Waves } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await signUp(formData);
      return result ?? null;
    },
    null
  );

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-400/10">
          <Waves className="h-5 w-5 text-ocean-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Register to begin your passport renewal process
        </p>
      </div>

      <form action={formAction} className="mt-8 space-y-5">
        {state?.error && (
          <div className="animate-slide-up rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="fullName"
            className="block text-xs font-medium text-slate-400"
          >
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="input-focus block w-full rounded-xl py-3 pl-10 pr-4 text-sm"
              placeholder="Your full legal name"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-medium text-slate-400"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input-focus block w-full rounded-xl py-3 pl-10 pr-4 text-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-slate-400"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="input-focus block w-full rounded-xl py-3 pl-10 pr-4 text-sm"
              placeholder="Minimum 8 characters"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3"
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create account
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-accent transition hover:text-accent-light"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
