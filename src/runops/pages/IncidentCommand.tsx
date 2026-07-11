/**
 * Page 26 · Incident Command Center
 * Route: /runops/incidents/:incidentId  (canonical id INC-10482)
 *
 * Coordinates a major incident through roles, workstreams, decisions,
 * communications, and operational status.
 *
 * - Reads canonical incident from provider (ops.incident).
 * - Persists per-incident command state to localStorage:
 *     runops.incidents.v1[incidentId] → IncidentRecord
 * - Consumes cross-page stores read-only:
 *     runops.executions.v1, runops.approvals.v1,
 *     runops.correlationgroups.v1, runops.alertincidentlinks.v1
 * - Every mutation emits audit + domain events via ops.pushNotification.
 * - Verified facts are shown separately from hypotheses.
 * - Header exposes one authoritative current status and the next required
 *   decision.
 *
 * Cross-page navigation targets that already exist in the router:
 *   /runops/incidents/:incidentId/investigate   (opens investigation)
 *   /runops/incidents/:incidentId/hypotheses    (opens causal graph)
 *   /runops/incidents/:incidentId/communications
 *   /runops/incidents/:incidentId/postmortem
 *   /runops/runbooks/:runbookId/launch          (launch runbook)
 *   /runops/approvals                            (approvals workspace)
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowUpRight, Bell, Building2, CheckCircle2,
  ClipboardList, ExternalLink, FileText, Flag, Gauge, GitBranch,
  MessageSquare, PhoneCall, Play, Radio, ShieldAlert, ShieldCheck,
  Siren, Sparkles, Timer, Users, Wrench,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------- Types --------------------------------- */

type IncidentSeverity = "SEV1" | "SEV2" | "SEV3" | "SEV4";
type IncidentState = "Detected" | "Declared" | "Investigating" | "Mitigating" | "Monitoring" | "Resolved" | "Closed";
type WorkstreamState = "Open" | "Blocked" | "Complete";
type TaskState = "Open" | "In Progress" | "Blocked" | "Done";
type HypothesisState = "Proposed" | "Investigating" | "Confirmed" | "Rejected";

interface IncidentRole {
  role: "Incident Commander" | "Operations Lead" | "Communications Lead" | "Scribe" | "Subject Matter Expert";
  name: string;
  paged?: boolean;
}
interface Workstream {
  id: string; title: string; owner: string; state: WorkstreamState;
  createdAt: string; goal: string;
}
interface TimelineEntry {
  id: string; at: string; actor: string; kind: "fact" | "action" | "decision" | "comms" | "system";
  text: string; relatedRef?: string;
}
interface Hypothesis {
  id: string; text: string; confidence: number; state: HypothesisState;
  supporting: string[]; contradictory: string[]; createdAt: string;
}
interface Task {
  id: string; workstreamId?: string; title: string; owner: string;
  state: TaskState; createdAt: string;
}
interface Decision {
  id: string; at: string; by: string; question: string; decision: string; rationale: string;
}
interface Communication {
  id: string; at: string; audience: "Customers" | "Executives" | "Internal" | "Regulators";
  channel: "Status Page" | "Email" | "Slack" | "Executive Brief";
  message: string; sentBy: string;
}
interface RecoveryCriterion {
  id: string; label: string; target: string; passing: boolean;
}
interface IncidentRecord {
  incidentId: string;
  severity: IncidentSeverity;
  state: IncidentState;
  situation: string;
  impact: string;
  affectedCustomers: number;
  affectedServiceIds: string[];
  startedAt: string;
  nextUpdateAt: string;
  warRoomUrl?: string | null;
  roles: IncidentRole[];
  workstreams: Workstream[];
  timeline: TimelineEntry[];
  hypotheses: Hypothesis[];
  activeRunbookIds: string[];
  tasks: Task[];
  decisions: Decision[];
  communications: Communication[];
  recoveryCriteria: RecoveryCriterion[];
  nextRequiredDecision: string;
  verifiedFacts: string[];
  updatedAt: string;
}

interface StoredExecution {
  id: string; runbookId: string; runbookVersion: string; serviceId: string;
  environment: string; state: string; startedAt: string | null;
  incidentId?: string;
}
interface StoredApproval {
  id: string; state: string; createdAt: string; executionId?: string; action?: string;
}
interface StoredGroup { id: string; alertIds: string[]; incidentId?: string | null }
interface StoredLink { id: string; groupId: string; incidentId: string }

/* ------------------------------ Storage --------------------------------- */

const INCIDENTS_KEY   = "runops.incidents.v1";
const EXECUTIONS_KEY  = "runops.executions.v1";
const APPROVALS_KEY   = "runops.approvals.v1";
const GROUPS_KEY      = "runops.correlationgroups.v1";
const LINKS_KEY       = "runops.alertincidentlinks.v1";

function readMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, T>) : {};
  } catch { return {}; }
}
function writeMap<T>(key: string, map: Record<string, T>) {
  localStorage.setItem(key, JSON.stringify(map));
}
function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch { return []; }
}

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/* ------------------------------- Seed ---------------------------------- */

function seedIncident(incidentId: string, serviceId: string, commander: string): IncidentRecord {
  const now = new Date();
  const startedAt = new Date(now.getTime() - 42 * 60_000).toISOString();
  const nextUpdate = new Date(now.getTime() + 15 * 60_000).toISOString();
  const iso = (mMinutesAgo: number) => new Date(now.getTime() - mMinutesAgo * 60_000).toISOString();
  return {
    incidentId,
    severity: "SEV1",
    state: "Investigating",
    situation:
      "Checkout API p95 latency rose from ~420ms to 2.8s at 10:07 CT. Transaction success declined from 99.7% to 91.4%. " +
      "SQL primary connection pool utilization saturated at 98%. Onset shortly after CHG-20391 index deployment at 09:58 CT.",
    impact: "Customer checkout journeys degraded across US Central; measurable revenue impact estimated at $18K per minute.",
    affectedCustomers: 42800,
    affectedServiceIds: [serviceId],
    startedAt,
    nextUpdateAt: nextUpdate,
    warRoomUrl: null,
    roles: [
      { role: "Incident Commander",     name: commander },
      { role: "Operations Lead",        name: "Priya Raman" },
      { role: "Communications Lead",    name: "Maya Chen" },
      { role: "Scribe",                 name: "DW-KNOW-07 (Knowledge)" },
      { role: "Subject Matter Expert",  name: "DW-DB-03 (Database)" },
    ],
    workstreams: [
      { id: rid("WS"), title: "Investigate DB saturation",       owner: "DW-DB-03",  state: "Open",     createdAt: iso(35), goal: "Confirm root cause on checkout-db-01." },
      { id: rid("WS"), title: "Mitigate customer impact",        owner: "Priya Raman", state: "Open",   createdAt: iso(30), goal: "Restore checkout latency within SLO." },
      { id: rid("WS"), title: "Stakeholder communications",      owner: "Maya Chen", state: "Open",     createdAt: iso(28), goal: "Publish updates every 15 min." },
    ],
    timeline: [
      { id: rid("T"), at: iso(42), actor: "monitoring",  kind: "system",   text: "Checkout latency alarm ALT-88231 fired" },
      { id: rid("T"), at: iso(40), actor: "monitoring",  kind: "system",   text: "Transaction error rate 4.7% (SLO 0.5%)" },
      { id: rid("T"), at: iso(36), actor: "human.operator", kind: "action", text: "Incident declared SEV1 · commander DW-IC-01" },
      { id: rid("T"), at: iso(28), actor: "DW-DB-03",   kind: "fact",     text: "SQL pool util saturated at 96–98% on checkout-db-01" },
      { id: rid("T"), at: iso(24), actor: "DW-RCA-08",  kind: "fact",     text: "DB_TIMEOUT dominates checkout error class (81%)" },
      { id: rid("T"), at: iso(20), actor: "DW-CHANGE-05", kind: "fact",   text: "CHG-20391 modified pool sizing at 10:04 CT" },
    ],
    hypotheses: [
      {
        id: rid("HY"), text: "CHG-20391 introduced a suboptimal query plan on the high-volume checkout query, saturating the primary pool.",
        confidence: 82, state: "Investigating",
        supporting: [
          "SQL pool utilization crosses 90% within 3 min of CHG-20391",
          "DB_TIMEOUT class dominates error signature",
          "Trace analysis shows database wait time as the dominant contributor",
        ],
        contradictory: ["Application pod CPU is within normal range — could indicate other paths still healthy"],
        createdAt: iso(20),
      },
      {
        id: rid("HY"), text: "Kafka consumer restart independently contributes to queue delay.",
        confidence: 24, state: "Proposed",
        supporting: ["order-events consumer lag climbing linearly since 10:12 CT"],
        contradictory: ["No broker restart observed in CloudWatch"],
        createdAt: iso(12),
      },
    ],
    activeRunbookIds: ["RB-0042"],
    tasks: [
      { id: rid("TK"), title: "Confirm offending query plan diff", owner: "DW-DB-03",  state: "In Progress", createdAt: iso(24) },
      { id: rid("TK"), title: "Prepare index revert change ticket", owner: "Priya Raman", state: "In Progress", createdAt: iso(22) },
      { id: rid("TK"), title: "Draft customer status update",       owner: "Maya Chen",   state: "Open",        createdAt: iso(18) },
    ],
    decisions: [
      { id: rid("DC"), at: iso(30), by: commander, question: "Declare SEV level?", decision: "SEV1", rationale: "Customer-facing checkout journey materially degraded across US Central." },
      { id: rid("DC"), at: iso(22), by: commander, question: "Engage automation with approval-gated revert?", decision: "Yes — request approval for RB-0042", rationale: "Highest-confidence mitigation; approval gate preserves human authority." },
    ],
    communications: [
      { id: rid("CM"), at: iso(20), audience: "Internal",  channel: "Slack",         message: "SEV1 declared for Global Order Processing. Investigation in progress.", sentBy: "Maya Chen" },
      { id: rid("CM"), at: iso(15), audience: "Customers", channel: "Status Page",   message: "We are investigating elevated errors on checkout. Next update in 15 minutes.", sentBy: "Maya Chen" },
    ],
    recoveryCriteria: [
      { id: rid("RC"), label: "Checkout p95 < 500ms sustained 10 min", target: "< 500ms",  passing: false },
      { id: rid("RC"), label: "Transaction error rate below SLO",       target: "< 0.5%",   passing: false },
      { id: rid("RC"), label: "SQL pool utilization below threshold",   target: "< 75%",    passing: false },
      { id: rid("RC"), label: "Synthetic checkout green for 3 cycles",  target: "100% pass",passing: false },
    ],
    nextRequiredDecision: "Approve or deny APR-4471 to launch RB-0042 (revert CHG-20391 + recycle pods).",
    verifiedFacts: [
      "CHG-20391 deployed at 09:58 CT",
      "Latency onset at 10:07 CT",
      "SQL pool utilization saturated at 98%",
      "Database wait time is the dominant trace contributor",
    ],
    updatedAt: nowIso(),
  };
}

function severityTone(s: IncidentSeverity): string {
  if (s === "SEV1") return "bg-red-100 text-red-800 border-red-300";
  if (s === "SEV2") return "bg-amber-100 text-amber-900 border-amber-300";
  if (s === "SEV3") return "bg-yellow-50 text-yellow-900 border-yellow-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}
function stateTone(s: IncidentState): string {
  switch (s) {
    case "Detected":     return "bg-blue-50 text-blue-700 border-blue-200";
    case "Declared":     return "bg-red-50 text-red-700 border-red-200";
    case "Investigating":return "bg-amber-50 text-amber-800 border-amber-200";
    case "Mitigating":   return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Monitoring":   return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Resolved":     return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "Closed":       return "bg-slate-100 text-slate-700 border-slate-300";
    default:             return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
function elapsed(startedAtIso: string): string {
  const diffMs = Date.now() - new Date(startedAtIso).getTime();
  const total = Math.max(0, Math.round(diffMs / 60_000));
  const h = Math.floor(total / 60); const m = total % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/* --------------------------------- Page --------------------------------- */

export default function IncidentCommand() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams<{ incidentId?: string }>();
  const incidentId = params.incidentId ?? ops.incident.id;

  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");
  const canDecide = canWrite && (
    ops.role === "Incident Commander" ||
    ops.role === "SRE Engineer" ||
    ops.role === "Service Owner" ||
    ops.role === "Change Manager" ||
    ops.role === "Platform Engineer"
  );

  const [record, setRecord] = useState<IncidentRecord | null>(null);
  const [dialog, setDialog] = useState<
    null | "severity" | "assignRole" | "warRoom" | "page" | "workstream" | "task"
        | "decision" | "runbook" | "comms" | "escalate" | "monitor" | "resolve"
  >(null);
  const [tab, setTab] = useState<"situation" | "roles" | "workstreams" | "hypotheses" | "runbooks" | "tasks" | "decisions" | "comms" | "recovery" | "timeline">("situation");

  // Dialog local state
  const [severityDraft, setSeverityDraft] = useState<IncidentSeverity>("SEV1");
  const [roleName, setRoleName] = useState("");
  const [roleKind, setRoleKind] = useState<IncidentRole["role"]>("Operations Lead");
  const [warRoomUrl, setWarRoomUrl] = useState("");
  const [pageTarget, setPageTarget] = useState("");
  const [wsTitle, setWsTitle] = useState("");
  const [wsOwner, setWsOwner] = useState("");
  const [wsGoal, setWsGoal] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskOwner, setTaskOwner] = useState("");
  const [taskWs, setTaskWs] = useState<string>("");
  const [decisionQ, setDecisionQ] = useState("");
  const [decisionAns, setDecisionAns] = useState("");
  const [decisionRationale, setDecisionRationale] = useState("");
  const [rbId, setRbId] = useState<string>("RB-0042");
  const [commsAudience, setCommsAudience] = useState<Communication["audience"]>("Customers");
  const [commsChannel, setCommsChannel] = useState<Communication["channel"]>("Status Page");
  const [commsMessage, setCommsMessage] = useState("");
  const [escalateTo, setEscalateTo] = useState("Executive on-call");

  /* --------------------------- Load / seed ---------------------------- */
  useEffect(() => {
    const map = readMap<IncidentRecord>(INCIDENTS_KEY);
    if (map[incidentId]) {
      setRecord(map[incidentId]);
    } else {
      const rec = seedIncident(incidentId, ops.selectedServiceId, ops.incident.commander || "DW-IC-01");
      map[incidentId] = rec;
      writeMap(INCIDENTS_KEY, map);
      setRecord(rec);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId]);

  /* --------------------------- Cross stores --------------------------- */
  const executions = useMemo(() => readList<StoredExecution>(EXECUTIONS_KEY).filter((e) => e.incidentId === incidentId), [incidentId, record]);
  const approvals = useMemo(() => readList<StoredApproval>(APPROVALS_KEY).filter((a) => a.state === "Pending"), [record]);
  const groupsForIncident = useMemo(() => {
    const links = readList<StoredLink>(LINKS_KEY).filter((l) => l.incidentId === incidentId);
    const groups = readList<StoredGroup>(GROUPS_KEY);
    return groups.filter((g) => g.incidentId === incidentId || links.some((l) => l.groupId === g.id));
  }, [incidentId, record]);

  /* ------------------------------ Actions ----------------------------- */

  const audit = useCallback(
    (title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
      ops.pushNotification({ kind, title, detail, entityRef: incidentId, route: `/runops/incidents/${incidentId}` });
    },
    [ops, incidentId],
  );

  const persist = useCallback((next: IncidentRecord) => {
    const map = readMap<IncidentRecord>(INCIDENTS_KEY);
    map[next.incidentId] = { ...next, updatedAt: nowIso() };
    writeMap(INCIDENTS_KEY, map);
    setRecord(map[next.incidentId]);
  }, []);

  const addTimeline = useCallback(
    (rec: IncidentRecord, kind: TimelineEntry["kind"], text: string, actor?: string, relatedRef?: string): IncidentRecord => ({
      ...rec,
      timeline: [
        { id: rid("T"), at: nowIso(), actor: actor ?? ops.role, kind, text, relatedRef },
        ...rec.timeline,
      ],
    }),
    [ops.role],
  );

  const changeSeverity = () => {
    if (!record || !canDecide) return;
    if (severityDraft === record.severity) { setDialog(null); return; }
    const next = addTimeline({ ...record, severity: severityDraft }, "decision", `Severity changed to ${severityDraft}`);
    persist(next);
    audit("Incident severity changed", `${incidentId} → ${severityDraft}`, severityDraft === "SEV1" ? "critical" : "warning");
    setDialog(null);
  };

  const changeState = (nextState: IncidentState) => {
    if (!record || !canDecide) return;
    if (nextState === record.state) return;
    const patched = addTimeline({ ...record, state: nextState }, "system", `State advanced to ${nextState}`);
    persist(patched);
    audit("Incident state changed", `${incidentId} → ${nextState}`, nextState === "Resolved" ? "info" : "warning");
  };

  const assignRole = () => {
    if (!record || !canWrite || !roleName.trim()) return;
    const roles = record.roles.some((r) => r.role === roleKind)
      ? record.roles.map((r) => r.role === roleKind ? { ...r, name: roleName.trim() } : r)
      : [...record.roles, { role: roleKind, name: roleName.trim() }];
    const next = addTimeline({ ...record, roles }, "action", `${roleKind} assigned → ${roleName.trim()}`);
    persist(next);
    audit("Incident role assigned", `${roleKind} → ${roleName.trim()}`);
    setDialog(null); setRoleName("");
  };

  const createWarRoom = () => {
    if (!record || !canWrite) return;
    const url = warRoomUrl.trim() || `https://war.example.com/${incidentId.toLowerCase()}`;
    const next = addTimeline({ ...record, warRoomUrl: url }, "action", `War room created · ${url}`);
    persist(next);
    audit("War room created", url);
    setDialog(null); setWarRoomUrl("");
  };

  const pageResponder = () => {
    if (!record || !canWrite || !pageTarget.trim()) return;
    const roles = record.roles.map((r) => r.name === pageTarget.trim() ? { ...r, paged: true } : r);
    const next = addTimeline({ ...record, roles }, "action", `Paged ${pageTarget.trim()}`);
    persist(next);
    audit("Responder paged", pageTarget.trim(), "warning");
    setDialog(null); setPageTarget("");
  };

  const createWorkstream = () => {
    if (!record || !canWrite || !wsTitle.trim() || !wsOwner.trim()) return;
    const ws: Workstream = {
      id: rid("WS"), title: wsTitle.trim(), owner: wsOwner.trim(),
      state: "Open", createdAt: nowIso(), goal: wsGoal.trim() || "—",
    };
    const next = addTimeline({ ...record, workstreams: [...record.workstreams, ws] }, "action", `Workstream created · ${ws.title} (${ws.owner})`);
    persist(next);
    audit("Workstream created", `${ws.id} · ${ws.title}`);
    setDialog(null); setWsTitle(""); setWsOwner(""); setWsGoal("");
  };

  const createTask = () => {
    if (!record || !canWrite || !taskTitle.trim() || !taskOwner.trim()) return;
    const t: Task = {
      id: rid("TK"), workstreamId: taskWs || undefined, title: taskTitle.trim(),
      owner: taskOwner.trim(), state: "Open", createdAt: nowIso(),
    };
    const next = addTimeline({ ...record, tasks: [...record.tasks, t] }, "action", `Task assigned · ${t.title} → ${t.owner}`);
    persist(next);
    audit("Task assigned", `${t.id} · ${t.owner}`);
    setDialog(null); setTaskTitle(""); setTaskOwner(""); setTaskWs("");
  };

  const setTaskState = (taskId: string, s: TaskState) => {
    if (!record || !canWrite) return;
    const tasks = record.tasks.map((t) => t.id === taskId ? { ...t, state: s } : t);
    const t = tasks.find((x) => x.id === taskId);
    persist(addTimeline({ ...record, tasks }, "action", `Task ${t?.title ?? taskId} → ${s}`));
    audit("Task updated", `${taskId} → ${s}`);
  };

  const recordDecision = () => {
    if (!record || !canDecide || !decisionQ.trim() || !decisionAns.trim()) return;
    const d: Decision = {
      id: rid("DC"), at: nowIso(), by: ops.role,
      question: decisionQ.trim(), decision: decisionAns.trim(), rationale: decisionRationale.trim() || "—",
    };
    const next = addTimeline({ ...record, decisions: [d, ...record.decisions] }, "decision", `${d.question} → ${d.decision}`);
    persist(next);
    audit("Decision recorded", `${d.question} → ${d.decision}`);
    setDialog(null); setDecisionQ(""); setDecisionAns(""); setDecisionRationale("");
  };

  const launchRunbook = () => {
    if (!record || !canWrite || !rbId.trim()) return;
    const next = addTimeline(
      { ...record, activeRunbookIds: Array.from(new Set([...record.activeRunbookIds, rbId.trim()])) },
      "action",
      `Runbook ${rbId.trim()} launched`,
    );
    persist(next);
    audit("Runbook launched", rbId.trim());
    setDialog(null);
    navigate(`/runops/runbooks/${rbId.trim()}/launch`);
  };

  const publishComms = () => {
    if (!record || !canWrite || !commsMessage.trim()) return;
    const c: Communication = {
      id: rid("CM"), at: nowIso(), audience: commsAudience, channel: commsChannel,
      message: commsMessage.trim(), sentBy: ops.role,
    };
    const next = addTimeline(
      { ...record, communications: [c, ...record.communications] },
      "comms",
      `${c.channel} → ${c.audience}: ${c.message.slice(0, 80)}`,
    );
    persist(next);
    audit("Stakeholder update published", `${c.channel} → ${c.audience}`);
    setDialog(null); setCommsMessage("");
  };

  const requestStakeholderUpdate = () => {
    if (!record || !canWrite) return;
    const next = addTimeline({ ...record, nextUpdateAt: new Date(Date.now() + 15 * 60_000).toISOString() },
      "action", "Stakeholder update requested (next update in 15m)");
    persist(next);
    audit("Stakeholder update requested", "next update in 15m");
  };

  const escalate = () => {
    if (!record || !canWrite || !escalateTo.trim()) return;
    const next = addTimeline({ ...record }, "action", `Escalated to ${escalateTo.trim()}`);
    persist(next);
    audit("Incident escalated", escalateTo.trim(), "critical");
    setDialog(null);
  };

  const toggleRecovery = (id: string) => {
    if (!record || !canWrite) return;
    const recoveryCriteria = record.recoveryCriteria.map((r) => r.id === id ? { ...r, passing: !r.passing } : r);
    persist({ ...record, recoveryCriteria });
    audit("Recovery criterion toggled", id);
  };

  const moveToMonitoring = () => {
    if (!record || !canDecide) return;
    changeState("Monitoring");
    setDialog(null);
  };

  const resolveIncident = () => {
    if (!record || !canDecide) return;
    if (!record.recoveryCriteria.every((r) => r.passing)) {
      audit("Resolution blocked", "Not all recovery criteria passing", "warning");
      return;
    }
    const patched = addTimeline({ ...record, state: "Resolved" }, "system", "Incident resolved · postmortem enabled");
    persist(patched);
    audit("Incident resolved", incidentId, "info");
    setDialog(null);
  };

  const evaluateHypothesis = (id: string, state: HypothesisState) => {
    if (!record || !canWrite) return;
    const hypotheses = record.hypotheses.map((h) => h.id === id ? { ...h, state } : h);
    persist(addTimeline({ ...record, hypotheses }, "decision", `Hypothesis ${id} → ${state}`));
    audit("Hypothesis updated", `${id} → ${state}`);
  };

  /* -------------------------------- Render ---------------------------- */

  if (!record) {
    return (
      <div className="p-6">
        <EntityHeader title="Incident Command Center" subtitle="Loading incident…" />
      </div>
    );
  }

  const nextUpdateIn = Math.max(0, Math.round((new Date(record.nextUpdateAt).getTime() - Date.now()) / 60_000));

  return (
    <div className="flex flex-col min-h-0">
      <EntityHeader
        eyebrow={`Incidents · ${incidentId}`}
        title={`${record.severity} — ${ops.incident.title}`}
        subtitle={`Tenant ${ops.tenant.name} · Service ${ops.selectedService.name} · ${ops.environment} · ${ops.region} · Role ${ops.role}`}
        status={{
          label: record.state,
          tone: record.state === "Resolved" || record.state === "Monitoring" ? "healthy"
              : record.state === "Closed" ? "healthy"
              : record.state === "Investigating" || record.state === "Declared" ? "failure"
              : "warning",
        }}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { setSeverityDraft(record.severity); setDialog("severity"); }} disabled={!canDecide}>
              <Flag className="mr-1.5 h-4 w-4" /> Change severity
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("warRoom")} disabled={!canWrite}>
              <PhoneCall className="mr-1.5 h-4 w-4" /> {record.warRoomUrl ? "War room" : "Create war room"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("escalate")} disabled={!canWrite}>
              <ArrowUpRight className="mr-1.5 h-4 w-4" /> Escalate
            </Button>
            <Button size="sm" variant="outline" onClick={() => changeState("Mitigating")} disabled={!canDecide}>
              <Wrench className="mr-1.5 h-4 w-4" /> Mitigating
            </Button>
            <Button size="sm" variant="outline" onClick={moveToMonitoring} disabled={!canDecide}>
              <Gauge className="mr-1.5 h-4 w-4" /> Move to monitoring
            </Button>
            <Button size="sm" onClick={() => setDialog("resolve")} disabled={!canDecide || record.state === "Resolved" || record.state === "Closed"}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Resolve
            </Button>
          </div>
        }
        meta={
          <>
            <Badge variant="outline" className={cn("text-[10px]", severityTone(record.severity))}>{record.severity}</Badge>
            <Badge variant="outline" className={cn("text-[10px]", stateTone(record.state))}>{record.state}</Badge>
            <Badge variant="outline" className="text-[10px]">Impact · {record.affectedCustomers.toLocaleString()} customers</Badge>
            <Badge variant="outline" className="text-[10px]">Services · {record.affectedServiceIds.length}</Badge>
            <Badge variant="outline" className="text-[10px]"><Timer className="mr-1 h-3 w-3 inline" /> Started {new Date(record.startedAt).toLocaleTimeString()}</Badge>
            <Badge variant="outline" className="text-[10px]">Elapsed {elapsed(record.startedAt)}</Badge>
            <Badge variant="outline" className="text-[10px]">SLO burn 6.4%/h</Badge>
            <Badge variant="outline" className="text-[10px]">IC · {record.roles.find((r) => r.role === "Incident Commander")?.name ?? "—"}</Badge>
            <Badge variant="outline" className={cn("text-[10px]", nextUpdateIn < 5 ? "bg-red-50 text-red-700 border-red-200" : "")}>
              Next update in {nextUpdateIn}m
            </Badge>
          </>
        }
      />

      {/* Authoritative status + next required decision */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-red-600" />
              <div className="text-sm font-medium">Current situation</div>
              <Badge variant="outline" className="text-[10px] ml-auto">Authoritative</Badge>
            </div>
            <p className="text-sm text-slate-700">{record.situation}</p>
            <div className="rounded-md border bg-amber-50 p-2 text-xs">
              <div className="font-medium flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-700" /> Next required decision</div>
              <div className="mt-0.5">{record.nextRequiredDecision}</div>
              <div className="mt-1 flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate("/runops/approvals")}>Open approvals</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setDialog("decision")} disabled={!canDecide}>Record decision</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-600" />
              <div className="text-sm font-medium">Business impact</div>
            </div>
            <p className="text-sm text-slate-700">{record.impact}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Kv k="Affected customers" v={record.affectedCustomers.toLocaleString()} />
              <Kv k="Affected services" v={String(record.affectedServiceIds.length)} />
              <Kv k="Started" v={new Date(record.startedAt).toLocaleTimeString()} />
              <Kv k="Elapsed" v={elapsed(record.startedAt)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="situation">Facts & Hypotheses</TabsTrigger>
            <TabsTrigger value="roles">Roles ({record.roles.length})</TabsTrigger>
            <TabsTrigger value="workstreams">Workstreams ({record.workstreams.length})</TabsTrigger>
            <TabsTrigger value="hypotheses">Hypotheses ({record.hypotheses.length})</TabsTrigger>
            <TabsTrigger value="runbooks">Runbooks ({record.activeRunbookIds.length})</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({record.tasks.length})</TabsTrigger>
            <TabsTrigger value="decisions">Decisions ({record.decisions.length})</TabsTrigger>
            <TabsTrigger value="comms">Communications ({record.communications.length})</TabsTrigger>
            <TabsTrigger value="recovery">Recovery ({record.recoveryCriteria.filter((r) => r.passing).length}/{record.recoveryCriteria.length})</TabsTrigger>
            <TabsTrigger value="timeline">Timeline ({record.timeline.length})</TabsTrigger>
          </TabsList>

          {/* Facts + hypotheses combined snapshot */}
          <TabsContent value="situation" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" /> Verified facts
                    <Badge variant="outline" className="ml-auto text-[10px] bg-emerald-50 text-emerald-700">Evidence-backed</Badge>
                  </div>
                  <ul className="text-sm list-disc pl-4 space-y-1">
                    {record.verifiedFacts.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-indigo-600" /> Current hypotheses
                    <Badge variant="outline" className="ml-auto text-[10px] bg-amber-50 text-amber-800">Unverified</Badge>
                  </div>
                  <ul className="space-y-2">
                    {record.hypotheses.map((h) => (
                      <li key={h.id} className="rounded-md border p-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{h.text}</span>
                          <Badge variant="outline" className="text-[10px] ml-auto">Confidence {h.confidence}%</Badge>
                          <Badge variant="outline" className="text-[10px]">{h.state}</Badge>
                        </div>
                        <div className="text-xs mt-1">
                          <div className="text-emerald-800">Supporting:</div>
                          <ul className="list-disc pl-4">{h.supporting.map((s, i) => <li key={i}>{s}</li>)}</ul>
                          <div className="text-amber-800 mt-1">Contradictory:</div>
                          <ul className="list-disc pl-4">{h.contradictory.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                        <div className="flex gap-1 mt-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate(`/runops/incidents/${incidentId}/hypotheses`)}>Open causal graph</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => evaluateHypothesis(h.id, "Confirmed")} disabled={!canWrite}>Confirm</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => evaluateHypothesis(h.id, "Rejected")} disabled={!canWrite}>Reject</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-md border bg-muted/30 p-2 text-xs">
                    <div className="font-medium">AI (NOVA) — evidence, confidence, uncertainty, sources</div>
                    <div>Confidence: {Math.max(...record.hypotheses.map((h) => h.confidence))}% (top hypothesis)</div>
                    <div>Evidence: {record.verifiedFacts.length} verified facts · {record.timeline.filter((t) => t.kind === "fact").length} timeline facts · {groupsForIncident.length} correlated situation(s)</div>
                    <div>Uncertainty: {record.hypotheses.reduce((n, h) => n + h.contradictory.length, 0)} contradictory signal(s) · {record.hypotheses.filter((h) => h.state === "Proposed").length} unverified hypothesis(es)</div>
                    <div>Sources: runops.correlationgroups.v1, runops.executions.v1, provider incident/change/service state</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="mt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600">Defined incident roles.</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDialog("page")} disabled={!canWrite}>
                    <Bell className="mr-1.5 h-4 w-4" /> Page responder
                  </Button>
                  <Button size="sm" onClick={() => { setRoleKind("Operations Lead"); setRoleName(""); setDialog("assignRole"); }} disabled={!canWrite}>
                    <Users className="mr-1.5 h-4 w-4" /> Assign role
                  </Button>
                </div>
              </div>
              <ul className="divide-y">
                {record.roles.map((r, i) => (
                  <li key={`${r.role}-${i}`} className="py-2 flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-[10px]">{r.role}</Badge>
                    <span className="font-medium">{r.name}</span>
                    {r.paged && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800">Paged</Badge>}
                  </li>
                ))}
              </ul>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="workstreams" className="mt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600">Independent tracks working toward mitigation.</div>
                <Button size="sm" onClick={() => setDialog("workstream")} disabled={!canWrite}>
                  <GitBranch className="mr-1.5 h-4 w-4" /> Create workstream
                </Button>
              </div>
              <ul className="divide-y">
                {record.workstreams.map((w) => (
                  <li key={w.id} className="py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{w.state}</Badge>
                      <span className="font-medium">{w.title}</span>
                      <span className="text-xs text-slate-500 ml-auto">Owner {w.owner}</span>
                    </div>
                    <div className="text-xs text-slate-500">{w.id} · {w.goal}</div>
                  </li>
                ))}
              </ul>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="hypotheses" className="mt-4">
            <Card><CardContent className="p-4 space-y-2">
              <div className="text-sm text-slate-600">Verified separately from facts. Confirm or reject with evidence.</div>
              <ul className="space-y-2">
                {record.hypotheses.map((h) => (
                  <li key={h.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{h.text}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto">Confidence {h.confidence}%</Badge>
                      <Badge variant="outline" className="text-[10px]">{h.state}</Badge>
                    </div>
                    <div className="mt-1 text-xs">
                      <div className="text-emerald-800">Supporting</div>
                      <ul className="list-disc pl-4">{h.supporting.map((s, i) => <li key={i}>{s}</li>)}</ul>
                      <div className="text-amber-800 mt-1">Contradictory</div>
                      <ul className="list-disc pl-4">{h.contradictory.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                    <div className="mt-1 flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/runops/incidents/${incidentId}/hypotheses`)}>Open causal graph</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/runops/incidents/${incidentId}/investigate`)}>Open investigation</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => evaluateHypothesis(h.id, "Confirmed")} disabled={!canWrite}>Confirm</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => evaluateHypothesis(h.id, "Rejected")} disabled={!canWrite}>Reject</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="runbooks" className="mt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600">Runbooks currently attached to this incident. Launching a runbook updates the executions panel.</div>
                <Button size="sm" onClick={() => setDialog("runbook")} disabled={!canWrite}>
                  <Play className="mr-1.5 h-4 w-4" /> Launch runbook
                </Button>
              </div>
              <ul className="divide-y">
                {record.activeRunbookIds.map((id) => (
                  <li key={id} className="py-2 flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">{id}</span>
                    <Button size="sm" variant="ghost" className="ml-auto" onClick={() => navigate(`/runops/runbooks/${id}`)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              {(executions.length > 0 || approvals.length > 0) && (
                <div className="rounded-md border p-2 text-xs">
                  <div className="font-medium">Live executions & approvals for this incident</div>
                  {executions.map((e) => (
                    <div key={e.id} className="flex gap-2 items-center py-0.5">
                      <Badge variant="outline" className="text-[10px]">{e.state}</Badge>
                      <span>{e.id} · {e.runbookId} · {e.environment}</span>
                    </div>
                  ))}
                  {approvals.map((a) => (
                    <div key={a.id} className="flex gap-2 items-center py-0.5">
                      <Badge variant="outline" className="text-[10px]">Approval {a.state}</Badge>
                      <span>{a.id}{a.action ? ` · ${a.action}` : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600">Assigned work with owners. Tasks link to their workstream.</div>
                <Button size="sm" onClick={() => { setTaskWs(""); setTaskTitle(""); setTaskOwner(""); setDialog("task"); }} disabled={!canWrite}>
                  <ClipboardList className="mr-1.5 h-4 w-4" /> Assign task
                </Button>
              </div>
              <ul className="divide-y">
                {record.tasks.map((t) => (
                  <li key={t.id} className="py-2 grid grid-cols-[1fr_auto_auto] gap-2 items-center text-sm">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-slate-500">{t.id} · owner {t.owner}{t.workstreamId ? ` · ${t.workstreamId}` : ""}</div>
                    </div>
                    <Select value={t.state} onValueChange={(v) => setTaskState(t.id, v as TaskState)}>
                      <SelectTrigger className="h-8 w-[120px]" aria-label={`State for ${t.title}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="text-[10px]">{t.state}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="decisions" className="mt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600">Immutable decision log for this incident.</div>
                <Button size="sm" onClick={() => setDialog("decision")} disabled={!canDecide}>
                  <ShieldAlert className="mr-1.5 h-4 w-4" /> Record decision
                </Button>
              </div>
              <ul className="divide-y">
                {record.decisions.map((d) => (
                  <li key={d.id} className="py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{new Date(d.at).toLocaleTimeString()}</Badge>
                      <span className="font-medium">{d.question}</span>
                      <span className="text-xs text-slate-500 ml-auto">by {d.by}</span>
                    </div>
                    <div className="text-sm">→ {d.decision}</div>
                    <div className="text-xs text-slate-500">{d.rationale}</div>
                  </li>
                ))}
              </ul>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="comms" className="mt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600">Every stakeholder update publishes back to the timeline.</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={requestStakeholderUpdate} disabled={!canWrite}>
                    <Radio className="mr-1.5 h-4 w-4" /> Request update
                  </Button>
                  <Button size="sm" onClick={() => setDialog("comms")} disabled={!canWrite}>
                    <MessageSquare className="mr-1.5 h-4 w-4" /> Publish update
                  </Button>
                </div>
              </div>
              <ul className="divide-y">
                {record.communications.map((c) => (
                  <li key={c.id} className="py-2 text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{new Date(c.at).toLocaleTimeString()}</Badge>
                      <Badge variant="outline" className="text-[10px]">{c.audience}</Badge>
                      <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                      <span className="text-xs text-slate-500 ml-auto">by {c.sentBy}</span>
                    </div>
                    <div className="mt-0.5">{c.message}</div>
                  </li>
                ))}
              </ul>
              <Button size="sm" variant="ghost" onClick={() => navigate(`/runops/incidents/${incidentId}/communications`)}>
                Open communications workspace <ExternalLink className="ml-1 h-4 w-4" />
              </Button>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="recovery" className="mt-4">
            <Card><CardContent className="p-4 space-y-2">
              <div className="text-sm text-slate-600">Resolution is blocked until every criterion passes.</div>
              <ul className="divide-y">
                {record.recoveryCriteria.map((r) => (
                  <li key={r.id} className="py-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      aria-label={`Recovery criterion ${r.label}`}
                      checked={r.passing}
                      onChange={() => toggleRecovery(r.id)}
                      disabled={!canWrite}
                    />
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-xs text-slate-500">Target {r.target}</div>
                    </div>
                    {r.passing && <Badge variant="outline" className="ml-auto text-[10px] bg-emerald-50 text-emerald-700">Passing</Badge>}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-slate-500">
                Resolution enables the postmortem workflow at{" "}
                <button className="text-primary underline underline-offset-2" onClick={() => navigate(`/runops/incidents/${incidentId}/postmortem`)}>
                  {`/runops/incidents/${incidentId}/postmortem`}
                </button>.
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card><CardContent className="p-4 space-y-2">
              <div className="text-sm text-slate-600">One synchronized incident timeline. Every action, decision, communication, and system event appears here.</div>
              <ul className="divide-y">
                {record.timeline.map((t) => (
                  <li key={t.id} className="py-2 text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{new Date(t.at).toLocaleTimeString()}</Badge>
                      <Badge variant="outline" className="text-[10px]">{t.kind}</Badge>
                      <span className="text-xs text-slate-500">{t.actor}</span>
                      {t.relatedRef && <span className="text-xs text-slate-500">· {t.relatedRef}</span>}
                    </div>
                    <div>{t.text}</div>
                  </li>
                ))}
              </ul>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Digital workers strip */}
      <div className="px-4 pb-6">
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-slate-600" />
            <div className="text-sm font-medium">Digital workers engaged</div>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => navigate("/runops/workers")}>
              Open fleet <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ops.digitalWorkers.slice(0, 6).map((w) => (
              <Badge key={w.id} variant="outline" className="text-[11px]">
                {w.id} · {w.role} · {w.status}
              </Badge>
            ))}
          </div>
        </CardContent></Card>
      </div>

      {/* ------------------------------ Dialogs ------------------------------ */}

      <Dialog open={dialog === "severity"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Declare / change severity</DialogTitle></DialogHeader>
          <Select value={severityDraft} onValueChange={(v) => setSeverityDraft(v as IncidentSeverity)}>
            <SelectTrigger aria-label="Severity"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SEV1">SEV1 — Critical customer impact</SelectItem>
              <SelectItem value="SEV2">SEV2 — Significant impact</SelectItem>
              <SelectItem value="SEV3">SEV3 — Limited impact</SelectItem>
              <SelectItem value="SEV4">SEV4 — Minimal impact</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={changeSeverity} disabled={!canDecide}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "assignRole"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign role</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Select value={roleKind} onValueChange={(v) => setRoleKind(v as IncidentRole["role"])}>
              <SelectTrigger aria-label="Role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Incident Commander">Incident Commander</SelectItem>
                <SelectItem value="Operations Lead">Operations Lead</SelectItem>
                <SelectItem value="Communications Lead">Communications Lead</SelectItem>
                <SelectItem value="Scribe">Scribe</SelectItem>
                <SelectItem value="Subject Matter Expert">Subject Matter Expert</SelectItem>
              </SelectContent>
            </Select>
            <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="Name" aria-label="Assignee name" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={assignRole} disabled={!canWrite || !roleName.trim()}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "warRoom"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{record.warRoomUrl ? "War room" : "Create war room"}</DialogTitle></DialogHeader>
          {record.warRoomUrl ? (
            <div className="text-sm">Active at <a className="text-primary underline underline-offset-2" href={record.warRoomUrl}>{record.warRoomUrl}</a></div>
          ) : (
            <Input value={warRoomUrl} onChange={(e) => setWarRoomUrl(e.target.value)} placeholder="Video bridge URL (optional)" aria-label="War room URL" />
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Close</Button>
            {!record.warRoomUrl && <Button onClick={createWarRoom} disabled={!canWrite}>Create</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "page"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Page responder</DialogTitle></DialogHeader>
          <Select value={pageTarget} onValueChange={setPageTarget}>
            <SelectTrigger aria-label="Responder"><SelectValue placeholder="Select responder" /></SelectTrigger>
            <SelectContent>
              {record.roles.map((r, i) => <SelectItem key={`${r.role}-${i}`} value={r.name}>{r.role} — {r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={pageResponder} disabled={!canWrite || !pageTarget.trim()}>Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "workstream"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create workstream</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input value={wsTitle} onChange={(e) => setWsTitle(e.target.value)} placeholder="Title" aria-label="Workstream title" />
            <Input value={wsOwner} onChange={(e) => setWsOwner(e.target.value)} placeholder="Owner" aria-label="Workstream owner" />
            <Textarea value={wsGoal} onChange={(e) => setWsGoal(e.target.value)} rows={3} placeholder="Goal" aria-label="Workstream goal" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createWorkstream} disabled={!canWrite || !wsTitle.trim() || !wsOwner.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "task"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign task</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Title" aria-label="Task title" />
            <Input value={taskOwner} onChange={(e) => setTaskOwner(e.target.value)} placeholder="Owner" aria-label="Task owner" />
            <Select value={taskWs} onValueChange={setTaskWs}>
              <SelectTrigger aria-label="Workstream"><SelectValue placeholder="Workstream (optional)" /></SelectTrigger>
              <SelectContent>
                {record.workstreams.map((w) => <SelectItem key={w.id} value={w.id}>{w.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createTask} disabled={!canWrite || !taskTitle.trim() || !taskOwner.trim()}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "decision"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record decision</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input value={decisionQ} onChange={(e) => setDecisionQ(e.target.value)} placeholder="Question" aria-label="Decision question" />
            <Input value={decisionAns} onChange={(e) => setDecisionAns(e.target.value)} placeholder="Decision" aria-label="Decision answer" />
            <Textarea value={decisionRationale} onChange={(e) => setDecisionRationale(e.target.value)} rows={4} placeholder="Rationale" aria-label="Decision rationale" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={recordDecision} disabled={!canDecide || !decisionQ.trim() || !decisionAns.trim()}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "runbook"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Launch runbook</DialogTitle></DialogHeader>
          <Input value={rbId} onChange={(e) => setRbId(e.target.value)} placeholder="Runbook id (e.g. RB-0042)" aria-label="Runbook id" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={launchRunbook} disabled={!canWrite || !rbId.trim()}>Launch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "comms"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Publish stakeholder update</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Select value={commsAudience} onValueChange={(v) => setCommsAudience(v as Communication["audience"])}>
                <SelectTrigger aria-label="Audience"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customers">Customers</SelectItem>
                  <SelectItem value="Executives">Executives</SelectItem>
                  <SelectItem value="Internal">Internal</SelectItem>
                  <SelectItem value="Regulators">Regulators</SelectItem>
                </SelectContent>
              </Select>
              <Select value={commsChannel} onValueChange={(v) => setCommsChannel(v as Communication["channel"])}>
                <SelectTrigger aria-label="Channel"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Status Page">Status Page</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Slack">Slack</SelectItem>
                  <SelectItem value="Executive Brief">Executive Brief</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea value={commsMessage} onChange={(e) => setCommsMessage(e.target.value)} rows={5} placeholder="Update message" aria-label="Communication message" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={publishComms} disabled={!canWrite || !commsMessage.trim()}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "escalate"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Escalate incident</DialogTitle></DialogHeader>
          <Input value={escalateTo} onChange={(e) => setEscalateTo(e.target.value)} placeholder="Escalation target" aria-label="Escalation target" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={escalate} disabled={!canWrite || !escalateTo.trim()}>Escalate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "resolve"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolve incident</DialogTitle></DialogHeader>
          <div className="text-sm space-y-2">
            <div>Resolution requires every recovery criterion to be passing.</div>
            <ul className="text-xs list-disc pl-4">
              {record.recoveryCriteria.map((r) => (
                <li key={r.id} className={cn(!r.passing && "text-amber-800")}>
                  {r.label} — {r.passing ? "passing" : "not passing"}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={resolveIncident} disabled={!canDecide || !record.recoveryCriteria.every((r) => r.passing)}>Resolve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ Small parts ------------------------------ */

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border bg-slate-50 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{k}</div>
      <div className="truncate">{v}</div>
    </div>
  );
}
