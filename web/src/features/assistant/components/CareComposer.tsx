import React, { useState, useRef, useEffect } from "react";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  Button,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { SecurityCheckIcon } from "@hugeicons/core-free-icons";

interface CareComposerProps {
  onSendMessage: (content: string) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  isHealthContextConsented: boolean;
  resourceLabel?: string;
  onOpenContextGate?: () => void;
  disabled?: boolean;
  initialDraft?: string;
}

const MAX_CHAR_LIMIT = 2000;

export function CareComposer({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  isHealthContextConsented,
  resourceLabel,
  onOpenContextGate,
  disabled = false,
  initialDraft = "",
}: CareComposerProps) {
  const [draft, setDraft] = useState(initialDraft);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (initialDraft) {
      setDraft(initialDraft);
    }
  }, [initialDraft]);

  // Focus textarea when generation ends
  useEffect(() => {
    if (!isGenerating && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isGenerating]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If IME composition in progress, do not submit
    if (isComposingRef.current || e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed || isGenerating || disabled) return;
    onSendMessage(trimmed);
    setDraft("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-3 bg-[var(--background)]/90 backdrop-blur-md border-t border-[var(--border)] shrink-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="relative"
      >
        <label htmlFor="care-composer-input" className="sr-only">
          Message Matrigluco Assistant
        </label>

        <InputGroup className="bg-[var(--card)] border-[var(--border)] rounded-2xl shadow-xs focus-within:border-[var(--primary)]/50 focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition-all">
          <InputGroupTextarea
            ref={textareaRef}
            id="care-composer-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHAR_LIMIT))}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => (isComposingRef.current = true)}
            onCompositionEnd={() => (isComposingRef.current = false)}
            placeholder={
              isGenerating
                ? "Generating educational guidance response…"
                : "Ask a maternal health-education question…"
            }
            disabled={isGenerating || disabled}
            rows={1}
            className="min-h-[52px] max-h-36 px-4 pt-3 pb-1 text-sm sm:text-[14.5px] leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 resize-none font-sans"
          />

          <InputGroupAddon
            align="block-end"
            className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1 border-t border-[var(--border)]/40 text-xs"
          >
            {/* Context Status Indicator */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenContextGate}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-[var(--accent-soft)] transition-colors text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                title="Manage health context authorization"
              >
                <AppIcon
                  icon={SecurityCheckIcon}
                  size="xs"
                  className={
                    isHealthContextConsented ? "text-emerald-500" : "text-[var(--muted-foreground)]"
                  }
                />
                <span className="truncate max-w-[180px] sm:max-w-[240px]">
                  {isHealthContextConsented
                    ? resourceLabel
                      ? `Context: ${resourceLabel}`
                      : "Context: Health data allowed"
                    : "Context: General educational"}
                </span>
              </button>
            </div>

            {/* Actions: Character count & Send/Stop Button */}
            <div className="flex items-center gap-2 shrink-0">
              {draft.length > 300 && (
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                  {draft.length}/{MAX_CHAR_LIMIT}
                </span>
              )}

              {isGenerating ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onStopGeneration}
                  className="h-8 px-3 text-xs gap-1.5 font-semibold rounded-xl"
                  aria-label="Stop generating response"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                  <span>Stop</span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!draft.trim() || disabled}
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 font-semibold rounded-xl shadow-xs"
                  aria-label="Send message"
                >
                  <span>Send</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              )}
            </div>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
