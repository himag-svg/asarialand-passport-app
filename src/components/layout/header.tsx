import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/types";
import { LogOut, CircleUser } from "lucide-react";

export function Header({ user }: { user: Profile }) {
  const isStaff = user.role !== "client";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/[0.06] bg-surface-950/80 pl-12 pr-4 sm:px-6 lg:pl-6 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-600">
          {isStaff ? "Admin Portal" : "Client Portal"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10">
            <CircleUser className="h-4 w-4 text-accent" />
          </div>
          <span className="hidden sm:inline text-sm text-slate-400">
            {user.full_name || user.email}
          </span>
          <span className="sm:hidden text-xs text-slate-400 max-w-[80px] truncate">
            {user.full_name || user.email}
          </span>
        </div>

        <div className="h-4 w-px bg-white/[0.06]" />

        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-slate-600 transition hover:bg-white/[0.04] hover:text-slate-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
