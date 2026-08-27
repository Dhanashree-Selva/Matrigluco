import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import { mapDashboardData } from "../mappers/dashboard.mapper";
import { queryKeys } from "../../../query/keys";
import { calculatePregnancyWeek } from "../../../lib/dates";

export function useDashboard(period: "7d" | "30d" = "7d", selectedMetric: string = "glucose") {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(period),
    queryFn: async ({ signal }) => {
      const { summary, user } = await dashboardApi.getSummary(signal);
      const rawWeek = calculatePregnancyWeek(
        user?.due_date || user?.expected_due_date || user?.user_metadata?.expected_due_date
      );
      const pregnancyWeek =
        typeof rawWeek === "number" && rawWeek > 0
          ? rawWeek
          : typeof rawWeek === "string" && !isNaN(Number(rawWeek)) && Number(rawWeek) > 0
          ? Number(rawWeek)
          : null;

      return mapDashboardData(summary, user, pregnancyWeek, selectedMetric, period);
    },
    staleTime: 60 * 1000, // 1 minute fresh time
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
