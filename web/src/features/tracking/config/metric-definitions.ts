import {
  DropletIcon,
  HeartCheckIcon,
  WeightScale01Icon,
  Activity01Icon,
  Dna01Icon,
} from "@hugeicons/core-free-icons";
import type { HugeIconComponent } from "../../../components/common/AppIcon";

export type TrackingMetricType =
  | "glucose"
  | "blood_pressure"
  | "weight"
  | "bmi"
  | "hba1c";

export interface MetricDefinition {
  type: TrackingMetricType;
  label: string;
  shortLabel: string;
  unit: string;
  icon: HugeIconComponent;
  isDualValue: boolean;
  min: number;
  max: number;
  step: number;
  placeholder: string;
  secondaryPlaceholder?: string;
  secondaryMin?: number;
  secondaryMax?: number;
  secondaryLabel?: string;
  description: string;
}

export const METRIC_DEFINITIONS: Record<TrackingMetricType, MetricDefinition> = {
  glucose: {
    type: "glucose",
    label: "Fasting / Plasma Glucose",
    shortLabel: "Glucose",
    unit: "mg/dL",
    icon: DropletIcon,
    isDualValue: false,
    min: 30,
    max: 500,
    step: 1,
    placeholder: "102",
    description: "Capillary blood or laboratory plasma glucose reading",
  },
  blood_pressure: {
    type: "blood_pressure",
    label: "Blood Pressure",
    shortLabel: "Blood Pressure",
    unit: "mmHg",
    icon: HeartCheckIcon,
    isDualValue: true,
    min: 60,
    max: 250,
    secondaryMin: 40,
    secondaryMax: 160,
    step: 1,
    placeholder: "120",
    secondaryPlaceholder: "80",
    secondaryLabel: "Diastolic",
    description: "Systolic and diastolic arterial pressure",
  },
  weight: {
    type: "weight",
    label: "Maternal Body Weight",
    shortLabel: "Weight",
    unit: "kg",
    icon: WeightScale01Icon,
    isDualValue: false,
    min: 30,
    max: 250,
    step: 0.1,
    placeholder: "64.5",
    description: "Calibrated scale measurement in kilograms",
  },
  bmi: {
    type: "bmi",
    label: "Body Mass Index",
    shortLabel: "BMI",
    unit: "kg/m²",
    icon: Activity01Icon,
    isDualValue: false,
    min: 10,
    max: 70,
    step: 0.1,
    placeholder: "24.2",
    description: "Anthropometric body mass index ratio",
  },
  hba1c: {
    type: "hba1c",
    label: "Glycated Hemoglobin (HbA1c)",
    shortLabel: "HbA1c",
    unit: "%",
    icon: Dna01Icon,
    isDualValue: false,
    min: 3.0,
    max: 20.0,
    step: 0.1,
    placeholder: "5.6",
    description: "Standardized 3-month glycemic control biomarker",
  },
};

export const TRACKING_METRIC_LIST: MetricDefinition[] = Object.values(METRIC_DEFINITIONS);
