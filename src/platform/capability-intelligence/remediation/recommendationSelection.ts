/**
 * Stage 3.5.4.3 — deterministic recommendation selection policy for the
 * Remediation Workspace.
 *
 * Pure and side-effect free. No engine is executed here, nothing is cached and
 * no recommendation identifier is ever hardcoded: the initial selection is
 * always derived from the recommendation set the intelligence engine produced.
 *
 * Ordering (first key that separates two recommendations wins):
 *   1. Highest canonical priority band          (critical > … > informational)
 *   2. Highest priority score                   (numeric, descending)
 *   3. Highest canonical severity               (critical > warning > advisory > info)
 *   4. Highest affected-entity count            (numeric, descending)
 *   5. Canonical recommendation identifier      (ascending, total tie break)
 *
 * Because rule 5 is a total order over unique identifiers, the comparator is a
 * strict weak ordering and the result is independent of input order.
 */

import { bandRank, type IntelligenceRecommendation } from "@/modules/graph/intelligence/index";

/** Canonical severity ordering, highest first. Mirrors `ReasoningSeverity`. */
export const SEVERITY_ORDER = ["critical", "warning", "advisory", "info"] as const;

/** Rank of a severity token. Unknown tokens sort last, never first. */
export function severityRank(severity: string): number {
  const index = SEVERITY_ORDER.indexOf(severity as (typeof SEVERITY_ORDER)[number]);
  return index === -1 ? SEVERITY_ORDER.length : index;
}

/** Total number of distinct graph entities a recommendation touches. */
export function affectedEntityCount(recommendation: IntelligenceRecommendation): number {
  const a = recommendation.affected;
  const ids = new Set<string>([
    ...a.nodeIds,
    ...a.routeIds,
    ...a.moduleIds,
    ...a.capabilityIds,
    ...a.serviceIds,
    ...a.platformIds,
  ]);
  return ids.size;
}

/**
 * Comparator implementing the documented ordering. Negative when `a` should be
 * offered before `b`.
 */
export function compareRecommendationsForDefault(
  a: IntelligenceRecommendation,
  b: IntelligenceRecommendation,
): number {
  const priority = bandRank(a.priority) - bandRank(b.priority);
  if (priority !== 0) return priority;
  const score = b.priorityScore - a.priorityScore;
  if (score !== 0) return score;
  const severity = severityRank(a.severity) - severityRank(b.severity);
  if (severity !== 0) return severity;
  const affected = affectedEntityCount(b) - affectedEntityCount(a);
  if (affected !== 0) return affected;
  return a.id.localeCompare(b.id);
}

/** The recommendations in the deterministic order the workspace offers them. */
export function orderRecommendationsForDefault(
  recommendations: readonly IntelligenceRecommendation[],
): readonly IntelligenceRecommendation[] {
  return [...recommendations].sort(compareRecommendationsForDefault);
}

/**
 * The recommendation the workspace opens with when the URL carries no usable
 * selection. Returns null only for an empty recommendation set.
 */
export function defaultRecommendation(
  recommendations: readonly IntelligenceRecommendation[],
): IntelligenceRecommendation | null {
  if (recommendations.length === 0) return null;
  return recommendations.reduce((best, candidate) =>
    compareRecommendationsForDefault(candidate, best) < 0 ? candidate : best,
  );
}

/**
 * Normalizes the `?recommendation=` parameter.
 *
 * Handles the missing parameter, an empty or whitespace-only parameter and a
 * percent-encoded identifier. React Router already decodes the value once, so
 * only a double-encoded value needs a further pass; decoding is attempted
 * defensively and a malformed escape sequence falls back to the raw value.
 */
export function normalizeRecommendationParam(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  if (!trimmed.includes("%")) return trimmed;
  try {
    const decoded = decodeURIComponent(trimmed).trim();
    return decoded === "" ? null : decoded;
  } catch {
    return trimmed;
  }
}

export interface RecommendationSelection {
  /** The recommendation the workspace should work with, or null when none exist. */
  recommendation: IntelligenceRecommendation | null;
  /** How the selection was arrived at — surfaced to the operator. */
  source: "parameter" | "default" | "none";
  /** Set when a parameter was supplied but matched no canonical recommendation. */
  unknownParameter: string | null;
}

/**
 * Resolves the effective selection from the URL parameter and the canonical
 * recommendation set. An unknown identifier never blanks the workspace: it
 * falls back to the deterministic default and reports the miss so the UI can
 * tell the operator what happened.
 */
export function resolveRecommendationSelection(
  recommendations: readonly IntelligenceRecommendation[],
  rawParam: string | null | undefined,
): RecommendationSelection {
  const param = normalizeRecommendationParam(rawParam);
  if (param) {
    const match = recommendations.find((r) => r.id === param);
    if (match) return { recommendation: match, source: "parameter", unknownParameter: null };
  }
  const fallback = defaultRecommendation(recommendations);
  return {
    recommendation: fallback,
    source: fallback ? "default" : "none",
    // Non-null only when a parameter was supplied and matched nothing.
    unknownParameter: param ?? null,
  };
}


/** Deep-link path for a recommendation, used by the Recommendation Center. */
export function remediationLinkFor(recommendationId: string): string {
  return `/platform/capability-intelligence/remediation?recommendation=${encodeURIComponent(
    recommendationId,
  )}`;
}
