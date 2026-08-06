/**
 * Decision Intelligence — Prompt 1.
 *
 * Transforms governed enterprise context into an explainable decision
 * environment. It compares alternatives, exposes tradeoffs, and prepares a
 * Decision Context Package. It never records the final human decision.
 *
 * MAKE THE TRADEOFFS VISIBLE BEFORE THE DECISION BECOMES SOMEONE ELSE'S CONSEQUENCE.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Download, MoreHorizontal, RefreshCw, Search, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pill, type Tone } from "./persona-studio/primitives";
import {
  ActivityPanel, AlternativeComparisonPanel, ConstraintPanel, DecisionContextPackagePanel,
  DecisionQualityPanel, DecisionQueuePanel, DependencyPanel, EvidenceSufficiencyPanel,
  ExecutiveSummaryPanel, ExpectedOutcomePanel, KpiRow, LifecyclePanel, PersonaPositionsPanel,
  PriorDecisionPanel, RecommendationSynthesisPanel, RiskControlPanel, SelectedStagePanel,
  TradeoffPanel, queueColumns, type ComparisonLens, type Density,
} from "./decision-intelligence/panels";
import { DecisionWorkbench } from "./decision-intelligence/workbench";
import {
  AlternativeCellDrawer, AlternativeDrawer, ConstraintDrawer, DecisionDetailDrawer,
  EvidenceDrawer, PriorDecisionDrawer,
} from "./decision-intelligence/drawers";
import {
  activeFilterCount, baselineProposal, defaultFilters, deriveDecisionState, diTone, diViews,
  evaluationById, evaluations, filterOptions, kpiFocusPanel, operationalState, seedActivity,
  stageById,
  type ComparisonRow, type DecisionAlternative, type DecisionConstraint,
  type DecisionIntelligenceEvaluation, type DiEvidence, type DiView, type FilterKey,
  type PriorDecision, type ProposalParams,
} from "./decision-intelligence/data";

const STORAGE_KEY = "ecf:decision-intelligence:v1";

export default function DecisionIntelligence() {
  const navigate = useNavigate();

  /* --------------------------------------------------------------- ui state */
  const [view, setView] = useState<DiView>("queue");
  const [density, setDensity] = useState<Density>("standard");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Record<FilterKey, string>>(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState<Record<FilterKey, string>>(defaultFilters);
  const [savedView, setSavedView] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [announce, setAnnounce] = useState("");
  const [kpiFocus, setKpiFocus] = useState<string | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [columnMenu, setColumnMenu] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState("Confidence");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  /* ----------------------------------------------------------- domain state */
  const [selectedDecisionId, setSelectedDecisionId] = useState("DIA 5001");
  const [selectedStage, setSelectedStage] = useState("DIS 12");
  const [params, setParams] = useState<ProposalParams>(baselineProposal);
  const [selectedAlternatives, setSelectedAlternatives] = useState<string[]>(["ALT 5001 B"]);
  const [selectedPersona, setSelectedPersona] = useState<string | null>("PER 4101");
  const [selectedConstraint, setSelectedConstraint] = useState<string | null>(null);
  const [selectedDependency, setSelectedDependency] = useState<string | null>(null);
  const [selectedPrior, setSelectedPrior] = useState<string | null>(null);
  const [selectedTradeoff, setSelectedTradeoff] = useState<string | null>(null);
  const [lens, setLens] = useState<ComparisonLens>("all");

  /* ---------------------------------------------------------------- drawers */
  const [detail, setDetail] = useState<DecisionIntelligenceEvaluation | null>(null);
  const [cellDetail, setCellDetail] = useState<{ row: ComparisonRow; alternativeId: string } | null>(null);
  const [altDrawer, setAltDrawer] = useState<DecisionAlternative | null>(null);
  const [evidenceDrawer, setEvidenceDrawer] = useState<DiEvidence | null>(null);
  const [constraintDrawer, setConstraintDrawer] = useState<DecisionConstraint | null>(null);
  const [priorDrawer, setPriorDrawer] = useState<PriorDecision | null>(null);

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
        if (s.selectedDecisionId) setSelectedDecisionId(s.selectedDecisionId);
        if (s.selectedStage) setSelectedStage(s.selectedStage);
      }
    } catch { /* storage may be unavailable */ }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        view, density, hiddenColumns, savedView, selectedDecisionId, selectedStage,
      }));
    } catch { /* storage may be unavailable */ }
  }, [view, density, hiddenColumns, savedView, selectedDecisionId, selectedStage]);

  /* ------------------------------------------------------------- derivation */
  const derived = useMemo(() => deriveDecisionState(params), [params]);
  const evaluation = evaluationById(selectedDecisionId);
  const stage = stageById(selectedStage);
  const serviceState = operationalState(derived);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = evaluations.filter((e) => {
      if (filters.businessUnit !== "All" && e.businessUnit !== filters.businessUnit) return false;
      if (filters.submittingTeam !== "All" && e.submittingTeam !== filters.submittingTeam) return false;
      if (filters.decisionOwner !== "All" && e.decisionOwner !== filters.decisionOwner) return false;
      if (filters.decisionType !== "All" && e.decisionType !== filters.decisionType) return false;
      if (filters.workType !== "All" && e.workType !== filters.workType) return false;
      if (filters.priority !== "All" && e.priority !== filters.priority) return false;
      if (filters.decisionStatus !== "All" && e.status !== filters.decisionStatus) return false;
      if (filters.recommendationState !== "All" && e.recommendationPosture !== filters.recommendationState) return false;
      if (filters.riskLevel !== "All" && e.riskLevel !== filters.riskLevel) return false;
      if (filters.customerImpact !== "All" && e.customerImpact !== filters.customerImpact) return false;
      if (filters.financialImpact !== "All" && e.financialImpact !== filters.financialImpact) return false;
      if (filters.operationalImpact !== "All" && e.operationalImpact !== filters.operationalImpact) return false;
      if (filters.securityImpact !== "All" && e.securityImpact !== filters.securityImpact) return false;
      if (filters.complianceImpact !== "All" && e.complianceImpact !== filters.complianceImpact) return false;
      if (filters.customerJourney !== "All" && e.customerJourney !== filters.customerJourney) return false;
      if (filters.environment !== "All" && e.environment !== filters.environment) return false;
      if (filters.region !== "All" && e.region !== filters.region) return false;
      if (filters.reviewStatus !== "All" && e.reviewStatus !== filters.reviewStatus) return false;
      if (filters.approvalRequirement !== "All" && e.approvalRequirement !== filters.approvalRequirement) return false;
      if (filters.knowledgeDomain !== "All" && e.knowledgeDomain !== filters.knowledgeDomain) return false;
      if (filters.confidenceBand !== "All") {
        if (filters.confidenceBand === "Below 90%" && e.recommendationConfidence >= 90) return false;
        if (filters.confidenceBand === "90-94%" && (e.recommendationConfidence < 90 || e.recommendationConfidence > 94)) return false;
        if (filters.confidenceBand === "Above 94%" && e.recommendationConfidence <= 94) return false;
      }
      if (filters.evidenceCoverage !== "All") {
        if (filters.evidenceCoverage === "Below 85%" && e.evidenceCoverage >= 85) return false;
        if (filters.evidenceCoverage === "85-95%" && (e.evidenceCoverage < 85 || e.evidenceCoverage > 95)) return false;
        if (filters.evidenceCoverage === "Above 95%" && e.evidenceCoverage <= 95) return false;
      }
      if (q && ![e.id, e.workItem, e.decisionQuestion, e.submittingTeam, e.decisionOwner].join(" ").toLowerCase().includes(q)) return false;
      if (kpiFocus === "conflicts" && e.materialConflictCount === 0) return false;
      if (kpiFocus === "evidence" && e.evidenceCoverage >= 95) return false;
      if (kpiFocus === "active" && e.status === "Paused") return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "Confidence": return (a.recommendationConfidence - b.recommendationConfidence) * dir;
        case "Evidence Coverage": return (a.evidenceCoverage - b.evidenceCoverage) * dir;
        case "Material Conflicts": return (a.materialConflictCount - b.materialConflictCount) * dir;
        default: return a.id.localeCompare(b.id) * dir;
      }
    });
    return list;
  }, [filters, query, sortKey, sortDir, kpiFocus]);

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  /* ---------------------------------------------------------------- actions */
  const focusPanel = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const refresh = () => { say("Refreshing decision intelligence"); window.setTimeout(() => say("Decision intelligence refreshed"), 320); };

  const onKpi = (id: string) => {
    setKpiFocus((prev) => (prev === id ? null : id));
    setPage(1);
    focusPanel(kpiFocusPanel(id));
    say(`${id} focus applied`);
  };

  const toggleAlternative = (id: string) => {
    setSelectedAlternatives((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    say(`Alternative ${id} selection changed`);
  };

  const toggleRow = (id: string) =>
    setSelectedRows((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const prompt2 = (label: string) => say(`${label} becomes available in Prompt 2 of Decision Intelligence`);

  const onNavigateFromDetail = (target: string) => {
    if (target === "cross-team") navigate("/enterprise-cognitive-fabric/evaluation/cross-team-impact-matrix");
    else if (target === "persona-impact") navigate("/enterprise-cognitive-fabric/evaluation/persona-impact-analysis");
    else {
      setDetail(null);
      focusPanel(target === "workbench" ? "panel-workbench" : target === "evidence" ? "panel-evidence" : "panel-prior");
    }
  };

  const emphasis: Record<DiView, string[]> = {
    queue: ["queue", "lifecycle", "stage"],
    workbench: ["workbench", "tradeoffs", "evidence", "recommendation"],
    comparison: ["comparison", "positions", "risks", "outcomes"],
    executive: ["executive", "recommendation", "package", "quality"],
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
        <span>Evaluation &amp; Decision</span>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="font-medium text-slate-700">Decision Intelligence</span>
      </nav>

      <header className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Evaluation &amp; Decision</p>
          <h1 className="text-[19px] font-bold text-slate-900">Decision Intelligence</h1>
          <p className="text-[12px] text-slate-500">
            Compare alternatives, expose enterprise tradeoffs, and create evidence linked decision context before action is taken
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="View selector">
            {diViews.map((v) => (
              <button key={v.id} role="tab" aria-selected={view === v.id} type="button"
                onClick={() => { setView(v.id); setPage(1); say(`${v.label} view selected`); }}
                className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  view === v.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Pill label={serviceState} tone={diTone(serviceState) as Tone} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={refresh}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => prompt2("Start Decision Analysis")}>Start Decision Analysis</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { setView("comparison"); focusPanel("panel-comparison"); say("Alternative comparison focused"); }}>
            <Scale className="mr-1 h-3.5 w-3.5" aria-hidden /> Compare Alternatives
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => focusPanel("panel-evidence")}>Open Evidence</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Record Decision")}>Record Decision</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Governed Export")}>
            <Download className="mr-1 h-3.5 w-3.5" aria-hidden /> Export
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" aria-label="More actions" onClick={() => prompt2("Additional decision operations")}>
            <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </header>

      {/* --------------------------------------------------------- filters */}
      <section className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Enterprise filters">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-1 text-[12px] font-semibold text-slate-700">
            Enterprise Filters
            <span className="rounded bg-blue-100 px-1.5 text-[10px] text-blue-700">{activeFilterCount(filters)} active</span>
            <ChevronRight className={cn("h-3.5 w-3.5 transition", filtersOpen && "rotate-90")} aria-hidden />
          </button>
          <div className="flex items-center gap-1.5">
            <label className="sr-only" htmlFor="di-search">Search decisions</label>
            <div className="flex items-center gap-1 rounded border border-slate-200 px-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <input id="di-search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search decisions" className="h-7 w-52 text-[11px] outline-none" />
            </div>
            <select aria-label="Table density" value={density} onChange={(e) => setDensity(e.target.value as Density)}
              className="h-7 rounded border border-slate-200 px-1.5 text-[11px]">
              <option value="compact">Compact</option>
              <option value="standard">Standard</option>
              <option value="comfortable">Comfortable</option>
            </select>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setColumnMenu((o) => !o)}>Columns</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => { setSavedView(`Saved view · ${activeFilterCount(pendingFilters)} filters`); say("View saved locally"); }}>
              Save View
            </Button>
          </div>
        </div>

        {columnMenu && (
          <div className="mt-2 flex flex-wrap gap-2 rounded border border-slate-200 p-2">
            {queueColumns.map((c) => (
              <label key={c} className="flex items-center gap-1 text-[10.5px] text-slate-600">
                <input type="checkbox" checked={!hiddenColumns.includes(c)}
                  onChange={() => setHiddenColumns((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))} />
                {c}
              </label>
            ))}
          </div>
        )}

        {filtersOpen && (
          <>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
              {(Object.keys(filterOptions) as FilterKey[]).map((k) => (
                <FilterSelect key={k} label={filterOptions[k].label} value={pendingFilters[k]}
                  options={filterOptions[k].options} onChange={(v) => setPendingFilters((p) => ({ ...p, [k]: v }))} />
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              <Button size="sm" className="h-7 text-[11px]" onClick={() => { setFilters(pendingFilters); setPage(1); say("Filters applied"); }}>Apply Filters</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]"
                onClick={() => { setPendingFilters(defaultFilters); setFilters(defaultFilters); setKpiFocus(null); setPage(1); say("Filters cleared"); }}>
                Clear Filters
              </Button>
              {savedView && <span className="self-center text-[10.5px] text-slate-500">{savedView}</span>}
            </div>
          </>
        )}
      </section>

      {/* ------------------------------------------------------------- KPIs */}
      <div className="mt-2"><KpiRow focus={kpiFocus} onFocus={onKpi} /></div>

      <div className="mt-2 space-y-2">
        <LifecyclePanel selected={selectedStage} onSelect={(id) => { setSelectedStage(id); say(`${stageById(id).name} stage selected`); }} />

        <SelectedStagePanel stage={stage} evaluation={evaluationById("DIA 5001")} derived={derived} density={density}
          onOpenEvidence={setEvidenceDrawer} onOpenAlternative={setAltDrawer} />

        {view === "executive" && <ExecutiveSummaryPanel evaluation={evaluation} derived={derived} />}

        <div className={lead("queue")}>
          <DecisionQueuePanel rows={pageRows} total={rows.length} page={page} pageSize={pageSize} onPage={setPage}
            density={density} hiddenColumns={hiddenColumns} sortKey={sortKey} sortDir={sortDir}
            onSort={(k) => { setSortKey(k); setSortDir((d) => (d === "asc" ? "desc" : "asc")); }}
            selected={selectedRows} onToggleRow={toggleRow}
            onOpen={(e) => { setDetail(e); setSelectedDecisionId(e.id); say(`${e.id} detail opened`); }} />
        </div>

        <DecisionWorkbench
          evaluation={evaluationById("DIA 5001")} derived={derived} params={params}
          onParams={(p) => { setParams((prev) => ({ ...prev, ...p })); say("Proposal parameters changed, recommendation context updated"); }}
          selectedAlternatives={selectedAlternatives} onToggleAlternative={toggleAlternative}
          selectedPersona={selectedPersona} onSelectPersona={setSelectedPersona}
          selectedConstraint={selectedConstraint} onSelectConstraint={setSelectedConstraint}
          selectedDependency={selectedDependency} onSelectDependency={setSelectedDependency}
          selectedPrior={selectedPrior} onSelectPrior={setSelectedPrior}
        />

        <AlternativeComparisonPanel evaluationId="DIA 5001" lens={lens} onLens={setLens}
          selectedAlternatives={selectedAlternatives}
          onCell={(row, alternativeId) => setCellDetail({ row, alternativeId })} />

        <PersonaPositionsPanel evaluationId="DIA 5001" selectedPersona={selectedPersona}
          onSelectPersona={setSelectedPersona} selectedAlternatives={selectedAlternatives} />

        <TradeoffPanel evaluationId="DIA 5001" selectedId={selectedTradeoff}
          onSelect={(t) => setSelectedTradeoff((p) => (p === t.id ? null : t.id))} />

        <ConstraintPanel evaluationId="DIA 5001" derived={derived} onSelect={setConstraintDrawer} />

        <RiskControlPanel evaluationId="DIA 5001" derived={derived} selectedAlternatives={selectedAlternatives} />

        <DependencyPanel selectedId={selectedDependency} selectedAlternatives={selectedAlternatives}
          onSelect={(id) => setSelectedDependency((p) => (p === id ? null : id))} />

        <ExpectedOutcomePanel evaluationId="DIA 5001" selectedAlternatives={selectedAlternatives} />

        <PriorDecisionPanel selectedId={selectedPrior} onSelect={(d) => { setSelectedPrior(d.id); setPriorDrawer(d); }} />

        <EvidenceSufficiencyPanel evaluationId="DIA 5001" derived={derived}
          removed={params.removedEvidence} added={params.addedEvidence}
          onToggleRemove={(id) => setParams((p) => ({
            ...p, removedEvidence: p.removedEvidence.includes(id) ? p.removedEvidence.filter((x) => x !== id) : [...p.removedEvidence, id],
          }))}
          onToggleAdd={(id) => setParams((p) => ({
            ...p, addedEvidence: p.addedEvidence.includes(id) ? p.addedEvidence.filter((x) => x !== id) : [...p.addedEvidence, id],
          }))}
          onOpen={setEvidenceDrawer} />

        <RecommendationSynthesisPanel derived={derived} evaluationId="DIA 5001" />

        <DecisionQualityPanel />

        <DecisionContextPackagePanel evaluation={evaluationById("DIA 5001")} derived={derived} onOpenPrompt2={prompt2} />

        <ActivityPanel items={seedActivity} />
      </div>

      <DecisionDetailDrawer evaluation={detail} derived={derived} onClose={() => setDetail(null)} onNavigate={onNavigateFromDetail} />
      <AlternativeCellDrawer cell={cellDetail} onClose={() => setCellDetail(null)} onOpen={(t) => { setCellDetail(null); focusPanel(t); }} />
      <AlternativeDrawer alternative={altDrawer} onClose={() => setAltDrawer(null)} />
      <EvidenceDrawer evidence={evidenceDrawer} onClose={() => setEvidenceDrawer(null)} />
      <ConstraintDrawer constraint={constraintDrawer} onClose={() => setConstraintDrawer(null)} />
      <PriorDecisionDrawer decision={priorDrawer} onClose={() => setPriorDrawer(null)} />
    </div>
  );
}
