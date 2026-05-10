import { Navigate, Link } from 'react-router-dom';
import useStore from '../../store/useStore';

const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'mess_owner') return '/owner/dashboard';
  return '/student/dashboard';
};

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user, isInitializing } = useStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center p-12">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-900 mb-3">Access Denied</h1>
          <p className="text-neutral-500 font-medium mb-8">
            You don&apos;t have permission to access this page.
          </p>
          <Link
            to={getDashboardPath(user?.role)}
            className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}