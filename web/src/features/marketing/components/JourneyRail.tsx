import { useState } from "react";
import { LANDING_CONTENT } from "../content/landing-content";

export function JourneyRail() {
  const [activeStep, setActiveStep] = useState(0);
  const { journeySteps } = LANDING_CONTENT;

  return (
    <section id="journey" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="space-y-4 text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
          Maternal Health Journey
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          A clear path through your health signals.
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Four interconnected steps designed to give you clarity and confidence throughout your pregnancy.
        </p>
      </div>

      {/* Desktop & Mobile Responsive Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Navigation Rail */}
        <div className="lg:col-span-4 space-y-3">
          {journeySteps.map((step, idx) => {
            const isSelected = activeStep === idx;
            return (
              <button
                key={step.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-4 rounded-md border transition-all flex items-start gap-4 ${isSelected
                  ? "bg-[var(--card)] border-[var(--primary)] shadow-md shadow-[var(--primary)]/10"
                  : "bg-transparent border-[var(--border-subtle)] hover:bg-[var(--surface-soft)] text-[var(--muted-foreground)]"
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-md font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${isSelected
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface-soft)] text-[var(--muted-foreground)]"
                    }`}
                >
                  {step.step}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[var(--foreground)]">
                      {step.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] font-semibold">
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {step.headline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Active Step Story Panel */}
        <div className="lg:col-span-8 p-8 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-md space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
              Step {journeySteps[activeStep].step} · {journeySteps[activeStep].badge}
            </span>
            <h3 className="text-2xl font-bold text-[var(--foreground)]">
              {journeySteps[activeStep].headline}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              {journeySteps[activeStep].description}
            </p>
          </div>

          <div className="p-6 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] space-y-3">
            <p className="text-xs font-semibold text-[var(--foreground)]">Clinical Context & Privacy</p>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              All records generated in this stage are encrypted and strictly bound to your authenticated patient session.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
