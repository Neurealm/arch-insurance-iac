import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/platform/access/AccessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type Summary = {
  active_members: number | null;
  pending_invitations: number | null;
  active_roles: number | null;
  recent_audit_events: Array<{
    id: string; action_code: string; object_type: string; object_id: string;
    occurred_at: string; actor_user_id: string | null;
  }>;
  permissions: { members_view: boolean; roles_view: boolean; audit_view: boolean };
};

export default function PlatformHome() {
  const { activeTenantId, activeTenant } = useAccess();

  const { data, isLoading, error } = useQuery({
    queryKey: ["platform", "home-summary", activeTenantId],
    enabled: !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_platform_home_summary", {
        p_tenant_id: activeTenantId!,
      });
      if (error) throw error;
      return data as Summary;
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="text-sm text-destructive">Failed to load: {(error as Error).message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Active members" value={data.active_members} hidden={!data.permissions.members_view} />
        <MetricCard label="Pending invitations" value={data.pending_invitations} hidden={!data.permissions.members_view} />
        <MetricCard label="Active roles" value={data.active_roles} hidden={!data.permissions.roles_view} />
      </div>

      {data.permissions.audit_view && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent audit events</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.recent_audit_events.length ? (
              <p className="text-sm text-muted-foreground">No audit events recorded yet for {activeTenant?.name}.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {data.recent_audit_events.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-4 py-2">
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{ev.action_code}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {ev.object_type} · {ev.object_id}
                      </div>
                    </div>
                    <time className="text-xs text-muted-foreground" dateTime={ev.occurred_at}>
                      {format(new Date(ev.occurred_at), "MMM d, HH:mm")}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ label, value, hidden }: { label: string; value: number | null; hidden?: boolean }) {
  if (hidden) return null;
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-2xl font-semibold text-foreground">{value ?? "—"}</div></CardContent>
    </Card>
  );
}
