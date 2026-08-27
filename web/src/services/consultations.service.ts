import { apiRequest } from "./http/client";
import {
  ConsultationRecord,
  ConsultationCreate,
  ConsultationListResponse,
} from "../types/consultations";

export const consultationsService = {
  async getConsultations(
    params?: { limit?: number; page?: number },
    signal?: AbortSignal
  ): Promise<ConsultationListResponse> {
    return apiRequest<ConsultationListResponse>({
      url: "/consultations",
      method: "GET",
      params,
      signal,
    });
  },

  async bookConsultation(
    payload: ConsultationCreate,
    signal?: AbortSignal
  ): Promise<ConsultationRecord> {
    return apiRequest<ConsultationRecord>({
      url: "/consultations",
      method: "POST",
      data: payload,
      signal,
    });
  },

  async cancelConsultation(
    id: string,
    signal?: AbortSignal
  ): Promise<ConsultationRecord> {
    return apiRequest<ConsultationRecord>({
      url: `/consultations/${id}/cancel`,
      method: "POST",
      signal,
    });
  },
};
