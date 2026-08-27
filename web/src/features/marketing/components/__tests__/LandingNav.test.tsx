import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { LandingNav } from "../LandingNav";
import { renderWithProviders } from "../../../../test/render";

describe("LandingNav Component", () => {
  it("renders brand logo and anchor navigation links", () => {
    renderWithProviders(<LandingNav />);

    expect(screen.getByText("Matrigluco")).toBeInTheDocument();
    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(screen.getByText("Assessment")).toBeInTheDocument();
    expect(screen.getByText("Tracking")).toBeInTheDocument();
    expect(screen.getByText("Local AI")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });
});
