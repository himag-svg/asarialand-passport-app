import { Skeleton, TableRowSkeleton } from "@/components/ui/skeleton";

export default function RequestsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <div className="rounded-xl border border-white/10 bg-surface-900 shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-12" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-12" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-12" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
