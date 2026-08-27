import { AiBrain01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";

export function ExplainabilityUnavailable() {
  return (
    <div className="p-4 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
        <div className="w-5 h-5 rounded-md bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shrink-0">
          <AppIcon icon={AiBrain01Icon} size="xs" />
        </div>
        <span>Input Transparency & Feature Attribution</span>
      </div>

      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
        This assessment records and validates the exact 8 inputs ingested by the model.
        Per-feature contribution analysis (e.g. SHAP attribution) is not generated for this model version.
      </p>

      <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] pt-1">
        <AppIcon icon={InformationCircleIcon} size="xs" className="shrink-0 text-[var(--primary)]" />
        <span>Model calculations reflect the complete combined 8-feature profile.</span>
      </div>
    </div>
  );
}
