import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { reportsApi } from "../api/reports.api";
import { toast } from "../../../shared/ui";
import { ReportViewModel } from "../types/reports.types";
import { mapApiToReportViewModel } from "../mappers/reports.mapper";

interface ReviewReportArgs {
  reportId: string;
  updatedExtractedValues: Record<string, any>;
  markAsReviewed?: boolean;
}

export function useReviewReport() {
  const queryClient = useQueryClient();

  return useMutation<ReportViewModel, Error, ReviewReportArgs>({
    mutationFn: async ({ reportId, updatedExtractedValues, markAsReviewed = true }) => {
      const payloadValues = {
        ...updatedExtractedValues,
        ...(markAsReviewed ? { _is_reviewed: true, _reviewed_at: new Date().toISOString() } : {}),
      };

      const updated = await reportsApi.updateReport(reportId, {
        extracted_values: payloadValues,
      });

      return mapApiToReportViewModel(updated);
    },
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.detail(updatedReport.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });

      toast.success("Report review saved", {
        description: "Extracted biomarkers have been verified and updated.",
      });
    },
    onError: (error) => {
      toast.error("Failed to save review", {
        description: error.message || "An error occurred while updating the report.",
      });
    },
  });
}
