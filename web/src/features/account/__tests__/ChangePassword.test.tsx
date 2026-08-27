import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChangePassword } from "../components/security/ChangePassword";

describe("ChangePassword Component", () => {
  it("renders change password form with reveal buttons", () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(<ChangePassword onSave={onSave} isSaving={false} />);

    expect(screen.getByLabelText(/^current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument();
  });

  it("shows validation error when passwords do not match", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(<ChangePassword onSave={onSave} isSaving={false} />);

    fireEvent.change(screen.getByLabelText(/^current password/i), {
      target: { value: "CurrentSecret123" },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: "NewValidPassword1" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm new password/i), {
      target: { value: "DifferentPassword2" },
    });

    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
