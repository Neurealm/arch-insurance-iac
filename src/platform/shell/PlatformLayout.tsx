import { NavLink, Outlet } from "react-router-dom";
import { AccessProvider, useAccess } from "@/platform/access/AccessContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreateTenantDialog } from "@/platform/components/CreateTenantDialog";

const TABS: { to: string; label: string; permission?: string; adminOnly?: boolean }[] = [
  { to: "/platform", label: "Home", permission: "tenant.view" },
  { to: "/platform/members", label: "Members", permission: "members.view" },
  { to: "/platform/roles", label: "Roles", permission: "roles.view" },
  { to: "/platform/audit", label: "Audit", permission: "audit.view" },
  { to: "/platform/settings", label: "Settings", permission: "tenant.view" },
  { to: "/platform/profile", label: "Profile" },
  { to: "/platform/test-hub", label: "Developer · Test Hub", adminOnly: true },
];

function Header() {
  const { tenants, activeTenantId, switchTenant, activeTenant, isPlatformAdmin, hasPermission } = useAccess();
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Platform Administration</div>
            <h1 className="text-xl font-semibold text-foreground">{activeTenant?.name ?? "Select a workspace"}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isPlatformAdmin && <Badge variant="secondary">Platform Admin</Badge>}
            <div className="min-w-[240px]">
              <Select value={activeTenantId ?? undefined} onValueChange={(v) => switchTenant(v)}>
                <SelectTrigger aria-label="Active workspace"><SelectValue placeholder="Select workspace" /></SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.tenant_id} value={t.tenant_id}>
                      {t.name}
                      {t.membership_status && t.membership_status !== "active" && !t.platform_admin && (
                        <span className="ml-2 text-xs text-muted-foreground">({t.membership_status})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isPlatformAdmin && <CreateTenantDialog />}
          </div>
        </div>
        <nav className="flex flex-wrap gap-1" aria-label="Platform sections">
          {TABS.filter((t) => !t.permission || hasPermission(t.permission)).map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === "/platform"}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
              
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Shell() {
  const { loading, tenants, activeTenantId, isPlatformAdmin } = useAccess();
  if (loading && !activeTenantId) {
    return <div className="min-h-dvh grid place-items-center text-muted-foreground">Loading workspace…</div>;
  }
  if (!tenants.length) {
    return (
      <main className="min-h-dvh grid place-items-center px-6 text-center">
        <div className="max-w-md space-y-3">
          <h2 className="text-lg font-semibold text-foreground">No workspaces available</h2>
          <p className="text-sm text-muted-foreground">
            You are signed in but have not been added to a tenant workspace. Ask an administrator to invite you.
          </p>
          {isPlatformAdmin && <div className="pt-2"><CreateTenantDialog /></div>}
        </div>
      </main>
    );
  }
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function PlatformLayout() {
  return (
    <ProtectedRoute>
      <AccessProvider>
        <Shell />
      </AccessProvider>
    </ProtectedRoute>
  );
}
