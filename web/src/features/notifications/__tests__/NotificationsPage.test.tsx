import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { NotificationsPage } from "../pages/NotificationsPage";
import { renderWithProviders } from "../../../test/render";

vi.mock("../hooks/useNotifications", () => ({
  useNotifications: vi.fn(() => ({
    notifications: [
      {
        id: "notif-1",
        userId: "usr-1",
        title: "Report Ready for Review",
        message: "Your lab report extraction is ready.",
        type: "report_ready",
        category: "reports",
        targetRoute: "/app/reports/rep-1",
        actionLabel: "Review report",
        isActionable: true,
        isRead: false,
        createdAt: new Date().toISOString(),
        createdAtFormatted: "Aug 18, 2026",
        relativeTime: "10 min ago",
        sourceLabel: "Lab Report",
      },
    ],
    actionHorizonItems: [
      {
        id: "notif-1",
        userId: "usr-1",
        title: "Report Ready for Review",
        message: "Your lab report extraction is ready.",
        type: "report_ready",
        category: "reports",
        targetRoute: "/app/reports/rep-1",
        actionLabel: "Review report",
        isActionable: true,
        isRead: false,
        createdAt: new Date().toISOString(),
        createdAtFormatted: "Aug 18, 2026",
        relativeTime: "10 min ago",
        sourceLabel: "Lab Report",
      },
    ],
    signalDateGroups: [
      {
        dateLabel: "Today",
        items: [
          {
            kind: "single",
            notification: {
              id: "notif-1",
              userId: "usr-1",
              title: "Report Ready for Review",
              message: "Your lab report extraction is ready.",
              type: "report_ready",
              category: "reports",
              targetRoute: "/app/reports/rep-1",
              actionLabel: "Review report",
              isActionable: true,
              isRead: false,
              createdAt: new Date().toISOString(),
              createdAtFormatted: "Aug 18, 2026",
              relativeTime: "10 min ago",
              sourceLabel: "Lab Report",
            },
          },
        ],
      },
    ],
    unreadCount: 1,
    total: 1,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  })),
}));

describe("NotificationsPage Component", () => {
  it("renders Care Signal Center header, Action Horizon, Signal Lens, and stream", () => {
    renderWithProviders(<NotificationsPage />);

    expect(screen.getByText("Care Signal Center")).toBeInTheDocument();
    expect(screen.getByText("Action Horizon")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getAllByText("Unread").length).toBeGreaterThan(0);
    expect(screen.getByText("Signal Overview")).toBeInTheDocument();
  });
});
