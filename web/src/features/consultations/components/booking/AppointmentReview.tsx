import React from "react";
import { ClinicianProfile, ConsultationModeType } from "../../types/consultation.types";
import { formatAppointmentDateLabel } from "../../utils/consultation-dates";
import { Button, Avatar, AvatarFallback, AvatarImage } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Calendar01Icon,
  Clock01Icon,
  Video01Icon,
  Message01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

interface AppointmentReviewProps {
  clinician: ClinicianProfile;
  selectedDate: Date;
  selectedSlot: string;
  selectedMode: ConsultationModeType;
  symptoms?: string;
  patientName: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onBack?: () => void;
  className?: string;
}

export function AppointmentReview({
  clinician,
  selectedDate,
  selectedSlot,
  selectedMode,
  symptoms,
  patientName,
  isSubmitting = false,
  onConfirm,
  onBack,
  className = "",
}: AppointmentReviewProps) {
  const dateLabel = formatAppointmentDateLabel(selectedDate);

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs space-y-6 ${className}`}>
      <div>
        <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
          Review Appointment Details
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Please verify your consultation schedule before confirming.
        </p>
      </div>

      {/* Summary Box */}
      <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-4">
        {/* Clinician */}
        <div className="flex items-center gap-3 pb-3 border-b border-[var(--border)]/60">
          <Avatar className="w-12 h-12 rounded-xl border border-[var(--border)]">
            {clinician.avatarUrl && (
              <AvatarImage src={clinician.avatarUrl} alt={clinician.name} />
            )}
            <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--primary)] font-bold text-xs">
              {clinician.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
              {clinician.name}
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              {clinician.title} · {clinician.specialty}
            </p>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
              Date
            </span>
            <span className="font-semibold text-[var(--foreground)] flex items-center gap-1 mt-0.5">
              <AppIcon icon={Calendar01Icon} size="xxs" className="text-[var(--primary)]" />
              {dateLabel}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
              Time
            </span>
            <span className="font-semibold text-[var(--foreground)] flex items-center gap-1 mt-0.5">
              <AppIcon icon={Clock01Icon} size="xxs" className="text-[var(--primary)]" />
              {selectedSlot}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
              Format
            </span>
            <span className="font-semibold text-[var(--foreground)] flex items-center gap-1 mt-0.5">
              <AppIcon
                icon={selectedMode === "chat" ? Message01Icon : Video01Icon}
                size="xxs"
                className="text-[var(--primary)]"
              />
              {selectedMode === "chat" ? "Live Chat" : "Video Call"}
            </span>
          </div>
        </div>

        {/* Patient & Purpose */}
        <div className="pt-3 border-t border-[var(--border)]/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--muted-foreground)]">Patient:</span>
            <span className="font-semibold text-[var(--foreground)]">{patientName}</span>
          </div>

          {symptoms && (
            <div className="text-[11px] pt-1">
              <span className="text-[var(--muted-foreground)] block mb-0.5">Discussion Focus:</span>
              <p className="text-[var(--foreground)] italic bg-[var(--card)] p-2 rounded-lg border border-[var(--border)]">
                "{symptoms}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            Edit Selection
          </Button>
        )}

        <Button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="gap-2 text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-xs ml-auto"
        >
          {isSubmitting ? (
            <>
              <AppIcon icon={Loading03Icon} size="xs" className="animate-spin" />
              Confirming Schedule…
            </>
          ) : (
            <>
              <AppIcon icon={CheckmarkCircle02Icon} size="xs" />
              Confirm Appointment
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
