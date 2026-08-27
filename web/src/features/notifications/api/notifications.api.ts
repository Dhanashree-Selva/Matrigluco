import { apiRequest } from "../../../services/http/client";
import {
  NotificationListDto,
  RawNotificationDto,
  NotificationCategory,
} from "../types/notification.types";

export interface NotificationQueryFilters {
  isRead?: boolean;
  notificationType?: string;
  category?: NotificationCategory;
  page?: number;
  pageSize?: number;
}

export const notificationsApi = {
  /**
   * Fetches paginated patient notifications from MySQL.
   */
  async getNotifications(
    filters: NotificationQueryFilters = {},
    signal?: AbortSignal
  ): Promise<NotificationListDto> {
    const params: Record<string, unknown> = {
      page: filters.page || 1,
      page_size: filters.pageSize || 30,
    };

    if (filters.isRead !== undefined) {
      params.is_read = filters.isRead;
    }

    if (filters.notificationType) {
      params.notification_type = filters.notificationType;
    }

    return apiRequest<NotificationListDto>({
      url: "/notifications",
      method: "GET",
      params,
      signal,
    });
  },

  /**
   * Marks a single owned notification as read.
   */
  async markAsRead(
    notificationId: string,
    signal?: AbortSignal
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>({
      url: `/notifications/${encodeURIComponent(notificationId)}/read`,
      method: "PATCH",
      signal,
    });
  },

  /**
   * Marks all unread inbox notifications as read.
   */
  async markAllAsRead(signal?: AbortSignal): Promise<{ message: string }> {
    return apiRequest<{ message: string }>({
      url: "/notifications/read-all",
      method: "PATCH",
      signal,
    });
  },
};
