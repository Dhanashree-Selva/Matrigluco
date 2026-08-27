import { useState } from "react";
import {
  Button,
  Badge,
  Spinner,
} from "../../../../shared/ui";
import {
  DocumentCodeIcon,
  Tick01Icon,
  Edit02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { ReportViewModel } from "../../types/reports.types";
import { ExtractionField } from "./ExtractionField";
import { useReviewReport } from "../../hooks/useReviewReport";

interface ExtractionLedgerProps {
  report: ReportViewModel;
}

export function ExtractionLedger({ report }: ExtractionLedgerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableValues, setEditableValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const item of report.extractedValues) {
      map[item.key] = String(item.value ?? "");
    }
    return map;
  });

  const reviewMutation = useReviewReport();

  const handleFieldChange = (key: string, value: string) => {
    setEditableValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveReview = async () => {
    const parsedValues: Record<string, any> = { ...report.rawExtractedValues };
    for (const [k, v] of Object.entries(editableValues)) {
      const num = Number(v);
      parsedValues[k] = isNaN(num) || v.trim() === "" ? v : num;
    }

    try {
      await reviewMutation.mutateAsync({
        reportId: report.id,
        updatedExtractedValues: parsedValues,
        markAsReviewed: true,
      });
      setIsEditing(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  const isReviewed = report.reviewStatus === "reviewed";

  // Determine items to display
  const itemsToDisplay =
    report.extractedValues.length > 0
      ? report.extractedValues
      : Object.keys(editableValues).length > 0
      ? Object.entries(editableValues).map(([k, v]) => ({
          key: k,
          label:
            k === "fasting_glucose"
              ? "Fasting Glucose"
              : k === "postprandial_glucose"
              ? "Postprandial Glucose (PP)"
              : k === "hba1c"
              ? "Glycated Hemoglobin (HbA1c)"
              : k === "bp_systolic"
              ? "Systolic Blood Pressure"
              : k === "bp_diastolic"
              ? "Diastolic Blood Pressure"
              : k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          value: v,
          unit: k.includes("glucose")
            ? "mg/dL"
            : k.includes("hba1c")
            ? "%"
            : k.includes("bp")
            ? "mmHg"
            : "",
        }))
      : [];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-[var(--foreground)] tracking-tight">
              Extracted Biomarkers
            </h2>
            <Badge
              variant="outline"
              className="text-[10px] font-mono font-bold py-0 px-2 bg-[var(--surface-soft)] text-[var(--foreground)] border-[var(--border-subtle)]"
            >
              {itemsToDisplay.length} {itemsToDisplay.length === 1 ? "value" : "values"}
            </Badge>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Review and confirm extracted laboratory parameters against the source document.
          </p>
        </div>

        {/* Edit / Confirm Mode Controls */}
        {itemsToDisplay.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={reviewMutation.isPending}
                  className="text-xs font-bold gap-1"
                >
                  <AppIcon icon={Cancel01Icon} size="xs" />
                  <span>Cancel</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveReview}
                  disabled={reviewMutation.isPending}
                  className="text-xs font-bold gap-1.5 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-sm"
                >
                  {reviewMutation.isPending ? (
                    <>
                      <Spinner className="h-3 w-3 text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <AppIcon icon={Tick01Icon} size="xs" />
                      <span>Save & Verify</span>
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold gap-1.5 border-[var(--border)] hover:bg-[var(--surface-soft)]"
              >
                <AppIcon icon={Edit02Icon} size="xs" />
                <span>Edit / Correct</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Extracted Fields List */}
      {itemsToDisplay.length > 0 ? (
        <div className="space-y-2.5">
          {itemsToDisplay.map((item) => (
            <ExtractionField
              key={item.key}
              item={item}
              isEditing={isEditing}
              editValue={editableValues[item.key] ?? String(item.value ?? "")}
              onEditChange={(val) => handleFieldChange(item.key, val)}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-soft)]/40 space-y-3">
          <div className="h-10 w-10 rounded-full bg-[var(--surface-soft)] text-[var(--muted-foreground)] flex items-center justify-center mx-auto border border-[var(--border-subtle)]">
            <AppIcon icon={DocumentCodeIcon} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-[var(--foreground)]">
              No structured parameters detected
            </p>
            <p className="text-[11px] text-[var(--muted-foreground)] max-w-sm mx-auto">
              You can populate candidate clinical biomarkers to verify against your document and start tracking them.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditableValues({
                fasting_glucose: "104",
                postprandial_glucose: "142",
                hba1c: "5.6",
                bp_systolic: "120",
                bp_diastolic: "80",
              });
              setIsEditing(true);
            }}
            className="text-xs font-bold gap-1.5 border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--accent-soft)]"
          >
            <AppIcon icon={Edit02Icon} size="xs" />
            <span>+ Add Lab Biomarkers for Review</span>
          </Button>
        </div>
      )}

      {/* Primary Verification Action (if not yet reviewed) */}
      {!isReviewed && itemsToDisplay.length > 0 && !isEditing && (
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-[var(--border-subtle)]">
          <span className="text-xs text-[var(--muted-foreground)]">
            Everything matches your original document?
          </span>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveReview}
            disabled={reviewMutation.isPending}
            className="gap-1.5 text-xs font-bold bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-sm"
          >
            {reviewMutation.isPending ? (
              <>
                <Spinner className="h-3 w-3 text-white" />
                <span>Confirming...</span>
              </>
            ) : (
              <>
                <AppIcon icon={CheckmarkCircle02Icon} size="xs" />
                <span>Confirm All as Verified</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
