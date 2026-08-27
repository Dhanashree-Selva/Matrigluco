import { useState } from "react";
import {
  AiBrain01Icon,
  ArrowDown01Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Badge,
} from "../../../shared/ui";
import { ASSESSMENT_FIELDS } from "../config/assessment-fields";

export function ModelTransparency() {
  const [isOpen, setIsOpen] = useState(false);
  const fields = Object.values(ASSESSMENT_FIELDS);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 space-y-2 text-left"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] hover:text-[var(--primary)] transition-colors p-1"
        >
          <div className="flex items-center gap-2">
            <AppIcon icon={AiBrain01Icon} size="xs" className="text-[var(--primary)]" />
            <span>What the model uses</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono border-[var(--border)]">
              v1.0.0
            </Badge>
            <AppIcon
              icon={ArrowDown01Icon}
              size="xs"
              className={`text-[var(--muted-foreground)] transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 pt-2 text-xs text-[var(--muted-foreground)] border-t border-[var(--border-subtle)]">
        <p className="leading-relaxed">
          Matrigluco sends only the <strong>8 inputs</strong> listed below to the calibrated diabetes-risk estimation engine (Model Version 1.0.0):
        </p>

        <div className="flex flex-wrap gap-1.5">
          {fields.map((f) => (
            <Badge
              key={f.key}
              variant="outline"
              className="text-[10px] font-mono bg-[var(--surface-soft)] text-[var(--foreground)] border-[var(--border)]"
            >
              {f.modelField}
            </Badge>
          ))}
        </div>

        <div className="p-2.5 rounded-md bg-[var(--background)] border border-[var(--border)] flex items-start gap-2 text-[11px]">
          <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--success)] shrink-0 mt-0.5" />
          <p className="leading-tight">
            <strong>Important note:</strong> HbA1c and other daily telemetry metrics are stored separately in your private health ledger and are <strong>not</strong> used by this 8-feature risk model.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
