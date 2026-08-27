import React from "react";
import { AppIcon } from "../../../components/common/AppIcon";
import { DropletIcon, DocumentCodeIcon, AiBrain01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons";

interface ContextHaloProps {
  isHealthContextConsented: boolean;
  resourceLabel?: string;
  sourceCount: number;
  onOpenContextInspector?: () => void;
  onOpenEvidenceDrawer?: () => void;
}

export function ContextHalo({
  isHealthContextConsented,
  resourceLabel,
  sourceCount,
  onOpenContextInspector,
  onOpenEvidenceDrawer,
}: ContextHaloProps) {
  return (
    <section 
      aria-label="Conversation Context Information"
      className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2 bg-[var(--accent-soft)]/50 border-b border-[var(--border)] text-xs text-[var(--muted-foreground)] shrink-0"
    >
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
          <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)]" />
          Context:
        </span>

        {/* Health Context */}
        <button
          type="button"
          onClick={onOpenContextInspector}
          className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors group"
          title="Click to inspect health context permissions"
        >
          <AppIcon icon={DropletIcon} size="xs" className="text-[var(--primary)]" />
          <span>Health Context:</span>
          <span
            className={`font-medium underline decoration-dotted underline-offset-2 ${
              isHealthContextConsented
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            {isHealthContextConsented
              ? resourceLabel
                ? `${resourceLabel} (Consented)`
                : "Allowed with Consent"
              : "Not Used"}
          </span>
        </button>

        {/* Sources */}
        {sourceCount > 0 ? (
          <button
            type="button"
            onClick={onOpenEvidenceDrawer}
            className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors"
          >
            <AppIcon icon={DocumentCodeIcon} size="xs" className="text-[var(--primary)]" />
            <span>Sources:</span>
            <span className="font-semibold text-[var(--foreground)]">
              {sourceCount} Cited
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <AppIcon icon={DocumentCodeIcon} size="xs" className="opacity-60" />
            <span>Sources: Curated Clinical</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--muted-foreground)]">
          <AppIcon icon={AiBrain01Icon} size="xs" className="text-[var(--primary)]" />
          <span>Local Inference</span>
        </div>
      </div>
    </section>
  );
}
