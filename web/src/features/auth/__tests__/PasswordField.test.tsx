import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordField } from "../components/PasswordField";

describe("PasswordField", () => {
  it("renders with default password type", () => {
    render(<PasswordField placeholder="Enter password" />);
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("toggles password visibility when button is clicked", () => {
    render(<PasswordField placeholder="Enter password" />);
    const input = screen.getByPlaceholderText("Enter password");
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    expect(input).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(input).toHaveAttribute("type", "password");
  });
});
