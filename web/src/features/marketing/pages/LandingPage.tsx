import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import { PatternSurface } from "../background/PatternSurface";
import { LandingNav } from "../components/LandingNav";
import { HeroCareOrbit } from "../components/HeroCareOrbit";
import { TrustStrip } from "../components/TrustStrip";
import { JourneyRail } from "../components/JourneyRail";
import { AssessmentStory } from "../components/AssessmentStory";
import { TrackingStory } from "../components/TrackingStory";
import { ReportStory } from "../components/ReportStory";
import { AiAssistantShowcase } from "../components/AiAssistantShowcase";
import { ConsultationContinuity } from "../components/ConsultationContinuity";
import { PrivacyArchitecture } from "../components/PrivacyArchitecture";
import { FaqSection } from "../components/FaqSection";
import { FinalCta } from "../components/FinalCta";
import { LandingFooter } from "../components/LandingFooter";

export default function LandingPage() {
  useDocumentTitle("Continuous Maternal Health & Risk Awareness");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white transition-colors">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-md shadow-lg"
      >
        Skip to main content
      </a>

      {/* Floating Navigation */}
      <LandingNav />

      <main id="main-content">
        {/* 1. Hero with Orbit Pattern */}
        <PatternSurface variant="orbit" tone="base">
          <HeroCareOrbit />
        </PatternSurface>

        {/* 2. Trust Strip with Minimal Dots */}
        <PatternSurface variant="dots" tone="base">
          <TrustStrip />
        </PatternSurface>

        {/* 3. Journey Rail with Waves */}
        <PatternSurface variant="waves" tone="soft">
          <JourneyRail />
        </PatternSurface>

        {/* 4. Assessment Story with Sparse Boxes */}
        <PatternSurface variant="boxes" tone="base">
          <AssessmentStory />
        </PatternSurface>

        {/* 5. Tracking Story with Flowing Waves */}
        <PatternSurface variant="waves" tone="soft">
          <TrackingStory />
        </PatternSurface>

        {/* 6. Medical Report Intelligence with Technical Grid */}
        <PatternSurface variant="grid" tone="base">
          <ReportStory />
        </PatternSurface>

        {/* 7. Local AI Showcase with Hexagonal Mesh */}
        <PatternSurface variant="hex" tone="soft">
          <AiAssistantShowcase />
        </PatternSurface>

        {/* 8. Consultation Continuity with Soft Tone */}
        <PatternSurface variant="boxes" tone="base">
          <ConsultationContinuity />
        </PatternSurface>

        {/* 9. Privacy Architecture with Technical Grid */}
        <PatternSurface variant="grid" tone="soft">
          <PrivacyArchitecture />
        </PatternSurface>

        {/* 10. FAQ with Clean Surface */}
        <PatternSurface variant="none" tone="base">
          <FaqSection />
        </PatternSurface>

        {/* 11. Final CTA with Orbit Arcs & Dots */}
        <PatternSurface variant="orbit" tone="base">
          <FinalCta />
        </PatternSurface>
      </main>

      {/* 12. Footer */}
      <LandingFooter />
    </div>
  );
}
