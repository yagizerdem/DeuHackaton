import { Skeleton } from "@components/ui/skeleton";

export default function ResultSkeleton() {
  return (
    <div
      role="status"
      aria-label="Generating analysis"
      className="space-y-6 rounded-xl border border-border/60 bg-stitch-surface-container-low p-5"
    >
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-28 w-full" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
