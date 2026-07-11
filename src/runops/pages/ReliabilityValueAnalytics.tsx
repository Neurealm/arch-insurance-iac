/**
 * Page 41 · Reliability & Value Analytics
 * Route: /runops/analytics
 *
 * Quantifies reliability outcomes, operational performance, automation value,
 * and digital-worker effectiveness. Every headline metric traces to source
 * operational records, separates observed from estimated values, and shows
 * confidence intervals for estimates. Correlation is never presented as
 * causation — cost-avoidance / hours-saved show explicit assumptions and
 * counter-factual notes.
 *
 * Persistence (localStorage):
 *   runops.analytics.savedviews.v1        → SavedView[]
 *   runops.analytics.targets.v1           → ReliabilityTarget[]
 *   runops.analytics.actions.v1           → ImprovementAction[]
 *   runops.analytics.exports.v1           → ExportRecord[]
 *   runops.operations.tasks.v1            → cross-screen operations tasks
 *   runops.benefits.realization.v1        → cross-screen benefits realization
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowUpRight, BadgeCheck, Ban, BarChart3, Bot,
  CheckCircle2, ClipboardList, Clock, DollarSign, Download, ExternalLink,
  FileSearch, Filter, GaugeCircle, GitCompare, LineChart, LinkIcon,
  PlusCircle, Save, ShieldAlert, Sparkles, Target, TrendingDown, TrendingUp,
  Users,
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

type ViewKey = "executive" | "service-owner" | "sre" | "operations" | "automation" | "worker" | "customer";

type DataQuality = "complete" | "partial" | "estimate-only" | "no-baseline" | "stale" | "permission-limited";

type ValueKind = "observed" | "estimated";

type MetricKey =
  | "slo_attainment" | "budget_consumption" | "detect_min" | "engage_min"
  | "mitigate_min" | "recover_min" | "recurrence_pct" | "change_fail_pct"
  | "runbook_success_pct" | "exec_duration_min" | "automation_coverage_pct"
  | "human_intervention_pct" | "rollback_pct" | "toil_hours_saved"
  | "worker_accept_pct" | "confidence_calibration" | "cost_per_execution"
  | "model_cost_month" | "hours_saved" | "impact_avoided_usd"
  | "readiness_improvement";

interface Metric {
  key: MetricKey;
  label: string;
  unit: string;                 // "%", "min", "$", "hrs", "score"
  current: number;
  previous: number;
  delta: number;                // current - previous
  betterWhen: "up" | "down";
  kind: ValueKind;              // observed vs estimated
  confidenceLow?: number;       // for estimates
  confidenceHigh?: number;      // for estimates
  quality: DataQuality;
  definition: string;           // human-readable formula
  sourceRecords: string[];      // e.g., ["runops.executions.v1", "INC-10482"]
  assumptions: string[];        // for estimates
  views: ViewKey[];             // which views show this
}

interface Outlier {
  id: string;                   // OUT-####
  metricKey: MetricKey;
  entityRef: string;            // e.g., "RB-0042", "INC-10482", "DW-Recovery"
  entityKind: "runbook" | "incident" | "worker" | "service";
  observed: number;
  expected: number;
  delta: number;
  causeHint: string;
  sourceRecords: string[];
}

interface SavedView {
  id: string;                   // SV-####
  name: string;
  view: ViewKey;
  filters: FilterState;
  createdAt: string;
  createdBy: string;
}

interface FilterState {
  serviceId: string;            // "all" or id
  teamId: string;
  technology: string;
  runbookId: string;
  workerId: string;
  environment: string;
  timeRange: "7d" | "30d" | "90d";
  compareTo: "prev-period" | "prev-year" | "none";
}

interface ReliabilityTarget {
  id: string;                   // RT-####
  metricKey: MetricKey;
  scopeRef: string;             // "service:checkout-api" or "portfolio"
  currentValue: number;
  targetValue: number;
  dueAt: string;                // ISO
  owner: string;
  rationale: string;
  createdAt: string;
  state: "Proposed" | "Committed" | "Achieved" | "Missed";
}

interface ImprovementAction {
  id: string;                   // IA-####
  title: string;
  description: string;
  linkedMetricKey: MetricKey;
  linkedRef: string;            // outlier / runbook / worker
  owner: string;
  createdAt: string;
  state: "Proposed" | "In flight" | "Verified" | "Rejected";
  verifiedBenefit?: {
    hoursSaved: number;
    impactAvoidedUsd: number;
    verifiedAt: string;
    verifiedBy: string;
    sourceRecords: string[];
  };
}

interface ExportRecord {
  id: string;
  view: ViewKey;
  filters: FilterState;
  at: string;
  by: string;
  rowCount: number;
}

interface OperationsTaskLite {
  id: string;
  title: string;
  createdAt: string;
  source: string;
  linkedRef: string;
}

interface BenefitRealizationEntry {
  id: string;
  actionId: string;
  hoursSaved: number;
  impactAvoidedUsd: number;
  at: string;
  by: string;
  sourceRecords: string[];
}

/* --------------------------- Storage helpers ---------------------------- */

const SV_KEY   = "runops.analytics.savedviews.v1";
const RT_KEY   = "runops.analytics.targets.v1";
const IA_KEY   = "runops.analytics.actions.v1";
const EX_KEY   = "runops.analytics.exports.v1";
const OPS_KEY  = "runops.operations.tasks.v1";
const BEN_KEY  = "runops.benefits.realization.v1";

function readList<T>(k: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "[]"); return Array.isArray(v) ? (v as T[]) : []; }
  catch { return []; }
}
function writeList<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)); }

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;
const inDays = (d: number) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString(); };

/* --------------------------- Seed --------------------------------------- */

function seedMetrics(): Metric[] {
  return [
    { key: "slo_attainment", label: "SLO attainment", unit: "%", current: 99.2, previous: 99.4, delta: -0.2,
      betterWhen: "up", kind: "observed", quality: "complete",
      definition: "Weighted mean of per-SLO achieved% over 30d window across in-scope services.",
      sourceRecords: ["runops.reliability.slos.v1", "runops.telemetry_snapshots.v1"],
      assumptions: [],
      views: ["executive", "service-owner", "sre", "operations"] },
    { key: "budget_consumption", label: "Error budget consumed", unit: "%", current: 58, previous: 41, delta: 17,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "Sum(budget spent) / Sum(budget allocated) across in-scope SLOs.",
      sourceRecords: ["runops.reliability.slos.v1", "runops.incidents.v1"],
      assumptions: [],
      views: ["executive", "service-owner", "sre"] },
    { key: "detect_min", label: "Detection time", unit: "min", current: 3.4, previous: 4.8, delta: -1.4,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "Median minutes from first symptom telemetry to declared incident.",
      sourceRecords: ["runops.incidents.v1", "runops.alerts.v1"],
      assumptions: [],
      views: ["executive", "sre", "operations"] },
    { key: "engage_min", label: "Engagement time", unit: "min", current: 2.1, previous: 2.6, delta: -0.5,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "Median minutes from incident declared to first responder acknowledgement.",
      sourceRecords: ["runops.incidents.v1", "runops.incident_events.v1"],
      assumptions: [],
      views: ["operations", "sre"] },
    { key: "mitigate_min", label: "Mitigation time", unit: "min", current: 18, previous: 27, delta: -9,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "Median minutes from engagement to customer-visible mitigation.",
      sourceRecords: ["runops.incidents.v1"],
      assumptions: [],
      views: ["executive", "operations", "sre"] },
    { key: "recover_min", label: "Recovery time", unit: "min", current: 41, previous: 58, delta: -17,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "Median minutes from engagement to recovery validation pass.",
      sourceRecords: ["runops.incidents.v1", "runops.evidence_items.v1"],
      assumptions: [],
      views: ["executive", "sre", "customer"] },
    { key: "recurrence_pct", label: "Incident recurrence", unit: "%", current: 12, previous: 18, delta: -6,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "% of incidents in period whose root cause matches a closed incident in prior 90d.",
      sourceRecords: ["runops.incidents.v1", "runops.postmortems.v1"],
      assumptions: [],
      views: ["executive", "service-owner", "sre"] },
    { key: "change_fail_pct", label: "Change failure rate", unit: "%", current: 4.8, previous: 6.9, delta: -2.1,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "Changes marked failed / total changes with outcome recorded, per period.",
      sourceRecords: ["runops.changes.v1"],
      assumptions: [],
      views: ["executive", "service-owner"] },
    { key: "runbook_success_pct", label: "Runbook success", unit: "%", current: 92, previous: 88, delta: 4,
      betterWhen: "up", kind: "observed", quality: "complete",
      definition: "Executions ending in Success / total executions in period.",
      sourceRecords: ["runops.executions.v1"],
      assumptions: [],
      views: ["executive", "operations", "automation"] },
    { key: "exec_duration_min", label: "Execution duration", unit: "min", current: 14.2, previous: 16.9, delta: -2.7,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "Median minutes from execution start to terminal state.",
      sourceRecords: ["runops.executions.v1", "runops.step_executions.v1"],
      assumptions: [],
      views: ["operations", "automation"] },
    { key: "automation_coverage_pct", label: "Automation coverage", unit: "%", current: 61, previous: 54, delta: 7,
      betterWhen: "up", kind: "observed", quality: "complete",
      definition: "Automated steps / total steps executed across recovery-class runbooks.",
      sourceRecords: ["runops.step_executions.v1"],
      assumptions: [],
      views: ["executive", "automation"] },
    { key: "human_intervention_pct", label: "Human intervention", unit: "%", current: 22, previous: 31, delta: -9,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "Executions with ≥1 manual override / total executions.",
      sourceRecords: ["runops.step_executions.v1", "runops.audit_events.v1"],
      assumptions: [],
      views: ["operations", "automation"] },
    { key: "rollback_pct", label: "Rollback rate", unit: "%", current: 3.1, previous: 4.4, delta: -1.3,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "Executions ending in rollback / total executions.",
      sourceRecords: ["runops.executions.v1"],
      assumptions: [],
      views: ["automation", "sre"] },
    { key: "toil_hours_saved", label: "Toil eliminated (est.)", unit: "hrs", current: 412, previous: 268, delta: 144,
      betterWhen: "up", kind: "estimated", confidenceLow: 340, confidenceHigh: 484, quality: "estimate-only",
      definition: "Σ(baseline_manual_minutes − actual_execution_minutes) for automated runs, converted to hours.",
      sourceRecords: ["runops.executions.v1", "runops.runbooks.v1"],
      assumptions: [
        "Baseline manual minutes captured at runbook v1 for each runbook are treated as constant.",
        "Only Success + PartialSuccess executions counted; failed automations do not credit savings.",
        "Does not attribute savings to any single team beyond runbook.ownerTeam.",
      ],
      views: ["executive", "automation"] },
    { key: "worker_accept_pct", label: "Worker recommendation acceptance", unit: "%", current: 71, previous: 62, delta: 9,
      betterWhen: "up", kind: "observed", quality: "complete",
      definition: "Accepted recommendations / total recommendations surfaced (worker + Ask NOVA).",
      sourceRecords: ["runops.worker_events.v1", "runops.audit_events.v1"],
      assumptions: [],
      views: ["worker", "sre"] },
    { key: "confidence_calibration", label: "Confidence calibration", unit: "score", current: 0.86, previous: 0.79, delta: 0.07,
      betterWhen: "up", kind: "observed", quality: "complete",
      definition: "1 − mean |predicted_confidence − observed_success_rate| across recommendation buckets.",
      sourceRecords: ["runops.worker_evaluations.v1"],
      assumptions: [],
      views: ["worker", "sre"] },
    { key: "cost_per_execution", label: "Cost per execution", unit: "$", current: 3.42, previous: 3.98, delta: -0.56,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "(Σ compute + connector calls + model tokens) / execution count, per period.",
      sourceRecords: ["runops.executions.v1", "runops.step_executions.v1"],
      assumptions: [],
      views: ["automation", "executive"] },
    { key: "model_cost_month", label: "Model cost / month", unit: "$", current: 8420, previous: 7180, delta: 1240,
      betterWhen: "down", kind: "observed", quality: "complete",
      definition: "Σ AI Gateway invoice line-items for the tenant, month to date.",
      sourceRecords: ["ai_gateway.usage"],
      assumptions: [],
      views: ["executive", "automation", "worker"] },
    { key: "hours_saved", label: "Hours saved (verified)", unit: "hrs", current: 186, previous: 118, delta: 68,
      betterWhen: "up", kind: "observed", quality: "complete",
      definition: "Σ verified benefits on improvement actions in period. Excludes unverified estimates.",
      sourceRecords: ["runops.benefits.realization.v1"],
      assumptions: [],
      views: ["executive", "automation"] },
    { key: "impact_avoided_usd", label: "Impact avoided (est.)", unit: "$", current: 214000, previous: 138000, delta: 76000,
      betterWhen: "up", kind: "estimated", confidenceLow: 164000, confidenceHigh: 271000, quality: "estimate-only",
      definition: "Σ(pre-fix incident $/hr × mitigation_delta_hrs) attributed to landed reliability actions.",
      sourceRecords: ["runops.incidents.v1", "runops.postmortems.v1", "runops.corrective_actions.v1"],
      assumptions: [
        "Pre-fix $/hr sourced from postmortem business impact — self-reported.",
        "Mitigation delta measured against same-service P50 over the trailing 90d before landing.",
        "Correlation, not causation: no time-series causal test is performed.",
      ],
      views: ["executive", "customer"] },
    { key: "readiness_improvement", label: "Readiness improvement", unit: "score", current: 0.14, previous: 0.06, delta: 0.08,
      betterWhen: "up", kind: "observed", quality: "complete",
      definition: "Δ Service readiness composite score vs baseline period, mean across services.",
      sourceRecords: ["runops.services.v1", "runops.evidence_items.v1"],
      assumptions: [],
      views: ["executive", "service-owner"] },
  ];
}

function seedOutliers(): Outlier[] {
  return [
    { id: "OUT-2001", metricKey: "runbook_success_pct", entityRef: "RB-0088", entityKind: "runbook",
      observed: 61, expected: 92, delta: -31,
      causeHint: "Step 4 (drain node) times out on kernel 6.11.x — introduced 12d ago.",
      sourceRecords: ["runops.executions.v1#RB-0088", "runops.step_executions.v1"] },
    { id: "OUT-2002", metricKey: "recurrence_pct", entityRef: "checkout-api", entityKind: "service",
      observed: 28, expected: 12, delta: 16,
      causeHint: "Two closed-out payment gateway incidents recurred in trailing 30d with same signature.",
      sourceRecords: ["INC-10812", "INC-10841", "PM-10812"] },
    { id: "OUT-2003", metricKey: "worker_accept_pct", entityRef: "DW-Diagnostic", entityKind: "worker",
      observed: 44, expected: 71, delta: -27,
      causeHint: "Confidence calibration drifted after connector v2 rollout; false-positive rate up 3.1×.",
      sourceRecords: ["runops.worker_evaluations.v1#DW-Diagnostic"] },
    { id: "OUT-2004", metricKey: "recover_min", entityRef: "INC-10841", entityKind: "incident",
      observed: 118, expected: 41, delta: 77,
      causeHint: "Recovery validation stalled 74m waiting for stakeholder communications approval.",
      sourceRecords: ["INC-10841", "runops.communications.v1#INC-10841"] },
  ];
}

function seedTargets(): ReliabilityTarget[] {
  return [
    { id: "RT-1001", metricKey: "recover_min", scopeRef: "service:checkout-api",
      currentValue: 41, targetValue: 25, dueAt: inDays(60), owner: "sre-lead@contoso",
      rationale: "Post-INC-10812 corrective action bundle projected to land ≤25m MTTR.",
      createdAt: nowIso(), state: "Committed" },
    { id: "RT-1002", metricKey: "automation_coverage_pct", scopeRef: "portfolio",
      currentValue: 61, targetValue: 75, dueAt: inDays(120), owner: "platform-eng@contoso",
      rationale: "Tier-1 recovery runbooks fully automated by end of quarter.",
      createdAt: nowIso(), state: "Committed" },
  ];
}

function seedActions(): ImprovementAction[] {
  return [
    { id: "IA-3001", title: "Replace drain step in RB-0088 with cordon-and-evict",
      description: "Kernel-agnostic drain implementation with structured pre-check gates.",
      linkedMetricKey: "runbook_success_pct", linkedRef: "RB-0088",
      owner: "platform-eng@contoso", createdAt: inDays(-6), state: "In flight" },
    { id: "IA-3002", title: "Recalibrate DW-Diagnostic confidence",
      description: "Retrain evaluator on post-v2 connector traces; add drift alarm.",
      linkedMetricKey: "worker_accept_pct", linkedRef: "DW-Diagnostic",
      owner: "worker-ops@contoso", createdAt: inDays(-14), state: "Verified",
      verifiedBenefit: {
        hoursSaved: 42, impactAvoidedUsd: 18000, verifiedAt: inDays(-1),
        verifiedBy: "sre-lead@contoso",
        sourceRecords: ["runops.worker_evaluations.v1#DW-Diagnostic", "AR-2205"],
      } },
  ];
}

function ensureSeed<T>(key: string, seed: () => T[]): T[] {
  const raw = localStorage.getItem(key);
  if (raw !== null) { try { const v = JSON.parse(raw); if (Array.isArray(v)) return v as T[]; } catch { /* fall through */ } }
  const s = seed(); writeList(key, s); return s;
}

/* --------------------------- Helpers ------------------------------------ */

function pct(n: number) { return `${n.toFixed(n < 10 ? 2 : 1)}%`; }
function money(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(2)}`; }

function formatMetric(m: Metric): string {
  if (m.unit === "%") return pct(m.current);
  if (m.unit === "$") return money(m.current);
  if (m.unit === "hrs") return `${m.current.toFixed(0)} hrs`;
  if (m.unit === "min") return `${m.current.toFixed(m.current < 10 ? 1 : 0)} min`;
  if (m.unit === "score") return m.current.toFixed(2);
  return String(m.current);
}

function formatDelta(m: Metric): string {
  const sign = m.delta > 0 ? "+" : "";
  if (m.unit === "%") return `${sign}${m.delta.toFixed(1)}pp`;
  if (m.unit === "$") return `${sign}${money(Math.abs(m.delta))}`.replace("$-", "-$");
  if (m.unit === "hrs") return `${sign}${m.delta.toFixed(0)} hrs`;
  if (m.unit === "min") return `${sign}${m.delta.toFixed(1)} min`;
  if (m.unit === "score") return `${sign}${m.delta.toFixed(2)}`;
  return `${sign}${m.delta}`;
}

function isImproving(m: Metric): boolean {
  if (m.betterWhen === "up") return m.delta >= 0;
  return m.delta <= 0;
}

function qualityLabel(q: DataQuality): { label: string; tone: "ok" | "warn" | "muted" } {
  switch (q) {
    case "complete": return { label: "Complete data", tone: "ok" };
    case "partial": return { label: "Partial data", tone: "warn" };
    case "estimate-only": return { label: "Estimate only", tone: "warn" };
    case "no-baseline": return { label: "No baseline", tone: "muted" };
    case "stale": return { label: "Stale analytics", tone: "warn" };
    case "permission-limited": return { label: "Permission limited", tone: "muted" };
  }
}

/* --------------------------- Component ---------------------------------- */

const DEFAULT_FILTERS: FilterState = {
  serviceId: "all", teamId: "all", technology: "all",
  runbookId: "all", workerId: "all", environment: "all",
  timeRange: "30d", compareTo: "prev-period",
};

const VIEW_LABELS: Record<ViewKey, string> = {
  executive: "Executive",
  "service-owner": "Service Owner",
  sre: "SRE",
  operations: "Operations",
  automation: "Automation",
  worker: "Digital Worker",
  customer: "Customer",
};

const SERVICE_OPTS = [
  { id: "all", label: "All services" },
  { id: "checkout-api", label: "checkout-api" },
  { id: "orders-api", label: "orders-api" },
  { id: "payments-api", label: "payments-api" },
];
const TEAM_OPTS = [
  { id: "all", label: "All teams" },
  { id: "sre", label: "SRE" },
  { id: "platform-eng", label: "Platform Engineering" },
  { id: "payments", label: "Payments Team" },
];
const TECH_OPTS = [
  { id: "all", label: "All technologies" },
  { id: "kubernetes", label: "Kubernetes" },
  { id: "kafka", label: "Kafka" },
  { id: "postgres", label: "Postgres" },
];
const RUNBOOK_OPTS = [
  { id: "all", label: "All runbooks" },
  { id: "RB-0042", label: "RB-0042 · Recover checkout" },
  { id: "RB-0044", label: "RB-0044 · Drain latency" },
  { id: "RB-0088", label: "RB-0088 · Rolling restart" },
];
const WORKER_OPTS = [
  { id: "all", label: "All workers" },
  { id: "DW-Diagnostic", label: "DW-Diagnostic" },
  { id: "DW-Recovery", label: "DW-Recovery" },
  { id: "DW-Comms", label: "DW-Comms" },
];
const ENV_OPTS = [
  { id: "all", label: "All environments" },
  { id: "prod", label: "prod" },
  { id: "staging", label: "staging" },
  { id: "dev", label: "dev" },
];

export default function ReliabilityValueAnalytics() {
  const navigate = useNavigate();
  const ops = useOperations();

  const [view, setView] = useState<ViewKey>("executive");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [outliers, setOutliers] = useState<Outlier[]>([]);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [targets, setTargets] = useState<ReliabilityTarget[]>([]);
  const [actions, setActions] = useState<ImprovementAction[]>([]);
  const [exports, setExports] = useState<ExportRecord[]>([]);

  const [inspect, setInspect] = useState<Metric | null>(null);
  const [outlierPreview, setOutlierPreview] = useState<Outlier | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [targetOpen, setTargetOpen] = useState(false);
  const [targetDraft, setTargetDraft] = useState<{ metricKey: MetricKey; targetValue: string; dueDays: string; owner: string; rationale: string }>({
    metricKey: "recover_min", targetValue: "", dueDays: "60", owner: "", rationale: "",
  });
  const [actionOpen, setActionOpen] = useState(false);
  const [actionDraft, setActionDraft] = useState<{ title: string; description: string; metricKey: MetricKey; linkedRef: string; owner: string }>({
    title: "", description: "", metricKey: "recover_min", linkedRef: "", owner: "",
  });
  const [verifyOpen, setVerifyOpen] = useState<ImprovementAction | null>(null);
  const [verifyDraft, setVerifyDraft] = useState({ hoursSaved: "", impactUsd: "", source: "" });

  /* boot */
  useEffect(() => {
    setMetrics(seedMetrics());
    setOutliers(seedOutliers());
    setSavedViews(readList<SavedView>(SV_KEY));
    setTargets(ensureSeed<ReliabilityTarget>(RT_KEY, seedTargets));
    setActions(ensureSeed<ImprovementAction>(IA_KEY, seedActions));
    setExports(readList<ExportRecord>(EX_KEY));
  }, []);

  const roleLabel = ops.role ?? "viewer";
  const canWrite = !(roleLabel === "Read Only User" || roleLabel === "Auditor");

  const audit = useCallback((action: string, target: string, detail?: string) => {
    ops.appendAudit({ at: nowIso(), actor: roleLabel, action, target, detail });
  }, [ops, roleLabel]);

  const visibleMetrics = useMemo(
    () => metrics.filter((m) => m.views.includes(view)),
    [metrics, view],
  );

  const visibleOutliers = useMemo(
    () => outliers.filter((o) => {
      if (filters.serviceId !== "all" && o.entityKind === "service" && o.entityRef !== filters.serviceId) return false;
      if (filters.runbookId !== "all" && o.entityKind === "runbook" && o.entityRef !== filters.runbookId) return false;
      if (filters.workerId !== "all" && o.entityKind === "worker" && o.entityRef !== filters.workerId) return false;
      return true;
    }),
    [outliers, filters],
  );

  /* actions */

  const saveView = useCallback(() => {
    if (!saveName.trim()) return;
    const sv: SavedView = {
      id: rid("SV"), name: saveName.trim(), view, filters,
      createdAt: nowIso(), createdBy: roleLabel,
    };
    const next = [sv, ...savedViews];
    setSavedViews(next); writeList(SV_KEY, next);
    audit("analytics.view.saved", sv.id, sv.name);
    ops.pushNotification({ kind: "info", title: "Saved view", detail: `“${sv.name}” saved.`, entityRef: sv.id, route: "/runops/analytics" });
    setSaveOpen(false); setSaveName("");
  }, [saveName, view, filters, savedViews, ops, roleLabel, audit]);

  const applySavedView = useCallback((sv: SavedView) => {
    setView(sv.view); setFilters(sv.filters);
    audit("analytics.view.applied", sv.id);
  }, [audit]);

  const exportReport = useCallback(() => {
    const rec: ExportRecord = {
      id: rid("EX"), view, filters, at: nowIso(),
      by: roleLabel, rowCount: visibleMetrics.length + visibleOutliers.length,
    };
    const next = [rec, ...exports].slice(0, 40);
    setExports(next); writeList(EX_KEY, next);
    audit("analytics.report.exported", rec.id, `${VIEW_LABELS[view]} · ${rec.rowCount} rows`);
    ops.pushNotification({ kind: "info", title: "Report exported", detail: `${VIEW_LABELS[view]} view · ${rec.rowCount} rows.`, entityRef: rec.id, route: "/runops/analytics" });
  }, [view, filters, visibleMetrics.length, visibleOutliers.length, exports, ops, roleLabel, audit]);

  const createTarget = useCallback(() => {
    const targetValue = Number(targetDraft.targetValue);
    const dueDays = Number(targetDraft.dueDays);
    if (!Number.isFinite(targetValue) || !Number.isFinite(dueDays)) return;
    const m = metrics.find((x) => x.key === targetDraft.metricKey);
    if (!m) return;
    const rt: ReliabilityTarget = {
      id: rid("RT"), metricKey: targetDraft.metricKey,
      scopeRef: filters.serviceId === "all" ? "portfolio" : `service:${filters.serviceId}`,
      currentValue: m.current, targetValue, dueAt: inDays(dueDays),
      owner: targetDraft.owner || roleLabel,
      rationale: targetDraft.rationale, createdAt: nowIso(), state: "Proposed",
    };
    const next = [rt, ...targets]; setTargets(next); writeList(RT_KEY, next);

    // Cross-screen: also create an operations task
    const tasks = readList<OperationsTaskLite>(OPS_KEY);
    const task: OperationsTaskLite = {
      id: rid("OT"), title: `Reliability target: ${m.label} → ${targetValue}${m.unit}`,
      createdAt: nowIso(), source: "analytics", linkedRef: rt.id,
    };
    writeList(OPS_KEY, [task, ...tasks].slice(0, 500));

    audit("analytics.target.created", rt.id, `${m.label} → ${targetValue}${m.unit}`);
    ops.pushNotification({ kind: "info", title: "Reliability target proposed", detail: `${m.label} → ${targetValue}${m.unit}. Ops task created.`, entityRef: rt.id, route: "/runops/analytics" });
    setTargetOpen(false);
    setTargetDraft({ metricKey: "recover_min", targetValue: "", dueDays: "60", owner: "", rationale: "" });
  }, [targetDraft, filters, metrics, targets, ops, roleLabel, audit]);

  const createAction = useCallback(() => {
    if (!actionDraft.title.trim()) return;
    const ia: ImprovementAction = {
      id: rid("IA"), title: actionDraft.title.trim(), description: actionDraft.description.trim(),
      linkedMetricKey: actionDraft.metricKey, linkedRef: actionDraft.linkedRef.trim() || "portfolio",
      owner: actionDraft.owner || roleLabel,
      createdAt: nowIso(), state: "Proposed",
    };
    const next = [ia, ...actions]; setActions(next); writeList(IA_KEY, next);
    audit("analytics.action.created", ia.id, ia.title);
    ops.pushNotification({ kind: "info", title: "Improvement action proposed", detail: ia.title, entityRef: ia.id, route: "/runops/analytics" });
    setActionOpen(false);
    setActionDraft({ title: "", description: "", metricKey: "recover_min", linkedRef: "", owner: "" });
  }, [actionDraft, actions, ops, roleLabel, audit]);

  const verifyAction = useCallback(() => {
    if (!verifyOpen) return;
    const hoursSaved = Number(verifyDraft.hoursSaved);
    const impactUsd = Number(verifyDraft.impactUsd);
    if (!Number.isFinite(hoursSaved) || !Number.isFinite(impactUsd)) return;
    const at = nowIso();
    const by = roleLabel;
    const updated: ImprovementAction = {
      ...verifyOpen, state: "Verified",
      verifiedBenefit: {
        hoursSaved, impactAvoidedUsd: impactUsd, verifiedAt: at, verifiedBy: by,
        sourceRecords: verifyDraft.source.split(",").map((s) => s.trim()).filter(Boolean),
      },
    };
    const next = actions.map((a) => (a.id === updated.id ? updated : a));
    setActions(next); writeList(IA_KEY, next);

    // Cross-screen: append to benefits realization
    const ben = readList<BenefitRealizationEntry>(BEN_KEY);
    const entry: BenefitRealizationEntry = {
      id: rid("BR"), actionId: updated.id,
      hoursSaved, impactAvoidedUsd: impactUsd, at, by,
      sourceRecords: updated.verifiedBenefit?.sourceRecords ?? [],
    };
    writeList(BEN_KEY, [entry, ...ben].slice(0, 500));

    audit("analytics.action.verified", updated.id, `${hoursSaved}h / $${impactUsd}`);
    ops.pushNotification({ kind: "info", title: "Benefit verified", detail: `${updated.title} — ${hoursSaved}h / $${impactUsd.toLocaleString()}`, entityRef: updated.id, route: "/runops/analytics" });
    setVerifyOpen(null); setVerifyDraft({ hoursSaved: "", impactUsd: "", source: "" });
  }, [verifyOpen, verifyDraft, actions, ops, roleLabel, audit]);

  /* -------- render ----------- */

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Analytics"
        title="Reliability & Value Analytics"
        subtitle="Quantify reliability outcomes, operational performance, automation value, and worker effectiveness — every metric traces to source records."
        status={{ label: `View: ${VIEW_LABELS[view]}`, tone: "info" }}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setSaveOpen(true)} disabled={!canWrite}>
              <Save className="h-4 w-4 mr-1.5" /> Save view
            </Button>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="h-4 w-4 mr-1.5" /> Export report
            </Button>
            <Button size="sm" onClick={() => setTargetOpen(true)} disabled={!canWrite}>
              <Target className="h-4 w-4 mr-1.5" /> Create target
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setActionOpen(true)} disabled={!canWrite}>
              <PlusCircle className="h-4 w-4 mr-1.5" /> Create action
            </Button>
          </div>
        }
      />

      {/* Filters + view switch */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <Tabs value={view} onValueChange={(v) => setView(v as ViewKey)}>
            <TabsList className="flex flex-wrap gap-1 h-auto">
              {(Object.keys(VIEW_LABELS) as ViewKey[]).map((v) => (
                <TabsTrigger key={v} value={v} aria-label={`Switch to ${VIEW_LABELS[v]} view`}>
                  {VIEW_LABELS[v]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <FilterSelect label="Service" value={filters.serviceId} options={SERVICE_OPTS}
              onChange={(v) => setFilters({ ...filters, serviceId: v })} />
            <FilterSelect label="Team" value={filters.teamId} options={TEAM_OPTS}
              onChange={(v) => setFilters({ ...filters, teamId: v })} />
            <FilterSelect label="Technology" value={filters.technology} options={TECH_OPTS}
              onChange={(v) => setFilters({ ...filters, technology: v })} />
            <FilterSelect label="Runbook" value={filters.runbookId} options={RUNBOOK_OPTS}
              onChange={(v) => setFilters({ ...filters, runbookId: v })} />
            <FilterSelect label="Worker" value={filters.workerId} options={WORKER_OPTS}
              onChange={(v) => setFilters({ ...filters, workerId: v })} />
            <FilterSelect label="Environment" value={filters.environment} options={ENV_OPTS}
              onChange={(v) => setFilters({ ...filters, environment: v })} />
            <FilterSelect label="Range" value={filters.timeRange}
              options={[{ id: "7d", label: "7 days" }, { id: "30d", label: "30 days" }, { id: "90d", label: "90 days" }]}
              onChange={(v) => setFilters({ ...filters, timeRange: v as FilterState["timeRange"] })} />
            <FilterSelect label="Compare" value={filters.compareTo}
              options={[{ id: "prev-period", label: "Prev. period" }, { id: "prev-year", label: "Prev. year" }, { id: "none", label: "None" }]}
              onChange={(v) => setFilters({ ...filters, compareTo: v as FilterState["compareTo"] })} />
          </div>

          {savedViews.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Saved views:
              {savedViews.slice(0, 6).map((sv) => (
                <button key={sv.id}
                  onClick={() => applySavedView(sv)}
                  className="rounded-md border border-border px-2 py-0.5 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label={`Apply saved view ${sv.name}`}
                >
                  {sv.name}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metric grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {visibleMetrics.map((m) => (
          <MetricCard key={m.key} metric={m} onInspect={() => setInspect(m)} />
        ))}
        {visibleMetrics.length === 0 && (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
            No metrics in the {VIEW_LABELS[view]} view for the current filters.
          </CardContent></Card>
        )}
      </div>

      {/* Outliers + targets + actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4 text-warning" /> Outliers</div>
              <Badge variant="outline">{visibleOutliers.length}</Badge>
            </div>
            {visibleOutliers.length === 0 && (
              <div className="text-sm text-muted-foreground">No outliers for current filters.</div>
            )}
            <ul className="space-y-2">
              {visibleOutliers.map((o) => {
                const m = metrics.find((x) => x.key === o.metricKey);
                return (
                  <li key={o.id} className="rounded-md border border-border p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="font-medium">{m?.label ?? o.metricKey} · {o.entityRef}</div>
                      <Badge variant="outline" className="text-xs">
                        {o.observed}{m?.unit === "%" ? "%" : ""} vs expected {o.expected}{m?.unit === "%" ? "%" : ""}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{o.causeHint}</div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => setOutlierPreview(o)}>
                        <FileSearch className="h-3.5 w-3.5 mr-1" /> Source
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        if (o.entityKind === "runbook") navigate(`/runops/runbooks/${o.entityRef}`);
                        else if (o.entityKind === "incident") navigate(`/runops/incidents/${o.entityRef}`);
                        else if (o.entityKind === "worker") navigate(`/runops/workers/${o.entityRef}/studio`);
                        else navigate(`/runops/services/${o.entityRef}`);
                      }}>
                        Open <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium"><Target className="h-4 w-4 text-primary" /> Reliability targets</div>
              <Badge variant="outline">{targets.length}</Badge>
            </div>
            {targets.length === 0 && <div className="text-sm text-muted-foreground">No targets committed yet.</div>}
            <ul className="space-y-2">
              {targets.slice(0, 6).map((t) => {
                const m = metrics.find((x) => x.key === t.metricKey);
                return (
                  <li key={t.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{m?.label ?? t.metricKey}</div>
                      <Badge variant={t.state === "Committed" ? "default" : "outline"}>{t.state}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.scopeRef} · {t.currentValue}{m?.unit} → {t.targetValue}{m?.unit} · due {new Date(t.dueAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Owner: {t.owner}</div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4 text-primary" /> Improvement actions</div>
            <Badge variant="outline">{actions.length}</Badge>
          </div>
          {actions.length === 0 && <div className="text-sm text-muted-foreground">No improvement actions yet.</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {actions.map((a) => {
              const m = metrics.find((x) => x.key === a.linkedMetricKey);
              return (
                <div key={a.id} className="rounded-md border border-border p-3 space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{a.title}</div>
                    <Badge variant={a.state === "Verified" ? "default" : a.state === "Rejected" ? "destructive" : "outline"}>{a.state}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Metric: {m?.label ?? a.linkedMetricKey} · Ref: {a.linkedRef} · Owner: {a.owner}
                  </div>
                  {a.description && <div className="text-xs">{a.description}</div>}
                  {a.verifiedBenefit && (
                    <div className="text-xs text-success flex items-center gap-1">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified: {a.verifiedBenefit.hoursSaved}h saved · ${a.verifiedBenefit.impactAvoidedUsd.toLocaleString()} impact avoided
                    </div>
                  )}
                  {a.state === "In flight" && canWrite && (
                    <div className="pt-1">
                      <Button size="sm" variant="outline" onClick={() => setVerifyOpen(a)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify benefit
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent exports */}
      {exports.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium"><ClipboardList className="h-4 w-4" /> Recent exports</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {exports.slice(0, 5).map((e) => (
                <li key={e.id}>
                  {new Date(e.at).toLocaleString()} · {VIEW_LABELS[e.view]} · {e.rowCount} rows · {e.by}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ------- Dialogs ------- */}

      <Dialog open={inspect !== null} onOpenChange={(o) => !o && setInspect(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{inspect?.label}</DialogTitle></DialogHeader>
          {inspect && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={inspect.kind === "observed" ? "default" : "outline"}>
                  {inspect.kind === "observed" ? "Observed" : "Estimated"}
                </Badge>
                <QualityBadge quality={inspect.quality} />
                <Badge variant="outline">
                  Current {formatMetric(inspect)} · {formatDelta(inspect)} vs prev
                </Badge>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Definition</div>
                <div className="text-sm">{inspect.definition}</div>
              </div>
              {inspect.kind === "estimated" && inspect.confidenceLow !== undefined && inspect.confidenceHigh !== undefined && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Confidence interval</div>
                  <div className="text-sm">
                    {inspect.confidenceLow.toLocaleString()} – {inspect.confidenceHigh.toLocaleString()} {inspect.unit}
                    <span className="text-xs text-muted-foreground ml-2">(bootstrap over source records; correlation, not causation)</span>
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs font-medium text-muted-foreground">Source records</div>
                <ul className="text-xs list-disc list-inside">
                  {inspect.sourceRecords.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
              {inspect.assumptions.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Assumptions</div>
                  <ul className="text-xs list-disc list-inside">
                    {inspect.assumptions.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInspect(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={outlierPreview !== null} onOpenChange={(o) => !o && setOutlierPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Outlier source</DialogTitle></DialogHeader>
          {outlierPreview && (
            <div className="space-y-2 text-sm">
              <div className="text-xs text-muted-foreground">Entity</div>
              <div>{outlierPreview.entityKind}: {outlierPreview.entityRef}</div>
              <div className="text-xs text-muted-foreground">Cause hint</div>
              <div>{outlierPreview.causeHint}</div>
              <div className="text-xs text-muted-foreground">Source records</div>
              <ul className="text-xs list-disc list-inside">
                {outlierPreview.sourceRecords.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutlierPreview(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Save current view</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-medium">Name</label>
            <Input value={saveName} onChange={(e) => setSaveName(e.target.value)}
              placeholder="Executive · Checkout · 30d"
              aria-label="Saved view name" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button onClick={saveView} disabled={!saveName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={targetOpen} onOpenChange={setTargetOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create reliability target</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Metric</label>
              <Select value={targetDraft.metricKey} onValueChange={(v) => setTargetDraft({ ...targetDraft, metricKey: v as MetricKey })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {metrics.map((m) => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Target value</label>
                <Input value={targetDraft.targetValue} onChange={(e) => setTargetDraft({ ...targetDraft, targetValue: e.target.value })} placeholder="25" />
              </div>
              <div>
                <label className="text-xs font-medium">Due in days</label>
                <Input value={targetDraft.dueDays} onChange={(e) => setTargetDraft({ ...targetDraft, dueDays: e.target.value })} placeholder="60" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Owner</label>
              <Input value={targetDraft.owner} onChange={(e) => setTargetDraft({ ...targetDraft, owner: e.target.value })} placeholder="sre-lead@contoso" />
            </div>
            <div>
              <label className="text-xs font-medium">Rationale</label>
              <Textarea value={targetDraft.rationale} onChange={(e) => setTargetDraft({ ...targetDraft, rationale: e.target.value })}
                placeholder="What underlying operational records support this target?" />
            </div>
            <div className="text-xs text-muted-foreground">
              Creates an operations task and appends a domain event so it appears on Operations and Governance views.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTargetOpen(false)}>Cancel</Button>
            <Button onClick={createTarget} disabled={!targetDraft.targetValue}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create improvement action</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Title</label>
              <Input value={actionDraft.title} onChange={(e) => setActionDraft({ ...actionDraft, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Description</label>
              <Textarea value={actionDraft.description} onChange={(e) => setActionDraft({ ...actionDraft, description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Linked metric</label>
              <Select value={actionDraft.metricKey} onValueChange={(v) => setActionDraft({ ...actionDraft, metricKey: v as MetricKey })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {metrics.map((m) => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Linked ref</label>
                <Input value={actionDraft.linkedRef} onChange={(e) => setActionDraft({ ...actionDraft, linkedRef: e.target.value })} placeholder="RB-0088 / INC-10841" />
              </div>
              <div>
                <label className="text-xs font-medium">Owner</label>
                <Input value={actionDraft.owner} onChange={(e) => setActionDraft({ ...actionDraft, owner: e.target.value })} placeholder="team@contoso" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionOpen(false)}>Cancel</Button>
            <Button onClick={createAction} disabled={!actionDraft.title.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={verifyOpen !== null} onOpenChange={(o) => !o && setVerifyOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Verify benefit</DialogTitle></DialogHeader>
          {verifyOpen && (
            <div className="space-y-3 text-sm">
              <div className="text-xs text-muted-foreground">Action</div>
              <div>{verifyOpen.title}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Hours saved</label>
                  <Input value={verifyDraft.hoursSaved} onChange={(e) => setVerifyDraft({ ...verifyDraft, hoursSaved: e.target.value })} placeholder="42" />
                </div>
                <div>
                  <label className="text-xs font-medium">Impact avoided ($)</label>
                  <Input value={verifyDraft.impactUsd} onChange={(e) => setVerifyDraft({ ...verifyDraft, impactUsd: e.target.value })} placeholder="18000" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Source records (comma-separated)</label>
                <Input value={verifyDraft.source} onChange={(e) => setVerifyDraft({ ...verifyDraft, source: e.target.value })}
                  placeholder="runops.worker_evaluations.v1#DW-Diagnostic, AR-2205" />
              </div>
              <div className="text-xs text-muted-foreground">
                Verified benefits append to Benefits Realization and are counted in the observed “Hours saved” metric.
                Estimated “Impact avoided” remains an estimate.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyOpen(null)}>Cancel</Button>
            <Button onClick={verifyAction}
              disabled={!Number.isFinite(Number(verifyDraft.hoursSaved)) || !Number.isFinite(Number(verifyDraft.impactUsd))}>
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------- Presentational ----------------------------- */

interface FilterSelectProps {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}
function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function MetricCard({ metric, onInspect }: { metric: Metric; onInspect: () => void }) {
  const improving = isImproving(metric);
  const Icon = metric.unit === "$" ? DollarSign : metric.unit === "hrs" ? Clock
    : metric.unit === "%" ? GaugeCircle : metric.unit === "min" ? Activity : LineChart;
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {metric.label}
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={metric.kind === "observed" ? "outline" : "secondary"} className="text-[10px]">
              {metric.kind === "observed" ? "Observed" : "Estimate"}
            </Badge>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-semibold tabular-nums">{formatMetric(metric)}</div>
          <div className={cn(
            "text-xs flex items-center gap-0.5 tabular-nums",
            improving ? "text-success" : "text-warning",
          )}>
            {improving ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {formatDelta(metric)}
          </div>
        </div>
        {metric.kind === "estimated" && metric.confidenceLow !== undefined && metric.confidenceHigh !== undefined && (
          <div className="text-[11px] text-muted-foreground">
            CI: {metric.confidenceLow.toLocaleString()}–{metric.confidenceHigh.toLocaleString()} {metric.unit}
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <QualityBadge quality={metric.quality} />
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onInspect}
            aria-label={`Inspect ${metric.label} calculation`}>
            <FileSearch className="h-3.5 w-3.5 mr-1" /> Definition
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QualityBadge({ quality }: { quality: DataQuality }) {
  const q = qualityLabel(quality);
  const cls =
    q.tone === "ok" ? "text-success" :
    q.tone === "warn" ? "text-warning" :
    "text-muted-foreground";
  return <span className={cn("text-[10px] uppercase tracking-wide flex items-center gap-1", cls)}>
    {quality === "permission-limited" ? <Ban className="h-3 w-3" />
      : quality === "stale" ? <Clock className="h-3 w-3" />
      : quality === "estimate-only" ? <ShieldAlert className="h-3 w-3" />
      : <CheckCircle2 className="h-3 w-3" />}
    {q.label}
  </span>;
}
