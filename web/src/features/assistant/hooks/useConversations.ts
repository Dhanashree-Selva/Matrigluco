import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { assistantApi } from "../api/assistant.api";
import { mapApiToConversation } from "../mappers/assistant.mapper";
import { AssistantConversation } from "../types/assistant.types";

export function useConversations() {
  return useQuery<AssistantConversation[], Error>({
    queryKey: queryKeys.chatbot.conversations(),
    queryFn: async ({ signal }) => {
      const records = await assistantApi.getConversations(signal);
      return (records || []).map(mapApiToConversation);
    },
    staleTime: 30_000,
  });
}
