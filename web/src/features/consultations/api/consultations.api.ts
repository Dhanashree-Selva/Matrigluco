import { apiRequest } from "../../../services/http/client";
import {
  ConsultationCreatePayload,
  ConsultationUpdatePayload,
} from "../types/consultation.types";
import { RawAppointmentApiItem } from "../mappers/consultation.mapper";

export const consultationsApi = {
  /**
   * Retrieves current authenticated user's consultations.
   */
  async getConsultations(
    limit: number = 50,
    signal?: AbortSignal
  ): Promise<RawAppointmentApiItem[]> {
    return apiRequest<RawAppointmentApiItem[]>({
      url: "/consultations",
      method: "GET",
      params: { limit },
      signal,
    });
  },

  /**
   * Retrieves single owned consultation detail by ID.
   */
  async getConsultation(
    id: string,
    signal?: AbortSignal
  ): Promise<RawAppointmentApiItem> {
    return apiRequest<RawAppointmentApiItem>({
      url: `/consultations/${id}`,
      method: "GET",
      signal,
    });
  },

  /**
   * Books a new consultation for the authenticated user.
   */
  async bookConsultation(
    payload: ConsultationCreatePayload,
    signal?: AbortSignal
  ): Promise<RawAppointmentApiItem> {
    return apiRequest<RawAppointmentApiItem>({
      url: "/consultations",
      method: "POST",
      data: payload,
      signal,
    });
  },

  /**
   * Updates or reschedules an existing consultation.
   */
  async updateConsultation(
    id: string,
    payload: ConsultationUpdatePayload,
    signal?: AbortSignal
  ): Promise<RawAppointmentApiItem> {
    return apiRequest<RawAppointmentApiItem>({
      url: `/consultations/${id}`,
      method: "PATCH",
      data: payload,
      signal,
    });
  },

  /**
   * Cancels/deletes an owned consultation.
   */
  async cancelConsultation(
    id: string,
    signal?: AbortSignal
  ): Promise<void> {
    return apiRequest<void>({
      url: `/consultations/${id}`,
      method: "DELETE",
      signal,
    });
  },
};
