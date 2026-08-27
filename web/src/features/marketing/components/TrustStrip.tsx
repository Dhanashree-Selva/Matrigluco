import {
  AiBrain01Icon,
  SecurityCheckIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { LANDING_CONTENT } from "../content/landing-content";

export function TrustStrip() {
  const icons = [AiBrain01Icon, SecurityCheckIcon, SparklesIcon];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 p-6 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-xs">
        {LANDING_CONTENT.trustPoints.map((point, idx) => (
          <div
            key={point.title}
            className={`space-y-2.5 ${idx > 0 ? "md:border-l md:border-[var(--border-subtle)] md:pl-6" : ""
              }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
                <AppIcon icon={icons[idx]} size="sm" />
              </div>
              <h2 className="text-sm font-extrabold text-[var(--foreground)] tracking-tight">
                {point.title}
              </h2>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {point.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
