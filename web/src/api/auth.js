import { apiClient, setSessionData, clearSessionData, getStoredToken, getStoredUser } from "./client";

export const authApi = {
    async login(email, password) {
        const response = await apiClient.post("/auth/login", { email, password });
        const { access_token, refresh_token, user } = response.data;
        setSessionData(access_token, refresh_token, user);
        return { user, access_token };
    },

    async register({ email, password, full_name = "", pregnancy_week = null, due_date = null }) {
        const response = await apiClient.post("/auth/register", {
            email,
            password,
            full_name,
            pregnancy_week: pregnancy_week ? Number(pregnancy_week) : null,
            due_date: due_date || null,
        });
        const { access_token, refresh_token, user } = response.data;
        setSessionData(access_token, refresh_token, user);
        return { user, access_token };
    },

    async logout() {
        try {
            await apiClient.post("/auth/logout");
        } catch (err) {
            console.warn("Backend logout notification failed:", err);
        } finally {
            clearSessionData();
        }
    },

    async logoutAll() {
        try {
            await apiClient.post("/auth/logout-all");
        } finally {
            clearSessionData();
        }
    },

    async getCurrentUser() {
        const token = getStoredToken();
        if (!token) return null;
        try {
            const response = await apiClient.get("/profiles/me");
            const user = response.data;
            setSessionData(token, null, user);
            return user;
        } catch {
            return getStoredUser();
        }
    },

    async forgotPassword(email) {
        const response = await apiClient.post("/auth/forgot-password", { email });
        return response.data;
    },

    async resetPassword(token, new_password) {
        const response = await apiClient.post("/auth/reset-password", { token, new_password });
        return response.data;
    },
};
