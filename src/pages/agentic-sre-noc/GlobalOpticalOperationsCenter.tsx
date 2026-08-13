/**
 * Global Optical Operations Center — Agentic SRE NOC.
 *
 * Single-page operational control plane demonstration. All data is synthetic
 * and lives in ./data/goocFixtures.ts so it can be replaced with live
 * telemetry later. Progressive disclosure happens through drawers and
 * expandable panels; this page never navigates away.
 */

import { useCallback, useMemo, useState } from "react";
import keynoteVideo from "@/assets/noc-executive-keynote.mp4.asset.json";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, Bot, CheckCircle2, ChevronDown, ChevronRight, CloudRain,
  Gauge, Pause, Play, RefreshCw, RotateCcw, ShieldCheck,
  Signal, Sparkles, TrendingDown, TrendingUp, Users, X, Zap,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import {
  agents, chennaiScenario, CUSTOMERS, kpis, links, outcomes, PRODUCTS,
  predictiveRisks, REGIONS, reliabilityMetrics, riskCategories, severityChip,
  situations, statusColors, statusLabels, TIME_RANGES, timelineEvents,
  transportMix, trafficSeries,
  type Agent, type LinkStatus, type OpticalLink, type Situation, type TimelineEventRow,
} from "./data/goocFixtures";
import { Field, Panel, Select } from "./components/NocPrimitives";


/* ------------------------------ primitives ----------------------------- */
// Panel, Select and Field now live in ./components/NocPrimitives so every
// Agentic SRE NOC page shares one implementation.


function StatusDot({ status }: { status: LinkStatus }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[status] }} aria-hidden />;
}

/* -------------------------------- page --------------------------------- */

export default function GlobalOpticalOperationsCenter() {
  // Filters
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [region, setRegion] = useState<string>("All regions");
  const [product, setProduct] = useState<string>("All products");
  const [customer, setCustomer] = useState<string>("All customers");
  const [statusFilter, setStatusFilter] = useState<string>("All statuses");
  const [refreshedAt, setRefreshedAt] = useState(() => "11:04:22 UTC");

  // Map state removed with the Global Optical Connectivity panel.


  // Drawers
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventRow | null>(null);
  const [expandedRisks, setExpandedRisks] = useState(false);

  // Scenario
  const [scenarioStep, setScenarioStep] = useState(-1);
  const [scenarioPlaying, setScenarioPlaying] = useState(false);
  const [approval, setApproval] = useState<"pending" | "approved" | "rejected">("pending");
  const [scenarioLog, setScenarioLog] = useState<TimelineEventRow[]>([]);

  const filtered = useMemo(
    () => links.filter((l) =>
      (region === "All regions" || l.region === region) &&
      (product === "All products" || l.product === product) &&
      (customer === "All customers" || l.customer === customer) &&
      (statusFilter === "All statuses" || statusLabels[l.status] === statusFilter)),
    [region, product, customer, statusFilter],
  );

  const filteredSituations = useMemo(
    () => situations.filter((s) =>
      (region === "All regions" || s.region === region) &&
      (product === "All products" || s.product === product) &&
      (customer === "All customers" || s.customer === customer)),
    [region, product, customer],
  );

  const filteredRisks = useMemo(
    () => predictiveRisks.filter((r) => region === "All regions" || r.region === region),
    [region],
  );

  const navigate = useNavigate();
  const link = links.find((l) => l.id === selectedLink) ?? null;
  const situation = situations.find((s) => s.id === selectedSituation) ?? null;
  const agent = agents.find((a) => a.id === selectedAgent) ?? null;

  const scenarioActive = scenarioStep >= 0;
  

  const advanceScenario = useCallback(() => {
    setScenarioStep((prev) => {
      const next = prev + 1;
      if (next >= chennaiScenario.length) { setScenarioPlaying(false); return prev; }
      const step = chennaiScenario[next];
      setScenarioLog((log) => [
        {
          id: `scn-${step.id}`,
          at: `11:1${next}:0${(next * 3) % 10}`,
          type: step.timelineType,
          actor: step.actor,
          service: "Chennai Mobile Backhaul 041",
          outcome: step.timelineOutcome,
          status: step.requiresApproval ? "Awaiting approval" : "Complete",
          detail: step.detail,
        },
        ...log,
      ]);
      if (step.requiresApproval) setScenarioPlaying(false);
      return next;
    });
  }, []);

  const resetScenario = () => {
    setScenarioStep(-1);
    setScenarioPlaying(false);
    setApproval("pending");
    setScenarioLog([]);
  };

  const scenarioBlocked =
    scenarioActive && chennaiScenario[scenarioStep]?.requiresApproval && approval === "pending";

  // Scenario-adjusted KPI overrides (deterministic, local only).
  const kpiOverrides: Record<string, { value?: string; sub?: string }> = {};
  if (scenarioStep >= 2) kpiOverrides.customers = { value: "7", sub: "2 with active impact, 5 at elevated risk" };
  if (scenarioStep >= 6 && approval === "approved") {
    kpiOverrides.fallback = { value: "15", sub: "9 planned, 6 weather-related" };
    kpiOverrides.share = { value: "96.6%", sub: "41.0 Tbps carried over optical paths" };
  }
  if (scenarioStep >= 8 && approval === "approved") {
    kpiOverrides.customers = { value: "6", sub: "1 with active impact, 5 at elevated risk" };
    kpiOverrides.agents = { value: "156", sub: "24 recoveries, 43 investigations, 89 preventive actions" };
  }
  if (approval === "rejected" && scenarioStep >= 6) {
    kpiOverrides.situations = { value: "9", sub: "3 critical, 3 high, 3 moderate" };
  }

  const outcomeOverrides: Record<string, string> = {};
  if (scenarioStep >= 8 && approval === "approved") {
    outcomeOverrides.protected = "19";
    outcomeOverrides.minutes = "1,462";
    outcomeOverrides.capacity = "96 Gbps";
  }

  const timeline = [...scenarioLog, ...timelineEvents];

  const resetPage = () => {
    setTimeRange("24h"); setRegion("All regions"); setProduct("All products");
    setCustomer("All customers"); setStatusFilter("All statuses");
    setSelectedLink(null); setSelectedSituation(null); setSelectedAgent(null);
    setSelectedEvent(null);

    resetScenario();
  };

  return (
    <div className="px-6 py-6 space-y-5 max-w-[1600px]">
      {/* 1 — Header */}
      <header className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Overview</div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Global Optical Operations Center</h1>
            <p className="mt-1 max-w-3xl text-[13px] text-slate-600">
              Global service assurance, predictive risk, and agentic operations across the optical connectivity estate
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
                Synthetic Taara-aligned demonstration environment
              </span>
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                Global operating status: Stable with active situations
              </span>
              <span className="text-slate-500">Last telemetry update {refreshedAt}</span>
              <span className="text-slate-500">Data confidence 94%</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select label="Time range" value={timeRange} options={TIME_RANGES} onChange={setTimeRange} />
            <Select label="Region" value={region} options={["All regions", ...REGIONS]} onChange={setRegion} />
            <Select label="Product" value={product} options={["All products", ...PRODUCTS]} onChange={setProduct} />
            <Select label="Customer" value={customer} options={["All customers", ...CUSTOMERS]} onChange={setCustomer} />
            <button
              type="button"
              onClick={() => setRefreshedAt(new Date().toISOString().slice(11, 19) + " UTC")}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button
              type="button"
              onClick={resetPage}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset page
            </button>
          </div>
        </div>

        <aside className="w-full shrink-0 xl:w-[380px]">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm">
            <video
              src={keynoteVideo.url}
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            SRE-based agentic NOC executive keynote
          </p>
        </aside>
        </div>
      </header>


      {/* 2 — KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {kpis.map((k) => {
          const o = kpiOverrides[k.id] ?? {};
          const TrendIcon = k.trend === "down" ? TrendingDown : TrendingUp;
          const tone = k.status === "good" ? "text-emerald-600" : k.status === "watch" ? "text-amber-600" : "text-rose-600";
          const active =
            (k.filter?.kind === "status" && statusFilter === statusLabels[k.filter.value as LinkStatus]);
          return (
            <button
              key={k.id}
              type="button"
              title={k.explain}
              onClick={() => {
                if (k.filter?.kind === "status" && k.filter.value) {
                  const label = statusLabels[k.filter.value as LinkStatus];
                  setStatusFilter((s) => (s === label ? "All statuses" : label));
                } else {
                  setStatusFilter("All statuses");
                }
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
              <div className="mt-1 text-xl font-bold text-slate-900">{o.value ?? k.value}</div>
              <div className="text-[10.5px] text-slate-500">{o.sub ?? k.sub}</div>
              <div className="mt-1.5 h-7">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={k.spark.map((y, i) => ({ i, y }))}>
                    <Line type="monotone" dataKey="y" stroke={k.status === "good" ? "#059669" : k.status === "watch" ? "#d97706" : "#e11d48"} strokeWidth={1.4} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-slate-500">{k.delta}</div>
            </button>
          );
        })}
      </div>

      {/* 3 — Global optical connectivity map */}
      <Panel
        title="Global Optical Connectivity"
        subtitle={`${filtered.length} optical links in scope. Locations and conditions are synthetic.`}
        className={cn(mapFullScreen && "fixed inset-3 z-50 overflow-auto")}
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={() => setMapView("geographic")} active={mapView === "geographic"}>Geographic view</ToolbarButton>
            <ToolbarButton onClick={() => setMapView("topology")} active={mapView === "topology"}>Topology view</ToolbarButton>
            <ToolbarButton onClick={() => setOverlays((o) => ({ ...o, weather: !o.weather }))} active={overlays.weather}>Weather overlay</ToolbarButton>
            <ToolbarButton onClick={() => setOverlays((o) => ({ ...o, fallback: !o.fallback }))} active={overlays.fallback}>Fallback readiness</ToolbarButton>
            <ToolbarButton onClick={() => setOverlays((o) => ({ ...o, impact: !o.impact }))} active={overlays.impact}>Customer impact</ToolbarButton>
            <ToolbarButton onClick={() => setOverlays((o) => ({ ...o, predicted: !o.predicted }))} active={overlays.predicted}>Predicted risk</ToolbarButton>
            <ToolbarButton onClick={() => setZoom((z) => Math.min(6, Number((z + 0.4).toFixed(2))))}>Zoom in</ToolbarButton>
            <ToolbarButton onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.4).toFixed(2))))}>Zoom out</ToolbarButton>
            <ToolbarButton onClick={() => setMapFullScreen((v) => !v)}>{mapFullScreen ? "Exit full screen" : "Full screen"}</ToolbarButton>
            <ToolbarButton onClick={() => { setZoom(1); setMapView("geographic"); }}>Reset</ToolbarButton>
          </div>
        }
      >
        <GoocMap
          links={filtered}
          selectedId={selectedLink}
          highlightId={scenarioActive ? "lnk-chennai-041" : null}
          view={mapView}
          overlays={overlays}
          zoom={zoom}
          onZoomChange={setZoom}
          onSelect={(id) => setSelectedLink(id)}
        />
        <p className="mt-2 text-[10.5px] text-slate-500">
          Select a link to open its operational detail. Scroll to zoom, drag to pan.
        </p>
      </Panel>


      {/* 3 — Active situations */}
      <Panel
        title="Active Situations"
        subtitle={`${filteredSituations.length} correlated operational conditions`}
        action={<Select label="Link status" value={statusFilter} options={["All statuses", ...Object.values(statusLabels)]} onChange={setStatusFilter} />}
      >
          <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSituations.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => { setSelectedSituation(s.id); setSelectedLink(s.linkId); }}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors hover:border-indigo-300 hover:bg-slate-50",
                    selectedSituation === s.id ? "border-indigo-500 bg-indigo-50/40" : "border-slate-200",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase", severityChip[s.severity])}>{s.severity}</span>
                    <span className="text-[10px] text-slate-500">{s.detectedAt}</span>
                  </div>
                  <div className="mt-1.5 text-[12.5px] font-semibold leading-snug text-slate-900">{s.title}</div>
                  <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-slate-600">
                    <span>{s.region}</span>
                    <span className="truncate">{s.customer}</span>
                    <span className="col-span-2 text-slate-500">Likely cause: {s.likelyCause}</span>
                    <span className="col-span-2">Impact: {s.customerImpact}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-indigo-700"><Bot className="h-3.5 w-3.5" />{s.agent}</span>
                    <span className="text-slate-600">{s.confidence}% confidence</span>
                  </div>
                  <div className="mt-1 text-[10.5px] text-slate-500">Current action: {s.currentAction}</div>
                </button>
              </li>
            ))}
            {filteredSituations.length === 0 && <li className="text-[12px] text-slate-500">No situations match the current filters.</li>}
          </ul>
        </Panel>


      {/* 5 — Predictive risk */}
      <Panel
        title="Predictive Risk Horizon"
        subtitle="Forecast operational risk across the next hour, 6, 12 and 24 hours"
        action={
          <button type="button" onClick={() => setExpandedRisks((e) => !e)} className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50">
            {expandedRisks ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {expandedRisks ? "Collapse detail" : "Expand detail"}
          </button>
        }
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <CloudRain className="h-4 w-4 text-amber-600" aria-hidden />
            <span className="text-[13px] font-semibold text-slate-900">Dense fog approaching Chennai optical route within six hours</span>
            <span className="rounded border border-amber-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">92% probability</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            <Field label="Links exposed" value="3" />
            <Field label="Customer services" value="One 10 Gbps service" />
            <Field label="RF fallback" value="Available" />
            <Field label="Recommendation" value="Preventive traffic transition" />
            <Field label="Automation" value="Human approval required" />
            <Field label="Time to impact" value="5 h 40 m" />
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[11.5px]">
            <caption className="sr-only">Predictive risk heatmap by category and horizon</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-600">
              <tr>
                <th scope="col" className="px-2 py-1.5">Risk category</th>
                <th scope="col" className="px-2 py-1.5">Next hour</th>
                <th scope="col" className="px-2 py-1.5">Next 6 hours</th>
                <th scope="col" className="px-2 py-1.5">Next 12 hours</th>
                <th scope="col" className="px-2 py-1.5">Next 24 hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {riskCategories.map((cat) => (
                <tr key={cat}>
                  <th scope="row" className="px-2 py-1.5 font-medium text-slate-800">{cat}</th>
                  {(["1h", "6h", "12h", "24h"] as const).map((h) => {
                    const r = filteredRisks.find((x) => x.category === cat && x.horizon === h);
                    if (!r) return <td key={h} className="px-2 py-1.5 text-slate-300">—</td>;
                    const tone = r.probability >= 75 ? "bg-rose-100 text-rose-800" : r.probability >= 50 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-800";
                    return (
                      <td key={h} className="px-2 py-1.5">
                        <div className={cn("rounded px-2 py-1", tone)} title={`${r.region} · ${r.linksExposed} links · ${r.recommendation}`}>
                          <div className="font-semibold">{r.probability}%</div>
                          <div className="text-[10px]">{r.region} · {r.linksExposed} links · {r.timeToImpact}</div>
                          {expandedRisks && (
                            <div className="mt-0.5 text-[10px] font-normal">
                              <div>Confidence {r.confidence}%</div>
                              <div>{r.servicesExposed}</div>
                              <div>{r.recommendation}</div>
                              <div>Automation: {r.automation}</div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 6 — Agents */}
      <Panel title="Digital Coworkers in Operation" subtitle="Agent activity, scope and guardrail state">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {agents.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() =>
                a.name === "Global Link Health Agent"
                  ? navigate("/agentic-sre-noc/global-link-health-twin")
                  : setSelectedAgent(a.id)
              }
              className={cn(
                "rounded-lg border p-3 text-left shadow-sm transition-colors hover:border-indigo-300 hover:bg-slate-50",
                a.name === "Global Link Health Agent"
                  ? "border-amber-300 bg-amber-50"
                  : "border-slate-200 bg-white",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-900">
                  <Bot className="h-4 w-4 text-indigo-600" aria-hidden />{a.name}
                </span>
                <span className={cn(
                  "rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                  a.status === "Awaiting approval" ? "border-amber-200 bg-amber-50 text-amber-700"
                    : a.status === "Investigating" ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
                )}>{a.status}</span>
              </div>
              <p className="mt-1.5 text-[11.5px] text-slate-600">{a.task}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-slate-600">
                <div><dt className="inline text-slate-500">Scope: </dt><dd className="inline">{a.scope}</dd></div>
                <div><dt className="inline text-slate-500">Confidence: </dt><dd className="inline">{a.confidence}%</dd></div>
                <div><dt className="inline text-slate-500">Actions today: </dt><dd className="inline">{a.actionsToday}</dd></div>
                <div><dt className="inline text-slate-500">Awaiting approval: </dt><dd className="inline">{a.awaitingApproval}</dd></div>
              </dl>
              <div className="mt-1.5 text-[10.5px] text-slate-500">Last outcome: {a.lastOutcome}</div>
              <div className={cn("mt-1 inline-flex items-center gap-1 text-[10.5px]", a.guardrail === "Within guardrails" ? "text-emerald-700" : "text-amber-700")}>
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />{a.guardrail}
              </div>
            </button>
          ))}
        </div>
      </Panel>

      {/* 7 — Traffic resilience */}
      <Panel title="Traffic Resilience" subtitle={`Optical, fallback and backup transport over the past ${timeRange}`}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-1.5 text-[12px] font-semibold text-slate-800">Optical Versus Fallback Traffic</h3>
            <div className="h-[260px] rounded-lg border border-slate-200 bg-white p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficSeries} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={36} unit=" Tb" />
                  <RTooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Area type="monotone" dataKey="optical" name="Optical" stackId="1" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.28} isAnimationActive={false} />
                  <Area type="monotone" dataKey="altOptical" name="Alternate optical route" stackId="1" stroke="#0284c7" fill="#0284c7" fillOpacity={0.26} isAnimationActive={false} />
                  <Area type="monotone" dataKey="rf" name="RF fallback" stackId="1" stroke="#d97706" fill="#d97706" fillOpacity={0.3} isAnimationActive={false} />
                  <Area type="monotone" dataKey="fiber" name="Fiber backup" stackId="1" stroke="#64748b" fill="#64748b" fillOpacity={0.24} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="mb-1.5 text-[12px] font-semibold text-slate-800">Traffic by Product</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={transportMix} dataKey="share" nameKey="name" innerRadius={44} outerRadius={72} paddingAngle={2} isAnimationActive={false}>
                      {transportMix.map((t) => <Cell key={t.name} fill={t.color} />)}
                    </Pie>
                    <RTooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <caption className="sr-only">Traffic by transport product</caption>
                  <thead className="text-[10px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="py-1">Transport</th>
                      <th scope="col" className="py-1">Throughput</th>
                      <th scope="col" className="py-1">Share</th>
                      <th scope="col" className="py-1">Services</th>
                      <th scope="col" className="py-1">Headroom</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transportMix.map((t) => (
                      <tr key={t.name} className="hover:bg-slate-50">
                        <th scope="row" className="py-1 font-medium text-slate-800">
                          <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: t.color }} aria-hidden />
                          {t.name}
                        </th>
                        <td className="py-1 text-slate-700">{t.throughput}</td>
                        <td className="py-1 text-slate-700">{t.share}%</td>
                        <td className="py-1 text-slate-700">{t.services}</td>
                        <td className="py-1 text-slate-700">{t.headroom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* 8 — Outcomes */}
      <Panel title="Customer and Reliability Outcomes" subtitle="Value delivered by agentic operations in the current period">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {outcomes.map((o) => (
            <div key={o.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <div className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">{o.label}</div>
              <div className="mt-1 text-xl font-bold text-slate-900">{outcomeOverrides[o.id] ?? o.value}</div>
              <div className="text-[10.5px] text-slate-500">{o.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[11.5px]">
            <caption className="sr-only">SRE reliability metrics against target</caption>
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-600">
              <tr>
                <th scope="col" className="px-2 py-1.5">Measure</th>
                <th scope="col" className="px-2 py-1.5">Current</th>
                <th scope="col" className="px-2 py-1.5">Target</th>
                <th scope="col" className="px-2 py-1.5">Attainment</th>
                <th scope="col" className="px-2 py-1.5">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reliabilityMetrics.map((m) => (
                <tr key={m.label} className="hover:bg-slate-50">
                  <th scope="row" className="px-2 py-1.5 font-medium text-slate-800">{m.label}</th>
                  <td className="px-2 py-1.5 text-slate-700">{m.value}</td>
                  <td className="px-2 py-1.5 text-slate-500">{m.target}</td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-28 rounded-full bg-slate-100">
                        <div
                          className={cn("h-1.5 rounded-full", m.attainment >= 90 ? "bg-emerald-500" : m.attainment >= 80 ? "bg-amber-500" : "bg-rose-500")}
                          style={{ width: `${m.attainment}%` }}
                        />
                      </div>
                      <span className="text-slate-600">{m.attainment}%</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    {m.trend === "down"
                      ? <TrendingDown className="h-3.5 w-3.5 text-rose-600" aria-label="Declining" />
                      : m.trend === "up"
                        ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" aria-label="Improving" />
                        : <Activity className="h-3.5 w-3.5 text-slate-500" aria-label="Stable" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 10 — Scenario + 9 Timeline */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Panel
          title="Run Chennai Weather Risk Scenario"
          subtitle="Deterministic, page-local demonstration of the agentic operating loop"
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { if (!scenarioActive) { setScenarioLog([]); } setScenarioPlaying(true); advanceScenario(); }}
              disabled={scenarioBlocked || scenarioStep >= chennaiScenario.length - 1}
              className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-slate-800 disabled:opacity-40"
            >
              <Play className="h-3.5 w-3.5" />{scenarioActive ? "Continue" : "Start"}
            </button>
            <button type="button" onClick={() => setScenarioPlaying(false)} disabled={!scenarioPlaying} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50 disabled:opacity-40">
              <Pause className="h-3.5 w-3.5" /> Pause
            </button>
            <button type="button" onClick={resetScenario} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={() => { setApproval("approved"); advanceScenario(); }}
              disabled={!scenarioBlocked}
              className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve recommended action
            </button>
            <button
              type="button"
              onClick={() => setApproval("rejected")}
              disabled={!scenarioBlocked}
              className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-40"
            >
              <X className="h-3.5 w-3.5" /> Reject recommended action
            </button>
          </div>

          <div aria-live="polite" className="mt-3 space-y-1.5">
            {chennaiScenario.map((s, i) => {
              const done = i < scenarioStep || (i === scenarioStep && !scenarioBlocked);
              const current = i === scenarioStep;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-[11.5px]",
                    current ? "border-indigo-300 bg-indigo-50/50" : done ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/50 text-slate-400",
                  )}
                >
                  <span className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white", done ? "bg-emerald-600" : current ? "bg-indigo-600" : "bg-slate-300")}>{i + 1}</span>
                  <span className="min-w-0">
                    <span className={cn("font-semibold", current || done ? "text-slate-900" : "text-slate-400")}>{s.label}</span>
                    {(current || done) && <span className="block text-slate-600">{s.detail}</span>}
                    {(current || done) && <span className="block text-[10.5px] text-slate-500">{s.actor}</span>}
                  </span>
                </div>
              );
            })}
          </div>

          {approval === "approved" && scenarioStep >= 6 && (
            <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11.5px] text-emerald-800">
              Approved — preventive traffic transition executed in simulation. Customer impact avoided.
            </p>
          )}
          {approval === "rejected" && (
            <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11.5px] text-rose-800">
              Rejected — the recommendation was declined. The link remains on its optical path and the situation escalates for monitoring.
            </p>
          )}
        </Panel>

        <Panel title="Live Agentic Operations" subtitle="Most recent synthetic operational events">
          <ol className="space-y-1.5">
            {timeline.slice(0, 14).map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(e)}
                  className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-left text-[11.5px] transition-colors hover:border-indigo-300 hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-[10.5px] text-slate-500">{e.at}</span>
                    <span className="font-semibold text-slate-900">{e.type}</span>
                    <span className={cn(
                      "ml-auto rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                      e.status === "Awaiting approval" ? "border-amber-200 bg-amber-50 text-amber-700"
                        : e.status === "In progress" ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700",
                    )}>{e.status}</span>
                  </div>
                  <div className="text-slate-600">{e.actor} · {e.service}</div>
                  <div className="text-[10.5px] text-slate-500">{e.outcome}</div>
                </button>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {/* ------------------------------ Drawers ---------------------------- */}

      <Sheet open={!!link && !selectedSituation} onOpenChange={(o) => !o && setSelectedLink(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {link && <LinkDrawer link={link} />}
        </SheetContent>
      </Sheet>

      <Sheet open={!!situation} onOpenChange={(o) => { if (!o) { setSelectedSituation(null); setSelectedLink(null); } }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {situation && <SituationDrawer situation={situation} />}
        </SheetContent>
      </Sheet>

      <Sheet open={!!agent} onOpenChange={(o) => !o && setSelectedAgent(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {agent && <AgentDrawer agent={agent} />}
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedEvent && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">{selectedEvent.type}</h2>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Timestamp" value={selectedEvent.at} />
                <Field label="Status" value={selectedEvent.status} />
                <Field label="Actor" value={selectedEvent.actor} />
                <Field label="Affected service" value={selectedEvent.service} />
              </div>
              <Field label="Outcome" value={selectedEvent.outcome} />
              <p className="text-[12px] text-slate-700">{selectedEvent.detail}</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ------------------------------- drawers -------------------------------- */

function LinkDrawer({ link }: { link: OpticalLink }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2">
          <StatusDot status={link.status} />
          <h2 className="text-base font-semibold text-slate-900">{link.name}</h2>
        </div>
        <p className="text-[11.5px] text-slate-500">{statusLabels[link.status]} · synthetic demonstration link</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Region" value={link.region} />
        <Field label="Product family" value={link.product} />
        <Field label="Customer service" value={`${link.customer} — ${link.service}`} />
        <Field label="Link distance" value={`${link.distanceKm} km`} />
        <Field label="Terminal A" value={link.terminalA} />
        <Field label="Terminal B" value={link.terminalB} />
        <Field label="Committed capacity" value={`${link.committedGbps} Gbps`} />
        <Field label="Current throughput" value={`${link.throughputGbps} Gbps`} />
        <Field label="Link availability" value={link.availability} />
        <Field label="Beam lock state" value={link.beamLock} />
        <Field label="Link margin" value={link.marginDb} />
        <Field label="Received optical power" value={link.rxPowerDbm} />
        <Field label="Optical attenuation" value={link.attenuationDb} />
        <Field label="Current visibility" value={link.visibilityKm} />
        <Field label="Weather risk" value={link.weatherRisk} />
        <Field label="RF fallback state" value={link.rfFallback} />
        <Field label="Current SLO status" value={link.sloStatus} />
        <Field label="Assigned digital coworker" value={link.agent} />
      </div>
      <div className="rounded-md border border-indigo-200 bg-indigo-50/60 px-3 py-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" /> Recommended next action
        </div>
        <p className="mt-0.5 text-[12px] text-slate-800">{link.nextAction}</p>
      </div>
    </div>
  );
}

function SituationDrawer({ situation }: { situation: Situation }) {
  return (
    <div className="space-y-3">
      <div>
        <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase", severityChip[situation.severity])}>{situation.severity}</span>
        <h2 className="mt-1.5 text-base font-semibold text-slate-900">{situation.title}</h2>
        <p className="text-[12px] text-slate-600">{situation.summary}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Customer impact" value={situation.customerImpact} />
        <Field label="Affected optical link" value={situation.linkId.replace("lnk-", "")} />
        <Field label="Assigned agent" value={situation.agent} />
        <Field label="Confidence" value={`${situation.confidence}%`} />
      </div>
      <div>
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Current telemetry</h3>
        <div className="grid grid-cols-2 gap-2">
          {situation.telemetry.map((t) => <Field key={t.label} label={t.label} value={t.value} />)}
        </div>
      </div>
      <div>
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Weather context</h3>
        <p className="text-[12px] text-slate-700">{situation.weatherContext}</p>
      </div>
      <div>
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ranked cause hypotheses</h3>
        <ul className="space-y-1">
          {situation.hypotheses.map((h) => (
            <li key={h.cause} className="rounded-md border border-slate-200 px-2.5 py-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-slate-900">{h.cause}</span>
                <span className="text-slate-600">{h.likelihood}%</span>
              </div>
              <div className="text-[11px] text-slate-500">{h.basis}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-md border border-indigo-200 bg-indigo-50/60 px-3 py-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" /> Agent recommendation
        </div>
        <p className="mt-0.5 text-[12px] text-slate-800">{situation.recommendation}</p>
      </div>
      <div>
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Evidence summary</h3>
        <ul className="list-disc space-y-0.5 pl-4 text-[12px] text-slate-700">
          {situation.evidence.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </div>
      <Field label="Suggested action" value={situation.suggestedAction} />
      <div className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11.5px] text-amber-800">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />{situation.approval}
      </div>
    </div>
  );
}

function AgentDrawer({ agent }: { agent: Agent }) {
  const section = (title: string, items: string[], icon: React.ReactNode) => (
    <div>
      <h3 className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{icon}{title}</h3>
      {items.length ? (
        <ul className="list-disc space-y-0.5 pl-4 text-[12px] text-slate-700">{items.map((i) => <li key={i}>{i}</li>)}</ul>
      ) : (
        <p className="text-[12px] text-slate-500">None</p>
      )}
    </div>
  );
  return (
    <div className="space-y-3">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Bot className="h-4 w-4 text-indigo-600" aria-hidden />{agent.name}
        </h2>
        <p className="text-[12px] text-slate-600">{agent.objective}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Status" value={agent.status} />
        <Field label="Confidence" value={`${agent.confidence}%`} />
        <Field label="Scope" value={agent.scope} />
        <Field label="Guardrail state" value={agent.guardrail} />
      </div>
      {section("Current work queue", agent.queue, <Gauge className="h-3.5 w-3.5" />)}
      {section("Recent decisions", agent.decisions, <Zap className="h-3.5 w-3.5" />)}
      {section("Evidence reviewed", agent.evidence, <Signal className="h-3.5 w-3.5" />)}
      {section("Recommendations", agent.recommendations, <Sparkles className="h-3.5 w-3.5" />)}
      {section("Actions completed", agent.completed, <CheckCircle2 className="h-3.5 w-3.5" />)}
      {section("Actions awaiting human approval", agent.pending, <Users className="h-3.5 w-3.5" />)}
      {section("Operating guardrails", agent.guardrails, <ShieldCheck className="h-3.5 w-3.5" />)}
    </div>
  );
}
