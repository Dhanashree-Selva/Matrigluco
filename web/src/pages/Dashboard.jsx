import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Notification02Icon,
  HelpCircleIcon,
  DropletIcon,
  HeartCheckIcon,
  WeightScaleIcon,
  Medicine01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { authApi, predictionsApi } from "../api";
import {
  HealthHorizon,
  CareOrbit,
  SignalCapsule,
  JourneyRail,
  ActionBeacon,
  ContextDrawer,
} from "../components/care-orbit";
import { ThemeToggle } from "../components/theme/theme-toggle";
import { RiskBadge } from "../components/common/RiskBadge";
import { MedicalDisclaimer } from "../components/common/MedicalDisclaimer";
import { AppIcon } from "../components/common/AppIcon";
import { calculatePregnancyWeek, formatDate } from "../lib/dates";

export default function Dashboard() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = await authApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }

      const predRes = await predictionsApi.getPredictions({ limit: 1 });
      const list = predRes?.items || (Array.isArray(predRes) ? predRes : []);
      if (list.length > 0) {
        setPrediction(list[0]);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const userName =
    user?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Mama";

  const pregnancyWeek = calculatePregnancyWeek(
    user?.due_date || user?.expected_due_date || user?.user_metadata?.expected_due_date
  );

  const journeySteps = [
    {
      id: "assess",
      title: "GDM Risk Assessment",
      description: prediction
        ? `Completed with ${prediction.risk_level || "low"} risk.`
        : "Complete your initial clinical risk evaluation.",
      status: prediction ? "completed" : "current",
    },
    {
      id: "track",
      title: "Daily Glucose Telemetry",
      description: "Log fasting and postprandial glucose values.",
      status: prediction ? "current" : "upcoming",
    },
    {
      id: "consult",
      title: "Obstetric Consultation",
      description: "Review health trajectory with specialist team.",
      status: "upcoming",
    },
    {
      id: "delivery",
      title: "Postpartum Care",
      description: "Continuity of metabolic health monitoring.",
      status: "upcoming",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-28 pt-6 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Bar */}
        <header className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                {getGreeting()}
              </span>
              {pregnancyWeek !== "—" && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--primary)]">
                  Week {pregnancyWeek}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              {userName}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open clinical context"
              className="p-2.5 rounded-md bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--primary)] border border-[var(--border)] transition-colors"
            >
              <AppIcon icon={HelpCircleIcon} size="sm" />
            </button>

            <button
              onClick={() => navigate("/notifications")}
              aria-label="Notifications"
              className="p-2.5 rounded-md bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--primary)] border border-[var(--border)] relative transition-colors"
            >
              <AppIcon icon={Notification02Icon} size="sm" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-md bg-[var(--primary)]" />
            </button>
          </div>
        </header>

        {/* 1. Health Horizon Surface */}
        <HealthHorizon
          eyebrow="Clinical Horizon"
          title={
            prediction
              ? `Your latest assessment shows ${prediction.risk_level || "low"} risk.`
              : "Welcome to your maternal health overview."
          }
          narrative={
            prediction
              ? `Assessed on ${formatDate(prediction.created_at)}. Blood glucose was ${prediction.glucose} mg/dL with a BMI of ${prediction.bmi} kg/m².`
              : "Begin by submitting your clinical assessment to establish baseline metabolic tracking during your pregnancy."
          }
          statusBadge={
            prediction && <RiskBadge level={prediction.risk_level || "low"} size="sm" />
          }
          timestamp={prediction ? formatDate(prediction.created_at) : undefined}
          primaryAction={
            <ActionBeacon
              label={prediction ? "New Assessment" : "Start Assessment"}
              sublabel={prediction ? "Update metrics" : "Takes 2 minutes"}
              onClick={() => navigate("/prediction")}
            />
          }
        />

        {/* 2. Care Orbit Orientation */}
        <CareOrbit
          centerTitle="Care Orientation"
          centerSubtitle="Navigate through your maternal healthcare pillars"
        />

        {/* 3. Signal Capsules Grid */}
        <section aria-label="Recent Health Telemetry">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                Signal Capsules
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] font-medium">
                Recent metabolic readings and clinical telemetry
              </p>
            </div>
            <button
              onClick={() => navigate("/track")}
              className="text-xs font-bold text-[var(--primary)] hover:underline"
            >
              View all readings →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SignalCapsule
              label="Blood Glucose"
              value={prediction?.glucose || "95"}
              unit="mg/dL"
              icon={DropletIcon}
              trend={prediction?.glucose && prediction.glucose > 120 ? "up" : "stable"}
              contextLabel="Fasting / Recent"
              timestamp={prediction ? formatDate(prediction.created_at) : "Baseline"}
            />
            <SignalCapsule
              label="Blood Pressure"
              value={prediction?.blood_pressure || "118/78"}
              unit="mmHg"
              icon={HeartCheckIcon}
              trend="stable"
              contextLabel="Diastolic target"
              timestamp="Resting"
            />
            <SignalCapsule
              label="Body Mass Index"
              value={prediction?.bmi ? Number(prediction.bmi).toFixed(1) : "24.2"}
              unit="kg/m²"
              icon={WeightScaleIcon}
              trend="stable"
              contextLabel="Obstetric baseline"
              timestamp="Standard"
            />
            <SignalCapsule
              label="Insulin Level"
              value={prediction?.insulin || "80"}
              unit="µU/mL"
              icon={Medicine01Icon}
              trend="stable"
              contextLabel="Canonical baseline"
              timestamp="Clinical"
            />
          </div>
        </section>

        {/* 4. Journey Rail */}
        <JourneyRail
          title="Care Journey Milestones"
          steps={journeySteps}
        />

        {/* Medical Disclaimer Support */}
        <MedicalDisclaimer />
      </div>

      {/* 5. Context Drawer */}
      <ContextDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Clinical Context & Guidance"
        subtitle="Understanding Gestational Diabetes Risk"
        footer={
          <ActionBeacon
            label="Schedule Consultation"
            onClick={() => {
              setDrawerOpen(false);
              navigate("/doctor");
            }}
          />
        }
      >
        <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed">
          <div className="p-4 rounded-md bg-[var(--accent-soft)] border border-[var(--border-pink)] text-[var(--foreground)]">
            <h4 className="font-bold text-sm mb-1 text-[var(--primary)] flex items-center gap-1.5">
              <AppIcon icon={SparklesIcon} size="xs" /> What is GDM?
            </h4>
            <p>
              Gestational Diabetes Mellitus (GDM) is a condition in which hormones produced during pregnancy reduce insulin sensitivity, causing elevated maternal blood glucose levels.
            </p>
          </div>

          <p>
            Early screening and consistent nutritional tracking allow mothers to manage glycemic levels safely, reducing complications for both mother and child.
          </p>

          <h5 className="font-bold text-sm text-[var(--foreground)] pt-2">
            Key Recommendations:
          </h5>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>Maintain fasting blood glucose between 70–95 mg/dL.</li>
            <li>Postprandial 1-hour readings should remain below 140 mg/dL.</li>
            <li>Incorporate gentle 20-minute walks after balanced meals.</li>
            <li>Discuss all high or unexpected results with your obstetrician.</li>
          </ul>
        </div>
      </ContextDrawer>
    </div>
  );
}
