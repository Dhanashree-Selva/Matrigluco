import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../components/common/AppIcon";
import {
  mobileBottomNavigation,
  mobileMoreMenuItems,
} from "../../app/navigation";

export function MobileNav() {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--border)] z-50 md:hidden pb-safe pt-1 shadow-sm transition-colors"
      >
        <div className="flex justify-around items-center h-14 max-w-md mx-auto px-2">
          {mobileBottomNavigation.map((item) => {
            if (item.isAction) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setIsMoreOpen(true)}
                  aria-label="Open more navigation options"
                  aria-expanded={isMoreOpen}
                  aria-controls="mobile-more-sheet"
                  className="flex flex-col items-center justify-center w-full h-full text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  <div className="p-1 rounded-md">
                    <AppIcon icon={item.icon} size="md" />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 tracking-tight">
                    {item.label}
                  </span>
                </button>
              );
            }

            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.key}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center w-full h-full group transition-colors ${isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                  }`}
              >
                <div
                  className={`p-1 rounded-md transition-all ${isActive ? "bg-[var(--accent-soft)]" : ""
                    }`}
                >
                  <AppIcon icon={item.icon} size="md" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-0.5 tracking-tight ${isActive ? "font-extrabold" : ""
                    }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Mobile "More" Sheet Overlay */}
      {isMoreOpen && (
        <div
          id="mobile-more-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="More Navigation"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="bg-[var(--card)] border-t border-[var(--border)] rounded-t-sm p-6 max-h-[80vh] overflow-y-auto space-y-6 animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[var(--foreground)]">More Destinations</h2>
                <p className="text-xs text-[var(--muted-foreground)]">Additional maternal health workflows</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Close more destinations menu"
                className="p-2 rounded-md bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <AppIcon icon={Cancel01Icon} size="sm" />
              </button>
            </div>

            {/* Menu Groups */}
            <div className="space-y-5">
              {mobileMoreMenuItems.map((group) => (
                <div key={group.group} className="space-y-2">
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                    {group.group}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {group.items.map((subItem) => {
                      const isActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setIsMoreOpen(false)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold transition-all ${isActive
                            ? "bg-[var(--accent-soft)] text-[var(--primary)]"
                            : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                            }`}
                        >
                          <AppIcon icon={subItem.icon} size="sm" className="text-[var(--primary)]" />
                          <span>{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
