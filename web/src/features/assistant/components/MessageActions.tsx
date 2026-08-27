import React from "react";
import { Button, toast } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { DocumentCodeIcon } from "@hugeicons/core-free-icons";

interface MessageActionsProps {
  content: string;
  hasCitations?: boolean;
  onOpenSources?: () => void;
  onRetry?: () => void;
  onFeedback?: (rating: number) => void;
  isStreaming?: boolean;
}

export function MessageActions({
  content,
  hasCitations,
  onOpenSources,
  onRetry,
  onFeedback,
  isStreaming = false,
}: MessageActionsProps) {
  if (isStreaming) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy text");
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2 text-xs text-[var(--muted-foreground)]">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 px-2 text-[11px] gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy
      </Button>

      {hasCitations && onOpenSources && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenSources}
          className="h-7 px-2 text-[11px] gap-1 text-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--accent-soft)] font-medium"
        >
          <AppIcon icon={DocumentCodeIcon} size="xs" />
          Sources
        </Button>
      )}

      {onRetry && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-7 px-2 text-[11px] gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </Button>
      )}

      {onFeedback && (
        <div className="flex items-center gap-0.5 ml-auto opacity-70 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onFeedback(1)}
            className="p-1 rounded hover:bg-[var(--accent-soft)] text-[var(--muted-foreground)] hover:text-emerald-500 cursor-pointer"
            title="Helpful guidance"
            aria-label="Helpful guidance"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onFeedback(-1)}
            className="p-1 rounded hover:bg-[var(--accent-soft)] text-[var(--muted-foreground)] hover:text-rose-500 cursor-pointer"
            title="Needs improvement"
            aria-label="Needs improvement"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
