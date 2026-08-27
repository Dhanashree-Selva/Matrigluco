import React from "react";
import { Link } from "react-router-dom";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  DocumentValidationIcon,
  Activity01Icon,
  HelpCircleIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

export function PreparationPanel() {
  return (
    <section className="p-5 sm:p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
          Pre-Consultation Preparation
        </h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          Follow these quick readiness steps to get the most out of your specialist visit.
        </p>
      </div>

      <div className="space-y-3">
        {/* Step 1: Reports */}
        <div className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
              <AppIcon icon={DocumentValidationIcon} size="xs" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--foreground)]">Review Medical Reports</h3>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                Ensure your latest OGTT, ultrasound, or HbA1c documents are uploaded.
              </p>
            </div>
          </div>
          <Link
            to="/app/reports"
            className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1 shrink-0 pt-1"
          >
            Reports <AppIcon icon={ArrowRight01Icon} size="xxs" />
          </Link>
        </div>

        {/* Step 2: Blood Glucose Tracking */}
        <div className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
              <AppIcon icon={Activity01Icon} size="xs" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--foreground)]">Log Daily Glucose</h3>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                Keep your fasting and 2-hour postprandial numbers up to date in Tracking.
              </p>
            </div>
          </div>
          <Link
            to="/app/tracking"
            className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1 shrink-0 pt-1"
          >
            Track <AppIcon icon={ArrowRight01Icon} size="xxs" />
          </Link>
        </div>

        {/* Step 3: Write Down Questions */}
        <div className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
            <AppIcon icon={HelpCircleIcon} size="xs" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--foreground)]">Note Any Symptoms or Questions</h3>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Write down any dietary questions, hypoglycemia episodes, or fetal movements to discuss.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
