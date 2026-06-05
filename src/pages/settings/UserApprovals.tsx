import { useEffect, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldCheck, ArrowLeft, Check, X, RotateCcw, Mail, Phone, Briefcase, Building2, MapPin, Clock, Languages, User as UserIcon, UserPlus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";


type ProfileRow = {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at: string | null;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  job_title?: string | null;
  department?: string | null;
  company?: string | null;
  location?: string | null;
  time_zone?: string | null;
  preferred_language?: string | null;
};

export default function UserApprovals() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [selected, setSelected] = useState<ProfileRow | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);


  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as ProfileRow[]);
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
    if (error) return toast.error(error.message);
    toast.success(`User ${status}`);
    load();
  };

  const filtered = rows.filter((r) => r.approval_status === tab);

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
              <h1 className="text-2xl font-bold tracking-tight">User Approvals</h1>
              <p className="text-sm text-muted-foreground">
                Review and approve new account requests. Only approved users can access the platform.
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
          <CardHeader>
            <CardTitle className="text-base">Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList>
                <TabsTrigger value="pending">
                  Pending
                  <Badge variant="secondary" className="ml-2">
                    {rows.filter((r) => r.approval_status === "pending").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved
                  <Badge variant="secondary" className="ml-2">
                    {rows.filter((r) => r.approval_status === "approved").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected
                  <Badge variant="secondary" className="ml-2">
                    {rows.filter((r) => r.approval_status === "rejected").length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value={tab} className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Signed up</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            Loading…
                          </TableCell>
                        </TableRow>
                      ) : filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No {tab} accounts.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((r) => (
                          <TableRow key={r.id} className="cursor-pointer" onClick={async () => {
                            const { data } = await supabase
                              .from("profiles")
                              .select("*")
                              .eq("id", r.id)
                              .maybeSingle();
                            setSelected((data as ProfileRow) ?? r);
                          }}>
                            <TableCell className="font-medium hover:underline">{r.full_name || r.display_name || "—"}</TableCell>
                            <TableCell>{r.email || "—"}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(r.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="inline-flex gap-2">
                                {tab !== "approved" && (
                                  <Button size="sm" onClick={() => setStatus(r, "approved")} className="gap-1">
                                    <Check className="h-3.5 w-3.5" /> Approve
                                  </Button>
                                )}
                                {tab !== "rejected" && (
                                  <Button size="sm" variant="outline" onClick={() => setStatus(r, "rejected")} className="gap-1">
                                    <X className="h-3.5 w-3.5" /> Reject
                                  </Button>
                                )}
                                {tab !== "pending" && (
                                  <Button size="sm" variant="ghost" onClick={() => setStatus(r, "pending")} className="gap-1">
                                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <ProfileDialog row={selected} onClose={() => setSelected(null)} />
      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={load} />
    </AppShell>

  );
}

function ProfileDialog({ row, onClose }: { row: ProfileRow | null; onClose: () => void }) {
  const fields: { icon: any; label: string; value?: string | null }[] = row
    ? [
        { icon: Mail, label: "Email", value: row.email },
        { icon: Phone, label: "Phone", value: row.phone },
        { icon: Briefcase, label: "Job Title", value: row.job_title },
        { icon: Building2, label: "Department", value: row.department },
        { icon: Building2, label: "Company", value: row.company },
        { icon: MapPin, label: "Location", value: row.location },
        { icon: Clock, label: "Time Zone", value: row.time_zone },
        { icon: Languages, label: "Preferred Language", value: row.preferred_language },
      ]
    : [];
  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>Full details for this account.</DialogDescription>
        </DialogHeader>
        {row && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {row.avatar_url ? (
                <img src={row.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover border" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-accent grid place-items-center text-indigo">
                  <UserIcon className="h-7 w-7" />
                </div>
              )}
              <div>
                <div className="text-lg font-semibold">{row.full_name || row.display_name || "—"}</div>
                <div className="text-xs text-muted-foreground capitalize">Status: {row.approval_status}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map((f) => (
                <div key={f.label} className="rounded-md border p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <f.icon className="h-3.5 w-3.5" /> {f.label}
                  </div>
                  <div className="mt-1 text-sm font-medium break-words">{f.value || "—"}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Signed up {new Date(row.created_at).toLocaleString()}
              {row.approved_at ? ` · Approved ${new Date(row.approved_at).toLocaleString()}` : ""}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
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