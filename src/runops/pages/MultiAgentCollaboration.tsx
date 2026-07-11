/**
 * Page 36 · Multi-Agent Collaboration and Agent Trust
 * Route: /runops/workers/collaboration/:sessionId
 *
 * Renders the coordinated activity of a multi-worker incident session:
 * task graph, message/evidence stream, assignments, tool calls,
 * disagreements, validator reviews, human interventions, cost/latency/
 * calibration, and safety events.
 *
 * Canonical session: COL-INC-10482 (attached to INC-10482 / EXE-8841 /
 * RB-0042). Enforces planner/executor/validator separation and never
 * forces artificial consensus.
 *
 * Persistence (localStorage):
 *   runops.collab.sessions.v1          → SessionRecord[]
 *   runops.collab.events.v1            → Event[] (per session)
 *   runops.collab.tasks.v1             → Task[]
 *   runops.collab.disagreements.v1     → Disagreement[]
 *   runops.collab.interventions.v1     → HumanIntervention[]
 *   runops.digitalworkers.v1           → catalog (pause updates status)
 *   runops.workersessions.v1           → active-session mirror
 *   runops.incidents.timeline.v1       → cross-screen findings
 *   runops.hypothesisgraph.v1          → cross-screen hypotheses
 *   runops.evidencereplay.v1           → replay entries
 *   runops.aigovernance.evals.v1       → safety/tool-failure events
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity, AlertOctagon, AlertTriangle, ArrowLeft, Bot, CheckCircle2,
  Download, ExternalLink, FileSearch, Flag, GitBranch, Handshake, Layers,
  MessageSquare, Pause, PlayCircle, Rewind, ShieldAlert, ShieldCheck,
  SplitSquareHorizontal, StopCircle, User, Wrench,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* --------------------------------- Types -------------------------------- */

type WorkerRole =
  | "Planner"      // Incident Commander (planner)
  | "Executor"    // App/DB/Net SRE, Change Risk, Comms
  | "Validator"   // Execution Validator
  | "Human";      // Human IC

type SessionState =
  | "Active"
  | "Awaiting Human"
  | "Worker Disagreement"
  | "Tool Failure"
  | "Low Confidence"
  | "Terminated"
  | "Completed";

interface Participant {
  id: string;
  role: WorkerRole;
  label: string;   // domain role label
  workerRef: string; // link into catalog
  status: "Active" | "Paused" | "Halted";
}

type EventKind =
  | "message"       // conversational message
  | "assignment"    // task assigned to worker
  | "handoff"       // evidence handoff
  | "tool"          // tool call
  | "tool_error"
  | "disagreement"
  | "validator"     // validator review
  | "human"         // human intervention
  | "safety"        // safety event (kill switch, refusal, escalation)
  | "conclusion";

interface Event {
  id: string;                 // EV-####
  at: string;                 // ISO
  fromId: string;             // participant.id or "human"
  kind: EventKind;
  taskId: string | null;
  content: string;            // concise conclusion, not hidden reasoning
  facts: string[];            // fact -> supplied by participant.id
  evidenceRef: string | null; // e.g. "metrics.query#p95"
  confidence: number | null;  // 0-1
  costUsd: number;
  latencyMs: number;
  toolId: string | null;
  toolError: string | null;
}

interface Task {
  id: string;                 // TSK-####
  label: string;
  ownerId: string;            // participant.id
  dependsOn: string[];        // task ids
  state: "Pending" | "In Progress" | "Blocked" | "Complete";
  reviewedBy: string | null;  // validator id when complete
}

interface Disagreement {
  id: string;                 // DIS-####
  taskId: string;
  betweenIds: [string, string];
  claimA: string;
  claimB: string;
  status: "Open" | "Escalated" | "Resolved";
  resolution: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
}

interface HumanIntervention {
  id: string;                 // HUM-####
  at: string;
  actor: string;              // role name of the human
  kind: "Decision" | "Clarification" | "Override" | "Termination";
  detail: string;
  targetEventId: string | null;
}

interface SessionRecord {
  id: string;                 // COL-####
  incidentId: string;
  executionId: string;
  runbookId: string;
  state: SessionState;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  summary: string;
}

/* -------------------------- Storage helpers ----------------------------- */

const SESSIONS_KEY   = "runops.collab.sessions.v1";
const EVENTS_KEY     = "runops.collab.events.v1";
const TASKS_KEY      = "runops.collab.tasks.v1";
const DISAG_KEY      = "runops.collab.disagreements.v1";
const HUMAN_KEY      = "runops.collab.interventions.v1";
const WORKERS_KEY    = "runops.digitalworkers.v1";
const WSESSIONS_KEY  = "runops.workersessions.v1";
const TIMELINE_KEY   = "runops.incidents.timeline.v1";
const HYPO_KEY       = "runops.hypothesisgraph.v1";
const REPLAY_KEY     = "runops.evidencereplay.v1";
const EVAL_KEY       = "runops.aigovernance.evals.v1";

function readList<T>(k: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "[]"); return Array.isArray(v) ? (v as T[]) : []; }
  catch { return []; }
}
function writeList<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)); }
const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;

/* ---------------------------- Canonical seed ---------------------------- */

const CANONICAL_ID = "COL-INC-10482";

function seedParticipants(): Participant[] {
  return [
    { id: "DW-IC-01",       role: "Planner",   label: "Incident Commander (AI)",     workerRef: "DW-IC-01",       status: "Active" },
    { id: "DW-APP-02",      role: "Executor",  label: "Application SRE",             workerRef: "DW-APP-02",      status: "Active" },
    { id: "DW-DB-03",       role: "Executor",  label: "Database SRE",                workerRef: "DW-DB-03",       status: "Active" },
    { id: "DW-NET-04",      role: "Executor",  label: "Network SRE",                 workerRef: "DW-NET-04",      status: "Active" },
    { id: "DW-CHANGE-05",   role: "Executor",  label: "Change Risk Analyst",         workerRef: "DW-CHANGE-05",   status: "Active" },
    { id: "DW-COMMS-06",    role: "Executor",  label: "Communications Coordinator",  workerRef: "DW-COMMS-06",    status: "Active" },
    { id: "DW-VALIDATE-10", role: "Validator", label: "Execution Validator",         workerRef: "DW-VALIDATE-10", status: "Active" },
    { id: "human-ic",       role: "Human",     label: "Human Incident Commander",    workerRef: "human",          status: "Active" },
  ];
}

function seedSession(): SessionRecord {
  const p = seedParticipants();
  return {
    id: CANONICAL_ID,
    incidentId: "INC-10482",
    executionId: "EXE-8841",
    runbookId: "RB-0042",
    state: "Active",
    participants: p,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    summary:
      "Coordinating diagnosis and mitigation of checkout latency after CHG-20391 index change. Planner/Executor/Validator separation enforced; publishing to Investigation + Hypothesis Graph.",
  };
}

function seedTasks(): Task[] {
  return [
    { id: "TSK-1001", label: "Confirm degradation signature",     ownerId: "DW-APP-02",      dependsOn: [],           state: "Complete",    reviewedBy: "DW-VALIDATE-10" },
    { id: "TSK-1002", label: "Correlate change window",           ownerId: "DW-CHANGE-05",   dependsOn: ["TSK-1001"], state: "Complete",    reviewedBy: "DW-VALIDATE-10" },
    { id: "TSK-1003", label: "Identify offending index/query",    ownerId: "DW-DB-03",       dependsOn: ["TSK-1001"], state: "In Progress", reviewedBy: null },
    { id: "TSK-1004", label: "Rule out network path",             ownerId: "DW-NET-04",      dependsOn: ["TSK-1001"], state: "Complete",    reviewedBy: "DW-VALIDATE-10" },
    { id: "TSK-1005", label: "Draft stakeholder update",          ownerId: "DW-COMMS-06",    dependsOn: ["TSK-1002"], state: "In Progress", reviewedBy: null },
    { id: "TSK-1006", label: "Recommend mitigation",              ownerId: "DW-IC-01",       dependsOn: ["TSK-1003"], state: "Pending",     reviewedBy: null },
    { id: "TSK-1007", label: "Validate mitigation preview",       ownerId: "DW-VALIDATE-10", dependsOn: ["TSK-1006"], state: "Pending",     reviewedBy: null },
  ];
}

function seedEvents(): Event[] {
  return [
    { id: "EV-9001", at: nowIso(), fromId: "DW-IC-01",       kind: "assignment",  taskId: "TSK-1003", content: "Assigning DB SRE to identify offending index and query plan change.",
      facts: [], evidenceRef: null, confidence: null, costUsd: 0.01, latencyMs: 240, toolId: null, toolError: null },
    { id: "EV-9002", at: nowIso(), fromId: "DW-APP-02",      kind: "handoff",     taskId: "TSK-1001", content: "Signature confirmed: p95 2.8s, err 8.6%. DB wait dominant.",
      facts: ["p95=2.8s","err=8.6%","db_wait>75%"], evidenceRef: "metrics.query#p95", confidence: 0.86, costUsd: 0.04, latencyMs: 1200, toolId: "metrics.query", toolError: null },
    { id: "EV-9003", at: nowIso(), fromId: "DW-CHANGE-05",   kind: "message",     taskId: "TSK-1002", content: "CHG-20391 deployed 09:58, 9 min before onset. Risk aligned.",
      facts: ["change_id=CHG-20391","deployed_at=09:58"], evidenceRef: "change.registry#CHG-20391", confidence: 0.9, costUsd: 0.02, latencyMs: 340, toolId: "change.read", toolError: null },
    { id: "EV-9004", at: nowIso(), fromId: "DW-NET-04",      kind: "handoff",     taskId: "TSK-1004", content: "Network RTT within baseline. Ruled out network path.",
      facts: ["rtt_p95=42ms","packet_loss=0%"], evidenceRef: "traces.query#net", confidence: 0.82, costUsd: 0.03, latencyMs: 820, toolId: "traces.query", toolError: null },
    { id: "EV-9005", at: nowIso(), fromId: "DW-DB-03",       kind: "tool",        taskId: "TSK-1003", content: "Ran EXPLAIN on top checkout query.",
      facts: [], evidenceRef: "db.explain#0xA31", confidence: null, costUsd: 0.05, latencyMs: 1400, toolId: "db.explain", toolError: null },
    { id: "EV-9006", at: nowIso(), fromId: "DW-DB-03",       kind: "message",     taskId: "TSK-1003", content: "Query plan flipped after CHG-20391: seq scan replaced idx-lookup. Wait spikes on ord_line_ix.",
      facts: ["plan=seq_scan","index=ord_line_ix"], evidenceRef: "db.explain#0xA31", confidence: 0.78, costUsd: 0.02, latencyMs: 600, toolId: null, toolError: null },
    { id: "EV-9007", at: nowIso(), fromId: "DW-COMMS-06",    kind: "tool_error",  taskId: "TSK-1005", content: "Slack template render failed.",
      facts: [], evidenceRef: null, confidence: null, costUsd: 0.00, latencyMs: 90, toolId: "comms.template", toolError: "connector: 429 rate limited" },
    { id: "EV-9008", at: nowIso(), fromId: "DW-VALIDATE-10", kind: "validator",   taskId: "TSK-1004", content: "Validator confirms network baseline evidence with source citation.",
      facts: [], evidenceRef: "traces.query#net", confidence: 0.9, costUsd: 0.01, latencyMs: 300, toolId: null, toolError: null },
    { id: "EV-9009", at: nowIso(), fromId: "DW-APP-02",      kind: "disagreement",taskId: "TSK-1003", content: "APP: connection pool exhaustion may be primary cause; DB is symptom.",
      facts: ["pool_util=98%"], evidenceRef: "metrics.query#pool", confidence: 0.62, costUsd: 0.02, latencyMs: 420, toolId: null, toolError: null },
    { id: "EV-9010", at: nowIso(), fromId: "DW-IC-01",       kind: "safety",      taskId: null,       content: "Escalating unresolved disagreement to human commander.",
      facts: [], evidenceRef: null, confidence: null, costUsd: 0.00, latencyMs: 50, toolId: null, toolError: null },
  ];
}

function seedDisagreements(): Disagreement[] {
  return [
    { id: "DIS-1", taskId: "TSK-1003", betweenIds: ["DW-DB-03","DW-APP-02"],
      claimA: "Root cause is the flipped query plan after CHG-20391; pool saturation is downstream.",
      claimB: "Pool exhaustion drives DB waits; index change is contributing but not primary.",
      status: "Escalated", resolution: null, resolvedBy: null, resolvedAt: null },
  ];
}

/* --------------------------- Tone helpers ------------------------------ */

function sessionTone(s: SessionState): string {
  switch (s) {
    case "Active":              return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Awaiting Human":      return "bg-amber-50 text-amber-800 border-amber-200";
    case "Worker Disagreement": return "bg-amber-50 text-amber-800 border-amber-200";
    case "Tool Failure":        return "bg-rose-50 text-rose-800 border-rose-200";
    case "Low Confidence":      return "bg-amber-50 text-amber-800 border-amber-200";
    case "Terminated":          return "bg-slate-200 text-slate-800 border-slate-400";
    case "Completed":           return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
}
function roleTone(r: WorkerRole): string {
  switch (r) {
    case "Planner":   return "bg-indigo-50 text-indigo-800 border-indigo-200";
    case "Executor":  return "bg-blue-50 text-blue-800 border-blue-200";
    case "Validator": return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Human":     return "bg-amber-50 text-amber-800 border-amber-200";
  }
}
function taskTone(s: Task["state"]): string {
  switch (s) {
    case "Pending":     return "bg-slate-100 text-slate-700 border-slate-300";
    case "In Progress": return "bg-blue-50 text-blue-800 border-blue-200";
    case "Blocked":     return "bg-amber-50 text-amber-800 border-amber-200";
    case "Complete":    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
}
function eventTone(k: EventKind): string {
  switch (k) {
    case "message":      return "border-slate-200";
    case "assignment":   return "border-blue-200 bg-blue-50/40";
    case "handoff":      return "border-emerald-200 bg-emerald-50/40";
    case "tool":         return "border-slate-200";
    case "tool_error":   return "border-rose-200 bg-rose-50/40";
    case "disagreement": return "border-amber-200 bg-amber-50/40";
    case "validator":    return "border-emerald-200 bg-emerald-50/40";
    case "human":        return "border-amber-300 bg-amber-100/60";
    case "safety":       return "border-rose-300 bg-rose-50/60";
    case "conclusion":   return "border-emerald-300 bg-emerald-50/60";
  }
}

/* ================================ Page ================================= */

type TabKey = "graph" | "stream" | "assignments" | "tools" | "disagreements" | "human" | "governance";
type DialogKey =
  | null
  | "openTask"
  | "reassign"
  | "clarify"
  | "challenge"
  | "resolve"
  | "human"
  | "terminate"
  | "replay"
  | "evidence";

export default function MultiAgentCollaboration() {
  const { sessionId = CANONICAL_ID } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const ops = useOperations();
  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [session, setSession] = useState<SessionRecord | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [disagreements, setDisagreements] = useState<Disagreement[]>([]);
  const [interventions, setInterventions] = useState<HumanIntervention[]>([]);
  const [tab, setTab] = useState<TabKey>("graph");
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [focusEvidence, setFocusEvidence] = useState<string | null>(null);
  const [inp, setInp] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);

  /* ---------------------------- Load / seed --------------------------- */

  useEffect(() => {
    const sessions = readList<SessionRecord>(SESSIONS_KEY);
    let s = sessions.find((x) => x.id === sessionId) ?? null;
    if (!s && sessionId === CANONICAL_ID) {
      s = seedSession();
      writeList(SESSIONS_KEY, [s, ...sessions]);
    }
    if (!s) { setNotFound(true); return; }
    setSession(s);

    const allEvents = readList<Event & { sessionId?: string }>(EVENTS_KEY);
    let ev = allEvents.filter((e) => (e.sessionId ?? sessionId) === sessionId) as Event[];
    if (ev.length === 0 && sessionId === CANONICAL_ID) {
      ev = seedEvents();
      writeList(EVENTS_KEY, [...ev.map((e) => ({ ...e, sessionId })), ...allEvents]);
    }
    setEvents(ev);

    const allTasks = readList<Task & { sessionId?: string }>(TASKS_KEY);
    let ts = allTasks.filter((t) => (t.sessionId ?? sessionId) === sessionId) as Task[];
    if (ts.length === 0 && sessionId === CANONICAL_ID) {
      ts = seedTasks();
      writeList(TASKS_KEY, [...ts.map((t) => ({ ...t, sessionId })), ...allTasks]);
    }
    setTasks(ts);

    const allDis = readList<Disagreement & { sessionId?: string }>(DISAG_KEY);
    let dg = allDis.filter((d) => (d.sessionId ?? sessionId) === sessionId) as Disagreement[];
    if (dg.length === 0 && sessionId === CANONICAL_ID) {
      dg = seedDisagreements();
      writeList(DISAG_KEY, [...dg.map((d) => ({ ...d, sessionId })), ...allDis]);
    }
    setDisagreements(dg);

    const allHum = readList<HumanIntervention & { sessionId?: string }>(HUMAN_KEY);
    setInterventions(allHum.filter((h) => (h.sessionId ?? sessionId) === sessionId) as HumanIntervention[]);
  }, [sessionId]);

  /* --------------------------- Persist helpers ------------------------ */

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
    ops.pushNotification({
      kind, title, detail,
      entityRef: sessionId,
      route: `/runops/workers/collaboration/${sessionId}`,
    });
  }, [ops, sessionId]);

  const persistSession = useCallback((patch: Partial<SessionRecord>) => {
    if (!session) return;
    const next = { ...session, ...patch, updatedAt: nowIso() };
    const list = readList<SessionRecord>(SESSIONS_KEY).map((s) => (s.id === session.id ? next : s));
    writeList(SESSIONS_KEY, list);
    setSession(next);
  }, [session]);

  const pushEvent = useCallback((partial: Omit<Event, "id" | "at">) => {
    if (!session) return;
    const e: Event = { id: rid("EV"), at: nowIso(), ...partial };
    setEvents((prev) => [...prev, e]);
    const all = readList<Event & { sessionId?: string }>(EVENTS_KEY);
    writeList(EVENTS_KEY, [...all, { ...e, sessionId: session.id }]);
    // Mirror findings and hypotheses into cross-screen keys.
    if (partial.kind === "handoff" || partial.kind === "message") {
      const timeline = readList<{ id: string }>(TIMELINE_KEY);
      writeList(TIMELINE_KEY, [{ id: e.id, incidentId: session.incidentId, at: e.at, source: partial.fromId, note: partial.content, evidenceRef: partial.evidenceRef }, ...timeline]);
    }
    if (partial.kind === "disagreement") {
      const hyp = readList<{ id: string }>(HYPO_KEY);
      writeList(HYPO_KEY, [{ id: e.id, incidentId: session.incidentId, at: e.at, from: partial.fromId, claim: partial.content, confidence: partial.confidence ?? null }, ...hyp]);
    }
    if (partial.kind === "safety" || partial.kind === "tool_error") {
      const evals = readList<{ id: string }>(EVAL_KEY);
      writeList(EVAL_KEY, [{ id: e.id, workerId: partial.fromId, at: e.at, kind: partial.kind, detail: partial.content, toolError: partial.toolError }, ...evals]);
    }
    // Every event lands in Evidence Replay.
    const replay = readList<{ id: string }>(REPLAY_KEY);
    writeList(REPLAY_KEY, [{ id: e.id, sessionId: session.id, incidentId: session.incidentId, at: e.at, kind: partial.kind, from: partial.fromId, content: partial.content, evidenceRef: partial.evidenceRef }, ...replay]);
  }, [session]);

  const persistTasks = useCallback((next: Task[]) => {
    if (!session) return;
    setTasks(next);
    const others = readList<Task & { sessionId?: string }>(TASKS_KEY).filter((t) => (t.sessionId ?? session.id) !== session.id);
    writeList(TASKS_KEY, [...others, ...next.map((t) => ({ ...t, sessionId: session.id }))]);
  }, [session]);

  const persistDisagreements = useCallback((next: Disagreement[]) => {
    if (!session) return;
    setDisagreements(next);
    const others = readList<Disagreement & { sessionId?: string }>(DISAG_KEY).filter((d) => (d.sessionId ?? session.id) !== session.id);
    writeList(DISAG_KEY, [...others, ...next.map((d) => ({ ...d, sessionId: session.id }))]);
  }, [session]);

  const persistInterventions = useCallback((next: HumanIntervention[]) => {
    if (!session) return;
    setInterventions(next);
    const others = readList<HumanIntervention & { sessionId?: string }>(HUMAN_KEY).filter((h) => (h.sessionId ?? session.id) !== session.id);
    writeList(HUMAN_KEY, [...others, ...next.map((h) => ({ ...h, sessionId: session.id }))]);
  }, [session]);

  /* ---------------------------- Derived ------------------------------- */

  const derivedState: SessionState = useMemo(() => {
    if (!session) return "Active";
    if (session.state === "Terminated" || session.state === "Completed") return session.state;
    const anyTool = events.some((e) => e.kind === "tool_error");
    const openDis = disagreements.some((d) => d.status === "Open" || d.status === "Escalated");
    const lowConf = events.some((e) => typeof e.confidence === "number" && e.confidence < 0.6);
    if (openDis) return "Worker Disagreement";
    if (anyTool) return "Tool Failure";
    if (lowConf) return "Low Confidence";
    if (events.some((e) => e.kind === "safety" && e.content.includes("human"))) return "Awaiting Human";
    return "Active";
  }, [session, events, disagreements]);

  const summary = useMemo(() => {
    const totalCost = events.reduce((s, e) => s + e.costUsd, 0);
    const latencies = events.map((e) => e.latencyMs).filter((n) => n > 0).sort((a, b) => a - b);
    const p95 = latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95))] : 0;
    const confs = events.map((e) => e.confidence).filter((n): n is number => typeof n === "number");
    const avgConf = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0;
    const toolFail = events.filter((e) => e.kind === "tool_error").length;
    const safety = events.filter((e) => e.kind === "safety").length;
    return { totalCost, p95, avgConf, toolFail, safety };
  }, [events]);

  const participantById = useMemo(() => {
    const m = new Map<string, Participant>();
    (session?.participants ?? []).forEach((p) => m.set(p.id, p));
    return m;
  }, [session]);

  /* --------------------------- Interactions --------------------------- */

  const reassignTask = () => {
    if (!canWrite || !session || !focusTaskId) return;
    const to = inp.newOwner; if (!to) return;
    const next = tasks.map((t) => (t.id === focusTaskId ? { ...t, ownerId: to, state: "In Progress" as const } : t));
    persistTasks(next);
    pushEvent({ fromId: "DW-IC-01", kind: "assignment", taskId: focusTaskId, content: `Reassigned to ${to}.`, facts: [], evidenceRef: null, confidence: null, costUsd: 0.01, latencyMs: 100, toolId: null, toolError: null });
    audit(`Task reassigned · ${focusTaskId}`, `Owner → ${to}.`);
    setDialog(null);
  };

  const askClarification = () => {
    if (!canWrite || !focusTaskId) return;
    const q = (inp.question ?? "").trim(); if (!q) return;
    pushEvent({ fromId: "DW-IC-01", kind: "message", taskId: focusTaskId, content: `Clarification requested: ${q}`, facts: [], evidenceRef: null, confidence: null, costUsd: 0.01, latencyMs: 80, toolId: null, toolError: null });
    audit(`Clarification requested · ${focusTaskId}`, q);
    setDialog(null);
  };

  const challengeConclusion = () => {
    if (!canWrite || !session || !focusTaskId) return;
    const challenger = inp.challenger ?? "DW-VALIDATE-10";
    const target = inp.target ?? "DW-DB-03";
    const claimA = inp.claimA ?? "Claim A"; const claimB = inp.claimB ?? "Claim B";
    const dis: Disagreement = { id: rid("DIS"), taskId: focusTaskId, betweenIds: [challenger, target], claimA, claimB, status: "Escalated", resolution: null, resolvedBy: null, resolvedAt: null };
    persistDisagreements([dis, ...disagreements]);
    pushEvent({ fromId: challenger, kind: "disagreement", taskId: focusTaskId, content: `Challenged: ${claimA} vs ${claimB}.`, facts: [], evidenceRef: null, confidence: 0.5, costUsd: 0.02, latencyMs: 200, toolId: null, toolError: null });
    audit(`Disagreement escalated · ${dis.id}`, `${challenger} vs ${target}. Consensus not forced.`, "warning");
    setDialog(null);
  };

  const resolveDisagreement = () => {
    if (!canWrite) return;
    const id = inp.disId ?? disagreements[0]?.id; if (!id) return;
    const resolution = (inp.resolution ?? "").trim(); if (!resolution) return;
    const next = disagreements.map((d) => d.id === id ? { ...d, status: "Resolved" as const, resolution, resolvedBy: ops.role, resolvedAt: nowIso() } : d);
    persistDisagreements(next);
    pushEvent({ fromId: "human-ic", kind: "human", taskId: null, content: `Resolved ${id}: ${resolution}`, facts: [], evidenceRef: null, confidence: null, costUsd: 0, latencyMs: 0, toolId: null, toolError: null });
    audit(`Disagreement resolved · ${id}`, resolution);
    setDialog(null);
  };

  const insertHumanDecision = () => {
    if (!canWrite || !session) return;
    const detail = (inp.decision ?? "").trim(); if (!detail) return;
    const rec: HumanIntervention = { id: rid("HUM"), at: nowIso(), actor: ops.role, kind: (inp.kind as HumanIntervention["kind"]) ?? "Decision", detail, targetEventId: null };
    persistInterventions([rec, ...interventions]);
    pushEvent({ fromId: "human-ic", kind: "human", taskId: null, content: `${rec.kind}: ${detail}`, facts: [], evidenceRef: null, confidence: null, costUsd: 0, latencyMs: 0, toolId: null, toolError: null });
    // Cross-screen: mirror to Incident Command timeline.
    const tl = readList<{ id: string }>(TIMELINE_KEY);
    writeList(TIMELINE_KEY, [{ id: rec.id, incidentId: session.incidentId, at: rec.at, source: "human", note: `[${rec.kind}] ${detail}` }, ...tl]);
    audit(`Human ${rec.kind.toLowerCase()} · ${rec.id}`, detail);
    setDialog(null);
  };

  const pauseWorker = (id: string) => {
    if (!canWrite || !session) return;
    const nextParticipants = session.participants.map((p) => p.id === id ? { ...p, status: (p.status === "Paused" ? "Active" : "Paused") as Participant["status"] } : p);
    persistSession({ participants: nextParticipants });
    // Mirror pause into digital workers catalog + active sessions
    const workers = readList<{ id: string; status: string; suspendedReason?: string | null }>(WORKERS_KEY);
    const nextW = workers.map((w) => w.id === id ? { ...w, status: (nextParticipants.find((p) => p.id === id)?.status === "Paused" ? "Suspended" : "Active"), suspendedReason: "Paused from collaboration session" } : w);
    writeList(WORKERS_KEY, nextW);
    const ws = readList<{ id: string; workerId: string; state: string; reason: string }>(WSESSIONS_KEY);
    writeList(WSESSIONS_KEY, ws.map((s) => s.workerId === id ? { ...s, state: "Halted", reason: `Paused in ${session.id}` } : s));
    pushEvent({ fromId: "DW-IC-01", kind: "safety", taskId: null, content: `Worker ${id} paused. Catalog + active sessions updated.`, facts: [], evidenceRef: null, confidence: null, costUsd: 0, latencyMs: 0, toolId: null, toolError: null });
    audit(`Worker ${id} paused`, `Reflected in Catalog and Worker Sessions.`, "warning");
  };

  const terminateSession = () => {
    if (!canWrite || !session) return;
    const reason = (inp.reason ?? "Terminated from Studio").trim();
    persistSession({ state: "Terminated", summary: `${session.summary}\nTerminated: ${reason}` });
    pushEvent({ fromId: "human-ic", kind: "human", taskId: null, content: `Session terminated: ${reason}`, facts: [], evidenceRef: null, confidence: null, costUsd: 0, latencyMs: 0, toolId: null, toolError: null });
    audit(`Collaboration terminated · ${session.id}`, reason, "critical");
    setDialog(null);
  };

  const replaySession = () => {
    if (!session) return;
    audit(`Replay opened · ${session.id}`, "Chronological reconstruction available in Evidence Replay.");
    setDialog("replay");
  };

  const exportSessionEvidence = () => {
    if (!session) return;
    const bundle = {
      session, events, tasks, disagreements, interventions,
      exportedAt: nowIso(), exportedBy: ops.role,
    };
    try {
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${session.id}-evidence.json`; a.click();
      URL.revokeObjectURL(url);
    } catch { /* noop */ }
    audit(`Session evidence exported · ${session.id}`, `${events.length} events, ${tasks.length} tasks, ${disagreements.length} disagreements.`);
  };

  /* ----------------------------- Guards ------------------------------- */

  if (notFound) {
    return (
      <div className="flex flex-col gap-3">
        <EntityHeader
          eyebrow="Digital Workers · Collaboration"
          title="Session not found"
          subtitle={`No collaboration session with id ${sessionId} in this tenant.`}
          actions={<Button size="sm" variant="outline" onClick={() => navigate("/runops/workers")}><ArrowLeft className="h-3.5 w-3.5 mr-1" />Catalog</Button>}
        />
      </div>
    );
  }
  if (!session) {
    return (
      <div className="flex flex-col gap-3">
        <EntityHeader title="Multi-Agent Collaboration" subtitle="Loading session…" />
      </div>
    );
  }

  /* ----------------------------- Render ------------------------------- */

  return (
    <div className="flex flex-col gap-3">
      <EntityHeader
        eyebrow={`Digital Workers · Collaboration · ${session.id}`}
        title={`Multi-Agent Collaboration · Incident ${session.incidentId}`}
        subtitle={session.summary}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/runops/workers")} aria-label="Back to catalog">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />Catalog
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`/runops/incidents/${session.incidentId}`)} aria-label="Open incident command">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />Incident Command
            </Button>
            <Button size="sm" variant="outline" onClick={replaySession} disabled={events.length === 0} aria-label="Replay collaboration">
              <Rewind className="h-3.5 w-3.5 mr-1" />Replay
            </Button>
            <Button size="sm" variant="outline" onClick={exportSessionEvidence} aria-label="Export session evidence">
              <Download className="h-3.5 w-3.5 mr-1" />Export
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setInp({}); setDialog("human"); }} disabled={!canWrite || session.state === "Terminated"} aria-label="Insert human decision">
              <User className="h-3.5 w-3.5 mr-1" />Human decision
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDialog("terminate")} disabled={!canWrite || session.state === "Terminated"} aria-label="Terminate session">
              <StopCircle className="h-3.5 w-3.5 mr-1" />Terminate
            </Button>
          </div>
        }
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className={cn("text-[10px]", sessionTone(derivedState))}>{derivedState}</Badge>
            <Badge variant="outline" className="text-[10px]">Runbook {session.runbookId}</Badge>
            <Badge variant="outline" className="text-[10px]">Execution {session.executionId}</Badge>
            <span className="text-slate-500">Cost ${summary.totalCost.toFixed(2)}</span>
            <span className="text-slate-500">· p95 {summary.p95}ms</span>
            <span className="text-slate-500">· Avg confidence {(summary.avgConf * 100).toFixed(0)}%</span>
            {summary.toolFail > 0 && <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-800 border-rose-200">Tool errors {summary.toolFail}</Badge>}
            {summary.safety > 0 && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">Safety events {summary.safety}</Badge>}
          </div>
        }
      />

      {!canWrite && (
        <div className="mx-4 rounded border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
          Read-only role. All mutations disabled with explanation.
        </div>
      )}

      {/* Participants strip */}
      <div className="mx-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {session.participants.map((p) => (
          <div key={p.id} className="rounded border border-slate-200 bg-white p-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={cn("text-[10px]", roleTone(p.role))}>{p.role}</Badge>
              <span className="text-[10px] text-slate-500">{p.status}</span>
            </div>
            <div className="mt-1 text-sm font-medium text-slate-900 truncate flex items-center gap-1">
              {p.role === "Human" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              {p.label}
            </div>
            <div className="text-[10px] text-slate-500">{p.workerRef}</div>
            {p.role !== "Human" && (
              <div className="mt-1 flex gap-1">
                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => pauseWorker(p.id)} disabled={!canWrite} aria-label={`Pause ${p.label}`}>
                  <Pause className="h-3 w-3 mr-1" />{p.status === "Paused" ? "Resume" : "Pause"}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="px-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="graph"><GitBranch className="h-3.5 w-3.5 mr-1" />Task graph</TabsTrigger>
          <TabsTrigger value="stream"><MessageSquare className="h-3.5 w-3.5 mr-1" />Message & evidence stream</TabsTrigger>
          <TabsTrigger value="assignments"><Layers className="h-3.5 w-3.5 mr-1" />Assignments</TabsTrigger>
          <TabsTrigger value="tools"><Wrench className="h-3.5 w-3.5 mr-1" />Tools</TabsTrigger>
          <TabsTrigger value="disagreements"><SplitSquareHorizontal className="h-3.5 w-3.5 mr-1" />Disagreements</TabsTrigger>
          <TabsTrigger value="human"><User className="h-3.5 w-3.5 mr-1" />Human interventions</TabsTrigger>
          <TabsTrigger value="governance"><ShieldCheck className="h-3.5 w-3.5 mr-1" />Trust & governance</TabsTrigger>
        </TabsList>

        {/* -------------------- Task graph -------------------- */}
        <TabsContent value="graph">
          <Card><CardContent className="p-4 space-y-2">
            <div className="text-xs text-slate-500">Planner (Incident Commander AI) hands work to Executors and requires Validator review before mitigation.</div>
            <div className="grid gap-2 md:grid-cols-2">
              {tasks.map((t) => {
                const owner = participantById.get(t.ownerId);
                const deps = t.dependsOn.map((d) => tasks.find((x) => x.id === d)?.label ?? d).join(", ");
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setFocusTaskId(t.id); setDialog("openTask"); }}
                    className="text-left rounded border border-slate-200 bg-white p-3 hover:bg-slate-50"
                    aria-label={`Open ${t.label}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-900">{t.label}</div>
                      <Badge variant="outline" className={cn("text-[10px]", taskTone(t.state))}>{t.state}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-slate-600 flex items-center gap-1">
                      <Bot className="h-3 w-3" />{owner?.label ?? t.ownerId}
                      {owner && <Badge variant="outline" className={cn("text-[10px] ml-1", roleTone(owner.role))}>{owner.role}</Badge>}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">Depends on: {deps || "—"}</div>
                    {t.reviewedBy && (
                      <div className="mt-1 text-[10px] text-emerald-800"><ShieldCheck className="inline h-3 w-3 mr-1" />Validator {t.reviewedBy}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Stream -------------------- */}
        <TabsContent value="stream">
          <Card><CardContent className="p-4 space-y-2">
            <div className="text-xs text-slate-500">Conclusions only; internal reasoning traces are not displayed. Every fact identifies the worker that supplied it.</div>
            {events.length === 0 ? (
              <div className="text-sm text-slate-500">No events yet.</div>
            ) : (
              events.map((e) => {
                const p = participantById.get(e.fromId);
                return (
                  <div key={e.id} className={cn("rounded border px-3 py-2", eventTone(e.kind))}>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{e.kind}</Badge>
                        {p && <Badge variant="outline" className={cn("text-[10px]", roleTone(p.role))}>{p.role}</Badge>}
                        <span>{p?.label ?? e.fromId}</span>
                        {e.taskId && <span>· task {e.taskId}</span>}
                      </div>
                      <span>{new Date(e.at).toLocaleTimeString()}</span>
                    </div>
                    <div className="mt-1 text-sm text-slate-900">{e.content}</div>
                    {e.facts.length > 0 && (
                      <ul className="mt-1 text-xs list-disc pl-4">
                        {e.facts.map((f) => (
                          <li key={f}><span className="font-mono">{f}</span> <span className="text-slate-500">— supplied by {p?.label ?? e.fromId}</span></li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-500">
                      {typeof e.confidence === "number" && <span>Confidence {(e.confidence * 100).toFixed(0)}%</span>}
                      {e.costUsd > 0 && <span>Cost ${e.costUsd.toFixed(2)}</span>}
                      {e.latencyMs > 0 && <span>Latency {e.latencyMs}ms</span>}
                      {e.toolId && <span>Tool {e.toolId}</span>}
                      {e.toolError && <span className="text-rose-700">Error: {e.toolError}</span>}
                      {e.evidenceRef && (
                        <button
                          type="button"
                          className="underline text-blue-700"
                          onClick={() => { setFocusEvidence(e.evidenceRef); setDialog("evidence"); }}
                          aria-label={`Open evidence ${e.evidenceRef}`}
                        >
                          <FileSearch className="inline h-3 w-3 mr-1" />{e.evidenceRef}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Assignments -------------------- */}
        <TabsContent value="assignments">
          <Card><CardContent className="p-4 space-y-2">
            {tasks.map((t) => {
              const owner = participantById.get(t.ownerId);
              return (
                <div key={t.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium">{t.label} <span className="text-slate-400 font-normal">· {t.id}</span></div>
                    <div className="text-xs text-slate-600">Owner {owner?.label ?? t.ownerId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px]", taskTone(t.state))}>{t.state}</Badge>
                    <Button size="sm" variant="outline" onClick={() => { setFocusTaskId(t.id); setDialog("reassign"); setInp({}); }} disabled={!canWrite} aria-label={`Reassign ${t.label}`}>
                      Reassign
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setFocusTaskId(t.id); setDialog("clarify"); setInp({}); }} disabled={!canWrite} aria-label={`Ask clarification on ${t.label}`}>
                      Ask
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setFocusTaskId(t.id); setDialog("challenge"); setInp({}); }} disabled={!canWrite} aria-label={`Challenge ${t.label}`}>
                      Challenge
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Tools -------------------- */}
        <TabsContent value="tools">
          <Card><CardContent className="p-4 space-y-2">
            {events.filter((e) => e.kind === "tool" || e.kind === "tool_error").length === 0 ? (
              <div className="text-sm text-slate-500">No tool calls recorded.</div>
            ) : (
              events.filter((e) => e.kind === "tool" || e.kind === "tool_error").map((e) => (
                <div key={e.id} className={cn("rounded border px-3 py-2", eventTone(e.kind))}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{e.kind}</Badge>
                      <span className="font-mono">{e.toolId ?? "—"}</span>
                      <span>· {participantById.get(e.fromId)?.label ?? e.fromId}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{new Date(e.at).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-1 text-sm">{e.content}</div>
                  {e.toolError && <div className="mt-1 text-xs text-rose-700">Error: {e.toolError}</div>}
                </div>
              ))
            )}
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Disagreements -------------------- */}
        <TabsContent value="disagreements">
          <Card><CardContent className="p-4 space-y-2">
            <div className="text-xs text-slate-500">Unresolved disagreements are escalated to the human commander rather than papered over.</div>
            {disagreements.length === 0 ? (
              <div className="text-sm text-slate-500">No disagreements. Consensus is not forced.</div>
            ) : (
              disagreements.map((d) => (
                <div key={d.id} className="rounded border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{d.id} · task {d.taskId}</div>
                    <Badge variant="outline" className={cn("text-[10px]", d.status === "Resolved" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200")}>
                      {d.status}
                    </Badge>
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-2 text-xs">
                    <div className="rounded border border-slate-200 p-2"><div className="text-[10px] text-slate-500">{participantById.get(d.betweenIds[0])?.label ?? d.betweenIds[0]}</div>{d.claimA}</div>
                    <div className="rounded border border-slate-200 p-2"><div className="text-[10px] text-slate-500">{participantById.get(d.betweenIds[1])?.label ?? d.betweenIds[1]}</div>{d.claimB}</div>
                  </div>
                  {d.resolution && (
                    <div className="mt-2 text-xs text-slate-700"><span className="font-medium">Resolution:</span> {d.resolution} <span className="text-slate-500">— {d.resolvedBy} @ {d.resolvedAt && new Date(d.resolvedAt).toLocaleTimeString()}</span></div>
                  )}
                  {d.status !== "Resolved" && (
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={() => { setInp({ disId: d.id }); setDialog("resolve"); }} disabled={!canWrite}>
                        <Handshake className="h-3.5 w-3.5 mr-1" />Resolve
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Human interventions -------------------- */}
        <TabsContent value="human">
          <Card><CardContent className="p-4 space-y-2">
            {interventions.length === 0 ? (
              <div className="text-sm text-slate-500">No human interventions yet.</div>
            ) : (
              interventions.map((h) => (
                <div key={h.id} className="rounded border border-amber-200 bg-amber-50/40 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">{h.kind}</Badge>
                      <span>{h.actor}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{new Date(h.at).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-sm">{h.detail}</div>
                </div>
              ))
            )}
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Trust & governance -------------------- */}
        <TabsContent value="governance">
          <Card><CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Metric k="Total cost" v={`$${summary.totalCost.toFixed(2)}`} />
              <Metric k="Latency p95" v={`${summary.p95}ms`} />
              <Metric k="Avg confidence" v={`${(summary.avgConf * 100).toFixed(0)}%`} />
              <Metric k="Calibration" v={summary.avgConf > 0 ? summary.avgConf.toFixed(2) : "—"} />
              <Metric k="Tool errors" v={String(summary.toolFail)} />
              <Metric k="Safety events" v={String(summary.safety)} />
              <Metric k="Disagreements" v={String(disagreements.length)} />
              <Metric k="Human interventions" v={String(interventions.length)} />
            </div>
            <div className="rounded border border-slate-200 p-3 text-xs space-y-1">
              <div><span className="font-semibold">Evidence chain:</span> All events mirror to Evidence Replay under key <code>runops.evidencereplay.v1</code>.</div>
              <div><span className="font-semibold">Findings:</span> Handoffs and messages appear on Investigation Workspace timeline.</div>
              <div><span className="font-semibold">Hypotheses:</span> Disagreements register on Hypothesis Graph with confidence.</div>
              <div><span className="font-semibold">Human decisions:</span> Mirror to Incident Command timeline.</div>
              <div><span className="font-semibold">Sources:</span> Datadog, Loki, Tempo, Change Registry, EXPLAIN outputs.</div>
              <div><span className="font-semibold">Uncertainty:</span> Per-event confidence shown; low-confidence claims never auto-approved.</div>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* ---------------------------- Dialogs ---------------------------- */}

      <Dialog open={dialog === "openTask"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Task {focusTaskId}</DialogTitle></DialogHeader>
          {(() => {
            const t = tasks.find((x) => x.id === focusTaskId); if (!t) return null;
            const rel = events.filter((e) => e.taskId === t.id);
            return (
              <div className="space-y-2 text-xs">
                <div className="text-sm font-medium">{t.label}</div>
                <div className="text-slate-600">Owner {participantById.get(t.ownerId)?.label ?? t.ownerId} · State {t.state}</div>
                <div className="text-slate-600">Depends on: {t.dependsOn.join(", ") || "—"}</div>
                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <div className="font-semibold">Related events ({rel.length})</div>
                  {rel.map((e) => (
                    <div key={e.id} className="rounded border border-slate-200 p-2">
                      <div className="text-[10px] text-slate-500">{e.kind} · {participantById.get(e.fromId)?.label ?? e.fromId} · {new Date(e.at).toLocaleTimeString()}</div>
                      <div>{e.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "reassign"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reassign task</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <FieldLabel>New owner</FieldLabel>
            <Select value={inp.newOwner ?? ""} onValueChange={(v) => setInp((s) => ({ ...s, newOwner: v }))}>
              <SelectTrigger><SelectValue placeholder="Choose worker" /></SelectTrigger>
              <SelectContent>
                {session.participants.filter((p) => p.role !== "Human").map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.label} · {p.role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={reassignTask}>Reassign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "clarify"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ask for clarification</DialogTitle></DialogHeader>
          <Textarea rows={3} placeholder="What needs to be clarified?" value={inp.question ?? ""} onChange={(e) => setInp((s) => ({ ...s, question: e.target.value }))} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={askClarification}>Ask</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "challenge"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Challenge conclusion</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div className="text-slate-600">Registers a disagreement. It is escalated to human review — consensus is not forced.</div>
            <div><FieldLabel>Challenger</FieldLabel>
              <Select value={inp.challenger ?? "DW-VALIDATE-10"} onValueChange={(v) => setInp((s) => ({ ...s, challenger: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {session.participants.filter((p) => p.role !== "Human").map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><FieldLabel>Target</FieldLabel>
              <Select value={inp.target ?? "DW-DB-03"} onValueChange={(v) => setInp((s) => ({ ...s, target: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {session.participants.filter((p) => p.role !== "Human").map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><FieldLabel>Claim A</FieldLabel><Input value={inp.claimA ?? ""} onChange={(e) => setInp((s) => ({ ...s, claimA: e.target.value }))} /></div>
            <div><FieldLabel>Claim B</FieldLabel><Input value={inp.claimB ?? ""} onChange={(e) => setInp((s) => ({ ...s, claimB: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={challengeConclusion}>Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "resolve"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolve disagreement</DialogTitle></DialogHeader>
          <Textarea rows={3} placeholder="Decision and rationale…" value={inp.resolution ?? ""} onChange={(e) => setInp((s) => ({ ...s, resolution: e.target.value }))} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={resolveDisagreement}>Resolve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "human"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Insert human decision</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div><FieldLabel>Kind</FieldLabel>
              <Select value={inp.kind ?? "Decision"} onValueChange={(v) => setInp((s) => ({ ...s, kind: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Decision","Clarification","Override","Termination"] as const).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><FieldLabel>Detail</FieldLabel><Textarea rows={3} value={inp.decision ?? ""} onChange={(e) => setInp((s) => ({ ...s, decision: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={insertHumanDecision}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "terminate"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Terminate session</DialogTitle></DialogHeader>
          <Textarea rows={3} placeholder="Reason (audit)…" value={inp.reason ?? ""} onChange={(e) => setInp((s) => ({ ...s, reason: e.target.value }))} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={terminateSession}>Terminate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "replay"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Replay · {session.id}</DialogTitle></DialogHeader>
          <div className="max-h-96 overflow-auto space-y-1 text-xs">
            {events.map((e) => (
              <div key={e.id} className="border-b border-slate-100 py-1">
                <span className="text-slate-500">{new Date(e.at).toLocaleTimeString()}</span>
                <span className="mx-2 font-medium">{participantById.get(e.fromId)?.label ?? e.fromId}</span>
                <span className="text-slate-500">[{e.kind}]</span>
                <span className="ml-1">{e.content}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "evidence"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Source evidence · {focusEvidence}</DialogTitle></DialogHeader>
          <div className="text-xs space-y-2">
            <div><span className="font-semibold">Reference:</span> {focusEvidence ?? "—"}</div>
            <div>Evidence is stored in the incident's evidence store and mirrored to Evidence Replay. Opening from here in production would deep-link into the underlying source (Datadog, Loki, DB EXPLAIN, Change Registry).</div>
            <Button size="sm" variant="outline" onClick={() => navigate(`/runops/incidents/${session.incidentId}/investigate`)}>
              <ExternalLink className="h-3.5 w-3.5 mr-1" />Open Investigation Workspace
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ Sub-parts ------------------------------ */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">{children}</div>;
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
      <div className="text-[10px] uppercase text-slate-500">{k}</div>
      <div className="text-sm font-semibold text-slate-900">{v}</div>
    </div>
  );
}
