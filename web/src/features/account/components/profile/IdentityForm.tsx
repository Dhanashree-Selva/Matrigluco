import React from "react";
import {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Input,
} from "../../../../shared/ui";
import { IdentityFormValues } from "../../schemas/profile.schema";

interface IdentityFormProps {
  values: IdentityFormValues;
  errors: Partial<Record<keyof IdentityFormValues, string>>;
  onChange: (key: keyof IdentityFormValues, value: string) => void;
}

export function IdentityForm({ values, errors, onChange }: IdentityFormProps) {
  return (
    <FieldSet className="space-y-4">
      <div>
        <FieldLegend variant="legend" className="text-sm font-bold text-[var(--foreground)]">
          Personal Information
        </FieldLegend>
        <p className="text-xs text-[var(--muted-foreground)]">
          Basic patient identity information used across clinical communications and consultations.
        </p>
      </div>

      <FieldGroup className="space-y-4 max-w-xl">
        {/* Full Name */}
        <Field data-invalid={Boolean(errors.fullName)}>
          <FieldLabel htmlFor="account-full-name" className="text-xs font-semibold text-[var(--foreground)]">
            Full Name <span className="text-[var(--primary)]">*</span>
          </FieldLabel>
          <Input
            id="account-full-name"
            value={values.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="e.g. Sarah Jenkins"
            className="text-xs h-9.5 rounded-xl bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]"
          />
          {errors.fullName && <FieldError className="text-[11px]">{errors.fullName}</FieldError>}
        </Field>

        {/* Phone */}
        <Field data-invalid={Boolean(errors.phone)}>
          <FieldLabel htmlFor="account-phone" className="text-xs font-semibold text-[var(--foreground)]">
            Phone Number
          </FieldLabel>
          <Input
            id="account-phone"
            type="tel"
            value={values.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="text-xs h-9.5 rounded-xl bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]"
          />
          <FieldDescription className="text-[11px] text-[var(--muted-foreground)]">
            Used for appointment SMS updates and consultation coordination.
          </FieldDescription>
          {errors.phone && <FieldError className="text-[11px]">{errors.phone}</FieldError>}
        </Field>

        {/* Emergency Contact */}
        <Field data-invalid={Boolean(errors.emergencyContact)}>
          <FieldLabel htmlFor="account-emergency-contact" className="text-xs font-semibold text-[var(--foreground)]">
            Emergency Contact Information
          </FieldLabel>
          <Input
            id="account-emergency-contact"
            value={values.emergencyContact || ""}
            onChange={(e) => onChange("emergencyContact", e.target.value)}
            placeholder="e.g. Spouse / Family Contact (+91 91234 56789)"
            className="text-xs h-9.5 rounded-xl bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]"
          />
          <FieldDescription className="text-[11px] text-[var(--muted-foreground)]">
            Designated emergency contact for urgent clinical care notifications.
          </FieldDescription>
          {errors.emergencyContact && (
            <FieldError className="text-[11px]">{errors.emergencyContact}</FieldError>
          )}
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
