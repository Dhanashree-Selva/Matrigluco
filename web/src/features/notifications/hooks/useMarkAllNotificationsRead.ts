import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { notificationsApi } from "../api/notifications.api";
import { toast } from "../../../shared/ui";

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      queryClient.setQueriesData({ queryKey: queryKeys.notifications.all }, (old: any) => {
        if (!old || !old.items) return old;
        return {
          ...old,
          unread_count: 0,
          items: old.items.map((item: any) => ({
            ...item,
            is_read: true,
            read_at: new Date().toISOString(),
          })),
        };
      });
    },
    onError: (_err) => {
      toast.error("Failed to mark all notifications as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
