import React from "react";
import { Skeleton } from "../../../shared/ui";

export function NotificationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading Notifications">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl self-start" />
      </div>

      {/* Signal Lens Skeleton */}
      <Skeleton className="h-12 w-full rounded-2xl" />

      {/* Action Horizon Skeleton */}
      <Skeleton className="h-36 w-full rounded-3xl" />

      {/* Stream Skeleton */}
      <div className="space-y-4 pt-2">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}
