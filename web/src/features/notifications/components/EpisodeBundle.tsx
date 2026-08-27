import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Button,
  Badge,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Layers01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { EpisodeBundleModel } from "../types/notification.types";
import { NotificationItem } from "./NotificationItem";
import { NotificationActions } from "./NotificationActions";

interface EpisodeBundleProps {
  bundle: EpisodeBundleModel;
  onMarkRead: (id: string) => void;
}

export function EpisodeBundle({ bundle, onMarkRead }: EpisodeBundleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const latest = bundle.latestNotification;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 shadow-2xs overflow-hidden transition-all">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Bundle Summary Bar */}
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
              <AppIcon icon={Layers01Icon} size="xs" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-wider py-0 px-2 rounded-md border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                >
                  Episode Bundle
                </Badge>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  {bundle.count} updates · latest {latest.relativeTime}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate mt-0.5">
                {bundle.title} — {latest.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {latest.targetRoute && (
              <NotificationActions
                notification={latest}
                onMarkRead={onMarkRead}
              />
            )}

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] gap-1"
                aria-label={isOpen ? "Collapse episode updates" : `Expand ${bundle.count} episode updates`}
              >
                <span>{isOpen ? "Hide" : "Details"}</span>
                <AppIcon
                  icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
                  size="xxs"
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        {/* Collapsible Children List */}
        <CollapsibleContent className="border-t border-[var(--border)] p-3 sm:p-4 bg-[var(--background)]/50 space-y-2.5">
          {bundle.notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={onMarkRead}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
