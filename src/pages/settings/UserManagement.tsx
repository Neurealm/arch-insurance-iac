import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Users, ShieldCheck, Search, RefreshCw, Mail, Ban, KeyRound, Trash2,
  CheckCircle2, XCircle, Clock, History, UserCog, Copy, Eye, EyeOff, Sparkles, Activity, Building2, Briefcase,
} from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type UserCategory = "neurealm_employee" | "customer";
type ManagedUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
  provider: string | null;
  profile: any | null;
  roles: string[];
};
type AuthLog = {
  id: string;
  created_at: string;
  ip_address: string | null;
  action: string | null;
  actor_email: string | null;
  traits: any;
};
type PageActivityRow = {
  id: string;
  path: string;
  page_title: string | null;
  entered_at: string;
};

function formatRelative(iso: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (diff < 60_000) return "just now";
  const m = Math.round(diff / 60_000);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function generateStrongPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const nums = "23456789";
  const syms = "!@#$%^&*?";
  const all = upper + lower + nums + syms;
  const bytes = new Uint32Array(16);
  crypto.getRandomValues(bytes);
  const out = [
    upper[bytes[0] % upper.length],
    lower[bytes[1] % lower.length],
    nums[bytes[2] % nums.length],
    syms[bytes[3] % syms.length],
  ];
  for (let i = 4; i < 16; i++) out.push(all[bytes[i] % all.length]);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join("");
}

const ACTION_LABEL: Record<string, string> = {
  login: "Sign in",
  logout: "Sign out",
  user_signedup: "Sign up",
  user_modified: "Profile updated",
  user_recovery_requested: "Password reset requested",
  token_revoked: "Token revoked",
  token_refreshed: "Token refreshed",
  user_invited: "Invited",
};

const actionTone = (a: string | null) => {
  if (!a) return "secondary" as const;
  if (a.includes("fail") || a.includes("revoked")) return "destructive" as const;
  if (a === "login" || a === "user_signedup") return "default" as const;
  return "secondary" as const;
};

const CATEGORY_LABEL: Record<UserCategory, string> = {
  neurealm_employee: "NeuRealm Employee",
  customer: "Customer",
};

export default function UserManagement() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ManagedUser | null>(null);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activity, setActivity] = useState<PageActivityRow[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityDays, setActivityDays] = useState<number>(7);
  const [actionBusy, setActionBusy] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirst, setInviteFirst] = useState("");
  const [inviteLast, setInviteLast] = useState("");
  const [inviteJob, setInviteJob] = useState("");
  const [inviteDept, setInviteDept] = useState("");
  const [inviteResult, setInviteResult] = useState<{ email: string; tempPassword: string; emailSent: boolean } | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);


  const invoke = async (action: string, payload: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action, ...payload },
    });
    if (error) throw new Error(error.message);
    if (data && typeof data === "object" && "error" in data && (data as any).error) {
      throw new Error((data as any).error);
    }
    return data as any;
  };

  const load = async (): Promise<ManagedUser[]> => {
    setLoading(true);
    try {
      const { users: list } = await invoke("list_users");
      const next: ManagedUser[] = list ?? [];
      setUsers(next);
      return next;
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load users");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const loadLogs = async (uid: string, email: string) => {
    setLogsLoading(true);
    try {
      const { events } = await invoke("get_user_auth_logs", { user_id: uid, email });
      setAuthLogs(events ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load login history");
      setAuthLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadActivity = async (uid: string, days: number) => {
    setActivityLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_user_page_activity" as any, { _user_id: uid, _days: days, _limit: 500 });
      if (error) throw error;
      setActivity((data as PageActivityRow[]) ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load page activity");
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const openUser = (u: ManagedUser) => {
    setSelected(u);
    setAuthLogs([]);
    setActivity([]);
    setActivityDays(7);
    loadLogs(u.id, u.email);
    loadActivity(u.id, 7);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter !== "all") {
        const status = u.profile?.approval_status ?? "pending";
        if (status !== statusFilter) return false;
      }
      if (roleFilter === "admin" && !u.roles.includes("platform_admin")) return false;
      if (roleFilter === "member" && u.roles.includes("platform_admin")) return false;
      if (categoryFilter !== "all") {
        const cat = (u.profile?.user_category as UserCategory | undefined) ??
          (u.email?.toLowerCase().endsWith("@neurealm.com") ? "neurealm_employee" : "customer");
        if (cat !== categoryFilter) return false;
      }
      if (!q) return true;
      const hay = [u.email, u.profile?.full_name, u.profile?.display_name, u.profile?.company]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [users, search, statusFilter, roleFilter, categoryFilter]);

  const counts = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.roles.includes("platform_admin")).length,
    employees: users.filter((u) => (u.profile?.user_category ?? "customer") === "neurealm_employee").length,
    customers: users.filter((u) => (u.profile?.user_category ?? "customer") === "customer").length,
    pending: users.filter((u) => (u.profile?.approval_status ?? "pending") === "pending").length,
    suspended: users.filter((u) => u.banned_until && new Date(u.banned_until) > new Date()).length,
  }), [users]);

  const refreshSelected = async () => {
    const next = await load();
    if (selected) setSelected(next.find((u) => u.id === selected.id) ?? null);
  };

  const runAction = async (label: string, fn: () => Promise<unknown>) => {
    setActionBusy(true);
    try {
      await fn();
      toast.success(label);
      await refreshSelected();
    } catch (e: any) {
      toast.error(e.message ?? "Action failed");
    } finally {
      setActionBusy(false);
    }
  };

  const sendInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    setActionBusy(true);
    try {
      const first = inviteFirst.trim();
      const last = inviteLast.trim();
      const full_name = [first, last].filter(Boolean).join(" ") || undefined;
      const res = await invoke("invite_user", {
        email,
        full_name,
        first_name: first || undefined,
        last_name: last || undefined,
        job_title: inviteJob.trim() || undefined,
        department: inviteDept.trim() || undefined,
      });
      setInviteResult({ email: res.email ?? email, tempPassword: res.temp_password, emailSent: !!res.email_sent });
      toast.success(res.email_sent ? `Invite email sent to ${email}` : `Account created for ${email} — email failed, share the password manually`);
      setInviteEmail(""); setInviteFirst(""); setInviteLast(""); setInviteJob(""); setInviteDept("");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Invite failed");
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <AppShell>
      <main className="flex-1 px-8 py-6 animate-fade-in">
        <Link to="/settings" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
        </Link>

        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-navy text-white grid place-items-center shadow-[var(--shadow-md)]">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
              <p className="text-sm text-muted-foreground">Invite users, manage roles, approvals and categories, and review activity.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
          <StatCard label="Total" value={counts.total} icon={Users} />
          <StatCard label="Employees" value={counts.employees} icon={Briefcase} />
          <StatCard label="Customers" value={counts.customers} icon={Building2} />
          <StatCard label="Admins" value={counts.admins} icon={ShieldCheck} />
          <StatCard label="Pending" value={counts.pending} icon={Clock} />
          <StatCard label="Suspended" value={counts.suspended} icon={Ban} />
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Invite a user</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@company.com"
                type="email"
                className="h-10 flex-1 max-w-md"
                disabled={actionBusy}
              />
              <Button onClick={sendInvite} disabled={actionBusy || !inviteEmail.trim()}>Create invite</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl">
              <Input value={inviteFirst} onChange={(e) => setInviteFirst(e.target.value)} placeholder="First name (optional)" disabled={actionBusy} className="h-9" />
              <Input value={inviteLast} onChange={(e) => setInviteLast(e.target.value)} placeholder="Last name (optional)" disabled={actionBusy} className="h-9" />
              <Input value={inviteJob} onChange={(e) => setInviteJob(e.target.value)} placeholder="Job title (optional)" disabled={actionBusy} className="h-9" />
              <Input value={inviteDept} onChange={(e) => setInviteDept(e.target.value)} placeholder="Department (optional)" disabled={actionBusy} className="h-9" />
            </div>
            <p className="text-[11px] text-muted-foreground">Pre-fill helps the invitee land in a filled-out profile. All fields optional — they can edit anything later.</p>
            {inviteResult && (
              <div className={`rounded-md border p-3 space-y-2 max-w-xl ${inviteResult.emailSent ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
                <div className={`text-[13px] font-medium ${inviteResult.emailSent ? "text-emerald-900" : "text-amber-900"}`}>
                  {inviteResult.emailSent
                    ? `Invite email sent to ${inviteResult.email}. It contains the temp password and a link to sign in.`
                    : `Account created for ${inviteResult.email} but the email couldn't be sent. Share this temp password with them manually — they'll set their own on first sign-in.`}
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-white border rounded px-2 py-1.5 truncate select-all">{inviteResult.tempPassword}</code>
                  <Button size="sm" variant="outline" className="gap-1" onClick={async () => { await navigator.clipboard.writeText(inviteResult.tempPassword); toast.success("Password copied"); }}>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setInviteResult(null)}>Done</Button>
                </div>
                <div className={`text-[11px] ${inviteResult.emailSent ? "text-emerald-800/80" : "text-amber-800/80"}`}>
                  They sign in at {window.location.origin}/login with this password and are prompted to change it.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-base mr-auto">Directory</CardTitle>
              <div className="relative w-64">
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email or name" className="h-9 pl-8" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[170px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="neurealm_employee">NeuRealm Employee</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Platform admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">Loading users…</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No users match these filters.</TableCell></TableRow>
                  ) : (
                    filtered.map((u) => {
                      const status = (u.profile?.approval_status ?? "pending") as string;
                      const suspended = u.banned_until && new Date(u.banned_until) > new Date();
                      const displayName = u.profile?.full_name || u.profile?.display_name || (u.email?.split("@")[0] ?? u.email);
                      const cat = (u.profile?.user_category as UserCategory | undefined)
                        ?? (u.email?.toLowerCase().endsWith("@neurealm.com") ? "neurealm_employee" : "customer");
                      return (
                        <TableRow key={u.id} className="cursor-pointer" onClick={() => openUser(u)}>
                          <TableCell>
                            <div className="font-medium">{displayName}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </TableCell>
                          <TableCell>
                            {cat === "neurealm_employee" ? (
                              <Badge className="gap-1 bg-indigo-600 hover:bg-indigo-600"><Briefcase className="h-3 w-3" />Employee</Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1"><Building2 className="h-3 w-3" />Customer</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {suspended ? (
                              <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" />Suspended</Badge>
                            ) : status === "approved" ? (
                              <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600"><CheckCircle2 className="h-3 w-3" />Approved</Badge>
                            ) : status === "rejected" ? (
                              <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {u.roles.includes("platform_admin") ? (
                              <Badge className="bg-indigo-700 hover:bg-indigo-700 gap-1"><ShieldCheck className="h-3 w-3" />Platform admin</Badge>
                            ) : <span className="text-xs text-muted-foreground">Member</span>}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.last_sign_in_at ? formatRelative(u.last_sign_in_at) : "Never signed in"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selected.profile?.full_name || selected.profile?.display_name || selected.email}
                  {selected.id === me?.id && <Badge variant="outline" className="text-xs">You</Badge>}
                </SheetTitle>
                <SheetDescription>{selected.email}</SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="access" className="mt-4">
                <TabsList>
                  <TabsTrigger value="access">Access</TabsTrigger>
                  <TabsTrigger value="history">Login history</TabsTrigger>
                  <TabsTrigger value="activity">Page activity</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="access" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">User category</CardTitle></CardHeader>
                    <CardContent>
                      <Select
                        value={(selected.profile?.user_category as UserCategory | undefined) ?? "customer"}
                        onValueChange={(v) => runAction(`Category set to ${CATEGORY_LABEL[v as UserCategory]}`, () =>
                          invoke("set_user_category", { user_id: selected.id, category: v }))}
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neurealm_employee">NeuRealm Employee</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Auto-defaulted from email domain (@neurealm.com → Employee). Override any time.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Approval status</CardTitle></CardHeader>
                    <CardContent>
                      <Select
                        value={selected.profile?.approval_status ?? "pending"}
                        onValueChange={(v) => runAction(`Status set to ${v}`, () => invoke("set_approval_status", { user_id: selected.id, status: v }))}
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Platform admin</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">Full administrative access to the portal.</div>
                      <Switch
                        checked={selected.roles.includes("platform_admin")}
                        disabled={actionBusy || selected.id === me?.id}
                        onCheckedChange={(v) => runAction(v ? "Promoted to platform admin" : "Removed platform admin", () =>
                          invoke("set_platform_admin", { user_id: selected.id, enable: v }))}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Account details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-sm">
                      <div><div className="text-muted-foreground text-xs">Provider</div><div className="font-medium capitalize">{selected.provider ?? "email"}</div></div>
                      <div><div className="text-muted-foreground text-xs">Email confirmed</div><div className="font-medium">{selected.email_confirmed_at ? "Yes" : "No"}</div></div>
                      <div><div className="text-muted-foreground text-xs">Created</div><div className="font-medium">{new Date(selected.created_at).toLocaleDateString()}</div></div>
                      <div><div className="text-muted-foreground text-xs">Last sign-in</div><div className="font-medium">{selected.last_sign_in_at ? new Date(selected.last_sign_in_at).toLocaleString() : "Never"}</div></div>
                    </CardContent>
                  </Card>

                  <ProfileDetailsCard
                    profile={selected.profile}
                    onEdit={() => setEditProfileOpen(true)}
                  />

                </TabsContent>

                <TabsContent value="history" className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><History className="h-3 w-3" />Recent auth events</div>
                    <Button size="sm" variant="ghost" onClick={() => loadLogs(selected.id, selected.email)} disabled={logsLoading} className="gap-1">
                      <RefreshCw className={`h-3 w-3 ${logsLoading ? "animate-spin" : ""}`} /> Refresh
                    </Button>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>When</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>IP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logsLoading ? (
                          <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>
                        ) : authLogs.length === 0 ? (
                          <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No recorded events.</TableCell></TableRow>
                        ) : authLogs.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="text-xs">{new Date(e.created_at).toLocaleString()}</TableCell>
                            <TableCell><Badge variant={actionTone(e.action)}>{ACTION_LABEL[e.action ?? ""] ?? e.action ?? "—"}</Badge></TableCell>
                            <TableCell className="text-xs font-mono">{e.ip_address || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-4 space-y-3">
                  {(() => {
                    const totalVisits = activity.length;
                    const uniquePages = new Set(activity.map((r) => r.path)).size;
                    const lastSeen = activity[0]?.entered_at ?? null;
                    const byPath = new Map<string, { count: number; last: string; title: string | null }>();
                    for (const r of activity) {
                      const cur = byPath.get(r.path) ?? { count: 0, last: r.entered_at, title: r.page_title };
                      cur.count += 1;
                      if (r.entered_at > cur.last) cur.last = r.entered_at;
                      byPath.set(r.path, cur);
                    }
                    const topPages = [...byPath.entries()]
                      .map(([path, v]) => ({ path, ...v }))
                      .sort((a, b) => b.count - a.count).slice(0, 10);
                    return (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <SignalTile label="Visits" value={totalVisits} />
                          <SignalTile label="Unique pages" value={uniquePages} />
                          <SignalTile label="Last seen" value={formatRelative(lastSeen)} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Activity className="h-3 w-3" /> Page activity
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={String(activityDays)} onValueChange={(v) => { const n = Number(v); setActivityDays(n); loadActivity(selected.id, n); }}>
                              <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Last 24h</SelectItem>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="ghost" onClick={() => loadActivity(selected.id, activityDays)} disabled={activityLoading} className="gap-1">
                              <RefreshCw className={`h-3 w-3 ${activityLoading ? "animate-spin" : ""}`} /> Refresh
                            </Button>
                          </div>
                        </div>
                        {topPages.length > 0 && (
                          <div className="rounded-md border">
                            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">Top pages</div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Path</TableHead>
                                  <TableHead className="w-16 text-right">Visits</TableHead>
                                  <TableHead className="w-28 text-right">Last visit</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {topPages.map((p) => (
                                  <TableRow key={p.path}>
                                    <TableCell className="text-xs font-mono truncate max-w-[300px]" title={p.title ?? p.path}>{p.title ?? p.path}</TableCell>
                                    <TableCell className="text-xs text-right">{p.count}</TableCell>
                                    <TableCell className="text-xs text-right">{formatRelative(p.last)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                        <div className="rounded-md border">
                          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">Visit timeline</div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-40">When</TableHead>
                                <TableHead>Page</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {activityLoading ? (
                                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>
                              ) : activity.length === 0 ? (
                                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">No page activity in this window.</TableCell></TableRow>
                              ) : activity.map((r) => (
                                <TableRow key={r.id}>
                                  <TableCell className="text-xs whitespace-nowrap">{new Date(r.entered_at).toLocaleString()}</TableCell>
                                  <TableCell>
                                    <div className="text-xs font-medium truncate max-w-[280px]" title={r.page_title ?? r.path}>{r.page_title ?? r.path}</div>
                                    <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[280px]">{r.path}</div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="actions" className="mt-4 space-y-2">
                  {(selected.provider === null || selected.provider === "email") && selected.id !== me?.id && (
                    <SetPasswordCard
                      key={selected.id}
                      onSubmit={(pwd) => runAction("Password set", () =>
                        invoke("set_user_password", { user_id: selected.id, password: pwd }))}
                      busy={actionBusy}
                    />
                  )}
                  <ActionRow
                    icon={KeyRound}
                    title="Send password reset email"
                    description="Sends a reset link to the user's email."
                    button={
                      <Button size="sm" variant="outline" disabled={actionBusy}
                        onClick={() => runAction("Password reset sent", () =>
                          invoke("send_password_reset", { email: selected.email, redirect_to: `${window.location.origin}/reset-password` }))}>
                        <Mail className="h-3.5 w-3.5 mr-1" /> Send
                      </Button>
                    }
                  />
                  <ActionRow
                    icon={Ban}
                    title={selected.banned_until && new Date(selected.banned_until) > new Date() ? "Re-activate account" : "Suspend account"}
                    description="Suspended users cannot sign in until reactivated."
                    button={
                      <Button size="sm" variant={selected.banned_until && new Date(selected.banned_until) > new Date() ? "default" : "destructive"}
                        disabled={actionBusy || selected.id === me?.id}
                        onClick={() => {
                          const suspended = selected.banned_until && new Date(selected.banned_until) > new Date();
                          runAction(suspended ? "Account reactivated" : "Account suspended", () =>
                            invoke("set_user_banned", { user_id: selected.id, banned: !suspended }));
                        }}>
                        {selected.banned_until && new Date(selected.banned_until) > new Date() ? "Reactivate" : "Suspend"}
                      </Button>
                    }
                  />
                  <ActionRow
                    icon={Trash2}
                    title="Delete user"
                    description="Permanently removes the user from auth and the platform."
                    button={
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" disabled={actionBusy || selected.id === me?.id}>Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {selected.email}?</AlertDialogTitle>
                            <AlertDialogDescription>This permanently removes the user and revokes all sessions. This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={async () => {
                              await runAction("User deleted", () => invoke("delete_user", { user_id: selected.id }));
                              setSelected(null);
                            }}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    }
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-accent grid place-items-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold leading-none">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="font-medium text-sm break-words">{children ?? <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function fmtDate(v: any) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
}

function ProfileDetailsCard({ profile, onEdit }: { profile: any; onEdit?: () => void }) {
  if (!profile) {
    return (
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Profile details</CardTitle>
          {onEdit && <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>}
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">No profile record.</CardContent>
      </Card>
    );
  }
  const nn = (v: any) => (v === null || v === undefined || v === "" ? null : v);
  const hybrid = Array.isArray(profile.hybrid_days) && profile.hybrid_days.length ? profile.hybrid_days.join(", ") : null;
  const ooo =
    profile.ooo_enabled && (profile.ooo_start || profile.ooo_end)
      ? `${fmtDate(profile.ooo_start) ?? "—"} → ${fmtDate(profile.ooo_end) ?? "—"}`
      : profile.ooo_enabled ? "Enabled" : "Off";

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">Profile details</CardTitle>
        {onEdit && <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>}
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Identity</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">{nn(profile.first_name)}</Field>
            <Field label="Last name">{nn(profile.last_name)}</Field>
            <Field label="Display name">{nn(profile.display_name) ?? nn(profile.full_name)}</Field>
            <Field label="Job title">{nn(profile.job_title)}</Field>
            <Field label="Department">{nn(profile.department)}</Field>
            <Field label="Company">
              {profile.company_id && nn(profile.company) ? (
                <Link to={`/crm/companies/${profile.company_id}`} className="text-primary hover:underline">
                  {profile.company}
                </Link>
              ) : nn(profile.company)}
            </Field>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Contact & location</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">{nn(profile.phone)}</Field>
            <Field label="Preferred contact">{nn(profile.preferred_contact_method)}</Field>
            <Field label="Working location">{nn(profile.working_location_type)}</Field>
            <Field label="Office site">{nn(profile.office_site)}</Field>
            <Field label="Hybrid days">{hybrid}</Field>
            <Field label="Location">{nn(profile.location)}</Field>
            <Field label="Time zone">{nn(profile.time_zone)}</Field>
            <Field label="Preferred language">{nn(profile.preferred_language)}</Field>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Status</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="User category">{nn(profile.user_category)}</Field>
            <Field label="Profile completed">{fmtDate(profile.profile_completed_at) ?? "Incomplete"}</Field>
            <Field label="Must change password">{profile.must_change_password ? "Yes" : "No"}</Field>
            <Field label="Out of office">{ooo}</Field>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionRow({ icon: Icon, title, description, button }: { icon: any; title: string; description: string; button: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-md bg-accent grid place-items-center text-primary"><Icon className="h-4 w-4" /></div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      {button}
    </div>
  );
}

function SignalTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-accent/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-lg font-semibold leading-tight truncate">{value}</div>
    </div>
  );
}

function SetPasswordCard({ onSubmit, busy }: { onSubmit: (pwd: string) => Promise<void> | void; busy: boolean }) {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [committed, setCommitted] = useState<string | null>(null);

  useEffect(() => {
    if (!committed) return;
    const t = window.setTimeout(() => setCommitted(null), 60_000);
    return () => window.clearTimeout(t);
  }, [committed]);

  const checks = [
    { ok: pwd.length >= 12, label: "12+" },
    { ok: /[A-Z]/.test(pwd), label: "A" },
    { ok: /[a-z]/.test(pwd), label: "a" },
    { ok: /[0-9]/.test(pwd), label: "1" },
    { ok: /[^A-Za-z0-9]/.test(pwd), label: "!" },
  ];
  const strong = checks.every((c) => c.ok);

  const submit = async () => {
    if (!strong) return;
    const value = pwd;
    await onSubmit(value);
    setCommitted(value);
    setPwd("");
  };

  const copy = async () => {
    if (!committed) return;
    await navigator.clipboard.writeText(committed);
    toast.success("Password copied to clipboard");
  };

  return (
    <div className="rounded-md border px-3 py-3 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-md bg-accent grid place-items-center text-primary"><KeyRound className="h-4 w-4" /></div>
        <div className="flex-1">
          <div className="text-sm font-medium">Set password (offline)</div>
          <div className="text-xs text-muted-foreground">Sets the account password directly. No email is sent — share it securely.</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={show ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Enter or generate a password"
              className="h-9 pr-9 font-mono"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute inset-y-0 right-0 px-2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide" : "Show"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => { setPwd(generateStrongPassword()); setShow(true); }}>
            <Sparkles className="h-3.5 w-3.5" /> Generate
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {checks.map((c) => (
            <span key={c.label} className={`text-[10px] px-1.5 py-px rounded border ${c.ok ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border text-muted-foreground"}`}>
              {c.ok ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
        <Button size="sm" onClick={submit} disabled={busy || !strong} className="w-full">
          {busy ? "Setting…" : "Set password"}
        </Button>
      </div>
      {committed && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-2.5 space-y-2">
          <div className="text-[11px] text-emerald-900 font-medium">Share offline. Auto-hides in 60 seconds.</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-white border rounded px-2 py-1 truncate select-all">{committed}</code>
            <Button size="sm" variant="outline" className="gap-1" onClick={copy}>
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
