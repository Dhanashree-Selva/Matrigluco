import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "./AppIcon";
import { cn } from "../../lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Unable to load data",
  message = "An error occurred while communicating with the server. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-[var(--card)] rounded-md border border-[var(--color-danger)]/20",
        className
      )}
    >
      <div className="w-12 h-12 rounded-md bg-[var(--color-danger-soft)] text-[var(--color-danger)] flex items-center justify-center mb-3">
        <AppIcon icon={AlertCircleIcon} size="md" />
      </div>
      <h4 className="font-bold text-[var(--foreground)] text-sm mb-1">{title}</h4>
      <p className="text-xs text-[var(--muted-foreground)] max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card)] rounded-md border border-[var(--color-danger)]/30 text-xs font-bold text-[var(--color-danger)] hover:bg-[var(--surface-soft)] transition-colors shadow-xs"
        >
          <AppIcon icon={RefreshIcon} size="xs" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
