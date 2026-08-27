import { apiRequest } from "../../../services/http/client";
import {
  HealthMeasurementApiItem,
  HealthMeasurementListApiResponse,
  MeasurementCreateDto,
} from "../types/tracking.types";

export interface ListMeasurementsParams {
  metric_type?: string;
  date_from?: string;
  date_to?: string;
  pregnancy_profile_id?: string;
  page?: number;
  page_size?: number;
}

export const trackingApi = {
  async listMeasurements(
    params?: ListMeasurementsParams,
    signal?: AbortSignal
  ): Promise<HealthMeasurementListApiResponse> {
    return apiRequest<HealthMeasurementListApiResponse>({
      url: "/health-measurements",
      method: "GET",
      params,
      signal,
    });
  },

  async getMeasurement(
    id: string,
    signal?: AbortSignal
  ): Promise<HealthMeasurementApiItem> {
    return apiRequest<HealthMeasurementApiItem>({
      url: `/health-measurements/${id}`,
      method: "GET",
      signal,
    });
  },

  async createMeasurement(
    payload: MeasurementCreateDto,
    signal?: AbortSignal
  ): Promise<HealthMeasurementApiItem> {
    return apiRequest<HealthMeasurementApiItem>({
      url: "/health-measurements",
      method: "POST",
      data: payload,
      signal,
    });
  },

  async updateMeasurement(
    id: string,
    payload: Partial<MeasurementCreateDto>,
    signal?: AbortSignal
  ): Promise<HealthMeasurementApiItem> {
    return apiRequest<HealthMeasurementApiItem>({
      url: `/health-measurements/${id}`,
      method: "PATCH",
      data: payload,
      signal,
    });
  },

  async deleteMeasurement(id: string, signal?: AbortSignal): Promise<void> {
    return apiRequest<void>({
      url: `/health-measurements/${id}`,
      method: "DELETE",
      signal,
    });
  },

  // Compatibility aliases for legacy callers
  async getReadings(
    params?: { metric_type?: string; limit?: number; page?: number },
    signal?: AbortSignal
  ) {
    const res = await this.listMeasurements(
      {
        metric_type: params?.metric_type,
        page: params?.page,
        page_size: params?.limit,
      },
      signal
    );
    return {
      items: res.items,
      total: res.total,
    };
  },

  async addReading(payload: any, signal?: AbortSignal) {
    return this.createMeasurement(payload, signal);
  },

  async deleteReading(id: string, signal?: AbortSignal) {
    return this.deleteMeasurement(id, signal);
  },
};
