import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Bot, LayoutDashboard, Plug, Users2, Settings2, Search, Eye, UserPlus, Copy, Database,
  ClipboardList, Trash2, ExternalLink,
} from "lucide-react";
import { TenantDataPanel } from "@/pages/crm/TenantDataPanel";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Tenant = {
  id: string; name: string; slug: string; status: boolean;
  primary_admin_email: string | null; created_at: string;
};


function InviteUserDialog({
  tenantId, tenantName, children,
}: {
  tenantId: string;
  tenantName: string;
  children: React.ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"tenant_member" | "tenant_admin">("tenant_member");
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const invite = useMutation({
    mutationFn: async () => {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { data, error } = await supabase.functions.invoke("tenant-invite", {
        body: { email, fullName, tenantId, role, redirectTo },
      });
      if (error) throw error;
      if (data && typeof data === "object" && "error" in data && data.error) {
        throw new Error(String((data as { error: string }).error));
      }
      return data as { ok: boolean; inviteLink?: string | null };
    },
    onSuccess: (data) => {
      toast({
        title: "Invitation sent",
        description: `An invite email has been sent to ${email}.`,
      });
      setInviteLink(data?.inviteLink ?? null);
      qc.invalidateQueries({ queryKey: ["tenant-members", tenantId] });
      qc.invalidateQueries({ queryKey: ["tenant-overview", tenantId] });
    },
    onError: (e: unknown) =>
      toast({ title: e instanceof Error ? e.message : "Invite failed", variant: "destructive" }),
  });

  const reset = () => {
    setEmail(""); setFullName(""); setRole("tenant_member"); setInviteLink(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user to {tenantName}</DialogTitle>
          <DialogDescription>
            They'll receive an email with a secure link to set their password and access the workspace.
          </DialogDescription>
        </DialogHeader>

        {!inviteLink ? (
          <form
            onSubmit={(e) => { e.preventDefault(); invite.mutate(); }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input id="invite-email" type="email" required value={email}
                placeholder="user@company.com"
                onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Full name (optional)</Label>
              <Input id="invite-name" value={fullName}
                onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "tenant_member" | "tenant_admin")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant_member">Tenant member</SelectItem>
                  <SelectItem value="tenant_admin">Tenant admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={invite.isPending || !email}>
                {invite.isPending ? "Sending…" : "Send invite"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This user already had an account. Share this secure link so they can set a new password:
            </p>
            <div className="flex gap-2">
              <Input readOnly value={inviteLink} className="font-mono text-xs" />
              <Button type="button" variant="outline" size="icon"
                onClick={() => { navigator.clipboard.writeText(inviteLink); toast({ title: "Link copied" }); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
export default function TenantSettingsPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { isAdmin, roleLoading } = useAuth();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants").select("*").eq("id", tenantId!).maybeSingle();
      if (error) throw error;
      return data as Tenant | null;
    },
    enabled: !!tenantId,
  });

  if (roleLoading) return <AppShell><div className="p-8 text-muted-foreground">Loading…</div></AppShell>;
  if (!isAdmin) return <Navigate to="/crm/tenants" replace />;

  return (
    <AppShell>
      <div className="p-6 max-w-[1600px] mx-auto w-full">
        <Link to="/crm/tenants" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to tenants
        </Link>

        {isLoading || !tenant ? (
          <div className="p-12 text-muted-foreground">Loading tenant…</div>
        ) : (
          <>
            <header className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                  <Settings2 className="h-6 w-6 text-indigo" /> {tenant.name}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">/t/{tenant.slug}</code>
                  <Badge variant={tenant.status ? "default" : "secondary"}>
                    {tenant.status ? "Active" : "Inactive"}
                  </Badge>
                  <span>{tenant.primary_admin_email || "no primary admin"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <InviteUserDialog tenantId={tenant.id} tenantName={tenant.name}>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-1.5" /> Invite user
                  </Button>
                </InviteUserDialog>
              </div>
            </header>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview"><LayoutDashboard className="h-4 w-4 mr-1.5" />Overview</TabsTrigger>
                <TabsTrigger value="agents"><Bot className="h-4 w-4 mr-1.5" />Agents</TabsTrigger>
                <TabsTrigger value="tools"><LayoutDashboard className="h-4 w-4 mr-1.5" />Dashboards & KPIs</TabsTrigger>
                <TabsTrigger value="data"><Database className="h-4 w-4 mr-1.5" />Data</TabsTrigger>
                <TabsTrigger value="connectors"><Plug className="h-4 w-4 mr-1.5" />Connectors</TabsTrigger>
                <TabsTrigger value="members"><Users2 className="h-4 w-4 mr-1.5" />Members</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <OverviewPanel tenantId={tenant.id} />
              </TabsContent>
              <TabsContent value="agents" className="mt-4">
                <AgentsPanel tenantId={tenant.id} />
              </TabsContent>
              <TabsContent value="tools" className="mt-4">
                <ToolsPanel tenantId={tenant.id} />
              </TabsContent>
              <TabsContent value="data" className="mt-4">
                <TenantDataPanel tenantId={tenant.id} />
              </TabsContent>
              <TabsContent value="connectors" className="mt-4">
                <ConnectorsPanel tenantId={tenant.id} />
              </TabsContent>
              <TabsContent value="members" className="mt-4">
                <MembersPanel tenantId={tenant.id} tenantName={tenant.name} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppShell>
  );
}

function OverviewPanel({ tenantId }: { tenantId: string }) {
  const { data } = useQuery({
    queryKey: ["tenant-overview", tenantId],
    queryFn: async () => {
      const [agents, tools, integrations, members] = await Promise.all([
        supabase.from("tenant_agent_assignments").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("enabled", true),
        supabase.from("tenant_tool_assignments").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("enabled", true),
        supabase.from("tenant_integrations").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "installed"),
        supabase.from("tenant_memberships").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
      ]);
      return {
        agents: agents.count ?? 0,
        tools: tools.count ?? 0,
        integrations: integrations.count ?? 0,
        members: members.count ?? 0,
      };
    },
  });
  const items = [
    { label: "Agents enabled", value: data?.agents ?? 0, icon: Bot },
    { label: "Dashboards enabled", value: data?.tools ?? 0, icon: LayoutDashboard },
    { label: "Connectors installed", value: data?.integrations ?? 0, icon: Plug },
    { label: "Members", value: data?.members ?? 0, icon: Users2 },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it) => (
        <Card key={it.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <it.icon className="h-3.5 w-3.5" /> {it.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{it.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type AssignmentRow = {
  id: string; name: string; description: string; category: string;
  enabled: boolean;
};

function AssignmentTable({
  rows, onToggle, isPending,
}: {
  rows: AssignmentRow[];
  onToggle: (id: string, enabled: boolean) => void;
  isPending: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.name, r.description, r.category].some((x) => x?.toLowerCase().includes(q)));
  }, [rows, search]);

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-3 border-b flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {rows.filter((r) => r.enabled).length} of {rows.length} enabled
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">Nothing matches.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sidebar Section</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24 text-right">Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-md truncate">{r.description}</TableCell>
                <TableCell className="text-right">
                  <Switch checked={r.enabled} onCheckedChange={(v) => onToggle(r.id, v)} disabled={isPending} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function AgentsPanel({ tenantId }: { tenantId: string }) {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["assign-agents", tenantId],
    queryFn: async () => {
      const [{ data: catalog, error: e1 }, { data: assigns, error: e2 }] = await Promise.all([
        supabase.from("agents_catalog").select("id,name,description,capability").eq("is_active", true).order("name"),
        supabase.from("tenant_agent_assignments").select("agent_id,enabled").eq("tenant_id", tenantId),
      ]);
      if (e1) throw e1; if (e2) throw e2;
      const map = new Map((assigns ?? []).map((a) => [a.agent_id, a.enabled]));
      return (catalog ?? []).map((c) => ({
        id: c.id, name: c.name, description: c.description, category: c.capability ?? "",
        enabled: map.get(c.id) === true,
      })) as AssignmentRow[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ agentId, enabled }: { agentId: string; enabled: boolean }) => {
      const { data: existing } = await supabase
        .from("tenant_agent_assignments").select("id").eq("tenant_id", tenantId).eq("agent_id", agentId).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("tenant_agent_assignments").update({ enabled }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tenant_agent_assignments").insert({ tenant_id: tenantId, agent_id: agentId, enabled });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assign-agents", tenantId] }),
    onError: (e: unknown) => toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }),
  });

  return <AssignmentTable rows={rows} isPending={toggle.isPending} onToggle={(id, enabled) => toggle.mutate({ agentId: id, enabled })} />;
}

function ToolsPanel({ tenantId }: { tenantId: string }) {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["assign-tools", tenantId],
    queryFn: async () => {
      const [{ data: catalog, error: e1 }, { data: assigns, error: e2 }] = await Promise.all([
        supabase.from("tools_catalog").select("id,name,description,category").eq("is_active", true).order("name"),
        supabase.from("tenant_tool_assignments").select("tool_id,enabled").eq("tenant_id", tenantId),
      ]);
      if (e1) throw e1; if (e2) throw e2;
      const map = new Map((assigns ?? []).map((a) => [a.tool_id, a.enabled]));
      return (catalog ?? []).map((c) => ({
        id: c.id, name: c.name, description: c.description, category: c.category ?? "",
        enabled: map.get(c.id) === true,
      })) as AssignmentRow[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ toolId, enabled }: { toolId: string; enabled: boolean }) => {
      const { data: existing } = await supabase
        .from("tenant_tool_assignments").select("id").eq("tenant_id", tenantId).eq("tool_id", toolId).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("tenant_tool_assignments").update({ enabled }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tenant_tool_assignments").insert({ tenant_id: tenantId, tool_id: toolId, enabled });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assign-tools", tenantId] }),
    onError: (e: unknown) => toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }),
  });

  return <AssignmentTable rows={rows} isPending={toggle.isPending} onToggle={(id, enabled) => toggle.mutate({ toolId: id, enabled })} />;
}

function ConnectorsPanel({ tenantId }: { tenantId: string }) {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["assign-connectors", tenantId],
    queryFn: async () => {
      const [{ data: catalog, error: e1 }, { data: assigns, error: e2 }] = await Promise.all([
        supabase.from("integrations_catalog").select("id,name,description,category").eq("is_active", true).order("name"),
        supabase.from("tenant_integrations").select("integration_id,status").eq("tenant_id", tenantId),
      ]);
      if (e1) throw e1; if (e2) throw e2;
      const map = new Map((assigns ?? []).map((a) => [a.integration_id, a.status]));
      return (catalog ?? []).map((c) => ({
        id: c.id, name: c.name, description: c.description, category: c.category ?? "",
        enabled: map.get(c.id) === "installed",
      })) as AssignmentRow[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ integrationId, enabled }: { integrationId: string; enabled: boolean }) => {
      const status = enabled ? "installed" : "not_installed";
      const { data: existing } = await supabase
        .from("tenant_integrations").select("id").eq("tenant_id", tenantId).eq("integration_id", integrationId).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("tenant_integrations").update({ status, enabled }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tenant_integrations").insert({ tenant_id: tenantId, integration_id: integrationId, status, enabled });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assign-connectors", tenantId] }),
    onError: (e: unknown) => toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }),
  });

  return <AssignmentTable rows={rows} isPending={toggle.isPending} onToggle={(id, enabled) => toggle.mutate({ integrationId: id, enabled })} />;
}

function MembersPanel({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: members = [] } = useQuery({
    queryKey: ["tenant-members", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_memberships")
        .select("id,user_id,role,created_at")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = (data ?? []).map((m) => m.user_id);
      let profiles: Record<string, { display_name: string | null; email: string | null; approval_status: string | null }> = {};
      if (ids.length) {
        const { data: p } = await supabase.from("profiles").select("user_id,display_name,email,approval_status").in("user_id", ids);
        profiles = Object.fromEntries((p ?? []).map((x) => [x.user_id, { display_name: x.display_name, email: x.email, approval_status: x.approval_status }]));
      }
      return (data ?? []).map((m) => ({ ...m, profile: profiles[m.user_id] }));
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: status,
          approved_by: status === "approved" ? user?.id ?? null : null,
          approved_at: status === "approved" ? new Date().toISOString() : null,
        })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast({ title: v.status === "approved" ? "Member approved" : "Member rejected" });
      qc.invalidateQueries({ queryKey: ["tenant-members", tenantId] });
    },
    onError: (e: unknown) => toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }),
  });

  const removeMember = useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase.from("tenant_memberships").delete().eq("id", membershipId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Member removed" });
      qc.invalidateQueries({ queryKey: ["tenant-members", tenantId] });
    },
    onError: (e: unknown) => toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }),
  });

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{members.length} member{members.length === 1 ? "" : "s"}</div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No members yet.</TableCell></TableRow>
          ) : members.map((m) => {
            const status = m.profile?.approval_status ?? "pending";
            return (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.profile?.display_name || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{m.profile?.email || "—"}</TableCell>
              <TableCell><Badge variant="outline">{m.role}</Badge></TableCell>
              <TableCell>
                <Badge variant={status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary"}>
                  {status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{new Date(m.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="inline-flex gap-2">
                  {status !== "approved" && (
                    <Button size="sm" variant="default" disabled={setStatus.isPending}
                      onClick={() => setStatus.mutate({ userId: m.user_id, status: "approved" })}>
                      Approve
                    </Button>
                  )}
                  {status !== "rejected" && (
                    <Button size="sm" variant="outline" disabled={setStatus.isPending}
                      onClick={() => setStatus.mutate({ userId: m.user_id, status: "rejected" })}>
                      Reject
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" disabled={removeMember.isPending}
                    onClick={() => removeMember.mutate(m.id)}>
                    Remove
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
