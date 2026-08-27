import { AiBrain01Icon, Analytics01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { ExplainabilityPayload } from "../../types/assessment.types";

interface EvidenceThreadsProps {
  explainability: ExplainabilityPayload;
}

export function EvidenceThreads({ explainability }: EvidenceThreadsProps) {
  const { method, version, contributions } = explainability;

  return (
    <div className="space-y-3 p-4 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shrink-0">
            <AppIcon icon={Analytics01Icon} size="xs" />
          </div>
          <h4 className="text-xs font-bold text-[var(--foreground)]">
            Evidence Threads — Feature Contribution
          </h4>
        </div>
        <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
          {method} v{version}
        </span>
      </div>

      <p className="text-[11px] text-[var(--muted-foreground)]">
        Relative mathematical contribution toward higher or lower model probability for this specific assessment.
      </p>

      <div className="space-y-2 pt-1">
        {contributions.map((c) => {
          const isHigher = c.direction === "higher";
          const barWidth = `${Math.min(100, Math.max(10, Math.round(c.magnitude * 100)))}%`;

          return (
            <div key={c.feature} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)]">{c.label}</span>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                  {isHigher ? "+ Toward higher output" : "- Toward lower output"}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-md bg-[var(--card)] overflow-hidden flex items-center">
                <div
                  className={`h-full rounded-md transition-all ${
                    isHigher ? "bg-[var(--destructive)]/70" : "bg-[var(--success)]/70"
                  }`}
                  style={{ width: barWidth }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
