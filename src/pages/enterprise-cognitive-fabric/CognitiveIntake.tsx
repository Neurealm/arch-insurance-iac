/**
 * Cognitive Intake — governed entry point for new work entering the
 * Enterprise Cognitive Fabric. Operational page inside the existing ECF shell.
 *
 * Understand the work before evaluating the work: this page structures incoming
 * work and assembles an Intake Package. It does not compute a Cognitive
 * Readiness score, an impact score, or an approval recommendation.
 */

import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Filter, RefreshCw } from "lucide-react";
import { FilterSelect, Pill } from "./persona-studio/primitives";
import {
  IntakeKpiCard, LifecyclePanel, SelectedStagePanel, IntakeQueuePanel, ClassificationPanel,
  DecompositionQualityPanel, ContextMatchPanel, CandidatePersonasPanel, EvidencePanel,
  GapsPanel, RelatedWorkPanel, PackageCompletenessPanel, ActivityPanel,
  type Density,
} from "./cognitive-intake/panels";
import {
  IntakeWorkbench, computePackage, initialWorkbenchState, isContextActive, type WorkbenchState,
} from "./cognitive-intake/workbench";
import { IntakeDetailDrawer } from "./cognitive-intake/drawers";
import {
  ActiveJobsPanel, DemoStoryOverlay, JobDetailDrawer, NotificationsButton, NotificationsDrawer,
  OperationalStatePanel, PackageHistoryPanel, QualityDetailPanel, RecentActivityPanel,
  RuleActivationPanel,
} from "./cognitive-intake/ops-panels";
import {
  AddEvidenceDialog, BulkActionDialog, ClarificationResponseDialog, ContextRefreshDialog,
  EntityRemediationDialog, ExportDialog, GlobalSearchDialog, ImportWorkDialog, ReprocessDialog,
  RequestClarificationDialog, RequestEvidenceDialog, RouteToReadinessDialog, RunIntakeDialog,
  ScenarioDialog, SubmitWorkDialog,
} from "./cognitive-intake/ops-dialogs";
import {
  activatedRules, demoStorySteps, evaluateRules, isoNow, nextId, nowLabel, readinessRoute,
  scenarioById, seedJobs, seedNotifications, seedPackageVersions, seedRecentActivity,
  type CognitiveIntakeJob, type CognitiveIntakeNotification, type CognitiveIntakePackageVersion,
  type CognitiveIntakeRuleActivation, type IntakeOperationalState, type RuleInput,
  type ScenarioDefinition,
} from "./cognitive-intake/ops-data";
import {
  activeIntakeFilterCount, applyIntakeFilters, contextMatches as seedContext,
  defaultIntakeFilters, entityMatches, evidenceItems as seedEvidence, gaps as seedGaps,
  intakeFilterLabels, intakeFilterOptions, intakeKpis, intakeLifecycleStages, intakes,
  personaCandidates as seedPersonas, relatedWork as seedRelated, savedIntakeViews, changeElements,
  overallCompleteness, queueColumns,
  type CognitiveIntake, type CognitiveIntakeActivity, type CognitiveIntakeContextMatch,
  type CognitiveIntakeEvidence, type CognitiveIntakePersonaCandidate,
  type CognitiveIntakeRelatedWork, type IntakeFilters,
  type IntakeMemoryType, type IntakeServiceState, type IntakeView,
} from "./cognitive-intake/data";


const PREF_KEY = "ecf.cognitive-intake.prefs.v1";

const views: { id: IntakeView; label: string }[] = [
  { id: "queue", label: "Intake Queue" },
  { id: "workbench", label: "Workbench" },
  { id: "operations", label: "Operations" },
  { id: "executive", label: "Executive" },
];

interface Prefs {
  view: IntakeView;
  filters: IntakeFilters;
  savedView: string;
  density: Density;
  hiddenColumns: string[];
  selectedIntake: string;
  selectedStage: string;
  filtersOpen: boolean;
}

const defaultPrefs: Prefs = {
  view: "queue", filters: defaultIntakeFilters, savedView: "Default", density: "standard",
  hiddenColumns: [], selectedIntake: "INT 7001", selectedStage: "evidence", filtersOpen: false,
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

export default function CognitiveIntake() {
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
  const [lifecycleFocus, setLifecycleFocus] = useState<"all" | "warnings" | "blocked" | "clarification" | "complete">("all");
  const [contextTypeFilter, setContextTypeFilter] = useState<IntakeMemoryType | null>(null);

  // Local, non-durable working state for the selected intake.
  const [workbench, setWorkbench] = useState<WorkbenchState>(initialWorkbenchState);
  const [context, setContext] = useState<CognitiveIntakeContextMatch[]>(seedContext);
  const [personas, setPersonas] = useState<CognitiveIntakePersonaCandidate[]>(seedPersonas);
  const [evidence] = useState<CognitiveIntakeEvidence[]>(seedEvidence);
  const [related, setRelated] = useState<CognitiveIntakeRelatedWork[]>(seedRelated);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailIntake, setDetailIntake] = useState<CognitiveIntake | null>(null);

  const say = useCallback((m: string) => setAnnounce(m), []);

  const setPrefs = (next: Prefs) => { setPrefsState(next); savePrefs(next); };
  const setPref = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs({ ...prefs, [k]: v });
  const setFilter = (k: keyof IntakeFilters, v: string) => {
    setPrefs({ ...prefs, filters: { ...prefs.filters, [k]: v } });
    setPage(1);
  };

  const filterCount = activeIntakeFilterCount(prefs.filters);
  const filtered = useMemo(() => applyIntakeFilters(intakes, prefs.filters, search), [prefs.filters, search]);

  const selectedIntake = intakes.find((i) => i.id === prefs.selectedIntake) ?? intakes[0];
  const stage = intakeLifecycleStages.find((s) => s.id === prefs.selectedStage) ?? intakeLifecycleStages[8];

  const intakeContext = context.filter((c) => c.intakeId === "INT 7001");
  const intakePersonas = personas.filter((p) => p.intakeId === "INT 7001");
  const intakeEvidence = evidence.filter((e) => e.intakeId === "INT 7001");
  const intakeElements = changeElements.filter((e) => e.intakeId === "INT 7001");
  const intakeRelated = related.filter((r) => r.intakeId === "INT 7001");
  const intakeGaps = seedGaps;

  const result = useMemo(
    () => computePackage(workbench, intakeContext, intakePersonas, intakeEvidence),
    [workbench, intakeContext, intakePersonas, intakeEvidence],
  );

  const completenessInput = {
    contextConfidence: result.contextConfidence,
    evidenceCoverage: result.evidenceCoverage,
    openQuestionsResolved: result.openQuestionsResolved,
    entityResolution: result.entityResolution,
    conditionsIdentified: result.conditionsIdentified,
  };
  const packageCompleteness = overallCompleteness(completenessInput);

  const serviceState: IntakeServiceState =
    filtered.some((i) => i.status === "Needs Attention") ? "Needs Attention"
      : filtered.some((i) => i.status === "Analyzing") ? "Analyzing" : "Operational";

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const refresh = () => {
    setLoading(true);
    say("Refreshing Cognitive Intake");
    window.setTimeout(() => {
      setLoading(false);
      toast.success("Cognitive Intake refreshed", { description: `${filtered.length} work items in scope` });
      say("Cognitive Intake refreshed");
    }, 500);
  };

  const onKpi = (id: string) => {
    setKpiFocus(id === kpiFocus ? null : id);
    if (id === "incoming") { setFilter("workStatus", "All"); scrollTo("panel-queue"); }
    if (id === "in-progress") { setFilter("missingInformationStatus", "All"); scrollTo("panel-queue"); }
    if (id === "context-match") scrollTo("panel-context-match");
    if (id === "clarification") { setFilter("workStatus", "Needs Clarification"); scrollTo("panel-gaps"); }
    if (id === "personas") scrollTo("panel-personas");
    if (id === "packages") { setFilter("workStatus", "Package Complete"); scrollTo("panel-completeness"); }
    say(`${intakeKpis.find((k) => k.id === id)?.name} selected`);
  };

  const openDetail = (r: CognitiveIntake) => { setDetailIntake(r); setDetailOpen(true); say(`${r.id} detail opened`); };

  const openWorkbench = (r: CognitiveIntake) => {
    setPref("selectedIntake", r.id);
    setWorkbench({ ...workbench, intakeId: r.id });
    scrollTo("panel-workbench");
    say(`Workbench focused on ${r.id}`);
  };

  const toggleContext = (c: CognitiveIntakeContextMatch) => {
    setContext((cs) => cs.map((x) => x.id === c.id ? { ...x, included: !x.included } : x));
    toast.success(`${c.included ? "Excluded" : "Included"} · ${c.title}`, { description: "Context confidence recalculated" });
    say(`${c.title} ${c.included ? "excluded from" : "included in"} enterprise context`);
  };

  const togglePersona = (p: CognitiveIntakePersonaCandidate) => {
    setPersonas((ps) => ps.map((x) => x.id === p.id
      ? { ...x, selectionState: x.selectionState === "Excluded" ? "Included" : "Excluded" } : x));
    say(`${p.personaName} ${p.selectionState === "Excluded" ? "included" : "excluded"}`);
  };

  const markPrimary = (p: CognitiveIntakePersonaCandidate) => {
    setPersonas((ps) => ps.map((x) => x.id === p.id
      ? { ...x, selectionState: "Primary" }
      : x.selectionState === "Primary" ? { ...x, selectionState: "Included" } : x));
    toast.success(`${p.personaName} marked primary`);
    say(`${p.personaName} marked as primary candidate persona`);
  };

  const addEvidence = (e: CognitiveIntakeEvidence) => {
    setWorkbench((w) => ({ ...w, addedEvidenceIds: [...w.addedEvidenceIds, e.id] }));
    toast.success(`Synthetic evidence added · ${e.name}`, { description: "Evidence gap closed for this demonstration session" });
    say(`${e.name} added. Evidence gap closed.`);
  };

  const toggleRelated = (r: CognitiveIntakeRelatedWork) => {
    setRelated((rs) => rs.map((x) => x.id === r.id ? { ...x, included: !x.included } : x));
    say(`${r.relatedRecordId} ${r.included ? "excluded" : "included"}`);
  };

  const prompt2 = (label: string) =>
    toast.info(`${label} is delivered in Prompt 2`, { description: "Prompt 1 establishes the core Cognitive Intake experience." });

  const filterKeys = Object.keys(intakeFilterOptions) as (keyof IntakeFilters)[];
  const showWorkbench = prefs.view !== "operations";
  const showOperations = prefs.view === "operations" || prefs.view === "queue";
  const showExecutive = prefs.view === "executive";

  return (
    <div className="min-h-full bg-slate-50 px-5 py-4">
      <div aria-live="polite" role="status" className="sr-only">{announce}</div>

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Link to="/" className="hover:text-blue-700">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span>Evaluation &amp; Decision</span>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="font-medium text-slate-700">Cognitive Intake</span>
      </nav>

      <header className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Evaluation &amp; Decision</p>
          <h1 className="text-[19px] font-bold text-slate-900">Cognitive Intake</h1>
          <p className="text-[12px] text-slate-500">
            Transform incoming work into structured, evidence linked enterprise context before impact evaluation
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
          <Pill label={serviceState} tone={serviceState === "Operational" ? "green" : serviceState === "Needs Attention" ? "red" : "amber"} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={refresh}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Submit Work")}>Submit Work</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Import Work Item")}>Import Work Item</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => prompt2("Run Intake orchestration")}>Run Intake</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Export Intake")}>Export Intake</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">More</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
              <DropdownMenuLabel className="text-[11px]">Navigate</DropdownMenuLabel>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-lifecycle")}>Cognitive Intake Lifecycle</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-queue")}>Cognitive Intake Queue</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-workbench")}>Cognitive Intake Workbench</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-context-match")}>Enterprise Context Match</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-personas")}>Candidate Team Personas</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-evidence")}>Evidence Completeness</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-gaps")}>Clarification &amp; Gaps</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => scrollTo("panel-completeness")}>Intake Package Completeness</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px]">Available in Prompt 2</DropdownMenuLabel>
              {["Clarification Workflow", "Evidence Remediation", "Context Refresh", "Active Intake Jobs",
                "Bulk Actions", "Routing to Readiness", "Global Search", "Notifications", "Governed Export",
                "Demo Story", "Demo Scenarios"].map((l) => (
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
              placeholder="Search Intake" aria-label="Search Cognitive Intake"
              className="h-7 w-56 rounded-md border border-slate-200 px-2 text-[11px] focus:border-blue-400 focus:outline-none" />
            <FilterSelect label="Saved View" value={prefs.savedView} options={savedIntakeViews} onChange={(v) => setPref("savedView", v)} />
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => { setPage(1); toast.success("Filters applied", { description: `${filtered.length} work items match` }); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => { setPrefs({ ...prefs, filters: defaultIntakeFilters }); setSearch(""); setPage(1); toast.success("Filters cleared"); }}>Clear Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => toast.success("View saved", { description: `${prefs.savedView} updated with ${filterCount} active filters` })}>Save View</Button>
          </div>
        </div>
        {prefs.filtersOpen && (
          <div className="mt-2 grid gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {filterKeys.map((k) => (
              <FilterSelect key={k} label={intakeFilterLabels[k]} value={prefs.filters[k]}
                options={intakeFilterOptions[k]} onChange={(v) => setFilter(k, v)} />
            ))}
          </div>
        )}
      </section>

      {/* KPIs */}
      <div id="panel-kpis" className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {intakeKpis.map((k) => <IntakeKpiCard key={k.id} kpi={k} onClick={() => onKpi(k.id)} focused={kpiFocus === k.id} />)}
      </div>

      <div className="mt-2 space-y-2">
        <LifecyclePanel selectedStage={prefs.selectedStage} focus={lifecycleFocus} onFocus={setLifecycleFocus}
          onSelect={(id) => { setPref("selectedStage", id); scrollTo("panel-stage"); say(`${id} stage selected`); }} />

        <SelectedStagePanel stage={stage} rows={filtered} evidence={intakeEvidence} gaps={intakeGaps}
          entities={entityMatches} context={intakeContext}
          onOpenWorkbench={() => scrollTo("panel-workbench")}
          onOpenIntake={(id) => { const r = intakes.find((x) => x.id === id); if (r) openDetail(r); }}
          onViewLogs={() => toast.info(`${stage.name} logs`, { description: `Owner ${stage.owner} · SLA ${stage.slaStatus}` })} />

        <IntakeQueuePanel rows={filtered} view={prefs.view} density={prefs.density}
          hiddenColumns={prefs.hiddenColumns}
          onToggleColumn={(key) => setPref("hiddenColumns",
            prefs.hiddenColumns.includes(key) ? prefs.hiddenColumns.filter((c) => c !== key) : [...prefs.hiddenColumns, key])}
          selected={selected} onSelect={setSelected}
          sortKey={sortKey} sortDir={sortDir}
          onSort={(k) => { if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("asc"); } }}
          page={page} pageSize={prefs.view === "executive" ? 5 : 10} onPage={setPage}
          loading={loading} onOpen={openDetail} onOpenWorkbench={openWorkbench}
          actions={
            <>
              <FilterSelect label="Work Type" value={prefs.filters.workType} options={intakeFilterOptions.workType} onChange={(v) => setFilter("workType", v)} />
              <FilterSelect label="Status" value={prefs.filters.workStatus} options={intakeFilterOptions.workStatus} onChange={(v) => setFilter("workStatus", v)} />
              <FilterSelect label="Priority" value={prefs.filters.priority} options={intakeFilterOptions.priority} onChange={(v) => setFilter("priority", v)} />
              <FilterSelect label="Density" value={prefs.density} options={["compact", "standard", "comfortable"]}
                onChange={(v) => setPref("density", v as Density)} />
              <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={selected.size === 0}
                onClick={() => prompt2("Bulk actions")}>Bulk Actions</Button>
            </>
          } />

        {showWorkbench && (
          <IntakeWorkbench intake={selectedIntake} state={workbench} onState={setWorkbench}
            context={intakeContext} personas={intakePersonas} evidence={intakeEvidence}
            elements={intakeElements} result={result}
            onToggleContext={toggleContext} onTogglePersona={togglePersona}
            onOpenRecord={(id, type) => toast.info(`${type} · ${id}`, { description: "Opens the governed record in Enterprise Cognitive Memory" })}
            onSaveDraft={() => { toast.success("Draft saved", { description: `${selectedIntake.id} working state saved locally` }); say("Workbench draft saved"); }}
            onBuildPackage={() => {
              toast.success("Intake Package built", { description: `Completeness ${packageCompleteness}% · context confidence ${result.contextConfidence}%` });
              say(`Intake package built. Completeness ${packageCompleteness} percent.`);
              scrollTo("panel-completeness");
            }}
            onAddEvidence={addEvidence} />
        )}

        {showOperations && (
          <div className="grid gap-2 xl:grid-cols-2">
            <ClassificationPanel activeType={prefs.filters.workType}
              onFilterType={(t) => { setFilter("workType", prefs.filters.workType === t ? "All" : t); scrollTo("panel-queue"); }} />
            <DecompositionQualityPanel />
          </div>
        )}

        <ContextMatchPanel
          context={intakeContext.filter((c) => isContextActive(c, workbench) && (!contextTypeFilter || c.memoryType === contextTypeFilter))}
          activeType={contextTypeFilter}
          onFilterType={(t) => { setContextTypeFilter(t); if (t) scrollTo("panel-workbench"); }} />

        <CandidatePersonasPanel candidates={intakePersonas} onToggle={togglePersona} onPrimary={markPrimary}
          onOpen={(c) => navigate("/enterprise-cognitive-fabric/persona-studio/team-persona-library")} />

        <div className="grid gap-2 xl:grid-cols-2">
          <EvidencePanel evidence={intakeEvidence} coverage={result.evidenceCoverage}
            onOpen={(e) => toast.info(`${e.name}`, { description: `${e.source} · ${e.authority} · ${e.freshness}` })} />
          <RelatedWorkPanel rows={intakeRelated} onToggle={toggleRelated}
            onOpen={(r) => toast.info(`${r.relatedRecordId} · ${r.title}`, { description: `${r.relationshipType} · ${r.outcome}` })} />
        </div>

        <GapsPanel rows={intakeGaps} loading={loading}
          onOpenWorkbench={(g) => {
            const r = intakes.find((x) => x.id === g.intakeId);
            if (r) openWorkbench(r);
          }} />

        <PackageCompletenessPanel input={completenessInput}
          onNextStage={() => prompt2("Routing into Cognitive Readiness Assessment")} />

        {!showExecutive && <ActivityPanel onOpen={(id) => { const r = intakes.find((x) => x.id === id); if (r) openDetail(r); }} />}
      </div>

      <IntakeDetailDrawer open={detailOpen} onOpenChange={setDetailOpen} intake={detailIntake}
        elements={intakeElements} entities={entityMatches} context={intakeContext}
        personas={intakePersonas} evidence={intakeEvidence}
        gaps={seedGaps.filter((g) => g.intakeId === (detailIntake?.id ?? ""))}
        related={intakeRelated} packageCompleteness={packageCompleteness}
        onOpenWorkbench={() => { setDetailOpen(false); if (detailIntake) openWorkbench(detailIntake); }} />
    </div>
  );
}
