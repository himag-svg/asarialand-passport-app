import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side — branding panel */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between bg-hero-pattern relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="absolute top-1/4 -left-32 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center flex-1 px-12 xl:px-20">
          {/* Coat of arms / shield icon */}
          <div className="mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/20 bg-gold/5 shadow-gold-glow">
              <Shield className="h-8 w-8 text-gold" />
            </div>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight text-white xl:text-5xl">
            Republic of
            <br />
            <span className="text-gold-shimmer">Asarialand</span>
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
            Official Passport Services Portal. Securely manage your passport
            renewal and issuance with our streamlined digital process.
          </p>

          {/* Trust indicators */}
          <div className="mt-10 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-500">256-bit Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-500">
                Government Verified
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 border-t border-white/[0.04] px-12 py-5 xl:px-20">
          <p className="text-xs text-slate-600">
            Ministry of Internal Affairs &bull; Passport &amp; Immigration
            Division
          </p>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-surface-950 px-6">
        {/* Mobile logo (only shown on small screens) */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/5">
            <Shield className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">
              Asarialand
            </p>
            <p className="text-[10px] text-slate-500">Passport Services</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
