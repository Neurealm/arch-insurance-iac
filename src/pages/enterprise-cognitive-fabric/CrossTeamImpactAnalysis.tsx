/**
 * Cross Team Impact Analysis — synthesises Persona Impact Analysis results into
 * an enterprise coordination view.
 *
 * Local impacts become enterprise consequences when they intersect. This page
 * preserves every Team Persona's distinct perspective, makes the intersections
 * explainable, and prepares decision context. It never issues the enterprise
 * decision.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Download, RefreshCw, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill } from "./persona-studio/primitives";
import {
  ActivityPanel, AgreementPanel, AnalysisQueuePanel, ConflictPanel, CoordinationOwnershipPanel,
  EnterpriseSummaryPanel, IntakeKpiCard, LifecyclePanel, MitigationCandidatePanel, OpportunityPanel,
  PersonaSynthesisPanel, PropagationGraphPanel, QualityPanel, SelectedStagePanel, SharedDependencyPanel,
  ctiTone, type Density,
} from "./cross-team-impact/panels";
import { CrossTeamImpactMatrix, MatrixCellDetail, type MatrixMode } from "./cross-team-impact/matrix";
import { CrossTeamWorkbench } from "./cross-team-impact/workbench";
import {
  AnalysisDetailDrawer, ConditionDrawer, ConflictDrawer, DependencyDrawer, EvidenceDrawer,
  GraphNodeDrawer, PersonaDrawer,
} from "./cross-team-impact/drawers";
import {
  activeFilterCount, analyses, buildPairMatrix, ctiKpis, ctiPersonas, ctiViews, defaultFilters, evidenceState,
  filterOptions, initialAnalysisState, kpiFocusPanel, lifecycleStages, operationalState, pairCell,
  severityRank, stageById,
  type CrossTeamImpactAnalysis, type CrossTeamImpactConflict, type CrossTeamImpactMatrixCell,
  type CrossTeamSharedDependency, type CtiAnalysisState, type CtiEvidence, type CtiGraphNode,
  type CtiView, type FilterKey,
} from "./cross-team-impact/data";
import {
  AcknowledgementPanel, ConditionSensitivityPanel, CoordinationActionPanel, DecisionPackagePanel,
  DemoScenarioBar, DemoStoryOverlay, DependencyOwnerReviewPanel, EscalationPanel,
  EvidenceRemediationPanel, MitigationPlannerPanel, MitigationTradeoffPanel, NotificationsPanel,
  OpsActivityPanel, PersonaOwnerReviewPanel, PersonaVersionSensitivityPanel, RawCoordinatedPanel,
  ReadinessPanel, ScenarioComparisonPanel, ScenarioSimulatorPanel, TeamScopePanel,
  VersionComparisonPanel, VersionHistoryPanel,
} from "./cross-team-impact/ops-panels";
import {
  AddPersonaDialog, ConflictManagementDrawer, CoordinationActionDrawer, EscalationDialog,
  EvidenceDialog, ExportDialog, GlobalSearchDialog, ReanalysisDialog, RoutingDialog,
  StartAnalysisDialog,
} from "./cross-team-impact/ops-dialogs";
import {
  baselineParams, buildDecisionPackage, demoScenarios, readinessMetrics,
  seedAcknowledgements, seedCoordinationRecords, seedDependencyReviews, seedEscalations,
  seedMitigations, seedNotifications, seedOpsActivity, seedReviews, seedVersions, storySteps,
  toAnalysisState, validateRouting,
  type CoordinationRecord, type CrossTeamAcknowledgement, type CrossTeamEscalation,
  type CrossTeamMitigation, type CrossTeamNotification, type OpsActivity, type ScenarioParams,
} from "./cross-team-impact/ops-data";

const STORAGE_KEY = "ecf:cross-team-impact:v1";


export default function CrossTeamImpactAnalysis() {
  const navigate = useNavigate();

  /* ------------------------------------------------------------- ui state */
  const [view, setView] = useState<CtiView>("matrix");
  const [density, setDensity] = useState<Density>("standard");
  const [matrixMode, setMatrixMode] = useState<MatrixMode>("persona-dimension");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Record<FilterKey, string>>(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState<Record<FilterKey, string>>(defaultFilters);
  const [savedView, setSavedView] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [announce, setAnnounce] = useState("");
  const [kpiFocus, setKpiFocus] = useState<string | null>(null);

  const [selectedStage, setSelectedStage] = useState("CTS 6");
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState("Highest Severity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  /* --------------------------------------------------------- domain state */
  const [analysisState, setAnalysisState] = useState<CtiAnalysisState>(initialAnalysisState);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>("PER 4101");
  const [selectedCell, setSelectedCell] = useState<CrossTeamImpactMatrixCell | null>(null);
  const [selectedDependencyId, setSelectedDependencyId] = useState<string | null>(null);
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);

  /* -------------------------------------------------------------- drawers */
  const [detail, setDetail] = useState<CrossTeamImpactAnalysis | null>(null);
  const [conflictDrawer, setConflictDrawer] = useState<CrossTeamImpactConflict | null>(null);
  const [dependencyDrawer, setDependencyDrawer] = useState<CrossTeamSharedDependency | null>(null);
  const [conditionDrawer, setConditionDrawer] = useState<string | null>(null);
  const [evidenceDrawer, setEvidenceDrawer] = useState<CtiEvidence | null>(null);
  const [personaDrawer, setPersonaDrawer] = useState<string | null>(null);
  const [nodeDrawer, setNodeDrawer] = useState<CtiGraphNode | null>(null);

  const say = useCallback((m: string) => setAnnounce(m), []);

  /* ------------------------------------------------- Prompt 2 operations */
  const [included, setIncluded] = useState<string[]>(ctiPersonas.map((p) => p.id));
  const [primaryPersona, setPrimaryPersona] = useState<string | null>("PER 4101");
  const [addPersonaOpen, setAddPersonaOpen] = useState(false);
  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>(baselineParams);
  const [mitigations, setMitigations] = useState<CrossTeamMitigation[]>(seedMitigations);
  const [accepted, setAccepted] = useState<string[]>(["CTM 1001"]);
  const [impactMode, setImpactMode] = useState<"raw" | "coordinated">("raw");
  const [records, setRecords] = useState<CoordinationRecord[]>(seedCoordinationRecords);
  const [coordinationDrawer, setCoordinationDrawer] = useState<CoordinationRecord | null>(null);
  const [acks, setAcks] = useState<CrossTeamAcknowledgement[]>(seedAcknowledgements);
  const [reviews] = useState(seedReviews);
  const [escalations, setEscalations] = useState<CrossTeamEscalation[]>(seedEscalations);
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceTarget, setEvidenceTarget] = useState("");
  const [conditionMode, setConditionMode] = useState("Compare");
  const [versions, setVersions] = useState(seedVersions);
  const [versionId, setVersionId] = useState(seedVersions[seedVersions.length - 1].id);
  const [compareLeft, setCompareLeft] = useState(seedVersions[0].id);
  const [compareRight, setCompareRight] = useState(seedVersions[seedVersions.length - 1].id);
  const [notifications, setNotifications] = useState<CrossTeamNotification[]>(seedNotifications);
  const [notificationFilter, setNotificationFilter] = useState("All");
  const [activity, setActivity] = useState<OpsActivity[]>(seedOpsActivity);
  const [startOpen, setStartOpen] = useState(false);
  const [reanalysisOpen, setReanalysisOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [routingOpen, setRoutingOpen] = useState(false);
  const [conflictManage, setConflictManage] = useState<CrossTeamImpactConflict | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [storyOn, setStoryOn] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const logOps = useCallback((action: string, detail: string) => {
    setActivity((a) => [
      {
        id: `ACT ${Date.now()}`,
        timestamp: new Date().toISOString().slice(11, 16),
        action, description: detail, owner: "Coordination Office", result: "Recorded",
      },
      ...a,
    ]);
    setAnnounce(`${action}: ${detail}`);
  }, []);

  const spot = (panel: string) => storyOn && storySteps[storyIndex]?.target === panel;

  const readiness = useMemo(
    () => readinessMetrics(analysisState, accepted, acks, records),
    [analysisState, accepted, acks, records],
  );
  const currentVersion = versions.find((v) => v.id === versionId) ?? versions[versions.length - 1];
  const decisionPackage = useMemo(
    () => buildDecisionPackage(analysisState, currentVersion, accepted, acks, escalations),
    [analysisState, currentVersion, accepted, acks, escalations],
  );
  const routing = useMemo(
    () => validateRouting(analysisState, accepted, acks, records, true, primaryPersona),
    [analysisState, accepted, acks, records, primaryPersona],
  );

  const applyScenario = (id: string) => {
    const s = demoScenarios.find((x) => x.id === id);
    if (!s) return;
    const next = { ...scenarioParams, ...s.params };
    setActiveScenario(id);
    setScenarioParams(next);
    setAnalysisState(toAnalysisState(next));
    if (s.accepted) setAccepted(s.accepted);
    if (s.ackOverride) setAcks((list) => list.map((a) => s.ackOverride?.[a.personaId] ? { ...a, status: s.ackOverride[a.personaId]! } : a));
    if (s.coordinationOverride) setRecords((list) => list.map((r) => s.coordinationOverride?.[r.id] ? { ...r, status: s.coordinationOverride[r.id]! } : r));
    logOps("Demo scenario applied", `${s.name} — ${s.note}`);
  };




  /* ------------------------------------------------------- local persistence */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<{ view: CtiView; density: Density; matrixMode: MatrixMode; hiddenColumns: string[]; savedView: string | null }>;
        if (p.view) setView(p.view);
        if (p.density) setDensity(p.density);
        if (p.matrixMode) setMatrixMode(p.matrixMode);
        if (p.hiddenColumns) setHiddenColumns(p.hiddenColumns);
        if (p.savedView) setSavedView(p.savedView);
      }
    } catch { /* preferences are optional */ }
    const t = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ view, density, matrixMode, hiddenColumns, savedView }));
    } catch { /* storage may be unavailable */ }
  }, [view, density, matrixMode, hiddenColumns, savedView]);

  /* ------------------------------------------------------------ derivation */
  const serviceState = operationalState(analysisState);
  const stage = stageById(selectedStage);
  const pairs = useMemo(() => buildPairMatrix(analysisState), [analysisState]);
  const evidence = evidenceState(analysisState);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = analyses.filter((a) => {
      if (filters.businessUnit !== "All" && a.businessUnit !== filters.businessUnit) return false;
      if (filters.submittingTeam !== "All" && a.submittingTeam !== filters.submittingTeam) return false;
      if (filters.workType !== "All" && a.workType !== filters.workType) return false;
      if (filters.impactSeverity !== "All" && a.highestSeverity !== filters.impactSeverity) return false;
      if (filters.riskLevel !== "All" && a.dependencyRisk !== filters.riskLevel) return false;
      if (filters.reviewStatus !== "All" && !(filters.reviewStatus === "Pending Review" ? a.status === "Review Required" : true)) return false;
      if (filters.customerJourney !== "All" && a.customerJourney !== filters.customerJourney) return false;
      if (filters.environment !== "All" && a.environment !== filters.environment) return false;
      if (filters.region !== "All" && a.region !== filters.region) return false;
      if (filters.analysisOwner !== "All" && a.owner !== filters.analysisOwner) return false;
      if (filters.confidenceBand !== "All") {
        if (filters.confidenceBand === "Below 85%" && a.confidence >= 85) return false;
        if (filters.confidenceBand === "85-92%" && (a.confidence < 85 || a.confidence > 92)) return false;
        if (filters.confidenceBand === "Above 92%" && a.confidence <= 92) return false;
      }
      if (filters.affectedTeam !== "All" && !a.personaIds.some((p) => p !== "PER 4107")) return false;

      if (q && ![a.id, a.workItem, a.submittingTeam, a.owner].join(" ").toLowerCase().includes(q)) return false;
      if (kpiFocus === "conflicts" && a.conflictCount === 0) return false;
      if (kpiFocus === "dependencies" && a.sharedDependencyCount < 4) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "Highest Severity": return (severityRank(a.highestSeverity) - severityRank(b.highestSeverity)) * dir;
        case "Confidence": return (a.confidence - b.confidence) * dir;
        case "Conflicts": return (a.conflictCount - b.conflictCount) * dir;
        case "Teams Evaluated": return (a.personaIds.length - b.personaIds.length) * dir;
        case "Work Item": return a.workItem.localeCompare(b.workItem) * dir;
        default: return a.id.localeCompare(b.id) * dir;
      }
    });
    return list;
  }, [filters, query, sortKey, sortDir, kpiFocus]);

  const refresh = () => {
    setLoading(true);
    say("Refreshing cross team impact analysis");
    window.setTimeout(() => { setLoading(false); say("Cross team impact analysis refreshed"); }, 380);
  };

  const focusPanel = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openCellByPersonas = (a: string, b: string) => {
    const cell = pairCell(pairs, a, b);
    if (cell) {
      setMatrixMode("persona-persona");
      setSelectedCell(cell);
      focusPanel("panel-cell");
      say("Matrix cell opened from the workbench");
    }
  };

  const toggleColumn = (c: string) =>
    setHiddenColumns((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const emphasis = {
    matrix: ["matrix", "cell", "personas", "workbench", "conflicts", "opportunities"],
    dependency: ["dependencies", "graph", "matrix", "workbench"],
    coordination: ["conflicts", "agreements", "ownership", "mitigations", "workbench"],
    executive: ["summary", "quality", "conflicts", "dependencies"],
  };
  const leads = emphasis[view];

  return (
    <div className="min-h-full bg-slate-50 p-3 text-slate-800">
      <p aria-live="polite" className="sr-only">{announce}</p>

      {/* ------------------------------------------------------- breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-slate-500">
        <Link to="/" className="hover:text-slate-700">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/enterprise-cognitive-fabric" className="hover:text-slate-700">Enterprise Cognitive Fabric</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span>Evaluation &amp; Decision</span>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="font-medium text-slate-700">Cross Team Impact Analysis</span>
      </nav>

      {/* ----------------------------------------------------------- header */}
      <header className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Evaluation &amp; Decision</p>
          <h1 className="text-[19px] font-bold text-slate-900">Cross Team Impact Analysis</h1>
          <p className="text-[12px] text-slate-500">
            Reveal how Persona level impacts intersect across teams, dependencies, risks, controls, approvals, and enterprise outcomes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="View selector">
            {ctiViews.map((v) => (
              <button key={v.id} role="tab" aria-selected={view === v.id} type="button"
                onClick={() => { setView(v.id); setPage(1); say(`${v.label} view selected`); }}
                className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  view === v.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Pill label={serviceState} tone={ctiTone(serviceState)} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={refresh}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
          <Button size="sm" className="h-7 text-[11px]" disabled title="Available in the next release">Start Cross Team Analysis</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setFiltersOpen(true); focusPanel("panel-filters"); }}>
            <Users className="mr-1 h-3.5 w-3.5" aria-hidden /> Select Teams
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { setMatrixMode("persona-persona"); focusPanel("panel-matrix"); say("Persona by Persona comparison selected"); }}>
            Compare Perspectives
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled title="Governed export arrives in the next release">
            <Download className="mr-1 h-3.5 w-3.5" aria-hidden /> Export Analysis
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => focusPanel("panel-activity")}>More</Button>
        </div>
      </header>

      {/* -------------------------------------------------------------- kpis */}
      <section aria-label="Cross team impact key indicators" className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {ctiKpis.map((k) => (
          <IntakeKpiCard key={k.id} kpi={k} focused={kpiFocus === k.id}
            onClick={() => {
              const next = kpiFocus === k.id ? null : k.id;
              setKpiFocus(next);
              setPage(1);
              if (next) focusPanel(kpiFocusPanel[k.id]);
              say(`${k.name} ${next ? "focused" : "cleared"}`);
            }} />
        ))}
      </section>

      {/* ----------------------------------------------------------- filters */}
      <section id="panel-filters" aria-label="Enterprise filters" className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}
            className="flex items-center gap-1 text-[12px] font-semibold text-slate-800">
            Enterprise Filters
            <span className="rounded border border-slate-200 bg-slate-50 px-1 text-[10px] font-normal text-slate-500">
              {activeFilterCount(filters)} active
            </span>
          </button>
          <div className="flex flex-wrap items-center gap-1.5">
            {savedView && <Pill label={`Saved view · ${savedView}`} tone="blue" />}
            <label className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
              Density
              <select value={density} onChange={(e) => setDensity(e.target.value as Density)}
                className="h-6 rounded border border-slate-200 bg-white px-1 text-[11px] normal-case tracking-normal">
                <option value="compact">Compact</option>
                <option value="standard">Standard</option>
                <option value="comfortable">Comfortable</option>
              </select>
            </label>
            <Button size="sm" className="h-6 text-[10px]" onClick={() => { setFilters(pendingFilters); setPage(1); say("Filters applied"); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]"
              onClick={() => { setFilters(defaultFilters); setPendingFilters(defaultFilters); setQuery(""); setPage(1); say("Filters cleared"); }}>
              Clear Filters
            </Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]"
              onClick={() => { setSavedView(`View ${new Date().toISOString().slice(11, 16)}`); say("View saved locally"); }}>
              Save View
            </Button>
          </div>
        </div>
        {filtersOpen && (
          <div className="mt-2 grid gap-1.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8">
            <label className="flex flex-col text-[9.5px] uppercase tracking-wide text-slate-500">
              Search
              <span className="relative">
                <Search className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 text-slate-400" aria-hidden />
                <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Analysis, work item, team"
                  className="h-6 w-full rounded border border-slate-200 bg-white pl-5 pr-1.5 text-[11px] normal-case tracking-normal" />
              </span>
            </label>
            {(Object.keys(filterOptions) as FilterKey[]).map((k) => (
              <label key={k} className="flex flex-col text-[9.5px] uppercase tracking-wide text-slate-500">
                {k.replace(/([A-Z])/g, " $1")}
                <select value={pendingFilters[k]} onChange={(e) => setPendingFilters({ ...pendingFilters, [k]: e.target.value })}
                  className="h-6 rounded border border-slate-200 bg-white px-1 text-[11px] normal-case tracking-normal">
                  {filterOptions[k].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------ body */}
      <div className="mt-2 space-y-2">
        <LifecyclePanel selectedStage={selectedStage}
          onSelect={(id) => { setSelectedStage(id); say(`${stageById(id).name} stage selected`); }} />

        <SelectedStagePanel stage={stage} state={analysisState}
          onOpenConflict={setConflictDrawer} onOpenDependency={setDependencyDrawer} />

        <AnalysisQueuePanel
          rows={rows} view={view} density={density} hiddenColumns={hiddenColumns} onToggleColumn={toggleColumn}
          selected={selectedRows} onSelect={setSelectedRows}
          sortKey={sortKey} sortDir={sortDir}
          onSort={(k) => { if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("desc"); } }}
          page={page} pageSize={pageSize} onPage={setPage} loading={loading}
          onOpen={setDetail}
          onOpenWorkbench={(r) => { setSelectedPersonaId(r.personaIds[0]); focusPanel("panel-workbench"); say(`Workbench focused on ${r.id}`); }}
          actions={
            <label className="flex flex-col text-[9.5px] uppercase tracking-wide text-slate-500">
              Search Analyses
              <span className="relative">
                <Search className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 text-slate-400" aria-hidden />
                <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Analysis, work item, team"
                  className="h-6 w-48 rounded border border-slate-200 bg-white pl-5 pr-1.5 text-[11px] normal-case tracking-normal" />
              </span>
            </label>
          } />

        {view === "executive" && <EnterpriseSummaryPanel state={analysisState} />}

        <CrossTeamImpactMatrix
          state={analysisState} mode={matrixMode} onMode={setMatrixMode}
          selectedCellId={selectedCell?.id ?? null} onSelectCell={(c) => { setSelectedCell(c); if (c) say("Matrix cell selected"); }}
          selectedPersonaId={selectedPersonaId} onSelectPersona={(id) => { setSelectedPersonaId(id); setPersonaDrawer(id); }}
          focusDependencyId={selectedDependencyId} focusConditionId={selectedConditionId} />

        <MatrixCellDetail cell={selectedCell}
          onOpenPersona={(id) => { setSelectedPersonaId(id); setPersonaDrawer(id); }}
          onOpenCondition={setConditionDrawer}
          onOpenEvidence={(id) => setEvidenceDrawer(evidence.find((e) => e.id === id) ?? null)}
          onOpenWorkbench={() => focusPanel("panel-workbench")}
          onClose={() => setSelectedCell(null)} />

        <CrossTeamWorkbench
          state={analysisState} onState={(s) => { setAnalysisState(s); say("Analysis parameters updated, intersections recalculated"); }}
          selectedPersonaId={selectedPersonaId} onSelectPersona={setSelectedPersonaId}
          selectedDependencyId={selectedDependencyId} onSelectDependency={setSelectedDependencyId}
          selectedConditionId={selectedConditionId} onSelectCondition={setSelectedConditionId}
          onOpenCell={openCellByPersonas} />

        <PersonaSynthesisPanel state={analysisState} selectedPersonaId={selectedPersonaId}
          onSelect={(id) => { setSelectedPersonaId(id); say(`${id} selected`); }} />

        <SharedDependencyPanel state={analysisState} selectedId={selectedDependencyId}
          onSelect={(d) => { setSelectedDependencyId(d.id); setDependencyDrawer(d); }} />

        <PropagationGraphPanel onOpenNode={setNodeDrawer} highlightPersonaId={selectedPersonaId} />

        <div className={cn("grid gap-2", leads.includes("conflicts") ? "xl:grid-cols-1" : "xl:grid-cols-2")}>
          <ConflictPanel state={analysisState} onOpen={setConflictDrawer} />
        </div>

        <div className="grid gap-2 xl:grid-cols-2">
          <AgreementPanel />
          <OpportunityPanel />
        </div>

        <MitigationCandidatePanel onSelectPersona={(id) => { setSelectedPersonaId(id); setPersonaDrawer(id); }} />

        <CoordinationOwnershipPanel state={analysisState} />

        <QualityPanel />

        {view !== "executive" && <EnterpriseSummaryPanel state={analysisState} />}

        <ActivityPanel onOpen={(id) => setDetail(analyses.find((a) => a.id === id) ?? null)} />

        {/* --------------------------------------------- Prompt 2 operations */}
        <TeamScopePanel state={analysisState} included={included} primary={primaryPersona}
          onToggle={(id) => { setIncluded((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]); logOps("Team scope changed", id); }}
          onPrimary={(id) => { setPrimaryPersona(id); logOps("Primary team set", id); }}
          onAdd={() => setAddPersonaOpen(true)}
          onOpenPersona={(id) => { setSelectedPersonaId(id); setPersonaDrawer(id); }}
          onOpenResult={() => navigate("/enterprise-cognitive-fabric/evaluation/persona-impact-analysis")} />

        <ScenarioSimulatorPanel params={scenarioParams} spotlight={spot("panel-scenario")}
          onParams={(p) => { setScenarioParams(p); setAnalysisState(toAnalysisState(p)); say("Scenario recalculated across the matrix"); }}
          onReset={() => { setScenarioParams(baselineParams); setAnalysisState(toAnalysisState(baselineParams)); say("Scenario reset to baseline"); }}
          onCompare={() => focusPanel("panel-scenario-comparison")} />

        <ScenarioComparisonPanel current={scenarioParams} />

        <MitigationPlannerPanel mitigations={mitigations} accepted={accepted} spotlight={spot("panel-mitigation-planner")}
          onAccept={(id) => { setAccepted((a) => Array.from(new Set([...a, id]))); logOps("Mitigation accepted", id); }}
          onReject={(id) => { setAccepted((a) => a.filter((x) => x !== id)); logOps("Mitigation rejected", id); }}
          onEdit={(m) => { setMitigations((list) => list.map((x) => x.id === m.id ? m : x)); logOps("Mitigation edited", m.id); }}
          onAssign={(m) => logOps("Mitigation owner assigned", m.id)}
          onRequestEvidence={(m) => { setEvidenceTarget(m.title); setEvidenceOpen(true); }}
          onOpenPersona={(id) => { setSelectedPersonaId(id); setPersonaDrawer(id); }} />

        <MitigationTradeoffPanel mitigations={mitigations.filter((m) => accepted.includes(m.id))} />

        <RawCoordinatedPanel state={analysisState} accepted={accepted} mitigations={mitigations}
          mode={impactMode} onMode={setImpactMode} spotlight={spot("panel-raw-coordinated")} />

        <CoordinationActionPanel records={records} spotlight={spot("panel-coordination-actions")}
          onStatus={(id, s) => { setRecords((r) => r.map((x) => x.id === id ? { ...x, status: s } : x)); logOps("Coordination status changed", `${id} · ${s}`); }}
          onOpen={setCoordinationDrawer}
          onEscalate={() => setEscalationOpen(true)}
          onRequestEvidence={(r) => { setEvidenceTarget(r.title); setEvidenceOpen(true); }} />

        <AcknowledgementPanel acks={acks} spotlight={spot("panel-acknowledgement")}
          onAct={(id, status) => { setAcks((a) => a.map((x) => x.id === id ? { ...x, status } : x)); logOps("Acknowledgement recorded", `${id} · ${status}`); }}
          onOpenPersona={(id) => { setSelectedPersonaId(id); setPersonaDrawer(id); }} />

        <PersonaOwnerReviewPanel state={analysisState} reviews={reviews}
          onAction={(personaId, action) => logOps("Persona owner review", `${personaId} · ${action}`)}
          onOpenPersona={(id) => { setSelectedPersonaId(id); setPersonaDrawer(id); }} />

        <DependencyOwnerReviewPanel reviews={seedDependencyReviews}
          onAction={(dependencyId, action) => logOps("Dependency owner review", `${dependencyId} · ${action}`)} />

        <EscalationPanel escalations={escalations} onCreate={() => setEscalationOpen(true)} />

        <EvidenceRemediationPanel state={analysisState}
          onAdd={(id) => { setEvidenceTarget(id); setEvidenceOpen(true); }}
          onRequest={(id) => { setEvidenceTarget(id); setEvidenceOpen(true); }} />

        <PersonaVersionSensitivityPanel />

        <ConditionSensitivityPanel mode={conditionMode} onMode={setConditionMode} />

        <VersionHistoryPanel versions={versions} selected={versionId} onSelect={setVersionId}
          onCompare={(id) => { setCompareRight(id); focusPanel("panel-version-comparison"); }}
          onSimulate={(id) => logOps("Version simulated", id)}
          onExport={() => setExportOpen(true)} />

        <VersionComparisonPanel versions={versions} left={compareLeft} right={compareRight}
          onLeft={setCompareLeft} onRight={setCompareRight} />

        <ReadinessPanel state={analysisState} accepted={accepted} acks={acks} records={records} />

        <DecisionPackagePanel pkg={decisionPackage} readiness={readiness.state} spotlight={spot("panel-decision-package")}
          onRoute={() => setRoutingOpen(true)}
          onExport={() => setExportOpen(true)}
          onOpenValidation={() => setRoutingOpen(true)} />

        <NotificationsPanel notifications={notifications} filter={notificationFilter} onFilter={setNotificationFilter}
          onRead={(id) => setNotifications((n) => n.map((x) => x.id === id ? { ...x, status: "Read" } : x))}
          onReadAll={() => setNotifications((n) => n.map((x) => ({ ...x, status: "Read" as const })))}
          onOpen={(n) => { setNotifications((list) => list.map((x) => x.id === n.id ? { ...x, status: "Read" } : x)); focusPanel("panel-coordination-actions"); }} />

        <OpsActivityPanel activity={activity} />

        <DemoScenarioBar scenarios={demoScenarios} active={activeScenario} onSelect={applyScenario} />
      </div>

      {/* ---------------------------------------------------------- drawers */}
      <AnalysisDetailDrawer analysis={detail} state={analysisState} onClose={() => setDetail(null)}
        onOpenWorkbench={() => { setDetail(null); focusPanel("panel-workbench"); }}
        onOpenPersonaImpact={() => navigate("/enterprise-cognitive-fabric/evaluation/persona-impact-analysis")}
        onOpenDependency={(d) => { setDetail(null); setDependencyDrawer(d); }}
        onOpenEvidence={(e) => { setDetail(null); setEvidenceDrawer(e); }} />
      <ConflictDrawer conflict={conflictDrawer} onClose={() => setConflictDrawer(null)} />
      <DependencyDrawer dependency={dependencyDrawer} onClose={() => setDependencyDrawer(null)} />
      <ConditionDrawer conditionId={conditionDrawer} onClose={() => setConditionDrawer(null)} />
      <EvidenceDrawer evidence={evidenceDrawer} onClose={() => setEvidenceDrawer(null)} />
      <PersonaDrawer personaId={personaDrawer} state={analysisState} onClose={() => setPersonaDrawer(null)} />
      <GraphNodeDrawer node={nodeDrawer} onClose={() => setNodeDrawer(null)} />
    </div>
  );
}
