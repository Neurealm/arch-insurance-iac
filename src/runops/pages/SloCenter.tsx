/**
 * Page 38 · SLO & Error Budget Center
 * Route: /runops/reliability/slos
 *
 * Makes measurable service reliability a central operating control.
 * Portfolio summary + per-service SLI/SLO editor, error-budget state,
 * multi-window burn rates, forecast, breach history, release/automation
 * policy, linked runbooks, reliability investments.
 *
 * Distinguishes SLO (internal objective) from SLA (contractual). Target
 * changes never rewrite history — historical periods keep their prior
 * target and computed budget.
 *
 * Persistence (localStorage):
 *   runops.reliability.slis.v1         → SLI[]
 *   runops.reliability.slos.v1         → SLO[]
 *   runops.reliability.budgetpolicy.v1 → BudgetPolicy[]
 *   runops.reliability.breaches.v1     → Breach[]
 *   runops.reliability.investments.v1  → Investment[]
 *   runops.reliability.approvals.v1    → ApprovalRequest[]
 *   runops.alerts.v1                   → cross-screen burn-alert append
 *   runops.governance.policies.v1      → cross-screen release policy append
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowUpRight, BadgeCheck, BellRing, Ban,
  CheckCircle2, ClipboardList, Clock, ExternalLink, FileSearch, Flame,
  GaugeCircle, GitCompare, LinkIcon, PlusCircle, ShieldAlert, ShieldCheck,
  Sparkles, Target, Timer, TrendingDown, TrendingUp,
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

type SliKind = "availability" | "latency" | "correctness" | "throughput" | "freshness";
type SloState = "Within budget" | "Fast burn" | "Budget exhausted" | "Missing telemetry" | "Draft" | "Approval pending";

interface SLI {
  id: string;               // SLI-####
  serviceId: string;
  name: string;
  kind: SliKind;
  goodEventQuery: string;   // source telemetry, e.g., "http_requests{code!~'5..'}"
  validEventQuery: string;  // "http_requests"
  unit: string;             // e.g., "%", "ms"
  source: string;           // e.g., "Datadog", "Prometheus"
  hasTelemetry: boolean;
  createdAt: string;
}

interface BurnWindow {
  windowLabel: string;      // "1h", "6h", "24h", "72h"
  windowHours: number;
  burnRate: number;         // 0..∞ (1.0 = spending budget at nominal rate)
  threshold: number;        // alert threshold
}

interface HistoricalPeriod {
  periodStart: string;      // ISO date
  periodEnd: string;
  targetAtTime: number;     // frozen; never rewritten
  achieved: number;
  budgetConsumedPct: number;
}

interface SLO {
  id: string;                // SLO-####
  sliId: string;
  serviceId: string;
  title: string;
  targetPct: number;         // e.g., 99.95
  targetLatencyMs?: number;  // for latency SLOs
  windowDays: number;        // rolling window
  isSlA: false;              // SLO not SLA (distinction encoded)
  currentAchievedPct: number;
  currentIncidentBurnPct: number;    // portion of budget consumed by incidents
  burnWindows: BurnWindow[];
  forecastExhaustionAt: string | null; // ISO or null
  state: SloState;
  linkedRunbookIds: string[];
  budgetPolicyId: string | null;
  history: HistoricalPeriod[];
  draftTarget: number | null;         // pending change
  approvalPending: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BudgetPolicy {
  id: string;               // POL-####
  name: string;
  freezeChangesAtBurnRate: number;    // e.g., 6.0
  requireApprovalAtBudgetPct: number; // e.g., 25 (remaining budget %)
  disableAutonomyAtBudgetPct: number; // e.g., 10
  attachedSloIds: string[];
}

interface Breach {
  id: string;               // BR-####
  sloId: string;
  detectedAt: string;
  window: string;
  burnRate: number;
  cause: string;
  linkedIncidentId: string | null;
  resolved: boolean;
}

interface Investment {
  id: string;               // INV-####
  sloId: string;
  title: string;
  description: string;
  estimatedBudgetReturnPct: number;   // predicted % of budget preserved
  confidence: number;                 // 0..1
  sourceRecords: string[];
  assumptions: string[];
  status: "Proposed" | "Approved" | "In flight" | "Landed" | "Rejected";
  createdAt: string;
}

interface ApprovalRequest {
  id: string;               // APR-####
  sloId: string;
  requestedTargetPct: number;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  state: "Pending" | "Approved" | "Denied";
}

/* --------------------------- Storage helpers ---------------------------- */

const SLI_KEY  = "runops.reliability.slis.v1";
const SLO_KEY  = "runops.reliability.slos.v1";
const POL_KEY  = "runops.reliability.budgetpolicy.v1";
const BR_KEY   = "runops.reliability.breaches.v1";
const INV_KEY  = "runops.reliability.investments.v1";
const APR_KEY  = "runops.reliability.approvals.v1";
const ALERTS_KEY = "runops.alerts.v1";
const GOV_KEY  = "runops.governance.policies.v1";

function readList<T>(k: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "[]"); return Array.isArray(v) ? (v as T[]) : []; }
  catch { return []; }
}
function writeList<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)); }

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;
const inDays = (d: number): string => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString(); };

/* --------------------------- Seed --------------------------------------- */

function seedSlis(): SLI[] {
  const now = nowIso();
  return [
    { id: "SLI-6001", serviceId: "checkout-api", name: "Checkout HTTP success", kind: "availability",
      goodEventQuery: "sum(rate(http_requests_total{service='checkout-api',code!~'5..'}[5m]))",
      validEventQuery: "sum(rate(http_requests_total{service='checkout-api'}[5m]))",
      unit: "%", source: "Prometheus", hasTelemetry: true, createdAt: now },
    { id: "SLI-6002", serviceId: "checkout-api", name: "Checkout p95 latency", kind: "latency",
      goodEventQuery: "histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket{service='checkout-api'}[5m]))) < 0.4",
      validEventQuery: "count(http_request_duration_seconds_count{service='checkout-api'})",
      unit: "ms", source: "Prometheus", hasTelemetry: true, createdAt: now },
    { id: "SLI-6003", serviceId: "checkout-api", name: "Transaction correctness", kind: "correctness",
      goodEventQuery: "sum(rate(order_events_total{outcome='committed'}[5m]))",
      validEventQuery: "sum(rate(order_events_total[5m]))",
      unit: "%", source: "Kafka + audit", hasTelemetry: true, createdAt: now },
    { id: "SLI-6004", serviceId: "orders-api", name: "Orders availability", kind: "availability",
      goodEventQuery: "sum(rate(http_requests_total{service='orders-api',code!~'5..'}[5m]))",
      validEventQuery: "sum(rate(http_requests_total{service='orders-api'}[5m]))",
      unit: "%", source: "Prometheus", hasTelemetry: true, createdAt: now },
    { id: "SLI-6005", serviceId: "payments-api", name: "Payments freshness", kind: "freshness",
      goodEventQuery: "settled_within_seconds{svc='payments'} <= 60",
      validEventQuery: "count(settled_within_seconds)",
      unit: "s", source: "Payments ledger", hasTelemetry: false, createdAt: now },
  ];
}

function seedSlos(): SLO[] {
  const now = nowIso();
  const hist = (target: number, achieved: number, start: number, end: number, consumed: number): HistoricalPeriod => ({
    periodStart: inDays(start), periodEnd: inDays(end), targetAtTime: target, achieved, budgetConsumedPct: consumed,
  });
  const slo = (r: Partial<SLO> & Pick<SLO, "id" | "sliId" | "serviceId" | "title" | "targetPct" | "windowDays" | "currentAchievedPct" | "currentIncidentBurnPct" | "state">): SLO => ({
    isSlA: false,
    targetLatencyMs: undefined,
    burnWindows: [],
    forecastExhaustionAt: null,
    linkedRunbookIds: [],
    budgetPolicyId: null,
    history: [],
    draftTarget: null,
    approvalPending: false,
    createdAt: now, updatedAt: now,
    ...r,
  });

  return [
    slo({
      id: "SLO-9001", sliId: "SLI-6001", serviceId: "checkout-api",
      title: "Checkout availability 99.95%",
      targetPct: 99.95, windowDays: 30,
      currentAchievedPct: 99.92,
      currentIncidentBurnPct: 68, // 68% of budget consumed
      burnWindows: [
        { windowLabel: "1h",  windowHours: 1,  burnRate: 8.4, threshold: 14.4 },
        { windowLabel: "6h",  windowHours: 6,  burnRate: 4.1, threshold: 6.0 },
        { windowLabel: "24h", windowHours: 24, burnRate: 1.6, threshold: 3.0 },
        { windowLabel: "72h", windowHours: 72, burnRate: 0.9, threshold: 1.0 },
      ],
      forecastExhaustionAt: inDays(6),
      state: "Fast burn",
      linkedRunbookIds: ["RB-0042"],
      budgetPolicyId: "POL-4001",
      history: [
        hist(99.9,  99.94, -90, -60, 22),
        hist(99.9,  99.91, -60, -30, 41),
        hist(99.95, 99.92, -30, 0,   68),
      ],
    }),
    slo({
      id: "SLO-9002", sliId: "SLI-6002", serviceId: "checkout-api",
      title: "Checkout p95 latency < 400ms",
      targetPct: 99.0, windowDays: 30, targetLatencyMs: 400,
      currentAchievedPct: 98.7, currentIncidentBurnPct: 44,
      burnWindows: [
        { windowLabel: "1h",  windowHours: 1,  burnRate: 2.1, threshold: 14.4 },
        { windowLabel: "6h",  windowHours: 6,  burnRate: 1.6, threshold: 6.0 },
        { windowLabel: "24h", windowHours: 24, burnRate: 1.1, threshold: 3.0 },
        { windowLabel: "72h", windowHours: 72, burnRate: 0.7, threshold: 1.0 },
      ],
      forecastExhaustionAt: inDays(14),
      state: "Within budget",
      linkedRunbookIds: ["RB-0044"],
      budgetPolicyId: "POL-4001",
      history: [
        hist(99.0, 99.1, -90, -60, 15),
        hist(99.0, 98.8, -60, -30, 33),
        hist(99.0, 98.7, -30, 0,   44),
      ],
    }),
    slo({
      id: "SLO-9003", sliId: "SLI-6003", serviceId: "checkout-api",
      title: "Transaction correctness 99.99%",
      targetPct: 99.99, windowDays: 30,
      currentAchievedPct: 99.995, currentIncidentBurnPct: 8,
      burnWindows: [
        { windowLabel: "1h",  windowHours: 1,  burnRate: 0.2, threshold: 14.4 },
        { windowLabel: "6h",  windowHours: 6,  burnRate: 0.1, threshold: 6.0 },
        { windowLabel: "24h", windowHours: 24, burnRate: 0.05, threshold: 3.0 },
        { windowLabel: "72h", windowHours: 72, burnRate: 0.02, threshold: 1.0 },
      ],
      forecastExhaustionAt: null,
      state: "Within budget",
      linkedRunbookIds: [],
      budgetPolicyId: "POL-4001",
      history: [
        hist(99.99, 99.996, -90, -60, 4),
        hist(99.99, 99.994, -60, -30, 6),
        hist(99.99, 99.995, -30, 0,   8),
      ],
    }),
    slo({
      id: "SLO-9004", sliId: "SLI-6004", serviceId: "orders-api",
      title: "Orders availability 99.9%",
      targetPct: 99.9, windowDays: 30,
      currentAchievedPct: 99.6, currentIncidentBurnPct: 100,
      burnWindows: [
        { windowLabel: "1h",  windowHours: 1,  burnRate: 16.0, threshold: 14.4 },
        { windowLabel: "6h",  windowHours: 6,  burnRate: 9.2,  threshold: 6.0 },
        { windowLabel: "24h", windowHours: 24, burnRate: 4.6,  threshold: 3.0 },
        { windowLabel: "72h", windowHours: 72, burnRate: 2.1,  threshold: 1.0 },
      ],
      forecastExhaustionAt: inDays(-1),
      state: "Budget exhausted",
      linkedRunbookIds: ["RB-0037"],
      budgetPolicyId: "POL-4001",
      history: [
        hist(99.9, 99.92, -90, -60, 20),
        hist(99.9, 99.85, -60, -30, 55),
        hist(99.9, 99.6,  -30, 0,   100),
      ],
    }),
    slo({
      id: "SLO-9005", sliId: "SLI-6005", serviceId: "payments-api",
      title: "Payments freshness 99.5%",
      targetPct: 99.5, windowDays: 30,
      currentAchievedPct: 0, currentIncidentBurnPct: 0,
      burnWindows: [],
      forecastExhaustionAt: null,
      state: "Missing telemetry",
      linkedRunbookIds: [],
      budgetPolicyId: null,
      history: [],
    }),
  ];
}

function seedPolicies(): BudgetPolicy[] {
  return [
    {
      id: "POL-4001", name: "Standard change/automation policy",
      freezeChangesAtBurnRate: 6.0,
      requireApprovalAtBudgetPct: 25,
      disableAutonomyAtBudgetPct: 10,
      attachedSloIds: ["SLO-9001", "SLO-9002", "SLO-9003", "SLO-9004"],
    },
  ];
}

function seedBreaches(): Breach[] {
  return [
    { id: "BR-2201", sloId: "SLO-9001", detectedAt: inDays(-2), window: "6h", burnRate: 7.2, cause: "DB connection saturation (INC-10482)", linkedIncidentId: "INC-10482", resolved: false },
    { id: "BR-2202", sloId: "SLO-9004", detectedAt: inDays(-1), window: "1h", burnRate: 16.0, cause: "Regional failover regression", linkedIncidentId: "INC-10399", resolved: false },
    { id: "BR-2203", sloId: "SLO-9001", detectedAt: inDays(-14), window: "24h", burnRate: 3.1, cause: "Cache stampede", linkedIncidentId: "INC-10310", resolved: true },
  ];
}

function seedInvestments(): Investment[] {
  return [
    {
      id: "INV-5501", sloId: "SLO-9001",
      title: "Connection-pool autoscaler for checkout DB",
      description: "Automated pool right-sizing during peak windows.",
      estimatedBudgetReturnPct: 22, confidence: 0.78,
      sourceRecords: ["INC-10482", "INC-10399", "EXE-8841"],
      assumptions: [
        "Peak-window utilization estimated from 30-day metric window.",
        "Confidence reflects trailing calibration of similar interventions.",
      ],
      status: "Proposed", createdAt: nowIso(),
    },
  ];
}

/* --------------------------- Compute helpers ---------------------------- */

function budgetTotalPctForTarget(target: number): number {
  // 100% availability - target = allowed error budget in percentage points
  return Math.max(0, 100 - target);
}
function budgetRemainingPct(s: SLO): number {
  return Math.max(0, 100 - s.currentIncidentBurnPct);
}

function stateTone(s: SloState): string {
  switch (s) {
    case "Within budget":     return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Fast burn":         return "bg-amber-50 text-amber-800 border-amber-200";
    case "Budget exhausted":  return "bg-rose-50 text-rose-800 border-rose-200";
    case "Missing telemetry": return "bg-slate-100 text-slate-700 border-slate-300";
    case "Draft":             return "bg-slate-50 text-slate-800 border-slate-200";
    case "Approval pending":  return "bg-sky-50 text-sky-800 border-sky-200";
  }
}

/* -------------------------------- Page ---------------------------------- */

type TabKey = "portfolio" | "detail" | "history" | "policy" | "investments";
type DialogKey =
  | null
  | "sli"
  | "slo"
  | "edit-target"
  | "burn-alert"
  | "attach-policy"
  | "link-runbook"
  | "restrict-changes"
  | "investment"
  | "request-approval"
  | "compare"
  | "explain";

export default function SloCenter() {
  const ops = useOperations();
  const navigate = useNavigate();
  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [slis, setSlis] = useState<SLI[]>([]);
  const [slos, setSlos] = useState<SLO[]>([]);
  const [policies, setPolicies] = useState<BudgetPolicy[]>([]);
  const [breaches, setBreaches] = useState<Breach[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);

  const [tab, setTab] = useState<TabKey>("portfolio");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("checkout-api");
  const [selectedSloId, setSelectedSloId] = useState<string>("SLO-9001");
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [inp, setInp] = useState<Record<string, string>>({});
  const [connectorDown, setConnectorDown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      let a = readList<SLI>(SLI_KEY);        if (a.length === 0) { a = seedSlis(); writeList(SLI_KEY, a); } setSlis(a);
      let b = readList<SLO>(SLO_KEY);        if (b.length === 0) { b = seedSlos(); writeList(SLO_KEY, b); } setSlos(b);
      let p = readList<BudgetPolicy>(POL_KEY); if (p.length === 0) { p = seedPolicies(); writeList(POL_KEY, p); } setPolicies(p);
      let br = readList<Breach>(BR_KEY);     if (br.length === 0) { br = seedBreaches(); writeList(BR_KEY, br); } setBreaches(br);
      let iv = readList<Investment>(INV_KEY);if (iv.length === 0) { iv = seedInvestments(); writeList(INV_KEY, iv); } setInvestments(iv);
      setApprovals(readList<ApprovalRequest>(APR_KEY));
      setLoading(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load SLO center.");
      setLoading(false);
    }
  }, []);

  // Sync selectedService with operations context when it changes
  useEffect(() => {
    const svc = ops.selectedService?.id;
    if (svc) setSelectedServiceId(svc);
  }, [ops.selectedService]);

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info", entityRef?: string) => {
    ops.pushNotification({ kind, title, detail, entityRef: entityRef ?? "reliability.slos", route: "/runops/reliability/slos" });
  }, [ops]);

  const persistSlos = useCallback((next: SLO[]) => { writeList(SLO_KEY, next); setSlos(next); }, []);
  const persistSlis = useCallback((next: SLI[]) => { writeList(SLI_KEY, next); setSlis(next); }, []);
  const persistPolicies = useCallback((next: BudgetPolicy[]) => { writeList(POL_KEY, next); setPolicies(next); }, []);
  const persistInvestments = useCallback((next: Investment[]) => { writeList(INV_KEY, next); setInvestments(next); }, []);
  const persistApprovals = useCallback((next: ApprovalRequest[]) => { writeList(APR_KEY, next); setApprovals(next); }, []);

  const serviceSlos = useMemo(() => slos.filter((s) => s.serviceId === selectedServiceId), [slos, selectedServiceId]);
  const serviceSlis = useMemo(() => slis.filter((s) => s.serviceId === selectedServiceId), [slis, selectedServiceId]);
  const selectedSlo = useMemo(() => slos.find((s) => s.id === selectedSloId) ?? serviceSlos[0] ?? null, [slos, selectedSloId, serviceSlos]);
  const selectedSli = useMemo(() => selectedSlo ? slis.find((s) => s.id === selectedSlo.sliId) ?? null : null, [selectedSlo, slis]);

  const portfolio = useMemo(() => {
    const withinBudget = slos.filter((s) => s.state === "Within budget").length;
    const fastBurn = slos.filter((s) => s.state === "Fast burn").length;
    const exhausted = slos.filter((s) => s.state === "Budget exhausted").length;
    const missing = slos.filter((s) => s.state === "Missing telemetry").length;
    return { total: slos.length, withinBudget, fastBurn, exhausted, missing };
  }, [slos]);

  const services = useMemo(() => {
    const set = new Set<string>();
    slos.forEach((s) => set.add(s.serviceId));
    slis.forEach((s) => set.add(s.serviceId));
    return Array.from(set);
  }, [slos, slis]);

  /* ------------------------------ Actions ----------------------------- */

  const openDialog = (k: DialogKey) => { setInp({}); setDialog(k); };
  const closeDialog = () => { setDialog(null); setInp({}); };

  const doCreateSli = () => {
    if (!(inp.name ?? "").trim()) return;
    const s: SLI = {
      id: rid("SLI"), serviceId: selectedServiceId,
      name: inp.name, kind: (inp.kind as SliKind) || "availability",
      goodEventQuery: inp.good || "",
      validEventQuery: inp.valid || "",
      unit: inp.unit || "%", source: inp.source || "Prometheus",
      hasTelemetry: !!(inp.good ?? "").trim() && !!(inp.valid ?? "").trim(),
      createdAt: nowIso(),
    };
    persistSlis([s, ...slis]);
    audit("SLI created", `${s.id} · ${s.name} on ${s.serviceId}.`, "info", s.id);
    closeDialog();
  };

  const doCreateSlo = () => {
    if (!(inp.title ?? "").trim() || !inp.sliId) return;
    const target = Number(inp.target); if (!Number.isFinite(target)) return;
    const window = Number(inp.window) || 30;
    const s: SLO = {
      id: rid("SLO"), sliId: inp.sliId, serviceId: selectedServiceId,
      title: inp.title, targetPct: target, windowDays: window, isSlA: false,
      currentAchievedPct: 0, currentIncidentBurnPct: 0,
      burnWindows: [], forecastExhaustionAt: null,
      state: "Draft", linkedRunbookIds: [], budgetPolicyId: null,
      history: [], draftTarget: null, approvalPending: false,
      createdAt: nowIso(), updatedAt: nowIso(),
    };
    persistSlos([s, ...slos]);
    audit("SLO drafted", `${s.id} · ${s.title}. Draft — target changes never rewrite history.`, "info", s.id);
    closeDialog();
  };

  const doEditTarget = () => {
    if (!selectedSlo) return;
    const t = Number(inp.target); if (!Number.isFinite(t)) return;
    // Do NOT rewrite history; store as draft + approval request
    const request: ApprovalRequest = {
      id: rid("APR"), sloId: selectedSlo.id, requestedTargetPct: t,
      reason: inp.reason || "Target adjustment",
      requestedBy: ops.role, requestedAt: nowIso(), state: "Pending",
    };
    persistApprovals([request, ...approvals]);
    const next = slos.map((s) => s.id === selectedSlo.id ? { ...s, draftTarget: t, approvalPending: true, state: "Approval pending" as SloState, updatedAt: nowIso() } : s);
    persistSlos(next);
    audit("SLO target change requested", `${selectedSlo.id} → ${t}% (pending approval). History preserved.`, "warning", selectedSlo.id);
    closeDialog();
  };

  const doCreateBurnAlert = () => {
    if (!selectedSlo) return;
    const w = inp.window || "6h";
    const threshold = Number(inp.threshold) || 6.0;
    // Append to shared alerts store (cross-screen)
    const alerts = readList<{ id: string; source: string; sloId: string; window: string; threshold: number; createdAt: string; state: string }>(ALERTS_KEY);
    const alert = { id: rid("ALT"), source: "slo.burn", sloId: selectedSlo.id, window: w, threshold, createdAt: nowIso(), state: "armed" };
    alerts.unshift(alert);
    writeList(ALERTS_KEY, alerts);
    audit("Burn alert armed", `${alert.id} on ${selectedSlo.id} · ${w} · ${threshold}× threshold. Visible in Alert Triage.`, "info", selectedSlo.id);
    closeDialog();
  };

  const doAttachPolicy = () => {
    if (!selectedSlo || !inp.policyId) return;
    const p = policies.find((x) => x.id === inp.policyId);
    if (!p) return;
    const nextPols = policies.map((x) => x.id === p.id
      ? { ...x, attachedSloIds: Array.from(new Set([...x.attachedSloIds, selectedSlo.id])) }
      : x);
    persistPolicies(nextPols);
    persistSlos(slos.map((s) => s.id === selectedSlo.id ? { ...s, budgetPolicyId: p.id, updatedAt: nowIso() } : s));
    // Cross-screen: governance policies
    const gov = readList<{ id: string; sloId: string; policyId: string; at: string }>(GOV_KEY);
    gov.unshift({ id: rid("GOV"), sloId: selectedSlo.id, policyId: p.id, at: nowIso() });
    writeList(GOV_KEY, gov);
    audit("Budget policy attached", `${p.id} attached to ${selectedSlo.id}. Affects Launch Center + Governance.`, "info", selectedSlo.id);
    closeDialog();
  };

  const doLinkRunbook = () => {
    if (!selectedSlo || !(inp.runbookId ?? "").trim()) return;
    const rb = inp.runbookId;
    persistSlos(slos.map((s) => s.id === selectedSlo.id
      ? { ...s, linkedRunbookIds: Array.from(new Set([...s.linkedRunbookIds, rb])), updatedAt: nowIso() }
      : s));
    audit("Runbook linked", `${rb} linked to ${selectedSlo.id}.`, "info", selectedSlo.id);
    closeDialog();
  };

  const doRestrictChanges = () => {
    if (!selectedSlo) return;
    // Emit a governance restriction event; do not rewrite history.
    const gov = readList<{ id: string; sloId: string; kind: string; note: string; at: string }>(GOV_KEY);
    gov.unshift({ id: rid("GOV"), sloId: selectedSlo.id, kind: "change.freeze", note: inp.reason || "Change freeze while budget exhausted.", at: nowIso() });
    writeList(GOV_KEY, gov);
    audit("Change freeze issued", `Change freeze on ${selectedSlo.id}: ${inp.reason || "budget exhausted"}. Affects Launch Center.`, "critical", selectedSlo.id);
    closeDialog();
  };

  const doCreateInvestment = () => {
    if (!selectedSlo || !(inp.title ?? "").trim()) return;
    const conf = Number(inp.confidence) / 100;
    const iv: Investment = {
      id: rid("INV"), sloId: selectedSlo.id,
      title: inp.title, description: inp.description || "",
      estimatedBudgetReturnPct: Number(inp.ret) || 0,
      confidence: Number.isFinite(conf) ? Math.min(1, Math.max(0, conf)) : 0,
      sourceRecords: (inp.sources || "").split(",").map((x) => x.trim()).filter(Boolean),
      assumptions: (inp.assumptions || "").split("\n").map((x) => x.trim()).filter(Boolean),
      status: "Proposed", createdAt: nowIso(),
    };
    persistInvestments([iv, ...investments]);
    audit("Investment proposed", `${iv.id} for ${selectedSlo.id}. Est. return ${iv.estimatedBudgetReturnPct}% budget, confidence ${Math.round(iv.confidence * 100)}%.`, "info", selectedSlo.id);
    closeDialog();
  };

  const doRequestApproval = () => {
    if (!selectedSlo) return;
    doEditTarget();
  };

  const toggleConnector = () => setConnectorDown((v) => !v);

  /* ------------------------------- UI --------------------------------- */

  if (loading) return (
    <div className="p-6">
      <EntityHeader title="SLO & Error Budget Center" subtitle="Loading…" />
      <div className="mt-6 text-sm text-slate-500 flex items-center gap-2"><Timer className="h-4 w-4 animate-pulse" /> Loading…</div>
    </div>
  );
  if (loadError) return (
    <div className="p-6">
      <EntityHeader title="SLO & Error Budget Center" subtitle="Failed to load" />
      <Card className="mt-6 border-rose-200 bg-rose-50">
        <CardContent className="p-4 text-sm text-rose-800 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <div><div className="font-medium">Could not load reliability data.</div><div className="text-rose-700/80 mt-1">{loadError}</div></div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <EntityHeader
        title="SLO & Error Budget Center"
        subtitle="Global Order Processing · SLOs are internal objectives, distinct from customer-facing SLAs."
        meta={
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{portfolio.total} SLOs</Badge>
            <Badge variant="outline" className={cn(stateTone("Fast burn"))}>{portfolio.fastBurn} fast burn</Badge>
            <Badge variant="outline" className={cn(stateTone("Budget exhausted"))}>{portfolio.exhausted} exhausted</Badge>
            <Badge variant="outline" className={cn(stateTone("Missing telemetry"))}>{portfolio.missing} missing telemetry</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" aria-pressed={connectorDown} onClick={toggleConnector}>
              {connectorDown ? "Telemetry: Down" : "Telemetry: OK"}
            </Button>
            <Button size="sm" disabled={!canWrite} onClick={() => openDialog("sli")}><PlusCircle className="h-4 w-4 mr-1" />New SLI</Button>
            <Button size="sm" disabled={!canWrite} onClick={() => openDialog("slo")}><Target className="h-4 w-4 mr-1" />New SLO</Button>
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
            <AlertTriangle className="h-4 w-4" /> Telemetry connector is <strong className="mx-1">unavailable</strong>. Live burn/forecast values shown are stale.
          </CardContent>
        </Card>
      )}

      {/* Portfolio metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <MetricCard icon={<GaugeCircle className="h-4 w-4" />} label="SLOs total" value={String(portfolio.total)} sub="Across services" />
        <MetricCard icon={<CheckCircle2 className="h-4 w-4" />} label="Within budget" value={String(portfolio.withinBudget)} sub="Green today" />
        <MetricCard icon={<Flame className="h-4 w-4" />} label="Fast burn" value={String(portfolio.fastBurn)} sub="Multi-window alarms" />
        <MetricCard icon={<TrendingDown className="h-4 w-4" />} label="Exhausted" value={String(portfolio.exhausted)} sub="Budget consumed" />
        <MetricCard icon={<Ban className="h-4 w-4" />} label="Missing telemetry" value={String(portfolio.missing)} sub="Requires SLI wiring" />
      </div>

      {/* Service selector */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-xs text-slate-500 mr-1">Service</div>
        <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
          <SelectTrigger className="w-56" aria-label="Select service"><SelectValue /></SelectTrigger>
          <SelectContent>
            {services.map((sv) => <SelectItem key={sv} value={sv}>{sv}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-xs text-slate-500 ml-2">SLO</div>
        <Select value={selectedSlo?.id ?? ""} onValueChange={setSelectedSloId}>
          <SelectTrigger className="w-72" aria-label="Select SLO"><SelectValue placeholder="Select SLO" /></SelectTrigger>
          <SelectContent>
            {serviceSlos.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="portfolio"><GaugeCircle className="h-3.5 w-3.5 mr-1" />Portfolio</TabsTrigger>
          <TabsTrigger value="detail"><Target className="h-3.5 w-3.5 mr-1" />SLO Detail</TabsTrigger>
          <TabsTrigger value="history"><ClipboardList className="h-3.5 w-3.5 mr-1" />Breach History</TabsTrigger>
          <TabsTrigger value="policy"><ShieldAlert className="h-3.5 w-3.5 mr-1" />Policy & Runbooks</TabsTrigger>
          <TabsTrigger value="investments"><Sparkles className="h-3.5 w-3.5 mr-1" />Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-4">
          <div className="overflow-x-auto border rounded-md bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">SLO</th>
                  <th className="px-3 py-2 text-left font-medium">Service</th>
                  <th className="px-3 py-2 text-left font-medium">Target</th>
                  <th className="px-3 py-2 text-left font-medium">Achieved</th>
                  <th className="px-3 py-2 text-left font-medium">Budget remaining</th>
                  <th className="px-3 py-2 text-left font-medium">Burn (6h)</th>
                  <th className="px-3 py-2 text-left font-medium">Forecast</th>
                  <th className="px-3 py-2 text-left font-medium">State</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {slos.map((s) => {
                  const burn6 = s.burnWindows.find((w) => w.windowLabel === "6h");
                  return (
                    <tr key={s.id} className="border-b last:border-b-0 hover:bg-slate-50/60">
                      <td className="px-3 py-2">
                        <button className="text-left font-medium text-slate-900 hover:underline"
                          onClick={() => { setSelectedServiceId(s.serviceId); setSelectedSloId(s.id); setTab("detail"); }}>
                          {s.title}
                        </button>
                        <div className="text-xs text-slate-500">{s.id}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{s.serviceId}</td>
                      <td className="px-3 py-2 tabular-nums">{s.targetPct}%{s.targetLatencyMs ? ` / ${s.targetLatencyMs}ms` : ""}</td>
                      <td className="px-3 py-2 tabular-nums">{s.currentAchievedPct ? `${s.currentAchievedPct}%` : "—"}</td>
                      <td className="px-3 py-2 tabular-nums">{s.state === "Missing telemetry" ? "—" : `${budgetRemainingPct(s)}%`}</td>
                      <td className="px-3 py-2 tabular-nums">{burn6 ? `${burn6.burnRate.toFixed(1)}×` : "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{s.forecastExhaustionAt ? new Date(s.forecastExhaustionAt).toLocaleDateString() : "—"}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className={cn("text-xs", stateTone(s.state))}>{s.state}</Badge></td>
                      <td className="px-3 py-2 text-right">
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedServiceId(s.serviceId); setSelectedSloId(s.id); setTab("detail"); }}>
                          Open <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="detail" className="mt-4 space-y-4">
          {!selectedSlo ? (
            <Card><CardContent className="p-6 text-sm text-slate-500">No SLO selected.</CardContent></Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-slate-500">{selectedSlo.serviceId} · {selectedSlo.id} · SLO (not SLA)</div>
                        <div className="text-lg font-semibold text-slate-900">{selectedSlo.title}</div>
                      </div>
                      <Badge variant="outline" className={cn("text-xs", stateTone(selectedSlo.state))}>{selectedSlo.state}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <Field label="Target">{selectedSlo.targetPct}%{selectedSlo.targetLatencyMs ? ` / ${selectedSlo.targetLatencyMs}ms` : ""}</Field>
                      <Field label="Window">{selectedSlo.windowDays}d</Field>
                      <Field label="Achieved">{selectedSlo.currentAchievedPct ? `${selectedSlo.currentAchievedPct}%` : "—"}</Field>
                      <Field label="Budget remaining">{selectedSlo.state === "Missing telemetry" ? "—" : `${budgetRemainingPct(selectedSlo)}%`}</Field>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-slate-600 mb-1">Multi-window burn rates</div>
                      {selectedSlo.burnWindows.length === 0 ? (
                        <div className="text-xs text-slate-500">No burn data (missing telemetry).</div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {selectedSlo.burnWindows.map((w) => {
                            const over = w.burnRate > w.threshold;
                            return (
                              <div key={w.windowLabel} className={cn("rounded-md border p-2", over ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200")}>
                                <div className="text-[11px] text-slate-500">{w.windowLabel}</div>
                                <div className="text-lg font-semibold tabular-nums">{w.burnRate.toFixed(1)}×</div>
                                <div className="text-[11px] text-slate-500">threshold {w.threshold}×</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="rounded-md bg-slate-50 border p-3 text-xs text-slate-700">
                      <div className="font-medium text-slate-800 mb-1 flex items-center gap-1"><FileSearch className="h-3.5 w-3.5" /> How this is computed</div>
                      <div className="space-y-1">
                        <div><strong>Budget total</strong> = 100% − target = <span className="tabular-nums">{budgetTotalPctForTarget(selectedSlo.targetPct).toFixed(3)} pp</span></div>
                        <div><strong>Achieved</strong> = good_events / valid_events over trailing {selectedSlo.windowDays}d</div>
                        <div><strong>Budget consumed</strong> = (target − achieved) / (100 − target) = <span className="tabular-nums">{selectedSlo.currentIncidentBurnPct}%</span></div>
                        <div><strong>Burn rate</strong> = (budget consumed in window) / (window length / total window)</div>
                        {selectedSli && (<div className="pt-1 border-t"><strong>Source (SLI {selectedSli.id})</strong>: {selectedSli.source}</div>)}
                        {selectedSli && (<div className="font-mono break-all"><strong>good</strong>: {selectedSli.goodEventQuery}</div>)}
                        {selectedSli && (<div className="font-mono break-all"><strong>valid</strong>: {selectedSli.validEventQuery}</div>)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog("edit-target")}><Target className="h-4 w-4 mr-1" />Edit target</Button>
                      <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog("burn-alert")}><BellRing className="h-4 w-4 mr-1" />Create burn alert</Button>
                      <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog("attach-policy")}><ShieldAlert className="h-4 w-4 mr-1" />Attach budget policy</Button>
                      <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog("link-runbook")}><LinkIcon className="h-4 w-4 mr-1" />Link runbook</Button>
                      <Button size="sm" variant="outline" disabled={!canWrite || selectedSlo.state !== "Budget exhausted"} onClick={() => openDialog("restrict-changes")}><Ban className="h-4 w-4 mr-1" />Restrict changes</Button>
                      <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog("investment")}><Sparkles className="h-4 w-4 mr-1" />Create investment</Button>
                      <Button size="sm" variant="outline" disabled={!canWrite || !selectedSlo.draftTarget} onClick={() => openDialog("request-approval")}><ClipboardList className="h-4 w-4 mr-1" />Request approval</Button>
                      <Button size="sm" variant="outline" onClick={() => openDialog("compare")}><GitCompare className="h-4 w-4 mr-1" />Compare periods</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="text-xs font-medium text-slate-600">Investigate breaches</div>
                    {breaches.filter((b) => b.sloId === selectedSlo.id).length === 0 ? (
                      <div className="text-xs text-slate-500">No breaches recorded for this SLO.</div>
                    ) : breaches.filter((b) => b.sloId === selectedSlo.id).map((b) => (
                      <div key={b.id} className="flex items-center justify-between text-sm border rounded-md p-2">
                        <div>
                          <div className="font-medium text-slate-900">{b.window} burn @ {b.burnRate.toFixed(1)}×</div>
                          <div className="text-xs text-slate-500">{new Date(b.detectedAt).toLocaleString()} · {b.cause}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-xs", b.resolved ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200")}>{b.resolved ? "Resolved" : "Open"}</Badge>
                          {b.linkedIncidentId && (
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/runops/incidents/${b.linkedIncidentId}/investigate`)}>
                              Investigate <ExternalLink className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="text-xs font-medium text-slate-600">Release & automation policy</div>
                    {(() => {
                      const pol = policies.find((p) => p.id === selectedSlo.budgetPolicyId);
                      if (!pol) return <div className="text-xs text-slate-500">No policy attached.</div>;
                      return (
                        <div className="text-sm space-y-1">
                          <div className="font-medium text-slate-900">{pol.name}</div>
                          <div className="text-xs text-slate-600">Change freeze at burn ≥ {pol.freezeChangesAtBurnRate}×</div>
                          <div className="text-xs text-slate-600">Approval required when budget ≤ {pol.requireApprovalAtBudgetPct}% remaining</div>
                          <div className="text-xs text-slate-600">Autonomy disabled when budget ≤ {pol.disableAutonomyAtBudgetPct}% remaining</div>
                          <div className="pt-2 text-xs">
                            {(() => {
                              const rem = budgetRemainingPct(selectedSlo);
                              if (selectedSlo.state === "Budget exhausted") return <Badge variant="outline" className={cn("text-xs", stateTone("Budget exhausted"))}>Change freeze active</Badge>;
                              if (rem <= pol.disableAutonomyAtBudgetPct) return <Badge variant="outline" className={cn("text-xs", stateTone("Fast burn"))}>Autonomy disabled</Badge>;
                              if (rem <= pol.requireApprovalAtBudgetPct) return <Badge variant="outline" className={cn("text-xs", stateTone("Fast burn"))}>Approvals required</Badge>;
                              return <Badge variant="outline" className={cn("text-xs", stateTone("Within budget"))}>Normal operations</Badge>;
                            })()}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="text-xs font-medium text-slate-600">Linked runbooks</div>
                    {selectedSlo.linkedRunbookIds.length === 0 ? (
                      <div className="text-xs text-slate-500">No runbooks linked.</div>
                    ) : selectedSlo.linkedRunbookIds.map((rb) => (
                      <div key={rb} className="flex items-center justify-between text-sm">
                        <span>{rb}</span>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/runops/runbooks/${rb}`)}>
                          Open <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="text-xs font-medium text-slate-600">SLI definition</div>
                    {selectedSli ? (
                      <div className="text-xs text-slate-700 space-y-1">
                        <div><strong>{selectedSli.name}</strong> · {selectedSli.kind}</div>
                        <div>Source: {selectedSli.source}</div>
                        <div>Telemetry: {selectedSli.hasTelemetry ? "Available" : "Missing"}</div>
                      </div>
                    ) : <div className="text-xs text-slate-500">No SLI resolved.</div>}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-3 text-xs text-slate-600">
              Historical periods are frozen. Target changes never rewrite past performance.
            </CardContent>
          </Card>
          <div className="mt-3 overflow-x-auto border rounded-md bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">SLO</th>
                  <th className="px-3 py-2 text-left">Period</th>
                  <th className="px-3 py-2 text-left">Target (frozen)</th>
                  <th className="px-3 py-2 text-left">Achieved</th>
                  <th className="px-3 py-2 text-left">Budget consumed</th>
                </tr>
              </thead>
              <tbody>
                {slos.flatMap((s) => s.history.map((h, i) => (
                  <tr key={`${s.id}-${i}`} className="border-b last:border-b-0">
                    <td className="px-3 py-2"><div className="font-medium">{s.title}</div><div className="text-xs text-slate-500">{s.id}</div></td>
                    <td className="px-3 py-2 text-slate-700">{new Date(h.periodStart).toLocaleDateString()} → {new Date(h.periodEnd).toLocaleDateString()}</td>
                    <td className="px-3 py-2 tabular-nums">{h.targetAtTime}%</td>
                    <td className="px-3 py-2 tabular-nums">{h.achieved}%</td>
                    <td className="px-3 py-2 tabular-nums">{h.budgetConsumedPct}%</td>
                  </tr>
                )))}
                {slos.every((s) => s.history.length === 0) && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">No history yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="policy" className="mt-4 space-y-3">
          {policies.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.id} · attached to {p.attachedSloIds.length} SLO(s)</div>
                  </div>
                </div>
                <div className="text-xs text-slate-700 grid md:grid-cols-3 gap-2">
                  <div>Change freeze burn ≥ <strong>{p.freezeChangesAtBurnRate}×</strong></div>
                  <div>Approval required at budget ≤ <strong>{p.requireApprovalAtBudgetPct}%</strong></div>
                  <div>Autonomy disabled at budget ≤ <strong>{p.disableAutonomyAtBudgetPct}%</strong></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="investments" className="mt-4 space-y-3">
          {investments.length === 0 ? (
            <Card><CardContent className="p-4 text-sm text-slate-500">No reliability investments proposed.</CardContent></Card>
          ) : investments.map((iv) => (
            <Card key={iv.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{iv.title}</div>
                    <div className="text-xs text-slate-500">{iv.id} · {iv.sloId} · {iv.status}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Badge variant="outline">Est. return {iv.estimatedBudgetReturnPct}% budget</Badge>
                    <Badge variant="outline">Conf {Math.round(iv.confidence * 100)}%</Badge>
                    <Badge variant="outline">Uncert. {Math.round((1 - iv.confidence) * 100)}%</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-700">{iv.description || "—"}</p>
                <div>
                  <div className="text-[11px] font-medium text-slate-600">Assumptions</div>
                  <ul className="list-disc pl-5 text-xs text-slate-700">
                    {iv.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-600">Source records</div>
                  <div className="flex flex-wrap gap-1">
                    {iv.sourceRecords.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* ------------------------------- Dialogs ------------------------------ */}

      <Dialog open={dialog === "sli"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create SLI on {selectedServiceId}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <Input placeholder="Name" value={inp.name ?? ""} onChange={(e) => setInp({ ...inp, name: e.target.value })} />
            <Select value={inp.kind ?? "availability"} onValueChange={(v) => setInp({ ...inp, kind: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["availability","latency","correctness","throughput","freshness"] as SliKind[]).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Good-event query" value={inp.good ?? ""} onChange={(e) => setInp({ ...inp, good: e.target.value })} />
            <Input placeholder="Valid-event query" value={inp.valid ?? ""} onChange={(e) => setInp({ ...inp, valid: e.target.value })} />
            <Input placeholder="Unit" value={inp.unit ?? ""} onChange={(e) => setInp({ ...inp, unit: e.target.value })} />
            <Input placeholder="Source" value={inp.source ?? ""} onChange={(e) => setInp({ ...inp, source: e.target.value })} />
          </div>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button onClick={doCreateSli}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "slo"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create SLO on {selectedServiceId}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <Input placeholder="Title" value={inp.title ?? ""} onChange={(e) => setInp({ ...inp, title: e.target.value })} />
            <Select value={inp.sliId ?? ""} onValueChange={(v) => setInp({ ...inp, sliId: v })}>
              <SelectTrigger><SelectValue placeholder="SLI" /></SelectTrigger>
              <SelectContent>
                {serviceSlis.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Target %" value={inp.target ?? ""} onChange={(e) => setInp({ ...inp, target: e.target.value })} />
            <Input type="number" placeholder="Window (days)" value={inp.window ?? ""} onChange={(e) => setInp({ ...inp, window: e.target.value })} />
          </div>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button onClick={doCreateSlo}>Create draft</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "edit-target"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit target · {selectedSlo?.id}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="text-xs text-slate-600">
              Target changes create an approval request. <strong>History is not rewritten</strong> — past periods keep the target they were measured against.
            </div>
            <Input type="number" placeholder={`New target % (current ${selectedSlo?.targetPct})`} value={inp.target ?? ""} onChange={(e) => setInp({ ...inp, target: e.target.value })} />
            <Textarea rows={3} placeholder="Reason / evidence" value={inp.reason ?? ""} onChange={(e) => setInp({ ...inp, reason: e.target.value })} />
          </div>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button onClick={doEditTarget}>Request change</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "burn-alert"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create burn alert · {selectedSlo?.id}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <Select value={inp.window ?? "6h"} onValueChange={(v) => setInp({ ...inp, window: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["1h","6h","24h","72h"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Threshold (× burn rate)" value={inp.threshold ?? ""} onChange={(e) => setInp({ ...inp, threshold: e.target.value })} />
            <div className="text-xs text-slate-500">Alert is armed in the shared Alert Triage store.</div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button onClick={doCreateBurnAlert}>Arm alert</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "attach-policy"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Attach budget policy</DialogTitle></DialogHeader>
          <Select value={inp.policyId ?? ""} onValueChange={(v) => setInp({ ...inp, policyId: v })}>
            <SelectTrigger><SelectValue placeholder="Policy" /></SelectTrigger>
            <SelectContent>
              {policies.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button onClick={doAttachPolicy}>Attach</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "link-runbook"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Link runbook</DialogTitle></DialogHeader>
          <Input placeholder="Runbook id (e.g., RB-0042)" value={inp.runbookId ?? ""} onChange={(e) => setInp({ ...inp, runbookId: e.target.value })} />
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button onClick={doLinkRunbook}>Link</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "restrict-changes"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Restrict changes</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="text-xs text-slate-600">Emits a change-freeze governance event. Visible in Launch Center + Governance.</div>
            <Textarea rows={3} placeholder="Reason" value={inp.reason ?? ""} onChange={(e) => setInp({ ...inp, reason: e.target.value })} />
          </div>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button variant="destructive" onClick={doRestrictChanges}>Freeze changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "investment"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create reliability investment</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <Input placeholder="Title" value={inp.title ?? ""} onChange={(e) => setInp({ ...inp, title: e.target.value })} />
            <Textarea rows={2} placeholder="Description" value={inp.description ?? ""} onChange={(e) => setInp({ ...inp, description: e.target.value })} />
            <Input type="number" placeholder="Estimated % of budget returned" value={inp.ret ?? ""} onChange={(e) => setInp({ ...inp, ret: e.target.value })} />
            <Input type="number" placeholder="Confidence (0-100)" value={inp.confidence ?? ""} onChange={(e) => setInp({ ...inp, confidence: e.target.value })} />
            <Input placeholder="Source records (comma separated)" value={inp.sources ?? ""} onChange={(e) => setInp({ ...inp, sources: e.target.value })} />
            <Textarea rows={2} placeholder="Assumptions (one per line)" value={inp.assumptions ?? ""} onChange={(e) => setInp({ ...inp, assumptions: e.target.value })} />
          </div>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button onClick={doCreateInvestment}>Propose</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "request-approval"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request owner approval</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="text-xs text-slate-600">Pending draft target: {selectedSlo?.draftTarget ?? "—"}%</div>
            <Textarea rows={3} placeholder="Reason" value={inp.reason ?? ""} onChange={(e) => setInp({ ...inp, reason: e.target.value })} />
            <Input type="number" placeholder={`Target (default ${selectedSlo?.draftTarget ?? selectedSlo?.targetPct})`} value={inp.target ?? ""} onChange={(e) => setInp({ ...inp, target: e.target.value })} />
          </div>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button onClick={doRequestApproval}>Submit</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "compare"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Compare historical periods · {selectedSlo?.title}</DialogTitle></DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-2 py-1 text-left">Period</th>
                  <th className="px-2 py-1 text-left">Target (frozen)</th>
                  <th className="px-2 py-1 text-left">Achieved</th>
                  <th className="px-2 py-1 text-left">Budget consumed</th>
                </tr>
              </thead>
              <tbody>
                {(selectedSlo?.history ?? []).map((h, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-2 py-1">{new Date(h.periodStart).toLocaleDateString()} → {new Date(h.periodEnd).toLocaleDateString()}</td>
                    <td className="px-2 py-1 tabular-nums">{h.targetAtTime}%</td>
                    <td className="px-2 py-1 tabular-nums">{h.achieved}%</td>
                    <td className="px-2 py-1 tabular-nums">{h.budgetConsumedPct}%</td>
                  </tr>
                ))}
                {(!selectedSlo?.history || selectedSlo.history.length === 0) && (
                  <tr><td colSpan={4} className="px-2 py-4 text-center text-slate-500">No history.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter><Button variant="outline" onClick={closeDialog}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------- Sub-components ----------------------------- */

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</div>
        <div className="text-xl font-semibold text-slate-900 mt-1 tabular-nums">{value}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-slate-800">{children}</div>
    </div>
  );
}
