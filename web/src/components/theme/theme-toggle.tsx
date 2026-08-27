import { Sun01Icon, Moon02Icon, ComputerIcon } from "@hugeicons/core-free-icons";
import { useTheme } from "./theme-provider";
import { AppIcon } from "../common/AppIcon";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] shadow-xs ${className}`}
      role="group"
      aria-label="Select color theme"
    >
      <button
        onClick={() => setTheme("light")}
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        className={`p-1.5 rounded-md transition-all text-xs flex items-center justify-center ${theme === "light"
          ? "bg-[var(--card)] text-[var(--primary)] shadow-xs font-bold"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
      >
        <AppIcon icon={Sun01Icon} size="sm" />
      </button>

      <button
        onClick={() => setTheme("dark")}
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        className={`p-1.5 rounded-md transition-all text-xs flex items-center justify-center ${theme === "dark"
          ? "bg-[var(--card)] text-[var(--primary)] shadow-xs font-bold"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
      >
        <AppIcon icon={Moon02Icon} size="sm" />
      </button>

      <button
        onClick={() => setTheme("system")}
        aria-label="System theme"
        aria-pressed={theme === "system"}
        className={`p-1.5 rounded-md transition-all text-xs flex items-center justify-center ${theme === "system"
          ? "bg-[var(--card)] text-[var(--primary)] shadow-xs font-bold"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
      >
        <AppIcon icon={ComputerIcon} size="sm" />
      </button>
    </div>
  );
}
