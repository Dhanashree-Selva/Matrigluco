import { Link } from "react-router-dom";
import {
  SparklesIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { useAuth } from "../../../auth/useAuth";
import { routePaths } from "../../../app/route-paths";
import { LANDING_CONTENT } from "../content/landing-content";

export function HeroCareOrbit() {
  const { user } = useAuth();
  const { hero } = LANDING_CONTENT;

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 max-w-5xl mx-auto px-4 sm:px-6 text-center">
      <div className="flex flex-col items-center space-y-6 max-w-4xl mx-auto">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider shadow-xs border border-[var(--primary)]/15">
          <AppIcon icon={SparklesIcon} size="xs" />
          <span>{hero.eyebrow}</span>
        </div>

        {/* Centered H1 Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.12]">
          Understand your <span className="text-[var(--primary)]">health signals</span> without turning your day into a dashboard.
        </h1>

        {/* Supporting Narrative */}
        <p className="text-base sm:text-lg lg:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto">
          {hero.description}
        </p>

        {/* Centered Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          {user ? (
            <Link
              to={routePaths.app.dashboard}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/25 transition-all hover:scale-102"
            >
              <span>{hero.authCta}</span>
              <AppIcon icon={ArrowRight01Icon} size="sm" />
            </Link>
          ) : (
            <>
              <Link
                to={routePaths.auth.register}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/25 transition-all hover:scale-102"
              >
                <span>{hero.primaryCta}</span>
                <AppIcon icon={ArrowRight01Icon} size="sm" />
              </Link>
              <a
                href="#journey"
                className="px-6 py-3.5 rounded-md bg-[var(--card)] hover:bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border)] font-bold text-sm transition-colors"
              >
                {hero.secondaryCta}
              </a>
            </>
          )}
        </div>

        {/* Trust Proof Footnote */}
        <div className="pt-4 text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-md bg-[var(--color-success)]" />
          <span>Academic demonstration · Evidence-based ML risk model</span>
        </div>
      </div>
    </section>
  );
}
