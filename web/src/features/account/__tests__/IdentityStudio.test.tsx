import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IdentityStudio } from "../components/profile/IdentityStudio";
import { AccountUser } from "../types/account.types";

describe("IdentityStudio Component", () => {
  const mockUser: AccountUser = {
    id: "u-1",
    email: "patient@matrigluco.org",
    fullName: "Priya Sharma",
    role: "user",
    status: "active",
    isEmailVerified: true,
    pregnancyWeek: 22,
    expectedDueDate: "2026-12-15",
    bloodGroup: "O+",
    previousPregnancies: 0,
  };

  it("renders profile identity fields with initial values", () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <IdentityStudio
        user={mockUser}
        onSave={onSave}
        isSaving={false}
      />
    );

    expect(screen.getByDisplayValue("Priya Sharma")).toBeInTheDocument();
    expect(screen.getByDisplayValue("22")).toBeInTheDocument();
    expect(screen.getByText(/Dec 15, 2026/i)).toBeInTheDocument();
    expect(screen.getAllByText("O+").length).toBeGreaterThan(0);
  });

  it("triggers save callback with updated identity payload when dirty", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <IdentityStudio
        user={mockUser}
        onSave={onSave}
        isSaving={false}
      />
    );

    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: "Priya Selva" } });

    const saveBtn = screen.getByRole("button", { name: /save profile changes/i });
    expect(saveBtn).not.toBeDisabled();

    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalled();
  });
});
