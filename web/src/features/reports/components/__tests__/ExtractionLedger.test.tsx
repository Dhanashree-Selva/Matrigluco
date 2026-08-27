import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExtractionLedger } from "../detail/ExtractionLedger";
import { ReportViewModel } from "../../types/reports.types";

describe("ExtractionLedger", () => {
  const queryClient = new QueryClient();

  const mockReport: ReportViewModel = {
    id: "rep-202",
    originalFilename: "Lab_Result_Aug.pdf",
    fileType: "pdf",
    mimeType: "application/pdf",
    processingStatus: "extracted",
    reviewStatus: "needs_review",
    attachmentState: "done",
    uploadedAt: "2026-08-17T14:30:00Z",
    formattedDate: "Aug 17, 2026",
    formattedTime: "8:00 PM",
    extractedValues: [
      { key: "glucose", label: "Plasma Glucose", value: 108, unit: "mg/dL" },
      { key: "hba1c", label: "Glycated Hemoglobin (HbA1c)", value: 5.6, unit: "%" },
    ],
    rawExtractedValues: { glucose: 108, hba1c: 5.6 },
  };

  it("renders biomarker rows and verification prompt", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ExtractionLedger report={mockReport} />
      </QueryClientProvider>
    );

    expect(screen.getByText("Plasma Glucose")).toBeInTheDocument();
    expect(screen.getByText("108")).toBeInTheDocument();
    expect(screen.getByText("Glycated Hemoglobin (HbA1c)")).toBeInTheDocument();
    expect(screen.getByText("5.6")).toBeInTheDocument();
    expect(screen.getByText("Confirm All as Verified")).toBeInTheDocument();
  });

  it("toggles edit mode when clicking Edit / Correct button", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ExtractionLedger report={mockReport} />
      </QueryClientProvider>
    );

    const editBtn = screen.getByText("Edit / Correct");
    fireEvent.click(editBtn);

    expect(screen.getByText("Save & Verify")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
