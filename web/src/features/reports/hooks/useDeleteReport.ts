import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { reportsApi } from "../api/reports.api";
import { toast } from "../../../shared/ui";

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (reportId: string) => {
      await reportsApi.deleteReport(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      toast.success("Report removed", {
        description: "The medical document was removed from your vault.",
      });
    },
    onError: (error) => {
      toast.error("Failed to remove report", {
        description: error.message || "An error occurred while deleting the report.",
      });
    },
  });
}
