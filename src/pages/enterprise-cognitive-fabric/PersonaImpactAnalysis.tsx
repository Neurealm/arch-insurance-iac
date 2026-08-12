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
import { ChevronRight, Download, PlayCircle, RefreshCw, Search, Sparkles } from "lucide-react";
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
  defaultFilters, evaluatePersona, evaluations, filterOptions, impactEvidence, initialProposal, lifecycleStages,
  personaById, piaKpis, piaViews, queueColumns, scorePersona, severityRank, stageById,
  type FilterKey, type GraphNode, type ImpactCondition, type ImpactEvidence,
  type PersonaImpactConflict, type PersonaImpactEvaluation, type PiaView, type ProposalState,
} from "./persona-impact/data";
import {
  AlternativeAnalysisPanel, AnalysisVersionHistoryPanel, ConditionSensitivityPanel, ConflictResolutionDrawer,
  CrossTeamReviewPanel, DecisionPackagePanel, DemoStoryOverlay, EvidenceRemediationPanel, MitigatedImpactPanel,
  MitigationPlannerPanel, NotificationsButton, NotificationsDrawer, OperationalStatePanel, PersonaOwnerReviewPanel,
  PersonaScopePanel, PersonaVersionSensitivityPanel, RecentActivityPanel, ReviewQueuePanel, ReviewWorkbenchDrawer,
  ScenarioComparisonPanel, ScenarioSimulatorPanel, VersionComparisonPanel,
} from "./persona-impact/ops-panels";
import {
  AlternativeDetailDialog, BulkActionsDialog, DemoScenariosDialog, ExportDialog, GlobalSearchDialog,
  PromptDialog, ReanalysisDialog, RoutingDialog, ScenarioDetailDialog, StartAnalysisDialog,
} from "./persona-impact/ops-dialogs";
import {
  buildDecisionPackage, buildScenario, demoScenarios, makeActivity, makeNotification, personaCandidates,
  readinessState, seededAnalysisVersions, seededMitigationVersions, seededNotifications, seededRecentActivity,
  seededReviews, seededScenarios, storySteps,
  type ChangeAlternative, type DemoScenario, type PersonaCandidate, type PersonaImpactMitigationVersion,
  type PersonaImpactNotification, type PersonaImpactReview, type PersonaImpactScenario, type PiaActivityEvent,
  type PiaOperationalState,
} from "./persona-impact/ops-data";

const pct = (n: number) => `${Math.round(n)}%`;

export default function PersonaImpactAnalysis() {
  const [view, setView] = useState<PiaView>("queue");
  const [density, setDensity] = useState<Density>("standard");
  const [loading, setLoading] = useState(true);
  const [announce, setAnnounce] = useState("");
  const [kpiFocus, setKpiFocus] = useState<string | null>(null);

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

  /* ------------------------------------------------ prompt 2 operational state */
  const [opState, setOpState] = useState<PiaOperationalState>("Analyzing");
  const [analysisComplete, setAnalysisComplete] = useState(true);
  const [candidates, setCandidates] = useState<PersonaCandidate[]>(personaCandidates);
  const [scenarios, setScenarios] = useState<PersonaImpactScenario[]>(seededScenarios);
  const [mitigationVersions, setMitigationVersions] = useState<PersonaImpactMitigationVersion[]>(seededMitigationVersions);
  const [reviews, setReviews] = useState<PersonaImpactReview[]>(seededReviews);
  const [notifications, setNotifications] = useState<PersonaImpactNotification[]>(seededNotifications);
  const [activity, setActivity] = useState<PiaActivityEvent[]>(seededRecentActivity);
  const [impactMode, setImpactMode] = useState<"Raw Impact" | "Mitigated Impact">("Raw Impact");
  const [conditionMode, setConditionMode] = useState("Compare");
  const [versionPair, setVersionPair] = useState<[string, string]>([seededAnalysisVersions[0].id, seededAnalysisVersions[seededAnalysisVersions.length - 1].id]);
  const [showComparison, setShowComparison] = useState(false);

  const [startOpen, setStartOpen] = useState(false);
  const [reanalysisOpen, setReanalysisOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [scenariosOpen, setScenariosOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [routing, setRouting] = useState<null | "Cross Team Impact Matrix" | "Decision Intelligence">(null);
  const [reviewDrawer, setReviewDrawer] = useState<PersonaImpactReview | null>(null);
  const [alternative, setAlternative] = useState<ChangeAlternative | null>(null);
  const [scenarioDetail, setScenarioDetail] = useState<PersonaImpactScenario | null>(null);
  const [prompt, setPrompt] = useState<null | { title: string; description?: string; label: string; confirm: string; onSubmit: (v: string) => void }>(null);
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

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
      if (filters.impactStatus !== "All" && e.status !== filters.impactStatus) return false;
      if (filters.impactSeverity !== "All" && e.highestSeverity !== filters.impactSeverity) return false;
      if (filters.riskLevel !== "All" && e.riskLevel !== filters.riskLevel) return false;
      if (filters.reviewStatus !== "All" && e.reviewStatus !== filters.reviewStatus) return false;
      if (filters.submittingTeam !== "All" && e.submittingTeam !== filters.submittingTeam) return false;
      if (filters.businessUnit !== "All" && e.businessUnit !== filters.businessUnit) return false;
      if (filters.workType !== "All" && e.workType !== filters.workType) return false;
      if (filters.environment !== "All" && e.environment !== filters.environment) return false;
      if (filters.region !== "All" && e.region !== filters.region) return false;
      if (filters.customerJourney !== "All" && e.customerJourney !== filters.customerJourney) return false;
      if (filters.evaluationOwner !== "All" && e.owner !== filters.evaluationOwner) return false;
      if (filters.teamPersona !== "All" && !e.selectedPersonaIds.some((p) => personaById(p).name === filters.teamPersona)) return false;
      if (filters.affectedTeam !== "All" && !e.selectedPersonaIds.some((p) => personaById(p).name === filters.affectedTeam)) return false;
      if (q && !`${e.id} ${e.title} ${e.submittingTeam} ${e.owner}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (sortKey === "Highest Severity") return (severityRank(a.highestSeverity) - severityRank(b.highestSeverity)) * dir;
      if (sortKey === "Impact Score") return (scorePersona(a.selectedPersonaIds[0], proposal).score - scorePersona(b.selectedPersonaIds[0], proposal).score) * dir;
      if (sortKey === "Confidence") return (a.overallConfidence - b.overallConfidence) * dir;
      return a.id.localeCompare(b.id) * dir;
    });
    return list;
  }, [filters, query, sortKey, sortDir, proposal]);

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

  /* --------------------------------------------------- prompt 2 derivations */
  const logActivity = useCallback((text: string, category: string) => {
    setActivity((prev) => [makeActivity(text, category), ...prev].slice(0, 24));
  }, []);

  const notify = useCallback((type: Parameters<typeof makeNotification>[0], title: string, description: string,
    severity: PersonaImpactNotification["severity"], personaTarget = personaId) => {
    setNotifications((prev) => [makeNotification(type, title, description, severity, personaTarget), ...prev].slice(0, 30));
  }, [personaId]);

  const act = useCallback((message: string, category = "Analysis") => {
    say(message);
    logActivity(message, category);
  }, [say, logActivity]);

  const readiness = useMemo(
    () => readinessState(proposal, reviews, mitigationVersions, analysisComplete),
    [proposal, reviews, mitigationVersions, analysisComplete]);

  const decisionPackage = useMemo(
    () => buildDecisionPackage(proposal, versionPair[1], mitigationVersions.filter((m) => m.accepted), reviews),
    [proposal, versionPair, mitigationVersions, reviews]);

  const unread = notifications.filter((n) => n.status === "Unread").length;

  const applyScenarioState = useCallback((s: DemoScenario) => {
    if (s.reset) {
      setProposal(initialProposal);
      setMitigationVersions(seededMitigationVersions);
      setReviews(seededReviews);
      setNotifications(seededNotifications);
      setActivity(seededRecentActivity);
      setCandidates(personaCandidates);
      setScenarios(seededScenarios);
    }
    if (s.proposal) setProposal((p) => ({ ...p, ...s.proposal }));
    if (s.personaId) setPersonaId(s.personaId);
    if (s.acceptMitigations) {
      setMitigationVersions((prev) => prev.map((m) => ({ ...m, accepted: true, status: "Accepted" as const })));
      setImpactMode("Mitigated Impact");
    }
    setOpState(s.operationalState);
    setAnalysisComplete(s.operationalState !== "Analyzing");
    setActiveScenarioId(s.id);
    if (s.notification) notify(s.notification.type, s.notification.title, s.notification.description, s.notification.severity);
    act(s.activity ?? `${s.name} applied`, "Demo");
  }, [act, notify]);

  const step = storyIndex === null ? null : storySteps[storyIndex];
  useEffect(() => {
    if (!step) return;
    if (step.apply) setProposal((p) => ({ ...p, ...step.apply }));
    if (step.personaId) setPersonaId(step.personaId);
    if (step.acceptMitigations) {
      setMitigationVersions((prev) => prev.map((m) => ({ ...m, accepted: true, status: "Accepted" as const })));
      setImpactMode("Mitigated Impact");
    }
    const el = document.getElementById(step.target);
    if (el) el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  }, [step, reducedMotion]);

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
          <Button size="sm" className="h-7 text-[11px]" onClick={() => setStartOpen(true)}>Start Impact Analysis</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setReanalysisOpen(true)}>Reanalyze</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setBulkOpen(true)}>
            Bulk Actions{selectedRows.size ? ` (${selectedRows.size})` : ""}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setSearchOpen(true)}>
            <Search className="mr-1 h-3.5 w-3.5" aria-hidden /> Search
          </Button>
          <NotificationsButton unread={unread} onClick={() => setNotificationsOpen(true)} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExportOpen(true)}>
            <Download className="mr-1 h-3.5 w-3.5" aria-hidden /> Export
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setStoryIndex(0)}>
            <PlayCircle className="mr-1 h-3.5 w-3.5" aria-hidden /> Demo Story
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setScenariosOpen(true)}>
            <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden /> Demo Scenarios
          </Button>
        </div>
      </header>

      {/* -------------------------------------------------------------- kpis */}
      <section id="panel-kpis" aria-label="Impact analysis key indicators" className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {piaKpis.map((k) => (
          <IntakeKpiCard key={k.id} kpi={k} focused={kpiFocus === k.id}
            onClick={() => { setKpiFocus(kpiFocus === k.id ? null : k.id); say(`${k.name} focused`); }} />
        ))}
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
                  {k.replace(/([A-Z])/g, " $1")}
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

        {/* ------------------------------------------------ prompt 2 operations */}
        <OperationalStatePanel state={opState} onState={(v) => { setOpState(v); act(`Operational state set to ${v}`, "State"); }} readiness={readiness} />

        <PersonaScopePanel
          candidates={candidates}
          onToggle={(id, included) => {
            setCandidates((prev) => prev.map((c) => c.personaId === id
              ? { ...c, included, status: included ? "Included" : "Excluded" } : c));
            act(`${personaById(id).name} ${included ? "included in" : "excluded from"} analysis scope, analysis recalculated`, "Scope");
          }}
          onPrimary={(id) => {
            setCandidates((prev) => prev.map((c) => ({ ...c, primary: c.personaId === id })));
            setPersonaId(id);
            act(`${personaById(id).name} marked primary Persona`, "Scope");
          }}
          onOpenPersona={(id) => { setPersonaId(id); setPersonaDrawer(id); }}
          onAdd={() => setPrompt({
            title: "Add Persona Manually", label: "Reason for inclusion", confirm: "Add Persona",
            description: "Manually added Personas are recorded with the reason they were included.",
            onSubmit: (v) => act(`Persona added manually to scope: ${v}`, "Scope"),
          })}
          onRequestValidation={(id) => act(`Persona validation requested for ${personaById(id).name}`, "Scope")}
        />

        <ScenarioSimulatorPanel
          proposal={proposal} onProposal={setProposal} personaId={personaId}
          onSaveScenario={() => setPrompt({
            title: "Save Scenario", label: "Scenario name", confirm: "Save Scenario",
            onSubmit: (name) => {
              const sc = buildScenario(`SCN ${scenarios.length + 1}`, name || `Scenario ${scenarios.length + 1}`,
                "Saved from the impact scenario simulator", proposal);
              setScenarios((prev) => [...prev, sc]);
              act(`Scenario saved: ${sc.name}`, "Scenario");
            },
          })}
          onReset={() => { setProposal(initialProposal); act("Scenario reset to baseline proposal", "Scenario"); }}
        />

        <ScenarioComparisonPanel scenarios={scenarios}
          onOpenScenario={setScenarioDetail}
          onApplyScenario={(sc) => { setProposal(sc.proposalParameters); act(`Simulating ${sc.name}`, "Scenario"); }} />

        <AlternativeAnalysisPanel
          onOpen={setAlternative}
          onSimulate={(a) => { setProposal({ ...proposal, ...a.patch }); act(`Simulating alternative ${a.label}`, "Alternative"); }}
          onSendToDecision={(a) => act(`Alternative ${a.label} added to the decision package as an option`, "Alternative")} />

        <MitigationPlannerPanel
          versions={mitigationVersions}
          onAccept={(id) => {
            setMitigationVersions((prev) => prev.map((m) => m.id === id ? { ...m, accepted: true, status: "Accepted" } : m));
            setImpactMode("Mitigated Impact");
            notify("Mitigation Accepted", "Mitigation accepted", "Residual impact recalculated, original finding preserved.", "Informational");
            act("Mitigation accepted and residual impact recalculated", "Mitigation");
          }}
          onReject={(id) => {
            setMitigationVersions((prev) => prev.map((m) => m.id === id ? { ...m, accepted: false, status: "Rejected" } : m));
            act("Mitigation rejected, original severity retained", "Mitigation");
          }}
          onRequestEvidence={(id) => act(`Mitigation evidence requested for ${id}`, "Evidence")}
          onEdit={(m) => setPrompt({
            title: `Edit Mitigation · ${m.title}`, label: "Revised mitigation description", confirm: "Save Mitigation",
            onSubmit: (v) => act(`Mitigation ${m.id} updated: ${v}`, "Mitigation"),
          })}
          onAdd={() => setPrompt({
            title: "Add Mitigation", label: "Mitigation description", confirm: "Add Mitigation",
            onSubmit: (v) => act(`Mitigation added: ${v}`, "Mitigation"),
          })}
          onRecalculate={() => act("Mitigated scenario recalculated", "Mitigation")}
        />

        <MitigatedImpactPanel proposal={proposal} versions={mitigationVersions} mode={impactMode} onMode={setImpactMode} />

        <EvidenceRemediationPanel proposal={proposal}
          onRequest={(id) => { notify("Evidence Requested", "Evidence requested", `Request raised for ${id}.`, "Warning"); act(`Evidence requested for ${id}`, "Evidence"); }}
          onAdd={(id) => {
            setProposal({
              ...proposal,
              fraudLossEvidence: id === "EVD 7706" ? true : proposal.fraudLossEvidence,
              dependencyStressEvidence: id === "EVD 7707" ? true : proposal.dependencyStressEvidence,
              idempotencyEvidence: id === "EVD 7704" ? true : proposal.idempotencyEvidence,
            });
            act(`Evidence ${id} added, confidence updated without rewriting findings`, "Evidence");
          }}
          onNotApplicable={(id) => act(`Evidence ${id} marked not applicable with rationale recorded`, "Evidence")}
          onLink={(id) => act(`Existing enterprise evidence linked to ${id}`, "Evidence")}
          onOpen={(id) => { const e = impactEvidence.find((x) => x.id === id); if (e) setEvidenceDrawer(e); }}
        />

        <ReviewQueuePanel reviews={reviews}
          onOpen={setReviewDrawer}
          onApprove={(id) => {
            setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "Approved" } : r));
            act(`Review ${id} approved`, "Review");
          }}
          onRequestChanges={(id) => { setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "Changes Requested" } : r)); act(`Changes requested on ${id}`, "Review"); }}
          onRequestEvidence={(id) => act(`Evidence requested for review ${id}`, "Review")}
          onReassign={(id) => setPrompt({
            title: `Reassign ${id}`, label: "New reviewer", confirm: "Reassign",
            onSubmit: (v) => { setReviews((prev) => prev.map((r) => r.id === id ? { ...r, reviewer: v } : r)); act(`Review ${id} reassigned to ${v}`, "Review"); },
          })}
          onEscalate={(id) => { setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "Escalated" } : r)); act(`Review ${id} escalated`, "Review"); }}
        />

        <PersonaOwnerReviewPanel proposal={proposal} personaId={personaId}
          onAction={(a) => act(`${a} recorded for ${personaById(personaId).name}`, "Persona Review")} />

        <CrossTeamReviewPanel onAction={(id, a) => act(`${a} recorded for ${personaById(id).name}`, "Cross Team")} />

        <div className="grid gap-2 xl:grid-cols-2">
          <PersonaVersionSensitivityPanel />
          <ConditionSensitivityPanel mode={conditionMode} onMode={(m) => { setConditionMode(m); act(`Condition sensitivity mode ${m}`, "Sensitivity"); }} />
        </div>

        <AnalysisVersionHistoryPanel versions={seededAnalysisVersions} selected={versionPair} onSelect={setVersionPair}
          onOpen={(v) => act(`Opened analysis version ${v.version}`, "Version")}
          onCompare={() => { setShowComparison(true); act("Version comparison generated", "Version"); }}
          onRestore={(v) => act(`Version ${v.version} restored as a simulation, current results unchanged`, "Version")}
          onExport={(v) => { setExportOpen(true); act(`Export prepared for version ${v.version}`, "Export"); }} />

        {showComparison && (
          <VersionComparisonPanel
            a={seededAnalysisVersions.find((v) => v.id === versionPair[0]) ?? seededAnalysisVersions[0]}
            b={seededAnalysisVersions.find((v) => v.id === versionPair[1]) ?? seededAnalysisVersions[1]} />
        )}

        <DecisionPackagePanel pkg={decisionPackage} readiness={readiness}
          onOpenMatrix={() => setRouting("Cross Team Impact Matrix")}
          onOpenDecision={() => setRouting("Decision Intelligence")}
          onExport={() => setExportOpen(true)} />

        <RecentActivityPanel events={activity} />

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

      <ReviewWorkbenchDrawer open={!!reviewDrawer} onOpenChange={(v) => !v && setReviewDrawer(null)}
        review={reviewDrawer} proposal={proposal}
        onDecision={(action, comment) => {
          if (reviewDrawer) setReviews((prev) => prev.map((r) => r.id === reviewDrawer.id
            ? { ...r, status: action === "Confirm Impact" ? "Approved" : action === "Escalate" ? "Escalated" : "Changes Requested" } : r));
          act(`${action} recorded${comment ? ` · ${comment}` : ""}`, "Review");
          setReviewDrawer(null);
        }} />

      <ConflictResolutionDrawer open={!!conflictDrawer} onOpenChange={(v) => !v && setConflictDrawer(null)}
        conflict={conflictDrawer}
        onResolve={(type, note) => { act(`Conflict resolution recorded: ${type}${note ? ` · ${note}` : ""}`, "Conflict"); setConflictDrawer(null); }} />

      <NotificationsDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} notifications={notifications}
        onRead={(id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, status: "Read" } : n))}
        onReadAll={() => setNotifications((prev) => prev.map((n) => ({ ...n, status: "Read" as const })))}
        onAcknowledge={(id) => { setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, status: "Acknowledged" } : n)); act(`Notification ${id} acknowledged`, "Notification"); }}
        onAssign={(id) => setPrompt({ title: "Assign Notification", label: "Assignee", confirm: "Assign", onSubmit: (v) => act(`Notification ${id} assigned to ${v}`, "Notification") })}
        onOpenItem={(n) => { setPersonaId(n.personaId); setNotificationsOpen(false); setView("workbench"); act(`Opened ${n.title}`, "Notification"); }} />

      <StartAnalysisDialog open={startOpen} onOpenChange={setStartOpen}
        onStart={(msg) => {
          setOpState("Analyzing"); setAnalysisComplete(false);
          notify("Impact Analysis Started", "Impact analysis started", msg, "Informational");
          act(msg, "Analysis");
          window.setTimeout(() => { setOpState("Analysis Complete"); setAnalysisComplete(true); }, 900);
        }} />

      <ReanalysisDialog open={reanalysisOpen} onOpenChange={setReanalysisOpen}
        onRun={(scope, reason) => {
          notify("Analysis Recalculated", "Analysis recalculated", `${scope} reanalysis complete. Prior versions preserved.`, "Informational");
          act(`Reanalysis complete for ${scope} · ${reason}`, "Analysis");
        }} />

      <BulkActionsDialog open={bulkOpen} onOpenChange={setBulkOpen} count={selectedRows.size}
        onApply={(action, note) => act(`${action} applied to ${selectedRows.size} evaluations${note ? ` · ${note}` : ""}`, "Bulk")} />

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} proposal={proposal} reviews={reviews}
        versions={seededAnalysisVersions} scenarios={scenarios} mitigationVersions={mitigationVersions}
        onOpenResult={(r) => {
          if (r.type === "Persona") { setPersonaId(r.id); setPersonaDrawer(r.id); }
          else if (r.type === "Review Task") setReviewDrawer(reviews.find((x) => x.id === r.id) ?? null);
          else if (r.type === "Impact Evaluation") openEvaluation(r.id);
          act(`Opened ${r.type} ${r.id} from search`, "Search");
        }} />

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} proposal={proposal}
        mitigationVersions={mitigationVersions} reviews={reviews} personaId={personaId}
        onExported={(msg) => act(msg, "Export")} />

      <RoutingDialog open={!!routing} onOpenChange={(v) => !v && setRouting(null)}
        target={routing ?? "Cross Team Impact Matrix"} pkg={decisionPackage} reviews={reviews}
        analysisComplete={analysisComplete}
        onConfirm={(note) => {
          setOpState(routing === "Decision Intelligence" ? "Routed to Decision Intelligence" : "Routed to Matrix");
          notify("Impact Package Ready", `Routed to ${routing}`, note || "Impact package handed off with full provenance.", "Informational");
          act(`Impact package routed to ${routing}`, "Routing");
          setRouting(null);
        }} />

      <DemoScenariosDialog open={scenariosOpen} onOpenChange={setScenariosOpen} scenarios={demoScenarios}
        activeId={activeScenarioId} onApply={applyScenarioState} />

      <AlternativeDetailDialog open={!!alternative} onOpenChange={(v) => !v && setAlternative(null)} alternative={alternative} />
      <ScenarioDetailDialog open={!!scenarioDetail} onOpenChange={(v) => !v && setScenarioDetail(null)}
        scenario={scenarioDetail} proposal={proposal} />

      {prompt && (
        <PromptDialog open onOpenChange={(v) => !v && setPrompt(null)} title={prompt.title}
          description={prompt.description} label={prompt.label} confirmLabel={prompt.confirm}
          onSubmit={(v) => { prompt.onSubmit(v); setPrompt(null); }} />
      )}

      {step && (
        <DemoStoryOverlay step={step} index={storyIndex ?? 0} total={storySteps.length}
          onNext={() => setStoryIndex(Math.min(storySteps.length - 1, (storyIndex ?? 0) + 1))}
          onPrev={() => setStoryIndex(Math.max(0, (storyIndex ?? 0) - 1))}
          onExit={() => setStoryIndex(null)}
          reducedMotion={reducedMotion} onReducedMotion={setReducedMotion} />
      )}

      <p className="mt-3 text-[10px] text-slate-400">
        Columns available: {queueColumns.join(" · ")}
      </p>
    </div>
  );
}
