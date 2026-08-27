import React from "react";
import { Badge } from "../../../shared/ui";
import { CareEpisodeStage } from "../types/consultation.types";
import { getStageDisplayLabel } from "../mappers/consultation.mapper";

interface ConsultationStatusProps {
  stage: CareEpisodeStage;
  className?: string;
}

export function ConsultationStatus({ stage, className = "" }: ConsultationStatusProps) {
  const label = getStageDisplayLabel(stage);

  switch (stage) {
    case "booked":
      return (
        <Badge
          variant="outline"
          className={`bg-[var(--accent-soft)]/60 text-[var(--primary)] border-[var(--primary)]/30 font-semibold px-2.5 py-0.5 text-[11px] rounded-full tracking-tight ${className}`}
        >
          ● {label}
        </Badge>
      );
    case "prepare":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold px-2.5 py-0.5 text-[11px] rounded-full tracking-tight ${className}`}
        >
          ◐ {label}
        </Badge>
      );
    case "consult":
      return (
        <Badge
          className={`bg-emerald-600 text-white dark:bg-emerald-500 font-semibold px-2.5 py-0.5 text-[11px] rounded-full shadow-2xs tracking-tight animate-pulse ${className}`}
        >
          ● {label}
        </Badge>
      );
    case "complete":
      return (
        <Badge
          variant="outline"
          className={`bg-slate-500/10 text-[var(--muted-foreground)] border-[var(--border)] font-medium px-2.5 py-0.5 text-[11px] rounded-full tracking-tight ${className}`}
        >
          ✓ {label}
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="outline"
          className={`bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium px-2.5 py-0.5 text-[11px] rounded-full tracking-tight ${className}`}
        >
          ✕ {label}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={`text-[11px] rounded-full ${className}`}>
          {label}
        </Badge>
      );
  }
}
