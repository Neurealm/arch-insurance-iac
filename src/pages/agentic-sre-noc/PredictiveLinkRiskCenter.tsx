/**
 * Predictive Link Risk Center — Agentic SRE NOC.
 *
 * Single-page predictive risk demonstration. All data is synthetic and lives
 * in ./data/plrFixtures.ts (which reuses the shared GOOC / CSH identifiers) so
 * it can be replaced with live telemetry later. Progressive disclosure happens
 * through tabs, drawers and expandable panels; this page never navigates away.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Bot, CheckCircle2, ChevronRight, CloudFog, Download, Gauge,
  Maximize2, Minimize2, Pause, Play, RefreshCw, RotateCcw, Search, ShieldCheck,
  SkipForward, Sparkles, TrendingDown, TrendingUp, Users, X, Zap,
} from "lucide-react";
import {
  Area, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, LineChart,
  ReferenceArea, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart,
  Tooltip as RTooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { GoocMap, type MapOverlays } from "./components/GoocMap";
import { Field, Panel, Select, ToolbarButton } from "./components/NocPrimitives";
import { links } from "./data/goocFixtures";
import {
  alternativeHypotheses, chennaiEvidence, chennaiExposure, chennaiFactors,
  chennaiForecast, confidenceCalibration, CONFIDENCE_BANDS, exposureComparison,
  factorExplanation, fallbackFailureInjection, FEATURED_RISK_ID,
  FORECAST_METRICS, FORECAST_VIEWS, HORIZON_HOURS, performanceByCategory,
  performanceByProduct, performanceByRegion, performanceMetrics, PLR_CUSTOMERS,
  PLR_PRODUCTS, PLR_REGIONS, PLR_RISK_CATEGORIES, plrActivity, plrKpis,
  predictedLinkRisks, predictedVersusActual, predictiveAgents,
  predictiveScenario, PREDICTION_HORIZONS, preventiveActions,
  recommendationSummary, riskHorizonMilestones, RISK_SEVERITIES, SAVED_VIEWS,
  severityChipClass, SLO_EXPOSURES, stateChipClass, warningTimeDistribution,
  type ForecastMetricKey, type PlrActivityEvent, type PlrKpi,
  type PredictedLinkRisk, type PredictiveAgent, type PreventiveAction,
} from "./data/plrFixtures";

const ALL_REGIONS = "All regions";
const ALL_CUSTOMERS = "All customers";
const ALL_PRODUCTS = "All products";
const ALL_CATEGORIES = "All risk categories";
const ALL_SEVERITIES = "All severities";
const ALL_SLO = "All SLO exposure";
const ALL_AUTOMATION = "All automation";

const GROUP_BYS = ["No grouping", "Region", "Risk category", "Customer", "Product", "Confidence", "Intervention status"] as const;

const COLUMNS = [
  { key: "rank", label: "Rank" },
  { key: "link", label: "Link" },
  { key: "service", label: "Customer service" },
  { key: "region", label: "Region" },
  { key: "product", label: "Product" },
  { key: "primary", label: "Primary risk" },
  { key: "secondary", label: "Secondary risk" },
  { key: "health", label: "Current health" },
  { key: "predicted", label: "Predicted state" },
  { key: "probability", label: "Probability" },
  { key: "confidence", label: "Confidence" },
  { key: "tti", label: "Time to impact" },
  { key: "capacity", label: "Capacity exposed" },
  { key: "customers", label: "Customers" },
  { key: "slo", label: "SLO exposure" },
  { key: "budget", label: "Error budget" },
  { key: "fallback", label: "Fallback readiness" },
  { key: "action", label: "Preventive action" },
  { key: "automation", label: "Automation" },
  { key: "agent", label: "Digital coworker" },
  { key: "updated", label: "Last update" },
] as const;
type ColumnKey = (typeof COLUMNS)[number]["key"];

const DEFAULT_COLUMNS: ColumnKey[] = [
  "rank", "link", "service", "region", "primary", "predicted", "probability",
  "confidence", "tti", "capacity", "slo", "fallback", "action", "automation", "agent",
];

/* ------------------------------ small parts ----------------------------- */

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium", className)}>
      {children}
    </span>
  );
}

function Sparkline({ points, tone }: { points: number[]; tone: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${28 - ((p - min) / span) * 24}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full" aria-hidden>
      <polyline points={d} fill="none" stroke={tone} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function KpiCard({ kpi, active, onClick }: { kpi: PlrKpi; active: boolean; onClick: () => void }) {
  const tone = kpi.status === "good" ? "#059669" : kpi.status === "watch" ? "#d97706" : "#e11d48";
  const TrendIcon = kpi.trend === "down" ? TrendingDown : TrendingUp;
  return (
    <button
      type="button"
      onClick={onClick}
      title={kpi.explain}
      aria-pressed={active}
      className={cn(
        "flex flex-col rounded-xl border bg-white p-3 text-left shadow-sm transition hover:border-indigo-300",
        active ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-600">{kpi.title}</span>
        {kpi.synthetic && <Chip className="border-slate-200 bg-slate-50 text-slate-500">Synthetic</Chip>}
      </div>
      <span className="mt-1 text-2xl font-bold text-slate-900">{kpi.value}</span>
      <span className="text-[11px] text-slate-500">{kpi.sub}</span>
      <Sparkline points={kpi.spark} tone={tone} />
      <span className="mt-1 inline-flex items-center gap-1 text-[10.5px]" style={{ color: tone }}>
        <TrendIcon className="h-3 w-3" /> {kpi.delta}
      </span>
      <span className="text-[10px] text-slate-400">{kpi.target}</span>
    </button>
  );
}

function FactorBar({ value, direction }: { value: number; direction: "increases" | "reduces" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full", direction === "increases" ? "bg-orange-500" : "bg-emerald-500")}
        style={{ width: `${Math.min(100, value * 4)}%` }}
      />
    </div>
  );
}

/* -------------------------------- page --------------------------------- */

export default function PredictiveLinkRiskCenter() {
  /* filters */
  const [horizon, setHorizon] = useState<string>("Next 12 hours");
  const [region, setRegion] = useState<string>(ALL_REGIONS);
  const [customer, setCustomer] = useState<string>(ALL_CUSTOMERS);
  const [product, setProduct] = useState<string>(ALL_PRODUCTS);
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [severity, setSeverity] = useState<string>(ALL_SEVERITIES);
  const [confidenceBand, setConfidenceBand] = useState<string>(CONFIDENCE_BANDS[0]);
  const [sloExposure, setSloExposure] = useState<string>(ALL_SLO);
  const [automation, setAutomation] = useState<string>(ALL_AUTOMATION);
  const [savedView, setSavedView] = useState<string>(SAVED_VIEWS[0]);
  const [query, setQuery] = useState("");
  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState("11:04:22 UTC");

  /* map */
  const [mapView, setMapView] = useState<"geographic" | "topology">("geographic");
  const [zoom, setZoom] = useState(1);
  const [mapFullScreen, setMapFullScreen] = useState(false);
  const [overlays, setOverlays] = useState<MapOverlays>({ weather: true, fallback: true, impact: true, predicted: true });
  const [riskZone, setRiskZone] = useState<string | null>(null);
  const [playback, setPlayback] = useState(0);

  /* table */
  const [sortKey, setSortKey] = useState<ColumnKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_COLUMNS);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<string>(GROUP_BYS[0]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [accessibleTable, setAccessibleTable] = useState(false);

  /* workspace */
  const [selectedRiskId, setSelectedRiskId] = useState<string>(FEATURED_RISK_ID);
  const [workspaceTab, setWorkspaceTab] = useState("Overview");
  const [forecastView, setForecastView] = useState<(typeof FORECAST_VIEWS)[number]>("12 hours");
  const [metricKeys, setMetricKeys] = useState<ForecastMetricKey[]>(["margin", "attenuation", "visibility"]);
  const [compareHistory, setCompareHistory] = useState(true);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string>("pa-priority");
  const [comparedActions, setComparedActions] = useState<string[]>(["pa-observe", "pa-priority"]);
  const [decision, setDecision] = useState<"pending" | "approved" | "rejected" | "more evidence">("pending");
  const [simulated, setSimulated] = useState(false);
  const [brush, setBrush] = useState<number | null>(null);

  /* drawers */
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PlrActivityEvent | null>(null);

  /* scenario */
  const [scenarioStep, setScenarioStep] = useState(-1);
  const [scenarioPlaying, setScenarioPlaying] = useState(false);
  const [scenarioLog, setScenarioLog] = useState<PlrActivityEvent[]>([]);
  const [fallbackFailure, setFallbackFailure] = useState(false);
  const [compareOutcomes, setCompareOutcomes] = useState(false);

  const scenarioActive = scenarioStep >= 0;
  const stage = scenarioActive ? predictiveScenario[scenarioStep] : null;

  /* ------------------------------ filtering ---------------------------- */

  const horizonHours = HORIZON_HOURS[horizon as keyof typeof HORIZON_HOURS] ?? 12;

  const kpiFilterMatch = useCallback((r: PredictedLinkRisk) => {
    const kpi = plrKpis.find((k) => k.id === activeKpi);
    if (!kpi) return true;
    switch (kpi.filter.kind) {
      case "severity": return r.severity === kpi.filter.value;
      case "confidence": return r.confidence > 85;
      case "automation": return r.automation === kpi.filter.value;
      case "slo": return r.sloExposure === kpi.filter.value;
      case "category": return r.primaryRisk === kpi.filter.value;
      default: return true;
    }
  }, [activeKpi]);

  const filteredRisks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return predictedLinkRisks.filter((r) =>
      r.hoursToImpact <= horizonHours &&
      (region === ALL_REGIONS || r.region === region) &&
      (customer === ALL_CUSTOMERS || r.customer === customer) &&
      (product === ALL_PRODUCTS || r.product === product) &&
      (category === ALL_CATEGORIES || r.primaryRisk === category || r.secondaryRisk === category) &&
      (severity === ALL_SEVERITIES || r.severity === severity) &&
      (sloExposure === ALL_SLO || r.sloExposure === sloExposure) &&
      (automation === ALL_AUTOMATION || r.automation === automation) &&
      (confidenceBand === CONFIDENCE_BANDS[0] ||
        (confidenceBand === "Above 85 percent" && r.confidence > 85) ||
        (confidenceBand === "70 to 85 percent" && r.confidence >= 70 && r.confidence <= 85) ||
        (confidenceBand === "Below 70 percent" && r.confidence < 70)) &&
      (savedView !== "High confidence only" || r.confidence > 85) &&
      (savedView !== "Customer impacting" || r.sloExposure !== "None") &&
      (savedView !== "Automatable actions" || r.automation === "Automatable") &&
      (savedView !== "Weather driven risk" || ["Fog", "Rain", "Wind"].includes(r.primaryRisk)) &&
      (!riskZone || r.region === riskZone) &&
      kpiFilterMatch(r) &&
      (q === "" || `${r.linkName} ${r.serviceName} ${r.customer} ${r.primaryRisk}`.toLowerCase().includes(q)),
    );
  }, [horizonHours, region, customer, product, category, severity, sloExposure, automation, confidenceBand, savedView, riskZone, query, kpiFilterMatch]);

  const sortedRisks = useMemo(() => {
    const value = (r: PredictedLinkRisk): string | number => {
      switch (sortKey) {
        case "rank": return r.rank;
        case "probability": return r.probability;
        case "confidence": return r.confidence;
        case "tti": return r.hoursToImpact;
        case "capacity": return r.capacityGbps;
        case "link": return r.linkName;
        case "region": return r.region;
        case "product": return r.product;
        case "primary": return r.primaryRisk;
        default: return r.rank;
      }
    };
    return [...filteredRisks].sort((a, b) => {
      const av = value(a); const bv = value(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
  }, [filteredRisks, sortKey, sortAsc]);

  const groupedRisks = useMemo(() => {
    if (groupBy === "No grouping") return [{ key: "All predicted risks", rows: sortedRisks }];
    const keyOf = (r: PredictedLinkRisk) => {
      switch (groupBy) {
        case "Region": return r.region;
        case "Risk category": return r.primaryRisk;
        case "Customer": return r.customer;
        case "Product": return r.product;
        case "Confidence": return r.confidence > 85 ? "Above 85 percent" : r.confidence >= 70 ? "70 to 85 percent" : "Below 70 percent";
        default: return r.automation;
      }
    };
    const map = new Map<string, PredictedLinkRisk[]>();
    sortedRisks.forEach((r) => {
      const k = keyOf(r);
      map.set(k, [...(map.get(k) ?? []), r]);
    });
    return [...map.entries()].map(([key, rows]) => ({ key, rows }));
  }, [sortedRisks, groupBy]);

  const selected = predictedLinkRisks.find((r) => r.id === selectedRiskId) ?? predictedLinkRisks[0];
  const isFeatured = selected.id === FEATURED_RISK_ID;

  const mapLinks = useMemo(() => {
    const ids = new Set(filteredRisks.map((r) => r.linkId));
    return links.filter((l) => ids.has(l.id) || filteredRisks.length === 0);
  }, [filteredRisks]);

  /* scenario derived values */
  const scenarioProbability = stage ? stage.probability : selected.probability;
  const scenarioConfidence = stage ? stage.confidence : selected.confidence;
  const scenarioState = stage ? stage.state : selected.predictedState;

  const advance = useCallback(() => {
    setScenarioStep((prev) => {
      const next = prev + 1;
      if (next >= predictiveScenario.length) { setScenarioPlaying(false); return prev; }
      const s = predictiveScenario[next];
      setScenarioLog((log) => [{
        id: `scn-${s.id}`,
        at: `11:${(10 + next).toString().padStart(2, "0")} UTC`,
        event: s.title,
        actor: s.actor,
        linkId: "lnk-chennai-041",
        linkName: "Chennai Mobile Backhaul 041",
        serviceName: "Chennai Mobile Backhaul Service 041",
        probability: s.probability,
        outcome: s.timelineOutcome,
        status: s.requiresApproval ? "Awaiting approval" : "Complete",
      }, ...log]);
      if (s.requiresApproval) setScenarioPlaying(false);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!scenarioPlaying) return;
    const id = window.setTimeout(advance, 1400);
    return () => window.clearTimeout(id);
  }, [scenarioPlaying, scenarioStep, advance]);

  const startScenario = () => {
    setSelectedRiskId(FEATURED_RISK_ID);
    if (scenarioStep < 0) { setScenarioStep(-1); setScenarioLog([]); advance(); }
    setScenarioPlaying(true);
  };

  const resetScenario = () => {
    setScenarioPlaying(false);
    setScenarioStep(-1);
    setScenarioLog([]);
    setDecision("pending");
    setSimulated(false);
    setFallbackFailure(false);
  };

  const resetPage = () => {
    setHorizon("Next 12 hours"); setRegion(ALL_REGIONS); setCustomer(ALL_CUSTOMERS);
    setProduct(ALL_PRODUCTS); setCategory(ALL_CATEGORIES); setSeverity(ALL_SEVERITIES);
    setConfidenceBand(CONFIDENCE_BANDS[0]); setSloExposure(ALL_SLO); setAutomation(ALL_AUTOMATION);
    setSavedView(SAVED_VIEWS[0]); setQuery(""); setActiveKpi(null); setRiskZone(null);
    setSelectedRiskId(FEATURED_RISK_ID); setWorkspaceTab("Overview"); setSelectedFactor(null);
    setVisibleColumns(DEFAULT_COLUMNS); setGroupBy(GROUP_BYS[0]); setExpandedRow(null);
    setZoom(1); setMapFullScreen(false); setPlayback(0);
    resetScenario();
  };

  const exportRows = () => {
    const header = visibleColumns.join(",");
    const body = sortedRisks.map((r) => visibleColumns.map((c) => `"${String(cellValue(r, c)).replace(/"/g, "'")}"`).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "predicted-link-risks.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  /* forecast slice */
  const forecastData = useMemo(() => {
    const hours = forecastView === "7 days" ? 24 : Number(forecastView.split(" ")[0]);
    return chennaiForecast.filter((p) => p.hour >= (compareHistory ? -6 : 0) && p.hour <= hours);
  }, [forecastView, compareHistory]);

  const kpiValues = useMemo(() => plrKpis.map((k) => {
    if (!scenarioActive) return k;
    if (k.id === "kpi-approval" && scenarioStep >= 9) return { ...k, value: decision === "approved" ? "6" : "8" };
    if (k.id === "kpi-prevented" && scenarioStep >= 12) return { ...k, value: "42" };
    if (k.id === "kpi-links-at-risk" && scenarioStep >= 12) return { ...k, value: "22" };
    return k;
  }), [scenarioActive, scenarioStep, decision]);

  const action = preventiveActions.find((a) => a.id === selectedActionId) ?? preventiveActions[2];
  const agentDetail = predictiveAgents.find((a) => a.id === selectedAgentId) ?? null;

  /* --------------------------------- render -------------------------- */

  return (
    <div className="max-w-[1500px] space-y-5 px-4 py-5 sm:px-6">
      {/* header */}
      <header className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 p-5 shadow-sm">
        <nav aria-label="Breadcrumb" className="text-[11px] text-slate-500">
          SRE <span className="px-1">/</span> Agentic SRE NOC <span className="px-1">/</span>
          <span className="font-medium text-slate-700"> Predictive Link Risk Center</span>
        </nav>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Predictive Link Risk Center</h1>
            <p className="mt-1 max-w-3xl text-[12.5px] text-slate-600">
              Forecast optical degradation, customer exposure, and preventive action before service objectives are affected
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] text-slate-500">
              <Sparkles className="h-3 w-3" /> Synthetic Taara aligned demonstration environment
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Field label="Predictive status" value={scenarioState === "Risk mitigated" ? "Risk mitigated" : "Elevated"} />
            <Field label="Last telemetry" value="11:04:22 UTC" />
            <Field label="Last forecast" value="11:00:00 UTC" />
            <Field label="Data confidence" value="94% complete" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Select label="Prediction horizon" value={horizon} options={PREDICTION_HORIZONS} onChange={setHorizon} />
          <Select label="Region" value={region} options={[ALL_REGIONS, ...PLR_REGIONS]} onChange={setRegion} />
          <Select label="Customer" value={customer} options={[ALL_CUSTOMERS, ...PLR_CUSTOMERS]} onChange={setCustomer} />
          <Select label="Product" value={product} options={[ALL_PRODUCTS, ...PLR_PRODUCTS]} onChange={setProduct} />
          <Select label="Risk category" value={category} options={[ALL_CATEGORIES, ...PLR_RISK_CATEGORIES]} onChange={setCategory} />
          <Select label="Risk severity" value={severity} options={[ALL_SEVERITIES, ...RISK_SEVERITIES]} onChange={setSeverity} />
          <Select label="Confidence" value={confidenceBand} options={CONFIDENCE_BANDS} onChange={setConfidenceBand} />
          <Select label="SLO exposure" value={sloExposure} options={[ALL_SLO, ...SLO_EXPOSURES]} onChange={setSloExposure} />
          <Select label="Automation eligibility" value={automation} options={[ALL_AUTOMATION, "Automatable", "Approval required", "Manual only"]} onChange={setAutomation} />
          <Select label="Saved view" value={savedView} options={SAVED_VIEWS} onChange={setSavedView} />
          <label className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-slate-400" aria-hidden />
            <input
              aria-label="Search predicted risks"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search links, services, customers"
              className="w-56 rounded-md border border-slate-200 bg-white py-1.5 pl-7 pr-2 text-[11.5px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <ToolbarButton onClick={() => setRefreshedAt(new Date().toISOString().slice(11, 19) + " UTC")} title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </ToolbarButton>
          <ToolbarButton onClick={resetPage} title="Reset page state"><RotateCcw className="h-3.5 w-3.5" /> Reset page</ToolbarButton>
          <ToolbarButton onClick={() => setMapFullScreen((v) => !v)} title="Full screen map">
            {mapFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />} Full screen
          </ToolbarButton>
          <ToolbarButton onClick={exportRows} title="Export visible rows"><Download className="h-3.5 w-3.5" /> Export</ToolbarButton>
          <span className="text-[10.5px] text-slate-400">Refreshed {refreshedAt}</span>
        </div>
      </header>

      {/* scenario control */}
      <Panel
        title="Run Predictive Link Protection Scenario"
        subtitle="Deterministic synthetic walkthrough of the Chennai fog risk, from weak signal to avoided customer impact"
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={startScenario} active={scenarioPlaying}><Play className="h-3.5 w-3.5" /> {scenarioActive ? "Continue" : "Start"}</ToolbarButton>
            <ToolbarButton onClick={() => setScenarioPlaying(false)}><Pause className="h-3.5 w-3.5" /> Pause</ToolbarButton>
            <ToolbarButton onClick={advance}><SkipForward className="h-3.5 w-3.5" /> Skip to next stage</ToolbarButton>
            <ToolbarButton onClick={resetScenario}><RotateCcw className="h-3.5 w-3.5" /> Reset</ToolbarButton>
            <ToolbarButton onClick={() => setFallbackFailure(true)} active={fallbackFailure}><AlertTriangle className="h-3.5 w-3.5" /> Introduce fallback failure</ToolbarButton>
            <ToolbarButton onClick={() => setCompareOutcomes((v) => !v)} active={compareOutcomes}><Gauge className="h-3.5 w-3.5" /> Compare preventive and reactive</ToolbarButton>
          </div>
        }
      >
        <ol className="flex flex-wrap gap-1.5">
          {predictiveScenario.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => { setScenarioStep(i); setSelectedRiskId(FEATURED_RISK_ID); }}
                className={cn(
                  "rounded-md border px-2 py-1 text-[10.5px]",
                  i === scenarioStep ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : i < scenarioStep ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-500",
                )}
              >
                {i + 1}. {s.title}
              </button>
            </li>
          ))}
        </ol>
        {stage && (
          <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
            <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-indigo-900">
              <Bot className="h-4 w-4" aria-hidden /> <strong>{stage.title}</strong>
              <Chip className="border-indigo-200 bg-white text-indigo-700">{stage.actor}</Chip>
              <Chip className="border-indigo-200 bg-white text-indigo-700">Probability {stage.probability}%</Chip>
              <Chip className="border-indigo-200 bg-white text-indigo-700">Confidence {stage.confidence}%</Chip>
            </div>
            <p className="mt-1 text-[12px] text-slate-700">{stage.detail}</p>
            {stage.requiresApproval && decision === "pending" && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <ToolbarButton onClick={() => { setDecision("approved"); advance(); }}><CheckCircle2 className="h-3.5 w-3.5" /> Approve action</ToolbarButton>
                <ToolbarButton onClick={() => setDecision("rejected")}><X className="h-3.5 w-3.5" /> Reject action</ToolbarButton>
                <ToolbarButton onClick={() => { setDecision("more evidence"); setEvidenceOpen(true); }}><Search className="h-3.5 w-3.5" /> Request more evidence</ToolbarButton>
              </div>
            )}
            {decision !== "pending" && (
              <p className="mt-2 text-[11.5px] font-medium text-slate-700">Decision recorded: {decision}</p>
            )}
            {fallbackFailure && (
              <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-[11.5px] text-rose-700">
                {fallbackFailureInjection.title}. {fallbackFailureInjection.detail}
              </p>
            )}
          </div>
        )}
        {compareOutcomes && (
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {exposureComparison.map((o) => (
              <div key={o.id} className={cn("rounded-lg border p-3",
                o.tone === "good" ? "border-emerald-200 bg-emerald-50" : o.tone === "watch" ? "border-amber-200 bg-amber-50" : "border-rose-200 bg-rose-50")}>
                <div className="text-[12px] font-semibold text-slate-900">{o.approach}</div>
                <p className="mt-1 text-[11.5px] text-slate-700">{o.customerOutcome}</p>
                <p className="text-[11px] text-slate-600">{o.sreOutcome}</p>
                <p className="mt-1 text-[11px] text-slate-600">Error budget: {o.errorBudget}</p>
                <p className="text-[11px] text-slate-600">{o.outageMinutes}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* KPI scorecard */}
      <section aria-label="Predictive risk outcome scorecard" className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {kpiValues.map((k) => (
          <KpiCard key={k.id} kpi={k} active={activeKpi === k.id} onClick={() => setActiveKpi(activeKpi === k.id ? null : k.id)} />
        ))}
      </section>
      <p className="text-[10.5px] text-slate-400">
        Prevented incident and outcome metrics are synthetic demonstration values, not measured production results.
      </p>

      {/* map */}
      <Panel
        title="Global Link Risk Map"
        subtitle="Predicted risk by optical link, weather zone and customer exposure. All locations and conditions are synthetic."
        className={cn(mapFullScreen && "fixed inset-3 z-50 overflow-auto")}
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => setMapView("geographic")} active={mapView === "geographic"}>Geographic view</ToolbarButton>
            <ToolbarButton onClick={() => setMapView("topology")} active={mapView === "topology"}>Risk cluster view</ToolbarButton>
            <ToolbarButton onClick={() => setOverlays((o) => ({ ...o, weather: !o.weather }))} active={overlays.weather}>Weather overlay</ToolbarButton>
            <ToolbarButton onClick={() => setOverlays((o) => ({ ...o, fallback: !o.fallback }))} active={overlays.fallback}>Fallback readiness</ToolbarButton>
            <ToolbarButton onClick={() => setOverlays((o) => ({ ...o, impact: !o.impact }))} active={overlays.impact}>Customer impact</ToolbarButton>
            <ToolbarButton onClick={() => setOverlays((o) => ({ ...o, predicted: !o.predicted }))} active={overlays.predicted}>Agent activity</ToolbarButton>
            <ToolbarButton onClick={() => setMapFullScreen((v) => !v)}>{mapFullScreen ? "Exit full screen" : "Full screen"}</ToolbarButton>
            <ToolbarButton onClick={() => { setZoom(1); setRiskZone(null); setPlayback(0); }}>Reset</ToolbarButton>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <span className="text-[10.5px] uppercase tracking-wide text-slate-500">Risk zones</span>
          {PLR_REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRiskZone(riskZone === r ? null : r)}
              className={cn("rounded-full border px-2 py-0.5 text-[10.5px]",
                riskZone === r ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600")}
            >
              {r}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-[10.5px] text-slate-500">
            Time playback
            <input type="range" min={0} max={12} value={playback} onChange={(e) => setPlayback(Number(e.target.value))} aria-label="Time playback" />
            <span>+{playback} h</span>
          </label>
        </div>
        <GoocMap
          links={mapLinks}
          selectedId={selected.linkId}
          highlightId={scenarioActive ? "lnk-chennai-041" : null}
          view={mapView}
          overlays={overlays}
          zoom={zoom}
          onZoomChange={setZoom}
          onSelect={(id) => {
            const risk = predictedLinkRisks.find((r) => r.linkId === id);
            if (risk) setSelectedRiskId(risk.id);
          }}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Normal", "Watch", "Elevated risk", "High risk", "Critical risk", "Preventive action active", "Risk mitigated", "Data insufficient"].map((s) => (
            <Chip key={s} className={stateChipClass[s as keyof typeof stateChipClass]}>{s}</Chip>
          ))}
        </div>
        <p className="mt-2 text-[10.5px] text-slate-500">
          Select a link to load it into the selected risk workspace. Select a risk zone to filter affected links and customer services.
        </p>
      </Panel>

      {/* ranked queue */}
      <Panel
        title="Predicted Link Risks"
        subtitle={`${sortedRisks.length} predicted risks in the selected horizon, ranked by customer exposure and time to impact`}
        action={
          <div className="flex flex-wrap gap-1.5">
            <Select label="Group by" value={groupBy} options={GROUP_BYS} onChange={setGroupBy} />
            <ToolbarButton onClick={() => setColumnPickerOpen((v) => !v)} active={columnPickerOpen}>Columns</ToolbarButton>
            <ToolbarButton onClick={() => setAccessibleTable((v) => !v)} active={accessibleTable}>Accessible mode</ToolbarButton>
            <ToolbarButton onClick={exportRows}><Download className="h-3.5 w-3.5" /> Export visible rows</ToolbarButton>
          </div>
        }
      >
        {columnPickerOpen && (
          <div className="mb-3 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            {COLUMNS.map((c) => (
              <label key={c.key} className="flex items-center gap-1 text-[11px] text-slate-700">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(c.key)}
                  onChange={() => setVisibleColumns((cols) =>
                    cols.includes(c.key) ? cols.filter((k) => k !== c.key) : [...COLUMNS.map((x) => x.key)].filter((k) => cols.includes(k) || k === c.key))}
                />
                {c.label}
              </label>
            ))}
          </div>
        )}
        {sortedRisks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-[12px] text-slate-500">
            No predicted risks match the current filters. Widen the prediction horizon or clear the selected KPI filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={cn("w-full min-w-[900px] text-left text-[11.5px]", accessibleTable && "text-[13px]")}>
              <caption className="sr-only">Predicted link risks ranked by priority</caption>
              <thead>
                <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
                  {COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((c, i) => (
                    <th key={c.key} scope="col" className={cn("whitespace-nowrap py-2 pr-3", i < 2 && "sticky left-0 bg-white")}>
                      <button
                        type="button"
                        onClick={() => { setSortAsc(sortKey === c.key ? !sortAsc : true); setSortKey(c.key); }}
                        className="hover:text-indigo-600"
                      >
                        {c.label}{sortKey === c.key ? (sortAsc ? " ▲" : " ▼") : ""}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              {groupedRisks.map((group) => (
                <tbody key={group.key}>
                  {groupBy !== "No grouping" && (
                    <tr><th colSpan={visibleColumns.length} scope="colgroup" className="bg-slate-50 py-1.5 pl-1 text-left text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{group.key} · {group.rows.length}</th></tr>
                  )}
                  {group.rows.map((r) => (
                    <>
                      <tr
                        key={r.id}
                        onClick={() => { setSelectedRiskId(r.id); setExpandedRow(expandedRow === r.id ? null : r.id); }}
                        className={cn("cursor-pointer border-b border-slate-100 hover:bg-indigo-50/40",
                          selectedRiskId === r.id && "bg-indigo-50/70")}
                      >
                        {COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((c, i) => (
                          <td key={c.key} className={cn("whitespace-nowrap py-2 pr-3 text-slate-700", i < 2 && "sticky left-0 bg-inherit font-medium text-slate-900")}>
                            {renderCell(r, c.key)}
                          </td>
                        ))}
                      </tr>
                      {expandedRow === r.id && (
                        <tr key={`${r.id}-x`} className="border-b border-slate-100 bg-slate-50/70">
                          <td colSpan={visibleColumns.length} className="p-3">
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                              <Field label="Secondary risk" value={String(r.secondaryRisk)} />
                              <Field label="Error budget impact" value={r.errorBudgetImpact} />
                              <Field label="Users exposed" value={r.usersExposed} />
                              <Field label="Preventive action" value={r.preventiveAction} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        )}
      </Panel>

      {/* selected risk workspace */}
      <Panel
        title="Selected Predictive Risk"
        subtitle={`${selected.linkName} · ${selected.serviceName}`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip className="border-orange-200 bg-orange-50 text-orange-700">
              <AlertTriangle className="h-3 w-3" /> {isFeatured ? "High Risk, Preventive Action Recommended" : `${selected.predictedState}`}
            </Chip>
            <ToolbarButton onClick={() => setEvidenceOpen(true)}><ShieldCheck className="h-3.5 w-3.5" /> Evidence</ToolbarButton>
          </div>
        }
      >
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Field label="Link" value={selected.linkName} />
          <Field label="Customer service" value={selected.serviceName} />
          <Field label="Region" value={selected.region} />
          <Field label="Product" value={selected.product} />
          <Field label="Current health" value={selected.currentHealth} />
          <Field label="Predicted health" value={scenarioState} />
          <Field label="Risk probability" value={`${scenarioProbability}%`} />
          <Field label="Agent confidence" value={`${scenarioConfidence}%`} />
          <Field label="Time to expected impact" value={selected.timeToImpact} />
          <Field label="Primary condition" value={selected.primaryRisk} />
          <Field label="Secondary conditions" value={String(selected.secondaryRisk)} />
          <Field label="Committed capacity exposed" value={`${selected.capacityGbps} Gbps`} />
          <Field label="Customer impact" value={`${selected.customersAffected} customer · ${selected.usersExposed}`} />
          <Field label="SLO exposure" value={selected.sloExposure} />
          <Field label="Error budget exposure" value={selected.errorBudgetImpact} />
          <Field label="Fallback readiness" value={selected.fallbackReadiness} />
          <Field label="Preventive recommendation" value={selected.preventiveAction} />
          <Field label="Approval requirement" value={selected.automation} />
          <Field label="Assigned agents" value={selected.agent} />
          <Field label="Evidence items" value="34" />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Selected predictive risk detail">
          {["Overview", "Forecast", "Signals", "Customer Impact", "Resilience", "Recommendations", "Evidence", "History"].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={workspaceTab === t}
              type="button"
              onClick={() => setWorkspaceTab(t)}
              className={cn("rounded-md border px-2.5 py-1.5 text-[11.5px]",
                workspaceTab === t ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-3" role="tabpanel" aria-label={workspaceTab}>
          {workspaceTab === "Overview" && (
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3">
                <h3 className="text-[12px] font-semibold text-slate-900">Why this risk is predicted</h3>
                <p className="mt-1 text-[11.5px] text-slate-600">{factorExplanation}</p>
                <ul className="mt-2 space-y-1 text-[11.5px] text-slate-700">
                  {chennaiFactors.filter((f) => f.direction === "increases").slice(0, 5).map((f) => (
                    <li key={f.id} className="flex items-start gap-1.5"><ChevronRight className="mt-0.5 h-3 w-3 text-orange-500" />{f.name} — {f.current}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <h3 className="text-[12px] font-semibold text-slate-900">Recommended outcome</h3>
                <p className="mt-1 text-[11.5px] text-slate-700">{recommendationSummary.headline}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Field label="Confidence" value={`${recommendationSummary.confidence}%`} />
                  <Field label="Capacity protected" value={recommendationSummary.capacityProtected} />
                  <Field label="Outage minutes avoided" value={recommendationSummary.outageMinutesAvoided} />
                  <Field label="Error budget preserved" value={recommendationSummary.errorBudgetPreserved} />
                </div>
              </div>
            </div>
          )}
          {workspaceTab === "Forecast" && <RiskHorizon />}
          {workspaceTab === "Signals" && <p className="text-[11.5px] text-slate-600">See the Contributing Risk Signals panel below for the full factor breakdown.</p>}
          {workspaceTab === "Customer Impact" && <p className="text-[11.5px] text-slate-600">See the Customer Exposure panel below for exposure and error budget projections.</p>}
          {workspaceTab === "Resilience" && <p className="text-[11.5px] text-slate-600">See the Preventive Action Options panel below for the route and action comparison.</p>}
          {workspaceTab === "Recommendations" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[11.5px] text-slate-800">
              <strong>{recommendationSummary.headline}</strong>
              <p className="mt-1">Rollback condition: {recommendationSummary.rollback}</p>
              <p>Expected fallback duration: {recommendationSummary.fallbackDuration}</p>
              <p>{recommendationSummary.approval}</p>
            </div>
          )}
          {workspaceTab === "Evidence" && (
            <ToolbarButton onClick={() => setEvidenceOpen(true)}><ShieldCheck className="h-3.5 w-3.5" /> Open evidence drawer</ToolbarButton>
          )}
          {workspaceTab === "History" && (
            <ul className="space-y-1 text-[11.5px] text-slate-700">
              {plrActivity.filter((e) => e.linkId === selected.linkId).map((e) => (
                <li key={e.id}>{e.at} · {e.event} · {e.outcome}</li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      {/* risk horizon */}
      <Panel title="Risk Horizon" subtitle="Forecast link behaviour, degradation thresholds and the governed intervention window">
        <RiskHorizon />
      </Panel>

      {/* contributing signals */}
      <Panel
        title="Contributing Risk Signals"
        subtitle="Individually minor signals combined into one auditable prediction"
        action={<span className="text-[10.5px] text-slate-500">Orange increases risk · Green reduces risk</span>}
      >
        <p className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">{factorExplanation}</p>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {chennaiFactors.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFactor(selectedFactor === f.id ? null : f.id)}
              className={cn("rounded-lg border p-3 text-left transition hover:border-indigo-300",
                selectedFactor === f.id ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-white")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-medium text-slate-900">{f.name}</span>
                <Chip className={f.direction === "increases" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
                  {f.direction === "increases" ? "Supports" : "Reduces"} {f.contribution}%
                </Chip>
              </div>
              <div className="mt-1 text-[11.5px] text-slate-700">{f.current}</div>
              <div className="text-[10.5px] text-slate-500">Normal range {f.normalRange} · {f.trend}</div>
              <div className="mt-2"><FactorBar value={f.contribution} direction={f.direction} /></div>
              {selectedFactor === f.id && (
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-600">
                  <span>Confidence {f.confidence}%</span>
                  <span>Freshness {f.freshness}</span>
                  <span className="col-span-2">Source: {f.source}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </Panel>

      {/* multi metric forecast */}
      <Panel
        title="Link Health Forecast"
        subtitle="Coordinated observed and predicted metrics with confidence bands, thresholds and the intervention window"
        action={
          <div className="flex flex-wrap gap-1.5">
            {FORECAST_VIEWS.map((v) => (
              <ToolbarButton key={v} onClick={() => setForecastView(v)} active={forecastView === v}>{v}</ToolbarButton>
            ))}
            <ToolbarButton onClick={() => setCompareHistory((v) => !v)} active={compareHistory}>Compare with prior period</ToolbarButton>
          </div>
        }
      >
        <div className="mb-2 flex flex-wrap gap-1.5">
          {FORECAST_METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetricKeys((keys) => keys.includes(m.key) ? keys.filter((k) => k !== m.key) : [...keys, m.key])}
              className={cn("rounded-full border px-2 py-0.5 text-[10.5px]",
                metricKeys.includes(m.key) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600")}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} onClick={(e) => setBrush(typeof e?.activeLabel === "string" ? Number(e.activeLabel.slice(0, 2)) : null)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RTooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceArea x1={forecastData[0]?.t} x2={forecastData.find((p) => p.hour === 0)?.t} fill="#f1f5f9" />
              <ReferenceArea x1={forecastData.find((p) => p.hour === 1)?.t} x2={forecastData.find((p) => p.hour === 3)?.t} fill="#dcfce7" fillOpacity={0.6} label={{ value: "Intervention window", fontSize: 10 }} />
              <ReferenceLine y={4} stroke="#e11d48" strokeDasharray="4 3" label={{ value: "Margin threshold 4 dB", fontSize: 10 }} />
              <Area type="monotone" dataKey="marginHigh" stroke="none" fill="#c7d2fe" fillOpacity={0.5} name="Confidence band" />
              <Area type="monotone" dataKey="marginLow" stroke="none" fill="#ffffff" fillOpacity={1} name="Confidence band lower" />
              {compareHistory && <Line type="monotone" dataKey="actualMargin" stroke="#94a3b8" strokeWidth={2} dot={false} name="Observed margin" />}
              {FORECAST_METRICS.filter((m) => metricKeys.includes(m.key)).map((m) => (
                <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} name={m.label} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {brush !== null && <p className="mt-1 text-[10.5px] text-slate-500">Time selection applied at {brush}:00. Evidence and activity below reflect this window.</p>}
        <details className="mt-2">
          <summary className="cursor-pointer text-[11.5px] text-indigo-700">Accessible data table</summary>
          <div className="mt-2 max-h-56 overflow-auto">
            <table className="w-full text-left text-[11px]">
              <thead><tr className="text-slate-500"><th scope="col">Time</th><th scope="col">Margin</th><th scope="col">Attenuation</th><th scope="col">Visibility</th><th scope="col">Throughput</th></tr></thead>
              <tbody>
                {forecastData.map((p) => (
                  <tr key={p.hour} className="border-t border-slate-100"><td>{p.t}</td><td>{p.margin}</td><td>{p.attenuation}</td><td>{p.visibility}</td><td>{p.throughput}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Panel>

      {/* customer exposure */}
      <Panel title="Customer Exposure" subtitle="Synthetic demonstration customer, user, commercial and error budget exposure">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <Field label="Customers exposed" value={String(chennaiExposure.customersExposed)} />
          <Field label="Services exposed" value={String(chennaiExposure.servicesExposed)} />
          <Field label="Committed capacity" value={chennaiExposure.committedCapacity} />
          <Field label="Delivered traffic" value={chennaiExposure.deliveredTraffic} />
          <Field label="Downstream locations" value={chennaiExposure.downstreamLocations} />
          <Field label="Synthetic downstream users" value={chennaiExposure.downstreamUsers} />
          <Field label="Availability objective" value={chennaiExposure.availabilityObjective} />
          <Field label="Latency objective" value={chennaiExposure.latencyObjective} />
          <Field label="Current error budget" value={chennaiExposure.errorBudgetRemaining} />
          <Field label="Predicted budget without action" value={chennaiExposure.errorBudgetWithoutAction} />
          <Field label="Predicted budget with action" value={chennaiExposure.errorBudgetWithAction} />
          <Field label="Service credit exposure" value={chennaiExposure.creditExposure} />
          <Field label="Revenue exposure" value={chennaiExposure.revenueExposure} />
          <Field label="Customer priority" value={chennaiExposure.priority} />
          <Field label="Communication status" value={chennaiExposure.communication} />
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {exposureComparison.map((o) => (
            <div key={o.id} className={cn("rounded-lg border p-3",
              o.tone === "good" ? "border-emerald-200 bg-emerald-50" : o.tone === "watch" ? "border-amber-200 bg-amber-50" : "border-rose-200 bg-rose-50")}>
              <div className="text-[12px] font-semibold text-slate-900">{o.approach}</div>
              <p className="mt-1 text-[11.5px] text-slate-700">{o.customerOutcome}</p>
              <p className="text-[11px] text-slate-600">{o.sreOutcome}</p>
              <p className="mt-1 text-[11px] text-slate-600">Error budget: {o.errorBudget}</p>
              <p className="text-[11px] text-slate-600">{o.outageMinutes}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10.5px] text-slate-400">Customer, user, financial and commercial values are synthetic demonstration data.</p>
      </Panel>

      {/* preventive actions */}
      <Panel
        title="Preventive Action Options"
        subtitle="Governed comparison of every available option, with the recommended action highlighted"
        action={<Chip className="border-emerald-200 bg-emerald-50 text-emerald-700"><Zap className="h-3 w-3" /> Recommended: {recommendationSummary.headline.slice(0, 48)}…</Chip>}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-[11.5px]">
            <caption className="sr-only">Preventive action comparison</caption>
            <thead>
              <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
                {["Compare", "Action", "Customer outcome", "SLO impact", "Capacity", "Latency", "Operational risk", "Duration", "Reversibility", "Policy", "Automation", "Approval", "Confidence", "Validation"].map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap py-2 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preventiveActions.map((a: PreventiveAction) => (
                <tr
                  key={a.id}
                  onClick={() => setSelectedActionId(a.id)}
                  className={cn("cursor-pointer border-b border-slate-100 align-top hover:bg-indigo-50/40",
                    a.recommended && "bg-emerald-50/60", selectedActionId === a.id && "ring-1 ring-inset ring-indigo-300")}
                >
                  <td className="py-2 pr-3">
                    <input
                      type="checkbox"
                      aria-label={`Compare ${a.name}`}
                      checked={comparedActions.includes(a.id)}
                      onChange={(e) => { e.stopPropagation(); setComparedActions((c) => c.includes(a.id) ? c.filter((x) => x !== a.id) : [...c, a.id]); }}
                    />
                  </td>
                  <td className="py-2 pr-3 font-medium text-slate-900">{a.name}{a.recommended && <Chip className="ml-1 border-emerald-200 bg-white text-emerald-700">Recommended</Chip>}</td>
                  <td className="py-2 pr-3 text-slate-700">{a.customerOutcome}</td>
                  <td className="py-2 pr-3">{a.sloImpact}</td>
                  <td className="py-2 pr-3">{a.capacity}</td>
                  <td className="py-2 pr-3">{a.latency}</td>
                  <td className="py-2 pr-3">{a.operationalRisk}</td>
                  <td className="py-2 pr-3">{a.duration}</td>
                  <td className="py-2 pr-3">{a.reversibility}</td>
                  <td className="py-2 pr-3">{a.policy}</td>
                  <td className="py-2 pr-3">{a.automation}</td>
                  <td className="py-2 pr-3">{a.approval}</td>
                  <td className="py-2 pr-3">{a.confidence}%</td>
                  <td className="py-2 pr-3 text-slate-600">{a.validation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {comparedActions.length > 1 && (
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {comparedActions.map((id) => {
              const a = preventiveActions.find((x) => x.id === id);
              if (!a) return null;
              return (
                <div key={id} className="rounded-lg border border-slate-200 p-3">
                  <div className="text-[12px] font-semibold text-slate-900">{a.name}</div>
                  <p className="text-[11.5px] text-slate-600">{a.customerOutcome}</p>
                  <p className="text-[11px] text-slate-500">SLO: {a.sloImpact} · Confidence {a.confidence}%</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="text-[12.5px] font-semibold text-slate-900">{recommendationSummary.headline}</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <Field label="Recommendation confidence" value={`${recommendationSummary.confidence}%`} />
            <Field label="Capacity protected" value={recommendationSummary.capacityProtected} />
            <Field label="Outage minutes avoided" value={recommendationSummary.outageMinutesAvoided} />
            <Field label="Error budget preserved" value={recommendationSummary.errorBudgetPreserved} />
            <Field label="Expected fallback duration" value={recommendationSummary.fallbackDuration} />
            <Field label="Rollback condition" value={recommendationSummary.rollback} />
            <Field label="Approval requirement" value={recommendationSummary.approval} />
            <Field label="Selected option" value={action.name} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => setDecision("approved")} active={decision === "approved"}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</ToolbarButton>
            <ToolbarButton onClick={() => setDecision("rejected")} active={decision === "rejected"}><X className="h-3.5 w-3.5" /> Reject</ToolbarButton>
            <ToolbarButton onClick={() => setSimulated(true)} active={simulated}><Play className="h-3.5 w-3.5" /> Simulate</ToolbarButton>
            <ToolbarButton onClick={() => { setDecision("more evidence"); setEvidenceOpen(true); }}><Search className="h-3.5 w-3.5" /> Request more evidence</ToolbarButton>
            <ToolbarButton onClick={() => setComparedActions(preventiveActions.map((a) => a.id))}>Compare alternatives</ToolbarButton>
            <ToolbarButton onClick={() => setDecision("pending")}>Assign owner</ToolbarButton>
            <ToolbarButton onClick={() => setActiveKpi("kpi-links-at-risk")}>Create watch</ToolbarButton>
            <ToolbarButton onClick={() => setHorizon("Next 6 hours")}>Defer until threshold</ToolbarButton>
          </div>
          {simulated && (
            <p className="mt-2 rounded-md border border-indigo-200 bg-white p-2 text-[11.5px] text-slate-700">
              Simulation result: priority classes carried on RF fallback at 9.8 Gbps, latency 5.6 ms, packet loss below 0.01 percent.
              {fallbackFailure ? " Injected fallback capacity failure halts the transition and escalates to the alternate fiber route." : ""}
            </p>
          )}
          {decision !== "pending" && <p className="mt-2 text-[11.5px] font-medium text-slate-700">Local decision state: {decision}</p>}
        </div>
      </Panel>

      {/* agents */}
      <Panel title="Predictive Digital Coworkers" subtitle="Each coworker contributes a scoped prediction, evidence and a recommended action">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {predictiveAgents.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedAgentId(a.id)}
              className="rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-indigo-300"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-900"><Bot className="h-3.5 w-3.5 text-indigo-600" />{a.name}</span>
                <Chip className={a.guardrail === "Within guardrails" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{a.guardrail}</Chip>
              </div>
              <p className="mt-1 text-[11.5px] text-slate-700">{a.prediction}</p>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[10.5px] text-slate-500">
                <span>Scope: {a.scope}</span>
                <span>Confidence {a.confidence}%</span>
                <span>Evidence reviewed {a.evidenceReviewed}</span>
                <span>Time to impact {a.timeToImpact}</span>
                <span>Awaiting approval {a.awaitingApproval}</span>
                <span>Accuracy {a.accuracy}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">Recommends: {a.recommendation}</p>
              <p className="text-[10.5px] text-slate-500">Protects: {a.outcomeProtected}</p>
            </button>
          ))}
        </div>
      </Panel>

      {/* prediction performance */}
      <Panel title="Prediction Performance" subtitle="Synthetic demonstration validation of predictions against observed outcomes">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          {performanceMetrics.map((m) => (
            <div key={m.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-[10.5px] text-slate-500">{m.label}</div>
              <div className="text-lg font-bold text-slate-900">{m.value}</div>
              <div className="text-[10px] text-slate-400">{m.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Predicted versus actual risk outcomes</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictedVersusActual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="window" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
                  <RTooltip contentStyle={{ fontSize: 11 }} /><Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line dataKey="predicted" stroke="#4f46e5" strokeWidth={2} dot={false} name="Predicted" />
                  <Line dataKey="actual" stroke="#059669" strokeWidth={2} dot={false} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Warning time distribution</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warningTimeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
                  <RTooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Predictions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Performance by risk category</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} interval={0} angle={-18} height={44} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} /><RTooltip contentStyle={{ fontSize: 11 }} /><Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="precision" fill="#4f46e5" name="Precision" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recall" fill="#22c55e" name="Recall" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Confidence calibration</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="predicted" name="Predicted" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="observed" name="Observed" tick={{ fontSize: 10 }} />
                  <ZAxis range={[70, 70]} />
                  <RTooltip contentStyle={{ fontSize: 11 }} />
                  <Scatter data={confidenceCalibration} fill="#4f46e5" name="Calibration" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-[12px] font-semibold text-slate-900">Performance by region</h3>
            <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">
              {performanceByRegion.map((r) => <li key={r.region}>{r.region}: {r.precision}% precision across {r.predictions} predictions</li>)}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-[12px] font-semibold text-slate-900">Performance by product</h3>
            <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">
              {performanceByProduct.map((p) => <li key={p.product}>{p.product}: {p.precision}% precision across {p.predictions} predictions</li>)}
            </ul>
          </div>
        </div>
        <p className="mt-2 text-[10.5px] text-slate-400">All model performance values are synthetic demonstration data.</p>
      </Panel>

      {/* activity timeline */}
      <Panel title="Predictive Risk Activity" subtitle="Weak signal to recorded outcome, including agent and human actors">
        <ol className="space-y-1.5">
          {[...scenarioLog, ...plrActivity].map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => { setSelectedEvent(e); const r = predictedLinkRisks.find((x) => x.linkId === e.linkId); if (r) setSelectedRiskId(r.id); }}
                className={cn("flex w-full flex-wrap items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-[11.5px]",
                  selectedEvent?.id === e.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50")}
              >
                <span className="font-mono text-[10.5px] text-slate-500">{e.at}</span>
                <span className="font-medium text-slate-900">{e.event}</span>
                <Chip className="border-slate-200 bg-slate-50 text-slate-600">{e.actor}</Chip>
                <span className="text-slate-600">{e.linkName}</span>
                <span className="text-slate-500">{e.serviceName}</span>
                <Chip className="border-slate-200 bg-slate-50 text-slate-600">Probability {e.probability}%</Chip>
                <span className="text-slate-600">{e.outcome}</span>
                <Chip className={e.status === "Awaiting approval" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>{e.status}</Chip>
              </button>
            </li>
          ))}
        </ol>
      </Panel>

      {/* evidence drawer */}
      <Sheet open={evidenceOpen} onOpenChange={setEvidenceOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <h2 className="text-base font-semibold text-slate-900">Evidence and explainability</h2>
          <p className="text-[11.5px] text-slate-500">{selected.linkName} · {selected.serviceName} · synthetic demonstration evidence</p>
          <div className="mt-3 space-y-3">
            {chennaiEvidence.map((g) => (
              <div key={g.id} className="rounded-lg border border-slate-200 p-3">
                <h3 className="text-[12px] font-semibold text-slate-900">{g.label}</h3>
                <dl className="mt-1 space-y-0.5 text-[11.5px]">
                  {g.items.map((i) => (
                    <div key={i.name} className="flex justify-between gap-3">
                      <dt className="text-slate-500">{i.name}</dt><dd className="text-right text-slate-800">{i.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            <div className="rounded-lg border border-slate-200 p-3">
              <h3 className="text-[12px] font-semibold text-slate-900">Alternative hypotheses</h3>
              <ul className="mt-1 space-y-1 text-[11.5px] text-slate-700">
                {alternativeHypotheses.map((h) => (
                  <li key={h.hypothesis}><strong>{h.hypothesis}</strong> — {h.verdict}. {h.reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* agent drawer */}
      <Sheet open={!!agentDetail} onOpenChange={(o) => !o && setSelectedAgentId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {agentDetail && <AgentDetail agent={agentDetail} onEvidence={() => setEvidenceOpen(true)} />}
        </SheetContent>
      </Sheet>

      {/* timeline event drawer */}
      <Sheet open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedEvent && (
            <>
              <h2 className="text-base font-semibold text-slate-900">{selectedEvent.event}</h2>
              <p className="text-[11.5px] text-slate-500">{selectedEvent.at} · {selectedEvent.actor}</p>
              <div className="mt-3 grid gap-2">
                <Field label="Affected link" value={selectedEvent.linkName} />
                <Field label="Affected customer service" value={selectedEvent.serviceName} />
                <Field label="Risk probability" value={`${selectedEvent.probability}%`} />
                <Field label="Outcome" value={selectedEvent.outcome} />
                <Field label="Status" value={selectedEvent.status} />
              </div>
              <div className="mt-3">
                <ToolbarButton onClick={() => setEvidenceOpen(true)}><ShieldCheck className="h-3.5 w-3.5" /> Open evidence</ToolbarButton>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------------------------- sub components ---------------------------- */

function RiskHorizon() {
  return (
    <div className="space-y-3">
      <ol className="grid gap-2 md:grid-cols-3 xl:grid-cols-7">
        {riskHorizonMilestones.map((m) => (
          <li
            key={m.id}
            className={cn("rounded-lg border p-3",
              m.tone === "good" ? "border-emerald-200 bg-emerald-50"
                : m.tone === "watch" ? "border-amber-200 bg-amber-50"
                : m.tone === "action" ? "border-indigo-200 bg-indigo-50"
                : "border-rose-200 bg-rose-50")}
          >
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{m.at}</div>
            <div className="text-[12px] font-semibold text-slate-900">{m.label}</div>
            <div className="text-[11px] text-slate-600">{m.value}</div>
          </li>
        ))}
      </ol>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chennaiForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
            <RTooltip contentStyle={{ fontSize: 11 }} /><Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine x="11:00" stroke="#334155" label={{ value: "Now", fontSize: 10 }} />
            <ReferenceLine y={4} stroke="#e11d48" strokeDasharray="4 3" label={{ value: "Degradation threshold", fontSize: 10 }} />
            <Area dataKey="marginHigh" stroke="none" fill="#c7d2fe" fillOpacity={0.5} name="Confidence band" />
            <Line dataKey="margin" stroke="#4f46e5" strokeWidth={2} dot={false} name="Predicted link margin (dB)" />
            <Line dataKey="actualMargin" stroke="#94a3b8" strokeWidth={2} dot={false} name="Observed link margin (dB)" />
            <Line dataKey="attenuation" stroke="#f97316" strokeWidth={2} dot={false} name="Predicted attenuation (dB)" />
            <Line dataKey="throughput" stroke="#16a34a" strokeWidth={2} dot={false} name="Predicted throughput (Gbps)" />
            <Line dataKey="latency" stroke="#eab308" strokeWidth={2} dot={false} name="Predicted latency (ms)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10.5px] text-slate-500">
        <CloudFog className="mr-1 inline h-3 w-3" aria-hidden />
        Synthetic forecast. Shaded band shows the prediction confidence interval; the recommended intervention window closes at 3 hours.
      </p>
    </div>
  );
}

function AgentDetail({ agent, onEvidence }: { agent: PredictiveAgent; onEvidence: () => void }) {
  return (
    <>
      <h2 className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
        <Bot className="h-4 w-4 text-indigo-600" /> {agent.name}
      </h2>
      <p className="text-[11.5px] text-slate-500">{agent.objective}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Field label="Current prediction" value={agent.prediction} />
        <Field label="Objects in scope" value={agent.scope} />
        <Field label="Confidence" value={`${agent.confidence}%`} />
        <Field label="Evidence reviewed" value={String(agent.evidenceReviewed)} />
        <Field label="Recommended action" value={agent.recommendation} />
        <Field label="Awaiting approval" value={String(agent.awaitingApproval)} />
        <Field label="Recent accuracy" value={agent.accuracy} />
        <Field label="Guardrail status" value={agent.guardrail} />
      </div>
      <h3 className="mt-3 text-[12px] font-semibold text-slate-900">Current work queue</h3>
      <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">{agent.queue.map((q) => <li key={q}>· {q}</li>)}</ul>
      <h3 className="mt-3 text-[12px] font-semibold text-slate-900">Prediction history</h3>
      <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-700">{agent.predictionHistory.map((q) => <li key={q}>· {q}</li>)}</ul>
      <h3 className="mt-3 text-[12px] font-semibold text-slate-900">Confidence history</h3>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={agent.confidenceHistory.map((v, i) => ({ i, v }))}>
            <XAxis dataKey="i" hide /><YAxis hide domain={[50, 100]} />
            <Line dataKey="v" stroke="#4f46e5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-1.5">
        <ToolbarButton onClick={onEvidence}><ShieldCheck className="h-3.5 w-3.5" /> Evidence reviewed</ToolbarButton>
      </div>
    </>
  );
}

/* ------------------------------- helpers -------------------------------- */

function cellValue(r: PredictedLinkRisk, key: ColumnKey): string | number {
  switch (key) {
    case "rank": return r.rank;
    case "link": return r.linkName;
    case "service": return r.serviceName;
    case "region": return r.region;
    case "product": return r.product;
    case "primary": return r.primaryRisk;
    case "secondary": return r.secondaryRisk;
    case "health": return r.currentHealth;
    case "predicted": return r.predictedState;
    case "probability": return `${r.probability}%`;
    case "confidence": return `${r.confidence}%`;
    case "tti": return r.timeToImpact;
    case "capacity": return `${r.capacityGbps} Gbps`;
    case "customers": return r.customersAffected;
    case "slo": return r.sloExposure;
    case "budget": return r.errorBudgetImpact;
    case "fallback": return r.fallbackReadiness;
    case "action": return r.preventiveAction;
    case "automation": return r.automation;
    case "agent": return r.agent;
    case "updated": return r.lastUpdate;
    default: return "";
  }
}

function renderCell(r: PredictedLinkRisk, key: ColumnKey) {
  if (key === "predicted") return <Chip className={stateChipClass[r.predictedState]}>{r.predictedState}</Chip>;
  if (key === "primary") return <Chip className={severityChipClass[r.severity]}>{r.primaryRisk}</Chip>;
  if (key === "customers") return <span className="inline-flex items-center gap-1"><Users className="h-3 w-3 text-slate-400" />{r.customersAffected}</span>;
  return cellValue(r, key);
}
