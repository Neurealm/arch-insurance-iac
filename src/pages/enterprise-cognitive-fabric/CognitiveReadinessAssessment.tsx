/**
 * Cognitive Readiness Assessment — Prompt 1.
 *
 * Sits between Cognitive Intake ("what work is proposed?") and Persona Impact
 * Analysis ("how does it affect each Persona?"). This page answers: do we
 * understand the proposed work well enough to evaluate its consequences?
 *
 * It never approves work, never rejects work, and never computes Persona impact.
 */

import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Filter, RefreshCw } from "lucide-react";
import { FilterSelect, Pill } from "./persona-studio/primitives";
import {
  AmbiguityPanel, AssessmentQueuePanel, AssumptionPanel, ConditionReadinessPanel,
  ConstraintPanel, ContextCoveragePanel, ContradictionPanel, DependencyReadinessPanel,
  EvidenceSufficiencyPanel, FindingsPanel, HandoffPreviewPanel, LifecyclePanel,
  PersonaReadinessPanel, QualityPanel, ReadinessKpiCard, SelectedStagePanel,
  type Density,
} from "./cognitive-readiness/panels";
import { GatesPanel, ReadinessWorkbench } from "./cognitive-readiness/workbench";
import { AssessmentDetailDrawer } from "./cognitive-readiness/drawers";
import {
  computeReadiness, initialWorkbenchState, type WorkbenchState,
} from "./cognitive-readiness/engine";
import {
  activeReadinessFilterCount, applyReadinessFilters, assessments, defaultReadinessFilters,
  evidenceItems, kpiFilterFor, queueColumns, readinessFilterLabels, readinessFilterOptions,
  readinessKpis, savedReadinessViews, stageById,
  type CognitiveReadinessAssessment, type ReadinessFilters, type ReadinessView, type ServiceState,
} from "./cognitive-readiness/data";

const PREF_KEY = "ecf.cognitive-readiness.prefs.v1";
const PAGE_SIZE = 10;

const views: { id: ReadinessView; label: string }[] = [
  { id: "queue", label: "Assessment Queue" },
  { id: "workbench", label: "Readiness Workbench" },
  { id: "coverage", label: "Context Coverage" },
  { id: "diagnostic", label: "Diagnostic View" },
];

interface Prefs {
  view: ReadinessView;
  filters: ReadinessFilters;
  savedView: string;
  density: Density;
  hiddenColumns: string[];
  selectedAssessment: string;
  selectedStage: string;
  selectedDimension: string;
  filtersOpen: boolean;
}

const defaultPrefs: Prefs = {
  view: "queue", filters: defaultReadinessFilters, savedView: "Default", density: "standard",
  hiddenColumns: ["intent", "stateDefinition", "conditionCoverage"], selectedAssessment: "CRA 7001",
  selectedStage: "evidence", selectedDimension: "evidence", filtersOpen: false,
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

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function CognitiveReadinessAssessment() {
  const [prefs, setPrefsState] = useState<Prefs>(loadPrefs);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [kpiFocus, setKpiFocus] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");

  const [workbench, setWorkbench] = useState<WorkbenchState>(initialWorkbenchState);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>("EV 08");
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedDependency, setSelectedDependency] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<CognitiveReadinessAssessment | null>(null);

  const say = useCallback((m: string) => setAnnounce(m), []);
  const setPrefs = (next: Prefs) => { setPrefsState(next); savePrefs(next); };
  const setPref = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs({ ...prefs, [k]: v });
  const setFilter = (k: keyof ReadinessFilters, v: string) => {
    setPrefs({ ...prefs, filters: { ...prefs.filters, [k]: v } });
    setPage(1);
  };

  const computation = useMemo(() => computeReadiness(workbench), [workbench]);

  const serviceState: ServiceState =
    computation.state === "Ready" ? "Ready"
      : computation.state === "Blocked" ? "Blocked"
        : computation.state === "Remediation Required" ? "Remediation Required"
          : computation.state === "Evidence Required" ? "Evidence Required"
            : computation.state === "Clarification Required" ? "Clarification Required"
              : "Conditionally Ready";

  const filterCount = activeReadinessFilterCount(prefs.filters);
  const filtered = useMemo(
    () => applyReadinessFilters(assessments, prefs.filters, search),
    [prefs.filters, search],
  );

  const sorted = useMemo(() => {
    const col = queueColumns.find((c) => c.key === sortKey) ?? queueColumns[0];
    return [...filtered].sort((a, b) => {
      const av = col.get(a), bv = col.get(b);
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const evidenceGaps = evidenceItems
    .filter((e) => e.required && !e.provided)
    .filter((e) => !(e.id === "EV 08" && workbench.fraudLossAnalysisProvided))
    .filter((e) => !(e.id === "EV 09" && workbench.stressTestProvided))
    .map((e) => e.evidence);

  const applyWorkbench = (patch: Partial<WorkbenchState>, message: string) => {
    setWorkbench((w) => ({ ...w, ...patch }));
    toast.success(message, { description: "Readiness recalculated" });
    say(`${message}. Readiness recalculated.`);
  };

  const onKpi = (id: string) => {
    setKpiFocus(id === kpiFocus ? null : id);
    setPrefs({ ...prefs, filters: { ...prefs.filters, ...kpiFilterFor(id) } });
    setPage(1);
    scrollTo(id === "average" ? "panel-quality" : "panel-queue");
    say(`${readinessKpis.find((k) => k.id === id)?.label} selected`);
  };

  const onSort = (k: string) => {
    if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const openDetail = (a: CognitiveReadinessAssessment) => {
    setDetailRow(a); setDetailOpen(true);
    setPref("selectedAssessment", a.id);
    say(`${a.id} detail opened`);
  };

  const prompt2 = (label: string) =>
    toast.info(`${label} is delivered in Prompt 2`, {
      description: "Prompt 1 establishes the core Cognitive Readiness Assessment platform.",
    });

  const filterKeys = Object.keys(readinessFilterOptions) as (keyof ReadinessFilters)[];
  const showQueueFirst = prefs.view === "queue" || prefs.view === "diagnostic";

  const toolbar = (
    <div className="flex flex-wrap items-center gap-1">
      <label className="sr-only" htmlFor="cra-search">Search Assessments</label>
      <input id="cra-search" type="search" value={search} placeholder="Search assessments"
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="h-7 w-44 rounded-md border border-slate-200 px-2 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
      <FilterSelect label="Saved View" value={prefs.savedView} options={savedReadinessViews}
        onChange={(v) => setPref("savedView", v)} />
      <FilterSelect label="Work Type" value={prefs.filters.workType} options={readinessFilterOptions.workType}
        onChange={(v) => setFilter("workType", v)} />
      <FilterSelect label="Submitting Team" value={prefs.filters.submittingTeam} options={readinessFilterOptions.submittingTeam}
        onChange={(v) => setFilter("submittingTeam", v)} />
      <FilterSelect label="Readiness State" value={prefs.filters.readinessState} options={readinessFilterOptions.readinessState}
        onChange={(v) => setFilter("readinessState", v)} />
      <FilterSelect label="Priority" value={prefs.filters.priority} options={readinessFilterOptions.priority}
        onChange={(v) => setFilter("priority", v)} />
      <FilterSelect label="Owner" value={prefs.filters.owner} options={readinessFilterOptions.owner}
        onChange={(v) => setFilter("owner", v)} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 text-[11px]">Columns</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
          <DropdownMenuLabel className="text-[11px]">Column visibility</DropdownMenuLabel>
          {queueColumns.map((c) => (
            <DropdownMenuCheckboxItem key={c.key} className="text-[11px]"
              checked={!prefs.hiddenColumns.includes(c.key)}
              onCheckedChange={(on) => setPref("hiddenColumns",
                on ? prefs.hiddenColumns.filter((k) => k !== c.key) : [...prefs.hiddenColumns, c.key])}>
              {c.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <FilterSelect label="Density" value={prefs.density} options={["compact", "standard", "comfortable"]}
        onChange={(v) => setPref("density", v as Density)} />
    </div>
  );

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
        <span className="font-medium text-slate-700">Cognitive Readiness Assessment</span>
      </nav>

      <header className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Evaluation &amp; Decision</p>
          <h1 className="text-[19px] font-bold text-slate-900">Cognitive Readiness Assessment</h1>
          <p className="text-[12px] text-slate-500">
            Determine whether proposed work contains sufficient context, evidence, and clarity to begin enterprise impact analysis
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
          <Pill label={serviceState} tone={serviceState === "Ready" ? "green" : serviceState === "Blocked" || serviceState === "Remediation Required" ? "red" : serviceState === "Conditionally Ready" ? "blue" : "amber"} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { toast.success("Readiness recalculated"); say("Assessments refreshed"); }}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
          <Button size="sm" className="h-7 text-[11px]"
            onClick={() => { setPref("view", "workbench"); scrollTo("panel-workbench"); say("Assessment started in the workbench"); }}>
            Start Assessment
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Compare Assessments")}>Compare Assessments</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Request Remediation")}>Request Remediation</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Proceed to Persona Impact")}>Proceed to Persona Impact</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Export")}>Export</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">More</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
              <DropdownMenuLabel className="text-[11px]">Navigate</DropdownMenuLabel>
              {[
                ["panel-lifecycle", "Readiness Lifecycle"], ["panel-queue", "Assessment Queue"],
                ["panel-workbench", "Readiness Workbench"], ["panel-gates", "Readiness Gates"],
                ["panel-context-matrix", "Context Coverage"], ["panel-persona-readiness", "Persona Evaluation Readiness"],
                ["panel-conditions", "Business Condition Coverage"], ["panel-dependencies", "Dependency Readiness"],
                ["panel-evidence", "Evidence Sufficiency"], ["panel-assumptions", "Assumptions"],
                ["panel-constraints", "Constraints"], ["panel-ambiguities", "Ambiguities"],
                ["panel-contradictions", "Contradictions"], ["panel-findings", "Findings"],
                ["panel-quality", "Readiness Quality"], ["panel-handoff", "Persona Impact Handoff Preview"],
              ].map(([id, label]) => (
                <DropdownMenuItem key={id} className="text-[11px]" onClick={() => scrollTo(id)}>{label}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[11px]"
                onClick={() => { setWorkbench(initialWorkbenchState); toast.success("Baseline restored"); }}>
                Reset workbench to baseline
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* filters */}
      <section aria-label="Global filters" className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" aria-expanded={prefs.filtersOpen}
            onClick={() => setPref("filtersOpen", !prefs.filtersOpen)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-800">
            <Filter className="h-3.5 w-3.5" aria-hidden /> Filters
            <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-600">{filterCount} active</span>
          </button>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => { setPage(1); toast.success("Filters applied"); }}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => { setPrefs({ ...prefs, filters: defaultReadinessFilters }); setSearch(""); setPage(1); say("Filters cleared"); }}>
              Clear Filters
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Save View")}>Save View</Button>
          </div>
        </div>
        {prefs.filtersOpen && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {filterKeys.map((k) => (
              <FilterSelect key={k} label={readinessFilterLabels[k]} value={prefs.filters[k]}
                options={readinessFilterOptions[k]} onChange={(v) => setFilter(k, v)} />
            ))}
          </div>
        )}
      </section>

      {/* KPIs */}
      <section aria-label="Readiness KPIs" className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {readinessKpis.map((k) => (
          <ReadinessKpiCard key={k.id} kpi={k} focused={kpiFocus === k.id} onClick={() => onKpi(k.id)} />
        ))}
      </section>

      <div className="mt-2 space-y-2">
        <LifecyclePanel selected={prefs.selectedStage} onSelect={(id) => { setPref("selectedStage", id); say(`${stageById(id).name} stage selected`); }} />
        <SelectedStagePanel stage={stageById(prefs.selectedStage)} />

        {showQueueFirst && (
          <AssessmentQueuePanel
            rows={pageRows} allCount={filtered.length} columns={queueColumns}
            hiddenColumns={prefs.hiddenColumns} density={prefs.density} selected={selected}
            onToggle={(id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; })}
            onToggleAll={() => setSelected((s) => s.size === pageRows.length ? new Set() : new Set(pageRows.map((r) => r.id)))}
            onOpen={openDetail} sortKey={sortKey} sortDir={sortDir} onSort={onSort}
            page={page} pages={pages} onPage={setPage} spotlight={prefs.view === "queue"} toolbar={toolbar}
          />
        )}

        <ReadinessWorkbench
          state={workbench} computation={computation}
          selectedDimension={prefs.selectedDimension}
          onSelectDimension={(id) => { setPref("selectedDimension", id); say(`${id} dimension selected`); }}
          selectedEvidence={selectedEvidence}
          onSelectEvidence={(id) => { setSelectedEvidence(id); say(`Evidence ${id} selected`); }}
          onToggle={applyWorkbench}
          spotlight={prefs.view === "workbench"}
        />

        <GatesPanel gates={computation.gates} />

        {!showQueueFirst && (
          <AssessmentQueuePanel
            rows={pageRows} allCount={filtered.length} columns={queueColumns}
            hiddenColumns={prefs.hiddenColumns} density={prefs.density} selected={selected}
            onToggle={(id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; })}
            onToggleAll={() => setSelected((s) => s.size === pageRows.length ? new Set() : new Set(pageRows.map((r) => r.id)))}
            onOpen={openDetail} sortKey={sortKey} sortDir={sortDir} onSort={onSort}
            page={page} pages={pages} onPage={setPage} toolbar={toolbar}
          />
        )}

        <ContextCoveragePanel spotlight={prefs.view === "coverage"} />
        <PersonaReadinessPanel rows={computation.personas} selected={selectedPersona} onSelect={setSelectedPersona} />
        <ConditionReadinessPanel selected={selectedCondition} onSelect={setSelectedCondition} />
        <DependencyReadinessPanel rows={computation.dependencies} selected={selectedDependency} onSelect={setSelectedDependency} />
        <EvidenceSufficiencyPanel
          provided={{ "EV 08": workbench.fraudLossAnalysisProvided, "EV 09": workbench.stressTestProvided }}
          selected={selectedEvidence} onSelect={setSelectedEvidence}
        />
        <AssumptionPanel />
        <ConstraintPanel />
        <AmbiguityPanel />
        <ContradictionPanel />
        <FindingsPanel selected={selectedFinding} onSelect={(f) => setSelectedFinding(f.id)} />
        <QualityPanel />
        <HandoffPreviewPanel
          state={computation.state} score={computation.score} confidence={computation.confidence}
          personas={computation.personas} evidenceGaps={evidenceGaps}
          governanceRequired={computation.governanceRequired}
        />
      </div>

      <AssessmentDetailDrawer open={detailOpen} onOpenChange={setDetailOpen}
        assessment={detailRow} gates={computation.gates} personas={computation.personas} />
    </div>
  );
}
