import React from "react";
import { useNavigate } from "react-router-dom";
import { ConsultationRecord } from "../../types/consultation.types";
import { ConsultationJourney } from "../ConsultationJourney";
import { Button, Avatar, AvatarFallback, AvatarImage } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  CheckmarkCircle02Icon,
  Calendar01Icon,
  Clock01Icon,
  Video01Icon,
  Message01Icon,
  ArrowRight01Icon,
  DocumentValidationIcon,
} from "@hugeicons/core-free-icons";

interface CareHandshakeProps {
  consultation: ConsultationRecord;
  onViewEpisode?: () => void;
}

export function CareHandshake({ consultation, onViewEpisode }: CareHandshakeProps) {
  const navigate = useNavigate();
  const clinician = consultation.clinician;

  const handleOpenEpisode = () => {
    if (onViewEpisode) {
      onViewEpisode();
    } else {
      navigate(`/app/consultations/${consultation.id}`);
    }
  };

  return (
    <article
      aria-label="Appointment Confirmation & Care Handshake"
      className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Confirmation Badge & Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-2xs">
          <AppIcon icon={CheckmarkCircle02Icon} size="lg" />
        </div>

        <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">
          Appointment Confirmed
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
          Your Care Episode Is Ready
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
          We have reserved your consultation with {consultation.doctorName}.
        </p>
      </div>

      {/* Appointment Summary Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-4">
        <div className="flex items-center gap-3.5 pb-3 border-b border-[var(--border)]/60">
          <Avatar className="w-12 h-12 rounded-xl border border-[var(--border)]">
            {clinician?.avatarUrl && (
              <AvatarImage src={clinician.avatarUrl} alt={consultation.doctorName} />
            )}
            <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--primary)] font-bold text-xs">
              {clinician?.initials || consultation.doctorName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              {consultation.doctorName}
            </h3>
            <p className="text-xs text-[var(--primary)] font-medium">
              {clinician?.title || consultation.consultationType}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
              Date
            </span>
            <span className="font-semibold text-[var(--foreground)] flex items-center gap-1 mt-0.5">
              <AppIcon icon={Calendar01Icon} size="xxs" className="text-[var(--primary)]" />
              {consultation.formattedDate}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
              Time
            </span>
            <span className="font-semibold text-[var(--foreground)] flex items-center gap-1 mt-0.5">
              <AppIcon icon={Clock01Icon} size="xxs" className="text-[var(--primary)]" />
              {consultation.formattedTime}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
              Format
            </span>
            <span className="font-semibold text-[var(--foreground)] flex items-center gap-1 mt-0.5">
              <AppIcon
                icon={consultation.mode === "chat" ? Message01Icon : Video01Icon}
                size="xxs"
                className="text-[var(--primary)]"
              />
              {consultation.consultationType}
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Progress Rail */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-1">
          Care Progression
        </span>
        <ConsultationJourney currentStage="booked" />
      </div>

      {/* Before Your Appointment Checklist */}
      <div className="p-4 rounded-2xl bg-[var(--accent-soft)]/40 border border-[var(--primary)]/20 space-y-2.5 text-xs text-[var(--foreground)]">
        <h4 className="font-bold text-[var(--primary)] flex items-center gap-1.5">
          <AppIcon icon={DocumentValidationIcon} size="xs" />
          Next Steps Before Your Visit
        </h4>
        <ul className="space-y-1.5 list-disc pl-5 text-[11.5px] text-[var(--muted-foreground)] leading-relaxed marker:text-[var(--primary)]">
          <li>Review and keep your recent medical reports and lab results accessible.</li>
          <li>Log your daily fasting and postprandial glucose numbers in Tracking.</li>
          <li>The consultation room will be activated at your scheduled appointment time.</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/app/consultations")}
          className="w-full sm:w-auto text-xs font-semibold"
        >
          Back to Consultations
        </Button>

        <Button
          type="button"
          onClick={handleOpenEpisode}
          className="w-full sm:w-auto gap-2 text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-2xs"
        >
          View Care Episode
          <AppIcon icon={ArrowRight01Icon} size="xs" />
        </Button>
      </div>
    </article>
  );
}
