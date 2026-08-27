import { apiRequest } from "./http/client";
import {
  ChatMessageRecord,
  ChatConversationRecord,
} from "../types/chatbot";

export const chatbotService = {
  async getConversations(signal?: AbortSignal): Promise<ChatConversationRecord[]> {
    return apiRequest<ChatConversationRecord[]>({
      url: "/chat/conversations",
      method: "GET",
      signal,
    });
  },

  async getMessages(
    conversationId: string,
    signal?: AbortSignal
  ): Promise<ChatMessageRecord[]> {
    return apiRequest<ChatMessageRecord[]>({
      url: `/chat/conversations/${conversationId}/messages`,
      method: "GET",
      signal,
    });
  },

  async sendMessage(
    conversationId: string,
    content: string,
    signal?: AbortSignal
  ): Promise<ChatMessageRecord> {
    return apiRequest<ChatMessageRecord>({
      url: `/chat/conversations/${conversationId}/messages`,
      method: "POST",
      data: { content },
      signal,
    });
  },
};
