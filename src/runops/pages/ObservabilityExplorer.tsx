/**
 * Page 7 · Observability & Telemetry Explorer
 * Route: /runops/services/:serviceId/observability
 *
 * Unified investigation surface for metrics, logs, traces, events, and
 * business transactions. All data flows through OperationsProvider — no
 * page-local fixture imports. Telemetry is deterministic; every source
 * declares provenance, freshness, sampling, gaps, and confidence.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Bookmark, ExternalLink, GitCommit, LineChart as LineIcon, Pin, Play,
  Search as SearchIcon, ShieldCheck, Sparkles, TimerReset, Waypoints, Zap,
} from "lucide-react";
import {
  TelemetryChart, TraceWaterfall, LogTable,
  type TelemetrySeries, type TraceSpan, type LogRow,
  StatusIndicator, FreshnessIndicator, SourceProvenance,
  EvidenceCitation, EmptyState, ErrorState, StaleDataState,
  PermissionDeniedState, ConnectorUnavailableState,
  type Provenance,
} from "@/runops/components";
import { useOperations, useRightDrawer } from "@/runops/state/RunOpsProviders";
import type { BusinessService, Change, Connector } from "@/runops/data/scenario";

/* -------------------------------------------------------------------------- */
/* Constants & persistence                                                    */
/* -------------------------------------------------------------------------- */

const DEFAULT_SERVICE_ID = "svc-global-order-processing";
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

const LS_SAVED_QUERIES = "runops.observability.savedQueries.v1";
const LS_PINNED_EVIDENCE = "runops.observability.pinnedEvidence.v1";
const LS_DRAFT_CHECKS = "runops.observability.draftChecks.v1";
const LS_DRAFT_TRIGGERS = "runops.observability.draftTriggers.v1";

interface SavedQuery {
  id: string;
  name: string;
  query: string;
  serviceId: string;
  timeRange: string;
  createdAt: string;
}
interface PinnedEvidence {
  id: string;
  incidentId: string;
  title: string;
  snippet: string;
  source: string;
  capturedAt: string;
  kind: "metric" | "log" | "trace" | "event";
}
interface DraftCheck {
  id: string;
  name: string;
  runbookHint: string;
  serviceId: string;
  query: string;
  createdAt: string;
}
interface DraftTrigger {
  id: string;
  name: string;
  runbookHint: string;
  serviceId: string;
  condition: string;
  createdAt: string;
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function writeLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/* -------------------------------------------------------------------------- */
/* Deterministic telemetry generation                                         */
/* -------------------------------------------------------------------------- */

interface TelemetryContext {
  incidentActive: boolean;
  recovering: boolean;
  sampleStride: number;    // >1 for high-volume sampling
  onsetIndex: number;      // minute at which degradation begins in the window
  recoveryIndex: number;   // minute at which recovery begins
}

/**
 * Build a deterministic time series over the last 60 minutes.
 * `fn(minute, ctx)` maps minute index (0..59) to metric value.
 * `label` at :MM in "hh:mm" form so charts read as clock time.
 */
function buildSeries(
  key: string,
  label: string,
  tone: TelemetrySeries["tone"],
  ctx: TelemetryContext,
  fn: (minute: number, ctx: TelemetryContext) => number,
): TelemetrySeries {
  const points: TelemetrySeries["points"] = [];
  for (let i = 0; i < 60; i += ctx.sampleStride) {
    const mm = String(i).padStart(2, "0");
    points.push({ t: `10:${mm}`, v: Math.round(fn(i, ctx) * 100) / 100 });
  }
  return { key, label, tone, points };
}

/** Smooth curve helpers. Purely deterministic — no Math.random. */
const wave = (i: number, period: number, amp: number, phase = 0): number =>
  Math.sin((2 * Math.PI * (i + phase)) / period) * amp;

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

type CompareMode = "live" | "baseline" | "compare";

interface PanelSourceMeta {
  connector: string;
  system: string;
  samplingPct: number;
  gaps: string;
  confidence: number;
}

export default function ObservabilityExplorer() {
  const params = useParams<{ serviceId: string }>();
  const serviceId = params.serviceId ?? DEFAULT_SERVICE_ID;
  const ops = useOperations();
  const { openDrawer } = useRightDrawer();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const service: BusinessService | undefined = useMemo(
    () => ops.services.find((s) => s.id === serviceId),
    [ops.services, serviceId],
  );

  const readOnly = ops.role === "Read Only User";

  // Sync selection into global context.
  useEffect(() => {
    if (service && ops.selectedServiceId !== service.id) {
      ops.setSelectedService(service.id);
    }
  }, [service, ops]);

  /* --------------------------- URL-driven state -------------------------- */

  const initialQuery = searchParams.get("q") ?? "";
  const initialComponent = searchParams.get("component") ?? "all";
  const initialFrom = searchParams.get("from");
  const initialTo = searchParams.get("to");
  const initialCompare = (searchParams.get("mode") as CompareMode | null) ?? "live";
  const initialSampling = searchParams.get("sampling") === "high";
  const initialLogsDown = searchParams.get("logs") === "down";
  const initialFocusMinute = searchParams.get("focus");

  const [query, setQuery] = useState<string>(initialQuery);
  const [componentFilter, setComponentFilter] = useState<string>(initialComponent);
  const [timeFrom, setTimeFrom] = useState<string>(initialFrom ?? "10:00");
  const [timeTo, setTimeTo] = useState<string>(initialTo ?? "10:59");
  const [compareMode, setCompareMode] = useState<CompareMode>(initialCompare);
  const [highVolumeSampling, setHighVolumeSampling] = useState<boolean>(initialSampling);
  const [logConnectorDown, setLogConnectorDown] = useState<boolean>(initialLogsDown);
  const [focusMinute, setFocusMinute] = useState<number | null>(
    initialFocusMinute ? Number(initialFocusMinute) : null,
  );

  // Persist toolbar state into URL so cross-screen state survives.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    const set = (k: string, v: string | null) => {
      if (v == null || v === "") next.delete(k); else next.set(k, v);
    };
    set("q", query || null);
    set("component", componentFilter === "all" ? null : componentFilter);
    set("from", timeFrom);
    set("to", timeTo);
    set("mode", compareMode === "live" ? null : compareMode);
    set("sampling", highVolumeSampling ? "high" : null);
    set("logs", logConnectorDown ? "down" : null);
    set("focus", focusMinute != null ? String(focusMinute) : null);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    query, componentFilter, timeFrom, timeTo, compareMode,
    highVolumeSampling, logConnectorDown, focusMinute,
  ]);

  /* --------------------------- Persistence state ------------------------- */

  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(() =>
    readLS<SavedQuery[]>(LS_SAVED_QUERIES, []));
  const [pinnedEvidence, setPinnedEvidence] = useState<PinnedEvidence[]>(() =>
    readLS<PinnedEvidence[]>(LS_PINNED_EVIDENCE, []));
  const [drafts, setDrafts] = useState<{ checks: DraftCheck[]; triggers: DraftTrigger[] }>(() => ({
    checks: readLS<DraftCheck[]>(LS_DRAFT_CHECKS, []),
    triggers: readLS<DraftTrigger[]>(LS_DRAFT_TRIGGERS, []),
  }));

  useEffect(() => writeLS(LS_SAVED_QUERIES, savedQueries), [savedQueries]);
  useEffect(() => writeLS(LS_PINNED_EVIDENCE, pinnedEvidence), [pinnedEvidence]);
  useEffect(() => writeLS(LS_DRAFT_CHECKS, drafts.checks), [drafts.checks]);
  useEffect(() => writeLS(LS_DRAFT_TRIGGERS, drafts.triggers), [drafts.triggers]);

  /* --------------------------- Dialogs ----------------------------------- */

  const [saveQueryOpen, setSaveQueryOpen] = useState(false);
  const [saveQueryName, setSaveQueryName] = useState("");
  const [checkOpen, setCheckOpen] = useState(false);
  const [checkName, setCheckName] = useState("");
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [triggerName, setTriggerName] = useState("");
  const [triggerCondition, setTriggerCondition] = useState("");
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  /* --------------------------- Telemetry context ------------------------- */

  const incidentActive = ops.stageIndex >= 4 && ops.stageIndex < 13;
  const recovering = ops.stageIndex >= 13;
  const telemetryCtx: TelemetryContext = useMemo(() => ({
    incidentActive,
    recovering,
    sampleStride: highVolumeSampling ? 3 : 1,
    onsetIndex: 7,      // 10:07 CT
    recoveryIndex: 45,  // 10:45 CT
  }), [incidentActive, recovering, highVolumeSampling]);

  const baselineCtx: TelemetryContext = useMemo(() => ({
    ...telemetryCtx, incidentActive: false, recovering: false,
  }), [telemetryCtx]);

  const activeCtx: TelemetryContext = useMemo(() =>
    compareMode === "baseline" ? baselineCtx : telemetryCtx,
    [compareMode, baselineCtx, telemetryCtx],
  );

  /* --------------------------- Metric functions -------------------------- */

  const fLatency = (i: number, c: TelemetryContext): number => {
    const base = 420 + wave(i, 20, 25);
    if (!c.incidentActive && !c.recovering) return base;
    if (c.recovering && i >= c.recoveryIndex) return Math.max(base, 900 - (i - c.recoveryIndex) * 30);
    if (i < c.onsetIndex) return base;
    return Math.min(2800, base + (i - c.onsetIndex) * 190);
  };
  const fSuccess = (i: number, c: TelemetryContext): number => {
    const base = 99.7 - Math.abs(wave(i, 30, 0.1));
    if (!c.incidentActive && !c.recovering) return base;
    if (c.recovering && i >= c.recoveryIndex) return Math.min(99.7, 92 + (i - c.recoveryIndex) * 0.3);
    if (i < c.onsetIndex) return base;
    return Math.max(91.0, base - (i - c.onsetIndex) * 0.24);
  };
  const fErrorRate = (i: number, c: TelemetryContext): number => Math.max(0, 100 - fSuccess(i, c));
  const fSqlUtil = (i: number, c: TelemetryContext): number => {
    const base = 42 + wave(i, 15, 4);
    if (!c.incidentActive && !c.recovering) return base;
    if (c.recovering && i >= c.recoveryIndex) return Math.max(base, 90 - (i - c.recoveryIndex) * 3);
    if (i < c.onsetIndex) return base;
    return Math.min(98, base + (i - c.onsetIndex) * 6);
  };
  const fQueueDepth = (i: number, c: TelemetryContext): number => {
    const base = 120 + wave(i, 22, 18);
    if (!c.incidentActive && !c.recovering) return base;
    if (c.recovering && i >= c.recoveryIndex) return Math.max(base, 800 - (i - c.recoveryIndex) * 40);
    if (i < c.onsetIndex) return base;
    return Math.min(1400, base + (i - c.onsetIndex) * 55);
  };
  const fK8sCpu = (i: number, c: TelemetryContext): number => 58 + wave(i, 12, 6) + (c.incidentActive ? 4 : 0);
  const fTxVolume = (i: number): number => 1450 + wave(i, 25, 90);

  /* --------------------------- Panels ------------------------------------ */

  const buildOverlaid = (
    key: string, label: string, tone: TelemetrySeries["tone"],
    fn: (i: number, c: TelemetryContext) => number,
  ): TelemetrySeries[] => {
    const live = buildSeries(key, label, tone, activeCtx, fn);
    if (compareMode !== "compare") return [live];
    const baseline = buildSeries(`${key}-baseline`, `${label} · Baseline`, "neutral", baselineCtx, fn);
    return [live, baseline];
  };

  const latencySeries = useMemo(() => buildOverlaid("latency", "Checkout p95 (ms)", "warning", fLatency), [activeCtx, baselineCtx, compareMode]);
  const successSeries = useMemo(() => buildOverlaid("success", "Success (%)", "healthy", fSuccess), [activeCtx, baselineCtx, compareMode]);
  const errorSeries   = useMemo(() => buildOverlaid("error",   "Error rate (%)", "failure", fErrorRate), [activeCtx, baselineCtx, compareMode]);
  const sqlSeries     = useMemo(() => buildOverlaid("sql",     "SQL connections (%)", "failure", fSqlUtil), [activeCtx, baselineCtx, compareMode]);
  const queueSeries   = useMemo(() => buildOverlaid("queue",   "Kafka orders depth", "warning", fQueueDepth), [activeCtx, baselineCtx, compareMode]);
  const k8sSeries     = useMemo(() => buildOverlaid("k8scpu",  "AKS checkout CPU (%)", "connected", fK8sCpu), [activeCtx, baselineCtx, compareMode]);
  const txSeries      = useMemo(() =>
    [buildSeries("tx", "Business transactions / min", "healthy", activeCtx, fTxVolume)],
    [activeCtx],
  );

  /* --------------------------- Change / alert markers -------------------- */

  const change: Change = ops.change;
  const changeMinute = 0; // 10:00 (visualized reference before onset)
  const alertMinute = telemetryCtx.onsetIndex + 2;

  /* --------------------------- Logs / traces / events -------------------- */

  const allLogs: LogRow[] = useMemo(() => {
    const rows: LogRow[] = [
      { id: "L-01", at: "10:03", level: "info",  service: "checkout-api", message: "healthcheck ok" },
      { id: "L-02", at: "10:07", level: "warn",  service: "checkout-api", message: "db pool wait exceeded 500ms" },
      { id: "L-03", at: "10:09", level: "error", service: "checkout-api", message: "SqlException: connection acquire timeout after 5000ms" },
      { id: "L-04", at: "10:12", level: "error", service: "orders-api",   message: "downstream checkout returned 503" },
      { id: "L-05", at: "10:14", level: "warn",  service: "sql-primary",  message: "plan_cache regression detected on q_top_checkout" },
      { id: "L-06", at: "10:18", level: "error", service: "checkout-api", message: "circuit_breaker=open dependency=sql-primary" },
      { id: "L-07", at: "10:23", level: "warn",  service: "kafka-orders", message: "consumer lag=782" },
      { id: "L-08", at: "10:28", level: "info",  service: "dw-ic-01",     message: "approval requested APR-4471 for RB-0042" },
      { id: "L-09", at: "10:34", level: "info",  service: "exec-8841",    message: "step s3 · revert index applied" },
      { id: "L-10", at: "10:41", level: "info",  service: "checkout-api", message: "db pool wait recovered <100ms" },
      { id: "L-11", at: "10:48", level: "info",  service: "checkout-api", message: "success ratio recovering: 96.4%" },
    ];
    return rows;
  }, []);

  const allTraces: { id: string; label: string; durationMs: number; hasError: boolean; atMinute: number; spans: TraceSpan[] }[] = useMemo(() => ([
    {
      id: "TR-9001", label: "POST /checkout", durationMs: 2810, hasError: true, atMinute: 12,
      spans: [
        { id: "s1", label: "POST /checkout",       service: "api-gateway",   startMs: 0,    durationMs: 2810, tone: "failure" },
        { id: "s2", label: "authorize",            service: "identity",      startMs: 10,   durationMs: 48,   tone: "healthy" },
        { id: "s3", label: "load cart",            service: "orders-api",    startMs: 60,   durationMs: 120,  tone: "healthy" },
        { id: "s4", label: "reserve inventory",    service: "checkout-api",  startMs: 190,  durationMs: 220,  tone: "warning" },
        { id: "s5", label: "sql select plan",      service: "sql-primary",   startMs: 420,  durationMs: 2280, tone: "failure" },
        { id: "s6", label: "publish order.created", service: "kafka-orders", startMs: 2710, durationMs: 90,   tone: "warning" },
      ],
    },
    {
      id: "TR-9002", label: "POST /checkout", durationMs: 480, hasError: false, atMinute: 3,
      spans: [
        { id: "s1", label: "POST /checkout",   service: "api-gateway",  startMs: 0,   durationMs: 480, tone: "healthy" },
        { id: "s2", label: "authorize",        service: "identity",     startMs: 8,   durationMs: 40,  tone: "healthy" },
        { id: "s3", label: "load cart",        service: "orders-api",   startMs: 55,  durationMs: 90,  tone: "healthy" },
        { id: "s4", label: "reserve inventory", service: "checkout-api", startMs: 160, durationMs: 130, tone: "healthy" },
        { id: "s5", label: "sql select plan",  service: "sql-primary",  startMs: 300, durationMs: 150, tone: "healthy" },
      ],
    },
    {
      id: "TR-9003", label: "POST /checkout", durationMs: 2110, hasError: true, atMinute: 20,
      spans: [
        { id: "s1", label: "POST /checkout",  service: "api-gateway", startMs: 0,   durationMs: 2110, tone: "failure" },
        { id: "s2", label: "load cart",       service: "orders-api",  startMs: 55,  durationMs: 110,  tone: "healthy" },
        { id: "s3", label: "sql select plan", service: "sql-primary", startMs: 180, durationMs: 1900, tone: "failure" },
      ],
    },
  ]), []);

  interface AlertEvent { id: string; at: string; atMinute: number; title: string; source: string; tone: "warning" | "failure" | "healthy" }
  const alertEvents: AlertEvent[] = useMemo(() => ([
    { id: "AE-1", at: "10:09", atMinute: 9,  title: "SLO burn accelerated · Checkout p95",   source: "Prometheus",       tone: "warning" },
    { id: "AE-2", at: "10:11", atMinute: 11, title: "Error rate breach · Checkout API",      source: "Prometheus",       tone: "failure" },
    { id: "AE-3", at: "10:12", atMinute: 12, title: "SQL connections >95% for 3m",           source: "Prometheus",       tone: "failure" },
    { id: "AE-4", at: "10:14", atMinute: 14, title: "Correlated situation SIT-4471 opened",  source: "Correlation svc",  tone: "failure" },
    { id: "AE-5", at: "10:41", atMinute: 41, title: "SLI recovery detected · Checkout p95",  source: "Prometheus",       tone: "healthy" },
  ]), []);

  /* --------------------------- Focus filtering --------------------------- */

  const focusWindowMin = 3;
  const inFocus = (minute: number): boolean =>
    focusMinute == null || Math.abs(minute - focusMinute) <= focusWindowMin;
  const filteredLogs = allLogs.filter((l) => {
    const [, m] = l.at.split(":");
    const minute = Number(m);
    if (!inFocus(minute)) return false;
    if (query.trim() && !`${l.service} ${l.message}`.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });
  const filteredTraces = allTraces.filter((t) => inFocus(t.atMinute));
  const filteredAlerts = alertEvents.filter((e) => inFocus(e.atMinute));

  /* --------------------------- Provenance -------------------------------- */

  const dataFreshnessMs = Date.now() - new Date(ops.dataFreshnessAt).getTime();
  const stale = dataFreshnessMs > STALE_THRESHOLD_MS;
  const otel: Connector | undefined = ops.connectors.find((c) => c.id === "CON-OTEL");
  const prom: Connector | undefined = ops.connectors.find((c) => c.id === "CON-PROM");

  const provenanceFor = (system: string): Provenance => ({
    source: "demo", system, capturedAt: ops.dataFreshnessAt,
  });
  const sampling = (baseline: number): number => highVolumeSampling ? Math.round(baseline / 3) : baseline;

  /* --------------------------- Handlers ---------------------------------- */

  const handleChartClick = (minute: number): void => {
    setFocusMinute((prev) => (prev === minute ? null : minute));
  };
  const openChangeDrawer = useCallback(() => {
    openDrawer({
      title: `${change.id} · ${change.title}`,
      subtitle: `Deployed ${change.deployedAt} · Risk ${change.risk}`,
      body: (
        <div className="space-y-3 text-xs text-slate-700">
          <div className="rounded border border-slate-200 bg-slate-50 p-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Change</div>
            <div className="mt-1 font-medium text-slate-900">{change.title}</div>
            <div>Service: {change.serviceId}</div>
            <div>Linked incident: {change.linkedIncidentId ?? "—"}</div>
          </div>
          <EvidenceCitation evidence={{
            id: "EV-CHG-20391", source: "Azure DevOps",
            title: "Deployment record", supports: "supports",
            snippet: `Deployment ${change.id} completed ${change.deployedAt}; query-plan change flagged by post-deploy analyzer at 10:04 CT.`,
            ref: change.id,
          }} />
          <Button size="sm" variant="outline" onClick={() => navigate(`/runops/changes/${change.id}`)}>
            <ExternalLink className="mr-1 h-3 w-3" /> Open change record
          </Button>
        </div>
      ),
    });
  }, [openDrawer, change, navigate]);

  const openTraceDrawer = (id: string): void => {
    const t = allTraces.find((x) => x.id === id);
    if (!t) return;
    openDrawer({
      title: `Trace ${t.id}`,
      subtitle: `${t.label} · ${t.durationMs} ms`,
      body: (
        <div className="space-y-3">
          <TraceWaterfall spans={t.spans} ariaLabel={`Waterfall for ${t.id}`} />
          <div className="text-[11px] text-slate-600">Related logs shown below reflect the ±3 minute window around this trace.</div>
          <LogTable rows={allLogs.filter((l) => {
            const m = Number(l.at.split(":")[1]);
            return Math.abs(m - t.atMinute) <= 3;
          })} />
          <Button size="sm" variant="outline"
            onClick={() => pinEvidence({
              id: `EV-${t.id}`, incidentId: ops.incident.id, title: `Trace ${t.id} — ${t.label}`,
              snippet: `Waterfall shows sql-primary span dominant (${t.durationMs} ms).`,
              source: otel?.name ?? "OpenTelemetry", capturedAt: new Date().toISOString(), kind: "trace",
            })}>
            <Pin className="mr-1 h-3 w-3" /> Pin this trace to incident
          </Button>
        </div>
      ),
    });
  };

  const pinEvidence = (ev: PinnedEvidence): void => {
    setPinnedEvidence((prev) => {
      if (prev.some((p) => p.id === ev.id)) return prev;
      return [ev, ...prev].slice(0, 32);
    });
    setConfirmMsg(`Pinned to ${ev.incidentId}: ${ev.title}`);
  };

  const handleSaveQuery = (): void => {
    const name = saveQueryName.trim() || `Query ${savedQueries.length + 1}`;
    const q: SavedQuery = {
      id: `SQ-${Date.now()}`, name, query: query || "*",
      serviceId, timeRange: `${timeFrom}–${timeTo}`,
      createdAt: new Date().toISOString(),
    };
    setSavedQueries((prev) => [q, ...prev].slice(0, 32));
    setSaveQueryOpen(false); setSaveQueryName("");
    setConfirmMsg(`Saved query "${q.name}".`);
  };
  const handleCreateCheck = (): void => {
    const name = checkName.trim() || `Verification for ${service?.name ?? "service"}`;
    const c: DraftCheck = {
      id: `VC-${Date.now()}`, name, runbookHint: ops.runbook.id,
      serviceId, query: query || "checkout_p95 < 750 AND success_rate > 99",
      createdAt: new Date().toISOString(),
    };
    setDrafts((d) => ({ ...d, checks: [c, ...d.checks].slice(0, 32) }));
    setCheckOpen(false); setCheckName("");
    setConfirmMsg(`Drafted postcheck "${c.name}" for ${ops.runbook.id}.`);
  };
  const handleCreateTrigger = (): void => {
    const name = triggerName.trim() || `Auto-trigger ${drafts.triggers.length + 1}`;
    const cond = triggerCondition.trim() || "sql_conn_util > 95 for 3m";
    const t: DraftTrigger = {
      id: `TR-${Date.now()}`, name, runbookHint: ops.runbook.id,
      serviceId, condition: cond, createdAt: new Date().toISOString(),
    };
    setDrafts((d) => ({ ...d, triggers: [t, ...d.triggers].slice(0, 32) }));
    setTriggerOpen(false); setTriggerName(""); setTriggerCondition("");
    setConfirmMsg(`Drafted trigger "${t.name}" for ${ops.runbook.id}.`);
  };
  const openInvestigation = (): void => {
    const qs = new URLSearchParams();
    if (query) qs.set("q", query);
    qs.set("from", timeFrom); qs.set("to", timeTo);
    if (focusMinute != null) qs.set("focus", String(focusMinute));
    navigate(`/runops/incidents/${ops.incident.id}/investigate?${qs.toString()}`);
  };

  /* --------------------------- Guards ------------------------------------ */

  if (!service) {
    return (
      <div className="p-6">
        <EmptyState
          title="Service not found"
          description={`No service exists with id "${serviceId}".`}
          action={{ label: "Open Service Portfolio", onClick: () => navigate("/runops/services") }}
        />
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="p-6">
        <PermissionDeniedState
          title="Read-only role"
          description="Observability queries are visible but mutations (save query, pin evidence, draft check/trigger) require an SRE or engineer role."
        />
      </div>
    );
  }

  /* --------------------------- Render ------------------------------------ */

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Observability & Telemetry Explorer</div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">{service.name}</div>
            <Badge variant="outline" className="text-[10px]">{service.tier}</Badge>
            <Badge variant="outline" className="text-[10px]">{service.environment} · {service.region}</Badge>
            <StatusIndicator tone={incidentActive ? "critical" : recovering ? "recovering" : "healthy"}
              label={incidentActive ? "Incident interval" : recovering ? "Recovering" : "Healthy baseline"} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FreshnessIndicator capturedAt={ops.dataFreshnessAt} ttlSeconds={STALE_THRESHOLD_MS / 1000} />
          <Button size="sm" variant="outline" onClick={() => navigate(`/runops/services/${serviceId}`)}>
            <ArrowBack /> Service twin
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/runops/services/${serviceId}/topology`)}>
            <Waypoints className="mr-1 h-3 w-3" /> Topology
          </Button>
          <Button size="sm" onClick={openInvestigation}>
            <ExternalLink className="mr-1 h-3 w-3" /> Open Investigation
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Label htmlFor="obs-query" className="text-[10px] uppercase tracking-wide text-slate-500">Query</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
              <Input id="obs-query" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="service:checkout-api error"
                className="h-8 pl-7 text-xs" />
            </div>
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wide text-slate-500">Component</Label>
            <Select value={componentFilter} onValueChange={setComponentFilter}>
              <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All components</SelectItem>
                {ops.components
                  .filter((c) => service.componentIds.includes(c.id))
                  .map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wide text-slate-500">Time range</Label>
            <div className="flex items-center gap-1">
              <Input value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className="h-8 w-[70px] text-xs" aria-label="From" />
              <span className="text-xs text-slate-500">→</span>
              <Input value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className="h-8 w-[70px] text-xs" aria-label="To" />
            </div>
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wide text-slate-500">Compare</Label>
            <Select value={compareMode} onValueChange={(v) => setCompareMode(v as CompareMode)}>
              <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Current interval</SelectItem>
                <SelectItem value="baseline">Healthy baseline</SelectItem>
                <SelectItem value="compare">Compare (overlay)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <Switch id="hv" checked={highVolumeSampling} onCheckedChange={setHighVolumeSampling} />
            <Label htmlFor="hv" className="text-[11px] text-slate-700">High-volume sampling</Label>
          </div>
          <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <Switch id="lc" checked={logConnectorDown} onCheckedChange={setLogConnectorDown} />
            <Label htmlFor="lc" className="text-[11px] text-slate-700">Simulate log connector outage</Label>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setSaveQueryOpen(true)}>
              <Bookmark className="mr-1 h-3 w-3" /> Save Query
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCheckOpen(true)}>
              <ShieldCheck className="mr-1 h-3 w-3" /> Create Verification Check
            </Button>
            <Button size="sm" variant="outline" onClick={() => setTriggerOpen(true)}>
              <Zap className="mr-1 h-3 w-3" /> Create Trigger
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCompareMode(compareMode === "compare" ? "live" : "compare")}>
              <TimerReset className="mr-1 h-3 w-3" /> Compare Baseline
            </Button>
          </div>
        </div>

        {/* Change marker + focus */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          <button
            type="button"
            onClick={openChangeDrawer}
            className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-indigo-800 hover:bg-indigo-100"
          >
            <GitCommit className="h-3 w-3" /> {change.id} · deployed {change.deployedAt}
          </button>
          {focusMinute != null && (
            <button
              type="button"
              onClick={() => setFocusMinute(null)}
              className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800 hover:bg-amber-100"
              aria-label="Clear focus filter"
            >
              Focus 10:{String(focusMinute).padStart(2, "0")} · ±{focusWindowMin}m · click to clear
            </button>
          )}
          {stale && <StatusIndicator tone="warning" label="Data stale" />}
          {highVolumeSampling && <StatusIndicator tone="warning" label={`Sampled ~${Math.round(100/3)}%`} />}
          {savedQueries.length > 0 && (
            <span className="ml-auto">Saved queries: <span className="font-medium text-slate-800">{savedQueries.length}</span></span>
          )}
          {pinnedEvidence.length > 0 && (
            <span>Pinned evidence: <span className="font-medium text-slate-800">{pinnedEvidence.length}</span></span>
          )}
        </div>
      </div>

      {/* Confirmation banner */}
      {confirmMsg && (
        <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] text-emerald-900" role="status">
          {confirmMsg}
          <button type="button" onClick={() => setConfirmMsg(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Panels grid */}
      <div className="grid flex-1 gap-3 p-3 xl:grid-cols-3 lg:grid-cols-2">
        <ChartPanel
          title="Checkout latency (p95)"
          hint="Golden signal · Latency"
          series={latencySeries}
          yUnit=" ms"
          source={{ connector: "OpenTelemetry", system: otel?.name ?? "OpenTelemetry", samplingPct: sampling(100), gaps: "none", confidence: 92 }}
          provenance={provenanceFor(otel?.name ?? "OpenTelemetry")}
          freshness={otel?.freshness ?? "10s ago"}
          onPointClick={handleChartClick}
          onPin={() => pinEvidence({
            id: "EV-lat-p95", incidentId: ops.incident.id,
            title: "Checkout p95 latency spike",
            snippet: "p95 rose from 420ms baseline to 2.8s after CHG-20391.",
            source: "OpenTelemetry", capturedAt: new Date().toISOString(), kind: "metric",
          })}
        />

        <ChartPanel
          title="Transaction success"
          hint="Golden signal · Traffic quality"
          series={successSeries}
          yUnit="%"
          source={{ connector: "Prometheus", system: prom?.name ?? "Prometheus", samplingPct: sampling(100), gaps: "none", confidence: 95 }}
          provenance={provenanceFor(prom?.name ?? "Prometheus")}
          freshness={prom?.freshness ?? "12s ago"}
          onPointClick={handleChartClick}
          onPin={() => pinEvidence({
            id: "EV-success", incidentId: ops.incident.id,
            title: "Transaction success declined",
            snippet: "Success dropped from 99.7% to 91.4%.",
            source: "Prometheus", capturedAt: new Date().toISOString(), kind: "metric",
          })}
        />

        <ChartPanel
          title="Error rate"
          hint="Golden signal · Errors"
          series={errorSeries}
          yUnit="%"
          source={{ connector: "Prometheus", system: prom?.name ?? "Prometheus", samplingPct: sampling(100), gaps: "none", confidence: 94 }}
          provenance={provenanceFor(prom?.name ?? "Prometheus")}
          freshness={prom?.freshness ?? "12s ago"}
          onPointClick={handleChartClick}
        />

        <ChartPanel
          title="SQL primary connection utilization"
          hint="Saturation"
          series={sqlSeries}
          yUnit="%"
          source={{ connector: "Prometheus", system: "SQL exporter", samplingPct: sampling(100), gaps: "none", confidence: 90 }}
          provenance={provenanceFor("SQL exporter")}
          freshness="20s ago"
          onPointClick={handleChartClick}
          onPin={() => pinEvidence({
            id: "EV-sql-util", incidentId: ops.incident.id,
            title: "SQL connection utilization 98%",
            snippet: "Pool saturation confirmed 10:12 CT.",
            source: "Prometheus", capturedAt: new Date().toISOString(), kind: "metric",
          })}
        />

        <ChartPanel
          title="Kafka orders queue depth"
          hint="Saturation · downstream"
          series={queueSeries}
          source={{ connector: "OpenTelemetry", system: "Kafka exporter", samplingPct: sampling(100), gaps: "none", confidence: 82 }}
          provenance={provenanceFor("Kafka exporter")}
          freshness="35s ago"
          onPointClick={handleChartClick}
        />

        <ChartPanel
          title="AKS checkout cluster CPU"
          hint="Kubernetes resource health"
          series={k8sSeries}
          yUnit="%"
          source={{ connector: "Prometheus", system: "kube-state", samplingPct: sampling(100), gaps: "none", confidence: 90 }}
          provenance={provenanceFor("kube-state")}
          freshness="15s ago"
          onPointClick={handleChartClick}
        />

        <ChartPanel
          title="Business transaction volume"
          hint="Business signal"
          series={txSeries}
          source={{ connector: "OpenTelemetry", system: "Business tx exporter", samplingPct: sampling(100), gaps: "none", confidence: 88 }}
          provenance={provenanceFor("Business tx exporter")}
          freshness="18s ago"
          onPointClick={handleChartClick}
        />

        {/* Alert events */}
        <Panel title="Alert events" hint="Correlated alerts in window"
          source={{ connector: "Prometheus", system: "Alertmanager", samplingPct: 100, gaps: "none", confidence: 96 }}
          provenance={provenanceFor("Alertmanager")}
          freshness="8s ago">
          {filteredAlerts.length === 0 ? (
            <EmptyState title="No alerts in focus window" description="Widen the focus window or clear it to see all alerts." />
          ) : (
            <ul className="divide-y divide-slate-100 text-xs">
              {filteredAlerts.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 py-1.5">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900">{a.title}</div>
                    <div className="text-[11px] text-slate-500">{a.at} · {a.source}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIndicator tone={a.tone} label={a.tone === "healthy" ? "resolved" : "firing"} />
                    <Button size="sm" variant="ghost"
                      onClick={() => pinEvidence({
                        id: `EV-${a.id}`, incidentId: ops.incident.id, title: a.title,
                        snippet: `Alert ${a.id} fired at ${a.at} · ${a.source}.`,
                        source: a.source, capturedAt: new Date().toISOString(), kind: "event",
                      })}
                      aria-label={`Pin ${a.title}`}>
                      <Pin className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Deployment & change markers */}
        <Panel title="Deployment & change markers" hint="CI/CD annotations on the window"
          source={{ connector: "Azure DevOps", system: "Deployments", samplingPct: 100, gaps: "1 pipeline degraded", confidence: 78 }}
          provenance={provenanceFor("Azure DevOps")}
          freshness="2m ago">
          <ul className="space-y-1.5 text-xs">
            <li className="flex items-center justify-between gap-2 rounded border border-indigo-200 bg-indigo-50 p-2">
              <div className="min-w-0">
                <div className="font-medium text-indigo-900">{change.id} · {change.title}</div>
                <div className="text-[11px] text-indigo-700">Deployed {change.deployedAt} · Risk {change.risk}</div>
              </div>
              <Button size="sm" variant="outline" onClick={openChangeDrawer}>Open</Button>
            </li>
            <li className="text-[11px] text-slate-500">No other deployments in window.</li>
          </ul>
        </Panel>

        {/* Logs */}
        <div className="xl:col-span-2">
          <Panel title="Logs" hint="Filtered by focus window & query"
            source={{ connector: "Loki", system: "Log stream", samplingPct: sampling(100), gaps: "none", confidence: 90 }}
            provenance={provenanceFor("Loki")}
            freshness="5s ago">
            {logConnectorDown ? (
              <ConnectorUnavailableState
                connectorName="Loki log stream"
                description="Log connector is unreachable. Metrics and traces continue to render from OpenTelemetry and Prometheus."
              />
            ) : filteredLogs.length === 0 ? (
              <EmptyState title="No logs match" description="Change the query or clear the focus window." />
            ) : (
              <LogTable rows={filteredLogs} />
            )}
          </Panel>
        </div>

        {/* Traces */}
        <div className="xl:col-span-1">
          <Panel title="Distributed traces" hint="Slowest & errored spans"
            source={{ connector: "OpenTelemetry", system: "Tempo", samplingPct: sampling(50), gaps: highVolumeSampling ? "high-volume sampling active" : "none", confidence: 84 }}
            provenance={provenanceFor("Tempo")}
            freshness="12s ago">
            {filteredTraces.length === 0 ? (
              <EmptyState title="No traces captured in this window"
                description="Trace ingestion is subject to head sampling; broaden the focus window or lower sampling." />
            ) : (
              <ul className="space-y-1.5">
                {filteredTraces.map((t) => (
                  <li key={t.id}>
                    <button type="button"
                      onClick={() => openTraceDrawer(t.id)}
                      className="flex w-full items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2 py-1.5 text-left text-xs hover:border-slate-300 hover:bg-slate-50">
                      <div>
                        <div className="font-medium text-slate-900">{t.id} · {t.label}</div>
                        <div className="text-[11px] text-slate-500">{t.durationMs} ms · 10:{String(t.atMinute).padStart(2, "0")}</div>
                      </div>
                      <StatusIndicator tone={t.hasError ? "failure" : "healthy"} label={t.hasError ? "error" : "ok"} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Telemetry completeness */}
        <Panel title="Telemetry completeness" hint="Coverage across expected signals"
          source={{ connector: "Meta", system: "Telemetry ledger", samplingPct: 100, gaps: highVolumeSampling ? "traces sampled" : "none", confidence: 86 }}
          provenance={provenanceFor("Telemetry ledger")}
          freshness="30s ago">
          <CompletenessBar label="Metrics"  value={100} tone="healthy" note="All series present" />
          <CompletenessBar label="Logs"     value={logConnectorDown ? 0 : 96} tone={logConnectorDown ? "failure" : "healthy"} note={logConnectorDown ? "Loki unavailable" : "1 host reporting late"} />
          <CompletenessBar label="Traces"   value={highVolumeSampling ? 34 : 78} tone={highVolumeSampling ? "warning" : "connected"} note={highVolumeSampling ? "head-sampled" : "sampled at 50%"} />
          <CompletenessBar label="Events"   value={100} tone="healthy" note="Alertmanager healthy" />
        </Panel>

        {/* Estimated data cost */}
        <Panel title="Estimated data cost (this window)" hint="Ingestion + retention"
          source={{ connector: "Cost estimator", system: "Cost model", samplingPct: 100, gaps: "none", confidence: 62 }}
          provenance={provenanceFor("Cost model")}
          freshness="1m ago">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <CostRow label="Metrics"  value={highVolumeSampling ? "$0.24" : "$0.71"} />
            <CostRow label="Logs"     value={logConnectorDown ? "$0.00" : "$1.82"} />
            <CostRow label="Traces"   value={highVolumeSampling ? "$0.19" : "$0.62"} />
            <CostRow label="Events"   value="$0.04" />
            <CostRow label="Storage · 30d" value="$2.11" />
            <CostRow label="Estimated total" value={highVolumeSampling ? "$3.29" : "$5.30"} bold />
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Confidence: 62% — cost model is a directional estimate.</div>
        </Panel>

        {/* Saved queries + pinned evidence */}
        <Panel title="Saved queries" hint="Persist across navigation"
          source={{ connector: "Local", system: "Browser storage", samplingPct: 100, gaps: "none", confidence: 100 }}
          provenance={provenanceFor("Browser storage")}
          freshness="now">
          {savedQueries.length === 0 ? (
            <EmptyState title="No saved queries yet" description="Save the current query to reuse it across incidents." />
          ) : (
            <ul className="divide-y divide-slate-100 text-xs">
              {savedQueries.slice(0, 6).map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-2 py-1.5">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900">{q.name}</div>
                    <div className="truncate text-[11px] text-slate-500">{q.query} · {q.timeRange}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setQuery(q.query)} aria-label={`Load ${q.name}`}>
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() =>
                      setSavedQueries((prev) => prev.filter((x) => x.id !== q.id))}
                      aria-label={`Delete ${q.name}`}>×</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Pinned evidence · this incident" hint={`Linked to ${ops.incident.id}`}
          source={{ connector: "Local", system: "Browser storage", samplingPct: 100, gaps: "none", confidence: 100 }}
          provenance={provenanceFor("Browser storage")}
          freshness="now">
          {pinnedEvidence.length === 0 ? (
            <EmptyState title="No evidence pinned yet"
              description="Pin metrics, traces, or alerts to build the incident's evidence panel." />
          ) : (
            <div className="space-y-2">
              {pinnedEvidence.slice(0, 4).map((e) => (
                <EvidenceCitation key={e.id} evidence={{
                  id: e.id, source: e.source, title: e.title, snippet: e.snippet,
                  ref: `${e.kind} · ${e.incidentId}`, supports: "supports",
                }} />
              ))}
              {pinnedEvidence.length > 4 && (
                <div className="text-[11px] text-slate-500">+{pinnedEvidence.length - 4} more…</div>
              )}
            </div>
          )}
        </Panel>

        {/* AI Recommendation */}
        <div className="xl:col-span-2">
          <Panel title="AI recommendation for this interval"
            hint="Evidence-based · with confidence & uncertainty"
            source={{ connector: "AI Gateway", system: "Reasoning service", samplingPct: 100, gaps: "none", confidence: 88 }}
            provenance={provenanceFor("Reasoning service")}
            freshness="now">
            <AiRecommendationBlock incidentActive={incidentActive} recovering={recovering} />
          </Panel>
        </div>
      </div>

      {/* Drafts summary */}
      {(drafts.checks.length > 0 || drafts.triggers.length > 0) && (
        <div className="border-t border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-800">Runbook drafts:</span>{" "}
          {drafts.checks.length} verification check{drafts.checks.length === 1 ? "" : "s"} ·{" "}
          {drafts.triggers.length} trigger{drafts.triggers.length === 1 ? "" : "s"} pending review on {ops.runbook.id}.
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={saveQueryOpen} onOpenChange={setSaveQueryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save query</DialogTitle>
            <DialogDescription>Query “{query || "*"}” · window {timeFrom}–{timeTo}.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="sq-name" className="text-xs">Name</Label>
          <Input id="sq-name" value={saveQueryName} onChange={(e) => setSaveQueryName(e.target.value)}
            placeholder="Checkout p95 spike investigation" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveQueryOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveQuery}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={checkOpen} onOpenChange={setCheckOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create verification check</DialogTitle>
            <DialogDescription>Proposes a postcheck for {ops.runbook.id} using the current query.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="vc-name" className="text-xs">Check name</Label>
          <Input id="vc-name" value={checkName} onChange={(e) => setCheckName(e.target.value)}
            placeholder="Checkout SLI recovered" />
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
            <div className="font-medium text-slate-900">Query</div>
            <div className="font-mono">{query || "checkout_p95 < 750 AND success_rate > 99"}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCheck}>Propose</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={triggerOpen} onOpenChange={setTriggerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create runbook trigger</DialogTitle>
            <DialogDescription>Drafts a trigger binding for {ops.runbook.id}.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="tr-name" className="text-xs">Trigger name</Label>
          <Input id="tr-name" value={triggerName} onChange={(e) => setTriggerName(e.target.value)}
            placeholder="SQL saturation → RB-0042" />
          <Label htmlFor="tr-cond" className="text-xs">Condition</Label>
          <Textarea id="tr-cond" value={triggerCondition} onChange={(e) => setTriggerCondition(e.target.value)}
            placeholder="sql_conn_util > 95 for 3m" className="text-xs" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTriggerOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTrigger}>Draft trigger</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function ArrowBack(): JSX.Element {
  return <span aria-hidden className="mr-1 inline-block">←</span>;
}

interface PanelProps {
  title: string;
  hint?: string;
  source: PanelSourceMeta;
  provenance: Provenance;
  freshness: string;
  children: React.ReactNode;
}
function Panel({ title, hint, source, provenance, freshness, children }: PanelProps): JSX.Element {
  return (
    <section className="flex flex-col rounded border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-100 px-3 py-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-900">{title}</div>
          {hint && <div className="text-[10px] text-slate-500">{hint}</div>}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <SourceProvenance provenance={provenance} />
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
            Sampling {source.samplingPct}%
          </span>
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
            Gaps: {source.gaps}
          </span>
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
            Confidence {source.confidence}%
          </span>
          <span className="text-[10px] text-slate-500">{freshness}</span>
        </div>
      </header>
      <div className="p-2">{children}</div>
    </section>
  );
}

interface ChartPanelProps extends Omit<PanelProps, "children"> {
  series: TelemetrySeries[];
  yUnit?: string;
  onPointClick: (minute: number) => void;
  onPin?: () => void;
}
function ChartPanel({
  title, hint, series, yUnit, source, provenance, freshness, onPointClick, onPin,
}: ChartPanelProps): JSX.Element {
  // A lightweight "click a minute" affordance sitting under the chart — recharts
  // click wiring varies by chart type; discrete buttons give predictable, a11y-safe access.
  const points = series[0]?.points ?? [];
  return (
    <Panel title={title} hint={hint} source={source} provenance={provenance} freshness={freshness}>
      <TelemetryChart series={series} yUnit={yUnit} ariaLabel={`${title} chart`} />
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Focus:</span>
        {[0, 7, 12, 18, 24, 30, 41].filter((m) => points.some((p) => String(p.t).endsWith(String(m).padStart(2, "0")))).map((m) => (
          <button key={m} type="button"
            onClick={() => onPointClick(m)}
            className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-700 hover:border-slate-300 hover:bg-white">
            10:{String(m).padStart(2, "0")}
          </button>
        ))}
        {onPin && (
          <Button size="sm" variant="ghost" className="ml-auto h-6 text-[11px]" onClick={onPin}>
            <Pin className="mr-1 h-3 w-3" /> Pin evidence
          </Button>
        )}
      </div>
    </Panel>
  );
}

function CompletenessBar({ label, value, tone, note }: {
  label: string; value: number; tone: "healthy" | "warning" | "failure" | "connected"; note: string;
}): JSX.Element {
  const color = tone === "healthy" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : tone === "failure" ? "bg-rose-500" : "bg-indigo-500";
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500">{value}% · {note}</span>
      </div>
      <div className="mt-0.5 h-1.5 w-full rounded bg-slate-100" aria-hidden>
        <div className={cn("h-full rounded", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CostRow({ label, value, bold }: { label: string; value: string; bold?: boolean }): JSX.Element {
  return (
    <div className={cn("flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1",
      bold && "border-slate-300 bg-white font-semibold text-slate-900")}>
      <span className="text-slate-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function AiRecommendationBlock({ incidentActive, recovering }: {
  incidentActive: boolean; recovering: boolean;
}): JSX.Element {
  const conclusion = recovering
    ? "Checkout SLIs are recovering after index revert. Recommend running postcheck s5 within 6 minutes and closing the incident once success rate remains > 99% for 10 minutes."
    : incidentActive
    ? "Correlated evidence points to a query-plan regression from CHG-20391. Highest-confidence mitigation is to revert the affected index and recycle checkout pods (RB-0042)."
    : "No anomalies in the current interval. Golden signals are within baseline envelopes.";

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded border border-indigo-200 bg-indigo-50 p-2">
        <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase text-indigo-800">
          <Sparkles className="h-3 w-3" /> Conclusion
        </div>
        <div className="text-xs text-indigo-900">{conclusion}</div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-indigo-900">
          <span className="rounded border border-indigo-200 bg-white px-1.5 py-0.5">Confidence {incidentActive ? 88 : recovering ? 82 : 74}%</span>
          <span className="rounded border border-indigo-200 bg-white px-1.5 py-0.5">
            Uncertainty: {recovering ? "low · monitor 10m" : incidentActive ? "low · fallback pre-staged" : "very low"}
          </span>
        </div>
      </div>
      <div className="space-y-1.5 rounded border border-slate-200 bg-slate-50 p-2">
        <div className="text-[10px] font-semibold uppercase text-slate-500">Evidence</div>
        <ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-700">
          <li>Onset 10:07 aligns with CHG-20391 completion 09:58 (plan-cache warmup window).</li>
          <li>SQL connection utilization 98% while application CPU nominal — DB-side saturation.</li>
          <li>Top checkout query plan changed post-deploy (est. 4.7× baseline cost).</li>
        </ul>
        <div className="pt-1 text-[10px] font-semibold uppercase text-slate-500">Sources</div>
        <div className="text-[11px] text-slate-700">RB-0042 v3.2 · CHG-20391 deployment record · Prometheus SQL exporter · OpenTelemetry checkout traces</div>
      </div>
    </div>
  );
}
