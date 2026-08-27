import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionConstellation } from "../components/security/SessionConstellation";
import { SessionRecord } from "../types/account.types";

describe("SessionConstellation Component", () => {
  const mockSessions: SessionRecord[] = [
    {
      id: "s-1",
      publicId: "s-1",
      browser: "Chrome",
      os: "Windows",
      deviceType: "desktop",
      createdAt: "2026-08-10T10:00:00Z",
      lastUsedAt: "2026-08-18T10:00:00Z",
      lastUsedFormatted: "Active now",
      expiresAt: "2026-08-25T10:00:00Z",
      status: "active",
      isCurrent: true,
    },
    {
      id: "s-2",
      publicId: "s-2",
      browser: "Safari",
      os: "iOS",
      deviceType: "mobile",
      createdAt: "2026-08-12T10:00:00Z",
      lastUsedAt: "2026-08-18T08:00:00Z",
      lastUsedFormatted: "2 hours ago",
      expiresAt: "2026-08-25T10:00:00Z",
      status: "active",
      isCurrent: false,
    },
  ];

  it("renders current session with badge and other sessions with sign out button", () => {
    const onRevoke = vi.fn();
    const onSignOutOthers = vi.fn().mockResolvedValue(undefined);

    render(
      <SessionConstellation
        sessions={mockSessions}
        onRevokeSession={onRevoke}
        onSignOutOthers={onSignOutOthers}
      />
    );

    expect(screen.getByText("Current Session")).toBeInTheDocument();
    expect(screen.getByText(/chrome on windows/i)).toBeInTheDocument();
    expect(screen.getByText(/safari on ios/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign out safari on ios session/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign out of other sessions/i })
    ).toBeInTheDocument();
  });

  it("triggers revoke callback when clicking sign out for a device", () => {
    const onRevoke = vi.fn();
    const onSignOutOthers = vi.fn().mockResolvedValue(undefined);

    render(
      <SessionConstellation
        sessions={mockSessions}
        onRevokeSession={onRevoke}
        onSignOutOthers={onSignOutOthers}
      />
    );

    const signoutBtn = screen.getByRole("button", {
      name: /sign out safari on ios session/i,
    });
    fireEvent.click(signoutBtn);

    expect(onRevoke).toHaveBeenCalledWith("s-2");
  });
});
