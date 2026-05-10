import { useEffect } from 'react';
import { useLocation, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DiscoveryPage from './pages/DiscoveryPage';
import MessDetailPage from './pages/MessDetailPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import OnboardingPage from './pages/student/OnboardingPage';
import FavouritesPage from './pages/FavouritesPage';

// Owner pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerOnboarding from './pages/owner/OwnerOnboarding';
import OwnerMessEdit from './pages/owner/OwnerMessEdit';
import OwnerMenuManager from './pages/owner/OwnerMenuManager';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';

import { Toaster } from 'react-hot-toast';
import useStore from './store/useStore';

import { ROLES } from './constants/roles';

// Hide navbar on these routes
const HIDE_NAVBAR = ['/login', '/register', '/owner/onboarding', '/student/onboarding'];

function AppContent() {
  const { checkAuth, isInitializing, user } = useStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const shouldHideNavbar = HIDE_NAVBAR.some(r => location.pathname.startsWith(r));

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Initializing TrustBite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1e293b',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            border: '1px solid #f1f5f9',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
          },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
        }}
      />
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/discover" element={<DiscoveryPage />} />
        <Route path="/mess/:id" element={<MessDetailPage />} />

        {/* ── Student ────────────────────────────────────────────────── */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/onboarding" element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <OnboardingPage />
          </ProtectedRoute>
        } />
        <Route path="/favourites" element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <FavouritesPage />
          </ProtectedRoute>
        } />

        {/* ── Mess Owner ─────────────────────────────────────────────── */}
        <Route path="/owner/dashboard" element={
          <ProtectedRoute roles={[ROLES.MESS_OWNER]}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/owner/onboarding" element={
          <ProtectedRoute roles={[ROLES.MESS_OWNER]}>
            <OwnerOnboarding />
          </ProtectedRoute>
        } />
        <Route path="/owner/edit" element={
          <ProtectedRoute roles={[ROLES.MESS_OWNER]}>
            <OwnerMessEdit />
          </ProtectedRoute>
        } />
        <Route path="/owner/menu" element={
          <ProtectedRoute roles={[ROLES.MESS_OWNER]}>
            <OwnerMenuManager />
          </ProtectedRoute>
        } />

        {/* ── Admin ──────────────────────────────────────────────────── */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* ── Legacy redirects (backward compat) ─────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navigate to={
              user?.role === ROLES.ADMIN ? '/admin/dashboard' :
              user?.role === ROLES.MESS_OWNER ? '/owner/dashboard' :
              '/student/dashboard'
            } replace />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        } />

        {/* ── Fallback ───────────────────────────────────────────────── */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}