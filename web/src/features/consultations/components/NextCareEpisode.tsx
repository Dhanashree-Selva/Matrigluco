import React from "react";
import { useNavigate } from "react-router-dom";
import { ConsultationRecord } from "../types/consultation.types";
import { ConsultationStatus } from "./ConsultationStatus";
import { ConsultationJourney } from "./ConsultationJourney";
import { Button, Avatar, AvatarFallback, AvatarImage } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Calendar01Icon,
  Video01Icon,
  Message01Icon,
  Hospital01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

interface NextCareEpisodeProps {
  consultation: ConsultationRecord;
  onSelect?: (id: string) => void;
}

export function NextCareEpisode({ consultation, onSelect }: NextCareEpisodeProps) {
  const navigate = useNavigate();

  const handleOpen = () => {
    if (onSelect) {
      onSelect(consultation.id);
    } else {
      navigate(`/app/consultations/${consultation.id}`);
    }
  };

  const clinician = consultation.clinician;
  const isJoinable = consultation.isJoinable;

  return (
    <article
      aria-label={`Next Consultation with ${consultation.doctorName}`}
      className="p-5 sm:p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs relative overflow-hidden mb-8"
    >
      {/* Decorative subtle backdrop accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 space-y-5">
        {/* Eyebrow & Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
              Your Next Care Episode
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-xs text-[var(--muted-foreground)]">
              {consultation.fullDateTimeFormatted}
            </span>
          </div>

          <ConsultationStatus stage={consultation.stage} />
        </div>

        {/* Clinician Card Main Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3.5">
            <Avatar className="w-14 h-14 rounded-2xl border border-[var(--border)] shadow-2xs">
              {clinician?.avatarUrl && (
                <AvatarImage src={clinician.avatarUrl} alt={consultation.doctorName} />
              )}
              <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--primary)] font-bold text-base rounded-2xl">
                {clinician?.initials || consultation.doctorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
                {consultation.doctorName}
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {clinician?.title || consultation.consultationType}
              </p>
              <div className="flex items-center gap-3 text-xs text-[var(--foreground)]/80 mt-1 font-medium">
                <span className="inline-flex items-center gap-1">
                  <AppIcon
                    icon={
                      consultation.mode === "chat"
                        ? Message01Icon
                        : consultation.mode === "in_person"
                        ? Hospital01Icon
                        : Video01Icon
                    }
                    size="xs"
                    className="text-[var(--primary)]"
                  />
                  {consultation.consultationType}
                </span>
                <span className="inline-flex items-center gap-1 opacity-80">
                  <AppIcon icon={Calendar01Icon} size="xs" />
                  {consultation.formattedDate} · {consultation.formattedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-2.5 sm:self-center shrink-0">
            {isJoinable ? (
              <Button
                type="button"
                onClick={() => navigate(`/app/consultations/${consultation.id}/room`)}
                className="gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <AppIcon icon={Video01Icon} size="sm" />
                Join Video Room
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleOpen}
                className="gap-2 text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-2xs"
              >
                View Consultation
                <AppIcon icon={ArrowRight01Icon} size="xs" />
              </Button>
            )}
          </div>
        </div>

        {/* Embedded Consultation Journey */}
        <div className="pt-2">
          <ConsultationJourney currentStage={consultation.stage} />
        </div>
      </div>
    </article>
  );
}
