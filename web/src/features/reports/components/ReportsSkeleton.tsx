import { Skeleton } from "../../../shared/ui";

export function ReportsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-xs space-y-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-lg shrink-0 bg-[var(--surface-soft)]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 bg-[var(--surface-soft)]" />
              <Skeleton className="h-3 w-32 bg-[var(--surface-soft)]" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full bg-[var(--surface-soft)]" />
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <Skeleton className="h-4 w-56 bg-[var(--surface-soft)]" />
            <Skeleton className="h-8 w-28 rounded-md bg-[var(--surface-soft)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
