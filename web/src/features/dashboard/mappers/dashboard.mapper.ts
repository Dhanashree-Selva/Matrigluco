import {
  AiBrain01Icon,
  Activity02Icon,
  DocumentCodeIcon,
  SparklesIcon,
  DropletIcon,
  Calendar03Icon,
  PlusSignIcon,
  Notification02Icon,
} from "@hugeicons/core-free-icons";
import {
  DashboardSummaryResponseDTO,
  DashboardViewModel,
  HealthHorizonVM,
  SignalCapsuleVM,
  CareOrbitNodeVM,
  TrendPointVM,
  JourneyTimelineEventVM,
  NextActionVM,
  RiskBand,
} from "../types/dashboard.types";
import { UserProfile } from "../../../types/auth";
import { formatDate } from "../../../lib/dates";
import { routePaths } from "../../../app/route-paths";

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "No recent reading";
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(d, { month: "short", day: "numeric" });
  } catch {
    return "Recent";
  }
}

export function mapDashboardDtoToViewModel(
  dto: DashboardSummaryResponseDTO,
  user: UserProfile | null,
  pregnancyWeek: number | null = null,
  selectedMetric: string = "glucose",
  period: "7d" | "30d" = "7d"
): DashboardViewModel {
  const latest = dto.latest_measurements || {};
  const recentPrediction = dto.recent_prediction;
  const measurementCounts = dto.measurement_counts || { total_7_days: 0, total_30_days: 0 };
  const upcomingConsultation = dto.upcoming_consultation || null;

  // 1. Determine Primary Next Action
  let nextAction: NextActionVM;
  if (!recentPrediction && measurementCounts.total_7_days === 0) {
    nextAction = {
      id: "initial-assessment",
      title: "Complete Clinical Risk Assessment",
      description: "Evaluate your clinical risk profile with 8 key evidence-based maternal indicators.",
      buttonLabel: "Start Risk Assessment",
      path: routePaths.app.assessment,
      icon: AiBrain01Icon,
      variant: "primary",
    };
  } else if (!latest.glucose) {
    nextAction = {
      id: "log-glucose",
      title: "Log Today's Glucose",
      description: "Record your fasting or postprandial glucose level to maintain timeline continuity.",
      buttonLabel: "Log Glucose Reading",
      path: routePaths.app.tracking,
      icon: DropletIcon,
      variant: "primary",
    };
  } else if (upcomingConsultation) {
    nextAction = {
      id: "review-consultation",
      title: "Prepare for Consultation",
      description: `Appointment with ${upcomingConsultation.doctor_name} on ${upcomingConsultation.appointment_date} at ${upcomingConsultation.appointment_time}.`,
      buttonLabel: "View Consultation",
      path: upcomingConsultation.id
        ? routePaths.app.consultationDetail(upcomingConsultation.id)
        : routePaths.app.consultations,
      icon: Calendar03Icon,
      variant: "primary",
    };
  } else {
    nextAction = {
      id: "add-reading",
      title: "Add Health Measurement",
      description: "Continue tracking daily metabolic markers to observe weekly glucose stability.",
      buttonLabel: "Add New Reading",
      path: routePaths.app.tracking,
      icon: PlusSignIcon,
      variant: "primary",
    };
  }

  // 2. Health Horizon Narrative
  const riskBand: RiskBand = (recentPrediction?.risk_band as RiskBand) || "Unknown";
  let horizonTitle = "Your health overview is ready";
  let horizonNarrative = "Review metabolic trends, monitor risk indications, and organize your clinical care timeline.";
  let recencyText = "Updated recently";

  if (typeof pregnancyWeek === "number" && pregnancyWeek > 0) {
    horizonTitle = `Week ${pregnancyWeek} Maternal Care Overview`;
  } else {
    horizonTitle = "Maternal Care Overview";
  }

  if (recentPrediction) {
    const assessedAgo = formatRelativeTime(recentPrediction.created_at);
    horizonNarrative = `Latest clinical risk assessment indicates ${riskBand} risk band (${assessedAgo}). You have ${measurementCounts.total_7_days} measurements recorded in the last 7 days.`;
    recencyText = `Assessed ${assessedAgo}`;
  } else if (measurementCounts.total_7_days > 0) {
    horizonNarrative = `You have ${measurementCounts.total_7_days} measurements recorded in the last 7 days. Complete an initial risk assessment to unlock longitudinal risk tracking.`;
    recencyText = `${measurementCounts.total_7_days} readings this week`;
  } else {
    horizonNarrative = "Welcome to your private workspace. Begin by logging a glucose reading or completing your initial clinical risk evaluation.";
    recencyText = "Awaiting first reading";
  }

  const healthHorizon: HealthHorizonVM = {
    eyebrow: "Health Overview",
    title: horizonTitle,
    narrative: horizonNarrative,
    riskBand,
    recencyText,
    primaryAction: nextAction,
  };

  // 3. Signal Capsules
  const signals: SignalCapsuleVM[] = [
    {
      id: "glucose",
      label: "Blood Glucose",
      value: latest.glucose?.value ?? null,
      unit: latest.glucose?.unit || "mg/dL",
      measuredAt: latest.glucose?.measured_at || null,
      recencyText: formatRelativeTime(latest.glucose?.measured_at),
      isMissing: !latest.glucose,
      logPath: routePaths.app.tracking,
    },
    {
      id: "blood_pressure",
      label: "Blood Pressure",
      value: latest.blood_pressure ? `${latest.blood_pressure.systolic}/${latest.blood_pressure.diastolic}` : null,
      unit: latest.blood_pressure?.unit || "mmHg",
      measuredAt: latest.blood_pressure?.measured_at || null,
      recencyText: formatRelativeTime(latest.blood_pressure?.measured_at),
      isMissing: !latest.blood_pressure,
      logPath: routePaths.app.tracking,
    },
    {
      id: "weight",
      label: "Maternal Weight",
      value: latest.weight?.value ?? null,
      unit: latest.weight?.unit || "kg",
      measuredAt: latest.weight?.measured_at || null,
      recencyText: formatRelativeTime(latest.weight?.measured_at),
      isMissing: !latest.weight,
      logPath: routePaths.app.tracking,
    },
    {
      id: "hba1c",
      label: "HbA1c / Glycated",
      value: latest.hba1c?.value ?? (latest.bmi?.value ?? null),
      unit: latest.hba1c ? "%" : (latest.bmi ? "kg/m²" : "%"),
      measuredAt: latest.hba1c?.measured_at || latest.bmi?.measured_at || null,
      recencyText: formatRelativeTime(latest.hba1c?.measured_at || latest.bmi?.measured_at),
      isMissing: !latest.hba1c && !latest.bmi,
      logPath: routePaths.app.tracking,
    },
  ];

  // 4. Care Orbit Pillars
  const orbitNodes: CareOrbitNodeVM[] = [
    {
      id: "assess",
      label: "Assess",
      sublabel: recentPrediction ? `${riskBand} Risk` : "Clinical GDM",
      path: routePaths.app.assessment,
      icon: AiBrain01Icon,
      status: recentPrediction ? "completed" : "current",
      active: true,
    },
    {
      id: "track",
      label: "Track",
      sublabel: latest.glucose ? `${latest.glucose.value} ${latest.glucose.unit}` : "Daily Logs",
      path: routePaths.app.tracking,
      icon: Activity02Icon,
      status: latest.glucose ? "completed" : "available",
      active: false,
    },
    {
      id: "understand",
      label: "Understand",
      sublabel: "Reports & OCR",
      path: routePaths.app.reports,
      icon: DocumentCodeIcon,
      status: "available",
      active: false,
    },
    {
      id: "ask",
      label: "Consult & Ask",
      sublabel: upcomingConsultation ? "Appointment Booked" : "AI Assistant",
      path: upcomingConsultation
        ? (upcomingConsultation.id ? routePaths.app.consultationDetail(upcomingConsultation.id) : routePaths.app.consultations)
        : routePaths.app.assistant,
      icon: SparklesIcon,
      status: upcomingConsultation ? "completed" : "available",
      active: false,
    },
  ];

  // 5. Trend Points
  const trendBucket = period === "7d" ? dto.trends?.seven_day : dto.trends?.thirty_day;
  const rawPoints = trendBucket?.[selectedMetric] || [];
  const trendPoints: TrendPointVM[] = rawPoints.map((pt) => {
    const d = new Date(pt.measured_at);
    return {
      date: pt.measured_at,
      timestamp: d.getTime(),
      value: pt.value_primary,
      secondaryValue: pt.value_secondary ?? undefined,
      formattedDate: formatDate(d, { month: "short", day: "numeric" }),
      timeLabel: formatDate(d, { hour: "numeric", minute: "numeric" }),
    };
  });

  // 6. Recent Care Timeline Activities (from Database API)
  const recentActivity: JourneyTimelineEventVM[] = [];

  const resolveActivityPath = (act: { id: string; type?: string; path?: string }): string => {
    if (act.path && act.path.startsWith("/app/")) {
      return act.path;
    }
    const cleanId = act.id.replace(/^(consult|assess|pred|meas|report)-/, "");
    if (act.type === "consultation") {
      return cleanId ? routePaths.app.consultationDetail(cleanId) : routePaths.app.consultations;
    }
    if (act.type === "assessment") {
      return cleanId ? routePaths.app.assessmentDetail(cleanId) : routePaths.app.assessment;
    }
    if (act.type === "report") {
      return cleanId ? routePaths.app.reportDetail(cleanId) : routePaths.app.reports;
    }
    if (act.type === "measurement") {
      return routePaths.app.tracking;
    }
    return routePaths.app.history;
  };

  if (dto.recent_activities && dto.recent_activities.length > 0) {
    for (const act of dto.recent_activities) {
      let icon = Notification02Icon;
      if (act.type === "consultation") icon = Calendar03Icon;
      else if (act.type === "assessment") icon = AiBrain01Icon;
      else if (act.type === "report") icon = DocumentCodeIcon;
      else if (act.title.toLowerCase().includes("glucose")) icon = DropletIcon;
      else if (act.title.toLowerCase().includes("pressure")) icon = Activity02Icon;
      else if (act.type === "measurement") icon = DropletIcon;

      const relTime = act.relative_time || (act.is_upcoming ? "Upcoming" : formatRelativeTime(act.timestamp));

      recentActivity.push({
        id: act.id,
        type: (act.type as any) || "measurement",
        title: act.title,
        description: act.description,
        timestamp: act.timestamp,
        relativeTime: relTime,
        path: resolveActivityPath(act),
        icon,
      });
    }
  } else {
    // Dynamic assembly fallback
    if (upcomingConsultation) {
      recentActivity.push({
        id: `consult-${upcomingConsultation.id}`,
        type: "consultation",
        title: `Consultation with ${upcomingConsultation.doctor_name}`,
        description: `Scheduled for ${upcomingConsultation.appointment_date} at ${upcomingConsultation.appointment_time}`,
        timestamp: upcomingConsultation.appointment_date,
        relativeTime: "Upcoming",
        path: upcomingConsultation.id ? routePaths.app.consultationDetail(upcomingConsultation.id) : routePaths.app.consultations,
        icon: Calendar03Icon,
      });
    }

    if (recentPrediction) {
      recentActivity.push({
        id: `pred-${recentPrediction.id}`,
        type: "assessment",
        title: "GDM Risk Assessment Completed",
        description: `Evaluated at ${riskBand} risk (${recentPrediction.prediction_result || "Standard model"}).`,
        timestamp: recentPrediction.created_at,
        relativeTime: formatRelativeTime(recentPrediction.created_at),
        path: routePaths.app.assessmentDetail(recentPrediction.id),
        icon: AiBrain01Icon,
      });
    }

    if (latest.glucose) {
      recentActivity.push({
        id: "meas-glucose",
        type: "measurement",
        title: "Blood Glucose Recorded",
        description: `${latest.glucose.value} ${latest.glucose.unit} logged.`,
        timestamp: latest.glucose.measured_at,
        relativeTime: formatRelativeTime(latest.glucose.measured_at),
        path: routePaths.app.tracking,
        icon: DropletIcon,
      });
    }

    if (latest.blood_pressure) {
      recentActivity.push({
        id: "meas-bp",
        type: "measurement",
        title: "Blood Pressure Recorded",
        description: `${latest.blood_pressure.systolic}/${latest.blood_pressure.diastolic} ${latest.blood_pressure.unit} logged.`,
        timestamp: latest.blood_pressure.measured_at,
        relativeTime: formatRelativeTime(latest.blood_pressure.measured_at),
        path: routePaths.app.tracking,
        icon: Activity02Icon,
      });
    }

    if (recentActivity.length === 0) {
      recentActivity.push({
        id: "welcome",
        type: "notification",
        title: "Care Workspace Initialized",
        description: "Welcome to Matrigluco. Begin your metabolic health journey.",
        timestamp: new Date().toISOString(),
        relativeTime: "Just now",
        path: routePaths.app.tracking,
        icon: Notification02Icon,
      });
    }
  }

  const hasData = Boolean(recentPrediction || latest.glucose || latest.blood_pressure || latest.weight);

  const trendMetricUnit =
    selectedMetric === "glucose"
      ? "mg/dL"
      : selectedMetric === "blood_pressure"
      ? "mmHg"
      : "kg";

  return {
    user,
    pregnancyWeek,
    healthHorizon,
    nextAction,
    signals,
    orbitNodes,
    trendPoints,
    trendMetric: selectedMetric,
    trendMetricUnit,
    recentActivity,
    upcomingConsultation,
    measurementCounts: measurementCounts || { total_7_days: 0, total_30_days: 0 },
    hasData,
  };
}

export const mapDashboardData = mapDashboardDtoToViewModel;
