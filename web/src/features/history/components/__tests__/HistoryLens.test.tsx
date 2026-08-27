import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HistoryLens } from "../HistoryLens";
import { ALL_HISTORY_SOURCES } from "../../config/history-sources.config";

describe("HistoryLens", () => {
  it("renders multi-source filter and view mode toggles", () => {
    const onTypesChange = vi.fn();
    const onDateRangeChange = vi.fn();
    const onViewModeChange = vi.fn();
    const onReset = vi.fn();

    render(
      <HistoryLens
        selectedTypes={ALL_HISTORY_SOURCES}
        onTypesChange={onTypesChange}
        onDateRangeChange={onDateRangeChange}
        viewMode="story"
        onViewModeChange={onViewModeChange}
        onReset={onReset}
        isFiltered={false}
      />
    );

    expect(screen.getByText("All Sources (4)")).toBeInTheDocument();
    expect(screen.getByText("Story")).toBeInTheDocument();
    expect(screen.getByText("Events")).toBeInTheDocument();
  });

  it("shows reset button when isFiltered is true", () => {
    const onReset = vi.fn();
    render(
      <HistoryLens
        selectedTypes={["assessment"]}
        onTypesChange={vi.fn()}
        onDateRangeChange={vi.fn()}
        viewMode="story"
        onViewModeChange={vi.fn()}
        onReset={onReset}
        isFiltered={true}
      />
    );

    const resetBtn = screen.getByText("Reset");
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalled();
  });
});
