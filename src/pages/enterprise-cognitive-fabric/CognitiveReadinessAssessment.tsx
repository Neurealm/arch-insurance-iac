/**
 * Cognitive Readiness Assessment — Prompt 1 core plus Prompt 2 operations.
 *
 * Sits between Cognitive Intake ("what work is proposed?") and Persona Impact
 * Analysis ("how does it affect each Persona?"). This page answers: do we
 * understand the proposed work well enough to evaluate its consequences?
 *
 * It never approves work, never rejects work, and never computes Persona impact.
 *
 * READINESS DOES NOT MEAN KNOWING EVERYTHING.
 * IT MEANS KNOWING ENOUGH, AND KNOWING WHAT YOU DO NOT KNOW.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Filter, RefreshCw, Search } from "lucide-react";
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
import {
  ActivityPanel, AmbiguityResolutionPanel, AssumptionRegisterPanel, ConditionValidationPanel,
  ConstraintManagementPanel, ContradictionWorkbenchPanel, DependencyReviewPanel, ExceptionsPanel,
  GateOperationsPanel, HandoffPackagePanel, NotificationsPanel, OverridesPanel,
  PersonaScopeValidationPanel, PolicyBindingPanel, QualityOpsPanel, RemediationCenterPanel,
  ReviewQueuePanel, VersionComparisonPanel, VersionHistoryPanel,
} from "./cognitive-readiness/ops-panels";
import {
  AcceptAssumptionDialog, AddEvidenceDialog, AmbiguityDialog, ClarificationDialog,
  ContradictionDialog, DemoStoryOverlay, EvidenceRequestDialog, ExceptionDialog, ExportDialog,
  GlobalSearchDialog, OverrideDialog, PolicyBindingDialog, ProceedDialog, ReassessDialog,
  RemediationDetailDrawer, ReviewWorkbenchDrawer,
} from "./cognitive-readiness/ops-dialogs";
import {
  buildHandoffPackage, downloadFile, downstreamWarnings, globalSearch, handoffReadiness,
  qualityModel, toCsv, toYaml, validateRouting,
} from "./cognitive-readiness/ops-engine";
import { useReadinessOps } from "./cognitive-readiness/ops-store";
import {
  demoScenarios, demoStorySteps, type CognitiveReadinessRemediation, type CognitiveReadinessReview,
} from "./cognitive-readiness/ops-data";

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
  const navigate = useNavigate();
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
  const ops = useReadinessOps(say);

  /* --------------------------------------------------------- prompt 2 UI -- */
  const [remediationOpen, setRemediationOpen] = useState(false);
  const [remediationRow, setRemediationRow] = useState<CognitiveReadinessRemediation | null>(null);
  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [clarifyCtx, setClarifyCtx] = useState<{ assessment: string; remediationId: string | null; seedQuestion?: string }>({ assessment: "CRA 7001", remediationId: null });
  const [evidenceReqOpen, setEvidenceReqOpen] = useState(false);
  const [evidenceReqSeed, setEvidenceReqSeed] = useState({});
  const [addEvidenceOpen, setAddEvidenceOpen] = useState(false);
  const [addEvidenceSeed, setAddEvidenceSeed] = useState({});
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyVar, setPolicyVar] = useState<string | null>(null);
  const [assumptionOpen, setAssumptionOpen] = useState(false);
  const [assumptionId, setAssumptionId] = useState<string | null>(null);
  const [ambiguityOpen, setAmbiguityOpen] = useState(false);
  const [ambiguityId, setAmbiguityId] = useState<string | null>(null);
  const [ambiguityMode, setAmbiguityMode] = useState("Accept Bounded Interpretation");
  const [contradictionOpen, setContradictionOpen] = useState(false);
  const [contradictionId, setContradictionId] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRow, setReviewRow] = useState<CognitiveReadinessReview | null>(null);
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [reassessOpen, setReassessOpen] = useState(false);
  const [proceedOpen, setProceedOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [stage, setStage] = useState<"Architecture" | "Implementation">("Implementation");

  const setPrefs = (next: Prefs) => { setPrefsState(next); savePrefs(next); };
  const setPref = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs({ ...prefs, [k]: v });
  const setFilter = (k: keyof ReadinessFilters, v: string) => {
    setPrefs({ ...prefs, filters: { ...prefs.filters, [k]: v } });
    setPage(1);
  };

  const computation = useMemo(() => computeReadiness(workbench), [workbench]);

  const serviceState: ServiceState =
    ops.state.historicalViolations > 0 ? "Blocked"
      : computation.state === "Ready" ? "Ready"
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

  /* ------------------------------------------------------- derived prompt 2 -- */
  const quality = useMemo(() => qualityModel(ops.state), [ops.state]);
  const handoff = useMemo(() => handoffReadiness(ops.state, computation), [ops.state, computation]);
  const warnings = useMemo(() => downstreamWarnings(ops.state, computation), [ops.state, computation]);
  const latestVersion = ops.state.versions[ops.state.versions.length - 1];
  const handoffPackage = useMemo(
    () => buildHandoffPackage(ops.state, computation, latestVersion?.id ?? "CRA 7001 v1"),
    [ops.state, computation, latestVersion],
  );
  const routing = useMemo(() => validateRouting(ops.state, computation.gates, stage), [ops.state, computation.gates, stage]);
  const doSearch = useCallback((q: string) => globalSearch(ops.state, q), [ops.state]);

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

  /* ------------------------------------------------------------- workflows -- */

  const openClarification = (remediationId: string | null, seedQuestion?: string) => {
    setClarifyCtx({ assessment: "CRA 7001", remediationId, seedQuestion });
    setClarifyOpen(true);
  };

  const openEvidenceRequest = (r?: CognitiveReadinessRemediation) => {
    setEvidenceReqSeed(r ? {
      description: r.requiredContext, requiredFor: r.affectedGate,
      affectedDimension: r.affectedDimension, affectedPersona: r.affectedPersonas[0] ?? "",
      owner: r.owner, evidenceType: r.category === "Dependency" ? "Dependency Validation" : "Fraud Analysis",
    } : {});
    setEvidenceReqOpen(true);
  };

  const openAddEvidence = (r?: CognitiveReadinessRemediation) => {
    setAddEvidenceSeed(r ? {
      name: r.category === "Dependency" ? "Regional Dependency Stress Test" : "Fraud Loss Analysis",
      evidenceType: r.category === "Dependency" ? "Load Test" : "Fraud Analysis",
      description: r.requiredContext, relatedDimension: r.affectedDimension, relatedGap: r.id,
      owner: r.owner, source: r.owner,
    } : {});
    setAddEvidenceOpen(true);
  };

  const handleAddEvidence = (d: Parameters<typeof ops.addEvidence>[0]) => {
    ops.addEvidence(d);
    if (/fraud loss/i.test(d.name)) applyWorkbench({ fraudLossAnalysisProvided: true }, "Fraud Loss Analysis attached");
    else if (/stress test|dependency/i.test(d.name)) applyWorkbench({ stressTestProvided: true, regionalDependencyValidated: true }, "Regional Dependency Stress Test attached");
    else toast.success(`${d.name} attached`);
  };

  const onRemediationAction = (r: CognitiveReadinessRemediation, action: string) => {
    if (action === "Request Clarification" || action === "Clarify") return openClarification(r.id, r.description);
    if (action === "Request Evidence") return openEvidenceRequest(r);
    if (action === "Add Evidence") return openAddEvidence(r);
    if (action === "Recommend Exception") return setExceptionOpen(true);
    if (action === "Mark Resolved") return ops.resolveRemediation(r.id, "Marked resolved by owner");
    if (action === "Accept Nonblocking Uncertainty") return ops.acceptUncertainty(r.description);
    if (action.startsWith("Use ") || action === "Create Resolved Value" || action === "Keep Both as Scenarios" || action === "Request Owner Decision") {
      setContradictionId("CT 01"); return setContradictionOpen(true);
    }
    if (action === "Bind Current Value") { setPolicyVar("risk.fraud.materiality"); return setPolicyOpen(true); }
    ops.updateRemediation(r.id, { status: action }, action);
  };

  const onDependencyAction = (dep: string, action: string) => {
    if (action === "Add Evidence") return openAddEvidence();
    if (action === "Confirm Dependency") {
      ops.setDependency(dep, "Validated", 94);
      if (dep === "Regional Token Vault") applyWorkbench({ regionalDependencyValidated: true }, "Regional Token Vault validated");
      return;
    }
    if (action === "Mark Unknown") return ops.setDependency(dep, "Unknown", 50);
    if (action === "Mark Nonmaterial") return ops.setDependency(dep, "Nonmaterial", 70);
    if (action === "Request Owner Confirmation") return ops.setDependency(dep, "Owner Confirmation Requested");
    if (action === "Escalate") return ops.setDependency(dep, "Escalated");
    ops.setDependency(dep, "Relationship Review");
  };

  const onPersonaAction = (persona: string, action: string) => {
    if (action === "Include") return ops.setPersonaScope(persona, { included: true });
    if (action === "Exclude") return ops.setPersonaScope(persona, { included: false });
    if (action === "Mark Primary") return ops.setPersonaScope(persona, { primary: true });
    if (action === "Open Persona") {
      navigate("/enterprise-cognitive-fabric/persona-studio/team-persona-library");
      return;
    }
    ops.log("Persona Scope Changed", `${action} requested for ${persona}`);
    toast.success(`${action} recorded for ${persona}`);
  };

  const onConditionAction = (condition: string, action: string) => {
    if (action === "Bind Policy Variable") {
      setPolicyVar(condition === "Fraud Loss Materiality" ? "risk.fraud.materiality" : "payments.retry.approval_traffic_threshold");
      return setPolicyOpen(true);
    }
    if (action === "Confirm Applicability") return ops.setCondition(condition, "Resolved");
    if (action === "Mark Not Applicable") return ops.setCondition(condition, "Not Applicable");
    if (action === "Refresh Evidence") return ops.setCondition(condition, "Evidence Required");
    if (action === "Request Policy Review") return ops.setCondition(condition, "Applicability Review");
    scrollTo("panel-conditions");
  };

  const onAssumptionAction = (id: string, action: string) => {
    if (action === "Accept for Evaluation") { setAssumptionId(id); return setAssumptionOpen(true); }
    if (action === "Add Evidence") return openAddEvidence();
    if (action === "Request Validation") return ops.setAssumption(id, "Validation Requested");
    if (action === "Convert to Constraint") return ops.setAssumption(id, "Converted to Constraint");
    if (action === "Convert to Open Question") { ops.setAssumption(id, "Open Question"); return openClarification(null, "Please confirm this assumption."); }
    if (action === "Mark Invalid") return ops.setAssumption(id, "Invalid");
  };

  const onAmbiguityAction = (id: string, action: string) => {
    if (action === "Clarify") return openClarification(null, `Which interpretation applies for this ambiguous statement?`);
    if (action === "Open Source") { scrollTo("panel-ambiguities"); return; }
    setAmbiguityId(id); setAmbiguityMode(action); setAmbiguityOpen(true);
  };

  const onGateAction = (gateId: string, action: string) => {
    if (action === "Open Findings") return scrollTo("panel-findings");
    if (action === "Request Remediation") return scrollTo("panel-remediation");
    if (action === "Accept Nonblocking Uncertainty") {
      const g = computation.gates.find((x) => x.id === gateId);
      if (g?.status === "Failed") {
        toast.error("A failed gate cannot be accepted as nonblocking", { description: "Resolve the finding or request a governed override." });
        return;
      }
      return ops.acceptUncertainty(`${g?.name} warning accepted as nonblocking`);
    }
    ops.log("Blocking Gap Detected", `${gateId} escalated`);
    toast.success("Gate escalated to governance review");
  };

  const onReviewAction = (r: CognitiveReadinessReview, action: string) => {
    if (action === "Request Evidence") return openEvidenceRequest();
    if (action === "Assign") return ops.updateReview(r.id, { reviewer: "Enterprise Architecture", status: "Assigned" });
    if (action === "Confirm Assessment") return ops.updateReview(r.id, { status: "Confirmed", decision: "Confirm Assessment" });
    ops.updateReview(r.id, { status: "Escalated" });
  };

  const doExport = (format: string, scope: string, options: string[]) => {
    const base: Record<string, unknown> = {
      exportedAt: new Date().toISOString(), scope, options,
      assessment: "CRA 7001", readinessState: computation.state, readinessScore: computation.score,
      gates: computation.gates.map((g) => ({ gate: g.name, status: g.status })),
      handoffPackage: scope.includes("Handoff") || scope === "Full Assessment" ? handoffPackage : undefined,
      remediations: ops.state.remediations, versions: ops.state.versions,
      exceptions: ops.state.exceptions, overrides: ops.state.overrides,
    };
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "CSV") {
      const rows = ops.state.remediations.map((r) => ({
        id: r.id, assessment: r.assessment, workItem: r.workItem, gapType: r.gapType,
        description: r.description, dimension: r.affectedDimension, severity: r.severity,
        blocking: r.blocking, owner: r.owner, due: r.due, status: r.status,
      }));
      downloadFile(`cognitive-readiness-${stamp}.csv`, toCsv(rows), "text/csv");
    } else if (format === "YAML") {
      downloadFile(`cognitive-readiness-${stamp}.yaml`, toYaml(base), "text/yaml");
    } else {
      downloadFile(`cognitive-readiness-${stamp}.json`, JSON.stringify(base, null, 2), "application/json");
    }
    ops.log("Assessment Completed", `Readiness exported as ${format} · ${scope}`);
    toast.success(`Exported ${format}`, { description: scope });
    say(`Export complete. ${format} ${scope}.`);
  };

  const doProceed = () => {
    ops.route(computation);
    toast.success("Routed to Persona Impact Analysis", { description: "Handoff package version preserved." });
    navigate("/enterprise-cognitive-fabric/evaluation/persona-impact-analysis");
  };

  /* -------------------------------------------------------- 35. scenarios -- */

  const applyScenario = (scenario: string) => {
    if (scenario === "Reset Demo Data") {
      setWorkbench(initialWorkbenchState);
      ops.reset();
      toast.success("Demo data reset");
      return;
    }
    const wb: Partial<WorkbenchState> = {};
    switch (scenario) {
      case "Ready":
      case "Ready for Persona Impact":
      case "Routed to Persona Impact":
        Object.assign(wb, { fraudLossAnalysisProvided: true, stressTestProvided: true, regionalDependencyValidated: true, rollbackDefined: true, proposedStateDefined: true, trafficExposure: 5, fraudPolicyBound: true });
        break;
      case "Evidence Required":
        Object.assign(wb, { fraudLossAnalysisProvided: false, stressTestProvided: false, trafficExposure: 15 });
        break;
      case "Clarification Required":
        Object.assign(wb, { regionalDependencyValidated: true, trafficExposure: 15, fraudLossAnalysisProvided: true, stressTestProvided: true });
        break;
      case "Remediation Required":
      case "Rollback Missing":
        Object.assign(wb, { rollbackDefined: false });
        break;
      case "Blocked":
      case "Persona Context Missing":
        Object.assign(wb, { proposedStateDefined: false });
        break;
      case "Dependency Unknown":
        Object.assign(wb, { regionalDependencyValidated: false, stressTestProvided: false });
        break;
      case "Evidence Added":
        Object.assign(wb, { fraudLossAnalysisProvided: true });
        break;
      case "Conditionally Ready":
      case "Healthy Assessment Portfolio":
      case "New Intake Received":
        Object.assign(wb, initialWorkbenchState);
        break;
      default:
        break;
    }
    setWorkbench((w) => ({ ...w, ...wb }));

    if (scenario === "Historical Integrity Warning") ops.setHistoricalViolations(1);
    else if (ops.state.historicalViolations > 0) ops.setHistoricalViolations(0);

    if (scenario === "Assumption Accepted") ops.acceptAssumption("AS 02");
    if (scenario === "Ambiguity Detected") ops.resolveAmbiguity("AM 01", "Open", "", "");
    if (scenario === "Contradiction Detected") ops.resolveContradiction("CT 01", "Keep Both as Scenarios", "", "Both exposure values retained as governed scenarios");
    if (scenario === "Condition Binding Missing") ops.setCondition("Fraud Loss Materiality", "Unbound Policy Variable");
    if (scenario === "Dependency Unknown") ops.setDependency("Regional Token Vault", "Unknown", 55);
    if (scenario === "Exception Requested") setExceptionOpen(true);
    if (scenario === "Exception Approved" && ops.state.exceptions[0]) ops.approveException(ops.state.exceptions[0].id);
    if (scenario === "Reassessment Complete") ops.reassess("Full Assessment", "Scenario reassessment", computation);
    if (scenario === "Routed to Persona Impact") ops.route(computation);
    if (scenario === "Persona Context Missing") ops.setPersonaScope("Fraud Engineering", { included: false });

    ops.applyScenario(scenario);
    toast.success(`Scenario applied · ${scenario}`);
  };

  /* ------------------------------------------------------- 34. demo story -- */

  const runStoryStep = useCallback((n: number) => {
    const step = demoStorySteps[n - 1];
    if (!step) return;
    setSpotlightId(step.target);
    scrollTo(step.target);
    say(`Demo story step ${n}. ${step.title}. ${step.caption}`);
    if (n === 5) setWorkbench((w) => ({ ...w, rollbackDefined: false }));
    if (n === 6) setWorkbench((w) => ({ ...w, rollbackDefined: true }));
    if (n === 9) setWorkbench((w) => ({ ...w, fraudLossAnalysisProvided: true }));
    if (n === 11) setWorkbench((w) => ({ ...w, trafficExposure: 15 }));
  }, [say]);

  useEffect(() => { if (storyStep > 0) runStoryStep(storyStep); }, [storyStep, runStoryStep]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filterKeys = Object.keys(readinessFilterOptions) as (keyof ReadinessFilters)[];
  const showQueueFirst = prefs.view === "queue" || prefs.view === "diagnostic";
  const spot = (id: string) => spotlightId === id;

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
    <div className={cn("min-h-full bg-slate-50 px-3 py-4 sm:px-5", reducedMotion && "motion-reduce")}>
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
          <Pill label={ops.state.operationalState === "Routed to Persona Impact" ? "Routed to Persona Impact" : serviceState}
            tone={serviceState === "Ready" ? "green" : serviceState === "Blocked" || serviceState === "Remediation Required" ? "red" : serviceState === "Conditionally Ready" ? "blue" : "amber"} />
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setSearchOpen(true)}>
            <Search className="mr-1 h-3.5 w-3.5" aria-hidden /> Search
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { toast.success("Readiness recalculated"); say("Assessments refreshed"); }}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden /> Refresh
          </Button>
          <Button size="sm" className="h-7 text-[11px]"
            onClick={() => { setPref("view", "workbench"); scrollTo("panel-workbench"); say("Assessment started in the workbench"); }}>
            Start Assessment
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => scrollTo("panel-version-comparison")}>Compare Assessments</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => scrollTo("panel-remediation")}>Request Remediation</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setReassessOpen(true)}>Reassess</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setProceedOpen(true)}>Proceed to Persona Impact</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExportOpen(true)}>Export</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline" className="h-7 text-[11px]">More</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
              <DropdownMenuLabel className="text-[11px]">Navigate</DropdownMenuLabel>
              {[
                ["panel-lifecycle", "Readiness Lifecycle"], ["panel-queue", "Assessment Queue"],
                ["panel-workbench", "Readiness Workbench"], ["panel-gates", "Readiness Gates"],
                ["panel-gate-operations", "Readiness Gate Operations"],
                ["panel-remediation", "Readiness Remediation Center"],
                ["panel-context-matrix", "Context Coverage"], ["panel-persona-readiness", "Persona Evaluation Readiness"],
                ["panel-persona-scope", "Candidate Persona Readiness Review"],
                ["panel-conditions", "Business Condition Coverage"],
                ["panel-condition-validation", "Business Condition Validation"],
                ["panel-policy-binding", "Policy Variable Bindings"],
                ["panel-dependencies", "Dependency Readiness"],
                ["panel-dependency-review", "Dependency Readiness Review"],
                ["panel-evidence", "Evidence Sufficiency"], ["panel-assumptions", "Assumptions"],
                ["panel-assumption-register", "Assumption Register"],
                ["panel-constraints", "Constraints"], ["panel-constraint-management", "Readiness Constraints"],
                ["panel-ambiguities", "Ambiguities"], ["panel-ambiguity-resolution", "Ambiguity Resolution"],
                ["panel-contradictions", "Contradictions"], ["panel-contradiction-workbench", "Contradiction Workbench"],
                ["panel-review-queue", "Readiness Review Queue"],
                ["panel-exceptions", "Readiness Exceptions"], ["panel-overrides", "Readiness Overrides"],
                ["panel-version-history", "Version History"], ["panel-version-comparison", "Version Comparison"],
                ["panel-findings", "Findings"], ["panel-quality", "Readiness Quality"],
                ["panel-quality-ops", "Readiness Quality Operations"],
                ["panel-handoff", "Persona Impact Handoff Preview"],
                ["panel-handoff-package", "Persona Impact Handoff Package"],
                ["panel-activity", "Recent Activity"], ["panel-notifications", "Notifications"],
              ].map(([id, label]) => (
                <DropdownMenuItem key={id} className="text-[11px]" onClick={() => scrollTo(id)}>{label}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px]">Governance</DropdownMenuLabel>
              <DropdownMenuItem className="text-[11px]" onClick={() => setExceptionOpen(true)}>Request Readiness Exception</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => setOverrideOpen(true)}>Request Readiness Override</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={() => setStage(stage === "Implementation" ? "Architecture" : "Implementation")}>
                Analysis stage: {stage} (toggle)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[11px]" onClick={() => setStoryStep(1)}>Demo Story</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px]">Demo Scenarios</DropdownMenuLabel>
              {demoScenarios.map((s) => (
                <DropdownMenuItem key={s} className="text-[11px]" onClick={() => applyScenario(s)}>{s}</DropdownMenuItem>
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

      {ops.state.historicalViolations > 0 && (
        <div role="alert" className="mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-900">
          <strong>Historical Integrity Alert.</strong> Historical Context Rewrite Violations: {ops.state.historicalViolations}.
          Readiness is Blocked, Context Integrity is Critical, and the Persona Impact Handoff is disabled.
        </div>
      )}

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
            <Button size="sm" variant="outline" className="h-7 text-[11px]"
              onClick={() => { savePrefs(prefs); toast.success("View saved"); }}>Save View</Button>
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
            page={page} pages={pages} onPage={setPage} spotlight={prefs.view === "queue" || spot("panel-queue")} toolbar={toolbar}
          />
        )}

        <ReadinessWorkbench
          state={workbench} computation={computation}
          selectedDimension={prefs.selectedDimension}
          onSelectDimension={(id) => { setPref("selectedDimension", id); say(`${id} dimension selected`); }}
          selectedEvidence={selectedEvidence}
          onSelectEvidence={(id) => { setSelectedEvidence(id); say(`Evidence ${id} selected`); }}
          onToggle={applyWorkbench}
          spotlight={prefs.view === "workbench" || spot("panel-workbench")}
        />

        <GatesPanel gates={computation.gates} />
        <GateOperationsPanel gates={computation.gates} state={ops.state} onAction={onGateAction} />

        <RemediationCenterPanel
          rows={ops.state.remediations} summary={ops.summary}
          onOpen={(r) => { setRemediationRow(r); setRemediationOpen(true); say(`${r.id} remediation opened`); }}
          onRequestClarification={(r) => openClarification(r.id, r.description)}
          onRequestEvidence={openEvidenceRequest}
          onAddEvidence={openAddEvidence}
          spotlight={spot("panel-remediation")}
        />

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
        <PersonaScopeValidationPanel state={ops.state} computation={computation}
          onAction={onPersonaAction} onAddPersona={() => ops.addPersona("Customer Support Operations")} />
        <ConditionReadinessPanel selected={selectedCondition} onSelect={setSelectedCondition} />
        <ConditionValidationPanel state={ops.state} onAction={onConditionAction} />
        <PolicyBindingPanel state={ops.state} onResolve={(v) => { setPolicyVar(v); setPolicyOpen(true); }} />
        <DependencyReadinessPanel rows={computation.dependencies} selected={selectedDependency} onSelect={setSelectedDependency} />
        <DependencyReviewPanel state={ops.state} onAction={onDependencyAction} />
        <EvidenceSufficiencyPanel
          provided={{ "EV 08": workbench.fraudLossAnalysisProvided, "EV 09": workbench.stressTestProvided }}
          selected={selectedEvidence} onSelect={setSelectedEvidence}
        />
        <AssumptionPanel />
        <AssumptionRegisterPanel state={ops.state} onAction={onAssumptionAction} />
        <ConstraintPanel />
        <ConstraintManagementPanel state={ops.state} onAction={(id, a) => ops.setConstraint(id, a === "Confirm" ? "Confirmed" : a === "Mark Not Applicable" ? "Not Applicable" : "Clarification Requested")} />
        <AmbiguityPanel />
        <AmbiguityResolutionPanel state={ops.state} onAction={onAmbiguityAction} />
        <ContradictionPanel />
        <ContradictionWorkbenchPanel state={ops.state} onResolve={(id) => { setContradictionId(id); setContradictionOpen(true); }} />
        <ReviewQueuePanel rows={ops.state.reviews}
          onOpen={(r) => { setReviewRow(r); setReviewOpen(true); say(`${r.id} review workbench opened`); }}
          onAction={onReviewAction} />
        <ExceptionsPanel rows={ops.state.exceptions} onRequest={() => setExceptionOpen(true)} onApprove={ops.approveException} />
        <OverridesPanel rows={ops.state.overrides} onRequest={() => setOverrideOpen(true)} onApprove={ops.approveOverride} />
        <VersionHistoryPanel rows={ops.state.versions}
          onOpen={(v) => { toast.info(`${v.id}`, { description: `${v.label} · ${v.state} · score ${v.score}` }); }}
          onCompare={() => scrollTo("panel-version-comparison")}
          onExport={(v) => downloadFile(`${v.id.replace(/\s+/g, "-")}.json`, JSON.stringify(v, null, 2), "application/json")} />
        <VersionComparisonPanel versions={ops.state.versions} />
        <FindingsPanel selected={selectedFinding} onSelect={(f) => setSelectedFinding(f.id)} />
        <QualityPanel />
        <QualityOpsPanel model={quality} />
        <HandoffPreviewPanel
          state={computation.state} score={computation.score} confidence={computation.confidence}
          personas={computation.personas} evidenceGaps={evidenceGaps}
          governanceRequired={computation.governanceRequired}
        />
        <HandoffPackagePanel pkg={handoffPackage} readiness={handoff} warnings={warnings}
          onProceed={() => setProceedOpen(true)} onExport={() => setExportOpen(true)} />
        <ActivityPanel rows={ops.state.activity} />
        <NotificationsPanel rows={ops.state.notifications}
          onRead={ops.markRead} onReadAll={ops.markAllRead} onAcknowledge={ops.acknowledge}
          onAssign={(id) => ops.assignNotification(id, "Enterprise Architecture")}
          onOpen={(n) => scrollTo(n.category.includes("Evidence") ? "panel-remediation" : "panel-activity")} />
      </div>

      {/* drawers and dialogs */}
      <AssessmentDetailDrawer open={detailOpen} onOpenChange={setDetailOpen}
        assessment={detailRow} gates={computation.gates} personas={computation.personas} />
      <RemediationDetailDrawer open={remediationOpen} onOpenChange={setRemediationOpen}
        remediation={remediationRow} onAction={onRemediationAction} />
      <ReviewWorkbenchDrawer open={reviewOpen} onOpenChange={setReviewOpen} review={reviewRow}
        gates={computation.gates}
        onDecision={(r, decision, comments) => {
          if (decision === "Request Evidence") openEvidenceRequest();
          if (decision === "Recommend Exception") setExceptionOpen(true);
          if (decision === "Accept Nonblocking Uncertainty") ops.acceptUncertainty(r.issue);
          ops.updateReview(r.id, { status: decision === "Confirm Assessment" ? "Confirmed" : "In Progress", decision, comments });
        }} />

      <ClarificationDialog open={clarifyOpen} onOpenChange={setClarifyOpen} context={clarifyCtx}
        onSubmit={(d) => {
          const id = ops.requestClarification({ ...d, assessment: clarifyCtx.assessment, remediationId: clarifyCtx.remediationId });
          window.setTimeout(() => {
            const res = ops.answerClarification(id);
            if ((res.patch as { trafficExposure?: 5 | 15 }).trafficExposure === 15) {
              applyWorkbench({ trafficExposure: 15 }, "Traffic exposure clarified at 15%");
            }
            toast.success("Clarification response received", { description: res.effect });
          }, 900);
        }} />

      <EvidenceRequestDialog open={evidenceReqOpen} onOpenChange={setEvidenceReqOpen} seed={evidenceReqSeed}
        onSubmit={(d) => ops.requestEvidence({ ...d, assessment: "CRA 7001" })} />

      <AddEvidenceDialog open={addEvidenceOpen} onOpenChange={setAddEvidenceOpen} seed={addEvidenceSeed}
        gapOptions={ops.state.remediations.map((r) => r.id)} onSubmit={handleAddEvidence} />

      <PolicyBindingDialog open={policyOpen} onOpenChange={setPolicyOpen} variable={policyVar}
        onBind={(v, value) => { ops.bindPolicy(v, value); if (v === "risk.fraud.materiality") applyWorkbench({ fraudPolicyBound: true }, "Fraud materiality policy bound"); }}
        onRequestReview={(v) => ops.log("Policy Binding Required", `Policy owner review requested for ${v}`)} />

      <AcceptAssumptionDialog open={assumptionOpen} onOpenChange={setAssumptionOpen}
        assumptionId={assumptionId} onAccept={ops.acceptAssumption} />

      <AmbiguityDialog open={ambiguityOpen} onOpenChange={setAmbiguityOpen} ambiguityId={ambiguityId}
        mode={ambiguityMode} onResolve={ops.resolveAmbiguity}
        onClarify={(q) => openClarification(null, q)} />

      <ContradictionDialog open={contradictionOpen} onOpenChange={setContradictionOpen}
        contradictionId={contradictionId} onResolve={ops.resolveContradiction} />

      <ExceptionDialog open={exceptionOpen} onOpenChange={setExceptionOpen} onSubmit={ops.requestException} />

      <OverrideDialog open={overrideOpen} onOpenChange={setOverrideOpen} currentState={computation.state}
        blockingFindings={[...computation.blockingGaps, ...computation.materialGaps]} onSubmit={ops.requestOverride} />

      <ReassessDialog open={reassessOpen} onOpenChange={setReassessOpen}
        onSubmit={(scope, reason) => ops.reassess(scope, reason, computation)} />

      <ProceedDialog open={proceedOpen} onOpenChange={setProceedOpen} validation={routing}
        summary={{
          assessmentVersion: handoffPackage.assessmentVersion,
          readinessState: computation.state,
          personas: handoffPackage.candidatePersonas,
          personaReadiness: handoffPackage.personaReadiness,
          evidenceGaps: handoffPackage.evidenceGaps,
          acceptedAssumptions: handoffPackage.acceptedAssumptions,
          exceptions: handoffPackage.exceptions,
          criticalWarnings: handoffPackage.criticalDownstreamWarnings,
          historicalContextVersion: handoffPackage.historicalContextVersion,
        }}
        onProceed={doProceed} />

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} onSearch={doSearch}
        onOpenResult={(r) => scrollTo(r.target)} />

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} onExport={doExport} />

      {storyStep > 0 && (
        <DemoStoryOverlay step={storyStep}
          onNext={() => setStoryStep((s) => Math.min(demoStorySteps.length, s + 1))}
          onPrev={() => setStoryStep((s) => Math.max(1, s - 1))}
          onExit={() => { setStoryStep(0); setSpotlightId(null); say("Demo story exited"); }}
          reducedMotion={reducedMotion} onToggleMotion={() => setReducedMotion((v) => !v)} />
      )}
    </div>
  );
}
