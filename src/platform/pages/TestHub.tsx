import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAccess } from "@/platform/access/AccessContext";
import { toast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Info } from "lucide-react";

type PageDescriptor = {
  name: string;
  description: string;
  route: string;
  permission?: string;
  requiresTenant: boolean;
  requiresAuth: boolean;
  notes?: string;
};

const PAGES: PageDescriptor[] = [
  {
    name: "Platform Home",
    description: "Tenant summary dashboard with membership and activity overview.",
    route: "/platform",
    permission: "tenant.view",
    requiresTenant: true,
    requiresAuth: true,
  },
  {
    name: "Member Administration",
    description: "Invite, suspend, reactivate, deactivate members and manage invitations.",
    route: "/platform/members",
    permission: "members.view",
    requiresTenant: true,
    requiresAuth: true,
  },
  {
    name: "Role Administration",
    description: "Manage tenant roles and permission assignments.",
    route: "/platform/roles",
    permission: "roles.view",
    requiresTenant: true,
    requiresAuth: true,
  },
  {
    name: "Audit Explorer",
    description: "Filter, inspect, and view audit event history with redacted payloads.",
    route: "/platform/audit",
    permission: "audit.view",
    requiresTenant: true,
    requiresAuth: true,
  },
  {
    name: "Tenant Settings",
    description: "View and edit tenant metadata (name, currency, timezone, status).",
    route: "/platform/settings",
    permission: "tenant.view",
    requiresTenant: true,
    requiresAuth: true,
  },
  {
    name: "Profile",
    description: "Signed-in user profile: display name, email, password change.",
    route: "/platform/profile",
    requiresTenant: false,
    requiresAuth: true,
  },
  {
    name: "Accept Invitation",
    description: "Token-scoped invitation acceptance flow. Requires a valid invitation token in the URL.",
    route: "/invitations/:token",
    requiresTenant: false,
    requiresAuth: false,
    notes: "Cannot be opened without a real token — surfaced here for awareness.",
  },
];

export default function TestHub() {
  const { isPlatformAdmin, hasPermission, activeTenantId, activeTenant } = useAccess();
  const [details, setDetails] = useState<PageDescriptor | null>(null);

  const rows = useMemo(() => {
    return PAGES.map((p) => {
      let status: "Available" | "Forbidden" | "Requires Tenant" | "Requires Invitation" = "Available";
      if (p.route.includes(":token")) status = "Requires Invitation";
      else if (p.requiresTenant && !activeTenantId) status = "Requires Tenant";
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

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">BP1.1 Platform Test Hub</h2>
            <p className="text-sm text-muted-foreground">
              Discover and open every BP1.1 platform screen. Access reflects your current tenant and
              permission set.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {isPlatformAdmin && <Badge variant="secondary">Platform Admin</Badge>}
            {activeTenant ? (
              <Badge variant="outline">Tenant: {activeTenant.name}</Badge>
            ) : (
              <Badge variant="destructive">No active tenant</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => (
          <Card key={p.route} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
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
        ))}
      </div>

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

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "Available"
      ? "default"
      : status === "Forbidden"
      ? "destructive"
      : "secondary";
  return <Badge variant={variant as any}>{status}</Badge>;
}
