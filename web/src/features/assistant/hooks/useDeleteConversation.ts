import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { assistantApi } from "../api/assistant.api";
import { toast } from "../../../shared/ui";

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (conversationId: string) => {
      await assistantApi.deleteConversation(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatbot.conversations() });
      toast.success("Conversation deleted", {
        description: "The conversation has been removed from your saved records.",
      });
    },
    onError: (err) => {
      toast.error("Deletion failed", {
        description: err.message || "Could not delete conversation.",
      });
    },
  });
}
