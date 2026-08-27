import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionHorizon } from "../components/ActionHorizon";
import { renderWithProviders } from "../../../test/render";
import { NotificationViewModel } from "../types/notification.types";

describe("ActionHorizon Component", () => {
  const mockItems: NotificationViewModel[] = [
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
  ];

  it("renders Action Horizon heading and actionable button", () => {
    renderWithProviders(<ActionHorizon items={mockItems} />);

    expect(screen.getByText("Action Horizon")).toBeInTheDocument();
    expect(screen.getByText("1 Requires Attention")).toBeInTheDocument();
    expect(screen.getByText("Report Ready for Review")).toBeInTheDocument();
    expect(screen.getByText("Review report")).toBeInTheDocument();
  });

  it("returns null if items array is empty", () => {
    const { container } = renderWithProviders(<ActionHorizon items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
