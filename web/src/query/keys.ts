export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    summary: (period: string = "7d") => ["dashboard", "summary", period] as const,
  },
  auth: {
    all: ["auth"] as const,
    user: () => ["auth", "user"] as const,
    session: () => ["auth", "session"] as const,
  },
  profile: {
    all: ["profile"] as const,
    me: () => ["profile", "me"] as const,
  },
  predictions: {
    all: ["predictions"] as const,
    list: (filters: Record<string, unknown> = {}) => ["predictions", "list", filters] as const,
    detail: (id: string) => ["predictions", "detail", id] as const,
  },
  health: {
    all: ["health"] as const,
    list: (filters: Record<string, unknown> = {}) => ["health", "list", filters] as const,
    detail: (id: string) => ["health", "detail", id] as const,
    summary: () => ["health", "summary"] as const,
  },
  reports: {
    all: ["reports"] as const,
    list: (filters: Record<string, unknown> = {}) => ["reports", "list", filters] as const,
    detail: (id: string) => ["reports", "detail", id] as const,
  },
  consultations: {
    all: ["consultations"] as const,
    list: (filters: Record<string, unknown> = {}) => ["consultations", "list", filters] as const,
    detail: (id: string) => ["consultations", "detail", id] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (filters: Record<string, unknown> = {}) => ["notifications", "list", filters] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
    preferences: () => ["notifications", "preferences"] as const,
  },
  chatbot: {
    all: ["chatbot"] as const,
    conversations: () => ["chatbot", "conversations"] as const,
    conversation: (id: string) => ["chatbot", "conversation", id] as const,
    messages: (conversationId: string) => ["chatbot", "messages", conversationId] as const,
    readiness: () => ["chatbot", "readiness"] as const,
  },
  history: {
    all: ["history"] as const,
    list: (filters: Record<string, unknown> = {}) => ["history", "list", filters] as const,
  },
};
