import { Activity02Icon, DropletIcon, HeartCheckIcon, WeightScaleIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

export function TrackingStory() {
  return (
    <section id="tracking" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Timeline & Signal Capsule Display */}
        <div className="lg:col-span-6 order-2 lg:order-1 space-y-4">
          <div className="p-6 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <p className="text-xs font-bold text-[var(--foreground)]">Daily Telemetry Timeline</p>
              <span className="text-[10px] text-[var(--muted-foreground)]">3 logs today</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-md bg-[var(--surface-soft)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center">
                    <AppIcon icon={DropletIcon} size="sm" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">Fasting Glucose</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">07:30 AM · Target &lt; 95</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[var(--foreground)] text-sm">92 mg/dL</p>
                  <p className="text-[10px] text-[var(--color-success)] font-semibold">Normal</p>
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-[var(--surface-soft)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center">
                    <AppIcon icon={HeartCheckIcon} size="sm" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">Resting Blood Pressure</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">11:00 AM · Target &lt; 120/80</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[var(--foreground)] text-sm">115/75 mmHg</p>
                  <p className="text-[10px] text-[var(--color-success)] font-semibold">Normal</p>
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-[var(--surface-soft)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center">
                    <AppIcon icon={WeightScaleIcon} size="sm" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">Gestational Weight</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Weekly Log</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[var(--foreground)] text-sm">64.2 kg</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">+0.4 kg/wk</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Narrative */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
            <AppIcon icon={Activity02Icon} size="xs" />
            <span>Longitudinal Care Orbit</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
            Track changes without losing daily context.
          </h2>

          <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Keep daily readings in one continuous timeline and return to recent trends without turning every measurement into another high-anxiety alert.
          </p>

          <div className="p-4 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-xs text-[var(--muted-foreground)]">
            <p className="font-semibold text-[var(--foreground)]">Structured Health Signals</p>
            <p className="mt-0.5">Separate systolic and diastolic tracking, standardized fasting and postprandial glucose markers, and maternal weight gain progression.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
