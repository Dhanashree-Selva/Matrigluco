import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EvidenceDrawer } from "../components/EvidenceDrawer";
import { CitationSource } from "../types/assistant.types";
import { BrowserRouter } from "react-router-dom";

const mockSources: CitationSource[] = [
  {
    id: "cit-1",
    sourceIndex: 1,
    title: "Gestational Diabetes Clinical Guidance",
    sourceType: "knowledge",
    documentId: "gdm_guidelines_2026",
    isPrivateHealthContext: false,
  },
  {
    id: "cit-2",
    sourceIndex: 2,
    title: "Clinical Risk Assessment",
    sourceType: "assessment",
    documentId: "assessment_result_17aug",
    isPrivateHealthContext: true,
  },
];

describe("EvidenceDrawer", () => {
  it("renders evidence sources correctly", () => {
    const onOpenChange = vi.fn();

    render(
      <BrowserRouter>
        <EvidenceDrawer
          open={true}
          onOpenChange={onOpenChange}
          sources={mockSources}
          focusedIndex={1}
        />
      </BrowserRouter>
    );

    expect(screen.getAllByText(/Retrieved Evidence/i)[0]).toBeInTheDocument();
    expect(
      screen.getAllByText(/Gestational Diabetes Clinical Guidance/i)[0]
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Clinical Risk Assessment/i)[0]).toBeInTheDocument();
  });
});
