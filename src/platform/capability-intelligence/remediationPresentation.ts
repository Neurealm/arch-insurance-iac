/**
 * Stage 3.5.4.3 — presentation helpers for the Remediation Workspace.
 *
 * Pure mapping only. These helpers never reinterpret or soften an engine
 * verdict: they map canonical engine tokens onto stakeholder language and a
 * status tone, and always leave the raw token available to the caller.
 */

import type { StatusTone } from "@/platform/components/StatusBadge";

/* ------------------------------------------------------------- verdicts */

const VALIDATION_TONE: Record<string, StatusTone> = {
  valid: "positive",
  incomplete: "warning",
  conflicting: "warning",
  invalid: "critical",
};

export const validationTone = (outcome: string): StatusTone =>
  VALIDATION_TONE[outcome] ?? "neutral";

const VALIDATION_LABEL: Record<string, string> = {
  valid: "Valid — can be simulated",
  incomplete: "Incomplete — required parameters are unresolved",
  conflicting: "Conflicting — blocked by another proposed change",
  invalid: "Invalid — cannot be simulated",
};

export const validationLabel = (outcome: string): string =>
  VALIDATION_LABEL[outcome] ?? outcome;

const BAND_TONE: Record<string, StatusTone> = {
  "strongly-recommended": "positive",
  recommended: "positive",
  conditional: "warning",
  "low-value": "neutral",
  "not-recommended": "critical",
  invalid: "critical",
};

export const scoreBandTone = (band: string): StatusTone => BAND_TONE[band] ?? "neutral";

const SEVERITY_TONE: Record<string, StatusTone> = {
  blocking: "critical",
  critical: "critical",
  warning: "warning",
  advisory: "info",
  info: "info",
};

export const severityTone = (severity: string): StatusTone => SEVERITY_TONE[severity] ?? "neutral";

const PLAN_STATUS_TONE: Record<string, StatusTone> = {
  draft: "info",
  blocked: "critical",
  "ready-for-review": "positive",
};

export const planStatusTone = (status: string): StatusTone => PLAN_STATUS_TONE[status] ?? "neutral";

const DRIFT_TONE: Record<string, StatusTone> = {
  none: "positive",
  nonmaterial: "info",
  "review-required": "warning",
  "resimulation-required": "warning",
  "plan-invalidated": "critical",
};

export const driftTone = (classification: string): StatusTone =>
  DRIFT_TONE[classification] ?? "neutral";

const RESOLUTION_TONE: Record<string, StatusTone> = {
  resolved: "positive",
  invalidated: "positive",
  "partially-resolved": "warning",
  superseded: "info",
  unresolved: "neutral",
  regressed: "critical",
};

export const resolutionTone = (classification: string): StatusTone =>
  RESOLUTION_TONE[classification] ?? "neutral";

/* -------------------------------------------------------------- metrics */

/** Human label for a simulation metric key. Falls back to the raw key. */
const METRIC_LABELS: Record<string, string> = {
  nodeCount: "Entities",
  edgeCount: "Relationships",
  ownershipResolutionRate: "Ownership resolution",
  declaredOwnershipCount: "Declared ownership",
  propagatedOwnershipCount: "Propagated ownership",
  conflictingOwnershipCount: "Conflicting ownership",
  unresolvedOwnershipCount: "Unresolved ownership",
  routeTraceabilityRate: "Route traceability",
  fullyTraceableRouteCount: "Fully traceable routes",
  coverageGapCount: "Coverage gaps",
  expectedByDesignGapCount: "Expected-by-design gaps",
  singlePointOfFailureCount: "Single points of failure",
  bottleneckCount: "Bottlenecks",
  dependencyCycleCount: "Dependency cycles",
  missingLineageLayerCount: "Missing lineage layers",
  orphanNodeCount: "Orphan entities",
  recommendationCount: "Open recommendations",
  priorityScoreTotal: "Total priority score",
  priorityScoreMax: "Highest priority score",
  priorityScoreMean: "Mean priority score",
};

export const metricLabel = (key: string, fallback?: string): string =>
  METRIC_LABELS[key] ?? fallback ?? key;

const RATE_KEYS = new Set(["ownershipResolutionRate", "routeTraceabilityRate"]);

/** Formats a metric value at the engine's own precision. */
export function formatMetricValue(key: string, value: number): string {
  if (!Number.isFinite(value)) return "Not available";
  if (RATE_KEYS.has(key)) {
    const pct = value <= 1 ? value * 100 : value;
    const rounded = Math.round(pct * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
  }
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString();
}

/** Signed delta, formatted the same way as the underlying metric. */
export function formatMetricDelta(key: string, delta: number): string {
  if (delta === 0) return "no change";
  const sign = delta > 0 ? "+" : "−";
  return `${sign}${formatMetricValue(key, Math.abs(delta))}`;
}

const DIRECTION_TONE: Record<string, StatusTone> = {
  improved: "positive",
  regressed: "critical",
  unchanged: "neutral",
};

export const directionTone = (direction: string): StatusTone =>
  DIRECTION_TONE[direction] ?? "neutral";

/* ---------------------------------------------------------------- copy */

export const READ_ONLY_NOTICE =
  "This workspace is planning-only. Nothing here modifies the capability graph, the module registry, the route table or any repository file, and no patch is ever applied.";

export const DETERMINISM_NOTICE =
  "Every result is deterministic: the same recommendation, parameters and canonical graph always produce the same simulation and the same plan.";
