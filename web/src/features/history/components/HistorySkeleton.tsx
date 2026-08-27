import { Skeleton } from "../../../shared/ui";
import { ChronicleSpine } from "./ChronicleSpine";

export function HistorySkeleton() {
  return (
    <div className="space-y-6 pt-2">
      {/* Month Header Skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
        <Skeleton className="h-4 w-32 rounded-xs" />
        <Skeleton className="h-3 w-16 rounded-xs" />
      </div>

      <ChronicleSpine>
        <div className="space-y-6">
          {/* Date group 1 */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-44 rounded-md" />
            <div className="space-y-2.5">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>

          {/* Date group 2 */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-36 rounded-md" />
            <div className="space-y-2.5">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </ChronicleSpine>
    </div>
  );
}
