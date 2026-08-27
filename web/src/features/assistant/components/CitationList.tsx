import React from "react";
import { AppIcon } from "../../../components/common/AppIcon";
import { DocumentCodeIcon } from "@hugeicons/core-free-icons";
import { CitationSource } from "../types/assistant.types";

interface CitationListProps {
  citations: CitationSource[];
  onSelectCitation: (index: number) => void;
}

export function CitationList({ citations, onSelectCitation }: CitationListProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border)]/60 text-xs">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
        <AppIcon icon={DocumentCodeIcon} size="xs" className="text-[var(--primary)]" />
        <span>Sources Cited in this Response</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {citations.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectCitation(c.sourceIndex)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--primary)]/10 text-[var(--foreground)] border border-[var(--border)] transition-colors text-left cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-[var(--primary)] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
              {c.sourceIndex}
            </span>
            <span className="truncate max-w-[200px] text-xs font-medium">
              {c.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
