import React from "react";
import { Avatar, AvatarFallback } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import { LockIcon } from "@hugeicons/core-free-icons";

interface ProfileAvatarProps {
  fullName?: string | null;
  email: string;
}

export function ProfileAvatar({ fullName, email }: ProfileAvatarProps) {
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center gap-4">
      <Avatar className="w-16 h-16 rounded-2xl border-2 border-[var(--border)] shadow-xs shrink-0">
        <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--primary)] font-bold text-lg rounded-2xl">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          Account Avatar
        </h3>
        <p className="text-xs text-[var(--foreground)] font-medium">
          Generated automatically from your name initials.
        </p>
        <p className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
          <AppIcon icon={LockIcon} size="xxs" className="text-[var(--primary)]" />
          Avatars remain private to your authenticated account.
        </p>
      </div>
    </div>
  );
}
