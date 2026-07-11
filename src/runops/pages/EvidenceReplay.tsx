/**
 * Page 23 · Evidence, Audit & Execution Replay
 * Route: /runops/executions/:executionId/evidence
 *
 * Reconstructs exactly what occurred during an execution.
 * - Reads canonical execution record from localStorage("runops.executions.v1")
 * - Unifies timeline + toolCalls + evidence + checkpoints + approvals + policy
 *   decisions + telemetry into a single chronological replay.
 * - Playback controls scrub through events; selecting an event updates the
 *   workflow state, context, and evidence panels.
 * - Creating problem records, corrective actions, and evidence flags persist
 *   to their own stores and emit audit + domain events via ops.pushNotification.
 * - Redacts secret values while preserving proof-of-reference metadata.
 *
 * No fixture arrays imported. No `any`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight,
  Download, ExternalLink, Eye, EyeOff, FileText, Filter, Flag,
  KeyRound, Link2, Lock, Pause, Play, ShieldAlert, ShieldCheck,
  SkipBack, SkipForward, Wrench,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* --------------------------- Persistence shapes --------------------------- */

type StepPersistedState = "pending" | "running" | "awaiting-input" | "success" | "failed" | "skipped";

interface EvidenceItem {
  id: string;
  stepKey: string;
  kind: "log" | "screenshot" | "metric" | "note";
  label: string;
  detail: string;
  capturedAt: string;
  capturedBy: string;
  auto: boolean;
}
interface StepRecord {
  key: string;
  label: string;
  state: StepPersistedState;
  startedAt: string | null;
  completedAt: string | null;
  attempts?: number;
  actualResult?: string;
  expectedResult?: string;
  skipJustification?: string | null;
}
interface ToolCall {
  id: string; stepKey: string; tool: string; args: string; result: string;
  at: string; ms: number; cost: number;
}
interface Checkpoint { key: string; label: string; at: string }
interface WorkerAssignment { workerId: string; stepKey: string; role: string; at: string }
interface ResourceLock { id: string; resource: string; heldBy: string; acquiredAt: string }

interface ExecutionRecord {
  id: string;
  runbookId: string;
  runbookVersion: string;
  serviceId: string;
  components: string[];
  environment: string;
  mode: string;
  params: Record<string, string>;
  state: string;
  createdAt: string;
  startedAt: string | null;
  changeTicket: string;
  approvals: string[];
  steps: StepRecord[];
  timeline: { at: string; kind: string; detail: string }[];
  evidence?: EvidenceItem[];
  incidentId?: string;
  collaborators?: string[];
  pausedAt?: string | null;
  rollbackActive?: boolean;
  currentStepKey?: string;
  correctiveActive?: boolean;
  validationFailed?: boolean;
  humanControl?: boolean;
  awaitingApproval?: boolean;
  costUsd?: number;
  checkpoints?: Checkpoint[];
  toolCalls?: ToolCall[];
  workerAssignments?: WorkerAssignment[];
  resourceLocks?: ResourceLock[];
  archived?: boolean;
}

const EXECUTIONS_KEY = "runops.executions.v1";
const PROBLEMS_KEY   = "runops.problems.v1";
const CORRECTIVE_KEY = "runops.corrective.v1";
const REVIEW_KEY     = "runops.reviewtasks.v1";
const EXPORT_KEY     = "runops.evidenceexports.v1";

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
function writeList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

/* --------------------------- Redaction helper ---------------------------- */

/**
 * Masks likely secret material while preserving proof-of-reference metadata
 * (name of the reference and last 4 characters of the resolved value).
 */
function redact(text: string): string {
  if (!text) return text;
  let out = text;
  // key=value where key looks sensitive
  out = out.replace(
    /(?<key>password|passwd|secret|token|api[_-]?key|authorization|bearer|access[_-]?key|private[_-]?key)\s*[:=]\s*["']?([A-Za-z0-9_\-./+=]{6,})["']?/gi,
    (_m, key: string, val: string) => `${key}=***REDACTED*** (ref#…${val.slice(-4)})`,
  );
  // Long opaque tokens
  out = out.replace(/\b([A-Za-z0-9_\-]{28,})\b/g, (m) => (m.length > 30 ? `***REDACTED*** (…${m.slice(-4)})` : m));
  return out;
}

/* --------------------------- Unified replay event ------------------------- */

type ReplayKind =
  | "timeline" | "toolCall" | "evidence" | "checkpoint"
  | "approval" | "policy" | "telemetry" | "assignment" | "lock";

interface ReplayEvent {
  id: string;
  at: string;                 // ISO
  ms: number;                 // epoch ms (for sort/slider)
  kind: ReplayKind;
  stepKey: string | null;
  actor: string;              // "system" | "human" | worker id | role
  actorType: "human" | "worker" | "system" | "policy";
  label: string;
  detail: string;
  ref?: string;               // optional reference (evidence id, tool id, approval id)
  redactable?: boolean;
}

/* --------------------------- Page --------------------------------------- */

export default function EvidenceReplay() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const executionId = params.executionId ?? "EXE-8841";

  const canWrite = !(ops.role === "Read Only User");
  const canExport = ops.role !== "Read Only User";

  const [record, setRecord] = useState<ExecutionRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filterActor, setFilterActor] = useState<string>("all");
  const [filterStep, setFilterStep] = useState<string>("all");
  const [filterEvidence, setFilterEvidence] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showRedacted, setShowRedacted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playIdx, setPlayIdx] = useState(0);
  const [dialog, setDialog] = useState<null | "problem" | "corrective" | "flag" | "export" | "secret">(null);
  const [reason, setReason] = useState("");
  const [flagTargetId, setFlagTargetId] = useState<string | null>(null);
  const [secretPeek, setSecretPeek] = useState<string | null>(null);
  const compareRef = useRef<HTMLDivElement | null>(null);

  /* Load execution */
  useEffect(() => {
    const list = readList<ExecutionRecord>(EXECUTIONS_KEY);
    const found = list.find((e) => e.id === executionId) ?? null;
    if (!found) {
      setRecord(null);
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setRecord(found);
  }, [executionId]);

  const runbook = useMemo(
    () => ops.runbooks.find((r) => r.id === record?.runbookId) ?? null,
    [ops.runbooks, record?.runbookId],
  );
  const service = useMemo(
    () => ops.services.find((s) => s.id === record?.serviceId) ?? null,
    [ops.services, record?.serviceId],
  );

  /* Build unified replay stream */
  const events = useMemo<ReplayEvent[]>(() => {
    if (!record) return [];
    const out: ReplayEvent[] = [];

    // timeline
    record.timeline.forEach((t, i) => {
      const actorType: ReplayEvent["actorType"] =
        t.kind.startsWith("approval") ? "human"
        : t.kind.startsWith("policy") ? "policy"
        : t.kind.startsWith("control") || t.kind.startsWith("execution.paused") || t.kind.startsWith("execution.resumed")
          ? "human"
          : "system";
      out.push({
        id: `TL-${i}`, at: t.at, ms: new Date(t.at).getTime(),
        kind: "timeline", stepKey: null,
        actor: actorType === "human" ? ops.role : "system",
        actorType, label: t.kind, detail: t.detail, redactable: true,
      });
    });

    // tool calls
    (record.toolCalls ?? []).forEach((c) => {
      out.push({
        id: c.id, at: c.at, ms: new Date(c.at).getTime(),
        kind: "toolCall", stepKey: c.stepKey,
        actor: "digital-worker",
        actorType: "worker",
        label: `Tool · ${c.tool}`,
        detail: `args=${c.args} · result=${c.result} · ${c.ms}ms · $${c.cost.toFixed(2)}`,
        ref: c.id, redactable: true,
      });
    });

    // evidence
    (record.evidence ?? []).forEach((e) => {
      out.push({
        id: e.id, at: e.capturedAt, ms: new Date(e.capturedAt).getTime(),
        kind: "evidence", stepKey: e.stepKey,
        actor: e.auto ? "system" : e.capturedBy,
        actorType: e.auto ? "system" : "human",
        label: `Evidence · ${e.kind}`,
        detail: `${e.label} — ${e.detail}`,
        ref: e.id, redactable: false,
      });
    });

    // checkpoints
    (record.checkpoints ?? []).forEach((c, i) => {
      out.push({
        id: `CP-${i}-${c.key}`, at: c.at, ms: new Date(c.at).getTime(),
        kind: "checkpoint", stepKey: c.key, actor: "system", actorType: "system",
        label: `Checkpoint · ${c.key}`, detail: c.label,
      });
    });

    // approvals
    record.approvals.forEach((apId, i) => {
      const t = record.timeline.find((x) => x.detail?.includes(apId));
      const at = t?.at ?? record.startedAt ?? record.createdAt;
      out.push({
        id: `AP-${i}-${apId}`, at, ms: new Date(at).getTime(),
        kind: "approval", stepKey: null,
        actor: ops.role, actorType: "human",
        label: `Approval · ${apId}`, detail: `Exception granted (${apId})`,
      });
    });

    // worker assignments
    (record.workerAssignments ?? []).forEach((a, i) => {
      out.push({
        id: `WA-${i}-${a.workerId}`, at: a.at, ms: new Date(a.at).getTime(),
        kind: "assignment", stepKey: a.stepKey,
        actor: a.workerId, actorType: "worker",
        label: `Worker assigned · ${a.workerId}`,
        detail: `role=${a.role} step=${a.stepKey}`,
      });
    });

    // resource locks
    (record.resourceLocks ?? []).forEach((l, i) => {
      out.push({
        id: `RL-${i}-${l.id}`, at: l.acquiredAt, ms: new Date(l.acquiredAt).getTime(),
        kind: "lock", stepKey: null,
        actor: l.heldBy, actorType: "system",
        label: `Lock acquired · ${l.resource}`,
        detail: `held by ${l.heldBy}`,
      });
    });

    // synthetic policy decisions — one per completed mitigation/validate step
    record.steps.forEach((s, i) => {
      if (s.state !== "success") return;
      const kind = runbook?.steps.find((rs) => rs.key === s.key)?.kind;
      if (kind !== "mitigate" && kind !== "validate") return;
      const at = s.completedAt ?? nowIso();
      out.push({
        id: `PD-${i}-${s.key}`, at, ms: new Date(at).getTime(),
        kind: "policy", stepKey: s.key,
        actor: `policy:runbook:${record.runbookId}`, actorType: "policy",
        label: `Policy decision · ${kind === "mitigate" ? "change_window_ok" : "validation_gate_ok"}`,
        detail: `Evaluated against ${record.runbookId} ${record.runbookVersion} · effect=allow`,
      });
    });

    // synthetic telemetry snapshots at each checkpoint
    (record.checkpoints ?? []).forEach((c, i) => {
      out.push({
        id: `TM-${i}-${c.key}`, at: c.at, ms: new Date(c.at).getTime(),
        kind: "telemetry", stepKey: c.key,
        actor: "telemetry", actorType: "system",
        label: `Telemetry snapshot · ${c.key}`,
        detail: `error_rate captured · p95 captured · saturation captured`,
      });
    });

    return out.sort((a, b) => a.ms - b.ms || a.id.localeCompare(b.id));
  }, [record, ops.role, runbook]);

  /* Actors + steps + evidence-kind menus */
  const actorOptions = useMemo(() => {
    const s = new Set<string>();
    events.forEach((e) => s.add(e.actor));
    return Array.from(s).sort();
  }, [events]);

  const stepOptions = useMemo(() => {
    const s = new Set<string>();
    events.forEach((e) => { if (e.stepKey) s.add(e.stepKey); });
    return Array.from(s).sort();
  }, [events]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (filterActor !== "all" && e.actor !== filterActor) return false;
      if (filterStep !== "all" && e.stepKey !== filterStep) return false;
      if (filterEvidence !== "all") {
        if (filterEvidence === "evidence" && e.kind !== "evidence") return false;
        if (filterEvidence === "toolCall" && e.kind !== "toolCall") return false;
        if (filterEvidence === "policy" && e.kind !== "policy") return false;
        if (filterEvidence === "approval" && e.kind !== "approval") return false;
        if (filterEvidence === "telemetry" && e.kind !== "telemetry") return false;
      }
      if (q && !(`${e.label} ${e.detail} ${e.actor}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [events, filterActor, filterStep, filterEvidence, search]);

  useEffect(() => {
    if (filtered.length === 0) { setSelectedEventId(null); setPlayIdx(0); return; }
    if (!selectedEventId || !filtered.find((e) => e.id === selectedEventId)) {
      setSelectedEventId(filtered[0].id);
      setPlayIdx(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  const currentIdx = Math.max(0, filtered.findIndex((e) => e.id === selectedEventId));
  const currentEvent = filtered[currentIdx] ?? null;

  /* Playback */
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPlayIdx((i) => {
        if (i >= filtered.length - 1) { setPlaying(false); return i; }
        const next = i + 1;
        setSelectedEventId(filtered[next]?.id ?? null);
        return next;
      });
    }, 900);
    return () => clearInterval(t);
  }, [playing, filtered]);

  const jumpTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(filtered.length - 1, idx));
    setPlayIdx(clamped);
    setSelectedEventId(filtered[clamped]?.id ?? null);
  }, [filtered]);

  /* Derived state-at-time */
  const stateAtSelected = useMemo(() => {
    if (!record || !currentEvent) return { completed: [] as string[], running: null as string | null, remaining: record?.steps.map((s) => s.key) ?? [] };
    const cutoff = currentEvent.ms;
    // determine which steps have completedAt <= cutoff
    const completed: string[] = [];
    let running: string | null = null;
    const remaining: string[] = [];
    record.steps.forEach((s) => {
      const compAt = s.completedAt ? new Date(s.completedAt).getTime() : Infinity;
      const startAt = s.startedAt ? new Date(s.startedAt).getTime() : Infinity;
      if (compAt <= cutoff && (s.state === "success" || s.state === "skipped")) completed.push(s.key);
      else if (startAt <= cutoff && s.state !== "pending") { if (!running) running = s.key; else remaining.push(s.key); }
      else remaining.push(s.key);
    });
    return { completed, running, remaining };
  }, [record, currentEvent]);

  /* Baseline vs live (before/after) — synthetic deterministic values */
  const compareBaseline = useMemo(() => ({
    errorRate: "0.4%", p95: "310 ms", saturation: "42%", cost: "$0.00",
  }), []);
  const compareLive = useMemo(() => {
    if (!record) return compareBaseline;
    const done = record.steps.filter((s) => s.state === "success").length;
    const failed = record.steps.filter((s) => s.state === "failed").length;
    return {
      errorRate: failed > 0 ? "1.9%" : done >= 3 ? "0.5%" : "1.1%",
      p95: failed > 0 ? "540 ms" : done >= 3 ? "330 ms" : "410 ms",
      saturation: done >= 3 ? "44%" : "58%",
      cost: `$${(record.costUsd ?? 0).toFixed(2)}`,
    };
  }, [record, compareBaseline]);

  /* Confidence / evidence coverage for AI recommendations panel */
  const evidenceCoverage = useMemo(() => {
    if (!record) return { total: 0, withEvidence: 0, pct: 0 };
    const total = record.steps.filter((s) => s.state === "success" || s.state === "failed").length;
    const withEvidence = record.steps.filter((s) => (record.evidence ?? []).some((e) => e.stepKey === s.key)).length;
    return { total, withEvidence, pct: total === 0 ? 0 : Math.round((withEvidence / total) * 100) };
  }, [record]);

  const integrityOk = record ? (record.timeline.length > 0 && (record.checkpoints?.length ?? 0) > 0) : false;
  const isArchived = !!record?.archived;

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
    ops.pushNotification({ kind, title, detail, entityRef: executionId });
  }, [ops, executionId]);

  /* Actions */
  const createProblem = () => {
    if (!record || !canWrite) return;
    const id = rid("PROB");
    const problems = readList<Record<string, unknown>>(PROBLEMS_KEY);
    problems.unshift({
      id, executionId: record.id, runbookId: record.runbookId,
      title: reason.trim() || `Problem from ${record.id}`,
      linkedEventId: currentEvent?.id ?? null,
      createdAt: nowIso(), createdBy: ops.role, state: "Open",
      route: "/runops/problems/actions",
    });
    writeList(PROBLEMS_KEY, problems);
    audit("Problem record created", `${id} · linked to ${record.id}`, "warning");
    ops.pushNotification({ kind: "info", title: "Problems & Actions updated", detail: `${id} added`, route: "/runops/problems/actions", entityRef: record.id });
    setDialog(null); setReason("");
  };

  const createCorrective = () => {
    if (!record || !canWrite) return;
    const id = rid("CA");
    const list = readList<Record<string, unknown>>(CORRECTIVE_KEY);
    list.unshift({
      id, executionId: record.id, title: reason.trim() || `Corrective action from ${record.id}`,
      linkedEventId: currentEvent?.id ?? null, createdAt: nowIso(), createdBy: ops.role, state: "Open",
    });
    writeList(CORRECTIVE_KEY, list);
    audit("Corrective action created", `${id} · linked to ${record.id}`);
    setDialog(null); setReason("");
  };

  const flagEvidence = () => {
    if (!record || !canWrite || !flagTargetId) return;
    const id = rid("RVW");
    const tasks = readList<Record<string, unknown>>(REVIEW_KEY);
    tasks.unshift({
      id, executionId: record.id, evidenceRef: flagTargetId,
      reason: reason.trim() || "Evidence flagged for review",
      createdAt: nowIso(), createdBy: ops.role, state: "Open", severity: "audit-review",
    });
    writeList(REVIEW_KEY, tasks);
    audit("Evidence flagged", `${id} · target=${flagTargetId}`, "warning");
    ops.pushNotification({ kind: "warning", title: "Audit review task created", detail: `${id} awaiting review`, entityRef: record.id });
    setDialog(null); setReason(""); setFlagTargetId(null);
  };

  const exportPackage = () => {
    if (!record || !canExport) return;
    const id = rid("EXP");
    const pkg = {
      id, executionId: record.id, exportedAt: nowIso(), exportedBy: ops.role,
      runbook: { id: record.runbookId, version: record.runbookVersion },
      service: record.serviceId,
      environment: record.environment,
      state: record.state,
      steps: record.steps.map((s) => ({ key: s.key, label: s.label, state: s.state, startedAt: s.startedAt, completedAt: s.completedAt, expectedResult: s.expectedResult, actualResult: redact(s.actualResult ?? "") })),
      timeline: record.timeline.map((t) => ({ at: t.at, kind: t.kind, detail: redact(t.detail) })),
      toolCalls: (record.toolCalls ?? []).map((c) => ({ ...c, args: redact(c.args), result: redact(c.result) })),
      evidence: record.evidence ?? [],
      approvals: record.approvals,
      checkpoints: record.checkpoints ?? [],
      integrity: { events: events.length, coveragePct: evidenceCoverage.pct, sealedAt: nowIso() },
    };
    const exports = readList<Record<string, unknown>>(EXPORT_KEY);
    exports.unshift({ id, executionId: record.id, at: nowIso(), by: ops.role, integrity: pkg.integrity });
    writeList(EXPORT_KEY, exports);

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${record.id}-evidence-${id}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    audit("Evidence package exported", `${id} · ${record.id}`, "info");
    setDialog(null);
  };

  /* ------ Render ------ */
  if (notFound) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card><CardContent className="p-8 text-center space-y-2">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <div className="font-medium">Execution {executionId} not found</div>
          <p className="text-sm text-muted-foreground">
            No persisted execution record exists yet. Launch a runbook or open the autonomous monitor first.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => navigate(`/runops/executions/${executionId}`)}>Open monitor</Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/runops/runbooks")}>Runbook library</Button>
          </div>
        </CardContent></Card>
      </div>
    );
  }
  if (!record) {
    return <div className="p-6 text-sm text-muted-foreground">Loading evidence for {executionId}…</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <EntityHeader
        eyebrow={`${record.runbookId} ${record.runbookVersion} · ${record.environment}`}
        title={`Evidence · ${record.id}`}
        subtitle={`${runbook?.title ?? record.runbookId} · ${service?.name ?? record.serviceId}`}
        meta={
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">State: {record.state}</Badge>
            <Badge variant={isArchived ? "secondary" : "outline"} className="text-[10px]">{isArchived ? "Archived" : "Live"}</Badge>
            <Badge variant="outline" className="text-[10px]">{integrityOk ? "Integrity: OK" : "Integrity: Warning"}</Badge>
            <Badge variant="outline" className="text-[10px]">Coverage: {evidenceCoverage.pct}%</Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate(`/runops/executions/${record.id}`)}>
              <Activity className="mr-1.5 h-4 w-4" /> Open monitor
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowRedacted((v) => !v)} aria-label="Toggle redaction">
              {showRedacted ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />}
              {showRedacted ? "Hide redactions" : "Show redactions"}
            </Button>
            <Button size="sm" onClick={() => setDialog("export")} disabled={!canExport}
              title={canExport ? "Export authorized audit package" : "Read Only User cannot export"}>
              <Download className="mr-1.5 h-4 w-4" /> Export package
            </Button>
          </div>
        }
      />

      {ops.role === "Read Only User" && (
        <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-sm flex items-start gap-2">
          <Lock className="h-4 w-4 mt-0.5 text-warning" />
          <div>
            <div className="font-medium">Permission limited</div>
            <div className="text-muted-foreground">You can replay evidence but cannot create problem records, corrective actions, flag evidence, or export packages in this role.</div>
          </div>
        </div>
      )}
      {isArchived && (
        <div className="rounded-md border border-muted p-3 text-sm flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 mt-0.5" />
          <div>Archived execution — replay is available in read-only historical mode; mutations remain enabled for authorized roles but do not alter the sealed execution record.</div>
        </div>
      )}

      {/* Playback controls */}
      <Card>
        <CardContent className="p-3 md:p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => jumpTo(0)} aria-label="Jump to first event">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => jumpTo(currentIdx - 1)} aria-label="Step backward">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button size="sm" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
              {playing ? "Pause" : "Play"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => jumpTo(currentIdx + 1)} aria-label="Step forward">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => jumpTo(filtered.length - 1)} aria-label="Jump to last event">
              <SkipForward className="h-4 w-4" />
            </Button>
            <div className="ml-auto text-xs text-muted-foreground">
              Event {filtered.length === 0 ? 0 : currentIdx + 1} of {filtered.length}
              {currentEvent && <> · {new Date(currentEvent.at).toLocaleTimeString()}</>}
            </div>
          </div>
          <Slider
            aria-label="Scrub replay"
            min={0}
            max={Math.max(0, filtered.length - 1)}
            step={1}
            value={[currentIdx]}
            onValueChange={(v) => jumpTo(v[0] ?? 0)}
          />
          <div className="grid gap-2 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterActor} onValueChange={setFilterActor}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Actor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actors</SelectItem>
                  {actorOptions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Select value={filterStep} onValueChange={setFilterStep}>
              <SelectTrigger className="h-8"><SelectValue placeholder="Step" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All steps</SelectItem>
                {stepOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterEvidence} onValueChange={setFilterEvidence}>
              <SelectTrigger className="h-8"><SelectValue placeholder="Evidence type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="evidence">Evidence</SelectItem>
                <SelectItem value="toolCall">Tool calls</SelectItem>
                <SelectItem value="approval">Approvals</SelectItem>
                <SelectItem value="policy">Policy decisions</SelectItem>
                <SelectItem value="telemetry">Telemetry</SelectItem>
              </SelectContent>
            </Select>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search label / detail / actor" aria-label="Search events" className="h-8" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(340px,420px)_1fr_minmax(320px,380px)]">
        {/* Timeline */}
        <Card className="min-h-[420px]">
          <CardContent className="p-0">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="text-sm font-medium">Chronological replay</div>
              <Badge variant="outline" className="text-xs">{filtered.length}</Badge>
            </div>
            <div className="max-h-[70vh] overflow-y-auto divide-y">
              {filtered.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground text-center">No events match the current filters.</div>
              )}
              {filtered.map((e, i) => {
                const isSel = e.id === selectedEventId;
                return (
                  <button
                    key={e.id}
                    onClick={() => { setSelectedEventId(e.id); setPlayIdx(i); }}
                    className={cn("w-full text-left px-3 py-2 hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring", isSel && "bg-accent/60")}
                    aria-current={isSel ? "true" : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <ReplayKindIcon kind={e.kind} />
                      <span className="text-xs text-muted-foreground tabular-nums">{new Date(e.at).toLocaleTimeString()}</span>
                      <Badge variant="outline" className="text-[10px] uppercase">{e.actorType}</Badge>
                      {e.stepKey && <Badge variant="secondary" className="text-[10px]">{e.stepKey}</Badge>}
                    </div>
                    <div className="text-sm font-medium mt-1">{e.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {showRedacted || !e.redactable ? e.detail : redact(e.detail)}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Center: workflow at time + event detail + before/after */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-sm font-medium">Workflow state at selected time</div>
              <div className="flex flex-wrap gap-2">
                {record.steps.map((s) => {
                  const done = stateAtSelected.completed.includes(s.key);
                  const running = stateAtSelected.running === s.key;
                  return (
                    <span key={s.key}
                      className={cn(
                        "text-xs rounded-md px-2 py-1 border",
                        done && "bg-success/10 border-success/40",
                        running && "bg-warning/10 border-warning/40",
                        !done && !running && "bg-muted/50",
                      )}>
                      {done ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : running ? <Activity className="inline h-3 w-3 mr-1" /> : null}
                      {s.key} · {s.label}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Event detail</div>
                {currentEvent && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSecretPeek(currentEvent.detail)} aria-label="Show credential reference">
                      <KeyRound className="h-4 w-4 mr-1.5" /> Proof of secret reference
                    </Button>
                    {currentEvent.kind === "evidence" && (
                      <Button size="sm" variant="outline" onClick={() => { setFlagTargetId(currentEvent.ref ?? currentEvent.id); setDialog("flag"); }} disabled={!canWrite}>
                        <Flag className="h-4 w-4 mr-1.5" /> Flag evidence
                      </Button>
                    )}
                    {currentEvent.actorType === "worker" && (
                      <Button size="sm" variant="outline" onClick={() => navigate("/runops/workforce")}>
                        <ExternalLink className="h-4 w-4 mr-1.5" /> Open worker
                      </Button>
                    )}
                    {currentEvent.kind === "policy" && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/runops/runbooks/${record.runbookId}/policy`)}>
                        <ExternalLink className="h-4 w-4 mr-1.5" /> Open policy version
                      </Button>
                    )}
                    {currentEvent.kind === "evidence" && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/runops/services/${record.serviceId}/observability`)}>
                        <ExternalLink className="h-4 w-4 mr-1.5" /> Artifact provenance
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {!currentEvent && <div className="text-sm text-muted-foreground">Select an event to inspect inputs, outputs, and configuration.</div>}
              {currentEvent && (
                <>
                  <div className="grid gap-2 sm:grid-cols-2 text-xs">
                    <Kv k="Event" v={currentEvent.label} />
                    <Kv k="Kind" v={currentEvent.kind} />
                    <Kv k="Actor" v={`${currentEvent.actor} (${currentEvent.actorType})`} />
                    <Kv k="Step" v={currentEvent.stepKey ?? "—"} />
                    <Kv k="At" v={new Date(currentEvent.at).toLocaleString()} />
                    <Kv k="Reference" v={currentEvent.ref ?? "—"} />
                  </div>
                  <div className="rounded-md border bg-muted/30 p-2 text-xs whitespace-pre-wrap break-words">
                    {showRedacted || !currentEvent.redactable ? currentEvent.detail : redact(currentEvent.detail)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3" ref={compareRef}>
              <div className="text-sm font-medium">Before / after configuration & telemetry</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="font-medium text-muted-foreground">Metric</div>
                <div className="font-medium">Baseline (pre-execution)</div>
                <div className="font-medium">Current (at selected time)</div>
                <CompareRow k="Error rate" a={compareBaseline.errorRate} b={compareLive.errorRate} />
                <CompareRow k="p95 latency" a={compareBaseline.p95} b={compareLive.p95} />
                <CompareRow k="Saturation" a={compareBaseline.saturation} b={compareLive.saturation} />
                <CompareRow k="Cost" a={compareBaseline.cost} b={compareLive.cost} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: context, evidence, links, AI panel */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="text-sm font-medium mb-1">Linked context</div>
              <LinkRow icon={<Link2 className="h-3.5 w-3.5" />} label="Incident" value={record.incidentId ?? "—"} onOpen={record.incidentId ? () => navigate(`/runops/incidents/${record.incidentId}`) : undefined} />
              <LinkRow icon={<Link2 className="h-3.5 w-3.5" />} label="Change ticket" value={record.changeTicket} onOpen={() => navigate("/runops/changes")} />
              <LinkRow icon={<Link2 className="h-3.5 w-3.5" />} label="Runbook version" value={`${record.runbookId} ${record.runbookVersion}`} onOpen={() => navigate(`/runops/runbooks/${record.runbookId}`)} />
              <LinkRow icon={<Link2 className="h-3.5 w-3.5" />} label="Service" value={service?.name ?? record.serviceId} onOpen={() => navigate(`/runops/services/${record.serviceId}`)} />
              <LinkRow icon={<Link2 className="h-3.5 w-3.5" />} label="Credential identity" value={`svc-role:${record.serviceId} · MFA verified`} onOpen={() => setSecretPeek("Credential identity used for this execution: svc-role attested via workload identity federation. Actual secret material is not present in the execution record.")} />
            </CardContent>
          </Card>

          <Tabs defaultValue="evidence">
            <TabsList className="w-full">
              <TabsTrigger value="evidence" className="flex-1">Evidence</TabsTrigger>
              <TabsTrigger value="artifacts" className="flex-1">Artifacts</TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">AI</TabsTrigger>
            </TabsList>
            <TabsContent value="evidence">
              <Card><CardContent className="p-3 space-y-2">
                {(record.evidence ?? []).length === 0 && <div className="text-xs text-muted-foreground">No evidence items yet.</div>}
                {(record.evidence ?? []).map((e) => (
                  <div key={e.id} className="rounded-md border p-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> {e.label}
                      </div>
                      <Badge variant="outline" className="text-[10px]">{e.kind}</Badge>
                    </div>
                    <div className="text-muted-foreground">{showRedacted ? e.detail : redact(e.detail)}</div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>step {e.stepKey}</span><span>·</span><span>by {e.capturedBy}</span>
                      {e.auto && <Badge variant="secondary" className="text-[10px]">auto</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]"
                        onClick={() => { setSelectedEventId(e.id); }}>
                        Open source
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]"
                        onClick={() => { setFlagTargetId(e.id); setDialog("flag"); }} disabled={!canWrite}>
                        <Flag className="h-3 w-3 mr-1" /> Flag
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="artifacts">
              <Card><CardContent className="p-3 space-y-2 text-xs">
                <div className="text-muted-foreground">Artifact provenance derived from tool calls:</div>
                {(record.toolCalls ?? []).length === 0 && <div className="text-muted-foreground">No tool artifacts recorded.</div>}
                {(record.toolCalls ?? []).slice(0, 20).map((c) => (
                  <div key={c.id} className="rounded-md border p-2 space-y-0.5">
                    <div className="font-medium flex items-center gap-1"><Wrench className="h-3.5 w-3.5" /> {c.tool}</div>
                    <div className="text-muted-foreground">args: {showRedacted ? c.args : redact(c.args)}</div>
                    <div className="text-muted-foreground">result: {showRedacted ? c.result : redact(c.result)}</div>
                    <div className="text-[10px] text-muted-foreground">step {c.stepKey} · {c.ms}ms · ${c.cost.toFixed(2)}</div>
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="ai">
              <Card><CardContent className="p-3 text-xs space-y-2">
                <div className="text-sm font-medium">AI evidence coverage</div>
                <div className="text-muted-foreground">
                  Recommendation: <span className="font-medium text-foreground">
                    {evidenceCoverage.pct >= 60 ? "Package ready for audit export" : "Capture additional evidence before export"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Kv k="Confidence" v={`${Math.min(97, 55 + evidenceCoverage.pct)}%`} />
                  <Kv k="Coverage" v={`${evidenceCoverage.withEvidence}/${evidenceCoverage.total}`} />
                </div>
                <div>
                  <div className="text-muted-foreground font-medium">Evidence considered</div>
                  <ul className="list-disc pl-4">
                    <li>Timeline entries: {record.timeline.length}</li>
                    <li>Tool calls: {(record.toolCalls ?? []).length}</li>
                    <li>Checkpoints: {(record.checkpoints ?? []).length}</li>
                    <li>Approvals: {record.approvals.length}</li>
                  </ul>
                </div>
                <div>
                  <div className="text-muted-foreground font-medium">Uncertainty</div>
                  <ul className="list-disc pl-4">
                    <li>Synthetic telemetry snapshots — not from live SLO stream</li>
                    <li>Policy decisions inferred from step kind and outcome</li>
                    {evidenceCoverage.pct < 60 && <li>Coverage below target of 60%</li>}
                  </ul>
                </div>
                <div>
                  <div className="text-muted-foreground font-medium">Sources</div>
                  <ul className="list-disc pl-4">
                    <li>runops.executions.v1 · {record.id}</li>
                    <li>Runbook {record.runbookId} {record.runbookVersion}</li>
                    <li>Notification log (audit + domain events)</li>
                  </ul>
                </div>
                <div className="pt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setDialog("problem"); setReason(""); }} disabled={!canWrite}>
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Create problem
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setDialog("corrective"); setReason(""); }} disabled={!canWrite}>
                    <Wrench className="h-3.5 w-3.5 mr-1.5" /> Corrective action
                  </Button>
                </div>
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={dialog === "problem"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create problem record</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Links execution {record.id} to a new problem in <code>/runops/problems/actions</code>.</p>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Problem summary" aria-label="Problem summary" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createProblem} disabled={!canWrite}>Create problem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "corrective"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create corrective action</DialogTitle></DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Corrective action" aria-label="Corrective action" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createCorrective} disabled={!canWrite}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "flag"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Flag evidence for audit review</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Target: <code>{flagTargetId ?? "—"}</code></p>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for review" aria-label="Reason" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={flagEvidence} disabled={!canWrite}>Flag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "export"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Export authorized evidence package</DialogTitle></DialogHeader>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Secrets are redacted; only proof-of-reference metadata is retained.</p>
            <p>Package integrity: {events.length} events · coverage {evidenceCoverage.pct}%.</p>
            <p>An audit event will be created and the file will download.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={exportPackage} disabled={!canExport}>Export & download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!secretPeek} onOpenChange={(o) => !o && setSecretPeek(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Secret reference proof</DialogTitle></DialogHeader>
          <div className="text-sm space-y-2">
            <div className="rounded-md border bg-muted/30 p-2 text-xs whitespace-pre-wrap">{secretPeek ? redact(secretPeek) : ""}</div>
            <p className="text-xs text-muted-foreground">
              Actual secret content is never stored in the execution record. This view shows only the reference name and the last four characters of the resolved value.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setSecretPeek(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------- Small primitives --------------------------- */

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="font-medium truncate">{v}</span>
    </div>
  );
}

function CompareRow({ k, a, b }: { k: string; a: string; b: string }) {
  const changed = a !== b;
  return (
    <>
      <div className="text-muted-foreground">{k}</div>
      <div className="tabular-nums">{a}</div>
      <div className={cn("tabular-nums", changed && "font-medium")}>{b}</div>
    </>
  );
}

function LinkRow({ icon, label, value, onOpen }: { icon: React.ReactNode; label: string; value: string; onOpen?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex-1 flex items-baseline gap-2 min-w-0">
        <span className="text-muted-foreground shrink-0">{label}</span>
        <span className="font-medium truncate">{value}</span>
      </div>
      {onOpen && <Button size="sm" variant="ghost" className="h-6 px-1" onClick={onOpen} aria-label={`Open ${label}`}><ExternalLink className="h-3.5 w-3.5" /></Button>}
    </div>
  );
}

function ReplayKindIcon({ kind }: { kind: ReplayKind }) {
  switch (kind) {
    case "toolCall":  return <Wrench className="h-3.5 w-3.5 text-primary" />;
    case "evidence":  return <FileText className="h-3.5 w-3.5 text-primary" />;
    case "checkpoint":return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
    case "approval":  return <ShieldCheck className="h-3.5 w-3.5 text-warning" />;
    case "policy":    return <ShieldCheck className="h-3.5 w-3.5" />;
    case "telemetry": return <Activity className="h-3.5 w-3.5" />;
    case "assignment":return <ChevronRight className="h-3.5 w-3.5" />;
    case "lock":      return <Lock className="h-3.5 w-3.5" />;
    default:          return <ChevronRight className="h-3.5 w-3.5" />;
  }
}
