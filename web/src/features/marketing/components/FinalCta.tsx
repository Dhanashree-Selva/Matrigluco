import { Link } from "react-router-dom";
import { SparklesIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { useAuth } from "../../../auth/useAuth";
import { routePaths } from "../../../app/route-paths";

export function FinalCta() {
  const { user } = useAuth();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="relative p-8 sm:p-14 rounded-md bg-[var(--card)] border border-[var(--primary)]/20 shadow-xl text-center space-y-6 overflow-hidden">
        {/* Subtle Orbit Arcs in Background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.12] flex items-center justify-center"
        >
          <div className="w-[500px] h-[500px] rounded-md border border-[var(--primary)]" />
          <div className="w-[800px] h-[800px] rounded-md border border-[var(--primary)]" />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
            <AppIcon icon={SparklesIcon} size="xs" />
            <span>Begin Your Care Orbit</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)] tracking-tight">
            Bring your maternal health signals into one clear, reassuring view.
          </h2>

          <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Start with an 8-factor risk assessment, log daily glucose readings, or explore our private local intelligence assistant.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            {user ? (
              <Link
                to={routePaths.app.dashboard}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/25 transition-all hover:scale-102"
              >
                <span>Open Care Dashboard</span>
                <AppIcon icon={ArrowRight01Icon} size="sm" />
              </Link>
            ) : (
              <>
                <Link
                  to={routePaths.auth.register}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm shadow-md shadow-[var(--primary)]/25 transition-all hover:scale-102"
                >
                  <span>Get Started Free</span>
                  <AppIcon icon={ArrowRight01Icon} size="sm" />
                </Link>
                <Link
                  to={routePaths.auth.login}
                  className="px-6 py-4 rounded-md bg-[var(--surface-soft)] hover:bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] font-bold text-sm transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
