import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClinicianProfile } from "../../types/consultation.types";
import { useAvailability } from "../../hooks/useAvailability";
import { formatAppointmentDateLabel, formatDateToIsoDateOnly } from "../../utils/consultation-dates";
import { Calendar, Button, Badge } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import { Calendar01Icon, Clock01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface ClinicianAvailabilityProps {
  clinician: ClinicianProfile;
}

export function ClinicianAvailability({ clinician }: ClinicianAvailabilityProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { slots, hasAvailableSlots } = useAvailability(clinician.name, selectedDate);

  const handleContinueBooking = () => {
    const isoDate = formatDateToIsoDateOnly(selectedDate);
    const timeParam = selectedSlot ? `?date=${isoDate}&time=${encodeURIComponent(selectedSlot)}` : `?date=${isoDate}`;
    navigate(`/app/consultations/book/${clinician.id}${timeParam}`);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-6">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
          Select Consultation Slot
        </h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          Timezone: <span className="font-semibold text-[var(--foreground)]">{clinician.timezone}</span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Calendar Picker */}
        <div className="p-2 rounded-2xl bg-[var(--background)] border border-[var(--border)] w-full lg:w-auto">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => {
              if (d) {
                setSelectedDate(d);
                setSelectedSlot(null);
              }
            }}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            className="rounded-xl"
          />
        </div>

        {/* Available Time Slots Area */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <AppIcon icon={Calendar01Icon} size="xs" className="text-[var(--primary)]" />
              {formatAppointmentDateLabel(selectedDate)}
            </span>

            {hasAvailableSlots ? (
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                {slots.filter((s) => s.isAvailable).length} Slots Available
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-rose-600 bg-rose-500/10 border-rose-500/20">
                No Open Slots
              </Badge>
            )}
          </div>

          {hasAvailableSlots ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot.timeFormatted;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() => setSelectedSlot(slot.timeFormatted)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                        : slot.isAvailable
                        ? "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--accent-soft)]"
                        : "opacity-40 bg-[var(--background)] text-[var(--muted-foreground)] border-dashed border-[var(--border)] cursor-not-allowed"
                    }`}
                  >
                    {slot.timeFormatted}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center rounded-2xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
              No times available on this date. Please select another date on the calendar.
            </div>
          )}

          {/* Continue Button */}
          <div className="pt-3 border-t border-[var(--border)]/60 flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">
              {selectedSlot ? (
                <span className="text-[var(--foreground)] font-medium">
                  Selected: <strong>{selectedSlot}</strong>
                </span>
              ) : (
                "Choose a slot to proceed"
              )}
            </span>

            <Button
              type="button"
              disabled={!selectedSlot}
              onClick={handleContinueBooking}
              className="gap-2 text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-2xs"
            >
              Continue to Review
              <AppIcon icon={ArrowRight01Icon} size="xs" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
