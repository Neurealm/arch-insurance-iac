/**
 * Organizational Learning — Prompt 1.
 *
 * Closes the Enterprise Cognitive Fabric feedback loop by turning observed
 * enterprise outcomes into evidence linked, bounded, reusable candidate
 * knowledge.
 *
 * OBSERVE. COMPARE. UNDERSTAND. VALIDATE. REMEMBER. REUSE.
 *
 * Prompt 2 will add validation, review, approval, consolidation, supersession,
 * memory publication, effectiveness tracking, search, notifications, export
 * and the demo story. Those actions exist here only as announcing placeholders.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Download, GitCompare, MoreHorizontal, Play, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pill } from "./persona-studio/primitives";
import {
  ActivityPanel, ApplicabilityPanel, AssumptionPanel, CausalConfidencePanel, ContradictionPanel,
  ControlEffectivenessPanel, ExpectedVsObservedPanel, HistoryPanel, KpiRow, LearningCandidatePanel,
  LearningQualityPanel, LearningQueuePanel, LearningPackagePanel, LifecyclePanel,
  MitigationEffectivenessPanel, PatternPanel, RelatedKnowledgePanel, RiskRealizationPanel,
  SelectedStagePanel, UnexpectedConsequencePanel, VarianceAnalysisPanel, type Density,
} from "./organizational-learning/panels";
import { OrganizationalLearningWorkbench, type WorkbenchSelection } from "./organizational-learning/workbench";
import {
  EvidenceDrawer, ExpectationDrawer, LearningCandidateDrawer, LearningEvaluationDrawer, VarianceDrawer,
} from "./organizational-learning/drawers";
import {
  activeFilterCount, analyses, analysisById, applicabilityFor, baselineParams, candidateById,
  defaultFilters, deriveLearningState, filterOptions, kpiFocusPanel, learningCandidates, olTone, olViews,
  seedActivity, stageById,
  type FilterKey, type LearningCandidate, type OlView, type OlWorkbenchParams,
  type OrganizationalLearningAnalysis,
} from "./organizational-learning/data";

const STORAGE_KEY = "ecf:organizational-learning:v1";

export default function OrganizationalLearning() {
  const navigate = useNavigate();

  /* --------------------------------------------------------------- ui state */
  const [view, setView] = useState<OlView>("queue");
  const [density, setDensity] = useState<Density>("standard");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Record<FilterKey, string>>(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState<Record<FilterKey, string>>(defaultFilters);
  const [savedView, setSavedView] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [candidateQuery, setCandidateQuery] = useState("");
  const [announce, setAnnounce] = useState("");
  const [kpiFocus, setKpiFocus] = useState<string | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [columnMenu, setColumnMenu] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState("Causal Confidence");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  /* ----------------------------------------------------------- domain state */
  const [selectedAnalysisId, setSelectedAnalysisId] = useState("OL 9001");
  const [selectedStage, setSelectedStage] = useState("OLS 5");
  const [selectedAssumption, setSelectedAssumption] = useState<string | null>(null);
  const [params, setParams] = useState<OlWorkbenchParams>(baselineParams);
  const [selection, setSelection] = useState<WorkbenchSelection>({
    expectationId: "EXO 2", observationId: "OBS 2", varianceId: "VAR 1",
    candidateId: "LC 1426", conditionId: null,
  });

  /* ---------------------------------------------------------------- drawers */
  const [detail, setDetail] = useState<OrganizationalLearningAnalysis | null>(null);
  const [candidateDrawer, setCandidateDrawer] = useState<LearningCandidate | null>(null);
  const [evidenceDrawer, setEvidenceDrawer] = useState<string | null>(null);
  const [expectationDrawer, setExpectationDrawer] = useState<string | null>(null);
  const [varianceDrawer, setVarianceDrawer] = useState<string | null>(null);

  const say = useCallback((m: string) => setAnnounce(m), []);

  /* ------------------------------------------------------------ persistence */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.view) setView(s.view);
        if (s.density) setDensity(s.density);
        if (s.hiddenColumns) setHiddenColumns(s.hiddenColumns);
        if (s.savedView) setSavedView(s.savedView);
        if (s.filters) { setFilters(s.filters); setPendingFilters(s.filters); }
        if (s.selectedAnalysisId) setSelectedAnalysisId(s.selectedAnalysisId);
        if (s.selectedStage) setSelectedStage(s.selectedStage);
        if (s.selection) setSelection(s.selection);
      }
    } catch { /* storage may be unavailable */ }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        view, density, hiddenColumns, savedView, filters, selectedAnalysisId, selectedStage, selection,
      }));
    } catch { /* storage may be unavailable */ }
  }, [view, density, hiddenColumns, savedView, filters, selectedAnalysisId, selectedStage, selection]);

  /* ------------------------------------------------------------- derivation */
  const derived = useMemo(() => deriveLearningState(params), [params]);
  const analysis = analysisById(selectedAnalysisId);
  const stage = stageById(selectedStage);
  const applicability = useMemo(() => applicabilityFor(selection.candidateId), [selection.candidateId]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = analyses.filter((a) => {
      if (filters.businessUnit !== "All" && a.businessUnit !== filters.businessUnit) return false;
      if (filters.decisionOwner !== "All" && a.decisionOwner !== filters.decisionOwner) return false;
      if (filters.decisionType !== "All" && a.decisionType !== filters.decisionType) return false;
      if (filters.submittingTeam !== "All" && a.submittingTeam !== filters.submittingTeam) return false;
      if (filters.affectedTeam !== "All" && !a.affectedTeams.includes(filters.affectedTeam)) return false;
      if (filters.knowledgeDomain !== "All" && a.knowledgeDomain !== filters.knowledgeDomain) return false;
      if (filters.product !== "All" && a.product !== filters.product) return false;
      if (filters.service !== "All" && a.service !== filters.service) return false;
      if (filters.system !== "All" && a.system !== filters.system) return false;
      if (filters.customerJourney !== "All" && a.customerJourney !== filters.customerJourney) return false;
      if (filters.outcomeStatus !== "All" && a.outcomeStatus !== filters.outcomeStatus) return false;
      if (filters.learningStatus !== "All" && a.learningStatus !== filters.learningStatus) return false;
      if (filters.varianceDirection !== "All" && a.varianceDirection !== filters.varianceDirection) return false;
      if (filters.varianceSeverity !== "All" && a.varianceSeverity !== filters.varianceSeverity) return false;
      if (filters.environment !== "All" && a.environment !== filters.environment) return false;
      if (filters.region !== "All" && a.region !== filters.region) return false;
      if (filters.observationWindow !== "All" && a.observationWindow !== filters.observationWindow) return false;
      if (filters.evidenceCoverage !== "All") {
        if (filters.evidenceCoverage === "Below 85%" && a.evidenceCoverage >= 85) return false;
        if (filters.evidenceCoverage === "85-95%" && (a.evidenceCoverage < 85 || a.evidenceCoverage > 95)) return false;
        if (filters.evidenceCoverage === "Above 95%" && a.evidenceCoverage <= 95) return false;
      }
      if (filters.causalConfidence !== "All") {
        const band = a.causalConfidence >= 90 ? "High" : a.causalConfidence >= 78 ? "Moderate" : "Low";
        if (band !== filters.causalConfidence) return false;
      }
      if (filters.learningType !== "All"
        && !a.learningCandidateIds.some((id) => candidateById(id)?.learningType === filters.learningType)) return false;
      if (q && ![a.id, a.decisionId, a.workItem, a.owner, a.decisionOwner].join(" ").toLowerCase().includes(q)) return false;
      if (kpiFocus === "variance" && a.materialVariances === 0) return false;
      if (kpiFocus === "candidates" && a.learningCandidateIds.length === 0) return false;
      if (kpiFocus === "reconciliation" && a.outcomeStatus !== "Fully Reconciled") return false;
      if (kpiFocus === "coverage" && a.evidenceCoverage >= 95) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "Evidence Coverage": return (a.evidenceCoverage - b.evidenceCoverage) * dir;
        case "Causal Confidence": return (a.causalConfidence - b.causalConfidence) * dir;
        case "Material Variances": return (a.materialVariances - b.materialVariances) * dir;
        default: return a.id.localeCompare(b.id) * dir;
      }
    });
    return list;
  }, [filters, query, sortKey, sortDir, kpiFocus]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const candidateRows = useMemo(() => {
    const q = candidateQuery.trim().toLowerCase();
    return learningCandidates.filter((c) =>
      !q || [c.id, c.title, c.learningType, c.decisionId].join(" ").toLowerCase().includes(q));
  }, [candidateQuery]);

  /* ---------------------------------------------------------------- actions */
  const focusPanel = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const refresh = () => {
    say("Refreshing organizational learning");
    window.setTimeout(() => say("Organizational learning refreshed"), 320);
  };

  const onKpi = (id: string) => {
    setKpiFocus((prev) => (prev === id ? null : id));
    setPage(1);
    focusPanel(kpiFocusPanel(id));
    say(`${id} focus applied`);
  };

  const changeParams = (p: Partial<OlWorkbenchParams>) => {
    setParams((prev) => {
      const next = { ...prev, ...p };
      const before = deriveLearningState(prev);
      const after = deriveLearningState(next);
      const notes: string[] = [];
      if (after.causalConfidence !== before.causalConfidence) notes.push(`causal confidence ${before.causalConfidence}% to ${after.causalConfidence}%`);
      if (after.evidenceCoverage !== before.evidenceCoverage) notes.push(`evidence coverage ${before.evidenceCoverage}% to ${after.evidenceCoverage}%`);
      if (!before.extrapolationWarning && after.extrapolationWarning) notes.push("extrapolation beyond observed evidence is not supported");
      window.setTimeout(() => say(notes.length ? notes.join(". ") : "Workbench parameters updated"), 0);
      return next;
    });
  };

  const prompt2 = (label: string) => say(`${label} becomes available in Prompt 2 of Organizational Learning`);

  const onNavigateFromDetail = (target: string) => {
    if (target === "decision") navigate("/enterprise-cognitive-fabric/evaluation/decision-intelligence");
    else if (target === "persona") navigate("/enterprise-cognitive-fabric/persona-studio/team-persona-library");
    else if (target === "condition") navigate("/enterprise-cognitive-fabric/discovery/business-condition-extraction");
    else {
      setDetail(null);
      focusPanel(target === "workbench" ? "panel-workbench" : "panel-matrix");
    }
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
    say(`${activeFilterCount(pendingFilters)} filters applied`);
  };
  const clearFilters = () => {
    setFilters(defaultFilters); setPendingFilters(defaultFilters); setPage(1); setSavedView(null);
    say("Filters cleared");
  };

  const emphasis: Record<OlView, string[]> = {
    queue: ["queue", "lifecycle", "stage"],
    workbench: ["workbench", "matrix", "candidates", "applicability"],
    outcome: ["matrix", "variance", "risk", "controls", "mitigations", "unexpected"],
    pattern: ["patterns", "related", "contradictions", "candidates"],
  };
  const leads = emphasis[view];
  const lead = (id: string) => (leads.includes(id) ? "order-first ring-1 ring-blue-200" : "");

  return (
    <div className="min-h-full bg-slate-50 p-3 text-slate-800">
      <p aria-live="polite" className="sr-only">{announce}</p>

      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-slate-500">
        <Link to="/" className="hover:text-slate-700">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/enterprise-cognitive-fabric" className="hover:text-slate-700">Enterprise Cognitive Fabric</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span>Learning &amp; Health</span>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="font-medium text-slate-700">Organizational Learning</span>
      </nav>

      <header className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Learning &amp; Health</p>
          <h1 className="text-[19px] font-bold text-slate-900">Organizational Learning</h1>
          <p className="text-[12px] text-slate-500">
            Compare expected and observed outcomes, validate reusable lessons, and improve the context available to future enterprise decisions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="View selector">
            {olViews.map((v) => (
              <button key={v.id} role="tab" aria-selected={view === v.id} type="button"
                onClick={() => { setView(v.id); setPage(1); say(`${v.label} view selected`); }}
                className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  view === v.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Pill label={derived.serviceState} tone={olTone(derived.serviceState)} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={refresh}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
          <Button size="sm" className="h-7 text-[11px]"
            onClick={() => { setView("workbench"); focusPanel("panel-workbench"); say("Learning analysis workbench focused"); }}>
            <Play className="mr-1 h-3.5 w-3.5" aria-hidden /> Start Learning Analysis
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { setView("queue"); focusPanel("panel-queue"); say("Learning queue focused for decision selection"); }}>
            Select Decision
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { setView("outcome"); focusPanel("panel-matrix"); say("Expected versus observed matrix focused"); }}>
            <GitCompare className="mr-1 h-3.5 w-3.5" aria-hidden /> Compare Outcomes
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Publish Learning")}>Publish Learning</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Governed Export")}>
            <Download className="mr-1 h-3.5 w-3.5" aria-hidden /> Export
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" aria-label="More actions"
            onClick={() => prompt2("Additional learning operations")}>
            <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </header>

      {/* -------------------------------------------------------------- filters */}
      <section aria-label="Enterprise filters" className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}
            className="text-[12px] font-semibold text-slate-800 hover:text-slate-600">
            Enterprise Filters {activeFilterCount(filters) > 0 && (
              <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">{activeFilterCount(filters)} active</span>
            )}
          </button>
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="h-7 text-[11px]" onClick={applyFilters}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={clearFilters}>Clear Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => { setSavedView(`Learning view ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`); say("View saved"); }}>
              Save View
            </Button>
          </div>
        </div>
        {filtersOpen && (
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
            {filterOptions.map((f) => (
              <FilterSelect key={f.key} label={f.label} value={pendingFilters[f.key]} options={f.options}
                onChange={(v) => setPendingFilters((p) => ({ ...p, [f.key]: v }))} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-2"><KpiRow focus={kpiFocus} onSelect={onKpi} /></div>

      <div className="mt-2 flex flex-col gap-2">
        <div className={lead("lifecycle")}>
          <LifecyclePanel selected={selectedStage} onSelect={(id) => { setSelectedStage(id); say(`${stageById(id).name} stage selected`); }} />
        </div>

        <div className={lead("stage")}><SelectedStagePanel stage={stage} /></div>

        <div className={lead("queue")}>
          <LearningQueuePanel
            rows={pageRows} density={density} hiddenColumns={hiddenColumns} query={query}
            onQuery={(v) => { setQuery(v); setPage(1); }}
            sortKey={sortKey} sortDir={sortDir}
            onSort={(k) => { if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc")); else { setSortKey(k); setSortDir("desc"); } }}
            page={page} pageCount={pageCount} onPage={setPage}
            selected={selectedRows}
            onToggle={(id) => setSelectedRows((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
            onOpen={(a) => { setSelectedAnalysisId(a.id); setDetail(a); say(`${a.id} learning detail opened`); }}
            columnMenu={columnMenu} onColumnMenu={setColumnMenu}
            onToggleColumn={(c) => setHiddenColumns((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}
            onDensity={setDensity} savedView={savedView} />
        </div>

        <div className={lead("workbench")}>
          <OrganizationalLearningWorkbench
            params={params} derived={derived} selection={selection}
            onSelect={(s) => setSelection((prev) => ({ ...prev, ...s }))}
            onParams={changeParams} />
        </div>

        <div className={lead("matrix")}>
          <ExpectedVsObservedPanel
            selectedMetric={selection.expectationId}
            onOpenEvidence={setEvidenceDrawer}
            onOpenExpectation={setExpectationDrawer}
            onOpenVariance={setVarianceDrawer} />
        </div>

        <div className={lead("variance")}><VarianceAnalysisPanel derived={derived} /></div>

        <AssumptionPanel selected={selectedAssumption} onSelect={setSelectedAssumption} />

        <div className={lead("risk")}><RiskRealizationPanel /></div>

        <div className={lead("controls")}>
          <ControlEffectivenessPanel onCandidate={(id) => { const c = candidateById(id); if (c) setCandidateDrawer(c); }} />
        </div>

        <div className={lead("mitigations")}><MitigationEffectivenessPanel /></div>

        <div className={lead("unexpected")}>
          <UnexpectedConsequencePanel onCandidate={(id) => { const c = candidateById(id); if (c) setCandidateDrawer(c); }} />
        </div>

        <div className={lead("candidates")}>
          <LearningCandidatePanel
            candidates={candidateRows} query={candidateQuery} onQuery={setCandidateQuery}
            onOpen={(c) => { setCandidateDrawer(c); setSelection((p) => ({ ...p, candidateId: c.id })); }}
            onCompare={(c) => { setSelection((p) => ({ ...p, candidateId: c.id })); focusPanel("panel-related"); say(`Comparing ${c.id} against existing organizational knowledge`); }} />
        </div>

        <CausalConfidencePanel candidateId={selection.candidateId} derived={derived} />

        <div className={lead("applicability")}>
          <ApplicabilityPanel candidateId={selection.candidateId} records={applicability} derived={derived} />
        </div>

        <div className={lead("related")}><RelatedKnowledgePanel /></div>

        <div className={lead("contradictions")}>
          <ContradictionPanel onCandidate={(id) => { const c = candidateById(id); if (c) setCandidateDrawer(c); }} />
        </div>

        <div className={lead("patterns")}><PatternPanel /></div>

        <LearningQualityPanel />

        <div className={lead("package")}><LearningPackagePanel derived={derived} onPrompt2={prompt2} /></div>

        <HistoryPanel />

        <ActivityPanel items={seedActivity} />
      </div>

      <LearningEvaluationDrawer analysis={detail} derived={derived} onClose={() => setDetail(null)} onNavigate={onNavigateFromDetail} />
      <LearningCandidateDrawer candidate={candidateDrawer} derived={derived} onClose={() => setCandidateDrawer(null)} onPrompt2={prompt2} />
      <EvidenceDrawer evidenceId={evidenceDrawer} onClose={() => setEvidenceDrawer(null)} />
      <ExpectationDrawer expectationId={expectationDrawer} onClose={() => setExpectationDrawer(null)} />
      <VarianceDrawer varianceId={varianceDrawer} onClose={() => setVarianceDrawer(null)} />
    </div>
  );
}
