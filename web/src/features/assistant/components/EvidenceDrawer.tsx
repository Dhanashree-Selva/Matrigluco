import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, ScrollArea, Button } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { DocumentCodeIcon } from "@hugeicons/core-free-icons";
import { CitationSource } from "../types/assistant.types";
import { EvidenceSource } from "./EvidenceSource";

interface EvidenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: CitationSource[];
  focusedIndex?: number | null;
}

export function EvidenceDrawer({
  open,
  onOpenChange,
  sources,
  focusedIndex,
}: EvidenceDrawerProps) {
  if (!open) return null;

  const content = (
    <div className="flex flex-col h-full bg-[var(--card)] w-full">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <AppIcon icon={DocumentCodeIcon} size="sm" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Retrieved Evidence
            </h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              {sources.length} clinical references cited
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Close evidence drawer</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {sources.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
            <p>No specific source chunks cited for this turn.</p>
            <p className="mt-1 text-[11px]">Responses are grounded in verified maternal health clinical guidelines.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((src) => (
              <EvidenceSource
                key={src.id}
                source={src}
                isFocused={focusedIndex === src.sourceIndex}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop Right Rail */}
      <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 h-full border-l border-[var(--border)] shadow-xs">
        {content}
      </aside>

      {/* Mobile / Tablet Sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="right" className="p-0 w-80 sm:w-96 max-w-[90vw] bg-[var(--card)]">
            <SheetHeader className="sr-only">
              <SheetTitle>Retrieved Evidence Sources</SheetTitle>
              <SheetDescription>Inspect clinical sources cited in this dialogue</SheetDescription>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
