import { apiRequest } from "../../../services/http/client";
import {
  RawReportApiItem,
  UploadFileAssetResponse,
  UpdateReportExtractionPayload,
} from "../types/reports.types";

export const reportsApi = {
  /**
   * Retrieves list of medical reports for authenticated patient.
   */
  async getReports(
    params?: { limit?: number; page?: number },
    signal?: AbortSignal
  ): Promise<RawReportApiItem[]> {
    return apiRequest<RawReportApiItem[]>({
      url: "/reports",
      method: "GET",
      params,
      signal,
    });
  },

  /**
   * Retrieves single owned medical report detail.
   */
  async getReportById(
    reportId: string,
    signal?: AbortSignal
  ): Promise<RawReportApiItem> {
    return apiRequest<RawReportApiItem>({
      url: `/reports/${reportId}`,
      method: "GET",
      signal,
    });
  },

  /**
   * Uploads file to private healthcare storage with content signature validation.
   */
  async uploadPrivateFile(
    file: File,
    signal?: AbortSignal
  ): Promise<UploadFileAssetResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest<UploadFileAssetResponse>({
      url: "/files/upload",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal,
    });
  },

  /**
   * Creates a medical report record linking to the uploaded private file.
   */
  async saveReport(
    payload: {
      file_name?: string;
      file_url?: string;
      extracted_values?: Record<string, any>;
      prediction_result?: string;
      risk_level?: string;
    },
    signal?: AbortSignal
  ): Promise<RawReportApiItem> {
    return apiRequest<RawReportApiItem>({
      url: "/reports",
      method: "POST",
      data: payload,
      signal,
    });
  },

  /**
   * Updates an owned medical report's extracted biomarkers and review state.
   */
  async updateReport(
    reportId: string,
    payload: UpdateReportExtractionPayload,
    signal?: AbortSignal
  ): Promise<RawReportApiItem> {
    return apiRequest<RawReportApiItem>({
      url: `/reports/${reportId}`,
      method: "PATCH",
      data: payload,
      signal,
    });
  },

  /**
   * Deletes an owned medical report record.
   */
  async deleteReport(reportId: string, signal?: AbortSignal): Promise<void> {
    return apiRequest<void>({
      url: `/reports/${reportId}`,
      method: "DELETE",
      signal,
    });
  },

  /**
   * Downloads authorized private file stream as binary blob with no-store caching.
   */
  async downloadPrivateFileBlob(
    fileId: string,
    signal?: AbortSignal
  ): Promise<Blob> {
    return apiRequest<Blob>({
      url: `/files/${fileId}/download`,
      method: "GET",
      responseType: "blob",
      signal,
    });
  },

  /**
   * Downloads high-fidelity clinical PDF generated via Jinja2 HTML/CSS templates.
   */
  async downloadReportPdfBlob(
    reportId: string,
    signal?: AbortSignal
  ): Promise<Blob> {
    return apiRequest<Blob>({
      url: `/reports/${reportId}/pdf`,
      method: "GET",
      responseType: "blob",
      signal,
    });
  },
};
