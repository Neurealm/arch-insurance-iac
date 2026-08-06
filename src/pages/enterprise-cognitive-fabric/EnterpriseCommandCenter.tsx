import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CircleUser, Database, Download, Filter, HelpCircle, Layers, MoreHorizontal,
  Play, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Users, UserSquare2, Workflow, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CognitiveHealthPanel, CognitiveInsightsPanel, ContextGraphPanel, DiscoveryPipelinesPanel,
  IncomingWorkPanel, KnowledgeDomainsPanel, KpiCard, LearningLoopPanel, MemoryUtilizationPanel,
  Panel, RecentDecisionsPanel, StatusBadge, SystemAlertsPanel,
} from "./panels";
import {
  defaultFilters, filterOptions, kpiTrends, knowledgeDomains, notificationSeed, searchCatalog,
  seedFrom, timeRanges, type DemoState, type Filters, type ViewMode,
} from "./data";

const VIEW_LABEL: Record<ViewMode, string> = {
  executive: "Executive View",
  operations: "Operations View",
  architecture: "Architecture View",
};

const VIEW_SUBTITLE: Record<ViewMode, string> = {
  executive: "Real-time health and operational overview of your Enterprise Cognitive Fabric",
  operations: "Pipeline, queue and processing detail across the Enterprise Cognitive Fabric",
  architecture: "Sources, personas, dependencies and memory structure across the Enterprise Cognitive Fabric",
};

const STORY = [
  { target: "kpi-teams", caption: "The Fabric first learns how teams operate and what they need other teams to consider.", notes: "Onboarding is the entry point: teams, owners and review cadence." },
  { target: "panel-pipelines", caption: "Approved enterprise sources are continuously discovered, normalized, and decomposed into reusable business conditions.", notes: "Only governed sources are connected; scope is explicit per connector." },
  { target: "panel-memory", caption: "Approved evidence, conditions, relationships, and team personas become reusable organizational memory.", notes: "Memory is partitioned so growth and freshness can be governed independently." },
  { target: "panel-incoming", caption: "New work enters the cognitive-intake process before engineering effort begins.", notes: "Intake happens before design and build, not after." },
  { target: "panel-decisions", caption: "Proposed work is evaluated against relevant team personas, dependencies, constraints, and prior outcomes.", notes: "Every decision carries evidence, conflicts and required approvals." },
  { target: "panel-learning", caption: "The platform compares predicted impact with actual results and continuously improves the organizational model.", notes: "The Learn stage closes the loop back into personas and conditions." },
];

const PREF_KEY = "ecf.commandCenter.prefs";

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

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function EnterpriseCommandCenter() {
  const navigate = useNavigate();
  const initial = useRef(loadPrefs());
  const [view, setView] = useState<ViewMode>(initial.current.view);
  const [filters, setFilters] = useState<Filters>(initial.current.filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(nowLabel);
  const [demoState, setDemoState] = useState<DemoState>("healthy");
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationSeed);
  const [notifFilter, setNotifFilter] = useState("All");
  const [storyStep, setStoryStep] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    window.localStorage.setItem(PREF_KEY, JSON.stringify({ view, filters }));
  }, [view, filters]);

  /* deterministic filter-driven values */
  const seed = useMemo(
    () => seedFrom(`${filters.timeRange}|${filters.businessUnit}|${filters.team}|${filters.environment}|${filters.riskLevel}|${filters.status}|${filters.knowledgeDomain}|${domainFilter ?? ""}`),
    [filters, domainFilter],
  );

  const degraded = demoState === "degraded";
  const metrics = useMemo(() => {
    const spread = filters.timeRange === "7 days" ? 0.94 : filters.timeRange === "90 days" ? 1.06 : 1;
    const jitter = 1 + (seed - 0.5) * 0.06;
    const health = Math.round((degraded ? 74 : 92) * (1 + (seed - 0.5) * 0.02));
    return {
      teams: Math.round(48 * spread * jitter),
      personas: Math.round(72 * spread * jitter),
      health,
      jobs: Math.round(23 * spread * jitter),
      memory: Number((4.2 * spread * jitter).toFixed(1)),
    };
  }, [filters.timeRange, seed, degraded]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setAnnounce("Refreshing Command Center data");
    window.setTimeout(() => {
      setLoading(false);
      setUpdatedAt(nowLabel());
      setAnnounce("Command Center refreshed");
      toast.success("Command Center refreshed.");
    }, 900);
  }, []);

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setAnnounce(`Filter ${key} set to ${value}`);
  };

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

  const unread = notifications.filter((n) => !n.read).length;
  const notifTypes = ["All", ...Array.from(new Set(notificationSeed.map((n) => n.type)))];

  const pipelineError = demoState === "discovery-failure" ? null : null;

  return (
    <div className="min-h-full bg-slate-50">
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-3 px-5 py-3">
          <div className="flex items-start gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Toggle filters"
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-[19px] font-bold leading-tight text-slate-900">Enterprise Command Center</h1>
              <p className="text-[12px] text-slate-500 truncate">{VIEW_SUBTITLE[view]}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Global search" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label={`Notifications, ${unread} unread`} onClick={() => setNotifOpen(true)}>
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Help" onClick={() => toast.info("Command Center help opens the module guide.")}>
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

        {/* Page actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
              <span className={cn("h-1.5 w-1.5 rounded-full", degraded ? "bg-amber-500" : "bg-emerald-500")} aria-hidden />
              {degraded ? "Degraded — partial data" : "All Systems Operational"}
            </span>
            <span className="text-[11px] text-slate-500">Last Updated: {updatedAt}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={view} onValueChange={(v) => { setView(v as ViewMode); setAnnounce(`${VIEW_LABEL[v as ViewMode]} selected`); }}>
              <SelectTrigger className="h-8 w-[168px] text-[12px]" aria-label="Dashboard view">
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
            <Button size="sm" className="h-8 text-[12px]" onClick={() => setExportOpen(true)}>
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Export Report
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="text-[12px]" onSelect={() => setStoryStep(0)}>
                  <Play className="mr-2 h-3.5 w-3.5" /> Demo Story
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px] text-slate-500">Demo states</DropdownMenuLabel>
                <DropdownMenuItem className="text-[12px]" onSelect={() => { setDemoState("healthy"); toast.success("Simulating healthy fabric"); }}>Simulate healthy</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onSelect={() => { setDemoState("degraded"); toast.warning("Simulating degraded fabric"); }}>Simulate degraded</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onSelect={() => { setDemoState("discovery-failure"); toast.error("Simulating discovery failure"); }}>Simulate discovery failure</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onSelect={() => { setDemoState("high-risk"); toast.warning("Simulating high-risk decision"); }}>Simulate high-risk decision</DropdownMenuItem>
                <DropdownMenuItem className="text-[12px]" onSelect={() => { setDemoState("healthy"); setFilters(defaultFilters); setDomainFilter(null); toast.success("Demo data reset"); }}>Reset demo data</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filter toolbar */}
        {filtersOpen && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-2" role="group" aria-label="Dashboard filters">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
              <Filter className="h-3.5 w-3.5" aria-hidden /> Filters
            </span>
            <FilterSelect label="Time range" value={filters.timeRange} options={[...timeRanges]} onChange={(v) => setFilter("timeRange", v)} />
            <FilterSelect label="Business unit" value={filters.businessUnit} options={filterOptions.businessUnit} onChange={(v) => setFilter("businessUnit", v)} />
            <FilterSelect label="Team" value={filters.team} options={filterOptions.team} onChange={(v) => setFilter("team", v)} />
            <FilterSelect label="Environment" value={filters.environment} options={filterOptions.environment} onChange={(v) => setFilter("environment", v)} />
            <FilterSelect label="Risk level" value={filters.riskLevel} options={filterOptions.riskLevel} onChange={(v) => setFilter("riskLevel", v)} />
            <FilterSelect label="Status" value={filters.status} options={filterOptions.status} onChange={(v) => setFilter("status", v)} />
            <FilterSelect label="Knowledge domain" value={filters.knowledgeDomain} options={filterOptions.knowledgeDomain} onChange={(v) => setFilter("knowledgeDomain", v)} />
            <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => { setFilters(defaultFilters); setDomainFilter(null); }}>
              Reset
            </Button>
          </div>
        )}
      </header>

      {/* Body */}
      <div className="px-5 py-4 space-y-4 max-w-[1720px]">
        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <div id="kpi-teams">
            <KpiCard
              label="Teams Onboarded" value={String(metrics.teams)} change="+3 this month" icon={Users}
              trend={kpiTrends.teams} color="#2563eb" loading={loading} spotlight={spotlight === "kpi-teams"}
              tooltip="Teams with an approved persona and completed onboarding review."
              onClick={() => scrollTo("panel-health")}
            />
          </div>
          <KpiCard
            label="Active Personas" value={String(metrics.personas)} change="+5 this month" icon={UserSquare2}
            trend={kpiTrends.personas} color="#7c3aed" loading={loading}
            tooltip="Approved team personas currently used in impact evaluation."
            onClick={() => navigate("/enterprise-cognitive-fabric/team-persona-construction")}
          />
          <KpiCard
            label="Cognitive Health Score" value={`${metrics.health}/100`} status={degraded ? "Watch" : "Healthy"}
            change={degraded ? "-18 pts vs last week" : "+6 pts vs last week"} icon={ShieldCheck}
            trend={kpiTrends.health} color="#16a34a" loading={loading}
            tooltip="Composite of coverage, confidence, freshness, decision quality, learning and reliability."
            onClick={() => scrollTo("panel-health")}
          />
          <KpiCard
            label="Active Discovery Jobs" value={String(metrics.jobs)} status="Running"
            change="12 Successful · 1 Warning" icon={Workflow}
            trend={kpiTrends.jobs} color="#0ea5e9" loading={loading}
            tooltip="Discovery jobs currently executing across approved enterprise sources."
            onClick={() => scrollTo("panel-pipelines")}
          />
          <KpiCard
            label="Enterprise Memory" value={`${metrics.memory} TB`} change="+320 GB this month" icon={Database}
            trend={kpiTrends.memory} color="#f59e0b" loading={loading}
            tooltip="Total governed organizational memory across all fabric stores."
            onClick={() => scrollTo("panel-memory")}
          />
        </div>

        {/* Row 1 */}
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[28fr_34fr_38fr]">
          <CognitiveHealthPanel
            score={metrics.health}
            loading={loading}
            degraded={degraded ? "Freshness and reliability signals are incomplete for the selected window." : null}
            spotlight={spotlight === "panel-health"}
            onViewDetails={() => navigate("/enterprise-cognitive-fabric/enterprise-cognitive-health")}
          />
          <DiscoveryPipelinesPanel
            view={view}
            demoState={demoState}
            loading={loading}
            error={pipelineError}
            spotlight={spotlight === "panel-pipelines"}
            onViewAll={() => navigate("/enterprise-cognitive-fabric/enterprise-source-discovery")}
          />
          <MemoryUtilizationPanel
            totalTb={metrics.memory}
            loading={loading}
            spotlight={spotlight === "panel-memory"}
            onViewDetails={() => navigate("/enterprise-cognitive-fabric/enterprise-cognitive-memory")}
          />
        </div>

        {/* Row 2 */}
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[28fr_34fr_38fr]">
          {view === "architecture" ? (
            <ContextGraphPanel loading={loading} />
          ) : (
            <KnowledgeDomainsPanel
              activeDomain={domainFilter}
              onSelectDomain={setDomainFilter}
              loading={loading}
              onViewAll={() => navigate("/enterprise-cognitive-fabric/artifact-ingestion")}
            />
          )}
          <IncomingWorkPanel
            loading={loading}
            spotlight={spotlight === "panel-incoming"}
            onViewAll={() => navigate("/enterprise-cognitive-fabric/cognitive-intake")}
          />
          <RecentDecisionsPanel
            demoState={demoState}
            view={view}
            loading={loading}
            spotlight={spotlight === "panel-decisions"}
            onViewAll={() => navigate("/enterprise-cognitive-fabric/decision-intelligence")}
          />
        </div>

        {/* Row 3 */}
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[28fr_34fr_38fr]">
          <SystemAlertsPanel loading={loading} />
          <CognitiveInsightsPanel loading={loading} />
          <LearningLoopPanel
            loading={loading}
            spotlight={spotlight === "panel-learning"}
            onViewDetails={() => navigate("/enterprise-cognitive-fabric/organizational-learning")}
          />
        </div>

        {view === "architecture" && (
          <Panel id="panel-personas" title="Personas & Source Relationships" subtitle="Architecture view">
            <div className="grid gap-2 sm:grid-cols-3">
              {knowledgeDomains.slice(0, 3).map((d) => (
                <div key={d.id} className="rounded-lg border border-slate-100 p-2.5">
                  <div className="text-[12px] font-semibold text-slate-900">{d.name}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{d.personas} personas · {d.conditions.toLocaleString()} conditions</div>
                  <div className="mt-1 text-[11px] text-slate-500">Most active: {d.mostActiveTeam}</div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {/* Demo story overlay */}
      {storyStep !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 pointer-events-none">
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

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} view={VIEW_LABEL[view]} />

      {/* Global search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search teams, personas, conditions, work items, decisions, evidence…" />
        <CommandList>
          <CommandEmpty>No matching fabric records.</CommandEmpty>
          {Array.from(new Set(searchCatalog.map((s) => s.category))).map((cat) => (
            <CommandGroup key={cat} heading={cat}>
              {searchCatalog.filter((s) => s.category === cat).map((s) => (
                <CommandItem
                  key={s.id}
                  value={`${s.category} ${s.title} ${s.summary}`}
                  onSelect={() => { setSearchOpen(false); navigate(s.route); }}
                >
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium text-slate-900">{s.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{s.summary}</div>
                    <div className="text-[10px] text-slate-400">{s.owner} · confidence {s.confidence}%</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>

      {/* Notifications */}
      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-[15px]">Notifications</SheetTitle>
          </SheetHeader>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {notifTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setNotifFilter(t)}
                aria-pressed={notifFilter === t}
                className={cn(
                  "rounded-md border px-1.5 py-0.5 text-[10.5px]",
                  notifFilter === t ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600",
                )}
              >
                {t}
              </button>
            ))}
            <Button variant="ghost" size="sm" className="ml-auto h-6 text-[11px]" onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}>
              Mark all read
            </Button>
          </div>
          <ul className="mt-3 space-y-1.5">
            {notifications.filter((n) => notifFilter === "All" || n.type === notifFilter).map((n) => (
              <li key={n.id}>
                <div className={cn("rounded-lg border p-2.5", n.read ? "border-slate-100 bg-white" : "border-blue-100 bg-blue-50/40")}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[12px] text-slate-800">{n.title}</span>
                    <StatusBadge tone="slate">{n.type}</StatusBadge>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10.5px] text-slate-500">
                    <span>{n.time}</span>
                    <button className="text-blue-600 hover:underline" onClick={() => setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>Mark read</button>
                    <button className="text-blue-600 hover:underline" onClick={() => { setNotifOpen(false); toast.info("Opening item"); }}>Open item</button>
                  </div>
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
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-7 w-[150px] text-[11px]" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="text-[11.5px]">{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ExportDialog({ open, onOpenChange, view }: { open: boolean; onOpenChange: (v: boolean) => void; view: string }) {
  const [format, setFormat] = useState("PDF");
  const [scope, setScope] = useState("Current View");
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");

  const run = () => {
    setState("running");
    setProgress(10);
    const timer = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(timer);
          setState("done");
          if (format === "CSV") downloadCsv();
          toast.success(`Export complete · ${format} · ${scope}`);
          return 100;
        }
        return p + 18;
      });
    }, 160);
  };

  const downloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Teams Onboarded", "48"],
      ["Active Personas", "72"],
      ["Cognitive Health Score", "92"],
      ["Active Discovery Jobs", "23"],
      ["Enterprise Memory (TB)", "4.2"],
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enterprise-command-center.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setState("idle"); setProgress(0); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export Report</DialogTitle>
          <DialogDescription className="text-[12px]">Generate a snapshot of the {view}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <div className="text-[11.5px] font-medium text-slate-700 mb-1">Format</div>
            <div className="flex gap-1.5">
              {["PDF", "CSV", "Presentation snapshot"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  aria-pressed={format === f}
                  className={cn("rounded-md border px-2 py-1 text-[11px]", format === f ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11.5px] font-medium text-slate-700 mb-1">Scope</div>
            <div className="flex gap-1.5">
              {["Current View", "Full Command Center"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  aria-pressed={scope === s}
                  className={cn("rounded-md border px-2 py-1 text-[11px]", scope === s ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {state !== "idle" && (
            <div>
              <Progress value={progress} className="h-1.5" />
              <p className="mt-1 text-[11px] text-slate-500" role="status" aria-live="polite">
                {state === "done" ? "Export complete." : "Preparing export…"}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Close</Button>
          <Button size="sm" className="h-8 text-[12px]" onClick={run} disabled={state === "running"}>
            <Layers className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
