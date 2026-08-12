/**
 * AIM-002 — pipeline-local selection state.
 *
 * All state lives on this page. Nothing here navigates, mutates shared stores
 * or touches the AIM-001 page-level state.
 */

import * as React from "react";
import {
  DEFAULT_ACTION_ID, DEFAULT_STAGE, SELECTED_LINK_ID, type PipelineStageKey, type RiskClass,
} from "../data/pliPipelineFixtures";

export type LocalActionState =
  | "Recommended"
  | "Approval requested"
  | "Deferred"
  | "Rejected"
  | "Available"
  | "Standby"
  | "Not recommended";

export interface ActionRuntime {
  state: LocalActionState;
  owner: string | null;
  simulated: boolean;
}

export interface PipelineColumnStates {
  signals: ColumnState;
  features: ColumnState;
  anomalies: ColumnState;
  ensemble: ColumnState;
  impact: ColumnState;
  actions: ColumnState;
}

export type ColumnState = "ready" | "loading" | "empty" | "error";

export interface PipelineState {
  stage: PipelineStageKey;
  setStage: (s: PipelineStageKey) => void;
  expandedGroups: string[];
  toggleGroup: (id: string) => void;
  selectedSignalId: string | null;
  selectSignal: (id: string | null) => void;
  pinnedSignalIds: string[];
  togglePin: (id: string) => void;
  contributingOnly: boolean;
  setContributingOnly: (v: boolean) => void;
  selectedFeatureId: string | null;
  selectFeature: (id: string | null) => void;
  featureDrawerOpen: boolean;
  setFeatureDrawerOpen: (v: boolean) => void;
  evidenceDrawerOpen: boolean;
  setEvidenceDrawerOpen: (v: boolean) => void;
  comparisonOpen: boolean;
  setComparisonOpen: (v: boolean) => void;
  selectedLinkId: string;
  selectLink: (id: string) => void;
  hoveredLinkId: string | null;
  setHoveredLinkId: (id: string | null) => void;
  riskFilter: RiskClass | "All";
  setRiskFilter: (v: RiskClass | "All") => void;
  productFilter: string;
  setProductFilter: (v: string) => void;
  regionFilter: string;
  setRegionFilter: (v: string) => void;
  brush: { min: number; max: number };
  setBrush: (b: { min: number; max: number }) => void;
  selectedModelId: string | null;
  selectModel: (id: string | null) => void;
  /** Live slider position, updates immediately. */
  thresholdInput: number;
  /** Debounced value used for derived calculations. */
  threshold: number;
  setThreshold: (v: number) => void;
  selectedImpactId: string | null;
  selectImpact: (id: string | null) => void;
  selectedNodeId: string | null;
  selectNode: (id: string | null) => void;
  selectedActionId: string;
  selectAction: (id: string) => void;
  actionRuntime: Record<string, ActionRuntime>;
  updateAction: (id: string, patch: Partial<ActionRuntime>) => void;
  announcement: string;
  announce: (msg: string) => void;
  columnState: ColumnState;
  setColumnState: (s: ColumnState) => void;
  reset: () => void;
}

const DEFAULT_BRUSH = { min: -2, max: 4 };

export function usePipelineState(): PipelineState {
  const [stage, setStageRaw] = React.useState<PipelineStageKey>(DEFAULT_STAGE);
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>(["optical", "environmental"]);
  const [selectedSignalId, setSelectedSignalId] = React.useState<string | null>(null);
  const [pinnedSignalIds, setPinnedSignalIds] = React.useState<string[]>([]);
  const [contributingOnly, setContributingOnly] = React.useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = React.useState<string | null>(null);
  const [featureDrawerOpen, setFeatureDrawerOpen] = React.useState(false);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = React.useState(false);
  const [comparisonOpen, setComparisonOpen] = React.useState(false);
  const [selectedLinkId, setSelectedLinkId] = React.useState<string>(SELECTED_LINK_ID);
  const [hoveredLinkId, setHoveredLinkId] = React.useState<string | null>(null);
  const [riskFilter, setRiskFilter] = React.useState<RiskClass | "All">("All");
  const [productFilter, setProductFilter] = React.useState("All products");
  const [regionFilter, setRegionFilter] = React.useState("All regions");
  const [brush, setBrush] = React.useState(DEFAULT_BRUSH);
  const [selectedModelId, setSelectedModelId] = React.useState<string | null>(null);
  const [thresholdInput, setThresholdInput] = React.useState(80);
  const [threshold, setDebouncedThreshold] = React.useState(80);
  const [selectedImpactId, setSelectedImpactId] = React.useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>("link");
  const [selectedActionId, setSelectedActionId] = React.useState<string>(DEFAULT_ACTION_ID);
  const [actionRuntime, setActionRuntime] = React.useState<Record<string, ActionRuntime>>({});
  const [announcement, setAnnouncement] = React.useState("");
  const [columnState, setColumnState] = React.useState<ColumnState>("ready");

  /* Debounce threshold-driven recalculation without blocking the slider. */
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebouncedThreshold(thresholdInput), 120);
    return () => window.clearTimeout(id);
  }, [thresholdInput]);

  const announce = React.useCallback((msg: string) => setAnnouncement(msg), []);

  const setStage = React.useCallback((s: PipelineStageKey) => {
    setStageRaw(s);
    setAnnouncement(`Pipeline stage ${s} selected`);
  }, []);

  const toggleGroup = React.useCallback((id: string) => {
    setExpandedGroups((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }, []);

  const togglePin = React.useCallback((id: string) => {
    setPinnedSignalIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const selectSignal = React.useCallback((id: string | null) => {
    setSelectedSignalId(id);
    if (id) setAnnouncement(`Signal ${id} selected`);
  }, []);

  const selectFeature = React.useCallback((id: string | null) => {
    setSelectedFeatureId(id);
    if (id) {
      setFeatureDrawerOpen(true);
      setAnnouncement(`Feature ${id} selected`);
    }
  }, []);

  const selectLink = React.useCallback((id: string) => {
    setSelectedLinkId(id);
    setAnnouncement(`Link ${id} selected`);
  }, []);

  const selectModel = React.useCallback((id: string | null) => setSelectedModelId(id), []);
  const selectImpact = React.useCallback((id: string | null) => setSelectedImpactId(id), []);
  const selectNode = React.useCallback((id: string | null) => setSelectedNodeId(id), []);
  const selectAction = React.useCallback((id: string) => setSelectedActionId(id), []);

  const setThreshold = React.useCallback((v: number) => {
    setThresholdInput(v);
    setAnnouncement(`Confidence threshold ${v} percent`);
  }, []);

  const updateAction = React.useCallback((id: string, patch: Partial<ActionRuntime>) => {
    setActionRuntime((prev) => ({
      ...prev,
      [id]: { state: prev[id]?.state ?? "Recommended", owner: prev[id]?.owner ?? null, simulated: prev[id]?.simulated ?? false, ...patch },
    }));
  }, []);

  const reset = React.useCallback(() => {
    setStageRaw(DEFAULT_STAGE);
    setExpandedGroups(["optical", "environmental"]);
    setSelectedSignalId(null);
    setPinnedSignalIds([]);
    setContributingOnly(false);
    setSelectedFeatureId(null);
    setFeatureDrawerOpen(false);
    setEvidenceDrawerOpen(false);
    setComparisonOpen(false);
    setSelectedLinkId(SELECTED_LINK_ID);
    setRiskFilter("All");
    setProductFilter("All products");
    setRegionFilter("All regions");
    setBrush(DEFAULT_BRUSH);
    setSelectedModelId(null);
    setThresholdInput(80);
    setDebouncedThreshold(80);
    setSelectedImpactId(null);
    setSelectedNodeId("link");
    setSelectedActionId(DEFAULT_ACTION_ID);
    setActionRuntime({});
    setColumnState("ready");
    setAnnouncement("Pipeline reset to default state");
  }, []);

  return {
    stage, setStage, expandedGroups, toggleGroup, selectedSignalId, selectSignal, pinnedSignalIds, togglePin,
    contributingOnly, setContributingOnly, selectedFeatureId, selectFeature, featureDrawerOpen, setFeatureDrawerOpen,
    evidenceDrawerOpen, setEvidenceDrawerOpen, comparisonOpen, setComparisonOpen, selectedLinkId, selectLink,
    hoveredLinkId, setHoveredLinkId, riskFilter, setRiskFilter, productFilter, setProductFilter, regionFilter,
    setRegionFilter, brush, setBrush, selectedModelId, selectModel, thresholdInput, threshold, setThreshold,
    selectedImpactId, selectImpact, selectedNodeId, selectNode, selectedActionId, selectAction, actionRuntime,
    updateAction, announcement, announce, columnState, setColumnState, reset,
  };
}

/** Shared visual language for the pipeline. */
export const RISK_COLORS: Record<string, string> = {
  Normal: "#64748b",
  Watch: "#0ea5e9",
  Elevated: "#f59e0b",
  "High Risk": "#dc2626",
  "Data Quality Concern": "#a855f7",
};

export const FLOW_COLORS = {
  data: "#2563eb",
  reasoning: "#7c3aed",
  control: "#059669",
  inactive: "#cbd5e1",
} as const;
