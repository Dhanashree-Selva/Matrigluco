import { Skeleton } from "../../../../shared/ui";

export function ReportDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-4 border-b border-[var(--border-subtle)]">
        <Skeleton className="h-4 w-36 bg-[var(--surface-soft)]" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-64 bg-[var(--surface-soft)]" />
            <Skeleton className="h-3 w-44 bg-[var(--surface-soft)]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 bg-[var(--surface-soft)]" />
            <Skeleton className="h-8 w-20 bg-[var(--surface-soft)]" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Skeleton className="h-[480px] w-full rounded-xl bg-[var(--surface-soft)]" />
        </div>
        <div className="lg:col-span-5 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl bg-[var(--surface-soft)]" />
          <Skeleton className="h-40 w-full rounded-xl bg-[var(--surface-soft)]" />
        </div>
      </div>
    </div>
  );
}
