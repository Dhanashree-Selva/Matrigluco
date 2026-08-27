import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { assessmentApi } from "../api/assessment.api";
import { queryKeys } from "../../../query/keys";
import { toast } from "../../../shared/ui";
import { AssessmentDetail } from "../types/assessment.types";
import { CanonicalPredictionRequest } from "../../../types/prediction";

interface UseAssessmentOptions {
  onSuccess?: (result: AssessmentDetail) => void;
  onError?: (error: unknown) => void;
}

export function useAssessment(options?: UseAssessmentOptions) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: CanonicalPredictionRequest): Promise<AssessmentDetail> => {
      return assessmentApi.evaluateRisk(payload);
    },
    onSuccess: (result: AssessmentDetail) => {
      // Invalidate relevant authoritative query caches
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });

      if (options?.onSuccess) {
        options.onSuccess(result);
      } else {
        toast.success("Assessment completed", {
          description: "Your result has been saved to your history.",
        });
        navigate(`/app/assessment/${result.id}`);
      }
    },
    onError: (error: unknown) => {
      if (options?.onError) {
        options.onError(error);
      } else {
        toast.error("Assessment could not be completed", {
          description: "Review the information and try again.",
        });
      }
    },
  });
}
