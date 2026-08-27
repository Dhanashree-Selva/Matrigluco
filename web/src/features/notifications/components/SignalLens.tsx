import React from "react";
import {
  ToggleGroup,
  ToggleGroupItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  CheckmarkBadge01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import {
  NotificationCategory,
  SignalLensView,
} from "../types/notification.types";

interface SignalLensProps {
  view: SignalLensView;
  category: NotificationCategory;
  unreadCount: number;
  onViewChange: (view: SignalLensView) => void;
  onCategoryChange: (category: NotificationCategory) => void;
  onMarkAllRead: () => void;
  isMarkingAllRead?: boolean;
}

export function SignalLens({
  view,
  category,
  unreadCount,
  onViewChange,
  onCategoryChange,
  onMarkAllRead,
  isMarkingAllRead = false,
}: SignalLensProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* View Mode ToggleGroup */}
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(val) => val && onViewChange(val as SignalLensView)}
          className="bg-[var(--background)] p-0.5 rounded-xl border border-[var(--border)]"
        >
          <ToggleGroupItem
            value="all"
            className="px-3 py-1 text-xs font-bold rounded-lg data-[state=on]:bg-[var(--primary)] data-[state=on]:text-white text-[var(--muted-foreground)] cursor-pointer"
          >
            All
          </ToggleGroupItem>
          <ToggleGroupItem
            value="unread"
            className="px-3 py-1 text-xs font-bold rounded-lg data-[state=on]:bg-[var(--primary)] data-[state=on]:text-white text-[var(--muted-foreground)] cursor-pointer"
          >
            Unread
          </ToggleGroupItem>
          <ToggleGroupItem
            value="actionable"
            className="px-3 py-1 text-xs font-bold rounded-lg data-[state=on]:bg-[var(--primary)] data-[state=on]:text-white text-[var(--muted-foreground)] cursor-pointer"
          >
            Needs Attention
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Category Filter Select */}
        <div className="w-40">
          <Select
            value={category}
            onValueChange={(val) => onCategoryChange(val as NotificationCategory)}
          >
            <SelectTrigger className="h-8 text-xs font-medium rounded-xl border-[var(--border)] bg-[var(--background)]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[var(--border)]">
              <SelectItem value="all" className="text-xs">All Categories</SelectItem>
              <SelectItem value="reports" className="text-xs">Lab Reports</SelectItem>
              <SelectItem value="consultations" className="text-xs">Consultations</SelectItem>
              <SelectItem value="assessments" className="text-xs">Assessments</SelectItem>
              <SelectItem value="tracking" className="text-xs">Glucose Telemetry</SelectItem>
              <SelectItem value="account" className="text-xs">Account Security</SelectItem>
              <SelectItem value="system" className="text-xs">System Notices</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mark All Read Action */}
      {unreadCount > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onMarkAllRead}
          disabled={isMarkingAllRead}
          className="text-xs font-semibold h-8 rounded-xl border-[var(--border)] hover:bg-[var(--accent-soft)] hover:text-[var(--primary)] gap-1.5 self-end sm:self-auto cursor-pointer"
        >
          <AppIcon icon={CheckmarkBadge01Icon} size="xs" />
          <span>Mark all as read</span>
        </Button>
      )}
    </div>
  );
}
