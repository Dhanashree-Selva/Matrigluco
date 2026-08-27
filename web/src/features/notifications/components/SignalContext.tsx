import React from "react";
import { Link } from "react-router-dom";
import { Badge, Button } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  SecurityCheckIcon,
  SlidersVerticalIcon,
  SparklesIcon,
  Notification02Icon,
} from "@hugeicons/core-free-icons";
import { routePaths } from "../../../app/route-paths";
import { NotificationViewModel } from "../types/notification.types";

interface SignalContextProps {
  notifications: NotificationViewModel[];
  unreadCount: number;
}

export function SignalContext({
  notifications,
  unreadCount,
}: SignalContextProps) {
  const actionableCount = notifications.filter((n) => n.isActionable && !n.isRead).length;

  const categories = Array.from(new Set(notifications.map((n) => n.sourceLabel)));

  return (
    <aside
      aria-label="Care Signal Context"
      className="hidden lg:block space-y-4 p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xs self-start"
    >
      <div className="flex items-center gap-2 text-[var(--foreground)]">
        <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)]" />
        <h2 className="text-xs font-extrabold uppercase tracking-wider">
          Signal Overview
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-center">
          <span className="text-xl font-extrabold text-[var(--foreground)] block">
            {unreadCount}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Unread
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-center">
          <span className="text-xl font-extrabold text-[var(--primary)] block">
            {actionableCount}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Actionable
          </span>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
            Active Sources
          </span>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className="text-[10px] font-semibold bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-[var(--border)]">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full text-xs font-semibold h-8 rounded-xl border-[var(--border)] hover:bg-[var(--accent-soft)] gap-1.5 justify-start"
        >
          <Link to={routePaths.app.account.preferences}>
            <AppIcon icon={SlidersVerticalIcon} size="xs" />
            <span>Manage Preferences</span>
          </Link>
        </Button>
      </div>
    </aside>
  );
}
