import React from "react";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  Badge,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { NotificationViewModel } from "../types/notification.types";
import { getNotificationPresentation } from "../config/notification-presentations";
import { NotificationActions } from "./NotificationActions";

interface NotificationItemProps {
  notification: NotificationViewModel;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const pres = getNotificationPresentation(notification.type);
  const Icon = pres.icon;

  return (
    <Item
      variant="outline"
      data-unread={!notification.isRead}
      className={`relative p-3.5 sm:p-4 rounded-2xl transition-all border ${
        notification.isRead
          ? "bg-[var(--card)] border-[var(--border)] hover:border-[var(--border)]/80"
          : "bg-[var(--card)] border-[var(--primary)]/25 shadow-2xs"
      }`}
    >
      {/* Unread Left Border Highlight Dot */}
      {!notification.isRead && (
        <span
          className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
          aria-hidden="true"
        />
      )}

      {/* Media Icon */}
      <ItemMedia
        variant="icon"
        className={`w-9 h-9 rounded-xl ${pres.accentBg} ${pres.accentText} flex items-center justify-center shrink-0 ml-1.5 sm:ml-0`}
      >
        <AppIcon icon={Icon} size="xs" />
      </ItemMedia>

      {/* Content */}
      <ItemContent className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] font-bold uppercase tracking-wider py-0 px-2 rounded-md border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
          >
            {notification.sourceLabel}
          </Badge>

          <span
            title={notification.createdAtFormatted}
            className="text-[11px] text-[var(--muted-foreground)]"
          >
            {notification.relativeTime}
          </span>
        </div>

        <ItemTitle className={`text-xs sm:text-sm font-bold tracking-tight ${
          notification.isRead ? "text-[var(--foreground)]" : "text-[var(--foreground)] font-extrabold"
        }`}>
          {!notification.isRead && <span className="sr-only">Unread notification: </span>}
          {notification.title}
        </ItemTitle>

        <ItemDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2 sm:line-clamp-3">
          {notification.message}
        </ItemDescription>
      </ItemContent>

      {/* Actions */}
      <ItemActions className="self-start sm:self-center pt-2 sm:pt-0">
        <NotificationActions
          notification={notification}
          onMarkRead={onMarkRead}
        />
      </ItemActions>
    </Item>
  );
}
