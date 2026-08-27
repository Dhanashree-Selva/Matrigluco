export type ChatSender = "user" | "assistant" | "system";

export interface ChatMessageRecord {
  id: string;
  conversation_id: string;
  role: ChatSender;
  content: string;
  tokens_generated?: number;
  latency_ms?: number;
  created_at: string;
}

export interface ChatConversationRecord {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at?: string;
}

export interface ChatStreamChunk {
  token: string;
  is_final: boolean;
  conversation_id?: string;
  message_id?: string;
}
