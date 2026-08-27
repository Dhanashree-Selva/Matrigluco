import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { reportsApi } from "../api/reports.api";
import { toast } from "../../../shared/ui";
import { ReportViewModel } from "../types/reports.types";
import { mapApiToReportViewModel } from "../mappers/reports.mapper";

interface UploadReportArgs {
  file: File;
  onProgress?: (percent: number) => void;
}

export function useUploadReport() {
  const queryClient = useQueryClient();

  return useMutation<ReportViewModel, Error, UploadReportArgs>({
    mutationFn: async ({ file }) => {
      // 1. Upload private file asset to authenticated storage
      const asset = await reportsApi.uploadPrivateFile(file);

      // 2. Save medical report record - backend will auto-extract real values from PDF/OCR
      const report = await reportsApi.saveReport({
        file_name: file.name,
        file_url: asset.id,
      });

      return mapApiToReportViewModel(report);
    },
    onSuccess: (savedReport) => {
      // Invalidate queries so lists update immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      toast.success("Medical report uploaded", {
        description: `"${savedReport.originalFilename}" is securely stored in your private vault.`,
      });
    },
    onError: (error) => {
      toast.error("Upload failed", {
        description:
          error.message ||
          "Could not upload medical report. Please check file format and try again.",
      });
    },
  });
}
