export interface StreamChunkEvent {
  type: "token" | "done" | "error";
  token?: string;
  error?: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error, partialText: string) => void;
}

export interface StreamChatOptions {
  conversationId: string;
  content: string;
  useHealthContext?: boolean;
  resourceType?: string;
  resourceId?: string;
  signal?: AbortSignal;
}
