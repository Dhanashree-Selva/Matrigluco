import { NavLink, useLocation } from "react-router-dom";
import { AppLogo } from "../../shared/brand/AppLogo";
import { AppIcon } from "../../components/common/AppIcon";
import {
  primaryCareRailNavigation,
  secondaryCareRailNavigation,
} from "../../app/navigation";
import { routePaths } from "../../app/route-paths";

export function CareRail() {
  const location = useLocation();

  return (
    <aside
      aria-label="Care Rail Primary Navigation"
      className="hidden md:flex flex-col w-20 lg:w-52 border-r border-[var(--border)] bg-[var(--card)] p-2.5 space-y-4 shrink-0 min-h-screen transition-all duration-200"
    >
      {/* Brand Logo Header */}
      <NavLink
        to={routePaths.app.dashboard}
        aria-label="Matrigluco Dashboard Home"
        className="flex items-center gap-2.5 px-2 py-2 font-bold text-base text-[var(--foreground)] rounded-md focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
      >
        <AppLogo size={32} className="text-[var(--primary)] shrink-0" />
        <span className="hidden lg:inline tracking-tight text-sm font-extrabold">
          Matrigluco
        </span>
      </NavLink>

      {/* Primary Care Navigation */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        <nav className="space-y-1" aria-label="Core Health Destinations">
          <p className="hidden lg:block px-2.5 pb-1 text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
            Care Orbit
          </p>
          {primaryCareRailNavigation.map((item) => {
            const isActive = item.matchPrefix
              ? location.pathname.startsWith(item.path)
              : location.pathname === item.path;

            return (
              <NavLink
                key={item.key}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                title={item.label}
                className={`flex flex-col lg:flex-row items-center lg:gap-3 px-2 lg:px-3 py-2.5 lg:py-2 rounded-md text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--primary)] shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                }`}
              >
                <AppIcon icon={item.icon} size="sm" className="shrink-0" />
                <span className="text-[10px] lg:text-xs mt-1 lg:mt-0 font-bold">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        <nav className="space-y-1 border-t border-[var(--border-subtle)] pt-3" aria-label="Secondary Context">
          <p className="hidden lg:block px-2.5 pb-1 text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
            Consult & Account
          </p>
          {secondaryCareRailNavigation.map((item) => {
            const isActive = item.matchPrefix
              ? location.pathname.startsWith(item.path)
              : location.pathname === item.path;

            return (
              <NavLink
                key={item.key}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                title={item.label}
                className={`flex flex-col lg:flex-row items-center lg:gap-3 px-2 lg:px-3 py-2.5 lg:py-2 rounded-md text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--primary)] shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                }`}
              >
                <AppIcon icon={item.icon} size="sm" className="shrink-0" />
                <span className="text-[10px] lg:text-xs mt-1 lg:mt-0 font-bold">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Compact Care Rail Footer */}
      <div className="p-2 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[10px] text-[var(--muted-foreground)] text-center lg:text-left">
        <p className="hidden lg:block font-bold text-[var(--foreground)]">Care Rail</p>
        <p className="opacity-80">v2.0</p>
      </div>
    </aside>
  );
}
