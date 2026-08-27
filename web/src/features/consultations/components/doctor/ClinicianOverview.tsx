import React from "react";
import { ClinicianProfile } from "../../types/consultation.types";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  FileAttachmentIcon,
  Shield01Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";

interface ClinicianOverviewProps {
  clinician: ClinicianProfile;
}

export function ClinicianOverview({ clinician }: ClinicianOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
          Clinical Focus & Background
        </h2>
        <p className="text-sm sm:text-[14.5px] leading-relaxed text-[var(--foreground)]">
          {clinician.bio}
        </p>
      </section>

      {/* Maternal Care Guidelines Notice */}
      <section className="p-5 rounded-2xl bg-[var(--accent-soft)]/50 border border-[var(--primary)]/20 text-xs sm:text-[13px] leading-relaxed text-[var(--foreground)] space-y-2">
        <div className="flex items-center gap-2 font-bold text-[var(--primary)]">
          <AppIcon icon={Shield01Icon} size="sm" />
          <span>Patient-Centered Clinical Partnership</span>
        </div>
        <p className="text-[var(--muted-foreground)]">
          Consultations provide dedicated maternal health guidance, glucose trend reviews, and personalized care planning. Always bring your recent lab reports and glucose logbook readings.
        </p>
      </section>

      {/* Consultation Preparation Tips */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-2">
          <AppIcon icon={HelpCircleIcon} size="xs" /> What to prepare for this consultation
        </h3>
        <ul className="space-y-2 text-xs sm:text-[13px] text-[var(--foreground)] list-disc pl-5 marker:text-[var(--primary)]">
          <li>Recent Oral Glucose Tolerance Test (OGTT) or HbA1c lab reports.</li>
          <li>Your logged blood glucose readings from the past 7–14 days.</li>
          <li>Any questions regarding dietary carbohydrate distribution or symptoms.</li>
        </ul>
      </section>
    </div>
  );
}
