import { describe, it, expect } from "vitest";
import {
  bundleEpisodeNotifications,
  groupSignalsByDate,
} from "../utils/notification-groups";
import { NotificationViewModel } from "../types/notification.types";

describe("notification-groups and episode bundling", () => {
  const baseItem: NotificationViewModel = {
    id: "notif-1",
    userId: "usr-1",
    title: "Report Uploaded",
    message: "Report uploaded successfully.",
    type: "report_processed",
    category: "reports",
    resourceType: "report",
    resourceId: "rep-100",
    isActionable: false,
    isRead: true,
    createdAt: new Date().toISOString(),
    createdAtFormatted: "Today",
    relativeTime: "10 min ago",
    sourceLabel: "Lab Report",
  };

  it("bundles notifications sharing the same resourceId into an EpisodeBundle when count >= 2", () => {
    const item1: NotificationViewModel = {
      ...baseItem,
      id: "n-1",
      title: "Report Uploaded",
      createdAt: "2026-08-18T10:00:00Z",
    };
    const item2: NotificationViewModel = {
      ...baseItem,
      id: "n-2",
      title: "Report Ready for Review",
      type: "report_ready",
      targetRoute: "/app/reports/rep-100",
      isActionable: true,
      isRead: false,
      createdAt: "2026-08-18T10:05:00Z",
    };

    const bundled = bundleEpisodeNotifications([item2, item1]);

    expect(bundled.length).toBe(1);
    expect(bundled[0].kind).toBe("bundle");
    if (bundled[0].kind === "bundle") {
      expect(bundled[0].bundle.count).toBe(2);
      expect(bundled[0].bundle.latestNotification.title).toBe("Report Ready for Review");
      expect(bundled[0].bundle.isAllRead).toBe(false);
    }
  });

  it("does not bundle notifications with different resource IDs", () => {
    const item1: NotificationViewModel = {
      ...baseItem,
      id: "n-1",
      resourceId: "rep-100",
    };
    const item2: NotificationViewModel = {
      ...baseItem,
      id: "n-2",
      resourceId: "rep-200",
    };

    const bundled = bundleEpisodeNotifications([item1, item2]);

    expect(bundled.length).toBe(2);
    expect(bundled[0].kind).toBe("single");
    expect(bundled[1].kind).toBe("single");
  });

  it("groups signals into chronological date buckets", () => {
    const today = new Date().toISOString();
    const item: NotificationViewModel = {
      ...baseItem,
      createdAt: today,
    };

    const grouped = groupSignalsByDate([{ kind: "single", notification: item }]);

    expect(grouped.length).toBeGreaterThan(0);
    expect(grouped[0].dateLabel).toBe("Today");
  });
});
