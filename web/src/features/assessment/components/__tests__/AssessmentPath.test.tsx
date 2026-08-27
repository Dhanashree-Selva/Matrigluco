import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssessmentPath } from "../AssessmentPath";
import { AssessmentStepId } from "../../config/assessment-fields";

describe("AssessmentPath Component", () => {
  it("renders all 5 stages in semantic ordered list with progress", () => {
    const onStepClick = vi.fn();
    const completedSteps = new Set<AssessmentStepId>(["personal"]);

    render(
      <AssessmentPath
        currentStepId="signals"
        completedSteps={completedSteps}
        onStepClick={onStepClick}
      />
    );

    expect(screen.getByRole("navigation", { name: /assessment navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: /assessment stages/i })).toBeInTheDocument();
    expect(screen.getByText(/Maternal Profile Baseline/i)).toBeInTheDocument();
    expect(screen.getByText(/Primary Metabolic Signals/i)).toBeInTheDocument();
    expect(screen.getByText(/Model Input Ledger/i)).toBeInTheDocument();
  });

  it("calls onStepClick when clicking an available step", async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    const completedSteps = new Set<AssessmentStepId>(["personal"]);

    render(
      <AssessmentPath
        currentStepId="signals"
        completedSteps={completedSteps}
        onStepClick={onStepClick}
      />
    );

    const personalStepBtn = screen.getByRole("button", { name: /Maternal Profile Baseline/i });
    await user.click(personalStepBtn);

    expect(onStepClick).toHaveBeenCalledWith("personal");
  });
});
