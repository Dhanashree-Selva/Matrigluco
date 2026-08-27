import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { toast } from "../../../shared/ui";
import { trackingApi } from "../api/tracking.api";

export function useDeleteMeasurement(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return trackingApi.deleteMeasurement(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.health.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.health.all, type: "active" });
      await queryClient.refetchQueries({ queryKey: queryKeys.dashboard.all, type: "active" });

      toast.success("Reading removed", {
        description: "Measurement has been removed from your history.",
      });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not delete reading. Please try again.";
      toast.error("Unable to delete reading", {
        description: msg,
      });
    },
  });
}
