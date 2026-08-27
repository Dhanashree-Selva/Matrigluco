import { ReactNode } from "react";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`space-y-2 pb-4 ${className}`}>
      {eyebrow && (
        <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
          {eyebrow}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {(action || secondaryAction) && (
          <div className="flex items-center gap-3 shrink-0">
            {secondaryAction}
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
