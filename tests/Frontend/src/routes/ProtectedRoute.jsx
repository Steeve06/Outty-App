// Frontend/src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, role } = useAuth();

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" />;

  // Logged in but wrong role → redirect to dashboard
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}