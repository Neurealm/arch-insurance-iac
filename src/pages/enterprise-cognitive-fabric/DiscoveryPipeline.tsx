import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity, Bell, CircleUser, Download, Filter, Gauge, HelpCircle, Layers, Pause, Play,
  RefreshCw, Search, Sparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { KpiCard } from "./command-center/panels";
import {
  ActiveRunsPanel, ActivityPanel, AlertDetailDrawer, AlertsPanel, CompositionPanel, Drawer,
  LifecyclePanel, Pill, QualityDrawer, QualityPanel, ReadinessPanel, Row, RunDetailDrawer,
  StageDetailPanel, ThroughputPanel, toneFor, type ChartMode,
} from "./pipeline/panels";
import { ExportReportDialog, PausePipelineDialog, RunBackfillDialog, type BackfillResult } from "./pipeline/dialogs";
import {
  activityEventTypes, activeFilterCount, composition, defaultFilters, demoScenarios,
  filterOptions, kpiTrends, lifecycleCallouts, notificationSeed, qualityMetrics, queueDepthSeries,
  readiness as baseReadiness, resolveActivities, resolveAlerts, resolveRuns, resolveStages,
  scenarioSnapshots, searchCatalog, stageName, throughputSeries,
  type AlertStatus, type DemoScenario, type Filters, type PipelineActivity, type PipelineAlert,
  type PipelineRun, type QualityMetric, type StageId, type ViewMode,
} from "./pipeline/data";

const VIEW_LABEL: Record<ViewMode, string> = {
  executive: "Executive View",
  operations: "Operations View",
  architecture: "Architecture View",
};

const STORY = [
  { targets: ["kpi-runs", "kpi-artifacts"], caption: "Discovered enterprise artifacts enter a controlled processing lifecycle rather than moving directly into agent reasoning.", notes: "23 active runs and 418K artifacts are under management right now." },
  { targets: ["panel-lifecycle"], caption: "Artifacts are discovered, ingested, parsed, normalized, decomposed, validated, and published through measurable operational stages.", notes: "Every stage reports throughput, latency, success rate, and SLA." },
  { targets: ["panel-lifecycle", "panel-stage"], caption: "Documents, tickets, conversations, code, APIs, and telemetry are converted into consistent machine readable representations while preserving their original evidence.", notes: "Parse and Normalize carry the heaviest transformation load." },
  { targets: ["panel-quality"], caption: "Business requirements, constraints, KPIs, dependencies, risks, and decision rules are extracted and validated before becoming organizational knowledge.", notes: "Extraction confidence and validation pass rate gate publication." },
  { targets: ["panel-runs", "panel-alerts"], caption: "Operators can see which source is processing, where work is delayed, what failed, and which teams or policies are affected.", notes: "Blocked Apigee run and Slack validation backlog are the live issues." },
  { targets: ["panel-readiness"], caption: "Validated outputs are published into Enterprise Cognitive Memory and prepared for Business Condition Extraction, Team Persona updates, and cross team impact analysis.", notes: "2.2M artifacts are ready for the next stage." },
];

const PREF_KEY = "ecf.discoveryPipeline.prefs";

function loadPrefs(): { view: ViewMode; filters: Filters; stage: StageId } {
  const fallback = { view: "executive" as ViewMode, filters: defaultFilters, stage: "normalize" as StageId };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as { view?: ViewMode; filters?: Partial<Filters>; stage?: StageId };
    return { view: p.view ?? "executive", filters: { ...defaultFilters, ...(p.filters ?? {}) }, stage: p.stage ?? "normalize" };
  } catch {
    return fallback;
  }
}

const nowLabel = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function DiscoveryPipeline() {
  const navigate = useNavigate();
  const initial = useRef(loadPrefs());

  const [view, setView] = useState<ViewMode>(initial.current.view);
  const [filters, setFilters] = useState<Filters>(initial.current.filters);
  const [draftFilters, setDraftFilters] = useState<Filters>(initial.current.filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedView, setSavedView] = useState<Filters | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<StageId>(initial.current.stage);
  const [scenario, setScenario] = useState<DemoScenario>("healthy");
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(nowLabel);
  const [announce, setAnnounce] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);

  const [pipelinePaused, setPipelinePaused] = useState(false);
  const [pausedStages, setPausedStages] = useState<Set<StageId>>(new Set());
  const [runOverrides, setRunOverrides] = useState<Record<string, Partial<PipelineRun>>>({});
  const [alertStatuses, setAlertStatuses] = useState<Record<string, AlertStatus>>({});
  const [extraActivities, setExtraActivities] = useState<PipelineActivity[]>([]);
  const [backfill, setBackfill] = useState<BackfillResult | null>(null);

  const [chartMode, setChartMode] = useState<ChartMode>("throughput");
  const [lifecycleMode, setLifecycleMode] = useState<"all" | "degraded" | "bottlenecks">("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [eventType, setEventType] = useState("All");

  const [run, setRun] = useState<PipelineRun | null>(null);
  const [alert, setAlert] = useState<PipelineAlert | null>(null);
  const [metric, setMetric] = useState<QualityMetric | null>(null);
  const [kpiDrawer, setKpiDrawer] = useState<"runs" | "artifacts" | null>(null);

  const [pauseOpen, setPauseOpen] = useState(false);
  const [backfillOpen, setBackfillOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationSeed);
  const [storyStep, setStoryStep] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(PREF_KEY, JSON.stringify({ view, filters, stage: selectedStageId }));
  }, [view, filters, selectedStageId]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setStoryStep(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const snapshot = scenarioSnapshots[scenario];

  useEffect(() => {
    if (scenario === "paused") setPipelinePaused(true);
  }, [scenario]);

  const stages = useMemo(
    () => resolveStages(scenario, filters, pausedStages, pipelinePaused),
    [scenario, filters, pausedStages, pipelinePaused],
  );

  const runFilters = useMemo<Filters>(
    () => ({ ...filters, sourceCategory: activeCategory === "All" ? filters.sourceCategory : activeCategory }),
    [filters, activeCategory],
  );

  const runs = useMemo(() => {
    const base = resolveRuns(scenario, runFilters, runOverrides);
    return pipelinePaused ? base.map((r) => ({ ...r, status: "Paused" as const })) : base;
  }, [scenario, runFilters, runOverrides, pipelinePaused]);

  const alerts = useMemo(() => resolveAlerts(scenario, filters, alertStatuses), [scenario, filters, alertStatuses]);
  const activities = useMemo(() => resolveActivities(scenario, filters, extraActivities), [scenario, filters, extraActivities]);

  const selectedStage = stages.find((s) => s.id === selectedStageId) ?? stages[3];
  const downstreamStages = stages.filter((s) => s.sequence > selectedStage.sequence);

  const pipelineState = pipelinePaused ? "Paused" : snapshot.pipelineState;

  const readiness = useMemo(() => ({ ...baseReadiness, ...(snapshot.readinessOverride ?? {}) }), [snapshot]);

  const ratioRuns = runs.length / 7;
  const kpi = useMemo(() => ({
    activeRuns: pipelinePaused ? 0 : Math.max(0, Math.round(snapshot.activeRuns * (0.45 + 0.55 * ratioRuns))),
    healthy: runs.filter((r) => r.status === "Running").length,
    warning: runs.filter((r) => r.status === "Warning").length,
    blocked: runs.filter((r) => r.status === "Blocked").length,
  }), [snapshot, ratioRuns, runs, pipelinePaused]);

  const compositionItems = useMemo(
    () => (filters.artifactType === "All" ? composition : composition.filter((c) => c.artifactType === filters.artifactType)),
    [filters.artifactType],
  );

  const queueSeries = useMemo(() => stages.map((s) => ({ stage: s.name, depth: s.pendingCount, target: 30_000 })), [stages]);

  const logActivity = useCallback((title: string, stageId: StageId, severity: PipelineActivity["severity"], owner: string) => {
    setExtraActivities((cur) => [
      { id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: nowLabel(), eventType: "Operator action", title, description: title, sourceName: "Operator", stageId, severity, owner },
      ...cur,
    ]);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setUpdatedAt(nowLabel());
      setAnnounce("Pipeline data refreshed");
      toast.success("Pipeline refreshed");
    }, 650);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  }, [reducedMotion]);

  useEffect(() => {
    if (storyStep === null) return;
    scrollTo(STORY[storyStep].targets[0]);
    setAnnounce(STORY[storyStep].caption);
  }, [storyStep, scrollTo]);

  const spotlight = (id: string) => storyStep !== null && STORY[storyStep].targets.includes(id);
  const degraded = (key: keyof typeof snapshot.degradedPanels) => snapshot.degradedPanels[key] ?? null;

  /* ------------------------------- actions ------------------------------- */

  const resumePipeline = () => {
    setPipelinePaused(false);
    setPausedStages(new Set());
    if (scenario === "paused") setScenario("healthy");
    logActivity("Pipeline resumed by operator", "discover", "Info", "Alex Valencia");
    setAnnounce("Pipeline resumed");
    toast.success("Pipeline resumed");
  };

  const confirmPause = (mode: string, stageIds: StageId[], reason: string) => {
    if (mode === "Pause Entire Pipeline" || mode === "Immediate Pause") {
      setPipelinePaused(true);
    } else {
      setPausedStages(new Set(stageIds));
    }
    logActivity(`Pipeline paused (${mode}) — ${reason}`, stageIds[0] ?? "discover", "Medium", "Alex Valencia");
    setAnnounce(`Pipeline paused using ${mode}`);
    toast.success(`Pipeline paused — ${mode}`);
  };

  const stageAction = (action: string, stage: { id: StageId; name: string }) => {
    if (action === "Pause Stage") {
      setPausedStages((cur) => new Set([...cur, stage.id]));
      logActivity(`${stage.name} stage paused`, stage.id, "Medium", "Alex Valencia");
      setAnnounce(`${stage.name} stage paused`);
    } else if (action === "Resume Stage") {
      setPausedStages((cur) => { const n = new Set(cur); n.delete(stage.id); return n; });
      logActivity(`${stage.name} stage resumed`, stage.id, "Info", "Alex Valencia");
      setAnnounce(`${stage.name} stage resumed`);
    } else if (action === "Retry Failures") {
      logActivity(`Retry issued for ${stage.name} failures`, stage.id, "Info", "Data Operations");
      setAnnounce(`Retry issued for ${stage.name}`);
    }
    toast.success(`${action} — ${stage.name}`);
  };

  const runAction = (action: string, r: PipelineRun) => {
    if (action === "Pause Run") setRunOverrides((cur) => ({ ...cur, [r.id]: { ...cur[r.id], status: "Paused" } }));
    if (action === "Resume Run") setRunOverrides((cur) => ({ ...cur, [r.id]: { ...cur[r.id], status: "Running" } }));
    if (action === "Cancel Run") setRunOverrides((cur) => ({ ...cur, [r.id]: { ...cur[r.id], status: "Failed" } }));
    if (action === "Retry Failed") {
      setRunOverrides((cur) => ({ ...cur, [r.id]: { ...cur[r.id], status: "Running", failedCount: 0, successRate: Math.min(99.9, r.successRate + 1.4) } }));
      setAnnounce(`Retry issued for ${r.id}`);
    }
    if (action === "Export Run Report") {
      const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${r.id}-report.json`; a.click();
      URL.revokeObjectURL(url);
    }
    if (action === "Open Source Configuration") { navigate("/enterprise-cognitive-fabric/discovery/configuration"); return; }
    logActivity(`${action} — ${r.id}`, r.currentStageId, "Info", r.owner);
    toast.success(`${action} — ${r.id}`);
  };

  const alertAction = (action: string, a: PipelineAlert) => {
    const map: Record<string, AlertStatus> = {
      Acknowledge: "Acknowledged", Snooze: "Snoozed", "Mark Resolved": "Resolved", Assign: "Investigating",
    };
    if (map[action]) {
      setAlertStatuses((cur) => ({ ...cur, [a.id]: map[action] }));
      setAnnounce(`Alert ${a.id} ${map[action].toLowerCase()}`);
    }
    if (action === "Retry Related Artifacts") logActivity(`Retry issued for ${nf(a.affectedArtifacts)} artifacts related to ${a.id}`, a.stageId, "Info", a.owner);
    toast.success(`${action} — ${a.title}`);
  };

  const completeBackfill = (result: BackfillResult) => {
    setBackfill(result);
    setScenario("backfill-running");
    logActivity(`Backfill completed — ${nf(result.processed)} artifacts processed`, "normalize", "Info", "Data Operations");
    setAnnounce(`Backfill completed. ${nf(result.processed)} artifacts processed.`);
    toast.success("Backfill completed");
  };

  const nf = (n: number) => n.toLocaleString("en-US");
  const openActivity = (a: PipelineActivity) => {
    const target = runs.find((r) => r.id === a.runId);
    if (target) { setRun(target); return; }
    setSelectedStageId(a.stageId);
    scrollTo("panel-stage");
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="sr-only" role="status" aria-live="polite">{announce}</div>

      {/* header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-2.5 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
              <span aria-hidden>/</span>
              <Link to="/enterprise-cognitive-fabric/discovery/source-discovery" className="hover:text-blue-700">Discovery</Link>
              <span aria-hidden>/</span>
              <span className="font-medium text-slate-700">Discovery Pipeline</span>
            </nav>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-[19px] font-bold text-slate-900">Discovery Pipeline</h1>
              <Pill label={pipelineState} tone={toneFor(pipelineState)} />
            </div>
            <p className="text-[11.5px] text-slate-500">
              Monitor how discovered enterprise knowledge moves through ingestion, parsing, normalization, extraction, validation, and publishing · Updated {updatedAt}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Select value={view} onValueChange={(v) => { setView(v as ViewMode); setAnnounce(`${VIEW_LABEL[v as ViewMode]} applied`); }}>
              <SelectTrigger className="h-8 w-[152px] text-[12px]" aria-label="View mode"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(VIEW_LABEL) as ViewMode[]).map((v) => (
                  <SelectItem key={v} value={v} className="text-[12px]">{VIEW_LABEL[v]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => { setDraftFilters(filters); setFiltersOpen(true); }}>
              <Filter className="mr-1 h-3.5 w-3.5" aria-hidden /> Filters
              {activeFilterCount(filters) > 0 && (
                <span className="ml-1 rounded bg-blue-100 px-1 text-[10px] font-semibold text-blue-700">{activeFilterCount(filters)}</span>
              )}
            </Button>

            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setSearchOpen(true)}>
              <Search className="mr-1 h-3.5 w-3.5" aria-hidden /> Search
            </Button>

            <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Refresh pipeline" onClick={refresh}>
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} aria-hidden />
            </Button>

            <Button variant="outline" size="sm" className="relative h-8 w-8 p-0" aria-label="Notifications" onClick={() => setNotifOpen(true)}>
              <Bell className="h-3.5 w-3.5" aria-hidden />
              {notifications.some((n) => !n.read) && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </Button>

            <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Help and demo story" onClick={() => setStoryStep(0)}>
              <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            </Button>

            {pipelinePaused || pausedStages.size > 0 ? (
              <Button size="sm" className="h-8 text-[12px]" onClick={resumePipeline}>
                <Play className="mr-1 h-3.5 w-3.5" aria-hidden /> Resume Pipeline
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setPauseOpen(true)}>
                <Pause className="mr-1 h-3.5 w-3.5" aria-hidden /> Pause Pipeline
              </Button>
            )}

            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setBackfillOpen(true)}>Run Backfill</Button>
            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setExportOpen(true)}>
              <Download className="mr-1 h-3.5 w-3.5" aria-hidden /> Export
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-[12px]" aria-label="More actions">
                  <CircleUser className="mr-1 h-3.5 w-3.5" aria-hidden /> More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-[12px]">
                <DropdownMenuLabel>Alex Valencia · Chief Architect</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setStoryStep(0)}>Demo Story</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setShowNotes((v) => !v)}>{showNotes ? "Hide" : "Show"} presenter notes</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Demo scenarios</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {demoScenarios.map((s) => (
                      <DropdownMenuItem
                        key={s.id} className="text-[11.5px]"
                        onSelect={() => {
                          setScenario(s.id);
                          setPipelinePaused(s.id === "paused");
                          setPausedStages(new Set());
                          setAnnounce(`${s.label} scenario applied`);
                        }}
                      >
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-[11.5px]"
                      onSelect={() => {
                        setScenario("healthy"); setPipelinePaused(false); setPausedStages(new Set());
                        setRunOverrides({}); setAlertStatuses({}); setExtraActivities([]); setBackfill(null);
                        setFilters(defaultFilters); setActiveCategory("All"); setEventType("All");
                        toast.success("Demo data reset");
                      }}
                    >
                      Reset Demo Data
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/enterprise-cognitive-fabric/discovery/configuration")}>Open Discovery Configuration</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {snapshot.banner && (
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11.5px] text-amber-800" role="status">
            {snapshot.banner}
          </div>
        )}
        {pipelinePaused && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[11.5px] text-slate-700">
            <span>Pipeline paused. Queues are held in place and no new artifacts are entering the lifecycle.</span>
            <Button size="sm" className="h-6 text-[11px]" onClick={resumePipeline}>Resume Pipeline</Button>
          </div>
        )}
        {backfill && (
          <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11.5px] text-blue-800">
            Backfill completed — {nf(backfill.processed)} artifacts processed, {nf(backfill.corrected)} corrected, {backfill.personaUpdates} persona updates created.
          </div>
        )}
      </header>

      <main className="space-y-3 px-5 py-4">
        {/* KPIs */}
        <section aria-label="Pipeline key metrics" className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
          <div id="kpi-runs" className={cn(spotlight("kpi-runs") && "rounded-xl ring-2 ring-blue-500 ring-offset-2")}>
            <KpiCard
              label="Active Pipeline Runs" value={String(kpi.activeRuns)}
              change={`${kpi.healthy} healthy · ${kpi.warning} warning`} status={`${kpi.blocked} blocked`}
              icon={Activity} trend={kpiTrends.runs} color="#2563eb"
              tooltip="Pipeline runs currently processing artifacts across all stages."
              onClick={() => setKpiDrawer("runs")} loading={loading}
            />
          </div>
          <div id="kpi-artifacts" className={cn(spotlight("kpi-artifacts") && "rounded-xl ring-2 ring-blue-500 ring-offset-2")}>
            <KpiCard
              label="Artifacts in Flight" value={snapshot.artifactsInFlight} change={snapshot.artifactsChange}
              status="Across 7 stages" icon={Layers} trend={kpiTrends.artifacts} color="#0d9488"
              tooltip="Artifacts currently queued or processing anywhere in the discovery lifecycle."
              onClick={() => setKpiDrawer("artifacts")} loading={loading}
            />
          </div>
          <KpiCard
            label="Average Processing Time" value={snapshot.averageProcessingTime} change={snapshot.processingChange}
            status="Improving" icon={Gauge} trend={kpiTrends.duration} color="#7c3aed"
            tooltip="Mean end-to-end time for an artifact to move from discovery to publishing."
            onClick={() => { setChartMode("duration"); scrollTo("panel-throughput"); }} loading={loading}
          />
          <KpiCard
            label="Pipeline Success Rate" value={snapshot.successRate} change="Target 97%"
            status="Healthy" icon={Sparkles} trend={kpiTrends.success} color="#ea580c"
            tooltip="Share of artifacts completing every stage without failure."
            onClick={() => scrollTo("panel-quality")} loading={loading}
          />
          <KpiCard
            label="Publishing Readiness" value={snapshot.readinessPercent} change={snapshot.readyLabel}
            status="Ready for extraction" icon={Download} trend={kpiTrends.readiness} color="#dc2626"
            tooltip="Share of processed artifacts validated and ready to publish downstream."
            onClick={() => scrollTo("panel-readiness")} loading={loading}
          />
        </section>

        {/* lifecycle */}
        <LifecyclePanel
          stages={stages} selectedId={selectedStage.id} onSelect={setSelectedStageId}
          loading={loading} degraded={degraded("lifecycle")} spotlight={spotlight("panel-lifecycle")}
          reducedMotion={reducedMotion} filterMode={lifecycleMode} onFilterMode={setLifecycleMode}
          callouts={lifecycleCallouts} architecture={view === "architecture"}
        />

        {/* stage detail */}
        <StageDetailPanel
          stage={selectedStage} onAction={stageAction} loading={loading}
          spotlight={spotlight("panel-stage")} downstreamStages={downstreamStages}
        />

        {/* runs */}
        <ActiveRunsPanel
          runs={runs} onOpenRun={setRun} onRunAction={runAction}
          loading={loading} degraded={degraded("runs")} spotlight={spotlight("panel-runs")}
          operations={view === "operations"} stages={stages}
          categoryFilter={filters.sourceCategory} onCategoryFilter={(v) => setFilters((f) => ({ ...f, sourceCategory: v }))}
          statusFilter={filters.runStatus} onStatusFilter={(v) => setFilters((f) => ({ ...f, runStatus: v }))}
          stageFilter={filters.pipelineStage} onStageFilter={(v) => setFilters((f) => ({ ...f, pipelineStage: v }))}
          ownerFilter={filters.owner} onOwnerFilter={(v) => setFilters((f) => ({ ...f, owner: v }))}
          empty={runs.length === 0 ? "No pipeline runs match the current filters. Clear filters or widen the time range to see active work." : null}
        />

        {/* throughput + quality */}
        <section className="grid gap-3 lg:grid-cols-2">
          <ThroughputPanel
            mode={chartMode} onMode={setChartMode} series={throughputSeries}
            queueSeries={queueSeries.length ? queueSeries : queueDepthSeries}
            loading={loading} degraded={degraded("throughput")} spotlight={spotlight("panel-throughput")}
            timeRange={filters.timeRange} onTimeRange={(v) => setFilters((f) => ({ ...f, timeRange: v }))}
          />
          <QualityPanel
            metrics={qualityMetrics} onOpen={setMetric}
            loading={loading} degraded={degraded("quality")} spotlight={spotlight("panel-quality")}
          />
        </section>

        {/* composition + alerts */}
        <section className="grid gap-3 lg:grid-cols-2">
          <CompositionPanel
            items={compositionItems} activeCategory={activeCategory}
            onSelect={(c) => { setActiveCategory(c); setAnnounce(c === "All" ? "Artifact filter cleared" : `Filtered to ${c}`); }}
            loading={loading}
          />
          <AlertsPanel
            alerts={alerts} onOpen={setAlert} onAction={alertAction}
            loading={loading} degraded={degraded("alerts")} spotlight={spotlight("panel-alerts")}
          />
        </section>

        {/* activity + readiness */}
        <section className="grid gap-3 lg:grid-cols-2">
          <ActivityPanel
            activities={activities} onOpen={openActivity} eventTypes={activityEventTypes}
            eventType={eventType} onEventType={setEventType} loading={loading}
          />
          <ReadinessPanel
            readiness={readiness} loading={loading} spotlight={spotlight("panel-readiness")}
            degraded={degraded("readiness")}
            onNext={() => navigate("/enterprise-cognitive-fabric/discovery/business-condition-extraction")}
          />
        </section>
      </main>

      {/* filters */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle className="text-[15px]">Filters</SheetTitle></SheetHeader>
          <div className="mt-3 space-y-2.5">
            {(Object.keys(filterOptions) as (keyof Filters)[]).map((key) => (
              <div key={key} className="grid gap-1">
                <label htmlFor={`pf-${key}`} className="text-[11px] capitalize text-slate-600">
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                </label>
                <Select value={draftFilters[key]} onValueChange={(v) => setDraftFilters((f) => ({ ...f, [key]: v }))}>
                  <SelectTrigger id={`pf-${key}`} className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {filterOptions[key].map((o) => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setDraftFilters(defaultFilters)}>Clear Filters</Button>
            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => { setSavedView(draftFilters); toast.success("View saved"); }}>Save View</Button>
            {savedView && <Button variant="ghost" size="sm" className="h-8 text-[12px]" onClick={() => setDraftFilters(savedView)}>Load saved view</Button>}
            <Button size="sm" className="h-8 text-[12px]" onClick={() => { setFilters(draftFilters); setFiltersOpen(false); setAnnounce("Filters applied"); }}>Apply Filters</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* notifications */}
      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle className="text-[15px]">Notifications</SheetTitle></SheetHeader>
          <div className="mt-2 flex justify-end">
            <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}>Mark all read</Button>
          </div>
          <ul className="mt-2 divide-y divide-slate-100">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-2 py-2">
                {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" aria-hidden />}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-slate-800">{n.title}</p>
                  <p className="text-[11px] text-slate-500">{n.type} · {n.time}</p>
                </div>
                <Button
                  size="sm" variant="ghost" className="h-6 text-[11px]"
                  onClick={() => setNotifications((cur) => cur.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                >
                  Mark read
                </Button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      {/* global search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search runs, artifacts, sources, stages, errors, alerts, owners…" />
        <CommandList>
          <CommandEmpty>No pipeline objects found.</CommandEmpty>
          {["Pipeline Runs", "Artifacts", "Stages", "Errors", "Alerts", "Owners", "Business Units", "Knowledge Domains"].map((group) => (
            <CommandGroup key={group} heading={group}>
              {searchCatalog.filter((c) => c.type === group).slice(0, 6).map((c) => (
                <CommandItem
                  key={`${c.type}-${c.id}`} value={`${c.title} ${c.type} ${c.source} ${c.owner} ${c.status}`}
                  onSelect={() => {
                    setSearchOpen(false);
                    if (group === "Pipeline Runs") { const r = runs.find((x) => x.id === c.id); if (r) { setRun(r); return; } }
                    if (group === "Alerts") { const a = alerts.find((x) => x.id === c.id); if (a) { setAlert(a); return; } }
                    if (group === "Stages") { setSelectedStageId(c.id as StageId); scrollTo("panel-stage"); return; }
                    scrollTo("panel-runs");
                  }}
                >
                  <span className="truncate text-[12px]">{c.title}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-slate-500">{c.source} · {c.stage} · {c.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>

      {/* drawers */}
      <RunDetailDrawer run={run} onOpenChange={(v) => !v && setRun(null)} onAction={runAction} />
      <AlertDetailDrawer alert={alert} onOpenChange={(v) => !v && setAlert(null)} onAction={alertAction} />
      <QualityDrawer metric={metric} onOpenChange={(v) => !v && setMetric(null)} />

      <Drawer
        open={kpiDrawer === "runs"} onOpenChange={(v) => !v && setKpiDrawer(null)} wide
        title="Active Pipeline Runs Summary" description="Grouped by source, stage, owner, status, and age"
      >
        <table className="w-full text-left text-[11.5px]">
          <caption className="sr-only">Active run summary</caption>
          <thead><tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
            {["Run", "Source", "Stage", "Owner", "Status", "Age"].map((h) => <th key={h} scope="col" className="py-1 pr-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="py-1 pr-3 font-medium text-slate-900">{r.id}</td>
                <td className="py-1 pr-3">{r.sourceName}</td>
                <td className="py-1 pr-3">{stageName(r.currentStageId)}</td>
                <td className="py-1 pr-3">{r.owner}</td>
                <td className="py-1 pr-3"><Pill label={r.status} tone={toneFor(r.status)} /></td>
                <td className="py-1 pr-3">{r.elapsedTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Drawer>

      <Drawer
        open={kpiDrawer === "artifacts"} onOpenChange={(v) => !v && setKpiDrawer(null)} wide
        title="Artifact Flow Summary" description="Grouped by stage, source category, classification, and artifact type"
      >
        <div>
          <h3 className="text-[12px] font-semibold text-slate-900">By stage</h3>
          <dl className="mt-1">{stages.map((s) => <Row key={s.id} label={s.name} value={`${nf(s.pendingCount)} queued · ${s.throughput}`} />)}</dl>
        </div>
        <div>
          <h3 className="text-[12px] font-semibold text-slate-900">By artifact type</h3>
          <dl className="mt-1">{composition.map((c) => <Row key={c.artifactType} label={c.artifactType} value={`${nf(c.count)} · ${c.percentage}%`} />)}</dl>
        </div>
        <div>
          <h3 className="text-[12px] font-semibold text-slate-900">By access classification</h3>
          <dl className="mt-1">
            <Row label="Internal" value="268,410" />
            <Row label="Confidential" value="112,884" />
            <Row label="Restricted" value="31,220" />
            <Row label="Public" value="5,723" />
          </dl>
        </div>
      </Drawer>

      {/* dialogs */}
      <PausePipelineDialog
        open={pauseOpen} onOpenChange={setPauseOpen}
        activeRuns={kpi.activeRuns} artifactsInFlight={snapshot.artifactsInFlight}
        stageList={stages} onConfirm={confirmPause}
      />
      <RunBackfillDialog open={backfillOpen} onOpenChange={setBackfillOpen} onComplete={completeBackfill} />
      <ExportReportDialog
        open={exportOpen} onOpenChange={setExportOpen} runs={runs}
        payload={{ view, filters, scenario, stages, alerts, quality: qualityMetrics, readiness }}
      />

      {/* demo story */}
      {storyStep !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 py-2.5 shadow-lg">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
              Step {storyStep + 1} of {STORY.length}
            </span>
            <p className="min-w-0 flex-1 text-[12.5px] text-slate-800">{STORY[storyStep].caption}</p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled={storyStep === 0} onClick={() => setStoryStep((s) => (s ?? 0) - 1)}>Previous</Button>
              <Button size="sm" className="h-7 text-[11px]" disabled={storyStep === STORY.length - 1} onClick={() => setStoryStep((s) => (s ?? 0) + 1)}>Next</Button>
              <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setShowNotes((v) => !v)}>{showNotes ? "Hide notes" : "Notes"}</Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Exit story" onClick={() => setStoryStep(null)}><X className="h-3.5 w-3.5" aria-hidden /></Button>
            </div>
            {showNotes && <p className="w-full text-[11px] italic text-slate-500">{STORY[storyStep].notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
