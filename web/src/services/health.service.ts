import { apiRequest } from "./http/client";
import {
  HealthMeasurementCreate,
  HealthMeasurementRecord,
  HealthListResponse,
} from "../types/health";

export const healthService = {
  async getMeasurements(
    params?: { metric_type?: string; limit?: number; page?: number },
    signal?: AbortSignal
  ): Promise<HealthListResponse> {
    return apiRequest<HealthListResponse>({
      url: "/health",
      method: "GET",
      params,
      signal,
    });
  },

  async logMeasurement(
    payload: HealthMeasurementCreate,
    signal?: AbortSignal
  ): Promise<HealthMeasurementRecord> {
    return apiRequest<HealthMeasurementRecord>({
      url: "/health",
      method: "POST",
      data: payload,
      signal,
    });
  },

  async deleteMeasurement(id: string, signal?: AbortSignal): Promise<void> {
    return apiRequest<void>({
      url: `/health/${id}`,
      method: "DELETE",
      signal,
    });
  },
};
