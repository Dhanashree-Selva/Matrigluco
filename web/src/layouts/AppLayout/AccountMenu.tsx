import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  SecurityCheckIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../components/common/AppIcon";
import { useAuth } from "../../auth/useAuth";
import { routePaths } from "../../app/route-paths";

export function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate(routePaths.auth.login);
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Patient";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User Account Menu"
        className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[var(--surface-soft)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
      >
        <div className="w-8 h-8 rounded-md bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center shadow-xs">
          {initials}
        </div>
        <span className="hidden lg:inline text-xs font-bold text-[var(--foreground)] max-w-[120px] truncate">
          {displayName}
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account Settings"
          className="absolute right-0 mt-2 w-56 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-lg p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
            <p className="text-xs font-bold text-[var(--foreground)] truncate">{displayName}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] truncate">{user?.email}</p>
          </div>

          <Link
            to={routePaths.app.account.profile}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors"
          >
            <AppIcon icon={UserCircleIcon} size="xs" className="text-[var(--primary)]" />
            <span>Profile & Demographics</span>
          </Link>

          <Link
            to={routePaths.app.account.security}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors"
          >
            <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)]" />
            <span>Security & Sessions</span>
          </Link>

          <div className="border-t border-[var(--border-subtle)] pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors text-left"
            >
              <AppIcon icon={Logout01Icon} size="xs" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
