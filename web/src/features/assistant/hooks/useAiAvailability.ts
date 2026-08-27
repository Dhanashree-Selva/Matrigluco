import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { assistantApi } from "../api/assistant.api";
import { AiAvailabilityStatus } from "../types/assistant.types";

export interface AiAvailabilityResult {
  status: AiAvailabilityStatus;
  modelVersion?: string;
  provider?: string;
  contextLength?: number;
  isLoading: boolean;
  isReady: boolean;
  isDisabled: boolean;
}

export function useAiAvailability(): AiAvailabilityResult {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.chatbot.readiness(),
    queryFn: async ({ signal }) => {
      try {
        return await assistantApi.getReadiness(signal);
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const aiDep = data?.dependencies?.ai;
  const rawStatus = aiDep?.status?.toLowerCase();

  let status: AiAvailabilityStatus = "ready";

  if (!data && isLoading) {
    status = "loading";
  } else if (rawStatus === "disabled") {
    status = "disabled";
  } else if (rawStatus === "loading" || rawStatus === "initializing") {
    status = "loading";
  } else if (rawStatus === "unavailable" || rawStatus === "unhealthy") {
    status = "unavailable";
  } else {
    status = "ready";
  }

  return {
    status,
    modelVersion: aiDep?.model_version || "Llama-3-8B-Q4 (Local GGUF)",
    provider: aiDep?.provider || "llama_cpp",
    contextLength: aiDep?.context_length || 4096,
    isLoading,
    isReady: status === "ready",
    isDisabled: status === "disabled",
  };
}
