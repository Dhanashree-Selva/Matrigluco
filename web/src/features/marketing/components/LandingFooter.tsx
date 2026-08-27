import React from "react";
import { Link } from "react-router-dom";
import { AppLogo } from "../../../shared/brand/AppLogo";
import { routePaths } from "../../../app/route-paths";

export function LandingFooter() {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] py-12 text-xs text-[var(--muted-foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-bold text-sm text-[var(--foreground)]">
            <AppLogo size={24} className="text-[var(--primary)] shrink-0" />
            <span>Matrigluco Maternal Care</span>
          </div>

          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-6">
            <a href="#journey" onClick={(e) => handleSmoothScroll(e, "#journey")} className="hover:text-[var(--primary)] transition-colors">How It Works</a>
            <a href="#assessment" onClick={(e) => handleSmoothScroll(e, "#assessment")} className="hover:text-[var(--primary)] transition-colors">Assessment</a>
            <a href="#tracking" onClick={(e) => handleSmoothScroll(e, "#tracking")} className="hover:text-[var(--primary)] transition-colors">Tracking</a>
            <a href="#assistant" onClick={(e) => handleSmoothScroll(e, "#assistant")} className="hover:text-[var(--primary)] transition-colors">Local AI</a>
            <a href="#privacy" onClick={(e) => handleSmoothScroll(e, "#privacy")} className="hover:text-[var(--primary)] transition-colors">Privacy</a>
            <a href="#faq" onClick={(e) => handleSmoothScroll(e, "#faq")} className="hover:text-[var(--primary)] transition-colors">FAQ</a>
            <Link to={routePaths.auth.login} className="hover:text-[var(--primary)] transition-colors">Sign In</Link>
          </nav>
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-6 space-y-3">
          <p className="leading-relaxed">
            <strong>Medical Disclaimer:</strong> Matrigluco is an academic decision-support and patient-empowerment technology prototype. It is not a certified diagnostic device and does not substitute for clinical medical judgment, professional consultation, or emergency care.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 opacity-80 text-[11px]">
            <p>© 2026 Matrigluco Project. Care Orbit Design System.</p>
            <p>React 19 · FastAPI · llama.cpp · MySQL</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
