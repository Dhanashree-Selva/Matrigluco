import React from "react";
import { AccountUser } from "../types/account.types";
import { Avatar, AvatarFallback, Badge } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { CheckmarkCircle02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";

interface AccountHeaderProps {
  user?: AccountUser;
}

export function AccountHeader({ user }: AccountHeaderProps) {
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email.slice(0, 2).toUpperCase() || "MG";

  return (
    <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Account & Security
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
          Personal control center for identity, care context, notification channels, and session privacy.
        </p>
      </div>

      {user && (
        <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs self-start sm:self-center">
          <Avatar className="w-10 h-10 rounded-xl border border-[var(--border)] shadow-2xs">
            <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--primary)] font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate max-w-[180px]">
              {user.fullName || "Maternal Patient"}
            </h2>
            <p className="text-[11px] text-[var(--muted-foreground)] truncate max-w-[180px]">
              {user.email}
            </p>
          </div>

          <div className="pl-1 shrink-0">
            {user.isEmailVerified ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1 py-0.5"
              >
                <AppIcon icon={CheckmarkCircle02Icon} size="xxs" /> Verified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1 py-0.5"
              >
                <AppIcon icon={AlertCircleIcon} size="xxs" /> Unverified
              </Badge>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function AccountSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading Account Details">
      <div className="h-10 w-64 bg-[var(--border)] rounded-xl" />
      <div className="h-16 w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl" />
      <div className="space-y-4 pt-2">
        <div className="h-44 w-full bg-[var(--card)] border border-[var(--border)] rounded-3xl" />
        <div className="h-44 w-full bg-[var(--card)] border border-[var(--border)] rounded-3xl" />
      </div>
    </div>
  );
}
