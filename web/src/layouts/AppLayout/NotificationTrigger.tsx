import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  ScrollArea,
  Button,
  Badge,
} from "../../shared/ui";
import { AppIcon } from "../../components/common/AppIcon";
import {
  Notification02Icon,
  CheckmarkBadge01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { routePaths } from "../../app/route-paths";
import { useUnreadNotificationCount } from "../../features/notifications/hooks/useUnreadNotificationCount";
import { useNotifications } from "../../features/notifications/hooks/useNotifications";
import { useMarkNotificationRead } from "../../features/notifications/hooks/useMarkNotificationRead";
import { useMarkAllNotificationsRead } from "../../features/notifications/hooks/useMarkAllNotificationsRead";
import { getNotificationPresentation } from "../../features/notifications/config/notification-presentations";

export function NotificationTrigger() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { unreadCount } = useUnreadNotificationCount();
  const { notifications } = useNotifications({ view: "all", category: "all", pageSize: 6 });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleTriggerClick = (e: React.MouseEvent) => {
    // On small screens (< 768px), navigate directly to /app/notifications
    if (window.innerWidth < 768) {
      e.preventDefault();
      setIsOpen(false);
      navigate(routePaths.app.notifications);
    }
  };

  const handleItemClick = (id: string, targetRoute?: string) => {
    markReadMutation.mutate(id);
    setIsOpen(false);
    if (targetRoute) {
      navigate(targetRoute);
    } else {
      navigate(routePaths.app.notifications);
    }
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const ariaLabel =
    unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : "Notifications";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={handleTriggerClick}
          aria-label={ariaLabel}
          className="p-2.5 rounded-xl bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--accent-soft)] border border-[var(--border)] relative transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] cursor-pointer"
        >
          <AppIcon icon={Notification02Icon} size="sm" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white shadow-2xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl hidden md:block"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge
                variant="outline"
                className="bg-[var(--accent-soft)] text-[var(--primary)] border-[var(--primary)]/20 text-[10px] font-bold py-0"
              >
                {unreadCount} new
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 text-[11px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--primary)] px-2"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Bounded ScrollArea Preview */}
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {notifications.slice(0, 5).map((notif) => {
                const pres = getNotificationPresentation(notif.type);
                const Icon = pres.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif.id, notif.targetRoute)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-[var(--accent-soft)]/30 transition-colors cursor-pointer ${
                      !notif.isRead ? "bg-[var(--accent-soft)]/10" : ""
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg ${pres.accentBg} ${pres.accentText} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <AppIcon icon={Icon} size="xs" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                          {notif.sourceLabel}
                        </span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {notif.relativeTime}
                        </span>
                      </div>

                      <h4
                        className={`text-xs truncate ${
                          !notif.isRead ? "font-bold text-[var(--foreground)]" : "font-medium text-[var(--foreground)]"
                        }`}
                      >
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">
                        {notif.message}
                      </p>
                    </div>

                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-[var(--border)] bg-[var(--background)]/50">
          <Button
            variant="ghost"
            size="sm"
            asChild
            onClick={() => setIsOpen(false)}
            className="w-full text-xs font-bold text-[var(--primary)] hover:bg-[var(--accent-soft)] h-8 rounded-xl justify-center gap-1"
          >
            <Link to={routePaths.app.notifications}>
              <span>View all notifications</span>
              <AppIcon icon={ArrowRight01Icon} size="xxs" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
