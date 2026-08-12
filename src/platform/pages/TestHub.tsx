import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAccess } from "@/platform/access/AccessContext";
import { useAuth } from "@/context/AuthContext";
import { CommercialBootstrapButton } from "@/platform/components/CommercialBootstrapButton";
import { toast } from "@/hooks/use-toast";
import {
  Copy,
  ExternalLink,
  Info,
  Home,
  Users,
  ShieldCheck,
  ClipboardList,
  Settings as SettingsIcon,
  UserCircle2,
  RefreshCw,
} from "lucide-react";
import type { ComponentType } from "react";

type PageDescriptor = {
  name: string;
  description: string;
  route: string;
  icon: ComponentType<{ className?: string }>;
  permission?: string;
  requiresTenant: boolean;
  requiresAuth: boolean;
  notes?: string;
};

const PAGES: PageDescriptor[] = [
  { name: "Platform Home", description: "Tenant summary dashboard with membership and activity overview.", route: "/platform", icon: Home, permission: "tenant.view", requiresTenant: true, requiresAuth: true },
  { name: "Members", description: "Invite, suspend, reactivate, deactivate members and manage invitations.", route: "/platform/members", icon: Users, permission: "members.view", requiresTenant: true, requiresAuth: true },
  { name: "Roles", description: "Manage tenant roles and permission assignments.", route: "/platform/roles", icon: ShieldCheck, permission: "roles.view", requiresTenant: true, requiresAuth: true },
  { name: "Audit", description: "Filter, inspect, and view audit event history with redacted payloads.", route: "/platform/audit", icon: ClipboardList, permission: "audit.view", requiresTenant: true, requiresAuth: true },
  { name: "Settings", description: "View and edit tenant metadata (name, currency, timezone, status).", route: "/platform/settings", icon: SettingsIcon, permission: "tenant.view", requiresTenant: true, requiresAuth: true },
  { name: "Profile", description: "Signed-in user profile: display name, email, password change.", route: "/platform/profile", icon: UserCircle2, requiresTenant: false, requiresAuth: true },
  { name: "Commercial Overview", description: "NeuGAIN Commercial workspace: Project Momentous, gates, scenarios, and source register.", route: "/commercial", icon: Home, permission: "commercial.view", requiresTenant: true, requiresAuth: true, notes: "Requires membership in NeuGAIN Commercial tenant." },
];

const APP_VERSION = "BP1.1";
const BUILD_TIMESTAMP = new Date().toISOString();

export default function TestHub() {
  const { user } = useAuth();
  const { isPlatformAdmin, hasPermission, activeTenantId, activeTenant, permissions, refresh, refreshAll } = useAccess();
  const [details, setDetails] = useState<PageDescriptor | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { pathname } = useLocation();

  const rows = useMemo(() => {
    return PAGES.map((p) => {
      let status: "Available" | "Forbidden" | "Requires Tenant" = "Available";
      if (p.requiresTenant && !activeTenantId) status = "Requires Tenant";
      else if (p.permission && !hasPermission(p.permission)) status = "Forbidden";
      return { ...p, status };
    });
  }, [activeTenantId, hasPermission]);

  const copyRoute = async (route: string) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + route);
      toast({ title: "Route copied", description: route });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      await refreshAll();
      toast({ title: "Access refreshed" });
    } finally {
      setRefreshing(false);
    }
  };

  const permsList = Array.from(permissions).sort();
  const roleLabel = isPlatformAdmin
    ? "Platform Admin"
    : activeTenant?.membership_status === "active"
    ? "Member"
    : activeTenant?.membership_status ?? "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">BP1.1 Platform Test Hub</h2>
            <p className="text-sm text-muted-foreground">
              Central entry point to validate every BP1.1 platform screen before Commercial development begins.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {isPlatformAdmin && <Badge variant="secondary">Platform Admin</Badge>}
            {activeTenant ? (
              <Badge variant="outline">Tenant: {activeTenant.name}</Badge>
            ) : (
              <Badge variant="destructive">No active tenant</Badge>
            )}
            <CommercialBootstrapButton size="sm" variant="outline" />
          </div>
        </div>
      </div>

      {/* Section 1 — Platform Pages */}
      <section aria-labelledby="section-pages" className="space-y-3">
        <div>
          <h3 id="section-pages" className="text-sm font-semibold text-foreground">Section 1 · Platform Pages</h3>
          <p className="text-xs text-muted-foreground">Open every BP1.1 platform screen. Access reflects your current tenant and permission set.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.route} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {p.name}
                    </CardTitle>
                    <StatusBadge status={p.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  <div className="text-xs font-mono text-muted-foreground break-all">{p.route}</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {p.permission && <Badge variant="outline">perm: {p.permission}</Badge>}
                    {p.requiresTenant && <Badge variant="outline">tenant</Badge>}
                    {p.requiresAuth && <Badge variant="outline">auth</Badge>}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    {p.status === "Available" ? (
                      <Button asChild size="sm">
                        <Link to={p.route}>
                          <ExternalLink className="h-4 w-4 mr-1" /> Open Page
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" disabled title={p.status}>
                        <ExternalLink className="h-4 w-4 mr-1" /> Open Page
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => copyRoute(p.route)}>
                      <Copy className="h-4 w-4 mr-1" /> Copy Route
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDetails(p)}>
                      <Info className="h-4 w-4 mr-1" /> Requirements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Section 2 — Utilities */}
      <section aria-labelledby="section-utilities" className="space-y-3">
        <div>
          <h3 id="section-utilities" className="text-sm font-semibold text-foreground">Section 2 · Utilities</h3>
          <p className="text-xs text-muted-foreground">Runtime access snapshot for the signed-in session.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Current User</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <KV k="Email" v={user?.email ?? "—"} />
              <KV k="User ID" v={user?.id ?? "—"} mono />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Current Tenant</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <KV k="Name" v={activeTenant?.name ?? "—"} />
              <KV k="Slug" v={activeTenant?.slug ?? "—"} mono />
              <KV k="Tenant ID" v={activeTenant?.tenant_id ?? "—"} mono />
              <KV k="Status" v={activeTenant?.status ?? "—"} />
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Current Permissions</CardTitle>
                <Badge variant="outline">{permsList.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isPlatformAdmin && (
                <p className="text-xs text-muted-foreground mb-2">Platform Admin has implicit access to all permissions.</p>
              )}
              {permsList.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {permsList.map((p) => (
                    <Badge key={p} variant="secondary" className="font-mono text-[11px]">{p}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No explicit permissions in this tenant.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Current Role</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <Badge variant={isPlatformAdmin ? "secondary" : "outline"}>{roleLabel}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Refresh Access</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground text-xs">Re-fetch tenants, context, and every tenant-scoped query.</p>
              <Button size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                Refresh Access
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 3 — Developer Notes */}
      <section aria-labelledby="section-notes" className="space-y-3">
        <div>
          <h3 id="section-notes" className="text-sm font-semibold text-foreground">Section 3 · Developer Notes</h3>
        </div>
        <Card>
          <CardContent className="pt-6 text-sm">
            <dl className="grid gap-y-2 sm:grid-cols-[200px_1fr]">
              <KVRow k="Application Version" v={APP_VERSION} />
              <KVRow k="Build Timestamp" v={BUILD_TIMESTAMP} mono />
              <KVRow k="Current Route" v={pathname} mono />
              <KVRow k="Current Tenant" v={activeTenant ? `${activeTenant.name} (${activeTenant.tenant_id})` : "—"} />
              <KVRow k="Current User" v={user?.email ?? "—"} />
              <KVRow k="Platform Admin" v={isPlatformAdmin ? "YES" : "NO"} />
            </dl>
          </CardContent>
        </Card>
      </section>

      <Dialog open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{details?.name} — Requirements</DialogTitle>
          </DialogHeader>
          {details && (
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Route</dt>
              <dd className="col-span-2 font-mono break-all">{details.route}</dd>
              <dt className="text-muted-foreground">Permission</dt>
              <dd className="col-span-2">{details.permission ?? "—"}</dd>
              <dt className="text-muted-foreground">Requires Tenant</dt>
              <dd className="col-span-2">{details.requiresTenant ? "Yes" : "No"}</dd>
              <dt className="text-muted-foreground">Requires Auth</dt>
              <dd className="col-span-2">{details.requiresAuth ? "Yes" : "No"}</dd>
              {details.notes && (
                <>
                  <dt className="text-muted-foreground">Notes</dt>
                  <dd className="col-span-2">{details.notes}</dd>
                </>
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-muted-foreground text-xs w-20 shrink-0">{k}</span>
      <span className={`text-foreground break-all ${mono ? "font-mono text-xs" : ""}`}>{v}</span>
    </div>
  );
}

function KVRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={`text-foreground break-all ${mono ? "font-mono text-xs" : ""}`}>{v}</dd>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "Available" ? "default" : status === "Forbidden" ? "destructive" : "secondary";
  return <Badge variant={variant as any}>{status}</Badge>;
}
