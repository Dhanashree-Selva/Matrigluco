import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ConsultationDetailPage from "../pages/ConsultationDetailPage";
import * as useConsultationModule from "../hooks/useConsultation";
import { ConsultationRecord } from "../types/consultation.types";
import { ACCREDITED_CLINICIANS } from "../data/clinicians.data";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("ConsultationDetailPage Component", () => {
  const mockConsultation: ConsultationRecord = {
    id: "test-apt-id-12345",
    patientName: "Sarah Jenkins",
    doctorName: "Dr. Priya Sharma",
    consultationType: "Video Consultation",
    appointmentDate: "2026-08-22",
    appointmentTime: "4:30 PM",
    symptoms: "Discuss fasting blood glucose targets",
    status: "booked",
    stage: "booked",
    stageLabel: "Scheduled",
    mode: "video",
    clinician: ACCREDITED_CLINICIANS[0],
    formattedDate: "Aug 22, 2026",
    formattedTime: "4:30 PM",
    fullDateTimeFormatted: "Aug 22, 2026 · 4:30 PM",
    isJoinable: false,
    isPast: false,
  };

  it("renders consultation detail with Care Episode header and preparation panel", () => {
    vi.spyOn(useConsultationModule, "useConsultation").mockReturnValue({
      data: mockConsultation,
      isLoading: false,
      isError: false,
    } as any);

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app/consultations/test-apt-id-12345"]}>
          <Routes>
            <Route path="/app/consultations/:id" element={<ConsultationDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Consultation with Dr. Priya Sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/Pre-Consultation Preparation/i)).toBeInTheDocument();
    expect(screen.getByText(/Visit Context/i)).toBeInTheDocument();
    expect(screen.getByText(/Discuss fasting blood glucose targets/i)).toBeInTheDocument();
  });
});
