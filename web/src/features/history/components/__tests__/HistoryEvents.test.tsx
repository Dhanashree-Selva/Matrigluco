import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ReadingHistoryEvent } from "../ReadingHistoryEvent";
import { AssessmentHistoryEvent } from "../AssessmentHistoryEvent";
import { ReportHistoryEvent } from "../ReportHistoryEvent";
import { ConsultationHistoryEvent } from "../ConsultationHistoryEvent";
import { HistoryEventVM } from "../../types/history.types";

const mockEvent: HistoryEventVM = {
  id: "test-1",
  type: "measurement",
  occurredAt: "2026-08-18T10:00:00Z",
  resourceId: "123",
  title: "Glucose Reading",
  summary: "110 mg/dL",
  timeLabel: "10:00 AM",
  dateLabel: "Aug 18, 2026",
  monthYearKey: "2026-08",
  dateKey: "2026-08-18",
  deepLink: "/app/tracking",
  details: {
    metric_type: "glucose",
    value_primary: 110,
    unit: "mg/dL",
    notes: "Fasting morning test",
  },
};

describe("History Event Components", () => {
  it("renders ReadingHistoryEvent correctly", () => {
    render(
      <BrowserRouter>
        <ReadingHistoryEvent event={mockEvent} />
      </BrowserRouter>
    );

    expect(screen.getByText("Glucose Reading")).toBeInTheDocument();
    expect(screen.getByText("110 mg/dL")).toBeInTheDocument();
    expect(screen.getByText('"Fasting morning test"')).toBeInTheDocument();
    expect(screen.getByText("View in Tracking")).toBeInTheDocument();
  });

  it("renders AssessmentHistoryEvent with probability and model version", () => {
    const assessEvent: HistoryEventVM = {
      ...mockEvent,
      id: "assess-1",
      type: "assessment",
      title: "Risk Assessment — Moderate Risk",
      status: "moderate",
      deepLink: "/app/assessment/123",
      details: {
        probability_score: 0.42,
        model_version: "v1.2.0",
      },
    };

    render(
      <BrowserRouter>
        <AssessmentHistoryEvent event={assessEvent} />
      </BrowserRouter>
    );

    expect(screen.getByText("AI Risk Evaluation")).toBeInTheDocument();
    expect(screen.getByText("Moderate Risk")).toBeInTheDocument();
    expect(screen.getByText("42% Calculated Probability")).toBeInTheDocument();
    expect(screen.getByText("Model v1.2.0")).toBeInTheDocument();
    expect(screen.getByText("View Result")).toBeInTheDocument();
  });

  it("renders ReportHistoryEvent with file details", () => {
    const repEvent: HistoryEventVM = {
      ...mockEvent,
      id: "rep-1",
      type: "report",
      title: "Medical Report — Blood Test",
      deepLink: "/app/reports/123",
      details: {
        file_name: "lipid_panel.pdf",
        has_extracted_data: true,
      },
    };

    render(
      <BrowserRouter>
        <ReportHistoryEvent event={repEvent} />
      </BrowserRouter>
    );

    expect(screen.getByText("lipid_panel.pdf")).toBeInTheDocument();
    expect(screen.getByText("View Report")).toBeInTheDocument();
  });

  it("renders ConsultationHistoryEvent with doctor details", () => {
    const consultEvent: HistoryEventVM = {
      ...mockEvent,
      id: "consult-1",
      type: "consultation",
      title: "Doctor Appointment — Dr. Sharma",
      status: "scheduled",
      deepLink: "/app/consultations/123",
      details: {
        doctor_name: "Priya Sharma",
        specialty: "Obstetrics",
        appointment_time: "10:30 AM",
      },
    };

    render(
      <BrowserRouter>
        <ConsultationHistoryEvent event={consultEvent} />
      </BrowserRouter>
    );

    expect(screen.getByText("Doctor Consultation")).toBeInTheDocument();
    expect(screen.getByText(/Dr\. Priya Sharma/)).toBeInTheDocument();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText("View Session")).toBeInTheDocument();
  });
});
