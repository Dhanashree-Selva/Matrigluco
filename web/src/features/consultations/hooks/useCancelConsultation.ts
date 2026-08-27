import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { consultationsApi } from "../api/consultations.api";
import { CONSULTATIONS_QUERY_KEYS } from "./useConsultations";

export function useCancelConsultation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (consultationId: string) => {
      await consultationsApi.cancelConsultation(consultationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });

      toast.success("Consultation Cancelled", {
        description: "The appointment has been removed from your active care schedule.",
      });
    },
    onError: (err) => {
      toast.error("Unable to cancel consultation", {
        description: err.message || "Please check your network and try again.",
      });
    },
  });
}
