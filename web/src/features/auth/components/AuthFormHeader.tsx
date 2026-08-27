import { Badge } from "../../../shared/ui";

export interface AuthFormHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
}

export function AuthFormHeader({
  eyebrow,
  title,
  subtitle,
}: AuthFormHeaderProps) {
  return (
    <div className="space-y-1 text-left">
      {eyebrow && (
        <Badge
          variant="outline"
          className="bg-[var(--accent-soft)] text-[var(--primary)] border-[var(--primary)]/20 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5"
        >
          {eyebrow}
        </Badge>
      )}
      <h1 className="text-lg sm:text-xl font-black text-[var(--foreground)] tracking-tight">
        {title}
      </h1>
      <p className="text-xs text-[var(--muted-foreground)] leading-snug">
        {subtitle}
      </p>
    </div>
  );
}
