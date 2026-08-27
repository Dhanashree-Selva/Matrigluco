import { Calendar03Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

export function ConsultationContinuity() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Narrative */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
            <AppIcon icon={Calendar03Icon} size="xs" />
            <span>Consultation Continuity</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
            Keep clinical care central to your journey.
          </h2>

          <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            When you need professional obstetric guidance, your recent readings, report summaries, and risk estimates provide your healthcare provider with a structured longitudinal picture.
          </p>
        </div>

        {/* Right: Consultation Card Preview */}
        <div className="lg:col-span-6">
          <div className="p-6 sm:p-8 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center">
                  <AppIcon icon={Calendar03Icon} size="sm" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--foreground)]">Upcoming Obstetric Review</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">Dr. Ananya Sharma · Maternal Medicine</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[var(--surface-soft)] text-[var(--foreground)] font-bold">
                Confirmed
              </span>
            </div>

            <div className="p-3.5 rounded-md bg-[var(--surface-soft)] flex items-center gap-3 text-xs">
              <AppIcon icon={Clock01Icon} size="sm" className="text-[var(--primary)] shrink-0" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">Thursday, Aug 20 · 10:30 AM</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">Pre-visit telemetry summary prepared</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
