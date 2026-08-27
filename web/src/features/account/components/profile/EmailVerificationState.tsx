import React from "react";
import { Button, Badge } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Mail01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

interface EmailVerificationStateProps {
  email: string;
  isVerified: boolean;
  onResendVerification?: () => void;
  isResending?: boolean;
}

export function EmailVerificationState({
  email,
  isVerified,
  onResendVerification,
  isResending = false,
}: EmailVerificationStateProps) {
  return (
    <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center shrink-0">
          <AppIcon icon={Mail01Icon} size="xs" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
            Primary Email Address
          </span>
          <span className="text-xs font-semibold text-[var(--foreground)]">{email}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-center">
        {isVerified ? (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1 py-1"
          >
            <AppIcon icon={CheckmarkCircle02Icon} size="xxs" /> Verified
          </Badge>
        ) : (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-semibold gap-1 py-1"
            >
              <AppIcon icon={AlertCircleIcon} size="xxs" /> Unverified
            </Badge>

            {onResendVerification && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResendVerification}
                disabled={isResending}
                className="text-xs font-semibold hover:bg-[var(--accent-soft)]"
              >
                {isResending ? (
                  <>
                    <AppIcon icon={Loading03Icon} size="xxs" className="animate-spin mr-1" />
                    Sending…
                  </>
                ) : (
                  "Resend Link"
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
