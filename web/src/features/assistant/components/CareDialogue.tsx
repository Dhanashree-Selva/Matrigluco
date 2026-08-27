import React, { useRef, useEffect, useState, useCallback } from "react";
import { AssistantMessage as AssistantMessageType } from "../types/assistant.types";
import { MessageGroup } from "./MessageGroup";
import { CareDesk } from "./CareDesk";
import { Button } from "../../../shared/ui";

interface CareDialogueProps {
  messages: AssistantMessageType[];
  activeStreamMessage?: AssistantMessageType | null;
  isGenerating?: boolean;
  userInitials?: string;
  showCareDesk?: boolean;
  showContextGate?: boolean;
  resourceLabel?: string;
  onAcceptConsent: () => void;
  onDeclineConsent: () => void;
  onSelectStarterPrompt: (prompt: string) => void;
  onOpenSources?: (citationIndex?: number) => void;
  onRetry?: () => void;
  onFeedback?: (messageId: string, rating: number) => void;
}

export function CareDialogue({
  messages,
  activeStreamMessage,
  isGenerating = false,
  userInitials = "U",
  showCareDesk = false,
  showContextGate = false,
  resourceLabel,
  onAcceptConsent,
  onDeclineConsent,
  onSelectStarterPrompt,
  onOpenSources,
  onRetry,
  onFeedback,
}: CareDialogueProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const isNearBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 100;
    isNearBottomRef.current = nearBottom;
    setShowJumpToBottom(!nearBottom);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!containerRef.current) return;
    if (typeof containerRef.current.scrollTo === "function") {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    } else {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  // Auto-scroll when new tokens arrive, only if user was already near bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages, activeStreamMessage?.content, scrollToBottom]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 relative focus:outline-none flex flex-col justify-between"
      tabIndex={0}
      aria-label="Conversation message history"
    >
      {/* Screen reader live region for completion announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {!isGenerating && messages.length > 0 && messages[messages.length - 1].role === "assistant"
          ? "Response complete."
          : ""}
      </div>

      {showCareDesk ? (
        <CareDesk
          showContextGate={showContextGate}
          resourceLabel={resourceLabel}
          onAcceptConsent={onAcceptConsent}
          onDeclineConsent={onDeclineConsent}
          onSelectPrompt={onSelectStarterPrompt}
        />
      ) : (
        <MessageGroup
          messages={messages}
          activeStreamMessage={activeStreamMessage}
          userInitials={userInitials}
          onOpenSources={onOpenSources}
          onRetry={onRetry}
          onFeedback={onFeedback}
        />
      )}

      {/* Jump to latest button */}
      {showJumpToBottom && (
        <div className="sticky bottom-4 right-4 flex justify-center z-10 pointer-events-none">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => scrollToBottom(true)}
            className="pointer-events-auto bg-[var(--card)]/90 backdrop-blur-md shadow-md border-[var(--border)] text-xs gap-1.5 rounded-full px-3"
          >
            <span>Jump to latest</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
