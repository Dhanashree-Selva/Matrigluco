import { useMemo } from "react";
import { generateDayTimeSlots, formatDateToIsoDateOnly } from "../utils/consultation-dates";
import { TimeSlot } from "../types/consultation.types";
import { useConsultations } from "./useConsultations";

export function useAvailability(clinicianName?: string, selectedDate?: Date) {
  const { data: existingConsultations = [] } = useConsultations();

  const slots = useMemo<TimeSlot[]>(() => {
    if (!selectedDate) return [];

    const isoDate = formatDateToIsoDateOnly(selectedDate);

    // Collect already booked slots for this doctor and date
    const booked = existingConsultations
      .filter((c) => {
        const matchesDoctor = !clinicianName || c.doctorName.toLowerCase() === clinicianName.toLowerCase();
        const matchesDate = c.appointmentDate === isoDate;
        const isActive = c.stage !== "cancelled";
        return matchesDoctor && matchesDate && isActive;
      })
      .map((c) => c.appointmentTime);

    return generateDayTimeSlots(selectedDate, booked);
  }, [clinicianName, selectedDate, existingConsultations]);

  const morningSlots = useMemo(() => slots.filter((s) => s.period === "morning"), [slots]);
  const afternoonSlots = useMemo(() => slots.filter((s) => s.period === "afternoon"), [slots]);
  const eveningSlots = useMemo(() => slots.filter((s) => s.period === "evening"), [slots]);

  const hasAvailableSlots = useMemo(() => slots.some((s) => s.isAvailable), [slots]);

  return {
    slots,
    morningSlots,
    afternoonSlots,
    eveningSlots,
    hasAvailableSlots,
  };
}
