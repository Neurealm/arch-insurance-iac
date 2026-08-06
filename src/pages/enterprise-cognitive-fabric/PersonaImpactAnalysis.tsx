/**
 * Persona Impact Analysis — evaluates proposed enterprise work through the
 * specific operating context of the Team Personas it affects.
 *
 * This page explains impact. It does not decide, approve, or predict outcomes.
 * Every conclusion traces to an approved Persona, a Business Condition, an
 * Enterprise Entity relationship, or an explicit evidence gap.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pill } from "./persona-studio/primitives";
import {
  AnalysisActivityPanel, ConditionsPanel, ConflictPanel, EvaluationQueuePanel, EvidenceSufficiencyPanel,
  ImpactQualityPanel, IntakeKpiCard, LifecyclePanel, OpportunityPanel, Panel, PersonaSummaryPanel,
  PropagationGraphPanel, ResultPackagePanel, SelectedStagePanel, SharedImpactPanel, SimpleTable,
  type Density,
} from "./persona-impact/panels";
import { ImpactWorkbench } from "./persona-impact/workbench";
import {
  ConditionDrawer, ConflictDrawer, EvaluationDetailDrawer, EvidenceDrawer, GraphNodeDrawer, PersonaContextDrawer,
} from "./persona-impact/drawers";
import {
  defaultFilters, evaluatePersona, evaluations, filterOptions, initialProposal, lifecycleStages,
  personaById, piaKpis, piaViews, queueColumns, scorePersona, severityRank, stageById,
  type FilterKey, type GraphNode, type ImpactCondition, type ImpactEvidence,
  type PersonaImpactConflict, type PersonaImpactEvaluation, type PiaView, type ProposalState,
} from "./persona-impact/data";

const pct = (n: number) => `${Math.round(n)}%`;

export default function PersonaImpactAnalysis() {
  const [view, setView] = useState<PiaView>("queue");
  const [density, setDensity] = useState<Density>("standard");
  const [loading, setLoading] = useState(true);
  const [announce, setAnnounce] = useState("");

  const [filters, setFilters] = useState<Record<FilterKey, string>>(defaultFilters);
  const [query, setQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState(lifecycleStages[7].id);
  const [stageFocus, setStageFocus] = useState("Throughput");
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState("Impact Score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [proposal, setProposal] = useState<ProposalState>(initialProposal);
  const [personaId, setPersonaId] = useState("PER 4101");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);

  const [detail, setDetail] = useState<PersonaImpactEvaluation | null>(null);
  const [personaDrawer, setPersonaDrawer] = useState<string | null>(null);
  const [conditionDrawer, setConditionDrawer] = useState<ImpactCondition | null>(null);
  const [evidenceDrawer, setEvidenceDrawer] = useState<ImpactEvidence | null>(null);
  const [nodeDrawer, setNodeDrawer] = useState<GraphNode | null>(null);
  const [conflictDrawer, setConflictDrawer] = useState<PersonaImpactConflict | null>(null);

  const say = useCallback((m: string) => setAnnounce(m), []);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(t);
  }, []);

  const refresh = () => {
    setLoading(true);
    say("Refreshing persona impact analysis");
    window.setTimeout(() => { setLoading(false); say("Persona impact analysis refreshed"); }, 420);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = evaluations.filter((e) => {
      if (filters.Status !== "All" && e.status !== filters.Status) return false;
      if (filters.Severity !== "All" && e.highestSeverity !== filters.Severity) return false;
      if (filters.Stage !== "All" && stageById(e.currentStageId).name !== filters.Stage) return false;
      if (filters.Team !== "All" && e.submittingTeam !== filters.Team) return false;
      if (filters.Persona !== "All" && !e.selectedPersonaIds.some((p) => personaById(p).name === filters.Persona)) return false;
      if (q && !`${e.id} ${e.title} ${e.submittingTeam} ${e.owner}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (sortKey === "Highest Severity") return (severityRank(a.highestSeverity) - severityRank(b.highestSeverity)) * dir;
      if (sortKey === "Impact Score") return (a.aggregateImpactScore - b.aggregateImpactScore) * dir;
      if (sortKey === "Confidence") return (a.overallConfidence - b.overallConfidence) * dir;
      return a.id.localeCompare(b.id) * dir;
    });
    return list;
  }, [filters, query, sortKey, sortDir]);

  const stage = stageById(selectedStage);
  const stageFindings = useMemo(() => evaluatePersona(personaId, proposal), [personaId, proposal]);
  const currentScore = useMemo(() => scorePersona(personaId, proposal), [personaId, proposal]);

  const openEvaluation = (id: string) => {
    const e = evaluations.find((x) => x.id === id) ?? null;
    setDetail(e);
    say(`Opened ${id}`);
  };

  const toggleColumn = (key: string) =>
    setHiddenColumns((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const serviceState = currentScore.score >= 70 ? "Needs Attention" : currentScore.score >= 60 ? "Review Required" : "Operational";

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
        <span className="font-medium text-slate-700">Persona Impact Analysis</span>
      </nav>

      <header className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Evaluation &amp; Decision</p>
          <h1 className="text-[19px] font-bold text-slate-900">Persona Impact Analysis</h1>
          <p className="text-[12px] text-slate-500">
            Evaluate proposed work through the operating context of every affected Team Persona · explanation, not decision
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="View selector">
            {piaViews.map((v) => (
              <button key={v.id} role="tab" aria-selected={view === v.id} type="button"
                onClick={() => { setView(v.id); setPage(1); say(`${v.label} view selected`); }}
                className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  view === v.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Pill label={serviceState} tone={serviceState === "Operational" ? "green" : serviceState === "Needs Attention" ? "red" : "amber"} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={refresh}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
        </div>
      </header>

      {/* -------------------------------------------------------------- kpis */}
      <section aria-label="Impact analysis key indicators" className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {piaKpis.map((k) => <IntakeKpiCard key={k.label} kpi={k} />)}
      </section>

      {/* --------------------------------------------------------- lifecycle */}
      <div className="mt-2 space-y-2">
        <LifecyclePanel selectedStage={selectedStage} onSelect={(id) => { setSelectedStage(id); say(`${stageById(id).name} stage selected`); }}
          focus={stageFocus} onFocus={setStageFocus} />

        <SelectedStagePanel stage={stage} rows={rows} findings={stageFindings} onOpenEvaluation={openEvaluation} />

        {/* ------------------------------------------------------- workbench */}
        <ImpactWorkbench
          proposal={proposal} onProposal={setProposal}
          personaId={personaId} onPersona={setPersonaId}
          selectedFindingId={selectedFindingId} onSelectFinding={setSelectedFindingId}
          selectedConditionId={selectedConditionId} onSelectCondition={setSelectedConditionId}
          onOpenEvidence={setEvidenceDrawer} onOpenCondition={setConditionDrawer}
        />

        {/* ----------------------------------------------------------- queue */}
        <EvaluationQueuePanel
          rows={rows} view={view} density={density} hiddenColumns={hiddenColumns} onToggleColumn={toggleColumn}
          selected={selectedRows} onSelect={setSelectedRows}
          sortKey={sortKey} sortDir={sortDir}
          onSort={(k) => { if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("desc"); } }}
          page={page} pageSize={pageSize} onPage={setPage} loading={loading}
          onOpen={(r) => setDetail(r)}
          onOpenWorkbench={(r) => { setPersonaId(r.selectedPersonaIds[0]); setView("workbench"); say(`Workbench focused on ${r.id}`); }}
          actions={
            <>
              <label className="flex flex-col text-[9.5px] uppercase tracking-wide text-slate-500">
                Search
                <span className="relative">
                  <Search className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 text-slate-400" aria-hidden />
                  <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    placeholder="Evaluation, work item, team"
                    className="h-6 w-44 rounded border border-slate-200 bg-white pl-5 pr-1.5 text-[11px] normal-case tracking-normal" />
                </span>
              </label>
              {(Object.keys(filterOptions) as FilterKey[]).map((k) => (
                <label key={k} className="flex flex-col text-[9.5px] uppercase tracking-wide text-slate-500">
                  {k}
                  <select value={filters[k]} onChange={(e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); }}
                    className="h-6 rounded border border-slate-200 bg-white px-1 text-[11px] normal-case tracking-normal">
                    {filterOptions[k].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
              ))}
              <label className="flex flex-col text-[9.5px] uppercase tracking-wide text-slate-500">
                Density
                <select value={density} onChange={(e) => setDensity(e.target.value as Density)}
                  className="h-6 rounded border border-slate-200 bg-white px-1 text-[11px] normal-case tracking-normal">
                  <option value="compact">Compact</option>
                  <option value="standard">Standard</option>
                  <option value="comfortable">Comfortable</option>
                </select>
              </label>
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]"
                onClick={() => { setFilters(defaultFilters); setQuery(""); setHiddenColumns([]); setPage(1); say("Filters reset"); }}>
                Reset
              </Button>
            </>
          }
        />

        {/* ------------------------------------------------- comparison view */}
        <div className="grid gap-2 xl:grid-cols-2">
          <PersonaSummaryPanel proposal={proposal} selectedPersonaId={personaId}
            onSelectPersona={(id) => { setPersonaId(id); setPersonaDrawer(id); }} />
          <ConflictPanel proposal={proposal} onOpenConflict={setConflictDrawer} />
        </div>

        <SharedImpactPanel />

        {/* ----------------------------------------------- architecture view */}
        <PropagationGraphPanel onOpenNode={setNodeDrawer} />

        <div className="grid gap-2 xl:grid-cols-2">
          <ConditionsPanel activeConditionId={selectedConditionId}
            onSelect={(c) => { setSelectedConditionId(c.id); setConditionDrawer(c); }} />
          <EvidenceSufficiencyPanel proposal={proposal} onOpenEvidence={setEvidenceDrawer} />
        </div>

        <div className="grid gap-2 xl:grid-cols-2">
          <OpportunityPanel />
          <ImpactQualityPanel />
        </div>

        <ResultPackagePanel proposal={proposal}
          onSendToMatrix={() => say("Impact result package prepared for Cross Team Impact Matrix")}
          onSendToDecision={() => say("Impact result package prepared for Decision Intelligence")} />

        <AnalysisActivityPanel onOpen={openEvaluation} />

        <Panel id="panel-scope" title="Scope Boundary"
          subtitle="What this page does and what belongs to adjacent Enterprise Cognitive Fabric capabilities">
          <SimpleTable head={["Concern", "Owned Here", "Owned Elsewhere"]}
            rows={[
              ["Persona specific impact explanation", "Yes", "—"],
              ["Approval decision", "No", "Decision Intelligence"],
              ["Cross team conflict resolution", "No", "Cross Team Impact Matrix"],
              ["Readiness score", "No", "Cognitive Readiness Assessment"],
              ["Persona authoring", "No", "Team Persona Construction"],
              ["Condition authoring", "No", "Business Condition Extraction"],
              ["Work structuring", "No", "Cognitive Intake"],
            ]} />
          <p className="mt-1 text-[10.5px] text-slate-500">
            Current selection: {personaById(personaId).name} · impact score {currentScore.score} ·
            {" "}confidence {pct(currentScore.confidence)} · {currentScore.classification}
          </p>
        </Panel>
      </div>

      {/* ------------------------------------------------------------ drawers */}
      <EvaluationDetailDrawer open={!!detail} onOpenChange={(v) => !v && setDetail(null)}
        evaluation={detail} proposal={proposal}
        onOpenWorkbench={() => { if (detail) setPersonaId(detail.selectedPersonaIds[0]); setDetail(null); setView("workbench"); }}
        onOpenPersona={(id) => setPersonaDrawer(id)}
        onOpenCondition={setConditionDrawer} onOpenEvidence={setEvidenceDrawer} />

      <PersonaContextDrawer open={!!personaDrawer} onOpenChange={(v) => !v && setPersonaDrawer(null)}
        personaId={personaDrawer} proposal={proposal} />

      <ConditionDrawer open={!!conditionDrawer} onOpenChange={(v) => !v && setConditionDrawer(null)} condition={conditionDrawer} />
      <EvidenceDrawer open={!!evidenceDrawer} onOpenChange={(v) => !v && setEvidenceDrawer(null)} evidence={evidenceDrawer} />
      <GraphNodeDrawer open={!!nodeDrawer} onOpenChange={(v) => !v && setNodeDrawer(null)} node={nodeDrawer} />
      <ConflictDrawer open={!!conflictDrawer} onOpenChange={(v) => !v && setConflictDrawer(null)} conflict={conflictDrawer} />

      <p className="mt-3 text-[10px] text-slate-400">
        Columns available: {queueColumns.join(" · ")}
      </p>
    </div>
  );
}
