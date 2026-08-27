import React from "react";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  SecurityCheckIcon,
  CheckmarkCircle02Icon,
  LaptopIcon,
  LockKeyIcon,
} from "@hugeicons/core-free-icons";

interface TrustStripProps {
  isEmailVerified: boolean;
  activeSessionsCount: number;
}

export function TrustStrip({
  isEmailVerified,
  activeSessionsCount,
}: TrustStripProps) {
  return (
    <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
        <span className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center">
          <AppIcon icon={SecurityCheckIcon} size="xxs" />
        </span>
        Account Security Posture
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-[var(--muted-foreground)]">
        {/* Email verification status */}
        <span className="flex items-center gap-1.5">
          <AppIcon
            icon={CheckmarkCircle02Icon}
            size="xxs"
            className={isEmailVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}
          />
          {isEmailVerified ? "Email verified" : "Email pending verification"}
        </span>

        <span className="text-[var(--border)]">•</span>

        {/* Active sessions */}
        <span className="flex items-center gap-1.5">
          <AppIcon icon={LaptopIcon} size="xxs" className="text-[var(--primary)]" />
          {activeSessionsCount} active {activeSessionsCount === 1 ? "session" : "sessions"}
        </span>

        <span className="text-[var(--border)]">•</span>

        {/* Argon2id authentication */}
        <span className="flex items-center gap-1.5">
          <AppIcon icon={LockKeyIcon} size="xxs" className="text-emerald-600 dark:text-emerald-400" />
          Argon2id password protected
        </span>
      </div>
    </div>
  );
}
