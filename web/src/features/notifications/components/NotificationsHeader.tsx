import React from "react";
import { Link } from "react-router-dom";
import { Badge, Button } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { SlidersVerticalIcon, Notification02Icon } from "@hugeicons/core-free-icons";
import { routePaths } from "../../../app/route-paths";

interface NotificationsHeaderProps {
  unreadCount: number;
}

export function NotificationsHeader({ unreadCount }: NotificationsHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Care Signal Center
          </h1>
          {unreadCount > 0 && (
            <Badge
              variant="outline"
              className="bg-[var(--accent-soft)] text-[var(--primary)] border-[var(--primary)]/20 text-xs font-bold px-2.5 py-0.5"
            >
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Durable maternal care signals, lab report milestones, appointment updates, and account alerts.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-center">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-xs font-semibold h-9 rounded-xl border-[var(--border)] hover:bg-[var(--accent-soft)] gap-1.5"
        >
          <Link to={routePaths.app.account.preferences}>
            <AppIcon icon={SlidersVerticalIcon} size="xs" />
            <span>Preferences</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
