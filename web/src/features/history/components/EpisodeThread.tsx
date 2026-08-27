import { useState } from "react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../../../shared/ui";
import { HistoryEventVM } from "../types/history.types";

interface EpisodeThreadProps {
  parentEvent: HistoryEventVM;
  children: React.ReactNode;
}

export function EpisodeThread({ parentEvent, children }: EpisodeThreadProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-lg border border-[var(--border)] bg-[var(--card)]/80 overflow-hidden shadow-2xs transition-all"
    >
      <div className="p-1">
        {children}
      </div>

      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[var(--surface-soft)]/50 hover:bg-[var(--surface-soft)] text-[11px] font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-t border-[var(--border-subtle)] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <AppIcon icon={Layers01Icon} size="xs" className="text-[var(--primary)]" />
            <span>Workflow Thread</span>
          </div>

          <div className="flex items-center gap-1 text-[10px]">
            <span>{isOpen ? "Hide Workflow Details" : "Show Workflow Details"}</span>
            <AppIcon icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon} size="xs" />
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="p-3 bg-[var(--surface-soft)]/30 border-t border-[var(--border-subtle)] space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-[var(--foreground)]">Care Workflow Verified</div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              This record is part of a verified clinical lifecycle event. All associated telemetry and documents are synchronized.
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
