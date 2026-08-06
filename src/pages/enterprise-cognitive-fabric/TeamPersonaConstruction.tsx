import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell, CircleHelp, Download, Play, RefreshCw, Save, Search, SlidersHorizontal, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  ArchitecturePanel, ConditionCoveragePanel, DependencyGraphPanel, Drawer, FilterSelect, GapsPanel,
  JobDetailDrawer, JobsPanel, KpiCard, LifecyclePanel, PersonaDetailDrawer, PersonaInventoryPanel,
  QualityPanel, Row, SectionModelPanel, StageDetailPanel, ThroughputPanel, WorkbenchPanel,
  download, personasToCsv, viewColumns, type Density, type JobTab, type PersonaTab, type StageTab,
} from "./persona-studio/panels";
import {
  ConflictPlaceholderDialog, StartConstructionDialog, type ConstructionResult,
} from "./persona-studio/dialogs";
import {
  ActivityPanel, ApprovalWorkflowPanel, ConflictAnalysisPanel, CoveragePanel, DemoStoryOverlay,
  DriftPanel, ImpactPreviewPanel, PublishingPanel, ReadinessPanel, ScenarioBanner, StateNotice,
  ValidationQueuePanel, VersionHistoryPanel,
} from "./persona-studio/governance-panels";
import {
  ApprovalDialog, ConflictResolutionDialog, ExportPersonasDialog, GlobalSearchDialog,
  PublishPersonaDialog, PublishingHistoryDrawer, QualityDetailDrawer, RefreshPersonaDialog,
  ValidationReviewDialog, VersionComparisonDialog,
} from "./persona-studio/governance-dialogs";
import {
  DEMO_SCENARIOS, demoStorySteps, governanceNotifications, paymentsApprovalChain,
  personaActivity, personaConflicts as seedConflicts, personaDrift as seedDrift,
  personaReviews as seedReviews, personaVersions, scenarioStates,
  type ApprovalStage, type DemoScenario, type GovernanceNotification, type PersonaActivity,
  type PersonaConflict, type PersonaDrift, type PersonaReview, type PersonaVersion,
} from "./persona-studio/governance-data";
import {
  activeFilterCount, conditionGroups, constructionJobs as seedJobs, defaultFilters, filterLabels,
  filterOptions, gaps as seedGaps, jobLogs, jobTimeline, kpis, lifecycleCallouts, lifecycleStages,
  nf, paymentsCanvas, paymentsConditions, personaSections, personas as seedPersonas,
  resolveConditions, resolveGaps, resolvePersonas, sidebarStatus,
  stageConfiguration, stageConflicts, stageDependencies, stageEvidence, stageOutputs, stageQueue,
  stageRisks, type BusinessCondition, type Filters, type GraphNode, type PersonaConstructionJob,
  type PersonaGap, type PersonaSection, type TeamPersona, type ViewMode,
} from "./persona-studio/data";

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "portfolio", label: "Portfolio" },
  { id: "construction", label: "Construction" },
  { id: "workbench", label: "Workbench" },
  { id: "architecture", label: "Architecture" },
];

const LS = {
  view: "ecf.persona.view",
  filters: "ecf.persona.filters",
  density: "ecf.persona.density",
  stage: "ecf.persona.stage",
  persona: "ecf.persona.selected",
  condition: "ecf.persona.condition",
  savedView: "ecf.persona.savedView",
  columns: "ecf.persona.columns",
};

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
};

export default function TeamPersonaConstruction() {
  const navigate = useNavigate();

  /* ------------------------------ preferences ----------------------------- */
  const [view, setView] = useState<ViewMode>(() => read<ViewMode>(LS.view, "construction"));
  const [filters, setFilters] = useState<Filters>(() => read<Filters>(LS.filters, defaultFilters));
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);
  const [density, setDensity] = useState<Density>(() => read<Density>(LS.density, "standard"));
  const [selectedStageId, setSelectedStageId] = useState<string>(() => read<string>(LS.stage, "map-dependencies"));
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => new Set(read<string[]>(LS.columns, [])));
  const [savedView, setSavedView] = useState<string | null>(() => read<string | null>(LS.savedView, null));

  useEffect(() => write(LS.view, view), [view]);
  useEffect(() => write(LS.filters, filters), [filters]);
  useEffect(() => write(LS.density, density), [density]);
  useEffect(() => write(LS.stage, selectedStageId), [selectedStageId]);
  useEffect(() => write(LS.columns, [...hiddenColumns]), [hiddenColumns]);

  /* -------------------------------- local UI ------------------------------ */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [conditionSearch, setConditionSearch] = useState("");
  const [conditionGroup, setConditionGroup] = useState<string | null>(null);
  const [coverageCategory, setCoverageCategory] = useState<string | null>(null);
  const [gapCategory, setGapCategory] = useState<string | null>(null);
  const [lifecycleFilter, setLifecycleFilter] = useState<"all" | "warnings" | "review" | "downstream">("all");
  const [stageTab, setStageTab] = useState<StageTab>("Dependencies");
  const [personaTab, setPersonaTab] = useState<PersonaTab>("Overview");
  const [jobTab, setJobTab] = useState<JobTab>("Summary");
  const [sortKey, setSortKey] = useState("qualityScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [spotlight, setSpotlight] = useState<string | null>(null);

  const [openPersona, setOpenPersona] = useState<TeamPersona | null>(null);
  const [openJob, setOpenJob] = useState<PersonaConstructionJob | null>(null);
  const [openNode, setOpenNode] = useState<GraphNode | null>(null);
  const [openSection, setOpenSection] = useState<PersonaSection | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [conflictCondition, setConflictCondition] = useState<string | null>(null);

  /* --------------------------- governance state --------------------------- */
  const [reviews, setReviews] = useState<PersonaReview[]>(seedReviews);
  const [conflicts, setConflicts] = useState<PersonaConflict[]>(seedConflicts);
  const [drift, setDrift] = useState<PersonaDrift[]>(seedDrift);
  const [approvalChain, setApprovalChain] = useState(paymentsApprovalChain);
  const [approvalStage, setApprovalStage] = useState<ApprovalStage>("Persona Owner Review");
  const [versions, setVersions] = useState<PersonaVersion[]>(personaVersions);
  const [publishingState, setPublishingState] = useState<string>("Idle");
  const [notifications, setNotifications] = useState<GovernanceNotification[]>(governanceNotifications);
  const [notificationFilter, setNotificationFilter] = useState<string>("All");
  const [reviewSummaryFilter, setReviewSummaryFilter] = useState<string | null>(null);
  const [openReview, setOpenReview] = useState<PersonaReview | null>(null);
  const [openConflict, setOpenConflict] = useState<PersonaConflict | null>(null);
  const [approvalAction, setApprovalAction] = useState<string | null>(null);
  const [compareVersions, setCompareVersions] = useState<[PersonaVersion, PersonaVersion] | null>(null);
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishHistoryOpen, setPublishHistoryOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [qualityDetail, setQualityDetail] = useState<{ name: string; score: number; target: number; trend: number[] } | null>(null);
  const [scenario, setScenario] = useState<DemoScenario>("Reset Demo Data");
  const [storyStep, setStoryStep] = useState<number | null>(null);
  const [storyNotes, setStoryNotes] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [loadingGovernance, setLoadingGovernance] = useState(false);
  const [activityHeadline, setActivityHeadline] = useState(personaActivity[0].description);

  /* ------------------------------ draft state ----------------------------- */
  const [mappingStates, setMappingStates] = useState<Record<string, BusinessCondition["mappingState"]>>({});
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(() => read<string | null>(LS.condition, "COND-100421"));
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [dirtyCount, setDirtyCount] = useState(0);
  const [lastResult, setLastResult] = useState<ConstructionResult | null>(null);
  const [qualityAdjust, setQualityAdjust] = useState(0);

  useEffect(() => write(LS.condition, selectedConditionId), [selectedConditionId]);

  const announce = useCallback((msg: string) => setAnnouncement(msg), []);

  const pushNotification = useCallback((n: Omit<GovernanceNotification, "id" | "read" | "timestamp">) => {
    setNotifications((prev) => [
      { ...n, id: `NTF-${prev.length + 1}-${Date.now()}`, read: false, timestamp: "Now" },
      ...prev,
    ]);
  }, []);

  /* -------------------------------- derived ------------------------------- */
  const personas = useMemo(() => {
    const rows = resolvePersonas(seedPersonas, filters, search);
    const sorted = [...rows].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filters, search, sortKey, sortDir]);

  const personaIds = useMemo(() => new Set(personas.map((p) => p.id)), [personas]);
  const jobs = useMemo(() => seedJobs.filter((j) => personaIds.has(j.personaId)), [personaIds]);
  const gaps = useMemo(() => resolveGaps(seedGaps, personaIds, gapCategory), [personaIds, gapCategory]);
  const conditions = useMemo(
    () => resolveConditions(paymentsConditions, filters, conditionSearch, conditionGroup, coverageCategory),
    [filters, conditionSearch, conditionGroup, coverageCategory],
  );
  const sections = useMemo(() => personaSections(openPersona?.id ?? "PERSONA-1001"), [openPersona]);
  const stage = lifecycleStages.find((s) => s.id === selectedStageId) ?? lifecycleStages[5];
  const deps = stageDependencies["map-dependencies"];

  useEffect(() => { setPage(1); }, [filters, search, view]);

  const serviceState = useMemo(() => {
    if (jobs.some((j) => j.status === "Blocked")) return "Degraded";
    if (personas.some((p) => p.approvalState !== "Approved")) return "Review Required";
    if (jobs.length) return "Constructing";
    return "Operational";
  }, [jobs, personas]);

  const dirty = dirtyCount > 0;

  /* -------------------------------- actions ------------------------------- */
  const focusPanel = useCallback((id: string) => {
    setSpotlight(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setSpotlight(null), 2200);
  }, []);

  const onKpi = (id: string) => {
    if (id === "kpi-teams") { setFilters((f) => ({ ...f, personaStatus: "In Construction" })); focusPanel("panel-inventory"); }
    if (id === "kpi-active") { setFilters((f) => ({ ...f, personaStatus: "Approved" })); focusPanel("panel-inventory"); }
    if (id === "kpi-construction") focusPanel("panel-jobs");
    if (id === "kpi-conditions") focusPanel("panel-coverage");
    if (id === "kpi-quality") focusPanel("panel-quality");
    if (id === "kpi-attention") focusPanel("panel-gaps");
  };

  const onConditionAction = (id: string, action: string) => {
    setSelectedConditionId(id);
    if (action === "Include") { setMappingStates((s) => ({ ...s, [id]: "Included" })); setDirtyCount((c) => c + 1); toast.success(`${id} included in the Persona`); }
    else if (action === "Exclude") { setMappingStates((s) => ({ ...s, [id]: "Excluded" })); setDirtyCount((c) => c + 1); toast.message(`${id} excluded`, { description: "Quality and completeness recalculated." }); }
    else if (action === "Map to Section") {
      const c = paymentsConditions.find((x) => x.id === id);
      setSelectedField(c?.section ?? null);
      setMappingStates((s) => ({ ...s, [id]: "Included" }));
      setDirtyCount((n) => n + 1);
      toast.success(`${id} mapped to ${c?.section}`);
      const low = c && c.authority !== "Primary";
      if (low) toast.warning("Low authority evidence", { description: `${id} is supported by ${c?.authority.toLowerCase()} authority only.` });
    }
    else if (action === "Open Evidence") { setSelectedField(null); toast.message("Evidence inspector updated", { description: id }); }
    else if (action === "Request Review") { setMappingStates((s) => ({ ...s, [id]: "Review Required" })); setDirtyCount((c) => c + 1); toast.success(`Review requested for ${id}`); }
    else if (action === "Mark Conflict") { setMappingStates((s) => ({ ...s, [id]: "Conflict" })); setDirtyCount((c) => c + 1); setConflictCondition(id); }
  };

  const onWorkbenchAction = (a: string) => {
    if (a === "Auto Map Suggested Conditions") {
      const next: Record<string, BusinessCondition["mappingState"]> = { ...mappingStates };
      paymentsConditions.filter((c) => (mappingStates[c.id] ?? c.mappingState) === "Suggested").forEach((c) => { next[c.id] = "Included"; });
      setMappingStates(next); setDirtyCount((c) => c + 1);
      toast.success("Suggested conditions mapped");
    } else if (a === "Accept All High Confidence Mappings") {
      const next = { ...mappingStates };
      paymentsConditions.filter((c) => c.confidence >= 92).forEach((c) => { next[c.id] = "Included"; });
      setMappingStates(next); setDirtyCount((c) => c + 1);
      toast.success("High confidence mappings accepted");
    } else if (a === "Review Conflicts") { setConflictCondition(paymentsConditions.find((c) => (mappingStates[c.id] ?? c.mappingState) === "Conflict")?.id ?? null); }
    else if (a === "Review Evidence Gaps") focusPanel("panel-gaps");
    else if (a === "Save Draft") { setDirtyCount(0); toast.success("Draft saved"); }
    else if (a === "Reset Draft") { setMappingStates({}); setDirtyCount(0); setSelectedField(null); toast.message("Draft reset to seeded state"); }
    else if (a === "Preview Persona") { setOpenPersona(seedPersonas[0]); setPersonaTab("Overview"); }
  };

  const applyFilters = () => { setFilters(draftFilters); setFiltersOpen(false); toast.success("Filters applied"); };
  const clearFilters = () => { setDraftFilters(defaultFilters); setFilters(defaultFilters); toast.message("Filters cleared"); };
  const saveViewPreset = () => {
    setSavedView(`${view} view · ${activeFilterCount(filters)} filters`);
    write(LS.savedView, `${view} view · ${activeFilterCount(filters)} filters`);
    toast.success("View saved");
  };

  const exportCsv = () => {
    download(`team-personas-${view}.csv`, personasToCsv(personas));
    toast.success("Export ready");
  };

  const metricsAfterDraft = useMemo(() => {
    const excluded = Object.values(mappingStates).filter((s) => s === "Excluded").length;
    const included = Object.values(mappingStates).filter((s) => s === "Included").length;
    const base = seedPersonas[0];
    return {
      quality: Math.max(60, Math.min(100, base.qualityScore + included - excluded * 2)),
      completeness: Math.max(50, Math.min(100, base.completenessScore + included - excluded * 2)),
    };
  }, [mappingStates]);

  /* --------------------------------- render ------------------------------- */
  const showWorkbench = view === "workbench" || view === "construction";
  const showArchitecture = view === "architecture";
  const showPortfolio = view === "portfolio";

  return (
    <div className="min-h-full bg-slate-50">
      {/* header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-5 py-2.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
              <span aria-hidden>/</span>
              <Link to="/enterprise-cognitive-fabric/persona-studio/team-persona-library" className="hover:text-blue-700">Persona Studio</Link>
              <span aria-hidden>/</span>
              <span className="font-medium text-slate-700">Team Persona Construction</span>
            </nav>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="text-[19px] font-bold leading-tight text-slate-900">Team Persona Construction</h1>
              <span className={cn(
                "rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
                serviceState === "Operational" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : serviceState === "Degraded" ? "border-red-200 bg-red-50 text-red-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
              )}>
                {serviceState}
              </span>
              {dirty && (
                <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                  {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-500">
              Build evidence linked operating models that explain how enterprise teams evaluate change
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search personas, teams, conditions"
                aria-label="Global search"
                className="h-8 w-60 rounded-md border border-slate-200 pl-7 pr-2 text-[11.5px] placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" aria-label="Notifications" onClick={() => setNotificationsOpen(true)}>
              <Bell className="h-4 w-4" aria-hidden />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" aria-label="Help" onClick={() => toast.message("Team Persona Construction", { description: "Assemble approved business conditions into a governed team operating model." })}>
              <CircleHelp className="h-4 w-4" aria-hidden />
            </Button>
            <div className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[10px] font-semibold text-white" aria-hidden>AV</span>
              <div className="leading-tight">
                <div className="text-[11px] font-medium text-slate-800">Alex Valencia</div>
                <div className="text-[9.5px] text-slate-500">Chief Architect</div>
              </div>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 p-0.5" role="tablist" aria-label="Page view">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={cn("rounded px-2.5 py-1 text-[11px] font-medium", view === v.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")}
              >
                {v.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => toast.success("Persona data refreshed")}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
          <Button size="sm" className="h-8 text-[11.5px]" onClick={() => setStartOpen(true)}>
            <Play className="mr-1 h-3.5 w-3.5" aria-hidden /> Start Persona Construction
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => toast.message("Import Team Context", { description: "Team context import is available from the Conditions Registry." })}>
            <Upload className="mr-1 h-3.5 w-3.5" aria-hidden /> Import Team Context
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-[11.5px]" disabled={!dirty} onClick={() => { setDirtyCount(0); toast.success("Draft saved"); }}>
            <Save className="mr-1 h-3.5 w-3.5" aria-hidden /> Save Draft
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" aria-hidden /> Filters
            {activeFilterCount(filters) > 0 && (
              <span className="ml-1 rounded bg-blue-100 px-1 text-[10px] font-semibold text-blue-700">{activeFilterCount(filters)}</span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 text-[11.5px]">More</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-[12px]">
              <DropdownMenuLabel>Table density</DropdownMenuLabel>
              {(["compact", "standard", "comfortable"] as Density[]).map((d) => (
                <DropdownMenuItem key={d} onClick={() => setDensity(d)}>{d}{density === d ? " ✓" : ""}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              {viewColumns[view].map((c) => (
                <DropdownMenuItem
                  key={c.key}
                  onClick={() => setHiddenColumns((s) => {
                    const next = new Set(s);
                    next.has(c.key) ? next.delete(c.key) : next.add(c.key);
                    return next;
                  })}
                >
                  {c.label}{hiddenColumns.has(c.key) ? "" : " ✓"}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={saveViewPreset}>Save View</DropdownMenuItem>
              <DropdownMenuItem onClick={exportCsv}><Download className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Export current view</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {savedView && <span className="rounded border border-slate-200 bg-white px-2 py-1 text-[10.5px] text-slate-500">Saved: {savedView}</span>}
          <span className="ml-auto text-[10.5px] text-slate-500">
            {sidebarStatus.service}: {sidebarStatus.state} · {sidebarStatus.teamsOnboarded} teams · {sidebarStatus.activePersonas} personas · {sidebarStatus.personasInConstruction} in construction
          </span>
        </div>
      </header>

      <main className="space-y-3 px-5 py-3">
        {/* KPIs */}
        <section id="panel-kpis" aria-label="Key metrics" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpis.map((k) => <KpiCard key={k.id} kpi={k} onClick={() => onKpi(k.id)} />)}
        </section>

        {lastResult && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11.5px] text-emerald-800">
            Last construction run created {lastResult.personasCreated} personas, mapped {nf(lastResult.conditionsMapped)} conditions,
            created {nf(lastResult.relationshipsCreated)} relationships, and raised {lastResult.gapsIdentified} gaps.
          </div>
        )}

        <LifecyclePanel
          stages={lifecycleStages}
          selectedId={selectedStageId}
          onSelect={setSelectedStageId}
          callouts={lifecycleCallouts}
          filterMode={lifecycleFilter}
          onFilterMode={setLifecycleFilter}
          spotlight={spotlight === "panel-lifecycle"}
        />

        <div className="grid gap-3 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <StageDetailPanel
              stage={stage}
              tab={stageTab}
              onTab={setStageTab}
              dependencies={deps}
              risks={stageRisks}
              conflicts={stageConflicts}
              evidence={stageEvidence}
              outputs={stageOutputs}
              configuration={stageConfiguration}
              queue={stageQueue}
              onAction={(a) => {
                if (a === "Open Persona Workbench") { setView("workbench"); focusPanel("panel-workbench"); }
                else toast.success(`${a} requested for ${stage.name}`);
              }}
            />
          </div>
          <ThroughputPanel />
        </div>

        {showWorkbench && (
          <WorkbenchPanel
            conditions={conditions}
            groups={conditionGroups}
            activeGroup={conditionGroup}
            onGroup={setConditionGroup}
            selectedConditionId={selectedConditionId}
            onSelectCondition={(id) => { setSelectedConditionId(id); setSelectedField(null); }}
            onConditionAction={onConditionAction}
            canvas={paymentsCanvas}
            sections={sections}
            selectedField={selectedField}
            onSelectField={setSelectedField}
            mappingStates={mappingStates}
            onWorkbenchAction={onWorkbenchAction}
            search={conditionSearch}
            onSearch={setConditionSearch}
            spotlight={spotlight === "panel-workbench"}
          />
        )}

        {view === "workbench" && (
          <div className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] text-slate-600">
            Draft quality {metricsAfterDraft.quality} · draft completeness {metricsAfterDraft.completeness}% for Payments Platform after the current
            inclusion and exclusion decisions.
          </div>
        )}

        <PersonaInventoryPanel
          personas={personas}
          view={view}
          density={density}
          search={search}
          onSearch={setSearch}
          onOpen={(p) => { setOpenPersona(p); setPersonaTab("Overview"); }}
          selected={selectedRows}
          onToggle={(id) => setSelectedRows((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; })}
          onToggleAll={() => setSelectedRows((s) => s.size === personas.length ? new Set() : new Set(personas.map((p) => p.id)))}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k) => { if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("desc"); } }}
          hiddenColumns={hiddenColumns}
          onExport={exportCsv}
          page={page}
          pageSize={10}
          onPage={setPage}
          spotlight={spotlight === "panel-inventory"}
        />

        <div className="grid gap-3 xl:grid-cols-2">
          <ConditionCoveragePanel onCategory={setCoverageCategory} activeCategory={coverageCategory} spotlight={spotlight === "panel-coverage"} />
          <QualityPanel
            onDimension={(d) => { setFilters((f) => ({ ...f, qualityBand: d.score >= 95 ? "95 and above" : "90 to 94" })); toast.message(d.name, { description: `Score ${d.score} against target ${d.target}. Detailed dimension analysis arrives in the next stage.` }); }}
            spotlight={spotlight === "panel-quality"}
          />
        </div>

        {(showArchitecture || showPortfolio || view === "construction") && (
          <DependencyGraphPanel onNode={setOpenNode} spotlight={spotlight === "panel-graph"} />
        )}

        <GapsPanel
          gaps={gaps}
          activeCategory={gapCategory}
          onCategory={setGapCategory}
          onAction={(g, a) => {
            if (a === "Open Persona") { const p = seedPersonas.find((x) => x.id === g.personaId); if (p) { setOpenPersona(p); setPersonaTab("Overview"); } }
            else if (a === "Mark for Prompt 2 Resolution") toast.message("Marked for resolution", { description: `${g.gapType} on ${g.personaName} will be handled in the resolution workflow.` });
            else toast.success(`${a} — ${g.personaName}`);
          }}
          spotlight={spotlight === "panel-gaps"}
        />

        <JobsPanel jobs={jobs} onOpen={(j) => { setOpenJob(j); setJobTab("Summary"); }} spotlight={spotlight === "panel-jobs"} />

        <SectionModelPanel sections={sections} onSelect={setOpenSection} />

        {showArchitecture && <ArchitecturePanel />}
      </main>

      {/* filter drawer */}
      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen} title="Filters" description="Filters update every panel on this page">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(filterLabels) as (keyof Filters)[]).map((k) => (
            <FilterSelect
              key={k}
              label={filterLabels[k]}
              value={draftFilters[k]}
              options={filterOptions[k]}
              onChange={(v) => setDraftFilters((f) => ({ ...f, [k]: v }))}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-slate-200 pt-2">
          <Button size="sm" onClick={applyFilters}>Apply Filters</Button>
          <Button size="sm" variant="outline" onClick={clearFilters}>Clear Filters</Button>
          <Button size="sm" variant="outline" onClick={saveViewPreset}>Save View</Button>
          <span className="ml-auto self-center text-[11px] text-slate-500">{activeFilterCount(draftFilters)} active</span>
        </div>
      </Drawer>

      {/* notifications */}
      <Drawer open={notificationsOpen} onOpenChange={setNotificationsOpen} title="Notifications" description="Persona construction activity">
        <ul className="space-y-1.5">
          {seedNotifications.map((n) => (
            <li key={n.id} className={cn("rounded-md border p-2", n.tone === "amber" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50")}>
              <div className="text-[12px] font-medium text-slate-800">{n.title}</div>
              <div className="text-[11px] text-slate-600">{n.detail}</div>
            </li>
          ))}
        </ul>
      </Drawer>

      {/* graph node */}
      <Drawer open={!!openNode} onOpenChange={(v) => !v && setOpenNode(null)} title={openNode?.label ?? ""} description={openNode?.kind}>
        <p className="text-[12px] text-slate-600">{openNode?.summary}</p>
        <dl>
          <Row label="Node type" value={openNode?.kind ?? "—"} />
          <Row label="Relationship centre" value="Payments Platform Persona" />
          <Row label="Context Graph coverage" value="92%" />
        </dl>
      </Drawer>

      {/* section detail */}
      <Drawer open={!!openSection} onOpenChange={(v) => !v && setOpenSection(null)} title={openSection?.title ?? ""} description={openSection?.sectionType}>
        {openSection && (
          <>
            <p className="text-[12px] text-slate-600">{openSection.summary}</p>
            <dl>
              <Row label="Completeness" value={`${openSection.completeness}%`} />
              <Row label="Mapped conditions" value={openSection.conditionIds.length} />
              <Row label="Evidence references" value={openSection.evidenceReferenceIds.length} />
              <Row label="Average confidence" value={`${openSection.confidence}%`} />
              <Row label="Freshness" value={openSection.freshness} />
              <Row label="Review state" value={openSection.reviewStatus} />
              <Row label="Owner" value={openSection.owner} />
              <Row label="Warnings" value={openSection.warningCount} />
            </dl>
            {openSection.values.length > 0 && (
              <ul className="space-y-0.5">
                {openSection.values.map((v) => <li key={v} className="text-[11.5px] text-slate-700">{v}</li>)}
              </ul>
            )}
          </>
        )}
      </Drawer>

      <PersonaDetailDrawer
        persona={openPersona}
        open={!!openPersona}
        onOpenChange={(v) => !v && setOpenPersona(null)}
        tab={personaTab}
        onTab={setPersonaTab}
        sections={sections}
        onAction={(a) => {
          if (a === "Open Persona Workbench") { setView("workbench"); setOpenPersona(null); focusPanel("panel-workbench"); }
          else if (a === "Export Persona") { download(`${openPersona?.id}.json`, JSON.stringify(openPersona, null, 2), "application/json"); toast.success("Persona exported"); }
          else if (a === "Open Impact Analysis") navigate("/enterprise-cognitive-fabric/persona-studio/persona-validation");
          else toast.success(`${a} requested`);
        }}
      />

      <JobDetailDrawer
        job={openJob}
        open={!!openJob}
        onOpenChange={(v) => !v && setOpenJob(null)}
        tab={jobTab}
        onTab={setJobTab}
        sections={sections}
        gaps={seedGaps.filter((g) => g.personaId === openJob?.personaId)}
        timeline={jobTimeline}
        logs={jobLogs}
        dependencies={deps}
        evidence={stageEvidence}
        onAction={(a) => {
          if (a === "Open Workbench") { setView("workbench"); setOpenJob(null); focusPanel("panel-workbench"); }
          else if (a === "Export Job Summary") { download(`${openJob?.id}.json`, JSON.stringify(openJob, null, 2), "application/json"); toast.success("Job summary exported"); }
          else toast.success(`${a} requested for ${openJob?.id}`);
        }}
      />

      <StartConstructionDialog
        open={startOpen}
        onOpenChange={setStartOpen}
        onComplete={(r) => { setLastResult(r); toast.success("Persona construction complete"); }}
        onOpenWorkbench={() => { setView("workbench"); focusPanel("panel-workbench"); }}
        onSaveDraft={() => { setDirtyCount(0); toast.success("Draft saved"); }}
      />

      <ConflictPlaceholderDialog
        open={!!conflictCondition}
        onOpenChange={(v) => !v && setConflictCondition(null)}
        conditionId={conflictCondition}
      />
    </div>
  );
}
