import Link from "next/link";
import { Waves, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-accent/[0.04] blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-ocean-400/[0.03] blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-md text-center animate-fade-in">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-ocean-400/20 bg-ocean-400/5">
          <Waves className="h-10 w-10 text-ocean-400" />
        </div>
        <h1 className="mt-8 font-display text-3xl font-bold text-white">
          Lost at Sea
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          The page you are looking for does not exist or has drifted away.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
