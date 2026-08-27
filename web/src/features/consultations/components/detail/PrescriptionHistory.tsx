import React from "react";
import { PrescriptionItem } from "../../types/consultation.types";
import { AppIcon } from "../../../../components/common/AppIcon";
import { Medicine01Icon, Clock01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";

interface PrescriptionHistoryProps {
  prescriptions: PrescriptionItem[];
  className?: string;
}

export function PrescriptionHistory({ prescriptions, className = "" }: PrescriptionHistoryProps) {
  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className={`p-5 text-center rounded-2xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] ${className}`}>
        No active prescriptions recorded for this care episode.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-1 flex items-center gap-1.5">
        <AppIcon icon={Medicine01Icon} size="xxs" className="text-[var(--primary)]" />
        Prescribed Medications & Supplements
      </h3>

      <div className="space-y-2.5">
        {prescriptions.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--foreground)] tracking-tight">
                {item.medicationName}
              </h4>
              <span className="font-semibold text-xs text-[var(--primary)] bg-[var(--accent-soft)] px-2.5 py-0.5 rounded-full">
                {item.dosage}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-[var(--muted-foreground)]">
              <span className="inline-flex items-center gap-1">
                <AppIcon icon={Clock01Icon} size="xxs" /> Frequency: {item.frequency}
              </span>
              <span>· Duration: {item.duration}</span>
            </div>

            {item.instructions && (
              <div className="pt-1.5 border-t border-[var(--border)]/60 text-[11px] text-[var(--foreground)]/85 flex items-start gap-1.5">
                <AppIcon icon={InformationCircleIcon} size="xxs" className="text-[var(--primary)] shrink-0 mt-0.5" />
                <span>{item.instructions}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
