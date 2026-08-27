import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssessmentValidationSummary } from "../AssessmentValidationSummary";
import { FieldValidationError } from "../../types/assessment-state.types";

describe("AssessmentValidationSummary", () => {
  const mockErrors: FieldValidationError[] = [
    {
      fieldKey: "glucose",
      stepId: "signals",
      label: "Fasting / Plasma Glucose",
      message: "Enter a value accepted by this assessment model.",
    },
    {
      fieldKey: "diabetesPedigreeFunction",
      stepId: "history",
      label: "Genetic Pedigree Function",
      message: "Genetic Pedigree Function is required.",
    },
  ];

  it("renders accessible alert with list of invalid fields", () => {
    render(<AssessmentValidationSummary errors={mockErrors} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Some information needs attention")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Fasting \/ Plasma Glucose/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Genetic Pedigree Function/i })).toBeInTheDocument();
  });

  it("triggers onJumpToField when clicking a field item", () => {
    const handleJump = vi.fn();
    render(<AssessmentValidationSummary errors={mockErrors} onJumpToField={handleJump} />);

    const glucoseBtn = screen.getByRole("button", { name: /Fasting \/ Plasma Glucose/i });
    fireEvent.click(glucoseBtn);

    expect(handleJump).toHaveBeenCalledWith("glucose", "signals");
  });

  it("renders nothing when errors list is empty", () => {
    const { container } = render(<AssessmentValidationSummary errors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
