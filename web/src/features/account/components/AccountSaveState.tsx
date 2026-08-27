import React from "react";
import { AppIcon } from "../../../components/common/AppIcon";
import { CheckmarkCircle02Icon, Loading03Icon } from "@hugeicons/core-free-icons";

interface AccountSaveStateProps {
  isSaving: boolean;
  isSaved?: boolean;
  className?: string;
}

export function AccountSaveState({
  isSaving,
  isSaved = false,
  className = "",
}: AccountSaveStateProps) {
  if (isSaving) {
    return (
      <span
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] ${className}`}
      >
        <AppIcon icon={Loading03Icon} size="xxs" className="animate-spin text-[var(--primary)]" />
        Saving changes…
      </span>
    );
  }

  if (isSaved) {
    return (
      <span
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium ${className}`}
      >
        <AppIcon icon={CheckmarkCircle02Icon} size="xxs" />
        Saved
      </span>
    );
  }

  return null;
}
