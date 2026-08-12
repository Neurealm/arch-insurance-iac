/**
 * AIM-006 — scenario, explainability and evidence state.
 *
 * Single source of truth for AIM-006 interactions. Selected link, region,
 * product, horizon, model version and threshold stay owned by the page and are
 * passed in as context.
 */

import * as React from "react";
import {
  applyScenarioFailure, buildScenarioTimeline, calculateEvidenceCompleteness, calculateLearningUpdates,
  calculateScenarioOutcome, deriveScenarioStageState, evaluateScenarioApproval, getFailureEffect,
  normaliseStageIndex,
} from "./scenarioCalculations";
import { APPROVAL_STAGE_INDEX, evidenceItems, scenarioStages } from "./scenarioFixtures";
import type {
  ApprovalState, EvidenceCategory, EvidenceItem, ExplainTab, ScenarioFailureKey, ScenarioPanelState,
} from "./scenarioTypes";

export interface ScenarioContext {
  selectedLinkId: string;
  region: string;
  product: string;
  horizon: string;
  modelVersion: string;
  thresholdPct: number;
}

export type EvidenceStanceFilter = "all" | "supports" | "contradicts" | "neutral";
export type EvidenceFreshnessFilter = "all" | "current" | "recent" | "stale" | "missing";
export type EvidenceSort = "relevance" | "recency" | "category" | "reliability";

const STAGE_COUNT = scenarioStages.length;

export function useScenarioState(context: ScenarioContext) {
  /* explain drawer */
  const [explainOpen, setExplainOpen] = React.useState(false);
  const [explainTab, setExplainTab] = React.useState<ExplainTab>("Model Overview");

  /* evidence workspace */
  const [evidenceCategory, setEvidenceCategory] = React.useState<EvidenceCategory | "All">("All");
  const [evidenceStance, setEvidenceStance] = React.useState<EvidenceStanceFilter>("all");
  const [evidenceFreshness, setEvidenceFreshness] = React.useState<EvidenceFreshnessFilter>("all");
  const [evidenceSearch, setEvidenceSearch] = React.useState("");
  const [evidenceSort, setEvidenceSort] = React.useState<EvidenceSort>("relevance");
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);
  const [pinnedEvidenceIds, setPinnedEvidenceIds] = React.useState<string[]>([]);
  const [reviewedEvidenceIds, setReviewedEvidenceIds] = React.useState<string[]>([]);
  const [engineerNotes, setEngineerNotes] = React.useState<Record<string, string>>({});
  const [provenanceOpenId, setProvenanceOpenId] = React.useState<string | null>(null);

  /* similar events */
  const [selectedEventIds, setSelectedEventIds] = React.useState<string[]>([]);
  const [excludedEventIds, setExcludedEventIds] = React.useState<string[]>([]);
  const [eventDriver, setEventDriver] = React.useState<string>("All");
  const [eventProduct, setEventProduct] = React.useState<string>("All");
  const [openEventId, setOpenEventId] = React.useState<string | null>(null);

  /* traditional comparison */
  const [comparisonRow, setComparisonRow] = React.useState<string | null>(null);

  /* scenario */
  const [stageIndex, setStageIndexRaw] = React.useState(1);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [approvalDecision, setApprovalDecision] = React.useState<ApprovalState>("pending");
  const [failure, setFailureRaw] = React.useState<ScenarioFailureKey>("none");
  const [selectedTimelineId, setSelectedTimelineId] = React.useState<string | null>(null);
  const [panelState, setPanelState] = React.useState<ScenarioPanelState>("ready");
  const [announcement, setAnnouncement] = React.useState("");
  const [exportMessage, setExportMessage] = React.useState("");
  const [transitionError, setTransitionError] = React.useState<string | null>(null);

  const announce = React.useCallback((message: string) => setAnnouncement(message), []);

  const setStageIndex = React.useCallback((next: number) => {
    if (!Number.isFinite(next) || next < 1 || next > STAGE_COUNT) {
      setTransitionError(`Stage ${next} is outside the scenario range of 1 to ${STAGE_COUNT}.`);
      return;
    }
    setTransitionError(null);
    setStageIndexRaw(normaliseStageIndex(next));
  }, []);

  const setFailure = React.useCallback((key: ScenarioFailureKey) => {
    setFailureRaw(key);
    setApprovalDecision("pending");
    setAnnouncement(`Failure simulation set to ${getFailureEffect(key).label}.`);
  }, []);

  const reset = React.useCallback(() => {
    setStageIndexRaw(1);
    setPlaying(false);
    setSpeed(1);
    setApprovalDecision("pending");
    setFailureRaw("none");
    setSelectedTimelineId(null);
    setTransitionError(null);
    setAnnouncement("Scenario reset to the default successful protection scenario.");
  }, []);

  const approval = React.useMemo(
    () => evaluateScenarioApproval(stageIndex, approvalDecision, failure),
    [stageIndex, approvalDecision, failure],
  );

  const stage = React.useMemo(
    () => deriveScenarioStageState(stageIndex, failure, approvalDecision),
    [stageIndex, failure, approvalDecision],
  );

  const next = React.useCallback(() => {
    if (stageIndex >= STAGE_COUNT) {
      setTransitionError("The scenario is already at the final stage.");
      return;
    }
    const target = stageIndex + 1;
    if (target >= APPROVAL_STAGE_INDEX + 1 && !evaluateScenarioApproval(APPROVAL_STAGE_INDEX, approvalDecision, failure).canExecute) {
      setPlaying(false);
      setTransitionError("Approval is required before controlled execution.");
      setAnnouncement("Approval is required before controlled execution.");
      return;
    }
    setTransitionError(null);
    setStageIndexRaw(target);
    setAnnouncement(`Scenario stage ${target}: ${scenarioStages[target - 1].title}.`);
  }, [stageIndex, approvalDecision, failure]);

  const previous = React.useCallback(() => {
    if (stageIndex <= 1) {
      setTransitionError("The scenario is already at the first stage.");
      return;
    }
    setTransitionError(null);
    setStageIndexRaw(stageIndex - 1);
    setAnnouncement(`Scenario stage ${stageIndex - 1}: ${scenarioStages[stageIndex - 2].title}.`);
  }, [stageIndex]);

  /* playback */
  React.useEffect(() => {
    if (!playing) return undefined;
    const reduced = typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
    const interval = (reduced ? 3200 : 1600) / Math.max(0.25, speed);
    const id = window.setInterval(() => next(), interval);
    return () => window.clearInterval(id);
  }, [playing, speed, next]);

  React.useEffect(() => {
    if (stageIndex >= STAGE_COUNT) setPlaying(false);
  }, [stageIndex]);

  const approve = React.useCallback(() => {
    setApprovalDecision("approved");
    setAnnouncement("Traffic movement approved. Controlled execution is now permitted.");
  }, []);

  const reject = React.useCallback(() => {
    setApprovalDecision("rejected");
    setPlaying(false);
    setStageIndexRaw((s) => Math.min(s, APPROVAL_STAGE_INDEX));
    setAnnouncement("Traffic movement rejected. Execution is prevented and customer risk remains visible.");
  }, []);

  const requestMoreEvidence = React.useCallback(() => {
    setApprovalDecision("evidence-requested");
    setPlaying(false);
    setExplainOpen(true);
    setExplainTab("Evidence");
    setAnnouncement("More evidence requested. The scenario is paused until it is resumed locally.");
  }, []);

  const resumeAfterEvidence = React.useCallback(() => {
    setApprovalDecision("pending");
    setAnnouncement("Evidence review complete. Approval is pending again.");
  }, []);

  /* derived data */
  const activeEvidence = React.useMemo<EvidenceItem[]>(
    () => applyScenarioFailure(evidenceItems, failure),
    [failure],
  );

  const filteredEvidence = React.useMemo(() => {
    const term = evidenceSearch.trim().toLowerCase();
    const rows = activeEvidence.filter((item) => {
      if (evidenceCategory !== "All" && item.category !== evidenceCategory) return false;
      if (evidenceStance !== "all" && item.stance !== evidenceStance) return false;
      if (evidenceFreshness !== "all" && item.freshness !== evidenceFreshness) return false;
      if (!term) return true;
      return `${item.id} ${item.observation} ${item.source} ${item.interpretation}`.toLowerCase().includes(term);
    });
    const sorted = [...rows].sort((a, b) => {
      if (evidenceSort === "relevance") return b.relevance - a.relevance;
      if (evidenceSort === "recency") return b.timestamp.localeCompare(a.timestamp);
      if (evidenceSort === "category") return a.category.localeCompare(b.category);
      const order = { high: 0, medium: 1, low: 2 } as const;
      return order[a.reliability] - order[b.reliability];
    });
    const pinnedFirst = [
      ...sorted.filter((r) => pinnedEvidenceIds.includes(r.id)),
      ...sorted.filter((r) => !pinnedEvidenceIds.includes(r.id)),
    ];
    return pinnedFirst;
  }, [activeEvidence, evidenceCategory, evidenceStance, evidenceFreshness, evidenceSearch, evidenceSort, pinnedEvidenceIds]);

  const evidenceCompleteness = React.useMemo(
    () => calculateEvidenceCompleteness(activeEvidence),
    [activeEvidence],
  );

  const timeline = React.useMemo(
    () => buildScenarioTimeline(stageIndex, failure, approvalDecision),
    [stageIndex, failure, approvalDecision],
  );

  const outcome = React.useMemo(
    () => calculateScenarioOutcome(stageIndex, failure, approvalDecision, evidenceItems),
    [stageIndex, failure, approvalDecision],
  );

  const learning = React.useMemo(
    () => calculateLearningUpdates(failure, stageIndex),
    [failure, stageIndex],
  );

  const togglePinned = React.useCallback((id: string) => {
    setPinnedEvidenceIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }, []);

  const markReviewed = React.useCallback((id: string) => {
    setReviewedEvidenceIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setAnnouncement(`Evidence ${id} marked reviewed.`);
  }, []);

  const addEngineerNote = React.useCallback((id: string, note: string) => {
    setEngineerNotes((notes) => ({ ...notes, [id]: note }));
    setAnnouncement(`Engineer note added to evidence ${id}.`);
  }, []);

  const toggleSelectedEvent = React.useCallback((id: string) => {
    setSelectedEventIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }, []);

  const toggleExcludedEvent = React.useCallback((id: string) => {
    setExcludedEventIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }, []);

  const clearEvidenceFilters = React.useCallback(() => {
    setEvidenceCategory("All");
    setEvidenceStance("all");
    setEvidenceFreshness("all");
    setEvidenceSearch("");
    setEvidenceSort("relevance");
  }, []);

  return {
    context,
    /* explain */
    explainOpen, setExplainOpen, explainTab, setExplainTab,
    /* evidence */
    evidenceCategory, setEvidenceCategory, evidenceStance, setEvidenceStance,
    evidenceFreshness, setEvidenceFreshness, evidenceSearch, setEvidenceSearch,
    evidenceSort, setEvidenceSort, selectedEvidenceId, setSelectedEvidenceId,
    pinnedEvidenceIds, togglePinned, reviewedEvidenceIds, markReviewed,
    engineerNotes, addEngineerNote, provenanceOpenId, setProvenanceOpenId,
    activeEvidence, filteredEvidence, evidenceCompleteness, clearEvidenceFilters,
    /* similar events */
    selectedEventIds, toggleSelectedEvent, excludedEventIds, toggleExcludedEvent,
    eventDriver, setEventDriver, eventProduct, setEventProduct, openEventId, setOpenEventId,
    /* comparison */
    comparisonRow, setComparisonRow,
    /* scenario */
    stageIndex, setStageIndex, stage, stageCount: STAGE_COUNT,
    playing, setPlaying, speed, setSpeed, next, previous, reset,
    approvalDecision, approval, approve, reject, requestMoreEvidence, resumeAfterEvidence,
    failure, setFailure, timeline, selectedTimelineId, setSelectedTimelineId,
    outcome, learning, panelState, setPanelState,
    announcement, announce, exportMessage, setExportMessage, transitionError,
  };
}

export type ScenarioStateValue = ReturnType<typeof useScenarioState>;
