import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { notificationsApi } from "../api/notifications.api";
import { toast } from "../../../shared/ui";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onMutate: async (notificationId: string) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      // Optimistically update list queries
      queryClient.setQueriesData({ queryKey: queryKeys.notifications.all }, (old: any) => {
        if (!old || !old.items) return old;
        return {
          ...old,
          unread_count: Math.max(0, (old.unread_count || 1) - 1),
          items: old.items.map((item: any) =>
            item.id === notificationId
              ? { ...item, is_read: true, read_at: new Date().toISOString() }
              : item
          ),
        };
      });
    },
    onError: (_err) => {
      toast.error("Failed to update notification state");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
