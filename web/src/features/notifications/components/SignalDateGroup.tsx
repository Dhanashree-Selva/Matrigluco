import React from "react";
import { ItemGroup } from "../../../shared/ui";
import { SignalDateGroupModel } from "../types/notification.types";
import { NotificationItem } from "./NotificationItem";
import { EpisodeBundle } from "./EpisodeBundle";

interface SignalDateGroupProps {
  group: SignalDateGroupModel;
  onMarkRead: (id: string) => void;
}

export function SignalDateGroup({ group, onMarkRead }: SignalDateGroupProps) {
  return (
    <section aria-label={`Signals from ${group.dateLabel}`} className="space-y-2.5">
      <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted-foreground)] px-1">
        {group.dateLabel}
      </h2>

      <ItemGroup className="gap-2.5">
        {group.items.map((item) => {
          if (item.kind === "bundle") {
            return (
              <EpisodeBundle
                key={item.bundle.episodeKey}
                bundle={item.bundle}
                onMarkRead={onMarkRead}
              />
            );
          }

          return (
            <NotificationItem
              key={item.notification.id}
              notification={item.notification}
              onMarkRead={onMarkRead}
            />
          );
        })}
      </ItemGroup>
    </section>
  );
}
