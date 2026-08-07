/**
 * Enterprise Cognitive Health — Prompt 1.
 *
 * Measures how well the enterprise understands itself: information quality,
 * context preservation, dependency visibility, cross team awareness, decision
 * confidence, response latency and learning maturity.
 *
 * Prompt 1 establishes measurement, diagnosis and explanation. Intervention,
 * ownership, remediation planning, notifications, export and the demo story
 * arrive in Prompt 2 and are announced here as placeholders.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Download, MoreHorizontal, RefreshCw, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pill } from "./persona-studio/primitives";
import {
  ActivityPanel, BusinessUnitPanel, ChangeExplainerPanel, ContextPreservationPanel, CriticalSignalsPanel,
  CrossTeamAwarenessPanel, DecisionConfidencePanel, DependencyVisibilityPanel, DimensionPanel,
  EchiSummaryPanel, HealthSummaryPanel, HeatmapPanel, InformationQualityPanel, KnowledgeDomainPanel,
  KpiRow, LatencyPanel, LearningMaturityPanel, LifecyclePanel, ModuleCorrelationPanel, PersonaHealthPanel,
  SelectedStagePanel, SignalExplorerPanel, TrendPanel, type Density,
} from "./cognitive-health/panels";
import { CognitiveHealthWorkbench, type HealthSelection } from "./cognitive-health/workbench";
import {
  DimensionDrawer, HeatmapCellDrawer, SignalDrawer, TeamHealthDrawer,
} from "./cognitive-health/drawers";
import {
  chActiveFilterCount, chActivity, chBaselineParams, chDefaultFilters, chFilterOptions, chKpis, chTone,
  chViews, deriveHealthState, dimensionById, dimensionByName, kpiFocusPanel, signalById, signals,
  stageById,
  type ChFilterKey, type ChView, type ChWorkbenchParams, type CognitiveHealthSignal, type HeatmapMode,
  type TeamPersonaCognitiveHealth, type TrendRange, type WorkbenchScope,
} from "./cognitive-health/data";

const STORAGE_KEY = "ecf:enterprise-cognitive-health:v1";

export default function EnterpriseCognitiveHealth() {
  const navigate = useNavigate();

  /* --------------------------------------------------------------- ui state */
  const [view, setView] = useState<ChView>("executive");
  const [density, setDensity] = useState<Density>("standard");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Record<ChFilterKey, string>>(chDefaultFilters);
  const [pendingFilters, setPendingFilters] = useState<Record<ChFilterKey, string>>(chDefaultFilters);
  const [savedView, setSavedView] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const [kpiFocus, setKpiFocus] = useState<string | null>(null);

  /* ---------------------------------------------------------- domain state */
  const [selectedDimension, setSelectedDimension] = useState("DIM CTA");
  const [selectedStage, setSelectedStage] = useState("CHS 5");
  const [selectedUnit, setSelectedUnit] = useState<string | null>("Commerce Engineering");
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>("business-unit");
  const [heatmapFilter, setHeatmapFilter] = useState("all");
  const [heatmapSort, setHeatmapSort] = useState("name");
  const [heatmapTable, setHeatmapTable] = useState(false);
  const [trendRange, setTrendRange] = useState<TrendRange>("30 Days");
  const [overlays, setOverlays] = useState<string[]>([]);
  const [params, setParams] = useState<ChWorkbenchParams>(chBaselineParams);
  const [selection, setSelection] = useState<HealthSelection>({
    signalId: "SIG 1010", pathId: "PATH 1", decisionId: null, consequence: null,
  });

  /* ------------------------------------------------------- signal explorer */
  const [signalQuery, setSignalQuery] = useState("");
  const [signalDimension, setSignalDimension] = useState("All");
  const [signalSeverity, setSignalSeverity] = useState("All");
  const [signalModule, setSignalModule] = useState("All");
  const [signalPage, setSignalPage] = useState(1);
  const signalPageSize = 10;

  /* ---------------------------------------------------------------- drawers */
  const [dimensionDrawer, setDimensionDrawer] = useState<string | null>(null);
  const [signalDrawer, setSignalDrawer] = useState<CognitiveHealthSignal | null>(null);
  const [personaDrawer, setPersonaDrawer] = useState<TeamPersonaCognitiveHealth | null>(null);
  const [cellDrawer, setCellDrawer] = useState<{ scope: string; dimensionId: string } | null>(null);

  const say = useCallback((m: string) => setAnnounce(m), []);

  /* ------------------------------------------------------------ persistence */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.view) setView(s.view);
        if (s.density) setDensity(s.density);
        if (s.savedView) setSavedView(s.savedView);
        if (s.filters) { setFilters(s.filters); setPendingFilters(s.filters); }
        if (s.selectedDimension) setSelectedDimension(s.selectedDimension);
        if (s.selectedStage) setSelectedStage(s.selectedStage);
        if (s.heatmapMode) setHeatmapMode(s.heatmapMode);
        if (s.trendRange) setTrendRange(s.trendRange);
        if (s.params) setParams(s.params);
        if (s.selection) setSelection(s.selection);
      }
    } catch { /* storage may be unavailable */ }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        view, density, savedView, filters, selectedDimension, selectedStage, heatmapMode, trendRange, params, selection,
      }));
    } catch { /* storage may be unavailable */ }
  }, [view, density, savedView, filters, selectedDimension, selectedStage, heatmapMode, trendRange, params, selection]);

  /* ------------------------------------------------------------- derivation */
  const derived = useMemo(() => deriveHealthState(params), [params]);
  const stage = stageById(selectedStage);

  const signalRows = useMemo(() => {
    const q = signalQuery.trim().toLowerCase();
    return signals.filter((s) => {
      if (signalDimension !== "All" && dimensionById(s.dimensionId).name !== signalDimension) return false;
      if (signalSeverity !== "All" && s.severity !== signalSeverity) return false;
      if (signalModule !== "All" && s.sourceModule !== signalModule) return false;
      if (filters.businessUnit !== "All" && s.scopeId !== "Enterprise" && s.scopeId !== filters.businessUnit) return false;
      if (filters.dimension !== "All" && dimensionById(s.dimensionId).name !== filters.dimension) return false;
      if (filters.severity !== "All" && s.severity !== filters.severity) return false;
      if (filters.knowledgeDomain !== "All" && s.scopeId !== "Enterprise" && s.scopeId !== filters.knowledgeDomain) return false;
      if (kpiFocus === "critical-signals" && s.severity !== "Critical" && s.severity !== "High") return false;
      if (kpiFocus === "attention-domains" && s.status === "Healthy") return false;
      if (q && ![s.id, s.name, s.sourceModule, s.scopeId].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [signalQuery, signalDimension, signalSeverity, signalModule, filters, kpiFocus]);

  const signalPageCount = Math.max(1, Math.ceil(signalRows.length / signalPageSize));
  const pagedSignals = signalRows.slice((signalPage - 1) * signalPageSize, signalPage * signalPageSize);

  /* ---------------------------------------------------------------- actions */
  const focusPanel = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const refresh = () => {
    say("Refreshing enterprise cognitive health measurement");
    window.setTimeout(() => say("Enterprise cognitive health refreshed"), 320);
  };

  const prompt2 = (label: string) => say(`${label} becomes available in Prompt 2 of Enterprise Cognitive Health`);

  const onKpi = (id: string) => {
    setKpiFocus((prev) => (prev === id ? null : id));
    setSignalPage(1);
    focusPanel(kpiFocusPanel(id).panelId);
    say(`${chKpis.find((k) => k.id === id)?.label ?? id} focus applied`);
  };

  const changeParams = (p: Partial<ChWorkbenchParams>) => {
    setParams((prev) => {
      const next = { ...prev, ...p };
      const before = deriveHealthState(prev);
      const after = deriveHealthState(next);
      const notes: string[] = [];
      if (after.score !== before.score) notes.push(`score ${before.score} to ${after.score}`);
      if (after.confidence !== before.confidence) notes.push(`confidence ${before.confidence}% to ${after.confidence}%`);
      if (after.status !== before.status) notes.push(`status ${after.status}`);
      window.setTimeout(() => say(notes.length ? notes.join(". ") : "Workbench scope updated"), 0);
      return next;
    });
  };

  const openWorkbench = (scope: string, dimensionId: string) => {
    changeParams({ scope: scope as WorkbenchScope, dimensionId });
    setCellDrawer(null);
    setView("diagnostic");
    focusPanel("panel-workbench");
    say(`Workbench focused on ${scope} and ${dimensionById(dimensionId).name}`);
  };

  const onNavigate = (target: string) => {
    if (target === "persona") navigate("/enterprise-cognitive-fabric/persona-studio/team-persona-library");
    else if (target === "conditions") navigate("/enterprise-cognitive-fabric/discovery/business-condition-extraction");
    else if (target === "decision" || target === "decisions") navigate("/enterprise-cognitive-fabric/evaluation/decision-intelligence");
    else if (target === "cross-team") navigate("/enterprise-cognitive-fabric/evaluation/cross-team-impact-analysis");
    else if (target === "learning") navigate("/enterprise-cognitive-fabric/learning/organizational-learning");
    else if (target === "signals") { setDimensionDrawer(null); focusPanel("panel-signals"); }
    else if (target === "records") { focusPanel("panel-signals"); say("Underlying signal records focused"); }
    else { setDimensionDrawer(null); focusPanel("panel-workbench"); }
  };

  const applyFilters = () => {
    setFilters(pendingFilters); setSignalPage(1);
    say(`${chActiveFilterCount(pendingFilters)} filters applied`);
  };
  const clearFilters = () => {
    setFilters(chDefaultFilters); setPendingFilters(chDefaultFilters); setSignalPage(1); setSavedView(null);
    say("Filters cleared");
  };

  const emphasis: Record<ChView, string[]> = {
    executive: ["echi", "dimensions", "summary", "critical"],
    portfolio: ["units", "heatmap", "personas", "domains"],
    signal: ["signals", "critical", "modules"],
    diagnostic: ["workbench", "latency", "dimensions"],
    learning: ["learning", "trend", "changes", "activity"],
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
        <span className="font-medium text-slate-700">Enterprise Cognitive Health</span>
      </nav>

      <header className="mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Learning &amp; Health</p>
          <h1 className="text-[19px] font-bold text-slate-900">Enterprise Cognitive Health</h1>
          <p className="text-[12px] text-slate-500">
            Measure how well the enterprise understands itself, where that understanding is weakest, and what it is costing the business
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5" role="tablist" aria-label="View selector">
            {chViews.map((v) => (
              <button key={v.id} role="tab" aria-selected={view === v.id} type="button"
                onClick={() => { setView(v.id); say(`${v.label} view selected`); }}
                className={cn("rounded px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  view === v.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
                {v.label}
              </button>
            ))}
          </div>
          <Pill label={derived.status} tone={chTone(derived.status)} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={refresh}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
          <Button size="sm" className="h-7 text-[11px]"
            onClick={() => { setView("diagnostic"); focusPanel("panel-workbench"); say("Cognitive health workbench focused"); }}>
            <Stethoscope className="mr-1 h-3.5 w-3.5" aria-hidden /> Diagnose Dimension
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { setView("signal"); focusPanel("panel-signals"); say("Signal explorer focused"); }}>
            Explore Signals
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Create Intervention")}>Create Intervention</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => prompt2("Governed Export")}>
            <Download className="mr-1 h-3.5 w-3.5" aria-hidden /> Export
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" aria-label="More actions"
            onClick={() => prompt2("Additional cognitive health operations")}>
            <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </header>

      {/* -------------------------------------------------------------- filters */}
      <section aria-label="Enterprise filters" className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}
            className="text-[12px] font-semibold text-slate-800 hover:text-slate-600">
            Enterprise Filters {chActiveFilterCount(filters) > 0 && (
              <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">{chActiveFilterCount(filters)} active</span>
            )}
          </button>
          <div className="flex items-center gap-1.5">
            {savedView && <span className="text-[10.5px] text-slate-500">Saved · {savedView}</span>}
            <Button size="sm" className="h-7 text-[11px]" onClick={applyFilters}>Apply Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={clearFilters}>Clear Filters</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => { setSavedView(`Health view ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`); say("View saved"); }}>
              Save View
            </Button>
          </div>
        </div>
        {filtersOpen && (
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
            {chFilterOptions.map((f) => (
              <FilterSelect key={f.key} label={f.label} value={pendingFilters[f.key]} options={f.options}
                onChange={(v) => setPendingFilters((p) => ({ ...p, [f.key]: v }))} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-2"><KpiRow focus={kpiFocus} onSelect={onKpi} /></div>

      <div className="mt-2 flex flex-col gap-2">
        <div className={lead("echi")}>
          <EchiSummaryPanel
            derivedEchi={derived.echi}
            selectedDimension={selectedDimension}
            onDimension={(id) => { setSelectedDimension(id); changeParams({ dimensionId: id }); say(`${dimensionById(id).name} selected`); }} />
        </div>

        <div className={lead("lifecycle")}>
          <LifecyclePanel selected={selectedStage} onSelect={(id) => { setSelectedStage(id); say(`${stageById(id).name} stage selected`); }} />
        </div>

        <SelectedStagePanel stage={stage} />

        <div className={lead("dimensions")}>
          <DimensionPanel selected={selectedDimension}
            onOpen={(id) => { setSelectedDimension(id); setDimensionDrawer(id); say(`${dimensionById(id).name} detail opened`); }} />
        </div>

        <div className={lead("workbench")}>
          <CognitiveHealthWorkbench
            params={params} derived={derived} selection={selection}
            onSelect={(s) => setSelection((prev) => ({ ...prev, ...s }))}
            onParams={changeParams}
            onOpenRecords={(target) => onNavigate(target)} />
        </div>

        <div className={lead("units")}>
          <BusinessUnitPanel selected={selectedUnit}
            onSelect={(unit) => {
              setSelectedUnit(unit);
              changeParams({ scope: unit as WorkbenchScope });
              say(`${unit} scope applied to the workbench`);
            }} />
        </div>

        <div className={lead("heatmap")}>
          <HeatmapPanel
            mode={heatmapMode} onMode={(m) => { setHeatmapMode(m); say(`${m.replace("-", " ")} heatmap selected`); }}
            filter={heatmapFilter} onFilter={setHeatmapFilter}
            sortBy={heatmapSort} onSort={setHeatmapSort}
            tableAlt={heatmapTable} onTableAlt={setHeatmapTable}
            onCell={(scope, dimensionId) => setCellDrawer({ scope, dimensionId })} />
        </div>

        <div className={lead("personas")}>
          <PersonaHealthPanel onOpen={(p) => { setPersonaDrawer(p); say(`${p.persona} cognitive health opened`); }} />
        </div>

        <div className={lead("domains")}>
          <KnowledgeDomainPanel onSelect={(domain) => { setCellDrawer({ scope: domain, dimensionId: selectedDimension }); }} />
        </div>

        <div className={lead("signals")}>
          <SignalExplorerPanel
            rows={pagedSignals} query={signalQuery} onQuery={(v) => { setSignalQuery(v); setSignalPage(1); }}
            dimension={signalDimension} onDimension={(v) => { setSignalDimension(v); setSignalPage(1); }}
            severity={signalSeverity} onSeverity={(v) => { setSignalSeverity(v); setSignalPage(1); }}
            sourceModule={signalModule} onSourceModule={(v) => { setSignalModule(v); setSignalPage(1); }}
            page={signalPage} pageCount={signalPageCount} onPage={setSignalPage}
            density={density} onDensity={setDensity}
            onOpen={(s) => { setSignalDrawer(s); setSelection((p) => ({ ...p, signalId: s.id })); }} />
        </div>

        <div className={lead("critical")}>
          <CriticalSignalsPanel onOpen={(id) => { const s = signalById(id); if (s) setSignalDrawer(s); }} />
        </div>

        <InformationQualityPanel />
        <ContextPreservationPanel />
        <DependencyVisibilityPanel />
        <CrossTeamAwarenessPanel />
        <DecisionConfidencePanel />

        <div className={lead("latency")}><LatencyPanel /></div>

        <div className={lead("learning")}><LearningMaturityPanel /></div>

        <div className={lead("modules")}>
          <ModuleCorrelationPanel onCell={(module, dimensionId) => {
            setSelectedDimension(dimensionId);
            changeParams({ dimensionId });
            say(`${module} contribution to ${dimensionById(dimensionId).name} focused`);
            focusPanel("panel-workbench");
          }} />
        </div>

        <div className={lead("trend")}>
          <TrendPanel range={trendRange} onRange={(r) => { setTrendRange(r); changeParams({ timeRange: r }); }}
            overlays={overlays}
            onOverlay={(id) => setOverlays((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))} />
        </div>

        <div className={lead("changes")}><ChangeExplainerPanel comparisonPeriod={trendRange} /></div>

        <div className={lead("summary")}><HealthSummaryPanel onPrompt2={prompt2} /></div>

        <div className={lead("activity")}><ActivityPanel items={chActivity} /></div>
      </div>

      <DimensionDrawer
        dimension={dimensionDrawer ? dimensionById(dimensionDrawer) : null}
        onClose={() => setDimensionDrawer(null)}
        onSignal={(id) => { const s = signalById(id); if (s) { setDimensionDrawer(null); setSignalDrawer(s); } }}
        onNavigate={onNavigate} />

      <SignalDrawer signal={signalDrawer} onClose={() => setSignalDrawer(null)} />

      <TeamHealthDrawer persona={personaDrawer} onClose={() => setPersonaDrawer(null)} onNavigate={onNavigate} />

      <HeatmapCellDrawer
        scope={cellDrawer?.scope ?? null}
        dimensionId={cellDrawer?.dimensionId ?? null}
        onClose={() => setCellDrawer(null)}
        onWorkbench={openWorkbench} />
    </div>
  );
}

/** Convenience for panels that surface a dimension by display name. */
export const resolveDimensionByName = dimensionByName;
