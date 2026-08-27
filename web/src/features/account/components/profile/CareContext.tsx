import React, { useState } from "react";
import {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import { CareContextFormValues } from "../../schemas/profile.schema";
import {
  InformationCircleIcon,
  Calendar03Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { format, parseISO, isValid } from "date-fns";

interface CareContextProps {
  values: CareContextFormValues;
  errors: Partial<Record<keyof CareContextFormValues, string>>;
  onChange: (key: keyof CareContextFormValues, value: any) => void;
}

const BLOOD_GROUPS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export function CareContext({ values, errors, onChange }: CareContextProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Parse ISO date string for react-day-picker
  const selectedDate = values.expectedDueDate
    ? (() => {
        try {
          const parsed = parseISO(values.expectedDueDate);
          return isValid(parsed) ? parsed : undefined;
        } catch {
          return undefined;
        }
      })()
    : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      onChange("expectedDueDate", format(date, "yyyy-MM-dd"));
    } else {
      onChange("expectedDueDate", null);
    }
  };

  return (
    <FieldSet className="space-y-4">
      <div>
        <FieldLegend variant="legend" className="text-sm font-bold text-[var(--foreground)]">
          Maternal Care Context
        </FieldLegend>
        <p className="text-xs text-[var(--muted-foreground)]">
          Persisted gestational timeline and metabolic parameters used to tailor your care timeline.
        </p>
      </div>

      {/* Explanatory Banner */}
      <div className="p-4 rounded-2xl bg-[var(--accent-soft)]/40 border border-[var(--primary)]/20 text-xs text-[var(--foreground)] space-y-1 max-w-xl">
        <h4 className="font-bold text-[var(--primary)] flex items-center gap-1.5">
          <AppIcon icon={InformationCircleIcon} size="xs" />
          How Maternal Context is Used
        </h4>
        <p className="text-[11.5px] text-[var(--muted-foreground)] leading-relaxed">
          Your gestational age and due date help organize relevant tracking timelines and trimester-specific glycemic targets. They remain strictly under your control.
        </p>
      </div>

      <FieldGroup className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pregnancy Week */}
          <Field data-invalid={Boolean(errors.pregnancyWeek)}>
            <FieldLabel htmlFor="care-pregnancy-week" className="text-xs font-semibold text-[var(--foreground)]">
              Current Gestational Week
            </FieldLabel>
            <Input
              id="care-pregnancy-week"
              type="number"
              min={0}
              max={45}
              value={values.pregnancyWeek ?? ""}
              onChange={(e) =>
                onChange("pregnancyWeek", e.target.value === "" ? null : parseInt(e.target.value, 10))
              }
              placeholder="e.g. 24"
              className="text-xs h-9.5 rounded-xl bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]"
            />
            <FieldDescription className="text-[11px] text-[var(--muted-foreground)]">
              Weeks of gestation (0–45).
            </FieldDescription>
            {errors.pregnancyWeek && <FieldError className="text-[11px]">{errors.pregnancyWeek}</FieldError>}
          </Field>

          {/* Expected Due Date with Calendar Popover */}
          <Field data-invalid={Boolean(errors.expectedDueDate)}>
            <FieldLabel htmlFor="care-due-date" className="text-xs font-semibold text-[var(--foreground)]">
              Expected Due Date
            </FieldLabel>

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  id="care-due-date"
                  type="button"
                  aria-label={
                    selectedDate
                      ? `Expected due date: ${format(selectedDate, "PPP")}`
                      : "Select expected due date"
                  }
                  className={`flex w-full items-center justify-between text-xs h-9.5 px-3 rounded-xl bg-[var(--background)] border transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] cursor-pointer hover:bg-[var(--accent-soft)]/30 ${
                    errors.expectedDueDate
                      ? "border-destructive text-destructive"
                      : "border-[var(--border)] text-[var(--foreground)]"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <AppIcon icon={Calendar03Icon} size="xs" className="text-[var(--primary)] shrink-0" />
                    {selectedDate ? (
                      <span className="font-semibold text-[var(--foreground)]">
                        {format(selectedDate, "MMM d, yyyy")}
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">Select due date</span>
                    )}
                  </span>

                  {selectedDate && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange("expectedDueDate", null);
                      }}
                      className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-0.5 rounded-md"
                      title="Clear due date"
                    >
                      <AppIcon icon={Cancel01Icon} size="xxs" />
                    </span>
                  )}
                </button>
              </PopoverTrigger>

              <PopoverContent
                className="w-auto p-2 rounded-2xl border-[var(--border)] bg-[var(--card)] shadow-xl"
                align="start"
                sideOffset={4}
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    handleDateSelect(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <FieldDescription className="text-[11px] text-[var(--muted-foreground)]">
              Estimated date of delivery (EDD).
            </FieldDescription>
            {errors.expectedDueDate && (
              <FieldError className="text-[11px]">{errors.expectedDueDate}</FieldError>
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Blood Group with Select */}
          <Field data-invalid={Boolean(errors.bloodGroup)}>
            <FieldLabel htmlFor="care-blood-group" className="text-xs font-semibold text-[var(--foreground)]">
              Blood Group
            </FieldLabel>

            <Select
              value={values.bloodGroup || ""}
              onValueChange={(val) => onChange("bloodGroup", val === "none" ? null : val)}
            >
              <SelectTrigger
                id="care-blood-group"
                className="text-xs h-9.5 rounded-xl bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)] font-medium"
              >
                <SelectValue placeholder="Select blood group (e.g. O+)" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[var(--border)] bg-[var(--card)] shadow-lg">
                <SelectItem value="none" className="text-xs text-[var(--muted-foreground)]">
                  Not specified
                </SelectItem>
                {BLOOD_GROUPS.map((bg) => (
                  <SelectItem key={bg.value} value={bg.value} className="text-xs font-semibold cursor-pointer">
                    {bg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldDescription className="text-[11px] text-[var(--muted-foreground)]">
              ABO and Rh maternal blood group.
            </FieldDescription>
            {errors.bloodGroup && <FieldError className="text-[11px]">{errors.bloodGroup}</FieldError>}
          </Field>

          {/* Previous Pregnancies */}
          <Field data-invalid={Boolean(errors.previousPregnancies)}>
            <FieldLabel htmlFor="care-prev-pregnancies" className="text-xs font-semibold text-[var(--foreground)]">
              Previous Pregnancies
            </FieldLabel>
            <Input
              id="care-prev-pregnancies"
              type="number"
              min={0}
              max={20}
              value={values.previousPregnancies ?? ""}
              onChange={(e) =>
                onChange("previousPregnancies", e.target.value === "" ? null : parseInt(e.target.value, 10))
              }
              placeholder="e.g. 0"
              className="text-xs h-9.5 rounded-xl bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]"
            />
            <FieldDescription className="text-[11px] text-[var(--muted-foreground)]">
              Total number of prior pregnancies.
            </FieldDescription>
            {errors.previousPregnancies && (
              <FieldError className="text-[11px]">{errors.previousPregnancies}</FieldError>
            )}
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
