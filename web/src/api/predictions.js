import { apiClient } from "./client";

export const predictionsApi = {
    async createPrediction(data) {
        // Canonical 8-feature mapping
        const payload = {
            glucose: Number(data.glucose),
            blood_pressure: Number(data.blood_pressure || data.bloodPressure || 80),
            skin_thickness: Number(data.skin_thickness || data.skinThickness || 20),
            insulin: Number(data.insulin || 80),
            bmi: Number(data.bmi || 25),
            diabetes_pedigree_function: Number(data.diabetes_pedigree_function || data.diabetesPedigree || 0.5),
            age: Number(data.age || 28),
            pregnancies: Number(data.pregnancies !== undefined ? data.pregnancies : 1),
            pregnancy_week: data.pregnancy_week ? Number(data.pregnancy_week) : undefined,
        };

        const response = await apiClient.post("/predictions", payload);
        return response.data;
    },

    async getPredictions(params = {}) {
        const response = await apiClient.get("/predictions", { params });
        return response.data;
    },

    async getPredictionDetail(predictionId) {
        const response = await apiClient.get(`/predictions/${predictionId}`);
        return response.data;
    },

    async deletePrediction(predictionId) {
        const response = await apiClient.delete(`/predictions/${predictionId}`);
        return response.data;
    },
};
