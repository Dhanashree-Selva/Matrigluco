export interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const strengthLabel = score === 0 ? "Too short" : labels[score - 1] || "Weak";

  const getScoreColor = (activeScore: number) => {
    switch (activeScore) {
      case 1:
        return "bg-[var(--destructive)] text-[var(--destructive)]";
      case 2:
        return "bg-[var(--warning)] text-[var(--warning)]";
      case 3:
        return "bg-[var(--primary)] text-[var(--primary)]";
      case 4:
        return "bg-[var(--success)] text-[var(--success)]";
      default:
        return "bg-[var(--border)] text-[var(--muted-foreground)]";
    }
  };

  const getSegmentBg = (step: number) => {
    if (score < step) {
      return "bg-[var(--border-subtle)] dark:bg-[#2A2428]";
    }
    switch (score) {
      case 1:
        return "bg-[var(--destructive)]";
      case 2:
        return "bg-[var(--warning)]";
      case 3:
        return "bg-[var(--primary)]";
      case 4:
        return "bg-[var(--success)]";
      default:
        return "bg-[var(--primary)]";
    }
  };

  return (
    <div className="space-y-1 pt-0.5 text-left" aria-live="polite">
      <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted-foreground)]">
        <span>Password strength:</span>
        <span className={`font-bold transition-colors ${getScoreColor(score).split(" ")[1]}`}>
          {strengthLabel}
        </span>
      </div>

      {/* 4-Segment Visual Bar */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-200 ${getSegmentBg(step)}`}
          />
        ))}
      </div>
    </div>
  );
}
