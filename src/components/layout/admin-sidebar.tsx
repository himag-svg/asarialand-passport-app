"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileStack,
  Receipt,
  Users,
  Settings,
  Menu,
  X,
  Shield,
  Anchor,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Requests", href: "/admin/requests", icon: FileStack },
  { label: "Invoices", href: "/admin/invoices", icon: Receipt },
  { label: "Agents", href: "/admin/agents", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/20 bg-gradient-to-br from-gold/10 to-gold/5 shadow-gold-glow">
        <Shield className="h-5 w-5 text-gold" />
      </div>
      <div>
        <p className="font-display text-sm font-bold text-white leading-tight">
          Asarialand
        </p>
        <p className="text-[10px] text-gold">Admin Portal</p>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      <div className="section-label mb-3 mt-8 flex items-center gap-1.5">
        <Anchor className="h-3 w-3" />
        Administration
      </div>
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
                isActive
                  ? "bg-accent/10 font-medium text-accent shadow-glow border border-accent/10"
                  : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 border border-transparent"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-accent" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin info card at bottom */}
      <div className="mt-auto pt-6">
        <div className="rounded-xl border border-gold/10 bg-gradient-to-br from-gold/5 to-gold-dark/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
            Staff Access
          </p>
          <p className="mt-1 text-[10px] text-slate-600 leading-relaxed">
            Processing &amp; administration controls for passport services.
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-20 rounded-lg p-1.5 text-slate-400 hover:text-white"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-out */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/[0.06] bg-surface-950 transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
              <BrandLogo />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1 text-slate-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {navContent}
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 border-r border-white/[0.06] bg-surface-950">
        <div className="flex h-full flex-col px-4 py-5">
          <Link href="/admin/dashboard">
            <BrandLogo />
          </Link>
          {navContent}
        </div>
      </aside>
    </>
  );
}
