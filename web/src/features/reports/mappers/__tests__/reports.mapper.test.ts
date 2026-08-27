import { describe, it, expect } from "vitest";
import {
  formatBytes,
  detectFileType,
  mapRawBiomarkers,
  mapApiToReportViewModel,
} from "../reports.mapper";

describe("reports.mapper", () => {
  it("formats byte sizes into readable units", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1024 * 150)).toBe("150.0 KB");
    expect(formatBytes(1024 * 1024 * 3.5)).toBe("3.5 MB");
    expect(formatBytes(0)).toBe("—");
    expect(formatBytes(undefined)).toBe("—");
  });

  it("detects file types accurately", () => {
    expect(detectFileType("lab_report.pdf")).toBe("pdf");
    expect(detectFileType("scan.jpg")).toBe("image");
    expect(detectFileType("photo.png")).toBe("image");
    expect(detectFileType("prescription.webp")).toBe("image");
    expect(detectFileType("doc.txt")).toBe("document");
  });

  it("maps raw biomarker dictionary to canonical display rows", () => {
    const raw = {
      glucose: 104.5,
      hba1c: 5.8,
      bp_systolic: 120,
      custom_marker: "Negative",
      _is_reviewed: true,
    };

    const mapped = mapRawBiomarkers(raw);
    expect(mapped.length).toBe(4);

    const glucose = mapped.find((b) => b.key === "glucose");
    expect(glucose?.label).toBe("Plasma Glucose");
    expect(glucose?.unit).toBe("mg/dL");
    expect(glucose?.value).toBe(104.5);

    const hba1c = mapped.find((b) => b.key === "hba1c");
    expect(hba1c?.label).toContain("HbA1c");
    expect(hba1c?.unit).toBe("%");

    const custom = mapped.find((b) => b.key === "custom_marker");
    expect(custom?.label).toBe("Custom Marker");
  });

  it("maps raw report API response to ReportViewModel", () => {
    const apiItem = {
      id: "rep-123",
      file_name: "blood_test_w24.pdf",
      file_url: "file-asset-456",
      extracted_values: {
        glucose: 110,
        hba1c: 5.7,
      },
      uploaded_at: "2026-08-17T14:30:00Z",
    };

    const vm = mapApiToReportViewModel(apiItem);
    expect(vm.id).toBe("rep-123");
    expect(vm.originalFilename).toBe("blood_test_w24.pdf");
    expect(vm.fileType).toBe("pdf");
    expect(vm.processingStatus).toBe("extracted");
    expect(vm.reviewStatus).toBe("needs_review");
    expect(vm.extractedValues.length).toBe(2);
    expect(vm.formattedDate).toContain("2026");
  });
});
