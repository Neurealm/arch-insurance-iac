/**
 * Page 29 · Remediation Comparison & Decision
 * Route: /runops/incidents/:incidentId/remediations
 *
 * Compares candidate mitigations before executing change, using deterministic
 * simulation and weighted recommendation. Nothing is randomised.
 *
 * Persistence:
 *   runops.remediations.v1[incidentId]  → RemediationRecord
 *   runops.incidents.v1[incidentId]     (remediation decision mirrored + timeline)
 *   runops.approvals.v1                 (append pending approval on request)
 *   runops.launchprefill.v1[runbookId]  (prefill payload the Launch Center can read)
 *
 * Every mutation emits an audit + domain event via ops.pushNotification.
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowUpRight, CheckCircle2, ChevronRight, ClipboardCheck,
  FlaskConical, GitBranch, GitCompare, Info, Layers, PlayCircle, ShieldAlert,
  ShieldCheck, Sparkles, Timer, TriangleAlert, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------- Types --------------------------------- */

type ChangeReq = "None" | "Standard" | "Normal" | "Emergency";
type RiskLevel = "Low" | "Medium" | "High";
type EvidenceStrength = "weak" | "moderate" | "strong";
type OptionState = "candidate" | "primary" | "fallback" | "rejected";

interface RemediationSource {
  label: string;
  url: string;
  strength: EvidenceStrength;
  note: string;
}

interface RemediationOption {
  id: string;
  title: string;
  summary: string;
  runbookId: string;
  runbookVersion: string;
  changeRequirement: ChangeReq;
  approvalRole: string;
  timeToMitigateMin: number;
  probabilityOfSuccess: number;   // 0..100
  operationalRisk: RiskLevel;
  customerImpactDuring: string;
  blastRadius: string;
  expectedSloRecovery: string;
  rollbackConfidence: number;     // 0..100
  resourceRequirement: string;
  costPerHour: number;            // deterministic USD estimate
  evidenceStrength: EvidenceStrength;
  assumptions: string[];
  uncertainties: string[];
  policyBlocked: boolean;
  policyReason?: string;
  sources: RemediationSource[];
  simulation: SimulationResult;
}

interface SimulationResult {
  available: boolean;
  projectedRecoveryMin: number;
  successBand: [number, number];    // ± confidence band
  slaImpactBand: string;
  notes: string;
  ran: boolean;
}

interface OptionMutable {
  id: string;
  state: OptionState;
  rejectionReason?: string;
  selectedAt?: string;
  simulationRunAt?: string;
}

interface DecisionRecord {
  decidedAt: string;
  decidedBy: string;
  primaryId: string;
  fallbackId?: string;
  rationale: string;
}

interface RemediationRecord {
  incidentId: string;
  options: OptionMutable[];
  decision: DecisionRecord | null;
  approvalId: string | null;
  updatedAt: string;
}

interface StoredIncident {
  incidentId: string;
  timeline?: { at: string; label: string; detail?: string }[];
  remediation?: { primaryId: string; fallbackId?: string; decidedAt: string; decidedBy: string; rationale: string };
  updatedAt?: string;
  [k: string]: unknown;
}

interface StoredApproval {
  id: string; state: string; createdAt: string; executionId?: string; action?: string;
  requester?: string; deadlineAt?: string; incidentId?: string; optionId?: string;
}

interface LaunchPrefill {
  runbookId: string; runbookVersion?: string;
  incidentId: string; optionId: string; optionTitle: string;
  parameters: Record<string, string>;
  rationale: string; createdAt: string;
}

/* ------------------------------ Storage --------------------------------- */

const REMEDIATIONS_KEY = "runops.remediations.v1";
const INCIDENTS_KEY    = "runops.incidents.v1";
const APPROVALS_KEY    = "runops.approvals.v1";
const LAUNCH_PREFILL_KEY = "runops.launchprefill.v1";

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
function writeList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/* ------------------------------ Catalog --------------------------------- */

const OPTIONS: RemediationOption[] = [
  {
    id: "REM-REV-INDEX",
    title: "Revert affected database index",
    summary: "Roll back the compound index deployed by CHG-20391 and recycle checkout DB connections in a controlled sweep.",
    runbookId: "RB-0042", runbookVersion: "v14",
    changeRequirement: "Emergency", approvalRole: "Change Manager",
    timeToMitigateMin: 12, probabilityOfSuccess: 88, operationalRisk: "Medium",
    customerImpactDuring: "Brief elevated latency during connection recycle (< 60s window).",
    blastRadius: "checkout-db-01, checkout-api", expectedSloRecovery: "≈ 15 min to green burn rate",
    rollbackConfidence: 92,
    resourceRequirement: "1 DBA + on-call SRE",
    costPerHour: 320,
    evidenceStrength: "strong",
    assumptions: [
      "Query plan regression is the dominant cause (HY-DB confidence 82).",
      "No secondary consumer depends on the new index shape.",
    ],
    uncertainties: [
      "Whether concurrent batch job on the primary will re-emerge after recycle.",
    ],
    policyBlocked: false,
    sources: [
      { label: "CHG-20391 change record", url: "https://changes.example/CHG-20391", strength: "strong", note: "Attached rollback verified in staging." },
      { label: "HY-DB hypothesis", url: "/runops/incidents/INC-10482/hypotheses", strength: "strong", note: "Dominant hypothesis · confidence 82." },
      { label: "Prior INC-9812 postmortem", url: "https://incidents.example/INC-9812", strength: "moderate", note: "Same mitigation resolved similar failure mode in 11 min." },
    ],
    simulation: {
      available: true, projectedRecoveryMin: 14, successBand: [83, 92],
      slaImpactBand: "0.42 → 0.14 error budget burned/hr",
      notes: "Deterministic replay against pre-change plan matches observed regression signature.",
      ran: false,
    },
  },
  {
    id: "REM-POOL-INC",
    title: "Temporarily increase application connection pool",
    summary: "Raise pool_max_size from 20 → 40 on checkout-api. Absorbs symptoms without reverting the index.",
    runbookId: "RB-0087", runbookVersion: "v6",
    changeRequirement: "Standard", approvalRole: "Service Owner",
    timeToMitigateMin: 6, probabilityOfSuccess: 62, operationalRisk: "Low",
    customerImpactDuring: "No user-facing disruption expected.",
    blastRadius: "checkout-api only", expectedSloRecovery: "Partial · masks symptoms",
    rollbackConfidence: 95,
    resourceRequirement: "On-call SRE",
    costPerHour: 90,
    evidenceStrength: "moderate",
    assumptions: [
      "Pool ceiling is a contributing factor (HY-POOL confidence 58).",
      "Downstream DB can absorb 2× concurrent connection count.",
    ],
    uncertainties: [
      "Does not address the underlying query plan regression — expected to reappear at next traffic peak.",
    ],
    policyBlocked: false,
    sources: [
      { label: "HY-POOL hypothesis", url: "/runops/incidents/INC-10482/hypotheses", strength: "moderate", note: "Waiter count of 42 exceeds max=20." },
      { label: "checkout-api capacity model", url: "https://config.example/checkout", strength: "moderate", note: "Headroom validated at 40 connections." },
    ],
    simulation: {
      available: true, projectedRecoveryMin: 8, successBand: [55, 70],
      slaImpactBand: "0.42 → 0.28 error budget burned/hr",
      notes: "Reduces waiter count but query cost per acquisition remains elevated.",
      ran: false,
    },
  },
  {
    id: "REM-REGION-SHIFT",
    title: "Shift traffic to alternate region",
    summary: "Fail checkout traffic over to us-west-2 warm standby. Bypasses the affected primary entirely.",
    runbookId: "RB-0103", runbookVersion: "v9",
    changeRequirement: "Emergency", approvalRole: "Incident Commander",
    timeToMitigateMin: 22, probabilityOfSuccess: 74, operationalRisk: "High",
    customerImpactDuring: "Session drops for in-flight checkouts during DNS cutover (~90s).",
    blastRadius: "Global checkout traffic, cache warmup on us-west-2",
    expectedSloRecovery: "≈ 25 min once traffic drains",
    rollbackConfidence: 70,
    resourceRequirement: "Traffic team + platform on-call + DB replica lead",
    costPerHour: 1450,
    evidenceStrength: "moderate",
    assumptions: [
      "us-west-2 replica is within 30s of primary and healthy.",
      "Peak-hour cache warmup completes within 8 minutes.",
    ],
    uncertainties: [
      "Cross-region write reconciliation for orders already in flight.",
      "Cold cache impact on checkout tail latency.",
    ],
    policyBlocked: true,
    policyReason: "Regional failover requires ≥ 4h notice under change policy CP-207 outside declared DR.",
    sources: [
      { label: "Policy CP-207 · Regional failover", url: "https://policy.example/CP-207", strength: "strong", note: "Notice window blocks execution." },
      { label: "us-west-2 replica health", url: "https://datadog.example/uswest2-replica", strength: "moderate", note: "Replica lag currently 22s." },
    ],
    simulation: {
      available: true, projectedRecoveryMin: 26, successBand: [64, 82],
      slaImpactBand: "0.42 → 0.18 error budget burned/hr (with 90s degradation blip)",
      notes: "Blocked by policy — simulation retained for reference only.",
      ran: false,
    },
  },
  {
    id: "REM-SCALE-PODS",
    title: "Scale application pods",
    summary: "Add 6 replicas to checkout-api. Broadens compute headroom for pool waiters.",
    runbookId: "RB-0059", runbookVersion: "v11",
    changeRequirement: "Standard", approvalRole: "Service Owner",
    timeToMitigateMin: 8, probabilityOfSuccess: 34, operationalRisk: "Low",
    customerImpactDuring: "No user-facing disruption expected.",
    blastRadius: "checkout-api namespace only",
    expectedSloRecovery: "Minimal · does not address the DB bottleneck",
    rollbackConfidence: 96,
    resourceRequirement: "On-call SRE",
    costPerHour: 140,
    evidenceStrength: "weak",
    assumptions: [
      "Latency is compute-bound.",
    ],
    uncertainties: [
      "Contradicted by evidence: pod CPU stayed below 55% throughout the window.",
    ],
    policyBlocked: false,
    sources: [
      { label: "HY-K8S hypothesis", url: "/runops/incidents/INC-10482/hypotheses", strength: "weak", note: "Rejected direction — CPU headroom present." },
    ],
    simulation: {
      available: true, projectedRecoveryMin: 22, successBand: [25, 45],
      slaImpactBand: "0.42 → 0.38 error budget burned/hr",
      notes: "Adds capacity to a resource that is not saturated — small effect predicted.",
      ran: false,
    },
  },
  {
    id: "REM-DISABLE-ENRICHMENT",
    title: "Disable noncritical checkout enrichment",
    summary: "Turn off recommendations + loyalty enrichment on the checkout path via feature flag CHK-ENR-01.",
    runbookId: "RB-0074", runbookVersion: "v4",
    changeRequirement: "Standard", approvalRole: "Service Owner",
    timeToMitigateMin: 4, probabilityOfSuccess: 55, operationalRisk: "Low",
    customerImpactDuring: "Recommendations hidden on order-confirm; core purchase flow unaffected.",
    blastRadius: "checkout-api enrichment layer",
    expectedSloRecovery: "Partial · trims p95 by ~150ms",
    rollbackConfidence: 98,
    resourceRequirement: "On-call SRE (feature flag)",
    costPerHour: 40,
    evidenceStrength: "moderate",
    assumptions: [
      "Enrichment layer contributes ≈ 18% of checkout latency budget.",
    ],
    uncertainties: [
      "Does not remove pool contention — buys time only.",
      "Revenue impact from suppressed recommendations during window.",
    ],
    policyBlocked: false,
    sources: [
      { label: "Feature flag CHK-ENR-01", url: "https://flags.example/CHK-ENR-01", strength: "strong", note: "Toggle validated in prod within last 7 days." },
      { label: "checkout latency budget", url: "https://obs.example/checkout-p95", strength: "moderate", note: "Enrichment span typical share." },
    ],
    simulation: {
      available: true, projectedRecoveryMin: 12, successBand: [46, 62],
      slaImpactBand: "0.42 → 0.30 error budget burned/hr",
      notes: "Latency trim projected but pool waiters remain elevated.",
      ran: false,
    },
  },
  {
    id: "REM-MONITOR",
    title: "Monitor without intervention",
    summary: "Hold change activity. Continue observation and defer to auto-recovery from traffic patterns.",
    runbookId: "RB-0001", runbookVersion: "v22",
    changeRequirement: "None", approvalRole: "Incident Commander",
    timeToMitigateMin: 60, probabilityOfSuccess: 18, operationalRisk: "High",
    customerImpactDuring: "Continued elevated error rate until natural recovery.",
    blastRadius: "checkout-api traffic (ongoing customer impact)",
    expectedSloRecovery: "Uncertain · > 45 min",
    rollbackConfidence: 100,
    resourceRequirement: "None",
    costPerHour: 0,
    evidenceStrength: "weak",
    assumptions: ["Traffic will subside naturally after peak window."],
    uncertainties: [
      "No evidence of self-recovery in prior similar incidents.",
      "SLO burn continues to accumulate customer impact.",
    ],
    policyBlocked: false,
    sources: [
      { label: "SEV-1 policy · minimum action", url: "https://policy.example/SEV1", strength: "strong", note: "Active SEV-1 typically requires action within 20 min." },
    ],
    simulation: {
      available: false, projectedRecoveryMin: 0, successBand: [0, 0],
      slaImpactBand: "0.42 → 0.42 error budget burned/hr (unchanged)",
      notes: "No corrective effect to simulate.",
      ran: false,
    },
  },
];

/* ---------------------------- Scoring model ----------------------------- */

const EV_WEIGHT: Record<EvidenceStrength, number> = { weak: 30, moderate: 65, strong: 90 };
const RISK_PENALTY: Record<RiskLevel, number> = { Low: 0, Medium: 10, High: 25 };

interface OptionScore {
  id: string;
  overall: number;
  speed: number;
  evidence: number;
  reversibility: number;
  policy: number;
  customer: number;
  reason: string;
}

/**
 * Deterministic weighted score:
 *   overall = 0.20 * speed + 0.25 * evidence + 0.20 * reversibility
 *           + 0.15 * policy + 0.20 * customerImpact
 * Speed is not the sole factor — matches page spec.
 */
function scoreOption(o: RemediationOption): OptionScore {
  const speed = Math.max(0, 100 - o.timeToMitigateMin * 3);
  const evidence = EV_WEIGHT[o.evidenceStrength];
  const reversibility = o.rollbackConfidence;
  const policy = o.policyBlocked ? 0 : (o.changeRequirement === "Emergency" ? 75 : 95);
  const customerImpactPenalty = RISK_PENALTY[o.operationalRisk];
  const customer = Math.max(0, 100 - customerImpactPenalty - (100 - o.probabilityOfSuccess) * 0.3);

  const overall = Math.round(
    0.20 * speed + 0.25 * evidence + 0.20 * reversibility +
    0.15 * policy + 0.20 * customer,
  );

  let reason = "";
  if (o.policyBlocked) reason = "Policy blocked — excluded from ranking.";
  else if (evidence >= 85 && reversibility >= 85) reason = "Strong evidence and high reversibility.";
  else if (evidence >= 60 && speed >= 70) reason = "Reasonable evidence, fast to mitigate.";
  else if (reversibility >= 95 && evidence < 50) reason = "Safe to try but weak evidence — treat as fallback only.";
  else reason = "Mixed signal — not a primary candidate.";

  return { id: o.id, overall, speed, evidence, reversibility, policy, customer, reason };
}

/* ------------------------------- Helpers -------------------------------- */

function stateTone(s: OptionState) {
  switch (s) {
    case "primary":   return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "fallback":  return "bg-blue-50 text-blue-700 border-blue-200";
    case "rejected":  return "bg-slate-100 text-slate-600 border-slate-200";
    default:          return "bg-white text-slate-700 border-slate-200";
  }
}
function riskTone(r: RiskLevel) {
  return r === "High" ? "bg-red-50 text-red-700 border-red-200"
       : r === "Medium" ? "bg-amber-50 text-amber-800 border-amber-200"
       : "bg-emerald-50 text-emerald-700 border-emerald-200";
}
function strengthTone(s: EvidenceStrength) {
  return s === "strong" ? "bg-emerald-50 text-emerald-800 border-emerald-200"
       : s === "moderate" ? "bg-blue-50 text-blue-800 border-blue-200"
       : "bg-slate-100 text-slate-600 border-slate-200";
}

/* -------------------------------- Page ---------------------------------- */

export default function RemediationComparison() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams<{ incidentId?: string }>();
  const incidentId = params.incidentId ?? ops.incident.id;

  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [record, setRecord] = useState<RemediationRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tab, setTab] = useState<"compare" | "detail" | "decision">("compare");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "reject" | "approval" | "decision">(null);
  const [dialogOptionId, setDialogOptionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalDeadline, setApprovalDeadline] = useState("30");
  const [decisionRationale, setDecisionRationale] = useState("");
  const [decisionFallback, setDecisionFallback] = useState<string>("");
  const [connectorDown, setConnectorDown] = useState(false);

  /* --------------------------- Load / seed ---------------------------- */
  useEffect(() => {
    const map = readMap<RemediationRecord>(REMEDIATIONS_KEY);
    if (map[incidentId]) {
      setRecord(map[incidentId]);
    } else {
      const seed: RemediationRecord = {
        incidentId,
        options: OPTIONS.map((o) => ({ id: o.id, state: "candidate" })),
        decision: null,
        approvalId: null,
        updatedAt: nowIso(),
      };
      map[incidentId] = seed;
      writeMap(REMEDIATIONS_KEY, map);
      setRecord(seed);
    }
    // preselect top 3 unblocked for compare
    setSelectedIds(["REM-REV-INDEX", "REM-POOL-INC", "REM-DISABLE-ENRICHMENT"]);
  }, [incidentId]);

  const audit = useCallback(
    (title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
      ops.pushNotification({
        kind, title, detail, entityRef: incidentId,
        route: `/runops/incidents/${incidentId}/remediations`,
      });
    },
    [ops, incidentId],
  );

  const persist = useCallback((next: RemediationRecord) => {
    const patched = { ...next, updatedAt: nowIso() };
    const map = readMap<RemediationRecord>(REMEDIATIONS_KEY);
    map[patched.incidentId] = patched;
    writeMap(REMEDIATIONS_KEY, map);
    setRecord(patched);
  }, []);

  const mirrorIncident = useCallback((decision: DecisionRecord, primaryTitle: string, fallbackTitle?: string) => {
    const map = readMap<StoredIncident>(INCIDENTS_KEY);
    const inc = map[incidentId] ?? { incidentId };
    const timeline = Array.isArray(inc.timeline) ? [...inc.timeline] : [];
    timeline.push({
      at: decision.decidedAt,
      label: `Remediation decision recorded · ${primaryTitle}`,
      detail: fallbackTitle ? `Fallback: ${fallbackTitle}. ${decision.rationale}` : decision.rationale,
    });
    map[incidentId] = {
      ...inc,
      timeline,
      remediation: {
        primaryId: decision.primaryId, fallbackId: decision.fallbackId,
        decidedAt: decision.decidedAt, decidedBy: decision.decidedBy,
        rationale: decision.rationale,
      },
      updatedAt: nowIso(),
    };
    writeMap(INCIDENTS_KEY, map);
  }, [incidentId]);

  /* --------------------------- Derived views -------------------------- */

  const optionsById = useMemo(() => {
    const m: Record<string, RemediationOption> = {};
    for (const o of OPTIONS) m[o.id] = o;
    return m;
  }, []);
  const mutableById = useMemo(() => {
    const m: Record<string, OptionMutable> = {};
    if (record) for (const o of record.options) m[o.id] = o;
    return m;
  }, [record]);

  const scores = useMemo(() => {
    const list: OptionScore[] = OPTIONS.map(scoreOption);
    return list.sort((a, b) => b.overall - a.overall);
  }, []);
  const scoresById = useMemo(() => {
    const m: Record<string, OptionScore> = {};
    for (const s of scores) m[s.id] = s;
    return m;
  }, [scores]);

  const eligibleRanked = useMemo(
    () => scores.filter((s) => !optionsById[s.id].policyBlocked && mutableById[s.id]?.state !== "rejected"),
    [scores, optionsById, mutableById],
  );
  const noViableOption = eligibleRanked.length === 0;

  const recommendedPrimary = eligibleRanked[0];
  const recommendedFallback = eligibleRanked[1];
  const dominant = recommendedPrimary && recommendedFallback
    ? recommendedPrimary.overall - recommendedFallback.overall >= 12
    : Boolean(recommendedPrimary);

  /* ------------------------------ Actions ----------------------------- */

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev,
    );
  };

  const openDetail = (id: string) => { setDetailId(id); setTab("detail"); };

  const runSimulation = (id: string) => {
    if (!record || !canWrite) return;
    if (connectorDown) {
      audit("Simulation unavailable", `Deterministic simulator connector offline for ${id}.`, "warning");
      return;
    }
    const next: RemediationRecord = {
      ...record,
      options: record.options.map((o) => o.id === id ? { ...o, simulationRunAt: nowIso() } : o),
    };
    persist(next);
    const opt = optionsById[id];
    audit(
      `Simulation ran · ${opt.title}`,
      `Projected recovery ${opt.simulation.projectedRecoveryMin} min · success band ${opt.simulation.successBand[0]}–${opt.simulation.successBand[1]}%.`,
    );
  };

  const rejectOption = () => {
    if (!record || !canWrite || !dialogOptionId || !rejectReason.trim()) return;
    const next: RemediationRecord = {
      ...record,
      options: record.options.map((o) => o.id === dialogOptionId ? { ...o, state: "rejected", rejectionReason: rejectReason.trim() } : o),
    };
    persist(next);
    audit(`Option rejected · ${optionsById[dialogOptionId].title}`, rejectReason.trim(), "warning");
    setDialog(null); setDialogOptionId(null); setRejectReason("");
  };

  const setPrimary = (id: string) => {
    if (!record || !canWrite) return;
    if (optionsById[id].policyBlocked) return;
    const next: RemediationRecord = {
      ...record,
      options: record.options.map((o) =>
        o.id === id ? { ...o, state: "primary", selectedAt: nowIso() }
        : o.state === "primary" ? { ...o, state: "candidate" }
        : o,
      ),
    };
    persist(next);
    audit(`Primary remediation selected · ${optionsById[id].title}`, "Awaiting approval and launch.");
  };

  const setFallback = (id: string) => {
    if (!record || !canWrite) return;
    if (optionsById[id].policyBlocked) return;
    const next: RemediationRecord = {
      ...record,
      options: record.options.map((o) =>
        o.id === id ? { ...o, state: "fallback", selectedAt: nowIso() }
        : o.state === "fallback" ? { ...o, state: "candidate" }
        : o,
      ),
    };
    persist(next);
    audit(`Fallback remediation selected · ${optionsById[id].title}`, "Reserved for use if primary fails.");
  };

  const requestApproval = () => {
    if (!record || !canWrite) return;
    const primary = record.options.find((o) => o.state === "primary");
    if (!primary) return;
    const opt = optionsById[primary.id];
    const id = rid("APR");
    const deadline = new Date(Date.now() + parseInt(approvalDeadline || "30", 10) * 60_000).toISOString();
    const approval: StoredApproval = {
      id, state: "Pending", createdAt: nowIso(),
      action: `Execute ${opt.title}`,
      requester: ops.role, deadlineAt: deadline,
      incidentId, optionId: primary.id,
    };
    const list = readList<StoredApproval>(APPROVALS_KEY);
    writeList(APPROVALS_KEY, [approval, ...list]);
    persist({ ...record, approvalId: id });
    audit(`Approval requested · ${id}`, `${opt.approvalRole} required for ${opt.title}. Deadline ${new Date(deadline).toLocaleTimeString()}.`);
    setDialog(null);
    navigate("/runops/approvals");
  };

  const recordDecision = () => {
    if (!record || !canWrite) return;
    const primary = record.options.find((o) => o.state === "primary");
    if (!primary || !decisionRationale.trim()) return;
    const fallbackId = decisionFallback || record.options.find((o) => o.state === "fallback")?.id;
    const decision: DecisionRecord = {
      decidedAt: nowIso(), decidedBy: ops.role,
      primaryId: primary.id, fallbackId,
      rationale: decisionRationale.trim(),
    };
    // ensure fallback state persisted
    const next: RemediationRecord = {
      ...record,
      decision,
      options: record.options.map((o) =>
        fallbackId && o.id === fallbackId && o.state !== "primary" ? { ...o, state: "fallback", selectedAt: nowIso() } : o,
      ),
    };
    persist(next);
    mirrorIncident(decision, optionsById[primary.id].title, fallbackId ? optionsById[fallbackId].title : undefined);
    audit(`Remediation decision recorded`, `${optionsById[primary.id].title}${fallbackId ? ` · fallback ${optionsById[fallbackId].title}` : ""}.`);
    setDialog(null);
    setTab("decision");
  };

  const launchRunbook = () => {
    if (!record) return;
    const primary = record.options.find((o) => o.state === "primary");
    if (!primary) return;
    const opt = optionsById[primary.id];
    const prefill: LaunchPrefill = {
      runbookId: opt.runbookId, runbookVersion: opt.runbookVersion,
      incidentId, optionId: primary.id, optionTitle: opt.title,
      parameters: {
        incident_id: incidentId,
        target_service: ops.selectedServiceId,
        environment: ops.environment,
        change_ref: primary.id === "REM-REV-INDEX" ? "CHG-20391" : "",
        pool_max_size: primary.id === "REM-POOL-INC" ? "40" : "",
        replica_count: primary.id === "REM-SCALE-PODS" ? "6" : "",
        feature_flag: primary.id === "REM-DISABLE-ENRICHMENT" ? "CHK-ENR-01" : "",
      },
      rationale: record.decision?.rationale ?? "Launched from remediation comparison.",
      createdAt: nowIso(),
    };
    const map = readMap<LaunchPrefill>(LAUNCH_PREFILL_KEY);
    map[opt.runbookId] = prefill;
    writeMap(LAUNCH_PREFILL_KEY, map);
    audit(`Launch Center opened · ${opt.title}`, `Runbook ${opt.runbookId} ${opt.runbookVersion} prefilled with incident parameters.`);
    navigate(`/runops/runbooks/${opt.runbookId}/launch`);
  };

  /* ------------------------------ Render ------------------------------ */

  if (!record) {
    return (
      <div className="flex flex-col">
        <EntityHeader title="Remediation Comparison" subtitle="Loading options…" />
        <div className="p-6 text-sm text-slate-600">Preparing remediation record for {incidentId}…</div>
      </div>
    );
  }

  const primaryMut = record.options.find((o) => o.state === "primary");
  const fallbackMut = record.options.find((o) => o.state === "fallback");
  const primary = primaryMut ? optionsById[primaryMut.id] : null;
  const fallback = fallbackMut ? optionsById[fallbackMut.id] : null;

  const headerTone = record.decision ? "success" : noViableOption ? "at-risk" : dominant ? "warning" : "neutral";
  const headerLabel = record.decision
    ? "Decision recorded"
    : noViableOption
      ? "No viable option — all candidates blocked or rejected"
      : primary
        ? `Primary staged · ${primary.title}`
        : dominant
          ? `Dominant recommendation · ${optionsById[recommendedPrimary.id].title}`
          : "Comparing options";

  return (
    <div className="flex flex-col">
      <EntityHeader
        eyebrow={`Incident ${incidentId}`}
        title="Remediation Comparison & Decision"
        subtitle="Compare candidate mitigations by recovery speed, evidence, reversibility, policy, and customer impact"
        status={{ tone: headerTone, label: headerLabel }}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Badge variant="outline" className="border-slate-300">Tenant · {ops.tenant.name}</Badge>
            <Badge variant="outline" className="border-slate-300">Service · {ops.selectedServiceId}</Badge>
            <Badge variant="outline" className="border-slate-300">Environment · {ops.environment}</Badge>
            <Badge variant="outline" className="border-slate-300">Role · {ops.role}</Badge>
            <Badge variant="outline" className="border-slate-300">Scenario · {ops.stages[ops.stageIndex]?.label ?? "—"}</Badge>
            {primary && <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200">Primary · {primary.id}</Badge>}
            {fallback && <Badge className="bg-blue-50 text-blue-800 border-blue-200">Fallback · {fallback.id}</Badge>}
            {record.approvalId && <Badge className="bg-amber-50 text-amber-800 border-amber-200">Approval · {record.approvalId}</Badge>}
            {!canWrite && <Badge className="bg-amber-100 text-amber-900 border-amber-300">Read-only role — mutations disabled</Badge>}
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600" aria-label="Toggle simulator connector">
              <Checkbox checked={connectorDown} onCheckedChange={(v) => setConnectorDown(v === true)} aria-label="Simulator offline" />
              Simulator offline
            </label>
            <Button size="sm" variant="outline" onClick={() => navigate(`/runops/incidents/${incidentId}/hypotheses`)} aria-label="Open hypothesis graph">
              <GitBranch className="mr-1.5 h-4 w-4" /> Hypotheses
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`/runops/incidents/${incidentId}`)} aria-label="Back to incident command">
              Incident Command
            </Button>
            <Button size="sm" onClick={() => { setDecisionRationale(""); setDecisionFallback(fallbackMut?.id ?? ""); setDialog("decision"); }}
              disabled={!canWrite || !primaryMut} aria-label="Record decision">
              <ClipboardCheck className="mr-1.5 h-4 w-4" /> Record decision
            </Button>
          </div>
        }
      />

      {/* Recommendation banner */}
      <div className="mx-3 mt-3">
        <Card className={cn("border", noViableOption ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50/40")}>
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Sparkles className={cn("h-4 w-4 mt-0.5", noViableOption ? "text-red-700" : "text-emerald-700")} />
              <div className="flex-1 text-sm">
                <div className="font-semibold text-slate-800">
                  {noViableOption
                    ? "No viable remediation — every candidate is policy-blocked or rejected."
                    : `Recommendation · ${optionsById[recommendedPrimary.id].title}${recommendedFallback ? ` (fallback: ${optionsById[recommendedFallback.id].title})` : ""}`}
                </div>
                {!noViableOption && (
                  <div className="mt-1 text-xs text-slate-700">
                    Weighted by evidence (25%), customer impact (20%), speed (20%), reversibility (20%), policy (15%). Not selected by speed alone.
                  </div>
                )}
                {recommendedPrimary && (
                  <div className="mt-2 grid gap-1 text-xs text-slate-700 sm:grid-cols-2">
                    <div><span className="text-slate-500">Confidence band:</span> {optionsById[recommendedPrimary.id].simulation.successBand[0]}–{optionsById[recommendedPrimary.id].simulation.successBand[1]}%</div>
                    <div><span className="text-slate-500">Rationale:</span> {scoresById[recommendedPrimary.id].reason}</div>
                    <div><span className="text-slate-500">Key assumption:</span> {optionsById[recommendedPrimary.id].assumptions[0] ?? "—"}</div>
                    <div><span className="text-slate-500">Key uncertainty:</span> {optionsById[recommendedPrimary.id].uncertainties[0] ?? "—"}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1">
        <TabsList className="mx-3 mt-3">
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="detail" disabled={!detailId}>Option detail</TabsTrigger>
          <TabsTrigger value="decision">Decision</TabsTrigger>
        </TabsList>

        {/* -------------------- Compare ----------------------- */}
        <TabsContent value="compare" className="p-3">
          <div className="mb-2 text-xs text-slate-600">
            Select up to four options to compare side by side. Policy-blocked options remain visible with reason.
          </div>
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="w-full min-w-[1100px] text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-2 text-left font-medium">Select</th>
                  <th className="p-2 text-left font-medium">Option</th>
                  <th className="p-2 text-left font-medium">Score</th>
                  <th className="p-2 text-left font-medium">TTM</th>
                  <th className="p-2 text-left font-medium">P(success)</th>
                  <th className="p-2 text-left font-medium">Op risk</th>
                  <th className="p-2 text-left font-medium">Blast radius</th>
                  <th className="p-2 text-left font-medium">SLO recovery</th>
                  <th className="p-2 text-left font-medium">Change</th>
                  <th className="p-2 text-left font-medium">Approver</th>
                  <th className="p-2 text-left font-medium">Rollback</th>
                  <th className="p-2 text-left font-medium">Cost/hr</th>
                  <th className="p-2 text-left font-medium">Evidence</th>
                  <th className="p-2 text-left font-medium">State</th>
                  <th className="p-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s) => {
                  const o = optionsById[s.id];
                  const m = mutableById[s.id];
                  const disabledSelect = o.policyBlocked;
                  return (
                    <tr key={o.id} className={cn("border-t border-slate-100", m?.state === "primary" && "bg-emerald-50/40", m?.state === "fallback" && "bg-blue-50/40", m?.state === "rejected" && "opacity-60")}>
                      <td className="p-2 align-top">
                        <Checkbox
                          checked={selectedIds.includes(o.id)}
                          onCheckedChange={() => toggleSelect(o.id)}
                          disabled={disabledSelect}
                          aria-label={`Select ${o.title} for comparison`}
                        />
                      </td>
                      <td className="p-2 align-top">
                        <button className="text-left" onClick={() => openDetail(o.id)} aria-label={`Open detail for ${o.title}`}>
                          <div className="font-medium text-slate-800">{o.title}</div>
                          <div className="text-[11px] text-slate-500 max-w-[280px]">{o.summary}</div>
                        </button>
                      </td>
                      <td className="p-2 align-top font-medium">{o.policyBlocked ? "—" : s.overall}</td>
                      <td className="p-2 align-top">{o.timeToMitigateMin} min</td>
                      <td className="p-2 align-top">{o.probabilityOfSuccess}%</td>
                      <td className="p-2 align-top"><Badge className={cn("border", riskTone(o.operationalRisk))}>{o.operationalRisk}</Badge></td>
                      <td className="p-2 align-top text-slate-700">{o.blastRadius}</td>
                      <td className="p-2 align-top text-slate-700">{o.expectedSloRecovery}</td>
                      <td className="p-2 align-top">{o.changeRequirement}</td>
                      <td className="p-2 align-top">{o.approvalRole}</td>
                      <td className="p-2 align-top">{o.rollbackConfidence}%</td>
                      <td className="p-2 align-top">${o.costPerHour}</td>
                      <td className="p-2 align-top"><Badge className={cn("border", strengthTone(o.evidenceStrength))}>{o.evidenceStrength}</Badge></td>
                      <td className="p-2 align-top">
                        <Badge className={cn("border", stateTone(m?.state ?? "candidate"))}>
                          {o.policyBlocked ? "policy blocked" : m?.state ?? "candidate"}
                        </Badge>
                        {o.policyBlocked && (
                          <div className="mt-1 text-[11px] text-red-700 max-w-[220px]">{o.policyReason}</div>
                        )}
                        {m?.rejectionReason && (
                          <div className="mt-1 text-[11px] text-slate-500 max-w-[220px]">Rejected: {m.rejectionReason}</div>
                        )}
                      </td>
                      <td className="p-2 align-top">
                        <div className="flex flex-wrap gap-1">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => runSimulation(o.id)}
                            disabled={!canWrite || !o.simulation.available || connectorDown} aria-label={`Simulate ${o.title}`}>
                            <FlaskConical className="mr-1 h-3 w-3" /> Simulate
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setPrimary(o.id)}
                            disabled={!canWrite || o.policyBlocked || m?.state === "rejected"} aria-label={`Select ${o.title} as primary`}>
                            Primary
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setFallback(o.id)}
                            disabled={!canWrite || o.policyBlocked || m?.state === "rejected" || m?.state === "primary"} aria-label={`Select ${o.title} as fallback`}>
                            Fallback
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-700" onClick={() => { setDialogOptionId(o.id); setRejectReason(""); setDialog("reject"); }}
                            disabled={!canWrite || m?.state === "rejected"} aria-label={`Reject ${o.title}`}>
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Side-by-side quick compare */}
          {selectedIds.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-slate-700">Side-by-side · {selectedIds.length} option{selectedIds.length === 1 ? "" : "s"}</div>
              <div className={cn("grid gap-3", selectedIds.length === 1 ? "grid-cols-1" : selectedIds.length === 2 ? "grid-cols-1 md:grid-cols-2" : selectedIds.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4")}>
                {selectedIds.map((id) => {
                  const o = optionsById[id];
                  const s = scoresById[id];
                  const m = mutableById[id];
                  return (
                    <Card key={id} className={cn("border", m?.state === "primary" ? "border-emerald-300" : m?.state === "fallback" ? "border-blue-300" : "border-slate-200")}>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{o.title}</div>
                            <div className="text-[11px] text-slate-500">{o.id} · runbook {o.runbookId} {o.runbookVersion}</div>
                          </div>
                          <Badge className={cn("border", stateTone(m?.state ?? "candidate"))}>{o.policyBlocked ? "blocked" : m?.state ?? "candidate"}</Badge>
                        </div>
                        <ScoreBar label="Score" value={o.policyBlocked ? 0 : s.overall} />
                        <ScoreBar label="Evidence" value={s.evidence} />
                        <ScoreBar label="Reversibility" value={s.reversibility} />
                        <ScoreBar label="Speed" value={s.speed} />
                        <ScoreBar label="Customer impact" value={s.customer} />
                        <div className="mt-1 text-[11px] text-slate-600">{s.reason}</div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                          <div>TTM · {o.timeToMitigateMin} min</div>
                          <div>P(success) · {o.probabilityOfSuccess}%</div>
                          <div>Rollback · {o.rollbackConfidence}%</div>
                          <div>Cost · ${o.costPerHour}/hr</div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => openDetail(o.id)} aria-label={`View evidence for ${o.title}`}>
                          View evidence <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selection + approval strip */}
          <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="text-slate-600">Primary:</div>
              <div className="font-medium text-slate-800">{primary ? primary.title : "— not selected —"}</div>
              <div className="mx-2 h-3 w-px bg-slate-200" />
              <div className="text-slate-600">Fallback:</div>
              <div className="font-medium text-slate-800">{fallback ? fallback.title : "— not selected —"}</div>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setDialog("approval")}
                  disabled={!canWrite || !primary || Boolean(record.approvalId)} aria-label="Request approval">
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> {record.approvalId ? `Approval ${record.approvalId}` : "Request approval"}
                </Button>
                <Button size="sm" onClick={launchRunbook}
                  disabled={!primary || !record.decision} aria-label="Launch runbook">
                  <PlayCircle className="mr-1.5 h-4 w-4" /> Launch runbook
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {!record.decision && primary && (
              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="h-3 w-3" /> Record a decision before launching to preserve the audit trail.
              </div>
            )}
          </div>
        </TabsContent>

        {/* -------------------- Detail ----------------------- */}
        <TabsContent value="detail" className="p-3">
          {detailId && optionsById[detailId] ? (
            <OptionDetail
              option={optionsById[detailId]}
              score={scoresById[detailId]}
              mutable={mutableById[detailId]}
              connectorDown={connectorDown}
              canWrite={canWrite}
              onSimulate={() => runSimulation(detailId)}
              onPrimary={() => setPrimary(detailId)}
              onFallback={() => setFallback(detailId)}
              onReject={() => { setDialogOptionId(detailId); setRejectReason(""); setDialog("reject"); }}
              onOpenSource={(url) => { if (url.startsWith("/")) navigate(url); else window.open(url, "_blank", "noopener"); }}
            />
          ) : (
            <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Select an option from the compare table to see supporting evidence, assumptions, and simulation detail.
            </div>
          )}
        </TabsContent>

        {/* -------------------- Decision ----------------------- */}
        <TabsContent value="decision" className="p-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="border border-slate-200">
              <CardContent className="p-3 space-y-2">
                <div className="text-sm font-semibold text-slate-800">Recorded decision</div>
                {!record.decision ? (
                  <div className="text-xs text-slate-500">No decision recorded yet.</div>
                ) : (
                  <div className="space-y-1 text-xs text-slate-700">
                    <Row k="Primary"    v={optionsById[record.decision.primaryId]?.title ?? record.decision.primaryId} />
                    <Row k="Fallback"   v={record.decision.fallbackId ? optionsById[record.decision.fallbackId].title : "—"} />
                    <Row k="Decided at" v={new Date(record.decision.decidedAt).toLocaleString()} />
                    <Row k="Decided by" v={record.decision.decidedBy} />
                    <Row k="Rationale"  v={record.decision.rationale} />
                    <Row k="Approval"   v={record.approvalId ?? "—"} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border border-slate-200">
              <CardContent className="p-3 space-y-2">
                <div className="text-sm font-semibold text-slate-800">Next action</div>
                {record.decision ? (
                  <div className="space-y-2 text-xs text-slate-700">
                    <div>Launch the primary runbook — parameters are prefilled from this incident context.</div>
                    <Button size="sm" onClick={launchRunbook} aria-label="Launch primary runbook">
                      <PlayCircle className="mr-1.5 h-4 w-4" /> Launch {primary?.title}
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600">
                    Select primary + fallback in the Compare tab, request approval, then record a decision.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* -------------------- Dialogs -------------------------- */}
      <Dialog open={dialog === "reject"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Reject option</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div className="text-slate-700">{dialogOptionId ? optionsById[dialogOptionId].title : ""}</div>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why is this option not viable?" aria-label="Rejection reason" rows={4} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={rejectOption} disabled={!rejectReason.trim()}>Reject option</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "approval"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Request approval</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div className="text-slate-700">{primary?.title}</div>
            <div className="text-slate-500">Required approver: {primary?.approvalRole}. An approval record will be created in the Approvals workspace.</div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Deadline (minutes):</span>
              <Select value={approvalDeadline} onValueChange={setApprovalDeadline}>
                <SelectTrigger className="h-8 w-28" aria-label="Approval deadline"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                  <SelectItem value="120">120</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={requestApproval}>Create approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "decision"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record remediation decision</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <Row k="Primary" v={primary?.title ?? "— select in Compare tab —"} />
            <div className="flex items-center gap-2">
              <span className="text-slate-600 w-20">Fallback:</span>
              <Select value={decisionFallback} onValueChange={setDecisionFallback}>
                <SelectTrigger className="h-8 flex-1" aria-label="Select fallback option"><SelectValue placeholder="(optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— none —</SelectItem>
                  {OPTIONS.filter((o) => !o.policyBlocked && o.id !== primary?.id && mutableById[o.id]?.state !== "rejected").map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea value={decisionRationale} onChange={(e) => setDecisionRationale(e.target.value)}
              placeholder="Rationale — why this option, what we accept, what we watch for." aria-label="Decision rationale" rows={4} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={recordDecision} disabled={!primary || !decisionRationale.trim()}>Record decision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------------------- Sub-components ---------------------------- */

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-slate-600"><span>{label}</span><span>{Math.round(value)}</span></div>
      <div className="mt-0.5 h-1.5 w-full rounded bg-slate-100">
        <div className="h-1.5 rounded bg-slate-700" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <div className="w-24 shrink-0 text-slate-500">{k}</div>
      <div className="flex-1 text-slate-800">{v}</div>
    </div>
  );
}

interface OptionDetailProps {
  option: RemediationOption;
  score: OptionScore;
  mutable?: OptionMutable;
  connectorDown: boolean;
  canWrite: boolean;
  onSimulate: () => void;
  onPrimary: () => void;
  onFallback: () => void;
  onReject: () => void;
  onOpenSource: (url: string) => void;
}

function OptionDetail({ option, score, mutable, connectorDown, canWrite, onSimulate, onPrimary, onFallback, onReject, onOpenSource }: OptionDetailProps) {
  const simRan = Boolean(mutable?.simulationRunAt);
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div className="space-y-3">
        <Card className="border border-slate-200">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-800">{option.title}</div>
                <div className="text-xs text-slate-600">{option.summary}</div>
              </div>
              <Badge className={cn("border", stateTone(mutable?.state ?? "candidate"))}>
                {option.policyBlocked ? "policy blocked" : mutable?.state ?? "candidate"}
              </Badge>
            </div>

            {option.policyBlocked && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800 flex items-start gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 mt-0.5" />
                <div><span className="font-medium">Policy blocked · </span>{option.policyReason}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1 text-xs sm:grid-cols-4">
              <Metric k="Time to mitigate" v={`${option.timeToMitigateMin} min`} />
              <Metric k="P(success)" v={`${option.probabilityOfSuccess}%`} />
              <Metric k="Rollback conf." v={`${option.rollbackConfidence}%`} />
              <Metric k="Cost / hr" v={`$${option.costPerHour}`} />
              <Metric k="Change" v={option.changeRequirement} />
              <Metric k="Approver" v={option.approvalRole} />
              <Metric k="Op risk" v={option.operationalRisk} />
              <Metric k="Evidence" v={option.evidenceStrength} />
            </div>

            <div className="grid gap-1 text-xs">
              <Row k="Customer" v={option.customerImpactDuring} />
              <Row k="Blast radius" v={option.blastRadius} />
              <Row k="SLO recovery" v={option.expectedSloRecovery} />
              <Row k="Resource need" v={option.resourceRequirement} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-3 space-y-2">
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"><FlaskConical className="h-4 w-4" /> Deterministic simulation</div>
            {!option.simulation.available ? (
              <div className="rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                Simulation is not applicable for this option (no corrective effect to model).
              </div>
            ) : connectorDown ? (
              <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 flex items-start gap-1.5">
                <TriangleAlert className="h-3.5 w-3.5 mt-0.5" />
                Simulation connector offline — projections are shown from last recorded run.
              </div>
            ) : (
              <div className="grid gap-1 text-xs">
                <Row k="Projected recovery" v={`${option.simulation.projectedRecoveryMin} min`} />
                <Row k="Success band" v={`${option.simulation.successBand[0]}–${option.simulation.successBand[1]}%`} />
                <Row k="SLA impact" v={option.simulation.slaImpactBand} />
                <Row k="Notes" v={option.simulation.notes} />
                <Row k="Last run" v={simRan ? new Date(mutable!.simulationRunAt!).toLocaleString() : "Not run"} />
              </div>
            )}
            <Button size="sm" variant="outline" onClick={onSimulate}
              disabled={!canWrite || !option.simulation.available || connectorDown} aria-label="Run deterministic simulation">
              <FlaskConical className="mr-1.5 h-4 w-4" /> Run simulation
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-3 space-y-2">
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"><Layers className="h-4 w-4" /> Assumptions & uncertainty</div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-0.5">Assumptions</div>
              <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-700">
                {option.assumptions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-0.5">Uncertainties</div>
              <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-700">
                {option.uncertainties.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Card className="border border-slate-200">
          <CardContent className="p-3 space-y-2">
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Recommendation weight</div>
            <ScoreBar label="Overall" value={option.policyBlocked ? 0 : score.overall} />
            <ScoreBar label="Evidence" value={score.evidence} />
            <ScoreBar label="Reversibility" value={score.reversibility} />
            <ScoreBar label="Speed" value={score.speed} />
            <ScoreBar label="Customer impact" value={score.customer} />
            <ScoreBar label="Policy" value={score.policy} />
            <div className="text-[11px] text-slate-600">{score.reason}</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-3 space-y-2">
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Supporting evidence</div>
            <ul className="space-y-2 text-xs">
              {option.sources.map((s, i) => (
                <li key={i} className="rounded border border-slate-200 bg-slate-50 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-slate-800">{s.label}</div>
                    <Badge className={cn("border", strengthTone(s.strength))}>{s.strength}</Badge>
                  </div>
                  <div className="mt-1 text-slate-600">{s.note}</div>
                  <button className="mt-1 text-slate-500 hover:text-slate-800 inline-flex items-center gap-1" onClick={() => onOpenSource(s.url)} aria-label={`Open source ${s.label}`}>
                    Open source <ArrowUpRight className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-3 space-y-2">
            <div className="text-sm font-semibold text-slate-800">Actions</div>
            <Button size="sm" variant="outline" className="w-full" onClick={onPrimary}
              disabled={!canWrite || option.policyBlocked || mutable?.state === "rejected"} aria-label="Select as primary">
              Select as primary
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={onFallback}
              disabled={!canWrite || option.policyBlocked || mutable?.state === "rejected" || mutable?.state === "primary"} aria-label="Select as fallback">
              Select as fallback
            </Button>
            <Button size="sm" variant="outline" className="w-full text-red-700" onClick={onReject}
              disabled={!canWrite || mutable?.state === "rejected"} aria-label="Reject option">
              <XCircle className="mr-1.5 h-4 w-4" /> Reject option
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{k}</div>
      <div className="text-xs font-medium text-slate-800">{v}</div>
    </div>
  );
}
