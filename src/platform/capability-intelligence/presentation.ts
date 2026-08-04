/**
 * Stage 3.5.4.1.1 — presentation helpers for Capability Intelligence.
 *
 * Pure mapping only. These helpers never reinterpret engine values; they render
 * canonical engine tokens as stakeholder language while preserving the raw
 * value for provenance (test ids, tooltips, detail rows).
 */

import type { CapabilityGraph } from "@/modules/graph/types";
import type { GraphQueryEngine } from "@/modules/graph/query/index";

/* --------------------------------------------------------------- metrics */

/** A metric that may legitimately be unavailable — never rendered as "0". */
export type MetricState =
  | { kind: "value"; value: number }
  | { kind: "unavailable" }
  | { kind: "unverified" };

export const metricOf = (value: number | null | undefined): MetricState =>
  typeof value === "number" && Number.isFinite(value) ? { kind: "value", value } : { kind: "unavailable" };

/**
 * Renders an engine rate at the engine's own precision (one decimal place when
 * the value carries decimals). Accepts either 0–1 ratios or 0–100 percentages.
 */
export function formatRate(state: MetricState): string {
  if (state.kind === "unavailable") return "Not available";
  if (state.kind === "unverified") return "Unable to verify";
  const pct = state.value <= 1 ? state.value * 100 : state.value;
  const rounded = Math.round(pct * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export function formatCount(state: MetricState): string {
  if (state.kind === "unavailable") return "Not available";
  if (state.kind === "unverified") return "Unable to verify";
  return state.value.toLocaleString();
}

/* ---------------------------------------------------------------- labels */

const CONFIDENCE_LABELS: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  "unable-to-verify": "Unable to verify",
};

const CONFIDENCE_EXPLANATIONS: Record<string, string> = {
  high: "Graph evidence is direct and corroborated by registration data.",
  medium: "Graph evidence is present but partially inferred.",
  low: "Graph evidence is weak or relies on candidate relationships.",
  "unable-to-verify": "Available graph evidence is insufficient to establish a stronger confidence level.",
};

export const confidenceLabel = (value: string): string => CONFIDENCE_LABELS[value] ?? value;
export const confidenceExplanation = (value: string): string =>
  CONFIDENCE_EXPLANATIONS[value] ?? "No confidence rationale was produced for this value.";

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  "expected-by-design": "Expected by design",
  informational: "Informational",
  consolidated: "Consolidated",
};

export const statusLabel = (value: string): string => STATUS_LABELS[value] ?? value;

export const PRIORITY_HELP =
  "Priority indicates how urgently the recommendation should be addressed, derived from the prioritisation policy score.";
export const SEVERITY_HELP =
  "Severity describes the nature and seriousness of the underlying architectural condition, independent of urgency.";

/* ---------------------------------------------------------------- orphans */

/**
 * Canonical orphan definition (Stage 3.5.2 `graphStatistics().totals.orphanNodes`):
 * a node with a total degree of zero — it participates in no graph edge in
 * either direction. Candidate edges are not counted as connectivity, matching
 * the statistics module. This is the single definition used by the UI.
 */
export function buildOrphanIndex(graph: Pick<CapabilityGraph, "nodes" | "edges">): ReadonlySet<string> {
  const connected = new Set<string>();
  for (const e of graph.edges) {
    connected.add(e.from);
    connected.add(e.to);
  }
  const orphans = new Set<string>();
  for (const n of graph.nodes) if (!connected.has(n.id)) orphans.add(n.id);
  return orphans;
}

export const orphanIndexFor = (engine: GraphQueryEngine): ReadonlySet<string> => buildOrphanIndex(engine.source);

export const orphanStateLabel = (isOrphan: boolean): string => (isOrphan ? "orphan" : "connected");
