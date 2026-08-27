import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TemporalLens } from "../TemporalLens";

describe("TemporalLens", () => {
  it("renders 7D, 30D, 90D presets, metric selector, and Quick Add button", () => {
    const onMetricChange = vi.fn();
    const onPeriodChange = vi.fn();
    const onCustomRangeChange = vi.fn();
    const onViewModeChange = vi.fn();
    const onOpenQuickAdd = vi.fn();

    render(
      <TemporalLens
        selectedMetric="glucose"
        onMetricChange={onMetricChange}
        selectedPeriod="30d"
        onPeriodChange={onPeriodChange}
        onCustomRangeChange={onCustomRangeChange}
        viewMode="chart"
        onViewModeChange={onViewModeChange}
        onOpenQuickAdd={onOpenQuickAdd}
      />
    );

    expect(screen.getByRole("radio", { name: /7D/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /30D/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /90D/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add reading/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Chart/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Records/i })).toBeInTheDocument();
  });

  it("calls onOpenQuickAdd when Add reading button is clicked", () => {
    const onOpenQuickAdd = vi.fn();

    render(
      <TemporalLens
        selectedMetric="glucose"
        onMetricChange={vi.fn()}
        selectedPeriod="30d"
        onPeriodChange={vi.fn()}
        onCustomRangeChange={vi.fn()}
        viewMode="chart"
        onViewModeChange={vi.fn()}
        onOpenQuickAdd={onOpenQuickAdd}
      />
    );

    const addBtn = screen.getByRole("button", { name: /Add reading/i });
    fireEvent.click(addBtn);
    expect(onOpenQuickAdd).toHaveBeenCalledWith("glucose");
  });
});
