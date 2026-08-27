import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppointmentComposer } from "../components/booking/AppointmentComposer";
import { ACCREDITED_CLINICIANS } from "../data/clinicians.data";
import * as useConsultationsModule from "../hooks/useConsultations";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("AppointmentComposer Component", () => {
  const clinician = ACCREDITED_CLINICIANS[0];

  beforeEach(() => {
    vi.spyOn(useConsultationsModule, "useConsultations").mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);
  });

  it("renders composer with doctor details and calendar", () => {
    const queryClient = createTestQueryClient();
    const futureDate = new Date(Date.now() + 86400000 * 2);

    render(
      <QueryClientProvider client={queryClient}>
        <AppointmentComposer clinician={clinician} initialDate={futureDate} />
      </QueryClientProvider>
    );

    expect(screen.getByText(clinician.name)).toBeInTheDocument();
    expect(screen.getByText(/1. Select Date/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Select Time Slot/i)).toBeInTheDocument();
  });

  it("enables Review Appointment button when a slot is chosen and shows review state", () => {
    const queryClient = createTestQueryClient();
    const futureDate = new Date(Date.now() + 86400000 * 2);

    render(
      <QueryClientProvider client={queryClient}>
        <AppointmentComposer clinician={clinician} initialDate={futureDate} />
      </QueryClientProvider>
    );

    // Pick a slot (e.g. 10:00 AM)
    const slotBtn = screen.getByRole("button", { name: "10:00 AM" });
    fireEvent.click(slotBtn);

    const reviewBtn = screen.getByRole("button", { name: /review appointment/i });
    expect(reviewBtn).not.toBeDisabled();
    fireEvent.click(reviewBtn);

    // Now in review state
    expect(screen.getByText(/Review Appointment Details/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm appointment/i })).toBeInTheDocument();
  });
});
