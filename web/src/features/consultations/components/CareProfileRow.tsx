import React from "react";
import { useNavigate } from "react-router-dom";
import { ClinicianProfile } from "../types/consultation.types";
import { Button, Avatar, AvatarFallback, AvatarImage, Badge } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Video01Icon,
  Message01Icon,
  Hospital01Icon,
  Calendar01Icon,
  ArrowRight01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

interface CareProfileRowProps {
  clinician: ClinicianProfile;
  onBook?: (clinicianId: string) => void;
}

export function CareProfileRow({ clinician, onBook }: CareProfileRowProps) {
  const navigate = useNavigate();

  const handleBook = () => {
    if (onBook) {
      onBook(clinician.id);
    } else {
      navigate(`/app/consultations/book/${clinician.id}`);
    }
  };

  const handleViewPortrait = () => {
    navigate(`/app/consultations/doctor/${clinician.id}`);
  };

  return (
    <div className="group p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/30 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Clinician Identity & Bio */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <Avatar className="w-13 h-13 rounded-2xl border border-[var(--border)] shrink-0 shadow-2xs">
          {clinician.avatarUrl && (
            <AvatarImage src={clinician.avatarUrl} alt={clinician.name} />
          )}
          <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--primary)] font-bold text-sm rounded-2xl">
            {clinician.initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              onClick={handleViewPortrait}
              className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight hover:text-[var(--primary)] transition-colors cursor-pointer"
            >
              {clinician.name}
            </h3>
            {clinician.isAvailableToday && (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              >
                Available Today
              </Badge>
            )}
          </div>

          <p className="text-xs text-[var(--primary)] font-medium mt-0.5">
            {clinician.title}
          </p>

          <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-1">
            {clinician.bio}
          </p>

          {/* Clinician Details Row */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted-foreground)] mt-2">
            <span className="font-medium text-[var(--foreground)]/80">
              {clinician.experienceYears} Years Clinical Exp.
            </span>
            {clinician.clinicOrHospital && (
              <span>· {clinician.clinicOrHospital}</span>
            )}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              {clinician.supportedModes.includes("video") && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--accent-soft)]/50 text-[var(--foreground)]">
                  <AppIcon icon={Video01Icon} size="xxs" /> Video
                </span>
              )}
              {clinician.supportedModes.includes("chat") && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--accent-soft)]/50 text-[var(--foreground)]">
                  <AppIcon icon={Message01Icon} size="xxs" /> Chat
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Availability & Actions Column */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]/60 shrink-0">
        {clinician.nextAvailableSlotFormatted && (
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] tracking-wider block">
              Next Available
            </span>
            <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1 mt-0.5">
              <AppIcon icon={Clock01Icon} size="xxs" className="text-[var(--primary)]" />
              {clinician.nextAvailableSlotFormatted}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleViewPortrait}
            className="text-xs font-semibold hover:bg-[var(--accent-soft)] border-[var(--border)]"
          >
            Profile
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleBook}
            className="gap-1.5 text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-2xs"
          >
            Book Slot
            <AppIcon icon={ArrowRight01Icon} size="xxs" />
          </Button>
        </div>
      </div>
    </div>
  );
}
