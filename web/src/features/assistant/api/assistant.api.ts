import { apiRequest } from "../../../services/http/client";

export interface RawConversationApiItem {
  id: string;
  user_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RawMessageApiItem {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  tokens_used?: number;
  latency_ms?: number;
  sources?: string[];
  created_at: string;
}

export interface RawReadinessResponse {
  status: string;
  dependencies: {
    database?: { status: string };
    redis?: { status: string };
    storage?: { status: string };
    ml?: { status: string };
    ai?: {
      status: string;
      provider?: string;
      model_version?: string;
      context_length?: number;
    };
  };
}

export const assistantApi = {
  /**
   * Lists all chat conversations for authenticated patient.
   */
  async getConversations(signal?: AbortSignal): Promise<RawConversationApiItem[]> {
    return apiRequest<RawConversationApiItem[]>({
      url: "/chatbot/conversations",
      method: "GET",
      signal,
    });
  },

  /**
   * Retrieves single conversation session metadata.
   */
  async getConversation(
    conversationId: string,
    signal?: AbortSignal
  ): Promise<RawConversationApiItem> {
    return apiRequest<RawConversationApiItem>({
      url: `/chatbot/conversations/${conversationId}`,
      method: "GET",
      signal,
    });
  },

  /**
   * Initializes a new maternal health guidance session.
   */
  async createConversation(
    title: string = "Maternal Health Guidance",
    signal?: AbortSignal
  ): Promise<RawConversationApiItem> {
    return apiRequest<RawConversationApiItem>({
      url: "/chatbot/conversations",
      method: "POST",
      data: { title },
      signal,
    });
  },

  /**
   * Updates conversation title or archived status.
   */
  async updateConversation(
    conversationId: string,
    payload: { title?: string; status?: string },
    signal?: AbortSignal
  ): Promise<RawConversationApiItem> {
    return apiRequest<RawConversationApiItem>({
      url: `/chatbot/conversations/${conversationId}`,
      method: "PATCH",
      data: payload,
      signal,
    });
  },

  /**
   * Deletes a conversation session from MySQL.
   */
  async deleteConversation(
    conversationId: string,
    signal?: AbortSignal
  ): Promise<void> {
    return apiRequest<void>({
      url: `/chatbot/conversations/${conversationId}`,
      method: "DELETE",
      signal,
    });
  },

  /**
   * Retrieves messages for an authorized conversation session.
   */
  async getMessages(
    conversationId: string,
    signal?: AbortSignal
  ): Promise<RawMessageApiItem[]> {
    return apiRequest<RawMessageApiItem[]>({
      url: `/chatbot/conversations/${conversationId}/messages`,
      method: "GET",
      signal,
    });
  },

  /**
   * Non-streaming fallback message submission.
   */
  async sendMessage(
    conversationId: string,
    content: string,
    options?: {
      useHealthContext?: boolean;
      resourceType?: string;
      resourceId?: string;
    },
    signal?: AbortSignal
  ): Promise<RawMessageApiItem> {
    return apiRequest<RawMessageApiItem>({
      url: `/chatbot/conversations/${conversationId}/messages`,
      method: "POST",
      data: {
        content,
        use_health_context: options?.useHealthContext ?? true,
        resource_type: options?.resourceType,
        resource_id: options?.resourceId,
      },
      signal,
    });
  },

  /**
   * Submits patient helpfulness feedback.
   */
  async submitFeedback(
    messageId: string,
    rating: number,
    comment?: string,
    signal?: AbortSignal
  ): Promise<{ status: string }> {
    return apiRequest<{ status: string }>({
      url: `/chatbot/messages/${messageId}/feedback`,
      method: "POST",
      data: { rating, comment },
      signal,
    });
  },

  /**
   * Checks system readiness probe to verify local AI status.
   */
  async getReadiness(signal?: AbortSignal): Promise<RawReadinessResponse> {
    return apiRequest<RawReadinessResponse>({
      url: "/health/ready",
      method: "GET",
      signal,
    });
  },
};
