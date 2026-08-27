export type HealthMetricType = "blood_glucose" | "blood_pressure" | "weight" | "hba1c" | "fetal_movement";

export interface HealthMeasurementCreate {
  metric_type: HealthMetricType;
  metric_value: number;
  secondary_value?: number | null;
  unit: string;
  measured_at?: string;
  notes?: string | null;
}

export interface HealthMeasurementRecord {
  id: string;
  user_id?: string;
  metric_type: HealthMetricType;
  metric_value: number;
  secondary_value?: number | null;
  unit: string;
  measured_at: string;
  notes?: string | null;
  created_at: string;
}

export interface HealthListResponse {
  items: HealthMeasurementRecord[];
  total: number;
}
