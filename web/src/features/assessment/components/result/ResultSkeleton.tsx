import { Skeleton } from "../../../../shared/ui";

export function ResultSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 rounded-md bg-[var(--muted)]" />
          <Skeleton className="h-8 w-64 rounded-md bg-[var(--muted)]" />
          <Skeleton className="h-3 w-48 rounded-md bg-[var(--muted)]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md bg-[var(--muted)]" />
          <Skeleton className="h-8 w-28 rounded-md bg-[var(--muted)]" />
        </div>
      </div>

      {/* Result Studio Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Horizon Skeleton */}
        <div className="lg:col-span-8 p-6 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-6">
          <Skeleton className="h-5 w-40 rounded-md bg-[var(--muted)]" />
          <Skeleton className="h-10 w-3/4 rounded-md bg-[var(--muted)]" />
          <Skeleton className="h-20 w-full rounded-md bg-[var(--muted)]" />
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <Skeleton className="h-10 w-full rounded-md bg-[var(--muted)]" />
            <Skeleton className="h-10 w-full rounded-md bg-[var(--muted)]" />
            <Skeleton className="h-10 w-full rounded-md bg-[var(--muted)]" />
          </div>
          <Skeleton className="h-14 w-full rounded-md bg-[var(--muted)]" />
        </div>

        {/* Right Evidence Lens Skeleton */}
        <div className="lg:col-span-4 p-6 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-4">
          <Skeleton className="h-6 w-32 rounded-md bg-[var(--muted)]" />
          <Skeleton className="h-16 w-full rounded-md bg-[var(--muted)]" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-8 w-full rounded-md bg-[var(--muted)]" />
            <Skeleton className="h-8 w-full rounded-md bg-[var(--muted)]" />
            <Skeleton className="h-8 w-full rounded-md bg-[var(--muted)]" />
            <Skeleton className="h-8 w-full rounded-md bg-[var(--muted)]" />
          </div>
        </div>
      </div>

      {/* Historical Trajectory Skeleton */}
      <div className="p-6 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-4">
        <Skeleton className="h-5 w-44 rounded-md bg-[var(--muted)]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-md bg-[var(--muted)]" />
          <Skeleton className="h-24 w-full rounded-md bg-[var(--muted)]" />
        </div>
      </div>

      {/* Care Path Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-28 w-full rounded-md bg-[var(--muted)]" />
        <Skeleton className="h-28 w-full rounded-md bg-[var(--muted)]" />
        <Skeleton className="h-28 w-full rounded-md bg-[var(--muted)]" />
        <Skeleton className="h-28 w-full rounded-md bg-[var(--muted)]" />
      </div>
    </div>
  );
}
