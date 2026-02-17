import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Progress bar skeleton */}
      <Skeleton className="h-2 w-full rounded-full" />

      {/* Document cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="mt-4 h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
