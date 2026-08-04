/**
 * Stage 3.5.4.2 — Interactive Graph Explorer: bounded view contract.
 *
 * Presentation-layer types only. The canonical graph model
 * (`@/modules/graph/types`) and the Stage 3.5.3.1 query contracts remain the
 * single source of truth; nothing here re-declares node or relationship
 * taxonomy, and nothing here mutates a graph entity.
 */

import { GRAPH_EDGE_TYPES, type GraphEdgeType, type GraphNode } from "@/modules/graph/types";
import { IMPACT_EDGE_TYPES, type LabelledEdge } from "@/modules/graph/query/index";
import type { QueryWarning } from "@/modules/graph/query/index";

/* ------------------------------------------------------------- controls */

/**
 * Traversal direction, expressed in Query Engine terms:
 * - `dependencies` — what the root relies on (outgoing, `direction: "out"`).
 * - `dependents`   — what relies on the root (incoming, `direction: "in"`).
 * - `both`         — both directions, kept visually separated.
 */
export type GraphDirection = "dependencies" | "dependents" | "both";

export const GRAPH_DIRECTIONS: readonly GraphDirection[] = ["dependencies", "dependents", "both"];

export const DIRECTION_LABELS: Readonly<Record<GraphDirection, string>> = {
  dependencies: "Dependencies",
  dependents: "Dependents",
  both: "Both directions",
};

export const DIRECTION_HELP: Readonly<Record<GraphDirection, string>> = {
  dependencies: "Entities the selected root relies on.",
  dependents: "Entities that rely on the selected root.",
  both: "Combines dependencies and dependents around the root.",
};

/** Query Engine traversal direction for a Graph Explorer direction. */
export const traversalDirectionFor = (direction: GraphDirection): "out" | "in" | "both" =>
  direction === "dependencies" ? "out" : direction === "dependents" ? "in" : "both";

/** Bounded traversal depths. Unbounded traversal is not offered. */
export const GRAPH_DEPTHS = [1, 2, 3] as const;
export type GraphDepth = (typeof GRAPH_DEPTHS)[number];

/**
 * Default depth. Depth 2 keeps the real-graph view inside the node safety
 * limit for every measured root while still showing second-order impact.
 */
export const DEFAULT_GRAPH_DEPTH: GraphDepth = 2;

/**
 * Relationship types a user may enable. This is the canonical Stage 3.5.1
 * taxonomy, re-exported in a stable order — not a second taxonomy.
 */
export const ELIGIBLE_EDGE_TYPES: readonly GraphEdgeType[] = [...GRAPH_EDGE_TYPES].sort();

/**
 * Default relationship selection: the Query Engine's own impact-bearing set
 * (`IMPACT_EDGE_TYPES`), which is exactly the confirmed relationship types
 * eligible for dependency and impact traversal. Reset returns to this set.
 */
export const DEFAULT_EDGE_TYPES: readonly GraphEdgeType[] = [...IMPACT_EDGE_TYPES].sort();

/* -------------------------------------------------------- safety limits */

/**
 * Hard ceilings on what a single canvas may render. The enterprise graph
 * (1,291 nodes / 889 edges) is never handed to React Flow: an unbounded canvas
 * is unreadable, unlayoutable in deterministic time and destroys interaction
 * performance. Local, bounded neighbourhoods are the unit of analysis.
 */
export const MAX_VISIBLE_NODES = 120;
export const MAX_VISIBLE_EDGES = 200;

/**
 * Upper bound handed to the Query Engine while discovering the neighbourhood.
 * Larger than the render limits so `totalAvailable` reporting stays honest,
 * and well inside the engine's own `MAX_TRAVERSAL_DEPTH` guards.
 */
export const TRAVERSAL_DISCOVERY_LIMIT = 2_000;

/* ------------------------------------------------------------ view model */

/** Which side of the root a visible node sits on. */
export type GraphViewSide = "root" | "dependency" | "dependent";

export interface GraphViewNode {
  /** Canonical node identifier — never rewritten. */
  id: string;
  /** The canonical node, by reference. Treated as immutable. */
  node: GraphNode;
  /** Traversal distance from the root (root is 0). */
  depth: number;
  side: GraphViewSide;
  isRoot: boolean;
}

export interface GraphViewEdge {
  /** Canonical edge identifier. */
  id: string;
  edge: LabelledEdge;
  candidate: boolean;
}

/** Why a view is empty. Distinguishing these is a product requirement. */
export type GraphViewEmptyReason =
  | "no-root"
  | "unknown-entity"
  | "orphan-root"
  | "no-matching-relationships"
  | "confirmed-none-candidates-exist"
  | "query-failed";

export type GraphTruncationReason = "nodes" | "edges" | "both";

export interface GraphViewRequest {
  rootId: string | null;
  direction: GraphDirection;
  depth: GraphDepth;
  edgeTypes: readonly GraphEdgeType[];
  includeCandidates: boolean;
}

export interface GraphView {
  request: GraphViewRequest;
  rootId: string | null;
  rootNode: GraphNode | null;
  nodes: readonly GraphViewNode[];
  edges: readonly GraphViewEdge[];
  /** Nodes discovered before the safety limit was applied (includes the root). */
  nodeTotalAvailable: number;
  /** Edges discovered between discovered nodes before the safety limit. */
  edgeTotalAvailable: number;
  truncated: boolean;
  truncationReason: GraphTruncationReason | null;
  emptyReason: GraphViewEmptyReason | null;
  warnings: readonly QueryWarning[];
  /** Canonical graph content hash the view was derived from. */
  graphHash: string;
  /** Error message when `emptyReason === "query-failed"`. */
  errorMessage: string | null;
}
