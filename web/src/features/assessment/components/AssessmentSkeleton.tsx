import { Skeleton } from "../../../shared/ui";

export function AssessmentSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse py-2">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded-md bg-[var(--surface-soft)]" />
        <Skeleton className="h-8 w-72 rounded-md bg-[var(--surface-soft)]" />
        <Skeleton className="h-4 w-96 rounded-md bg-[var(--surface-soft)]" />
      </div>

      {/* 3-Column Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Rail */}
        <div className="lg:col-span-3 space-y-3">
          <Skeleton className="h-64 w-full rounded-md bg-[var(--surface-soft)]" />
        </div>

        {/* Center Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <Skeleton className="h-10 w-full rounded-md bg-[var(--surface-soft)]" />
          <Skeleton className="h-24 w-full rounded-md bg-[var(--surface-soft)]" />
          <Skeleton className="h-24 w-full rounded-md bg-[var(--surface-soft)]" />
          <Skeleton className="h-12 w-full rounded-md bg-[var(--surface-soft)]" />
        </div>

        {/* Right Rail */}
        <div className="hidden lg:block lg:col-span-3 space-y-3">
          <Skeleton className="h-72 w-full rounded-md bg-[var(--surface-soft)]" />
        </div>
      </div>
    </div>
  );
}
