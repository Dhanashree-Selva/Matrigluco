import {
  RawConversationApiItem,
  RawMessageApiItem,
} from "../api/assistant.api";
import {
  AssistantConversation,
  AssistantMessage,
  CitationSource,
  MessageRole,
} from "../types/assistant.types";

function parseUtcDate(iso?: string): Date {
  if (!iso) return new Date();
  let str = String(iso).trim();
  if (!str) return new Date();

  // Normalize backend SQL ISO timestamp without timezone or Z to UTC
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(str)) {
    str = str.replace(" ", "T") + "Z";
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function formatConversationTimestamp(d: Date): { formattedDate: string; formattedTime: string } {
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  let formattedDate = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  if (isToday) {
    formattedDate = "Today";
  } else if (isYesterday) {
    formattedDate = "Yesterday";
  } else if (d.getFullYear() !== now.getFullYear()) {
    formattedDate = d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const formattedTime = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return { formattedDate, formattedTime };
}

export function mapApiToConversation(
  apiItem: RawConversationApiItem
): AssistantConversation {
  const d = parseUtcDate(apiItem.updated_at || apiItem.created_at);
  const { formattedDate, formattedTime } = formatConversationTimestamp(d);

  return {
    id: apiItem.id,
    userId: apiItem.user_id,
    title: apiItem.title || "Maternal Health Consultation",
    status: apiItem.status === "archived" ? "archived" : "active",
    createdAt: apiItem.created_at,
    updatedAt: apiItem.updated_at,
    formattedDate,
    formattedTime,
  };
}

export function mapRawSourcesToCitations(
  rawSources?: string[]
): CitationSource[] {
  if (!rawSources || rawSources.length === 0) return [];

  return rawSources.map((sourceStr, idx) => {
    const isPrivate =
      sourceStr.startsWith("report:") ||
      sourceStr.startsWith("assessment:") ||
      sourceStr.startsWith("tracking:");

    let sourceType: CitationSource["sourceType"] = "knowledge";
    let title = sourceStr;

    if (sourceStr.startsWith("assessment:")) {
      sourceType = "assessment";
      title = "Clinical Risk Assessment";
    } else if (sourceStr.startsWith("report:")) {
      sourceType = "report";
      title = "Uploaded Medical Document";
    } else if (sourceStr.startsWith("tracking:")) {
      sourceType = "tracking";
      title = "Daily Health Log";
    } else if (sourceStr.includes("diabetes") || sourceStr.includes("guidance")) {
      title = "Gestational Diabetes Clinical Guidance";
    } else if (sourceStr.includes("diet") || sourceStr.includes("nutrition")) {
      title = "Maternal Nutrition & Metabolic Guidelines";
    } else {
      title = sourceStr
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return {
      id: `cit-${idx + 1}-${sourceStr}`,
      sourceIndex: idx + 1,
      title,
      sourceType,
      documentId: sourceStr,
      isPrivateHealthContext: isPrivate,
    };
  });
}

export function mapApiToMessage(apiItem: RawMessageApiItem): AssistantMessage {
  const d = parseUtcDate(apiItem.created_at);
  const { formattedDate, formattedTime } = formatConversationTimestamp(d);

  const role: MessageRole =
    apiItem.role === "assistant"
      ? "assistant"
      : apiItem.role === "system"
      ? "system"
      : "user";

  const citations = mapRawSourcesToCitations(apiItem.sources);

  return {
    id: apiItem.id,
    conversationId: apiItem.conversation_id,
    role,
    content: apiItem.content,
    createdAt: apiItem.created_at,
    formattedTime,
    formattedDate,
    tokensUsed: apiItem.tokens_used,
    latencyMs: apiItem.latency_ms,
    sources: apiItem.sources,
    citations,
  };
}
