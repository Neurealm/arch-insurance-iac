/**
 * Stage 3.5.4.2.1 / 3.5.4.2.2 — presentation of traversal and query warnings.
 *
 * This module does NOT create a second warning system. It is a pure, read-only
 * presentation mapping over the warnings already emitted by the Stage 3.5.3.1
 * Query Engine and carried through the bounded graph-view result. Warning
 * codes, messages and subjects are used exactly as produced.
 *
 * Stage 3.5.4.2.2 adds presentation-layer deduplication and a concise
 * announcement summary. Neither changes engine emission, traversal execution or
 * the warning taxonomy: a bidirectional traversal legitimately reports the same
 * condition from its upstream and downstream sub-queries, and this module
 * consolidates those identical reports into a single card so the reader is not
 * shown what looks like two separate defects.
 */

import type { QueryWarning, QueryWarningCode } from "@/modules/graph/query/index";
import type { GraphView } from "./graphViewTypes";
import { DIRECTION_LABELS, MAX_VISIBLE_EDGES, MAX_VISIBLE_NODES } from "./graphViewTypes";

export interface PresentedWarning {
  /** Stable key for rendering, derived from the full canonical warning identity. */
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
  /**
   * How many identical engine warnings this card represents. Greater than one
   * only when separate traversal branches reported the same condition.
   */
  occurrences: number;
  /** Concise clause used by the polite announcement summary. */
  summary: string;
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

function copyFor(
  warning: QueryWarning,
  view: GraphView,
): { title: string; explanation: string; actions: string[]; summary: string } {
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
        summary: `the view stops at depth ${view.request.depth} and may not show the complete relationship chain`,
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
        summary: "the view is truncated for safety",
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
        summary: "the query returned no results",
      };
    case "candidate-relationships-included":
      return {
        title: "Candidate relationships included",
        explanation:
          "Candidate relationships are weakly-inferred and non-canonical. They are drawn dashed and labelled, and never count towards the confirmed graph.",
        actions: ["Disable candidate relationships to see only confirmed structure"],
        summary: "candidate relationships are included",
      };
    case "path-limit-reached":
      return {
        title: "Path limit reached",
        explanation:
          "The query engine stopped enumerating paths at its safety limit. The relationships shown remain accurate.",
        actions: ["Reduce traversal depth", "Narrow the relationship types"],
        summary: "the path enumeration limit was reached",
      };
    default:
      return {
        title: "Query warning",
        explanation:
          "The graph query engine reported a condition affecting this view. The relationships shown remain read-only and unmodified.",
        actions: [],
        summary: "the query engine reported a condition affecting this view",
      };
  }
}

/**
 * Canonical identity of a warning for deduplication purposes. Every field the
 * engine can vary is part of the identity, so two warnings collapse only when
 * they are the same statement about the same thing: same code, same subject and
 * same verbatim message. Two `depth-limit-reached` warnings about different
 * subjects, or with different messages (different depths, limits or
 * conditions), remain separate cards.
 */
export function graphWarningIdentity(warning: QueryWarning): string {
  return JSON.stringify([warning.code, warning.subject ?? null, warning.message]);
}

export interface DeduplicatedWarning {
  warning: QueryWarning;
  /** Number of identical engine warnings collapsed into this entry. */
  occurrences: number;
  /** Index of the first occurrence in the engine's emission order. */
  firstIndex: number;
}

/**
 * Collapses identical engine warnings. A bidirectional traversal reports the
 * same condition once per sub-query; those reports describe one condition, not
 * two defects. Pure and non-mutating: the input array and its warning objects
 * are only read.
 */
export function deduplicateGraphWarnings(
  warnings: readonly QueryWarning[],
): readonly DeduplicatedWarning[] {
  const byIdentity = new Map<string, { warning: QueryWarning; occurrences: number; firstIndex: number }>();
  warnings.forEach((warning, index) => {
    const identity = graphWarningIdentity(warning);
    const existing = byIdentity.get(identity);
    if (existing) {
      existing.occurrences += 1;
      return;
    }
    byIdentity.set(identity, { warning, occurrences: 1, firstIndex: index });
  });
  return [...byIdentity.values()].sort(
    (a, b) => rank(a.warning.code) - rank(b.warning.code) || a.firstIndex - b.firstIndex,
  );
}

/**
 * Presents the graph-view warnings: engine warnings mapped to reader-facing
 * copy, identical reports consolidated, and ordered deterministically. Pure —
 * the view and its warnings are read, never mutated, and no query is
 * re-executed.
 */
export function presentGraphWarnings(view: GraphView): readonly PresentedWarning[] {
  return deduplicateGraphWarnings(view.warnings).map(({ warning, occurrences }) => {
    const copy = copyFor(warning, view);
    return {
      key: graphWarningIdentity(warning),
      code: warning.code,
      title: copy.title,
      explanation: copy.explanation,
      actions: copy.actions,
      detail: warning.message,
      subject: warning.subject,
      occurrences,
      summary: copy.summary,
    };
  });
}

/** Retained name for existing call sites. */
export const presentWarnings = presentGraphWarnings;

/**
 * Builds the concise polite announcement for the current warning set. Returns
 * an empty string when there is nothing to announce; the caller decides whether
 * a transition from "some warnings" to "none" should announce the cleared
 * message. Deduplicated input means one condition is announced once.
 */
export function summarizeGraphWarningsForAnnouncement(
  warnings: readonly PresentedWarning[],
): string {
  if (warnings.length === 0) return "";
  const sentence = (clause: string) => `${clause.charAt(0).toUpperCase()}${clause.slice(1)}.`;
  if (warnings.length === 1) {
    return `Graph warning. ${sentence(warnings[0].summary)}`;
  }
  const clauses = warnings.map((w) => w.summary);
  const joined =
    clauses.length === 2
      ? `${clauses[0]} and ${clauses[1]}`
      : `${clauses.slice(0, -1).join(", ")} and ${clauses[clauses.length - 1]}`;
  return `Graph updated with ${warnings.length} warnings. ${sentence(joined)}`;
}

/** Announced once when a previously-warning view becomes warning-free. */
export const GRAPH_WARNINGS_CLEARED_ANNOUNCEMENT = "Graph warnings cleared.";


/** Stable identity of a whole warning set, used to detect material changes. */
export function graphWarningSetSignature(warnings: readonly PresentedWarning[]): string {
  return warnings.map((w) => w.key).join("\u0000");
}

/**
 * Decides what, if anything, to announce for a new warning set.
 *
 * `previousSignature` is `null` before the first warning state has been seen.
 * An unchanged signature announces nothing at all (the live region keeps its
 * previous text, so nothing is re-read), a non-empty set announces its concise
 * summary, and a transition from warnings to none announces the cleared message
 * exactly once — a view that never had warnings stays silent.
 */
export function nextWarningAnnouncement(
  previousSignature: string | null,
  warnings: readonly PresentedWarning[],
): { changed: boolean; signature: string; announcement: string } {
  const signature = graphWarningSetSignature(warnings);
  if (previousSignature === signature) {
    return { changed: false, signature, announcement: "" };
  }
  if (warnings.length > 0) {
    return { changed: true, signature, announcement: summarizeGraphWarningsForAnnouncement(warnings) };
  }
  const hadWarnings = Boolean(previousSignature);
  return {
    changed: true,
    signature,
    announcement: hadWarnings ? GRAPH_WARNINGS_CLEARED_ANNOUNCEMENT : "",
  };
}
