import { SystemStateKind } from "../../shared/illustrations/system-states/system-state.types";

export interface NormalizedAppError {
  kind: SystemStateKind;
  headline: string;
  description: string;
  statusCode?: number;
  requestId?: string | null;
  isRecoverable: boolean;
  canRetry: boolean;
  rawMessage?: string;
}
