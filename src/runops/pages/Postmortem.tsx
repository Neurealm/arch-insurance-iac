/**
 * Page 32 · Postmortem, RCA & Problem Management
 * Route: /runops/incidents/:incidentId/postmortem
 *
 * Converts an incident into verified, blameless organisational learning.
 * The page separates confirmed root cause from likely contributing factors,
 * retains unresolved interpretations, and requires evidence for every
 * material conclusion. AI-drafted content is clearly labelled and must be
 * reviewed before it can be marked confirmed.
 *
 * Persistence (localStorage):
 *   runops.postmortemdocs.v1[incidentId] → PostmortemRecord
 *   runops.incidents.v1[incidentId]      (timeline + link mirror)
 *   runops.problems.v1                   (append on Create Problem)
 *   runops.knownerrors.v1                (append on Create Known Error)
 *   runops.correctiveactions.v1          (append per corrective action)
 *   runops.runbookproposals.v1           (append per runbook change proposal)
 *   runops.monitoringproposals.v1        (append per SLO/monitoring proposal)
 *   runops.knowledge.v1                  (append published lesson item)
 *
 * Every mutation emits an audit + domain event via ops.pushNotification.
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, BookOpen, CheckCircle2, ClipboardList, ExternalLink, FileText,
  Gauge, GitBranch, Lightbulb, ListChecks, Send, ShieldAlert, ShieldCheck,
  Sparkles, UserCheck, Users, Wrench, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* --------------------------------- Types -------------------------------- */

type DocState = "Draft" | "Review" | "Evidence Gap" | "Approved" | "Published" | "Reopened";
type Confidence = "low" | "medium" | "high" | "confirmed";
type Origin = "ai-suggested" | "human-authored" | "promoted-from-graph";

interface EvidenceRef {
  id: string;
  label: string;
  href: string;
  note: string;
}

interface Finding {
  id: string;
  title: string;
  body: string;
  origin: Origin;
  confidence: Confidence;
  evidence: EvidenceRef[];
  uncertainty: string;
  unresolved?: boolean;
  authorRole: string;
  updatedAt: string;
}

interface WhyStep {
  question: string;
  answer: string;
  evidenceIds: string[];
}

interface Approval {
  role: string;
  decidedBy: string | null;
  decidedAt: string | null;
  state: "Pending" | "Approved" | "Changes Requested";
  note: string;
}

interface OwnerAssignment {
  ownerName: string;
  ownerRole: string;
  dueAt: string;
}

interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  category: "Process" | "Code" | "Infra" | "Monitoring" | "Runbook" | "Policy";
  priority: "P0" | "P1" | "P2";
  owner: OwnerAssignment | null;
  state: "Proposed" | "Accepted" | "Rejected" | "Completed";
  linkedFindingId?: string;
  updatedAt: string;
}

interface RunbookProposal {
  id: string;
  runbookId: string;
  runbookName: string;
  change: string;
  rationale: string;
  linkedFindingId?: string;
  state: "Proposed" | "Accepted" | "Rejected";
  updatedAt: string;
}

interface MonitoringProposal {
  id: string;
  kind: "SLO" | "Alert" | "Dashboard" | "Synthetic";
  target: string;
  change: string;
  rationale: string;
  linkedFindingId?: string;
  state: "Proposed" | "Accepted" | "Rejected";
  updatedAt: string;
}

interface KnownError {
  id: string;
  title: string;
  symptom: string;
  workaround: string;
  triggeringConditions: string;
}

interface PostmortemRecord {
  incidentId: string;
  externalId: string;         // PM-####
  problemId: string | null;   // PRB-#### if created
  state: DocState;
  updatedAt: string;
  updatedBy: string;

  execSummary: string;
  impact: string;

  timeline: { at: string; label: string; detail?: string }[];
  detection: string;
  engagement: string;
  mitigation: string;
  recovery: string;

  rootCause: Finding | null;
  trigger: Finding | null;
  contributingFactors: Finding[];
  fiveWhys: WhyStep[];

  causalGraphSummary: string;
  promotedFromGraph: Finding[];

  whatWentWell: string[];
  whatWentPoorly: string[];
  whereFortunate: string[];
  recurrenceRisk: {
    likelihood: "Low" | "Medium" | "High";
    impact: "Low" | "Medium" | "High";
    note: string;
  };

  correctiveActions: CorrectiveAction[];
  runbookProposals: RunbookProposal[];
  monitoringProposals: MonitoringProposal[];
  knownErrors: KnownError[];

  approvals: Approval[];
  publishedAt: string | null;
}

/* --------------------------- Storage helpers ---------------------------- */

const DOC_KEY               = "runops.postmortemdocs.v1";
const INCIDENTS_KEY         = "runops.incidents.v1";
const PROBLEMS_KEY          = "runops.problems.v1";
const KNOWN_ERRORS_KEY      = "runops.knownerrors.v1";
const CORRECTIVE_KEY        = "runops.correctiveactions.v1";
const RB_PROPOSALS_KEY      = "runops.runbookproposals.v1";
const MON_PROPOSALS_KEY     = "runops.monitoringproposals.v1";
const KNOWLEDGE_KEY         = "runops.knowledge.v1";

function readMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, T>) : {};
  } catch { return {}; }
}
function writeMap<T>(key: string, m: Record<string, T>) { localStorage.setItem(key, JSON.stringify(m)); }
function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch { return []; }
}
function writeList<T>(key: string, list: T[]) { localStorage.setItem(key, JSON.stringify(list)); }

interface StoredIncident {
  incidentId: string;
  timeline?: { at: string; label: string; detail?: string }[];
  postmortem?: { id: string; state: DocState; publishedAt: string | null };
  updatedAt?: string;
  [k: string]: unknown;
}

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/* ------------------------- Deterministic seed --------------------------- */
/**
 * A blameless AI-suggested draft grounded in the canonical checkout incident.
 * `origin: "ai-suggested"` on findings signals that they still need reviewer
 * confirmation before promotion to `confidence: "confirmed"`.
 */
function seedDraft(incidentId: string, actorRole: string): PostmortemRecord {
  const ev = (id: string, label: string, href: string, note: string): EvidenceRef => ({ id, label, href, note });

  const rootCause: Finding = {
    id: "F-ROOT",
    title: "Compound index deployed by CHG-20391 changed the checkout query plan.",
    body:
      "The compound index introduced by CHG-20391 caused the planner to select a nested-loop join over " +
      "the previously used hash-join. Under peak traffic this drove per-query cost up by ~4×, saturated " +
      "the checkout-db-01 connection pool, and produced the observed 502 rate on checkout-api.",
    origin: "ai-suggested",
    confidence: "high",
    evidence: [
      ev("EV-QP", "Query-plan diff · pre/post CHG-20391", "https://obs.example/checkout/plan-diff", "Nested-loop join confirmed against the same query text."),
      ev("EV-POOL", "Connection-pool saturation graph", "https://datadog.example/checkout-db/conns", "Waiters exceeded max within 90s of the deploy."),
      ev("EV-HYP", "Dominant hypothesis HY-DB (confidence 82)", `/runops/incidents/${incidentId}/hypotheses`, "Promoted from Hypothesis Graph."),
    ],
    uncertainty: "Whether a concurrent batch job amplified the regression is unresolved and does not change the root cause.",
    authorRole: "AI Draft",
    updatedAt: nowIso(),
  };

  const trigger: Finding = {
    id: "F-TRIG",
    title: "Peak-hour traffic (13:58 UTC) crossed the plan-regression threshold.",
    body:
      "The regression was latent until concurrent connection demand exceeded ~18 open sessions. " +
      "The 13:58 UTC traffic ramp — a normal peak, not an anomaly — was the trigger, not a cause.",
    origin: "ai-suggested",
    confidence: "medium",
    evidence: [
      ev("EV-RUM", "RUM traffic curve for checkout", "https://rum.example/checkout/traffic", "Peak matches production seasonality."),
    ],
    uncertainty: "Exact concurrency threshold at which the regression becomes user-visible.",
    authorRole: "AI Draft",
    updatedAt: nowIso(),
  };

  const contributing: Finding[] = [
    {
      id: "F-CF-POOL",
      title: "checkout-api pool_max_size was already close to observed baseline peaks.",
      body:
        "pool_max_size = 20 leaves ~10% headroom over normal peak. The regression consumed that margin " +
        "before any alert had time to fire.",
      origin: "ai-suggested",
      confidence: "medium",
      evidence: [
        ev("EV-CAP", "checkout-api capacity model", "https://config.example/checkout", "Historic peak = 18 open."),
      ],
      uncertainty: "Whether raising pool_max_size alone (without the index revert) would have masked the incident.",
      authorRole: "AI Draft",
      updatedAt: nowIso(),
    },
    {
      id: "F-CF-CANARY",
      title: "Change was deployed without a canary against production traffic patterns.",
      body:
        "CHG-20391 ran in a staging environment whose read pattern did not exercise the affected join. " +
        "A short prod canary would likely have surfaced the regression before general rollout.",
      origin: "ai-suggested",
      confidence: "high",
      evidence: [
        ev("EV-CHG", "CHG-20391 change record", "https://changes.example/CHG-20391", "Rollout plan skipped canary phase."),
      ],
      uncertainty: "None material.",
      authorRole: "AI Draft",
      updatedAt: nowIso(),
    },
    {
      id: "F-CF-ALERT",
      title: "Pool-saturation alert threshold was set below detection utility.",
      body:
        "The waiters > 0 alert fired 3 minutes after the SLO burn alert. Detection therefore trailed " +
        "customer-visible errors rather than leading them.",
      origin: "ai-suggested",
      confidence: "medium",
      evidence: [
        ev("EV-ALT", "Alert routing history", "https://alerting.example/checkout", "Order of fires recorded."),
      ],
      uncertainty: "Whether adjusting only the threshold is sufficient without a leading indicator.",
      unresolved: true,
      authorRole: "AI Draft",
      updatedAt: nowIso(),
    },
  ];

  const fiveWhys: WhyStep[] = [
    { question: "Why did checkout fail?", answer: "checkout-api returned 502 because DB connections were exhausted.", evidenceIds: ["EV-POOL"] },
    { question: "Why were DB connections exhausted?", answer: "Per-query cost quadrupled after CHG-20391 changed the join plan.", evidenceIds: ["EV-QP"] },
    { question: "Why did the plan change?", answer: "A new compound index made the planner prefer a nested-loop join.", evidenceIds: ["EV-QP", "EV-HYP"] },
    { question: "Why wasn't this caught pre-production?", answer: "Staging read pattern did not exercise the affected join and no prod canary was used.", evidenceIds: ["EV-CHG"] },
    { question: "Why did we detect it via customer impact first?", answer: "The pool-saturation alert threshold trailed SLO burn alerts.", evidenceIds: ["EV-ALT"] },
  ];

  const timeline = [
    { at: "13:57 UTC", label: "Deploy of CHG-20391 completes on checkout-db-01." },
    { at: "13:58 UTC", label: "Traffic ramp begins normal peak-hour window." },
    { at: "14:01 UTC", label: "checkout p95 crosses 900ms threshold." },
    { at: "14:02 UTC", label: "SLO burn alert fires (14× hourly)." },
    { at: "14:05 UTC", label: "Pool-saturation alert fires; on-call SRE paged." },
    { at: "14:07 UTC", label: "Incident declared SEV-1; IC assigned." },
    { at: "14:14 UTC", label: "Root cause hypothesis HY-DB promoted to dominant." },
    { at: "14:22 UTC", label: "CHG-20391 revert executed via RB-0042 v14." },
    { at: "14:37 UTC", label: "Customer synthetic passes for 3 consecutive intervals; incident moved to Monitoring." },
    { at: "14:52 UTC", label: "Incident resolved." },
  ];

  const now = nowIso();
  return {
    incidentId,
    externalId: "PM-" + incidentId.replace(/[^A-Z0-9]/gi, "").slice(-4).padStart(4, "0"),
    problemId: null,
    state: "Draft",
    updatedAt: now,
    updatedBy: actorRole,
    execSummary:
      "A latent query-plan regression introduced by CHG-20391 became user-visible during normal peak traffic, " +
      "producing ~52 minutes of degraded checkout availability. The incident was mitigated by reverting the " +
      "change and validated against synthetic and RUM signals before resolution. This postmortem is blameless.",
    impact:
      "≈ 812 affected user sessions · 1,240 checkout attempts failed · 0.42/hr error-budget burn peak · " +
      "no data loss · payments-gateway and inventory-service unaffected.",
    timeline,
    detection: "SLO burn alert (14:02) preceded the pool-saturation alert (14:05). Time-to-detect: 4 minutes from deploy.",
    engagement: "On-call SRE paged at 14:05. IC assigned at 14:07. Change Manager engaged by 14:12. All response was blameless throughout.",
    mitigation: "Reverted CHG-20391 via RB-0042 v14 (Emergency change), then recycled checkout-db-01 connections.",
    recovery: "All 12 validation checks passed with 3 consecutive intervals green. No residual risk accepted.",
    rootCause,
    trigger,
    contributingFactors: contributing,
    fiveWhys,
    causalGraphSummary:
      "Trigger (peak-hour traffic) → contributing factor (pool_max_size headroom) → root cause (plan regression from CHG-20391) → symptom (502 rate on checkout-api).",
    promotedFromGraph: [],
    whatWentWell: [
      "SLO burn alert detected the impact within 4 minutes.",
      "Runbook RB-0042 was certified and executed cleanly.",
      "Communications cadence held to 15-minute intervals.",
    ],
    whatWentPoorly: [
      "Detection led with customer-visible impact rather than leading indicators.",
      "Change deployment skipped a prod canary phase.",
    ],
    whereFortunate: [
      "The affected DB replica lag was low (22s) at the time of failover consideration, though failover was not required.",
      "Peak traffic was on the low end of the seasonal range.",
    ],
    recurrenceRisk: {
      likelihood: "Medium", impact: "High",
      note: "Same class of regression is possible with any future index-shape change lacking prod canary.",
    },
    correctiveActions: [
      {
        id: rid("CA"),
        title: "Require prod canary for schema and index changes",
        description:
          "Update change policy CP-207 to require a ≥ 5-minute prod canary on 5% traffic for any change " +
          "that alters index shape or query planner inputs.",
        category: "Policy", priority: "P0",
        owner: null, state: "Proposed",
        linkedFindingId: "F-CF-CANARY",
        updatedAt: now,
      },
      {
        id: rid("CA"),
        title: "Add leading-indicator alert on planner cost delta",
        description:
          "Add an alert on median per-query cost delta > 2× baseline over 5 min, ahead of pool saturation.",
        category: "Monitoring", priority: "P1",
        owner: null, state: "Proposed",
        linkedFindingId: "F-CF-ALERT",
        updatedAt: now,
      },
      {
        id: rid("CA"),
        title: "Raise checkout-api pool_max_size baseline headroom",
        description:
          "Raise pool_max_size from 20 → 28 to restore ≥ 25% headroom over peak.",
        category: "Infra", priority: "P2",
        owner: null, state: "Proposed",
        linkedFindingId: "F-CF-POOL",
        updatedAt: now,
      },
    ],
    runbookProposals: [
      {
        id: rid("RBP"),
        runbookId: "RB-0042", runbookName: "Revert affected database index",
        change: "Add automatic connection recycling as step 5 rather than as an on-demand manual step.",
        rationale: "Reduces time-to-mitigate by ~2 minutes and removes an easy-to-forget manual step.",
        linkedFindingId: "F-ROOT",
        state: "Proposed", updatedAt: now,
      },
    ],
    monitoringProposals: [
      {
        id: rid("MON"),
        kind: "Alert", target: "checkout-db-01 planner-cost delta",
        change: "Add p50 planner-cost 2× baseline over 5m as a page-worthy alert.",
        rationale: "Leading indicator ahead of pool saturation.",
        linkedFindingId: "F-CF-ALERT",
        state: "Proposed", updatedAt: now,
      },
      {
        id: rid("MON"),
        kind: "SLO", target: "checkout availability",
        change: "Add a 1h fast-burn multi-window alert (14× fast, 6× slow).",
        rationale: "Detect low-and-slow regressions earlier without alert fatigue.",
        state: "Proposed", updatedAt: now,
      },
    ],
    knownErrors: [],
    approvals: [
      { role: "Incident Commander", state: "Pending", decidedBy: null, decidedAt: null, note: "" },
      { role: "Service Owner",      state: "Pending", decidedBy: null, decidedAt: null, note: "" },
    ],
    publishedAt: null,
  };
}

/* ------------------------------- Helpers -------------------------------- */

function stateTone(s: DocState) {
  switch (s) {
    case "Published":    return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Approved":     return "bg-blue-50 text-blue-800 border-blue-200";
    case "Review":       return "bg-indigo-50 text-indigo-800 border-indigo-200";
    case "Evidence Gap": return "bg-amber-50 text-amber-800 border-amber-200";
    case "Reopened":     return "bg-red-50 text-red-700 border-red-200";
    default:             return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
function confTone(c: Confidence) {
  switch (c) {
    case "confirmed": return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "high":      return "bg-blue-50 text-blue-800 border-blue-200";
    case "medium":    return "bg-amber-50 text-amber-800 border-amber-200";
    case "low":       return "bg-slate-100 text-slate-600 border-slate-200";
  }
}
function originTone(o: Origin) {
  switch (o) {
    case "ai-suggested":       return "bg-purple-50 text-purple-800 border-purple-200";
    case "human-authored":     return "bg-slate-100 text-slate-800 border-slate-300";
    case "promoted-from-graph":return "bg-blue-50 text-blue-800 border-blue-200";
  }
}

/* -------------------------------- Page ---------------------------------- */

export default function Postmortem() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams<{ incidentId?: string }>();
  const incidentId = params.incidentId ?? ops.incident.id;

  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [record, setRecord] = useState<PostmortemRecord | null>(null);
  const [tab, setTab] = useState<"summary" | "rca" | "actions" | "review">("summary");
  const [dialog, setDialog] = useState<
    | null
    | "generate"
    | "confirm-finding"
    | "add-corrective"
    | "assign-owner"
    | "add-runbook"
    | "add-monitor"
    | "create-problem"
    | "create-known-error"
    | "request-review"
    | "approve"
    | "publish"
    | "reopen"
  >(null);
  const [dialogTarget, setDialogTarget] = useState<string>("");
  const [inp, setInp] = useState<Record<string, string>>({});
  const [connectorDown, setConnectorDown] = useState(false);

  /* --------------------------- Load / seed ---------------------------- */
  useEffect(() => {
    const map = readMap<PostmortemRecord>(DOC_KEY);
    if (map[incidentId]) {
      setRecord(map[incidentId]);
    } else {
      // Do not auto-seed with AI content — user must explicitly generate.
      const empty: PostmortemRecord = {
        ...seedDraft(incidentId, ops.role),
        execSummary: "",
        rootCause: null,
        trigger: null,
        contributingFactors: [],
        fiveWhys: [],
        correctiveActions: [],
        runbookProposals: [],
        monitoringProposals: [],
        knownErrors: [],
        promotedFromGraph: [],
        state: "Draft",
      };
      map[incidentId] = empty;
      writeMap(DOC_KEY, map);
      setRecord(empty);
    }
  }, [incidentId, ops.role]);

  const audit = useCallback(
    (title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
      ops.pushNotification({
        kind, title, detail, entityRef: incidentId,
        route: `/runops/incidents/${incidentId}/postmortem`,
      });
    },
    [ops, incidentId],
  );

  const persist = useCallback((next: PostmortemRecord) => {
    const patched: PostmortemRecord = { ...next, updatedAt: nowIso(), updatedBy: ops.role };
    const map = readMap<PostmortemRecord>(DOC_KEY);
    map[patched.incidentId] = patched;
    writeMap(DOC_KEY, map);
    setRecord(patched);
  }, [ops.role]);

  const mirrorIncident = useCallback((label: string, detail?: string, patch?: Partial<StoredIncident>) => {
    const map = readMap<StoredIncident>(INCIDENTS_KEY);
    const inc = map[incidentId] ?? { incidentId };
    const timeline = Array.isArray(inc.timeline) ? [...inc.timeline] : [];
    timeline.push({ at: nowIso(), label, detail });
    map[incidentId] = { ...inc, ...patch, timeline, updatedAt: nowIso() };
    writeMap(INCIDENTS_KEY, map);
  }, [incidentId]);

  /* --------------------------- Derived views -------------------------- */

  const evidenceGap = useMemo(() => {
    if (!record) return false;
    if (record.state === "Published") return false;
    // Material conclusions must have at least one evidence reference.
    if (record.rootCause && record.rootCause.evidence.length === 0) return true;
    for (const cf of record.contributingFactors) if (cf.evidence.length === 0) return true;
    // If root cause missing, count as gap for a promoted document.
    if (record.state === "Review" && !record.rootCause) return true;
    return false;
  }, [record]);

  const approvalsReady = useMemo(() => {
    if (!record) return false;
    return record.approvals.every((a) => a.state === "Approved");
  }, [record]);

  const canPublish = record && !evidenceGap && approvalsReady && record.state !== "Published";

  /* ------------------------------ Actions ----------------------------- */

  const generateDraft = () => {
    if (!record || !canWrite) return;
    if (connectorDown) {
      audit("Draft generation unavailable", "Evidence connector offline; try again after connector is restored.", "warning");
      return;
    }
    const draft = seedDraft(incidentId, ops.role);
    // Preserve external id, problem link, and any prior approvals we've already gathered.
    const next: PostmortemRecord = {
      ...draft,
      externalId: record.externalId,
      problemId: record.problemId,
      approvals: record.approvals,
      state: "Draft",
    };
    persist(next);
    mirrorIncident("Postmortem draft generated", `AI-suggested draft ${record.externalId} · pending human review.`);
    audit(`Postmortem draft generated · ${record.externalId}`, "Every finding is marked ai-suggested and must be confirmed by a reviewer.");
    setDialog(null);
  };

  const promoteFromGraph = () => {
    if (!record || !canWrite) return;
    // Deterministic promotion: attach the graph reference and mark uncertainty preserved.
    const promoted: Finding = {
      id: "F-GRAPH-" + Math.floor(Math.random() * 9000 + 1000).toString(),
      title: "Concurrent nightly reconciliation job amplified per-query cost.",
      body:
        "The Hypothesis Graph retained this direction as unresolved. Promoted here to preserve the interpretation " +
        "without claiming confirmed root-cause status.",
      origin: "promoted-from-graph",
      confidence: "medium",
      evidence: [
        { id: "EV-GRAPH", label: "Hypothesis Graph HY-BATCH", href: `/runops/incidents/${incidentId}/hypotheses`, note: "Unresolved direction preserved." },
      ],
      uncertainty: "Whether the reconciliation job was the sole amplifier or one of several concurrent read patterns.",
      unresolved: true,
      authorRole: ops.role,
      updatedAt: nowIso(),
    };
    persist({ ...record, promotedFromGraph: [...record.promotedFromGraph, promoted] });
    audit("Causal graph finding promoted", `${promoted.title} · retained as unresolved.`);
  };

  const confirmFinding = (findingId: string, note: string) => {
    if (!record || !canWrite || !note.trim()) return;
    const promote = (f: Finding | null): Finding | null => {
      if (!f || f.id !== findingId) return f;
      return { ...f, origin: "human-authored", confidence: "confirmed", authorRole: ops.role, uncertainty: note.trim(), updatedAt: nowIso() };
    };
    const promoteList = (list: Finding[]) => list.map((f) => promote(f) ?? f);
    persist({
      ...record,
      rootCause: promote(record.rootCause),
      trigger: promote(record.trigger),
      contributingFactors: promoteList(record.contributingFactors),
      promotedFromGraph: promoteList(record.promotedFromGraph),
    });
    audit(`Finding confirmed · ${findingId}`, note.trim());
    setDialog(null); setInp({});
  };

  const addCorrective = () => {
    if (!record || !canWrite || !inp.title?.trim() || !inp.description?.trim()) return;
    const ca: CorrectiveAction = {
      id: rid("CA"),
      title: inp.title.trim(),
      description: inp.description.trim(),
      category: (inp.category as CorrectiveAction["category"]) || "Process",
      priority: (inp.priority as CorrectiveAction["priority"]) || "P1",
      owner: null, state: "Proposed",
      linkedFindingId: inp.linkedFindingId || undefined,
      updatedAt: nowIso(),
    };
    persist({ ...record, correctiveActions: [...record.correctiveActions, ca] });
    audit(`Corrective action proposed · ${ca.title}`, `${ca.priority} · category ${ca.category}`);
    setDialog(null); setInp({});
  };

  const assignOwner = () => {
    if (!record || !canWrite || !dialogTarget || !inp.owner?.trim() || !inp.dueAt) return;
    const owner: OwnerAssignment = {
      ownerName: inp.owner.trim(),
      ownerRole: inp.ownerRole || "Service Owner",
      dueAt: new Date(inp.dueAt).toISOString(),
    };
    persist({
      ...record,
      correctiveActions: record.correctiveActions.map((c) =>
        c.id === dialogTarget ? { ...c, owner, state: c.state === "Proposed" ? "Accepted" : c.state, updatedAt: nowIso() } : c,
      ),
    });
    audit("Owner assigned", `${owner.ownerName} (${owner.ownerRole}) · due ${new Date(owner.dueAt).toLocaleDateString()}`);
    setDialog(null); setInp({}); setDialogTarget("");
  };

  const addRunbookProposal = () => {
    if (!record || !canWrite || !inp.runbookId?.trim() || !inp.change?.trim() || !inp.rationale?.trim()) return;
    const p: RunbookProposal = {
      id: rid("RBP"),
      runbookId: inp.runbookId.trim(),
      runbookName: inp.runbookName?.trim() || inp.runbookId.trim(),
      change: inp.change.trim(),
      rationale: inp.rationale.trim(),
      linkedFindingId: inp.linkedFindingId || undefined,
      state: "Proposed", updatedAt: nowIso(),
    };
    persist({ ...record, runbookProposals: [...record.runbookProposals, p] });
    audit(`Runbook change proposed · ${p.runbookId}`, p.change);
    setDialog(null); setInp({});
  };

  const addMonitoringProposal = () => {
    if (!record || !canWrite || !inp.target?.trim() || !inp.change?.trim() || !inp.rationale?.trim()) return;
    const p: MonitoringProposal = {
      id: rid("MON"),
      kind: (inp.kind as MonitoringProposal["kind"]) || "Alert",
      target: inp.target.trim(), change: inp.change.trim(), rationale: inp.rationale.trim(),
      linkedFindingId: inp.linkedFindingId || undefined,
      state: "Proposed", updatedAt: nowIso(),
    };
    persist({ ...record, monitoringProposals: [...record.monitoringProposals, p] });
    audit(`Monitoring change proposed · ${p.kind} · ${p.target}`, p.change);
    setDialog(null); setInp({});
  };

  const createProblem = () => {
    if (!record || !canWrite) return;
    if (record.problemId) {
      audit("Problem already exists", `Problem ${record.problemId} already linked.`, "warning");
      setDialog(null);
      return;
    }
    const id = "PRB-" + Math.floor(1000 + Math.random() * 9000).toString();
    const list = readList<{ id: string; incidentId: string; title: string; createdAt: string; createdBy: string }>(PROBLEMS_KEY);
    const existing = list.find((p) => p.incidentId === incidentId);
    const problemId = existing?.id ?? id;
    if (!existing) {
      writeList(PROBLEMS_KEY, [
        { id: problemId, incidentId, title: `Root-cause investigation for ${incidentId}`, createdAt: nowIso(), createdBy: ops.role },
        ...list,
      ]);
    }
    persist({ ...record, problemId });
    mirrorIncident("Problem linked to postmortem", `${problemId} linked to ${record.externalId}.`);
    audit(`Problem ${problemId} linked`, "Long-term tracking record created from postmortem.");
    setDialog(null);
  };

  const createKnownError = () => {
    if (!record || !canWrite || !inp.title?.trim() || !inp.workaround?.trim()) return;
    const ke: KnownError = {
      id: rid("KE"),
      title: inp.title.trim(),
      symptom: inp.symptom?.trim() || "",
      workaround: inp.workaround.trim(),
      triggeringConditions: inp.conditions?.trim() || "",
    };
    persist({ ...record, knownErrors: [...record.knownErrors, ke] });
    const list = readList<KnownError & { incidentId: string; createdAt: string }>(KNOWN_ERRORS_KEY);
    writeList(KNOWN_ERRORS_KEY, [{ ...ke, incidentId, createdAt: nowIso() }, ...list]);
    audit(`Known error created · ${ke.id}`, ke.title);
    setDialog(null); setInp({});
  };

  const requestReview = () => {
    if (!record || !canWrite) return;
    if (!record.rootCause) {
      audit("Cannot request review", "Postmortem has no root cause finding yet.", "warning");
      return;
    }
    persist({
      ...record,
      state: evidenceGap ? "Evidence Gap" : "Review",
      approvals: record.approvals.map((a) => ({ ...a, state: "Pending" })),
    });
    audit("Review requested", evidenceGap ? "Evidence gaps flagged for reviewers." : "Reviewers notified.");
    setDialog(null);
  };

  const approve = () => {
    if (!record || !canWrite || !dialogTarget) return;
    const idx = record.approvals.findIndex((a) => a.role === dialogTarget);
    if (idx < 0) return;
    const next = [...record.approvals];
    next[idx] = { ...next[idx], state: "Approved", decidedBy: ops.role, decidedAt: nowIso(), note: inp.note?.trim() ?? "" };
    const all = next.every((a) => a.state === "Approved");
    persist({ ...record, approvals: next, state: all ? "Approved" : record.state });
    audit(`Postmortem approved by ${dialogTarget}`, inp.note?.trim() ?? "");
    setDialog(null); setInp({}); setDialogTarget("");
  };

  const publish = () => {
    if (!record || !canWrite) return;
    if (!canPublish) {
      audit("Cannot publish", evidenceGap ? "Evidence gaps remain." : "Approvals incomplete.", "warning");
      return;
    }

    // 1. Ensure a Problem record exists
    let problemId = record.problemId;
    if (!problemId) {
      problemId = "PRB-" + Math.floor(1000 + Math.random() * 9000).toString();
      const list = readList<{ id: string; incidentId: string; title: string; createdAt: string; createdBy: string }>(PROBLEMS_KEY);
      writeList(PROBLEMS_KEY, [
        { id: problemId, incidentId, title: `Root-cause investigation for ${incidentId}`, createdAt: nowIso(), createdBy: ops.role },
        ...list.filter((p) => p.incidentId !== incidentId),
      ]);
    }

    // 2. Persist corrective actions as tracked items
    interface StoredCA extends CorrectiveAction { incidentId: string; postmortemId: string; problemId: string; createdAt: string }
    const caList = readList<StoredCA>(CORRECTIVE_KEY);
    const newCAs: StoredCA[] = record.correctiveActions.map((c) => ({
      ...c, incidentId, postmortemId: record.externalId, problemId: problemId as string, createdAt: nowIso(),
    }));
    writeList(CORRECTIVE_KEY, [...newCAs, ...caList.filter((c) => c.postmortemId !== record.externalId)]);

    // 3. Runbook proposals
    interface StoredRBP extends RunbookProposal { incidentId: string; postmortemId: string; createdAt: string }
    const rbpList = readList<StoredRBP>(RB_PROPOSALS_KEY);
    const newRBP: StoredRBP[] = record.runbookProposals.map((p) => ({ ...p, incidentId, postmortemId: record.externalId, createdAt: nowIso() }));
    writeList(RB_PROPOSALS_KEY, [...newRBP, ...rbpList.filter((p) => p.postmortemId !== record.externalId)]);

    // 4. Monitoring proposals
    interface StoredMON extends MonitoringProposal { incidentId: string; postmortemId: string; createdAt: string }
    const monList = readList<StoredMON>(MON_PROPOSALS_KEY);
    const newMON: StoredMON[] = record.monitoringProposals.map((p) => ({ ...p, incidentId, postmortemId: record.externalId, createdAt: nowIso() }));
    writeList(MON_PROPOSALS_KEY, [...newMON, ...monList.filter((p) => p.postmortemId !== record.externalId)]);

    // 5. Knowledge item
    interface StoredKnowledge {
      id: string; title: string; incidentId: string; postmortemId: string; problemId: string;
      summary: string; publishedAt: string; publishedBy: string;
    }
    const kList = readList<StoredKnowledge>(KNOWLEDGE_KEY);
    const kItem: StoredKnowledge = {
      id: "KB-" + record.externalId,
      title: `Lessons learned · ${record.externalId} · ${ops.selectedService.name}`,
      incidentId, postmortemId: record.externalId, problemId,
      summary: record.execSummary || "See postmortem for full analysis.",
      publishedAt: nowIso(), publishedBy: ops.role,
    };
    writeList(KNOWLEDGE_KEY, [kItem, ...kList.filter((k) => k.postmortemId !== record.externalId)]);

    // 6. Mirror onto incident + persist state
    persist({ ...record, problemId, state: "Published", publishedAt: nowIso() });
    mirrorIncident(
      `Postmortem ${record.externalId} published`,
      `Linked to ${problemId}. ${newCAs.length} corrective action(s), ${newRBP.length} runbook proposal(s), ${newMON.length} monitoring proposal(s), 1 knowledge item.`,
      { postmortem: { id: record.externalId, state: "Published", publishedAt: nowIso() } },
    );
    audit(`Postmortem ${record.externalId} published`, `${problemId} linked · ${newCAs.length} actions · ${newRBP.length} runbook proposals · ${newMON.length} monitoring proposals · knowledge item ${kItem.id}.`);
    setDialog(null);
  };

  const reopen = () => {
    if (!record || !canWrite) return;
    persist({ ...record, state: "Reopened", publishedAt: null, approvals: record.approvals.map((a) => ({ ...a, state: "Pending" as const })) });
    mirrorIncident(`Postmortem ${record.externalId} reopened`, "Findings under revision.");
    audit(`Postmortem ${record.externalId} reopened`, "Approvals reset and findings returned to Draft-equivalent state.", "warning");
    setDialog(null);
  };

  /* ------------------------------ Render ------------------------------ */

  if (!record) {
    return (
      <div className="flex flex-col">
        <EntityHeader title="Postmortem" subtitle="Loading postmortem…" />
        <div className="p-6 text-sm text-slate-600">Preparing postmortem for {incidentId}…</div>
      </div>
    );
  }

  const service = ops.selectedService;
  const allFindings: Finding[] = [
    ...(record.rootCause ? [record.rootCause] : []),
    ...(record.trigger ? [record.trigger] : []),
    ...record.contributingFactors,
    ...record.promotedFromGraph,
  ];

  return (
    <div className="flex flex-col">
      <EntityHeader
        eyebrow={`Incident · ${incidentId} · ${record.externalId}`}
        title="Postmortem, RCA & Problem"
        subtitle={`Blameless learning for ${service.name} · ${service.tier} · ${ops.environment}`}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("gap-1", stateTone(record.state))}>
              {record.state === "Published" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
               record.state === "Reopened" ? <AlertTriangle className="h-3.5 w-3.5" /> :
               record.state === "Evidence Gap" ? <ShieldAlert className="h-3.5 w-3.5" /> :
               <FileText className="h-3.5 w-3.5" />}
              {record.state}
            </Badge>
            <span className="text-slate-500">Problem:</span>
            <span>{record.problemId ?? "—"}</span>
            <span className="text-slate-500">· Updated:</span>
            <span>{new Date(record.updatedAt).toLocaleTimeString()} by {record.updatedBy}</span>
            {record.publishedAt && (
              <>
                <span className="text-slate-500">· Published:</span>
                <span>{new Date(record.publishedAt).toLocaleString()}</span>
              </>
            )}
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setDialog("generate")}
              disabled={!canWrite || connectorDown || record.state === "Published"}
              className="gap-1"
              aria-label="Generate draft from incident evidence"
            >
              <Sparkles className="h-4 w-4" /> Generate draft
            </Button>
            <Button
              variant="outline"
              onClick={promoteFromGraph}
              disabled={!canWrite || record.state === "Published"}
              className="gap-1"
              aria-label="Promote causal graph findings"
            >
              <GitBranch className="h-4 w-4" /> Promote from graph
            </Button>
            <Button
              variant="outline"
              onClick={() => setDialog("request-review")}
              disabled={!canWrite || !record.rootCause || record.state === "Published"}
              className="gap-1"
              aria-label="Request review"
            >
              <Send className="h-4 w-4" /> Request review
            </Button>
            <Button
              onClick={() => setDialog("publish")}
              disabled={!canWrite || !canPublish}
              className="gap-1"
              aria-label="Publish postmortem"
            >
              <BookOpen className="h-4 w-4" /> Publish
            </Button>
            {record.state === "Published" && (
              <Button
                variant="outline"
                onClick={() => setDialog("reopen")}
                disabled={!canWrite}
                className="gap-1"
                aria-label="Reopen postmortem"
              >
                <AlertTriangle className="h-4 w-4" /> Reopen
              </Button>
            )}
          </div>
        }
      />

      {/* Connector toggle */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-500" />
            Evidence connector:{" "}
            <span className={connectorDown ? "font-medium text-red-700" : "font-medium text-emerald-700"}>
              {connectorDown ? "Offline" : "Online"}
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setConnectorDown((v) => !v)} aria-label="Toggle evidence connector">
            {connectorDown ? "Restore connector" : "Simulate outage"}
          </Button>
        </div>
      </div>

      {evidenceGap && record.state !== "Published" && (
        <div className="px-6 pt-4">
          <Card className="border-amber-200 bg-amber-50/60">
            <CardContent className="p-3 text-sm text-amber-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Evidence gap — one or more material conclusions lack a linked evidence reference.
              Publishing is blocked until each has at least one source.
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList aria-label="Postmortem views">
            <TabsTrigger value="summary">Summary & timeline</TabsTrigger>
            <TabsTrigger value="rca">Root-cause analysis</TabsTrigger>
            <TabsTrigger value="actions">Corrective actions ({record.correctiveActions.length})</TabsTrigger>
            <TabsTrigger value="review">Review & publish</TabsTrigger>
          </TabsList>

          {/* -------------------- Summary & timeline ---------------------- */}
          <TabsContent value="summary" className="space-y-4 pt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <SectionTitle icon={<FileText className="h-4 w-4 text-slate-600" />} label="Executive summary" />
                <Textarea
                  value={record.execSummary}
                  onChange={(e) => canWrite && persist({ ...record, execSummary: e.target.value })}
                  placeholder="Blameless summary of what happened, impact, mitigation, and recovery…"
                  aria-label="Executive summary"
                  rows={4}
                  disabled={!canWrite || record.state === "Published"}
                />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <SectionTitle icon={<AlertTriangle className="h-4 w-4 text-red-600" />} label="Impact" />
                  <Textarea
                    value={record.impact}
                    onChange={(e) => canWrite && persist({ ...record, impact: e.target.value })}
                    aria-label="Impact"
                    rows={3}
                    disabled={!canWrite || record.state === "Published"}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <SectionTitle icon={<Gauge className="h-4 w-4 text-slate-600" />} label="Recurrence risk" />
                  <div className="flex gap-2 text-xs">
                    <Select
                      value={record.recurrenceRisk.likelihood}
                      onValueChange={(v) => canWrite && persist({ ...record, recurrenceRisk: { ...record.recurrenceRisk, likelihood: v as "Low" | "Medium" | "High" } })}
                    >
                      <SelectTrigger className="w-32" aria-label="Recurrence likelihood"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low likelihood</SelectItem>
                        <SelectItem value="Medium">Medium likelihood</SelectItem>
                        <SelectItem value="High">High likelihood</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={record.recurrenceRisk.impact}
                      onValueChange={(v) => canWrite && persist({ ...record, recurrenceRisk: { ...record.recurrenceRisk, impact: v as "Low" | "Medium" | "High" } })}
                    >
                      <SelectTrigger className="w-32" aria-label="Recurrence impact"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low impact</SelectItem>
                        <SelectItem value="Medium">Medium impact</SelectItem>
                        <SelectItem value="High">High impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    value={record.recurrenceRisk.note}
                    onChange={(e) => canWrite && persist({ ...record, recurrenceRisk: { ...record.recurrenceRisk, note: e.target.value } })}
                    aria-label="Recurrence risk note"
                    rows={2}
                    disabled={!canWrite || record.state === "Published"}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <SectionTitle icon={<ClipboardList className="h-4 w-4 text-slate-600" />} label="Timeline" />
                <ul className="space-y-1 text-sm text-slate-700">
                  {record.timeline.map((t, i) => (
                    <li key={i} className="flex gap-3 border-l-2 border-slate-200 pl-3">
                      <span className="w-24 shrink-0 font-mono text-xs text-slate-500">{t.at}</span>
                      <span>{t.label}{t.detail ? <span className="text-slate-500"> · {t.detail}</span> : null}</span>
                    </li>
                  ))}
                  {record.timeline.length === 0 && (
                    <li className="text-xs text-slate-500">No timeline yet. Generate a draft from incident evidence.</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <PhasePanel label="Detection"   value={record.detection}   onChange={(v) => persist({ ...record, detection: v })}   disabled={!canWrite || record.state === "Published"} />
              <PhasePanel label="Engagement"  value={record.engagement}  onChange={(v) => persist({ ...record, engagement: v })}  disabled={!canWrite || record.state === "Published"} />
              <PhasePanel label="Mitigation"  value={record.mitigation}  onChange={(v) => persist({ ...record, mitigation: v })}  disabled={!canWrite || record.state === "Published"} />
              <PhasePanel label="Recovery"    value={record.recovery}    onChange={(v) => persist({ ...record, recovery: v })}    disabled={!canWrite || record.state === "Published"} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <ListPanel
                label="What went well" tone="ok"
                items={record.whatWentWell}
                onChange={(next) => persist({ ...record, whatWentWell: next })}
                disabled={!canWrite || record.state === "Published"}
              />
              <ListPanel
                label="What went poorly" tone="warn"
                items={record.whatWentPoorly}
                onChange={(next) => persist({ ...record, whatWentPoorly: next })}
                disabled={!canWrite || record.state === "Published"}
              />
              <ListPanel
                label="Where response was fortunate" tone="info"
                items={record.whereFortunate}
                onChange={(next) => persist({ ...record, whereFortunate: next })}
                disabled={!canWrite || record.state === "Published"}
              />
            </div>
          </TabsContent>

          {/* --------------------------- RCA ------------------------------ */}
          <TabsContent value="rca" className="space-y-4 pt-4">
            <FindingCard title="Root cause"           finding={record.rootCause} onConfirm={(id) => { setDialog("confirm-finding"); setDialogTarget(id); }} canWrite={canWrite} readOnly={record.state === "Published"} />
            <FindingCard title="Trigger (not cause)"  finding={record.trigger}   onConfirm={(id) => { setDialog("confirm-finding"); setDialogTarget(id); }} canWrite={canWrite} readOnly={record.state === "Published"} />

            <Card>
              <CardContent className="p-4 space-y-3">
                <SectionTitle icon={<Lightbulb className="h-4 w-4 text-amber-600" />} label="Contributing factors" />
                {record.contributingFactors.length === 0 && (
                  <p className="text-xs text-slate-500">No contributing factors yet. Generate a draft or add one manually.</p>
                )}
                {record.contributingFactors.map((f) => (
                  <FindingRow key={f.id} f={f} onConfirm={(id) => { setDialog("confirm-finding"); setDialogTarget(id); }} canWrite={canWrite} readOnly={record.state === "Published"} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <SectionTitle icon={<ListChecks className="h-4 w-4 text-slate-600" />} label="Five whys" />
                {record.fiveWhys.length === 0 && (
                  <p className="text-xs text-slate-500">No five whys drafted yet.</p>
                )}
                <ol className="list-decimal space-y-2 pl-6 text-sm text-slate-700">
                  {record.fiveWhys.map((w, i) => (
                    <li key={i}>
                      <div className="font-medium text-slate-900">{w.question}</div>
                      <div className="text-slate-700">{w.answer}</div>
                      {w.evidenceIds.length > 0 && (
                        <div className="mt-1 text-[11px] text-slate-500">Evidence: {w.evidenceIds.join(", ")}</div>
                      )}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <SectionTitle icon={<GitBranch className="h-4 w-4 text-blue-600" />} label="Causal graph summary" />
                <p className="text-sm text-slate-700">{record.causalGraphSummary || "Promote findings from the Hypothesis Graph to populate this section."}</p>
                {record.promotedFromGraph.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-medium text-slate-700">Promoted from graph (unresolved interpretations retained)</div>
                    {record.promotedFromGraph.map((f) => (
                      <FindingRow key={f.id} f={f} onConfirm={(id) => { setDialog("confirm-finding"); setDialogTarget(id); }} canWrite={canWrite} readOnly={record.state === "Published"} />
                    ))}
                  </div>
                )}
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/runops/incidents/${incidentId}/hypotheses`)} className="gap-1" aria-label="Open causal graph">
                    <ExternalLink className="h-3.5 w-3.5" /> Open causal graph
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------------ Corrective -------------------------- */}
          <TabsContent value="actions" className="space-y-4 pt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <SectionTitle icon={<Wrench className="h-4 w-4 text-slate-600" />} label="Corrective actions" />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setDialog("add-corrective"); setInp({}); }} disabled={!canWrite || record.state === "Published"} aria-label="Add corrective action">
                      Add action
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/runops/problems/actions`)} className="gap-1" aria-label="Open problem actions">
                      <ExternalLink className="h-3.5 w-3.5" /> Open /problems/actions
                    </Button>
                  </div>
                </div>
                {record.correctiveActions.length === 0 && (
                  <p className="text-xs text-slate-500">No corrective actions yet. Add proposals grounded in specific findings.</p>
                )}
                <div className="space-y-2">
                  {record.correctiveActions.map((c) => (
                    <div key={c.id} className="rounded-md border border-slate-200 bg-white p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{c.title}</span>
                        <Badge variant="outline" className="text-[10px]">{c.priority}</Badge>
                        <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                        <Badge variant="outline" className={cn("text-[10px]", c.state === "Completed" ? "border-emerald-200 text-emerald-800" : c.state === "Rejected" ? "border-red-200 text-red-700" : "border-slate-200 text-slate-700")}>
                          {c.state}
                        </Badge>
                        {c.linkedFindingId && <Badge variant="outline" className="text-[10px]">→ {c.linkedFindingId}</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{c.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> {c.owner ? `${c.owner.ownerName} (${c.owner.ownerRole})` : "Unassigned"}</span>
                        {c.owner && <span>Due {new Date(c.owner.dueAt).toLocaleDateString()}</span>}
                        <Button size="sm" variant="ghost" onClick={() => { setDialog("assign-owner"); setDialogTarget(c.id); setInp({}); }} disabled={!canWrite || record.state === "Published"} className="h-6 px-2 text-xs" aria-label={`Assign owner for ${c.title}`}>
                          {c.owner ? "Reassign" : "Assign owner"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <SectionTitle icon={<GitBranch className="h-4 w-4 text-blue-600" />} label="Runbook changes" />
                    <Button size="sm" variant="outline" onClick={() => { setDialog("add-runbook"); setInp({}); }} disabled={!canWrite || record.state === "Published"} aria-label="Propose runbook change">Add proposal</Button>
                  </div>
                  {record.runbookProposals.length === 0 && <p className="text-xs text-slate-500">No runbook proposals yet.</p>}
                  {record.runbookProposals.map((p) => (
                    <div key={p.id} className="rounded-md border border-slate-200 p-2 text-xs">
                      <div className="flex items-center gap-2"><span className="font-medium text-slate-900">{p.runbookId}</span> <span className="text-slate-600">· {p.runbookName}</span></div>
                      <div className="text-slate-700">{p.change}</div>
                      <div className="text-slate-500">Rationale: {p.rationale}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <SectionTitle icon={<Gauge className="h-4 w-4 text-slate-600" />} label="Monitoring changes" />
                    <Button size="sm" variant="outline" onClick={() => { setDialog("add-monitor"); setInp({}); }} disabled={!canWrite || record.state === "Published"} aria-label="Propose monitoring change">Add proposal</Button>
                  </div>
                  {record.monitoringProposals.length === 0 && <p className="text-xs text-slate-500">No monitoring proposals yet.</p>}
                  {record.monitoringProposals.map((p) => (
                    <div key={p.id} className="rounded-md border border-slate-200 p-2 text-xs">
                      <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{p.kind}</Badge><span className="font-medium text-slate-900">{p.target}</span></div>
                      <div className="text-slate-700">{p.change}</div>
                      <div className="text-slate-500">Rationale: {p.rationale}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <SectionTitle icon={<ShieldAlert className="h-4 w-4 text-amber-600" />} label="Known errors" />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setDialog("create-known-error"); setInp({}); }} disabled={!canWrite || record.state === "Published"} aria-label="Create known error">Create known error</Button>
                    <Button size="sm" variant="outline" onClick={() => setDialog("create-problem")} disabled={!canWrite} aria-label="Create problem">
                      {record.problemId ? `Linked · ${record.problemId}` : "Create problem"}
                    </Button>
                  </div>
                </div>
                {record.knownErrors.length === 0 && <p className="text-xs text-slate-500">No known errors captured. Add one if a workaround exists while root cause is being addressed.</p>}
                {record.knownErrors.map((k) => (
                  <div key={k.id} className="rounded-md border border-slate-200 p-2 text-xs">
                    <div className="font-medium text-slate-900">{k.id} · {k.title}</div>
                    <div className="text-slate-700">Symptom: {k.symptom}</div>
                    <div className="text-slate-700">Workaround: {k.workaround}</div>
                    {k.triggeringConditions && <div className="text-slate-500">Triggering: {k.triggeringConditions}</div>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------------- Review ----------------------------- */}
          <TabsContent value="review" className="space-y-4 pt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <SectionTitle icon={<Users className="h-4 w-4 text-slate-600" />} label="Approvals" />
                <div className="space-y-2">
                  {record.approvals.map((a) => (
                    <div key={a.role} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white p-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium text-slate-900">{a.role}</span>
                        <Badge variant="outline" className={cn("text-[10px]", a.state === "Approved" ? "border-emerald-200 text-emerald-800" : a.state === "Changes Requested" ? "border-red-200 text-red-700" : "border-slate-200 text-slate-700")}>
                          {a.state}
                        </Badge>
                        {a.decidedBy && <span className="text-xs text-slate-500">by {a.decidedBy} at {a.decidedAt ? new Date(a.decidedAt).toLocaleTimeString() : ""}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setDialog("approve"); setDialogTarget(a.role); setInp({}); }} disabled={!canWrite || a.state === "Approved" || record.state === "Published"} aria-label={`Approve as ${a.role}`}>
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Publication requires all approvals and no evidence gaps. AI-suggested findings must be confirmed by a reviewer before they can be counted as material conclusions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2 text-sm text-slate-700">
                <SectionTitle icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />} label="Publication effects" />
                <p>Publishing this postmortem will:</p>
                <ul className="list-disc pl-6 text-xs text-slate-600 space-y-1">
                  <li>Create or update Problem record ({record.problemId ?? "PRB-new"}).</li>
                  <li>Persist {record.correctiveActions.length} corrective action(s) into /problems/actions.</li>
                  <li>Persist {record.runbookProposals.length} runbook change proposal(s) to Runbook Fitness / Runbook Detail.</li>
                  <li>Persist {record.monitoringProposals.length} monitoring change proposal(s).</li>
                  <li>Publish a knowledge item (KB-{record.externalId}) discoverable in Knowledge Search.</li>
                  <li>Append the publication to the incident timeline.</li>
                </ul>
                {allFindings.some((f) => f.origin === "ai-suggested") && (
                  <p className="text-xs text-amber-800">
                    Note: some findings are still AI-suggested. Confirm each material conclusion before publishing.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {!canWrite && (
          <p className="mt-4 text-xs text-slate-500">Your role ({ops.role}) can view this postmortem but cannot mutate it.</p>
        )}
      </div>

      {/* ------------------------------ Dialogs ---------------------------- */}
      <Dialog open={dialog !== null} onOpenChange={(v) => { if (!v) { setDialog(null); setInp({}); setDialogTarget(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "generate"          && "Generate draft from incident evidence"}
              {dialog === "confirm-finding"   && "Confirm finding (with reviewer note)"}
              {dialog === "add-corrective"    && "Add corrective action"}
              {dialog === "assign-owner"      && "Assign owner"}
              {dialog === "add-runbook"       && "Propose runbook change"}
              {dialog === "add-monitor"       && "Propose SLO or monitoring change"}
              {dialog === "create-problem"    && (record.problemId ? "Problem already linked" : "Create problem")}
              {dialog === "create-known-error"&& "Create known error"}
              {dialog === "request-review"    && "Request review"}
              {dialog === "approve"           && `Approve as ${dialogTarget}`}
              {dialog === "publish"           && "Publish postmortem"}
              {dialog === "reopen"            && "Reopen postmortem"}
            </DialogTitle>
          </DialogHeader>

          {dialog === "generate" && (
            <p className="text-sm text-slate-700">
              Populates every section with an AI-suggested draft grounded in the incident's evidence.
              All findings will be marked <span className="font-medium">ai-suggested</span> until a reviewer confirms them.
              Human edits already made to unrelated sections will be lost.
            </p>
          )}

          {dialog === "confirm-finding" && (
            <div className="space-y-2 text-sm">
              <p className="text-slate-700">Confirming a finding requires a short reviewer note explaining what evidence was checked.</p>
              <Textarea
                placeholder="What did you verify to promote this finding to confirmed?"
                value={inp.note ?? ""}
                onChange={(e) => setInp({ ...inp, note: e.target.value })}
                aria-label="Confirmation note"
              />
            </div>
          )}

          {dialog === "add-corrective" && (
            <div className="space-y-2 text-sm">
              <Input placeholder="Title" value={inp.title ?? ""} onChange={(e) => setInp({ ...inp, title: e.target.value })} aria-label="Action title" />
              <Textarea placeholder="Description" value={inp.description ?? ""} onChange={(e) => setInp({ ...inp, description: e.target.value })} aria-label="Action description" />
              <div className="grid grid-cols-2 gap-2">
                <Select value={inp.category ?? "Process"} onValueChange={(v) => setInp({ ...inp, category: v })}>
                  <SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Process", "Code", "Infra", "Monitoring", "Runbook", "Policy"] as const).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={inp.priority ?? "P1"} onValueChange={(v) => setInp({ ...inp, priority: v })}>
                  <SelectTrigger aria-label="Priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["P0", "P1", "P2"] as const).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {allFindings.length > 0 && (
                <Select value={inp.linkedFindingId ?? ""} onValueChange={(v) => setInp({ ...inp, linkedFindingId: v })}>
                  <SelectTrigger aria-label="Linked finding"><SelectValue placeholder="Link to a finding (optional)" /></SelectTrigger>
                  <SelectContent>
                    {allFindings.map((f) => <SelectItem key={f.id} value={f.id}>{f.id} · {f.title.slice(0, 60)}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {dialog === "assign-owner" && (
            <div className="space-y-2 text-sm">
              <Input placeholder="Owner name" value={inp.owner ?? ""} onChange={(e) => setInp({ ...inp, owner: e.target.value })} aria-label="Owner name" />
              <Input placeholder="Owner role (default: Service Owner)" value={inp.ownerRole ?? ""} onChange={(e) => setInp({ ...inp, ownerRole: e.target.value })} aria-label="Owner role" />
              <Input type="date" value={inp.dueAt ?? ""} onChange={(e) => setInp({ ...inp, dueAt: e.target.value })} aria-label="Due date" />
            </div>
          )}

          {dialog === "add-runbook" && (
            <div className="space-y-2 text-sm">
              <Input placeholder="Runbook id (e.g., RB-0042)" value={inp.runbookId ?? ""} onChange={(e) => setInp({ ...inp, runbookId: e.target.value })} aria-label="Runbook id" />
              <Input placeholder="Runbook name (optional)" value={inp.runbookName ?? ""} onChange={(e) => setInp({ ...inp, runbookName: e.target.value })} aria-label="Runbook name" />
              <Textarea placeholder="Proposed change" value={inp.change ?? ""} onChange={(e) => setInp({ ...inp, change: e.target.value })} aria-label="Proposed change" />
              <Textarea placeholder="Rationale" value={inp.rationale ?? ""} onChange={(e) => setInp({ ...inp, rationale: e.target.value })} aria-label="Rationale" />
            </div>
          )}

          {dialog === "add-monitor" && (
            <div className="space-y-2 text-sm">
              <Select value={inp.kind ?? "Alert"} onValueChange={(v) => setInp({ ...inp, kind: v })}>
                <SelectTrigger aria-label="Kind"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["SLO", "Alert", "Dashboard", "Synthetic"] as const).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Target (e.g., checkout availability)" value={inp.target ?? ""} onChange={(e) => setInp({ ...inp, target: e.target.value })} aria-label="Target" />
              <Textarea placeholder="Proposed change" value={inp.change ?? ""} onChange={(e) => setInp({ ...inp, change: e.target.value })} aria-label="Change" />
              <Textarea placeholder="Rationale" value={inp.rationale ?? ""} onChange={(e) => setInp({ ...inp, rationale: e.target.value })} aria-label="Rationale" />
            </div>
          )}

          {dialog === "create-problem" && (
            <p className="text-sm text-slate-700">
              {record.problemId
                ? `Problem ${record.problemId} is already linked to this postmortem.`
                : `Creates a Problem record linked to ${record.externalId}. Publishing later will also ensure a Problem exists if you skip this step.`}
            </p>
          )}

          {dialog === "create-known-error" && (
            <div className="space-y-2 text-sm">
              <Input placeholder="Title" value={inp.title ?? ""} onChange={(e) => setInp({ ...inp, title: e.target.value })} aria-label="Known error title" />
              <Textarea placeholder="Symptom" value={inp.symptom ?? ""} onChange={(e) => setInp({ ...inp, symptom: e.target.value })} aria-label="Symptom" />
              <Textarea placeholder="Workaround" value={inp.workaround ?? ""} onChange={(e) => setInp({ ...inp, workaround: e.target.value })} aria-label="Workaround" />
              <Textarea placeholder="Triggering conditions (optional)" value={inp.conditions ?? ""} onChange={(e) => setInp({ ...inp, conditions: e.target.value })} aria-label="Triggering conditions" />
            </div>
          )}

          {dialog === "request-review" && (
            <div className="text-sm text-slate-700 space-y-2">
              <p>Sends the postmortem to reviewers. If any material conclusion is missing evidence, the state is set to <span className="font-medium">Evidence Gap</span>.</p>
              {evidenceGap && <p className="text-xs text-amber-800">Evidence gaps present — reviewers will be notified.</p>}
            </div>
          )}

          {dialog === "approve" && (
            <Textarea
              placeholder="Approval note (optional)"
              value={inp.note ?? ""}
              onChange={(e) => setInp({ ...inp, note: e.target.value })}
              aria-label="Approval note"
            />
          )}

          {dialog === "publish" && (
            <div className="text-sm text-slate-700 space-y-2">
              <p>Publishing will:</p>
              <ul className="list-disc pl-6 text-xs text-slate-600 space-y-1">
                <li>Create/update Problem ({record.problemId ?? "PRB-new"}).</li>
                <li>Persist {record.correctiveActions.length} corrective action(s) into /problems/actions.</li>
                <li>Persist {record.runbookProposals.length} runbook change proposal(s) into Runbook Fitness / Detail.</li>
                <li>Persist {record.monitoringProposals.length} monitoring proposal(s).</li>
                <li>Publish knowledge item KB-{record.externalId} into Knowledge Search.</li>
                <li>Append the publication to the incident timeline.</li>
              </ul>
              {!canPublish && (
                <p className="text-xs text-red-700">
                  Blocked: {evidenceGap ? "evidence gaps present" : "approvals incomplete"}.
                </p>
              )}
            </div>
          )}

          {dialog === "reopen" && (
            <p className="text-sm text-slate-700">
              Reopens the postmortem for revision. Approvals are reset, publication is cleared, and the incident timeline records the reopen event.
              Downstream corrective actions, runbook proposals, and knowledge items are preserved and can be updated by re-publishing.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialog(null); setInp({}); setDialogTarget(""); }}>Cancel</Button>
            {dialog === "generate"           && <Button onClick={generateDraft} disabled={connectorDown}>Generate draft</Button>}
            {dialog === "confirm-finding"    && <Button onClick={() => confirmFinding(dialogTarget, inp.note ?? "")} disabled={!(inp.note ?? "").trim()}>Confirm</Button>}
            {dialog === "add-corrective"     && <Button onClick={addCorrective} disabled={!(inp.title ?? "").trim() || !(inp.description ?? "").trim()}>Add</Button>}
            {dialog === "assign-owner"       && <Button onClick={assignOwner} disabled={!(inp.owner ?? "").trim() || !inp.dueAt}>Assign</Button>}
            {dialog === "add-runbook"        && <Button onClick={addRunbookProposal} disabled={!(inp.runbookId ?? "").trim() || !(inp.change ?? "").trim() || !(inp.rationale ?? "").trim()}>Add proposal</Button>}
            {dialog === "add-monitor"        && <Button onClick={addMonitoringProposal} disabled={!(inp.target ?? "").trim() || !(inp.change ?? "").trim() || !(inp.rationale ?? "").trim()}>Add proposal</Button>}
            {dialog === "create-problem"     && <Button onClick={createProblem} disabled={!!record.problemId}>Create problem</Button>}
            {dialog === "create-known-error" && <Button onClick={createKnownError} disabled={!(inp.title ?? "").trim() || !(inp.workaround ?? "").trim()}>Create known error</Button>}
            {dialog === "request-review"     && <Button onClick={requestReview}>Request review</Button>}
            {dialog === "approve"            && <Button onClick={approve}>Approve</Button>}
            {dialog === "publish"            && <Button onClick={publish} disabled={!canPublish}>Publish</Button>}
            {dialog === "reopen"             && <Button variant="destructive" onClick={reopen}>Reopen</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------- Small presentational helpers --------------------- */

interface SectionTitleProps { icon: React.ReactNode; label: string }
function SectionTitle({ icon, label }: SectionTitleProps) {
  return <h3 className="flex items-center gap-2 text-sm font-medium text-slate-900">{icon} {label}</h3>;
}

interface PhasePanelProps { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }
function PhasePanel({ label, value, onChange, disabled }: PhasePanelProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <SectionTitle icon={<ClipboardList className="h-4 w-4 text-slate-600" />} label={label} />
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} rows={3} aria-label={label} />
      </CardContent>
    </Card>
  );
}

interface ListPanelProps { label: string; tone: "ok" | "warn" | "info"; items: string[]; onChange: (next: string[]) => void; disabled?: boolean }
function ListPanel({ label, tone, items, onChange, disabled }: ListPanelProps) {
  const [draft, setDraft] = useState("");
  const toneClass =
    tone === "ok"   ? "border-emerald-200 bg-emerald-50/40"
  : tone === "warn" ? "border-amber-200 bg-amber-50/40"
  :                   "border-blue-200 bg-blue-50/40";
  return (
    <Card className={cn(toneClass)}>
      <CardContent className="p-4 space-y-2">
        <SectionTitle icon={<ClipboardList className="h-4 w-4 text-slate-600" />} label={label} />
        <ul className="space-y-1 text-sm">
          {items.map((s, i) => (
            <li key={i} className="flex items-start justify-between gap-2">
              <span>· {s}</span>
              {!disabled && (
                <Button size="sm" variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))} className="h-6 px-2 text-xs" aria-label={`Remove item from ${label}`}>
                  ×
                </Button>
              )}
            </li>
          ))}
          {items.length === 0 && <li className="text-xs text-slate-500">None captured.</li>}
        </ul>
        {!disabled && (
          <div className="flex gap-2">
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add item" aria-label={`Add item to ${label}`} />
            <Button size="sm" onClick={() => { if (!draft.trim()) return; onChange([...items, draft.trim()]); setDraft(""); }}>Add</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FindingCardProps { title: string; finding: Finding | null; onConfirm: (id: string) => void; canWrite: boolean; readOnly: boolean }
function FindingCard({ title, finding, onConfirm, canWrite, readOnly }: FindingCardProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <SectionTitle icon={<Lightbulb className="h-4 w-4 text-amber-600" />} label={title} />
          {finding && finding.origin !== "human-authored" && !readOnly && (
            <Button size="sm" variant="outline" onClick={() => onConfirm(finding.id)} disabled={!canWrite} className="gap-1" aria-label={`Confirm ${title}`}>
              <ShieldCheck className="h-3.5 w-3.5" /> Confirm
            </Button>
          )}
        </div>
        {!finding && <p className="text-xs text-slate-500">No {title.toLowerCase()} yet. Generate a draft to populate.</p>}
        {finding && <FindingBody f={finding} />}
      </CardContent>
    </Card>
  );
}

interface FindingRowProps { f: Finding; onConfirm: (id: string) => void; canWrite: boolean; readOnly: boolean }
function FindingRow({ f, onConfirm, canWrite, readOnly }: FindingRowProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-900">{f.title}</span>
        <Badge variant="outline" className={cn("text-[10px]", confTone(f.confidence))}>{f.confidence}</Badge>
        <Badge variant="outline" className={cn("text-[10px]", originTone(f.origin))}>{f.origin}</Badge>
        {f.unresolved && <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-800">unresolved</Badge>}
        {f.origin !== "human-authored" && !readOnly && (
          <Button size="sm" variant="ghost" onClick={() => onConfirm(f.id)} disabled={!canWrite} className="ml-auto h-6 px-2 text-xs" aria-label={`Confirm ${f.title}`}>
            Confirm
          </Button>
        )}
      </div>
      <FindingBody f={f} />
    </div>
  );
}

function FindingBody({ f }: { f: Finding }) {
  return (
    <>
      <p className="mt-1 text-sm text-slate-700">{f.body}</p>
      {f.uncertainty && <p className="mt-1 text-xs text-amber-800"><span className="font-medium">Uncertainty:</span> {f.uncertainty}</p>}
      {f.evidence.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Evidence & sources</div>
          <ul className="space-y-1">
            {f.evidence.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-xs text-slate-700">
                <ExternalLink className="h-3 w-3 text-slate-400" />
                <a href={e.href} target="_blank" rel="noopener noreferrer" className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900">{e.label}</a>
                <span className="text-slate-500">· {e.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-2 text-[11px] text-slate-500">Author: {f.authorRole} · Updated {new Date(f.updatedAt).toLocaleTimeString()}</p>
    </>
  );
}
