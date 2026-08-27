import React from "react";
import { ConsultationRecord } from "../../types/consultation.types";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Calendar01Icon,
  Clock01Icon,
  Video01Icon,
  Message01Icon,
  Hospital01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

interface VisitContextCardProps {
  consultation: ConsultationRecord;
}

export function VisitContextCard({ consultation }: VisitContextCardProps) {
  const clinician = consultation.clinician;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
        Visit Context
      </h2>

      {/* Clinician Mini Profile */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-[var(--border)]/60">
        <Avatar className="w-13 h-13 rounded-2xl border border-[var(--border)] shadow-2xs">
          {clinician?.avatarUrl && (
            <AvatarImage src={clinician.avatarUrl} alt={consultation.doctorName} />
          )}
          <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--primary)] font-bold text-sm rounded-2xl">
            {clinician?.initials || consultation.doctorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[var(--foreground)] truncate">
            {consultation.doctorName}
          </h3>
          <p className="text-xs text-[var(--primary)] font-medium truncate">
            {clinician?.title || consultation.consultationType}
          </p>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {clinician?.clinicOrHospital || "Maternal Telehealth Network"}
          </p>
        </div>
      </div>

      {/* Details Key-Value List */}
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
            <AppIcon icon={Calendar01Icon} size="xxs" /> Date:
          </span>
          <span className="font-semibold text-[var(--foreground)]">{consultation.formattedDate}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
            <AppIcon icon={Clock01Icon} size="xxs" /> Time:
          </span>
          <span className="font-semibold text-[var(--foreground)]">{consultation.formattedTime}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
            <AppIcon
              icon={
                consultation.mode === "chat"
                  ? Message01Icon
                  : consultation.mode === "in_person"
                  ? Hospital01Icon
                  : Video01Icon
              }
              size="xxs"
            />
            Consultation Type:
          </span>
          <span className="font-semibold text-[var(--foreground)]">{consultation.consultationType}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
            <AppIcon icon={UserIcon} size="xxs" /> Patient:
          </span>
          <span className="font-semibold text-[var(--foreground)]">{consultation.patientName}</span>
        </div>
      </div>

      {/* Symptoms / Purpose */}
      {consultation.symptoms && (
        <div className="pt-3 border-t border-[var(--border)]/60 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">
            Recorded Patient Discussion Focus:
          </span>
          <p className="text-[var(--foreground)] bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] text-[12px] leading-relaxed italic">
            "{consultation.symptoms}"
          </p>
        </div>
      )}
    </div>
  );
}
