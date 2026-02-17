import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function PaymentsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
