import { ReactNode } from "react";
import { UserProfile } from "../../../types/auth";

export interface LatestMeasurementDTO {
  metric_type: string;
  value: number;
  unit: string;
  measured_at: string;
}

export interface BloodPressureSummaryDTO {
  systolic: number;
  diastolic: number;
  unit: string;
  measured_at: string;
}

export interface RecentPredictionDTO {
  id: string;
  probability: number;
  probability_score: number;
  risk_band: string; // "Low" | "Moderate" | "High"
  prediction_result: string;
  created_at: string;
}

export interface UpcomingConsultationDTO {
  id: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

export interface TrendPointDTO {
  measured_at: string;
  value_primary: number;
  value_secondary?: number | null;
}

export interface MeasurementCountDTO {
  total_7_days: number;
  total_30_days: number;
}

export interface DashboardSummaryResponseDTO {
  latest_measurements: {
    glucose?: LatestMeasurementDTO | null;
    fasting_glucose?: LatestMeasurementDTO | null;
    postprandial_glucose?: LatestMeasurementDTO | null;
    blood_pressure?: BloodPressureSummaryDTO | null;
    weight?: LatestMeasurementDTO | null;
    bmi?: LatestMeasurementDTO | null;
    hba1c?: LatestMeasurementDTO | null;
    [key: string]: LatestMeasurementDTO | BloodPressureSummaryDTO | null | undefined;
  };
  recent_prediction?: RecentPredictionDTO | null;
  trends?: {
    seven_day?: Record<string, TrendPointDTO[]>;
    thirty_day?: Record<string, TrendPointDTO[]>;
  };
  measurement_counts?: MeasurementCountDTO;
  upcoming_consultation?: UpcomingConsultationDTO | null;
  recent_activities?: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    relative_time?: string;
    path?: string;
    is_upcoming?: boolean;
  }>;
}

// ── View Models (Mapped Presentation Types) ──────────────────────────────────

export type RiskBand = "Low" | "Moderate" | "High" | "Unknown";

export interface HealthHorizonVM {
  eyebrow: string;
  title: string;
  narrative: string;
  statusBadge?: ReactNode;
  riskBand: RiskBand;
  recencyText: string;
  primaryAction: NextActionVM;
}

export interface SignalCapsuleVM {
  id: string;
  label: string;
  value: number | string | null;
  secondaryValue?: number | string | null;
  unit: string;
  measuredAt: string | null;
  recencyText: string;
  direction?: "up" | "down" | "flat" | "none";
  deltaText?: string;
  isMissing: boolean;
  logPath: string;
}

export interface CareOrbitNodeVM {
  id: string;
  label: string;
  sublabel: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  status: "completed" | "current" | "available" | "upcoming";
  active: boolean;
}

export interface TrendPointVM {
  date: string;
  timestamp: number;
  value: number;
  secondaryValue?: number;
  formattedDate: string;
  timeLabel: string;
}

export interface JourneyTimelineEventVM {
  id: string;
  type: "measurement" | "assessment" | "report" | "consultation" | "notification";
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  path?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export interface NextActionVM {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  variant?: "primary" | "secondary" | "outline";
}

export interface DashboardViewModel {
  user: UserProfile | null;
  pregnancyWeek: number | null;
  healthHorizon: HealthHorizonVM;
  nextAction: NextActionVM;
  signals: SignalCapsuleVM[];
  trendPoints: TrendPointVM[];
  trendMetric: string;
  trendMetricUnit: string;
  recentActivity: JourneyTimelineEventVM[];
  upcomingConsultation: UpcomingConsultationDTO | null;
  orbitNodes: CareOrbitNodeVM[];
  measurementCounts: MeasurementCountDTO;
  hasData: boolean;
}
