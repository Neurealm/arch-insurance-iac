import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

type Tenant = { id: string; name: string; slug: string };
type Membership = { id: string; tenant_id: string; role: TenantRole; tenant?: Tenant };
type AppRole = "platform_admin" | "platform_support";
type TenantRole = "tenant_admin" | "tenant_manager" | "tenant_member";

const TENANT_ROLES: TenantRole[] = ["tenant_admin", "tenant_manager", "tenant_member"];

export function AccessEditor({ userId, onChanged }: { userId: string; onChanged?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [platformRole, setPlatformRole] = useState<AppRole | "none">("none");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [newTenantId, setNewTenantId] = useState<string>("");
  const [newRole, setNewRole] = useState<TenantRole>("tenant_member");

  const load = async () => {
    setLoading(true);
    const [{ data: roles }, { data: mems }, { data: ts }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("tenant_memberships")
        .select("id, tenant_id, role, tenant:tenants(id, name, slug)")
        .eq("user_id", userId),
      supabase.from("tenants").select("id, name, slug").eq("status", true).order("name"),
    ]);
    const r = (roles ?? []).find((x: any) => x.role === "platform_admin")
      ? "platform_admin"
      : (roles ?? []).find((x: any) => x.role === "platform_support")
      ? "platform_support"
      : "none";
    setPlatformRole(r as AppRole | "none");
    setMemberships((mems ?? []) as unknown as Membership[]);
    setTenants((ts ?? []) as Tenant[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const savePlatformRole = async (next: AppRole | "none") => {
    setSaving("platform");
    const { data, error } = await supabase.functions.invoke("admin-set-platform-role", {
      body: { userId, role: next === "none" ? null : next },
    });
    setSaving(null);
    if (error || (data as any)?.error) {
      toast.error(error?.message || (data as any)?.error || "Failed to update role");
      return;
    }
    setPlatformRole(next);
    toast.success("Platform role updated");
    onChanged?.();
  };

  const removeMembership = async (m: Membership) => {
    setSaving(m.id);
    const { data, error } = await supabase.functions.invoke("admin-set-tenant-membership", {
      body: { userId, tenantId: m.tenant_id, role: null },
    });
    setSaving(null);
    if (error || (data as any)?.error) {
      toast.error(error?.message || (data as any)?.error || "Failed to remove access");
      return;
    }
    toast.success("Workspace access removed");
    await load();
    onChanged?.();
  };

  const addMembership = async () => {
    if (!newTenantId) return toast.error("Pick a workspace");
    setSaving("new");
    const { data, error } = await supabase.functions.invoke("admin-set-tenant-membership", {
      body: { userId, tenantId: newTenantId, role: newRole },
    });
    setSaving(null);
    if (error || (data as any)?.error) {
      toast.error(error?.message || (data as any)?.error || "Failed to add workspace");
      return;
    }
    toast.success("Workspace access granted");
    setNewTenantId("");
    setNewRole("tenant_member");
    await load();
    onChanged?.();
  };

  const availableTenants = tenants.filter(
    (t) => !memberships.some((m) => m.tenant_id === t.id),
  );

  if (loading) {
    return <div className="text-xs text-muted-foreground">Loading access…</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-1.5">Platform role</div>
        <div className="flex items-center gap-2">
          <Select
            value={platformRole}
            onValueChange={(v) => savePlatformRole(v as AppRole | "none")}
            disabled={saving === "platform"}
          >
            <SelectTrigger className="w-56 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No platform access</SelectItem>
              <SelectItem value="platform_support">Platform support (read-only)</SelectItem>
              <SelectItem value="platform_admin">Platform admin (full)</SelectItem>
            </SelectContent>
          </Select>
          {saving === "platform" && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Controls access to the NeuRealm workspace and platform-wide settings.
        </p>
      </div>

      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-1.5">Workspace access</div>
        {memberships.length === 0 ? (
          <div className="text-xs text-muted-foreground rounded-md border border-dashed px-3 py-3">
            No tenant workspaces assigned.
          </div>
        ) : (
          <div className="space-y-1.5">
            {memberships.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{m.tenant?.name ?? m.tenant_id}</div>
                  <Badge variant="secondary" className="mt-0.5 text-[10px] capitalize">
                    {m.role.replace("tenant_", "")}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMembership(m)}
                  disabled={saving === m.id}
                  className="h-8 px-2"
                >
                  {saving === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                </Button>
              </div>
            ))}
          </div>
        )}

        {availableTenants.length > 0 && (
          <div className="flex items-end gap-2 mt-2">
            <div className="flex-1">
              <Select value={newTenantId} onValueChange={setNewTenantId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Add workspace…" />
                </SelectTrigger>
                <SelectContent>
                  {availableTenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as TenantRole)}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TENANT_ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">
                    {r.replace("tenant_", "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={addMembership} disabled={!newTenantId || saving === "new"} className="h-9 gap-1">
              {saving === "new" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
