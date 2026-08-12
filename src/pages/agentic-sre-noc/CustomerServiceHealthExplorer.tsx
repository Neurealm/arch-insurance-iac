/**
 * Customer Service Health Explorer — Agentic SRE NOC.
 *
 * Customer-centred reliability, capacity, performance and SLO assurance for
 * the synthetic Taara-aligned optical connectivity estate. Everything on this
 * page is local and deterministic; data lives in ./data/cshFixtures.ts and is
 * shared with the Global Optical Operations Center where possible.
 */

import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowDown, ArrowUp, Bot, CheckCircle2, ChevronDown, ChevronRight,
  Download, Maximize2, Minimize2, Pause, Play, RefreshCw, RotateCcw, Search,
  ShieldCheck, SkipForward, Sparkles, TrendingDown, TrendingUp, X,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, Brush, CartesianGrid, Cell, Legend, Line, LineChart,
  ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Field, Panel, Select, ToolbarButton } from "./components/NocPrimitives";
import { ServiceRouteGraph } from "./components/ServiceRouteGraph";
import { PRODUCTS, REGIONS, situations, TIME_RANGES } from "./data/goocFixtures";
import {
  assuranceAgents, attainment, chennaiSloInsight, cshKpis, CSH_CUSTOMERS, customerServices,
  DATA_CONFIDENCE, DEFAULT_SERVICE_ID, errorBudgetBurn, incidentCommander, LAST_TELEMETRY,
  matrixBand, matrixBandClass, matrixBandGlyph, matrixBandLabel, matrixColumns,
  performanceSeries, preventiveVsReactive, productComparison, protectionScenario,
  regionComparison, riskBreakdown, riskChip, RISK_LEVELS, SAVED_VIEWS,
  serviceEvents, serviceRecommendation, serviceRoute, SERVICE_TYPES, sloObjectives,
  sloStatusChip, SLO_STATUSES,
  type CustomerService, type RiskLevel, type ServiceEvent, type SloStatus,
} from "./data/cshFixtures";

/* ------------------------------ table model ----------------------------- */

interface ColumnDef {
  key: string;
  label: string;
  width: number;
  value: (s: CustomerService) => string;
  numeric?: (s: CustomerService) => number;
  breach?: (s: CustomerService) => boolean;
}

const COLUMNS: ColumnDef[] = [
  { key: "customer", label: "Customer", width: 190, value: (s) => s.customer },
  { key: "name", label: "Service name", width: 250, value: (s) => s.name },
  { key: "serviceType", label: "Service type", width: 170, value: (s) => s.serviceType },
  { key: "region", label: "Region", width: 130, value: (s) => s.region },
  { key: "product", label: "Product", width: 130, value: (s) => s.product },
  { key: "committed", label: "Committed capacity", width: 140, value: (s) => `${s.committedGbps} Gbps`, numeric: (s) => s.committedGbps },
  { key: "delivered", label: "Delivered throughput", width: 150, value: (s) => `${s.deliveredGbps} Gbps`, numeric: (s) => s.deliveredGbps },
  { key: "attainment", label: "Throughput attainment", width: 160, value: (s) => `${attainment(s)}%`, numeric: (s) => attainment(s), breach: (s) => attainment(s) < 98 },
  { key: "availability", label: "Availability", width: 120, value: (s) => `${s.availability}%`, numeric: (s) => s.availability, breach: (s) => s.availability < s.availabilityObjective },
  { key: "latency", label: "Latency", width: 110, value: (s) => `${s.latencyMs} ms`, numeric: (s) => s.latencyMs, breach: (s) => s.latencyMs >= s.latencyObjectiveMs },
  { key: "loss", label: "Packet loss", width: 110, value: (s) => `${s.packetLossPct}%`, numeric: (s) => s.packetLossPct, breach: (s) => s.packetLossPct > 0.05 },
  { key: "slo", label: "SLO status", width: 140, value: (s) => s.sloStatus, breach: (s) => s.sloStatus !== "Within objective" },
  { key: "budget", label: "Error budget remaining", width: 160, value: (s) => `${s.errorBudgetPct}%`, numeric: (s) => s.errorBudgetPct, breach: (s) => s.errorBudgetPct < 40 },
  { key: "route", label: "Primary route", width: 250, value: (s) => s.primaryRoute },
  { key: "fallback", label: "Fallback state", width: 230, value: (s) => s.fallbackState },
  { key: "risk", label: "Current risk", width: 120, value: (s) => s.risk, breach: (s) => s.risk === "High" || s.risk === "Critical" },
  { key: "situation", label: "Active situation", width: 220, value: (s) => situations.find((x) => x.id === s.situationId)?.title ?? "None" },
  { key: "agent", label: "Assigned digital coworker", width: 190, value: (s) => s.agent },
  { key: "updated", label: "Last update", width: 110, value: (s) => s.lastUpdate },
];

const DEFAULT_COLUMN_KEYS = COLUMNS.map((c) => c.key);
const GROUP_BY_OPTIONS = ["No grouping", "Customer", "Region", "Product", "SLO status"] as const;

const csvEscape = (v: string) => `"${v.replace(/"/g, '""')}"`;

/* ------------------------------ small parts ----------------------------- */

function Chip({ label, className }: { label: string; className: string }) {
  return <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-medium", className)}>{label}</span>;
}

function Gauge({ label, value, objective, current, status }: { label: string; value: number; objective: string; current: string; status: SloStatus }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-medium text-slate-700">{label}</span>
        <Chip label={status} className={sloStatusChip[status]} />
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", status === "Within objective" ? "bg-emerald-500" : status === "At risk" ? "bg-amber-500" : "bg-rose-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-slate-500">
        <span>Current {current}</span>
        <span>Objective {objective}</span>
      </div>
    </div>
  );
}

/* --------------------------------- page --------------------------------- */

export default function CustomerServiceHealthExplorer() {
  /* filters */
  const [timeRange, setTimeRange] = useState("24h");
  const [customer, setCustomer] = useState("All customers");
  const [region, setRegion] = useState("All regions");
  const [product, setProduct] = useState("All products");
  const [serviceType, setServiceType] = useState("All service types");
  const [sloFilter, setSloFilter] = useState("All SLO states");
  const [riskFilter, setRiskFilter] = useState("All risk levels");
  const [search, setSearch] = useState("");
  const [savedView, setSavedView] = useState<string>(SAVED_VIEWS[0]);
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState(LAST_TELEMETRY);
  const [fullScreen, setFullScreen] = useState(false);

  /* table */
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "risk", dir: "desc" });
  const [density, setDensity] = useState<"Compact" | "Comfortable">("Compact");
  const [groupBy, setGroupBy] = useState<(typeof GROUP_BY_OPTIONS)[number]>("No grouping");
  const [columnKeys, setColumnKeys] = useState<string[]>(DEFAULT_COLUMN_KEYS);
  const [hidden, setHidden] = useState<Set<string>>(new Set(["route", "situation", "loss"]));
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [pinFirst, setPinFirst] = useState(true);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  /* selection and drawers */
  const [selectedId, setSelectedId] = useState(DEFAULT_SERVICE_ID);
  const [tab, setTab] = useState("Overview");
  const [matrixGroupBy, setMatrixGroupBy] = useState("Customer");
  const [routeNode, setRouteNode] = useState<string | null>(null);
  const [routeEdge, setRouteEdge] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ title: string; rows: [string, string][]; body?: string } | null>(null);
  const [chartWindow, setChartWindow] = useState<string | null>(null);
  const [matrixExplain, setMatrixExplain] = useState<string | null>(null);

  /* agentic recommendation */
  const [decision, setDecision] = useState<"pending" | "approved" | "rejected" | "evidence">("pending");
  const [assignedOwner, setAssignedOwner] = useState<string | null>(null);
  const [watch, setWatch] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [simulated, setSimulated] = useState(false);

  /* scenario */
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [scenarioLog, setScenarioLog] = useState<ServiceEvent[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const scenarioActive = step >= 0;
  const scenarioApproved = decision === "approved";

  /* ----------------------------- derived data ---------------------------- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customerServices.filter((s) => {
      if (customer !== "All customers" && s.customer !== customer) return false;
      if (region !== "All regions" && s.region !== region) return false;
      if (product !== "All products" && s.product !== product) return false;
      if (serviceType !== "All service types" && s.serviceType !== serviceType) return false;
      if (sloFilter !== "All SLO states" && s.sloStatus !== sloFilter) return false;
      if (riskFilter !== "All risk levels" && s.risk !== riskFilter) return false;
      if (kpiFilter === "fallback" && !s.fallbackState.toLowerCase().includes("fallback")) return false;
      if (kpiFilter === "budget" && s.errorBudgetPct >= 40) return false;
      if (q && ![s.customer, s.name, s.serviceType, s.region, s.product, s.primaryRoute, s.agent].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [customer, region, product, serviceType, sloFilter, riskFilter, kpiFilter, search]);

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sort.key);
    const rank = (s: CustomerService) => RISK_LEVELS.indexOf(s.risk);
    const rows = [...filtered].sort((a, b) => {
      if (sort.key === "risk") return rank(a) - rank(b);
      if (!col) return 0;
      if (col.numeric) return col.numeric(a) - col.numeric(b);
      return col.value(a).localeCompare(col.value(b));
    });
    return sort.dir === "desc" ? rows.reverse() : rows;
  }, [filtered, sort]);

  const grouped = useMemo(() => {
    if (groupBy === "No grouping") return [{ key: "", rows: sorted }];
    const keyOf = (s: CustomerService) =>
      groupBy === "Customer" ? s.customer : groupBy === "Region" ? s.region : groupBy === "Product" ? s.product : s.sloStatus;
    const map = new Map<string, CustomerService[]>();
    sorted.forEach((s) => {
      const k = keyOf(s);
      map.set(k, [...(map.get(k) ?? []), s]);
    });
    return [...map.entries()].map(([key, rows]) => ({ key, rows }));
  }, [sorted, groupBy]);

  const visibleColumns = useMemo(
    () => columnKeys.map((k) => COLUMNS.find((c) => c.key === k)!).filter((c) => c && !hidden.has(c.key)),
    [columnKeys, hidden],
  );

  const service = customerServices.find((s) => s.id === selectedId) ?? customerServices[0];
  const perf = useMemo(() => performanceSeries(service), [service]);
  const route = useMemo(() => serviceRoute(service), [service]);
  const objectives = useMemo(() => sloObjectives(service), [service]);
  const burn = useMemo(() => errorBudgetBurn(service), [service]);
  const rec = useMemo(() => serviceRecommendation(service), [service]);
  const risks = useMemo(() => riskBreakdown(service), [service]);
  const situation = situations.find((s) => s.id === service.situationId) ?? null;

  const isChennai = service.id === DEFAULT_SERVICE_ID;
  const scenarioBoost = scenarioActive && scenarioApproved && step >= 8 && isChennai;

  const displayedService: CustomerService = scenarioBoost
    ? { ...service, deliveredGbps: 9.9, sloStatus: "Within objective", errorBudgetPct: 57, risk: "Low", fallbackState: "On RF fallback — 6 Gbps delivered" }
    : service;

  const timeline = [...scenarioLog, ...serviceEvents];

  /* ------------------------------- actions ------------------------------- */

  const applySavedView = (view: string) => {
    setSavedView(view);
    setKpiFilter(null);
    if (view === "Customers at risk") { setRiskFilter("High"); setSloFilter("All SLO states"); }
    else if (view === "Error budget watchlist") { setRiskFilter("All risk levels"); setSloFilter("All SLO states"); setKpiFilter("budget"); }
    else if (view === "Fallback services") { setRiskFilter("All risk levels"); setSloFilter("All SLO states"); setKpiFilter("fallback"); }
    else { setRiskFilter("All risk levels"); setSloFilter("All SLO states"); }
  };

  const toggleSort = (key: string) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const moveColumn = (key: string, dir: -1 | 1) =>
    setColumnKeys((keys) => {
      const i = keys.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= keys.length) return keys;
      const next = [...keys];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const exportRows = () => {
    const header = visibleColumns.map((c) => csvEscape(c.label)).join(",");
    const body = sorted.map((s) => visibleColumns.map((c) => csvEscape(c.value(s))).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer-service-portfolio.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const startResize = (key: string, startX: number, startW: number) => {
    const onMove = (e: PointerEvent) => setWidths((w) => ({ ...w, [key]: Math.max(80, startW + (e.clientX - startX)) }));
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const advance = useCallback(() => {
    setStep((prev) => {
      const next = prev + 1;
      if (next >= protectionScenario.length) { setPlaying(false); return prev; }
      const s = protectionScenario[next];
      setScenarioLog((log) => [
        {
          id: `scn-${s.id}`,
          at: `11:1${next % 10}:${String((next * 7) % 60).padStart(2, "0")}`,
          type: s.label,
          actor: s.actor,
          service: "Chennai Mobile Backhaul Service 041",
          outcome: s.outcome,
          status: s.requiresApproval ? "Awaiting approval" : "Complete",
          detail: s.detail,
        },
        ...log,
      ]);
      if (s.requiresApproval) setPlaying(false);
      return next;
    });
  }, []);

  const resetScenario = () => {
    setStep(-1); setPlaying(false); setScenarioLog([]); setDecision("pending");
    setSimulated(false); setShowComparison(false); setAssignedOwner(null); setWatch(false);
  };

  const resetPage = () => {
    setTimeRange("24h"); setCustomer("All customers"); setRegion("All regions");
    setProduct("All products"); setServiceType("All service types");
    setSloFilter("All SLO states"); setRiskFilter("All risk levels"); setSearch("");
    setSavedView(SAVED_VIEWS[0]); setKpiFilter(null); setSelectedId(DEFAULT_SERVICE_ID);
    setTab("Overview"); setRouteNode(null); setRouteEdge(null); setDrawer(null);
    setSelectedRows(new Set()); setExpanded(new Set()); setChartWindow(null);
    setMatrixExplain(null); setGroupBy("No grouping"); setFullScreen(false);
    resetScenario();
  };

  const scenarioBlocked = scenarioActive && protectionScenario[step]?.requiresApproval && decision === "pending";

  /* -------------------------------- render ------------------------------- */

  const rowPad = density === "Compact" ? "py-1.5" : "py-3";

  return (
    <div className="max-w-[1600px] space-y-5 px-6 py-6">
      {/* 1 — Header and global controls */}
      <header className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Overview</div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Customer Service Health Explorer</h1>
            <p className="mt-1 max-w-3xl text-[13px] text-slate-600">
              Customer centered reliability, capacity, performance, and SLO assurance across global optical connectivity services
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
                Synthetic Taara-aligned demonstration environment
              </span>
              <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                Portfolio health: 94.6% within SLO, 6 customers at risk
              </span>
              <span className="text-slate-500">Last telemetry update {refreshedAt}</span>
              <span className="text-slate-500">Data confidence {DATA_CONFIDENCE}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select label="Time range" value={timeRange} options={TIME_RANGES} onChange={setTimeRange} />
            <Select label="Customer" value={customer} options={["All customers", ...CSH_CUSTOMERS]} onChange={setCustomer} />
            <Select label="Region" value={region} options={["All regions", ...REGIONS]} onChange={setRegion} />
            <Select label="Product" value={product} options={["All products", ...PRODUCTS]} onChange={setProduct} />
            <Select label="Service type" value={serviceType} options={["All service types", ...SERVICE_TYPES]} onChange={setServiceType} />
            <Select label="SLO status" value={sloFilter} options={["All SLO states", ...SLO_STATUSES]} onChange={setSloFilter} />
            <Select label="Risk status" value={riskFilter} options={["All risk levels", ...RISK_LEVELS]} onChange={setRiskFilter} />
            <Select label="Saved view" value={savedView} options={SAVED_VIEWS} onChange={applySavedView} />
            <ToolbarButton onClick={() => setRefreshedAt(`${new Date().toISOString().slice(11, 19)} UTC`)}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </ToolbarButton>
            <ToolbarButton onClick={() => setFullScreen((f) => !f)} active={fullScreen}>
              {fullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />} Full screen table
            </ToolbarButton>
            <ToolbarButton onClick={exportRows}><Download className="h-3.5 w-3.5" /> Export</ToolbarButton>
            <ToolbarButton onClick={resetPage}><RotateCcw className="h-3.5 w-3.5" /> Reset page</ToolbarButton>
          </div>
        </div>
      </header>

      {/* 2 — Customer service outcome scorecard */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {cshKpis.map((k) => {
          const TrendIcon = k.trend === "down" ? TrendingDown : TrendingUp;
          const tone = k.status === "good" ? "text-emerald-600" : k.status === "watch" ? "text-amber-600" : "text-rose-600";
          const active =
            (k.filter.kind === "slo" && sloFilter === k.filter.value) ||
            (k.filter.kind === "risk" && riskFilter === k.filter.value) ||
            (["fallback", "budget"].includes(k.filter.kind) && kpiFilter === k.filter.kind);
          return (
            <button
              key={k.id}
              type="button"
              title={`${k.explain} ${k.target}.`}
              aria-pressed={active}
              onClick={() => {
                if (k.filter.kind === "slo") { setKpiFilter(null); setSloFilter((v) => (v === k.filter.value ? "All SLO states" : k.filter.value!)); }
                else if (k.filter.kind === "risk") { setKpiFilter(null); setRiskFilter((v) => (v === k.filter.value ? "All risk levels" : k.filter.value!)); }
                else if (k.filter.kind === "fallback" || k.filter.kind === "budget") setKpiFilter((v) => (v === k.filter.kind ? null : k.filter.kind));
                else { setKpiFilter(null); setSloFilter("All SLO states"); setRiskFilter("All risk levels"); }
              }}
              className={cn(
                "rounded-xl border bg-white p-3 text-left shadow-sm transition-colors hover:border-indigo-300",
                active ? "border-indigo-500 ring-1 ring-indigo-200" : "border-slate-200",
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">{k.title}</span>
                <TrendIcon className={cn("h-3.5 w-3.5 shrink-0", tone)} aria-hidden />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">{k.value}</div>
              <div className="text-[10.5px] text-slate-500">{k.sub}</div>
              <div className="mt-1.5 h-7">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={k.spark.map((y, i) => ({ i, y }))}>
                    <Line type="monotone" dataKey="y" stroke={k.status === "good" ? "#059669" : k.status === "watch" ? "#d97706" : "#e11d48"} strokeWidth={1.4} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-slate-500">{k.delta}</div>
              <div className="text-[10px] text-slate-400">{k.target}</div>
            </button>
          );
        })}
      </div>

      {/* 3 — Customer Service Portfolio */}
      <Panel
        title="Customer Service Portfolio"
        subtitle={`${sorted.length} of ${customerServices.length} synthetic customer services · ${selectedRows.size} selected`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 shadow-sm">
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <input
                aria-label="Search customer services"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers or services"
                className="w-48 text-[11.5px] text-slate-800 outline-none"
              />
            </label>
            <Select label="Group by" value={groupBy} options={GROUP_BY_OPTIONS} onChange={(v) => setGroupBy(v as typeof groupBy)} />
            <Select label="Density" value={density} options={["Compact", "Comfortable"]} onChange={(v) => setDensity(v as typeof density)} />
            <ToolbarButton onClick={() => setShowColumnPicker((v) => !v)} active={showColumnPicker}>Columns</ToolbarButton>
            <ToolbarButton onClick={() => setPinFirst((v) => !v)} active={pinFirst}>Pin customer</ToolbarButton>
            <ToolbarButton onClick={() => setAccessibleMode((v) => !v)} active={accessibleMode}>Accessible table</ToolbarButton>
            <ToolbarButton onClick={exportRows}><Download className="h-3.5 w-3.5" /> Export rows</ToolbarButton>
          </div>
        }
      >
        {showColumnPicker && (
          <div className="mb-3 grid gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2 lg:grid-cols-3">
            {columnKeys.map((key) => {
              const col = COLUMNS.find((c) => c.key === key)!;
              return (
                <div key={key} className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2 py-1 text-[11px]">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={!hidden.has(key)}
                      onChange={() => setHidden((h) => { const n = new Set(h); if (n.has(key)) n.delete(key); else n.add(key); return n; })}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                    />
                    {col.label}
                  </label>
                  <span className="flex gap-1">
                    <button type="button" aria-label={`Move ${col.label} earlier`} onClick={() => moveColumn(key, -1)} className="rounded border border-slate-200 px-1 text-slate-500 hover:bg-slate-50">↑</button>
                    <button type="button" aria-label={`Move ${col.label} later`} onClick={() => moveColumn(key, 1)} className="rounded border border-slate-200 px-1 text-slate-500 hover:bg-slate-50">↓</button>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className={cn("overflow-auto rounded-lg border border-slate-200", fullScreen ? "max-h-[70vh]" : "max-h-[460px]")}>
          <table className="w-full border-collapse text-left text-[11.5px]">
            <caption className="sr-only">
              Customer service portfolio with committed capacity, delivered throughput, availability, latency, SLO status and risk
            </caption>
            <thead className="sticky top-0 z-10 bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="w-8 px-2 py-2" />
                <th scope="col" className="w-8 px-2 py-2">
                  <span className="sr-only">Select</span>
                </th>
                {visibleColumns.map((c, i) => (
                  <th
                    key={c.key}
                    scope="col"
                    style={{ width: widths[c.key] ?? c.width, minWidth: widths[c.key] ?? c.width }}
                    className={cn(
                      "relative border-b border-slate-200 px-2 py-2 font-medium",
                      pinFirst && i === 0 && !accessibleMode && "sticky left-0 z-10 bg-slate-50",
                    )}
                  >
                    <button type="button" onClick={() => toggleSort(c.key)} className="flex items-center gap-1 hover:text-slate-800">
                      {c.label}
                      {sort.key === c.key && (sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                    <span
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`Resize ${c.label}`}
                      onPointerDown={(e) => startResize(c.key, e.clientX, widths[c.key] ?? c.width)}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-indigo-300"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            {grouped.map((g) => (
              <tbody key={g.key || "all"}>
                {g.key && (
                  <tr className="bg-slate-100/70">
                    <th colSpan={visibleColumns.length + 2} scope="colgroup" className="px-2 py-1 text-left text-[11px] font-semibold text-slate-700">
                      {groupBy}: {g.key} · {g.rows.length} services
                    </th>
                  </tr>
                )}
                {g.rows.map((s) => {
                  const isSel = s.id === selectedId;
                  const isOpen = expanded.has(s.id);
                  return (
                    <>
                      <tr
                        key={s.id}
                        onClick={() => { setSelectedId(s.id); setRouteNode(null); setRouteEdge(null); }}
                        className={cn("cursor-pointer border-b border-slate-100 hover:bg-indigo-50/40", isSel && "bg-indigo-50")}
                      >
                        <td className={cn("px-2", rowPad)}>
                          <button
                            type="button"
                            aria-label={isOpen ? `Collapse ${s.name}` : `Expand ${s.name}`}
                            aria-expanded={isOpen}
                            onClick={(e) => { e.stopPropagation(); setExpanded((x) => { const n = new Set(x); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; }); }}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                        <td className={cn("px-2", rowPad)}>
                          <input
                            type="checkbox"
                            aria-label={`Select ${s.name}`}
                            checked={selectedRows.has(s.id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => setSelectedRows((r) => { const n = new Set(r); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                          />
                        </td>
                        {visibleColumns.map((c, i) => {
                          const breach = c.breach?.(s) ?? false;
                          return (
                            <td
                              key={c.key}
                              className={cn(
                                "px-2 text-slate-700", rowPad,
                                pinFirst && i === 0 && !accessibleMode && "sticky left-0 z-[1] bg-inherit font-medium text-slate-900",
                                breach && !accessibleMode && "bg-rose-50/70 font-medium text-rose-700",
                              )}
                            >
                              {c.key === "slo" ? (
                                accessibleMode ? `${s.sloStatus}${breach ? " (threshold breach)" : ""}` : <Chip label={s.sloStatus} className={sloStatusChip[s.sloStatus]} />
                              ) : c.key === "risk" ? (
                                accessibleMode ? s.risk : <Chip label={s.risk} className={riskChip[s.risk]} />
                              ) : (
                                <>{c.value(s)}{accessibleMode && breach ? " (threshold breach)" : ""}</>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      {isOpen && (
                        <tr key={`${s.id}-detail`} className="border-b border-slate-100 bg-slate-50/60">
                          <td colSpan={visibleColumns.length + 2} className="px-4 py-3">
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                              <Field label="Primary route" value={s.primaryRoute} />
                              <Field label="Fallback state" value={s.fallbackState} />
                              <Field label="Users or services affected" value={s.usersAffected} />
                              <Field label="Customer priority" value={s.priority} />
                              <Field label="Active situation" value={situations.find((x) => x.id === s.situationId)?.title ?? "None"} />
                              <Field label="Assigned digital coworker" value={s.agent} />
                              <Field label="Service credit exposure" value={s.creditExposure} />
                              <Field label="Revenue at risk" value={s.revenueAtRisk} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            ))}
          </table>
          {sorted.length === 0 && (
            <div className="grid place-items-center px-4 py-10 text-[12px] text-slate-500">
              No customer services match the current filters
            </div>
          )}
        </div>
      </Panel>

      {/* 4 — Customer Service Health Matrix */}
      <Panel
        title="Customer Service Health Matrix"
        subtitle="Each cell shows a status band with a text indicator so status is never conveyed by colour alone"
        action={<Select label="Group by" value={matrixGroupBy} options={["Customer", "Region", "Product", "Service type", "SLO status"]} onChange={setMatrixGroupBy} />}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-[11px]">
            <caption className="sr-only">Customer service health matrix across ten reliability dimensions</caption>
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-2 py-2 font-medium">
                  {matrixGroupBy} / customer service
                </th>
                {matrixColumns.map((c) => (
                  <th key={c.key} scope="col" className="px-1 py-2 text-center font-medium" title={c.label}>{c.short}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const keyOf = (s: CustomerService) =>
                  matrixGroupBy === "Customer" ? s.customer :
                  matrixGroupBy === "Region" ? s.region :
                  matrixGroupBy === "Product" ? s.product :
                  matrixGroupBy === "Service type" ? s.serviceType : s.sloStatus;
                const groups = new Map<string, CustomerService[]>();
                sorted.forEach((s) => groups.set(keyOf(s), [...(groups.get(keyOf(s)) ?? []), s]));
                return [...groups.entries()].flatMap(([gk, rows]) => [
                  <tr key={`g-${gk}`} className="bg-slate-100/70">
                    <th colSpan={matrixColumns.length + 1} scope="colgroup" className="px-2 py-1 text-left text-[10.5px] font-semibold text-slate-700">{gk}</th>
                  </tr>,
                  ...rows.map((s) => (
                    <tr key={s.id} className={cn("border-b border-slate-100", s.id === selectedId && "bg-indigo-50/60")}>
                      <th scope="row" className="max-w-[260px] truncate px-2 py-1.5 text-left font-medium text-slate-800">{s.name}</th>
                      {matrixColumns.map((c) => {
                        const score = s.matrix[c.key];
                        const band = matrixBand(score);
                        return (
                          <td key={c.key} className="px-1 py-1 text-center">
                            <button
                              type="button"
                              aria-label={`${s.name}, ${c.label}: ${matrixBandLabel[band]}, score ${score}`}
                              title={`${c.label}: ${score} — ${matrixBandLabel[band]}`}
                              onClick={() => {
                                setSelectedId(s.id);
                                setCustomer(s.customer);
                                setMatrixExplain(`${s.name} — ${c.label} scores ${score} of 100 (${matrixBandLabel[band]}). Derived from the last ${timeRange} of synthetic telemetry, contract objectives and agent confidence.`);
                              }}
                              className={cn("w-full rounded border px-1 py-0.5 text-[10.5px] font-medium", matrixBandClass[band])}
                            >
                              {matrixBandGlyph[band]} {score}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  )),
                ]);
              })()}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-slate-600" aria-live="polite">
          {matrixExplain ?? "Select a cell to filter the portfolio, select the service and explain the current status."}
        </p>
      </Panel>

      {/* 5 — Selected customer service workspace */}
      <Panel
        title="Selected Customer Service"
        subtitle={`${displayedService.name} · ${displayedService.customer}`}
        action={
          <span className={cn(
            "rounded-md border px-2.5 py-1 text-[11.5px] font-semibold",
            displayedService.sloStatus === "Within objective" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800",
          )}>
            {displayedService.sloStatus === "Within objective"
              ? "Within Objective, Customer Outcome Protected"
              : "At Risk, Preventive Action Recommended"}
          </span>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Customer" value={displayedService.customer} />
          <Field label="Service identifier" value={displayedService.id.toUpperCase()} />
          <Field label="Service type" value={displayedService.serviceType} />
          <Field label="Region" value={displayedService.region} />
          <Field label="Product" value={displayedService.product} />
          <Field label="Contracted capacity" value={`${displayedService.committedGbps} Gbps`} />
          <Field label="Delivered throughput" value={`${displayedService.deliveredGbps} Gbps (${attainment(displayedService)}%)`} />
          <Field label="Availability objective" value={`${displayedService.availabilityObjective}%`} />
          <Field label="Latency objective" value={`< ${displayedService.latencyObjectiveMs} ms`} />
          <Field label="Current SLO status" value={displayedService.sloStatus} />
          <Field label="Error budget remaining" value={`${displayedService.errorBudgetPct}%`} />
          <Field label="Primary optical route" value={displayedService.primaryRoute} />
          <Field label="Fallback route" value={displayedService.fallbackState} />
          <Field label="Current risk" value={displayedService.risk} />
          <Field label="Assigned digital coworkers" value={rec.agents.slice(0, 3).join(", ")} />
          <Field label="Last update" value={displayedService.lastUpdate} />
        </div>

        <div className="mt-4 flex flex-wrap gap-1 border-b border-slate-200" role="tablist" aria-label="Selected customer service views">
          {["Overview", "Performance", "Route", "SLO", "Situations", "Agent Activity", "Evidence"].map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "-mb-px rounded-t-md border border-b-0 px-3 py-1.5 text-[11.5px]",
                tab === t ? "border-slate-200 bg-white font-semibold text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="pt-4" role="tabpanel" aria-label={`${tab} panel`}>
          {tab === "Overview" && (
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-3 lg:col-span-2">
                <h3 className="text-[12px] font-semibold text-slate-900">Customer outcome summary</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                  {displayedService.name} is delivering {displayedService.deliveredGbps} Gbps of a contracted {displayedService.committedGbps} Gbps
                  for {displayedService.customer}. The optical route remains available, but declining visibility and rising optical attenuation are
                  reducing delivered throughput toward the committed capacity and latency thresholds. Operations are managed around this customer
                  outcome rather than the underlying terminal alarms.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <Field label="Users or services affected" value={displayedService.usersAffected} />
                  <Field label="Customer priority" value={displayedService.priority} />
                  <Field label="Revenue at risk" value={displayedService.revenueAtRisk} />
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-900">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden /> Agent insight
                </h3>
                <p className="mt-1 text-[12px] text-amber-900">{chennaiSloInsight}</p>
                <p className="mt-2 text-[10.5px] text-amber-800">Synthetic demonstration values.</p>
              </div>
            </div>
          )}

          {tab === "Performance" && (
            <div className="space-y-4">
              <h3 className="text-[12px] font-semibold text-slate-900">Service Performance</h3>
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-3">
                  <h4 className="text-[11.5px] font-semibold text-slate-800">Committed Capacity Versus Delivered Throughput</h4>
                  <div className="mt-2 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={perf} onClick={(e) => setChartWindow(typeof e?.activeLabel === "string" ? e.activeLabel : null)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                        <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} unit=" G" />
                        <RTooltip contentStyle={{ fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Area type="monotone" dataKey="committed" name="Committed" stroke="#94a3b8" fill="#f1f5f9" />
                        <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#4f46e5" fill="#e0e7ff" />
                        <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#d97706" strokeDasharray="4 3" dot={false} />
                        <ReferenceLine y={perf[0].threshold} stroke="#e11d48" strokeDasharray="3 3" label={{ value: "Threshold", fontSize: 9, fill: "#e11d48" }} />
                        <Brush dataKey="t" height={16} travellerWidth={8} stroke="#c7d2fe" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <h4 className="text-[11.5px] font-semibold text-slate-800">Service Availability</h4>
                  <div className="mt-2 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={perf} onClick={(e) => setChartWindow(typeof e?.activeLabel === "string" ? e.activeLabel : null)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                        <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                        <YAxis domain={["dataMin - 0.01", "dataMax + 0.005"]} tick={{ fontSize: 10 }} />
                        <RTooltip contentStyle={{ fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="availability" name="Availability" stroke="#059669" dot={false} />
                        <ReferenceLine y={service.availabilityObjective} stroke="#0f172a" strokeDasharray="3 3" label={{ value: "Objective", fontSize: 9 }} />
                        <ReferenceLine x="16:00" stroke="#d97706" label={{ value: "Degraded", fontSize: 9, fill: "#d97706" }} />
                        <Brush dataKey="t" height={16} travellerWidth={8} stroke="#c7d2fe" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <h4 className="text-[11.5px] font-semibold text-slate-800">Latency and Packet Loss</h4>
                  <div className="mt-2 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={perf} onClick={(e) => setChartWindow(typeof e?.activeLabel === "string" ? e.activeLabel : null)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                        <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="l" tick={{ fontSize: 10 }} unit=" ms" />
                        <YAxis yAxisId="p" orientation="right" tick={{ fontSize: 10 }} unit="%" />
                        <RTooltip contentStyle={{ fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line yAxisId="l" type="monotone" dataKey="latency" name="Latency" stroke="#7c3aed" dot={false} />
                        <Line yAxisId="p" type="monotone" dataKey="packetLoss" name="Packet loss" stroke="#e11d48" dot={false} />
                        <ReferenceLine yAxisId="l" y={service.latencyObjectiveMs} stroke="#0f172a" strokeDasharray="3 3" label={{ value: "Objective", fontSize: 9 }} />
                        <ReferenceLine x="20:00" stroke="#4f46e5" label={{ value: "Route change", fontSize: 9, fill: "#4f46e5" }} />
                        <Brush dataKey="t" height={16} travellerWidth={8} stroke="#c7d2fe" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <h4 className="text-[11.5px] font-semibold text-slate-800">Optical and Fallback Traffic Share</h4>
                  <div className="mt-2 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={perf} onClick={(e) => setChartWindow(typeof e?.activeLabel === "string" ? e.activeLabel : null)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                        <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} unit=" G" />
                        <RTooltip contentStyle={{ fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Area type="monotone" stackId="1" dataKey="optical" name="Optical" stroke="#059669" fill="#d1fae5" />
                        <Area type="monotone" stackId="1" dataKey="rf" name="RF fallback" stroke="#0284c7" fill="#e0f2fe" />
                        <Area type="monotone" stackId="1" dataKey="altOptical" name="Alternate optical" stroke="#7c3aed" fill="#ede9fe" />
                        <Area type="monotone" stackId="1" dataKey="fiber" name="Fiber backup" stroke="#0f766e" fill="#ccfbf1" />
                        <Brush dataKey="t" height={16} travellerWidth={8} stroke="#c7d2fe" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                <span aria-live="polite">
                  {chartWindow ? `Selected period ${chartWindow} — the timeline and evidence panel are scoped to this window.` : "Select a point on any chart to scope the timeline and evidence panel."}
                </span>
                <ToolbarButton onClick={() => setDrawer({
                  title: "Accessible performance table",
                  rows: perf.filter((_, i) => i % 3 === 0).map((p) => [p.t, `Delivered ${p.delivered} Gbps · availability ${p.availability}% · latency ${p.latency} ms · loss ${p.packetLoss}%`]),
                })}>Accessible table view</ToolbarButton>
                <ToolbarButton onClick={exportRows}><Download className="h-3.5 w-3.5" /> Export</ToolbarButton>
              </div>
            </div>
          )}

          {tab === "Route" && (
            <div className="space-y-3">
              <h3 className="text-[12px] font-semibold text-slate-900">End-to-End Customer Service Route</h3>
              <ServiceRouteGraph
                route={route}
                selectedNodeId={routeNode}
                selectedEdgeId={routeEdge}
                onSelectNode={(id) => {
                  const n = route.nodes.find((x) => x.id === id)!;
                  setRouteNode(id); setRouteEdge(null);
                  setDrawer({
                    title: n.name,
                    rows: [["Type", n.type], ["Owner", n.owner], ["Health", n.health], ["Capacity", n.capacity], ["Latency", n.latency], ["Active issue", n.issue], ["Agent activity", n.agentActivity]],
                  });
                }}
                onSelectEdge={(id) => {
                  const e = route.edges.find((x) => x.id === id)!;
                  setRouteEdge(id); setRouteNode(null);
                  setDrawer({
                    title: `${e.transport} segment`,
                    rows: [["Transport type", e.transport], ["Current throughput", e.throughput], ["Maximum capacity", e.maxCapacity], ["Availability", e.availability], ["Latency", e.latency], ["Current state", e.state], ["Fallback eligibility", e.fallbackEligible]],
                  });
                }}
              />
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Current active route" value={route.edges.find((e) => e.id === route.activeEdgeId)?.transport ?? "Primary optical"} />
                <Field label="Current incidents" value={route.incidents.join("; ")} />
                <Field label="Predicted risks" value={route.predictedRisks.join("; ")} />
                <Field label="Recent changes" value={route.recentChanges.join("; ")} />
              </div>
              <p className="text-[11.5px] text-slate-600">{route.customerImpact}</p>
            </div>
          )}

          {tab === "SLO" && (
            <div className="space-y-4">
              <h3 className="text-[12px] font-semibold text-slate-900">Service Level Objectives</h3>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {objectives.map((o) => (
                  <Gauge key={o.label} label={o.label} value={o.attainment} objective={o.objective} current={o.current} status={o.status} />
                ))}
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-3 lg:col-span-2">
                  <h4 className="text-[11.5px] font-semibold text-slate-800">Error budget burn</h4>
                  <div className="mt-2 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={burn}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} unit="%" />
                        <RTooltip contentStyle={{ fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="remaining" name="Remaining budget" stroke="#4f46e5" dot={false} />
                        <Line type="monotone" dataKey="projected" name="Projected without action" stroke="#e11d48" strokeDasharray="4 3" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-2">
                  <Field label="Burn rate" value="2.4x the sustainable rate" />
                  <Field label="Remaining error budget" value={`${displayedService.errorBudgetPct}%`} />
                  <Field label="Forecast breach" value={scenarioBoost ? "Cleared after preventive transition" : "Within 5 days"} />
                  <Field label="Current risk" value={displayedService.risk} />
                  <Field label="Recommended action" value="Preventive transition to validated RF fallback" />
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-[12px] text-amber-900">
                <strong className="font-semibold">Agent insight — </strong>{chennaiSloInsight}
                <div className="mt-1 text-[10.5px] text-amber-800">Synthetic demonstration values only.</div>
              </div>
            </div>
          )}

          {tab === "Situations" && (
            <div className="space-y-2">
              {situation ? (
                <button
                  type="button"
                  onClick={() => setDrawer({
                    title: situation.title,
                    rows: [["Severity", situation.severity], ["Likely cause", situation.likelyCause], ["Customer impact", situation.customerImpact], ["Agent", situation.agent], ["Confidence", `${situation.confidence}%`], ["Current action", situation.currentAction], ["Recommendation", situation.recommendation]],
                    body: situation.summary,
                  })}
                  className="w-full rounded-lg border border-slate-200 p-3 text-left hover:border-indigo-300"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden />
                    <span className="text-[12px] font-semibold text-slate-900">{situation.title}</span>
                  </div>
                  <p className="mt-1 text-[11.5px] text-slate-600">{situation.customerImpact} · {situation.currentAction}</p>
                </button>
              ) : (
                <p className="text-[12px] text-slate-500">No active situations are correlated with this customer service.</p>
              )}
            </div>
          )}

          {tab === "Agent Activity" && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {assuranceAgents.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setDrawer({
                    title: a.name,
                    rows: [["Status", a.status], ["Objective", a.objective], ["Scope", a.scope], ["Confidence", `${a.confidence}%`], ["Actions today", String(a.actionsToday)], ["Last outcome", a.lastOutcome], ["Guardrail", a.guardrail]],
                    body: a.decisions.join(" · "),
                  })}
                  className="rounded-lg border border-slate-200 p-3 text-left hover:border-indigo-300"
                >
                  <div className="flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
                    <span className="text-[12px] font-semibold text-slate-900">{a.name}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">{a.task}</p>
                  <p className="mt-1 text-[10.5px] text-slate-500">{a.status} · confidence {a.confidence}%</p>
                </button>
              ))}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
                  <span className="text-[12px] font-semibold text-slate-900">{incidentCommander.name}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">{incidentCommander.task}</p>
                <p className="mt-1 text-[10.5px] text-slate-500">{incidentCommander.status} · confidence {incidentCommander.confidence}%</p>
              </div>
            </div>
          )}

          {tab === "Evidence" && (
            <ul className="space-y-1.5 text-[11.5px] text-slate-700">
              {rec.evidence.map((e) => (
                <li key={e} className="flex items-start gap-2 rounded-md border border-slate-200 px-2.5 py-1.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden /> {e}
                </li>
              ))}
              <li className="text-[10.5px] text-slate-500">
                {chartWindow ? `Scoped to the ${chartWindow} window.` : "Evidence covers the full selected time range."}
              </li>
            </ul>
          )}
        </div>
      </Panel>

      {/* 6 — Customer impact and agentic assurance */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Panel title="Customer Impact" subtitle="Synthetic business and SRE impact for the selected customer service">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Customer service health" value={displayedService.sloStatus} />
            <Field label="Capacity currently exposed" value={`${(displayedService.committedGbps - displayedService.deliveredGbps).toFixed(1)} Gbps`} />
            <Field label="Users or downstream services affected" value={displayedService.usersAffected} />
            <Field label="Contract objective at risk" value={`Availability ${displayedService.availabilityObjective}% and latency < ${displayedService.latencyObjectiveMs} ms`} />
            <Field label="Estimated service credit exposure" value={scenarioBoost ? "$0 after preventive action" : displayedService.creditExposure} />
            <Field label="Revenue at risk" value={displayedService.revenueAtRisk} />
            <Field label="Customer priority" value={displayedService.priority} />
            <Field label="Current communication state" value={decision === "approved" ? "Planned advisory issued" : "Draft advisory prepared"} />
            <Field label="Executive escalation status" value={displayedService.priority === "Platinum" ? "Executive sponsor notified" : "Not escalated"} />
            <Field label="Recommended customer action" value="Confirm preventive maintenance window for the fallback transition" />
          </div>
          <h3 className="mt-4 text-[12px] font-semibold text-slate-900">Risk breakdown</h3>
          <ul className="mt-2 space-y-1.5">
            {risks.map((r) => (
              <li key={r.label} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11.5px]">
                <span className="font-medium text-slate-800">{r.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-slate-600">{r.detail}</span>
                  <Chip label={r.level} className={riskChip[r.level as RiskLevel]} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-slate-500">
            Confidence {rec.confidence}% · {rec.evidence.length} supporting evidence items
          </p>
        </Panel>

        <Panel
          title="Agentic Service Assurance"
          subtitle="Coordinated digital coworker recommendation for the selected customer service"
          action={<Chip label={decision === "pending" ? "Awaiting human approval" : decision === "approved" ? "Approved" : decision === "rejected" ? "Rejected" : "More evidence requested"} className={decision === "approved" ? sloStatusChip["Within objective"] : decision === "rejected" ? sloStatusChip.Breaching : sloStatusChip["At risk"]} />}
        >
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
              <div>
                <p className="text-[12.5px] font-semibold text-slate-900">{rec.recommendation}</p>
                <p className="mt-1 text-[11.5px] text-slate-700">{rec.reason}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Confidence" value={`${rec.confidence}%`} />
            <Field label="Customer outcome protected" value={rec.outcomeProtected} />
            <Field label="SLO impact avoided" value={rec.sloImpactAvoided} />
            <Field label="Expected duration" value={rec.expectedDuration} />
            <Field label="Fallback capacity" value={rec.fallbackCapacity} />
            <Field label="Policy status" value={rec.policyStatus} />
            <Field label="Approval requirement" value={rec.approvalRequirement} />
            <Field label="Rollback condition" value={rec.rollbackCondition} />
            <Field label="Evidence" value={`${rec.evidence.length} items`} />
          </div>

          <h3 className="mt-3 text-[12px] font-semibold text-slate-900">Validation criteria</h3>
          <ul className="mt-1 grid gap-1 sm:grid-cols-2">
            {rec.validationCriteria.map((v) => (
              <li key={v} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11.5px] text-slate-700">{v}</li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => setDecision("approved")} active={decision === "approved"}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</ToolbarButton>
            <ToolbarButton onClick={() => setDecision("rejected")} active={decision === "rejected"}><X className="h-3.5 w-3.5" /> Reject</ToolbarButton>
            <ToolbarButton onClick={() => setDecision("evidence")} active={decision === "evidence"}>Request more evidence</ToolbarButton>
            <ToolbarButton onClick={() => setSimulated(true)} active={simulated}>Simulate outcome</ToolbarButton>
            <ToolbarButton onClick={() => setAssignedOwner("S. Rao — Network Operations")} active={!!assignedOwner}>Assign human owner</ToolbarButton>
            <ToolbarButton onClick={() => setWatch((w) => !w)} active={watch}>Create watch</ToolbarButton>
            <ToolbarButton onClick={() => setDrawer({ title: "Recommendation evidence", rows: rec.evidence.map((e, i) => [`Evidence ${i + 1}`, e]) })}>Open evidence</ToolbarButton>
            <ToolbarButton onClick={() => setShowAlternatives((v) => !v)} active={showAlternatives}>Compare alternative actions</ToolbarButton>
          </div>

          <p className="mt-2 text-[11px] text-slate-600" aria-live="polite">
            {decision === "approved" && "Approved — preventive transition scheduled, rollback condition armed."}
            {decision === "rejected" && "Rejected — the service remains on the primary optical path with heightened monitoring."}
            {decision === "evidence" && "More evidence requested — agents are assembling additional supporting telemetry."}
            {decision === "pending" && "Awaiting a human decision. No customer-impacting change has been made."}
            {simulated && " Simulation: customer impact avoided, 23 points of error budget preserved."}
            {assignedOwner && ` Owner assigned: ${assignedOwner}.`}
            {watch && " Watch created for this customer service."}
          </p>

          {showAlternatives && (
            <table className="mt-3 w-full border-collapse text-left text-[11.5px]">
              <caption className="sr-only">Comparison of alternative actions</caption>
              <thead className="text-[10.5px] uppercase tracking-wide text-slate-500">
                <tr><th scope="col" className="px-2 py-1">Action</th><th scope="col" className="px-2 py-1">Outcome</th><th scope="col" className="px-2 py-1">Risk</th></tr>
              </thead>
              <tbody>
                {rec.alternatives.map((a) => (
                  <tr key={a.action} className="border-t border-slate-100">
                    <td className="px-2 py-1.5 font-medium text-slate-800">{a.action}</td>
                    <td className="px-2 py-1.5 text-slate-600">{a.outcome}</td>
                    <td className="px-2 py-1.5"><Chip label={a.risk} className={riskChip[a.risk as RiskLevel]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      {/* 7 — Customer service protection scenario */}
      <Panel
        title="Run Customer Service Protection Scenario"
        subtitle="Deterministic, local demonstration of preventive customer outcome protection in Chennai"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <ToolbarButton onClick={() => { if (!scenarioActive) advance(); setPlaying(true); }} active={playing}><Play className="h-3.5 w-3.5" /> Start</ToolbarButton>
            <ToolbarButton onClick={() => setPlaying(false)}><Pause className="h-3.5 w-3.5" /> Pause</ToolbarButton>
            <ToolbarButton onClick={advance} title={scenarioBlocked ? "Approval required before continuing" : undefined}>Continue</ToolbarButton>
            <ToolbarButton onClick={() => { if (!scenarioBlocked) advance(); }}><SkipForward className="h-3.5 w-3.5" /> Skip to next stage</ToolbarButton>
            <ToolbarButton onClick={() => setDecision("approved")} active={decision === "approved"}>Approve</ToolbarButton>
            <ToolbarButton onClick={() => setDecision("rejected")} active={decision === "rejected"}>Reject</ToolbarButton>
            <ToolbarButton onClick={resetScenario}><RotateCcw className="h-3.5 w-3.5" /> Reset</ToolbarButton>
            <ToolbarButton onClick={() => setShowComparison((v) => !v)} active={showComparison}>Compare preventive and reactive</ToolbarButton>
          </div>
        }
      >
        <ol className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
          {protectionScenario.map((s, i) => {
            const done = scenarioActive && i < step;
            const current = i === step;
            return (
              <li
                key={s.id}
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-[11.5px]",
                  current ? "border-indigo-400 bg-indigo-50" : done ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-white",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{i + 1}. {s.label}</span>
                  <span className="text-[10px] text-slate-500">{done ? "Complete" : current ? "In progress" : "Pending"}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-600">{s.detail}</p>
                <p className="mt-0.5 text-[10.5px] text-slate-500">{s.actor}</p>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-[11.5px] text-slate-600" aria-live="polite">
          {scenarioBlocked
            ? "Human approval is required before the traffic transition can be simulated."
            : scenarioActive
              ? `Stage ${step + 1} of ${protectionScenario.length}: ${protectionScenario[step].outcome}.`
              : "The scenario has not started. Selecting Start walks the customer protection sequence stage by stage."}
        </p>

        {showComparison && (
          <table className="mt-3 w-full border-collapse text-left text-[11.5px]">
            <caption className="sr-only">Preventive versus reactive outcome comparison</caption>
            <thead className="text-[10.5px] uppercase tracking-wide text-slate-500">
              <tr><th scope="col" className="px-2 py-1">Measure</th><th scope="col" className="px-2 py-1">Preventive</th><th scope="col" className="px-2 py-1">Reactive</th></tr>
            </thead>
            <tbody>
              {preventiveVsReactive.map((r) => (
                <tr key={r.measure} className="border-t border-slate-100">
                  <td className="px-2 py-1.5 font-medium text-slate-800">{r.measure}</td>
                  <td className="px-2 py-1.5 text-emerald-700">{r.preventive}</td>
                  <td className="px-2 py-1.5 text-rose-700">{r.reactive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* 8 — Portfolio comparison */}
      <Panel title="Portfolio Comparison" subtitle="Selecting a region or product cross filters the page">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-[11.5px] font-semibold text-slate-800">Service Health by Region</h3>
            <div className="mt-2 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionComparison} onClick={(e) => { const r = e?.activeLabel; if (typeof r === "string") setRegion((v) => (v === r ? "All regions" : r)); }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="region" tick={{ fontSize: 9 }} interval={0} angle={-14} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RTooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="attainment" name="Throughput attainment %" fill="#4f46e5">
                    {regionComparison.map((r) => <Cell key={r.region} fill={region === r.region ? "#312e81" : "#4f46e5"} />)}
                  </Bar>
                  <Bar dataKey="errorBudgetExposure" name="Error budget exposure %" fill="#f59e0b" />
                  <Bar dataKey="customersAtRisk" name="Customers at risk" fill="#e11d48" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="mt-2 w-full border-collapse text-left text-[11px]">
              <caption className="sr-only">Service health by region</caption>
              <thead className="text-[10px] uppercase tracking-wide text-slate-500">
                <tr><th scope="col" className="px-1 py-1">Region</th><th scope="col" className="px-1 py-1">Services</th><th scope="col" className="px-1 py-1">Availability</th><th scope="col" className="px-1 py-1">Fallback usage</th></tr>
              </thead>
              <tbody>
                {regionComparison.map((r) => (
                  <tr key={r.region} className="border-t border-slate-100">
                    <td className="px-1 py-1 text-slate-700">{r.region}</td>
                    <td className="px-1 py-1 text-slate-600">{r.services}</td>
                    <td className="px-1 py-1 text-slate-600">{r.availability}%</td>
                    <td className="px-1 py-1 text-slate-600">{r.fallbackUsage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <h3 className="text-[11.5px] font-semibold text-slate-800">Service Health by Product</h3>
            <div className="mt-2 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productComparison} onClick={(e) => { const p = e?.activeLabel; if (typeof p === "string") setProduct((v) => (v === p ? "All products" : p)); }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="product" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RTooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="attainment" name="Throughput attainment %" fill="#0284c7">
                    {productComparison.map((p) => <Cell key={p.product} fill={product === p.product ? "#0c4a6e" : "#0284c7"} />)}
                  </Bar>
                  <Bar dataKey="weatherExposure" name="Weather exposure %" fill="#d97706" />
                  <Bar dataKey="agentInterventions" name="Agent interventions" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="mt-2 w-full border-collapse text-left text-[11px]">
              <caption className="sr-only">Service health by product</caption>
              <thead className="text-[10px] uppercase tracking-wide text-slate-500">
                <tr><th scope="col" className="px-1 py-1">Product</th><th scope="col" className="px-1 py-1">Services</th><th scope="col" className="px-1 py-1">Availability</th><th scope="col" className="px-1 py-1">Latency</th><th scope="col" className="px-1 py-1">Error budget</th></tr>
              </thead>
              <tbody>
                {productComparison.map((p) => (
                  <tr key={p.product} className="border-t border-slate-100">
                    <td className="px-1 py-1 text-slate-700">{p.product}</td>
                    <td className="px-1 py-1 text-slate-600">{p.services}</td>
                    <td className="px-1 py-1 text-slate-600">{p.availability}%</td>
                    <td className="px-1 py-1 text-slate-600">{p.latencyMs} ms</td>
                    <td className="px-1 py-1 text-slate-600">{p.errorBudget}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      {/* 9 — Customer service activity timeline */}
      <Panel title="Customer Service Activity" subtitle={`${timeline.length} synthetic events${chartWindow ? ` · scoped to ${chartWindow}` : ""}`}>
        <ul className="space-y-1.5">
          {timeline.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => setDrawer({
                  title: e.type,
                  rows: [["Timestamp", e.at], ["Actor", e.actor], ["Service", e.service], ["Outcome", e.outcome], ["Status", e.status]],
                  body: e.detail,
                })}
                className="flex w-full flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-left text-[11.5px] hover:border-indigo-300"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10.5px] text-slate-500">{e.at}</span>
                  <span className="font-medium text-slate-900">{e.type}</span>
                  <span className="text-slate-500">{e.actor}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-slate-600">{e.outcome}</span>
                  <Chip
                    label={e.status}
                    className={e.status === "Awaiting approval" ? sloStatusChip["At risk"] : e.status === "Complete" ? sloStatusChip["Within objective"] : "border-slate-200 bg-slate-50 text-slate-600"}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <p className="text-[10.5px] text-slate-500">
        All customers, services, routes, incidents, financial figures and outcomes on this page are synthetic demonstration data.
      </p>

      {/* Shared detail drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {drawer && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">{drawer.title}</h2>
              {drawer.body && <p className="text-[12px] leading-relaxed text-slate-600">{drawer.body}</p>}
              <div className="grid gap-2 sm:grid-cols-2">
                {drawer.rows.map(([k, v]) => <Field key={k} label={k} value={v} />)}
              </div>
              <p className="text-[10.5px] text-slate-500">Synthetic demonstration data.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
