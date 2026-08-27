import { useMutation } from "@tanstack/react-query";
import { assistantApi } from "../api/assistant.api";
import { toast } from "../../../shared/ui";

interface FeedbackArgs {
  messageId: string;
  rating: number; // 1 for helpful, -1 for unhelpful
  comment?: string;
}

export function useMessageFeedback() {
  return useMutation<{ status: string }, Error, FeedbackArgs>({
    mutationFn: async ({ messageId, rating, comment }) => {
      return await assistantApi.submitFeedback(messageId, rating, comment);
    },
    onSuccess: () => {
      toast.success("Feedback recorded", {
        description: "Thank you for helping us improve maternal health education quality.",
      });
    },
    onError: (err) => {
      toast.error("Feedback error", {
        description: err.message || "Could not record feedback.",
      });
    },
  });
}
