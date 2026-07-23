import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/platform/access/AccessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Archive } from "lucide-react";
import { LoadingState, ErrorState, EmptyState, sanitizeError } from "@/platform/components/States";
import { ConfirmDialog } from "@/platform/components/ConfirmDialog";

type Role = {
  role_id: string; code: string; name: string; description: string | null; status: string;
  is_system_protected: boolean; member_count: number; permission_codes: string[];
};
type Permission = { code: string; category: string; description: string | null };

export default function RoleAdmin() {
  const { activeTenantId, hasPermission } = useAccess();
  const qc = useQueryClient();
  const canManage = hasPermission("roles.manage");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const roles = useQuery({
    queryKey: ["platform", "roles", activeTenantId, "all"],
    enabled: !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_tenant_roles", {
        p_tenant_id: activeTenantId!, p_include_archived: true,
      });
      if (error) throw error;
      return (data ?? []) as Role[];
    },
  });

  const perms = useQuery({
    queryKey: ["platform", "permissions-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("permissions").select("code, category, description").order("code");
      if (error) throw error;
      return (data ?? []) as Permission[];
    },
  });

  const selected = roles.data?.find((r) => r.role_id === selectedId) ?? null;
  const invalidate = () => qc.invalidateQueries({ queryKey: ["platform"] });

  if (roles.isLoading || perms.isLoading) return <LoadingState />;
  if (roles.error) return <ErrorState error={roles.error} onRetry={() => roles.refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {roles.data?.length ?? 0} role{(roles.data?.length ?? 0) === 1 ? "" : "s"}
        </div>
        {canManage && <CreateRoleDialog tenantId={activeTenantId!} onDone={invalidate} />}
      </div>

      {!roles.data?.length ? <EmptyState title="No roles yet" /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {roles.data.map((r) => (
            <button key={r.role_id} type="button" onClick={() => setSelectedId(r.role_id)}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              aria-label={`Open ${r.name} role`}>
              <Card className={selectedId === r.role_id ? "ring-2 ring-primary" : ""}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">{r.name}</CardTitle>
                    <div className="font-mono text-xs text-muted-foreground">{r.code}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {r.is_system_protected && <Badge variant="secondary">System</Badge>}
                    <Badge variant={r.status === "active" ? "default" : "outline"}>{r.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                  <div className="text-xs text-muted-foreground">
                    {r.member_count} member{r.member_count === 1 ? "" : "s"} · {r.permission_codes.length} permission{r.permission_codes.length === 1 ? "" : "s"}
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <RoleEditor role={selected} permissions={perms.data ?? []}
              canManage={canManage && !selected.is_system_protected}
              onDone={invalidate} onClose={() => setSelectedId(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function RoleEditor({ role, permissions, canManage, onDone, onClose }: {
  role: Role; permissions: Permission[]; canManage: boolean; onDone: () => void; onClose: () => void;
}) {
  const current = new Set(role.permission_codes);
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description ?? "");
  const [selected, setSelected] = useState<Set<string>>(current);
  const [savingMeta, setSavingMeta] = useState(false);

  const toggle = (code: string) => setSelected((s) => {
    const next = new Set(s); next.has(code) ? next.delete(code) : next.add(code); return next;
  });

  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p); return acc;
  }, {});

  const saveMeta = async () => {
    setSavingMeta(true);
    try {
      const { error } = await supabase.rpc("update_tenant_role", {
        _role_id: role.role_id, _name: name, _description: description || null,
      });
      if (error) throw error;
      toast.success("Role updated"); onDone();
    } catch (e) { toast.error(sanitizeError((e as Error).message)); }
    finally { setSavingMeta(false); }
  };

  const savePerms = async () => {
    const toAdd = [...selected].filter((c) => !current.has(c));
    const toRemove = [...current].filter((c) => !selected.has(c));
    try {
      for (const code of toAdd) {
        const { error } = await supabase.rpc("assign_role_permission", {
          _role_id: role.role_id, _permission_code: code,
        });
        if (error) throw error;
      }
      for (const code of toRemove) {
        const { error } = await supabase.rpc("remove_role_permission", {
          _role_id: role.role_id, _permission_code: code,
        });
        if (error) throw error;
      }
      toast.success("Permissions updated"); onDone();
    } catch (e) {
      const msg = sanitizeError((e as Error).message);
      if (msg.toLowerCase().includes("last") && msg.toLowerCase().includes("admin"))
        toast.error("This would remove the last administrator permission set.");
      else toast.error(msg);
    }
  };

  const archive = async () => {
    const { error } = await supabase.rpc("archive_tenant_role", { _role_id: role.role_id });
    if (error) {
      const msg = sanitizeError(error.message);
      if (role.member_count > 0) toast.error(`This role is assigned to ${role.member_count} member(s). Reassign them first.`);
      else toast.error(msg);
      return;
    }
    toast.success("Role archived"); onDone(); onClose();
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>{role.name}</SheetTitle>
        <SheetDescription>
          <span className="font-mono text-xs">{role.code}</span> · {role.member_count} member{role.member_count === 1 ? "" : "s"}
        </SheetDescription>
      </SheetHeader>

      {role.is_system_protected && (
        <p className="mt-3 rounded-md border border-border bg-muted p-2 text-xs text-muted-foreground">
          This is a system-protected role. Name, description, and permissions are managed by the platform.
        </p>
      )}
      {role.status === "archived" && (
        <p className="mt-3 rounded-md border border-border bg-muted p-2 text-xs text-muted-foreground">
          This role is archived and read-only.
        </p>
      )}

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="role-name">Name</Label>
            <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} disabled={!canManage} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea id="role-desc" rows={3} value={description}
              onChange={(e) => setDescription(e.target.value)} disabled={!canManage} />
          </div>
          {canManage && (
            <Button size="sm" onClick={saveMeta} disabled={savingMeta || name.trim().length < 2}>
              {savingMeta ? "Saving…" : "Save details"}
            </Button>
          )}
        </div>

        <div>
          <div className="mb-2 text-sm font-medium">Permissions</div>
          <div className="space-y-3">
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat} className="rounded-md border border-border p-2">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</div>
                <div className="space-y-1">
                  {list.map((p) => (
                    <label key={p.code} className="flex items-start gap-2 rounded p-1 hover:bg-muted/40">
                      <Checkbox checked={selected.has(p.code)}
                        onCheckedChange={() => toggle(p.code)} disabled={!canManage}
                        id={`perm-${p.code}`} />
                      <div className="min-w-0">
                        <div className="font-mono text-xs">{p.code}</div>
                        {p.description && <div className="text-xs text-muted-foreground">{p.description}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {canManage && (
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={savePerms}>Save permissions</Button>
            </div>
          )}
        </div>
      </div>

      <SheetFooter className="mt-6 flex-row items-center justify-between">
        <div>
          {canManage && role.status === "active" && (
            <ConfirmDialog
              trigger={<Button size="sm" variant="ghost" className="text-destructive">
                <Archive className="mr-1 h-4 w-4" aria-hidden="true" />Archive role
              </Button>}
              title="Archive this role?"
              description={role.member_count > 0
                ? `This role has ${role.member_count} member(s). You must reassign them before archiving.`
                : "Archived roles can no longer be assigned to members."}
              confirmLabel="Archive"
              destructive
              onConfirm={archive}
            />
          )}
        </div>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </SheetFooter>
    </>
  );
}

const createSchema = z.object({
  code: z.string().trim().regex(/^[a-z0-9_.-]{2,64}$/i, "2–64 chars, letters/numbers/._-"),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
});

function CreateRoleDialog({ tenantId, onDone }: { tenantId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ code: "", name: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useMutation({
    mutationFn: async () => {
      const parsed = createSchema.safeParse(values);
      if (!parsed.success) {
        const e: Record<string, string> = {};
        parsed.error.issues.forEach((i) => { e[i.path[0] as string] = i.message; });
        setErrors(e);
        throw new Error("validation");
      }
      setErrors({});
      const { error } = await supabase.rpc("create_tenant_role", {
        _tenant_id: tenantId, _code: parsed.data.code, _name: parsed.data.name,
        _description: parsed.data.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Role created"); onDone(); setOpen(false); setValues({ code: "", name: "", description: "" }); },
    onError: (e) => { if ((e as Error).message !== "validation") toast.error(sanitizeError((e as Error).message)); },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" aria-hidden="true" />New role</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>Add a new role scoped to this workspace.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="nr-code">Code</Label>
            <Input id="nr-code" value={values.code} onChange={(e) => setValues((s) => ({ ...s, code: e.target.value }))}
              aria-invalid={!!errors.code} />
            {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="nr-name">Name</Label>
            <Input id="nr-name" value={values.name} onChange={(e) => setValues((s) => ({ ...s, name: e.target.value }))} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="nr-desc">Description</Label>
            <Textarea id="nr-desc" rows={3} value={values.description}
              onChange={(e) => setValues((s) => ({ ...s, description: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={create.isPending}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
