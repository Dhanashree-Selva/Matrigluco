import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReportCapsule } from "../ReportCapsule";
import { ReportViewModel } from "../../types/reports.types";

describe("ReportCapsule", () => {
  const queryClient = new QueryClient();

  const mockReport: ReportViewModel = {
    id: "rep-101",
    originalFilename: "Glucose_Tolerance_Test.pdf",
    fileType: "pdf",
    mimeType: "application/pdf",
    processingStatus: "extracted",
    reviewStatus: "needs_review",
    attachmentState: "done",
    uploadedAt: "2026-08-17T14:30:00Z",
    formattedDate: "Aug 17, 2026",
    formattedTime: "8:00 PM",
    extractedValues: [
      { key: "glucose", label: "Plasma Glucose", value: 142, unit: "mg/dL" },
    ],
    rawExtractedValues: { glucose: 142 },
  };

  it("renders report title, type, and extracted summary", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ReportCapsule report={mockReport} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Glucose_Tolerance_Test.pdf")).toBeInTheDocument();
    expect(screen.getByText("Review required")).toBeInTheDocument();
    expect(screen.getByText("Plasma Glucose:")).toBeInTheDocument();
    expect(screen.getByText(/142\s*mg\/dL/)).toBeInTheDocument();
    expect(screen.getByText("Review Extracted Data")).toBeInTheDocument();
  });
});
