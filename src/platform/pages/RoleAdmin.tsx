import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/platform/access/AccessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Role = {
  role_id: string; code: string; name: string; description: string | null; status: string;
  is_system_protected: boolean; member_count: number; permission_codes: string[];
};

export default function RoleAdmin() {
  const { activeTenantId } = useAccess();
  const roles = useQuery({
    queryKey: ["platform", "roles", activeTenantId],
    enabled: !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_tenant_roles", {
        p_tenant_id: activeTenantId!, p_include_archived: true,
      });
      if (error) throw error;
      return (data ?? []) as Role[];
    },
  });

  if (roles.isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (roles.error) return <div className="text-sm text-destructive">{(roles.error as Error).message}</div>;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {roles.data?.map((r) => (
        <Card key={r.role_id}>
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">{r.name}</CardTitle>
              <div className="text-xs text-muted-foreground">{r.code}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {r.is_system_protected && <Badge variant="secondary">System</Badge>}
              <Badge variant={r.status === "active" ? "default" : "outline"}>{r.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
            <div className="text-xs text-muted-foreground">
              {r.member_count} member{r.member_count === 1 ? "" : "s"}
            </div>
            <div className="flex flex-wrap gap-1">
              {r.permission_codes.length ? r.permission_codes.map((p) => (
                <Badge key={p} variant="outline" className="font-mono text-[10px]">{p}</Badge>
              )) : <span className="text-xs text-muted-foreground">No permissions</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
