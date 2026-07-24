import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAccess } from "@/platform/access/AccessContext";
import { ForbiddenState, LoadingState } from "@/platform/components/States";

/**
 * Route guard requiring both authentication and a specific permission code
 * scoped to the currently active tenant. Platform admins bypass permission
 * checks automatically (handled inside AccessContext).
 */
export function PermissionRoute({
  permission,
  children,
}: {
  permission: string;
  children: JSX.Element;
}) {
  return (
    <ProtectedRoute>
      <PermissionGate permission={permission}>{children}</PermissionGate>
    </ProtectedRoute>
  );
}

function PermissionGate({ permission, children }: { permission: string; children: JSX.Element }) {
  const { loading, activeTenantId, hasPermission, isPlatformAdmin } = useAccess();
  if (loading) return <LoadingState label="Checking access…" />;
  if (isPlatformAdmin) return children;
  if (!activeTenantId) return <ForbiddenState permission={permission} />;
  if (!hasPermission(permission)) return <ForbiddenState permission={permission} />;
  return children;
}
