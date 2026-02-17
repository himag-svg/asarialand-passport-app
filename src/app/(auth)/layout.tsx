import { Shield, Waves, TreePalm } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side — immersive tropical hero */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between relative overflow-hidden">
        {/* Background image — caribbean aerial beach */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80")',
          }}
        />

        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/90 via-brand-deep/75 to-ocean-600/50" />

        {/* Animated decorative orbs */}
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-[100px] animate-float" />
        <div className="absolute bottom-32 right-10 h-56 w-56 rounded-full bg-ocean-400/10 blur-[80px] animate-wave" />
        <div className="absolute top-1/2 left-1/3 h-40 w-40 rounded-full bg-gold/8 blur-[60px] animate-float" />

        {/* Noise texture */}
        <div className="absolute inset-0 bg-noise opacity-20" />

        <div className="relative z-10 flex flex-col justify-center flex-1 px-12 xl:px-20">
          {/* Coat of arms / shield icon */}
          <div className="mb-10">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-gold/30 bg-gold/10 shadow-gold-glow backdrop-blur-sm">
              <Shield className="h-10 w-10 text-gold-light" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Waves className="h-4 w-4 text-ocean-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ocean-400">
              Official Government Portal
            </span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.1] text-white xl:text-6xl">
            Republic of
            <br />
            <span className="text-gold-shimmer animate-shimmer">
              Asarialand
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
            Your gateway to seamless passport services. Experience a modern,
            secure, and effortless renewal process from the comfort of your
            home.
          </p>

          {/* Trust indicators */}
          <div className="mt-10 flex items-center gap-6">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-xs font-medium text-white/80">
                256-bit Encrypted
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-xs font-medium text-white/80">
                Government Verified
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 border-t border-white/10 bg-black/20 px-12 py-5 xl:px-20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/50">
              Ministry of Internal Affairs &bull; Passport &amp; Immigration
              Division
            </p>
            <div className="flex items-center gap-1.5 text-white/30">
              <TreePalm className="h-3.5 w-3.5" />
              <span className="text-[10px]">Island Heritage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-surface-950 px-6 relative">
        {/* Subtle tropical gradient background */}
        <div className="absolute inset-0 bg-tropical-gradient opacity-50" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-accent/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gold/[0.02] blur-[80px]" />

        {/* Mobile logo (only shown on small screens) */}
        <div className="relative z-10 mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/5 shadow-gold-glow">
            <Shield className="h-6 w-6 text-gold" />
          </div>
          <div>
            <p className="font-display text-base font-bold text-white">
              Asarialand
            </p>
            <p className="text-[10px] text-slate-500">Passport Services</p>
          </div>
        </div>

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
