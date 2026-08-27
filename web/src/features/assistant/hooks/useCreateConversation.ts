import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { assistantApi } from "../api/assistant.api";
import { mapApiToConversation } from "../mappers/assistant.mapper";
import { AssistantConversation } from "../types/assistant.types";

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation<AssistantConversation, Error, string | undefined>({
    mutationFn: async (title = "Maternal Health Guidance") => {
      const created = await assistantApi.createConversation(title);
      return mapApiToConversation(created);
    },
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatbot.conversations() });
    },
  });
}
