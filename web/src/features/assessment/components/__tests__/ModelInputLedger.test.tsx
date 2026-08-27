import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModelInputLedger } from "../ModelInputLedger";
import { AssessmentFormValues } from "../../types/assessment.types";

describe("ModelInputLedger Component", () => {
  const formValues: AssessmentFormValues = {
    age: "29",
    pregnancies: "1",
    glucose: "102",
    bloodPressure: "72",
    skinThickness: "23",
    insulin: "85",
    bmi: "24.3",
    diabetesPedigreeFunction: "0.45",
  };

  it("renders all 8 canonical features with formatted units in structured rows", () => {
    const onEdit = vi.fn();
    render(<ModelInputLedger formValues={formValues} onEditField={onEdit} />);

    expect(screen.getByText("Personal Context")).toBeInTheDocument();
    expect(screen.getByText("Clinical Signals")).toBeInTheDocument();
    expect(screen.getByText("Body & Metabolic")).toBeInTheDocument();
    expect(screen.getByText("History Context")).toBeInTheDocument();

    expect(screen.getByText("102 mg/dL")).toBeInTheDocument();
    expect(screen.getByText("72 mmHg")).toBeInTheDocument();
    expect(screen.getByText("24.3 kg/m²")).toBeInTheDocument();
    expect(screen.getByText("0.45 score")).toBeInTheDocument();
  });

  it("invokes onEditField callback when Edit button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<ModelInputLedger formValues={formValues} onEditField={onEdit} />);

    const editGlucoseBtn = screen.getByRole("button", {
      name: /Edit Fasting \/ Plasma Glucose/i,
    });
    await user.click(editGlucoseBtn);

    expect(onEdit).toHaveBeenCalledWith("glucose");
  });
});
