import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChronicleIndex } from "../ChronicleIndex";
import { ChronicleIndexMonth } from "../../types/history.types";

describe("ChronicleIndex", () => {
  const months: ChronicleIndexMonth[] = [
    { key: "2026-08", label: "AUG", year: "2026", fullLabel: "August 2026", hasData: true },
    { key: "2026-07", label: "JUL", year: "2026", fullLabel: "July 2026", hasData: true },
  ];

  it("renders all months and ALL timeline button", () => {
    const onSelect = vi.fn();
    render(<ChronicleIndex months={months} selectedMonth={undefined} onSelectMonth={onSelect} />);

    expect(screen.getByText("ALL")).toBeInTheDocument();
    expect(screen.getByText("AUG")).toBeInTheDocument();
    expect(screen.getByText("JUL")).toBeInTheDocument();
  });

  it("triggers onSelectMonth when clicking a month pill", () => {
    const onSelect = vi.fn();
    render(<ChronicleIndex months={months} selectedMonth={undefined} onSelectMonth={onSelect} />);

    const augBtn = screen.getByLabelText("View history for August 2026");
    fireEvent.click(augBtn);

    expect(onSelect).toHaveBeenCalledWith("2026-08");
  });
});
