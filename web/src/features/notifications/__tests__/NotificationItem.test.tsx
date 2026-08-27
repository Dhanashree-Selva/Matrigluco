import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { NotificationItem } from "../components/NotificationItem";
import { renderWithProviders } from "../../../test/render";
import { NotificationViewModel } from "../types/notification.types";

describe("NotificationItem Component", () => {
  const mockNotif: NotificationViewModel = {
    id: "notif-1",
    userId: "usr-1",
    title: "Consultation Reminder",
    message: "Your appointment starts at 11:30 AM.",
    type: "consultation_reminder",
    category: "consultations",
    targetRoute: "/app/consultations/c-1",
    actionLabel: "View appointment",
    isActionable: true,
    isRead: false,
    createdAt: new Date().toISOString(),
    createdAtFormatted: "Aug 18, 2026 · 11:00 AM",
    relativeTime: "30 min ago",
    sourceLabel: "Consultation",
  };

  it("renders notification title, source label, message, and action button", () => {
    renderWithProviders(
      <NotificationItem notification={mockNotif} onMarkRead={vi.fn()} />
    );

    expect(screen.getByText("Consultation Reminder")).toBeInTheDocument();
    expect(screen.getByText("Consultation")).toBeInTheDocument();
    expect(screen.getByText("Your appointment starts at 11:30 AM.")).toBeInTheDocument();
    expect(screen.getByText("View appointment")).toBeInTheDocument();
  });
});
