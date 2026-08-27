import { ReactNode } from "react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "./AppIcon";
import { cn } from "../../lib/utils";

export interface EmptyStateProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = Folder01Icon,
  title = "No records found",
  description = "There are no records to display at this moment.",
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center bg-[var(--card)] rounded-md border border-[var(--border)]",
        className
      )}
    >
      <div className="w-14 h-14 rounded-md bg-[var(--surface-soft)] text-[var(--muted-foreground)] flex items-center justify-center mb-3 border border-[var(--border-subtle)]">
        <AppIcon icon={icon} size="md" />
      </div>
      <h4 className="font-bold text-[var(--foreground)] text-sm mb-1">{title}</h4>
      <p className="text-xs text-[var(--muted-foreground)] max-w-xs mb-4 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
