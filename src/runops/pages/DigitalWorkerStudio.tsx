/**
 * Page 35 · Digital Worker Studio
 * Route: /runops/workers/:workerId/studio
 *
 * Configures a single digital worker: role, tools, knowledge, authority,
 * memory, safeguards, evaluations, versions. Every mutation emits an audit +
 * domain event via ops.pushNotification and persists to localStorage. Published
 * configuration flows into the catalog, AI Governance, Integration Hub, and
 * runbook launch enforcement.
 *
 * Persistence (localStorage):
 *   runops.digitalworkers.v1           → WorkerRecord[] (canonical catalog)
 *   runops.workerstudio.drafts.v1      → DraftMap keyed by workerId
 *   runops.workerstudio.versions.v1    → VersionRecord[]  (audit trail)
 *   runops.workerstudio.evalsuites.v1  → EvalSuiteRun[]   (governance results)
 *   runops.workerstudio.sandbox.v1     → SandboxRun[]     (activity log)
 *   runops.aigovernance.evals.v1       → EvaluationRecord[] (shared w/ catalog)
 *   runops.workersessions.v1           → SessionRecord[]  (suspend halts these)
 *   runops.integrationhub.tools.v1     → ToolGrantEvent[] (audit for tools)
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ActivitySquare, AlertTriangle, ArrowLeft, BookOpen, Brain,
  CheckCircle2, ClipboardList, FlaskConical, GitCompare, KeyRound,
  Layers, Lock, Pause, Play, PlayCircle, PlusCircle, RefreshCw,
  Send, ShieldAlert, ShieldCheck, Sparkles, Trash2, Wrench,
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
type Domain = "Reliability" | "Change" | "Investigation" | "Communications" | "Data" | "Security" | "Cost" | "General";
type LifecycleState = "Draft" | "Under Review" | "Production Approved" | "Evaluation Failed" | "Tool Unavailable" | "Suspended";

interface AuthorityBoundary {
  scope: string;
  tools: string[];
  guardrails: string[];
  requiresApprovalAbove: Autonomy;
}

interface EvaluationSummary {
  at: string;
  score: number;
  calibration: number;
  acceptanceRate: number;
  successRate: number;
  toolFailureRate: number;
  costPerRunUsd: number;
  passed: boolean;
  notes: string;
}

interface WorkerRecord {
  id: string;
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
  evaluationDueAt: string;
  policyStatus: "Compliant" | "Drift" | "Blocked";
  monthlyCostUsdEstimate: number;
  createdAt: string;
  updatedAt: string;
}

interface ToolGrant {
  id: string;                 // e.g. "metrics.query"
  label: string;
  category: "Read" | "Preview" | "Mutate" | "Comms";
  connector: string;          // e.g. "Datadog", "GitHub"
  scope: string;              // e.g. "checkout-api / prod"
  available: boolean;         // false → "Tool unavailable"
}

interface KnowledgeSource {
  id: string;                 // KN-####
  label: string;
  kind: "Runbook" | "Postmortem" | "Doc" | "Ticket" | "Telemetry";
  classification: "Public" | "Internal" | "Confidential" | "Restricted";
  citationRequired: boolean;
}

interface EscalationRule {
  id: string;
  condition: string;
  action: "Human review" | "Halt session" | "Notify commander" | "Open ticket";
  channel: string;
}

interface WorkerDraft {
  purpose: string;
  domain: Domain;
  autonomy: Autonomy;
  instructions: string;
  approvedModels: string[];
  primaryModel: string;
  fallbackModel: string;
  toolGrants: string[];               // ToolGrant.id
  knowledgeSources: KnowledgeSource[];
  environments: ("dev" | "stage" | "prod")[];
  dataClassificationMax: "Public" | "Internal" | "Confidential" | "Restricted";
  memoryRetentionDays: number;
  confidenceThreshold: number;         // 0-1
  costLimitUsdMonthly: number;
  latencyTargetMs: number;
  humanOversight: "Required" | "Sampled" | "Opt-in";
  escalations: EscalationRule[];
  killSwitchEnabled: boolean;
  authority: AuthorityBoundary;
  baseVersion: string;                 // published version this draft branched from
  updatedAt: string;
  updatedBy: string;
  lifecycle: LifecycleState;
  submitReason: string | null;
  reviewNotes: string | null;
}

interface VersionRecord {
  id: string;                 // VER-####
  workerId: string;
  version: string;            // semver-ish
  publishedAt: string;
  publishedBy: string;
  publishedByIdentity: string; // worker-service-identity separate from human
  approvedBy: string | null;   // must differ from publisher (no self-approval)
  approvalAt: string | null;
  configSnapshot: WorkerDraft;
  changeSummary: string;
  evaluationRef: string | null;
}

interface EvalSuiteRun {
  id: string;                 // ES-####
  workerId: string;
  versionId: string | null;
  at: string;
  passed: boolean;
  summary: EvaluationSummary;
  cases: { name: string; passed: boolean; detail: string }[];
  evidence: string[];
  sources: string[];
}

interface SandboxRun {
  id: string;                 // SBX-####
  workerId: string;
  at: string;
  prompt: string;
  outcome: "Completed" | "Escalated" | "Halted";
  toolsUsed: string[];
  latencyMs: number;
  costUsd: number;
  reasoning: string;
  citations: string[];
}

interface SessionRecord {
  id: string;
  workerId: string;
  startedAt: string;
  state: "Running" | "Awaiting Human" | "Halted";
  reason: string;
  route: string;
}

/* -------------------------- Storage helpers ----------------------------- */

const WORKERS_KEY   = "runops.digitalworkers.v1";
const DRAFTS_KEY    = "runops.workerstudio.drafts.v1";
const VERSIONS_KEY  = "runops.workerstudio.versions.v1";
const SUITES_KEY    = "runops.workerstudio.evalsuites.v1";
const SANDBOX_KEY   = "runops.workerstudio.sandbox.v1";
const EVAL_KEY      = "runops.aigovernance.evals.v1";
const SESSIONS_KEY  = "runops.workersessions.v1";
const HUB_KEY       = "runops.integrationhub.tools.v1";

function readList<T>(k: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "[]"); return Array.isArray(v) ? (v as T[]) : []; }
  catch { return []; }
}
function readMap<T>(k: string): Record<string, T> {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "{}"); return v && typeof v === "object" ? (v as Record<string, T>) : {}; }
  catch { return {}; }
}
function writeList<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)); }
function writeMap<T>(k: string, v: Record<string, T>) { localStorage.setItem(k, JSON.stringify(v)); }

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;
const inDays = (d: number) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString(); };

/* --------------------------- Catalog defaults --------------------------- */

/** DW-DB-03 is the canonical scenario worker. If the catalog is empty or the
 * requested worker is missing, we seed a governed record here. */
function ensureCanonicalWorker(list: WorkerRecord[], workerId: string): { list: WorkerRecord[]; worker: WorkerRecord | null } {
  const existing = list.find((w) => w.id === workerId);
  if (existing) return { list, worker: existing };
  if (workerId !== "DW-DB-03") return { list, worker: null };
  const rec: WorkerRecord = {
    id: "DW-DB-03",
    name: "Database SRE Coworker",
    purpose: "Diagnose database saturation, drift, and query regressions for checkout-api and recommend safe mitigations.",
    domain: "Reliability",
    ownerName: "Priya S.",
    ownerTeam: "Platform Reliability",
    supportedServices: ["checkout-api", "orders-api"],
    maturity: "Production Approved",
    autonomy: "L2",
    approvedTools: ["metrics.query", "logs.query", "db.explain", "runbook.execute:preview"],
    dataSources: ["Datadog", "Loki", "pg_stat_statements"],
    model: "gpt-4.1",
    version: "1.4.0",
    status: "Active",
    suspendedReason: null,
    authority: {
      scope: "checkout-api / prod (read + preview)",
      tools: ["metrics.query", "logs.query", "db.explain", "runbook.execute:preview"],
      guardrails: ["policy.autonomy.v1", "policy.execution.leastprivilege", "policy.data.pii.masked"],
      requiresApprovalAbove: "L2",
    },
    lastEvaluation: {
      at: inDays(-4), score: 91, calibration: 0.84, acceptanceRate: 0.69,
      successRate: 0.93, toolFailureRate: 0.02, costPerRunUsd: 0.14,
      passed: true, notes: "Meets Production Approved bar. Watch cost drift.",
    },
    evaluationDueAt: inDays(26),
    policyStatus: "Compliant",
    monthlyCostUsdEstimate: 520,
    createdAt: inDays(-90),
    updatedAt: inDays(-4),
  };
  return { list: [rec, ...list], worker: rec };
}

/** Tool catalog is deterministic per worker service scope. */
function catalogTools(): ToolGrant[] {
  return [
    { id: "metrics.query",             label: "Metrics query",             category: "Read",    connector: "Datadog",      scope: "checkout-api / prod",  available: true  },
    { id: "logs.query",                label: "Logs query",                category: "Read",    connector: "Loki",         scope: "checkout-api / prod",  available: true  },
    { id: "traces.query",              label: "Traces query",              category: "Read",    connector: "Tempo",        scope: "checkout-api / prod",  available: true  },
    { id: "db.explain",                label: "DB EXPLAIN",                category: "Read",    connector: "Postgres RO",  scope: "checkout-db / prod",   available: true  },
    { id: "runbook.execute:preview",   label: "Runbook preview",           category: "Preview", connector: "RunOps",       scope: "checkout-api / prod",  available: true  },
    { id: "runbook.execute:approved",  label: "Runbook execute (approved)",category: "Mutate",  connector: "RunOps",       scope: "checkout-api / prod",  available: true  },
    { id: "kb.search",                 label: "Knowledge search",          category: "Read",    connector: "Neugain KB",   scope: "tenant",               available: true  },
    { id: "incident.timeline.write",   label: "Incident timeline write",   category: "Comms",   connector: "RunOps",       scope: "incident",             available: true  },
    { id: "comms.template",            label: "Comms template",            category: "Comms",   connector: "Slack",        scope: "channel:incidents",    available: true  },
    { id: "cost.query",                label: "Cost query",                category: "Read",    connector: "FinOps",       scope: "tenant",               available: false },
    { id: "db.write",                  label: "DB write",                  category: "Mutate",  connector: "Postgres RW",  scope: "checkout-db / prod",   available: false },
  ];
}

function defaultDraftFor(w: WorkerRecord): WorkerDraft {
  return {
    purpose: w.purpose,
    domain: w.domain,
    autonomy: w.autonomy,
    instructions:
      "You are a governed Database SRE Coworker. Ground every claim in metrics, logs, or EXPLAIN evidence with a source. " +
      "Never modify data. Recommend, do not execute above L2. Cite runbooks by ID.",
    approvedModels: ["gpt-4.1", "claude-3.5-sonnet"],
    primaryModel: w.model,
    fallbackModel: "claude-3.5-sonnet",
    toolGrants: [...w.approvedTools],
    knowledgeSources: [
      { id: "KN-1001", label: "Checkout SRE Runbooks",  kind: "Runbook",    classification: "Internal",     citationRequired: true },
      { id: "KN-1002", label: "Postmortem archive",     kind: "Postmortem", classification: "Internal",     citationRequired: true },
      { id: "KN-1003", label: "Datadog dashboards",     kind: "Telemetry",  classification: "Internal",     citationRequired: true },
      { id: "KN-1004", label: "Customer data (masked)", kind: "Doc",        classification: "Confidential", citationRequired: true },
    ],
    environments: ["stage", "prod"],
    dataClassificationMax: "Confidential",
    memoryRetentionDays: 30,
    confidenceThreshold: 0.7,
    costLimitUsdMonthly: 750,
    latencyTargetMs: 4000,
    humanOversight: "Required",
    escalations: [
      { id: "ESC-1", condition: "confidence < threshold", action: "Human review",     channel: "commander" },
      { id: "ESC-2", condition: "mutating tool proposed", action: "Human review",     channel: "commander" },
      { id: "ESC-3", condition: "tool_failure_rate > 5%", action: "Halt session",     channel: "platform-ops" },
      { id: "ESC-4", condition: "restricted data touched",action: "Halt session",     channel: "security" },
    ],
    killSwitchEnabled: true,
    authority: { ...w.authority },
    baseVersion: w.version,
    updatedAt: w.updatedAt,
    updatedBy: w.ownerName,
    lifecycle: "Draft",
    submitReason: null,
    reviewNotes: null,
  };
}

/* --------------------------- Tone helpers ------------------------------ */

function lifecycleTone(s: LifecycleState): string {
  switch (s) {
    case "Draft":                return "bg-slate-100 text-slate-700 border-slate-300";
    case "Under Review":         return "bg-blue-50 text-blue-800 border-blue-200";
    case "Production Approved":  return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Evaluation Failed":    return "bg-rose-50 text-rose-800 border-rose-200";
    case "Tool Unavailable":     return "bg-amber-50 text-amber-800 border-amber-200";
    case "Suspended":            return "bg-slate-200 text-slate-800 border-slate-400";
  }
}

/* ================================ Page ================================= */

type TabKey =
  | "purpose" | "instructions" | "models" | "tools" | "knowledge"
  | "scope"   | "authority"    | "memory" | "escalation"
  | "evals"   | "versions"     | "activity";

type DialogKey = null | "submit" | "publish" | "suspend" | "compare" | "sandbox" | "eval" | "addKnowledge";

export default function DigitalWorkerStudio() {
  const { workerId = "" } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const ops = useOperations();
  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [worker, setWorker] = useState<WorkerRecord | null>(null);
  const [draft, setDraft] = useState<WorkerDraft | null>(null);
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [suites, setSuites] = useState<EvalSuiteRun[]>([]);
  const [sandbox, setSandbox] = useState<SandboxRun[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<TabKey>("purpose");
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [inp, setInp] = useState<Record<string, string>>({});
  const [compareSel, setCompareSel] = useState<[string, string] | null>(null);
  const [connectorDown, setConnectorDown] = useState(false);

  const tools = useMemo(() => catalogTools(), []);
  const toolById = useMemo(() => new Map(tools.map((t) => [t.id, t])), [tools]);

  /* ---------------------------- Load ---------------------------------- */

  useEffect(() => {
    if (!workerId) { setNotFound(true); return; }
    const rawList = readList<WorkerRecord>(WORKERS_KEY);
    const { list, worker: w } = ensureCanonicalWorker(rawList, workerId);
    if (list !== rawList) writeList(WORKERS_KEY, list);
    if (!w) { setNotFound(true); return; }
    setWorker(w);

    const drafts = readMap<WorkerDraft>(DRAFTS_KEY);
    const existing = drafts[workerId];
    if (existing) {
      setDraft(existing);
    } else {
      const d = defaultDraftFor(w);
      drafts[workerId] = d;
      writeMap(DRAFTS_KEY, drafts);
      setDraft(d);
    }

    setVersions(readList<VersionRecord>(VERSIONS_KEY).filter((v) => v.workerId === workerId));
    setSuites(readList<EvalSuiteRun>(SUITES_KEY).filter((s) => s.workerId === workerId));
    setSandbox(readList<SandboxRun>(SANDBOX_KEY).filter((s) => s.workerId === workerId));
  }, [workerId]);

  /* --------------------------- Persist helpers ------------------------ */

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
    ops.pushNotification({
      kind, title, detail,
      entityRef: workerId,
      route: `/runops/workers/${workerId}/studio`,
    });
  }, [ops, workerId]);

  const persistWorker = useCallback((patch: Partial<WorkerRecord>) => {
    if (!worker) return null;
    const next: WorkerRecord = { ...worker, ...patch, updatedAt: nowIso() };
    const list = readList<WorkerRecord>(WORKERS_KEY).map((w) => (w.id === worker.id ? next : w));
    writeList(WORKERS_KEY, list);
    setWorker(next);
    return next;
  }, [worker]);

  const persistDraft = useCallback((next: WorkerDraft) => {
    const drafts = readMap<WorkerDraft>(DRAFTS_KEY);
    drafts[workerId] = { ...next, updatedAt: nowIso(), updatedBy: ops.role };
    writeMap(DRAFTS_KEY, drafts);
    setDraft(drafts[workerId]);
  }, [workerId, ops.role]);

  const editDraft = useCallback((mut: (d: WorkerDraft) => WorkerDraft) => {
    if (!draft || !canWrite) return;
    persistDraft(mut(draft));
  }, [draft, canWrite, persistDraft]);

  /* ---------------------------- Derived ------------------------------- */

  const derivedLifecycle: LifecycleState = useMemo(() => {
    if (!worker || !draft) return "Draft";
    if (worker.status === "Suspended") return "Suspended";
    const missingTool = draft.toolGrants.some((id) => {
      const t = toolById.get(id);
      return !t || !t.available;
    });
    if (missingTool) return "Tool Unavailable";
    const lastSuite = suites[0];
    if (lastSuite && !lastSuite.passed) return "Evaluation Failed";
    return draft.lifecycle;
  }, [worker, draft, suites, toolById]);

  const latestPublished = useMemo(() => versions[0] ?? null, [versions]);

  /* --------------------------- Mutations ------------------------------ */

  const runSandbox = useCallback(() => {
    if (!draft || !worker) return;
    if (!canWrite) return;
    const prompt = (inp.prompt ?? "Diagnose spike in checkout-api p95 latency.").trim();
    const run: SandboxRun = {
      id: rid("SBX"),
      workerId,
      at: nowIso(),
      prompt,
      outcome: "Completed",
      toolsUsed: draft.toolGrants.slice(0, 3),
      latencyMs: Math.min(draft.latencyTargetMs, 3200),
      costUsd: 0.11,
      reasoning:
        "Correlated Datadog p95 with pg_stat_statements. Top query id 0xA31 shows +38% mean exec time. " +
        "Recommends preview execution of runbook RB-Q-42 (index hint) with human approval.",
      citations: ["metrics.query#p95", "db.explain#0xA31", "kb.search#RB-Q-42"],
    };
    const next = [run, ...sandbox];
    writeList(SANDBOX_KEY, [run, ...readList<SandboxRun>(SANDBOX_KEY)]);
    setSandbox(next);
    audit(`Sandbox run · ${run.id}`, `Confidence check + tool preview. Cost $${run.costUsd.toFixed(2)}.`);
    setDialog(null);
  }, [draft, worker, canWrite, inp.prompt, sandbox, workerId, audit]);

  const runEvalSuite = useCallback(() => {
    if (!draft || !worker || !canWrite) return;
    const caseNames = [
      "Grounded citations", "Refusal on restricted data",
      "Tool least-privilege", "Confidence calibration",
      "Escalation on low confidence", "Cost within budget",
    ];
    const failing = derivedLifecycle === "Tool Unavailable" || connectorDown;
    const cases = caseNames.map((n) => ({
      name: n,
      passed: !(failing && (n === "Tool least-privilege" || n === "Cost within budget" ? false : Math.random() < 0.05)),
      detail: failing ? "Tool grant unavailable at time of run." : "Passed with logged evidence.",
    }));
    const passed = cases.every((c) => c.passed);
    const summary: EvaluationSummary = {
      at: nowIso(),
      score: passed ? 92 : 61,
      calibration: passed ? 0.85 : 0.58,
      acceptanceRate: passed ? 0.71 : 0.42,
      successRate: passed ? 0.94 : 0.74,
      toolFailureRate: passed ? 0.02 : 0.11,
      costPerRunUsd: passed ? 0.12 : 0.19,
      passed,
      notes: passed ? "Meets Production Approved bar." : "Below Production Approved threshold; blocked from publish.",
    };
    const suite: EvalSuiteRun = {
      id: rid("ES"),
      workerId,
      versionId: latestPublished?.id ?? null,
      at: summary.at,
      passed,
      summary,
      cases,
      evidence: ["metrics.golden.set.v3", "postmortem.corpus.v2", "kb.snapshot.v11"],
      sources: ["Datadog", "Loki", "Neugain KB", "Postmortem Archive"],
    };
    const nextSuites = [suite, ...suites];
    writeList(SUITES_KEY, [suite, ...readList<EvalSuiteRun>(SUITES_KEY)]);
    setSuites(nextSuites);
    // Mirror into shared AI governance evals feed
    writeList(EVAL_KEY, [
      { id: suite.id, workerId, at: suite.at, passed, summary },
      ...readList<{ id: string }>(EVAL_KEY),
    ]);
    persistWorker({
      lastEvaluation: summary,
      evaluationDueAt: inDays(30),
      policyStatus: passed ? "Compliant" : "Drift",
    });
    if (!passed) {
      editDraft((d) => ({ ...d, lifecycle: "Draft", reviewNotes: "Evaluation failed. See governance suite." }));
    }
    audit(
      `Evaluation suite ${passed ? "passed" : "failed"} · ${suite.id}`,
      `Score ${summary.score}, calibration ${summary.calibration.toFixed(2)}. Appears in AI Governance.`,
      passed ? "info" : "warning",
    );
    setDialog(null);
  }, [draft, worker, canWrite, derivedLifecycle, connectorDown, suites, workerId, latestPublished, persistWorker, editDraft, audit]);

  const submitForReview = useCallback(() => {
    if (!draft || !canWrite) return;
    editDraft((d) => ({ ...d, lifecycle: "Under Review", submitReason: inp.reason ?? "" }));
    audit(`Submitted for review · ${workerId}`, `Reviewer required. Self-approval blocked at publish step.`);
    setDialog(null);
  }, [draft, canWrite, editDraft, inp.reason, audit, workerId]);

  const publishVersion = useCallback(() => {
    if (!draft || !worker || !canWrite) return;
    // Guardrails: separate identity, no self-approval, tools available, eval passed, not suspended.
    if (worker.status === "Suspended") { audit("Publish rejected", "Worker suspended.", "warning"); return; }
    if (draft.lifecycle !== "Under Review") { audit("Publish rejected", "Draft must be Under Review.", "warning"); return; }
    const missing = draft.toolGrants.filter((id) => !toolById.get(id)?.available);
    if (missing.length > 0) { audit("Publish rejected", `Tools unavailable: ${missing.join(", ")}.`, "warning"); return; }
    const lastSuite = suites[0];
    if (!lastSuite || !lastSuite.passed) { audit("Publish rejected", "Latest evaluation suite must pass.", "warning"); return; }
    const approver = (inp.approver ?? "").trim();
    if (!approver) { audit("Publish rejected", "Approver required.", "warning"); return; }
    if (approver.toLowerCase() === ops.role.toLowerCase()) { audit("Publish rejected", "Self-approval not allowed.", "warning"); return; }

    const [maj, min, patch] = (worker.version.split(".").map((n) => Number(n) || 0));
    const nextVer = `${maj}.${min + 1}.${patch}`;
    const rec: VersionRecord = {
      id: rid("VER"),
      workerId,
      version: nextVer,
      publishedAt: nowIso(),
      publishedBy: ops.role,
      publishedByIdentity: `svc:worker:${workerId}`,
      approvedBy: approver,
      approvalAt: nowIso(),
      configSnapshot: { ...draft, lifecycle: "Production Approved" },
      changeSummary: inp.changeSummary ?? "Configuration update.",
      evaluationRef: lastSuite.id,
    };
    const nextVersions = [rec, ...versions];
    writeList(VERSIONS_KEY, [rec, ...readList<VersionRecord>(VERSIONS_KEY)]);
    setVersions(nextVersions);

    persistWorker({
      version: nextVer,
      purpose: draft.purpose,
      domain: draft.domain,
      autonomy: draft.autonomy,
      model: draft.primaryModel,
      approvedTools: [...draft.toolGrants],
      authority: draft.authority,
    });
    editDraft((d) => ({ ...d, lifecycle: "Production Approved", baseVersion: nextVer, submitReason: null }));

    // Mirror tool grants into Integration Hub audit trail.
    const grantEvents = draft.toolGrants.map((t) => ({
      id: rid("HUB"),
      workerId,
      toolId: t,
      version: nextVer,
      grantedBy: approver,
      at: nowIso(),
    }));
    writeList(HUB_KEY, [...grantEvents, ...readList<{ id: string }>(HUB_KEY)]);

    audit(`Version published · ${nextVer}`, `Approver ${approver}. Catalog + Integration Hub updated. Authority enforced on next runbook launch.`);
    setDialog(null);
  }, [draft, worker, canWrite, suites, inp.approver, inp.changeSummary, ops.role, versions, workerId, toolById, persistWorker, editDraft, audit]);

  const suspend = useCallback(() => {
    if (!worker || !canWrite) return;
    const reason = (inp.reason ?? "").trim() || "Suspended from Studio.";
    persistWorker({ status: "Suspended", suspendedReason: reason });
    // Halt any running sessions for this worker.
    const sessions = readList<SessionRecord>(SESSIONS_KEY).map((s) =>
      s.workerId === workerId ? { ...s, state: "Halted" as const, reason: `Halted: ${reason}` } : s,
    );
    writeList(SESSIONS_KEY, sessions);
    editDraft((d) => ({ ...d, lifecycle: "Suspended" }));
    audit(`Worker suspended · ${workerId}`, `${reason}. Active sessions halted; runbook launch will refuse this worker.`, "critical");
    setDialog(null);
  }, [worker, canWrite, inp.reason, persistWorker, workerId, editDraft, audit]);

  const resume = useCallback(() => {
    if (!worker || !canWrite) return;
    persistWorker({ status: "Active", suspendedReason: null });
    editDraft((d) => ({ ...d, lifecycle: "Draft" }));
    audit(`Worker resumed · ${workerId}`, `Awaiting review and evaluation before promotion.`);
  }, [worker, canWrite, persistWorker, editDraft, audit, workerId]);

  const revokeTool = (id: string) => editDraft((d) => ({ ...d, toolGrants: d.toolGrants.filter((t) => t !== id) }));
  const grantTool = (id: string) => {
    const t = toolById.get(id);
    if (!t) return;
    if (!t.available) { audit("Tool grant rejected", `${id} is unavailable in Integration Hub.`, "warning"); return; }
    editDraft((d) => (d.toolGrants.includes(id) ? d : { ...d, toolGrants: [...d.toolGrants, id] }));
  };

  const toggleEnv = (env: "dev" | "stage" | "prod") =>
    editDraft((d) => ({
      ...d,
      environments: d.environments.includes(env) ? d.environments.filter((e) => e !== env) : [...d.environments, env],
    }));

  /* ----------------------------- Guards ------------------------------- */

  if (notFound) {
    return (
      <div className="flex flex-col gap-3">
        <EntityHeader
          eyebrow="Digital Workers"
          title="Worker not found"
          subtitle={`No worker with id ${workerId || "(missing)"} in this tenant.`}
          actions={<Button size="sm" variant="outline" onClick={() => navigate("/runops/workers")}><ArrowLeft className="h-3.5 w-3.5 mr-1" />Back to catalog</Button>}
        />
      </div>
    );
  }

  if (!worker || !draft) {
    return (
      <div className="flex flex-col gap-3">
        <EntityHeader title="Digital Worker Studio" subtitle="Loading worker configuration…" />
      </div>
    );
  }

  /* ----------------------------- Render ------------------------------- */

  const lifeBadge = (
    <Badge variant="outline" className={cn("text-[10px]", lifecycleTone(derivedLifecycle))}>{derivedLifecycle}</Badge>
  );

  return (
    <div className="flex flex-col gap-3">
      <EntityHeader
        eyebrow="Digital Workers · Studio"
        title={`${worker.name} · ${worker.id}`}
        subtitle={worker.purpose}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/runops/workers")} aria-label="Back to catalog">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />Catalog
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("sandbox")} disabled={!canWrite || worker.status === "Suspended"} aria-label="Run sandbox session">
              <PlayCircle className="h-3.5 w-3.5 mr-1" />Sandbox
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("eval")} disabled={!canWrite || worker.status === "Suspended"} aria-label="Run evaluation suite">
              <FlaskConical className="h-3.5 w-3.5 mr-1" />Run evaluation
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("compare")} disabled={versions.length < 1} aria-label="Compare versions">
              <GitCompare className="h-3.5 w-3.5 mr-1" />Compare
            </Button>
            {draft.lifecycle === "Draft" && (
              <Button size="sm" variant="outline" onClick={() => setDialog("submit")} disabled={!canWrite || worker.status === "Suspended"} aria-label="Submit for review">
                <Send className="h-3.5 w-3.5 mr-1" />Submit for review
              </Button>
            )}
            {draft.lifecycle === "Under Review" && (
              <Button size="sm" onClick={() => setDialog("publish")} disabled={!canWrite || worker.status === "Suspended"} aria-label="Publish approved version">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Publish
              </Button>
            )}
            {worker.status !== "Suspended" ? (
              <Button size="sm" variant="destructive" onClick={() => setDialog("suspend")} disabled={!canWrite} aria-label="Suspend worker">
                <Pause className="h-3.5 w-3.5 mr-1" />Suspend
              </Button>
            ) : (
              <Button size="sm" onClick={resume} disabled={!canWrite} aria-label="Resume worker">
                <Play className="h-3.5 w-3.5 mr-1" />Resume
              </Button>
            )}
          </div>
        }
        meta={
          <div className="flex flex-wrap items-center gap-2">
            {lifeBadge}
            <Badge variant="outline" className="text-[10px]">{worker.maturity}</Badge>
            <Badge variant="outline" className="text-[10px]">{worker.autonomy}</Badge>
            <Badge variant="outline" className="text-[10px]">v{worker.version}</Badge>
            <Badge variant="outline" className="text-[10px]"><Lock className="h-3 w-3 mr-1" />svc:worker:{worker.id}</Badge>
            <span className="text-xs text-slate-500">Owner {worker.ownerName} · {worker.ownerTeam}</span>
            {worker.status === "Suspended" && worker.suspendedReason && (
              <span className="text-xs text-rose-700">· Suspended: {worker.suspendedReason}</span>
            )}
            <button
              type="button"
              className="ml-auto text-xs text-slate-500 underline"
              onClick={() => setConnectorDown((v) => !v)}
              aria-label="Toggle connector unavailable state for demo"
            >
              {connectorDown ? "Connector: unavailable (click to reset)" : "Simulate connector unavailable"}
            </button>
          </div>
        }
      />

      {!canWrite && (
        <div className="mx-4 rounded border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
          Read-only role. All mutations are disabled and shown with an explanation.
        </div>
      )}

      {derivedLifecycle === "Tool Unavailable" && (
        <div className="mx-4 rounded border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
          One or more granted tools are unavailable in the Integration Hub. Publishing is blocked until every grant is available.
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="px-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="purpose"><Sparkles className="h-3.5 w-3.5 mr-1" />Purpose</TabsTrigger>
          <TabsTrigger value="instructions"><ClipboardList className="h-3.5 w-3.5 mr-1" />Instructions</TabsTrigger>
          <TabsTrigger value="models"><Brain className="h-3.5 w-3.5 mr-1" />Models</TabsTrigger>
          <TabsTrigger value="tools"><Wrench className="h-3.5 w-3.5 mr-1" />Tools</TabsTrigger>
          <TabsTrigger value="knowledge"><BookOpen className="h-3.5 w-3.5 mr-1" />Knowledge</TabsTrigger>
          <TabsTrigger value="scope"><Layers className="h-3.5 w-3.5 mr-1" />Service scope</TabsTrigger>
          <TabsTrigger value="authority"><ShieldCheck className="h-3.5 w-3.5 mr-1" />Authority</TabsTrigger>
          <TabsTrigger value="memory"><KeyRound className="h-3.5 w-3.5 mr-1" />Memory</TabsTrigger>
          <TabsTrigger value="escalation"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Escalation</TabsTrigger>
          <TabsTrigger value="evals"><FlaskConical className="h-3.5 w-3.5 mr-1" />Evaluations</TabsTrigger>
          <TabsTrigger value="versions"><GitCompare className="h-3.5 w-3.5 mr-1" />Versions</TabsTrigger>
          <TabsTrigger value="activity"><ActivitySquare className="h-3.5 w-3.5 mr-1" />Activity</TabsTrigger>
        </TabsList>

        {/* -------------------- Purpose -------------------- */}
        <TabsContent value="purpose">
          <Card><CardContent className="p-4 space-y-3">
            <FieldLabel>Purpose</FieldLabel>
            <Textarea rows={3} value={draft.purpose} onChange={(e) => editDraft((d) => ({ ...d, purpose: e.target.value }))} disabled={!canWrite} />
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <FieldLabel>Domain</FieldLabel>
                <Select value={draft.domain} onValueChange={(v) => editDraft((d) => ({ ...d, domain: v as Domain }))} disabled={!canWrite}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Reliability","Change","Investigation","Communications","Data","Security","Cost","General"] as Domain[]).map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Autonomy</FieldLabel>
                <Select value={draft.autonomy} onValueChange={(v) => editDraft((d) => ({ ...d, autonomy: v as Autonomy }))} disabled={!canWrite}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["L0","L1","L2","L3","L4"] as Autonomy[]).map((a) => (
                      <SelectItem key={a} value={a}>{a} · {autonomyBlurb(a)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Boundary</FieldLabel>
                <Input value={draft.authority.scope} onChange={(e) => editDraft((d) => ({ ...d, authority: { ...d.authority, scope: e.target.value } }))} disabled={!canWrite} />
              </div>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Instructions -------------------- */}
        <TabsContent value="instructions">
          <Card><CardContent className="p-4 space-y-3">
            <FieldLabel>System instructions</FieldLabel>
            <Textarea rows={8} value={draft.instructions} onChange={(e) => editDraft((d) => ({ ...d, instructions: e.target.value }))} disabled={!canWrite} />
            <div className="text-xs text-slate-500">Grounding, refusal, and citation rules are enforced server-side regardless of these instructions.</div>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Models -------------------- */}
        <TabsContent value="models">
          <Card><CardContent className="p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <FieldLabel>Primary model</FieldLabel>
                <Select value={draft.primaryModel} onValueChange={(v) => editDraft((d) => ({ ...d, primaryModel: v }))} disabled={!canWrite}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {draft.approvedModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Fallback model</FieldLabel>
                <Select value={draft.fallbackModel} onValueChange={(v) => editDraft((d) => ({ ...d, fallbackModel: v }))} disabled={!canWrite}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {draft.approvedModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <FieldLabel>Approved models</FieldLabel>
              <div className="flex flex-wrap gap-1">
                {draft.approvedModels.map((m) => (
                  <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                ))}
              </div>
              <div className="text-xs text-slate-500 mt-2">Routing uses primary; on hard failures the fallback runs with the same guardrails.</div>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Tools -------------------- */}
        <TabsContent value="tools">
          <Card><CardContent className="p-4 space-y-2">
            <div className="text-xs text-slate-500 mb-1">Tool grants use least privilege. Unavailable tools cannot be added; server enforces every call regardless of client state.</div>
            {tools.map((t) => {
              const granted = draft.toolGrants.includes(t.id);
              const available = t.available && !(connectorDown && t.connector === "Datadog");
              return (
                <div key={t.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">{t.label} <span className="text-slate-400 font-normal">· {t.id}</span></div>
                    <div className="text-xs text-slate-500">{t.category} · {t.connector} · {t.scope}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!available && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">Unavailable</Badge>}
                    {granted ? (
                      <Button size="sm" variant="outline" onClick={() => revokeTool(t.id)} disabled={!canWrite}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />Revoke
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => grantTool(t.id)} disabled={!canWrite || !available} title={!available ? "Tool unavailable in Integration Hub" : ""}>
                        <PlusCircle className="h-3.5 w-3.5 mr-1" />Grant
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Knowledge -------------------- */}
        <TabsContent value="knowledge">
          <Card><CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel>Retrieval sources</FieldLabel>
              <Button size="sm" variant="outline" onClick={() => setDialog("addKnowledge")} disabled={!canWrite}>
                <PlusCircle className="h-3.5 w-3.5 mr-1" />Add source
              </Button>
            </div>
            {draft.knowledgeSources.map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-slate-900">{k.label} <span className="text-slate-400 font-normal">· {k.id}</span></div>
                  <div className="text-xs text-slate-500">{k.kind} · {k.classification} · citation {k.citationRequired ? "required" : "optional"}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => editDraft((d) => ({ ...d, knowledgeSources: d.knowledgeSources.filter((x) => x.id !== k.id) }))} disabled={!canWrite}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />Remove
                </Button>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Service scope -------------------- */}
        <TabsContent value="scope">
          <Card><CardContent className="p-4 space-y-3">
            <div>
              <FieldLabel>Supported services</FieldLabel>
              <div className="flex flex-wrap gap-1">
                {worker.supportedServices.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
              </div>
            </div>
            <div>
              <FieldLabel>Environments</FieldLabel>
              <div className="flex gap-2">
                {(["dev","stage","prod"] as const).map((e) => {
                  const on = draft.environments.includes(e);
                  return (
                    <Button key={e} size="sm" variant={on ? "default" : "outline"} onClick={() => toggleEnv(e)} disabled={!canWrite}>
                      {e}
                    </Button>
                  );
                })}
              </div>
              <div className="text-xs text-slate-500 mt-1">Environment scope is enforced at execution time by the runbook launch gate.</div>
            </div>
            <div>
              <FieldLabel>Max data classification</FieldLabel>
              <Select value={draft.dataClassificationMax} onValueChange={(v) => editDraft((d) => ({ ...d, dataClassificationMax: v as WorkerDraft["dataClassificationMax"] }))} disabled={!canWrite}>
                <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Public","Internal","Confidential","Restricted"] as const).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Authority -------------------- */}
        <TabsContent value="authority">
          <Card><CardContent className="p-4 space-y-3">
            <div>
              <FieldLabel>Scope</FieldLabel>
              <Input value={draft.authority.scope} onChange={(e) => editDraft((d) => ({ ...d, authority: { ...d.authority, scope: e.target.value } }))} disabled={!canWrite} />
            </div>
            <div>
              <FieldLabel>Requires approval above</FieldLabel>
              <Select value={draft.authority.requiresApprovalAbove} onValueChange={(v) => editDraft((d) => ({ ...d, authority: { ...d.authority, requiresApprovalAbove: v as Autonomy } }))} disabled={!canWrite}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["L0","L1","L2","L3","L4"] as Autonomy[]).map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="text-xs text-slate-500 mt-1">Runbook launch enforces this bound. Above the bound requires human approval; a self-authored version cannot self-approve at publish.</div>
            </div>
            <div>
              <FieldLabel>Guardrails</FieldLabel>
              <div className="flex flex-wrap gap-1">
                {draft.authority.guardrails.map((g) => <Badge key={g} variant="outline" className="text-[10px]">{g}</Badge>)}
              </div>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Memory -------------------- */}
        <TabsContent value="memory">
          <Card><CardContent className="p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <FieldLabel>Retention (days)</FieldLabel>
                <Input type="number" min={0} max={365} value={draft.memoryRetentionDays} onChange={(e) => editDraft((d) => ({ ...d, memoryRetentionDays: Number(e.target.value) || 0 }))} disabled={!canWrite} />
              </div>
              <div>
                <FieldLabel>Confidence threshold</FieldLabel>
                <Input type="number" step="0.05" min={0} max={1} value={draft.confidenceThreshold} onChange={(e) => editDraft((d) => ({ ...d, confidenceThreshold: Number(e.target.value) || 0 }))} disabled={!canWrite} />
              </div>
              <div>
                <FieldLabel>Human oversight</FieldLabel>
                <Select value={draft.humanOversight} onValueChange={(v) => editDraft((d) => ({ ...d, humanOversight: v as WorkerDraft["humanOversight"] }))} disabled={!canWrite}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Required","Sampled","Opt-in"] as const).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <FieldLabel>Cost limit (USD/mo)</FieldLabel>
                <Input type="number" min={0} value={draft.costLimitUsdMonthly} onChange={(e) => editDraft((d) => ({ ...d, costLimitUsdMonthly: Number(e.target.value) || 0 }))} disabled={!canWrite} />
              </div>
              <div>
                <FieldLabel>Latency target (ms)</FieldLabel>
                <Input type="number" min={0} value={draft.latencyTargetMs} onChange={(e) => editDraft((d) => ({ ...d, latencyTargetMs: Number(e.target.value) || 0 }))} disabled={!canWrite} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input id="kill" type="checkbox" checked={draft.killSwitchEnabled} onChange={(e) => editDraft((d) => ({ ...d, killSwitchEnabled: e.target.checked }))} disabled={!canWrite} />
                <label htmlFor="kill" className="text-sm">Kill switch enabled</label>
              </div>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Escalation -------------------- */}
        <TabsContent value="escalation">
          <Card><CardContent className="p-4 space-y-2">
            {draft.escalations.map((e) => (
              <div key={e.id} className="grid gap-2 md:grid-cols-4 rounded border border-slate-200 px-3 py-2">
                <div><FieldLabel>Condition</FieldLabel><Input value={e.condition} onChange={(ev) => editDraft((d) => ({ ...d, escalations: d.escalations.map((x) => x.id === e.id ? { ...x, condition: ev.target.value } : x) }))} disabled={!canWrite} /></div>
                <div>
                  <FieldLabel>Action</FieldLabel>
                  <Select value={e.action} onValueChange={(v) => editDraft((d) => ({ ...d, escalations: d.escalations.map((x) => x.id === e.id ? { ...x, action: v as EscalationRule["action"] } : x) }))} disabled={!canWrite}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Human review","Halt session","Notify commander","Open ticket"] as const).map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><FieldLabel>Channel</FieldLabel><Input value={e.channel} onChange={(ev) => editDraft((d) => ({ ...d, escalations: d.escalations.map((x) => x.id === e.id ? { ...x, channel: ev.target.value } : x) }))} disabled={!canWrite} /></div>
                <div className="flex items-end justify-end">
                  <Button size="sm" variant="outline" onClick={() => editDraft((d) => ({ ...d, escalations: d.escalations.filter((x) => x.id !== e.id) }))} disabled={!canWrite}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" />Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => editDraft((d) => ({ ...d, escalations: [...d.escalations, { id: rid("ESC"), condition: "custom condition", action: "Human review", channel: "commander" }] }))} disabled={!canWrite}>
              <PlusCircle className="h-3.5 w-3.5 mr-1" />Add escalation
            </Button>
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Evaluations -------------------- */}
        <TabsContent value="evals">
          <Card><CardContent className="p-4 space-y-3">
            {suites.length === 0 ? (
              <div className="text-sm text-slate-500">No suite runs yet. Run an evaluation to generate governance evidence.</div>
            ) : (
              suites.map((s) => (
                <div key={s.id} className="rounded border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{s.id} · {new Date(s.at).toLocaleString()}</div>
                    <Badge variant="outline" className={cn("text-[10px]", s.passed ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200")}>
                      {s.passed ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-2 text-xs">
                    <Metric k="Score" v={String(s.summary.score)} />
                    <Metric k="Calibration" v={s.summary.calibration.toFixed(2)} />
                    <Metric k="Acceptance" v={`${Math.round(s.summary.acceptanceRate * 100)}%`} />
                    <Metric k="Success" v={`${Math.round(s.summary.successRate * 100)}%`} />
                    <Metric k="Tool failure" v={`${Math.round(s.summary.toolFailureRate * 100)}%`} />
                    <Metric k="Cost/run" v={`$${s.summary.costPerRunUsd.toFixed(2)}`} />
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    <span className="font-medium">Evidence:</span> {s.evidence.join(", ")}
                    <span className="ml-3 font-medium">Sources:</span> {s.sources.join(", ")}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    <span className="font-medium">Uncertainty:</span> Brier-like calibration {s.summary.calibration.toFixed(2)}; acceptance {Math.round(s.summary.acceptanceRate * 100)}%.
                  </div>
                  <ul className="mt-2 text-xs list-disc pl-4">
                    {s.cases.map((c) => (
                      <li key={c.name} className={c.passed ? "text-slate-700" : "text-rose-700"}>
                        {c.passed ? "✓" : "✗"} {c.name} — {c.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Versions -------------------- */}
        <TabsContent value="versions">
          <Card><CardContent className="p-4 space-y-2">
            {versions.length === 0 ? (
              <div className="text-sm text-slate-500">No published versions yet. Submit for review, then publish to record the first version.</div>
            ) : (
              versions.map((v) => (
                <div key={v.id} className="rounded border border-slate-200 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">v{v.version} · {v.id}</div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">Published</Badge>
                  </div>
                  <div className="mt-1 text-slate-600">
                    Published {new Date(v.publishedAt).toLocaleString()} by <b>{v.publishedBy}</b> · Approved by <b>{v.approvedBy ?? "—"}</b> (self-approval blocked)
                  </div>
                  <div className="mt-1 text-slate-600">Identity <b>{v.publishedByIdentity}</b> · Evaluation ref <b>{v.evaluationRef ?? "—"}</b></div>
                  <div className="mt-1 text-slate-700">{v.changeSummary}</div>
                </div>
              ))
            )}
          </CardContent></Card>
        </TabsContent>

        {/* -------------------- Activity -------------------- */}
        <TabsContent value="activity">
          <Card><CardContent className="p-4 space-y-2">
            {sandbox.length === 0 ? (
              <div className="text-sm text-slate-500">No sandbox runs yet.</div>
            ) : (
              sandbox.map((r) => (
                <div key={r.id} className="rounded border border-slate-200 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{r.id} · {new Date(r.at).toLocaleString()}</div>
                    <Badge variant="outline" className="text-[10px]">{r.outcome}</Badge>
                  </div>
                  <div className="mt-1 text-slate-700"><span className="font-medium">Prompt:</span> {r.prompt}</div>
                  <div className="mt-1 text-slate-600"><span className="font-medium">Tools:</span> {r.toolsUsed.join(", ") || "—"}</div>
                  <div className="mt-1 text-slate-600"><span className="font-medium">Latency:</span> {r.latencyMs}ms · <span className="font-medium">Cost:</span> ${r.costUsd.toFixed(2)}</div>
                  <div className="mt-1 text-slate-700"><span className="font-medium">Reasoning:</span> {r.reasoning}</div>
                  <div className="mt-1 text-slate-600"><span className="font-medium">Citations:</span> {r.citations.join(", ")}</div>
                </div>
              ))
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* ---------------------------- Dialogs ---------------------------- */}

      <Dialog open={dialog === "submit"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit for review</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="text-xs text-slate-600">Draft moves to Under Review. Reviewer must be someone other than the author (self-approval is rejected).</div>
            <Textarea rows={4} placeholder="Change summary and rationale…" value={inp.reason ?? ""} onChange={(e) => setInp((v) => ({ ...v, reason: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={submitForReview}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "publish"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Publish approved version</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs text-slate-600">
            <p>Publishing requires a passing evaluation suite, all tools available, and an approver identity different from the author.</p>
            <div>
              <FieldLabel>Approver identity</FieldLabel>
              <Input placeholder="e.g. Change Manager" value={inp.approver ?? ""} onChange={(e) => setInp((v) => ({ ...v, approver: e.target.value }))} />
            </div>
            <div>
              <FieldLabel>Change summary</FieldLabel>
              <Textarea rows={3} value={inp.changeSummary ?? ""} onChange={(e) => setInp((v) => ({ ...v, changeSummary: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={publishVersion}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "suspend"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Suspend worker</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs text-slate-600">
            <p>Suspending halts active sessions and blocks new runbook launches for this worker.</p>
            <Textarea rows={3} placeholder="Reason (audit trail)…" value={inp.reason ?? ""} onChange={(e) => setInp((v) => ({ ...v, reason: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={suspend}>Suspend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "sandbox"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Run sandbox session</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs text-slate-600">
            <p>Sandbox runs use current draft config against golden fixtures. No production side effects.</p>
            <Textarea rows={3} value={inp.prompt ?? ""} onChange={(e) => setInp((v) => ({ ...v, prompt: e.target.value }))} placeholder="Describe the scenario…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={runSandbox}>Run</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "eval"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Run evaluation suite</DialogTitle></DialogHeader>
          <p className="text-xs text-slate-600">Runs the governance suite: grounded citations, refusal, least-privilege, calibration, escalation, cost. Results appear on AI Governance.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={runEvalSuite}>Run suite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "compare"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Compare versions</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Left</FieldLabel>
                <Select value={compareSel?.[0] ?? ""} onValueChange={(v) => setCompareSel([v, compareSel?.[1] ?? ""])}>
                  <SelectTrigger><SelectValue placeholder="Select version" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Current draft</SelectItem>
                    {versions.map((v) => <SelectItem key={v.id} value={v.id}>v{v.version} · {v.id}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Right</FieldLabel>
                <Select value={compareSel?.[1] ?? ""} onValueChange={(v) => setCompareSel([compareSel?.[0] ?? "", v])}>
                  <SelectTrigger><SelectValue placeholder="Select version" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Current draft</SelectItem>
                    {versions.map((v) => <SelectItem key={v.id} value={v.id}>v{v.version} · {v.id}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {compareSel && compareSel[0] && compareSel[1] && (
              <CompareView left={resolveSnapshot(compareSel[0], draft, versions)} right={resolveSnapshot(compareSel[1], draft, versions)} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "addKnowledge"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add knowledge source</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div><FieldLabel>Label</FieldLabel><Input value={inp.knLabel ?? ""} onChange={(e) => setInp((v) => ({ ...v, knLabel: e.target.value }))} /></div>
            <div>
              <FieldLabel>Kind</FieldLabel>
              <Select value={inp.knKind ?? "Doc"} onValueChange={(v) => setInp((prev) => ({ ...prev, knKind: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Runbook","Postmortem","Doc","Ticket","Telemetry"] as const).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>Classification</FieldLabel>
              <Select value={inp.knClass ?? "Internal"} onValueChange={(v) => setInp((prev) => ({ ...prev, knClass: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Public","Internal","Confidential","Restricted"] as const).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => {
              const label = (inp.knLabel ?? "").trim(); if (!label) return;
              const source: KnowledgeSource = {
                id: rid("KN"),
                label,
                kind: (inp.knKind as KnowledgeSource["kind"]) ?? "Doc",
                classification: (inp.knClass as KnowledgeSource["classification"]) ?? "Internal",
                citationRequired: true,
              };
              editDraft((d) => ({ ...d, knowledgeSources: [...d.knowledgeSources, source] }));
              audit(`Knowledge source added · ${source.id}`, `${source.label} (${source.kind}, ${source.classification})`);
              setDialog(null);
            }}>Add</Button>
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

function autonomyBlurb(a: Autonomy): string {
  switch (a) {
    case "L0": return "Advisory only";
    case "L1": return "Documented recommendations";
    case "L2": return "Preview + approval to execute";
    case "L3": return "Execute within scope, supervised";
    case "L4": return "Full delegation (rare)";
  }
}

function resolveSnapshot(key: string, draft: WorkerDraft, versions: VersionRecord[]): { label: string; snap: WorkerDraft } {
  if (key === "draft") return { label: "Current draft", snap: draft };
  const v = versions.find((x) => x.id === key);
  return { label: v ? `v${v.version}` : key, snap: v ? v.configSnapshot : draft };
}

function CompareView({ left, right }: { left: { label: string; snap: WorkerDraft }; right: { label: string; snap: WorkerDraft } }) {
  const rows: { k: string; l: string; r: string }[] = [
    { k: "Autonomy",         l: left.snap.autonomy,                        r: right.snap.autonomy },
    { k: "Primary model",    l: left.snap.primaryModel,                    r: right.snap.primaryModel },
    { k: "Tools",            l: left.snap.toolGrants.join(", "),           r: right.snap.toolGrants.join(", ") },
    { k: "Environments",     l: left.snap.environments.join(", "),         r: right.snap.environments.join(", ") },
    { k: "Data max",         l: left.snap.dataClassificationMax,           r: right.snap.dataClassificationMax },
    { k: "Confidence thr.",  l: left.snap.confidenceThreshold.toFixed(2),  r: right.snap.confidenceThreshold.toFixed(2) },
    { k: "Cost limit",       l: `$${left.snap.costLimitUsdMonthly}`,       r: `$${right.snap.costLimitUsdMonthly}` },
    { k: "Kill switch",      l: left.snap.killSwitchEnabled ? "on" : "off", r: right.snap.killSwitchEnabled ? "on" : "off" },
    { k: "Approval above",   l: left.snap.authority.requiresApprovalAbove, r: right.snap.authority.requiresApprovalAbove },
  ];
  return (
    <div className="rounded border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-3 bg-slate-50 text-[10px] uppercase text-slate-500 px-2 py-1">
        <div>Field</div><div>{left.label}</div><div>{right.label}</div>
      </div>
      {rows.map((row) => {
        const diff = row.l !== row.r;
        return (
          <div key={row.k} className={cn("grid grid-cols-3 px-2 py-1 text-xs border-t border-slate-100", diff && "bg-amber-50")}>
            <div className="text-slate-500">{row.k}</div>
            <div className="text-slate-800 truncate">{row.l || "—"}</div>
            <div className="text-slate-800 truncate">{row.r || "—"}</div>
          </div>
        );
      })}
    </div>
  );
}
