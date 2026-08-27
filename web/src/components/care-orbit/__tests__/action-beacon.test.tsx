import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionBeacon } from "../action-beacon";

describe("ActionBeacon component", () => {
  it("renders primary action label and triggers onClick callback", () => {
    const handleClick = vi.fn();
    render(
      <ActionBeacon
        label="Start Assessment"
        sublabel="Takes 2 minutes"
        onClick={handleClick}
      />
    );

    expect(screen.getByText("Start Assessment")).toBeInTheDocument();
    expect(screen.getByText("Takes 2 minutes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders secondary variant cleanly", () => {
    const handleClick = vi.fn();
    render(
      <ActionBeacon
        label="View Telemetry"
        onClick={handleClick}
        variant="secondary"
      />
    );

    expect(screen.getByText("View Telemetry")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
