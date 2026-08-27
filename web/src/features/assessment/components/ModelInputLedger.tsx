import {
  UserCircleIcon,
  Activity02Icon,
  HeartCheckIcon,
  DnaIcon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  Button,
} from "../../../shared/ui";
import {
  AssessmentFieldKey,
  ASSESSMENT_FIELDS,
} from "../config/assessment-fields";
import { AssessmentFormValues } from "../types/assessment.types";

interface ModelInputLedgerProps {
  formValues: AssessmentFormValues;
  onEditField: (fieldKey: AssessmentFieldKey) => void;
}

export function ModelInputLedger({
  formValues,
  onEditField,
}: ModelInputLedgerProps) {
  const sections = [
    {
      title: "Personal Context",
      icon: UserCircleIcon,
      fields: ["age", "pregnancies"] as AssessmentFieldKey[],
    },
    {
      title: "Clinical Signals",
      icon: Activity02Icon,
      fields: ["glucose", "bloodPressure"] as AssessmentFieldKey[],
    },
    {
      title: "Body & Metabolic",
      icon: HeartCheckIcon,
      fields: ["skinThickness", "insulin", "bmi"] as AssessmentFieldKey[],
    },
    {
      title: "History Context",
      icon: DnaIcon,
      fields: ["diabetesPedigreeFunction"] as AssessmentFieldKey[],
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.title}
          className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 space-y-2 text-left"
        >
          {/* Section Heading */}
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] border-b border-[var(--border-subtle)] pb-2">
            <AppIcon icon={section.icon} size="xs" className="text-[var(--primary)]" />
            <span>{section.title}</span>
          </div>

          {/* Item Rows */}
          <div className="divide-y divide-[var(--border-subtle)]">
            {section.fields.map((fieldKey) => {
              const def = ASSESSMENT_FIELDS[fieldKey];
              const rawValue = formValues[fieldKey];
              const displayValue =
                rawValue !== "" && rawValue !== undefined
                  ? `${rawValue} ${def.unit ? def.unit : ""}`
                  : "Not provided";

              return (
                <Item
                  key={fieldKey}
                  variant="default"
                  className="py-2 px-1 hover:bg-[var(--surface-soft)] rounded-md flex items-center justify-between gap-3"
                >
                  <ItemMedia className="shrink-0 text-[var(--muted-foreground)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]/60 block" />
                  </ItemMedia>
                  <ItemContent className="min-w-0 flex-1 grid">
                    <ItemTitle className="text-xs font-semibold text-[var(--muted-foreground)] truncate">
                      {def.label}
                    </ItemTitle>
                    <ItemDescription className="text-sm font-bold text-[var(--foreground)] tabular-nums truncate">
                      {displayValue}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditField(fieldKey)}
                      aria-label={`Edit ${def.label}`}
                      className="text-xs font-bold text-[var(--primary)] hover:bg-[var(--accent-soft)] hover:text-[var(--primary)] h-8 px-2.5 rounded-md flex items-center gap-1.5"
                    >
                      <AppIcon icon={Edit02Icon} size="xs" />
                      <span>Edit</span>
                    </Button>
                  </ItemActions>
                </Item>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
