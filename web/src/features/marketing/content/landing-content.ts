export const LANDING_CONTENT = {
  hero: {
    eyebrow: "Care Orbit Maternal Health Intelligence",
    headline: "Understand your health signals without turning your day into a dashboard.",
    description:
      "Matrigluco brings structured risk assessment, daily metabolic tracking, report understanding, and a local AI health-education assistant into one calm maternal-health workspace.",
    primaryCta: "Get started",
    secondaryCta: "Explore how it works",
    authCta: "Open dashboard",
  },
  trustPoints: [
    {
      title: "Local AI Architecture",
      description: "The clinical education assistant runs locally through llama.cpp without sending prompt data to cloud AI services.",
    },
    {
      title: "Private Application Data Path",
      description: "Health records and assessments flow securely through dedicated FastAPI endpoints rather than client-direct databases.",
    },
    {
      title: "Transparent Risk Output",
      description: "Risk assessments clearly present physiological factors and calibrated probabilities rather than black-box labels.",
    },
  ],
  journeySteps: [
    {
      step: "01",
      title: "Assess Risk Early",
      headline: "Structured 8-factor evaluation",
      description:
        "Input standard metabolic indicators. Matrigluco maps them strictly to validated clinical feature ranges and calculates calibrated risk estimates.",
      badge: "Clinical Model",
    },
    {
      step: "02",
      title: "Track Daily Signals",
      headline: "Log glucose, BP, and weight",
      description:
        "Continuous timeline entries without high-stress alerts. Keep a steady record of fasting and postprandial glucose to share with your obstetrician.",
      badge: "Care Orbit",
    },
    {
      step: "03",
      title: "Understand Reports",
      headline: "Private OCR document processing",
      description:
        "Upload lab reports securely. Extracted parameters are formatted into accessible clinical summaries ready for your medical review.",
      badge: "Document OCR",
    },
    {
      step: "04",
      title: "Ask for Context",
      headline: "Local health-education guidance",
      description:
        "Engage with the private AI assistant for diet, exercise, and gestational diabetes education—grounded in curated clinical knowledge.",
      badge: "Local llama.cpp",
    },
  ],
  faq: [
    {
      question: "What does the gestational diabetes risk assessment mean?",
      answer:
        "The assessment calculates an educational risk score based on 8 metabolic factors (including glucose, BMI, and blood pressure). It is designed for clinical awareness and is not a definitive medical diagnosis.",
    },
    {
      question: "Is Matrigluco a diagnostic medical device?",
      answer:
        "No. Matrigluco is an academic and patient-empowering decision support application. Always consult your obstetrician or endocrinologist for clinical diagnosis and treatment plans.",
    },
    {
      question: "How does the local AI assistant work?",
      answer:
        "When enabled, the assistant runs a quantized GGUF model via llama.cpp directly on the local backend server. It does not require external third-party AI keys and does not send private chat logs to cloud providers.",
    },
    {
      question: "How are uploaded medical reports processed?",
      answer:
        "Reports are stored in private application storage behind authenticated endpoints. When OCR extraction is initiated, parameters are parsed and presented for verification before being added to your timeline.",
    },
    {
      question: "Can I use Matrigluco without the AI assistant?",
      answer:
        "Yes. All core health tracking, manual logging, and structured risk assessment features operate independently of the local AI service.",
    },
  ],
};
