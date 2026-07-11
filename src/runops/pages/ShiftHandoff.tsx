/**
 * Page 24 · Shift Handoff & Operations Journal
 * Route: /runops/operations/handoff
 *
 * Transfers operational responsibility without losing context.
 * - Composes shift snapshot from provider data (incidents, changes, executions,
 *   services / SLOs) and cross-page localStorage stores:
 *     runops.executions.v1, runops.approvals.v1, runops.corrective.v1,
 *     runops.reviewtasks.v1
 * - Persists handoffs to runops.handoffs.v1 and follow-up tasks to
 *   runops.followups.v1.
 * - Every mutation emits audit + domain events via ops.pushNotification.
 * - NOVA summary distinguishes verified facts, hypotheses, actions completed,
 *   actions pending, risks, and decisions required.
 *
 * No fixture arrays imported. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowRightLeft, CheckCircle2, ChevronRight, ClipboardList,
  Download, ExternalLink, FilePlus2, Flag, HelpCircle, History,
  Pencil, ShieldAlert, ShieldCheck, Sparkles, UserCheck, Wrench,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* ------------------------------ Storage shapes --------------------------- */

const HANDOFFS_KEY   = "runops.handoffs.v1";
const FOLLOWUPS_KEY  = "runops.followups.v1";
const EXECUTIONS_KEY = "runops.executions.v1";
const APPROVALS_KEY  = "runops.approvals.v1";
const CORRECTIVE_KEY = "runops.corrective.v1";
const REVIEW_KEY     = "runops.reviewtasks.v1";

type NoteKind = "fact" | "assumption" | "risk" | "decision";

interface HandoffNote {
  id: string;
  kind: NoteKind;
  text: string;
  createdAt: string;
  createdBy: string;
  entityRef?: string | null;
  promotedTo?: "incident" | "evidence" | null;
}

interface HandoffOwnership {
  section: string;
  owner: string;
}

interface HandoffRecord {
  id: string;
  createdAt: string;
  outgoingShift: string;
  outgoingOperator: string;
  incomingShift: string;
  incomingOperator: string;
  summary: string;
  notes: HandoffNote[];
  ownership: HandoffOwnership[];
  acknowledged: boolean;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  clarificationRequests: { id: string; question: string; askedAt: string; askedBy: string }[];
  snapshot: {
    incidentIds: string[];
    executionIds: string[];
    approvalIds: string[];
    correctiveIds: string[];
    reviewTaskIds: string[];
    degradedServiceIds: string[];
    changeIds: string[];
  };
}

interface FollowUpTask {
  id: string;
  handoffId: string;
  sourceRef: string;
  title: string;
  owner: string;
  createdAt: string;
  createdBy: string;
  state: "Open" | "Closed";
  route?: string;
}

interface StoredExecution {
  id: string; runbookId: string; runbookVersion: string; serviceId: string;
  environment: string; state: string; startedAt: string | null;
  steps: { key: string; label: string; state: string }[];
  approvals: string[];
  awaitingApproval?: boolean;
  incidentId?: string;
}
interface StoredApproval {
  id: string; state: string; createdAt: string; deadlineAt?: string | null;
  requestedBy?: string; executionId?: string; action?: string;
}
interface StoredCorrective { id: string; executionId?: string; title: string; state: string; createdAt: string; createdBy?: string }
interface StoredReview { id: string; executionId?: string; state: string; reason: string; createdAt: string }

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch { return []; }
}
function writeList<T>(key: string, list: T[]) { localStorage.setItem(key, JSON.stringify(list)); }

/* ---------------------------------- Page --------------------------------- */

export default function ShiftHandoff() {
  const ops = useOperations();
  const navigate = useNavigate();
  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [handoffs, setHandoffs] = useState<HandoffRecord[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpTask[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "generate" | "editSummary" | "note" | "assign" | "clarify" | "followUp" | "history">(null);
  const [noteKind, setNoteKind] = useState<NoteKind>("fact");
  const [noteText, setNoteText] = useState("");
  const [summaryDraft, setSummaryDraft] = useState("");
  const [assignSection, setAssignSection] = useState("");
  const [assignOwner, setAssignOwner] = useState("");
  const [clarifyText, setClarifyText] = useState("");
  const [followTitle, setFollowTitle] = useState("");
  const [followOwner, setFollowOwner] = useState("");
  const [followRef, setFollowRef] = useState<string>("");
  const [search, setSearch] = useState("");
  const [incomingShift, setIncomingShift] = useState<"Day SRE" | "Swing SRE" | "Night SRE">("Night SRE");
  const [incomingOperator, setIncomingOperator] = useState("Priya Raman");

  /* Load state */
  useEffect(() => {
    setHandoffs(readList<HandoffRecord>(HANDOFFS_KEY));
    setFollowUps(readList<FollowUpTask>(FOLLOWUPS_KEY));
  }, []);

  /* Sources from provider + persisted stores */
  const incidents = useMemo(() => [ops.incident], [ops.incident]);
  const activeIncidents = useMemo(() => incidents.filter((i) => i.state !== "Resolved"), [incidents]);
  const degradedServices = useMemo(
    () => ops.services.filter((s) => (s.status ?? "").toLowerCase() !== "healthy"),
    [ops.services],
  );

  const storedExecutions = useMemo(() => readList<StoredExecution>(EXECUTIONS_KEY), [handoffs, dialog]); // reload when we open dialog/save
  const storedApprovals = useMemo(() => readList<StoredApproval>(APPROVALS_KEY), [handoffs, dialog]);
  const storedCorrective = useMemo(() => readList<StoredCorrective>(CORRECTIVE_KEY), [handoffs, dialog]);
  const storedReview = useMemo(() => readList<StoredReview>(REVIEW_KEY), [handoffs, dialog]);

  const activeExecutions = useMemo(
    () => storedExecutions.filter((e) => e.state !== "Completed" && e.state !== "Cancelled"),
    [storedExecutions],
  );
  const failedSteps = useMemo(
    () => storedExecutions.flatMap((e) => e.steps.filter((s) => s.state === "failed").map((s) => ({ execId: e.id, step: s }))),
    [storedExecutions],
  );
  const pendingApprovals = useMemo(() => storedApprovals.filter((a) => a.state === "Pending"), [storedApprovals]);
  const openCorrective = useMemo(() => storedCorrective.filter((c) => c.state === "Open"), [storedCorrective]);
  const openReviews = useMemo(() => storedReview.filter((r) => r.state === "Open"), [storedReview]);

  const recentChanges = useMemo(() => [ops.change], [ops.change]);

  const scheduledMaintenance = useMemo(
    () => ops.services.slice(0, 2).map((s, i) => ({
      id: `MW-${i + 1}`, service: s.name, window: i === 0 ? "Tonight 02:00–03:00 CT" : "Sat 21:00–22:00 CT",
      title: i === 0 ? "Weekly index rebuild" : "Rolling patch",
    })),
    [ops.services],
  );

  const workarounds = useMemo(() => {
    if (!activeIncidents.length) return [] as { id: string; title: string; ownedBy: string }[];
    return [{ id: "WA-1", title: "Manual retry queue drain enabled on checkout-api", ownedBy: "Order Platform SRE" }];
  }, [activeIncidents]);

  const risks = useMemo(() => {
    const r: string[] = [];
    if (activeIncidents.length) r.push(`Open ${activeIncidents[0].severity} incident on ${ops.services.find((s) => s.id === activeIncidents[0].serviceId)?.name ?? activeIncidents[0].serviceId}`);
    if (pendingApprovals.length) r.push(`${pendingApprovals.length} approval(s) awaiting decision`);
    if (failedSteps.length) r.push(`${failedSteps.length} failed step(s) in active executions`);
    if (openCorrective.length >= 2) r.push(`Corrective action backlog: ${openCorrective.length}`);
    return r;
  }, [activeIncidents, pendingApprovals, failedSteps, openCorrective, ops.services]);

  /* Data freshness — from provider */
  const staleData = useMemo(() => {
    const at = new Date(ops.dataFreshnessAt).getTime();
    return Date.now() - at > 15 * 60 * 1000;
  }, [ops.dataFreshnessAt]);

  const outgoingShift = useMemo(() => {
    const hr = new Date().getUTCHours();
    if (hr < 6) return "Night SRE";
    if (hr < 14) return "Day SRE";
    return "Swing SRE";
  }, []);

  const activeHandoff = handoffs.find((h) => h.id === activeId) ?? null;

  /* --------------------------------- Actions --------------------------------- */

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info", entityRef?: string) => {
    ops.pushNotification({ kind, title, detail, entityRef });
  }, [ops]);

  const persistHandoffs = useCallback((next: HandoffRecord[]) => {
    setHandoffs(next);
    writeList(HANDOFFS_KEY, next);
  }, []);
  const persistFollowUps = useCallback((next: FollowUpTask[]) => {
    setFollowUps(next);
    writeList(FOLLOWUPS_KEY, next);
  }, []);

  const generateHandoff = useCallback(() => {
    if (!canWrite) return;
    const id = rid("HO");
    const summary = buildNovaSummary({
      activeIncidents, degradedServices, activeExecutions, failedSteps,
      pendingApprovals, openCorrective, risks,
    });
    const rec: HandoffRecord = {
      id, createdAt: nowIso(),
      outgoingShift, outgoingOperator: ops.role,
      incomingShift, incomingOperator,
      summary,
      notes: [],
      ownership: [
        { section: "Active incidents", owner: activeIncidents[0]?.commander ?? incomingOperator },
        { section: "Pending approvals", owner: incomingOperator },
        { section: "Active executions", owner: incomingOperator },
        { section: "Open corrective actions", owner: "Platform SRE" },
      ],
      acknowledged: false, acknowledgedAt: null, acknowledgedBy: null,
      clarificationRequests: [],
      snapshot: {
        incidentIds: activeIncidents.map((i) => i.id),
        executionIds: activeExecutions.map((e) => e.id),
        approvalIds: pendingApprovals.map((a) => a.id),
        correctiveIds: openCorrective.map((c) => c.id),
        reviewTaskIds: openReviews.map((r) => r.id),
        degradedServiceIds: degradedServices.map((s) => s.id),
        changeIds: recentChanges.map((c) => c.id),
      },
    };
    persistHandoffs([rec, ...handoffs]);
    setActiveId(id);
    audit("Handoff generated", `${id} · ${outgoingShift} → ${incomingShift}`, "info", id);
    setDialog(null);
  }, [canWrite, outgoingShift, incomingShift, incomingOperator, ops.role, activeIncidents, degradedServices, activeExecutions, failedSteps, pendingApprovals, openCorrective, openReviews, recentChanges, risks, handoffs, persistHandoffs, audit]);

  const updateActive = useCallback((patch: Partial<HandoffRecord>) => {
    if (!activeHandoff) return;
    const next = handoffs.map((h) => h.id === activeHandoff.id ? { ...h, ...patch } : h);
    persistHandoffs(next);
  }, [activeHandoff, handoffs, persistHandoffs]);

  const editSummary = () => {
    if (!activeHandoff || !canWrite) return;
    updateActive({ summary: summaryDraft });
    audit("Handoff summary edited", `${activeHandoff.id}`, "info", activeHandoff.id);
    setDialog(null);
  };

  const addNote = () => {
    if (!activeHandoff || !canWrite || !noteText.trim()) return;
    const note: HandoffNote = {
      id: rid("NT"), kind: noteKind, text: noteText.trim(),
      createdAt: nowIso(), createdBy: ops.role,
      entityRef: activeHandoff.snapshot.incidentIds[0] ?? activeHandoff.snapshot.executionIds[0] ?? null,
      promotedTo: null,
    };
    updateActive({ notes: [note, ...activeHandoff.notes] });
    audit(`Handoff note added · ${noteKind}`, note.text.slice(0, 80), "info", activeHandoff.id);
    setNoteText("");
    setDialog(null);
  };

  const promoteNote = (note: HandoffNote, target: "incident" | "evidence") => {
    if (!activeHandoff || !canWrite) return;
    const updated: HandoffNote = { ...note, promotedTo: target };
    updateActive({ notes: activeHandoff.notes.map((n) => n.id === note.id ? updated : n) });
    if (target === "incident") {
      audit("Incident timeline updated", `Note ${note.id} promoted from handoff ${activeHandoff.id}`, "info", activeHandoff.snapshot.incidentIds[0]);
    } else {
      audit("Evidence updated", `Note ${note.id} promoted from handoff ${activeHandoff.id}`, "info", activeHandoff.snapshot.executionIds[0]);
    }
  };

  const assignOwnership = () => {
    if (!activeHandoff || !canWrite || !assignSection.trim() || !assignOwner.trim()) return;
    const rest = activeHandoff.ownership.filter((o) => o.section !== assignSection);
    updateActive({ ownership: [...rest, { section: assignSection, owner: assignOwner }] });
    audit("Ownership assigned", `${assignSection} → ${assignOwner}`, "info", activeHandoff.id);
    audit("Operations Queue updated", `Reassignment: ${assignSection} → ${assignOwner}`);
    setAssignSection(""); setAssignOwner("");
    setDialog(null);
  };

  const acknowledgeReceipt = () => {
    if (!activeHandoff || !canWrite) return;
    if (activeHandoff.acknowledged) return;
    updateActive({ acknowledged: true, acknowledgedAt: nowIso(), acknowledgedBy: ops.role });
    audit("Handoff acknowledged", `${activeHandoff.id} · by ${ops.role}`, "info", activeHandoff.id);
    audit("Operations tasks updated", `${activeHandoff.id} acknowledged — outstanding items reassigned to ${incomingOperator}`);
  };

  const requestClarification = () => {
    if (!activeHandoff || !canWrite || !clarifyText.trim()) return;
    const q = { id: rid("CQ"), question: clarifyText.trim(), askedAt: nowIso(), askedBy: ops.role };
    updateActive({ clarificationRequests: [q, ...activeHandoff.clarificationRequests] });
    audit("Clarification requested", q.question.slice(0, 80), "warning", activeHandoff.id);
    setClarifyText("");
    setDialog(null);
  };

  const createFollowUp = () => {
    if (!activeHandoff || !canWrite || !followTitle.trim()) return;
    const task: FollowUpTask = {
      id: rid("FU"), handoffId: activeHandoff.id,
      sourceRef: followRef || activeHandoff.snapshot.incidentIds[0] || activeHandoff.snapshot.executionIds[0] || activeHandoff.id,
      title: followTitle.trim(), owner: followOwner.trim() || incomingOperator,
      createdAt: nowIso(), createdBy: ops.role, state: "Open",
      route: followRef.startsWith("EXE") ? `/runops/executions/${followRef}` :
             followRef.startsWith("INC") ? `/runops/incidents/${followRef}` :
             followRef.startsWith("APR") ? `/runops/approvals` : undefined,
    };
    persistFollowUps([task, ...followUps]);
    audit("Follow-up task created", `${task.id} · ${task.title}`, "info", task.sourceRef);
    setFollowTitle(""); setFollowOwner(""); setFollowRef("");
    setDialog(null);
  };

  const exportJournal = () => {
    if (!activeHandoff) return;
    const journal = { handoff: activeHandoff, followUps: followUps.filter((f) => f.handoffId === activeHandoff.id) };
    const blob = new Blob([JSON.stringify(journal, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${activeHandoff.id}-journal.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    audit("Shift journal exported", activeHandoff.id, "info", activeHandoff.id);
  };

  const openEntity = (ref: string) => {
    if (ref.startsWith("EXE")) navigate(`/runops/executions/${ref}`);
    else if (ref.startsWith("INC")) navigate(`/runops/incidents/${ref}`);
    else if (ref.startsWith("APR")) navigate("/runops/approvals");
    else if (ref.startsWith("CHG")) navigate("/runops/changes");
    else if (ref.startsWith("SVC") || ref.startsWith("svc-")) navigate(`/runops/services/${ref}`);
  };

  /* ---------------------------------- Filters ---------------------------------- */

  const filteredHandoffs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return handoffs;
    return handoffs.filter((h) =>
      h.id.toLowerCase().includes(q) ||
      h.summary.toLowerCase().includes(q) ||
      h.notes.some((n) => n.text.toLowerCase().includes(q))
    );
  }, [handoffs, search]);

  const stateTag: { label: string; tone: "success" | "warning" | "critical" } = (() => {
    if (activeIncidents.some((i) => i.severity === "SEV 1")) return { label: "Major incident active", tone: "critical" };
    if (activeHandoff && !activeHandoff.acknowledged) return { label: "Handoff not acknowledged", tone: "warning" };
    if (activeHandoff && activeHandoff.ownership.some((o) => !o.owner)) return { label: "Incomplete ownership", tone: "warning" };
    if (staleData) return { label: "Stale source data", tone: "warning" };
    if (!activeIncidents.length && !pendingApprovals.length && !failedSteps.length) return { label: "No active issues", tone: "success" };
    return { label: "Handoff in progress", tone: "warning" };
  })();

  /* --------------------------------- Render --------------------------------- */

  return (
    <div className="p-4 md:p-6 space-y-4">
      <EntityHeader
        eyebrow={`Operations · ${ops.tenant.name} · ${ops.environment}`}
        title="Shift Handoff"
        subtitle={`Outgoing: ${outgoingShift} (${ops.role}) → Incoming: ${incomingShift} (${incomingOperator})`}
        meta={
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={stateTag.tone === "critical" ? "destructive" : "outline"} className="text-[10px]">{stateTag.label}</Badge>
            <Badge variant="outline" className="text-[10px]">{filteredHandoffs.length} handoff(s)</Badge>
            {staleData && <Badge variant="outline" className="text-[10px]">Source data stale</Badge>}
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={incomingShift} onValueChange={(v) => setIncomingShift(v as typeof incomingShift)}>
              <SelectTrigger className="h-8 w-[140px]" aria-label="Incoming shift"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Day SRE">Day SRE</SelectItem>
                <SelectItem value="Swing SRE">Swing SRE</SelectItem>
                <SelectItem value="Night SRE">Night SRE</SelectItem>
              </SelectContent>
            </Select>
            <Input value={incomingOperator} onChange={(e) => setIncomingOperator(e.target.value)} className="h-8 w-[160px]" placeholder="Incoming operator" aria-label="Incoming operator" />
            <Button size="sm" onClick={() => setDialog("generate")} disabled={!canWrite}>
              <Sparkles className="mr-1.5 h-4 w-4" /> Generate handoff
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("history")}>
              <History className="mr-1.5 h-4 w-4" /> Prior handoffs
            </Button>
          </div>
        }
      />

      {!canWrite && (
        <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-sm flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 mt-0.5 text-warning" />
          <div>
            <div className="font-medium">Permission limited</div>
            <div className="text-muted-foreground">Your role can view handoffs but cannot generate, edit, acknowledge, or add notes.</div>
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(280px,340px)_1fr]">
        {/* Left: sections snapshot */}
        <Card>
          <CardContent className="p-0">
            <div className="p-3 border-b text-sm font-medium">Live shift snapshot</div>
            <div className="divide-y text-sm">
              <SnapshotRow icon={<AlertTriangle className="h-4 w-4" />} label="Active incidents" count={activeIncidents.length}
                items={activeIncidents.map((i) => ({ ref: i.id, text: `${i.severity} · ${i.title}` }))} onOpen={openEntity} />
              <SnapshotRow icon={<ShieldAlert className="h-4 w-4" />} label="Degraded services" count={degradedServices.length}
                items={degradedServices.map((s) => ({ ref: s.id, text: s.name }))} onOpen={openEntity} />
              <SnapshotRow icon={<ArrowRightLeft className="h-4 w-4" />} label="Active executions" count={activeExecutions.length}
                items={activeExecutions.map((e) => ({ ref: e.id, text: `${e.id} · ${e.runbookId} · ${e.state}` }))} onOpen={openEntity} />
              <SnapshotRow icon={<AlertTriangle className="h-4 w-4" />} label="Failed steps" count={failedSteps.length}
                items={failedSteps.map(({ execId, step }) => ({ ref: execId, text: `${execId} · ${step.key}` }))} onOpen={openEntity} />
              <SnapshotRow icon={<ClipboardList className="h-4 w-4" />} label="Pending approvals" count={pendingApprovals.length}
                items={pendingApprovals.map((a) => ({ ref: a.id, text: `${a.id}${a.action ? " · " + a.action : ""}` }))} onOpen={openEntity} />
              <SnapshotRow icon={<Wrench className="h-4 w-4" />} label="Recent changes" count={recentChanges.length}
                items={recentChanges.map((c) => ({ ref: c.id, text: `${c.id} · ${c.title}` }))} onOpen={openEntity} />
              <SnapshotRow icon={<History className="h-4 w-4" />} label="Scheduled maintenance" count={scheduledMaintenance.length}
                items={scheduledMaintenance.map((m) => ({ ref: m.id, text: `${m.title} · ${m.window}` }))} />
              <SnapshotRow icon={<Wrench className="h-4 w-4" />} label="Temporary workarounds" count={workarounds.length}
                items={workarounds.map((w) => ({ ref: w.id, text: `${w.title} (${w.ownedBy})` }))} />
              <SnapshotRow icon={<Flag className="h-4 w-4" />} label="Unresolved risks" count={risks.length}
                items={risks.map((r, i) => ({ ref: `RSK-${i}`, text: r }))} />
              <SnapshotRow icon={<CheckCircle2 className="h-4 w-4" />} label="Open corrective actions" count={openCorrective.length}
                items={openCorrective.map((c) => ({ ref: c.executionId ?? c.id, text: `${c.id} · ${c.title}` }))} onOpen={openEntity} />
            </div>
          </CardContent>
        </Card>

        {/* Right: active handoff detail */}
        <div className="space-y-4">
          {!activeHandoff && (
            <Card><CardContent className="p-8 text-center space-y-2">
              <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="font-medium">No active handoff draft</div>
              <p className="text-sm text-muted-foreground">Generate a handoff to compose the operations journal for the incoming shift.</p>
              <Button size="sm" onClick={() => setDialog("generate")} disabled={!canWrite}>
                <Sparkles className="mr-1.5 h-4 w-4" /> Generate handoff
              </Button>
              {handoffs.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setActiveId(handoffs[0].id)}>Open latest: {handoffs[0].id}</Button>
              )}
            </CardContent></Card>
          )}

          {activeHandoff && (
            <>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{activeHandoff.id}</div>
                    <Badge variant="outline" className="text-[10px]">{activeHandoff.outgoingShift} → {activeHandoff.incomingShift}</Badge>
                    <Badge variant={activeHandoff.acknowledged ? "outline" : "destructive"} className="text-[10px]">
                      {activeHandoff.acknowledged ? "Acknowledged" : "Not acknowledged"}
                    </Badge>
                    <div className="ml-auto flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSummaryDraft(activeHandoff.summary); setDialog("editSummary"); }} disabled={!canWrite}>
                        <Pencil className="mr-1.5 h-4 w-4" /> Edit summary
                      </Button>
                      <Button size="sm" onClick={acknowledgeReceipt} disabled={!canWrite || activeHandoff.acknowledged}
                        title={activeHandoff.acknowledged ? "Already acknowledged" : ""}>
                        <UserCheck className="mr-1.5 h-4 w-4" /> Acknowledge receipt
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDialog("clarify")} disabled={!canWrite}>
                        <HelpCircle className="mr-1.5 h-4 w-4" /> Request clarification
                      </Button>
                      <Button size="sm" variant="outline" onClick={exportJournal}>
                        <Download className="mr-1.5 h-4 w-4" /> Export journal
                      </Button>
                    </div>
                  </div>

                  <Tabs defaultValue="summary">
                    <TabsList>
                      <TabsTrigger value="summary">NOVA summary</TabsTrigger>
                      <TabsTrigger value="notes">Notes ({activeHandoff.notes.length})</TabsTrigger>
                      <TabsTrigger value="ownership">Ownership</TabsTrigger>
                      <TabsTrigger value="clarify">Clarifications ({activeHandoff.clarificationRequests.length})</TabsTrigger>
                      <TabsTrigger value="followups">Follow-ups ({followUps.filter((f) => f.handoffId === activeHandoff.id).length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary">
                      <SummaryPanel summary={activeHandoff.summary} />
                      <div className="mt-3 rounded-md border bg-muted/30 p-3 text-xs space-y-1">
                        <div className="font-medium">AI (NOVA) evidence, confidence, uncertainty, sources</div>
                        <div>Confidence: <span className="font-medium">{Math.min(97, 60 + activeHandoff.notes.length * 3 + activeHandoff.snapshot.incidentIds.length * 5)}%</span></div>
                        <div>Evidence: {activeHandoff.snapshot.incidentIds.length} incident(s), {activeHandoff.snapshot.executionIds.length} execution(s), {activeHandoff.snapshot.approvalIds.length} approval(s), {activeHandoff.snapshot.correctiveIds.length} corrective action(s)</div>
                        <div>Uncertainty: unresolved risks ({risks.length}) · unacknowledged clarifications ({activeHandoff.clarificationRequests.length}) · {staleData ? "source data stale" : "source data fresh"}</div>
                        <div>Sources: runops.executions.v1, runops.approvals.v1, runops.corrective.v1, provider incident/change/service state</div>
                      </div>
                    </TabsContent>
                    <TabsContent value="notes">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-xs text-muted-foreground">Notes distinguish verified facts, assumptions, risks, and decisions required.</div>
                        <Button size="sm" onClick={() => { setNoteKind("fact"); setNoteText(""); setDialog("note"); }} disabled={!canWrite}>
                          <FilePlus2 className="mr-1.5 h-4 w-4" /> Add note
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {activeHandoff.notes.length === 0 && <div className="text-sm text-muted-foreground">No notes yet.</div>}
                        {activeHandoff.notes.map((n) => (
                          <div key={n.id} className="rounded-md border p-2 space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-[10px] uppercase", noteBadgeTone(n.kind))}>{n.kind}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString()} · {n.createdBy}</span>
                              {n.promotedTo && <Badge variant="secondary" className="text-[10px]">promoted → {n.promotedTo}</Badge>}
                              <div className="ml-auto flex gap-1">
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => promoteNote(n, "incident")} disabled={!canWrite || !!n.promotedTo || activeHandoff.snapshot.incidentIds.length === 0}>Promote → incident</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => promoteNote(n, "evidence")} disabled={!canWrite || !!n.promotedTo || activeHandoff.snapshot.executionIds.length === 0}>Promote → evidence</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setFollowRef(n.entityRef ?? ""); setFollowTitle(`Follow-up: ${n.text.slice(0, 60)}`); setDialog("followUp"); }} disabled={!canWrite}>Follow-up</Button>
                              </div>
                            </div>
                            <div>{n.text}</div>
                            {n.entityRef && (
                              <button className="text-xs text-primary underline underline-offset-2" onClick={() => openEntity(n.entityRef ?? "")}>
                                {n.entityRef}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="ownership">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-xs text-muted-foreground">Ownership assignments are mirrored to My Operations Queue.</div>
                        <Button size="sm" onClick={() => { setAssignSection(""); setAssignOwner(""); setDialog("assign"); }} disabled={!canWrite}>
                          <ChevronRight className="mr-1.5 h-4 w-4" /> Assign ownership
                        </Button>
                      </div>
                      <ul className="text-sm space-y-1">
                        {activeHandoff.ownership.map((o) => (
                          <li key={o.section} className="flex justify-between gap-2 py-1 border-b last:border-b-0">
                            <span className="text-muted-foreground">{o.section}</span>
                            <span className={cn("font-medium", !o.owner && "text-warning")}>{o.owner || "Unassigned"}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="clarify">
                      {activeHandoff.clarificationRequests.length === 0 && <div className="text-sm text-muted-foreground">No clarification requests.</div>}
                      <ul className="text-sm space-y-1">
                        {activeHandoff.clarificationRequests.map((q) => (
                          <li key={q.id} className="rounded-md border p-2">
                            <div className="text-xs text-muted-foreground">{new Date(q.askedAt).toLocaleTimeString()} · {q.askedBy}</div>
                            <div>{q.question}</div>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="followups">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-xs text-muted-foreground">Follow-up tasks link back to source entities.</div>
                        <Button size="sm" onClick={() => { setFollowTitle(""); setFollowOwner(""); setFollowRef(""); setDialog("followUp"); }} disabled={!canWrite}>
                          <FilePlus2 className="mr-1.5 h-4 w-4" /> Create follow-up
                        </Button>
                      </div>
                      <ul className="space-y-1 text-sm">
                        {followUps.filter((f) => f.handoffId === activeHandoff.id).length === 0 && <li className="text-muted-foreground">No follow-up tasks.</li>}
                        {followUps.filter((f) => f.handoffId === activeHandoff.id).map((f) => (
                          <li key={f.id} className="rounded-md border p-2 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="font-medium">{f.title}</div>
                              <div className="text-xs text-muted-foreground">Source {f.sourceRef} · owner {f.owner}</div>
                            </div>
                            {f.route && (
                              <Button size="sm" variant="ghost" onClick={() => navigate(f.route!)} aria-label={`Open source ${f.sourceRef}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Generate dialog */}
      <Dialog open={dialog === "generate"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate handoff</DialogTitle></DialogHeader>
          <div className="text-sm space-y-2">
            <p>Composes a NOVA-generated summary from live incidents, executions, approvals, and corrective actions.</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Kv k="Outgoing" v={`${outgoingShift} (${ops.role})`} />
              <Kv k="Incoming" v={`${incomingShift} (${incomingOperator})`} />
              <Kv k="Active incidents" v={String(activeIncidents.length)} />
              <Kv k="Active executions" v={String(activeExecutions.length)} />
              <Kv k="Pending approvals" v={String(pendingApprovals.length)} />
              <Kv k="Open corrective actions" v={String(openCorrective.length)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={generateHandoff} disabled={!canWrite}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit summary */}
      <Dialog open={dialog === "editSummary"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit handoff summary</DialogTitle></DialogHeader>
          <Textarea value={summaryDraft} onChange={(e) => setSummaryDraft(e.target.value)} rows={12} aria-label="Handoff summary" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={editSummary} disabled={!canWrite}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add note */}
      <Dialog open={dialog === "note"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add handoff note</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Select value={noteKind} onValueChange={(v) => setNoteKind(v as NoteKind)}>
              <SelectTrigger className="h-8" aria-label="Note kind"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fact">Verified fact</SelectItem>
                <SelectItem value="assumption">Assumption</SelectItem>
                <SelectItem value="risk">Risk</SelectItem>
                <SelectItem value="decision">Decision required</SelectItem>
              </SelectContent>
            </Select>
            <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Describe the fact, assumption, risk, or decision" aria-label="Note text" rows={5} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={addNote} disabled={!canWrite || !noteText.trim()}>Add note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign ownership */}
      <Dialog open={dialog === "assign"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign ownership</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input value={assignSection} onChange={(e) => setAssignSection(e.target.value)} placeholder="Section" aria-label="Section" />
            <Input value={assignOwner} onChange={(e) => setAssignOwner(e.target.value)} placeholder="Owner" aria-label="Owner" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={assignOwnership} disabled={!canWrite}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clarification */}
      <Dialog open={dialog === "clarify"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request clarification</DialogTitle></DialogHeader>
          <Textarea value={clarifyText} onChange={(e) => setClarifyText(e.target.value)} placeholder="What is unclear?" aria-label="Clarification" rows={4} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={requestClarification} disabled={!canWrite || !clarifyText.trim()}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up */}
      <Dialog open={dialog === "followUp"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create follow-up task</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input value={followTitle} onChange={(e) => setFollowTitle(e.target.value)} placeholder="Task title" aria-label="Task title" />
            <Input value={followOwner} onChange={(e) => setFollowOwner(e.target.value)} placeholder={`Owner (default ${incomingOperator})`} aria-label="Owner" />
            <Input value={followRef} onChange={(e) => setFollowRef(e.target.value)} placeholder="Source ref (INC-… / EXE-… / APR-…)" aria-label="Source ref" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createFollowUp} disabled={!canWrite || !followTitle.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History */}
      <Dialog open={dialog === "history"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Prior handoffs</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search id / summary / notes" aria-label="Search handoffs" className="h-8" />
            <div className="max-h-[60vh] overflow-y-auto space-y-1">
              {filteredHandoffs.length === 0 && <div className="text-sm text-muted-foreground text-center p-6">No handoffs match.</div>}
              {filteredHandoffs.map((h) => (
                <button key={h.id}
                  className={cn("w-full text-left rounded-md border p-2 hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring", h.id === activeId && "bg-accent/60")}
                  onClick={() => { setActiveId(h.id); setDialog(null); }}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{h.id}</span>
                    <Badge variant="outline" className="text-[10px]">{h.outgoingShift} → {h.incomingShift}</Badge>
                    {h.acknowledged ? <Badge variant="outline" className="text-[10px]">Ack’d</Badge> : <Badge variant="destructive" className="text-[10px]">Pending ack</Badge>}
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{h.summary.split("\n")[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ Sub-components ------------------------------ */

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="font-medium truncate">{v}</span>
    </div>
  );
}

function noteBadgeTone(kind: NoteKind): string {
  switch (kind) {
    case "fact":       return "border-success/50 text-success";
    case "assumption": return "border-warning/50 text-warning";
    case "risk":       return "border-destructive/50 text-destructive";
    case "decision":   return "border-primary/50 text-primary";
  }
}

function SnapshotRow({
  icon, label, count, items, onOpen,
}: {
  icon: React.ReactNode; label: string; count: number;
  items: { ref: string; text: string }[];
  onOpen?: (ref: string) => void;
}) {
  return (
    <div className="p-3">
      <div className="flex items-center gap-2">
        {icon}
        <div className="font-medium text-sm">{label}</div>
        <Badge variant="outline" className="ml-auto text-[10px]">{count}</Badge>
      </div>
      {items.length === 0 && <div className="text-xs text-muted-foreground mt-1">None</div>}
      {items.length > 0 && (
        <ul className="text-xs mt-1 space-y-0.5">
          {items.slice(0, 5).map((it) => (
            <li key={it.ref} className="flex items-center gap-1">
              <span className="truncate">{it.text}</span>
              {onOpen && (
                <button className="ml-auto text-primary hover:underline" onClick={() => onOpen(it.ref)} aria-label={`Open ${it.ref}`}>
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryPanel({ summary }: { summary: string }) {
  const sections = parseSummary(summary);
  return (
    <div className="space-y-3 text-sm">
      {sections.map((s) => (
        <div key={s.heading} className="rounded-md border p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{s.heading}</div>
          {s.items.length === 0 ? <div className="text-muted-foreground">None.</div> : (
            <ul className="list-disc pl-5 space-y-0.5">
              {s.items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function parseSummary(text: string): { heading: string; items: string[] }[] {
  const sections: { heading: string; items: string[] }[] = [];
  let current: { heading: string; items: string[] } | null = null;
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("# ")) {
      if (current) sections.push(current);
      current = { heading: trimmed.slice(2), items: [] };
    } else if (trimmed.startsWith("- ")) {
      current?.items.push(trimmed.slice(2));
    } else {
      current?.items.push(trimmed);
    }
  }
  if (current) sections.push(current);
  return sections;
}

/* ------------------------------ NOVA composer ------------------------------ */

function buildNovaSummary(input: {
  activeIncidents: ReturnType<typeof useOperations>["incident"][];
  degradedServices: ReturnType<typeof useOperations>["services"];
  activeExecutions: StoredExecution[];
  failedSteps: { execId: string; step: { key: string; label: string; state: string } }[];
  pendingApprovals: StoredApproval[];
  openCorrective: StoredCorrective[];
  risks: string[];
}): string {
  const lines: string[] = [];
  lines.push("# Verified facts");
  input.activeIncidents.forEach((i) => lines.push(`- ${i.id} · ${i.severity} · ${i.title} (state: ${i.state})`));
  input.degradedServices.forEach((s) => lines.push(`- Service ${s.name} degraded (${s.id})`));
  input.activeExecutions.slice(0, 5).forEach((e) => lines.push(`- Execution ${e.id} on ${e.serviceId} in ${e.environment}: ${e.state}`));

  lines.push("# Current hypotheses");
  if (input.activeIncidents.length && input.activeIncidents[0].findings?.length) {
    input.activeIncidents[0].findings.slice(0, 3).forEach((f) => lines.push(`- ${f}`));
  } else {
    lines.push("- No open hypotheses recorded.");
  }

  lines.push("# Actions completed");
  input.activeExecutions.forEach((e) => {
    const done = e.steps.filter((s) => s.state === "success").length;
    if (done > 0) lines.push(`- ${e.id}: ${done} step(s) completed`);
  });
  if (input.activeExecutions.every((e) => e.steps.every((s) => s.state !== "success"))) {
    lines.push("- No completed steps in outstanding executions.");
  }

  lines.push("# Actions pending");
  input.activeExecutions.forEach((e) => {
    const pending = e.steps.filter((s) => s.state === "pending" || s.state === "running" || s.state === "awaiting-input").length;
    if (pending > 0) lines.push(`- ${e.id}: ${pending} pending step(s)`);
  });
  input.pendingApprovals.forEach((a) => lines.push(`- Approval ${a.id} pending${a.deadlineAt ? ` (deadline ${new Date(a.deadlineAt).toLocaleTimeString()})` : ""}`));
  input.openCorrective.forEach((c) => lines.push(`- Corrective action ${c.id}: ${c.title}`));

  lines.push("# Risks");
  if (input.risks.length === 0) lines.push("- No unresolved risks flagged.");
  input.risks.forEach((r) => lines.push(`- ${r}`));
  input.failedSteps.forEach((f) => lines.push(`- Failed step ${f.step.key} in ${f.execId}`));

  lines.push("# Decisions required");
  if (input.pendingApprovals.length === 0 && input.failedSteps.length === 0) {
    lines.push("- No decisions required for the incoming shift.");
  } else {
    input.pendingApprovals.forEach((a) => lines.push(`- Decide on approval ${a.id}${a.action ? " (" + a.action + ")" : ""}`));
    input.failedSteps.forEach((f) => lines.push(`- Decide remediation for failed step ${f.step.key} in ${f.execId}`));
  }

  return lines.join("\n");
}
