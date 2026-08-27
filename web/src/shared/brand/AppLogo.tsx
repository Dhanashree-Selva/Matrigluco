import { SVGProps } from "react";

export interface AppLogoProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  decorative?: boolean;
  title?: string;
  className?: string;
}

export function AppLogo({
  size = 32,
  decorative = true,
  title = "Matrigluco Logo",
  className = "",
  ...props
}: AppLogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      aria-hidden={decorative ? "true" : undefined}
      role={decorative ? undefined : "img"}
      className={`shrink-0 transition-colors ${className}`}
      {...props}
    >
      {!decorative && <title>{title}</title>}
      {/* Matrigluco Solid Geometric Care Knot — Single Compound Path */}
      <path
        d="M24 5C30.6 5 36 10.4 36 17C36 21.2 33.8 24.9 30.5 27C29.2 25.5 28.5 23.5 28.5 21.5C28.5 17.4 25.1 14 21 14C19 14 17 14.7 15.5 16C17.6 9.7 20.4 5 24 5ZM43 24C43 30.6 37.6 36 31 36C26.8 36 23.1 33.8 21 30.5C22.5 29.2 24.5 28.5 26.5 28.5C30.6 28.5 34 25.1 34 21C34 19 33.3 17 32 15.5C38.3 17.6 43 20.4 43 24ZM24 43C17.4 43 12 37.6 12 31C12 26.8 14.2 23.1 17.5 21C18.8 22.5 19.5 24.5 19.5 26.5C19.5 30.6 22.9 34 27 34C29 34 31 33.3 32.5 32C30.4 38.3 27.6 43 24 43ZM5 24C5 17.4 10.4 12 17 12C21.2 12 24.9 14.2 27 17.5C25.5 18.8 23.5 19.5 21.5 19.5C17.4 19.5 14 22.9 14 27C14 29 14.7 31 16 32.5C9.7 30.4 5 27.6 5 24Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}
