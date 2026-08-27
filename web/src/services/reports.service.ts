import { apiRequest } from "./http/client";
import {
  MedicalReportRecord,
  ReportListResponse,
  ReportUploadResponse,
} from "../types/reports";

export const reportsService = {
  async getReports(
    params?: { limit?: number; page?: number },
    signal?: AbortSignal
  ): Promise<ReportListResponse> {
    return apiRequest<ReportListResponse>({
      url: "/reports",
      method: "GET",
      params,
      signal,
    });
  },

  async uploadReport(
    file: File,
    signal?: AbortSignal
  ): Promise<ReportUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest<ReportUploadResponse>({
      url: "/reports/upload",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal,
    });
  },

  async getReportById(
    id: string,
    signal?: AbortSignal
  ): Promise<MedicalReportRecord> {
    return apiRequest<MedicalReportRecord>({
      url: `/reports/${id}`,
      method: "GET",
      signal,
    });
  },
};
