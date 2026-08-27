/**
 * =============================================================================
 * MATRIGLUCO BASELINE LOAD TEST CONFIGURATION
 * =============================================================================
 */

export const LOAD_TEST_CONFIG = {
  baseUrl: process.env.API_BASE_URL || "http://127.0.0.1:8000",
  virtualUsers: parseInt(process.env.CONCURRENT_USERS || "100", 10), // 100 Virtual Users
  durationSeconds: parseInt(process.env.DURATION_SECONDS || "60", 10), // 1 minute (60 seconds)
  rampUpSeconds: 5, // 5s smooth ramp-up to 100 VUs
  timeoutMs: 10000,
  endpoints: [
    {
      name: "Health Liveness Probe",
      path: "/api/v1/health/live",
      method: "GET",
      weight: 30,
    },
    {
      name: "Health Readiness Check",
      path: "/api/v1/health/ready",
      method: "GET",
      weight: 20,
    },
    {
      name: "ML Risk Model Metadata",
      path: "/api/v1/ml/models",
      method: "GET",
      weight: 15,
    },
    {
      name: "Clinical GDM Risk Prediction",
      path: "/api/v1/ml/assessments",
      method: "POST",
      weight: 15,
      body: {
        age: 28,
        pre_pregnancy_bmi: 24.2,
        fasting_blood_glucose: 92.0,
        systolic_bp: 118,
        diastolic_bp: 76,
        gestational_age_weeks: 24,
        prior_gdm_history: false,
        family_diabetes_history: true,
      },
    },
    {
      name: "Auth Login Validation",
      path: "/api/v1/auth/login",
      method: "POST",
      weight: 10,
      body: {
        email: "eswarchinthakayala85@gmail.com",
        password: "SampleUserPassword123!",
      },
    },
    {
      name: "AI Assistant Gateway",
      path: "/api/v1/chatbot/conversations",
      method: "GET",
      weight: 10,
    },
  ],
};
