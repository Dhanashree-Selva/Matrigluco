import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignalLens } from "../components/SignalLens";
import { renderWithProviders } from "../../../test/render";

describe("SignalLens Component", () => {
  it("renders view mode toggles and triggers mark all as read callback", async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    const onCategoryChange = vi.fn();
    const onMarkAllRead = vi.fn();

    renderWithProviders(
      <SignalLens
        view="all"
        category="all"
        unreadCount={3}
        onViewChange={onViewChange}
        onCategoryChange={onCategoryChange}
        onMarkAllRead={onMarkAllRead}
      />
    );

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Unread")).toBeInTheDocument();
    expect(screen.getByText("Needs Attention")).toBeInTheDocument();
    expect(screen.getByText("Mark all as read")).toBeInTheDocument();

    await user.click(screen.getByText("Mark all as read"));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it("does not render mark all as read button when unreadCount is 0", () => {
    renderWithProviders(
      <SignalLens
        view="all"
        category="all"
        unreadCount={0}
        onViewChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onMarkAllRead={vi.fn()}
      />
    );

    expect(screen.queryByText("Mark all as read")).not.toBeInTheDocument();
  });
});
