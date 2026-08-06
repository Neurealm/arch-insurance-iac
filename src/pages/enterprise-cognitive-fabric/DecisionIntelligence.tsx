/**
 * Decision Intelligence — Prompt 1 core plus Prompt 2 operational workflow.
 *
 * Transforms governed enterprise context into an explainable decision
 * environment, then lets the enterprise make, explain, record, govern and hand
 * off a decision while preserving the context that existed at the time.
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
  activeFilterCount, defaultFilters, diTone, diViews,
  evaluationById, evaluations, filterOptions, kpiFocusPanel, operationalState, seedActivity,
  stageById,
  type ComparisonRow, type DecisionAlternative, type DecisionConstraint,
  type DecisionIntelligenceEvaluation, type DiEvidence, type DiView, type FilterKey,
  type PriorDecision,
} from "./decision-intelligence/data";
import {
  AcknowledgementPanel, AlternativeRefinementPanel, ApprovalChainPanel, AuditTrailPanel,
  ChallengePanel, ContextSnapshotPanel, DecisionRecordPanel, DemoScenarioBar, DemoStoryOverlay,
  DecisionScopePanel, DissentPanel, EscalationPanel, ExecutionHandoffPanel, MitigationPlannerPanel,
  MitigationTradeoffPanel, NotificationsPanel, ObservationContractPanel, OpsActivityPanel,
  RawVsMitigatedPanel, ReadinessPanel, RecommendationVsDecisionPanel, RegisteredOutcomePanel,
  ReviewQueuePanel, ReviewWorkbenchPanel, ScenarioComparisonPanel, ScenarioSimulatorPanel,
  SensitivityPanel, ThresholdPanel, VersionComparisonPanel, VersionHistoryPanel,
} from "./decision-intelligence/ops-panels";
import {
  ApprovalDialog, ChallengeDialog, DissentDialog, EscalationDialog, EvidenceActionDialog,
  ExportDialog, GlobalSearchDialog, RecordDecisionDialog, RefineAlternativeDialog,
  ReviewActionDialog, ScopeEditDialog, StartDecisionAnalysisDialog,
} from "./decision-intelligence/ops-dialogs";
import {
  alternativeCode, baselineScenario, buildSnapshot, demoScenarios, emptyHandoff,
  emptyObservationContract, personaNameById, readinessMetrics, readinessState, refinedParams,
  scenarioState, seedAcknowledgements, seedApprovals, seedAudit, seedChallenges,
  seedDecisionConditions, seedDecisionRecord, seedDissents, seedEscalations, seedMitigations,
  seedNotifications, seedOpsActivity, seedRefinements, seedReviews, seedScenarios, seedScope,
  seedVersions, storySteps, workExecutionRoute,
  type AuditEvent, type DecisionAcknowledgement, type DecisionApproval,
  type DecisionContextSnapshot, type DecisionDissent, type DecisionEscalation,
  type DecisionNotification, type DecisionRecord, type DecisionReview, type DecisionScenarioParams,
  type DecisionScope, type ExecutionHandoff, type ObservationContract, type OpsActivity,
  type RecommendationChallenge, type RefinedAlternative, type ReviewDecision,
} from "./decision-intelligence/ops-data";

const STORAGE_KEY = "ecf:decision-intelligence:v1";
const clock = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const stamp = () => new Date().toISOString().slice(0, 16).replace("T", " ");


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
  const [params, setParams] = useState<DecisionScenarioParams>(baselineScenario);
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

  /* --------------------------------------------------- prompt 2 operations */
  const [scope, setScope] = useState<DecisionScope>(seedScope);
  const [refinements, setRefinements] = useState<RefinedAlternative[]>(seedRefinements);
  const [comparedRefinement, setComparedRefinement] = useState<string | null>(null);
  const [appliedMitigations, setAppliedMitigations] = useState<string[]>(
    seedMitigations.filter((m) => m.status === "Accepted").map((m) => m.id));
  const [mitigations, setMitigations] = useState(seedMitigations);
  const [reviews, setReviews] = useState<DecisionReview[]>(seedReviews);
  const [activeReview, setActiveReview] = useState<DecisionReview | null>(null);
  const [acks, setAcks] = useState<DecisionAcknowledgement[]>(seedAcknowledgements);
  const [approvals, setApprovals] = useState<DecisionApproval[]>(seedApprovals);
  const [activeApproval, setActiveApproval] = useState<DecisionApproval | null>(null);
  const [dissents, setDissents] = useState<DecisionDissent[]>(seedDissents);
  const [challenges, setChallenges] = useState<RecommendationChallenge[]>(seedChallenges);
  const [escalations, setEscalations] = useState<DecisionEscalation[]>(seedEscalations);
  const [record, setRecord] = useState<DecisionRecord | null>(null);
  const [snapshot, setSnapshot] = useState<DecisionContextSnapshot | null>(null);
  const [handoff, setHandoff] = useState<ExecutionHandoff>(emptyHandoff);
  const [contract, setContract] = useState<ObservationContract>(emptyObservationContract);
  const [audit, setAudit] = useState<AuditEvent[]>(seedAudit);
  const [notifications, setNotifications] = useState<DecisionNotification[]>(seedNotifications);
  const [opsActivity, setOpsActivity] = useState<OpsActivity[]>(seedOpsActivity);
  const [versionLeft, setVersionLeft] = useState("DIA 5001 v1");
  const [versionRight, setVersionRight] = useState("DEC 5001 v1");
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState(-1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [moreMenu, setMoreMenu] = useState(false);

  /* dialogs */
  const [startOpen, setStartOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [dissentOpen, setDissentOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

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
  const derived = useMemo(() => scenarioState(params), [params]);
  const evaluation = evaluationById(selectedDecisionId);
  const stage = stageById(selectedStage);
  const readiness = useMemo(
    () => readinessMetrics(derived, reviews, approvals, record), [derived, reviews, approvals, record]);
  const processState = useMemo(
    () => readinessState(readiness, record, handoff), [readiness, record, handoff]);
  const serviceState = record ? processState : operationalState(derived);

  /* ------------------------------------------------------- activity engine */
  const logOps = useCallback((action: string, description: string, result: string, owner: string) => {
    const auditId = `AUD ${88200 + Math.floor(Math.random() * 700)}`;
    setOpsActivity((prev) => [{ id: `DOA ${Date.now()}`, timestamp: clock(), evaluationId: "DIA 5001", action, description, result, owner, auditId }, ...prev]);
    setAudit((prev) => [{ id: auditId, timestamp: stamp(), actor: owner, role: "Operator", action, previousState: "—", newState: result, reason: description }, ...prev]);
    say(`${action}. ${description}`);
  }, [say]);

  const notify = useCallback((type: string, title: string, description: string, severity: DecisionNotification["severity"], owner: string) => {
    setNotifications((prev) => [{ id: `DNT ${Date.now()}`, evaluationId: "DIA 5001", decisionRecordId: null, type, title, description, severity, owner, status: "Unread", createdAt: clock() }, ...prev]);
  }, []);


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

  /* --------------------------------------------------- prompt 2 operations */
  const changeParams = (p: Partial<DecisionScenarioParams>) => {
    setParams((prev) => {
      const next = { ...prev, ...p };
      const before = scenarioState(prev);
      const after = scenarioState(next);
      const notes: string[] = [];
      if (!before.jointApprovalRequired && after.jointApprovalRequired) notes.push("joint approval activated");
      if (before.jointApprovalRequired && !after.jointApprovalRequired) notes.push("joint approval no longer required");
      if (before.governanceRestricted !== after.governanceRestricted) notes.push(after.governanceRestricted ? "quarter end restriction activated" : "deployment restriction cleared");
      if (before.posture !== after.posture) notes.push(`recommendation changed to ${after.posture}`);
      setApprovals((prev2) => prev2.map((a) => (a.approver === "Release Governance"
        ? { ...a, status: after.jointApprovalRequired ? (a.status === "Not Required" ? "Pending" : a.status) : "Not Required" }
        : a)));
      window.setTimeout(() => {
        logOps("Scenario changed", `Proposal parameters updated. ${notes.length ? notes.join(", ") : "no governance change"}`,
          after.posture, "Decision Facilitation");
        if (notes.length) notify("Recommendation Changed", "Scenario change updated the decision context", notes.join(", "), "High", "Decision Facilitation");
      }, 0);
      return next;
    });
  };

  const onEvidenceSubmit = (action: string, type: string, owner: string, note: string) => {
    setEvidenceOpen(false);
    if (action === "Add Evidence" || action === "Link Existing Evidence") {
      if (type === "Fraud Analysis") changeParams({ fraudLossAnalysis: "Provided" });
      else if (type === "Dependency Capacity Test" || type === "Load Test") changeParams({ dependencyStressTest: "Provided" });
      else if (type === "Rollback Validation") changeParams({ rollbackCapability: "Available" });
      logOps("Evidence added", `${type} added by ${owner}. ${note}`.trim(), "Coverage updated", owner);
      notify("Evidence Added", `${type} added`, "Evidence coverage and recommendation confidence recalculated", "Medium", owner);
    } else if (action === "Request Evidence") {
      logOps("Evidence requested", `${type} requested from ${owner}. ${note}`.trim(), "Open", owner);
      notify("Evidence Requested", `${type} requested`, `Requested from ${owner}`, "High", owner);
    } else {
      logOps(action, `${type} · ${note}`.trim(), "Recorded", owner);
    }
  };

  const onReviewSubmit = (decision: ReviewDecision, comments: string, condition: string) => {
    if (!activeReview) return;
    const status = decision === "Disagree" ? "Challenged"
      : decision === "Request Evidence" ? "Evidence Requested"
        : decision === "Escalate" ? "Escalated" : "Complete";
    setReviews((prev) => prev.map((r) => (r.id === activeReview.id
      ? { ...r, decision, comments: [comments, condition].filter(Boolean).join(" · "), status, completedAt: stamp() } : r)));
    setActiveReview((r) => (r ? { ...r, decision, comments, status } : r));
    setReviewOpen(false);
    logOps("Reviewer position recorded", `${activeReview.id} · ${decision}`, status, activeReview.reviewer);
    notify(decision === "Disagree" ? "Reviewer Challenged Recommendation" : "Review Requested",
      `${activeReview.reviewer} recorded ${decision}`, comments || activeReview.issue,
      decision === "Disagree" ? "High" : "Medium", activeReview.reviewer);
    if (decision === "Escalate") setEscalationOpen(true);
  };

  const onApprovalSubmit = (decision: string, conditions: string[], comments: string) => {
    if (!activeApproval) return;
    const status: DecisionApproval["status"] =
      decision === "Approve" ? "Approved"
        : decision === "Approve with Conditions" ? "Approved with Conditions"
          : decision === "Request Changes" ? "Changes Requested"
            : decision === "Reject" ? "Rejected" : decision === "Defer" ? "Deferred" : "Escalated";
    setApprovals((prev) => prev.map((a) => (a.id === activeApproval.id
      ? { ...a, status, decision, conditions, comments, completedAt: stamp() } : a)));
    setApprovalOpen(false);
    logOps("Approval recorded", `${activeApproval.approver} · ${decision}`, status, activeApproval.approver);
    notify(status === "Rejected" ? "Approval Rejected" : status === "Approved with Conditions" ? "Conditional Approval" : "Approval Granted",
      `${activeApproval.approver} ${decision}`, conditions.join(" · ") || comments || "No conditions", "Medium", activeApproval.approver);
  };

  const recordDecision = (r: { decision: string; selectedAlternativeId: string; rationale: string; conditions: typeof seedDecisionConditions; confidence: number }) => {
    const next: DecisionRecord = {
      ...seedDecisionRecord,
      decision: r.decision,
      selectedAlternativeId: r.selectedAlternativeId,
      decisionRationale: r.rationale,
      conditions: r.conditions,
      confidence: r.confidence,
      approvalIds: approvals.filter((a) => a.status.startsWith("Approved")).map((a) => a.id),
      dissentIds: dissents.map((d) => d.id),
      decisionDate: stamp(),
      status: record ? "Amended" : "Recorded",
    };
    setRecord(next);
    setSnapshot(buildSnapshot(next, derived));
    setRecordOpen(false);
    logOps("Decision recorded", `${next.decisionNumber} · ${next.decision}`, "Decision Recorded", next.decisionOwner);
    notify("Decision Recorded", `${next.decisionNumber} recorded`, next.decision, "High", next.decisionOwner);
    focusPanel("panel-decision-record");
  };

  const prepareHandoff = () => {
    setHandoff((h) => ({ ...h, status: "Prepared", createdAt: stamp() }));
    logOps("Execution handoff created", "Governed execution conditions prepared for DEC 5001", "Execution Ready", "Release Governance");
    notify("Execution Handoff Created", "Execution handoff prepared", "Conditions, controls and limits published to execution", "Medium", "Release Governance");
  };

  const createContract = () => {
    setContract((c) => ({ ...c, status: "Created", createdAt: stamp() }));
    logOps("Observation contract created", "Learning observation contract created for DEC 5001", "Observation Contract Ready", "Organizational Learning");
    notify("Observation Contract Created", "Observation contract created", "Expected outcomes registered for future comparison", "Medium", "Organizational Learning");
  };

  const applyScenario = (id: string) => {
    const s = demoScenarios.find((x) => x.id === id);
    if (!s) return;
    setScenarioId(id);
    if (s.state === "reset") {
      setParams(baselineScenario); setReviews(seedReviews); setApprovals(seedApprovals);
      setAcks(seedAcknowledgements); setDissents(seedDissents); setChallenges(seedChallenges);
      setEscalations(seedEscalations); setRecord(null); setSnapshot(null); setHandoff(emptyHandoff);
      setContract(emptyObservationContract); setNotifications(seedNotifications);
      setOpsActivity(seedOpsActivity); setAudit(seedAudit); setRefinements(seedRefinements);
      setComparedRefinement(null); setActiveReview(null); setScenarioId(null);
      setMitigations(seedMitigations);
      setAppliedMitigations(seedMitigations.filter((m) => m.status === "Accepted").map((m) => m.id));
      say("Demo data reset to the seeded baseline");
      return;
    }
    if (s.params) setParams((p) => ({ ...p, ...s.params }));
    switch (s.state) {
      case "review":
        setReviews((prev) => prev.map((r) => (r.id === "DIR 5501"
          ? { ...r, status: "Challenged", decision: "Disagree", comments: "Fraud exposure cannot be estimated without the analysis" } : r)));
        break;
      case "dissent":
        setDissents(seedDissents);
        break;
      case "approve":
        setApprovals((prev) => prev.map((a) => (a.approver === "Release Governance" ? { ...a, status: "Pending" } : a)));
        break;
      case "conditional":
        setApprovals((prev) => prev.map((a) => (a.approver === "Fraud Engineering"
          ? { ...a, status: "Approved with Conditions", decision: "Approve with Conditions", conditions: ["Maximum initial exposure 5%", "Fraud Loss Analysis accepted"], completedAt: stamp() } : a)));
        break;
      case "escalate":
        setEscalations((prev) => [{
          ...seedEscalations[0], id: `DES ${prev.length + 1}`, evaluationId: "DIA 5001",
          issueType: "Executive Tradeoff Required", title: "Checkout retry expansion requires an executive tradeoff",
          description: "Fraud exposure and checkout recovery cannot both be optimised at the requested exposure.",
          severity: "High", status: "Open", createdAt: stamp(),
        }, ...prev]);
        break;
      case "record":
        recordDecision({
          decision: "Approve Option B with Conditions", selectedAlternativeId: "ALT 5001 B",
          rationale: seedDecisionRecord.decisionRationale, conditions: seedDecisionConditions, confidence: 94,
        });
        break;
      case "handoff":
        if (!record) recordDecision({ decision: "Approve Option B with Conditions", selectedAlternativeId: "ALT 5001 B", rationale: seedDecisionRecord.decisionRationale, conditions: seedDecisionConditions, confidence: 94 });
        prepareHandoff();
        break;
      case "contract":
        if (!record) recordDecision({ decision: "Approve Option B with Conditions", selectedAlternativeId: "ALT 5001 B", rationale: seedDecisionRecord.decisionRationale, conditions: seedDecisionConditions, confidence: 94 });
        createContract();
        break;
      case "reassess":
        notify("Decision Reassessment Required", "Context changed after the decision was recorded",
          "A Persona version changed after the recorded decision. The snapshot is unchanged.", "High", "Decision Facilitation");
        break;
      default:
        break;
    }
    logOps("Demo scenario applied", s.name, s.note, "Demo");
  };

  /* ------------------------------------------------------------- demo story */
  const runStoryStep = (i: number) => {
    const step = storySteps[i];
    if (!step) return;
    focusPanel(step.target);
    switch (step.action) {
      case "open-decision": setSelectedDecisionId("DIA 5001"); setDetail(evaluationById("DIA 5001")); break;
      case "traffic-15": changeParams({ trafficExposure: 15 }); break;
      case "rollout-off": changeParams({ progressiveRollout: false }); break;
      case "add-evidence": changeParams({ fraudLossAnalysis: "Provided", dependencyStressTest: "Provided", progressiveRollout: true }); break;
      case "record-decision":
        recordDecision({ decision: "Approve Option B with Conditions", selectedAlternativeId: "ALT 5001 B", rationale: seedDecisionRecord.decisionRationale, conditions: seedDecisionConditions, confidence: 94 });
        break;
      case "handoff": prepareHandoff(); createContract(); break;
      default: break;
    }
    say(`Demo story step ${i + 1}. ${step.caption}`);
  };

  const startStory = () => { setStoryIndex(0); runStoryStep(0); };
  const nextStory = () => { const i = Math.min(storySteps.length - 1, storyIndex + 1); setStoryIndex(i); runStoryStep(i); };
  const prevStory = () => { const i = Math.max(0, storyIndex - 1); setStoryIndex(i); runStoryStep(i); };

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

  const versionA = seedVersions.find((v) => v.id === versionLeft) ?? seedVersions[0];
  const versionB = seedVersions.find((v) => v.id === versionRight) ?? seedVersions[seedVersions.length - 1];
  const executionRouteExists = false;


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
          <Button size="sm" className="h-7 text-[11px]" onClick={() => setStartOpen(true)}>Start Decision Analysis</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => { setView("comparison"); focusPanel("panel-comparison"); say("Alternative comparison focused"); }}>
            <Scale className="mr-1 h-3.5 w-3.5" aria-hidden /> Compare Alternatives
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => focusPanel("panel-evidence")}>Open Evidence</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setRecordOpen(true)}>Record Decision</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setSearchOpen(true)}>
            <Search className="mr-1 h-3.5 w-3.5" aria-hidden /> Search
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExportOpen(true)}>
            <Download className="mr-1 h-3.5 w-3.5" aria-hidden /> Export
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" aria-label="More actions" onClick={() => { setMoreMenu((v) => !v); say("Additional decision operations"); }}>
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

        <DecisionContextPackagePanel evaluation={evaluationById("DIA 5001")} derived={derived} onOpenPrompt2={(label) => { if (label.includes("Record")) setRecordOpen(true); else if (label.includes("Export")) setExportOpen(true); else say(label); }} />

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
