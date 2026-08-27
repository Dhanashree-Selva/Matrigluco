import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  Button,
  Badge,
} from "../../../shared/ui";
import { AssessmentFieldDefinition } from "../config/assessment-fields";

interface AssessmentContextDrawerProps {
  fieldDef: AssessmentFieldDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssessmentContextDrawer({
  fieldDef,
  open,
  onOpenChange,
}: AssessmentContextDrawerProps) {
  if (!fieldDef) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[var(--card)] border-t border-[var(--border)] p-4 max-h-[85vh]">
        <DrawerHeader className="text-left space-y-2 p-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--primary)]">
              Input Rationale
            </span>
            <Badge
              variant="outline"
              className="text-[10px] font-mono bg-[var(--surface-soft)] text-[var(--foreground)] border-[var(--border)]"
            >
              {fieldDef.modelField}
            </Badge>
          </div>
          <DrawerTitle className="text-lg font-black text-[var(--foreground)] tracking-tight">
            {fieldDef.label}
          </DrawerTitle>
          <DrawerDescription className="text-xs text-[var(--muted-foreground)]">
            Accepted range: {fieldDef.min} – {fieldDef.max} {fieldDef.unit ? `(${fieldDef.unit})` : ""}
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 py-4 text-xs text-[var(--foreground)]">
          <div className="p-3 rounded-md bg-[var(--background)] border border-[var(--border)] space-y-1.5">
            <span className="font-bold text-[var(--foreground)] block">Why Matrigluco asks for this:</span>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {fieldDef.detailedExplanation}
            </p>
          </div>
        </div>

        <DrawerFooter className="p-0 pt-2">
          <DrawerClose asChild>
            <Button
              className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xs h-10 rounded-md"
            >
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
