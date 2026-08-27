import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "../../../../shared/ui";
import AssessmentPage from "../AssessmentPage";

describe("AssessmentPage State Machine & Form Contract", () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={0}>
          <MemoryRouter>{children}</MemoryRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  };

  it("renders orientation intro surface initially in PRISTINE state", () => {
    render(<AssessmentPage />, { wrapper: createWrapper() });

    expect(
      screen.getByRole("heading", { name: /Gestational Diabetes Risk Evaluation/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Begin Assessment Path/i })
    ).toBeInTheDocument();
  });

  it("transitions to Step 1 upon clicking Begin Assessment Path with upfront field rationales", async () => {
    const user = userEvent.setup();
    render(<AssessmentPage />, { wrapper: createWrapper() });

    const beginBtn = screen.getByRole("button", { name: /Begin Assessment Path/i });
    await user.click(beginBtn);

    expect(
      screen.getByRole("heading", { name: /Maternal Demographic Baseline/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /^Maternal Age/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /^Total Prior \/ Current Pregnancies/i })
    ).toBeInTheDocument();

    // Upfront technical rationale is rendered without requiring focus or failure
    expect(
      screen.getByText(/accepted model range: 15–110 years/i)
    ).toBeInTheDocument();
  });

  it("transitions to INVALID and displays Accessible Validation Summary on invalid step continue", async () => {
    const user = userEvent.setup();
    render(<AssessmentPage />, { wrapper: createWrapper() });

    const beginBtn = screen.getByRole("button", { name: /Begin Assessment Path/i });
    await user.click(beginBtn);

    // Attempt to continue without entering age or pregnancies
    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    await user.click(continueBtn);

    expect(
      screen.getByText("Some information needs attention")
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("alert").length
    ).toBeGreaterThan(0);
  });

  it("preserves entered data while typing and navigating", async () => {
    const user = userEvent.setup();
    render(<AssessmentPage />, { wrapper: createWrapper() });

    await user.click(screen.getByRole("button", { name: /Begin Assessment Path/i }));

    const ageInput = screen.getByRole("textbox", { name: /^Maternal Age/i });
    await user.type(ageInput, "28");

    const pregInput = screen.getByRole("textbox", { name: /^Total Prior \/ Current Pregnancies/i });
    await user.type(pregInput, "1");

    expect(ageInput).toHaveValue("28");
    expect(pregInput).toHaveValue("1");

    // Advance to Step 2
    await user.click(screen.getByRole("button", { name: /Continue/i }));

    expect(
      screen.getByRole("heading", { name: /Glucose & Blood Pressure/i })
    ).toBeInTheDocument();

    // Go back to Step 1 and verify data is still preserved
    await user.click(screen.getByRole("button", { name: /Previous/i }));

    expect(screen.getByRole("textbox", { name: /^Maternal Age/i })).toHaveValue("28");
    expect(screen.getByRole("textbox", { name: /^Total Prior \/ Current Pregnancies/i })).toHaveValue("1");
  });
});
