import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CareHandshake } from "../components/booking/CareHandshake";
import { ConsultationRecord } from "../types/consultation.types";
import { ACCREDITED_CLINICIANS } from "../data/clinicians.data";

describe("CareHandshake Component", () => {
  const mockConsultation: ConsultationRecord = {
    id: "apt-handshake-123",
    patientName: "Sarah Jenkins",
    doctorName: "Dr. Priya Sharma",
    consultationType: "Video Consultation",
    appointmentDate: "2026-08-22",
    appointmentTime: "4:30 PM",
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

  it("renders confirmation title and clinician summary", () => {
    render(
      <MemoryRouter>
        <CareHandshake consultation={mockConsultation} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Your Care Episode Is Ready/i)).toBeInTheDocument();
    expect(screen.getByText("Dr. Priya Sharma")).toBeInTheDocument();
    expect(screen.getByText("Aug 22, 2026")).toBeInTheDocument();
    expect(screen.getByText("4:30 PM")).toBeInTheDocument();
  });

  it("triggers onViewEpisode when clicking View Care Episode", () => {
    const handleViewEpisode = vi.fn();

    render(
      <MemoryRouter>
        <CareHandshake
          consultation={mockConsultation}
          onViewEpisode={handleViewEpisode}
        />
      </MemoryRouter>
    );

    const viewButton = screen.getByRole("button", { name: /view care episode/i });
    fireEvent.click(viewButton);

    expect(handleViewEpisode).toHaveBeenCalled();
  });
});
