import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProcessingRibbon } from "../ProcessingRibbon";

describe("ProcessingRibbon", () => {
  it("renders all 4 stages with appropriate labels", () => {
    render(<ProcessingRibbon status="extracted" />);

    expect(screen.getByText("Uploaded")).toBeInTheDocument();
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("Extracted")).toBeInTheDocument();
    expect(screen.getByText("Reviewed")).toBeInTheDocument();
  });

  it("sets accessible aria-label for workflow state", () => {
    const { container } = render(<ProcessingRibbon status="reviewed" />);
    const ribbon = container.querySelector('[aria-label="Workflow state: reviewed"]');
    expect(ribbon).toBeInTheDocument();
  });
});
