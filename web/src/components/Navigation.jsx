import { Link, useLocation } from "react-router-dom";
import {
  Home01Icon,
  Clock01Icon,
  Add01Icon,
  Activity02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "./common/AppIcon";

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home01Icon },
    { name: "History", path: "/history", icon: Clock01Icon },
    { name: "Add", path: "/manual-entry", isCenter: true },
    { name: "Track", path: "/track", icon: Activity02Icon },
    { name: "Profile", path: "/profile", icon: UserCircleIcon },
  ];

  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--border)] z-50 md:sticky md:bottom-auto md:w-full pb-4 pt-1 shadow-sm transition-colors"
    >
      <div className="flex justify-around items-center h-16 relative max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                to={item.path}
                aria-label="Add new reading"
                className="relative z-10 -mt-8"
              >
                <div className="w-14 h-14 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md flex items-center justify-center text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/30 border-4 border-[var(--card)] active:scale-95 transition-all">
                  <AppIcon icon={Add01Icon} size="lg" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full group"
            >
              <div
                className={`p-1 rounded-md transition-all ${
                  isActive
                    ? "text-[var(--primary)] bg-[var(--accent-soft)]"
                    : "text-[var(--muted-foreground)] group-hover:text-[var(--primary)]"
                }`}
              >
                <AppIcon icon={item.icon} size="md" />
              </div>
              <span
                className={`text-[10px] mt-1 font-bold tracking-tight transition-colors ${
                  isActive
                    ? "text-[var(--primary)] font-extrabold"
                    : "text-[var(--muted-foreground)] group-hover:text-[var(--primary)]"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
