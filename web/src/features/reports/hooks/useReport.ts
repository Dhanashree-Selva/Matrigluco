import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { reportsApi } from "../api/reports.api";
import { mapApiToReportViewModel } from "../mappers/reports.mapper";
import { ReportViewModel } from "../types/reports.types";

export function useReport(reportId?: string) {
  return useQuery<ReportViewModel | null>({
    queryKey: queryKeys.reports.detail(reportId || ""),
    queryFn: async ({ signal }) => {
      if (!reportId) return null;
      const data = await reportsApi.getReportById(reportId, signal);
      return mapApiToReportViewModel(data);
    },
    enabled: Boolean(reportId),
    staleTime: 1000 * 60 * 2,
  });
}
