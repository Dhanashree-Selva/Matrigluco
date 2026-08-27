import { ReactNode } from "react";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "../../../shared/ui";

export interface AuthStatusStateProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  variant?: "success" | "warning" | "danger" | "info";
}

export function AuthStatusState({
  icon,
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  variant = "info",
}: AuthStatusStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/20";
      case "warning":
        return "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/20";
      case "danger":
        return "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/20";
      case "info":
      default:
        return "bg-[var(--accent-soft)] text-[var(--primary)] border-[var(--primary)]/20";
    }
  };

  return (
    <Card className="border-0 shadow-none bg-transparent text-center animate-in fade-in zoom-in-95 duration-200">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex justify-center">
          <div
            className={`w-14 h-14 rounded-md flex items-center justify-center border shadow-xs ${getVariantStyles()}`}
          >
            <AppIcon icon={icon} size="md" />
          </div>
        </div>

        <div className="space-y-2 max-w-sm mx-auto">
          {eyebrow && (
            <Badge
              variant="outline"
              className="uppercase tracking-wider text-[10px] font-extrabold"
            >
              {eyebrow}
            </Badge>
          )}
          <CardTitle className="text-2xl font-black text-[var(--foreground)] tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 max-w-sm mx-auto pt-2">
        {action}
        {secondaryAction}
      </CardContent>
    </Card>
  );
}
