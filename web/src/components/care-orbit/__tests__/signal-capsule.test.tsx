import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignalCapsule } from "../signal-capsule";

describe("SignalCapsule component", () => {
  it("renders metric label, value, and unit in regular variant", () => {
    render(
      <SignalCapsule
        label="Blood Glucose"
        value={102}
        unit="mg/dL"
        contextLabel="Fasting"
        timestamp="8:20 AM"
      />
    );

    expect(screen.getByText("Blood Glucose")).toBeInTheDocument();
    expect(screen.getByText("102")).toBeInTheDocument();
    expect(screen.getByText("mg/dL")).toBeInTheDocument();
    expect(screen.getByText("Fasting")).toBeInTheDocument();
    expect(screen.getByText("8:20 AM")).toBeInTheDocument();
  });

  it("renders compact pill variant correctly", () => {
    render(
      <SignalCapsule
        label="BMI"
        value="24.2"
        unit="kg/m²"
        variant="compact"
      />
    );

    expect(screen.getByText("BMI:")).toBeInTheDocument();
    expect(screen.getByText("24.2")).toBeInTheDocument();
    expect(screen.getByText("kg/m²")).toBeInTheDocument();
  });
});
