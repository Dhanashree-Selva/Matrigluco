import { forwardRef, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Input } from "../../../shared/ui";
import { Button } from "../../../shared/ui";

export interface PasswordFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative flex items-center">
        <Input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={`h-11 pr-11 bg-[var(--surface-soft)] border-[var(--border)] focus-visible:ring-[var(--primary)] text-sm ${className}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
        >
          <AppIcon
            icon={showPassword ? EyeOffIcon : EyeIcon}
            size="xs"
          />
        </Button>
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
