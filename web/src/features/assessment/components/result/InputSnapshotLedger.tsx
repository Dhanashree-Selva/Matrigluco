import {
  Activity01Icon,
  DropletIcon,
  HeartCheckIcon,
  WeightScale01Icon,
  Dna01Icon,
  Baby01Icon,
  Calendar03Icon,
  Medicine02Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  Badge,
} from "../../../../shared/ui";
import { ASSESSMENT_FIELDS_LIST } from "../../config/assessment-fields";

interface InputSnapshotLedgerProps {
  featuresSnapshot: Record<string, number | undefined>;
}

export function InputSnapshotLedger({ featuresSnapshot }: InputSnapshotLedgerProps) {
  const getIcon = (key: string) => {
    switch (key) {
      case "age":
        return Calendar03Icon;
      case "pregnancies":
        return Baby01Icon;
      case "glucose":
        return DropletIcon;
      case "bloodPressure":
        return HeartCheckIcon;
      case "skinThickness":
        return Activity01Icon;
      case "insulin":
        return Medicine02Icon;
      case "bmi":
        return WeightScale01Icon;
      case "diabetesPedigreeFunction":
        return Dna01Icon;
      default:
        return Activity01Icon;
    }
  };

  const getSnapshotValue = (fieldKey: string, modelField: string): number | null => {
    if (!featuresSnapshot || typeof featuresSnapshot !== "object") return null;

    // Check exact modelField (e.g. Glucose, Age, BloodPressure)
    if (featuresSnapshot[modelField] !== undefined && featuresSnapshot[modelField] !== null) {
      return Number(featuresSnapshot[modelField]);
    }
    // Check camelCase (e.g. bloodPressure)
    if (featuresSnapshot[fieldKey] !== undefined && featuresSnapshot[fieldKey] !== null) {
      return Number(featuresSnapshot[fieldKey]);
    }
    // Check snake_case (e.g. blood_pressure, diabetes_pedigree_function)
    const snakeKey = fieldKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (featuresSnapshot[snakeKey] !== undefined && featuresSnapshot[snakeKey] !== null) {
      return Number(featuresSnapshot[snakeKey]);
    }
    // Case-insensitive search across snapshot keys
    const lowerKey = fieldKey.toLowerCase().replace(/_/g, "");
    const lowerModel = modelField.toLowerCase().replace(/_/g, "");
    for (const [k, v] of Object.entries(featuresSnapshot)) {
      const cleanK = k.toLowerCase().replace(/_/g, "");
      if (cleanK === lowerKey || cleanK === lowerModel) {
        if (v !== undefined && v !== null) return Number(v);
      }
    }

    return null;
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
          Persisted Input Snapshot
        </h3>
        <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
          8 Features Evaluated
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ASSESSMENT_FIELDS_LIST.map((field) => {
          const val = getSnapshotValue(field.key, field.modelField);
          const icon = getIcon(field.key);
          const displayVal =
            val !== null
              ? field.key === "diabetesPedigreeFunction"
                ? val.toFixed(3)
                : String(val)
              : "—";

          return (
            <Item
              key={field.key}
              className="p-2.5 rounded-md bg-[var(--surface-soft)]/60 border border-[var(--border-subtle)] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ItemMedia className="w-7 h-7 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center shrink-0">
                  <AppIcon icon={icon} size="xs" />
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="text-xs font-bold text-[var(--foreground)] truncate">
                    {field.label}
                  </ItemTitle>
                  <ItemDescription className="text-[10px] font-mono text-[var(--muted-foreground)] truncate">
                    {field.modelField}
                  </ItemDescription>
                </ItemContent>
              </div>

              <ItemActions className="shrink-0 text-right pl-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-mono font-bold text-[var(--foreground)]">
                    {displayVal}
                  </span>
                  {field.unit && (
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {field.unit}
                    </span>
                  )}
                </div>
              </ItemActions>
            </Item>
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--muted-foreground)] text-center pt-1">
        Historical assessment inputs are immutable. To test different metrics, start a new assessment.
      </p>
    </div>
  );
}
