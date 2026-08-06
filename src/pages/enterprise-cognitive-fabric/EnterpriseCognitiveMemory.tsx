/**
 * Enterprise Cognitive Memory — governed organizational memory layer of the
 * Enterprise Cognitive Fabric. Operational page inside the existing ECF shell.
 */

import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Filter, RefreshCw } from "lucide-react";
import { FilterSelect, Pill } from "./persona-studio/primitives";
import { exportCsv, exportJson, downloadBlob } from "@/lib/operations/exports";
import {
  ArchitecturePanel, CompositionPanel, ContextGraphPanel, ExplorerPanel, FreshnessAuthorityPanel,
  IndexingPanel, LifecyclePanel, MemoryKpiCard, Panel, ProvenancePanel, QualityPanel,
  SelectedStagePanel, explorerColumns, type Density,
} from "./cognitive-memory/panels";
import { MemoryWorkbench, initialWorkbenchState, type WorkbenchState } from "./cognitive-memory/workbench";
import { IndexingDrawer, QualityDrawer, RecordDrawer } from "./cognitive-memory/drawers";
import {
  activeMemoryFilterCount, applyMemoryFilters, defaultMemoryFilters, memoryFilterLabels,
  memoryFilterOptions, memoryIndexingJobs, memoryKpis, memoryLifecycleStages, memoryRecords,
  recordToRow, savedViews,
  type MemoryFilters, type MemoryIndexingJob, type MemoryRecord, type MemoryServiceState,
  type MemoryView, type FlowMode,
} from "./cognitive-memory/data";
import {
  GovernanceOverviewPanel, GovernanceQueuePanel, ConflictsPanel, DriftPanel, AccessPanel,
  RetentionPanel, PublishingPanel, McpServicesPanel, UsagePanel, LearningPanel, ActivityPanel,
  QualityDetailBody, StateBanner, defaultQueueFilters, type QueueFilters,
} from "./cognitive-memory/governance-panels";
import {
  CurationWorkbench, PointInTimePanel, SnapshotsPanel, AccessSimulator, AgentContextSimulator,
  buildAgentSimulation, initialCurationDecision, type CurationDecisionState,
} from "./cognitive-memory/curation";
import {
  ReviewDrawer, ConflictDrawer, DriftDrawer, MergeDialog, SupersessionDialog, RefreshDialog,
  CreateSnapshotDialog, PublishDialog, GlobalSearchDialog, NotificationsDrawer, ExportDialog,
  DemoStoryOverlay,
} from "./cognitive-memory/workflows";
import {
  governanceReviews as seedReviews, memoryConflicts as seedConflicts, memoryDrifts as seedDrifts,
  retentionRows as seedRetention, memorySnapshots as seedSnapshots, seedNotifications,
  memoryActivities as seedActivities, publishDestinations as seedDestinations, demoScenarios,
  demoSteps, curationCandidates, supersessionCases, simIdentities, simRecords, simulateAccess,
  simAgents, simTasks, pointInTimeEvents, toYaml, governanceDimensions,
  type MemoryGovernanceReview, type MemoryConflict, type MemoryDrift, type RetentionRow,
  type MemorySnapshot, type MemoryNotification, type ScenarioId, type CurationCandidate,
} from "./cognitive-memory/governance-data";


const PREF_KEY = "ecf.cognitive-memory.prefs.v1";

const views: { id: MemoryView; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "explorer", label: "Memory Explorer" },
  { id: "architecture", label: "Architecture" },
  { id: "governance", label: "Governance" },
];

interface Prefs {
  view: MemoryView; filters: MemoryFilters; savedView: string; density: Density;
  hiddenColumns: string[]; selectedRecord: string | null; selectedLayer: string;
  selectedStage: string; filtersOpen: boolean;
}

const defaultPrefs: Prefs = {
  view: "explorer", filters: defaultMemoryFilters, savedView: "Default", density: "standard",
  hiddenColumns: [], selectedRecord: null, selectedLayer: "evidence-vault",
  selectedStage: "validate", filtersOpen: false,
};

const loadPrefs = (): Prefs => {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch { return defaultPrefs; }
};

const savePrefs = (p: Prefs) => {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
};

export default function EnterpriseCognitiveMemory() {
  const navigate = useNavigate();
  const [prefs, setPrefsState] = useState<Prefs>(loadPrefs);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [kpiFocus, setKpiFocus] = useState<string | null>(null);
  const [flowMode, setFlowMode] = useState<FlowMode>("data");
  const [focusOnly, setFocusOnly] = useState(false);
  const [stagePaused, setStagePaused] = useState(false);
  const [workbench, setWorkbench] = useState<WorkbenchState>(initialWorkbenchState);
  const [activeRecord, setActiveRecord] = useState<MemoryRecord | null>(null);
  const [recordTab, setRecordTab] = useState<string>("Overview");
  const [recordOpen, setRecordOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<MemoryIndexingJob | null>(null);
  const [jobOpen, setJobOpen] = useState(false);
  const [jobPaused, setJobPaused] = useState(false);
  const [qualityKey, setQualityKey] = useState<string | null>(null);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [serviceStateBase] = useState<MemoryServiceState>("Operational");

  /* ---------------- Prompt 2 state ---------------- */
  const [reviews, setReviews] = useState<MemoryGovernanceReview[]>(seedReviews);
  const [conflicts, setConflicts] = useState<MemoryConflict[]>(seedConflicts);
  const [drifts, setDrifts] = useState<MemoryDrift[]>(seedDrifts);
  const [retention, setRetention] = useState<RetentionRow[]>(seedRetention);
  const [snapshots, setSnapshots] = useState<MemorySnapshot[]>(seedSnapshots);
  const [destinations, setDestinations] = useState(seedDestinations);
  const [notifications, setNotifications] = useState<MemoryNotification[]>(seedNotifications);
  const [activities, setActivities] = useState(seedActivities);
  const [queueFilters, setQueueFilters] = useState<QueueFilters>(defaultQueueFilters);
  const [queueSearch, setQueueSearch] = useState("");
  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState(curationCandidates[0].id);
  const [curationState, setCurationState] = useState<CurationDecisionState>(initialCurationDecision);
  const [pitId, setPitId] = useState("pit-approval");
  const [simIdentityId, setSimIdentityId] = useState(simIdentities[4].id);
  const [simRecordId, setSimRecordId] = useState(simRecords[0].id);
  const [simResult, setSimResult] = useState<ReturnType<typeof simulateAccess> | null>(null);
  const [agent, setAgent] = useState(simAgents[1]);
  const [agentTask, setAgentTask] = useState(simTasks[0]);
  const [agentIdentityId, setAgentIdentityId] = useState(simIdentities[4].id);
  const [agentPitId, setAgentPitId] = useState("pit-approval");
  const [agentOutput, setAgentOutput] = useState<ReturnType<typeof buildAgentSimulation> | null>(null);
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const [storyStep, setStoryStep] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeReview, setActiveReview] = useState<MemoryGovernanceReview | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeConflict, setActiveConflict] = useState<MemoryConflict | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [activeDrift, setActiveDrift] = useState<MemoryDrift | null>(null);
  const [driftOpen, setDriftOpen] = useState(false);
  const [mergeCandidate, setMergeCandidate] = useState<CurationCandidate | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [supersedeId, setSupersedeId] = useState(supersessionCases[0].id);
  const [supersedeOpen, setSupersedeOpen] = useState(false);
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const overlay = scenario ? demoScenarios.find((s) => s.id === scenario) ?? null : null;
  const serviceState = (overlay?.serviceState ?? serviceStateBase) as MemoryServiceState;
  const simIdentity = simIdentities.find((i) => i.id === simIdentityId) ?? simIdentities[0];
  const unread = notifications.filter((n) => !n.read).length;


  const setPrefs = useCallback((updater: (p: Prefs) => Prefs) => {
    setPrefsState((p) => { const next = updater(p); savePrefs(next); return next; });
  }, []);
  const setPref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => setPrefs((p) => ({ ...p, [key]: value }));

  const say = (msg: string) => setAnnounce(msg);

  const filtered = useMemo(() => applyMemoryFilters(memoryRecords, prefs.filters, search), [prefs.filters, search]);
  const filterCount = activeMemoryFilterCount(prefs.filters);
  const stage = memoryLifecycleStages.find((s) => s.id === prefs.selectedStage) ?? memoryLifecycleStages[7];

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const openRecord = (r: MemoryRecord, tab = "Overview") => {
    setActiveRecord(r); setRecordTab(tab); setRecordOpen(true);
    setPref("selectedRecord", r.id);
    say(`Memory record ${r.id} opened`);
  };

  const openRecordById = (id: string, tab = "Overview") => {
    const r = memoryRecords.find((x) => x.id === id || x.id.startsWith(id));
    if (r) openRecord(r, tab);
    else toast.info("Record not in the seeded demonstration set", { description: id });
  };

  const setFilter = (key: keyof MemoryFilters, value: string) => {
    setPrefs((p) => ({ ...p, filters: { ...p.filters, [key]: value } }));
    setPage(1);
  };

  const onKpi = (id: string) => {
    setKpiFocus(id);
    if (id === "kpi-records") scrollTo("panel-composition");
    if (id === "kpi-evidence") { setFilter("memoryType", "Evidence Record"); scrollTo("panel-explorer"); }
    if (id === "kpi-conditions") { setFilter("memoryType", "Business Condition"); scrollTo("panel-explorer"); }
    if (id === "kpi-personas") { setFilter("memoryType", "Team Persona"); scrollTo("panel-explorer"); }
    if (id === "kpi-relationships") scrollTo("panel-graph");
    if (id === "kpi-quality") scrollTo("panel-quality");
    say(`${memoryKpis.find((k) => k.id === id)?.name} focused`);
  };

  const exportCurrentView = () => {
    const cols = explorerColumns[prefs.view].map((c) => c.label);
    exportCsv("enterprise-cognitive-memory.csv", [
      ["Memory ID", "Record", "Memory Type", "Domain", "Owner", "Authority", "Approval", "Confidence", "Freshness", "Evidence", "Relationships", "Access", "Version", "Updated"],
      ...filtered.map(recordToRow),
    ]);
    toast.success("Memory view exported", { description: `${filtered.length} records · ${cols.length} columns in view` });
    say("Memory view exported as CSV");
  };

  const exportSummary = () => {
    exportJson("enterprise-memory-summary.json", {
      generatedAt: new Date().toISOString(), view: prefs.view, filters: prefs.filters,
      kpis: memoryKpis.map((k) => ({ name: k.name, value: k.value, status: k.status })),
      records: filtered.map(recordToRow),
    });
    toast.success("Memory summary exported");
  };

  const refresh = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); toast.success("Enterprise memory refreshed"); say("Enterprise memory refreshed"); }, 300);
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = (ids: string[]) =>
    setSelected((s) => {
      const all = ids.every((i) => s.has(i));
      const n = new Set(s);
      ids.forEach((i) => (all ? n.delete(i) : n.add(i)));
      return n;
    });

  const onSort = (k: string) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const prompt2 = (label: string) =>
    toast.info(`${label} arrives in Prompt 2`, { description: "Governance, curation, retention, publishing, and MCP context services are the next build package." });

  const filterKeys = Object.keys(memoryFilterOptions) as (keyof MemoryFilters)[];

  return (
    <div className="min-h-full bg-slate-50 px-5 py-4">
      <div aria-live="polite" role="status" className="sr-only">{announce}</div>

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Link to="/" className="hover:text-blue-700">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span>Cognitive Memory</span>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="font-medium text-slate-700">Enterprise Cognitive Memory</span>
      </nav>

      <header className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Modeling &amp; Memory</p>
          <h1 className="text-[19px] font-bold text-slate-900">Enterprise Cognitive Memory</h1>
          <p className="text-[12px] text-slate-500">
            Preserve, connect, govern, and reuse trusted organizational knowledge across every enterprise decision
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="View selector">
            {views.map((v) => (
              <button key={v.id} role="tab" aria-selected={prefs.view === v.id} type="button"
                onClick={() => { setPref("view", v.id); setPage(1); say(`${v.label} view selected`); }}
                className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  prefs.view === v.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Pill label={serviceState} tone={serviceState === "Operational" ? "green" : serviceState === "Degraded" ? "red" : "amber"} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={refresh}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh Memory
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => scrollTo("panel-explorer")}>Explore Memory</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => scrollTo("panel-workbench")}>Run Memory Query</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { scrollTo("panel-indexing"); toast.success("Indexing job queued", { description: "IDX 60453 · Semantic Index · current filter scope" }); }}>Start Indexing</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={exportSummary}>Export Memory Summary</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">More</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-[11px]">Prompt 2 capabilities</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["Governance & Curation", "Conflict Resolution & Merge", "Point in Time Reconstruction", "Access Simulation", "Retention & Legal Hold", "MCP Context Services", "Demo Story"].map((l) => (
                <DropdownMenuItem key={l} className="text-[11px]" onClick={() => prompt2(l)}>{l}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Filters */}
      <section className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Global filters">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <button type="button" onClick={() => setPref("filtersOpen", !prefs.filtersOpen)}
            aria-expanded={prefs.filtersOpen}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">
            <Filter className="h-3.5 w-3.5" aria-hidden /> Filters
            {filterCount > 0 && <span className="rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">{filterCount}</span>}
          </button>
          <div className="flex flex-wrap items-center gap-1.5">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search Enterprise Memory" aria-label="Search Enterprise Memory"
              className="h-7 w-56 rounded-md border border-slate-200 px-2 text-[11px] focus:border-blue-400 focus:outline-none" />
            <FilterSelect label="Saved View" value={prefs.savedView} options={savedViews} onChange={(v) => setPref("savedView", v)} />
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setPage(1); toast.success("Filters applied", { description: `${filtered.length} records match` }); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setPref("filters", defaultMemoryFilters); setSearch(""); setPage(1); toast.success("Filters cleared"); }}>Clear Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success("View saved", { description: `${prefs.savedView} updated with ${filterCount} active filters` })}>Save View</Button>
          </div>
        </div>
        {prefs.filtersOpen && (
          <div className="mt-2 grid gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {filterKeys.map((k) => (
              <FilterSelect key={k} label={memoryFilterLabels[k]} value={prefs.filters[k]}
                options={memoryFilterOptions[k]} onChange={(v) => setFilter(k, v)} />
            ))}
          </div>
        )}
      </section>

      {/* KPIs */}
      <div id="panel-kpis" className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {memoryKpis.map((k) => <MemoryKpiCard key={k.id} kpi={k} onClick={() => onKpi(k.id)} focused={kpiFocus === k.id} />)}
      </div>

      <div className="mt-2 space-y-2">
        <ArchitecturePanel
          selectedLayer={prefs.selectedLayer} onSelect={(id) => setPref("selectedLayer", id)}
          flowMode={flowMode} onFlowMode={setFlowMode} focusOnly={focusOnly} onFocusOnly={setFocusOnly}
          onOpenLayerRecords={(layer) => {
            const match = memoryRecords.find((r) => r.memoryLayer === layer.name);
            if (match) { setFilter("memoryType", match.recordType); scrollTo("panel-explorer"); }
            else toast.info(`${layer.name} records are aggregated in this demonstration data set`);
          }} />

        <LifecyclePanel selectedStage={prefs.selectedStage} onSelect={(id) => { setPref("selectedStage", id); scrollTo("panel-stage"); }} />

        <SelectedStagePanel stage={stage} paused={stagePaused}
          onPause={() => { setStagePaused(true); toast.success(`${stage.name} paused`); }}
          onResume={() => { setStagePaused(false); toast.success(`${stage.name} resumed`); }}
          onRetry={() => toast.success(`Retry queued for ${stage.name}`)}
          onReprocess={() => toast.success(`Reprocess queued for ${stage.name}`)}
          onOpenExplorer={() => scrollTo("panel-explorer")}
          onViewLogs={() => toast.info(`${stage.name} logs`, { description: `config ${stage.configurationVersion} · owner ${stage.owner}` })}
          onOpenRecord={(id) => openRecordById(id)} />

        <ExplorerPanel
          records={filtered} view={prefs.view} density={prefs.density} hiddenColumns={prefs.hiddenColumns}
          selected={selected} onToggleSelect={toggleSelect} onToggleAll={toggleAll}
          onOpenRecord={(r) => openRecord(r)} loading={loading}
          page={page} pageSize={8} onPage={setPage} sortKey={sortKey} sortDir={sortDir} onSort={onSort}
          actions={
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">Columns</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                  {explorerColumns[prefs.view].map((c) => (
                    <DropdownMenuCheckboxItem key={c.key} className="text-[11px]"
                      checked={!prefs.hiddenColumns.includes(c.key)}
                      onCheckedChange={() => setPref("hiddenColumns",
                        prefs.hiddenColumns.includes(c.key)
                          ? prefs.hiddenColumns.filter((x) => x !== c.key)
                          : [...prefs.hiddenColumns, c.key])}>
                      {c.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <FilterSelect label="Density" value={prefs.density} options={["compact", "standard", "comfortable"]}
                onChange={(v) => setPref("density", v as Density)} />
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={exportCurrentView}>Export Current View</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={selected.size === 0}
                onClick={() => prompt2("Bulk curation")}>Bulk Actions</Button>
            </>
          } />

        <MemoryWorkbench state={workbench} onChange={setWorkbench}
          onOpenRecord={(id) => openRecordById(id)}
          onOpenEvidence={(id) => openRecordById(id, "Evidence")}
          onOpenGraph={() => scrollTo("panel-graph")}
          onSaveContextSet={() => toast.success("Context set saved", { description: `${workbench.question.slice(0, 60)}…` })}
          onExportBrief={() => downloadBlob(
            `Enterprise Memory Brief\n\nQuestion: ${workbench.question}\n\nExcluded records: ${workbench.excluded.length}\nGenerated: ${new Date().toISOString()}\n`,
            "enterprise-memory-brief.txt", "text/plain;charset=utf-8")}
          onNavigate={(t) => navigate(t === "intake"
            ? "/enterprise-cognitive-fabric/cognitive-intake"
            : "/enterprise-cognitive-fabric/persona-impact-analysis")} />

        <div className="grid gap-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ContextGraphPanel onOpenRecord={(id) => openRecordById(id)} />
          <div className="space-y-2">
            <CompositionPanel onFilterType={(t) => { setFilter("memoryType", t); scrollTo("panel-explorer"); }} />
            <QualityPanel onOpenDimension={(k) => { setQualityKey(k); setQualityOpen(true); }} />
          </div>
        </div>

        <div className="grid gap-2 xl:grid-cols-2">
          <FreshnessAuthorityPanel
            onOpenRecord={(id) => openRecordById(id)}
            onOpenEvidence={(id) => openRecordById(id, "Evidence")}
            onAssignReview={() => prompt2("Review assignment")} />
          <IndexingPanel jobs={memoryIndexingJobs} onOpenJob={(j) => { setActiveJob(j); setJobPaused(false); setJobOpen(true); }} />
        </div>

        <ProvenancePanel onOpenRecord={(id) => openRecordById(id)} />

        <Panel title="Prompt 2 scope" subtitle="Reserved capabilities — not implemented in this build package">
          <div className="flex flex-wrap gap-1">
            {["Governance", "Curation", "Conflict Resolution", "Record Merge", "Supersession", "Drift Management", "Memory Refresh",
              "Point in Time Reconstruction", "Snapshots", "Access Policy Enforcement", "Access Simulation", "Retention", "Legal Hold",
              "Publishing", "MCP Context Services", "Agent Context Simulation", "Decision & Outcome Learning", "Usage Analytics",
              "Notifications", "Exports", "Demo Story", "Demo Scenarios"].map((l) => (
                <button key={l} type="button" onClick={() => prompt2(l)}
                  className="rounded border border-dashed border-slate-300 bg-slate-50 px-2 py-1 text-[10.5px] text-slate-500 hover:border-blue-300">{l}</button>
              ))}
          </div>
        </Panel>
      </div>

      <RecordDrawer open={recordOpen} onOpenChange={setRecordOpen} record={activeRecord} initialTab={recordTab}
        onOpenWorkbench={() => { setRecordOpen(false); scrollTo("panel-workbench"); }}
        onOpenGraph={() => { setRecordOpen(false); scrollTo("panel-graph"); }}
        onExport={(r) => exportJson(`${r.id.replace(/\s/g, "-").toLowerCase()}.json`, r)}
        onNavigate={(t) => {
          if (t === "persona") openRecordById("MEM 100422");
          if (t === "decision") openRecordById("MEM 100424");
          if (t === "outcome") openRecordById("MEM 100427");
        }} />

      <IndexingDrawer open={jobOpen} onOpenChange={setJobOpen} job={activeJob} paused={jobPaused}
        onPause={() => { setJobPaused(true); toast.success(`${activeJob?.id} paused`); }}
        onResume={() => { setJobPaused(false); toast.success(`${activeJob?.id} resumed`); }}
        onRetry={() => toast.success(`Retry queued for ${activeJob?.id}`)}
        onReindex={() => toast.success(`Reindex queued for ${activeJob?.id}`)}
        onOpenExplorer={() => { setJobOpen(false); scrollTo("panel-explorer"); }}
        onViewLogs={() => toast.info(`${activeJob?.id} logs available in the Logs tab`)} />

      <QualityDrawer open={qualityOpen} onOpenChange={setQualityOpen} dimensionKey={qualityKey} />
    </div>
  );
}
