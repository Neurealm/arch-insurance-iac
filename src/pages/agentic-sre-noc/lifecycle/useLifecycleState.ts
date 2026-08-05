/**
 * AIM-005 — lifecycle workspace state.
 *
 * Owns only model-lifecycle state. Region, product, horizon, selected link,
 * confidence threshold and the active model version remain owned by the page
 * and are passed in, so there is a single source of truth for each.
 */

import { useCallback, useMemo, useState } from "react";
import {
  ACTIVE_VERSION,
  CANDIDATE_VERSION,
  ROLLBACK_VERSION,
  backtestSeriesByVersion,
  candidateReleaseGates,
  classBalance,
  dataQuality,
  driftMetrics,
  explainabilityRecords,
  governanceRecord,
  initialGovernanceNotes,
  lifecycleActivity,
  modelVersions,
  releaseGates,
  requiredApprovers,
  similarEventSupportPct,
  trainingCoverage,
} from "./lifecycleFixtures";
import {
  calculateBacktestSummary,
  calculateClassBalanceScore,
  calculateCoverageScore,
  calculateDatasetQualityScore,
  calculateExplainabilityQuality,
  calculateGovernanceReadiness,
  calculateRetrainingRecommendation,
  classifyDriftStatus,
  compareModelVersions,
  evaluatePromotionEligibility,
  evaluateRollbackReadiness,
} from "./lifecycleCalculations";
import type {
  CoverageDimension,
  DriftAssessment,
  DriftMetric,
  DriftSimulationKey,
  DriftStatus,
  GovernanceNote,
  LifecycleTab,
  ModelLifecycleActivity,
} from "./lifecycleTypes";
import type { ValidationView } from "./lifecycleFixtures";

export type LifecyclePanelState = "ready" | "loading" | "empty" | "error";

export interface LifecycleContext {
  region: string;
  product: string;
  horizon: string;
  selectedLinkId: string | null;
  thresholdPct: number;
}

/** Deterministic per-simulation drift adjustments. */
const simulationEffects: Record<Exclude<DriftSimulationKey, "none">, {
  label: string;
  adjust: Record<string, { score?: number; blocking?: boolean; evidenceComplete?: boolean; effect?: string }>;
}> = {
  "weather-pattern": {
    label: "Weather-pattern drift simulation",
    adjust: {
      "drift-weather": { score: 0.38, effect: "Fog frequency far outside the training seasons, fog-segment predictions degrade." },
      "drift-feature": { score: 0.24 },
      "drift-input": { score: 0.19 },
    },
  },
  "new-product-cohort": {
    label: "New product cohort simulation",
    adjust: {
      "drift-product": { score: 0.44, blocking: true, effect: "Beam volume doubled with no matching training support, predictions are outside the validated envelope." },
      "drift-firmware": { score: 0.26 },
    },
  },
  "sensor-calibration": {
    label: "Sensor calibration change simulation",
    adjust: {
      "drift-input": { score: 0.29, effect: "Optical input distributions shifted by re-calibration." },
      "drift-feature": { score: 0.31 },
      "drift-quality": { score: 0.16 },
    },
  },
  "regional-data-loss": {
    label: "Regional data loss simulation",
    adjust: {
      "drift-region": { score: 0.34, evidenceComplete: false, effect: "Regional telemetry unavailable, drift cannot be evidenced." },
      "drift-quality": { score: 0.22 },
    },
  },
  "model-calibration": {
    label: "Model calibration drift simulation",
    adjust: {
      "drift-calibration": { score: 0.23, blocking: true, effect: "Predicted probabilities no longer match observed frequency." },
      "drift-prediction": { score: 0.21 },
    },
  },
};

export interface LifecycleState {
  /* selections */
  tab: LifecycleTab;
  setTab: (tab: LifecycleTab) => void;
  panelState: LifecyclePanelState;
  setPanelState: (state: LifecyclePanelState) => void;
  selectedVersion: string;
  setSelectedVersion: (version: string) => void;
  comparisonVersion: string;
  setComparisonVersion: (version: string) => void;
  trainingCategory: string | null;
  selectTrainingCategory: (key: string | null) => void;
  coverageDimension: CoverageDimension;
  setCoverageDimension: (dimension: CoverageDimension) => void;
  validationView: ValidationView;
  setValidationView: (view: ValidationView) => void;
  validationSegmentId: string | null;
  selectValidationSegment: (id: string | null) => void;
  backtestMetric: string;
  setBacktestMetric: (metric: string) => void;
  driftMetricId: string | null;
  selectDriftMetric: (id: string | null) => void;
  driftSimulation: DriftSimulationKey;
  simulateDrift: (key: DriftSimulationKey) => void;
  governanceGateId: string | null;
  selectGovernanceGate: (id: string | null) => void;
  activityQuery: string;
  setActivityQuery: (query: string) => void;
  activityGroup: "None" | "Version" | "Event type";
  setActivityGroup: (group: "None" | "Version" | "Event type") => void;
  selectedTimelineEventId: string | null;
  selectTimelineEvent: (id: string | null) => void;

  /* local lifecycle mutations */
  activeVersion: string;
  rollbackVersion: string;
  promote: (version: string) => void;
  rollback: () => void;
  notes: GovernanceNote[];
  addNote: (note: string) => void;
  activity: ModelLifecycleActivity[];
  appendActivity: (entry: Omit<ModelLifecycleActivity, "id">) => void;
  announcement: string;
  announce: (message: string) => void;

  /* derived */
  driftAssessment: DriftAssessment;
  retraining: ReturnType<typeof calculateRetrainingRecommendation>;
  promotionDecision: ReturnType<typeof evaluatePromotionEligibility>;
  rollbackDecision: ReturnType<typeof evaluateRollbackReadiness>;
  governanceReadiness: ReturnType<typeof calculateGovernanceReadiness>;
  versionComparison: ReturnType<typeof compareModelVersions>;
  backtestSummary: ReturnType<typeof calculateBacktestSummary>;
  explainabilityQuality: ReturnType<typeof calculateExplainabilityQuality>;
  datasetQualityScore: number;
  coverageScore: ReturnType<typeof calculateCoverageScore>;
  classBalanceScore: ReturnType<typeof calculateClassBalanceScore>;
  simulationLabel: string | null;
}

export function useLifecycleState(context: LifecycleContext): LifecycleState {
  const [tab, setTab] = useState<LifecycleTab>("Training Data");
  const [panelState, setPanelState] = useState<LifecyclePanelState>("ready");
  const [selectedVersion, setSelectedVersion] = useState<string>(ACTIVE_VERSION);
  const [comparisonVersion, setComparisonVersion] = useState<string>(CANDIDATE_VERSION);
  const [trainingCategory, setTrainingCategory] = useState<string | null>(null);
  const [coverageDimension, setCoverageDimension] = useState<CoverageDimension>("Regions");
  const [validationView, setValidationView] = useState<ValidationView>("Holdout Performance");
  const [validationSegmentId, setValidationSegmentId] = useState<string | null>(null);
  const [backtestMetric, setBacktestMetric] = useState<string>("accuracyPct");
  const [driftMetricId, setDriftMetricId] = useState<string | null>(null);
  const [driftSimulation, setDriftSimulation] = useState<DriftSimulationKey>("none");
  const [governanceGateId, setGovernanceGateId] = useState<string | null>(null);
  const [activityQuery, setActivityQuery] = useState("");
  const [activityGroup, setActivityGroup] = useState<"None" | "Version" | "Event type">("None");
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState<string | null>(null);

  const [activeVersion, setActiveVersion] = useState<string>(ACTIVE_VERSION);
  const [rollbackVersion, setRollbackVersion] = useState<string>(ROLLBACK_VERSION);
  const [notes, setNotes] = useState<GovernanceNote[]>(initialGovernanceNotes);
  const [extraActivity, setExtraActivity] = useState<ModelLifecycleActivity[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const announce = useCallback((message: string) => setAnnouncement(message), []);

  const appendActivity = useCallback((entry: Omit<ModelLifecycleActivity, "id">) => {
    setExtraActivity((current) => [
      { ...entry, id: `local-${current.length + 1}` },
      ...current,
    ]);
  }, []);

  /* ------------------------------- drift -------------------------------- */

  const simulatedMetrics: DriftMetric[] = useMemo(() => {
    if (driftSimulation === "none") return driftMetrics;
    const effect = simulationEffects[driftSimulation];
    return driftMetrics.map((metric) => {
      const change = effect.adjust[metric.id];
      if (!change) return metric;
      return {
        ...metric,
        score: change.score ?? metric.score,
        blocking: change.blocking ?? metric.blocking,
        evidenceComplete: change.evidenceComplete ?? metric.evidenceComplete,
        operationalEffect: change.effect ?? metric.operationalEffect,
        trend: "rising",
      };
    });
  }, [driftSimulation]);

  const driftAssessment: DriftAssessment = useMemo(() => {
    const metrics = simulatedMetrics.map((metric) => ({ ...metric, status: classifyDriftStatus(metric) }));
    const order: DriftStatus[] = ["Stable", "Insufficient Evidence", "Watch", "Action Required", "Blocking"];
    const worstStatus = metrics.reduce<DriftStatus>(
      (worst, metric) => (order.indexOf(metric.status) > order.indexOf(worst) ? metric.status : worst),
      "Stable",
    );
    return {
      metrics,
      worstStatus,
      blockingCount: metrics.filter((m) => m.status === "Blocking").length,
      actionCount: metrics.filter((m) => m.status === "Action Required").length,
      watchCount: metrics.filter((m) => m.status === "Watch").length,
    };
  }, [simulatedMetrics]);

  const driftStatuses = useMemo(() => driftAssessment.metrics.map((m) => m.status), [driftAssessment]);

  const retraining = useMemo(
    () =>
      calculateRetrainingRecommendation({
        driftStatuses,
        accuracyDeltaPct: driftSimulation === "none" ? -0.4 : -1.6,
        newSamplesSinceTraining: 180_000,
        newRegionAdded: false,
        newProductCohort: driftSimulation === "new-product-cohort",
        weatherPatternChange: driftSimulation === "weather-pattern",
        dataQualityDeltaPct: driftSimulation === "regional-data-loss" ? -3.2 : -0.4,
        recentFalsePositivePct: 2.8,
        recentMissedEvents: 1,
        daysSinceScheduledReview: 27,
      }),
    [driftStatuses, driftSimulation],
  );

  /* ---------------------------- governance ------------------------------ */

  const governanceReadiness = useMemo(() => calculateGovernanceReadiness(releaseGates), []);

  const promotionDecision = useMemo(
    () =>
      evaluatePromotionEligibility({
        candidate: modelVersions.find((v) => v.version === CANDIDATE_VERSION) ?? null,
        gates: candidateReleaseGates,
        driftStatuses,
        securityReviewPassed: true,
        explainabilityComplete: true,
        rollbackAvailable: Boolean(rollbackVersion) && rollbackVersion !== activeVersion,
        approvals: requiredApprovers.map((a) => ({ ...a })),
        evidenceComplete: driftSimulation !== "regional-data-loss",
      }),
    [driftStatuses, rollbackVersion, activeVersion, driftSimulation],
  );

  const rollbackDecision = useMemo(
    () =>
      evaluateRollbackReadiness({
        activeVersion,
        rollbackVersion,
        artifactAvailable: true,
        configurationAvailable: true,
        featureCompatible: true,
        dataCompatible: true,
        lastRollbackTest: "2026-06-19",
        estimatedMinutes: 12,
        requiredApprover: "Deployment Engineering owner",
      }),
    [activeVersion, rollbackVersion],
  );

  const versionComparison = useMemo(
    () =>
      compareModelVersions(
        modelVersions.find((v) => v.version === selectedVersion) ?? null,
        modelVersions.find((v) => v.version === comparisonVersion) ?? null,
      ),
    [selectedVersion, comparisonVersion],
  );

  const backtestSummary = useMemo(
    () => calculateBacktestSummary(backtestSeriesByVersion[selectedVersion]?.points ?? []),
    [selectedVersion],
  );

  const explainabilityQuality = useMemo(
    () => calculateExplainabilityQuality(explainabilityRecords, similarEventSupportPct),
    [],
  );

  const datasetQualityScore = useMemo(() => calculateDatasetQualityScore(dataQuality), []);
  const coverageScore = useMemo(
    () => calculateCoverageScore(trainingCoverage.filter((r) => r.dimension === coverageDimension)),
    [coverageDimension],
  );
  const classBalanceScore = useMemo(() => calculateClassBalanceScore(classBalance), []);

  /* ------------------------------ actions ------------------------------- */

  const promote = useCallback(
    (version: string) => {
      setRollbackVersion(activeVersion);
      setActiveVersion(version);
      setSelectedVersion(version);
      appendActivity({
        at: "Local demonstration",
        event: "Version promoted",
        version,
        actor: "Current reviewer",
        result: `${version} promoted in the local demonstration`,
        scope: "Global",
        evidence: "Local governance record",
        changeRecord: "Local",
        status: "Complete",
      });
      announce(`${version} promoted. Rollback version is now ${activeVersion}.`);
    },
    [activeVersion, appendActivity, announce],
  );

  const rollback = useCallback(() => {
    const restored = rollbackVersion;
    setActiveVersion(restored);
    setRollbackVersion(ROLLBACK_VERSION === restored ? governanceRecord.rollbackVersion : ROLLBACK_VERSION);
    setSelectedVersion(restored);
    appendActivity({
      at: "Local demonstration",
      event: "Rollback executed",
      version: restored,
      actor: "Deployment Engineering owner",
      result: `Active version restored to ${restored}`,
      scope: "Global",
      evidence: "Local rollback record",
      changeRecord: "Local",
      status: "Complete",
    });
    announce(`Rolled back. Active version is now ${restored}.`);
  }, [rollbackVersion, appendActivity, announce]);

  const addNote = useCallback(
    (note: string) => {
      const trimmed = note.trim();
      if (!trimmed) return;
      setNotes((current) => [
        { id: `note-local-${current.length + 1}`, at: "Local demonstration", author: "Current reviewer", note: trimmed },
        ...current,
      ]);
      announce("Governance note added.");
    },
    [announce],
  );

  const simulateDrift = useCallback(
    (key: DriftSimulationKey) => {
      setDriftSimulation(key);
      if (key === "none") {
        announce("Drift simulation reset to observed values.");
        return;
      }
      announce(`${simulationEffects[key].label} applied. Drift, release gates and retraining recommendation updated.`);
    },
    [announce],
  );

  const activity = useMemo(() => [...extraActivity, ...lifecycleActivity], [extraActivity]);

  /* context-derived announcement scope is intentionally read-only here */
  void context;

  return {
    tab, setTab,
    panelState, setPanelState,
    selectedVersion, setSelectedVersion,
    comparisonVersion, setComparisonVersion,
    trainingCategory, selectTrainingCategory: setTrainingCategory,
    coverageDimension, setCoverageDimension,
    validationView, setValidationView,
    validationSegmentId, selectValidationSegment: setValidationSegmentId,
    backtestMetric, setBacktestMetric,
    driftMetricId, selectDriftMetric: setDriftMetricId,
    driftSimulation, simulateDrift,
    governanceGateId, selectGovernanceGate: setGovernanceGateId,
    activityQuery, setActivityQuery,
    activityGroup, setActivityGroup,
    selectedTimelineEventId, selectTimelineEvent: setSelectedTimelineEventId,
    activeVersion, rollbackVersion, promote, rollback,
    notes, addNote,
    activity, appendActivity,
    announcement, announce,
    driftAssessment, retraining, promotionDecision, rollbackDecision, governanceReadiness,
    versionComparison, backtestSummary, explainabilityQuality,
    datasetQualityScore, coverageScore, classBalanceScore,
    simulationLabel: driftSimulation === "none" ? null : simulationEffects[driftSimulation].label,
  };
}
