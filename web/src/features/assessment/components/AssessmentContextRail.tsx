import {
  SparklesIcon,
  SecurityCheckIcon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Badge } from "../../../shared/ui";
import {
  AssessmentFieldKey,
  ASSESSMENT_FIELDS,
} from "../config/assessment-fields";

interface AssessmentContextRailProps {
  focusedFieldKey: AssessmentFieldKey | null;
  className?: string;
}

export function AssessmentContextRail({
  focusedFieldKey,
  className = "",
}: AssessmentContextRailProps) {
  const fieldDef = focusedFieldKey ? ASSESSMENT_FIELDS[focusedFieldKey] : null;

  if (!fieldDef) {
    return (
      <aside
        aria-label="Input context explanation"
        className={`flex flex-col gap-3 p-4 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] ${className}`}
      >
        <div className="flex items-center gap-2 text-[var(--primary)] font-bold uppercase tracking-wider text-[10px]">
          <AppIcon icon={SparklesIcon} size="xs" />
          <span>Input Context</span>
        </div>
        <p className="leading-relaxed">
          Select or focus any input field to inspect why it is requested by the clinical model.
        </p>
      </aside>
    );
  }

  return (
    <aside
      aria-label={`${fieldDef.label} context`}
      className={`flex flex-col gap-4 p-4 rounded-md bg-[var(--card)] border border-[var(--border)] transition-all ${className}`}
    >
      {/* 1. Header & Badges */}
      <div className="space-y-1.5 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[var(--primary)] font-extrabold uppercase tracking-wider text-[10px]">
            <AppIcon icon={SparklesIcon} size="xs" />
            <span>Input Context</span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-mono bg-[var(--surface-soft)] text-[var(--foreground)] border-[var(--border)]"
          >
            {fieldDef.modelField}
          </Badge>
        </div>
        <h2 className="text-sm font-extrabold text-[var(--foreground)]">
          {fieldDef.label}
        </h2>
      </div>

      {/* 2. Format & Value Bounds */}
      <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-md bg-[var(--background)] border border-[var(--border)]">
        <div>
          <span className="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">
            Unit
          </span>
          <span className="font-bold text-[var(--foreground)]">
            {fieldDef.unit || "Unitless"}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">
            Accepted Range
          </span>
          <span className="font-bold text-[var(--foreground)]">
            {fieldDef.min} – {fieldDef.max}
          </span>
        </div>
      </div>

      {/* 3. Detailed Clinical Rationale */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)]">
          <AppIcon icon={HelpCircleIcon} size="xs" className="text-[var(--primary)]" />
          <span>Why this is asked</span>
        </div>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          {fieldDef.detailedExplanation}
        </p>
      </div>

      {/* 4. Model Privacy Guarantee */}
      <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted-foreground)]">
          <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--success)]" />
          <span>Model Isolation</span>
        </div>
        <p className="text-[10px] text-[var(--muted-foreground)] leading-tight">
          Sent directly to the versioned ML engine upon review. Never shared with third parties.
        </p>
      </div>
    </aside>
  );
}
