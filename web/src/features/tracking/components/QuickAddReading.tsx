import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "../../../shared/ui";
import { TrackingMetricType } from "../types/tracking.types";
import { MeasurementForm } from "./MeasurementForm";

interface QuickAddReadingProps {
  isOpen: boolean;
  onClose: () => void;
  initialMetric?: TrackingMetricType;
}

export function QuickAddReading({
  isOpen,
  onClose,
  initialMetric,
}: QuickAddReadingProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-full sm:max-w-[480px] p-6 bg-[var(--card)] border border-[var(--border)] shadow-xl">
          <DialogHeader className="p-0 space-y-1 text-left">
            <DialogTitle className="text-base font-bold text-[var(--foreground)]">
              Record Health Reading
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--muted-foreground)]">
              Add a new maternal telemetry signal to your chronological health timeline.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <MeasurementForm
              initialMetric={initialMetric}
              onSuccess={onClose}
              onCancel={onClose}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="p-5 bg-[var(--card)] border-t border-[var(--border)] max-h-[85vh] overflow-y-auto">
        <DrawerHeader className="p-0 space-y-1 text-left">
          <DrawerTitle className="text-base font-bold text-[var(--foreground)]">
            Record Health Reading
          </DrawerTitle>
          <DrawerDescription className="text-xs text-[var(--muted-foreground)]">
            Add a new maternal telemetry signal to your chronological health timeline.
          </DrawerDescription>
        </DrawerHeader>
        <div className="pt-3">
          <MeasurementForm
            initialMetric={initialMetric}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
