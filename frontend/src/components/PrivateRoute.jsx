import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show a loader until AuthContext finishes checking localStorage
  if (loading) return <div>Loading...</div>;

  // Once loading is done, redirect if no user
  if (!user) return <Navigate to="/login" replace />;

  // User exists, render children
  return children;
}
