/**
 * Enterprise Cognitive Health — Prompts 1 and 2.
 *
 * Prompt 1 established measurement, diagnosis and explanation: the index, the
 * seven dimensions, the lifecycle, scopes, heatmaps, signals, diagnostic paths
 * and the cognitive health workbench. All of that is reused unchanged.
 *
 * Prompt 2 completes the operating model: threshold governance, scoring policy,
 * reviews, alerts, interventions and their measured effectiveness, scenario
 * simulation, sensitivity, projection, decision exposure, reassessment,
 * snapshot history and comparison, governance, risk acceptance, escalation,
 * executive briefing, search, notifications, export, demo story and scenarios.
 *
 * Everything is deterministic and local. No backend and no live enterprise
 * systems are called. Scenario and projection output is always an estimate.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, Download, MoreHorizontal, RefreshCw, Search, Stethoscope } from "lucide-react";
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
  chViews, deriveHealthState, dimensionById, dimensionByName, dimensions, kpiFocusPanel, signalById, signals,
  stageById,
  type ChFilterKey, type ChView, type ChWorkbenchParams, type CognitiveHealthSignal, type HeatmapMode,
  type TeamPersonaCognitiveHealth, type TrendRange, type WorkbenchScope,
} from "./cognitive-health/data";
import {
  CriticalOverrideBanner, DecisionExposurePanel, EchiPolicyHistoryPanel, ExecutiveBriefingPanel,
  GeneratedBriefPanel, HealthAlertsPanel, HealthDemoScenarioBar, HealthDemoStoryOverlay,
  HealthEscalationPanel, HealthGovernancePanel, HealthNotificationsPanel, HealthOpsActivityPanel,
  HealthReassessmentPanel, HealthReviewQueuePanel, HealthReviewWorkbenchPanel,
  HealthScenarioComparisonPanel, HealthScenarioSimulatorPanel, HealthSensitivityPanel,
  HealthTrendProjectionPanel, InterventionDetailPanel, InterventionEffectivenessPanel,
  InterventionPlannerPanel, OperationalStatePanel, RiskAcceptancePanel, ScoringPolicyPanel,
  SnapshotComparisonPanel, SnapshotHistoryPanel, ThresholdGovernancePanel,
} from "./cognitive-health/ops-panels";
import {
  CreateInterventionDialog, ExecutiveBriefDialog, HealthEscalationDialog, HealthExportDialog,
  HealthSearchDialog, PolicyComparisonDialog, PolicyPreviewDialog, ReviewDecisionDialog,
  RiskAcceptanceDialog, ThresholdProposalDialog, emptyDraft, type NewInterventionDraft,
} from "./cognitive-health/ops-dialogs";
import {
  baselineControls, baselineDimensionScores, computeEchi, criticalOverride, currentPolicy, demoScenarios,
  dimName, echiPolicyVersions, generateExecutiveBrief, healthStorySteps, integrityAlert,
  interventionSummary, nowLabel, operationalStates, seedHealthAlerts, seedHealthReviews,
  seedEscalations, seedExposures, seedInterventions, seedMeasurements, seedNotifications,
  seedOpsActivity, seedPolicyDimensions, seedReassessments, seedRiskAcceptances, seedScenarios,
  seedIntegrityViolations, signalName, snapshotHistory, toChActivity,
  type CognitiveHealthAlert, type CognitiveHealthDecisionExposure, type CognitiveHealthEscalation,
  type CognitiveHealthExecutiveBrief, type CognitiveHealthIntervention, type CognitiveHealthNotification,
  type CognitiveHealthPolicyDimension, type CognitiveHealthReassessment, type CognitiveHealthReview,
  type CognitiveHealthRiskAcceptance, type CognitiveHealthScenario, type ComparisonMode,
  type HealthControls, type HealthOpsActivity, type InterventionStatus, type ProjectionHorizon,
  type ScopeType,
} from "./cognitive-health/ops-data";

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

  /* ================================================== prompt 2 operational */
  const [policyRows, setPolicyRows] = useState<CognitiveHealthPolicyDimension[]>(seedPolicyDimensions);
  const [policyVersion, setPolicyVersion] = useState(currentPolicy.version);
  const [approvalState, setApprovalState] = useState<string>(currentPolicy.approvalState);
  const [previewEchi, setPreviewEchi] = useState<number | null>(null);

  const [reviews, setReviews] = useState<CognitiveHealthReview[]>(seedHealthReviews);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>("CHR 7001");
  const [reviewSeverity, setReviewSeverity] = useState("All");

  const [alerts, setAlerts] = useState<CognitiveHealthAlert[]>(seedHealthAlerts);
  const [interventions, setInterventions] = useState<CognitiveHealthIntervention[]>(seedInterventions);
  const [selectedInterventionId, setSelectedInterventionId] = useState<string | null>("CHI 9001");
  const [exposures, setExposures] = useState<CognitiveHealthDecisionExposure[]>(seedExposures);
  const [reassessments, setReassessments] = useState<CognitiveHealthReassessment[]>(seedReassessments);
  const [risks, setRisks] = useState<CognitiveHealthRiskAcceptance[]>(seedRiskAcceptances);
  const [escalations, setEscalations] = useState<CognitiveHealthEscalation[]>(seedEscalations);
  const [notifications, setNotifications] = useState<CognitiveHealthNotification[]>(seedNotifications);
  const [notificationFilter, setNotificationFilter] = useState("All");
  const [opsActivity, setOpsActivity] = useState<HealthOpsActivity[]>(seedOpsActivity);

  const [controls, setControls] = useState<HealthControls>(baselineControls);
  const [projectionHorizon, setProjectionHorizon] = useState<ProjectionHorizon>("Quarter");
  const [projectionInterventions, setProjectionInterventions] = useState<string[]>([]);
  const [compareLeft, setCompareLeft] = useState("ECHS 4386");
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("As Measured at the Time");
  const [brief, setBrief] = useState<CognitiveHealthExecutiveBrief | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const [integrityViolations, setIntegrityViolations] = useState(seedIntegrityViolations);
  const [dimensionOverrides, setDimensionOverrides] = useState<Record<string, number>>({});
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  /* ------------------------------------------------------------- dialogs -- */
  const [interventionDialog, setInterventionDialog] = useState(false);
  const [draft, setDraftState] = useState<NewInterventionDraft>(emptyDraft);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; decision: string }>({ open: false, decision: "" });
  const [riskDialog, setRiskDialog] = useState(false);
  const [escalationDialog, setEscalationDialog] = useState(false);
  const [thresholdDialog, setThresholdDialog] = useState(false);
  const [policyCompareDialog, setPolicyCompareDialog] = useState(false);
  const [policyPreviewDialog, setPolicyPreviewDialog] = useState(false);
  const [briefDialog, setBriefDialog] = useState(false);
  const [searchDialog, setSearchDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  /* ---------------------------------------------------------- demo story -- */
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const say = useCallback((m: string) => setAnnounce(m), []);
  const activityCounter = useRef(0);

  const logOps = useCallback((label: string, detail: string, category: string) => {
    activityCounter.current += 1;
    setOpsActivity((prev) => [
      { id: `HOA N${activityCounter.current}`, time: nowLabel(), label, detail, category },
      ...prev,
    ].slice(0, 40));
  }, []);

  const notify = useCallback((n: Omit<CognitiveHealthNotification, "id" | "createdAt" | "status">) => {
    activityCounter.current += 1;
    setNotifications((prev) => [
      { ...n, id: `CHN N${activityCounter.current}`, status: "Unread", createdAt: new Date().toISOString().slice(0, 16).replace("T", " ") },
      ...prev,
    ]);
  }, []);

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
        if (s.controls) setControls(s.controls);
        if (s.comparisonMode) setComparisonMode(s.comparisonMode);
        if (s.projectionHorizon) setProjectionHorizon(s.projectionHorizon);
      }
    } catch { /* storage may be unavailable */ }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        view, density, savedView, filters, selectedDimension, selectedStage, heatmapMode, trendRange,
        params, selection, controls, comparisonMode, projectionHorizon,
      }));
    } catch { /* storage may be unavailable */ }
  }, [view, density, savedView, filters, selectedDimension, selectedStage, heatmapMode, trendRange,
    params, selection, controls, comparisonMode, projectionHorizon]);

  /* ------------------------------------------------------------- derivation */
  const derived = useMemo(() => deriveHealthState(params), [params]);
  const stage = stageById(selectedStage);

  const effectiveDimensionScores = useMemo(
    () => ({ ...baselineDimensionScores, ...dimensionOverrides }),
    [dimensionOverrides],
  );

  const livePolicy = useMemo(
    () => ({ ...currentPolicy, version: policyVersion, dimensionPolicy: policyRows }),
    [policyRows, policyVersion],
  );

  const effective = useMemo(
    () => computeEchi(effectiveDimensionScores, livePolicy),
    [effectiveDimensionScores, livePolicy],
  );

  const currentSnapshot = useMemo(() => ({
    ...snapshotHistory[0],
    echi: effective.echi,
    dimensionScores: effectiveDimensionScores,
    scoringPolicyVersion: policyVersion,
    criticalSignalIds: integrityViolations > 0
      ? ["CHS 1002", "CHS 1003", "CHS 1006"]
      : snapshotHistory[0].criticalSignalIds,
  }), [effective.echi, effectiveDimensionScores, policyVersion, integrityViolations]);

  const override = useMemo(
    () => criticalOverride(currentSnapshot.criticalSignalIds, integrityViolations, exposures),
    [currentSnapshot.criticalSignalIds, integrityViolations, exposures],
  );

  const liveScenario: CognitiveHealthScenario | null = useMemo(() => {
    const changed = Object.keys(controls).some((k) => controls[k] !== baselineControls[k]);
    if (!changed) return null;
    const c = computeEchi(
      Object.fromEntries(dimensions.map((d) => [d.id, d.score])), livePolicy,
    );
    const sim = seedScenarios[0];
    return {
      ...sim, id: "CHSC LIVE", name: "Live Simulator",
      description: "Current simulator control positions",
      signalOverrides: controls,
      scenarioDimensionScores: c.dimensionScores,
      scenarioEchi: c.echi,
      estimatedEffort: "Modelled", affectedScopeIds: ["Enterprise"], decisionBenefitIds: [],
      riskNotes: "Scenario Estimate · Not Observed Result",
    };
  }, [controls, livePolicy]);

  const selectedReview = useMemo(
    () => reviews.find((r) => r.id === selectedReviewId) ?? null,
    [reviews, selectedReviewId],
  );
  const selectedIntervention = useMemo(
    () => interventions.find((i) => i.id === selectedInterventionId) ?? null,
    [interventions, selectedInterventionId],
  );

  const activeStates = useMemo(() => {
    const s = new Set<string>();
    s.add(effective.band);
    if (integrityViolations > 0) { s.add("Historical Integrity Alert"); s.add("Critical"); }
    if (reviews.some((r) => r.status === "Open" || r.status === "In Review")) s.add("Review Required");
    for (const i of interventions) {
      if (i.status === "Proposed") s.add("Intervention Proposed");
      if (i.status === "In Progress") s.add("Intervention In Progress");
      if (i.status === "Measurement Window") s.add("Measurement Window");
      if (i.status === "Successful") s.add("Successful");
      if (i.status === "Partially Successful") s.add("Partially Successful");
      if (i.status === "No Material Improvement") s.add("No Material Improvement");
      if (i.status === "Escalated") s.add("Escalated");
    }
    if (risks.some((r) => r.status === "Active" || r.status === "Expiring")) s.add("Risk Accepted");
    if (reassessments.some((r) => r.status === "Pending" || r.status === "Requested")) s.add("Reassessment Required");
    if (escalations.some((e) => e.status === "Open")) s.add("Escalated");
    return [...s];
  }, [effective.band, integrityViolations, reviews, interventions, risks, reassessments, escalations]);

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
  const focusPanel = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth", block: "start",
    });
  }, [reducedMotion]);

  const refresh = () => {
    say("Recalculating enterprise cognitive health measurement");
    window.setTimeout(() => say(`Enterprise cognitive health recalculated. Index ${effective.echi}, ${effective.band}`), 320);
  };

  const onKpi = (id: string) => {
    setKpiFocus((prev) => (prev === id ? null : id));
    setSignalPage(1);
    focusPanel(kpiFocusPanel(id));
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
    if (target.startsWith("signal:")) {
      const s = signalById(target.split(":")[1]);
      if (s) { setSignalDrawer(s); say(`${s.name} signal opened`); }
      return;
    }
    if (target.startsWith("dimension:")) {
      const id = target.split(":")[1];
      setSelectedDimension(id); setDimensionDrawer(id); say(`${dimName(id)} detail opened`);
      return;
    }
    if (target.startsWith("review:")) {
      setSelectedReviewId(target.split(":")[1]); focusPanel("panel-review-workbench");
      say("Health review opened in the workbench");
      return;
    }
    if (target.startsWith("intervention:")) {
      setSelectedInterventionId(target.split(":")[1]); focusPanel("panel-intervention-detail");
      say("Intervention detail opened");
      return;
    }
    if (target.startsWith("panel-")) { focusPanel(target); return; }
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

  /* ------------------------------------------------------- policy handlers */
  const setWeight = (dimensionId: string, weight: number) => {
    setPolicyRows((rows) => rows.map((r) => (r.dimensionId === dimensionId ? { ...r, weight } : r)));
    setApprovalState("Draft");
    say(`${dimName(dimensionId)} contribution weight set to ${Math.round(weight * 100)} percent`);
  };

  const submitPolicy = () => {
    setApprovalState("Approved");
    setPolicyVersion((v) => (v.endsWith("draft") ? v.replace(" draft", "") : v));
    logOps("Scoring policy approved", `Policy ${policyVersion} approved locally for demonstration`, "Policy");
    notify({ signalId: null, dimensionId: null, interventionId: null, type: "Scoring Policy Changed", title: "Scoring policy approved", description: `Policy ${policyVersion} approved. Historical snapshots keep their original policy version`, severity: "Low", owner: "Enterprise Cognitive Governance" });
    say("Scoring policy submitted for governance and approved in this local demonstration");
  };

  /* -------------------------------------------------------- review actions */
  const patchReview = (id: string, patch: Partial<CognitiveHealthReview>) =>
    setReviews((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const onReviewAction = (id: string, action: string) => {
    const review = reviews.find((r) => r.id === id);
    setSelectedReviewId(id);
    if (action === "Open Review") { focusPanel("panel-review-workbench"); say(`${id} opened in the health review workbench`); return; }
    if (action === "Assign Owner") {
      patchReview(id, { status: "Assigned" });
      logOps(`Owner assigned for ${id}`, `${review?.owner ?? "Owner"} accepted the health review`, "Review");
      notify({ signalId: review?.signalId ?? null, dimensionId: review?.dimensionId ?? null, interventionId: null, type: "Health Review Assigned", title: `${id} assigned`, description: `${review?.issueType ?? "Health issue"} assigned to ${review?.owner}`, severity: review?.severity ?? "Medium", owner: review?.owner ?? "Health Operations" });
      say(`${id} assigned`); return;
    }
    if (action === "Create Intervention") {
      setDraftState((d) => ({ ...d, signalId: review?.signalId ?? d.signalId, scopeId: review?.scopeId ?? d.scopeId, owner: review?.owner ?? d.owner }));
      setInterventionDialog(true); return;
    }
    if (action === "Request Reassessment") {
      patchReview(id, { status: "Reassessment Requested" });
      setReassessments((rows) => rows.map((r) => (r.triggerRecordId === review?.signalId ? { ...r, status: "Requested" } : r)));
      logOps(`Reassessment requested from ${id}`, "Active evaluations flagged for recheck", "Reassessment");
      say("Reassessment requested"); return;
    }
    if (action === "Acknowledge") {
      patchReview(id, { status: "Acknowledged" });
      logOps(`${id} acknowledged`, "Health review acknowledged by the owning team", "Review");
      say(`${id} acknowledged`); return;
    }
    if (action === "Escalate") { setEscalationDialog(true); return; }
    if (action === "Mark Accepted Risk") { setReviewDialog({ open: true, decision: "Accept Temporary Risk" }); return; }
  };

  const onReviewDecision = (decision: string) => {
    if (decision === "Create Intervention") {
      setDraftState((d) => ({ ...d, signalId: selectedReview?.signalId ?? d.signalId }));
      setInterventionDialog(true);
      return;
    }
    if (decision === "Escalate") { setEscalationDialog(true); return; }
    setReviewDialog({ open: true, decision });
  };

  const confirmReviewDecision = (comment: string) => {
    if (!selectedReview) return;
    const decision = reviewDialog.decision;
    const status = decision === "Accept Temporary Risk" ? "Accepted Risk"
      : decision === "Dismiss Signal as Invalid" ? "Closed" : "In Review";
    patchReview(selectedReview.id, { decision, comments: comment, status: status as CognitiveHealthReview["status"] });
    logOps(`${selectedReview.id} · ${decision}`, comment || "Recorded without additional comment", "Review");
    notify({ signalId: selectedReview.signalId, dimensionId: selectedReview.dimensionId, interventionId: null, type: "Health Review Assigned", title: `${selectedReview.id} decision recorded`, description: `${decision}. The underlying health signal remains visible`, severity: selectedReview.severity, owner: selectedReview.owner });
    say(`${decision} recorded for ${selectedReview.id}`);
  };

  /* --------------------------------------------------------- alert actions */
  const onAlertAction = (id: string, action: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (action === "Open") { focusPanel("panel-review-queue"); say(`${id} opened`); return; }
    if (action === "Create Intervention") {
      setDraftState((d) => ({ ...d, signalId: alert?.signalId ?? d.signalId }));
      setInterventionDialog(true);
      setAlerts((rows) => rows.map((a) => (a.id === id ? { ...a, status: "Intervention Created" } : a)));
      return;
    }
    const status = action === "Acknowledge" ? "Acknowledged" : action === "Assign" ? "Assigned" : action === "Mute Synthetic Alert" ? "Muted" : "Open";
    setAlerts((rows) => rows.map((a) => (a.id === id ? { ...a, status: status as CognitiveHealthAlert["status"], acknowledgedAt: action === "Acknowledge" ? new Date().toISOString().slice(0, 16).replace("T", " ") : a.acknowledgedAt } : a)));
    logOps(`Alert ${id} · ${action}`, "Audit history is preserved and never deleted", "Alert");
    say(`${id} ${action.toLowerCase()}`);
  };

  /* -------------------------------------------------- intervention actions */
  const onInterventionAction = (id: string, action: string) => {
    const map: Record<string, InterventionStatus> = {
      "Assign Owner": "Assigned", Acknowledge: "Acknowledged", Start: "In Progress",
      Block: "Blocked", "Begin Measurement": "Measurement Window", Cancel: "Cancelled", Escalate: "Escalated",
    };
    const status = map[action];
    if (!status) return;
    setInterventions((rows) => rows.map((i) => (i.id === id ? { ...i, status } : i)));
    setSelectedInterventionId(id);
    logOps(`Intervention ${id} · ${status}`, `Status change recorded with an audit event`, "Intervention");
    notify({
      signalId: null, dimensionId: null, interventionId: id,
      type: status === "Blocked" ? "Intervention Blocked" : status === "Measurement Window" ? "Intervention Measurement Complete" : "Intervention Assigned",
      title: `${id} ${status}`, description: `${interventions.find((i) => i.id === id)?.title ?? id} moved to ${status}`,
      severity: status === "Blocked" ? "High" : "Medium", owner: interventions.find((i) => i.id === id)?.owner ?? "Health Operations",
    });
    say(`${id} status changed to ${status}`);
  };

  const createIntervention = () => {
    const signal = signalById(draft.signalId);
    const id = `CHI 9${100 + interventions.length}`;
    const record: CognitiveHealthIntervention = {
      id, title: draft.title, description: draft.description,
      signalIds: [draft.signalId], dimensionIds: [signal?.dimensionId ?? "DIM DV"],
      scopeType: draft.scopeType, scopeId: draft.scopeId, owner: draft.owner,
      participantIds: draft.participants.split(",").map((p) => p.trim()).filter(Boolean),
      baselineValues: { [draft.signalId]: draft.currentValue },
      targetValues: { [draft.signalId]: draft.targetValue },
      expectedHealthEffect: draft.expectedChange, expectedEffectConfidence: 85,
      measurementWindow: draft.measurementWindow,
      requiredActionTypes: draft.actions, evidenceRequirementIds: [`EVR ${5000 + interventions.length}`],
      affectedDecisionIds: signal?.affectedDecisionIds ?? [], status: "Proposed",
      dueDate: draft.dueDate, createdAt: new Date().toISOString().slice(0, 10), completedAt: null,
      successSignal: draft.evidence, dependencies: [],
    };
    setInterventions((rows) => [record, ...rows]);
    setSelectedInterventionId(id);
    logOps(`Intervention ${id} created`, `${draft.title} · owner ${draft.owner || "Unowned"}`, "Intervention");
    notify({ signalId: draft.signalId, dimensionId: signal?.dimensionId ?? null, interventionId: id, type: "Intervention Assigned", title: `${id} proposed`, description: draft.title, severity: "Medium", owner: draft.owner || "Unowned" });
    say(`Intervention ${id} created in the Proposed state`);
    focusPanel("panel-interventions");
  };

  /* ------------------------------------------------------- exposure/others */
  const onExposureAction = (id: string, action: string) => {
    const e = exposures.find((x) => x.id === id);
    if (action === "Open Decision") { navigate("/enterprise-cognitive-fabric/evaluation/decision-intelligence"); return; }
    if (action === "Open Health Workbench") { openWorkbench(e?.decisionOwner ?? "Enterprise", e?.affectedDimensionIds[0] ?? "DIM DV"); return; }
    if (action === "Create Intervention") {
      setDraftState((d) => ({ ...d, signalId: e?.criticalSignalIds[0] ?? d.signalId }));
      setInterventionDialog(true);
      setExposures((rows) => rows.map((x) => (x.id === id ? { ...x, status: "Intervention Created" } : x)));
      return;
    }
    setExposures((rows) => rows.map((x) => (x.id === id ? { ...x, status: "Reassessment Requested" } : x)));
    logOps(`Reassessment requested for ${e?.decision}`, "Active evaluation flagged for recheck. No recorded decision is modified", "Reassessment");
    say(`Reassessment requested for ${e?.decision}`);
  };

  const onReassessmentAction = (id: string, action: string) => {
    const status = action === "Request Reassessment" ? "Requested"
      : action === "Escalate" ? "Escalated" : "No Reassessment Required";
    setReassessments((rows) => rows.map((r) => (r.id === id ? { ...r, status: status as CognitiveHealthReassessment["status"] } : r)));
    logOps(`Reassessment ${id} · ${status}`, "Historical decision context is never rewritten", "Reassessment");
    say(`${id} marked ${status}`);
  };

  const onRiskAction = (id: string, action: string) => {
    const status = action === "Renew" ? "Active" : action === "Withdraw" ? "Withdrawn" : "Expired";
    setRisks((rows) => rows.map((r) => (r.id === id ? { ...r, status: status as CognitiveHealthRiskAcceptance["status"] } : r)));
    logOps(`Risk acceptance ${id} · ${status}`, status === "Expired" ? "Signal returned to the health review queue" : "Acceptance updated", "Risk Acceptance");
    say(`${id} ${status}`);
  };

  /* ------------------------------------------------------ executive brief - */
  const generateBrief = (scopeType: ScopeType, scopeId: string, timeRange: string) => {
    const b = generateExecutiveBrief(scopeType, scopeId, timeRange, currentSnapshot, exposures, interventions, integrityViolations);
    setBrief(b);
    logOps("Executive health brief generated", `${scopeType} · ${scopeId} · ${timeRange}`, "Executive Brief");
    notify({ signalId: null, dimensionId: null, interventionId: null, type: "Executive Brief Ready", title: "Executive brief ready", description: b.summary, severity: "Low", owner: "Enterprise Cognitive Governance" });
    say("Executive health brief generated");
    window.setTimeout(() => focusPanel("panel-generated-brief"), 60);
  };

  /* ---------------------------------------------------------- demo scenario */
  const applyScenario = (id: string) => {
    const s = demoScenarios.find((x) => x.id === id);
    if (!s) return;
    setActiveScenario(id);

    if (s.reset) {
      setDimensionOverrides({});
      setIntegrityViolations(0);
      setReviews(seedHealthReviews);
      setAlerts(seedHealthAlerts);
      setInterventions(seedInterventions);
      setExposures(seedExposures);
      setReassessments(seedReassessments);
      setRisks(seedRiskAcceptances);
      setEscalations(seedEscalations);
      setNotifications(seedNotifications);
      setOpsActivity(seedOpsActivity);
      setControls(baselineControls);
      setPolicyRows(seedPolicyDimensions);
      setPolicyVersion(currentPolicy.version);
      setApprovalState(currentPolicy.approvalState);
      setBrief(null);
      setActiveScenario(null);
      say("Demo data reset. Historical context integrity violations restored to zero");
      return;
    }

    setDimensionOverrides(s.dimensionOverrides ?? {});
    if (typeof s.integrityViolations === "number") setIntegrityViolations(s.integrityViolations);

    if (s.integrityViolations && s.integrityViolations > 0) {
      setAlerts((rows) => [integrityAlert(s.integrityViolations as number), ...rows.filter((a) => a.id !== "CHA 8900")]);
      setReviews((rows) => [{
        id: "CHR 7900", signalId: "CHS 1002", dimensionId: "DIM CP", scopeType: "Enterprise", scopeId: "Enterprise",
        issueType: "Historical Context Integrity Violation", severity: "Critical",
        currentValue: `${s.integrityViolations} violations`, targetValue: "0 violations", trend: -3,
        affectedDecisionIds: ["DEC 5003", "DEC 5006", "DEC 5011"], affectedPersonaIds: ["Release Governance"],
        owner: "Memory Governance", dueDate: "2026-08-08", status: "Open",
        decision: "", comments: "", createdAt: "2026-08-07 00:04", completedAt: null,
      }, ...rows.filter((r) => r.id !== "CHR 7900")]);
      setExposures((rows) => rows.map((e) => ({ ...e, exposureSeverity: "Critical", recommendedAction: "Pause approval until the context integrity violation is resolved" })));
    }

    if (s.addAlert) {
      setAlerts((rows) => [{
        ...seedHealthAlerts[0], scopeType: "Enterprise", affectedDecisionIds: [], owner: "Health Operations",
        status: "Open", triggeredAt: new Date().toISOString().slice(0, 16).replace("T", " "), acknowledgedAt: null,
        ...s.addAlert,
      } as CognitiveHealthAlert, ...rows.filter((a) => a.id !== s.addAlert?.id)]);
    }
    if (s.interventionStatus) {
      setInterventions((rows) => rows.map((i) => (i.id === s.interventionStatus?.id ? { ...i, status: s.interventionStatus.status, owner: s.id === "DS 10" ? "" : i.owner } : i)));
    }
    if (s.reviewStatus) patchReview(s.reviewStatus.id, { status: s.reviewStatus.status });
    if (s.exposureSeverity) {
      setExposures((rows) => rows.map((e) => (e.id === s.exposureSeverity?.id ? { ...e, exposureSeverity: s.exposureSeverity.severity } : e)));
    }
    if (s.reassessmentStatus) {
      setReassessments((rows) => rows.map((r) => (r.id === s.reassessmentStatus?.id ? { ...r, status: s.reassessmentStatus.status } : r)));
    }
    if (s.riskStatus) {
      setRisks((rows) => rows.map((r) => (r.id === s.riskStatus?.id ? { ...r, status: s.riskStatus.status } : r)));
    }
    if (s.policyVersion) { setPolicyVersion(s.policyVersion); setApprovalState("Submitted for Governance"); }
    if (s.briefReady) generateBrief("Enterprise", "Enterprise", "Prior Week");

    logOps(s.activity, s.note, "Demo Scenario");
    if (s.notification) {
      notify({ signalId: null, dimensionId: null, interventionId: null, ...s.notification, owner: "Health Operations" });
    }
    say(`${s.name} scenario applied. ${s.note}`);
  };

  /* ------------------------------------------------------------ demo story */
  const step = healthStorySteps[storyIndex];

  useEffect(() => {
    if (!storyOpen || !step) return;
    if (step.view) setView(step.view as ChView);
    if (step.action === "open-workbench") { changeParams({ dimensionId: "DIM CTA" }); setSelectedDimension("DIM CTA"); }
    if (step.action === "create-intervention") setInterventionDialog(true);
    if (step.action === "boost-scenario") setControls((c) => ({ ...c, depValidation: 100, coordOwnership: 100 }));
    const t = window.setTimeout(() => focusPanel(step.target), reducedMotion ? 0 : 120);
    say(`Demo story step ${storyIndex + 1} of ${healthStorySteps.length}. ${step.caption}`);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyOpen, storyIndex]);

  const emphasis: Record<ChView, string[]> = {
    executive: ["echi", "dimensions", "summary", "critical", "exposure", "brief"],
    portfolio: ["units", "heatmap", "personas", "domains"],
    signal: ["signals", "critical", "modules", "alerts", "reviews"],
    diagnostic: ["workbench", "latency", "dimensions", "review-workbench", "interventions"],
    learning: ["learning", "trend", "changes", "activity", "scenario", "history"],
  };
  const leads = emphasis[view];
  const lead = (id: string) => (leads.includes(id) ? "order-first ring-1 ring-blue-200" : "");
  const spotlight = (id: string) => (storyOpen && step?.target === id ? "ring-2 ring-blue-500 ring-offset-2 rounded-xl" : "");

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
          <Pill label={integrityViolations > 0 ? "Critical Attention" : effective.band} tone={integrityViolations > 0 ? "red" : chTone(effective.band)} />
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
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setInterventionDialog(true)}>Create Intervention</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setSearchDialog(true)}>
            <Search className="mr-1 h-3.5 w-3.5" aria-hidden /> Search
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExportDialog(true)}>
            <Download className="mr-1 h-3.5 w-3.5" aria-hidden /> Export
          </Button>
          <div className="relative">
            <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" aria-label="More actions" aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}>
              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
            </Button>
            {moreOpen && (
              <div className="absolute right-0 z-30 mt-1 w-[240px] rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                {[
                  { label: "Demo Story", run: () => { setStoryOpen(true); setStoryIndex(0); } },
                  { label: "Demo Scenarios", run: () => focusPanel("panel-demo-scenarios") },
                  { label: "Generate Executive Health Brief", run: () => setBriefDialog(true) },
                  { label: "Propose Threshold Change", run: () => setThresholdDialog(true) },
                  { label: "Compare Scoring Policy Version", run: () => setPolicyCompareDialog(true) },
                  { label: "Accept Cognitive Health Risk", run: () => setRiskDialog(true) },
                  { label: "Raise Escalation", run: () => setEscalationDialog(true) },
                  { label: "Health Review Queue", run: () => focusPanel("panel-review-queue") },
                  { label: "Notifications", run: () => focusPanel("panel-notifications") },
                ].map((a) => (
                  <button key={a.label} type="button"
                    onClick={() => { a.run(); setMoreOpen(false); }}
                    className="block w-full rounded px-2 py-1 text-left text-[11px] text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setStoryOpen(true); setStoryIndex(0); }}>
            <BookOpen className="mr-1 h-3.5 w-3.5" aria-hidden /> Demo Story
          </Button>
        </div>
      </header>

      <div className="mt-2">
        <CriticalOverrideBanner override={override} echi={effective.echi}
          onOpen={() => { setView("signal"); focusPanel("panel-critical"); }} />
      </div>

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
        <div className={cn(lead("echi"), spotlight("panel-echi"))}>
          <EchiSummaryPanel
            derivedEchi={effective.echi}
            selectedDimension={selectedDimension}
            onDimension={(id) => { setSelectedDimension(id); changeParams({ dimensionId: id }); say(`${dimensionById(id).name} selected`); }} />
        </div>

        <div className={lead("lifecycle")}>
          <LifecyclePanel selected={selectedStage} onSelect={(id) => { setSelectedStage(id); say(`${stageById(id).name} stage selected`); }} />
        </div>

        <SelectedStagePanel stage={stage} />

        <div className={cn(lead("dimensions"), spotlight("panel-dimensions"))}>
          <DimensionPanel selected={selectedDimension}
            onOpen={(id) => { setSelectedDimension(id); setDimensionDrawer(id); say(`${dimensionById(id).name} detail opened`); }} />
        </div>

        <div className={cn(lead("workbench"), spotlight("panel-workbench"))}>
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
        <div className={spotlight("panel-cross-team-awareness")}><CrossTeamAwarenessPanel /></div>
        <DecisionConfidencePanel />

        <div className={cn(lead("latency"), spotlight("panel-latency"))}><LatencyPanel /></div>

        <div className={cn(lead("learning"), spotlight("panel-learning-maturity"))}><LearningMaturityPanel /></div>

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

        <div className={lead("summary")}><HealthSummaryPanel onPrompt2={(l) => { say(`${l} focused`); focusPanel("panel-interventions"); }} /></div>

        {/* ============================================ prompt 2 operating model */}

        <ThresholdGovernancePanel policyVersion={policyVersion} onPropose={() => setThresholdDialog(true)} />

        <ScoringPolicyPanel
          rows={policyRows} onWeight={setWeight}
          onPreview={() => { setPreviewEchi(computeEchi(effectiveDimensionScores, livePolicy).echi); setPolicyPreviewDialog(true); }}
          onCompare={() => setPolicyCompareDialog(true)}
          onSaveDraft={() => { setApprovalState("Draft"); logOps("Scoring policy draft saved", "Draft weights stored locally", "Policy"); say("Scoring policy draft saved"); }}
          onSubmit={submitPolicy}
          approvalState={approvalState} version={policyVersion} previewEchi={previewEchi} />

        <div className={spotlight("panel-review-queue")}>
          <HealthReviewQueuePanel reviews={reviews} selectedId={selectedReviewId} onSelect={setSelectedReviewId}
            onAction={onReviewAction} severityFilter={reviewSeverity} onSeverityFilter={setReviewSeverity} />
        </div>

        <HealthReviewWorkbenchPanel review={selectedReview} onDecision={onReviewDecision} />

        <HealthAlertsPanel alerts={alerts} onAction={onAlertAction} />

        <div className={spotlight("panel-interventions")}>
          <InterventionPlannerPanel interventions={interventions} onCreate={() => setInterventionDialog(true)}
            onAction={onInterventionAction} selectedId={selectedInterventionId} onSelect={setSelectedInterventionId} />
        </div>

        <InterventionDetailPanel intervention={selectedIntervention} />

        <div className={spotlight("panel-intervention-effectiveness")}>
          <InterventionEffectivenessPanel measurements={seedMeasurements} interventions={interventions} />
        </div>

        <div className={cn(lead("scenario"), spotlight("panel-scenario-simulator"))}>
          <HealthScenarioSimulatorPanel controls={controls}
            onControl={(id, value) => setControls((c) => ({ ...c, [id]: value }))}
            onReset={() => { setControls(baselineControls); say("Scenario controls reset to the current measured state"); }}
            onApplyToProjection={() => { setProjectionInterventions(interventions.filter((i) => i.status === "In Progress").map((i) => i.id)); focusPanel("panel-trend-projection"); say("Scenario applied to the trend projection"); }} />
        </div>

        <HealthScenarioComparisonPanel scenarios={seedScenarios} live={liveScenario} />

        <HealthSensitivityPanel onFocus={(id) => { const s = signalById(id); if (s) setSignalDrawer(s); }} />

        <HealthTrendProjectionPanel horizon={projectionHorizon}
          onHorizon={(h) => { setProjectionHorizon(h); say(`${h} projection horizon selected`); }}
          controls={controls} selectedInterventionIds={projectionInterventions} />

        <div className={cn(lead("exposure"), spotlight("panel-decision-exposure"))}>
          <DecisionExposurePanel exposures={exposures} onAction={onExposureAction} />
        </div>

        <HealthReassessmentPanel items={reassessments} onAction={onReassessmentAction} />

        <div className={cn(lead("history"), spotlight("panel-snapshot-history"))}>
          <SnapshotHistoryPanel selectedId={compareLeft} onSelect={(id) => { setCompareLeft(id); say(`${id} selected for comparison`); }} />
        </div>

        <SnapshotComparisonPanel
          left={snapshotHistory.find((s) => s.id === compareLeft) ?? snapshotHistory[1]}
          right={currentSnapshot}
          mode={comparisonMode}
          onMode={(m) => { setComparisonMode(m); say(`${m} comparison mode selected`); }} />

        <EchiPolicyHistoryPanel />

        <HealthGovernancePanel integrityViolations={integrityViolations}
          activeInterventions={interventions.filter((i) => !["Cancelled", "Successful"].includes(i.status)).length}
          riskAcceptances={risks.filter((r) => r.status === "Active" || r.status === "Expiring").length}
          reassessments={reassessments.filter((r) => r.status === "Pending" || r.status === "Requested").length} />

        <RiskAcceptancePanel items={risks} onCreate={() => setRiskDialog(true)} onAction={onRiskAction} />

        <HealthEscalationPanel items={escalations} onCreate={() => setEscalationDialog(true)} />

        <div className={cn(lead("brief"), spotlight("panel-executive-brief"))}>
          <ExecutiveBriefingPanel echi={effective.echi}
            priorDelta={effective.echi - snapshotHistory[1].echi}
            exposures={exposures.length}
            onGenerate={() => setBriefDialog(true)}
            onQuestion={(q) => { setActiveQuestion((p) => (p === q ? null : q)); say(q); }}
            activeQuestion={activeQuestion} />
        </div>

        <GeneratedBriefPanel brief={brief} />

        <HealthNotificationsPanel items={notifications}
          onRead={(id) => setNotifications((rows) => rows.map((n) => (n.id === id ? { ...n, status: "Read" } : n)))}
          onReadAll={() => { setNotifications((rows) => rows.map((n) => ({ ...n, status: "Read" }))); say("All notifications marked read"); }}
          onAction={(id, action) => { say(`${action} on notification ${id}`); if (action === "Open") focusPanel("panel-review-queue"); }}
          filter={notificationFilter} onFilter={setNotificationFilter} />

        <OperationalStatePanel states={operationalStates} active={activeStates} />

        <HealthOpsActivityPanel items={opsActivity} />

        <HealthDemoScenarioBar scenarios={demoScenarios} active={activeScenario} onSelect={applyScenario} />

        <div className={lead("activity")}>
          <ActivityPanel items={[...opsActivity.slice(0, 3).map(toChActivity), ...chActivity]} />
        </div>
      </div>

      {/* ------------------------------------------------------------- drawers */}
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

      {/* ------------------------------------------------------------- dialogs */}
      <CreateInterventionDialog open={interventionDialog} onClose={() => setInterventionDialog(false)}
        draft={draft} onDraft={(d) => setDraftState((p) => ({ ...p, ...d }))} onCreate={createIntervention} />

      <ReviewDecisionDialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false, decision: "" })}
        review={selectedReview} decision={reviewDialog.decision} onConfirm={confirmReviewDecision} />

      <RiskAcceptanceDialog open={riskDialog} onClose={() => setRiskDialog(false)}
        onConfirm={(r) => {
          const id = `CHRK ${risks.length + 1}`;
          setRisks((rows) => [{ ...(r as CognitiveHealthRiskAcceptance), id, createdAt: new Date().toISOString().slice(0, 10) }, ...rows]);
          logOps(`Risk acceptance ${id} recorded`, `Expires ${r.expirationDate}. The signal remains visible`, "Risk Acceptance");
          say(`Risk acceptance ${id} recorded with an expiry date`);
        }} />

      <HealthEscalationDialog open={escalationDialog} onClose={() => setEscalationDialog(false)}
        onConfirm={(p) => {
          const id = `CHES ${escalations.length + 1}`;
          const sig = signalById(p.signalId);
          setEscalations((rows) => [{
            id, signalId: p.signalId, dimensionId: sig?.dimensionId ?? "DIM DV",
            scopeType: "Enterprise", scopeId: sig?.scopeId ?? "Enterprise",
            reason: p.reason as CognitiveHealthEscalation["reason"], severity: p.severity as CognitiveHealthEscalation["severity"],
            affectedDecisionIds: sig?.affectedDecisionIds ?? [], affectedPersonaIds: [sig?.scopeId ?? "Enterprise"],
            businessConsequence: p.business, customerConsequence: p.customer,
            evidenceReferenceIds: sig?.sourceRecordIds ?? [], owner: "Health Operations",
            recommendedLevel: p.level, dueDate: p.due, status: "Open",
            createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          }, ...rows]);
          logOps(`Escalation ${id} raised`, `${p.reason} · ${p.level}`, "Escalation");
          say(`Escalation ${id} raised to ${p.level}`);
        }} />

      <ThresholdProposalDialog open={thresholdDialog} onClose={() => setThresholdDialog(false)}
        currentVersion={policyVersion}
        onConfirm={(version, note) => {
          setPolicyVersion(version);
          setApprovalState("Submitted for Governance");
          logOps(`Threshold policy ${version} created`, `${note}. Historical snapshots keep their original policy`, "Policy");
          notify({ signalId: null, dimensionId: null, interventionId: null, type: "Threshold Change Proposed", title: `Threshold policy ${version}`, description: note, severity: "Low", owner: "Enterprise Cognitive Governance" });
          say(`Threshold policy ${version} created. Historical health snapshots are not rewritten`);
        }} />

      <PolicyComparisonDialog open={policyCompareDialog} onClose={() => setPolicyCompareDialog(false)}
        versions={echiPolicyVersions.map((v) => ({ version: v.version, weights: v.weights, reason: v.reason, effectiveDate: v.effectiveDate }))} />

      <PolicyPreviewDialog open={policyPreviewDialog} onClose={() => setPolicyPreviewDialog(false)}
        weights={Object.fromEntries(policyRows.map((r) => [r.dimensionId, r.weight]))} />

      <ExecutiveBriefDialog open={briefDialog} onClose={() => setBriefDialog(false)}
        onGenerate={(scopeType, scopeId, timeRange) => generateBrief(scopeType, scopeId, timeRange)} />

      <HealthSearchDialog open={searchDialog} onClose={() => setSearchDialog(false)}
        reviews={reviews} alerts={alerts} interventions={interventions} exposures={exposures}
        risks={risks} reassessments={reassessments} onNavigate={onNavigate} />

      <HealthExportDialog open={exportDialog} onClose={() => setExportDialog(false)}
        snapshot={currentSnapshot} reviews={reviews} interventions={interventions} exposures={exposures}
        risks={risks} selectedDimensionId={selectedDimension} selectedUnit={selectedUnit ?? "Enterprise"}
        brief={brief} onExported={(m) => say(m)} />

      {storyOpen && step && (
        <HealthDemoStoryOverlay step={step} index={storyIndex} total={healthStorySteps.length}
          onNext={() => setStoryIndex((i) => Math.min(healthStorySteps.length - 1, i + 1))}
          onPrev={() => setStoryIndex((i) => Math.max(0, i - 1))}
          onExit={() => { setStoryOpen(false); say("Demo story exited"); }}
          reducedMotion={reducedMotion} onReducedMotion={setReducedMotion} />
      )}

      <p className="sr-only">
        Enterprise Cognitive Health Index {effective.echi}, {effective.band}. Interventions active {interventionSummary.active}.
        Decisions exposed {exposures.length}. Historical context integrity violations {integrityViolations}.
        {dimensions.map((d) => ` ${d.name} ${effectiveDimensionScores[d.id]}.`).join("")}
        Critical signals: {currentSnapshot.criticalSignalIds.map(signalName).join(", ") || "none"}.
      </p>
    </div>
  );
}

/** Convenience for panels that surface a dimension by display name. */
export const resolveDimensionByName = dimensionByName;
