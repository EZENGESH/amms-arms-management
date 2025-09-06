// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While checking auth state
  if (loading) return <div>Loading...</div>;

  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/login" replace />;

  // Wrap the protected content with AdminLayout
  return <AdminLayout>{children}</AdminLayout>;
}
