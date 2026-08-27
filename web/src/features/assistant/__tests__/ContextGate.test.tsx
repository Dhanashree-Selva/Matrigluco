import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ContextGate } from "../components/ContextGate";

describe("ContextGate", () => {
  it("renders with checkbox unchecked and submit disabled by default", () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    render(
      <ContextGate
        resourceLabel="Risk Assessment Result"
        onAcceptConsent={onAccept}
        onDeclineConsent={onDecline}
      />
    );

    expect(
      screen.getByText(/Use my Matrigluco health context for this conversation\?/i)
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", {
      name: /Continue with health context/i,
    });
    expect(submitBtn).toBeDisabled();

    const declineBtn = screen.getByRole("button", {
      name: /Continue without health context/i,
    });
    expect(declineBtn).toBeEnabled();
  });

  it("enables submit when checkbox is explicitly checked", () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    render(
      <ContextGate
        resourceLabel="Risk Assessment Result"
        onAcceptConsent={onAccept}
        onDeclineConsent={onDecline}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole("button", {
      name: /Continue with health context/i,
    });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});
