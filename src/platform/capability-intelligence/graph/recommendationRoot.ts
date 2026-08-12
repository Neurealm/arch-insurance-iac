/**
 * Stage 3.5.4.2.1 — recommendation → graph root selection policy.
 *
 * Deterministic presentation-layer policy. It does not change Intelligence
 * Engine output, ordering, scoring or consolidation: it only chooses which of
 * the recommendation's already-stable affected node ids opens as the Graph
 * Explorer root.
 *
 * Policy, in order:
 *   1. The recommendation's explicit `subject`, when it resolves to a canonical
 *      graph node.
 *   2. Otherwise the first affected node id, in the engine's stable order, that
 *      resolves to a canonical graph node.
 *   3. Otherwise no root — no Graph Explorer link is offered.
 *
 * Limitations: no semantic priority is invented among node types, because the
 * recommendation contract does not express one. If neither the subject nor any
 * affected node resolves in the current graph snapshot, the recommendation has
 * no explorable root.
 */

export interface RecommendationRootInput {
  /** Explicit subject from the recommendation contract, if any. */
  subject?: string | null;
  /** Affected node ids, in the Intelligence Engine's stable order. */
  nodeIds: readonly string[];
}

export interface RecommendationRootSelection {
  /** Chosen root node id, or null when no affected node resolves. */
  rootId: string | null;
  /** Why this root was chosen. */
  reason: "subject" | "first-valid-affected" | "none";
  /** Valid affected entities other than the chosen root. */
  additionalAffectedCount: number;
}

/** Deterministically selects the Graph Explorer root for a recommendation. */
export function selectRecommendationGraphRoot(
  input: RecommendationRootInput,
  isKnownNode: (id: string) => boolean,
): RecommendationRootSelection {
  const valid: string[] = [];
  const seen = new Set<string>();
  for (const id of input.nodeIds) {
    if (typeof id !== "string" || id.length === 0) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    if (isKnownNode(id)) valid.push(id);
  }

  const subject = input.subject ?? null;
  if (subject && isKnownNode(subject)) {
    return {
      rootId: subject,
      reason: "subject",
      additionalAffectedCount: valid.filter((id) => id !== subject).length,
    };
  }

  if (valid.length === 0) {
    return { rootId: null, reason: "none", additionalAffectedCount: 0 };
  }

  return {
    rootId: valid[0],
    reason: "first-valid-affected",
    additionalAffectedCount: valid.length - 1,
  };
}

/** User-facing wording for the chosen root and remaining affected entities. */
export function recommendationRootExplanation(
  selection: RecommendationRootSelection,
  rootLabel: string,
): string {
  if (!selection.rootId) return "No affected entity in this recommendation resolves in the current graph snapshot.";
  if (selection.additionalAffectedCount === 0) return `Explore from ${rootLabel}`;
  return `Explore from ${rootLabel}, plus ${selection.additionalAffectedCount} additional affected ${
    selection.additionalAffectedCount === 1 ? "entity" : "entities"
  }`;
}
