import { AppLogo } from "./AppLogo";

export interface AppBrandProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

export function AppBrand({
  size = 32,
  showWordmark = true,
  className = "",
  wordmarkClassName = "",
}: AppBrandProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <AppLogo size={size} className="text-[var(--primary)]" />
      {showWordmark && (
        <span
          className={`font-black text-base sm:text-lg tracking-tight text-[var(--foreground)] ${wordmarkClassName}`}
        >
          Matrigluco
        </span>
      )}
    </div>
  );
}
