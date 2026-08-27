import { SparklesIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

export function AssessmentStory() {
  return (
    <section id="assessment" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Narrative & Model Contract */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
            <AppIcon icon={SparklesIcon} size="xs" />
            <span>Structured Risk Assessment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
            Evidence-based evaluation without hidden assumptions.
          </h2>

          <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Enter the exact physiological measurements required by our validated model.
            Matrigluco computes calibrated risk estimates without guessing or defaulting missing clinical fields to zero.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Standard 8-parameter metabolic feature contract",
              "Calibrated probabilities with physiological context",
              "Non-diagnostic decision support for patient education",
            ].map((bullet) => (
              <div key={bullet} className="flex items-center gap-3 text-xs font-semibold text-[var(--foreground)]">
                <div className="w-5 h-5 rounded-md bg-[var(--color-success-soft)] text-[var(--color-success)] flex items-center justify-center shrink-0">
                  <AppIcon icon={CheckmarkCircle02Icon} size="xs" />
                </div>
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-xs text-[var(--muted-foreground)]">
            <p className="font-semibold text-[var(--foreground)]">Medical Limitation Notice</p>
            <p className="mt-0.5">Risk assessments support awareness and discussion with your doctor. They do not constitute a formal diagnosis.</p>
          </div>
        </div>

        {/* Right: High-fidelity Assessment Schematic Preview */}
        <div className="lg:col-span-6">
          <div className="p-6 sm:p-8 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <p className="text-xs font-bold text-[var(--foreground)]">Assessment Preview</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">Synthetic Clinical Data</p>
              </div>
              <span className="px-3 py-1 rounded-md bg-[var(--color-success-soft)] text-[var(--color-success)] text-xs font-bold">
                Low Risk (14%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--muted-foreground)] font-semibold">Glucose</p>
                <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">96 mg/dL</p>
              </div>
              <div className="p-3 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--muted-foreground)] font-semibold">BMI</p>
                <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">23.4 kg/m²</p>
              </div>
              <div className="p-3 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--muted-foreground)] font-semibold">Blood Pressure</p>
                <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">116/74 mmHg</p>
              </div>
              <div className="p-3 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--muted-foreground)] font-semibold">Pedigree Function</p>
                <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">0.42</p>
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-[var(--accent-soft)]/50 border border-[var(--primary)]/20 text-xs text-[var(--primary)] font-medium">
              Assessment stored in longitudinal history for clinical review.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
