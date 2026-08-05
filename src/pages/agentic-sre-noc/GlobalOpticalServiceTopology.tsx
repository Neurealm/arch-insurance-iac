/**
 * Global Optical Service Topology — Agentic SRE NOC.
 *
 * End to end service chain, dependency, resilience, ownership and agentic
 * topology intelligence for the synthetic Taara-aligned estate. All state is
 * local and deterministic; data lives in ./data/topologyFixtures.ts and reuses
 * identifiers from the Global Optical Operations Center and the Customer
 * Service Health Explorer.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Bot, CheckCircle2, Download, ImageDown, Layers, Maximize2, Minimize2,
  Pause, Play, RefreshCw, RotateCcw, Search, ShieldCheck, SkipForward, Sparkles,
  TrendingDown, TrendingUp, X,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Field, Panel, Select, ToolbarButton } from "./components/NocPrimitives";
import { TopologyCanvas } from "./components/TopologyCanvas";
import { PRODUCTS, REGIONS, TIME_RANGES } from "./data/goocFixtures";
import { customerServices, CSH_CUSTOMERS, DEFAULT_SERVICE_ID } from "./data/cshFixtures";
import {
  blastRadius, buildTopology, CALIFORNIA_SERVICE_ID, dependencyScenario, healthChip, healthGlyph,
  manualVersusAgentic, OVERLAY_CATEGORIES, ownershipMatrix, OWNERS, partners, RELATIONSHIPS,
  relationshipRows, resiliencePaths, riskChipClass, RISK_BANDS, TOPOLOGY_CONFIDENCE,
  TOPOLOGY_FRESHNESS, TOPOLOGY_HEALTH, topologyEvents, topologyInsights, topologyKpis,
  topologyOverlays, TOPOLOGY_SAVED_VIEWS, TOPOLOGY_VIEWS,
  type RelationshipRow, type TopologyHealth, type TopologyView,
} from "./data/topologyFixtures";

const csvEscape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;

function Chip({ label, className }: { label: string; className: string }) {
  return <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-medium", className)}>{label}</span>;
}

/** Node kinds surfaced by each topology view. */
const viewKinds: Record<TopologyView, string[]> = {
  "Customer service view": ["Customer", "Customer service", "Customer edge", "Mobile tower", "User population", "SLO"],
  "Optical infrastructure view": ["Optical terminal", "Optical path", "Power source", "Backup power", "Mounting structure", "Optical controller"],
  "Network dependency view": ["Fiber handoff", "Customer router", "Partner router", "Aggregation router", "Switch", "Data center", "Network point of presence", "Customer edge"],
  "Resilience view": ["RF fallback", "Alternate optical route", "Fiber backup route", "Secondary aggregation path", "Backup power", "Customer service", "Optical path"],
  "Partner ownership view": ["Operating partner", "Partner router", "Fiber handoff", "Field work order", "Service owner"],
  "Incident impact view": ["Incident", "Situation", "Customer service", "Optical path", "Fiber handoff", "User population"],
  "Change impact view": ["Change", "Optical terminal", "Aggregation router", "Customer service"],
  "Agent activity view": ["Digital coworker", "Customer service", "Optical path", "RF fallback"],
};

export default function GlobalOpticalServiceTopology() {
  /* ------------------------------- filters ------------------------------- */
  const [serviceId, setServiceId] = useState(DEFAULT_SERVICE_ID);
  const [customer, setCustomer] = useState("All customers");
  const [region, setRegion] = useState("All regions");
  const [product, setProduct] = useState("All products");
  const [relationshipFilter, setRelationshipFilter] = useState("All relationships");
  const [healthFilter, setHealthFilter] = useState("All health states");
  const [riskFilter, setRiskFilter] = useState("All risk levels");
  const [ownerFilter, setOwnerFilter] = useState("All owners");
  const [timeRange, setTimeRange] = useState("24h");
  const [savedView, setSavedView] = useState<string>(TOPOLOGY_SAVED_VIEWS[0]);
  const [search, setSearch] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(TOPOLOGY_FRESHNESS);

  /* ------------------------------ topology ------------------------------- */
  const [view, setView] = useState<TopologyView>("Customer service view");
  const [showContext, setShowContext] = useState(true);
  const [showAlternates, setShowAlternates] = useState(true);
  const [hideHealthy, setHideHealthy] = useState(false);
  const [onlyAffected, setOnlyAffected] = useState(false);
  const [direction, setDirection] = useState<"Both" | "Upstream" | "Downstream">("Both");
  const [showOwnership, setShowOwnership] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [fullScreen, setFullScreen] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("t-service");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [overlayCategory, setOverlayCategory] = useState("All overlays");
  const [blast, setBlast] = useState<ReturnType<typeof blastRadius> | null>(null);
  const [simulatedRoute, setSimulatedRoute] = useState<string | null>(null);

  /* ------------------------------ scenario ------------------------------- */
  const [scenarioActive, setScenarioActive] = useState(false);
  const [scenarioRunning, setScenarioRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [approved, setApproved] = useState(false);

  const service = useMemo(
    () => customerServices.find((s) => s.id === serviceId) ?? customerServices[0],
    [serviceId],
  );
  const graph = useMemo(() => buildTopology(service), [service]);
  const allRows = useMemo(() => relationshipRows(graph), [graph]);
  const routes = useMemo(() => resiliencePaths(service), [service]);

  /* --------------------------- scenario playback -------------------------- */
  const scenarioStep = dependencyScenario[step];
  const blockedByApproval = scenarioActive && scenarioStep?.requiresApproval && !approved;

  useEffect(() => {
    if (!scenarioRunning || blockedByApproval) return;
    if (step >= dependencyScenario.length - 1) { setScenarioRunning(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 1600);
    return () => clearTimeout(t);
  }, [scenarioRunning, step, blockedByApproval]);

  useEffect(() => {
    if (!scenarioActive) return;
    setHighlight(new Set(dependencyScenario[step]?.highlight ?? []));
  }, [scenarioActive, step]);

  const healthOverrides = useMemo(() => {
    if (!scenarioActive) return {} as Record<string, TopologyHealth>;
    const out: Record<string, TopologyHealth> = {};
    dependencyScenario.slice(0, step + 1).forEach((s) => Object.assign(out, s.nodeStates ?? {}));
    return out;
  }, [scenarioActive, step]);

  const startScenario = () => {
    setServiceId(CALIFORNIA_SERVICE_ID);
    setScenarioActive(true);
    setScenarioRunning(true);
    setApproved(false);
    setStep(0);
  };
  const resetScenario = () => {
    setScenarioActive(false); setScenarioRunning(false); setStep(0); setApproved(false);
    setHighlight(new Set()); setServiceId(DEFAULT_SERVICE_ID);
  };

  /* ------------------------------ visibility ------------------------------ */
  const neighborsOf = useCallback(
    (id: string, dir: "up" | "down" | "both") => {
      const out = new Set<string>();
      graph.edges.forEach((e) => {
        if (dir !== "up" && e.from === id) out.add(e.to);
        if (dir !== "down" && e.to === id) out.add(e.from);
      });
      return out;
    },
    [graph.edges],
  );

  const visibleNodeIds = useMemo(() => {
    const kinds = viewKinds[view];
    const chainSet = new Set(graph.chain);
    const ids = new Set<string>();
    graph.nodes.forEach((n) => {
      const health = healthOverrides[n.id] ?? n.health;
      if (n.context && !showContext) return;
      if (!showAlternates && ["RF fallback", "Alternate optical route", "Fiber backup route", "Backup power", "Secondary aggregation path"].includes(n.kind)) return;
      const inView = chainSet.has(n.id) || kinds.includes(n.kind) || expanded.has(n.id);
      if (!inView) return;
      if (hideHealthy && health === "Healthy" && !chainSet.has(n.id)) return;
      if (onlyAffected && health === "Healthy") return;
      if (region !== "All regions" && n.region !== region) return;
      if (ownerFilter !== "All owners" && n.owner !== ownerFilter) return;
      if (healthFilter !== "All health states" && health !== healthFilter) return;
      if (riskFilter !== "All risk levels" && n.risk !== riskFilter) return;
      if (search && !`${n.label} ${n.kind} ${n.owner}`.toLowerCase().includes(search.toLowerCase())) return;
      ids.add(n.id);
    });
    // direction narrowing relative to the selected object
    if (direction !== "Both" && selectedNodeId) {
      const keep = neighborsOf(selectedNodeId, direction === "Upstream" ? "up" : "down");
      keep.add(selectedNodeId);
      [...ids].forEach((id) => { if (!keep.has(id)) ids.delete(id); });
    }
    collapsed.forEach((id) => {
      neighborsOf(id, "down").forEach((n) => { if (!graph.chain.includes(n)) ids.delete(n); });
    });
    return ids;
  }, [graph, view, showContext, showAlternates, hideHealthy, onlyAffected, region, ownerFilter, healthFilter, riskFilter, search, direction, selectedNodeId, neighborsOf, collapsed, expanded, healthOverrides]);

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedEdge = graph.edges.find((e) => e.id === selectedEdgeId) ?? null;

  const selectNode = (id: string) => {
    setSelectedNodeId(id); setSelectedEdgeId(null); setDrawerOpen(true);
    setHighlight(new Set([id, ...neighborsOf(id, "both")]));
  };
  const selectEdge = (id: string) => {
    const e = graph.edges.find((x) => x.id === id);
    setSelectedEdgeId(id); setSelectedNodeId(null); setDrawerOpen(true);
    setHighlight(new Set(e ? [e.from, e.to] : []));
  };

  const applyOverlay = (id: string) => {
    const o = topologyOverlays.find((x) => x.id === id);
    if (!o) return;
    setActiveOverlay((v) => (v === id ? null : id));
    setHighlight(activeOverlay === id ? new Set() : new Set(o.affectedNodes));
  };

  const resetPage = () => {
    setServiceId(DEFAULT_SERVICE_ID); setCustomer("All customers"); setRegion("All regions");
    setProduct("All products"); setRelationshipFilter("All relationships"); setHealthFilter("All health states");
    setRiskFilter("All risk levels"); setOwnerFilter("All owners"); setTimeRange("24h");
    setSavedView(TOPOLOGY_SAVED_VIEWS[0]); setSearch(""); setView("Customer service view");
    setShowContext(true); setShowAlternates(true); setHideHealthy(false); setOnlyAffected(false);
    setDirection("Both"); setShowOwnership(false); setCollapsed(new Set()); setExpanded(new Set());
    setSelectedNodeId("t-service"); setSelectedEdgeId(null); setHighlight(new Set());
    setActiveOverlay(null); setBlast(null); setSimulatedRoute(null); resetScenario();
  };

  const applySavedView = (v: string) => {
    setSavedView(v);
    if (v === "Chennai weather exposure") { setServiceId(DEFAULT_SERVICE_ID); setView("Resilience view"); applyOverlayById("ov-fog"); }
    else if (v === "California upstream failure") { setServiceId(CALIFORNIA_SERVICE_ID); setView("Network dependency view"); applyOverlayById("ov-california"); }
    else if (v === "Unprotected dependencies") { setHealthFilter("Unprotected dependency"); setView("Resilience view"); }
    else if (v === "Partner owned components") { setView("Partner ownership view"); setOwnerFilter("Network operating partner"); }
    else { setView("Customer service view"); setHealthFilter("All health states"); setOwnerFilter("All owners"); setActiveOverlay(null); setHighlight(new Set()); }
  };
  function applyOverlayById(id: string) {
    const o = topologyOverlays.find((x) => x.id === id);
    setActiveOverlay(id);
    setHighlight(new Set(o?.affectedNodes ?? []));
  }

  /* ------------------------------ table state ----------------------------- */
  const [groupBy, setGroupBy] = useState("No grouping");
  const [sortKey, setSortKey] = useState<keyof RelationshipRow>("sourceLabel");
  const [tableSearch, setTableSearch] = useState("");

  const rows = useMemo(() => {
    let r = allRows.filter((x) => {
      if (relationshipFilter !== "All relationships" && x.relationship !== relationshipFilter) return false;
      if (healthFilter !== "All health states" && x.health !== healthFilter) return false;
      if (riskFilter !== "All risk levels" && x.risk !== riskFilter) return false;
      if (ownerFilter !== "All owners" && x.ownership !== ownerFilter) return false;
      if (tableSearch && !`${x.sourceLabel} ${x.relationship} ${x.targetLabel}`.toLowerCase().includes(tableSearch.toLowerCase())) return false;
      return true;
    });
    r = [...r].sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])));
    return r;
  }, [allRows, relationshipFilter, healthFilter, riskFilter, ownerFilter, tableSearch, sortKey]);

  const grouped = useMemo(() => {
    if (groupBy === "No grouping") return [["All relationships", rows]] as [string, RelationshipRow[]][];
    const key = (r: RelationshipRow) =>
      groupBy === "Relationship" ? r.relationship
        : groupBy === "Object type" ? r.sourceType
        : groupBy === "Owner" ? r.ownership
        : groupBy === "Risk" ? r.risk
        : service.customer;
    const m = new Map<string, RelationshipRow[]>();
    rows.forEach((r) => { const k = key(r); m.set(k, [...(m.get(k) ?? []), r]); });
    return [...m.entries()];
  }, [rows, groupBy, service.customer]);

  const exportRelationships = () => {
    const header = ["Source object", "Source type", "Relationship", "Target object", "Target type", "Health", "Ownership", "Customer impact", "Risk", "Last validated", "Evidence", "Agent activity"];
    const body = rows.map((r) => [r.sourceLabel, r.sourceType, r.relationship, r.targetLabel, r.targetType, r.health, r.ownership, r.customerImpact, r.risk, r.lastValidated, r.evidence, r.agentActivity].map(csvEscape).join(","));
    const blob = new Blob([[header.map(csvEscape).join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "topology-relationships.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportImage = () => {
    const svg = document.querySelector('svg[aria-label="Interactive service topology canvas"]');
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "service-topology.svg"; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredOverlays = topologyOverlays.filter((o) => overlayCategory === "All overlays" || o.category === overlayCategory);
  const chainNodes = graph.chain.map((id) => graph.nodes.find((n) => n.id === id)!).filter(Boolean);
  const alternateNodes = graph.nodes.filter((n) => ["RF fallback", "Alternate optical route", "Fiber backup route"].includes(n.kind));

  /* -------------------------------- render -------------------------------- */
  return (
    <div className="max-w-[1600px] space-y-5 px-4 py-6 sm:px-6">
      {/* 1 — Header and topology controls */}
      <header className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="text-[11px] text-slate-500">SRE / Agentic SRE NOC / Global Optical Service Topology</nav>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Global Optical Service Topology</h1>
            <p className="mt-1 max-w-4xl text-[13px] text-slate-600">
              Explore customer services, optical paths, network dependencies, resilience routes, and partner relationships through one connected operational model
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">Synthetic Taara-aligned demonstration environment</span>
              <span className="text-slate-500">Topology freshness {refreshedAt}</span>
              <span className="text-slate-500">Data confidence {TOPOLOGY_CONFIDENCE}</span>
              <span className="text-slate-500">Customer {service.customer}</span>
              <span className="text-slate-500">Service {service.name}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select label="Service" value={serviceId} options={customerServices.map((s) => s.id)} onChange={setServiceId} />
            <Select label="Customer" value={customer} options={["All customers", ...CSH_CUSTOMERS]} onChange={setCustomer} />
            <Select label="Region" value={region} options={["All regions", ...REGIONS]} onChange={setRegion} />
            <Select label="Product" value={product} options={["All products", ...PRODUCTS]} onChange={setProduct} />
            <Select label="Relationship type" value={relationshipFilter} options={["All relationships", ...RELATIONSHIPS]} onChange={setRelationshipFilter} />
            <Select label="Health" value={healthFilter} options={["All health states", ...TOPOLOGY_HEALTH]} onChange={setHealthFilter} />
            <Select label="Risk" value={riskFilter} options={["All risk levels", ...RISK_BANDS]} onChange={setRiskFilter} />
            <Select label="Ownership" value={ownerFilter} options={["All owners", ...OWNERS]} onChange={setOwnerFilter} />
            <Select label="Time range" value={timeRange} options={TIME_RANGES} onChange={setTimeRange} />
            <Select label="Saved view" value={savedView} options={TOPOLOGY_SAVED_VIEWS} onChange={applySavedView} />
            <label className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <input
                aria-label="Search topology"
                placeholder="Search topology"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-36 border-0 p-0 text-[11.5px] text-slate-800 focus:outline-none"
              />
            </label>
            <ToolbarButton onClick={() => setRefreshedAt(`${new Date().toISOString().slice(11, 19)} UTC`)}><RefreshCw className="h-3.5 w-3.5" /> Refresh</ToolbarButton>
            <ToolbarButton onClick={() => { setHighlight(new Set()); setCollapsed(new Set()); setExpanded(new Set()); setActiveOverlay(null); setBlast(null); }}><RotateCcw className="h-3.5 w-3.5" /> Reset topology</ToolbarButton>
            <ToolbarButton onClick={() => setFullScreen((f) => !f)} active={fullScreen}>{fullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />} Full screen</ToolbarButton>
            <ToolbarButton onClick={exportImage}><ImageDown className="h-3.5 w-3.5" /> Export image</ToolbarButton>
            <ToolbarButton onClick={exportRelationships}><Download className="h-3.5 w-3.5" /> Export relationship data</ToolbarButton>
            <ToolbarButton onClick={resetPage}><X className="h-3.5 w-3.5" /> Reset page</ToolbarButton>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Topology views">
          {TOPOLOGY_VIEWS.map((v) => (
            <ToolbarButton key={v} onClick={() => setView(v)} active={view === v}>{v}</ToolbarButton>
          ))}
        </div>
      </header>

      {/* 2 — Topology outcome scorecard */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {topologyKpis.map((k) => {
          const TrendIcon = k.trend === "down" ? TrendingDown : TrendingUp;
          const tone = k.status === "good" ? "text-emerald-600" : k.status === "watch" ? "text-amber-600" : "text-rose-600";
          const active = (k.filter.kind === "view" && view === k.filter.value)
            || (k.filter.kind === "health" && healthFilter === k.filter.value)
            || (k.filter.kind === "risk" && riskFilter === k.filter.value);
          return (
            <button
              key={k.id}
              type="button"
              title={k.explain}
              aria-pressed={active}
              onClick={() => {
                if (k.filter.kind === "view") setView(k.filter.value as TopologyView);
                else if (k.filter.kind === "health") setHealthFilter((v) => (v === k.filter.value ? "All health states" : k.filter.value!));
                else if (k.filter.kind === "risk") setRiskFilter((v) => (v === k.filter.value ? "All risk levels" : k.filter.value!));
              }}
              className={cn("rounded-xl border bg-white p-3 text-left shadow-sm transition-colors hover:border-indigo-300", active ? "border-indigo-500 ring-1 ring-indigo-200" : "border-slate-200")}
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
            </button>
          );
        })}
      </div>

      {/* 3 — Interactive service topology canvas */}
      <Panel
        title="Service topology canvas"
        subtitle={`${view} — ${service.name}`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <ToolbarButton onClick={() => setShowContext((v) => !v)} active={showContext}><Layers className="h-3.5 w-3.5" /> Operational context</ToolbarButton>
            <ToolbarButton onClick={() => setShowAlternates((v) => !v)} active={showAlternates}>Alternate routes</ToolbarButton>
            <ToolbarButton onClick={() => setHideHealthy((v) => !v)} active={hideHealthy}>Hide healthy objects</ToolbarButton>
            <ToolbarButton onClick={() => setOnlyAffected((v) => !v)} active={onlyAffected}>Only affected paths</ToolbarButton>
            <ToolbarButton onClick={() => setDirection("Upstream")} active={direction === "Upstream"}>Upstream</ToolbarButton>
            <ToolbarButton onClick={() => setDirection("Downstream")} active={direction === "Downstream"}>Downstream</ToolbarButton>
            <ToolbarButton onClick={() => setDirection("Both")} active={direction === "Both"}>Both directions</ToolbarButton>
            <ToolbarButton onClick={() => setShowOwnership((v) => !v)} active={showOwnership}>Ownership overlay</ToolbarButton>
            <ToolbarButton onClick={() => selectedNodeId && setExpanded((s) => new Set([...s, ...neighborsOf(selectedNodeId, "both")]))}>Expand neighbors</ToolbarButton>
            <ToolbarButton onClick={() => selectedNodeId && setCollapsed((s) => new Set([...s, selectedNodeId]))}>Collapse branch</ToolbarButton>
          </div>
        }
      >
        <TopologyCanvas
          graph={graph}
          visibleNodeIds={visibleNodeIds}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          highlighted={highlight}
          healthOverrides={healthOverrides}
          onSelectNode={selectNode}
          onSelectEdge={selectEdge}
          showOwnership={showOwnership}
          fullScreen={fullScreen}
          onToggleFullScreen={() => setFullScreen((f) => !f)}
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TOPOLOGY_HEALTH.map((h) => (
            <Chip key={h} label={`${healthGlyph[h]} ${h}`} className={healthChip[h]} />
          ))}
        </div>
        {visibleNodeIds.size === 0 && (
          <p className="mt-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-[12px] text-slate-500">
            No topology objects match the current filters. Reset the topology or widen the filters.
          </p>
        )}
      </Panel>

      {/* 4 — End to end service chain */}
      <Panel title="End to End Service Path" subtitle="Select a stage to highlight the corresponding topology object">
        <div className="overflow-x-auto">
          <ol className="flex min-w-max items-stretch gap-2">
            {chainNodes.map((n, i) => {
              const health = healthOverrides[n.id] ?? n.health;
              return (
                <li key={n.id} className="flex items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() => selectNode(n.id)}
                    aria-pressed={selectedNodeId === n.id}
                    className={cn(
                      "w-44 rounded-lg border bg-white p-2.5 text-left shadow-sm hover:border-indigo-300",
                      selectedNodeId === n.id ? "border-indigo-500 ring-1 ring-indigo-200" : "border-slate-200",
                    )}
                  >
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">{n.kind}</div>
                    <div className="text-[12px] font-semibold text-slate-900">{n.label}</div>
                    <div className="mt-1"><Chip label={`${healthGlyph[health]} ${health}`} className={healthChip[health]} /></div>
                    <dl className="mt-1.5 space-y-0.5 text-[10.5px] text-slate-600">
                      <div>Owner: {n.owner}</div>
                      <div>Capacity: {n.capacity}</div>
                      <div>Throughput: {n.throughput}</div>
                      <div>Latency: {n.latency}</div>
                      <div>Risk: {n.risk}</div>
                      <div>Agent: {n.agentActivity}</div>
                    </dl>
                  </button>
                  {i < chainNodes.length - 1 && <div className="self-center text-slate-400" aria-hidden>→</div>}
                </li>
              );
            })}
          </ol>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {alternateNodes.map((n) => (
            <button key={n.id} type="button" onClick={() => selectNode(n.id)} className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2.5 text-left hover:border-indigo-300">
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Resilience path</div>
              <div className="text-[12px] font-semibold text-slate-900">{n.label}</div>
              <div className="text-[10.5px] text-slate-600">{n.state} · {n.capacity} · {n.latency}</div>
            </button>
          ))}
        </div>
      </Panel>

      {/* 5 + 6 — Dependency analysis and resilience */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Dependency and Impact Analysis"
          subtitle={selectedNode ? selectedNode.label : selectedEdge ? selectedEdge.relationship : "Select a topology object"}
          action={
            <ToolbarButton onClick={() => selectedNodeId && setBlast(blastRadius(selectedNodeId, service, graph))}>
              <AlertTriangle className="h-3.5 w-3.5" /> Analyze failure impact
            </ToolbarButton>
          }
        >
          {!selectedNode && !selectedEdge && (
            <p className="text-[12px] text-slate-500">Select a node or relationship on the canvas to inspect its dependencies.</p>
          )}
          {selectedNodeId && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Upstream dependencies" value={[...neighborsOf(selectedNodeId, "up")].map((id) => graph.nodes.find((n) => n.id === id)?.label).join(", ") || "None"} />
              <Field label="Downstream dependencies" value={[...neighborsOf(selectedNodeId, "down")].map((id) => graph.nodes.find((n) => n.id === id)?.label).join(", ") || "None"} />
              <Field label="Customers affected" value={service.customer} />
              <Field label="Services affected" value={service.name} />
              <Field label="Capacity exposed" value={`${service.committedGbps} Gbps`} />
              <Field label="Regions affected" value={service.region} />
              <Field label="SLOs at risk" value={service.sloStatus === "Within objective" ? "None" : "1 SLO"} />
              <Field label="Agents assigned" value="Service Dependency Agent, Customer Impact Agent" />
            </div>
          )}
          {blast && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="text-[12px] font-semibold text-amber-900">Blast radius — {blast.object}</div>
              <p className="text-[11px] text-amber-800">{blast.summary} All impact values are synthetic demonstration data.</p>
              <dl className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {blast.rows.map(([k, v]) => (
                  <div key={k} className="rounded border border-amber-200 bg-white px-2 py-1">
                    <dt className="text-[10px] uppercase tracking-wide text-slate-500">{k}</dt>
                    <dd className="text-[11.5px] text-slate-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-2 text-[11.5px] font-medium text-amber-900">{blast.recoveryPath}</div>
            </div>
          )}
        </Panel>

        <Panel
          title="Service Resilience Paths"
          subtitle="Primary, fallback, and alternate transport for the selected service"
          action={
            <ToolbarButton onClick={() => setSimulatedRoute(simulatedRoute ? null : "Integrated RF fallback")}>
              <ShieldCheck className="h-3.5 w-3.5" /> {simulatedRoute ? "Revert simulated transition" : "Simulate route transition"}
            </ToolbarButton>
          }
        >
          {simulatedRoute && (
            <div className="mb-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-[11.5px] text-sky-800" role="status">
              Simulated transition applied locally — {service.name} is now modelled on {simulatedRoute} at reduced throughput. No production change was made.
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[11.5px]">
              <caption className="sr-only">Route comparison for {service.name}</caption>
              <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
                <tr>
                  {["Route", "Transport", "Capacity", "Available capacity", "Latency", "Availability", "Current state", "Risk", "Activation readiness", "Recommended use"].map((h) => (
                    <th key={h} scope="col" className="px-2 py-1.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr
                    key={r.id}
                    className={cn("cursor-pointer border-t border-slate-100 hover:bg-indigo-50/40", simulatedRoute === r.route && "bg-sky-50")}
                    onClick={() => selectNode(r.nodeId)}
                  >
                    <td className="px-2 py-1.5 font-medium text-slate-900">{r.route}</td>
                    <td className="px-2 py-1.5">{r.transport}</td>
                    <td className="px-2 py-1.5">{r.capacity}</td>
                    <td className="px-2 py-1.5">{r.availableCapacity}</td>
                    <td className="px-2 py-1.5">{r.latency}</td>
                    <td className="px-2 py-1.5">{r.availability}</td>
                    <td className="px-2 py-1.5">{r.currentState}</td>
                    <td className="px-2 py-1.5"><Chip label={r.risk} className={riskChipClass[r.risk]} /></td>
                    <td className="px-2 py-1.5">{r.readiness} · {r.activationTime}</td>
                    <td className="px-2 py-1.5">{r.recommendedUse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10.5px] text-slate-500">Route validation, owners, and policy status are synthetic. Last validation times shown in the object drawer.</p>
        </Panel>
      </div>

      {/* 7 — Ownership and partners */}
      <Panel title="Ownership and Partner Relationships" subtitle="Shared responsibility across the service chain">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-[11.5px]">
            <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
              <tr>
                {["Scope", "Object owner", "Operational owner", "Incident owner", "Escalation owner", "Change approver", "Field support", "Responsibility gap"].map((h) => (
                  <th key={h} scope="col" className="px-2 py-1.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ownershipMatrix.map((r) => (
                <tr key={r.scope} className={cn("border-t border-slate-100", r.gap !== "None" && "bg-rose-50/60")}>
                  <td className="px-2 py-1.5 font-medium text-slate-900">{r.scope}</td>
                  <td className="px-2 py-1.5">{r.objectOwner}</td>
                  <td className="px-2 py-1.5">{r.operationalOwner}</td>
                  <td className="px-2 py-1.5">{r.incidentOwner}</td>
                  <td className={cn("px-2 py-1.5", r.escalationOwner === "Not assigned" && "font-semibold text-rose-700")}>{r.escalationOwner}</td>
                  <td className="px-2 py-1.5">{r.changeApprover}</td>
                  <td className="px-2 py-1.5">{r.fieldSupport}</td>
                  <td className="px-2 py-1.5">{r.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] font-medium text-rose-800">
          Operational risk — Upstream fiber handoff escalation owner is not assigned for California DCI Link 012
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {partners.map((p) => (
            <button key={p.id} type="button" onClick={() => selectNode("t-partner")} className="rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-indigo-300">
              <div className="text-[12px] font-semibold text-slate-900">{p.name}</div>
              <div className="text-[10.5px] text-slate-500">{p.type}</div>
              <dl className="mt-1.5 space-y-0.5 text-[10.5px] text-slate-600">
                <div>Regions: {p.regions}</div>
                <div>Components: {p.components}</div>
                <div>Services: {p.services}</div>
                <div>Incidents: {p.incidents}</div>
                <div>Field work: {p.fieldWork}</div>
                <div>Performance: {p.performance}</div>
                <div>Escalation: {p.escalation}</div>
                <div>Shared responsibility: {p.sharedResponsibility}</div>
              </dl>
            </button>
          ))}
        </div>
      </Panel>

      {/* 8 — Risk and change overlays */}
      <Panel
        title="Topology Risk and Change Overlays"
        subtitle="Select an overlay item to highlight the affected topology objects"
        action={<Select label="Overlay category" value={overlayCategory} options={["All overlays", ...OVERLAY_CATEGORIES]} onChange={setOverlayCategory} />}
      >
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {filteredOverlays.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                aria-pressed={activeOverlay === o.id}
                onClick={() => applyOverlay(o.id)}
                className={cn("w-full rounded-lg border bg-white p-3 text-left shadow-sm hover:border-indigo-300", activeOverlay === o.id ? "border-indigo-500 ring-1 ring-indigo-200" : "border-slate-200")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-slate-500">{o.category}</span>
                  <Chip label={o.severity} className={riskChipClass[o.severity]} />
                </div>
                <div className="mt-1 text-[12px] font-semibold text-slate-900">{o.title}</div>
                <div className="text-[10.5px] text-slate-600">{o.detail}</div>
                <div className="text-[10.5px] text-slate-500">{o.region}</div>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      {/* 9 — Agentic topology intelligence */}
      <Panel title="Agentic Topology Intelligence" subtitle="Digital coworkers analysing the service chain">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {topologyInsights.map((i) => (
            <article key={i.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
                <span className="text-[11.5px] font-semibold text-slate-900">{i.agent}</span>
              </div>
              <p className="mt-1 text-[11.5px] text-slate-700">{i.insight}</p>
              <dl className="mt-1.5 space-y-0.5 text-[10.5px] text-slate-600">
                <div>Confidence: {i.confidence}%</div>
                <div>Evidence records: {i.evidenceCount}</div>
                <div>Objects analyzed: {i.objectsAnalyzed}</div>
                <div>Customer impact: {i.customerImpact}</div>
                <div>Recommended action: {i.recommendedAction}</div>
                <div>Policy: {i.policyStatus}</div>
              </dl>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <ToolbarButton onClick={() => setHighlight(new Set(i.highlight))}>Highlight affected topology</ToolbarButton>
                <ToolbarButton onClick={() => i.highlight[0] && selectNode(i.highlight[0])}>Explain relationship</ToolbarButton>
                <ToolbarButton onClick={() => setBlast(blastRadius(i.highlight[0] ?? "t-optical", service, graph))}>Analyze blast radius</ToolbarButton>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      {/* 10 — Scenario */}
      <Panel
        title="Run End to End Dependency Scenario"
        subtitle="Synthetic California upstream fiber handoff failure with healthy optical terminals"
        action={
          <div className="flex flex-wrap gap-1.5">
            <ToolbarButton onClick={startScenario} active={scenarioActive}><Play className="h-3.5 w-3.5" /> Start</ToolbarButton>
            <ToolbarButton onClick={() => setScenarioRunning(false)}><Pause className="h-3.5 w-3.5" /> Pause</ToolbarButton>
            <ToolbarButton onClick={() => { setScenarioActive(true); setScenarioRunning(true); }}>Continue</ToolbarButton>
            <ToolbarButton onClick={() => setStep((s) => Math.min(dependencyScenario.length - 1, s + 1))}><SkipForward className="h-3.5 w-3.5" /> Skip to next stage</ToolbarButton>
            <ToolbarButton onClick={() => { setSimulatedRoute("Alternate fiber route"); setHighlight(new Set(["t-fiber-backup"])); }}>Simulate alternate route</ToolbarButton>
            <ToolbarButton onClick={resetScenario}><RotateCcw className="h-3.5 w-3.5" /> Reset</ToolbarButton>
          </div>
        }
      >
        {blockedByApproval && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-900" role="status">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Human approval required before the simulated traffic transition.
            <ToolbarButton onClick={() => { setApproved(true); setScenarioRunning(true); }}>Approve transition</ToolbarButton>
          </div>
        )}
        <ol className="space-y-1.5">
          {dependencyScenario.map((s, i) => {
            const state = !scenarioActive ? "pending" : i < step ? "done" : i === step ? "current" : "pending";
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => { setScenarioActive(true); setStep(i); }}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-[11.5px]",
                    state === "current" ? "border-indigo-500 bg-indigo-50" : state === "done" ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white",
                  )}
                >
                  {state === "done" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <span className="mt-0.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-slate-300 text-[8px] text-slate-500">{i + 1}</span>}
                  <span className="min-w-0">
                    <span className="font-medium text-slate-900">{s.label}</span>
                    <span className="block text-slate-600">{s.detail}</span>
                    <span className="block text-slate-500">{s.actor} · {s.outcome}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[11.5px]">
            <caption className="mb-1 text-left text-[11px] font-medium text-slate-700">Manual investigation compared with agentic investigation</caption>
            <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
              <tr><th scope="col" className="px-2 py-1.5 font-medium">Measure</th><th scope="col" className="px-2 py-1.5 font-medium">Manual</th><th scope="col" className="px-2 py-1.5 font-medium">Agentic</th></tr>
            </thead>
            <tbody>
              {manualVersusAgentic.map((m) => (
                <tr key={m.measure} className="border-t border-slate-100">
                  <td className="px-2 py-1.5 text-slate-900">{m.measure}</td>
                  <td className="px-2 py-1.5 text-slate-600">{m.manual}</td>
                  <td className="px-2 py-1.5 font-medium text-emerald-700">{m.agentic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 11 — Relationship explorer */}
      <Panel
        title="Topology Relationships"
        subtitle={`${rows.length} relationships in scope`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <input aria-label="Search relationships" placeholder="Search relationships" value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} className="w-40 border-0 p-0 text-[11.5px] focus:outline-none" />
            </label>
            <Select label="Group by" value={groupBy} options={["No grouping", "Relationship", "Object type", "Owner", "Risk", "Customer"]} onChange={setGroupBy} />
            <Select label="Sort by" value={String(sortKey)} options={["sourceLabel", "relationship", "targetLabel", "health", "risk", "ownership"]} onChange={(v) => setSortKey(v as keyof RelationshipRow)} />
            <ToolbarButton onClick={exportRelationships}><Download className="h-3.5 w-3.5" /> Export</ToolbarButton>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-[11.5px]">
            <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
              <tr>
                {["Source object", "Source type", "Relationship", "Target object", "Target type", "Health", "Ownership", "Customer impact", "Risk", "Last validated", "Evidence", "Agent activity"].map((h) => (
                  <th key={h} scope="col" className="px-2 py-1.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            {grouped.map(([group, groupRows]) => (
              <tbody key={group}>
                {groupBy !== "No grouping" && (
                  <tr className="bg-slate-100/70"><th colSpan={12} scope="colgroup" className="px-2 py-1 text-left text-[10.5px] font-semibold text-slate-700">{group} — {groupRows.length}</th></tr>
                )}
                {groupRows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => selectEdge(r.edgeId)}
                    className={cn("cursor-pointer border-t border-slate-100 hover:bg-indigo-50/40", selectedEdgeId === r.edgeId && "bg-indigo-50")}
                  >
                    <td className="px-2 py-1.5 font-medium text-slate-900">{r.sourceLabel}</td>
                    <td className="px-2 py-1.5">{r.sourceType}</td>
                    <td className="px-2 py-1.5">{r.relationship}</td>
                    <td className="px-2 py-1.5 font-medium text-slate-900">{r.targetLabel}</td>
                    <td className="px-2 py-1.5">{r.targetType}</td>
                    <td className="px-2 py-1.5"><Chip label={`${healthGlyph[r.health]} ${r.health}`} className={healthChip[r.health]} /></td>
                    <td className="px-2 py-1.5">{r.ownership}</td>
                    <td className="px-2 py-1.5">{r.customerImpact}</td>
                    <td className="px-2 py-1.5"><Chip label={r.risk} className={riskChipClass[r.risk]} /></td>
                    <td className="px-2 py-1.5">{r.lastValidated}</td>
                    <td className="px-2 py-1.5">{r.evidence}</td>
                    <td className="px-2 py-1.5">{r.agentActivity}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        {rows.length === 0 && <p className="mt-3 text-center text-[12px] text-slate-500">No relationships match the current filters.</p>}
      </Panel>

      {/* 12 — Activity timeline */}
      <Panel title="Topology Activity" subtitle="Select an event to highlight the relevant topology objects">
        <ol className="space-y-1.5">
          {topologyEvents.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => setHighlight(new Set(e.highlight))} className="flex w-full flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-[11.5px] hover:border-indigo-300">
                <span className="font-mono text-[10.5px] text-slate-500">{e.at}</span>
                <span className="font-medium text-slate-900">{e.event}</span>
                <span className="text-slate-600">{e.actor}</span>
                <span className="text-slate-600">{e.affectedObject}</span>
                <span className="text-slate-500">{e.relationship}</span>
                <span className="text-slate-600">{e.outcome}</span>
                <span className="ml-auto"><Chip label={e.status} className={e.status === "Complete" ? healthChip.Healthy : e.status === "Awaiting approval" ? healthChip["At risk"] : healthChip["On fallback"]} /></span>
              </button>
            </li>
          ))}
        </ol>
      </Panel>

      {/* Detail drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {selectedNode && (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{selectedNode.kind}</div>
                <h2 className="text-lg font-semibold text-slate-900">{selectedNode.label}</h2>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Chip label={`${healthGlyph[healthOverrides[selectedNode.id] ?? selectedNode.health]} ${healthOverrides[selectedNode.id] ?? selectedNode.health}`} className={healthChip[healthOverrides[selectedNode.id] ?? selectedNode.health]} />
                  <Chip label={selectedNode.risk} className={riskChipClass[selectedNode.risk]} />
                  <Chip label={selectedNode.owner} className="border-slate-200 bg-slate-50 text-slate-700" />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="State" value={selectedNode.state} />
                <Field label="Capacity" value={selectedNode.capacity} />
                <Field label="Throughput" value={selectedNode.throughput} />
                <Field label="Latency" value={selectedNode.latency} />
                <Field label="Region" value={selectedNode.region} />
                <Field label="Site" value={selectedNode.site ?? "Not applicable"} />
                <Field label="Data freshness" value={selectedNode.freshness} />
                <Field label="Agent activity" value={selectedNode.agentActivity} />
                <Field label="Customer impact" value={selectedNode.customerImpact} />
                <Field label="Partner" value={selectedNode.partner ?? "Not applicable"} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedNode.detail.map(([k, v]) => <Field key={k} label={k} value={v} />)}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <ToolbarButton onClick={() => setBlast(blastRadius(selectedNode.id, service, graph))}>Analyze blast radius</ToolbarButton>
                <ToolbarButton onClick={() => setExpanded((s) => new Set([...s, ...neighborsOf(selectedNode.id, "both")]))}>Expand neighbors</ToolbarButton>
                <ToolbarButton onClick={() => setDirection("Upstream")}>Show upstream</ToolbarButton>
                <ToolbarButton onClick={() => setDirection("Downstream")}>Show downstream</ToolbarButton>
              </div>
            </div>
          )}
          {selectedEdge && (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Relationship</div>
                <h2 className="text-lg font-semibold text-slate-900">{selectedEdge.relationship}</h2>
                <p className="text-[12px] text-slate-600">
                  {graph.nodes.find((n) => n.id === selectedEdge.from)?.label} → {graph.nodes.find((n) => n.id === selectedEdge.to)?.label}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Health" value={selectedEdge.health} />
                <Field label="Risk" value={selectedEdge.risk} />
                <Field label="Owner" value={selectedEdge.owner} />
                <Field label="Capacity" value={selectedEdge.capacity} />
                <Field label="Throughput" value={selectedEdge.throughput} />
                <Field label="Latency" value={selectedEdge.latency} />
                <Field label="State" value={selectedEdge.state} />
                <Field label="Last validated" value={selectedEdge.lastValidated} />
                <Field label="Evidence" value={selectedEdge.evidence} />
                <Field label="Agent activity" value={selectedEdge.agentActivity} />
                <Field label="Customer impact" value={selectedEdge.customerImpact} />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
