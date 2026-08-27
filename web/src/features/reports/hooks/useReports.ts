import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { reportsApi } from "../api/reports.api";
import { mapApiToReportViewModel } from "../mappers/reports.mapper";
import { ReportViewModel, ReportListFilter } from "../types/reports.types";

interface UseReportsOptions {
  filter?: ReportListFilter;
  limit?: number;
}

export function useReports({ filter = "all", limit = 50 }: UseReportsOptions = {}) {
  const query = useQuery({
    queryKey: queryKeys.reports.list({ limit, filter }),
    queryFn: async ({ signal }) => {
      const items = await reportsApi.getReports({ limit }, signal);
      return items.map(mapApiToReportViewModel);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const allReports = query.data || [];

  // Filter in memory according to selected filter tab
  const filteredReports = allReports.filter((rep) => {
    if (filter === "all") return true;
    if (filter === "needs_review") return rep.reviewStatus === "needs_review";
    if (filter === "processing") return rep.processingStatus === "processing";
    if (filter === "reviewed") return rep.reviewStatus === "reviewed";
    if (filter === "failed") return rep.processingStatus === "failed";
    return true;
  });

  // Calculate status counts for filter badges
  const counts = {
    all: allReports.length,
    needs_review: allReports.filter((r) => r.reviewStatus === "needs_review").length,
    processing: allReports.filter((r) => r.processingStatus === "processing").length,
    reviewed: allReports.filter((r) => r.reviewStatus === "reviewed").length,
    failed: allReports.filter((r) => r.processingStatus === "failed").length,
  };

  return {
    ...query,
    reports: filteredReports,
    allReports,
    counts,
    hasReports: allReports.length > 0,
  };
}
