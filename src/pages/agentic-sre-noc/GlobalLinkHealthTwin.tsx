/**
 * Global Link Health Twin — Agentic SRE NOC.
 *
 * Single-page operational workspace for the Global Link Health Digital Twin.
 * All data is synthetic (see ./data/glhtFixtures.ts) and represents the
 * fictional Terra Communications demonstration environment. Every interaction
 * is local and deterministic; the page never navigates away.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Activity, AlertTriangle, Bot, Check, ChevronRight, CloudRain, Download, Expand,
  Gauge, Maximize2, MessageSquare, Pause, Play, RefreshCw, RotateCcw, Search,
  ShieldCheck, SkipForward, Sparkles, TrendingDown, TrendingUp, Users, X,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Panel, Select, Field, ToolbarButton } from "./components/NocPrimitives";
import { TwinMap, type TwinOverlays } from "./components/TwinMap";
import {
  activityEvents, chennaiScenario, coworkers, GLHT_LINK_TYPES, GLHT_PRODUCTS,
  GLHT_REGIONS, GLHT_SAVED_VIEWS, GLHT_TIME_RANGES, glhtKpis, incidentSummary,
  loopStages, monthlyMetrics, outcomeRows, recommendations, regionCallouts,
  trendSeries, twinAssessment, twinLinks, twinPrompts, twinRisks, twinStateColors,
  type ActivityEvent, type Coworker, type OutcomeRow, type TwinLink,
} from "./data/glhtFixtures";

const kpiTone: Record<string, string> = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  watch: "border-amber-200 bg-amber-50 text-amber-700",
  risk: "border-rose-200 bg-rose-50 text-rose-700",
};

const riskTone: Record<string, string> = {
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-700 border-slate-200",
};

function Sparkline({ points, tone }: { points: number[]; tone: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${24 - ((p - min) / span) * 20}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 24" className="h-6 w-full" aria-hidden preserveAspectRatio="none">
      <polyline points={d} fill="none" stroke={tone} strokeWidth={1.6} />
    </svg>
  );
}

function StatePill({ state }: { state: string }) {
  const color = twinStateColors[state as keyof typeof twinStateColors] ?? "#64748b";
  return (
    <span
      className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10.5px] font-semibold"
      style={{ borderColor: `${color}40`, backgroundColor: `${color}14`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {state}
    </span>
  );
}

export default function GlobalLinkHealthTwin() {
  /* ------------------------------ filters ------------------------------ */
  const [region, setRegion] = useState<string>("All regions");
  const [product, setProduct] = useState<string>("All products");
  const [linkType, setLinkType] = useState<string>("All link types");
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [savedView, setSavedView] = useState<string>("Default operations view");
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState("09:42:16 UTC");
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* -------------------------------- map -------------------------------- */
  const [zoom, setZoom] = useState(1);
  const [mapView, setMapView] = useState<"geographic" | "topology" | "cluster">("geographic");
  const [fullScreenMap, setFullScreenMap] = useState(false);
  const [overlays, setOverlays] = useState<TwinOverlays>({
    weather: true, capacity: false, impact: true, maintenance: false, agents: false,
  });
  const [playback, setPlayback] = useState(0);

  /* ------------------------------ drawers ------------------------------ */
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [incidentDrawer, setIncidentDrawer] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeRow | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityEvent | null>(null);

  /* --------------------------- interactions ---------------------------- */
  const [riskSearch, setRiskSearch] = useState("");
  const [riskSort, setRiskSort] = useState<"confidence" | "capacity" | "risk">("risk");
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [simulated, setSimulated] = useState<string | null>(null);
  const [watches, setWatches] = useState<string[]>([]);
  const [owners, setOwners] = useState<Record<string, string>>({});
  const [promptId, setPromptId] = useState<string | null>(null);
  const [comparison, setComparison] = useState(false);
  const [fallbackFailure, setFallbackFailure] = useState(false);

  /* ------------------------------ scenario ----------------------------- */
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [approval, setApproval] = useState<"pending" | "approved" | "rejected" | "evidence">("pending");
  const [extraActivity, setExtraActivity] = useState<ActivityEvent[]>([]);
  const [extraOutcomes, setExtraOutcomes] = useState<OutcomeRow[]>([]);
  const timer = useRef<number | null>(null);

  const stage = step >= 0 ? chennaiScenario[Math.min(step, chennaiScenario.length - 1)] : null;

  const advance = useCallback(() => {
    setStep((prev) => {
      const next = Math.min(prev + 1, chennaiScenario.length - 1);
      const s = chennaiScenario[next];
      if (s?.activity) setExtraActivity((a) => (a.some((x) => x.id === s.activity!.id) ? a : [s.activity!, ...a]));
      if (s?.outcome) setExtraOutcomes((o) => (o.some((x) => x.id === s.outcome!.id) ? o : [s.outcome!, ...o]));
      if (next === chennaiScenario.length - 1) setPlaying(false);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (stage?.awaitingApproval && approval === "pending") return;
    timer.current = window.setTimeout(advance, 2200);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [playing, step, advance, stage, approval]);

  const resetScenario = () => {
    setPlaying(false); setStep(-1); setApproval("pending");
    setExtraActivity([]); setExtraOutcomes([]); setFallbackFailure(false); setComparison(false);
  };

  /* ------------------------------ derived ------------------------------ */
  const filteredLinks = useMemo(() => twinLinks.filter((l) =>
    (region === "All regions" || l.region === region) &&
    (product === "All products" || l.product === product) &&
    (linkType === "All link types" || l.linkType === linkType) &&
    (!stateFilter || l.state === stateFilter)
  ), [region, product, linkType, stateFilter]);

  const scenarioLinks = useMemo(() => {
    if (!stage) return filteredLinks;
    return filteredLinks.map((l) => (l.region === "Chennai" ? { ...l, state: stage.chennaiState } : l));
  }, [filteredLinks, stage]);

  const callouts = useMemo(() => regionCallouts.map((c) =>
    (stage && c.region === "Chennai" ? { ...c, state: stage.chennaiState } : c)), [stage]);

  const kpiCards = useMemo(() => glhtKpis.map((k) => {
    if (!stage) return k;
    if (k.id === "atrisk") return { ...k, value: String(stage.atRisk), sub: "Within the next six hours" };
    if (k.id === "incidents") return { ...k, value: String(stage.incidents), sub: stage.incidents > 2 ? "Two high impact" : "One high impact" };
    return k;
  }), [stage]);

  const activeRisks = useMemo(() => {
    let rows = twinRisks.filter((r) =>
      (region === "All regions" || r.region === region) &&
      (!riskSearch || `${r.linkId} ${r.route} ${r.region} ${r.customerImpact}`.toLowerCase().includes(riskSearch.toLowerCase())));
    if (promptId) {
      const p = twinPrompts.find((x) => x.id === promptId);
      if (p?.focusRegion) rows = rows.filter((r) => r.region === p.focusRegion);
    }
    const order = { High: 0, Moderate: 1, Low: 2 } as const;
    return [...rows].sort((a, b) =>
      riskSort === "risk" ? order[a.risk] - order[b.risk]
        : riskSort === "confidence" ? b.confidence - a.confidence
          : parseFloat(b.capacityExposed) - parseFloat(a.capacityExposed));
  }, [region, riskSearch, riskSort, promptId]);

  const visibleActivity = useMemo(() => {
    const all = [...extraActivity, ...activityEvents];
    return all.filter((e) =>
      (region === "All regions" || e.region === region) &&
      (!stageFilter || e.stage === stageFilter));
  }, [extraActivity, region, stageFilter]);

  const visibleCoworkers = useMemo(() => coworkers.filter((c) =>
    !stageFilter || loopStages.find((s) => s.stage === stageFilter)?.agent === c.name || stageFilter === null), [stageFilter]);

  const visibleOutcomes = useMemo(() => [...extraOutcomes, ...outcomeRows], [extraOutcomes]);

  const liveMetrics = useMemo(() => monthlyMetrics.map((m) => {
    if (!stage || stage.index < 12) return m;
    if (m.label === "Outage Minutes Avoided") return { ...m, value: "1,296" };
    if (m.label === "Preventive Actions Completed") return { ...m, value: "84" };
    return m;
  }), [stage]);

  const activePrompt = twinPrompts.find((p) => p.id === promptId) ?? null;
  const linkDetail = twinLinks.find((l) => l.id === selectedLink) ?? null;
  const agentDetail = coworkers.find((c) => c.id === selectedAgent) ?? null;

  const resetPage = () => {
    setRegion("All regions"); setProduct("All products"); setLinkType("All link types");
    setTimeRange("24h"); setStateFilter(null); setSeverityFilter(null); setStageFilter(null);
    setPromptId(null); setSelectedRisk(null); setSimulated(null); setZoom(1); setMapView("geographic");
    resetScenario();
  };

  const totalIncidents = incidentSummary.reduce((s, i) => s + i.count, 0);

  const mapBlock = (
    <>
      <GlobalLinkHealthMap
        title="Global link health map"
        isFullScreen={fullScreenMap}
        onToggleFullScreen={() => setFullScreenMap((f) => !f)}
      />


      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-slate-600">
        {Object.entries(twinStateColors).map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />{label}
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <label className="text-[11px] text-slate-500" htmlFor="glht-playback">Time playback</label>
        <input
          id="glht-playback" type="range" min={0} max={6} value={playback}
          onChange={(e) => setPlayback(Number(e.target.value))}
          className="h-1 w-48 accent-blue-600"
        />
        <span className="text-[11px] text-slate-600">{trendSeries[playback]?.day}</span>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6">
        {/* ------------------------- 1. Page header ------------------------ */}
        <header>
          <nav aria-label="Breadcrumb" className="text-[11px] text-slate-500">
            <ol className="flex items-center gap-1">
              <li>SRE</li><li aria-hidden>/</li>
              <li><RouterLink to="/agentic-sre-noc" className="hover:text-slate-800 hover:underline">Agentic SRE NOC</RouterLink></li>
              <li aria-hidden>/</li>
              <li className="font-medium text-slate-700">Global Link Health Twin</li>
            </ol>
          </nav>

          <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">Global Link Health Twin</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  <Sparkles className="h-3 w-3" aria-hidden />Operational Digital Twin
                </span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-slate-600">Protecting optical transport availability worldwide</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Synthetic Terra Communications demonstration environment · Business owner: VP Network Operations
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-600 sm:grid-cols-4">
              <div><dt className="text-slate-500">Current time</dt><dd className="font-medium text-slate-900">09:42 UTC</dd></div>
              <div><dt className="text-slate-500">Last telemetry</dt><dd className="font-medium text-slate-900">{refreshedAt}</dd></div>
              <div><dt className="text-slate-500">Data confidence</dt><dd className="font-medium text-slate-900">{stage?.confidence ?? twinAssessment.confidence}%</dd></div>
              <div><dt className="text-slate-500">Global status</dt><dd className="font-medium text-emerald-700">Operating normally</dd></div>
            </dl>
          </div>

          {/* Controls */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2 md:hidden">
              <span className="text-[11.5px] font-medium text-slate-700">Filters and actions</span>
              <button type="button" onClick={() => setFiltersOpen((o) => !o)}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11.5px] text-slate-700">
                {filtersOpen ? "Hide" : "Show"}
              </button>
            </div>
            <div className={cn("flex flex-wrap items-center gap-2", !filtersOpen && "hidden md:flex")}>
              <Select label="Region" value={region} options={GLHT_REGIONS} onChange={setRegion} />
              <Select label="Product" value={product} options={GLHT_PRODUCTS} onChange={setProduct} />
              <Select label="Link type" value={linkType} options={GLHT_LINK_TYPES} onChange={setLinkType} />
              <Select label="Time range" value={timeRange} options={GLHT_TIME_RANGES} onChange={setTimeRange} />
              <Select label="Saved view" value={savedView} options={GLHT_SAVED_VIEWS} onChange={setSavedView} />
              <ToolbarButton onClick={() => setRefreshedAt(new Date().toISOString().slice(11, 19) + " UTC")}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />Refresh
              </ToolbarButton>
              <ToolbarButton onClick={() => setFullScreenMap(true)}><Expand className="h-3.5 w-3.5" aria-hidden />Full screen</ToolbarButton>
              <ToolbarButton onClick={() => setSimulated("Export prepared for the current view (synthetic data)")}>
                <Download className="h-3.5 w-3.5" aria-hidden />Export
              </ToolbarButton>
              <ToolbarButton onClick={resetPage}><RotateCcw className="h-3.5 w-3.5" aria-hidden />Reset page</ToolbarButton>
              {(stateFilter || severityFilter || stageFilter || promptId) && (
                <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] text-blue-700">
                  Active focus: {[stateFilter, severityFilter, stageFilter, activePrompt?.prompt].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ---------------------- 2. Global KPI scorecard ------------------ */}
        <section aria-label="Global KPI scorecard" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpiCards.map((k) => (
            <button
              key={k.id}
              type="button"
              title={k.explain}
              onClick={() => setStateFilter(k.filter.kind === "state" ? (stateFilter === k.filter.value ? null : k.filter.value!) : null)}
              className={cn(
                "rounded-xl border bg-white p-3 text-left shadow-sm transition-colors hover:border-blue-300",
                stateFilter && k.filter.value === stateFilter ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-200",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{k.title}</span>
                <span className={cn("rounded border px-1.5 py-0.5 text-[9.5px] font-semibold", kpiTone[k.status])}>
                  {k.status === "good" ? "On track" : k.status === "watch" ? "Watch" : "Attention"}
                </span>
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{k.value}</div>
              <div className="text-[11.5px] text-slate-600">{k.sub}</div>
              <Sparkline points={k.spark} tone={k.status === "good" ? "#059669" : k.status === "watch" ? "#d97706" : "#e11d48"} />
              <div className="flex items-center gap-1 text-[10.5px] text-slate-500">
                {k.trend === "up" ? <TrendingUp className="h-3 w-3" aria-hidden /> : k.trend === "down" ? <TrendingDown className="h-3 w-3" aria-hidden /> : null}
                <span>{k.prior}</span>
              </div>
              <div className="text-[10px] text-slate-400">Target {k.target} · {k.timestamp}</div>
            </button>
          ))}
        </section>

        {/* ------------- 3 & 4. Map plus Digital Twin assessment ----------- */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Panel
            className="xl:col-span-8"
            title="Global Link Health Map"
            subtitle="Optical terminals, links, corridors, fallback routes and agent activity"
          >
            {mapBlock}
          </Panel>

          <Panel
            className="xl:col-span-4"
            title="Digital Twin Assessment"
            subtitle="Explainable, evidence-backed reasoning"
            action={
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                Confidence {stage?.confidence ?? twinAssessment.confidence}%
              </span>
            }
          >
            <p className="text-[12.5px] leading-relaxed text-slate-700">{stage?.assessment ?? twinAssessment.summary}</p>

            <h3 className="mt-3 text-[12px] font-semibold text-slate-800">Key drivers</h3>
            <ul className="mt-1 space-y-1 text-[11.5px] text-slate-700">
              {twinAssessment.drivers.map((d) => (
                <li key={d} className="flex gap-1.5"><ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-blue-600" aria-hidden />{d}</li>
              ))}
            </ul>

            <h3 className="mt-3 text-[12px] font-semibold text-slate-800">Recommended Actions, Next Six Hours</h3>
            <ol className="mt-1 space-y-2">
              {recommendations.map((r, i) => (
                <li key={r.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[12px] font-medium text-slate-900">{i + 1}. {r.title}</span>
                    <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold", riskTone[r.priority === "High" ? "High" : r.priority === "Medium" ? "Moderate" : "Low"])}>{r.priority}</span>
                  </div>
                  <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px] text-slate-600">
                    <div><dt className="inline text-slate-500">Outcome: </dt><dd className="inline">{r.outcome}</dd></div>
                    <div><dt className="inline text-slate-500">Protects: </dt><dd className="inline">{r.impactProtected}</dd></div>
                    <div><dt className="inline text-slate-500">Confidence: </dt><dd className="inline">{r.confidence}%</dd></div>
                    <div><dt className="inline text-slate-500">Policy: </dt><dd className="inline">{r.policy}</dd></div>
                    <div><dt className="inline text-slate-500">Approval: </dt><dd className="inline">{r.approval}</dd></div>
                    <div><dt className="inline text-slate-500">Agent: </dt><dd className="inline">{r.agent}</dd></div>
                    <div><dt className="inline text-slate-500">Window: </dt><dd className="inline">{r.window}</dd></div>
                  </dl>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <ToolbarButton onClick={() => setSimulated(`Simulation for ${r.title}: predicted customer impact avoided, ${r.impactProtected}. Fallback headroom remains sufficient.`)}>Simulate</ToolbarButton>
                    <ToolbarButton onClick={() => setWatches((w) => (w.includes(r.id) ? w : [...w, r.id]))} active={watches.includes(r.id)}>
                      {watches.includes(r.id) ? "Watch created" : "Create watch"}
                    </ToolbarButton>
                    <ToolbarButton onClick={() => setOwners((o) => ({ ...o, [r.id]: "NOC Duty Manager" }))} active={!!owners[r.id]}>
                      {owners[r.id] ? `Owner: ${owners[r.id]}` : "Assign owner"}
                    </ToolbarButton>
                    {r.approval === "Automatic" && (
                      <ToolbarButton onClick={() => setSimulated(`${r.title} approved and executed under bounded autonomy.`)}>Approve low-risk action</ToolbarButton>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <ToolbarButton onClick={() => setEvidenceOpen(true)}>View full analysis</ToolbarButton>
              <ToolbarButton onClick={() => setEvidenceOpen(true)}>Open evidence</ToolbarButton>
              <ToolbarButton onClick={() => setSimulated("Additional investigation requested from the Risk Prediction Agent.")}>Request investigation</ToolbarButton>
              <ToolbarButton onClick={() => setSimulated("Escalated to the NOC Duty Manager for regional review.")}>Escalate</ToolbarButton>
            </div>

            {simulated && (
              <div role="status" className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-2 text-[11.5px] text-blue-800">
                {simulated}
                <button type="button" onClick={() => setSimulated(null)} className="ml-2 underline">Dismiss</button>
              </div>
            )}
          </Panel>
        </div>

        {/* ------------------------ 5, 6, 7 analytics ---------------------- */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Panel
            className="xl:col-span-5"
            title="Top Link Risks, Next Six Hours"
            subtitle="Ranked by predicted customer consequence"
            action={
              <div className="flex items-center gap-1.5">
                <label className="relative">
                  <span className="sr-only">Search risks</span>
                  <Search className="pointer-events-none absolute left-2 top-1.5 h-3.5 w-3.5 text-slate-400" aria-hidden />
                  <input
                    value={riskSearch} onChange={(e) => setRiskSearch(e.target.value)} placeholder="Search"
                    className="w-32 rounded-md border border-slate-200 py-1 pl-7 pr-2 text-[11.5px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <Select label="Sort" value={riskSort} options={["risk", "confidence", "capacity"]} onChange={(v) => setRiskSort(v as typeof riskSort)} />
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[11.5px]">
                <caption className="sr-only">Top link risks over the next six hours, synthetic data</caption>
                <thead className="text-[10.5px] uppercase tracking-wide text-slate-500">
                  <tr className="border-b border-slate-200">
                    {["Link or route", "Region", "Risk", "Customer impact", "Capacity", "Confidence", "Time to impact", "Fallback", "Agent", "Recommended action"].map((h) => (
                      <th key={h} scope="col" className="px-2 py-1.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeRisks.map((r) => (
                    <tr
                      key={r.linkId}
                      tabIndex={0}
                      onClick={() => { setSelectedRisk(r.linkId); setSelectedLink(r.linkId); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { setSelectedRisk(r.linkId); setSelectedLink(r.linkId); } }}
                      className={cn("cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none",
                        selectedRisk === r.linkId && "bg-blue-50")}
                    >
                      <th scope="row" className="px-2 py-1.5 font-medium text-slate-900">{r.linkId}<div className="text-[10.5px] font-normal text-slate-500">{r.route}</div></th>
                      <td className="px-2 py-1.5 text-slate-700">{r.region}</td>
                      <td className="px-2 py-1.5"><span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", riskTone[r.risk])}>{r.risk}</span></td>
                      <td className="px-2 py-1.5 text-slate-700">{r.customerImpact}</td>
                      <td className="px-2 py-1.5 text-slate-700">{r.capacityExposed}</td>
                      <td className="px-2 py-1.5 text-slate-700">{r.confidence}%</td>
                      <td className="px-2 py-1.5 text-slate-700">{r.timeToImpact}</td>
                      <td className="px-2 py-1.5 text-slate-700">{fallbackFailure && r.region === "Chennai" ? "Failed" : r.fallbackReadiness}</td>
                      <td className="px-2 py-1.5 text-slate-700">{r.agent}</td>
                      <td className="px-2 py-1.5 text-slate-700">{r.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ToolbarButton onClick={() => { if (selectedRisk) { setRegion(twinRisks.find((r) => r.linkId === selectedRisk)?.region ?? "All regions"); } }}>Highlight on map</ToolbarButton>
              <ToolbarButton onClick={() => selectedRisk && setSelectedLink(selectedRisk)}>Open detail drawer</ToolbarButton>
              <ToolbarButton onClick={() => setSimulated(`${activeRisks.length} visible risk rows exported (synthetic data).`)}>Export visible rows</ToolbarButton>
              <ToolbarButton onClick={() => setRegion("All regions")}>View all risks</ToolbarButton>
            </div>
          </Panel>

          <Panel className="xl:col-span-4" title="Network Health Trend, Seven Days" subtitle="Availability, risk, incidents, recoveries and customer impact">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendSeries} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="a" domain={[99.99, 100]} stroke="#64748b" fontSize={10} width={46} tickLine={false} />
                  <YAxis yAxisId="b" orientation="right" stroke="#64748b" fontSize={10} width={28} tickLine={false} />
                  <RTooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Line yAxisId="a" type="monotone" dataKey="availability" name="Availability %" stroke="#059669" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line yAxisId="b" type="monotone" dataKey="atRisk" name="At-risk links" stroke="#d97706" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line yAxisId="b" type="monotone" dataKey="incidents" name="Active incidents" stroke="#e11d48" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line yAxisId="b" type="monotone" dataKey="recoveries" name="Autonomous recoveries" stroke="#2563eb" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line yAxisId="b" type="monotone" dataKey="impactEvents" name="Customer impact events" stroke="#64748b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <details className="mt-2 text-[11.5px] text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-700">Accessible data table and annotations</summary>
              <table className="mt-2 w-full text-left text-[11px]">
                <thead className="text-slate-500"><tr><th scope="col" className="py-1">Day</th><th scope="col">Availability</th><th scope="col">At risk</th><th scope="col">Incidents</th><th scope="col">Annotation</th></tr></thead>
                <tbody>
                  {trendSeries.map((t) => (
                    <tr key={t.day} className="border-t border-slate-100">
                      <th scope="row" className="py-1 font-medium text-slate-800">{t.day}</th>
                      <td>{t.availability}%</td><td>{t.atRisk}</td><td>{t.incidents}</td><td className="text-slate-500">{t.annotation ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </Panel>

          <Panel className="xl:col-span-3" title="Incident Summary" subtitle="Active incidents by severity">
            <div className="flex items-center gap-3">
              <div className="relative h-[150px] w-[150px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incidentSummary} dataKey="count" nameKey="severity" innerRadius={44} outerRadius={68} paddingAngle={2} isAnimationActive={false}>
                      {incidentSummary.map((s) => <Cell key={s.severity} fill={s.color} />)}
                    </Pie>
                    <RTooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-slate-900">{stage?.incidents ?? 3}</div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">Active</div>
                  </div>
                </div>
              </div>
              <ul className="flex-1 space-y-1 text-[11.5px]">
                {incidentSummary.map((s) => (
                  <li key={s.severity}>
                    <button
                      type="button"
                      onClick={() => setSeverityFilter(severityFilter === s.severity ? null : s.severity)}
                      className={cn("flex w-full items-center justify-between rounded px-1.5 py-1 hover:bg-slate-50",
                        severityFilter === s.severity && "bg-blue-50 ring-1 ring-blue-200")}
                    >
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />{s.severity}
                      </span>
                      <span className="font-medium text-slate-900">{s.count}</span>
                    </button>
                  </li>
                ))}
                <li className="pt-1 text-[10.5px] text-slate-500">{totalIncidents} tracked items in total</li>
              </ul>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ToolbarButton onClick={() => setIncidentDrawer(true)}>View incidents</ToolbarButton>
              <ToolbarButton onClick={() => setSeverityFilter(null)}>Clear severity filter</ToolbarButton>
            </div>
          </Panel>
        </div>

        {/* ------------------------ 8. Digital coworkers ------------------- */}
        <Panel title="Digital Coworkers" subtitle="Agents contributing to global link health, with scope and guardrail state">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {visibleCoworkers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedAgent(c.id)}
                className="rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-blue-300 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-900">
                    <Bot className="h-4 w-4 text-blue-600" aria-hidden />{c.name}
                  </span>
                  <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                    c.status === "Awaiting approval" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
                    {c.status}
                  </span>
                </div>
                <p className="mt-1 text-[11.5px] text-slate-600">{c.mission}</p>
                <p className="mt-0.5 text-[11.5px] text-slate-800">{c.task}</p>
                <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-slate-600">
                  <div><dt className="inline text-slate-500">Scope: </dt><dd className="inline">{c.scope}</dd></div>
                  <div><dt className="inline text-slate-500">Confidence: </dt><dd className="inline">{c.confidence}%</dd></div>
                  <div><dt className="inline text-slate-500">Actions today: </dt><dd className="inline">{c.actionsToday}</dd></div>
                  <div><dt className="inline text-slate-500">Awaiting approval: </dt><dd className="inline">{c.awaitingApproval}</dd></div>
                </dl>
                <div className="mt-1 text-[10.5px] text-slate-500">Last decision: {c.lastDecision}</div>
                <div className={cn("mt-1 inline-flex items-center gap-1 text-[10.5px]",
                  c.guardrail === "Within guardrails" ? "text-emerald-700" : "text-amber-700")}>
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />{c.guardrail}
                </div>
              </button>
            ))}
          </div>
        </Panel>

        {/* --------------- 9, 10, 11 activity, outcomes, metrics ----------- */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Panel className="xl:col-span-4" title="Recent Activity" subtitle="Agent and human actions across the estate">
            <ul className="space-y-1.5">
              {visibleActivity.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => setSelectedActivity(e)}
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-left hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[12px] font-medium text-slate-900">{e.event}</span>
                      <span className="shrink-0 text-[10.5px] text-slate-500">{e.time}</span>
                    </div>
                    <div className="text-[10.5px] text-slate-600">{e.region} · {e.service} · {e.actor}</div>
                    <div className="text-[10.5px] text-slate-500">{e.status} · {e.outcome}</div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ToolbarButton onClick={() => { setStageFilter(null); setRegion("All regions"); }}>View all activity</ToolbarButton>
              <ToolbarButton onClick={() => setStageFilter("Execute")} active={stageFilter === "Execute"}>Filter by execution</ToolbarButton>
              <ToolbarButton onClick={() => setRegion("Chennai")} active={region === "Chennai"}>Filter by Chennai</ToolbarButton>
            </div>
          </Panel>

          <Panel className="xl:col-span-4" title="Recent Outcomes" subtitle="Business and reliability value delivered">
            <ul className="space-y-1.5">
              {visibleOutcomes.map((o) => (
                <li key={o.id}>
                  <button type="button" onClick={() => setSelectedOutcome(o)}
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-left hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[12px] font-medium text-slate-900">{o.outcome}</span>
                      <span className="shrink-0 text-[10.5px] text-slate-500">{o.time}</span>
                    </div>
                    <div className="text-[10.5px] text-slate-600">{o.scope} · {o.businessValue}</div>
                    <div className="flex items-center gap-1 text-[10.5px] text-emerald-700"><Check className="h-3 w-3" aria-hidden />{o.status} · {o.sreValue}</div>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="xl:col-span-4" title="Key Metrics, Month to Date" subtitle="Synthetic demonstration data, not measured Terra outcomes">
            <dl className="grid grid-cols-2 gap-2">
              {liveMetrics.map((m) => (
                <div key={m.label} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                  <dt className="text-[10.5px] uppercase tracking-wide text-slate-500">{m.label}</dt>
                  <dd className="text-[15px] font-semibold text-slate-900">{m.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-[10.5px] text-slate-500">All values are synthetic demonstration data.</p>
          </Panel>
        </div>

        {/* ------------------ Operating loop and query bar ----------------- */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Panel className="xl:col-span-7" title="Global Link Health Operating Loop" subtitle="Select a stage to focus activity and coworkers">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {loopStages.map((s) => (
                <button
                  key={s.stage}
                  type="button"
                  onClick={() => setStageFilter(stageFilter === s.stage ? null : s.stage)}
                  aria-pressed={stageFilter === s.stage}
                  className={cn("rounded-lg border p-2 text-left text-[11px] transition-colors hover:border-blue-300",
                    stageFilter === s.stage ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-slate-900">{s.stage}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-700">{s.count}</span>
                  </div>
                  <div className="text-slate-600">{s.agent}</div>
                  <div className="text-slate-500">{s.status}</div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{s.latest}</div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="xl:col-span-5" title="Ask the Global Link Health Twin" subtitle="Deterministic demonstration responses, no live model connection">
            <div className="flex flex-wrap gap-1.5">
              {twinPrompts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPromptId(promptId === p.id ? null : p.id)}
                  className={cn("rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                    promptId === p.id ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}
                >
                  <MessageSquare className="mr-1 inline h-3 w-3" aria-hidden />{p.prompt}
                </button>
              ))}
            </div>
            <div role="status" aria-live="polite" className="mt-2 min-h-[70px] rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[12px] text-slate-800">
              {activePrompt ? (
                <>
                  <p className="font-medium">{activePrompt.answer}</p>
                  <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-600">
                    {activePrompt.detail.map((d) => <li key={d}>· {d}</li>)}
                  </ul>
                </>
              ) : (
                <p className="text-slate-500">Select a question to see the Twin's deterministic response. Responses also focus the map and risk table.</p>
              )}
            </div>
          </Panel>
        </div>

        {/* --------------------------- Scenario ---------------------------- */}
        <Panel
          title="Run Chennai Link Protection Scenario"
          subtitle="Deterministic 14-stage demonstration of preventive, governed action"
          action={
            <div className="flex flex-wrap gap-1.5">
              <ToolbarButton onClick={() => { if (step < 0) setStep(0); setPlaying(true); }} active={playing}><Play className="h-3.5 w-3.5" aria-hidden />Start</ToolbarButton>
              <ToolbarButton onClick={() => setPlaying(false)}><Pause className="h-3.5 w-3.5" aria-hidden />Pause</ToolbarButton>
              <ToolbarButton onClick={() => setPlaying(true)}>Continue</ToolbarButton>
              <ToolbarButton onClick={advance}><SkipForward className="h-3.5 w-3.5" aria-hidden />Skip to next stage</ToolbarButton>
              <ToolbarButton onClick={resetScenario}><RotateCcw className="h-3.5 w-3.5" aria-hidden />Reset</ToolbarButton>
            </div>
          }
        >
          <ol className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
            {chennaiScenario.map((s) => {
              const done = step >= s.index;
              const current = step === s.index;
              return (
                <li key={s.index} className={cn("rounded-md border px-2 py-1.5 text-[11px]",
                  current ? "border-blue-400 bg-blue-50" : done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white")}>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-semibold",
                      done ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600")}>{s.index + 1}</span>
                    <span className="font-medium text-slate-900">{s.label}</span>
                  </div>
                  {current && <p className="mt-1 text-slate-600">{s.narrative}</p>}
                </li>
              );
            })}
          </ol>

          {stage?.awaitingApproval && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-amber-800">
                <AlertTriangle className="h-4 w-4" aria-hidden />Human approval required: move priority traffic to RF fallback
              </div>
              <p className="mt-1 text-[11.5px] text-amber-900">Rollback checkpoint verified. Fallback headroom validated at 9 Gbps.</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <ToolbarButton onClick={() => { setApproval("approved"); advance(); }} active={approval === "approved"}>Approve traffic movement</ToolbarButton>
                <ToolbarButton onClick={() => { setApproval("rejected"); setPlaying(false); }} active={approval === "rejected"}>Reject traffic movement</ToolbarButton>
                <ToolbarButton onClick={() => { setApproval("evidence"); setEvidenceOpen(true); }}>Request more evidence</ToolbarButton>
              </div>
              {approval === "rejected" && (
                <p className="mt-2 text-[11.5px] text-rose-700">Traffic movement rejected. The Twin continues monitoring and will re-evaluate in 30 minutes.</p>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <ToolbarButton active={fallbackFailure} onClick={() => setFallbackFailure((f) => !f)}>Simulate fallback capacity failure</ToolbarButton>
            <ToolbarButton active={comparison} onClick={() => setComparison((c) => !c)}>Compare manual and agentic response</ToolbarButton>
          </div>

          {fallbackFailure && (
            <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-2 text-[11.5px] text-rose-800">
              Fallback capacity failure simulated for Chennai. Fallback readiness now reads as failed, the Twin withdraws the traffic
              movement recommendation and escalates to the NOC Duty Manager for a manual capacity decision.
            </div>
          )}

          {comparison && (
            <div className="mt-2 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { metric: "Detection, minutes", Manual: 42, Agentic: 3 },
                  { metric: "Decision, minutes", Manual: 35, Agentic: 6 },
                  { metric: "Recovery, minutes", Manual: 68, Agentic: 12 },
                  { metric: "Customer impact, minutes", Manual: 47, Agentic: 0 },
                ]} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} width={30} tickLine={false} />
                  <RTooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="Manual" fill="#94a3b8" isAnimationActive={false} />
                  <Bar dataKey="Agentic" fill="#2563eb" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <p className="pb-4 text-[10.5px] text-slate-500">
          Synthetic Terra Communications demonstration environment. No connection to production systems and no real customer,
          terminal or financial data is represented.
        </p>
      </div>

      {/* ----------------------------- drawers ---------------------------- */}
      <Sheet open={!!linkDetail} onOpenChange={(o) => !o && setSelectedLink(null)}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          {linkDetail && <LinkDrawer link={linkDetail} />}
        </SheetContent>
      </Sheet>

      <Sheet open={!!agentDetail} onOpenChange={(o) => !o && setSelectedAgent(null)}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          {agentDetail && <AgentDrawer agent={agentDetail} />}
        </SheetContent>
      </Sheet>

      <Sheet open={evidenceOpen} onOpenChange={setEvidenceOpen}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          <h2 className="text-sm font-semibold text-slate-900">Assessment Evidence</h2>
          <p className="mt-1 text-[11.5px] text-slate-600">Auditable evidence supporting the current assessment.</p>
          <ul className="mt-3 space-y-2">
            {twinAssessment.evidence.map((e) => (
              <li key={e.id} className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px]">
                <div className="font-medium text-slate-900">{e.label}</div>
                <div className="text-slate-600">Source: {e.source} · Weight: {e.weight}</div>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      <Sheet open={incidentDrawer} onOpenChange={setIncidentDrawer}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          <h2 className="text-sm font-semibold text-slate-900">Incident Summary</h2>
          <ul className="mt-3 space-y-2 text-[11.5px]">
            {incidentSummary.map((s) => (
              <li key={s.severity} className="flex items-center justify-between rounded-md border border-slate-200 px-2.5 py-2">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />{s.severity}
                </span>
                <span className="font-medium text-slate-900">{s.count}</span>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedActivity} onOpenChange={(o) => !o && setSelectedActivity(null)}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          {selectedActivity && (
            <>
              <h2 className="text-sm font-semibold text-slate-900">{selectedActivity.event}</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Field label="Time" value={selectedActivity.time} />
                <Field label="Region" value={selectedActivity.region} />
                <Field label="Service" value={selectedActivity.service} />
                <Field label="Actor" value={selectedActivity.actor} />
                <Field label="Status" value={selectedActivity.status} />
                <Field label="Outcome" value={selectedActivity.outcome} />
                <Field label="Loop stage" value={selectedActivity.stage} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedOutcome} onOpenChange={(o) => !o && setSelectedOutcome(null)}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          {selectedOutcome && (
            <>
              <h2 className="text-sm font-semibold text-slate-900">{selectedOutcome.outcome}</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Field label="Time" value={selectedOutcome.time} />
                <Field label="Customer or region" value={selectedOutcome.scope} />
                <Field label="Business value" value={selectedOutcome.businessValue} />
                <Field label="SRE value" value={selectedOutcome.sreValue} />
                <Field label="Status" value={selectedOutcome.status} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Full screen map */}
      {fullScreenMap && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white p-4" role="dialog" aria-label="Full screen global link health map">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Global Link Health Map</h2>
            <button type="button" onClick={() => setFullScreenMap(false)} aria-label="Close full screen map"
              className="grid h-8 w-8 place-items-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-auto">{mapBlock}</div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ drawers -------------------------------- */

function LinkDrawer({ link }: { link: TwinLink }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">{link.id}</h2>
        <StatePill state={link.state} />
      </div>
      <p className="text-[12px] text-slate-600">{link.name}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field label="Region" value={link.region} />
        <Field label="Product" value={link.product} />
        <Field label="Link type" value={link.linkType} />
        <Field label="Customer service" value={link.service} />
        <Field label="Terminal A" value={link.terminalA} />
        <Field label="Terminal B" value={link.terminalB} />
        <Field label="Capacity" value={`${link.capacityGbps} Gbps`} />
        <Field label="Current throughput" value={`${link.throughputGbps} Gbps`} />
        <Field label="Availability" value={link.availability} />
        <Field label="Link margin" value={link.marginDb} />
        <Field label="Received optical power" value={link.rxPowerDbm} />
        <Field label="Optical attenuation" value={link.attenuationDb} />
        <Field label="Beam lock" value={link.beamLock} />
        <Field label="Pointing error" value={link.pointingError} />
        <Field label="Weather exposure" value={link.weather} />
        <Field label="RF fallback status" value={link.rfFallback} />
        <Field label="SLO status" value={link.slo} />
        <Field label="Active situation" value={link.situation} />
        <Field label="Assigned digital coworkers" value={link.agents.join(", ") || "None"} />
        <Field label="Recommended action" value={link.recommendation} />
        <Field label="Evidence count" value={String(link.evidenceCount)} />
      </div>
    </>
  );
}

function AgentDrawer({ agent }: { agent: Coworker }) {
  const List = ({ title, items }: { title: string; items: string[] }) => (
    <div className="mt-3">
      <h3 className="text-[12px] font-semibold text-slate-800">{title}</h3>
      <ul className="mt-1 space-y-0.5 text-[11.5px] text-slate-600">
        {items.length ? items.map((i) => <li key={i}>· {i}</li>) : <li>· None</li>}
      </ul>
    </div>
  );
  return (
    <>
      <div className="flex items-center gap-1.5">
        <Bot className="h-4 w-4 text-blue-600" aria-hidden />
        <h2 className="text-sm font-semibold text-slate-900">{agent.name}</h2>
      </div>
      <p className="mt-1 text-[12px] text-slate-600">{agent.mission}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field label="Current objective" value={agent.objective} />
        <Field label="Scope" value={agent.scope} />
        <Field label="Confidence" value={`${agent.confidence}%`} />
        <Field label="Evidence reviewed" value={String(agent.evidenceReviewed)} />
        <Field label="Autonomy level" value={agent.autonomy} />
        <Field label="Human owner" value={agent.owner} />
        <Field label="Actions awaiting approval" value={String(agent.awaitingApproval)} />
        <Field label="Guardrail status" value={agent.guardrail} />
      </div>
      <List title="Inputs" items={agent.inputs} />
      <List title="Connected data" items={agent.connectedData} />
      <List title="Current work queue" items={agent.queue} />
      <List title="Recent findings" items={agent.findings} />
      <List title="Recent recommendations" items={agent.recommendations} />
      <List title="Guardrails" items={agent.guardrails} />
      <List title="Recent outcomes" items={agent.outcomes} />
    </>
  );
}
