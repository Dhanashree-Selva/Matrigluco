import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationTrigger } from "./NotificationTrigger";
import { AccountMenu } from "./AccountMenu";
import { SidebarTrigger } from "../../shared/ui";
import { AppBrand } from "../../shared/brand";
import { routePaths } from "../../app/route-paths";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function AppHeader({ title, subtitle, action }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile App Brand (Logo + Name) */}
        <Link
          to={routePaths.app.dashboard}
          aria-label="Matrigluco Dashboard"
          className="inline-flex md:hidden items-center gap-2 shrink-0 group focus-visible:outline-2 focus-visible:outline-[var(--primary)] rounded-lg transition-transform active:scale-98"
        >
          <AppBrand size={26} wordmarkClassName="text-base font-extrabold tracking-tight" />
        </Link>

        {/* Desktop Sidebar Trigger */}
        <SidebarTrigger className="hidden md:inline-flex text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent-soft)] transition-colors rounded-md shrink-0" />

        {/* Optional Title / Subtitle on Desktop */}
        <div className="hidden md:block min-w-0 flex-1">
          {subtitle && (
            <p className="text-[10px] sm:text-xs font-bold text-[var(--primary)] uppercase tracking-wider truncate">
              {subtitle}
            </p>
          )}
          {title && (
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)] tracking-tight truncate">
              {title}
            </h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {action && <div className="hidden sm:block">{action}</div>}
        <ThemeToggle />
        <NotificationTrigger />
        <AccountMenu />
      </div>
    </header>
  );
}
