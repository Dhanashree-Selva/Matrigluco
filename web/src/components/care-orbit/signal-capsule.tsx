import { ArrowUp01Icon, ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../common/AppIcon";

export type SignalTrend = "up" | "down" | "stable" | "unknown";

export interface SignalCapsuleProps {
  label: string;
  value: string | number;
  unit?: string;
  contextLabel?: string;
  timestamp?: string;
  trend?: SignalTrend;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  variant?: "regular" | "compact";
  status?: string;
  className?: string;
}

export function SignalCapsule({
  label,
  value,
  unit,
  contextLabel,
  timestamp,
  trend = "unknown",
  icon: Icon,
  variant = "regular",
  className = "",
}: SignalCapsuleProps) {
  const renderTrendIcon = () => {
    switch (trend) {
      case "up":
        return <AppIcon icon={ArrowUp01Icon} size="xs" className="text-[var(--primary)]" />;
      case "down":
        return <AppIcon icon={ArrowDown01Icon} size="xs" className="text-[var(--primary)]" />;
      case "stable":
        return <AppIcon icon={ArrowRight01Icon} size="xs" className="text-[var(--muted-foreground)]" />;
      default:
        return null;
    }
  };

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] shadow-xs ${className}`}
      >
        {Icon && (
          <div className="w-6 h-6 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
            <AppIcon icon={Icon} size="xs" />
          </div>
        )}
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-[var(--muted-foreground)] font-semibold">{label}:</span>
          <span className="text-sm font-bold text-[var(--foreground)]">{value}</span>
          {unit && <span className="text-xs text-[var(--muted-foreground)]">{unit}</span>}
        </div>
        {renderTrendIcon()}
      </div>
    );
  }

  return (
    <div
      className={`p-5 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-xs hover:border-[var(--border-pink)] transition-all flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
              <AppIcon icon={Icon} size="sm" />
            </div>
          )}
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            {label}
          </span>
        </div>
        {renderTrendIcon()}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-bold text-[var(--muted-foreground)]">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--muted-foreground)] font-medium">
        <span>{contextLabel || "Recent reading"}</span>
        {timestamp && <span>{timestamp}</span>}
      </div>
    </div>
  );
}
