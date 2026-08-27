import { apiRequest } from "../../../services/http/client";
import {
  CanonicalPredictionRequest,
  PredictionRecord,
} from "../../../types/prediction";
import { AssessmentDetail, AssessmentHistoryItem } from "../types/assessment.types";

export interface PaginatedAssessmentList {
  items: AssessmentHistoryItem[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
  total?: number;
}

export const assessmentApi = {
  async evaluateRisk(
    payload: CanonicalPredictionRequest,
    signal?: AbortSignal
  ): Promise<AssessmentDetail> {
    return apiRequest<AssessmentDetail>({
      url: "/predictions",
      method: "POST",
      data: payload,
      signal,
    });
  },

  async getAssessments(
    params?: { limit?: number; page?: number },
    signal?: AbortSignal
  ): Promise<PaginatedAssessmentList> {
    return apiRequest<PaginatedAssessmentList>({
      url: "/predictions",
      method: "GET",
      params,
      signal,
    });
  },

  async getAssessmentById(
    id: string,
    signal?: AbortSignal
  ): Promise<AssessmentDetail> {
    return apiRequest<AssessmentDetail>({
      url: `/predictions/${id}`,
      method: "GET",
      signal,
    });
  },
};

