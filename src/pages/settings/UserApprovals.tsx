import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldCheck, ArrowLeft, UserPlus, Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserDetailDrawer, type UserRow } from "@/components/users/UserDetailDrawer";

type ProfileRow = UserRow;
type TabKey = "all" | "pending" | "approved" | "rejected";

type AccessSummary = {
  platformRole: "platform_admin" | "platform_support" | null;
  tenantNames: string[];
};

export default function UserApprovals() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProfileRow | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [access, setAccess] = useState<Record<string, AccessSummary>>({});

  const load = async () => {
    setLoading(true);
    const [{ data: profiles, error }, { data: roles }, { data: mems }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase
        .from("tenant_memberships")
        .select("user_id, tenant_id, tenant:tenants(name)"),
    ]);
    if (error) toast.error(error.message);
    setRows((profiles ?? []) as ProfileRow[]);
    const acc: Record<string, AccessSummary> = {};
    (profiles ?? []).forEach((p: any) => {
      acc[p.user_id] = { platformRole: null, tenantNames: [] };
    });
    (roles ?? []).forEach((r: any) => {
      const entry = (acc[r.user_id] ||= { platformRole: null, tenantNames: [] });
      if (r.role === "platform_admin" || !entry.platformRole) entry.platformRole = r.role;
    });
    (mems ?? []).forEach((m: any) => {
      const entry = (acc[m.user_id] ||= { platformRole: null, tenantNames: [] });
      const name = m.tenant?.name ?? m.tenant_id;
      if (!entry.tenantNames.includes(name)) entry.tenantNames.push(name);
    });
    setAccess(acc);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (row: ProfileRow, status: "approved" | "rejected" | "pending") => {
    const { error } = await supabase
      .from("profiles")
      .update({
        approval_status: status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
        approved_by: status === "approved" ? user?.id ?? null : null,
      })
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`User ${status}`);
    await load();
    setSelected((s) => (s && s.id === row.id ? { ...s, approval_status: status } : s));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab !== "all" && r.approval_status !== tab) return false;
      if (!q) return true;
      return (
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.full_name ?? "").toLowerCase().includes(q) ||
        (r.display_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, tab, search]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      pending: rows.filter((r) => r.approval_status === "pending").length,
      approved: rows.filter((r) => r.approval_status === "approved").length,
      rejected: rows.filter((r) => r.approval_status === "rejected").length,
    }),
    [rows],
  );

  return (
    <AppShell>
      <main className="flex-1 px-8 py-6 animate-fade-in">
        <Link to="/settings" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
        </Link>
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-navy text-white grid place-items-center shadow-[var(--shadow-md)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
              <p className="text-sm text-muted-foreground">
                Approvals, roles, workspace access, and recent sign-in activity for every account.
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={() => setInviteOpen(true)} className="gap-2 shrink-0">
              <UserPlus className="h-4 w-4" /> Invite user
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">Accounts</CardTitle>
            <div className="relative w-72">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
              <TabsList>
                <TabsTrigger value="all">
                  All <Badge variant="secondary" className="ml-2">{counts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending <Badge variant="secondary" className="ml-2">{counts.pending}</Badge>
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved <Badge variant="secondary" className="ml-2">{counts.approved}</Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected <Badge variant="secondary" className="ml-2">{counts.rejected}</Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value={tab} className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Platform role</TableHead>
                        <TableHead>Workspaces</TableHead>
                        <TableHead>Signed up</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                            Loading…
                          </TableCell>
                        </TableRow>
                      ) : filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No accounts match.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((r) => {
                          const a = access[r.user_id] ?? { platformRole: null, tenantNames: [] };
                          return (
                            <TableRow
                              key={r.id}
                              className="cursor-pointer hover:bg-muted/40"
                              onClick={() => setSelected(r)}
                            >
                              <TableCell className="font-medium">
                                {r.full_name || r.display_name || "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">{r.email || "—"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    r.approval_status === "approved"
                                      ? "default"
                                      : r.approval_status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="capitalize"
                                >
                                  {r.approval_status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {a.platformRole ? (
                                  <Badge variant="outline" className="capitalize">
                                    {a.platformRole.replace("platform_", "")}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {a.tenantNames.length === 0 ? (
                                  <span className="text-xs text-muted-foreground">—</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {a.tenantNames.slice(0, 2).map((n) => (
                                      <Badge key={n} variant="secondary" className="text-[10px]">
                                        {n}
                                      </Badge>
                                    ))}
                                    {a.tenantNames.length > 2 && (
                                      <Badge variant="outline" className="text-[10px]">
                                        +{a.tenantNames.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">
                                {new Date(r.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <UserDetailDrawer
        row={selected}
        onClose={() => setSelected(null)}
        onStatus={setStatus}
        onChanged={load}
      />
      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={load} />
    </AppShell>
  );
}

function InviteUserDialog({ open, onClose, onInvited }: { open: boolean; onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setEmail("");
    setFullName("");
    setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: { email: trimmed, full_name: fullName.trim() },
    });
    setSubmitting(false);
    if (error || (data && (data as any).error)) {
      toast.error(error?.message || (data as any)?.error || "Failed to send invitation");
      return;
    }
    toast.success(`Invitation sent to ${trimmed}`);
    reset();
    onClose();
    onInvited();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            Send an email invitation. The user will be granted read-only platform access once they accept and set a password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Work email</Label>
            <Input
              id="invite-email"
              type="email"
              autoFocus
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Full name (optional)</Label>
            <Input
              id="invite-name"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="rounded-md bg-muted/50 border px-3 py-2 text-xs text-muted-foreground">
            Access level: <span className="font-medium text-foreground">Read-only</span>. Invited users cannot create, edit, or delete data.
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
