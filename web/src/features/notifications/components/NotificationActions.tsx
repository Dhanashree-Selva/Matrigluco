import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  MoreHorizontalIcon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons";
import { NotificationViewModel } from "../types/notification.types";

interface NotificationActionsProps {
  notification: NotificationViewModel;
  onMarkRead: (id: string) => void;
}

export function NotificationActions({
  notification,
  onMarkRead,
}: NotificationActionsProps) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Primary Action Button if actionable and targetRoute exists */}
      {notification.targetRoute && (
        <Button
          variant="outline"
          size="sm"
          asChild
          onClick={() => onMarkRead(notification.id)}
          className="h-8 px-3 text-xs font-bold rounded-xl border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/30 hover:bg-[var(--accent-soft)] hover:text-[var(--primary)] gap-1 cursor-pointer"
        >
          <Link to={notification.targetRoute}>
            <span>{notification.actionLabel || "View"}</span>
            <AppIcon icon={ArrowRight01Icon} size="xxs" />
          </Link>
        </Button>
      )}

      {/* Secondary More Actions DropdownMenu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`More options for ${notification.title}`}
            className="h-8 w-8 p-0 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
          >
            <AppIcon icon={MoreHorizontalIcon} size="xs" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44 rounded-2xl border-[var(--border)]">
          {!notification.isRead && (
            <DropdownMenuItem
              onClick={() => onMarkRead(notification.id)}
              className="text-xs font-semibold cursor-pointer gap-2"
            >
              <AppIcon icon={CheckmarkCircle02Icon} size="xs" className="text-emerald-500" />
              <span>Mark as read</span>
            </DropdownMenuItem>
          )}

          {notification.targetRoute && (
            <DropdownMenuItem asChild className="text-xs font-semibold cursor-pointer gap-2">
              <Link to={notification.targetRoute} onClick={() => onMarkRead(notification.id)}>
                <AppIcon icon={LinkSquare01Icon} size="xs" className="text-[var(--primary)]" />
                <span>Open resource</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
