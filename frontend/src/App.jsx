import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import PlacementBot from "./components/PlacementBot";
import Spinner from "./components/ui/Spinner";
import { Page404, Page403 } from "./components/ui/ErrorPages";

const Landing = lazy(() => import("./pages/Landing"));
// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Auth
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));

// Student
const ResumeWizard = lazy(() => import("./pages/student/ResumeWizard"));
const Feed = lazy(() => import("./pages/student/Feed"));
const Tracker = lazy(() => import("./pages/student/Tracker"));
const SkillGap = lazy(() => import("./pages/student/SkillGap"));

// TPO
const TPODashboard = lazy(() => import("./pages/tpo/Dashboard"));
const DriveManager = lazy(() => import("./pages/tpo/DriveManager"));
const Notifications = lazy(() => import("./pages/tpo/Notifications"));
const Scheduler = lazy(() => import("./pages/tpo/Scheduler"));

// Alumni
const JobBoard = lazy(() => import("./pages/alumni/JobBoard"));
const Mentorship = lazy(() => import("./pages/alumni/Mentorship"));

// ── Role defaults for root redirect ──────────────────────────────────────────
const ROLE_DEFAULTS = {
  tpo: "/tpo/dashboard",
  student: "/student/feed",
  alumni: "/alumni/jobs",
};

function RootRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" className="text-primary-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_DEFAULTS[role] || "/login"} replace />;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" className="text-primary-600" />
    </div>
  );
}

function PlacementBotWrapper() {
  const { user } = useAuth();
  if (!user) return null;
  return <PlacementBot />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root */}
        <Route path="/" element={<Landing />} />

        {/* Auth — public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Student routes */}
        <Route
          path="/student/feed"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/resume"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ResumeWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tracker"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/skill-gap"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <SkillGap />
            </ProtectedRoute>
          }
        />

        {/* TPO routes */}
        <Route
          path="/tpo/dashboard"
          element={
            <ProtectedRoute allowedRoles={["tpo"]}>
              <TPODashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/drives"
          element={
            <ProtectedRoute allowedRoles={["tpo"]}>
              <DriveManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/notifications"
          element={
            <ProtectedRoute allowedRoles={["tpo"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tpo/scheduler"
          element={
            <ProtectedRoute allowedRoles={["tpo"]}>
              <Scheduler />
            </ProtectedRoute>
          }
        />

        {/* Alumni routes (accessible to alumni + students for viewing) */}
        <Route
          path="/alumni/jobs"
          element={
            <ProtectedRoute allowedRoles={["alumni", "student", "tpo"]}>
              <JobBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/mentorship"
          element={
            <ProtectedRoute allowedRoles={["alumni", "student"]}>
              <Mentorship />
            </ProtectedRoute>
          }
        />

        {/* Error pages */}
        <Route path="/403" element={<Page403 />} />
        <Route path="*" element={<Page404 />} />
      </Routes>

      {/* PlacementBot — visible on all authenticated pages */}
      <PlacementBotWrapper />
    </Suspense>
  );
}
