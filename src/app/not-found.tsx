import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <FileQuestion className="h-8 w-8 text-slate-500" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-white">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
