import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  UserCircleIcon,
  SlidersVerticalIcon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";

export interface AccountDomain {
  key: string;
  label: string;
  path: string;
  description: string;
  icon: typeof UserCircleIcon;
}

export const ACCOUNT_DOMAINS: AccountDomain[] = [
  {
    key: "profile",
    label: "Profile",
    path: "/app/account/profile",
    description: "Identity and personal care context",
    icon: UserCircleIcon,
  },
  {
    key: "preferences",
    label: "Preferences",
    path: "/app/account/preferences",
    description: "Notifications and AI context permissions",
    icon: SlidersVerticalIcon,
  },
  {
    key: "security",
    label: "Security & Privacy",
    path: "/app/account/security",
    description: "Password, sessions, and data controls",
    icon: SecurityCheckIcon,
  },
];

interface AccountAtlasProps {
  className?: string;
}

export function AccountAtlas({ className = "" }: AccountAtlasProps) {
  const location = useLocation();

  return (
    <nav
      aria-label="Account Control Domains"
      className={`p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-stretch gap-1.5">
        {ACCOUNT_DOMAINS.map((domain) => {
          const isActive = location.pathname.startsWith(domain.path);

          return (
            <Link
              key={domain.key}
              to={domain.path}
              className={`flex-1 p-3 rounded-xl transition-all flex items-center gap-3 text-left ${
                isActive
                  ? "bg-[var(--accent-soft)] text-[var(--primary)] font-semibold border border-[var(--primary)]/20 shadow-2xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]"
                }`}
              >
                <AppIcon icon={domain.icon} size="xs" />
              </div>

              <div className="min-w-0">
                <span
                  className={`text-xs font-bold block truncate ${
                    isActive ? "text-[var(--foreground)]" : ""
                  }`}
                >
                  {domain.label}
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)] block truncate">
                  {domain.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
