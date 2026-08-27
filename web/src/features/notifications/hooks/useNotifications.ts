import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { notificationsApi } from "../api/notifications.api";
import { mapNotificationDtoToViewModel } from "../mappers/notification.mapper";
import {
  bundleEpisodeNotifications,
  groupSignalsByDate,
} from "../utils/notification-groups";
import {
  NotificationFilterState,
  NotificationViewModel,
  SignalDateGroupModel,
} from "../types/notification.types";
import { useMemo } from "react";

export function useNotifications(filters: NotificationFilterState) {
  const apiQueryFilters = useMemo(() => {
    return {
      isRead: filters.view === "unread" ? false : undefined,
      page: filters.page || 1,
      pageSize: filters.pageSize || 50,
    };
  }, [filters.view, filters.page, filters.pageSize]);

  const query = useQuery({
    queryKey: queryKeys.notifications.list(apiQueryFilters),
    queryFn: ({ signal }) => notificationsApi.getNotifications(apiQueryFilters, signal),
    staleTime: 30_000,
  });

  const allNotifications = useMemo<NotificationViewModel[]>(() => {
    if (!query.data?.items) return [];
    return query.data.items.map(mapNotificationDtoToViewModel);
  }, [query.data?.items]);

  // Apply in-memory Signal Lens filters (category + actionable view)
  const filteredNotifications = useMemo<NotificationViewModel[]>(() => {
    return allNotifications.filter((notif) => {
      // Filter by category
      if (filters.category && filters.category !== "all") {
        if (notif.category !== filters.category) return false;
      }

      // Filter by view
      if (filters.view === "unread" && notif.isRead) return false;
      if (filters.view === "actionable" && !notif.isActionable) return false;

      return true;
    });
  }, [allNotifications, filters.category, filters.view]);

  // Action Horizon: Up to 2-3 highest priority actionable notifications that need attention
  const actionHorizonItems = useMemo<NotificationViewModel[]>(() => {
    return allNotifications
      .filter((notif) => notif.isActionable && !notif.isRead)
      .slice(0, 3);
  }, [allNotifications]);

  // Date grouped & episode bundled Signal Stream
  const signalDateGroups = useMemo<SignalDateGroupModel[]>(() => {
    const bundled = bundleEpisodeNotifications(filteredNotifications);
    return groupSignalsByDate(bundled);
  }, [filteredNotifications]);

  return {
    ...query,
    notifications: filteredNotifications,
    rawCount: allNotifications.length,
    actionHorizonItems,
    signalDateGroups,
    unreadCount: query.data?.unread_count ?? 0,
    total: query.data?.total ?? 0,
  };
}
