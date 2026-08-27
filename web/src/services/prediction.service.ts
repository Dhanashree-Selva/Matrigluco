import { apiRequest } from "./http/client";
import {
  CanonicalPredictionRequest,
  PredictionRecord,
  PredictionListResponse,
} from "../types/prediction";

export const predictionService = {
  async predict(
    payload: CanonicalPredictionRequest,
    signal?: AbortSignal
  ): Promise<PredictionRecord> {
    return apiRequest<PredictionRecord>({
      url: "/predictions",
      method: "POST",
      data: payload,
      signal,
    });
  },

  async getPredictions(
    params?: { limit?: number; page?: number },
    signal?: AbortSignal
  ): Promise<PredictionListResponse> {
    return apiRequest<PredictionListResponse>({
      url: "/predictions",
      method: "GET",
      params,
      signal,
    });
  },

  async getPredictionById(
    id: string,
    signal?: AbortSignal
  ): Promise<PredictionRecord> {
    return apiRequest<PredictionRecord>({
      url: `/predictions/${id}`,
      method: "GET",
      signal,
    });
  },
};
