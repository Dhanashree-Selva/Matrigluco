import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DangerZone } from "../components/privacy/DangerZone";

describe("DangerZone Component", () => {
  it("renders danger zone with delete account button", () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(<DangerZone onDeleteAccount={onDelete} isDeleting={false} />);

    expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete account/i })
    ).toBeInTheDocument();
  });

  it("opens confirmation dialog when delete account is clicked", () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(<DangerZone onDeleteAccount={onDelete} isDeleting={false} />);

    const deleteBtn = screen.getByRole("button", { name: /delete account/i });
    fireEvent.click(deleteBtn);

    expect(
      screen.getByText(/permanently delete your account\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /yes, delete my account/i })
    ).toBeInTheDocument();
  });
});
