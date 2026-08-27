import { apiClient } from "./client";

export const notificationsApi = {
    async getNotifications(params = {}) {
        const response = await apiClient.get("/notifications", { params });
        return response.data;
    },

    async markAsRead(notificationId) {
        const response = await apiClient.patch(`/notifications/${notificationId}/read`);
        return response.data;
    },

    async getPreferences() {
        const response = await apiClient.get("/notifications/preferences");
        return response.data;
    },

    async updatePreferences(payload) {
        const response = await apiClient.patch("/notifications/preferences", payload);
        return response.data;
    },
};
