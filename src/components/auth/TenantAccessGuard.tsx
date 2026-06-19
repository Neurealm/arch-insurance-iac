import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTenantScope } from "@/hooks/useTenantScope";

// Routes a tenant user can always reach regardless of assignments.
const ALWAYS_ALLOWED_EXACT = new Set<string>([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/pending-approval",
  "/profile",
  "/app",
]);

const ALWAYS_ALLOWED_PREFIXES = ["/t/", "/q/"];

function isAlwaysAllowed(pathname: string) {
  if (ALWAYS_ALLOWED_EXACT.has(pathname)) return true;
  return ALWAYS_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Global guard: tenant users can only visit routes whose tool/dashboard has
 * been assigned to their tenant. Platform admins are unrestricted.
 */
export function TenantAccessGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, roleLoading } = useAuth();
  const { scoped, loading: scopeLoading, routes } = useTenantScope();
  const { pathname } = useLocation();

  if (loading || roleLoading) return <>{children}</>;
  if (!user || isAdmin) return <>{children}</>;
  if (isAlwaysAllowed(pathname)) return <>{children}</>;
  if (scopeLoading || !scoped) return <>{children}</>;

  const allowed = Array.from(routes).some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
  if (!allowed) return <Navigate to="/app" replace />;
  return <>{children}</>;
}