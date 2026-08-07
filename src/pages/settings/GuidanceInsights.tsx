import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, MessageSquare, Flag, RefreshCw, Search, CheckCircle2, Inbox,
} from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type InteractionStatus = "open" | "triaged" | "resolved" | "dismissed";

type Interaction = {
  id: string;
  user_id: string;
  question: string;
  answer: string | null;
  matched_catalog_ids: string[];
  confidence: number | null;
  escalated: boolean;
  escalated_at: string | null;
  escalation_note: string | null;
  status: InteractionStatus;
  created_at: string;
};

type ProfileLite = { user_id: string; email: string | null; full_name: string | null; display_name: string | null };

const STATUS_LABEL: Record<InteractionStatus, string> = {
  open: "Open",
  triaged: "Triaged",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const DATE_RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
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

export default function GuidanceInsights() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [profiles, setProfiles] = useState<Map<string, ProfileLite>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [escalatedOnly, setEscalatedOnly] = useState(false);
  const [dateRange, setDateRange] = useState<string>("30");

  const load = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("guidance_agent_interactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (dateRange !== "all") {
        const cutoff = new Date(Date.now() - Number(dateRange) * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", cutoff);
      }
      const { data, error } = await query;
      if (error) throw error;
      const rows = (data ?? []) as Interaction[];
      setInteractions(rows);

      const userIds = [...new Set(rows.map((r) => r.user_id))];
      if (userIds.length) {
        const { data: profileRows } = await supabase
          .from("profiles")
          .select("user_id, email, full_name, display_name")
          .in("user_id", userIds);
        setProfiles(new Map((profileRows ?? []).map((p) => [p.user_id, p as ProfileLite])));
      } else {
        setProfiles(new Map());
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load guidance interactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return interactions.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (escalatedOnly && !row.escalated) return false;
      if (!q) return true;
      const hay = [row.question, row.answer].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [interactions, search, statusFilter, escalatedOnly]);

  const counts = useMemo(
    () => ({
      total: interactions.length,
      open: interactions.filter((r) => r.status === "open").length,
      escalated: interactions.filter((r) => r.escalated).length,
      resolved: interactions.filter((r) => r.status === "resolved").length,
    }),
    [interactions],
  );

  const updateStatus = async (id: string, status: InteractionStatus) => {
    const prev = interactions;
    setInteractions((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error } = await supabase.from("guidance_agent_interactions").update({ status }).eq("id", id);
    if (error) {
      setInteractions(prev);
      toast.error(error.message ?? "Failed to update status");
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
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Guidance Agent Insights</h1>
              <p className="text-sm text-muted-foreground">
                What customers ask the guidance agent, what it couldn't answer, and escalations awaiting follow-up.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard label="Questions" value={counts.total} icon={MessageSquare} />
          <StatCard label="Open" value={counts.open} icon={Inbox} />
          <StatCard label="Escalated" value={counts.escalated} icon={Flag} />
          <StatCard label="Resolved" value={counts.resolved} icon={CheckCircle2} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-base mr-auto">Interactions</CardTitle>
              <div className="relative w-64">
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search question or answer" className="h-9 pl-8" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {(Object.keys(STATUS_LABEL) as InteractionStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant={escalatedOnly ? "default" : "outline"}
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => setEscalatedOnly((v) => !v)}
              >
                <Flag className="h-3.5 w-3.5" /> Escalated only
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="w-24">Confidence</TableHead>
                    <TableHead className="w-24">Escalated</TableHead>
                    <TableHead className="w-40">Status</TableHead>
                    <TableHead className="w-28">Asked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Loading…</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No interactions match these filters.</TableCell></TableRow>
                  ) : (
                    filtered.map((row) => {
                      const profile = profiles.get(row.user_id);
                      const who = profile?.full_name || profile?.display_name || profile?.email || row.user_id.slice(0, 8);
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="max-w-[360px]">
                            <div className="text-sm truncate" title={row.question}>{row.question}</div>
                            {row.answer && (
                              <div className="text-xs text-muted-foreground truncate" title={row.answer}>{row.answer}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">{who}</TableCell>
                          <TableCell className="text-xs">{row.confidence ?? "—"}%</TableCell>
                          <TableCell>
                            {row.escalated ? (
                              <Badge variant="destructive" className="gap-1"><Flag className="h-3 w-3" />Yes</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">No</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select value={row.status} onValueChange={(v) => updateStatus(row.id, v as InteractionStatus)}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {(Object.keys(STATUS_LABEL) as InteractionStatus[]).map((s) => (
                                  <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatRelative(row.created_at)}</TableCell>
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
    </AppShell>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
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
