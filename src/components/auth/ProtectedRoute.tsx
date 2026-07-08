import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, requireAdmin = false }: { children: JSX.Element; requireAdmin?: boolean }) {
  const { user, loading, isAdmin, approvalStatus, mustChangePassword, roleLoading } = useAuth();
  const location = useLocation();
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/app" replace />;
  }
  if (!isAdmin && approvalStatus !== "approved") {
    return <Navigate to="/pending-approval" replace />;
  }
  if (mustChangePassword && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace />;
  }
  return children;
}