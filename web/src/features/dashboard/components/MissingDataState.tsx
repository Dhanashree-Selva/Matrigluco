import { ReactNode } from "react";
import { HelpCircleIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Alert, AlertTitle, AlertDescription, Button } from "../../../shared/ui";

export interface MissingDataStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function MissingDataState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = "",
}: MissingDataStateProps) {
  return (
    <Alert
      className={`p-6 rounded-md bg-[var(--surface-soft)]/60 border border-dashed border-[var(--border)] text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-md bg-[var(--card)] text-[var(--primary)] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          {icon || <AppIcon icon={HelpCircleIcon} size="sm" />}
        </div>
        <div className="space-y-1 max-w-lg">
          <AlertTitle className="text-xs font-bold text-[var(--foreground)]">{title}</AlertTitle>
          <AlertDescription className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            {description}
          </AlertDescription>
        </div>
      </div>

      {actionLabel && onAction && (
        <Button
          type="button"
          size="sm"
          onClick={onAction}
          className="shrink-0 h-8 px-3.5 text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] cursor-pointer self-start sm:self-center"
        >
          {actionLabel}
        </Button>
      )}
    </Alert>
  );
}
