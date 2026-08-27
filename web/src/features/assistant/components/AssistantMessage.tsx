import React from "react";
import { AssistantMessage as AssistantMessageType } from "../types/assistant.types";
import { AppLogo } from "../../../shared/brand/AppLogo";
import { Button, Badge } from "../../../shared/ui";
import { ChatMarkdown } from "../utils/chat-markdown";
import { CitationList } from "./CitationList";
import { MessageActions } from "./MessageActions";
import { MessageContextMenu } from "./MessageContextMenu";
import { GenerationStatus } from "./GenerationStatus";

interface AssistantMessageProps {
  message: AssistantMessageType;
  onOpenSources?: (citationIndex?: number) => void;
  onRetry?: () => void;
  onFeedback?: (rating: number) => void;
}

export function AssistantMessage({
  message,
  onOpenSources,
  onRetry,
  onFeedback,
}: AssistantMessageProps) {
  const isStreaming = message.isStreaming;
  const isStopped = message.isStopped;
  const isError = message.isError;
  const citations = message.citations || [];

  return (
    <MessageContextMenu
      content={message.content}
      hasCitations={citations.length > 0}
      onOpenSources={() => onOpenSources?.()}
      onRetry={onRetry}
    >
      <article 
        aria-label="Matrigluco Educational Guidance"
        className="my-5 max-w-3xl w-full text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--primary)]/20">
            <AppLogo size={18} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header / Identity */}
            <div className="flex items-center gap-2 mb-1.5 text-xs">
              <span className="font-bold text-[var(--foreground)] tracking-tight">
                MATRIGLUCO
              </span>
              <span className="text-[11px] text-[var(--muted-foreground)]">
                · Educational Guidance
              </span>
              {message.formattedTime && (
                <span className="text-[11px] text-[var(--muted-foreground)] opacity-75">
                  · {message.formattedTime}
                </span>
              )}
              {isStopped && (
                <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30">
                  Generation Stopped
                </Badge>
              )}
              {isError && (
                <Badge variant="destructive" className="text-[10px]">
                  Response Interrupted
                </Badge>
              )}
            </div>

            {/* Editorial Message Content */}
            <div className="text-[var(--foreground)] leading-relaxed font-sans pt-1">
              {isStreaming && !message.content ? (
                <GenerationStatus />
              ) : (
                <ChatMarkdown
                  content={message.content}
                  citations={citations}
                  onCitationClick={(idx) => onOpenSources?.(idx)}
                />
              )}

              {/* Streaming Cursor */}
              {isStreaming && message.content && (
                <span className="inline-block w-2 h-4 ml-1 align-middle bg-[var(--primary)] animate-pulse rounded-xs" />
              )}
            </div>

            {/* Error Message Box if generation failed */}
            {isError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
                <p>{message.errorMessage || "Response could not be completed."}</p>
                {onRetry && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="h-7 text-xs border-rose-500/40 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                  >
                    Retry Response
                  </Button>
                )}
              </div>
            )}

            {/* Cited Sources List Footer */}
            {citations.length > 0 && !isStreaming && (
              <CitationList
                citations={citations}
                onSelectCitation={(idx) => onOpenSources?.(idx)}
              />
            )}

            {/* Message Action Bar (Copy, Sources, Retry, Feedback) */}
            <MessageActions
              content={message.content}
              hasCitations={citations.length > 0}
              onOpenSources={() => onOpenSources?.()}
              onRetry={onRetry}
              onFeedback={
                message.id && !message.id.startsWith("stream-")
                  ? (rating) => onFeedback?.(rating)
                  : undefined
              }
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </article>
    </MessageContextMenu>
  );
}
