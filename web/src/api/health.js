import { apiClient } from "./client";

export const healthApi = {
    async createMeasurement(payload) {
        const response = await apiClient.post("/health-measurements", payload);
        return response.data;
    },

    async getMeasurements(params = {}) {
        const response = await apiClient.get("/health-measurements", { params });
        return response.data;
    },

    async getMeasurementDetail(id) {
        const response = await apiClient.get(`/health-measurements/${id}`);
        return response.data;
    },

    async updateMeasurement(id, payload) {
        const response = await apiClient.patch(`/health-measurements/${id}`, payload);
        return response.data;
    },

    async deleteMeasurement(id) {
        const response = await apiClient.delete(`/health-measurements/${id}`);
        return response.data;
    },
};
