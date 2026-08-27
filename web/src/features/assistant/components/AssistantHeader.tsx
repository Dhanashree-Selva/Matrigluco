import React from "react";
import { AppLogo } from "../../../shared/brand/AppLogo";
import { Badge } from "../../../shared/ui";
import { AiAvailabilityStatus } from "../types/assistant.types";

interface AssistantHeaderProps {
  aiStatus: AiAvailabilityStatus;
  modelVersion?: string;
  onOpenConversationsMobile?: () => void;
}

export function AssistantHeader({
  aiStatus,
  modelVersion = "Local GGUF",
  onOpenConversationsMobile,
}: AssistantHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
      <div className="flex items-center gap-3">
        {onOpenConversationsMobile && (
          <button
            type="button"
            onClick={onOpenConversationsMobile}
            className="md:hidden p-1.5 -ml-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
            aria-label="Open conversation history"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
          <AppLogo size={20} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-[var(--foreground)] leading-none">
              Matrigluco Assistant
            </h1>
            <Badge
              variant={
                aiStatus === "ready"
                  ? "outline"
                  : aiStatus === "loading"
                  ? "secondary"
                  : "destructive"
              }
              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 ${
                aiStatus === "ready"
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30"
                  : ""
              }`}
            >
              {aiStatus === "ready"
                ? "Local AI · Ready"
                : aiStatus === "loading"
                ? "Preparing Model…"
                : aiStatus === "disabled"
                ? "AI Disabled"
                : "Unavailable"}
            </Badge>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Educational guidance · not a diagnosis
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2">
        <span className="text-[11px] font-mono text-[var(--muted-foreground)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-full border border-[var(--border)]">
          llama.cpp · {modelVersion}
        </span>
      </div>
    </header>
  );
}
