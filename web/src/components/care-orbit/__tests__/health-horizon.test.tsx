import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HealthHorizon } from "../health-horizon";

describe("HealthHorizon component", () => {
  it("renders title, narrative, and eyebrow correctly", () => {
    render(
      <HealthHorizon
        eyebrow="Clinical Horizon"
        title="Your latest assessment shows low risk."
        narrative="Assessed on Aug 17, 2026."
      />
    );

    expect(screen.getByText("Clinical Horizon")).toBeInTheDocument();
    expect(
      screen.getByText("Your latest assessment shows low risk.")
    ).toBeInTheDocument();
    expect(screen.getByText("Assessed on Aug 17, 2026.")).toBeInTheDocument();
  });

  it("renders status badge when provided", () => {
    render(
      <HealthHorizon
        title="Assessment overview"
        narrative="Telemetry loaded"
        statusBadge={<span data-testid="status-badge">Low Risk</span>}
      />
    );

    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
  });
});
