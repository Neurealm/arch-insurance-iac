/**
 * Stage 3.5.4.2.1 — presentation of traversal and query warnings.
 *
 * This module does NOT create a second warning system. It is a pure, read-only
 * presentation mapping over the warnings already emitted by the Stage 3.5.3.1
 * Query Engine and carried through the bounded graph-view result. Warning
 * codes, messages and subjects are used exactly as produced.
 */

import type { QueryWarning, QueryWarningCode } from "@/modules/graph/query/index";
import type { GraphView } from "./graphViewTypes";
import { DIRECTION_LABELS, MAX_VISIBLE_EDGES, MAX_VISIBLE_NODES } from "./graphViewTypes";

export interface PresentedWarning {
  /** Stable key for rendering, derived from code + subject + ordinal. */
  key: string;
  /** Canonical engine warning code, surfaced verbatim in supporting detail. */
  code: QueryWarningCode;
  title: string;
  explanation: string;
  /** Suggested user actions. May be empty when no action applies. */
  actions: readonly string[];
  /** The verbatim engine message, kept as supporting detail. */
  detail: string;
  subject?: string;
}

/**
 * Deterministic display order. Warnings are grouped by importance to the
 * reader, and ties keep engine emission order, so the same view always renders
 * the same warnings in the same order.
 */
const ORDER: readonly QueryWarningCode[] = [
  "results-truncated",
  "depth-limit-reached",
  "path-limit-reached",
  "candidate-relationships-included",
  "empty-result",
];

const rank = (code: QueryWarningCode): number => {
  const i = ORDER.indexOf(code);
  return i === -1 ? ORDER.length : i;
};

function copyFor(warning: QueryWarning, view: GraphView): { title: string; explanation: string; actions: string[] } {
  const direction = DIRECTION_LABELS[view.request.direction].toLowerCase();
  switch (warning.code) {
    case "depth-limit-reached":
      return {
        title: "Depth limit reached",
        explanation: `This view stops at depth ${view.request.depth}. Entities further along the ${direction} chain exist in the canonical graph but are outside this bounded neighbourhood, so the chain shown here may not be complete. The graph data itself is complete and valid.`,
        actions: [
          "Increase traversal depth",
          "Narrow the relationship types to keep the view readable at greater depth",
          "Re-root on an entity nearer the edge of this view",
        ],
      };
    case "results-truncated":
      return {
        title: "View truncated for safety",
        explanation: `Only the first ${MAX_VISIBLE_NODES} entities and ${MAX_VISIBLE_EDGES} relationships of this neighbourhood are rendered. Retention is deterministic — nearest first, confirmed relationships before candidates — so nothing is dropped at random.`,
        actions: [
          "Reduce traversal depth",
          "Narrow the relationship types",
          "Explore one direction at a time",
        ],
      };
    case "empty-result":
      return {
        title: "No results for this query",
        explanation: `The traversal returned nothing for the current root, direction (${direction}) and relationship selection. The reason is stated in the message below and in the empty state on the canvas.`,
        actions: [
          "Widen the relationship type selection",
          "Increase traversal depth",
          "Switch direction",
          "Include candidate relationships to preview weakly-inferred links",
        ],
      };
    case "candidate-relationships-included":
      return {
        title: "Candidate relationships included",
        explanation:
          "Candidate relationships are weakly-inferred and non-canonical. They are drawn dashed and labelled, and never count towards the confirmed graph.",
        actions: ["Disable candidate relationships to see only confirmed structure"],
      };
    case "path-limit-reached":
      return {
        title: "Path limit reached",
        explanation:
          "The query engine stopped enumerating paths at its safety limit. The relationships shown remain accurate.",
        actions: ["Reduce traversal depth", "Narrow the relationship types"],
      };
    default:
      return {
        title: "Query warning",
        explanation:
          "The graph query engine reported a condition affecting this view. The relationships shown remain read-only and unmodified.",
        actions: [],
      };
  }
}

/**
 * Presents the graph-view warnings. Pure: the view and its warnings are read,
 * never mutated, and no query is re-executed.
 */
export function presentWarnings(view: GraphView): readonly PresentedWarning[] {
  return view.warnings
    .map((warning, index) => ({ warning, index }))
    .sort((a, b) => rank(a.warning.code) - rank(b.warning.code) || a.index - b.index)
    .map(({ warning, index }) => {
      const copy = copyFor(warning, view);
      return {
        key: `${warning.code}:${warning.subject ?? ""}:${index}`,
        code: warning.code,
        title: copy.title,
        explanation: copy.explanation,
        actions: copy.actions,
        detail: warning.message,
        subject: warning.subject,
      };
    });
}
