import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { OnboardingRoute } from "./OnboardingRoute";
import { routePaths } from "./route-paths";

// Layouts
import { MarketingLayout } from "../../layouts/MarketingLayout";
import { AuthLayout } from "../../layouts/AuthLayout";
import { OnboardingLayout } from "../../layouts/OnboardingLayout";
import { AppLayout } from "../../layouts/AppLayout/AppLayout";

// System Pages
import NotFoundPage from "../../pages/NotFoundPage";
import PublicNotFoundPage from "../../pages/system/PublicNotFoundPage";
import AppNotFoundPage from "../../pages/system/AppNotFoundPage";
import AccessRestrictedPage from "../../pages/system/AccessRestrictedPage";
import OfflinePage from "../../pages/system/OfflinePage";
import MaintenancePage from "../../pages/system/MaintenancePage";

// Marketing
import LandingPage from "../../features/marketing/pages/LandingPage";

// Authentication Pages
import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "../../features/auth/pages/VerifyEmailPage";

// Features & Pages
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import AssessmentPage from "../../features/assessment/pages/AssessmentPage";
import RiskResultPage from "../../features/assessment/pages/RiskResultPage";
import TrackingPage from "../../features/tracking/pages/TrackingPage";
import HistoryPage from "../../features/history/pages/HistoryPage";
import ReportsPage from "../../features/reports/pages/ReportsPage";
import ReportDetailPage from "../../features/reports/pages/ReportDetailPage";
import AssistantPage from "../../features/assistant/pages/AssistantPage";
import ProfilePage from "../../features/account/pages/ProfilePage";
import PreferencesPage from "../../features/account/pages/PreferencesPage";
import SecurityPage from "../../features/account/pages/SecurityPage";
import NotificationsPage from "../../features/notifications/pages/NotificationsPage";
import ManualEntry from "../../pages/ManualEntry";
import DiabetesPrediction from "../../pages/DiabetesPrediction";
import ConsultationsPage from "../../features/consultations/pages/ConsultationsPage";
import DoctorDetailPage from "../../features/consultations/pages/DoctorDetailPage";
import BookAppointmentPage from "../../features/consultations/pages/BookAppointmentPage";
import ConsultationDetailPage from "../../features/consultations/pages/ConsultationDetailPage";
import ConsultationConfirmationPage from "../../features/consultations/pages/ConsultationConfirmationPage";
import ConsultationRoomPage from "../../features/consultations/pages/ConsultationRoomPage";
import Onboarding from "../../pages/onboarding/Onboarding";

export function AppRouter() {
  return (
    <Routes>
      {/* 1. Public Marketing Landing */}
      <Route
        path={routePaths.home}
        element={
          <MarketingLayout>
            <LandingPage />
          </MarketingLayout>
        }
      />

      {/* 2. Authentication Flow */}
      <Route
        path={routePaths.auth.login}
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path={routePaths.auth.register}
        element={
          <PublicRoute>
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path={routePaths.auth.forgotPassword}
        element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path={routePaths.auth.resetPassword}
        element={
          <AuthLayout>
            <ResetPasswordPage />
          </AuthLayout>
        }
      />
      <Route
        path={routePaths.auth.verifyEmail}
        element={
          <AuthLayout>
            <VerifyEmailPage />
          </AuthLayout>
        }
      />
      <Route path="/auth" element={<Navigate to={routePaths.auth.login} replace />} />

      {/* 3. Onboarding (Authenticated + Incomplete) */}
      <Route
        path={routePaths.onboarding}
        element={
          <OnboardingRoute>
            <OnboardingLayout>
              <Onboarding onComplete={() => {}} />
            </OnboardingLayout>
          </OnboardingRoute>
        }
      />

      {/* 4. Authenticated Application Root Redirect */}
      <Route
        path={routePaths.app.root}
        element={<Navigate to={routePaths.app.dashboard} replace />}
      />

      {/* 5. Protected Application Nested Routes */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="assessment" element={<AssessmentPage />} />
                <Route path="assessment/:id" element={<RiskResultPage />} />
                <Route path="tracking" element={<TrackingPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/:id" element={<ReportDetailPage />} />
                <Route path="assistant" element={<AssistantPage />} />
                <Route path="consultations" element={<ConsultationsPage />} />
                <Route path="consultations/doctor/:id" element={<DoctorDetailPage />} />
                <Route path="consultations/book/:id" element={<BookAppointmentPage />} />
                <Route path="consultations/:id" element={<ConsultationDetailPage />} />
                <Route path="consultations/:id/confirmation" element={<ConsultationConfirmationPage />} />
                <Route path="consultations/:id/room" element={<ConsultationRoomPage />} />
                <Route path="consultations/list" element={<Navigate to={routePaths.app.consultations} replace />} />
                <Route path="consultations/confirmation" element={<Navigate to={routePaths.app.consultations} replace />} />
                <Route path="consultations/chat" element={<Navigate to={routePaths.app.consultations} replace />} />
                <Route path="consultations/call" element={<Navigate to={routePaths.app.consultations} replace />} />
                <Route path="consultations/prescriptions" element={<Navigate to={routePaths.app.consultations} replace />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="account" element={<Navigate to={routePaths.app.account.profile} replace />} />
                <Route path="account/profile" element={<ProfilePage />} />
                <Route path="account/security" element={<SecurityPage />} />
                <Route path="account/preferences" element={<PreferencesPage />} />
                <Route path="access-restricted" element={<AccessRestrictedPage />} />
                <Route path="offline" element={<OfflinePage />} />
                <Route path="*" element={<AppNotFoundPage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 6. Legacy Route Compatibility Redirects */}
      <Route path="/track" element={<Navigate to={routePaths.app.tracking} replace />} />
      <Route path="/history" element={<Navigate to={routePaths.app.history} replace />} />
      <Route path="/prediction" element={<Navigate to={routePaths.app.assessment} replace />} />
      <Route path="/risk-details" element={<Navigate to={routePaths.app.assessment} replace />} />
      <Route path="/profile" element={<Navigate to={routePaths.app.account.profile} replace />} />
      <Route path="/profile/details" element={<Navigate to={routePaths.app.account.profile} replace />} />
      <Route path="/profile/security" element={<Navigate to={routePaths.app.account.security} replace />} />
      <Route path="/notifications" element={<Navigate to={routePaths.app.notifications} replace />} />
      <Route path="/manual-entry" element={<Navigate to={routePaths.app.tracking} replace />} />
      <Route path="/doctor" element={<Navigate to={routePaths.app.consultations} replace />} />
      <Route path="/doctor/list" element={<Navigate to="/app/consultations/list" replace />} />
      <Route path="/doctor/book/:id" element={<Navigate to="/app/consultations" replace />} />
      <Route path="/doctor/confirmation" element={<Navigate to="/app/consultations/confirmation" replace />} />
      <Route path="/doctor/chat" element={<Navigate to="/app/consultations/chat" replace />} />
      <Route path="/doctor/call" element={<Navigate to="/app/consultations/call" replace />} />
      <Route path="/doctor/prescriptions" element={<Navigate to="/app/consultations/prescriptions" replace />} />
      <Route path="/chat" element={<Navigate to={routePaths.app.assistant} replace />} />
      <Route path="/assistant" element={<Navigate to={routePaths.app.assistant} replace />} />
      <Route path="/ai" element={<Navigate to={routePaths.app.assistant} replace />} />
      <Route path="/offline" element={<OfflinePage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/access-restricted" element={<AccessRestrictedPage />} />

      {/* 7. Catch-all Global Public Unknown Route */}
      <Route path="*" element={<PublicNotFoundPage />} />
    </Routes>
  );
}
