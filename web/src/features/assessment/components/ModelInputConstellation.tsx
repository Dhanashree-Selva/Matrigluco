import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { ASSESSMENT_FIELDS } from "../config/assessment-fields";

export function ModelInputConstellation() {
  const fields = Object.values(ASSESSMENT_FIELDS);

  return (
    <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-3">
      {/* 1. Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[var(--primary)] font-extrabold uppercase tracking-wider text-[10px]">
          <AppIcon icon={SparklesIcon} size="xs" />
          <span>Model Feature Topology</span>
        </div>
        <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
          8 Canonical Inputs
        </span>
      </div>

      {/* 2. Constellation Nodes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {fields.map((f) => (
          <div
            key={f.key}
            className="p-2 rounded-md bg-[var(--background)] border border-[var(--border)] text-left space-y-1 transition-colors hover:border-[var(--primary)]/40"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
              <span className="font-mono text-[10px] font-bold text-[var(--foreground)] truncate">
                {f.modelField}
              </span>
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)] block truncate">
              {f.unit ? f.unit : "scalar"}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[var(--muted-foreground)] leading-tight">
        All 8 inputs have equal structural weight in the assessment contract.
      </p>
    </div>
  );
}
