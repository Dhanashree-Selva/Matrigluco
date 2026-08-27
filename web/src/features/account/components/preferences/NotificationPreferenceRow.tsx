import React from "react";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  Switch,
} from "../../../../shared/ui";

interface NotificationPreferenceRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function NotificationPreferenceRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: NotificationPreferenceRowProps) {
  return (
    <Field
      orientation="horizontal"
      className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-start justify-between gap-4 transition-colors"
    >
      <FieldContent className="space-y-0.5 pr-2">
        <FieldLabel htmlFor={id} className="text-xs font-bold text-[var(--foreground)] cursor-pointer">
          {label}
        </FieldLabel>
        <FieldDescription className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          {description}
        </FieldDescription>
      </FieldContent>

      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5 data-checked:bg-[var(--primary)] shrink-0"
        aria-label={label}
      />
    </Field>
  );
}
