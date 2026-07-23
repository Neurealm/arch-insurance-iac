import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/platform/access/AccessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Member = {
  membership_id: string; user_id: string; email: string | null; display_name: string | null;
  status: string; roles: Array<{ code: string; name: string }>;
  joined_at: string | null; last_active_at: string | null; total_count: number;
};
type Invitation = {
  invitation_id: string; email: string; status: string; expires_at: string;
  invited_by: string | null; created_at: string; roles: Array<{ code: string; name: string }>;
  total_count: number;
};

export default function MemberAdmin() {
  const { activeTenantId } = useAccess();
  const [search, setSearch] = useState("");

  const members = useQuery({
    queryKey: ["platform", "members", activeTenantId, search],
    enabled: !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_tenant_members", {
        p_tenant_id: activeTenantId!,
        p_search: search || null,
      });
      if (error) throw error;
      return (data ?? []) as Member[];
    },
  });

  const invitations = useQuery({
    queryKey: ["platform", "invitations", activeTenantId],
    enabled: !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_tenant_invitations", {
        p_tenant_id: activeTenantId!,
      });
      if (error) throw error;
      return (data ?? []) as Invitation[];
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium">Members</CardTitle>
          <Input
            aria-label="Search members"
            placeholder="Search by email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {members.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : members.error ? (
            <div className="text-sm text-destructive">{(members.error as Error).message}</div>
          ) : !members.data?.length ? (
            <div className="text-sm text-muted-foreground">No members match.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2 pr-4">Member</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Roles</th><th className="py-2 pr-4">Joined</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.data.map((m) => (
                    <tr key={m.membership_id}>
                      <td className="py-2 pr-4">
                        <div className="font-medium text-foreground">{m.display_name || m.email || m.user_id}</div>
                        {m.display_name && m.email && <div className="text-xs text-muted-foreground">{m.email}</div>}
                      </td>
                      <td className="py-2 pr-4"><Badge variant={m.status === "active" ? "default" : "secondary"}>{m.status}</Badge></td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {m.roles.length ? m.roles.map((r) => <Badge key={r.code} variant="outline">{r.name}</Badge>) : <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {m.joined_at ? format(new Date(m.joined_at), "MMM d, yyyy") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Pending invitations</CardTitle></CardHeader>
        <CardContent>
          {invitations.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : !invitations.data?.length ? (
            <div className="text-sm text-muted-foreground">No pending invitations.</div>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {invitations.data.map((inv) => (
                <li key={inv.invitation_id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div>
                    <div className="font-medium text-foreground">{inv.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Expires {format(new Date(inv.expires_at), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.roles.map((r) => <Badge key={r.code} variant="outline">{r.name}</Badge>)}
                    <Badge variant="secondary">{inv.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
