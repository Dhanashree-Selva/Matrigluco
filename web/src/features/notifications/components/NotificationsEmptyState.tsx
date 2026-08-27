import React from "react";
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Button,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Notification02Icon,
  CheckmarkCircle02Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { SignalLensView } from "../types/notification.types";

interface NotificationsEmptyStateProps {
  view: SignalLensView;
  isFiltered: boolean;
  onClearFilters: () => void;
}

export function NotificationsEmptyState({
  view,
  isFiltered,
  onClearFilters,
}: NotificationsEmptyStateProps) {
  if (isFiltered) {
    return (
      <Empty className="p-8 sm:p-12 rounded-3xl bg-[var(--card)] border border-[var(--border)] text-center space-y-3">
        <EmptyMedia
          variant="icon"
          className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--primary)] mx-auto flex items-center justify-center"
        >
          <AppIcon icon={FilterIcon} size="md" />
        </EmptyMedia>

        <EmptyTitle className="text-sm sm:text-base font-bold text-[var(--foreground)]">
          No notifications match your filter
        </EmptyTitle>

        <EmptyDescription className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto leading-relaxed">
          There are no notifications matching the selected view or category.
        </EmptyDescription>

        <EmptyContent className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs font-semibold h-8 px-4 rounded-xl border-[var(--border)] hover:bg-[var(--accent-soft)] cursor-pointer"
          >
            Clear Filters
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (view === "unread") {
    return (
      <Empty className="p-8 sm:p-12 rounded-3xl bg-[var(--card)] border border-[var(--border)] text-center space-y-3">
        <EmptyMedia
          variant="icon"
          className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center"
        >
          <AppIcon icon={CheckmarkCircle02Icon} size="md" />
        </EmptyMedia>

        <EmptyTitle className="text-sm sm:text-base font-bold text-[var(--foreground)]">
          You're all caught up
        </EmptyTitle>

        <EmptyDescription className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto leading-relaxed">
          There are no unread care signals at this moment. You can view all historical notifications anytime.
        </EmptyDescription>

        <EmptyContent className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs font-semibold h-8 px-4 rounded-xl border-[var(--border)] hover:bg-[var(--accent-soft)] cursor-pointer"
          >
            View All Signals
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty className="p-8 sm:p-12 rounded-3xl bg-[var(--card)] border border-[var(--border)] text-center space-y-3">
      <EmptyMedia
        variant="icon"
        className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--primary)] mx-auto flex items-center justify-center"
      >
        <AppIcon icon={Notification02Icon} size="md" />
      </EmptyMedia>

      <EmptyTitle className="text-sm sm:text-base font-bold text-[var(--foreground)]">
        No notifications yet
      </EmptyTitle>

      <EmptyDescription className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto leading-relaxed">
        Important lab report processing milestones, doctor consultation reminders, and account alerts will appear here.
      </EmptyDescription>
    </Empty>
  );
}
