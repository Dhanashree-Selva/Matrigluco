import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { assistantApi } from "../api/assistant.api";
import { mapApiToMessage } from "../mappers/assistant.mapper";
import { AssistantMessage } from "../types/assistant.types";

export function useConversation(conversationId?: string | null) {
  return useQuery<AssistantMessage[], Error>({
    queryKey: queryKeys.chatbot.messages(conversationId || ""),
    queryFn: async ({ signal }) => {
      if (!conversationId) return [];
      const rawMessages = await assistantApi.getMessages(conversationId, signal);
      return (rawMessages || []).map(mapApiToMessage);
    },
    enabled: Boolean(conversationId),
    staleTime: 60_000,
  });
}
