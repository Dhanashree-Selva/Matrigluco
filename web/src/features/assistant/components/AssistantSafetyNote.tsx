import React from "react";
import { Alert, AlertDescription, AlertTitle } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { HelpCircleIcon } from "@hugeicons/core-free-icons";

export function AssistantSafetyNote() {
  return (
    <Alert className="border-[var(--border)] bg-[var(--card)] shadow-xs max-w-3xl mx-auto mb-6">
      <AppIcon icon={HelpCircleIcon} size="sm" className="text-[var(--primary)] shrink-0 mt-0.5" />
      <div className="ml-2">
        <AlertTitle className="text-xs font-bold text-[var(--foreground)] tracking-tight">
          Educational information · not clinical diagnosis
        </AlertTitle>
        <AlertDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-0.5">
          The Matrigluco Assistant provides educational insights and helps explain maternal health
          metrics based on curated clinical guidance. It does not provide medical diagnoses or prescribe
          treatments. Always consult your obstetrician or healthcare team for clinical care.
        </AlertDescription>
      </div>
    </Alert>
  );
}
