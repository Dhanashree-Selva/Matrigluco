import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SignalCapsule } from "../components/SignalCapsule";
import { SignalCapsuleVM } from "../types/dashboard.types";

describe("SignalCapsule", () => {
  it("renders metric value, unit, and recency when data is present", () => {
    const activeSignal: SignalCapsuleVM = {
      id: "glucose",
      label: "Blood Glucose",
      value: 102,
      unit: "mg/dL",
      measuredAt: "2026-08-18T08:00:00Z",
      recencyText: "Today, 8:00 AM",
      isMissing: false,
      logPath: "/track",
    };

    render(
      <MemoryRouter>
        <SignalCapsule signal={activeSignal} />
      </MemoryRouter>
    );

    expect(screen.getByText("Blood Glucose")).toBeDefined();
    expect(screen.getByText("102")).toBeDefined();
    expect(screen.getByText("mg/dL")).toBeDefined();
    expect(screen.getByText("Today, 8:00 AM")).toBeDefined();
  });

  it("renders missing state with Log button when value is missing", () => {
    const missingSignal: SignalCapsuleVM = {
      id: "blood_pressure",
      label: "Blood Pressure",
      value: null,
      unit: "mmHg",
      measuredAt: null,
      recencyText: "No reading yet",
      isMissing: true,
      logPath: "/track",
    };

    render(
      <MemoryRouter>
        <SignalCapsule signal={missingSignal} />
      </MemoryRouter>
    );

    expect(screen.getByText("Blood Pressure")).toBeDefined();
    expect(screen.getByText("No reading recorded")).toBeDefined();
    expect(screen.getByText("Log")).toBeDefined();
  });
});
