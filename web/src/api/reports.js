import { apiClient, API_BASE_URL, getStoredToken } from "./client";

export const reportsApi = {
    async uploadReport(file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post("/reports/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    async getReportTaskStatus(jobId) {
        const response = await apiClient.get(`/tasks/${jobId}`);
        return response.data;
    },

    async getReports(params = {}) {
        const response = await apiClient.get("/reports", { params });
        return response.data;
    },

    async getReportDetail(reportId) {
        const response = await apiClient.get(`/reports/${reportId}`);
        return response.data;
    },

    async downloadReportFile(reportId) {
        const response = await apiClient.get(`/reports/${reportId}/file`, {
            responseType: "blob",
        });
        return response.data;
    },

    async deleteReport(reportId) {
        const response = await apiClient.delete(`/reports/${reportId}`);
        return response.data;
    },

    async downloadFileAsset(fileId) {
        const response = await apiClient.get(`/files/${fileId}/download`, {
            responseType: "blob",
        });
        return response.data;
    },
};
