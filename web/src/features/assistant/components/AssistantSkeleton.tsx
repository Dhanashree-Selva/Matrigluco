import React from "react";
import { Skeleton } from "../../../shared/ui";

export function AssistantSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6 max-w-3xl mx-auto w-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      {/* Message 1: User */}
      <div className="flex justify-end">
        <Skeleton className="h-14 w-3/4 sm:w-1/2 rounded-2xl" />
      </div>

      {/* Message 2: Assistant */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-16 w-5/6 rounded-xl" />
      </div>

      {/* Message 3: User */}
      <div className="flex justify-end pt-4">
        <Skeleton className="h-12 w-2/3 sm:w-1/3 rounded-2xl" />
      </div>

      {/* Message 4: Assistant */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}
