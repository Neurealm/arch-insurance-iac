/**
 * Page 31 · Recovery Validation & Incident Closure
 * Route: /runops/incidents/:incidentId/recovery
 *
 * Confirms that service *and* customer experience have recovered before an
 * incident can be resolved. Nothing on this page is randomised. Every check
 * has a deterministic reading, a deterministic history of consecutive
 * successful intervals, and a deterministic pass/fail rule derived from its
 * threshold. Advancing the observation window walks the fixture history.
 *
 * Persistence (localStorage):
 *   runops.recovery.v1[incidentId]      → RecoveryRecord
 *   runops.incidents.v1[incidentId]     → incident state + timeline mirror
 *   runops.problems.v1                  → list of created problems
 *   runops.postmortems.v1               → list of scheduled postmortems
 *
 * Cross-screen effects on successful recovery are surfaced by writing
 * incident.state = "Monitoring" | "Resolved", by appending timeline entries,
 * and by emitting ops.pushNotification which populates the notification
 * center consumed by Command, Service Digital Twin, SLO Center, execution
 * state, communications and the operations queue.
 *
 * Every mutation emits an audit + domain event via ops.pushNotification.
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity, AlertTriangle, CheckCircle2, ChevronRight, Clock, Database,
  ExternalLink, FileText, Gauge, Heart, PlayCircle, RefreshCw, RotateCcw,
  ShieldAlert, ShieldCheck, Timer, TrendingDown, TrendingUp, Users, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------- Types --------------------------------- */

type Recovery = "infrastructure" | "customer" | "data";
type CheckState = "pending" | "recovering" | "passed" | "failed";
type IntervalStatus = "ok" | "warn" | "fail";
type IncidentState =
  | "Mitigating"
  | "Validation Pending"
  | "Partially Recovered"
  | "Recovering"
  | "Observation Active"
  | "Validation Passed"
  | "Validation Failed"
  | "Residual Risk Accepted"
  | "Monitoring"
  | "Resolved";

interface CheckSample {
  /** t=0 is when validation started; positive minutes ahead. */
  minute: number;
  value: number;
  unit: string;
  status: IntervalStatus;
  note?: string;
}

interface CanonicalCheck {
  id: string;
  section: "Service" | "Customer" | "Data";
  title: string;
  what: string;
  threshold: string;
  recovery: Recovery;
  mandatoryForTier1: boolean;
  telemetryHref: string;
  history: CheckSample[];   // deterministic 6-sample walk after t=0
}

interface CheckMutable {
  id: string;
  state: CheckState;
  intervalIdx: number;      // consumed sample index (0..history.length-1)
  lastRunAt?: string;
  overrideNote?: string;
  overrideBy?: string;
}

interface RecoveryRecord {
  incidentId: string;
  startedAt: string | null;
  observationWindowMin: number;      // e.g. 30
  requiredConsecutive: number;       // e.g. 3
  checks: CheckMutable[];
  incidentState: IncidentState;
  residualRisk: string | null;
  problemId: string | null;
  postmortemAt: string | null;
  temporaryChangeClosed: boolean;
  updatedAt: string;
}

interface StoredIncident {
  incidentId: string;
  state?: IncidentState;
  closedAt?: string | null;
  timeline?: { at: string; label: string; detail?: string }[];
  recovery?: {
    startedAt: string | null;
    passedAt?: string;
    residualRisk?: string | null;
  };
  updatedAt?: string;
  [k: string]: unknown;
}

interface StoredProblem {
  id: string;
  incidentId: string;
  title: string;
  createdAt: string;
  createdBy: string;
}

interface StoredPostmortem {
  incidentId: string;
  scheduledAt: string;
  scheduledBy: string;
  createdAt: string;
}

/* ------------------------------ Storage --------------------------------- */

const RECOVERY_KEY   = "runops.recovery.v1";
const INCIDENTS_KEY  = "runops.incidents.v1";
const PROBLEMS_KEY   = "runops.problems.v1";
const POSTMORTEMS_KEY = "runops.postmortems.v1";

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

/* ------------------------------- Catalog -------------------------------- */
/**
 * Deterministic recovery walk for the canonical INC-10482 checkout incident.
 * Each check has 6 samples: t=+2, +5, +10, +15, +20, +25 minutes.
 * The walk is deliberately non-monotonic in one or two places (queue depth,
 * data integrity backlog) so "Partially Recovered" and "Recovering" states
 * are reachable without touching randomness.
 */
const CHECKS: CanonicalCheck[] = [
  {
    id: "CHK-SYN-CHECKOUT",
    section: "Customer",
    title: "Synthetic checkout journey",
    what: "5-step Datadog synthetic: browse → cart → auth → pay → confirm.",
    threshold: "All steps pass within SLA · error rate 0%",
    recovery: "customer",
    mandatoryForTier1: true,
    telemetryHref: "https://datadog.example/synthetic/checkout",
    history: [
      { minute: 2,  value: 60, unit: "% steps ok", status: "fail", note: "Payment step still timing out." },
      { minute: 5,  value: 80, unit: "% steps ok", status: "warn", note: "Payment succeeding intermittently." },
      { minute: 10, value: 100, unit: "% steps ok", status: "ok" },
      { minute: 15, value: 100, unit: "% steps ok", status: "ok" },
      { minute: 20, value: 100, unit: "% steps ok", status: "ok" },
      { minute: 25, value: 100, unit: "% steps ok", status: "ok" },
    ],
  },
  {
    id: "CHK-CHECKOUT-LAT",
    section: "Customer",
    title: "Checkout latency (p95)",
    what: "checkout-api p95 latency, 5-min rolling window.",
    threshold: "≤ 900 ms",
    recovery: "customer",
    mandatoryForTier1: true,
    telemetryHref: "https://datadog.example/checkout/p95",
    history: [
      { minute: 2,  value: 1420, unit: "ms", status: "fail" },
      { minute: 5,  value: 980,  unit: "ms", status: "warn" },
      { minute: 10, value: 820,  unit: "ms", status: "ok" },
      { minute: 15, value: 740,  unit: "ms", status: "ok" },
      { minute: 20, value: 690,  unit: "ms", status: "ok" },
      { minute: 25, value: 660,  unit: "ms", status: "ok" },
    ],
  },
  {
    id: "CHK-TX-SUCCESS",
    section: "Customer",
    title: "Transaction success rate",
    what: "Percent of confirm-order calls returning 2xx.",
    threshold: "≥ 99.5%",
    recovery: "customer",
    mandatoryForTier1: true,
    telemetryHref: "https://datadog.example/checkout/tx-success",
    history: [
      { minute: 2,  value: 92.4, unit: "%", status: "fail" },
      { minute: 5,  value: 98.9, unit: "%", status: "warn" },
      { minute: 10, value: 99.7, unit: "%", status: "ok" },
      { minute: 15, value: 99.8, unit: "%", status: "ok" },
      { minute: 20, value: 99.9, unit: "%", status: "ok" },
      { minute: 25, value: 99.9, unit: "%", status: "ok" },
    ],
  },
  {
    id: "CHK-ERR-RATE",
    section: "Service",
    title: "Error rate",
    what: "5xx rate on checkout-api.",
    threshold: "≤ 0.5%",
    recovery: "infrastructure",
    mandatoryForTier1: true,
    telemetryHref: "https://datadog.example/checkout/errors",
    history: [
      { minute: 2,  value: 6.2, unit: "%", status: "fail" },
      { minute: 5,  value: 0.9, unit: "%", status: "warn" },
      { minute: 10, value: 0.3, unit: "%", status: "ok" },
      { minute: 15, value: 0.2, unit: "%", status: "ok" },
      { minute: 20, value: 0.1, unit: "%", status: "ok" },
      { minute: 25, value: 0.1, unit: "%", status: "ok" },
    ],
  },
  {
    id: "CHK-SQL-CONN",
    section: "Service",
    title: "SQL connection pool",
    what: "Active connections vs. max on checkout-db-01.",
    threshold: "Waiters = 0 · usage < 70%",
    recovery: "infrastructure",
    mandatoryForTier1: true,
    telemetryHref: "https://datadog.example/checkout-db/conns",
    history: [
      { minute: 2,  value: 42, unit: "waiters", status: "fail" },
      { minute: 5,  value: 8,  unit: "waiters", status: "warn" },
      { minute: 10, value: 0,  unit: "waiters", status: "ok" },
      { minute: 15, value: 0,  unit: "waiters", status: "ok" },
      { minute: 20, value: 0,  unit: "waiters", status: "ok" },
      { minute: 25, value: 0,  unit: "waiters", status: "ok" },
    ],
  },
  {
    id: "CHK-QUEUE-DEPTH",
    section: "Service",
    title: "Queue depth",
    what: "order-events backlog (RabbitMQ).",
    threshold: "≤ 200 messages",
    recovery: "infrastructure",
    mandatoryForTier1: false,
    telemetryHref: "https://datadog.example/rabbit/order-events",
    history: [
      { minute: 2,  value: 1840, unit: "msgs", status: "fail" },
      { minute: 5,  value: 620,  unit: "msgs", status: "warn" },
      { minute: 10, value: 260,  unit: "msgs", status: "warn", note: "Draining but not yet under threshold." },
      { minute: 15, value: 120,  unit: "msgs", status: "ok" },
      { minute: 20, value: 40,   unit: "msgs", status: "ok" },
      { minute: 25, value: 12,   unit: "msgs", status: "ok" },
    ],
  },
  {
    id: "CHK-APP-HEALTH",
    section: "Service",
    title: "Application health",
    what: "/health endpoint on checkout-api pods (n=12).",
    threshold: "12/12 healthy for 3 intervals",
    recovery: "infrastructure",
    mandatoryForTier1: true,
    telemetryHref: "https://k8s.example/checkout-api/pods",
    history: [
      { minute: 2,  value: 9,  unit: "/12 healthy", status: "fail" },
      { minute: 5,  value: 11, unit: "/12 healthy", status: "warn" },
      { minute: 10, value: 12, unit: "/12 healthy", status: "ok" },
      { minute: 15, value: 12, unit: "/12 healthy", status: "ok" },
      { minute: 20, value: 12, unit: "/12 healthy", status: "ok" },
      { minute: 25, value: 12, unit: "/12 healthy", status: "ok" },
    ],
  },
  {
    id: "CHK-DEPS",
    section: "Service",
    title: "Dependency health",
    what: "payments-gateway, inventory-service, loyalty-api.",
    threshold: "All 3 SLO green",
    recovery: "infrastructure",
    mandatoryForTier1: true,
    telemetryHref: "https://datadog.example/checkout/deps",
    history: [
      { minute: 2,  value: 1, unit: "/3 green", status: "fail" },
      { minute: 5,  value: 2, unit: "/3 green", status: "warn" },
      { minute: 10, value: 3, unit: "/3 green", status: "ok" },
      { minute: 15, value: 3, unit: "/3 green", status: "ok" },
      { minute: 20, value: 3, unit: "/3 green", status: "ok" },
      { minute: 25, value: 3, unit: "/3 green", status: "ok" },
    ],
  },
  {
    id: "CHK-DATA-INT",
    section: "Data",
    title: "Data integrity",
    what: "orphaned orders + payment reconciliation delta.",
    threshold: "0 orphans · reconciliation delta = 0",
    recovery: "data",
    mandatoryForTier1: true,
    telemetryHref: "https://obs.example/checkout/reconciliation",
    history: [
      { minute: 2,  value: 34, unit: "orphans",  status: "fail" },
      { minute: 5,  value: 18, unit: "orphans",  status: "warn" },
      { minute: 10, value: 6,  unit: "orphans",  status: "warn", note: "Backfill job still running." },
      { minute: 15, value: 0,  unit: "orphans",  status: "ok" },
      { minute: 20, value: 0,  unit: "orphans",  status: "ok" },
      { minute: 25, value: 0,  unit: "orphans",  status: "ok" },
    ],
  },
  {
    id: "CHK-CUSTOMER",
    section: "Customer",
    title: "Customer impact",
    what: "Active affected sessions per Real User Monitoring.",
    threshold: "0 affected sessions for 2 intervals",
    recovery: "customer",
    mandatoryForTier1: true,
    telemetryHref: "https://rum.example/checkout/affected",
    history: [
      { minute: 2,  value: 812, unit: "sessions", status: "fail" },
      { minute: 5,  value: 140, unit: "sessions", status: "warn" },
      { minute: 10, value: 12,  unit: "sessions", status: "warn" },
      { minute: 15, value: 0,   unit: "sessions", status: "ok" },
      { minute: 20, value: 0,   unit: "sessions", status: "ok" },
      { minute: 25, value: 0,   unit: "sessions", status: "ok" },
    ],
  },
  {
    id: "CHK-SLO-BURN",
    section: "Service",
    title: "SLO burn rate",
    what: "checkout availability SLO, 1h burn multiple.",
    threshold: "< 1× (non-burning)",
    recovery: "infrastructure",
    mandatoryForTier1: true,
    telemetryHref: "https://obs.example/slo/checkout",
    history: [
      { minute: 2,  value: 14.2, unit: "× burn", status: "fail" },
      { minute: 5,  value: 3.4,  unit: "× burn", status: "warn" },
      { minute: 10, value: 0.8,  unit: "× burn", status: "ok" },
      { minute: 15, value: 0.4,  unit: "× burn", status: "ok" },
      { minute: 20, value: 0.2,  unit: "× burn", status: "ok" },
      { minute: 25, value: 0.1,  unit: "× burn", status: "ok" },
    ],
  },
  {
    id: "CHK-ROLLBACK",
    section: "Service",
    title: "Rollback state",
    what: "State of the temporary/mitigation change (CHG-20391 revert).",
    threshold: "Applied · verified · reversible",
    recovery: "infrastructure",
    mandatoryForTier1: true,
    telemetryHref: "https://changes.example/CHG-20391",
    history: [
      { minute: 2,  value: 0, unit: "verified",   status: "warn", note: "Applied · awaiting verification sweep." },
      { minute: 5,  value: 1, unit: "verified",   status: "ok" },
      { minute: 10, value: 1, unit: "verified",   status: "ok" },
      { minute: 15, value: 1, unit: "verified",   status: "ok" },
      { minute: 20, value: 1, unit: "verified",   status: "ok" },
      { minute: 25, value: 1, unit: "verified",   status: "ok" },
    ],
  },
];

/* ------------------------------- Helpers -------------------------------- */

const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

function checkStateFromWalk(hist: CheckSample[], idx: number, required: number): CheckState {
  if (idx < 0) return "pending";
  const seen = hist.slice(0, idx + 1);
  if (seen.length === 0) return "pending";
  const last = seen[seen.length - 1];
  if (last.status === "fail") return "failed";
  // Count consecutive "ok" intervals from the end
  let consecutive = 0;
  for (let i = seen.length - 1; i >= 0; i--) {
    if (seen[i].status === "ok") consecutive++;
    else break;
  }
  if (consecutive >= required) return "passed";
  return "recovering";
}

function intervalTone(s: IntervalStatus) {
  return s === "ok"   ? "bg-emerald-500"
       : s === "warn" ? "bg-amber-400"
       :                "bg-red-500";
}

function stateTone(s: CheckState) {
  switch (s) {
    case "passed":    return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "recovering":return "bg-amber-50 text-amber-800 border-amber-200";
    case "failed":    return "bg-red-50 text-red-700 border-red-200";
    default:          return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function incidentTone(s: IncidentState) {
  switch (s) {
    case "Resolved":              return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Monitoring":
    case "Validation Passed":     return "bg-blue-50 text-blue-800 border-blue-200";
    case "Validation Failed":     return "bg-red-50 text-red-700 border-red-200";
    case "Residual Risk Accepted":return "bg-amber-50 text-amber-800 border-amber-200";
    case "Observation Active":
    case "Recovering":            return "bg-indigo-50 text-indigo-800 border-indigo-200";
    case "Partially Recovered":   return "bg-amber-50 text-amber-800 border-amber-200";
    default:                      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function sectionIcon(section: CanonicalCheck["section"]) {
  if (section === "Customer") return <Users className="h-4 w-4 text-blue-600" />;
  if (section === "Data")     return <Database className="h-4 w-4 text-purple-600" />;
  return <Gauge className="h-4 w-4 text-slate-600" />;
}

/* -------------------------------- Page ---------------------------------- */

export default function RecoveryValidation() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams<{ incidentId?: string }>();
  const incidentId = params.incidentId ?? ops.incident.id;

  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");
  const tier = ops.selectedService.tier;      // "Tier 1" | "Tier 2" | ...
  const isTier1 = tier === "Tier 1";

  const [record, setRecord] = useState<RecoveryRecord | null>(null);
  const [tab, setTab] = useState<"validation" | "history" | "closure">("validation");
  const [dialog, setDialog] = useState<null | "rollback" | "residual" | "problem" | "postmortem" | "resolve" | "monitor">(null);
  const [dialogNote, setDialogNote] = useState("");
  const [connectorDown, setConnectorDown] = useState(false);

  /* --------------------------- Load / seed ---------------------------- */
  useEffect(() => {
    const map = readMap<RecoveryRecord>(RECOVERY_KEY);
    if (map[incidentId]) {
      setRecord(map[incidentId]);
    } else {
      const seed: RecoveryRecord = {
        incidentId,
        startedAt: null,
        observationWindowMin: 30,
        requiredConsecutive: 3,
        checks: CHECKS.map((c) => ({ id: c.id, state: "pending", intervalIdx: -1 })),
        incidentState: "Validation Pending",
        residualRisk: null,
        problemId: null,
        postmortemAt: null,
        temporaryChangeClosed: false,
        updatedAt: nowIso(),
      };
      map[incidentId] = seed;
      writeMap(RECOVERY_KEY, map);
      setRecord(seed);
    }
  }, [incidentId]);

  const audit = useCallback(
    (title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
      ops.pushNotification({
        kind, title, detail, entityRef: incidentId,
        route: `/runops/incidents/${incidentId}/recovery`,
      });
    },
    [ops, incidentId],
  );

  const persist = useCallback((next: RecoveryRecord) => {
    const patched: RecoveryRecord = { ...next, updatedAt: nowIso() };
    const map = readMap<RecoveryRecord>(RECOVERY_KEY);
    map[patched.incidentId] = patched;
    writeMap(RECOVERY_KEY, map);
    setRecord(patched);
  }, []);

  const mirrorIncident = useCallback(
    (state: IncidentState, label: string, detail?: string, extras?: Partial<StoredIncident>) => {
      const map = readMap<StoredIncident>(INCIDENTS_KEY);
      const inc = map[incidentId] ?? { incidentId };
      const timeline = Array.isArray(inc.timeline) ? [...inc.timeline] : [];
      timeline.push({ at: nowIso(), label, detail });
      map[incidentId] = {
        ...inc,
        ...extras,
        state,
        timeline,
        updatedAt: nowIso(),
      };
      writeMap(INCIDENTS_KEY, map);
    },
    [incidentId],
  );

  /* --------------------------- Derived views -------------------------- */

  const checksById = useMemo(() => {
    const m: Record<string, CanonicalCheck> = {};
    for (const c of CHECKS) m[c.id] = c;
    return m;
  }, []);

  const mutableById = useMemo(() => {
    const m: Record<string, CheckMutable> = {};
    if (record) for (const c of record.checks) m[c.id] = c;
    return m;
  }, [record]);

  const derived = useMemo(() => {
    if (!record) return null;
    let passed = 0, failed = 0, recovering = 0, pending = 0;
    let mandatoryFailed = 0, customerFailed = 0, dataFailed = 0;
    let infraPassed = 0, infraTotal = 0, custPassed = 0, custTotal = 0;

    for (const c of CHECKS) {
      const mut = mutableById[c.id];
      const state = mut ? mut.state : "pending";
      if (state === "passed") passed++;
      else if (state === "failed") failed++;
      else if (state === "recovering") recovering++;
      else pending++;

      if (c.recovery === "infrastructure") { infraTotal++; if (state === "passed") infraPassed++; }
      if (c.recovery === "customer")       { custTotal++;  if (state === "passed") custPassed++; }

      if (state === "failed") {
        if (c.mandatoryForTier1) mandatoryFailed++;
        if (c.recovery === "customer") customerFailed++;
        if (c.recovery === "data") dataFailed++;
      }
    }
    return {
      passed, failed, recovering, pending,
      mandatoryFailed, customerFailed, dataFailed,
      infraPassed, infraTotal, custPassed, custTotal,
      total: CHECKS.length,
    };
  }, [record, mutableById]);

  const canResolve = useMemo(() => {
    if (!record || !derived) return false;
    if (record.incidentState === "Resolved") return false;
    if (derived.customerFailed > 0) return false;
    if (derived.dataFailed > 0) return false;
    if (isTier1 && derived.mandatoryFailed > 0) return false;
    // Require validation passed OR residual risk acknowledged
    if (record.incidentState === "Validation Passed") return true;
    if (record.incidentState === "Monitoring") return true;
    if (record.incidentState === "Residual Risk Accepted") return true;
    return false;
  }, [record, derived, isTier1]);

  const closureBlockers = useMemo(() => {
    const list: string[] = [];
    if (!derived) return list;
    if (derived.customerFailed > 0) list.push(`${derived.customerFailed} customer-experience check(s) still failing.`);
    if (derived.dataFailed > 0)     list.push(`${derived.dataFailed} data-integrity check(s) still failing.`);
    if (isTier1 && derived.mandatoryFailed > 0) list.push(`${derived.mandatoryFailed} mandatory Tier 1 check(s) failing.`);
    if (record && record.incidentState !== "Validation Passed" &&
        record.incidentState !== "Monitoring" && record.incidentState !== "Residual Risk Accepted") {
      list.push("Validation has not passed and residual risk has not been accepted.");
    }
    return list;
  }, [derived, isTier1, record]);

  /* ------------------------------ Actions ----------------------------- */

  const startValidation = () => {
    if (!record || !canWrite) return;
    if (connectorDown) {
      audit("Validation suite unavailable", "Telemetry connector offline — cannot start observation.", "warning");
      return;
    }
    const next: RecoveryRecord = {
      ...record,
      startedAt: nowIso(),
      checks: record.checks.map((c) => ({ ...c, intervalIdx: 0, lastRunAt: nowIso(), state: checkStateFromWalk(checksById[c.id].history, 0, record.requiredConsecutive) })),
      incidentState: "Recovering",
    };
    persist(next);
    mirrorIncident("Recovering", "Recovery validation started", `${CHECKS.length} checks queued · ${record.requiredConsecutive} consecutive intervals required.`);
    audit("Validation suite started", "First interval reading captured across all checks.");
  };

  const advanceObservation = () => {
    if (!record || !canWrite) return;
    if (connectorDown) {
      audit("Observation blocked", "Telemetry connector offline — retry after connector recovers.", "warning");
      return;
    }
    const next: RecoveryRecord = {
      ...record,
      checks: record.checks.map((c) => {
        const hist = checksById[c.id].history;
        const idx = Math.min(c.intervalIdx + 1, hist.length - 1);
        return { ...c, intervalIdx: idx, lastRunAt: nowIso(), state: checkStateFromWalk(hist, idx, record.requiredConsecutive) };
      }),
    };
    // recompute incident state
    const derivedState = deriveIncidentState(next, checksById, isTier1);
    persist({ ...next, incidentState: derivedState });
    audit("Observation window advanced", `Now consuming interval ${next.checks[0].intervalIdx + 1} · state ${derivedState}.`);
  };

  const rerunFailed = () => {
    if (!record || !canWrite) return;
    if (connectorDown) {
      audit("Rerun blocked", "Telemetry connector offline.", "warning");
      return;
    }
    // Deterministic: rerun re-samples the same interval; if failure was on interval 0, walk forward once.
    const next: RecoveryRecord = {
      ...record,
      checks: record.checks.map((c) => {
        if (c.state !== "failed") return c;
        const hist = checksById[c.id].history;
        const idx = Math.min(c.intervalIdx + 1, hist.length - 1);
        return { ...c, intervalIdx: idx, lastRunAt: nowIso(), state: checkStateFromWalk(hist, idx, record.requiredConsecutive) };
      }),
    };
    const derivedState = deriveIncidentState(next, checksById, isTier1);
    persist({ ...next, incidentState: derivedState });
    audit("Failed checks re-run", `Re-sampled failing checks · state ${derivedState}.`);
  };

  const extendObservation = () => {
    if (!record || !canWrite) return;
    const next: RecoveryRecord = {
      ...record,
      observationWindowMin: record.observationWindowMin + 15,
      incidentState: "Observation Active",
    };
    persist(next);
    mirrorIncident("Observation Active", "Observation extended", `Window extended to ${next.observationWindowMin} minutes.`);
    audit("Observation extended", `Window now ${next.observationWindowMin} minutes.`);
  };

  const openTelemetry = (id: string) => {
    const c = checksById[id];
    if (!c) return;
    audit("Telemetry link opened", `${c.title} · ${c.telemetryHref}`);
    // In-app: also record it as evidence-follow; external link opened in new tab.
    window.open(c.telemetryHref, "_blank", "noopener,noreferrer");
  };

  const returnToMitigation = () => {
    if (!canWrite) return;
    audit("Returned to mitigation", "Recovery inconclusive — reopening remediation comparison.", "warning");
    navigate(`/runops/incidents/${incidentId}/remediations`);
  };

  const initiateRollback = () => {
    if (!record || !canWrite || !dialogNote.trim()) return;
    const next: RecoveryRecord = {
      ...record,
      incidentState: "Validation Failed",
    };
    persist(next);
    mirrorIncident("Validation Failed", "Rollback initiated", dialogNote.trim());
    audit("Rollback initiated", dialogNote.trim(), "critical");
    setDialog(null); setDialogNote("");
    navigate(`/runops/incidents/${incidentId}/remediations`);
  };

  const recordResidualRisk = () => {
    if (!record || !canWrite || !dialogNote.trim()) return;
    const note = dialogNote.trim();
    const next: RecoveryRecord = {
      ...record,
      residualRisk: note,
      incidentState: "Residual Risk Accepted",
    };
    persist(next);
    mirrorIncident("Residual Risk Accepted", "Residual risk recorded", note, { recovery: { startedAt: record.startedAt, residualRisk: note } });
    audit("Residual risk accepted", note, "warning");
    setDialog(null); setDialogNote("");
  };

  const moveToMonitoring = () => {
    if (!record || !canWrite) return;
    if (closureBlockers.length > 0 && record.incidentState !== "Residual Risk Accepted" && record.incidentState !== "Validation Passed") {
      audit("Cannot move to monitoring", closureBlockers.join(" "), "warning");
      return;
    }
    const next: RecoveryRecord = { ...record, incidentState: "Monitoring" };
    persist(next);
    mirrorIncident("Monitoring", "Incident moved to Monitoring", "Awaiting stability before resolution.");
    audit("Incident moved to Monitoring", "Service Digital Twin, Command Center, SLO Center and Operations Queue updated.");
    setDialog(null);
  };

  const resolveIncident = () => {
    if (!record || !canWrite) return;
    if (!canResolve) {
      audit("Cannot resolve incident", closureBlockers.join(" "), "warning");
      return;
    }
    const next: RecoveryRecord = { ...record, incidentState: "Resolved" };
    persist(next);
    mirrorIncident(
      "Resolved",
      "Incident resolved",
      "All mandatory checks passed and customer experience recovered.",
      { closedAt: nowIso(), recovery: { startedAt: record.startedAt, passedAt: nowIso(), residualRisk: record.residualRisk } },
    );
    audit("Incident resolved", "Cross-screen: Service Digital Twin, Command Center, SLO Center, execution state, communications and operations queue updated.");
    setDialog(null);
    navigate(`/runops/incidents/${incidentId}`);
  };

  const createProblem = () => {
    if (!record || !canWrite) return;
    if (record.problemId) {
      audit("Problem already exists", `Problem ${record.problemId} already created for this incident.`, "warning");
      return;
    }
    const id = "PRB-" + Math.floor(1000 + Math.random() * 9000).toString();
    const list = readList<StoredProblem>(PROBLEMS_KEY);
    // Idempotent by incidentId
    const existing = list.find((p) => p.incidentId === incidentId);
    const problemId = existing?.id ?? id;
    if (!existing) {
      writeList(PROBLEMS_KEY, [
        { id: problemId, incidentId, title: `Root-cause investigation for ${incidentId}`, createdAt: nowIso(), createdBy: ops.role },
        ...list,
      ]);
    }
    persist({ ...record, problemId });
    mirrorIncident(record.incidentState, "Problem created", `${problemId} linked to incident.`);
    audit(`Problem ${problemId} created`, "Long-term root-cause tracking initiated.");
    setDialog(null);
  };

  const schedulePostmortem = () => {
    if (!record || !canWrite || !dialogNote.trim()) return;
    // dialogNote is ISO date-ish string from input; if invalid, default to +48h
    let iso = dialogNote.trim();
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) iso = new Date(Date.now() + 48 * 3600_000).toISOString();
    else iso = d.toISOString();
    const list = readList<StoredPostmortem>(POSTMORTEMS_KEY);
    writeList(POSTMORTEMS_KEY, [
      { incidentId, scheduledAt: iso, scheduledBy: ops.role, createdAt: nowIso() },
      ...list.filter((p) => p.incidentId !== incidentId),
    ]);
    persist({ ...record, postmortemAt: iso });
    mirrorIncident(record.incidentState, "Postmortem scheduled", `Scheduled for ${new Date(iso).toLocaleString()}.`);
    audit("Postmortem scheduled", `${incidentId} · ${new Date(iso).toLocaleString()}`);
    setDialog(null); setDialogNote("");
  };

  const closeTemporaryChange = () => {
    if (!record || !canWrite) return;
    const next: RecoveryRecord = { ...record, temporaryChangeClosed: true };
    persist(next);
    mirrorIncident(record.incidentState, "Temporary change closed", "CHG-20391 revert marked permanent · rollback path retained.");
    audit("Temporary change closed", "Mitigation converted to permanent state.");
  };

  const openPostmortem = () => {
    audit("Postmortem workspace opened", `${incidentId} · /runops/incidents/${incidentId}/postmortem`);
    navigate(`/runops/incidents/${incidentId}/postmortem`);
  };

  /* ------------------------------ Render ------------------------------ */

  if (!record || !derived) {
    return (
      <div className="flex flex-col">
        <EntityHeader title="Recovery Validation" subtitle="Loading recovery record…" />
        <div className="p-6 text-sm text-slate-600">Preparing recovery record for {incidentId}…</div>
      </div>
    );
  }

  const service = ops.selectedService;

  return (
    <div className="flex flex-col">
      <EntityHeader
        eyebrow={`Incident · ${incidentId}`}
        title="Recovery Validation & Closure"
        subtitle={`Confirm service and customer recovery for ${service.name} · ${service.tier} · ${ops.environment}`}
        status={
          <Badge variant="outline" className={cn("gap-1", incidentTone(record.incidentState))}>
            {record.incidentState === "Resolved" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
             record.incidentState === "Validation Failed" ? <XCircle className="h-3.5 w-3.5" /> :
             record.incidentState === "Residual Risk Accepted" ? <AlertTriangle className="h-3.5 w-3.5" /> :
             <Activity className="h-3.5 w-3.5" />}
            {record.incidentState}
          </Badge>
        }
        meta={[
          { label: "Tier", value: service.tier },
          { label: "Started", value: record.startedAt ? new Date(record.startedAt).toLocaleTimeString() : "—" },
          { label: "Window", value: `${record.observationWindowMin} min` },
          { label: "Consecutive OK required", value: String(record.requiredConsecutive) },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={startValidation}
              disabled={!canWrite || !!record.startedAt || connectorDown}
              className="gap-1"
              aria-label="Run validation suite"
            >
              <PlayCircle className="h-4 w-4" /> Run validation suite
            </Button>
            <Button
              variant="outline"
              onClick={advanceObservation}
              disabled={!canWrite || !record.startedAt || connectorDown}
              className="gap-1"
              aria-label="Advance observation window"
            >
              <ChevronRight className="h-4 w-4" /> Advance observation
            </Button>
            <Button
              variant="outline"
              onClick={rerunFailed}
              disabled={!canWrite || derived.failed === 0 || connectorDown}
              className="gap-1"
              aria-label="Rerun failed checks"
            >
              <RefreshCw className="h-4 w-4" /> Rerun failed
            </Button>
            <Button
              variant="outline"
              onClick={extendObservation}
              disabled={!canWrite || !record.startedAt}
              className="gap-1"
              aria-label="Extend observation window"
            >
              <Timer className="h-4 w-4" /> Extend +15m
            </Button>
          </div>
        }
      />

      {/* Connector toggle for demo */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-500" />
            Telemetry connector:{" "}
            <span className={connectorDown ? "font-medium text-red-700" : "font-medium text-emerald-700"}>
              {connectorDown ? "Offline" : "Online"}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConnectorDown((v) => !v)}
            aria-label="Toggle telemetry connector availability"
          >
            {connectorDown ? "Restore connector" : "Simulate outage"}
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryTile
            icon={<Gauge className="h-4 w-4 text-slate-600" />}
            label="Infrastructure recovery"
            value={`${derived.infraPassed}/${derived.infraTotal}`}
            sub="checks passed"
            tone={derived.infraPassed === derived.infraTotal ? "ok" : "warn"}
          />
          <SummaryTile
            icon={<Users className="h-4 w-4 text-blue-600" />}
            label="Customer recovery"
            value={`${derived.custPassed}/${derived.custTotal}`}
            sub="journeys green"
            tone={derived.custPassed === derived.custTotal ? "ok" : "warn"}
          />
          <SummaryTile
            icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
            label="Failed checks"
            value={String(derived.failed)}
            sub={derived.mandatoryFailed ? `${derived.mandatoryFailed} mandatory` : "none mandatory"}
            tone={derived.failed === 0 ? "ok" : "fail"}
          />
          <SummaryTile
            icon={<Heart className="h-4 w-4 text-red-600" />}
            label="Closure gate"
            value={canResolve ? "Ready" : "Blocked"}
            sub={canResolve ? "Resolution allowed" : `${closureBlockers.length} blocker(s)`}
            tone={canResolve ? "ok" : "warn"}
          />
        </div>

        {closureBlockers.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/60">
            <CardContent className="p-4 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <ShieldAlert className="h-4 w-4" /> Closure blocked
              </div>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                {closureBlockers.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList aria-label="Recovery views">
            <TabsTrigger value="validation">Validation ({derived.passed}/{derived.total})</TabsTrigger>
            <TabsTrigger value="history">Interval history</TabsTrigger>
            <TabsTrigger value="closure">Closure actions</TabsTrigger>
          </TabsList>

          <TabsContent value="validation" className="space-y-4 pt-4">
            {(["Customer", "Service", "Data"] as const).map((section) => (
              <div key={section} className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  {sectionIcon(section)} {section} checks
                </h3>
                <div className="grid gap-3">
                  {CHECKS.filter((c) => c.section === section).map((c) => {
                    const mut = mutableById[c.id];
                    const idx = mut?.intervalIdx ?? -1;
                    const sample = idx >= 0 ? c.history[idx] : null;
                    const consecutive = mut ? countConsecutiveOk(c.history, mut.intervalIdx) : 0;
                    return (
                      <Card key={c.id} className="border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-900">{c.title}</span>
                                <Badge variant="outline" className={cn("text-xs", stateTone(mut?.state ?? "pending"))}>
                                  {mut?.state ?? "pending"}
                                </Badge>
                                {c.mandatoryForTier1 && (
                                  <Badge variant="outline" className="border-slate-300 text-[10px] uppercase tracking-wide text-slate-600">
                                    Tier 1 mandatory
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                                  {c.recovery === "customer" ? "Customer signal" : c.recovery === "data" ? "Data signal" : "Infra signal"}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-slate-600">{c.what}</p>
                              <p className="mt-1 text-xs text-slate-500">Threshold: {c.threshold}</p>

                              <div className="mt-3 flex items-center gap-2">
                                {c.history.map((s, i) => (
                                  <span
                                    key={i}
                                    className={cn(
                                      "h-2 w-6 rounded-sm",
                                      i <= idx ? intervalTone(s.status) : "bg-slate-200",
                                    )}
                                    title={`+${s.minute}m · ${s.value} ${s.unit}${s.note ? " · " + s.note : ""}`}
                                    aria-label={`Interval +${s.minute} minutes: ${s.value} ${s.unit}, ${s.status}`}
                                  />
                                ))}
                                <span className="ml-2 text-xs text-slate-500">
                                  {consecutive}/{record.requiredConsecutive} consecutive ok
                                </span>
                              </div>

                              {sample && (
                                <p className="mt-2 text-xs text-slate-600">
                                  Latest: <span className="font-mono">{sample.value} {sample.unit}</span>
                                  {" · +"}{sample.minute}m
                                  {sample.note ? <span className="text-slate-500"> · {sample.note}</span> : null}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openTelemetry(c.id)}
                                  className="gap-1"
                                  aria-label={`Open supporting telemetry for ${c.title}`}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> Telemetry
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (!record || !canWrite || connectorDown) {
                                      audit("Cannot rerun check", connectorDown ? "Connector offline." : "Insufficient permissions.", "warning");
                                      return;
                                    }
                                    const nextIdx = Math.min((mut?.intervalIdx ?? -1) + 1, c.history.length - 1);
                                    const nextChecks = record.checks.map((cc) =>
                                      cc.id === c.id
                                        ? { ...cc, intervalIdx: nextIdx, lastRunAt: nowIso(), state: checkStateFromWalk(c.history, nextIdx, record.requiredConsecutive) }
                                        : cc,
                                    );
                                    const nextRec: RecoveryRecord = { ...record, checks: nextChecks };
                                    const derivedState = deriveIncidentState(nextRec, checksById, isTier1);
                                    persist({ ...nextRec, incidentState: derivedState });
                                    audit(`Check re-run · ${c.title}`, `Now ${nextChecks.find((n) => n.id === c.id)?.state}.`);
                                  }}
                                  disabled={!canWrite || !record.startedAt || connectorDown}
                                  className="gap-1"
                                  aria-label={`Rerun ${c.title}`}
                                >
                                  <RotateCcw className="h-3.5 w-3.5" /> Rerun
                                </Button>
                              </div>
                              {mut?.lastRunAt && (
                                <span className="text-[11px] text-slate-500">
                                  Last read {new Date(mut.lastRunAt).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="history" className="pt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="p-2 text-left font-medium">Check</th>
                        {[2, 5, 10, 15, 20, 25].map((m) => (
                          <th key={m} className="p-2 text-center font-medium">+{m}m</th>
                        ))}
                        <th className="p-2 text-left font-medium">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CHECKS.map((c) => {
                        const mut = mutableById[c.id];
                        const idx = mut?.intervalIdx ?? -1;
                        return (
                          <tr key={c.id} className="border-t border-slate-100">
                            <td className="p-2">
                              <div className="font-medium text-slate-800">{c.title}</div>
                              <div className="text-[11px] text-slate-500">{c.section} · {c.recovery}</div>
                            </td>
                            {c.history.map((s, i) => (
                              <td key={i} className="p-2 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span
                                    className={cn("h-2 w-8 rounded-sm", i <= idx ? intervalTone(s.status) : "bg-slate-200")}
                                    aria-label={`+${s.minute}m ${s.status}`}
                                  />
                                  <span className={cn("font-mono text-[11px]", i <= idx ? "text-slate-700" : "text-slate-400")}>
                                    {s.value}
                                  </span>
                                </div>
                              </td>
                            ))}
                            <td className="p-2">
                              <Badge variant="outline" className={cn("text-xs", stateTone(mut?.state ?? "pending"))}>
                                {mut?.state ?? "pending"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="closure" className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-sm font-medium text-slate-900">Move incident forward</h4>
                  <p className="text-xs text-slate-600">
                    Prevented until customer and data recovery are confirmed
                    {isTier1 ? " and all mandatory Tier 1 checks pass" : ""}.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setDialog("monitor")}
                      disabled={!canWrite || record.incidentState === "Resolved" || record.incidentState === "Monitoring"}
                      className="gap-1"
                      aria-label="Move to Monitoring"
                    >
                      <TrendingDown className="h-4 w-4" /> Move to Monitoring
                    </Button>
                    <Button
                      onClick={() => setDialog("resolve")}
                      disabled={!canWrite || !canResolve}
                      className="gap-1"
                      aria-label="Resolve incident"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Resolve incident
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDialog("rollback")}
                      disabled={!canWrite}
                      className="gap-1"
                      aria-label="Initiate rollback"
                    >
                      <RotateCcw className="h-4 w-4" /> Initiate rollback
                    </Button>
                    <Button
                      variant="outline"
                      onClick={returnToMitigation}
                      disabled={!canWrite}
                      className="gap-1"
                      aria-label="Return to mitigation"
                    >
                      <TrendingUp className="h-4 w-4" /> Return to mitigation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-sm font-medium text-slate-900">Follow-through</h4>
                  <p className="text-xs text-slate-600">Records evidence and creates the follow-up artifacts.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setDialog("residual")}
                      disabled={!canWrite}
                      className="gap-1"
                      aria-label="Record residual risk"
                    >
                      <ShieldAlert className="h-4 w-4" /> Record residual risk
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDialog("problem")}
                      disabled={!canWrite}
                      className="gap-1"
                      aria-label="Create problem"
                    >
                      <FileText className="h-4 w-4" /> Create problem
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDialog("postmortem")}
                      disabled={!canWrite}
                      className="gap-1"
                      aria-label="Schedule postmortem"
                    >
                      <Clock className="h-4 w-4" /> Schedule postmortem
                    </Button>
                    <Button
                      variant="outline"
                      onClick={closeTemporaryChange}
                      disabled={!canWrite || record.temporaryChangeClosed}
                      className="gap-1"
                      aria-label="Close temporary change"
                    >
                      <ShieldCheck className="h-4 w-4" /> Close temp change
                    </Button>
                    {record.incidentState === "Resolved" && (
                      <Button
                        variant="outline"
                        onClick={openPostmortem}
                        className="gap-1"
                        aria-label="Open postmortem workspace"
                      >
                        <FileText className="h-4 w-4" /> Open postmortem workspace
                      </Button>
                    )}
                  </div>

                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                    <dt className="text-slate-500">Residual risk</dt>
                    <dd className="truncate">{record.residualRisk ?? "—"}</dd>
                    <dt className="text-slate-500">Problem</dt>
                    <dd>{record.problemId ?? "—"}</dd>
                    <dt className="text-slate-500">Postmortem</dt>
                    <dd>{record.postmortemAt ? new Date(record.postmortemAt).toLocaleString() : "—"}</dd>
                    <dt className="text-slate-500">Temp change</dt>
                    <dd>{record.temporaryChangeClosed ? "Closed" : "Open"}</dd>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {!canWrite && (
          <p className="text-xs text-slate-500">
            Your role ({ops.role}) can view recovery evidence but cannot mutate this incident.
          </p>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={dialog !== null} onOpenChange={(v) => { if (!v) { setDialog(null); setDialogNote(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "rollback"   && "Initiate rollback"}
              {dialog === "residual"   && "Record residual risk"}
              {dialog === "problem"    && "Create problem record"}
              {dialog === "postmortem" && "Schedule postmortem"}
              {dialog === "resolve"    && "Resolve incident"}
              {dialog === "monitor"    && "Move incident to Monitoring"}
            </DialogTitle>
          </DialogHeader>

          {dialog === "rollback" && (
            <Textarea
              placeholder="Reason for rollback (required) — what recovery signal failed and what will you revert?"
              value={dialogNote}
              onChange={(e) => setDialogNote(e.target.value)}
              aria-label="Rollback reason"
            />
          )}
          {dialog === "residual" && (
            <Textarea
              placeholder="Describe residual risk (required) — what is not fully recovered but is being accepted?"
              value={dialogNote}
              onChange={(e) => setDialogNote(e.target.value)}
              aria-label="Residual risk description"
            />
          )}
          {dialog === "problem" && (
            <p className="text-sm text-slate-700">
              This creates a Problem record linked to {incidentId} for long-term root-cause tracking.
              A problem is created only if one does not already exist for this incident.
            </p>
          )}
          {dialog === "postmortem" && (
            <div className="space-y-2">
              <Select value={dialogNote} onValueChange={setDialogNote}>
                <SelectTrigger aria-label="Postmortem window">
                  <SelectValue placeholder="Select when to schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={new Date(Date.now() + 24 * 3600_000).toISOString()}>In 24 hours</SelectItem>
                  <SelectItem value={new Date(Date.now() + 48 * 3600_000).toISOString()}>In 48 hours</SelectItem>
                  <SelectItem value={new Date(Date.now() + 72 * 3600_000).toISOString()}>In 72 hours</SelectItem>
                  <SelectItem value={new Date(Date.now() + 5 * 24 * 3600_000).toISOString()}>In 5 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Best practice is within 5 business days of resolution.</p>
            </div>
          )}
          {dialog === "resolve" && (
            <div className="space-y-2 text-sm text-slate-700">
              <p>Resolving will update:</p>
              <ul className="list-disc pl-6 text-xs text-slate-600 space-y-1">
                <li>Service Digital Twin health banner</li>
                <li>Command Center incident list</li>
                <li>SLO Center burn status</li>
                <li>Execution monitor terminal state</li>
                <li>Stakeholder Communications (enables final "Resolved" update)</li>
                <li>Operations Queue closes related tasks</li>
              </ul>
              {closureBlockers.length > 0 && (
                <p className="text-xs text-red-700">Blocked: {closureBlockers.join(" ")}</p>
              )}
            </div>
          )}
          {dialog === "monitor" && (
            <p className="text-sm text-slate-700">
              Moves incident into an active observation state while remediation stabilises.
              Resolution remains blocked until customer recovery is confirmed.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialog(null); setDialogNote(""); }}>Cancel</Button>
            {dialog === "rollback"   && <Button variant="destructive" onClick={initiateRollback} disabled={!dialogNote.trim()}>Confirm rollback</Button>}
            {dialog === "residual"   && <Button onClick={recordResidualRisk} disabled={!dialogNote.trim()}>Record risk</Button>}
            {dialog === "problem"    && <Button onClick={createProblem}>Create problem</Button>}
            {dialog === "postmortem" && <Button onClick={schedulePostmortem} disabled={!dialogNote.trim()}>Schedule</Button>}
            {dialog === "resolve"    && <Button onClick={resolveIncident} disabled={!canResolve}>Resolve incident</Button>}
            {dialog === "monitor"    && <Button onClick={moveToMonitoring}>Move to Monitoring</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------- Local pure helpers --------------------------- */

function countConsecutiveOk(history: CheckSample[], idx: number): number {
  if (idx < 0) return 0;
  const seen = history.slice(0, idx + 1);
  let n = 0;
  for (let i = seen.length - 1; i >= 0; i--) {
    if (seen[i].status === "ok") n++;
    else break;
  }
  return n;
}

function deriveIncidentState(
  rec: RecoveryRecord,
  byId: Record<string, CanonicalCheck>,
  isTier1: boolean,
): IncidentState {
  let passed = 0, failed = 0, recovering = 0, pending = 0;
  let mandatoryFailed = 0, customerFailed = 0, dataFailed = 0;
  for (const m of rec.checks) {
    const c = byId[m.id];
    if (!c) continue;
    if (m.state === "passed") passed++;
    else if (m.state === "failed") failed++;
    else if (m.state === "recovering") recovering++;
    else pending++;
    if (m.state === "failed") {
      if (c.mandatoryForTier1) mandatoryFailed++;
      if (c.recovery === "customer") customerFailed++;
      if (c.recovery === "data") dataFailed++;
    }
  }
  if (rec.incidentState === "Resolved") return "Resolved";
  if (rec.incidentState === "Residual Risk Accepted") return "Residual Risk Accepted";
  if (rec.incidentState === "Validation Failed") return "Validation Failed";
  if (passed === rec.checks.length) return "Validation Passed";
  if (isTier1 && mandatoryFailed > 0) return "Validation Failed";
  if (customerFailed > 0 || dataFailed > 0) return "Partially Recovered";
  if (recovering > 0) return "Recovering";
  if (pending === rec.checks.length) return "Validation Pending";
  return rec.incidentState;
}

interface SummaryTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: "ok" | "warn" | "fail";
}
function SummaryTile({ icon, label, value, sub, tone }: SummaryTileProps) {
  const toneClass =
    tone === "ok"   ? "border-emerald-200 bg-emerald-50/50"
  : tone === "warn" ? "border-amber-200 bg-amber-50/50"
  :                   "border-red-200 bg-red-50/50";
  return (
    <div className={cn("rounded-md border p-3", toneClass)}>
      <div className="flex items-center gap-2 text-xs text-slate-600">{icon} {label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-600">{sub}</div>
    </div>
  );
}
