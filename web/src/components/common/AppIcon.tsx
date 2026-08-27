import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "../../lib/utils";

export interface AppIconProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  strokeWidth?: number;
  color?: string;
}

const SIZE_MAP = {
  xxs: 12,
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function AppIcon({
  icon,
  size = "md",
  className,
  strokeWidth = 1.8,
  color,
  ...props
}: AppIconProps) {
  if (!icon) return null;

  const numericSize = typeof size === "number" ? size : SIZE_MAP[size] || 20;

  // If icon is already a React component (e.g. function or Lucide component)
  if (typeof icon === "function") {
    const Component = icon;
    return (
      <Component
        size={numericSize}
        strokeWidth={strokeWidth}
        className={cn("shrink-0 transition-colors", className)}
        aria-hidden="true"
        {...props}
      />
    );
  }

  // If icon is a Hugeicons icon object definition
  return (
    <HugeiconsIcon
      icon={icon}
      size={numericSize}
      strokeWidth={strokeWidth}
      color={color}
      className={cn("shrink-0 transition-colors", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
