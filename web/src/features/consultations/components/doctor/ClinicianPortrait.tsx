import React from "react";
import { ClinicianProfile } from "../../types/consultation.types";
import { Avatar, AvatarFallback, AvatarImage, Badge } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Video01Icon,
  Message01Icon,
  Hospital01Icon,
  Globe02Icon,
  Award01Icon,
} from "@hugeicons/core-free-icons";

interface ClinicianPortraitProps {
  clinician: ClinicianProfile;
}

export function ClinicianPortrait({ clinician }: ClinicianPortraitProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Clinician Avatar */}
        <Avatar className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 border-[var(--border)] shadow-xs shrink-0">
          {clinician.avatarUrl && (
            <AvatarImage src={clinician.avatarUrl} alt={clinician.name} />
          )}
          <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--primary)] font-bold text-2xl rounded-3xl">
            {clinician.initials}
          </AvatarFallback>
        </Avatar>

        {/* Clinician Identity & Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              {clinician.name}
            </h1>
            {clinician.isAvailableToday && (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              >
                ● Available Today
              </Badge>
            )}
          </div>

          <p className="text-sm font-semibold text-[var(--primary)]">
            {clinician.title}
          </p>

          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {clinician.specialty} {clinician.clinicOrHospital ? `· ${clinician.clinicOrHospital}` : ""}
          </p>

          {/* Highlights Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--foreground)]/80 mt-3 pt-3 border-t border-[var(--border)]/60">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <AppIcon icon={Award01Icon} size="xs" className="text-[var(--primary)]" />
              {clinician.experienceYears} Years Experience
            </span>

            {clinician.languages && (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <AppIcon icon={Globe02Icon} size="xs" className="text-[var(--primary)]" />
                {clinician.languages.join(", ")}
              </span>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {clinician.supportedModes.includes("video") && (
                <Badge variant="outline" className="text-[10px] gap-1 bg-[var(--accent-soft)]/40">
                  <AppIcon icon={Video01Icon} size="xxs" /> Video Consult
                </Badge>
              )}
              {clinician.supportedModes.includes("chat") && (
                <Badge variant="outline" className="text-[10px] gap-1 bg-[var(--accent-soft)]/40">
                  <AppIcon icon={Message01Icon} size="xxs" /> Chat Consult
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
