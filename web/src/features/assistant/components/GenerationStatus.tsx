import React from "react";
import { Spinner } from "../../../shared/ui";

interface GenerationStatusProps {
  statusText?: string;
}

export function GenerationStatus({
  statusText = "Preparing local educational guidance…",
}: GenerationStatusProps) {
  return (
    <div className="flex items-center gap-2.5 py-3 text-xs text-[var(--muted-foreground)] font-mono animate-pulse">
      <Spinner className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
      <span>{statusText}</span>
    </div>
  );
}
