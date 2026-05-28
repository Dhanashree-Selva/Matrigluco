import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Dashboard from './pages/Dashboard';
import Track from './pages/Track';
import History from './pages/History';
import Profile from './pages/Profile';
import PersonalDetails from './pages/PersonalDetails';
import Notifications from './pages/Notifications';
import Security from './pages/Security';
import Auth from './pages/Auth';
import Navigation from './components/Navigation';
import ManualEntry from './pages/ManualEntry';
import DiabetesPrediction from './pages/DiabetesPrediction';
import RiskDetails from './pages/RiskDetails';
import ConsultationsHome from './pages/consultations/ConsultationsHome';
import DoctorList from './pages/consultations/DoctorList';
import BookAppointment from './pages/consultations/BookAppointment';
import Confirmation from './pages/consultations/Confirmation';
import Chat from './pages/consultations/Chat';
import VideoCall from './pages/consultations/VideoCall';
import Prescriptions from './pages/consultations/Prescriptions';
import SplashScreen from './pages/onboarding/SplashScreen';
import Onboarding from './pages/onboarding/Onboarding';

// ─── Session Guard ────────────────────────────────────────────────────────────
// Wraps protected routes: redirects to /auth if not logged in.
// Also redirects from /auth to / if already logged in.
function SessionGate({ session, children, requireAuth = true }) {
  if (requireAuth && !session) {
    return <Navigate to="/auth" replace />;
  }
  if (!requireAuth && session) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// ─── App Inner (needs router context) ────────────────────────────────────────
function AppInner() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [showSplash, setShowSplash] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    // Check onboarding status
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      setShouldShowOnboarding(true);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (shouldShowOnboarding) {
    return <Onboarding onComplete={() => setShouldShowOnboarding(false)} />;
  }

  // Show nothing while session is loading (avoids flash of wrong screen)
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f0e8e8] font-sans text-gray-800">
      <div className="flex-grow w-full max-w-screen-2xl mx-auto px-6 bg-white relative overflow-hidden">
        <Routes>
          {/* Public: /auth — redirects to dashboard if already signed in */}
          <Route
            path="/auth"
            element={
              <SessionGate session={session} requireAuth={false}>
                <Auth />
              </SessionGate>
            }
          />

          {/* Protected routes */}
          <Route path="/" element={<SessionGate session={session}><Dashboard /></SessionGate>} />
          <Route path="/track" element={<SessionGate session={session}><Track /></SessionGate>} />
          <Route path="/history" element={<SessionGate session={session}><History /></SessionGate>} />
          <Route path="/profile" element={<SessionGate session={session}><Profile /></SessionGate>} />
          <Route path="/profile/details" element={<SessionGate session={session}><PersonalDetails /></SessionGate>} />
          <Route path="/notifications" element={<SessionGate session={session}><Notifications /></SessionGate>} />
          <Route path="/profile/security" element={<SessionGate session={session}><Security /></SessionGate>} />
          <Route path="/prediction" element={<SessionGate session={session}><DiabetesPrediction /></SessionGate>} />
          <Route path="/risk-details" element={<SessionGate session={session}><RiskDetails /></SessionGate>} />
          <Route path="/manual-entry" element={<SessionGate session={session}><ManualEntry /></SessionGate>} />
          <Route path="/doctor" element={<SessionGate session={session}><ConsultationsHome /></SessionGate>} />
          <Route path="/doctor/list" element={<SessionGate session={session}><DoctorList /></SessionGate>} />
          <Route path="/doctor/book/:id" element={<SessionGate session={session}><BookAppointment /></SessionGate>} />
          <Route path="/doctor/confirmation" element={<SessionGate session={session}><Confirmation /></SessionGate>} />
          <Route path="/doctor/chat" element={<SessionGate session={session}><Chat /></SessionGate>} />
          <Route path="/doctor/call" element={<SessionGate session={session}><VideoCall /></SessionGate>} />
          <Route path="/doctor/prescriptions" element={<SessionGate session={session}><Prescriptions /></SessionGate>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {/* Only show nav when logged in */}
      {session && <Navigation />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
