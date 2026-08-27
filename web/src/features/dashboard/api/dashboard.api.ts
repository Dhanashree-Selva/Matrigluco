import { apiRequest } from "../../../services/http/client";
import { DashboardSummaryResponseDTO } from "../types/dashboard.types";
import { UserProfile } from "../../../types/auth";

export interface DashboardApiResponse {
  summary: DashboardSummaryResponseDTO;
  user: UserProfile | null;
}

export const dashboardApi = {
  async getSummary(signal?: AbortSignal): Promise<DashboardApiResponse> {
    try {
      const [summaryRes, userRes] = await Promise.all([
        apiRequest<DashboardSummaryResponseDTO>({
          url: "/dashboard/summary",
          method: "GET",
          signal,
        }).catch(() => ({
          latest_measurements: {},
          recent_prediction: null,
          trends: { seven_day: {}, thirty_day: {} },
          measurement_counts: { total_7_days: 0, total_30_days: 0 },
          upcoming_consultation: null,
        })),
        apiRequest<UserProfile>({
          url: "/auth/me",
          method: "GET",
          signal,
        }).catch(() => null),
      ]);

      return {
        summary: summaryRes,
        user: userRes,
      };
    } catch {
      return {
        summary: {
          latest_measurements: {},
          recent_prediction: null,
          trends: { seven_day: {}, thirty_day: {} },
          measurement_counts: { total_7_days: 0, total_30_days: 0 },
          upcoming_consultation: null,
        },
        user: null,
      };
    }
  },
};
