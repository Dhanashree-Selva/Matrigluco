import { SignalCapsule } from "./SignalCapsule";
import { SignalCapsuleVM } from "../types/dashboard.types";

export interface SignalStripProps {
  signals: SignalCapsuleVM[];
  className?: string;
}

export function SignalStrip({ signals, className = "" }: SignalStripProps) {
  return (
    <section
      aria-label="Recent Vital Signals"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 ${className}`}
    >
      {signals.map((signal) => (
        <SignalCapsule key={signal.id} signal={signal} />
      ))}
    </section>
  );
}
