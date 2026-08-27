import { cn } from "../../lib/utils";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading data...",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
      <div className="w-10 h-10 border-3 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-md animate-spin mb-3" />
      <p className="text-xs font-semibold text-[var(--muted-foreground)]">{message}</p>
    </div>
  );
}
