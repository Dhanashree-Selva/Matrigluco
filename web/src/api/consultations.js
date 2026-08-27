import { apiClient } from "./client";

export const consultationsApi = {
    async createConsultation(payload) {
        const response = await apiClient.post("/consultations", payload);
        return response.data;
    },

    async getConsultations(params = {}) {
        const response = await apiClient.get("/consultations", { params });
        return response.data;
    },

    async getConsultationDetail(id) {
        const response = await apiClient.get(`/consultations/${id}`);
        return response.data;
    },

    async updateConsultation(id, payload) {
        const response = await apiClient.patch(`/consultations/${id}`, payload);
        return response.data;
    },

    async deleteConsultation(id) {
        const response = await apiClient.delete(`/consultations/${id}`);
        return response.data;
    },
};
