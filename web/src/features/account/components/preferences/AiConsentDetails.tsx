import React from "react";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Shield01Icon,
  CpuIcon,
  LockIcon,
} from "@hugeicons/core-free-icons";

export function AiConsentDetails() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
      {/* What may be used */}
      <div className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-1">
        <span className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center mb-1">
          <AppIcon icon={CpuIcon} size="xxs" />
        </span>
        <h4 className="text-xs font-bold text-[var(--foreground)]">What May Be Used</h4>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          Recent blood glucose logs, gestational week, and dietary logs to contextualize guidance.
        </p>
      </div>

      {/* What is never shared */}
      <div className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-1">
        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
          <AppIcon icon={Shield01Icon} size="xxs" />
        </span>
        <h4 className="text-xs font-bold text-[var(--foreground)]">What is Never Shared</h4>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          No external ad networks, third-party data brokers, or unencrypted storage.
        </p>
      </div>

      {/* Conversation-Level Gate */}
      <div className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-1">
        <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
          <AppIcon icon={LockIcon} size="xxs" />
        </span>
        <h4 className="text-xs font-bold text-[var(--foreground)]">Context Gate Rule</h4>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          Account permission sets the baseline; live Assistant chats still offer per-conversation context gates.
        </p>
      </div>
    </div>
  );
}
