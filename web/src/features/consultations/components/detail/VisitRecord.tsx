import React from "react";
import { VisitRecordData } from "../../types/consultation.types";
import { PrescriptionHistory } from "./PrescriptionHistory";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  DocumentValidationIcon,
  CheckmarkCircle02Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";

interface VisitRecordProps {
  record: VisitRecordData;
  className?: string;
}

export function VisitRecord({ record, className = "" }: VisitRecordProps) {
  return (
    <section
      aria-label="Completed Visit Record"
      className={`p-6 sm:p-7 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-6 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]/60">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <AppIcon icon={CheckmarkCircle02Icon} size="xxs" /> Completed Visit Record
          </span>
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight mt-0.5">
            Clinical Summary & Care Directives
          </h2>
        </div>

        <span className="text-xs font-semibold text-[var(--muted-foreground)]">
          {record.completedAt}
        </span>
      </div>

      {/* Summary Notes */}
      {record.summaryNotes && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <AppIcon icon={DocumentValidationIcon} size="xxs" className="text-[var(--primary)]" />
            Specialist Clinical Notes
          </h3>
          <p className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-xs sm:text-[13px] leading-relaxed text-[var(--foreground)] whitespace-pre-line">
            {record.summaryNotes}
          </p>
        </div>
      )}

      {/* Prescriptions */}
      <PrescriptionHistory prescriptions={record.prescriptions} />

      {/* Follow-up recommendation */}
      {record.followUpRecommended && (
        <div className="p-4 rounded-2xl bg-[var(--accent-soft)]/50 border border-[var(--primary)]/20 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shrink-0">
              <AppIcon icon={Calendar01Icon} size="xs" />
            </div>
            <div>
              <span className="font-bold text-[var(--foreground)] block">
                Recommended Follow-Up
              </span>
              <span className="text-[var(--muted-foreground)] text-[11px]">
                {record.followUpRecommended}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
