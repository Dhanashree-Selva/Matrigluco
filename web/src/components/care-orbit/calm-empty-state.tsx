import React from "react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../common/AppIcon";

export interface CalmEmptyStateProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function CalmEmptyState({
  icon = Folder01Icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: CalmEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[24px] bg-[var(--card)] border border-[var(--border)] shadow-xs ${className}`}
      role="status"
    >
      <div className="w-14 h-14 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center mb-4 border border-[var(--border-pink)] shadow-xs">
        <AppIcon icon={icon} size="lg" />
      </div>

      <h4 className="font-bold text-lg text-[var(--foreground)] tracking-tight mb-1.5">
        {title}
      </h4>

      <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-sm mb-6 leading-relaxed font-medium">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {action}
        {secondaryAction}
      </div>
    </div>
  );
}
