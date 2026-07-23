import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/platform/access/AccessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { LoadingState, ErrorState, EmptyState, sanitizeError } from "@/platform/components/States";
import { ConfirmDialog } from "@/platform/components/ConfirmDialog";

type Member = {
  membership_id: string; user_id: string; email: string | null; display_name: string | null;
  status: string; roles: Array<{ role_id: string; code: string; name: string }>;
  joined_at: string | null; last_active_at: string | null; total_count: number;
};
type Invitation = {
  invitation_id: string; email: string; status: string; expires_at: string;
  invited_by: string | null; created_at: string; roles: Array<{ role_id: string; code: string; name: string }>;
  total_count: number;
};
type Role = { role_id: string; code: string; name: string; status: string };

const PAGE = 20;

export default function MemberAdmin() {
  const { activeTenantId, hasPermission } = useAccess();
  const qc = useQueryClient();
  const canInvite = hasPermission("members.invite");
  const canManage = hasPermission("members.manage");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [invPage, setInvPage] = useState(0);

  const members = useQuery({
    queryKey: ["platform", "members", activeTenantId, search, status, page],
    enabled: !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_tenant_members", {
        p_tenant_id: activeTenantId!,
        p_search: search || null,
        p_status: status === "all" ? null : status,
        p_limit: PAGE,
        p_offset: page * PAGE,
      });
      if (error) throw error;
      return (data ?? []) as Member[];
    },
  });

  const invitations = useQuery({
    queryKey: ["platform", "invitations", activeTenantId, invPage],
    enabled: !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_tenant_invitations", {
        p_tenant_id: activeTenantId!, p_status: null, p_limit: PAGE, p_offset: invPage * PAGE,
      });
      if (error) throw error;
      return (data ?? []) as Invitation[];
    },
  });


  const roles = useQuery({
    queryKey: ["platform", "roles", activeTenantId],
    enabled: !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_tenant_roles", {
        p_tenant_id: activeTenantId!, p_include_archived: false,
      });
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({
        role_id: r.role_id, code: r.code, name: r.name, status: r.status,
      })) as Role[];
    },
  });

  const invalidateAll = () => qc.invalidateQueries({ queryKey: ["platform"] });

  const totalMembers = members.data?.[0]?.total_count ?? 0;
  const maxPage = Math.max(0, Math.ceil(Number(totalMembers) / PAGE) - 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-sm font-medium">Members</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input aria-label="Search members" placeholder="Search email or name…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="w-64" />
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
              <SelectTrigger aria-label="Filter by status" className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
            {canInvite && <InviteMemberDialog tenantId={activeTenantId!} roles={roles.data ?? []} onDone={invalidateAll} />}
          </div>
        </CardHeader>
        <CardContent>
          {members.isLoading ? <LoadingState /> :
           members.error ? <ErrorState error={members.error} onRetry={() => members.refetch()} /> :
           !members.data?.length ? <EmptyState title="No members match" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Member</th><th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Roles</th><th className="py-2 pr-4">Joined</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.data.map((m) => (
                    <MemberRow key={m.membership_id} member={m} roles={roles.data ?? []}
                      canManage={canManage} onDone={invalidateAll} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div>{totalMembers} member{Number(totalMembers) === 1 ? "" : "s"}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
              <span>Page {page + 1} of {maxPage + 1}</span>
              <Button size="sm" variant="outline" disabled={page >= maxPage}
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Pending invitations</CardTitle></CardHeader>
        <CardContent>
          {invitations.isLoading ? <LoadingState /> :
           !invitations.data?.length ? <EmptyState title="No pending invitations" /> : (
            <ul className="divide-y divide-border text-sm">
              {invitations.data.map((inv) => (
                <InvitationRow key={inv.invitation_id} invitation={inv} canManage={canInvite} onDone={invalidateAll} />
              ))}
            </ul>
          )}
          {(() => {
            const invTotal = Number(invitations.data?.[0]?.total_count ?? 0);
            const invMax = Math.max(0, Math.ceil(invTotal / PAGE) - 1);
            return (
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <div>{invTotal} invitation{invTotal === 1 ? "" : "s"}</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled={invPage === 0}
                    onClick={() => setInvPage((p) => Math.max(0, p - 1))}>Prev</Button>
                  <span>Page {invPage + 1} of {invMax + 1}</span>
                  <Button size="sm" variant="outline" disabled={invPage >= invMax}
                    onClick={() => setInvPage((p) => Math.min(invMax, p + 1))}>Next</Button>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

    </div>
  );
}

function MemberRow({ member, roles, canManage, onDone }: {
  member: Member; roles: Role[]; canManage: boolean; onDone: () => void;
}) {
  const [rolesOpen, setRolesOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | "active" | "suspended" | "deactivated">(null);

  const setStatus = useMutation({
    mutationFn: async (newStatus: "active" | "suspended" | "deactivated") => {
      const { error } = await supabase.rpc("set_membership_status", {
        _membership_id: member.membership_id, _status: newStatus, _reason: null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Member updated"); onDone(); },
    onError: (e) => {
      const msg = sanitizeError((e as Error).message);
      if (msg.toLowerCase().includes("last") && msg.toLowerCase().includes("admin"))
        toast.error("This is the last administrator; assign another admin first.");
      else toast.error(msg);
    },
  });

  const memberLabel = member.display_name || member.email || member.user_id;
  const confirmCopy = {
    active: {
      title: "Reactivate member?",
      confirmLabel: "Reactivate",
      destructive: false,
      description: (
        <>Restore workspace access for <b>{memberLabel}</b>. Existing roles will resume immediately.</>
      ),
    },
    suspended: {
      title: "Suspend member?",
      confirmLabel: "Suspend",
      destructive: true,
      description: (
        <>Immediately revoke workspace access for <b>{memberLabel}</b>. This is reversible — you can reactivate them later.</>
      ),
    },
    deactivated: {
      title: "Deactivate member?",
      confirmLabel: "Deactivate",
      destructive: true,
      description: (
        <>Permanently deactivate <b>{memberLabel}</b>. This removes all role assignments and cannot be undone from this screen.</>
      ),
    },
  } as const;

  return (
    <tr>
      <td className="py-2 pr-4">
        <div className="font-medium text-foreground">{member.display_name || member.email || member.user_id}</div>
        {member.display_name && member.email && <div className="text-xs text-muted-foreground">{member.email}</div>}
      </td>
      <td className="py-2 pr-4">
        <Badge variant={member.status === "active" ? "default" : member.status === "suspended" ? "secondary" : "outline"}>
          {member.status}
        </Badge>
      </td>
      <td className="py-2 pr-4">
        <div className="flex flex-wrap gap-1">
          {member.roles.length
            ? member.roles.map((r) => <Badge key={r.role_id} variant="outline">{r.name}</Badge>)
            : <span className="text-xs text-muted-foreground">—</span>}
        </div>
      </td>
      <td className="py-2 pr-4 text-xs text-muted-foreground">
        {member.joined_at ? format(new Date(member.joined_at), "MMM d, yyyy") : "—"}
      </td>
      <td className="py-2 pr-4 text-right">
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label={`Actions for ${member.email ?? member.user_id}`}>
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setRolesOpen(true)}>Edit roles…</DropdownMenuItem>
              <DropdownMenuSeparator />
              {member.status !== "active" && (
                <DropdownMenuItem onSelect={() => setConfirm("active")}>Reactivate</DropdownMenuItem>
              )}
              {member.status === "active" && (
                <DropdownMenuItem onSelect={() => setConfirm("suspended")}>Suspend</DropdownMenuItem>
              )}
              {member.status !== "deactivated" && (
                <DropdownMenuItem className="text-destructive" onSelect={() => setConfirm("deactivated")}>
                  Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <EditRolesDialog open={rolesOpen} onOpenChange={setRolesOpen}
          member={member} roles={roles} onDone={onDone} />
        {confirm && (
          <ConfirmDialog
            open={!!confirm}
            onOpenChange={(o) => { if (!o) setConfirm(null); }}
            title={confirmCopy[confirm].title}
            description={confirmCopy[confirm].description}
            confirmLabel={confirmCopy[confirm].confirmLabel}
            destructive={confirmCopy[confirm].destructive}
            onConfirm={async () => { await setStatus.mutateAsync(confirm); setConfirm(null); }}
          />
        )}
      </td>
    </tr>
  );
}



function EditRolesDialog({ open, onOpenChange, member, roles, onDone }: {
  open: boolean; onOpenChange: (o: boolean) => void; member: Member; roles: Role[]; onDone: () => void;
}) {
  const current = new Set(member.roles.map((r) => r.role_id));
  const [selected, setSelected] = useState<Set<string>>(current);
  const [pending, setPending] = useState(false);

  const toggle = (id: string) => setSelected((s) => {
    const next = new Set(s); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const save = async () => {
    setPending(true);
    try {
      const toAdd = [...selected].filter((id) => !current.has(id));
      const toRemove = [...current].filter((id) => !selected.has(id));
      for (const id of toAdd) {
        const { error } = await supabase.rpc("assign_membership_role", {
          _membership_id: member.membership_id, _role_id: id,
        });
        if (error) throw error;
      }
      for (const id of toRemove) {
        const { error } = await supabase.rpc("remove_membership_role", {
          _membership_id: member.membership_id, _role_id: id,
        });
        if (error) throw error;
      }
      toast.success("Roles updated");
      onDone();
      onOpenChange(false);
    } catch (e) {
      const msg = sanitizeError((e as Error).message);
      if (msg.toLowerCase().includes("last") && msg.toLowerCase().includes("admin"))
        toast.error("This is the last administrator; assign another admin first.");
      else toast.error(msg);
    } finally { setPending(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit roles</DialogTitle>
          <DialogDescription>{member.email ?? member.user_id}</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {roles.map((r) => (
            <label key={r.role_id} className="flex items-start gap-2 rounded p-2 hover:bg-muted/40">
              <Checkbox checked={selected.has(r.role_id)} onCheckedChange={() => toggle(r.role_id)} id={`role-${r.role_id}`} />
              <div><div className="text-sm font-medium">{r.name}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{r.code}</div></div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancel</Button>
          <Button onClick={save} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  roleIds: z.array(z.string().uuid()).min(1, "Assign at least one role"),
  expiresInDays: z.number().int().min(1).max(30),
});

function InviteMemberDialog({ tenantId, roles, onDone }: {
  tenantId: string; roles: Role[]; onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [roleIds, setRoleIds] = useState<Set<string>>(new Set());
  const [days, setDays] = useState(7);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const invite = useMutation({
    mutationFn: async () => {
      const parsed = inviteSchema.safeParse({ email, roleIds: [...roleIds], expiresInDays: days });
      if (!parsed.success) {
        const e: Record<string, string> = {};
        parsed.error.issues.forEach((i) => { e[i.path[0] as string] = i.message; });
        setErrors(e);
        throw new Error("validation");
      }
      setErrors({});
      const codes = roles.filter((r) => roleIds.has(r.role_id)).map((r) => r.code);
      const { error } = await supabase.rpc("invite_member", {
        _tenant_id: tenantId, _email: parsed.data.email,
        _role_codes: codes, _expires_in_days: parsed.data.expiresInDays,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation sent");
      onDone(); setOpen(false); setEmail(""); setRoleIds(new Set()); setDays(7);
    },
    onError: (e) => { if ((e as Error).message !== "validation") toast.error(sanitizeError((e as Error).message)); },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="mr-1 h-4 w-4" aria-hidden="true" />Invite member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>Send an invitation email. They can accept once signed in.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="inv-email">Email</Label>
            <Input id="inv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? "inv-email-err" : undefined} />
            {errors.email && <p id="inv-email-err" className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <Label>Assign roles</Label>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded border border-border p-2">
              {roles.length === 0 && <p className="text-xs text-muted-foreground">No roles available.</p>}
              {roles.map((r) => (
                <label key={r.role_id} className="flex items-center gap-2 rounded p-1 hover:bg-muted/40">
                  <Checkbox checked={roleIds.has(r.role_id)}
                    onCheckedChange={() => setRoleIds((s) => {
                      const n = new Set(s); n.has(r.role_id) ? n.delete(r.role_id) : n.add(r.role_id); return n;
                    })} />
                  <span className="text-sm">{r.name}</span>
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">{r.code}</span>
                </label>
              ))}
            </div>
            {errors.roleIds && <p className="text-xs text-destructive">{errors.roleIds}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="inv-days">Expires in (days)</Label>
            <Input id="inv-days" type="number" min={1} max={30} value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(30, Number(e.target.value) || 7)))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={invite.isPending}>Cancel</Button>
          <Button onClick={() => invite.mutate()} disabled={invite.isPending}>
            {invite.isPending ? "Sending…" : "Send invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InvitationRow({ invitation, canManage, onDone }: {
  invitation: Invitation; canManage: boolean; onDone: () => void;
}) {
  const resend = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("resend_invitation", {
        _invitation_id: invitation.invitation_id, _expires_in_days: 7,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Invitation resent"); onDone(); },
    onError: (e) => toast.error(sanitizeError((e as Error).message)),
  });

  const cancel = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("cancel_invitation", { _invitation_id: invitation.invitation_id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Invitation cancelled"); onDone(); },
    onError: (e) => toast.error(sanitizeError((e as Error).message)),
  });

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2">
      <div>
        <div className="font-medium text-foreground">{invitation.email}</div>
        <div className="text-xs text-muted-foreground">
          Expires {format(new Date(invitation.expires_at), "MMM d, yyyy")}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {invitation.roles.map((r) => <Badge key={r.role_id} variant="outline">{r.name}</Badge>)}
        <Badge variant="secondary">{invitation.status}</Badge>
        {canManage && invitation.status === "pending" && (
          <>
            <Button size="sm" variant="outline" onClick={() => resend.mutate()} disabled={resend.isPending}>
              Resend
            </Button>
            <ConfirmDialog
              trigger={<Button size="sm" variant="ghost">Cancel</Button>}
              title="Cancel invitation?"
              description={`This will revoke the invitation for ${invitation.email}.`}
              confirmLabel="Cancel invitation"
              destructive
              onConfirm={() => cancel.mutateAsync()}
            />
          </>
        )}
      </div>
    </li>
  );
}
