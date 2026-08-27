import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "../PageHeader";

describe("PageHeader Component", () => {
  it("renders eyebrow, title, description, and action button slot", () => {
    render(
      <PageHeader
        eyebrow="Clinical Telemetry"
        title="Glucose & Blood Pressure"
        description="Review daily maternal parameters."
        action={<button>Add Measurement</button>}
      />
    );

    expect(screen.getByText("Clinical Telemetry")).toBeInTheDocument();
    expect(screen.getByText("Glucose & Blood Pressure")).toBeInTheDocument();
    expect(screen.getByText("Review daily maternal parameters.")).toBeInTheDocument();
    expect(screen.getByText("Add Measurement")).toBeInTheDocument();
  });
});
