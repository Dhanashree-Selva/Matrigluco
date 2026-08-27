import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EpisodeBundle } from "../components/EpisodeBundle";
import { renderWithProviders } from "../../../test/render";
import { EpisodeBundleModel } from "../types/notification.types";

describe("EpisodeBundle Component", () => {
  const mockBundle: EpisodeBundleModel = {
    episodeKey: "report:rep-1",
    resourceType: "report",
    resourceId: "rep-1",
    category: "reports",
    title: "Lab Report · Activity Episode",
    latestNotification: {
      id: "notif-2",
      userId: "usr-1",
      title: "Ready for Review",
      message: "Processing completed.",
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
    notifications: [
      {
        id: "notif-2",
        userId: "usr-1",
        title: "Ready for Review",
        message: "Processing completed.",
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
      {
        id: "notif-1",
        userId: "usr-1",
        title: "Report Uploaded",
        message: "Extraction started.",
        type: "report_processed",
        category: "reports",
        isActionable: false,
        isRead: true,
        createdAt: new Date().toISOString(),
        createdAtFormatted: "Aug 18, 2026",
        relativeTime: "25 min ago",
        sourceLabel: "Lab Report",
      },
    ],
    isAllRead: false,
    count: 2,
  };

  it("renders Episode Bundle bar with update count and expands on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EpisodeBundle bundle={mockBundle} onMarkRead={vi.fn()} />);

    expect(screen.getByText("Episode Bundle")).toBeInTheDocument();
    expect(screen.getByText(/2 updates/)).toBeInTheDocument();
    expect(screen.getByText(/Ready for Review/)).toBeInTheDocument();

    const detailsBtn = screen.getByRole("button", { name: /Expand 2 episode updates/i });
    await user.click(detailsBtn);

    expect(screen.getByText("Report Uploaded")).toBeInTheDocument();
  });
});
