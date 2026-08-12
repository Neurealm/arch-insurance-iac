import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, CircleUser, Database, Download, Filter, Gauge, HelpCircle, Layers, MoreHorizontal,
  Play, Plug, RefreshCw, Search, SlidersHorizontal, Network, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { KpiCard } from "./command-center/panels";
import {
  ConnectorAlertDrawer, ConnectorHealthPanel, CoveragePanel, DiscoveryInsightsPanel,
  DiscoveryTopologyPanel, InsightDrawer, KnowledgeDomainPanel, KnowledgeReadinessPanel,
  RecentActivityPanel, WorkflowStageDrawer, WorkflowStatusPanel,
} from "./source-discovery/panels";
import { SourceDetailDrawer, SourceInventoryPanel } from "./source-discovery/inventory";
import { ExportInventoryDialog, RunDiscoveryDialog, type DiscoveryResult } from "./source-discovery/dialogs";
import {
  activeFilterCount, defaultFilters, demoScenarios, discoveryActivity, discoveryInsights,
  filterOptions, kpiTrends, notificationSeed, resolveSources, scenarioSnapshots, searchCatalog,
  type ConnectorAlert, type DemoScenario, type DiscoveryActivity, type DiscoveryInsight,
  type EnterpriseSource, type Filters, type SourceCategory, type ViewMode, type WorkflowStage,
} from "./source-discovery/data";

const VIEW_LABEL: Record<ViewMode, string> = {
  executive: "Executive View",
  operations: "Operations View",
  architecture: "Architecture View",
};

const STORY = [
  { target: "kpi-sources", caption: "The Fabric begins by identifying the approved systems where organizational knowledge lives.", notes: "Registered sources and connectors define the governed discovery boundary." },
  { target: "panel-topology", caption: "Documents, tickets, conversations, meetings, code, APIs, and telemetry are mapped into a single discovery model.", notes: "Every category flows into one discovery and inventory engine." },
  { target: "panel-inventory", caption: "Each source is registered with ownership, access, freshness, coverage, and operational health.", notes: "The inventory is the system of record for discovered enterprise sources." },
  { target: "panel-coverage", caption: "The platform identifies gaps, degraded connectors, restricted content, and incomplete organizational visibility.", notes: "Meetings and APIs are the current coverage gaps." },
  { target: "panel-workflow", caption: "Sources are authenticated, inventoried, classified, access validated, and prepared for ingestion.", notes: "Access validation runs before anything is queued." },
  { target: "panel-readiness", caption: "Qualified artifacts are handed to the next stage, where they will be normalized and decomposed into reusable business conditions.", notes: "Readiness is the handoff contract into ingestion." },
];

const PREF_KEY = "ecf.sourceDiscovery.prefs";

function loadPrefs(): { view: ViewMode; filters: Filters } {
  if (typeof window === "undefined") return { view: "executive", filters: defaultFilters };
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return { view: "executive", filters: defaultFilters };
    const parsed = JSON.parse(raw) as { view?: ViewMode; filters?: Partial<Filters> };
    return { view: parsed.view ?? "executive", filters: { ...defaultFilters, ...(parsed.filters ?? {}) } };
  } catch {
    return { view: "executive", filters: defaultFilters };
  }
}

const nowLabel = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function EnterpriseSourceDiscovery() {
  const navigate = useNavigate();
  const initial = useRef(loadPrefs());
  const [view, setView] = useState<ViewMode>(initial.current.view);
  const [filters, setFilters] = useState<Filters>(initial.current.filters);
  const [draftFilters, setDraftFilters] = useState<Filters>(initial.current.filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(nowLabel);
  const [scenario, setScenario] = useState<DemoScenario>("healthy");
  const [category, setCategory] = useState<SourceCategory | null>(null);
  const [domain, setDomain] = useState<string | null>(null);
  const [runOpen, setRunOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationSeed);
  const [notifFilter, setNotifFilter] = useState("All");
  const [storyStep, setStoryStep] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [source, setSource] = useState<EnterpriseSource | null>(null);
  const [stage, setStage] = useState<WorkflowStage | null>(null);
  const [alert, setAlert] = useState<ConnectorAlert | null>(null);
  const [insight, setInsight] = useState<DiscoveryInsight | null>(null);
  const [kpiDrawer, setKpiDrawer] = useState<"sources" | "artifacts" | null>(null);
  const [engineOpen, setEngineOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<DiscoveryResult | null>(null);

  useEffect(() => {
    window.localStorage.setItem(PREF_KEY, JSON.stringify({ view, filters }));
  }, [view, filters]);

  const snapshot = scenarioSnapshots[scenario];

  const effectiveFilters = useMemo<Filters>(
    () => ({
      ...filters,
      sourceCategory: category ?? filters.sourceCategory,
      knowledgeDomain: domain ?? filters.knowledgeDomain,
    }),
    [filters, category, domain],
  );

  const sources = useMemo(() => resolveSources(scenario, effectiveFilters), [scenario, effectiveFilters]);
  const allSources = useMemo(() => resolveSources(scenario, defaultFilters), [scenario]);

  const filterRatio = allSources.length ? sources.length / allSources.length : 1;
  const kpis = useMemo(() => {
    const scale = (n: number) => Math.max(1, Math.round(n * (0.55 + 0.45 * filterRatio)));
    return {
      registeredSources: scale(snapshot.registeredSources),
      connectors: scale(snapshot.activeConnectors),
      artifacts: snapshot.artifactsLabel,
      domains: domain ? 1 : snapshot.domains,
      coverage: snapshot.coverage,
    };
  }, [snapshot, filterRatio, domain]);

  const readiness = runResult
    ? { ...snapshot.readiness, readySources: runResult.ready, restrictedSources: runResult.restricted }
    : snapshot.readiness;

  const activity = useMemo(() => {
    const merged = [...snapshot.extraActivity, ...discoveryActivity];
    return category ? merged.filter((a) => a.category === category) : merged;
  }, [snapshot, category]);

  const coverageOverrides = useMemo<Partial<Record<SourceCategory, number>>>(
    () => (scenario === "meeting-coverage-gap" ? { Meetings: 58 } : scenario === "connector-degradation" ? { Documents: 79, APIs: 68 } : {}),
    [scenario],
  );

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setAnnounce("Refreshing source discovery data");
    window.setTimeout(() => {
      setLoading(false);
      setUpdatedAt(nowLabel());
      setAnnounce("Source discovery refreshed");
      toast.success("Source discovery refreshed.");
    }, 800);
  }, []);

  const spotlight = storyStep !== null ? STORY[storyStep].target : null;
  useEffect(() => {
    if (spotlight) scrollTo(spotlight);
  }, [spotlight, scrollTo]);

  useEffect(() => {
    if (storyStep === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStoryStep(null);
      if (e.key === "ArrowRight") setStoryStep((s) => (s === null ? s : Math.min(STORY.length - 1, s + 1)));
      if (e.key === "ArrowLeft") setStoryStep((s) => (s === null ? s : Math.max(0, s - 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storyStep]);

  const applyScenario = (s: DemoScenario) => {
    setScenario(s);
    setRunResult(null);
    const label = demoScenarios.find((d) => d.id === s)?.label ?? s;
    setAnnounce(`${label} scenario applied`);
    if (s === "healthy") toast.success(`${label} applied`);
    else toast.warning(`${label} applied`);
  };

  const unread = notifications.filter((n) => !n.read).length;
  const notifTypes = ["All", ...Array.from(new Set(notificationSeed.map((n) => n.type)))];
  const filterCount = activeFilterCount(filters);
  const degradedPanels = snapshot.degradedPanels;

  return (
    <div className="min-h-full bg-slate-50">
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-3 px-5 py-3">
          <div className="flex items-start gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Toggle filters" onClick={() => setFiltersOpen((o) => !o)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
                <span aria-hidden>/</span>
                <span>Discovery</span>
                <span aria-hidden>/</span>
                <span className="font-medium text-slate-700">Enterprise Source Discovery</span>
              </nav>
              <h1 className="text-[19px] font-bold leading-tight text-slate-900">Enterprise Source Discovery</h1>
              <p className="text-[12px] text-slate-500">Discover and inventory where organizational knowledge lives across the enterprise</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Global search" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label={`Notifications, ${unread} unread`} onClick={() => setNotifOpen(true)}>
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">{unread}</span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Help" onClick={() => toast.info("Source discovery identifies where organizational knowledge lives before ingestion.")}>
              <HelpCircle className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-[10.5px] font-semibold text-white">AV</span>
                  <span className="hidden sm:block leading-tight">
                    <span className="block text-[11.5px] font-medium text-slate-900">Alex Valencia</span>
                    <span className="block text-[10px] text-slate-500">Chief Architect</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-[12px]">Alex Valencia · Chief Architect</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[12px]" onSelect={() => toast.info("Profile")}><CircleUser className="mr-2 h-3.5 w-3.5" /> Profile</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onSelect={() => navigate("/enterprise-cognitive-fabric")}>Return to module</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
              <span className={cn("h-1.5 w-1.5 rounded-full", snapshot.banner ? "bg-amber-500" : "bg-emerald-500")} aria-hidden />
              {snapshot.banner ? "Degraded — partial data" : "All Systems Operational"}
            </span>
            <span className="text-[11px] text-slate-500">Last Updated: {updatedAt}</span>
            {filterCount > 0 && <span className="text-[11px] font-medium text-blue-700">{filterCount} active filters</span>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={view} onValueChange={(v) => { setView(v as ViewMode); setAnnounce(`${VIEW_LABEL[v as ViewMode]} selected`); }}>
              <SelectTrigger className="h-8 w-[168px] text-[12px]" aria-label="Page view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(VIEW_LABEL) as ViewMode[]).map((v) => (
                  <SelectItem key={v} value={v} className="text-[12px]">{VIEW_LABEL[v]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={refresh}>
              <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin motion-reduce:animate-none")} aria-hidden /> Refresh
            </Button>
            <Button size="sm" className="h-8 text-[12px]" onClick={() => setRunOpen(true)}>
              <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Run Discovery
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setExportOpen(true)}>
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Export Inventory
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuItem className="text-[12px]" onSelect={() => setStoryStep(0)}>
                  <Play className="mr-2 h-3.5 w-3.5" /> Demo Story
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px] text-slate-500">Demo scenarios</DropdownMenuLabel>
                {demoScenarios.map((s) => (
                  <DropdownMenuItem key={s.id} className="text-[12px]" onSelect={() => applyScenario(s.id)}>{s.label}</DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  className="text-[12px]"
                  onSelect={() => { setScenario("healthy"); setFilters(defaultFilters); setDraftFilters(defaultFilters); setCategory(null); setDomain(null); setRunResult(null); toast.success("Demo data reset"); }}
                >
                  Reset Demo Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {filtersOpen && (
          <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-2" role="group" aria-label="Discovery filters">
            <span className="inline-flex items-center gap-1 pb-1 text-[11px] font-medium text-slate-600">
              <Filter className="h-3.5 w-3.5" aria-hidden /> Filters
            </span>
            <FilterSelect label="Business Unit" value={draftFilters.businessUnit} options={filterOptions.businessUnit} onChange={(v) => setDraftFilters({ ...draftFilters, businessUnit: v })} />
            <FilterSelect label="Team" value={draftFilters.team} options={filterOptions.team} onChange={(v) => setDraftFilters({ ...draftFilters, team: v })} />
            <FilterSelect label="Knowledge Domain" value={draftFilters.knowledgeDomain} options={filterOptions.knowledgeDomain} onChange={(v) => setDraftFilters({ ...draftFilters, knowledgeDomain: v })} />
            <FilterSelect label="Source Category" value={draftFilters.sourceCategory} options={filterOptions.sourceCategory} onChange={(v) => setDraftFilters({ ...draftFilters, sourceCategory: v })} />
            <FilterSelect label="Platform" value={draftFilters.platform} options={filterOptions.platform} onChange={(v) => setDraftFilters({ ...draftFilters, platform: v })} />
            <FilterSelect label="Connector Status" value={draftFilters.connectorStatus} options={filterOptions.connectorStatus} onChange={(v) => setDraftFilters({ ...draftFilters, connectorStatus: v })} />
            <FilterSelect label="Access Classification" value={draftFilters.accessClassification} options={filterOptions.accessClassification} onChange={(v) => setDraftFilters({ ...draftFilters, accessClassification: v })} />
            <FilterSelect label="Discovery Mode" value={draftFilters.discoveryMode} options={filterOptions.discoveryMode} onChange={(v) => setDraftFilters({ ...draftFilters, discoveryMode: v })} />
            <FilterSelect label="Environment" value={draftFilters.environment} options={filterOptions.environment} onChange={(v) => setDraftFilters({ ...draftFilters, environment: v })} />
            <FilterSelect label="Date Range" value={draftFilters.dateRange} options={filterOptions.dateRange} onChange={(v) => setDraftFilters({ ...draftFilters, dateRange: v })} />
            <div className="flex items-center gap-1.5 pb-0.5">
              <Button size="sm" className="h-7 text-[11px]" onClick={() => { setFilters(draftFilters); setAnnounce("Filters applied"); toast.success("Filters applied"); }}>Apply Filters</Button>
              <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => { setDraftFilters(defaultFilters); setFilters(defaultFilters); setCategory(null); setDomain(null); setAnnounce("Filters cleared"); }}>Clear Filters</Button>
              <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => toast.success("View saved to your preferences")}>Save View</Button>
            </div>
          </div>
        )}
      </header>

      {snapshot.banner && (
        <div className="mx-5 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800" role="status">
          {snapshot.banner}
        </div>
      )}

      <div className="max-w-[1720px] space-y-4 px-5 py-4">
        {/* KPI row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div id="kpi-sources">
            <KpiCard
              label="Registered Sources" value={String(kpis.registeredSources)} change="+8 this month"
              icon={Database} trend={kpiTrends.sources} color="#2563eb" loading={loading} spotlight={spotlight === "kpi-sources"}
              tooltip="Approved enterprise sources registered in the source registry."
              onClick={() => setKpiDrawer("sources")}
            />
          </div>
          <KpiCard
            label="Active Connectors" value={String(kpis.connectors)}
            change={`${snapshot.healthyConnectors} Healthy · ${snapshot.warningConnectors} Warning · ${snapshot.degradedConnectors} Degraded`}
            icon={Plug} trend={kpiTrends.connectors} color="#7c3aed" loading={loading}
            tooltip="Connectors currently collecting from approved enterprise sources."
            onClick={() => scrollTo("panel-connectors")}
          />
          <KpiCard
            label="Artifacts Discovered" value={kpis.artifacts} change={snapshot.artifactsChange}
            icon={Layers} trend={kpiTrends.artifacts} color="#0ea5e9" loading={loading}
            tooltip="Artifacts discovered across all approved sources in the selected window."
            onClick={() => setKpiDrawer("artifacts")}
          />
          <KpiCard
            label="Knowledge Domains" value={String(kpis.domains)} change="Cross-functional coverage 87%"
            icon={Network} trend={kpiTrends.domains} color="#f59e0b" loading={loading}
            tooltip="Distinct knowledge domains represented across discovered sources."
            onClick={() => scrollTo("panel-domains")}
          />
          <KpiCard
            label="Discovery Coverage" value={`${kpis.coverage}%`} status={snapshot.coverageStatus}
            icon={Gauge} trend={kpiTrends.coverage} color="#16a34a" loading={loading}
            tooltip="Share of known organizational knowledge currently within discovery scope."
            onClick={() => scrollTo("panel-coverage")}
          />
        </div>

        {/* Topology + inventory */}
        <div className="grid grid-cols-1 gap-3">
          <DiscoveryTopologyPanel
            activeCategory={category}
            onSelectCategory={(c) => { setCategory(c); setAnnounce(c ? `${c} category selected` : "Category filter cleared"); }}
            onSelectPlatform={(p) => toast.info(`${p} connector detail`)}
            onOpenEngine={() => setEngineOpen(true)}
            onOpenOutput={(id) => setOutputOpen(id)}
            loading={loading}
            spotlight={spotlight === "panel-topology"}
          />
          <SourceInventoryPanel
            sources={sources}
            onOpenSource={setSource}
            loading={loading}
            degraded={degradedPanels.inventory ?? null}
            spotlight={spotlight === "panel-inventory"}
            onExport={() => setExportOpen(true)}
          />
        </div>

        {/* Coverage / connectors / domains / workflow */}
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
          <CoveragePanel
            activeCategory={category}
            onSelectCategory={(c) => setCategory(c)}
            loading={loading}
            degraded={degradedPanels.coverage ?? null}
            spotlight={spotlight === "panel-coverage"}
            overrides={coverageOverrides}
          />
          <ConnectorHealthPanel
            counts={{
              total: snapshot.activeConnectors,
              Healthy: snapshot.healthyConnectors,
              Warning: snapshot.warningConnectors,
              Degraded: snapshot.degradedConnectors,
              Unauthorized: 0,
              Paused: 0,
            }}
            onOpenAlert={setAlert}
            onFilterStatus={(s) => { const next = { ...filters, connectorStatus: s === "Unauthorized" || s === "Paused" ? "All" : s }; setFilters(next); setDraftFilters(next); }}
            loading={loading}
            degraded={degradedPanels.connectors ?? null}
            spotlight={spotlight === "panel-connectors"}
          />
          <KnowledgeDomainPanel
            activeDomain={domain}
            onSelectDomain={(d) => setDomain(domain === d ? null : d)}
            loading={loading}
            onViewAll={() => toast.info("All knowledge domains")}
          />
          <WorkflowStatusPanel
            onOpenStage={setStage}
            loading={loading}
            degraded={degradedPanels.workflow ?? null}
            spotlight={spotlight === "panel-workflow"}
          />
        </div>

        {/* Activity / insights / readiness */}
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[30fr_34fr_36fr]">
          <RecentActivityPanel
            activity={activity}
            loading={loading}
            onOpenActivity={(a: DiscoveryActivity) => {
              const match = sources.find((s) => s.id === a.sourceId) ?? null;
              if (match) setSource(match);
              else toast.info(a.description);
            }}
          />
          <DiscoveryInsightsPanel insights={discoveryInsights} loading={loading} onOpenInsight={setInsight} />
          <KnowledgeReadinessPanel
            readiness={readiness}
            loading={loading}
            spotlight={spotlight === "panel-readiness"}
            onProceed={() => navigate("/enterprise-cognitive-fabric/discovery/ingestion-normalization")}
          />
        </div>

        <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[12px] text-blue-900">
          Discovery identifies where organizational knowledge lives so the Fabric can continuously understand how the enterprise actually operates.
        </p>
      </div>

      {/* Demo story */}
      {storyStep !== null && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4">
          <div className="pointer-events-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl" role="dialog" aria-label="Demo story">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-blue-600">
                  Demo Story · Step {storyStep + 1} of {STORY.length}
                </div>
                <p className="mt-1 text-[13px] text-slate-800">{STORY[storyStep].caption}</p>
                {showNotes && <p className="mt-1.5 text-[11.5px] text-slate-500">Presenter note: {STORY[storyStep].notes}</p>}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Exit story" onClick={() => setStoryStep(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={((storyStep + 1) / STORY.length) * 100} className="mt-3 h-1.5" />
            <div className="mt-3 flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setShowNotes((s) => !s)}>
                {showNotes ? "Hide presenter notes" : "Presenter notes"}
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled={storyStep === 0} onClick={() => setStoryStep((s) => Math.max(0, (s ?? 0) - 1))}>Previous</Button>
                <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setStoryStep(null)}>Exit Story</Button>
                <Button size="sm" className="h-7 text-[11px]" disabled={storyStep === STORY.length - 1} onClick={() => setStoryStep((s) => Math.min(STORY.length - 1, (s ?? 0) + 1))}>Next</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs and drawers */}
      <RunDiscoveryDialog
        open={runOpen}
        onOpenChange={setRunOpen}
        onComplete={(r) => setRunResult(r)}
        onProceed={() => { setRunOpen(false); navigate("/enterprise-cognitive-fabric/discovery/ingestion-normalization"); }}
      />
      <ExportInventoryDialog open={exportOpen} onOpenChange={setExportOpen} sources={sources} />
      <SourceDetailDrawer source={source} onOpenChange={(v) => !v && setSource(null)} onViewArtifacts={() => toast.info("Opening artifact browser")} />
      <WorkflowStageDrawer stage={stage} onOpenChange={(v) => !v && setStage(null)} />
      <ConnectorAlertDrawer alert={alert} onOpenChange={(v) => !v && setAlert(null)} />
      <InsightDrawer
        insight={insight}
        onOpenChange={(v) => !v && setInsight(null)}
        onOpenRelated={() => { setInsight(null); setSource(sources[0] ?? null); }}
      />

      {/* KPI drawers */}
      <Sheet open={kpiDrawer !== null} onOpenChange={(v) => !v && setKpiDrawer(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-[15px]">{kpiDrawer === "artifacts" ? "Artifacts Discovered" : "Registered Sources"}</SheetTitle>
          </SheetHeader>
          <ul className="mt-4 space-y-2 text-[12px]">
            {allSources.map((s) => (
              <li key={s.id} className="rounded-md border border-slate-200 p-2">
                <div className="font-medium text-slate-900">{s.name}</div>
                <div className="text-[11px] text-slate-500">
                  {kpiDrawer === "artifacts"
                    ? `${s.category} · ${s.knowledgeDomains.join(", ")} · ${s.freshness} · ${s.accessClassification} · ${s.artifactCount.toLocaleString("en-US")} artifacts`
                    : `${s.category} · ${s.platform} · ${s.businessOwner} · ${s.status}`}
                </div>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      {/* Engine / output drawers */}
      <Sheet open={engineOpen} onOpenChange={setEngineOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-[15px]">Discovery &amp; Inventory Engine</SheetTitle>
          </SheetHeader>
          <p className="mt-3 text-[12.5px] text-slate-700">
            The engine authenticates each approved source, inventories artifacts, classifies them, validates access, and
            registers qualified records before queueing them for ingestion.
          </p>
          <ul className="mt-3 space-y-1 text-[12px] text-slate-700">
            <li>Cycle cadence: continuous with 5-minute incremental sweeps</li>
            <li>Sources in scope: {allSources.length} seeded, {snapshot.registeredSources} registered</li>
            <li>Current throughput: 12.4K artifacts per minute</li>
            <li>Access validation: enforced before registration</li>
          </ul>
        </SheetContent>
      </Sheet>

      <Sheet open={outputOpen !== null} onOpenChange={(v) => !v && setOutputOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-[15px]">{outputOpen?.replace(/-/g, " ") ?? "Output"}</SheetTitle>
          </SheetHeader>
          <p className="mt-3 text-[12.5px] text-slate-700">
            Operational detail for this downstream store, including current volume, owners, and the connectors feeding it.
          </p>
          <div className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <div>Records: {(snapshot.registeredSources * 137).toLocaleString("en-US")}</div>
            <div>Owner: Platform Enablement</div>
            <div>Last write: {updatedAt}</div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Global search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search sources, platforms, owners, domains, connectors, access policies…" />
        <CommandList>
          <CommandEmpty>No matching discovery records.</CommandEmpty>
          {Array.from(new Set(searchCatalog.map((s) => s.type))).map((type) => (
            <CommandGroup key={type} heading={type}>
              {searchCatalog.filter((s) => s.type === type).map((s) => (
                <CommandItem
                  key={s.id}
                  value={`${s.type} ${s.name} ${s.platform} ${s.owner}`}
                  onSelect={() => {
                    setSearchOpen(false);
                    const match = allSources.find((x) => x.id === s.sourceId);
                    if (match) setSource(match);
                    else scrollTo("panel-domains");
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium text-slate-900">{s.name}</div>
                    <div className="truncate text-[11px] text-slate-500">{s.platform} · {s.owner} · {s.status}</div>
                    <div className="text-[10px] text-slate-400">Coverage {s.coverage} · Last sync {s.lastSync}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>

      {/* Notifications */}
      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-[15px]">Notifications</SheetTitle>
          </SheetHeader>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {notifTypes.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={notifFilter === t}
                onClick={() => setNotifFilter(t)}
                className={cn("rounded-md border px-2 py-0.5 text-[11px]", notifFilter === t ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}
              >
                {t}
              </button>
            ))}
            <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}>
              Mark All Read
            </Button>
          </div>
          <ul className="mt-3 space-y-1.5">
            {notifications.filter((n) => notifFilter === "All" || n.type === notifFilter).map((n) => (
              <li key={n.id} className={cn("rounded-md border p-2", n.read ? "border-slate-200" : "border-blue-200 bg-blue-50/60")}>
                <div className="text-[12px] text-slate-800">{n.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10.5px] text-slate-500">
                  <span>{n.type}</span><span>·</span><span>{n.time}</span>
                </div>
                <div className="mt-1.5 flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => setNotifications((cur) => cur.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>Mark Read</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => { setNotifOpen(false); scrollTo("panel-connectors"); }}>Open Item</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => toast.success("Assigned")}>Assign</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => toast.success("Acknowledged")}>Acknowledge</Button>
                </div>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[9.5px] uppercase tracking-wide text-slate-500">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
