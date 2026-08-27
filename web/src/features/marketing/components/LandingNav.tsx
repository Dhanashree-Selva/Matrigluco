import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { AppLogo } from "../../../shared/brand/AppLogo";
import { ThemeToggle } from "../../../components/theme/theme-toggle";
import { useAuth } from "../../../auth/useAuth";
import { routePaths } from "../../../app/route-paths";

export function LandingNav() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#journey" },
    { label: "Assessment", href: "#assessment" },
    { label: "Tracking", href: "#tracking" },
    { label: "Reports", href: "#reports" },
    { label: "Local AI", href: "#assistant" },
    { label: "Privacy", href: "#privacy" },
    { label: "FAQ", href: "#faq" },
  ];

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)] py-3 shadow-xs"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link
          to={routePaths.home}
          aria-label="Matrigluco Home"
          className="flex items-center gap-2.5 font-extrabold text-lg text-[var(--foreground)] tracking-tight focus-visible:outline-2 focus-visible:outline-[var(--primary)] rounded-md"
        >
          <AppLogo size={30} className="text-[var(--primary)] shrink-0" />
          <span>Matrigluco</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Landing Page Navigation" className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] rounded-md px-2 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action CTAs & Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <Link
              to={routePaths.app.dashboard}
              className="px-4 py-2 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-xs shadow-xs transition-all hover:scale-102"
            >
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link
                to={routePaths.auth.login}
                className="px-3.5 py-2 rounded-md text-xs font-bold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to={routePaths.auth.register}
                className="px-4 py-2 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-xs shadow-xs transition-all hover:scale-102"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            aria-expanded={isMobileMenuOpen}
            className="p-2 rounded-md bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border)]"
          >
            <AppIcon icon={Menu01Icon} size="sm" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Sheet */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-start p-4 sm:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-md p-6 space-y-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-[var(--foreground)]">
                <AppLogo size={26} className="text-[var(--primary)] shrink-0" />
                <span>Matrigluco</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-md bg-[var(--surface-soft)] text-[var(--muted-foreground)]"
              >
                <AppIcon icon={Cancel01Icon} size="sm" />
              </button>
            </div>

            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    handleSmoothScroll(e, link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] py-1.5"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-2.5">
              {user ? (
                <Link
                  to={routePaths.app.dashboard}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 rounded-md bg-[var(--primary)] text-white text-center font-bold text-sm shadow-xs"
                >
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to={routePaths.auth.register}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 rounded-md bg-[var(--primary)] text-white text-center font-bold text-sm shadow-xs"
                  >
                    Get Started
                  </Link>
                  <Link
                    to={routePaths.auth.login}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-md border border-[var(--border)] text-[var(--foreground)] text-center font-bold text-sm"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
