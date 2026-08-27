export type MessageRole = "user" | "assistant" | "system";

export type GenerationState =
  | "idle"
  | "preparing"
  | "streaming"
  | "stopped"
  | "error";

export type AiAvailabilityStatus =
  | "ready"
  | "loading"
  | "disabled"
  | "unavailable";

export interface CitationSource {
  id: string;
  sourceIndex: number;
  title: string;
  sourceType: "knowledge" | "assessment" | "report" | "tracking";
  documentId?: string;
  excerpt?: string;
  section?: string;
  resourceId?: string;
  resourceType?: string;
  isPrivateHealthContext: boolean;
}

export interface AssistantMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  formattedTime?: string;
  formattedDate?: string;
  tokensUsed?: number;
  latencyMs?: number;
  sources?: string[];
  citations?: CitationSource[];
  isStreaming?: boolean;
  isStopped?: boolean;
  isError?: boolean;
  errorMessage?: string;
  feedbackRating?: number | null;
}

export interface AssistantConversation {
  id: string;
  userId: string;
  title: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
  formattedDate: string;
  formattedTime: string;
  messageCount?: number;
  lastMessagePreview?: string;
}

export interface ContextConsentState {
  isConsented: boolean;
  resourceType?: "assessment" | "report" | "tracking";
  resourceId?: string;
  resourceLabel?: string;
  allowedCategories: string[];
}

export interface QuestionPromptItem {
  id: string;
  category: "ASSESSMENT" | "REPORTS" | "TRACKING" | "PREPARE";
  categoryLabel: string;
  question: string;
  description: string;
}
