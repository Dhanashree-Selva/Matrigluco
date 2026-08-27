import { apiClient } from "./client";

export const profilesApi = {
    async getProfile() {
        const response = await apiClient.get("/profiles/me");
        return response.data;
    },

    async updateProfile(payload) {
        const response = await apiClient.patch("/profiles/me", payload);
        return response.data;
    },
};
