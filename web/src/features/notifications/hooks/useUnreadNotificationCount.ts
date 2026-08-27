import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { notificationsApi } from "../api/notifications.api";

export function useUnreadNotificationCount() {
  const query = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: ({ signal }) => notificationsApi.getNotifications({ page: 1, pageSize: 1 }, signal),
    staleTime: 30_000,
    refetchInterval: 60_000, // Background sync every 60 seconds
  });

  return {
    unreadCount: query.data?.unread_count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
