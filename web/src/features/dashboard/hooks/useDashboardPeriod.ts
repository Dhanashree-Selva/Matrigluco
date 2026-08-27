import { useState } from "react";

export type DashboardPeriod = "7d" | "30d";

export function useDashboardPeriod(initialPeriod: DashboardPeriod = "7d") {
  const [period, setPeriod] = useState<DashboardPeriod>(initialPeriod);
  const [selectedMetric, setSelectedMetric] = useState<string>("glucose");

  return {
    period,
    setPeriod,
    selectedMetric,
    setSelectedMetric,
  };
}
