import React, { useState } from "react";
import { ClinicianProfile, ConsultationModeType } from "../../types/consultation.types";
import { useAvailability } from "../../hooks/useAvailability";
import { useCreateConsultation } from "../../hooks/useCreateConsultation";
import { formatDateToIsoDateOnly } from "../../utils/consultation-dates";
import { AppointmentCalendar } from "./AppointmentCalendar";
import { AppointmentSlots } from "./AppointmentSlots";
import { ConsultationMode } from "./ConsultationMode";
import { AppointmentReview } from "./AppointmentReview";
import { Textarea, Button, Avatar, AvatarFallback, AvatarImage } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import { ArrowRight01Icon, HelpCircleIcon } from "@hugeicons/core-free-icons";

interface AppointmentComposerProps {
  clinician: ClinicianProfile;
  initialDate?: Date;
  initialSlot?: string | null;
  patientName?: string;
  onSuccess?: (createdId: string) => void;
  className?: string;
}

export function AppointmentComposer({
  clinician,
  initialDate,
  initialSlot = null,
  patientName = "Maternal Patient",
  onSuccess,
  className = "",
}: AppointmentComposerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(initialSlot);
  const [selectedMode, setSelectedMode] = useState<ConsultationModeType>(
    clinician.supportedModes[0] || "video"
  );
  const [symptoms, setSymptoms] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const { slots, morningSlots, afternoonSlots, eveningSlots } = useAvailability(
    clinician.name,
    selectedDate
  );

  const createConsultationMutation = useCreateConsultation();

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;

    const isoDate = formatDateToIsoDateOnly(selectedDate);
    createConsultationMutation.mutate(
      {
        patient_name: patientName,
        doctor_name: clinician.name,
        consultation_type: selectedMode === "chat" ? "Chat Consultation" : "Video Consultation",
        appointment_date: isoDate,
        appointment_time: selectedSlot,
        symptoms: symptoms.trim() || undefined,
        status: "booked",
      },
      {
        onSuccess: (record) => {
          if (onSuccess) {
            onSuccess(record.id);
          }
        },
      }
    );
  };

  if (isReviewing && selectedSlot) {
    return (
      <AppointmentReview
        clinician={clinician}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        selectedMode={selectedMode}
        symptoms={symptoms}
        patientName={patientName}
        isSubmitting={createConsultationMutation.isPending}
        onConfirm={handleConfirmBooking}
        onBack={() => setIsReviewing(false)}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clinician Summary Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar className="w-12 h-12 rounded-xl border border-[var(--border)]">
            {clinician.avatarUrl && (
              <AvatarImage src={clinician.avatarUrl} alt={clinician.name} />
            )}
            <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--primary)] font-bold text-xs">
              {clinician.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight">
              {clinician.name}
            </h2>
            <p className="text-xs text-[var(--primary)] font-medium">
              {clinician.title}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-[var(--muted-foreground)] bg-[var(--accent-soft)]/40 px-2.5 py-1 rounded-full">
          {clinician.timezone}
        </span>
      </div>

      {/* Date & Slots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <AppointmentCalendar
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setSelectedSlot(null);
          }}
          timezone={clinician.timezone}
        />

        <AppointmentSlots
          slots={slots}
          morningSlots={morningSlots}
          afternoonSlots={afternoonSlots}
          eveningSlots={eveningSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
        />
      </div>

      {/* Mode Selector */}
      <ConsultationMode
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        supportedModes={clinician.supportedModes}
      />

      {/* Consultation Purpose (Optional) */}
      <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <label
            htmlFor="consultation-purpose"
            className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5"
          >
            <AppIcon icon={HelpCircleIcon} size="xxs" />
            4. What would you like to discuss? (optional)
          </label>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {symptoms.length}/500
          </span>
        </div>

        <Textarea
          id="consultation-purpose"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value.slice(0, 500))}
          placeholder="Briefly describe your symptoms, recent glucose readings, or specific questions for the specialist..."
          rows={3}
          className="text-xs rounded-xl bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]"
        />
      </div>

      {/* Review CTA */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        <div className="text-xs">
          {selectedSlot ? (
            <span className="text-[var(--foreground)] font-semibold">
              Slot: <strong>{selectedSlot}</strong> on {formatDateToIsoDateOnly(selectedDate)}
            </span>
          ) : (
            <span className="text-[var(--muted-foreground)]">
              Select a date and time slot to continue
            </span>
          )}
        </div>

        <Button
          type="button"
          disabled={!selectedSlot}
          onClick={() => setIsReviewing(true)}
          className="gap-2 text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-2xs"
        >
          Review Appointment
          <AppIcon icon={ArrowRight01Icon} size="xs" />
        </Button>
      </div>
    </div>
  );
}
