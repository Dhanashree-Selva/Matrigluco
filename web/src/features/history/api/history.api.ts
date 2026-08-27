import { apiRequest } from "../../../services/http/client";
import { HistoryListDto } from "../types/history.types";

export interface GetHistoryParams {
  types?: string; // Comma separated: "assessment,measurement,report,consultation"
  date_from?: string;
  date_to?: string;
  month?: string; // "YYYY-MM"
  page?: number;
  page_size?: number;
}

export const historyApi = {
  async getHistory(
    params?: GetHistoryParams,
    signal?: AbortSignal
  ): Promise<HistoryListDto> {
    return apiRequest<HistoryListDto>({
      url: "/history",
      method: "GET",
      params,
      signal,
    });
  },
};
