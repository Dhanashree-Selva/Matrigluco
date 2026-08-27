import React from "react";
import { SignalDateGroupModel, SignalLensView } from "../types/notification.types";
import { SignalDateGroup } from "./SignalDateGroup";
import { NotificationsEmptyState } from "./NotificationsEmptyState";

interface SignalStreamProps {
  groups: SignalDateGroupModel[];
  onMarkRead: (id: string) => void;
  view: SignalLensView;
  isFiltered: boolean;
  onClearFilters: () => void;
}

export function SignalStream({
  groups,
  onMarkRead,
  view,
  isFiltered,
  onClearFilters,
}: SignalStreamProps) {
  if (!groups || groups.length === 0) {
    return (
      <NotificationsEmptyState
        view={view}
        isFiltered={isFiltered}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <SignalDateGroup
          key={group.dateLabel}
          group={group}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}
