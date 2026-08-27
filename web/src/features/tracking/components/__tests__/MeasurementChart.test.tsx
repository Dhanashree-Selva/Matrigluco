import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MeasurementChart } from "../MeasurementChart";
import { MeasurementViewModel, ArithmeticTrendSummary } from "../../types/tracking.types";

const mockItems: MeasurementViewModel[] = [
  {
    id: "1",
    metricType: "glucose",
    valuePrimary: 102,
    unit: "mg/dL",
    measuredAt: "2026-08-15T08:00:00Z",
    source: "manual",
    createdAt: "2026-08-15T08:00:00Z",
    formattedValue: "102",
    formattedTime: "08:00 AM",
    formattedDate: "15 Aug",
  },
  {
    id: "2",
    metricType: "glucose",
    valuePrimary: 110,
    unit: "mg/dL",
    measuredAt: "2026-08-16T08:00:00Z",
    source: "manual",
    createdAt: "2026-08-16T08:00:00Z",
    formattedValue: "110",
    formattedTime: "08:00 AM",
    formattedDate: "16 Aug",
  },
];

const mockTrend: ArithmeticTrendSummary = {
  metricType: "glucose",
  unit: "mg/dL",
  readingCount: 2,
  latestValue: 110,
  previousValue: 102,
  valueDelta: 8,
  deltaDirection: "higher",
};

describe("MeasurementChart", () => {
  it("renders Empty state when there are fewer than 2 readings", () => {
    const onAdd = vi.fn();
    render(
      <MeasurementChart
        items={[]}
        selectedMetric="glucose"
        trend={{ metricType: "glucose", unit: "mg/dL", readingCount: 0 }}
        onAddReading={onAdd}
      />
    );

    expect(screen.getByText(/No glucose readings in this period/i)).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /Record Glucose/i });
    fireEvent.click(btn);
    expect(onAdd).toHaveBeenCalled();
  });

  it("renders trend headline and delta when readings exist", () => {
    render(
      <MeasurementChart
        items={mockItems}
        selectedMetric="glucose"
        trend={mockTrend}
        onAddReading={vi.fn()}
      />
    );

    expect(screen.getByText(/Fasting \/ Plasma Glucose over time/i)).toBeInTheDocument();
    expect(screen.getByText(/2 readings in selected scope/i)).toBeInTheDocument();
    expect(screen.getByText(/8 mg\/dL/i)).toBeInTheDocument();
  });
});
