import React from "react";
import { useNotifications } from "../hooks/useNotifications";
import { useNotificationFilters } from "../hooks/useNotificationFilters";
import { useMarkNotificationRead } from "../hooks/useMarkNotificationRead";
import { useMarkAllNotificationsRead } from "../hooks/useMarkAllNotificationsRead";
import { NotificationsHeader } from "../components/NotificationsHeader";
import { ActionHorizon } from "../components/ActionHorizon";
import { SignalLens } from "../components/SignalLens";
import { SignalStream } from "../components/SignalStream";
import { SignalContext } from "../components/SignalContext";
import { NotificationsSkeleton } from "../components/NotificationsSkeleton";
import { Alert, AlertTitle, AlertDescription, Button } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";

export function NotificationsPage() {
  const { filters, setView, setCategory, resetFilters, isFiltered } =
    useNotificationFilters();

  const {
    notifications,
    actionHorizonItems,
    signalDateGroups,
    unreadCount,
    total,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useNotifications(filters);

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-16 space-y-6">
        <NotificationsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        <Alert variant="destructive" className="border-rose-500/30 bg-rose-500/10">
          <AppIcon icon={AlertCircleIcon} size="sm" className="text-rose-500 mt-0.5" />
          <div className="space-y-1">
            <AlertTitle className="text-sm font-bold text-[var(--foreground)]">
              Unable to load care notifications
            </AlertTitle>
            <AlertDescription className="text-xs text-[var(--muted-foreground)]">
              {(error as Error)?.message || "A network error prevented loading notifications."}
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 text-xs font-semibold gap-1.5 border-[var(--border)]"
            >
              <AppIcon icon={RefreshIcon} size="xs" className={isFetching ? "animate-spin" : ""} />
              <span>Try again</span>
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-16 space-y-6">
      {/* Header */}
      <NotificationsHeader unreadCount={unreadCount} />

      {/* Action Horizon (1-3 prioritized items) */}
      <ActionHorizon
        items={actionHorizonItems}
        onMarkRead={handleMarkRead}
      />

      {/* Signal Lens Filters */}
      <SignalLens
        view={filters.view}
        category={filters.category}
        unreadCount={unreadCount}
        onViewChange={setView}
        onCategoryChange={setCategory}
        onMarkAllRead={handleMarkAllRead}
        isMarkingAllRead={markAllReadMutation.isPending}
      />

      {/* Main Signal Stream & Desktop Signal Context Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <main className="lg:col-span-8 min-w-0">
          <SignalStream
            groups={signalDateGroups}
            onMarkRead={handleMarkRead}
            view={filters.view}
            isFiltered={isFiltered}
            onClearFilters={resetFilters}
          />
        </main>

        <div className="lg:col-span-4 hidden lg:block">
          <SignalContext
            notifications={notifications}
            unreadCount={unreadCount}
          />
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
