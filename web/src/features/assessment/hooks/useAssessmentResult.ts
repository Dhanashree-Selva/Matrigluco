import { useQuery } from "@tanstack/react-query";
import { assessmentApi } from "../api/assessment.api";
import { queryKeys } from "../../../query/keys";
import { AssessmentDetail, AssessmentHistoryItem } from "../types/assessment.types";
import { mapApiToAssessmentDetail, mapApiToHistoryItem } from "../mappers/assessment.mapper";

export function useAssessmentResult(id?: string) {
  const resultQuery = useQuery<AssessmentDetail>({
    queryKey: queryKeys.predictions.detail(id || ""),
    queryFn: async ({ signal }) => {
      if (!id) throw new Error("Assessment ID is required");
      const raw = await assessmentApi.getAssessmentById(id, signal);
      return mapApiToAssessmentDetail(raw);
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404 || error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const historyQuery = useQuery({
    queryKey: queryKeys.predictions.list(),
    queryFn: async ({ signal }) => {
      const res = await assessmentApi.getAssessments({ limit: 20 }, signal);
      return {
        ...res,
        items: (res?.items || []).map((item: any) => mapApiToHistoryItem(item)),
      };
    },
    staleTime: 60 * 1000,
  });

  const historyItems: AssessmentHistoryItem[] =
    historyQuery.data?.items || [];

  return {
    assessment: resultQuery.data,
    isLoading: resultQuery.isLoading,
    isError: resultQuery.isError,
    error: resultQuery.error,
    refetch: resultQuery.refetch,
    historyItems,
    isHistoryLoading: historyQuery.isLoading,
  };
}
