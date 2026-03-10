import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import { useAuth } from '../context/AuthContext';

// Loading spinner
const Spinner = () => (
  <div className="min-h-screen bg-void flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
  </div>
);

// Requires any logged-in user
export function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Requires admin role + admin secret in session
export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/admin" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  const hasSecret = Boolean(sessionStorage.getItem('cms_admin_secret'));
  if (!hasSecret) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

// Redirect logged-in users away from auth pages
export function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return <Outlet />;
}
