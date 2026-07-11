/**
 * Page 34 · Digital Worker Catalog
 * Route: /runops/workers
 *
 * Presents approved digital workers as governed members of the ops team.
 * Every mutation (assign, suspend, resume, create) emits an audit + domain
 * event via ops.pushNotification and persists to localStorage so cross-screen
 * views (Service Digital Twin, Runbook Detail, Operations Queue, AI Governance,
 * Multi-Agent Collaboration) reflect state changes on next mount.
 *
 * Persistence (localStorage):
 *   runops.digitalworkers.v1        → WorkerRecord[]  (canonical)
 *   runops.workerassignments.v1     → Assignment[]    (service + runbook)
 *   runops.workersessions.v1        → SessionRecord[] (active sessions)
 *   runops.aigovernance.evals.v1    → EvaluationRecord[]
 *   runops.opsqueue.v1              → append on suspend (session-halt)
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, Bot, CheckCircle2, ClipboardList, ExternalLink,
  GitCompare, Layers, Pause, Play, PlusCircle, Scale, Search, Settings2,
  ShieldAlert, ShieldCheck, Sparkles, Users, Wrench,
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

type Maturity = "Experimental" | "Test" | "Production Approved";
type Autonomy = "L0" | "L1" | "L2" | "L3" | "L4";
type WorkerStatus = "Active" | "Suspended" | "Evaluation overdue" | "Tool access revoked";
type Domain =
  | "Reliability"
  | "Change"
  | "Investigation"
  | "Communications"
  | "Data"
  | "Security"
  | "Cost"
  | "General";

interface EvaluationSummary {
  at: string;                    // ISO
  score: number;                 // 0-100
  calibration: number;           // 0-1 (Brier-like, higher = better calibration)
  acceptanceRate: number;        // 0-1 recommendation acceptance
  successRate: number;           // 0-1
  toolFailureRate: number;       // 0-1
  costPerRunUsd: number;
  passed: boolean;
  notes: string;
}

interface AuthorityBoundary {
  scope: string;                 // e.g. "checkout-api / prod"
  tools: string[];               // approved tool IDs
  guardrails: string[];          // policy identifiers or clauses
  requiresApprovalAbove: Autonomy;
}

interface WorkerRecord {
  id: string;                    // DW-####
  name: string;
  purpose: string;
  domain: Domain;
  ownerName: string;
  ownerTeam: string;
  supportedServices: string[];
  maturity: Maturity;
  autonomy: Autonomy;
  approvedTools: string[];
  dataSources: string[];
  model: string;
  version: string;
  status: WorkerStatus;
  suspendedReason: string | null;
  authority: AuthorityBoundary;
  lastEvaluation: EvaluationSummary | null;
  evaluationDueAt: string;       // ISO date
  policyStatus: "Compliant" | "Drift" | "Blocked";
  monthlyCostUsdEstimate: number;
  createdAt: string;
  updatedAt: string;
}

interface Assignment {
  id: string;                    // ASN-####
  workerId: string;
  kind: "service" | "runbook";
  targetId: string;              // service id or runbook id
  targetName: string;
  createdBy: string;
  createdAt: string;
  active: boolean;
}

interface SessionRecord {
  id: string;                    // SES-####
  workerId: string;
  startedAt: string;
  state: "Running" | "Awaiting Human" | "Halted";
  reason: string;
  route: string;                 // deep-link into collaboration
}

interface EvaluationRecord {
  id: string;                    // EV-####
  workerId: string;
  at: string;
  passed: boolean;
  summary: EvaluationSummary;
}

/* --------------------------- Storage helpers ---------------------------- */

const WORKERS_KEY   = "runops.digitalworkers.v1";
const ASSIGN_KEY    = "runops.workerassignments.v1";
const SESSIONS_KEY  = "runops.workersessions.v1";
const EVAL_KEY      = "runops.aigovernance.evals.v1";
const OPS_QUEUE_KEY = "runops.opsqueue.v1";

function readList<T>(k: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "[]"); return Array.isArray(v) ? (v as T[]) : []; }
  catch { return []; }
}
function writeList<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)); }

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;

/* ------------------------- Deterministic seed --------------------------- */

function inDays(d: number): string { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString(); }

function seedWorkers(): WorkerRecord[] {
  const now = nowIso();
  const w = (r: Partial<WorkerRecord> & Pick<WorkerRecord, "id" | "name" | "purpose" | "domain" | "maturity" | "autonomy" | "status">): WorkerRecord => ({
    ownerName: "Priya S.",
    ownerTeam: "Platform Reliability",
    supportedServices: ["checkout-api"],
    approvedTools: [],
    dataSources: [],
    model: "gpt-4.1",
    version: "1.0.0",
    suspendedReason: null,
    authority: { scope: "checkout-api / prod", tools: [], guardrails: ["policy.autonomy.v1"], requiresApprovalAbove: "L2" },
    lastEvaluation: null,
    evaluationDueAt: inDays(30),
    policyStatus: "Compliant",
    monthlyCostUsdEstimate: 420,
    createdAt: now,
    updatedAt: now,
    ...r,
  });

  return [
    w({
      id: "DW-2101",
      name: "Checkout SRE Copilot",
      purpose: "Investigates checkout latency signals, ranks hypotheses, and drafts mitigation options.",
      domain: "Reliability",
      maturity: "Production Approved",
      autonomy: "L2",
      status: "Active",
      supportedServices: ["checkout-api", "orders-api"],
      approvedTools: ["metrics.query", "logs.query", "traces.query", "runbook.execute:preview"],
      dataSources: ["Datadog", "Loki", "Tempo"],
      authority: {
        scope: "checkout-api / prod (read + preview)",
        tools: ["metrics.query", "logs.query", "traces.query", "runbook.execute:preview"],
        guardrails: ["policy.autonomy.v1", "policy.execution.leastprivilege"],
        requiresApprovalAbove: "L2",
      },
      lastEvaluation: {
        at: inDays(-3), score: 92, calibration: 0.86, acceptanceRate: 0.71,
        successRate: 0.94, toolFailureRate: 0.02, costPerRunUsd: 0.12,
        passed: true, notes: "Passed calibration and acceptance thresholds.",
      },
      evaluationDueAt: inDays(27),
      monthlyCostUsdEstimate: 640,
    }),
    w({
      id: "DW-2102",
      name: "Postmortem Draft Author",
      purpose: "Drafts blameless postmortems grounded in evidence; every finding needs reviewer confirmation.",
      domain: "Investigation",
      maturity: "Production Approved",
      autonomy: "L1",
      status: "Active",
      supportedServices: ["checkout-api", "orders-api", "payments-api"],
      approvedTools: ["evidence.read", "hypothesis.read", "postmortem.draft"],
      dataSources: ["Hypothesis Graph", "Evidence Store"],
      model: "gpt-4.1",
      version: "1.3.0",
      authority: {
        scope: "Any incident with reviewer",
        tools: ["evidence.read", "hypothesis.read", "postmortem.draft"],
        guardrails: ["policy.postmortem.blameless", "policy.evidence.required"],
        requiresApprovalAbove: "L1",
      },
      lastEvaluation: {
        at: inDays(-6), score: 88, calibration: 0.82, acceptanceRate: 0.66,
        successRate: 0.91, toolFailureRate: 0.01, costPerRunUsd: 0.19,
        passed: true, notes: "Acceptance improving after grounding constraints tightened.",
      },
      evaluationDueAt: inDays(24),
      monthlyCostUsdEstimate: 380,
    }),
    w({
      id: "DW-2103",
      name: "Change Safety Reviewer",
      purpose: "Reviews proposed changes for canary requirements and rollback readiness.",
      domain: "Change",
      maturity: "Production Approved",
      autonomy: "L1",
      status: "Active",
      supportedServices: ["checkout-api", "orders-api", "payments-api", "inventory-api"],
      approvedTools: ["change.read", "policy.evaluate", "runbook.validate"],
      dataSources: ["Change Registry", "Policy Store"],
      ownerName: "Marco T.",
      ownerTeam: "Change Management",
      authority: {
        scope: "All change tickets",
        tools: ["change.read", "policy.evaluate", "runbook.validate"],
        guardrails: ["policy.change.canaryrequired"],
        requiresApprovalAbove: "L1",
      },
      lastEvaluation: {
        at: inDays(-10), score: 90, calibration: 0.79, acceptanceRate: 0.74,
        successRate: 0.96, toolFailureRate: 0.01, costPerRunUsd: 0.08,
        passed: true, notes: "Calibration slightly under target; monitor next cycle.",
      },
      evaluationDueAt: inDays(20),
      monthlyCostUsdEstimate: 210,
    }),
    w({
      id: "DW-2201",
      name: "Cost Guardrail Assistant",
      purpose: "Flags cost anomalies and proposes safe scale-down windows.",
      domain: "Cost",
      maturity: "Experimental",
      autonomy: "L1",
      status: "Active",
      supportedServices: ["orders-api"],
      approvedTools: ["cost.query", "billing.read"],
      dataSources: ["FinOps Warehouse"],
      model: "claude-3.5",
      version: "0.4.2",
      authority: {
        scope: "orders-api / stage",
        tools: ["cost.query", "billing.read"],
        guardrails: ["policy.autonomy.experimental"],
        requiresApprovalAbove: "L1",
      },
      lastEvaluation: {
        at: inDays(-14), score: 68, calibration: 0.55, acceptanceRate: 0.41,
        successRate: 0.72, toolFailureRate: 0.06, costPerRunUsd: 0.05,
        passed: false, notes: "Calibration below Experimental threshold; blocked from production promotion.",
      },
      evaluationDueAt: inDays(-2),  // overdue on purpose to show state
      policyStatus: "Drift",
      monthlyCostUsdEstimate: 95,
    }),
    w({
      id: "DW-2202",
      name: "Comms Draft Assistant",
      purpose: "Drafts audience-appropriate stakeholder updates from the authoritative incident record.",
      domain: "Communications",
      maturity: "Test",
      autonomy: "L1",
      status: "Active",
      supportedServices: ["checkout-api"],
      approvedTools: ["incident.read", "comms.template"],
      dataSources: ["Incident Store"],
      ownerName: "Dana K.",
      ownerTeam: "Incident Response",
      authority: {
        scope: "Draft-only; no publish",
        tools: ["incident.read", "comms.template"],
        guardrails: ["policy.comms.approvalrequired"],
        requiresApprovalAbove: "L1",
      },
      lastEvaluation: {
        at: inDays(-1), score: 80, calibration: 0.71, acceptanceRate: 0.62,
        successRate: 0.86, toolFailureRate: 0.02, costPerRunUsd: 0.07,
        passed: true, notes: "Ready for Production Approved review.",
      },
      evaluationDueAt: inDays(29),
      monthlyCostUsdEstimate: 140,
    }),
    w({
      id: "DW-2301",
      name: "Legacy Batch Diagnoser",
      purpose: "Prior version; retained for history.",
      domain: "Reliability",
      maturity: "Production Approved",
      autonomy: "L1",
      status: "Suspended",
      supportedServices: ["orders-api"],
      approvedTools: ["logs.query"],
      dataSources: ["Loki"],
      version: "0.9.7",
      suspendedReason: "Superseded by DW-2101; tool access revoked pending decommission.",
      authority: { scope: "orders-api / prod (read)", tools: [], guardrails: ["policy.autonomy.v1"], requiresApprovalAbove: "L1" },
      lastEvaluation: {
        at: inDays(-45), score: 74, calibration: 0.62, acceptanceRate: 0.48,
        successRate: 0.81, toolFailureRate: 0.04, costPerRunUsd: 0.06,
        passed: true, notes: "Retired in favour of DW-2101.",
      },
      evaluationDueAt: inDays(-15),
      policyStatus: "Blocked",
      monthlyCostUsdEstimate: 0,
    }),
  ];
}

function seedSessions(): SessionRecord[] {
  return [
    { id: "SES-9021", workerId: "DW-2101", startedAt: inDays(0), state: "Running",        reason: "Investigating INC-10482 hypotheses.",       route: "/runops/incidents/INC-10482/hypotheses" },
    { id: "SES-9022", workerId: "DW-2102", startedAt: inDays(0), state: "Awaiting Human", reason: "Postmortem PM-10482 awaiting reviewer.",     route: "/runops/incidents/INC-10482/postmortem"  },
    { id: "SES-9023", workerId: "DW-2103", startedAt: inDays(0), state: "Running",        reason: "Reviewing CHG-20402 canary requirement.",    route: "/runops/approvals" },
  ];
}

/* ------------------------- Derived helpers ------------------------------ */

function isEvalOverdue(w: WorkerRecord): boolean {
  return new Date(w.evaluationDueAt).getTime() < Date.now();
}
function derivedStatus(w: WorkerRecord): WorkerStatus {
  if (w.status === "Suspended") return "Suspended";
  if (w.status === "Tool access revoked") return "Tool access revoked";
  if (isEvalOverdue(w)) return "Evaluation overdue";
  return "Active";
}
function maturityTone(m: Maturity): string {
  switch (m) {
    case "Production Approved": return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Test":                return "bg-blue-50 text-blue-800 border-blue-200";
    case "Experimental":        return "bg-amber-50 text-amber-800 border-amber-200";
  }
}
function statusTone(s: WorkerStatus): string {
  switch (s) {
    case "Active":              return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Suspended":           return "bg-slate-100 text-slate-700 border-slate-300";
    case "Evaluation overdue":  return "bg-amber-50 text-amber-800 border-amber-200";
    case "Tool access revoked": return "bg-rose-50 text-rose-800 border-rose-200";
  }
}
function policyTone(s: WorkerRecord["policyStatus"]): string {
  switch (s) {
    case "Compliant": return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Drift":     return "bg-amber-50 text-amber-800 border-amber-200";
    case "Blocked":   return "bg-rose-50 text-rose-800 border-rose-200";
  }
}

function pct(n: number): string { return `${Math.round(n * 100)}%`; }
function usd(n: number): string { return `$${n.toFixed(0)}`; }

/* -------------------------------- Page ---------------------------------- */

type TabKey = "all" | "production" | "test" | "experimental" | "suspended" | "attention";

type DialogKey =
  | null
  | "create"
  | "assign-service"
  | "assign-runbook"
  | "suspend"
  | "compare"
  | "quickview"
  | "sessions";

export default function DigitalWorkerCatalog() {
  const ops = useOperations();
  const navigate = useNavigate();
  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<"all" | Domain>("all");
  const [maturityFilter, setMaturityFilter] = useState<"all" | Maturity>("all");
  const [autonomyFilter, setAutonomyFilter] = useState<"all" | Autonomy>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkerStatus>("all");
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [target, setTarget] = useState<string>("");
  const [compareSel, setCompareSel] = useState<string[]>([]);
  const [inp, setInp] = useState<Record<string, string>>({});
  const [connectorDown, setConnectorDown] = useState(false);

  /* ---------------------------- Load / seed --------------------------- */
  useEffect(() => {
    let ws = readList<WorkerRecord>(WORKERS_KEY);
    if (ws.length === 0) { ws = seedWorkers(); writeList(WORKERS_KEY, ws); }
    setWorkers(ws);
    setAssignments(readList<Assignment>(ASSIGN_KEY));
    let ss = readList<SessionRecord>(SESSIONS_KEY);
    if (ss.length === 0) { ss = seedSessions(); writeList(SESSIONS_KEY, ss); }
    setSessions(ss);
  }, []);

  /* ----------------------------- Helpers ------------------------------ */

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info", entityRef?: string) => {
    ops.pushNotification({
      kind, title, detail,
      entityRef: entityRef ?? "workers.catalog",
      route: "/runops/workers",
    });
  }, [ops]);

  const persistWorkers = useCallback((next: WorkerRecord[]) => {
    writeList(WORKERS_KEY, next);
    setWorkers(next);
  }, []);

  const persistAssignments = useCallback((next: Assignment[]) => {
    writeList(ASSIGN_KEY, next);
    setAssignments(next);
  }, []);

  const persistSessions = useCallback((next: SessionRecord[]) => {
    writeList(SESSIONS_KEY, next);
    setSessions(next);
  }, []);

  const updateWorker = useCallback((id: string, patch: Partial<WorkerRecord>) => {
    const next = workers.map((w) => (w.id === id ? { ...w, ...patch, updatedAt: nowIso() } : w));
    persistWorkers(next);
    return next.find((w) => w.id === id) ?? null;
  }, [workers, persistWorkers]);

  /* ---------------------- Filters and derived views -------------------- */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workers.filter((w) => {
      const st = derivedStatus(w);
      if (tab === "production"   && w.maturity !== "Production Approved") return false;
      if (tab === "test"         && w.maturity !== "Test") return false;
      if (tab === "experimental" && w.maturity !== "Experimental") return false;
      if (tab === "suspended"    && st !== "Suspended") return false;
      if (tab === "attention"    && !(st === "Evaluation overdue" || st === "Tool access revoked" || w.policyStatus === "Drift" || w.policyStatus === "Blocked")) return false;
      if (domainFilter !== "all"   && w.domain !== domainFilter) return false;
      if (maturityFilter !== "all" && w.maturity !== maturityFilter) return false;
      if (autonomyFilter !== "all" && w.autonomy !== autonomyFilter) return false;
      if (ownerFilter !== "all"    && w.ownerName !== ownerFilter) return false;
      if (serviceFilter !== "all"  && !w.supportedServices.includes(serviceFilter)) return false;
      if (modelFilter !== "all"    && w.model !== modelFilter) return false;
      if (statusFilter !== "all"   && st !== statusFilter) return false;
      if (q) {
        const hay = `${w.id} ${w.name} ${w.purpose} ${w.ownerName} ${w.supportedServices.join(" ")} ${w.model}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [workers, tab, query, domainFilter, maturityFilter, autonomyFilter, ownerFilter, serviceFilter, modelFilter, statusFilter]);

  const owners = useMemo(() => Array.from(new Set(workers.map((w) => w.ownerName))).sort(), [workers]);
  const services = useMemo(() => Array.from(new Set(workers.flatMap((w) => w.supportedServices))).sort(), [workers]);
  const models = useMemo(() => Array.from(new Set(workers.map((w) => w.model))).sort(), [workers]);

  const summary = useMemo(() => {
    const prod = workers.filter((w) => w.maturity === "Production Approved" && derivedStatus(w) !== "Suspended").length;
    const exp = workers.filter((w) => w.maturity === "Experimental").length;
    const activeSessions = sessions.filter((s) => s.state === "Running").length;
    const attention = sessions.filter((s) => s.state === "Awaiting Human").length;
    const evals = workers.map((w) => w.lastEvaluation?.calibration).filter((n): n is number => typeof n === "number");
    const avgCalibration = evals.length ? evals.reduce((a, b) => a + b, 0) / evals.length : 0;
    const toolFail = workers.map((w) => w.lastEvaluation?.toolFailureRate).filter((n): n is number => typeof n === "number");
    const avgToolFail = toolFail.length ? toolFail.reduce((a, b) => a + b, 0) / toolFail.length : 0;
    const cost = workers.reduce((sum, w) => sum + w.monthlyCostUsdEstimate, 0);
    return { prod, exp, activeSessions, attention, avgCalibration, avgToolFail, cost };
  }, [workers, sessions]);

  /* ---------------------------- Mutations ----------------------------- */

  const openDialog = (k: DialogKey, id?: string) => {
    setDialog(k);
    setTarget(id ?? "");
    setInp({});
  };

  const doCreate = () => {
    if (!canWrite) return;
    const name = (inp.name ?? "").trim();
    if (!name) { audit("Create worker rejected", "Name is required.", "warning"); return; }
    const rec: WorkerRecord = {
      id: rid("DW"),
      name,
      purpose: inp.purpose ?? "",
      domain: (inp.domain as Domain) ?? "General",
      ownerName: inp.ownerName?.trim() || ops.role,
      ownerTeam: inp.ownerTeam?.trim() || "Platform Reliability",
      supportedServices: [ops.selectedService.name],
      maturity: "Experimental",
      autonomy: (inp.autonomy as Autonomy) ?? "L0",
      approvedTools: [],
      dataSources: [],
      model: inp.model?.trim() || "gpt-4.1",
      version: "0.1.0",
      status: "Active",
      suspendedReason: null,
      authority: { scope: `${ops.selectedService.name} / stage`, tools: [], guardrails: ["policy.autonomy.experimental"], requiresApprovalAbove: (inp.autonomy as Autonomy) ?? "L0" },
      lastEvaluation: null,
      evaluationDueAt: inDays(14),
      policyStatus: "Compliant",
      monthlyCostUsdEstimate: 50,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    persistWorkers([rec, ...workers]);
    audit(`Worker created · ${rec.id}`, `${rec.name} · maturity Experimental · evaluation due ${new Date(rec.evaluationDueAt).toLocaleDateString()}`, "info", rec.id);
    setDialog(null);
  };

  const doAssignService = () => {
    if (!canWrite || !target) return;
    const w = workers.find((x) => x.id === target); if (!w) return;
    if (derivedStatus(w) === "Suspended") { audit("Assignment rejected", `${w.id} is suspended.`, "warning", target); return; }
    const svc = inp.serviceId?.trim(); if (!svc) return;
    const asn: Assignment = {
      id: rid("ASN"), workerId: w.id, kind: "service",
      targetId: svc, targetName: svc,
      createdBy: ops.role, createdAt: nowIso(), active: true,
    };
    persistAssignments([asn, ...assignments]);
    // Add service to supported list if new.
    if (!w.supportedServices.includes(svc)) updateWorker(w.id, { supportedServices: [...w.supportedServices, svc] });
    audit(`Worker assigned to service · ${w.id}`, `${w.name} → ${svc}. Appears on Service Digital Twin.`, "info", w.id);
    setDialog(null);
  };

  const doAssignRunbook = () => {
    if (!canWrite || !target) return;
    const w = workers.find((x) => x.id === target); if (!w) return;
    if (derivedStatus(w) === "Suspended") { audit("Assignment rejected", `${w.id} is suspended.`, "warning", target); return; }
    const rb = inp.runbookId?.trim(); if (!rb) return;
    const asn: Assignment = {
      id: rid("ASN"), workerId: w.id, kind: "runbook",
      targetId: rb, targetName: inp.runbookName?.trim() || rb,
      createdBy: ops.role, createdAt: nowIso(), active: true,
    };
    persistAssignments([asn, ...assignments]);
    audit(`Worker assigned to runbook · ${w.id}`, `${w.name} → ${rb}. Appears on Runbook Detail.`, "info", w.id);
    setDialog(null);
  };

  const doSuspend = () => {
    if (!canWrite || !target) return;
    const w = workers.find((x) => x.id === target); if (!w) return;
    const reason = inp.reason?.trim() || "No reason provided.";
    updateWorker(w.id, { status: "Suspended", suspendedReason: reason });
    // Deactivate assignments; halt sessions.
    const nextAsn = assignments.map((a) => (a.workerId === w.id ? { ...a, active: false } : a));
    persistAssignments(nextAsn);
    const nextSes = sessions.map((s) => (s.workerId === w.id && s.state !== "Halted" ? { ...s, state: "Halted" as const, reason: `Suspended: ${reason}` } : s));
    persistSessions(nextSes);
    // Append operations queue entry so operators see the halted session.
    const q = readList<Record<string, unknown>>(OPS_QUEUE_KEY);
    q.push({ id: rid("OPQ"), kind: "worker.suspended", workerId: w.id, reason, at: nowIso() });
    writeList(OPS_QUEUE_KEY, q);
    audit(`Worker suspended · ${w.id}`, `${w.name}: ${reason}. Assignments frozen; running sessions halted.`, "warning", w.id);
    setDialog(null);
  };

  const doResume = (id: string) => {
    if (!canWrite) return;
    const w = workers.find((x) => x.id === id); if (!w) return;
    updateWorker(id, { status: "Active", suspendedReason: null });
    audit(`Worker resumed · ${w.id}`, `${w.name} returned to service. Assignments must be re-activated manually.`, "info", w.id);
  };

  const doCompare = () => {
    if (compareSel.length < 2) { audit("Comparison rejected", "Pick at least two workers to compare.", "warning"); return; }
    setDialog("compare");
  };

  const toggleCompare = (id: string) => {
    setCompareSel((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id].slice(-4)));
  };

  const openStudio = (id: string) => navigate(`/runops/workers/${id}/studio`);

  /* ------------------------------ Render ------------------------------ */

  if (workers.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <EntityHeader title="Digital Worker Catalog" subtitle="Loading catalog…" />
        <div className="flex flex-1 items-center justify-center bg-slate-50">
          <Card className="max-w-md text-center">
            <CardContent className="p-6">
              <Users className="mx-auto mb-2 h-6 w-6 text-slate-400" />
              <div className="text-sm font-medium text-slate-800">No digital workers yet</div>
              <div className="mt-1 text-xs text-slate-500">
                Create an Experimental worker to begin. Every new worker starts un-approved with an evaluation due in 14 days.
              </div>
              <div className="mt-3">
                <Button size="sm" onClick={() => openDialog("create")} disabled={!canWrite} aria-label="Create digital worker">
                  <PlusCircle className="mr-1 h-4 w-4" /> Create worker
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const readOnlyBadge = !canWrite && (
    <Badge className="border-amber-200 bg-amber-50 text-amber-800" variant="outline">Read-only role</Badge>
  );

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <EntityHeader
        eyebrow="Digital Workers"
        title="Digital Worker Catalog"
        subtitle="Governed members of the operations team — with authority, evaluation, and cost."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-200 bg-white">Tenant: {ops.tenant.name}</Badge>
            <Badge variant="outline" className="border-slate-200 bg-white">Service: {ops.selectedService.name}</Badge>
            <Badge variant="outline" className="border-slate-200 bg-white">Env: {ops.environment}</Badge>
            <Badge variant="outline" className="border-slate-200 bg-white">Role: {ops.role}</Badge>
            <Badge variant="outline" className="border-slate-200 bg-white">Scenario stage: {ops.stageIndex}</Badge>
            {readOnlyBadge}
            {connectorDown && (
              <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-800">Evaluation connector offline</Badge>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setConnectorDown((v) => !v)} aria-label="Toggle evaluation connector">
              <Settings2 className="mr-1 h-4 w-4" /> {connectorDown ? "Restore connector" : "Simulate connector down"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => openDialog("sessions")} aria-label="View active sessions">
              <Activity className="mr-1 h-4 w-4" /> Active sessions ({sessions.filter((s) => s.state !== "Halted").length})
            </Button>
            <Button size="sm" variant="outline" onClick={doCompare} disabled={compareSel.length < 2} aria-label="Compare selected workers">
              <GitCompare className="mr-1 h-4 w-4" /> Compare ({compareSel.length})
            </Button>
            <Button size="sm" onClick={() => openDialog("create")} disabled={!canWrite} aria-label="Create worker">
              <PlusCircle className="mr-1 h-4 w-4" /> Create worker
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto px-4 py-3">
        {/* Summary metrics */}
        <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
          <SummaryCard label="Production approved" value={summary.prod.toString()} icon={<ShieldCheck className="h-4 w-4 text-emerald-700" />} />
          <SummaryCard label="Experimental" value={summary.exp.toString()} icon={<Sparkles className="h-4 w-4 text-amber-700" />} />
          <SummaryCard label="Active sessions" value={summary.activeSessions.toString()} icon={<Activity className="h-4 w-4 text-blue-700" />} />
          <SummaryCard label="Needs intervention" value={summary.attention.toString()} icon={<AlertTriangle className="h-4 w-4 text-rose-700" />} />
          <SummaryCard label="Avg calibration" value={summary.avgCalibration.toFixed(2)} icon={<Scale className="h-4 w-4 text-slate-700" />} />
          <SummaryCard label="Tool failure rate" value={pct(summary.avgToolFail)} icon={<Wrench className="h-4 w-4 text-slate-700" />} />
          <SummaryCard label="Est. monthly cost" value={usd(summary.cost)} icon={<Layers className="h-4 w-4 text-slate-700" />} />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="mb-3 flex flex-wrap">
            <TabsTrigger value="all"          aria-label="All workers tab">All <Badge variant="secondary" className="ml-2">{workers.length}</Badge></TabsTrigger>
            <TabsTrigger value="production"   aria-label="Production approved tab">Production <Badge variant="secondary" className="ml-2">{workers.filter((w) => w.maturity === "Production Approved").length}</Badge></TabsTrigger>
            <TabsTrigger value="test"         aria-label="Test workers tab">Test <Badge variant="secondary" className="ml-2">{workers.filter((w) => w.maturity === "Test").length}</Badge></TabsTrigger>
            <TabsTrigger value="experimental" aria-label="Experimental workers tab">Experimental <Badge variant="secondary" className="ml-2">{workers.filter((w) => w.maturity === "Experimental").length}</Badge></TabsTrigger>
            <TabsTrigger value="suspended"    aria-label="Suspended workers tab">Suspended <Badge variant="secondary" className="ml-2">{workers.filter((w) => derivedStatus(w) === "Suspended").length}</Badge></TabsTrigger>
            <TabsTrigger value="attention"    aria-label="Needs attention tab">Attention</TabsTrigger>
          </TabsList>

          {(["all", "production", "test", "experimental", "suspended", "attention"] as TabKey[]).map((t) => (
            <TabsContent value={t} key={t}>
              <Card>
                <CardContent className="p-4">
                  {/* Filters */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input value={query} onChange={(e) => setQuery(e.target.value)} className="w-64 pl-8" placeholder="Search id, name, owner, service…" aria-label="Search workers" />
                    </div>
                    <FilterSelect label="Domain" value={domainFilter} onChange={(v) => setDomainFilter(v as "all" | Domain)}
                      options={["all", "Reliability", "Change", "Investigation", "Communications", "Data", "Security", "Cost", "General"]} />
                    <FilterSelect label="Maturity" value={maturityFilter} onChange={(v) => setMaturityFilter(v as "all" | Maturity)}
                      options={["all", "Production Approved", "Test", "Experimental"]} />
                    <FilterSelect label="Autonomy" value={autonomyFilter} onChange={(v) => setAutonomyFilter(v as "all" | Autonomy)}
                      options={["all", "L0", "L1", "L2", "L3", "L4"]} />
                    <FilterSelect label="Owner" value={ownerFilter} onChange={(v) => setOwnerFilter(v)}
                      options={["all", ...owners]} />
                    <FilterSelect label="Service" value={serviceFilter} onChange={(v) => setServiceFilter(v)}
                      options={["all", ...services]} />
                    <FilterSelect label="Model" value={modelFilter} onChange={(v) => setModelFilter(v)}
                      options={["all", ...models]} />
                    <FilterSelect label="Status" value={statusFilter} onChange={(v) => setStatusFilter(v as "all" | WorkerStatus)}
                      options={["all", "Active", "Suspended", "Evaluation overdue", "Tool access revoked"]} />
                    <div className="ml-auto text-xs text-slate-500">{filtered.length} of {workers.length}</div>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                      No workers match the current filters.
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {filtered.map((w) => (
                        <WorkerCard
                          key={w.id}
                          worker={w}
                          selected={compareSel.includes(w.id)}
                          onToggleCompare={() => toggleCompare(w.id)}
                          onQuickView={() => openDialog("quickview", w.id)}
                          onStudio={() => openStudio(w.id)}
                          onAssignService={() => openDialog("assign-service", w.id)}
                          onAssignRunbook={() => openDialog("assign-runbook", w.id)}
                          onSuspend={() => openDialog("suspend", w.id)}
                          onResume={() => doResume(w.id)}
                          onSessions={() => { setTarget(w.id); setDialog("sessions"); }}
                          canWrite={canWrite}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* -------------------------------- Dialogs -------------------------------- */}
      <Dialog open={dialog === "create"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create digital worker</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Name" onChange={(e) => setInp((s) => ({ ...s, name: e.target.value }))} aria-label="Name" />
            <Textarea placeholder="Purpose" onChange={(e) => setInp((s) => ({ ...s, purpose: e.target.value }))} aria-label="Purpose" />
            <div className="grid grid-cols-2 gap-2">
              <Select onValueChange={(v) => setInp((s) => ({ ...s, domain: v }))}>
                <SelectTrigger aria-label="Domain"><SelectValue placeholder="Domain" /></SelectTrigger>
                <SelectContent>
                  {(["Reliability", "Change", "Investigation", "Communications", "Data", "Security", "Cost", "General"] as Domain[]).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={(v) => setInp((s) => ({ ...s, autonomy: v }))}>
                <SelectTrigger aria-label="Autonomy"><SelectValue placeholder="Autonomy (L0-L4)" /></SelectTrigger>
                <SelectContent>
                  {(["L0", "L1", "L2", "L3", "L4"] as Autonomy[]).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Owner name" onChange={(e) => setInp((s) => ({ ...s, ownerName: e.target.value }))} aria-label="Owner name" />
              <Input placeholder="Owner team" onChange={(e) => setInp((s) => ({ ...s, ownerTeam: e.target.value }))} aria-label="Owner team" />
            </div>
            <Input placeholder="Model" defaultValue="gpt-4.1" onChange={(e) => setInp((s) => ({ ...s, model: e.target.value }))} aria-label="Model" />
            <div className="text-xs text-slate-500">New workers start as <strong>Experimental</strong>. Production promotion requires a passing evaluation.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "assign-service"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign to service</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Service id (e.g. checkout-api)" onChange={(e) => setInp((s) => ({ ...s, serviceId: e.target.value }))} aria-label="Service id" />
            <div className="text-xs text-slate-500">Appears on Service Digital Twin. Cannot assign a suspended worker.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doAssignService}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "assign-runbook"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign to runbook</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="Runbook id (e.g. RB-CO-014)" onChange={(e) => setInp((s) => ({ ...s, runbookId: e.target.value }))} aria-label="Runbook id" />
            <Input placeholder="Runbook name" onChange={(e) => setInp((s) => ({ ...s, runbookName: e.target.value }))} aria-label="Runbook name" />
            <div className="text-xs text-slate-500">Appears on Runbook Detail. Cannot assign a suspended worker.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={doAssignRunbook}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "suspend"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Suspend worker</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Textarea placeholder="Reason (routed to AI Governance and Operations Queue)" onChange={(e) => setInp((s) => ({ ...s, reason: e.target.value }))} aria-label="Suspension reason" />
            <div className="text-xs text-slate-500">Suspension freezes all assignments and halts running sessions. History is preserved.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={doSuspend}>Suspend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "quickview"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Worker quick view</DialogTitle></DialogHeader>
          {(() => {
            const w = workers.find((x) => x.id === target); if (!w) return null;
            const st = derivedStatus(w);
            const workerAssignments = assignments.filter((a) => a.workerId === w.id);
            const workerSessions = sessions.filter((s) => s.workerId === w.id);
            return (
              <div className="grid gap-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{w.id}</span>
                  <span className="font-semibold text-slate-900">{w.name}</span>
                  <Badge variant="outline" className={cn("text-[10px]", maturityTone(w.maturity))}>{w.maturity}</Badge>
                  <Badge variant="outline" className={cn("text-[10px]", statusTone(st))}>{st}</Badge>
                  <Badge variant="outline" className={cn("text-[10px]", policyTone(w.policyStatus))}>Policy: {w.policyStatus}</Badge>
                  <Badge variant="outline" className="text-[10px]">Autonomy {w.autonomy}</Badge>
                  <Badge variant="outline" className="text-[10px]">v{w.version}</Badge>
                </div>
                <div className="text-slate-700">{w.purpose}</div>
                <div className="grid gap-2 md:grid-cols-2">
                  <MetaBlock label="Owner">{w.ownerName} · {w.ownerTeam}</MetaBlock>
                  <MetaBlock label="Model">{w.model}</MetaBlock>
                  <MetaBlock label="Supported services">{w.supportedServices.join(", ") || "—"}</MetaBlock>
                  <MetaBlock label="Data sources">{w.dataSources.join(", ") || "—"}</MetaBlock>
                  <MetaBlock label="Approved tools">{w.approvedTools.join(", ") || "—"}</MetaBlock>
                  <MetaBlock label="Authority scope">{w.authority.scope}</MetaBlock>
                  <MetaBlock label="Guardrails">{w.authority.guardrails.join(", ")}</MetaBlock>
                  <MetaBlock label="Approval required above">{w.authority.requiresApprovalAbove}</MetaBlock>
                  <MetaBlock label="Est. monthly cost">{usd(w.monthlyCostUsdEstimate)}</MetaBlock>
                  <MetaBlock label="Evaluation due">{new Date(w.evaluationDueAt).toLocaleDateString()}</MetaBlock>
                </div>

                {w.lastEvaluation ? (
                  <div className="rounded-md border border-slate-200 bg-white p-2">
                    <div className="mb-1 text-xs font-semibold text-slate-700">Last evaluation · {new Date(w.lastEvaluation.at).toLocaleDateString()}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                      <Metric label="Score" value={`${w.lastEvaluation.score}/100`} />
                      <Metric label="Success" value={pct(w.lastEvaluation.successRate)} />
                      <Metric label="Acceptance" value={pct(w.lastEvaluation.acceptanceRate)} />
                      <Metric label="Calibration" value={w.lastEvaluation.calibration.toFixed(2)} />
                      <Metric label="Tool failures" value={pct(w.lastEvaluation.toolFailureRate)} />
                      <Metric label="Cost/run" value={`$${w.lastEvaluation.costPerRunUsd.toFixed(2)}`} />
                      <Metric label="Result" value={w.lastEvaluation.passed ? "Passed" : "Failed"} />
                    </div>
                    <div className="mt-1 text-xs text-slate-600">{w.lastEvaluation.notes}</div>
                    <div className="mt-1 text-[11px] text-slate-500">Evidence: last evaluation record; grounding constraints from policy.autonomy.v1. Uncertainty: calibration confidence interval ±0.05.</div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-slate-300 bg-white p-2 text-xs text-slate-500">
                    No evaluation on record yet. Schedule one before promoting to Test or Production.
                  </div>
                )}

                {w.suspendedReason && (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
                    <ShieldAlert className="mr-1 inline h-3.5 w-3.5" /> Suspended: {w.suspendedReason}
                  </div>
                )}

                <div>
                  <div className="mb-1 text-xs font-semibold text-slate-700">Assignments ({workerAssignments.length})</div>
                  {workerAssignments.length === 0 ? (
                    <div className="text-xs text-slate-500">No active assignments.</div>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      {workerAssignments.map((a) => (
                        <li key={a.id} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{a.kind}</Badge>
                          <span>{a.targetName}</span>
                          {!a.active && <Badge variant="outline" className="text-[10px] border-slate-300">frozen</Badge>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <div className="mb-1 text-xs font-semibold text-slate-700">Sessions ({workerSessions.length})</div>
                  {workerSessions.length === 0 ? (
                    <div className="text-xs text-slate-500">No sessions on record.</div>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      {workerSessions.map((s) => (
                        <li key={s.id} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{s.state}</Badge>
                          <button className="text-blue-700 underline-offset-2 hover:underline" onClick={() => navigate(s.route)} aria-label={`Open session ${s.id}`}>
                            {s.id}
                          </button>
                          <span className="text-slate-500">· {s.reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Close</Button>
            <Button onClick={() => { if (target) openStudio(target); }}>
              <ExternalLink className="mr-1 h-4 w-4" /> Open Studio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "sessions"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Active sessions</DialogTitle></DialogHeader>
          {sessions.length === 0 ? (
            <div className="text-sm text-slate-500">No sessions on record.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {sessions.map((s) => {
                const w = workers.find((x) => x.id === s.workerId);
                return (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white p-2">
                    <div>
                      <div className="font-mono text-xs text-slate-500">{s.id}</div>
                      <div className="font-medium text-slate-900">{w?.name ?? s.workerId}</div>
                      <div className="text-xs text-slate-600">{s.reason}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{s.state}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => navigate(s.route)} aria-label="Open session route">
                        <ExternalLink className="h-3.5 w-3.5" /> Open
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Close</Button>
            <Button onClick={() => navigate("/runops/workers/collaboration/CO-1")}>
              <Users className="mr-1 h-4 w-4" /> Multi-agent collaboration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "compare"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Compare workers</DialogTitle></DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <th className="py-2 pr-2">Attribute</th>
                  {compareSel.map((id) => {
                    const w = workers.find((x) => x.id === id);
                    return <th key={id} className="py-2 pr-2">{w?.name ?? id}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {([
                  ["ID", (w: WorkerRecord) => w.id],
                  ["Domain", (w: WorkerRecord) => w.domain],
                  ["Maturity", (w: WorkerRecord) => w.maturity],
                  ["Autonomy", (w: WorkerRecord) => w.autonomy],
                  ["Model", (w: WorkerRecord) => w.model],
                  ["Version", (w: WorkerRecord) => w.version],
                  ["Status", (w: WorkerRecord) => derivedStatus(w)],
                  ["Owner", (w: WorkerRecord) => w.ownerName],
                  ["Services", (w: WorkerRecord) => w.supportedServices.join(", ")],
                  ["Tools", (w: WorkerRecord) => w.approvedTools.join(", ") || "—"],
                  ["Success rate", (w: WorkerRecord) => w.lastEvaluation ? pct(w.lastEvaluation.successRate) : "—"],
                  ["Acceptance", (w: WorkerRecord) => w.lastEvaluation ? pct(w.lastEvaluation.acceptanceRate) : "—"],
                  ["Calibration", (w: WorkerRecord) => w.lastEvaluation ? w.lastEvaluation.calibration.toFixed(2) : "—"],
                  ["Tool failures", (w: WorkerRecord) => w.lastEvaluation ? pct(w.lastEvaluation.toolFailureRate) : "—"],
                  ["Monthly cost", (w: WorkerRecord) => usd(w.monthlyCostUsdEstimate)],
                ] as [string, (w: WorkerRecord) => string][]).map(([label, get]) => (
                  <tr key={label} className="border-b border-slate-100">
                    <td className="py-1 pr-2 font-medium text-slate-700">{label}</td>
                    {compareSel.map((id) => {
                      const w = workers.find((x) => x.id === id);
                      return <td key={id} className="py-1 pr-2 text-slate-800">{w ? get(w) : "—"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareSel([])}>Clear selection</Button>
            <Button onClick={() => setDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------------------- Subcomponents ------------------------------ */

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 p-3">
        <div className="rounded-md bg-slate-100 p-1.5">{icon}</div>
        <div className="min-w-0">
          <div className="truncate text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
          <div className="truncate text-sm font-semibold text-slate-900">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-36" aria-label={`Filter by ${label.toLowerCase()}`}><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o}>{o === "all" ? `${label}: all` : o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function MetaBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xs text-slate-800">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-1.5">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xs font-semibold text-slate-800">{value}</div>
    </div>
  );
}

interface WorkerCardProps {
  worker: WorkerRecord;
  selected: boolean;
  onToggleCompare: () => void;
  onQuickView: () => void;
  onStudio: () => void;
  onAssignService: () => void;
  onAssignRunbook: () => void;
  onSuspend: () => void;
  onResume: () => void;
  onSessions: () => void;
  canWrite: boolean;
}

function WorkerCard({ worker: w, selected, onToggleCompare, onQuickView, onStudio, onAssignService, onAssignRunbook, onSuspend, onResume, onSessions, canWrite }: WorkerCardProps) {
  const st = derivedStatus(w);
  const suspended = st === "Suspended";
  return (
    <Card className={cn(selected && "ring-2 ring-blue-500")}>
      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-mono text-[10px] text-slate-500">{w.id}</div>
            <div className="flex items-center gap-1 truncate">
              <Bot className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="truncate text-sm font-semibold text-slate-900">{w.name}</span>
            </div>
            <div className="text-[11px] text-slate-600">{w.purpose}</div>
          </div>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleCompare}
            aria-label={`Select ${w.name} for comparison`}
            className="mt-1 h-4 w-4 cursor-pointer"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className={cn("text-[10px]", maturityTone(w.maturity))}>{w.maturity}</Badge>
          <Badge variant="outline" className={cn("text-[10px]", statusTone(st))}>{st}</Badge>
          <Badge variant="outline" className={cn("text-[10px]", policyTone(w.policyStatus))}>Policy: {w.policyStatus}</Badge>
          <Badge variant="outline" className="text-[10px]">Autonomy {w.autonomy}</Badge>
          <Badge variant="outline" className="text-[10px]">{w.domain}</Badge>
          <Badge variant="outline" className="text-[10px]">v{w.version}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[11px]">
          <div>
            <div className="text-slate-500">Success</div>
            <div className="font-medium text-slate-800">{w.lastEvaluation ? pct(w.lastEvaluation.successRate) : "—"}</div>
          </div>
          <div>
            <div className="text-slate-500">Acceptance</div>
            <div className="font-medium text-slate-800">{w.lastEvaluation ? pct(w.lastEvaluation.acceptanceRate) : "—"}</div>
          </div>
          <div>
            <div className="text-slate-500">Calibration</div>
            <div className="font-medium text-slate-800">{w.lastEvaluation ? w.lastEvaluation.calibration.toFixed(2) : "—"}</div>
          </div>
          <div>
            <div className="text-slate-500">Tool failures</div>
            <div className="font-medium text-slate-800">{w.lastEvaluation ? pct(w.lastEvaluation.toolFailureRate) : "—"}</div>
          </div>
          <div>
            <div className="text-slate-500">Cost/mo</div>
            <div className="font-medium text-slate-800">{usd(w.monthlyCostUsdEstimate)}</div>
          </div>
          <div>
            <div className="text-slate-500">Owner</div>
            <div className="truncate font-medium text-slate-800">{w.ownerName}</div>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          <span className="font-medium text-slate-600">Authority:</span> {w.authority.scope} · requires approval above {w.authority.requiresApprovalAbove}
        </div>
        {st === "Evaluation overdue" && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
            <AlertTriangle className="mr-1 inline h-3 w-3" /> Evaluation overdue since {new Date(w.evaluationDueAt).toLocaleDateString()}. Routed to AI Governance.
          </div>
        )}
        {suspended && w.suspendedReason && (
          <div className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
            <ShieldAlert className="mr-1 inline h-3 w-3" /> Suspended: {w.suspendedReason}
          </div>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <Button size="sm" variant="outline" onClick={onQuickView} aria-label={`Open quick view for ${w.name}`}>
            <ClipboardList className="mr-1 h-3.5 w-3.5" /> Quick view
          </Button>
          <Button size="sm" variant="outline" onClick={onStudio} aria-label={`Open Studio for ${w.name}`}>
            <Settings2 className="mr-1 h-3.5 w-3.5" /> Studio
          </Button>
          <Button size="sm" variant="outline" onClick={onSessions} aria-label={`View sessions for ${w.name}`}>
            <Activity className="mr-1 h-3.5 w-3.5" /> Sessions
          </Button>
          <Button size="sm" variant="outline" onClick={onAssignService} disabled={!canWrite || suspended} aria-label={`Assign ${w.name} to a service`} title={suspended ? "Suspended workers cannot be assigned" : undefined}>
            Assign svc
          </Button>
          <Button size="sm" variant="outline" onClick={onAssignRunbook} disabled={!canWrite || suspended} aria-label={`Assign ${w.name} to a runbook`} title={suspended ? "Suspended workers cannot be assigned" : undefined}>
            Assign runbook
          </Button>
          {suspended ? (
            <Button size="sm" variant="outline" onClick={onResume} disabled={!canWrite} aria-label={`Resume ${w.name}`}>
              <Play className="mr-1 h-3.5 w-3.5" /> Resume
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onSuspend} disabled={!canWrite} aria-label={`Suspend ${w.name}`}>
              <Pause className="mr-1 h-3.5 w-3.5" /> Suspend
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
