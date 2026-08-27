import React from "react";
import { AssistantMessage as AssistantMessageType } from "../types/assistant.types";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";

interface MessageGroupProps {
  messages: AssistantMessageType[];
  activeStreamMessage?: AssistantMessageType | null;
  userInitials?: string;
  onOpenSources?: (citationIndex?: number) => void;
  onRetry?: () => void;
  onFeedback?: (messageId: string, rating: number) => void;
}

export function MessageGroup({
  messages,
  activeStreamMessage,
  userInitials = "U",
  onOpenSources,
  onRetry,
  onFeedback,
}: MessageGroupProps) {
  const allMessages = [...messages];
  if (activeStreamMessage) {
    allMessages.push(activeStreamMessage);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      {allMessages.map((msg, idx) => {
        const isLatest = idx === allMessages.length - 1;

        if (msg.role === "user") {
          return (
            <UserMessage
              key={msg.id || `user-${idx}`}
              message={msg}
              userInitials={userInitials}
            />
          );
        }

        return (
          <AssistantMessage
            key={msg.id || `asst-${idx}`}
            message={msg}
            onOpenSources={onOpenSources}
            onRetry={isLatest ? onRetry : undefined}
            onFeedback={
              msg.id && !msg.id.startsWith("stream-")
                ? (rating) => onFeedback?.(msg.id, rating)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
