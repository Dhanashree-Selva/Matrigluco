import { useTheme } from "@/components/theme/theme-provider";
import { Toaster as Sonner } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  MultiplicationSignCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

const Toaster = ({
  position = "top-right",
  ...props
}) => {
  const { resolvedTheme = "light" } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      position={position}
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-[var(--success)]" />
        ),
        info: (
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4 text-[var(--info)]" />
        ),
        warning: (
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4 text-[var(--warning)]" />
        ),
        error: (
          <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2} className="size-4 text-[var(--destructive)]" />
        ),
        loading: (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin text-[var(--primary)]" />
        ),
      }}
      style={{
        "--normal-bg": "var(--card)",
        "--normal-text": "var(--foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "0.375rem",
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast rounded-md shadow-md text-xs font-medium border border-[var(--border)]",
          title: "font-bold text-xs text-[var(--foreground)]",
          description: "text-[11px] text-[var(--muted-foreground)]",
          actionButton: "bg-[var(--primary)] text-white text-xs font-bold rounded-md px-2 py-1",
          cancelButton: "bg-[var(--secondary)] text-[var(--foreground)] text-xs font-medium rounded-md px-2 py-1",
          closeButton: "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
