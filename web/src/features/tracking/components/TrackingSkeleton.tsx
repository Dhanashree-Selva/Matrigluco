import { Skeleton } from "../../../shared/ui";

export function TrackingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2 pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-[var(--surface-soft)]" />
            <Skeleton className="h-7 w-48 bg-[var(--surface-soft)]" />
          </div>
          <Skeleton className="h-8 w-40 bg-[var(--surface-soft)]" />
        </div>
        <Skeleton className="h-3 w-80 bg-[var(--surface-soft)]" />
      </div>

      {/* Temporal Lens Skeleton */}
      <Skeleton className="h-12 w-full rounded-md bg-[var(--surface-soft)]" />

      {/* Studio Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-80 w-full rounded-md bg-[var(--surface-soft)]" />
        </div>
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-80 w-full rounded-md bg-[var(--surface-soft)]" />
        </div>
      </div>
    </div>
  );
}
