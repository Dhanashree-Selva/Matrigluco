import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CareMatch } from "../components/CareMatch";

describe("CareMatch Component", () => {
  it("renders accredited clinicians list with names and titles", () => {
    render(
      <MemoryRouter>
        <CareMatch />
      </MemoryRouter>
    );

    expect(screen.getByText("Dr. Priya Sharma")).toBeInTheDocument();
    expect(screen.getByText("Dr. Meera Nair")).toBeInTheDocument();
    expect(screen.getByText("Dr. Anjali Verma")).toBeInTheDocument();
  });

  it("filters clinicians based on search input", () => {
    render(
      <MemoryRouter>
        <CareMatch />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search clinician name/i);
    fireEvent.change(searchInput, { target: { value: "Priya" } });

    expect(screen.getByText("Dr. Priya Sharma")).toBeInTheDocument();
    expect(screen.queryByText("Dr. Meera Nair")).not.toBeInTheDocument();
  });

  it("triggers onSelectDoctor callback when clicking Book Slot", () => {
    const handleSelectDoctor = vi.fn();

    render(
      <MemoryRouter>
        <CareMatch onSelectDoctor={handleSelectDoctor} />
      </MemoryRouter>
    );

    const bookButtons = screen.getAllByRole("button", { name: /book slot/i });
    expect(bookButtons.length).toBeGreaterThan(0);
    fireEvent.click(bookButtons[0]);

    expect(handleSelectDoctor).toHaveBeenCalledWith("dr-priya-sharma");
  });
});
