import React from "react";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  Button,
  Badge,
} from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import { SessionRecord } from "../../types/account.types";
import {
  LaptopIcon,
  SmartPhone01Icon,
  TabletIcon,
  ComputerIcon,
  Logout03Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

interface SessionItemProps {
  session: SessionRecord;
  onRevoke: (sessionId: string) => void;
  isRevoking?: boolean;
}

export function SessionItem({
  session,
  onRevoke,
  isRevoking = false,
}: SessionItemProps) {
  const getDeviceIcon = () => {
    switch (session.deviceType) {
      case "mobile":
        return SmartPhone01Icon;
      case "tablet":
        return TabletIcon;
      case "desktop":
        return LaptopIcon;
      default:
        return ComputerIcon;
    }
  };

  return (
    <Item
      variant="outline"
      className={`p-4 rounded-2xl bg-[var(--background)] border-[var(--border)] flex items-start sm:items-center justify-between gap-4 transition-all ${
        session.isCurrent ? "border-[var(--primary)]/30 bg-[var(--accent-soft)]/20" : ""
      }`}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <ItemMedia className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center shrink-0">
          <AppIcon icon={getDeviceIcon()} size="xs" />
        </ItemMedia>

        <ItemContent className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <ItemTitle className="text-xs font-bold text-[var(--foreground)]">
              {session.browser} on {session.os}
            </ItemTitle>

            {session.isCurrent && (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold py-0.2 px-1.5"
              >
                Current Session
              </Badge>
            )}
          </div>

          <ItemDescription className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5 flex-wrap">
            <span>Last active: {session.lastUsedFormatted}</span>
            {session.ipAddress && (
              <>
                <span className="text-[var(--border)]">•</span>
                <span>IP: {session.ipAddress}</span>
              </>
            )}
          </ItemDescription>
        </ItemContent>
      </div>

      <ItemActions className="shrink-0 self-end sm:self-center">
        {!session.isCurrent && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRevoke(session.id)}
            disabled={isRevoking}
            aria-label={`Sign out ${session.browser} on ${session.os} session`}
            className="text-[11px] font-semibold h-8 px-3 rounded-lg border-[var(--border)] text-destructive hover:bg-destructive/10 hover:border-destructive/30"
          >
            {isRevoking ? (
              <AppIcon icon={Loading03Icon} size="xxs" className="animate-spin" />
            ) : (
              <>
                <AppIcon icon={Logout03Icon} size="xxs" className="mr-1" />
                Sign Out
              </>
            )}
          </Button>
        )}
      </ItemActions>
    </Item>
  );
}
