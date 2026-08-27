import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SignalFlowChart } from "../components/SignalFlowChart";
import { TrendPointVM } from "../types/dashboard.types";

describe("SignalFlowChart", () => {
  it("renders calm empty state when fewer than 2 points are provided", () => {
    render(
      <MemoryRouter>
        <SignalFlowChart points={[]} metricName="glucose" unit="mg/dL" />
      </MemoryRouter>
    );

    expect(screen.getByText("Metabolic Flow & Trends")).toBeDefined();
    expect(screen.getByText("Not enough readings to show trend")).toBeDefined();
    expect(screen.getByText("Add Reading")).toBeDefined();
  });

  it("renders trend header with measurement count when points exist", () => {
    const points: TrendPointVM[] = [
      { date: "2026-08-15", timestamp: 1786992000000, value: 92, formattedDate: "Aug 15", timeLabel: "8:00 AM" },
      { date: "2026-08-16", timestamp: 1787078400000, value: 96, formattedDate: "Aug 16", timeLabel: "8:00 AM" },
    ];

    render(
      <MemoryRouter>
        <SignalFlowChart points={points} metricName="glucose" unit="mg/dL" />
      </MemoryRouter>
    );

    expect(screen.getByText(/2 measurements recorded/i)).toBeDefined();
  });
});
