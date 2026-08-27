import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConsultationJourney } from "../components/ConsultationJourney";

describe("ConsultationJourney Component", () => {
  it("renders all 4 care stages when active", () => {
    render(<ConsultationJourney currentStage="booked" />);

    expect(screen.getByText("Booked")).toBeInTheDocument();
    expect(screen.getByText("Prepare")).toBeInTheDocument();
    expect(screen.getByText("Consult")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("marks the current stage with aria-current step", () => {
    const { container } = render(<ConsultationJourney currentStage="prepare" />);
    const currentStep = container.querySelector('[aria-current="step"]');
    expect(currentStep).toBeInTheDocument();
    expect(currentStep).toHaveTextContent("Prepare");
  });

  it("renders cancellation notice when stage is cancelled", () => {
    render(<ConsultationJourney currentStage="cancelled" />);
    expect(screen.getByText("Care Episode Cancelled")).toBeInTheDocument();
  });
});
