import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PatternSurface } from "../PatternSurface";

describe("PatternSurface Component", () => {
  it("renders children inside pattern container with tone styling", () => {
    render(
      <PatternSurface variant="dots" tone="soft">
        <span>Surface Content</span>
      </PatternSurface>
    );

    expect(screen.getByText("Surface Content")).toBeInTheDocument();
  });
});
