import { apiRequest } from "./http/client";
import {
  NotificationRecord,
  NotificationListResponse,
  NotificationPreferences,
} from "../types/notifications";

export const notificationsService = {
  async getNotifications(
    params?: { limit?: number; page?: number },
    signal?: AbortSignal
  ): Promise<NotificationListResponse> {
    return apiRequest<NotificationListResponse>({
      url: "/notifications",
      method: "GET",
      params,
      signal,
    });
  },

  async markAsRead(id: string, signal?: AbortSignal): Promise<NotificationRecord> {
    return apiRequest<NotificationRecord>({
      url: `/notifications/${id}/read`,
      method: "PATCH",
      signal,
    });
  },

  async getPreferences(signal?: AbortSignal): Promise<NotificationPreferences> {
    return apiRequest<NotificationPreferences>({
      url: "/notifications/preferences",
      method: "GET",
      signal,
    });
  },

  async updatePreferences(
    preferences: Partial<NotificationPreferences>,
    signal?: AbortSignal
  ): Promise<NotificationPreferences> {
    return apiRequest<NotificationPreferences>({
      url: "/notifications/preferences",
      method: "PUT",
      data: preferences,
      signal,
    });
  },
};
