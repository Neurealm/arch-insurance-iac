/**
 * Page 39 · Continuous Improvement & Runbook Fitness
 * Route: /runops/runbooks/fitness
 *
 * Measures whether runbooks remain accurate, safe, effective, and maintainable
 * across 14 fitness dimensions derived from connected evidence (executions,
 * certifications, tests, telemetry, incidents, corrective actions). Every
 * score exposes its inputs so the calculation is auditable rather than opaque.
 *
 * Persistence (localStorage):
 *   runops.fitness.records.v1     → FitnessRecord[]
 *   runops.fitness.proposals.v1   → Proposal[]
 *   runops.fitness.recert.v1      → RecertRequest[]
 *   runops.fitness.consolidate.v1 → ConsolidationCandidate[]
 *   runops.fitness.retire.v1      → RetirementCandidate[]
 *   runops.runbook.drafts.v1      → cross-screen append when proposal accepted
 *   runops.governance.policies.v1 → cross-screen append for retirements
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowUpRight, BadgeCheck, CheckCircle2, ClipboardList,
  Clock, ExternalLink, FileSearch, GitCompare, GitPullRequest, Layers, LinkIcon,
  Search, ShieldAlert, ShieldCheck, Sparkles, Target, Timer, TrendingDown, TrendingUp,
  UserCheck, XCircle,
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

type FitnessState =
  | "High fitness"
  | "At risk"
  | "Critical"
  | "Certification expired"
  | "Owner missing"
  | "Improvement proposed";

type DimensionKey =
  | "freshness"
  | "owner"
  | "certification"
  | "testCoverage"
  | "executionSuccess"
  | "executionDuration"
  | "rollback"
  | "manualIntervention"
  | "supportedVersions"
  | "evidenceQuality"
  | "telemetryCoverage"
  | "operatorDeviation"
  | "incidentRecurrence"
  | "policyCompliance";

interface Dimension {
  key: DimensionKey;
  label: string;
  score: number;          // 0..100
  evidence: string;       // e.g. "17/20 executions clean · last 30d"
  sourceRef: string;      // e.g. "runops.exec.v1"
  trend: number;          // -100..100 (delta vs. prior period)
}

interface Proposal {
  id: string;             // PR-####
  runbookId: string;
  title: string;
  rationale: string;
  dimensionsAffected: DimensionKey[];
  confidence: number;     // 0..1
  uncertainty: string;
  evidenceRefs: string[]; // ["PM-10482", "INC-2411"]
  sources: string[];      // ["Postmortem", "AI code diff"]
  beforeSummary: string;
  afterSummary: string;
  state: "Proposed" | "In review" | "Accepted" | "Rejected" | "Published";
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  aiGenerated: boolean;
}

interface RecertRequest {
  id: string;             // RC-####
  runbookId: string;
  reason: string;
  requestedAt: string;
  requestedBy: string;
  dueBy: string;
  state: "Open" | "Scheduled" | "Complete";
}

interface ConsolidationCandidate {
  id: string;             // CO-####
  primaryRunbookId: string;
  duplicateRunbookIds: string[];
  overlapPct: number;     // 0..100
  rationale: string;
  decidedAt?: string;
  decision?: "Merge" | "Reject";
}

interface RetirementCandidate {
  id: string;             // RE-####
  runbookId: string;
  reason: string;
  dependentServices: string[];
  dependentRunbooks: string[];
  decidedAt?: string;
  decision?: "Retire" | "Reject";
}

interface FitnessRecord {
  runbookId: string;      // RB-####
  title: string;
  ownerRef: string | null;
  serviceId: string;
  certifiedUntil: string | null; // ISO or null
  lastExecutedAt: string | null;
  overallScore: number;   // 0..100
  state: FitnessState;
  dimensions: Dimension[];
  history: { at: string; score: number }[];
  updatedAt: string;
}

type TabKey = "portfolio" | "ranking" | "dimensions" | "proposals" | "recert" | "consolidate" | "retire";
type DialogKey =
  | null
  | { kind: "create-update"; runbookId: string }
  | { kind: "review-proposal"; proposalId: string }
  | { kind: "pr-simulation"; runbookId: string }
  | { kind: "compare"; proposalId: string }
  | { kind: "recert"; runbookId: string }
  | { kind: "consolidate"; runbookId: string }
  | { kind: "retire"; runbookId: string }
  | { kind: "assign-owner"; runbookId: string }
  | { kind: "create-test"; runbookId: string };

/* -------------------------------- Storage ------------------------------- */

const REC_KEY = "runops.fitness.records.v1";
const PROP_KEY = "runops.fitness.proposals.v1";
const RECERT_KEY = "runops.fitness.recert.v1";
const CONS_KEY = "runops.fitness.consolidate.v1";
const RETIRE_KEY = "runops.fitness.retire.v1";
const DRAFT_KEY = "runops.runbook.drafts.v1";
const GOV_KEY = "runops.governance.policies.v1";

const readList = <T,>(k: string): T[] => {
  try { const raw = localStorage.getItem(k); if (!raw) return []; const v = JSON.parse(raw); return Array.isArray(v) ? (v as T[]) : []; }
  catch { return []; }
};
const writeList = <T,>(k: string, v: T[]): void => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/* --------------------------------- Seed --------------------------------- */

const seedDims = (
  scores: Partial<Record<DimensionKey, number>>,
  extra?: Partial<Record<DimensionKey, { evidence?: string; trend?: number; sourceRef?: string }>>,
): Dimension[] => {
  const base: Array<{ key: DimensionKey; label: string; sourceRef: string; evidence: string }> = [
    { key: "freshness",           label: "Freshness",             sourceRef: "runops.runbook.versions.v1", evidence: "Last edit 28d ago" },
    { key: "owner",               label: "Owner status",           sourceRef: "runops.services.owners.v1",  evidence: "Owner active · on-call rotation healthy" },
    { key: "certification",       label: "Certification",          sourceRef: "runops.runbook.certifications.v1", evidence: "Certified · expires 87d" },
    { key: "testCoverage",        label: "Test coverage",          sourceRef: "runops.runbook.tests.v1",    evidence: "18/22 steps covered" },
    { key: "executionSuccess",    label: "Execution success",      sourceRef: "runops.executions.v1",       evidence: "17/20 successful · last 30d" },
    { key: "executionDuration",   label: "Execution duration",     sourceRef: "runops.executions.v1",       evidence: "p95 4m12s · within 5m SLO" },
    { key: "rollback",            label: "Rollback performance",   sourceRef: "runops.executions.rollbacks.v1", evidence: "2/2 rollbacks clean" },
    { key: "manualIntervention",  label: "Manual intervention",    sourceRef: "runops.executions.steps.v1", evidence: "3/20 required manual override" },
    { key: "supportedVersions",   label: "Supported versions",     sourceRef: "runops.services.versions.v1", evidence: "Matches 3/3 supported service versions" },
    { key: "evidenceQuality",     label: "Evidence quality",       sourceRef: "runops.evidence.v1",         evidence: "Complete evidence bundles on 19/20" },
    { key: "telemetryCoverage",   label: "Telemetry coverage",     sourceRef: "runops.telemetry.v1",        evidence: "All prechecks + postchecks emit signals" },
    { key: "operatorDeviation",   label: "Operator deviation",     sourceRef: "runops.executions.deviations.v1", evidence: "Deviations low (0.15/run)" },
    { key: "incidentRecurrence",  label: "Incident recurrence",    sourceRef: "runops.incidents.v1",        evidence: "Related incidents down 40% QoQ" },
    { key: "policyCompliance",    label: "Policy compliance",      sourceRef: "runops.policies.v1",         evidence: "All required approvals present" },
  ];
  return base.map((b): Dimension => ({
    key: b.key,
    label: b.label,
    score: Math.round(scores[b.key] ?? 82),
    evidence: extra?.[b.key]?.evidence ?? b.evidence,
    sourceRef: extra?.[b.key]?.sourceRef ?? b.sourceRef,
    trend: extra?.[b.key]?.trend ?? 0,
  }));
};

const seedRecords = (): FitnessRecord[] => [
  {
    runbookId: "RB-3121", title: "Checkout latency remediation", ownerRef: "team-checkout-sre",
    serviceId: "checkout-api", certifiedUntil: new Date(Date.now() + 87 * 864e5).toISOString(),
    lastExecutedAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    overallScore: 76, state: "At risk",
    dimensions: seedDims(
      { freshness: 74, owner: 92, certification: 88, testCoverage: 66, executionSuccess: 85, executionDuration: 72,
        rollback: 90, manualIntervention: 62, supportedVersions: 78, evidenceQuality: 80, telemetryCoverage: 55,
        operatorDeviation: 70, incidentRecurrence: 58, policyCompliance: 95 },
      {
        incidentRecurrence: { evidence: "Recurrence 3× in 60d — root cause not addressed", trend: -12, sourceRef: "PM-10482" },
        telemetryCoverage: { evidence: "Query plan comparison precheck missing", trend: -8, sourceRef: "runops.telemetry.v1" },
        manualIntervention: { evidence: "6/20 runs required manual override on step 4", trend: -4, sourceRef: "runops.executions.steps.v1" },
      },
    ),
    history: [
      { at: new Date(Date.now() - 60 * 864e5).toISOString(), score: 84 },
      { at: new Date(Date.now() - 30 * 864e5).toISOString(), score: 80 },
      { at: new Date(Date.now() - 15 * 864e5).toISOString(), score: 78 },
      { at: nowIso(), score: 76 },
    ],
    updatedAt: nowIso(),
  },
  {
    runbookId: "RB-3055", title: "Order DB failover", ownerRef: "team-order-db",
    serviceId: "order-db", certifiedUntil: new Date(Date.now() + 12 * 864e5).toISOString(),
    lastExecutedAt: new Date(Date.now() - 22 * 864e5).toISOString(),
    overallScore: 89, state: "High fitness",
    dimensions: seedDims({ freshness: 88, owner: 95, certification: 82, testCoverage: 92, executionSuccess: 96,
      executionDuration: 85, rollback: 98, manualIntervention: 88, supportedVersions: 90, evidenceQuality: 94,
      telemetryCoverage: 90, operatorDeviation: 88, incidentRecurrence: 82, policyCompliance: 98 }),
    history: [{ at: new Date(Date.now() - 30 * 864e5).toISOString(), score: 86 }, { at: nowIso(), score: 89 }],
    updatedAt: nowIso(),
  },
  {
    runbookId: "RB-3002", title: "Legacy payments retry drain", ownerRef: null,
    serviceId: "payments-legacy", certifiedUntil: null,
    lastExecutedAt: new Date(Date.now() - 180 * 864e5).toISOString(),
    overallScore: 34, state: "Owner missing",
    dimensions: seedDims({ freshness: 20, owner: 0, certification: 10, testCoverage: 25, executionSuccess: 40,
      executionDuration: 45, rollback: 30, manualIntervention: 35, supportedVersions: 40, evidenceQuality: 30,
      telemetryCoverage: 25, operatorDeviation: 50, incidentRecurrence: 55, policyCompliance: 60 }),
    history: [{ at: new Date(Date.now() - 90 * 864e5).toISOString(), score: 42 }, { at: nowIso(), score: 34 }],
    updatedAt: nowIso(),
  },
  {
    runbookId: "RB-3199", title: "Cache warmup replay", ownerRef: "team-platform",
    serviceId: "cache-fleet", certifiedUntil: new Date(Date.now() - 4 * 864e5).toISOString(),
    lastExecutedAt: new Date(Date.now() - 40 * 864e5).toISOString(),
    overallScore: 52, state: "Certification expired",
    dimensions: seedDims({ freshness: 60, owner: 80, certification: 0, testCoverage: 55, executionSuccess: 70,
      executionDuration: 65, rollback: 55, manualIntervention: 60, supportedVersions: 45, evidenceQuality: 55,
      telemetryCoverage: 40, operatorDeviation: 65, incidentRecurrence: 50, policyCompliance: 60 }, {
        certification: { evidence: "Certification expired 4 days ago", trend: -30 },
      }),
    history: [{ at: new Date(Date.now() - 30 * 864e5).toISOString(), score: 66 }, { at: nowIso(), score: 52 }],
    updatedAt: nowIso(),
  },
  {
    runbookId: "RB-3211", title: "Feature flag rollback", ownerRef: "team-flags",
    serviceId: "flags-service", certifiedUntil: new Date(Date.now() + 55 * 864e5).toISOString(),
    lastExecutedAt: new Date(Date.now() - 5 * 864e5).toISOString(),
    overallScore: 42, state: "Critical",
    dimensions: seedDims({ freshness: 55, owner: 85, certification: 78, testCoverage: 40, executionSuccess: 35,
      executionDuration: 50, rollback: 30, manualIntervention: 25, supportedVersions: 60, evidenceQuality: 40,
      telemetryCoverage: 30, operatorDeviation: 30, incidentRecurrence: 25, policyCompliance: 70 }, {
        executionSuccess: { evidence: "8/20 recent runs failed", trend: -18 },
        rollback: { evidence: "1/3 rollback attempts left partial state", trend: -22 },
        incidentRecurrence: { evidence: "5 flag-related incidents last 30d", trend: -25 },
      }),
    history: [{ at: new Date(Date.now() - 30 * 864e5).toISOString(), score: 58 }, { at: nowIso(), score: 42 }],
    updatedAt: nowIso(),
  },
];

const seedProposals = (): Proposal[] => [
  {
    id: "PR-9042", runbookId: "RB-3121",
    title: "Add query plan comparison precheck",
    rationale: "PM-10482 identified plan regression as the root cause of the 3 recurrences. A precheck that compares the current plan against the last-known-good snapshot would block execution when they diverge, matching the postmortem's action item.",
    dimensionsAffected: ["telemetryCoverage", "incidentRecurrence", "policyCompliance"],
    confidence: 0.82,
    uncertainty: "Requires DB advisor connector for two services that don't yet expose plan hashes. Estimated coverage: 4 of 5 dependent DBs.",
    evidenceRefs: ["PM-10482", "INC-2411", "INC-2456", "INC-2477"],
    sources: ["Postmortem PM-10482", "AI code diff on RB-3121 v14", "Runbook fitness telemetry rollup"],
    beforeSummary: "Step 2 issues rollback based on latency check only. No plan-shape check. Recurrence rate 3/60d.",
    afterSummary: "New Step 1.5 fetches EXPLAIN plans, compares hashes, aborts + notifies if divergence >5%.",
    state: "Proposed", createdAt: nowIso(), aiGenerated: true,
  },
  {
    id: "PR-9043", runbookId: "RB-3121",
    title: "Stronger customer journey validation on step 5",
    rationale: "Current validator only checks HTTP 200. PM-10482 recommended validating checkout journey completion (add-to-cart → order-confirmation) using the journey signal set already emitted by the order service.",
    dimensionsAffected: ["evidenceQuality", "manualIntervention", "operatorDeviation"],
    confidence: 0.74,
    uncertainty: "Journey signals have 3–8 min lag in staging; validation must tolerate that window.",
    evidenceRefs: ["PM-10482", "runops.telemetry.v1#journeys"],
    sources: ["Postmortem PM-10482", "Customer journey telemetry", "AI code diff on RB-3121 v14"],
    beforeSummary: "Step 5 posts to /health and checks 200 OK. Cannot detect partial checkout regressions.",
    afterSummary: "Step 5 subscribes to journey-complete events for 15m, asserts ≥95% of test cohort completed.",
    state: "Proposed", createdAt: nowIso(), aiGenerated: true,
  },
  {
    id: "PR-9044", runbookId: "RB-3211",
    title: "Two-phase flag rollback with staged verification",
    rationale: "8/20 recent runs left flags in an inconsistent state because rollback flipped all environments simultaneously. Rolling back per environment with verification between phases would catch failures earlier.",
    dimensionsAffected: ["rollback", "executionSuccess", "incidentRecurrence"],
    confidence: 0.68,
    uncertainty: "May increase total execution time p95 by 30–40s. Trade-off vs. safety must be reviewed with owner.",
    evidenceRefs: ["INC-2503", "INC-2519"],
    sources: ["Execution log analysis", "AI code diff"],
    beforeSummary: "Rollback flips flag in all envs in one step.",
    afterSummary: "Rollback proceeds staging → canary → prod with 60s verification gate between phases.",
    state: "Proposed", createdAt: nowIso(), aiGenerated: true,
  },
];

const seedRecert = (): RecertRequest[] => [
  { id: "RC-6001", runbookId: "RB-3199", reason: "Certification expired 4d ago.", requestedAt: nowIso(), requestedBy: "system.fitness", dueBy: new Date(Date.now() + 14 * 864e5).toISOString(), state: "Open" },
];

const seedConsolidate = (): ConsolidationCandidate[] => [
  { id: "CO-4200", primaryRunbookId: "RB-3121", duplicateRunbookIds: ["RB-3123"], overlapPct: 78, rationale: "Steps 1–4 identical; only step 5 validator differs." },
];

const seedRetire = (): RetirementCandidate[] => [
  { id: "RE-5100", runbookId: "RB-3002", reason: "Owner absent, unused 180+ days, targets deprecated service.", dependentServices: ["payments-legacy"], dependentRunbooks: [] },
];

/* -------------------------------- Helpers -------------------------------- */

const stateTone = (s: FitnessState): string => {
  switch (s) {
    case "High fitness":            return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "At risk":                 return "bg-amber-50 text-amber-800 border-amber-200";
    case "Critical":                return "bg-rose-50 text-rose-800 border-rose-200";
    case "Certification expired":   return "bg-orange-50 text-orange-800 border-orange-200";
    case "Owner missing":           return "bg-slate-100 text-slate-800 border-slate-300";
    case "Improvement proposed":    return "bg-sky-50 text-sky-800 border-sky-200";
  }
};

const scoreTone = (n: number): string => {
  if (n >= 80) return "text-emerald-700";
  if (n >= 60) return "text-amber-700";
  return "text-rose-700";
};

const barTone = (n: number): string => {
  if (n >= 80) return "bg-emerald-500";
  if (n >= 60) return "bg-amber-500";
  return "bg-rose-500";
};

const computeOverall = (dims: Dimension[]): number => {
  if (dims.length === 0) return 0;
  const w: Record<DimensionKey, number> = {
    freshness: 1, owner: 1.2, certification: 1.2, testCoverage: 1.0, executionSuccess: 1.4,
    executionDuration: 0.8, rollback: 1.3, manualIntervention: 0.9, supportedVersions: 0.7,
    evidenceQuality: 1.0, telemetryCoverage: 0.9, operatorDeviation: 0.8, incidentRecurrence: 1.5,
    policyCompliance: 1.1,
  };
  const num = dims.reduce((a, d) => a + d.score * (w[d.key] ?? 1), 0);
  const den = dims.reduce((a, d) => a + (w[d.key] ?? 1), 0);
  return Math.round(num / den);
};

const deriveState = (r: FitnessRecord): FitnessState => {
  if (!r.ownerRef) return "Owner missing";
  if (r.certifiedUntil && new Date(r.certifiedUntil).getTime() < Date.now()) return "Certification expired";
  if (r.overallScore < 50) return "Critical";
  if (r.overallScore < 75) return "At risk";
  return "High fitness";
};

/* --------------------------------- UI ---------------------------------- */

const MetricCard = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) => (
  <Card><CardContent className="p-3">
    <div className="flex items-center gap-2 text-xs text-slate-500">{icon}<span>{label}</span></div>
    <div className="text-xl font-semibold text-slate-900 mt-1 tabular-nums">{value}</div>
    {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
  </CardContent></Card>
);

const Bar = ({ score }: { score: number }) => (
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
    <div className={cn("h-full", barTone(score))} style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
  </div>
);

const TrendArrow = ({ n }: { n: number }) => {
  if (n === 0) return <span className="text-slate-400 text-xs">—</span>;
  const up = n > 0;
  return (
    <span className={cn("text-xs inline-flex items-center gap-0.5", up ? "text-emerald-700" : "text-rose-700")}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{n}
    </span>
  );
};

/* -------------------------------- Page --------------------------------- */

export default function RunbookFitness(): JSX.Element {
  const ops = useOperations();
  const navigate = useNavigate();
  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [records, setRecords] = useState<FitnessRecord[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [recerts, setRecerts] = useState<RecertRequest[]>([]);
  const [consolidations, setConsolidations] = useState<ConsolidationCandidate[]>([]);
  const [retirements, setRetirements] = useState<RetirementCandidate[]>([]);

  const [tab, setTab] = useState<TabKey>("portfolio");
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<"all" | FitnessState>("all");
  const [dimFilter, setDimFilter] = useState<"all" | DimensionKey>("all");
  const [selectedRunbookId, setSelectedRunbookId] = useState<string>("RB-3121");
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [inp, setInp] = useState<Record<string, string>>({});
  const [connectorDown, setConnectorDown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      let r = readList<FitnessRecord>(REC_KEY);        if (r.length === 0) { r = seedRecords(); writeList(REC_KEY, r); } setRecords(r);
      let p = readList<Proposal>(PROP_KEY);            if (p.length === 0) { p = seedProposals(); writeList(PROP_KEY, p); } setProposals(p);
      let rc = readList<RecertRequest>(RECERT_KEY);    if (rc.length === 0) { rc = seedRecert(); writeList(RECERT_KEY, rc); } setRecerts(rc);
      let cs = readList<ConsolidationCandidate>(CONS_KEY); if (cs.length === 0) { cs = seedConsolidate(); writeList(CONS_KEY, cs); } setConsolidations(cs);
      let rt = readList<RetirementCandidate>(RETIRE_KEY); if (rt.length === 0) { rt = seedRetire(); writeList(RETIRE_KEY, rt); } setRetirements(rt);
      setLoading(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load fitness data.");
      setLoading(false);
    }
  }, []);

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info", entityRef?: string) => {
    ops.pushNotification({ kind, title, detail, entityRef: entityRef ?? "runbooks.fitness", route: "/runops/runbooks/fitness" });
  }, [ops]);

  const persistRecords = useCallback((next: FitnessRecord[]) => { writeList(REC_KEY, next); setRecords(next); }, []);
  const persistProposals = useCallback((next: Proposal[]) => { writeList(PROP_KEY, next); setProposals(next); }, []);
  const persistRecerts = useCallback((next: RecertRequest[]) => { writeList(RECERT_KEY, next); setRecerts(next); }, []);
  const persistConsolidations = useCallback((next: ConsolidationCandidate[]) => { writeList(CONS_KEY, next); setConsolidations(next); }, []);
  const persistRetirements = useCallback((next: RetirementCandidate[]) => { writeList(RETIRE_KEY, next); setRetirements(next); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (stateFilter !== "all" && r.state !== stateFilter) return false;
      if (dimFilter !== "all") {
        const d = r.dimensions.find((x) => x.key === dimFilter);
        if (!d || d.score >= 70) return false;
      }
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || r.runbookId.toLowerCase().includes(q) || r.serviceId.toLowerCase().includes(q);
    });
  }, [records, query, stateFilter, dimFilter]);

  const selected = useMemo(() => records.find((r) => r.runbookId === selectedRunbookId) ?? records[0] ?? null, [records, selectedRunbookId]);

  const portfolio = useMemo(() => {
    const high = records.filter((r) => r.state === "High fitness").length;
    const risk = records.filter((r) => r.state === "At risk").length;
    const crit = records.filter((r) => r.state === "Critical").length;
    const exp = records.filter((r) => r.state === "Certification expired").length;
    const noOwner = records.filter((r) => r.state === "Owner missing").length;
    const avg = records.length ? Math.round(records.reduce((a, r) => a + r.overallScore, 0) / records.length) : 0;
    const proposed = proposals.filter((p) => p.state === "Proposed" || p.state === "In review").length;
    return { total: records.length, avg, high, risk, crit, exp, noOwner, proposed };
  }, [records, proposals]);

  const openDialog = (d: Exclude<DialogKey, null>) => { setInp({}); setDialog(d); };
  const closeDialog = () => { setDialog(null); setInp({}); };

  /* ------------------------------- Actions ----------------------------- */

  const openRunbook = (id: string) => navigate(`/runops/runbooks/${id}`);

  const doCreateUpdate = () => {
    if (!dialog || dialog.kind !== "create-update") return;
    const drafts = readList<{ id: string; runbookId: string; note: string; createdBy: string; at: string }>(DRAFT_KEY);
    const draft = { id: rid("DR"), runbookId: dialog.runbookId, note: inp.note || "Manual update requested via fitness.", createdBy: ops.role, at: nowIso() };
    drafts.unshift(draft);
    writeList(DRAFT_KEY, drafts);
    audit("Runbook update drafted", `${draft.id} for ${dialog.runbookId}. Draft appears in Runbook Library.`, "info", dialog.runbookId);
    closeDialog();
  };

  const doReviewDecision = (decision: "Accepted" | "Rejected") => {
    if (!dialog || dialog.kind !== "review-proposal") return;
    const p = proposals.find((x) => x.id === dialog.proposalId);
    if (!p) return;
    const nextProps = proposals.map((x) => x.id === p.id ? { ...x, state: decision, decidedAt: nowIso(), decidedBy: ops.role } : x);
    persistProposals(nextProps);
    if (decision === "Accepted") {
      // Cross-screen: create a draft runbook version
      const drafts = readList<{ id: string; runbookId: string; source: string; proposalId: string; title: string; at: string; createdBy: string }>(DRAFT_KEY);
      drafts.unshift({ id: rid("DR"), runbookId: p.runbookId, source: "fitness.proposal", proposalId: p.id, title: p.title, at: nowIso(), createdBy: ops.role });
      writeList(DRAFT_KEY, drafts);
      // Update record state
      persistRecords(records.map((r) => r.runbookId === p.runbookId ? { ...r, state: "Improvement proposed" as FitnessState, updatedAt: nowIso() } : r));
      audit("Proposal accepted", `${p.id} → draft runbook version. Publishing will refresh fitness.`, "info", p.runbookId);
    } else {
      audit("Proposal rejected", `${p.id} rejected. ${inp.reason ? `Reason: ${inp.reason}` : ""}`, "warning", p.runbookId);
    }
    closeDialog();
  };

  const doPublishImprovement = (proposalId: string) => {
    const p = proposals.find((x) => x.id === proposalId);
    if (!p || p.state !== "Accepted") return;
    persistProposals(proposals.map((x) => x.id === proposalId ? { ...x, state: "Published" as const, decidedAt: nowIso(), decidedBy: ops.role } : x));
    // Improve affected dimensions
    persistRecords(records.map((r) => {
      if (r.runbookId !== p.runbookId) return r;
      const dims = r.dimensions.map((d) => p.dimensionsAffected.includes(d.key)
        ? { ...d, score: Math.min(100, d.score + 10), trend: 8, evidence: `${d.evidence} · updated by ${p.id}` }
        : d);
      const overall = computeOverall(dims);
      const rec: FitnessRecord = { ...r, dimensions: dims, overallScore: overall, updatedAt: nowIso(), history: [...r.history, { at: nowIso(), score: overall }] };
      return { ...rec, state: deriveState(rec) };
    }));
    audit("Improvement published", `${p.id} published. Affected dimensions refreshed from evidence.`, "info", p.runbookId);
  };

  const doRequestRecert = () => {
    if (!dialog || dialog.kind !== "recert") return;
    const rc: RecertRequest = {
      id: rid("RC"), runbookId: dialog.runbookId, reason: inp.reason || "Fitness-driven recertification.",
      requestedAt: nowIso(), requestedBy: ops.role,
      dueBy: new Date(Date.now() + 14 * 864e5).toISOString(), state: "Open",
    };
    persistRecerts([rc, ...recerts]);
    audit("Recertification requested", `${rc.id} on ${dialog.runbookId}. Due in 14d.`, "info", dialog.runbookId);
    closeDialog();
  };

  const doConsolidate = () => {
    if (!dialog || dialog.kind !== "consolidate") return;
    const duplicates = (inp.duplicates || "").split(",").map((x) => x.trim()).filter(Boolean);
    if (duplicates.length === 0) return;
    const c: ConsolidationCandidate = {
      id: rid("CO"), primaryRunbookId: dialog.runbookId, duplicateRunbookIds: duplicates,
      overlapPct: Number(inp.overlap) || 50, rationale: inp.rationale || "Duplicate coverage identified via fitness.",
    };
    persistConsolidations([c, ...consolidations]);
    audit("Consolidation proposed", `${c.id}: merge ${duplicates.join(", ")} into ${dialog.runbookId}.`, "info", dialog.runbookId);
    closeDialog();
  };

  const doRetire = () => {
    if (!dialog || dialog.kind !== "retire") return;
    const rec = records.find((r) => r.runbookId === dialog.runbookId);
    if (!rec) return;
    const rt: RetirementCandidate = {
      id: rid("RE"), runbookId: dialog.runbookId, reason: inp.reason || "Fitness score below threshold.",
      dependentServices: [rec.serviceId], dependentRunbooks: [],
      decidedAt: nowIso(), decision: "Retire",
    };
    persistRetirements([rt, ...retirements]);
    // Cross-screen: governance record
    const gov = readList<{ id: string; kind: string; runbookId: string; note: string; at: string }>(GOV_KEY);
    gov.unshift({ id: rid("GOV"), kind: "runbook.retire", runbookId: dialog.runbookId, note: rt.reason, at: nowIso() });
    writeList(GOV_KEY, gov);
    // Remove from active records
    persistRecords(records.filter((r) => r.runbookId !== dialog.runbookId));
    audit("Runbook retired", `${dialog.runbookId} retired. Dependent services flagged: ${rt.dependentServices.join(", ")}.`, "critical", dialog.runbookId);
    closeDialog();
  };

  const doAssignOwner = () => {
    if (!dialog || dialog.kind !== "assign-owner") return;
    const owner = (inp.owner || "").trim();
    if (!owner) return;
    persistRecords(records.map((r) => {
      if (r.runbookId !== dialog.runbookId) return r;
      const dims = r.dimensions.map((d) => d.key === "owner" ? { ...d, score: 90, evidence: `Owner ${owner} assigned via fitness`, trend: 90 - d.score } : d);
      const overall = computeOverall(dims);
      const rec: FitnessRecord = { ...r, ownerRef: owner, dimensions: dims, overallScore: overall, updatedAt: nowIso() };
      return { ...rec, state: deriveState(rec) };
    }));
    audit("Owner assigned", `${owner} → ${dialog.runbookId}. Owner dimension refreshed.`, "info", dialog.runbookId);
    closeDialog();
  };

  const doCreateTest = () => {
    if (!dialog || dialog.kind !== "create-test") return;
    const title = (inp.title || "").trim();
    if (!title) return;
    persistRecords(records.map((r) => {
      if (r.runbookId !== dialog.runbookId) return r;
      const dims = r.dimensions.map((d) => d.key === "testCoverage"
        ? { ...d, score: Math.min(100, d.score + 6), evidence: `${d.evidence} · +test "${title}"`, trend: 6 }
        : d);
      const overall = computeOverall(dims);
      const rec: FitnessRecord = { ...r, dimensions: dims, overallScore: overall, updatedAt: nowIso() };
      return { ...rec, state: deriveState(rec) };
    }));
    audit("Test created", `"${title}" added to ${dialog.runbookId}. Test coverage refreshed.`, "info", dialog.runbookId);
    closeDialog();
  };

  const toggleConnector = () => setConnectorDown((v) => !v);

  /* --------------------------------- UI --------------------------------- */

  if (loading) return (
    <div className="p-6"><EntityHeader title="Continuous Improvement & Runbook Fitness" subtitle="Loading…" />
      <div className="mt-6 text-sm text-slate-500 flex items-center gap-2"><Timer className="h-4 w-4 animate-pulse" /> Loading…</div>
    </div>
  );
  if (loadError) return (
    <div className="p-6"><EntityHeader title="Continuous Improvement & Runbook Fitness" subtitle="Failed to load" />
      <Card className="mt-6 border-rose-200 bg-rose-50"><CardContent className="p-4 text-sm text-rose-800 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5" /><div><div className="font-medium">Could not load fitness data.</div><div className="text-rose-700/80 mt-1">{loadError}</div></div>
      </CardContent></Card>
    </div>
  );

  const dimLabels: Record<DimensionKey, string> = {
    freshness: "Freshness", owner: "Owner status", certification: "Certification", testCoverage: "Test coverage",
    executionSuccess: "Execution success", executionDuration: "Execution duration", rollback: "Rollback performance",
    manualIntervention: "Manual intervention", supportedVersions: "Supported versions", evidenceQuality: "Evidence quality",
    telemetryCoverage: "Telemetry coverage", operatorDeviation: "Operator deviation",
    incidentRecurrence: "Incident recurrence", policyCompliance: "Policy compliance",
  };

  return (
    <div className="p-6 space-y-6">
      <EntityHeader
        title="Continuous Improvement & Runbook Fitness"
        subtitle="Accurate · Safe · Effective · Maintainable — scored transparently from connected evidence."
        meta={
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{portfolio.total} runbooks</Badge>
            <Badge variant="outline">Avg fitness {portfolio.avg}</Badge>
            <Badge variant="outline" className={cn(stateTone("At risk"))}>{portfolio.risk} at risk</Badge>
            <Badge variant="outline" className={cn(stateTone("Critical"))}>{portfolio.crit} critical</Badge>
            <Badge variant="outline" className={cn(stateTone("Certification expired"))}>{portfolio.exp} cert expired</Badge>
            <Badge variant="outline" className={cn(stateTone("Owner missing"))}>{portfolio.noOwner} owner missing</Badge>
            <Badge variant="outline" className={cn(stateTone("Improvement proposed"))}>{portfolio.proposed} proposals</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" aria-pressed={connectorDown} onClick={toggleConnector}>
              {connectorDown ? "Evidence: Down" : "Evidence: OK"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/runops/runbooks")}>
              <ExternalLink className="h-4 w-4 mr-1" />Runbook Library
            </Button>
          </div>
        }
      />

      {!canWrite && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> You have <strong className="mx-1">read-only</strong> access. Mutations are disabled.
          </CardContent>
        </Card>
      )}
      {connectorDown && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-3 text-sm text-rose-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Evidence connectors <strong className="mx-1">unavailable</strong>. Scores shown may be stale.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard icon={<Layers className="h-4 w-4" />} label="Runbooks" value={String(portfolio.total)} sub="Across services" />
        <MetricCard icon={<Activity className="h-4 w-4" />} label="Avg fitness" value={String(portfolio.avg)} sub="0–100" />
        <MetricCard icon={<CheckCircle2 className="h-4 w-4" />} label="High fitness" value={String(portfolio.high)} sub="≥ 80" />
        <MetricCard icon={<AlertTriangle className="h-4 w-4" />} label="At risk / critical" value={`${portfolio.risk} / ${portfolio.crit}`} sub="60–79 / < 60" />
        <MetricCard icon={<BadgeCheck className="h-4 w-4" />} label="Cert issues" value={`${portfolio.exp} / ${portfolio.noOwner}`} sub="Expired / no owner" />
        <MetricCard icon={<GitPullRequest className="h-4 w-4" />} label="Proposals open" value={String(portfolio.proposed)} sub="Awaiting review" />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="portfolio"><Activity className="h-3.5 w-3.5 mr-1" />Portfolio</TabsTrigger>
          <TabsTrigger value="ranking"><TrendingDown className="h-3.5 w-3.5 mr-1" />Ranking</TabsTrigger>
          <TabsTrigger value="dimensions"><Target className="h-3.5 w-3.5 mr-1" />Dimension breakdown</TabsTrigger>
          <TabsTrigger value="proposals"><GitPullRequest className="h-3.5 w-3.5 mr-1" />Proposals</TabsTrigger>
          <TabsTrigger value="recert"><BadgeCheck className="h-3.5 w-3.5 mr-1" />Recertification</TabsTrigger>
          <TabsTrigger value="consolidate"><Layers className="h-3.5 w-3.5 mr-1" />Consolidate</TabsTrigger>
          <TabsTrigger value="retire"><XCircle className="h-3.5 w-3.5 mr-1" />Retire</TabsTrigger>
        </TabsList>

        {/* Portfolio ----------------------------------------------------- */}
        <TabsContent value="portfolio" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input aria-label="Search runbooks" placeholder="Search title, id, service…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8 w-64" />
            </div>
            <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as typeof stateFilter)}>
              <SelectTrigger className="w-56" aria-label="Filter state"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                <SelectItem value="High fitness">High fitness</SelectItem>
                <SelectItem value="At risk">At risk</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Certification expired">Certification expired</SelectItem>
                <SelectItem value="Owner missing">Owner missing</SelectItem>
                <SelectItem value="Improvement proposed">Improvement proposed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dimFilter} onValueChange={(v) => setDimFilter(v as typeof dimFilter)}>
              <SelectTrigger className="w-64" aria-label="Filter dimension"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any weak dimension</SelectItem>
                {(Object.keys(dimLabels) as DimensionKey[]).map((k) => (
                  <SelectItem key={k} value={k}>Weak: {dimLabels[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto border rounded-md bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Runbook</th>
                  <th className="px-3 py-2 text-left font-medium">Service</th>
                  <th className="px-3 py-2 text-left font-medium">Owner</th>
                  <th className="px-3 py-2 text-left font-medium">Fitness</th>
                  <th className="px-3 py-2 text-left font-medium">State</th>
                  <th className="px-3 py-2 text-left font-medium">Certification</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-500 text-sm">No runbooks match filters.</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r.runbookId} className="border-b last:border-b-0 hover:bg-slate-50/60">
                    <td className="px-3 py-2">
                      <button className="text-left font-medium text-slate-900 hover:underline" onClick={() => { setSelectedRunbookId(r.runbookId); setTab("dimensions"); }}>
                        {r.title}
                      </button>
                      <div className="text-xs text-slate-500">{r.runbookId}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{r.serviceId}</td>
                    <td className="px-3 py-2 text-slate-700">{r.ownerRef ?? <span className="text-rose-700">— missing</span>}</td>
                    <td className="px-3 py-2">
                      <div className={cn("font-semibold tabular-nums", scoreTone(r.overallScore))}>{r.overallScore}</div>
                      <div className="w-24"><Bar score={r.overallScore} /></div>
                    </td>
                    <td className="px-3 py-2"><Badge variant="outline" className={cn("text-xs", stateTone(r.state))}>{r.state}</Badge></td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {r.certifiedUntil ? new Date(r.certifiedUntil).toLocaleDateString() : <span className="text-rose-700">—</span>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedRunbookId(r.runbookId); setTab("dimensions"); }}>
                        Open <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Ranking -------------------------------------------------------- */}
        <TabsContent value="ranking" className="mt-4 space-y-3">
          <div className="text-xs text-slate-500">Sorted ascending by fitness — worst first, so the improvement queue is obvious.</div>
          <div className="space-y-2">
            {[...records].sort((a, b) => a.overallScore - b.overallScore).map((r, idx) => {
              const first = r.history[0]?.score ?? r.overallScore;
              const delta = r.overallScore - first;
              return (
                <div key={r.runbookId} className="flex items-center gap-3 border rounded-md bg-white p-3">
                  <div className="text-xs font-mono text-slate-400 w-6 text-right">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button className="font-medium text-slate-900 hover:underline truncate" onClick={() => { setSelectedRunbookId(r.runbookId); setTab("dimensions"); }}>
                        {r.title}
                      </button>
                      <Badge variant="outline" className={cn("text-xs", stateTone(r.state))}>{r.state}</Badge>
                    </div>
                    <div className="text-xs text-slate-500">{r.runbookId} · {r.serviceId}</div>
                    <div className="mt-1"><Bar score={r.overallScore} /></div>
                  </div>
                  <div className="text-right">
                    <div className={cn("font-semibold tabular-nums", scoreTone(r.overallScore))}>{r.overallScore}</div>
                    <div className="text-xs"><TrendArrow n={delta} /></div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {/* Sparkline as bars */}
                      {r.history.slice(-6).map((h, i) => {
                        const h0 = r.history[0]?.score ?? h.score;
                        const pct = Math.max(20, Math.min(100, (h.score / Math.max(h0, 1)) * 100));
                        return <div key={i} className={cn("w-1 rounded-sm", barTone(h.score))} style={{ height: `${pct * 0.24 + 6}px` }} title={`${h.score} @ ${new Date(h.at).toLocaleDateString()}`} />;
                      })}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => openRunbook(r.runbookId)}>Open runbook <ExternalLink className="h-3.5 w-3.5 ml-1" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Dimensions ----------------------------------------------------- */}
        <TabsContent value="dimensions" className="mt-4 space-y-3">
          {!selected ? (
            <Card><CardContent className="p-6 text-sm text-slate-500">Select a runbook from the portfolio.</CardContent></Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-500">{selected.serviceId} · {selected.runbookId}</div>
                      <div className="text-lg font-semibold text-slate-900">{selected.title}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Owner: {selected.ownerRef ?? <span className="text-rose-700">missing</span>} ·
                        Certified until: {selected.certifiedUntil ? new Date(selected.certifiedUntil).toLocaleDateString() : "—"} ·
                        Last executed: {selected.lastExecutedAt ? new Date(selected.lastExecutedAt).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-3xl font-semibold tabular-nums", scoreTone(selected.overallScore))}>{selected.overallScore}</div>
                      <Badge variant="outline" className={cn("text-xs", stateTone(selected.state))}>{selected.state}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3">
                    <Button size="sm" variant="outline" onClick={() => openRunbook(selected.runbookId)}><ExternalLink className="h-4 w-4 mr-1" />Open runbook</Button>
                    <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "create-update", runbookId: selected.runbookId })}><Sparkles className="h-4 w-4 mr-1" />Create update</Button>
                    <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "recert", runbookId: selected.runbookId })}><BadgeCheck className="h-4 w-4 mr-1" />Request recertification</Button>
                    <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "assign-owner", runbookId: selected.runbookId })}><UserCheck className="h-4 w-4 mr-1" />Assign owner</Button>
                    <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "create-test", runbookId: selected.runbookId })}><ClipboardList className="h-4 w-4 mr-1" />Create test</Button>
                    <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "consolidate", runbookId: selected.runbookId })}><Layers className="h-4 w-4 mr-1" />Consolidate</Button>
                    <Button size="sm" variant="outline" disabled={!canWrite || selected.overallScore >= 40} onClick={() => openDialog({ kind: "retire", runbookId: selected.runbookId })}><XCircle className="h-4 w-4 mr-1" />Retire</Button>
                    <Button size="sm" variant="outline" onClick={() => openDialog({ kind: "pr-simulation", runbookId: selected.runbookId })}><GitPullRequest className="h-4 w-4 mr-1" />AI pull request simulation</Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-3">
                {selected.dimensions.map((d) => (
                  <Card key={d.key}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-900">{d.label}</div>
                        <div className="flex items-center gap-2">
                          <TrendArrow n={d.trend} />
                          <div className={cn("font-semibold tabular-nums text-sm", scoreTone(d.score))}>{d.score}</div>
                        </div>
                      </div>
                      <div className="mt-2"><Bar score={d.score} /></div>
                      <div className="text-xs text-slate-600 mt-2">{d.evidence}</div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1"><FileSearch className="h-3 w-3" />Source: <span className="font-mono">{d.sourceRef}</span></div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">Improvement recommendations for {selected.runbookId}</div>
                  {proposals.filter((p) => p.runbookId === selected.runbookId).length === 0 ? (
                    <div className="text-xs text-slate-500">No recommendations. Fitness is stable relative to evidence.</div>
                  ) : (
                    <div className="space-y-2">
                      {proposals.filter((p) => p.runbookId === selected.runbookId).map((p) => (
                        <ProposalRow
                          key={p.id} p={p}
                          onReview={() => openDialog({ kind: "review-proposal", proposalId: p.id })}
                          onCompare={() => openDialog({ kind: "compare", proposalId: p.id })}
                          onPublish={() => doPublishImprovement(p.id)}
                          canWrite={canWrite}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Proposals ------------------------------------------------------ */}
        <TabsContent value="proposals" className="mt-4 space-y-2">
          {proposals.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-slate-500">No proposals.</CardContent></Card>
          ) : proposals.map((p) => (
            <ProposalRow
              key={p.id} p={p}
              onReview={() => openDialog({ kind: "review-proposal", proposalId: p.id })}
              onCompare={() => openDialog({ kind: "compare", proposalId: p.id })}
              onPublish={() => doPublishImprovement(p.id)}
              canWrite={canWrite}
            />
          ))}
        </TabsContent>

        {/* Recertification ------------------------------------------------ */}
        <TabsContent value="recert" className="mt-4 space-y-2">
          {recerts.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-slate-500">Recertification queue is empty.</CardContent></Card>
          ) : recerts.map((rc) => (
            <Card key={rc.id}><CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">{rc.runbookId} · {rc.reason}</div>
                <div className="text-xs text-slate-500">{rc.id} · requested {new Date(rc.requestedAt).toLocaleDateString()} · due {new Date(rc.dueBy).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{rc.state}</Badge>
                <Button size="sm" variant="ghost" onClick={() => openRunbook(rc.runbookId)}>Open <ExternalLink className="h-3.5 w-3.5 ml-1" /></Button>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>

        {/* Consolidate ---------------------------------------------------- */}
        <TabsContent value="consolidate" className="mt-4 space-y-2">
          {consolidations.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-slate-500">No consolidation candidates.</CardContent></Card>
          ) : consolidations.map((c) => (
            <Card key={c.id}><CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Merge {c.duplicateRunbookIds.join(", ")} → {c.primaryRunbookId}</div>
                  <div className="text-xs text-slate-500">{c.id} · overlap {c.overlapPct}% · {c.rationale}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => openRunbook(c.primaryRunbookId)}>Open primary <ExternalLink className="h-3.5 w-3.5 ml-1" /></Button>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>

        {/* Retire --------------------------------------------------------- */}
        <TabsContent value="retire" className="mt-4 space-y-2">
          {retirements.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-slate-500">No retirement candidates.</CardContent></Card>
          ) : retirements.map((rt) => (
            <Card key={rt.id}><CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Retire {rt.runbookId}</div>
                  <div className="text-xs text-slate-500">{rt.id} · {rt.reason}</div>
                  <div className="text-xs text-slate-500">Dependent services: {rt.dependentServices.join(", ") || "—"} · Dependent runbooks: {rt.dependentRunbooks.join(", ") || "—"}</div>
                </div>
                <Badge variant="outline" className={cn("text-xs", rt.decision === "Retire" ? stateTone("Critical") : "bg-slate-50 text-slate-700 border-slate-200")}>{rt.decision ?? "Proposed"}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* -------------------------- Dialogs ---------------------------- */}
      <Dialog open={dialog?.kind === "create-update"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Create runbook update</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="text-xs text-slate-500">Drafts a change on the target runbook. Visible in the Runbook Library.</div>
            <Textarea placeholder="What should change and why?" value={inp.note ?? ""} onChange={(e) => setInp({ ...inp, note: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button disabled={!canWrite} onClick={doCreateUpdate}>Create draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "review-proposal"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Review proposal</DialogTitle></DialogHeader>
          {(() => {
            const pid = dialog?.kind === "review-proposal" ? dialog.proposalId : null;
            const p = pid ? proposals.find((x) => x.id === pid) : null;
            if (!p) return <div className="text-sm text-slate-500">Not found.</div>;
            return (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">{p.id} · {p.runbookId} · {p.aiGenerated ? "AI generated" : "Human authored"}</div>
                  <div className="font-medium text-slate-900">{p.title}</div>
                </div>
                <div className="rounded-md bg-slate-50 border p-3">
                  <div className="text-xs font-medium text-slate-600 mb-1">Rationale</div>
                  <div className="text-slate-800">{p.rationale}</div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-md border p-3">
                    <div className="text-xs font-medium text-slate-600 mb-1">Confidence</div>
                    <div className="text-2xl font-semibold tabular-nums">{Math.round(p.confidence * 100)}%</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs font-medium text-slate-600 mb-1">Dimensions affected</div>
                    <div className="flex flex-wrap gap-1">
                      {p.dimensionsAffected.map((k) => <Badge key={k} variant="outline" className="text-xs">{dimLabels[k]}</Badge>)}
                    </div>
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs font-medium text-slate-600 mb-1">Uncertainty</div>
                  <div className="text-slate-800">{p.uncertainty}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs font-medium text-slate-600 mb-1">Evidence</div>
                  <div className="text-xs text-slate-700">{p.evidenceRefs.join(" · ")}</div>
                  <div className="text-xs text-slate-500 mt-1">Sources: {p.sources.join(" · ")}</div>
                </div>
                <Textarea placeholder="Reviewer note (optional)…" value={inp.reason ?? ""} onChange={(e) => setInp({ ...inp, reason: e.target.value })} />
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button variant="outline" disabled={!canWrite} onClick={() => doReviewDecision("Rejected")}>Reject</Button>
            <Button disabled={!canWrite} onClick={() => doReviewDecision("Accepted")}>Accept — create draft version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "pr-simulation"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>AI pull request simulation</DialogTitle></DialogHeader>
          {(() => {
            const rbId = dialog?.kind === "pr-simulation" ? dialog.runbookId : null;
            const ps = proposals.filter((x) => x.runbookId === rbId && x.aiGenerated);
            if (ps.length === 0) return <div className="text-sm text-slate-500">No AI proposals for this runbook.</div>;
            return (
              <div className="space-y-2 text-sm">
                <div className="text-xs text-slate-500">Simulated pull requests. Accepting creates a draft version — nothing publishes until the runbook release flow completes.</div>
                {ps.map((p) => (
                  <div key={p.id} className="border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{p.title}</div>
                      <Badge variant="outline" className="text-xs">confidence {Math.round(p.confidence * 100)}%</Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{p.id}</div>
                    <div className="grid md:grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="rounded bg-rose-50 border border-rose-200 p-2"><div className="font-medium text-rose-800">Before</div><div className="text-rose-900/80">{p.beforeSummary}</div></div>
                      <div className="rounded bg-emerald-50 border border-emerald-200 p-2"><div className="font-medium text-emerald-800">After</div><div className="text-emerald-900/80">{p.afterSummary}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          <DialogFooter><Button onClick={closeDialog}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "compare"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Compare before and after</DialogTitle></DialogHeader>
          {(() => {
            const pid = dialog?.kind === "compare" ? dialog.proposalId : null;
            const p = pid ? proposals.find((x) => x.id === pid) : null;
            if (!p) return <div className="text-sm text-slate-500">Not found.</div>;
            return (
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="rounded bg-rose-50 border border-rose-200 p-3">
                  <div className="text-xs font-medium text-rose-800 mb-1">Before</div>
                  <div className="text-rose-900/90">{p.beforeSummary}</div>
                </div>
                <div className="rounded bg-emerald-50 border border-emerald-200 p-3">
                  <div className="text-xs font-medium text-emerald-800 mb-1">After</div>
                  <div className="text-emerald-900/90">{p.afterSummary}</div>
                </div>
              </div>
            );
          })()}
          <DialogFooter><Button onClick={closeDialog}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "recert"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Request recertification</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason" value={inp.reason ?? ""} onChange={(e) => setInp({ ...inp, reason: e.target.value })} />
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button disabled={!canWrite} onClick={doRequestRecert}>Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "consolidate"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Consolidate duplicates</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Duplicate runbook IDs (comma-separated)" value={inp.duplicates ?? ""} onChange={(e) => setInp({ ...inp, duplicates: e.target.value })} />
            <Input placeholder="Overlap % (0–100)" value={inp.overlap ?? ""} onChange={(e) => setInp({ ...inp, overlap: e.target.value })} />
            <Textarea placeholder="Rationale" value={inp.rationale ?? ""} onChange={(e) => setInp({ ...inp, rationale: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button disabled={!canWrite} onClick={doConsolidate}>Propose merge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "retire"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Retire runbook</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
              Retirement updates the library and flags dependent services in Governance.
            </div>
            <Textarea placeholder="Reason" value={inp.reason ?? ""} onChange={(e) => setInp({ ...inp, reason: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button variant="destructive" disabled={!canWrite} onClick={doRetire}>Retire</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "assign-owner"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Assign owner</DialogTitle></DialogHeader>
          <Input placeholder="Team ref, e.g. team-checkout-sre" value={inp.owner ?? ""} onChange={(e) => setInp({ ...inp, owner: e.target.value })} />
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button disabled={!canWrite} onClick={doAssignOwner}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "create-test"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Create test</DialogTitle></DialogHeader>
          <Input placeholder="Test title" value={inp.title ?? ""} onChange={(e) => setInp({ ...inp, title: e.target.value })} />
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button disabled={!canWrite} onClick={doCreateTest}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------- Row subcomponent ---------------------------- */

function ProposalRow({ p, onReview, onCompare, onPublish, canWrite }: {
  p: Proposal;
  onReview: () => void;
  onCompare: () => void;
  onPublish: () => void;
  canWrite: boolean;
}): JSX.Element {
  const tone =
    p.state === "Published"  ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
    p.state === "Accepted"   ? "bg-sky-50 text-sky-800 border-sky-200" :
    p.state === "Rejected"   ? "bg-slate-50 text-slate-700 border-slate-300" :
    p.state === "In review"  ? "bg-amber-50 text-amber-800 border-amber-200" :
                               "bg-violet-50 text-violet-800 border-violet-200";
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-medium text-slate-900">{p.title}</div>
              <Badge variant="outline" className={cn("text-xs", tone)}>{p.state}</Badge>
              {p.aiGenerated && <Badge variant="outline" className="text-xs bg-violet-50 text-violet-800 border-violet-200">AI</Badge>}
              <Badge variant="outline" className="text-xs">confidence {Math.round(p.confidence * 100)}%</Badge>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{p.id} · {p.runbookId}</div>
            <div className="text-xs text-slate-700 mt-1 line-clamp-2">{p.rationale}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span className="font-medium">Evidence:</span> {p.evidenceRefs.join(" · ")} · <span className="font-medium">Sources:</span> {p.sources.join(" · ")}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5"><span className="font-medium">Uncertainty:</span> {p.uncertainty}</div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <Button size="sm" variant="outline" onClick={onCompare}><GitCompare className="h-3.5 w-3.5 mr-1" />Compare</Button>
            {p.state === "Accepted" ? (
              <Button size="sm" disabled={!canWrite} onClick={onPublish}><BadgeCheck className="h-3.5 w-3.5 mr-1" />Publish</Button>
            ) : (
              <Button size="sm" disabled={!canWrite || p.state === "Published" || p.state === "Rejected"} onClick={onReview}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Review</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
