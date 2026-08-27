import {
  NotificationViewModel,
  EpisodeBundleModel,
  SignalDateGroupModel,
} from "../types/notification.types";
import { isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from "date-fns";

/**
 * Identifies notifications sharing the same resourceId and resourceType
 * and bundles them into an EpisodeBundle if count >= 2.
 */
export function bundleEpisodeNotifications(
  notifications: NotificationViewModel[]
): Array<
  | { kind: "single"; notification: NotificationViewModel }
  | { kind: "bundle"; bundle: EpisodeBundleModel }
> {
  const resourceGroups = new Map<string, NotificationViewModel[]>();

  // Pass 1: Bucket by resourceKey (only if resourceType & resourceId exist)
  for (const notif of notifications) {
    if (notif.resourceType && notif.resourceId) {
      const key = `${notif.resourceType}:${notif.resourceId}`;
      const existing = resourceGroups.get(key) || [];
      existing.push(notif);
      resourceGroups.set(key, existing);
    }
  }

  const result: Array<
    | { kind: "single"; notification: NotificationViewModel }
    | { kind: "bundle"; bundle: EpisodeBundleModel }
  > = [];

  const processedBundleKeys = new Set<string>();

  // Pass 2: Iterate through chronological items
  for (const notif of notifications) {
    if (notif.resourceType && notif.resourceId) {
      const key = `${notif.resourceType}:${notif.resourceId}`;
      const group = resourceGroups.get(key);

      if (group && group.length >= 2) {
        if (!processedBundleKeys.has(key)) {
          processedBundleKeys.add(key);

          // Group sorted descending by created date
          const sorted = [...group].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const latest = sorted[0];
          const isAllRead = sorted.every((n) => n.isRead);

          result.push({
            kind: "bundle",
            bundle: {
              episodeKey: key,
              resourceType: latest.resourceType!,
              resourceId: latest.resourceId!,
              category: latest.category,
              title: `${latest.sourceLabel} · Activity Episode`,
              latestNotification: latest,
              notifications: sorted,
              isAllRead,
              count: sorted.length,
            },
          });
        }
        continue;
      }
    }

    result.push({
      kind: "single",
      notification: notif,
    });
  }

  return result;
}

/**
 * Groups bundled or single notification items into chronological date buckets.
 */
export function groupSignalsByDate(
  items: Array<
    | { kind: "single"; notification: NotificationViewModel }
    | { kind: "bundle"; bundle: EpisodeBundleModel }
  >
): SignalDateGroupModel[] {
  const groupsMap = new Map<string, typeof items>();

  const getBucketLabel = (dateStr: string): string => {
    try {
      const parsed = parseISO(dateStr);
      if (isToday(parsed)) return "Today";
      if (isYesterday(parsed)) return "Yesterday";
      if (isThisWeek(parsed)) return "Earlier this week";
      if (isThisMonth(parsed)) return "Earlier this month";
      return "Prior Signals";
    } catch {
      return "Recent Signals";
    }
  };

  for (const item of items) {
    const dateRef =
      item.kind === "single"
        ? item.notification.createdAt
        : item.bundle.latestNotification.createdAt;

    const label = getBucketLabel(dateRef);
    const existing = groupsMap.get(label) || [];
    existing.push(item);
    groupsMap.set(label, existing);
  }

  const chronologicalBuckets = [
    "Today",
    "Yesterday",
    "Earlier this week",
    "Earlier this month",
    "Prior Signals",
    "Recent Signals",
  ];

  const result: SignalDateGroupModel[] = [];

  for (const bucket of chronologicalBuckets) {
    const list = groupsMap.get(bucket);
    if (list && list.length > 0) {
      result.push({
        dateLabel: bucket,
        items: list,
      });
    }
  }

  return result;
}
