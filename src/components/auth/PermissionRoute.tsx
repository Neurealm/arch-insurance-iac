import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAccess } from "@/platform/access/AccessContext";

/**
 * Route guard requiring both authentication and a specific permission code
 * scoped to the currently active tenant. Platform admins bypass permission
 * checks automatically (handled inside AccessContext).
 */
export function PermissionRoute({
  permission,
  children,
  redirectTo = "/platform",
}: {
  permission: string;
  children: JSX.Element;
  redirectTo?: string;
}) {
  return (
    <ProtectedRoute>
      <PermissionGate permission={permission} redirectTo={redirectTo}>
        {children}
      </PermissionGate>
    </ProtectedRoute>
  );
}

function PermissionGate({
  permission,
  redirectTo,
  children,
}: {
  permission: string;
  redirectTo: string;
  children: JSX.Element;
}) {
  const { loading, activeTenantId, hasPermission } = useAccess();
  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading workspace…</div>;
  }
  if (!activeTenantId) {
    return <Navigate to="/platform" replace />;
  }
  if (!hasPermission(permission)) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}
