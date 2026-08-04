/**
 * Stage 3.5.4.2 — bounded graph-view adapter.
 *
 * Turns explorer controls into a bounded, deterministic, read-only slice of the
 * canonical graph using the Stage 3.5.3.1 Query Engine traversal APIs. It never
 * mutates a node, edge, query result, reasoning result or intelligence result,
 * and never renders the full enterprise graph.
 */

import type { GraphEdgeType, GraphNode } from "@/modules/graph/types";
import type {
  GraphQueryEngine,
  LabelledEdge,
  QueryWarning,
  TraversalHitRecord,
} from "@/modules/graph/query/index";
import {
  MAX_VISIBLE_EDGES,
  MAX_VISIBLE_NODES,
  TRAVERSAL_DISCOVERY_LIMIT,
  type GraphDepth,
  type GraphDirection,
  type GraphTruncationReason,
  type GraphView,
  type GraphViewEdge,
  type GraphViewEmptyReason,
  type GraphViewNode,
  type GraphViewRequest,
  type GraphViewSide,
} from "./graphViewTypes";

interface Discovered {
  node: GraphNode;
  depth: number;
  side: GraphViewSide;
}

const normalized = (value: string): string => value.trim().toLowerCase();

/** Canonical ordering for retained nodes: nearest first, then stable keys. */
const compareDiscovered = (a: Discovered, b: Discovered): number =>
  a.depth - b.depth ||
  a.node.type.localeCompare(b.node.type) ||
  normalized(a.node.label).localeCompare(normalized(b.node.label)) ||
  a.node.id.localeCompare(b.node.id);

/**
 * Canonical ordering for retained edges. Confirmed relationships sort ahead of
 * candidates so the edge safety limit can never drop a confirmed relationship
 * in favour of a weakly-inferred one.
 */
const compareViewEdges = (a: GraphViewEdge, b: GraphViewEdge): number =>
  Number(a.candidate) - Number(b.candidate) ||
  a.edge.type.localeCompare(b.edge.type) ||
  a.edge.from.localeCompare(b.edge.from) ||
  a.edge.to.localeCompare(b.edge.to) ||
  a.id.localeCompare(b.id);

function collect(
  engine: GraphQueryEngine,
  rootId: string,
  direction: "out" | "in",
  side: GraphViewSide,
  request: GraphViewRequest,
  into: Map<string, Discovered>,
  warnings: QueryWarning[],
): void {
  const result = engine.traverseFrom(rootId, {
    direction,
    strategy: "bfs",
    maxDepth: request.depth,
    edgeTypes: request.edgeTypes,
    includeStart: false,
    includePaths: false,
    includeCandidateRelationships: request.includeCandidates,
    limit: TRAVERSAL_DISCOVERY_LIMIT,
  });
  for (const warning of result.warnings) warnings.push(warning);
  for (const hit of result.results as readonly TraversalHitRecord[]) {
    if (hit.node.id === rootId) continue;
    const existing = into.get(hit.node.id);
    // First writer wins, then nearer depth wins. `collect` is always called
    // with dependencies before dependents, so a node reachable both ways is
    // deterministically placed on the dependency side.
    if (!existing) into.set(hit.node.id, { node: hit.node, depth: hit.depth, side });
    else if (hit.depth < existing.depth) into.set(hit.node.id, { ...existing, depth: hit.depth });
  }
}

/** Deduplicated incident edges across a retained node set. */
function collectEdges(
  engine: GraphQueryEngine,
  nodeIds: ReadonlySet<string>,
  edgeTypes: readonly GraphEdgeType[],
  includeCandidates: boolean,
): GraphViewEdge[] {
  const seen = new Map<string, GraphViewEdge>();
  for (const id of nodeIds) {
    const result = engine.getEdges(id, {
      direction: "both",
      edgeTypes,
      includeCandidateRelationships: includeCandidates,
    });
    for (const edge of result.results as readonly LabelledEdge[]) {
      if (seen.has(edge.id)) continue;
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) continue;
      seen.set(edge.id, { id: edge.id, edge, candidate: edge.candidate });
    }
  }
  return [...seen.values()];
}

const emptyView = (
  request: GraphViewRequest,
  graphHash: string,
  emptyReason: GraphViewEmptyReason,
  rootNode: GraphNode | null = null,
  warnings: readonly QueryWarning[] = [],
  errorMessage: string | null = null,
): GraphView => ({
  request,
  rootId: request.rootId,
  rootNode,
  nodes: rootNode
    ? [{ id: rootNode.id, node: rootNode, depth: 0, side: "root", isRoot: true }]
    : [],
  edges: [],
  nodeTotalAvailable: rootNode ? 1 : 0,
  edgeTotalAvailable: 0,
  truncated: false,
  truncationReason: null,
  emptyReason,
  warnings,
  graphHash,
  errorMessage,
});

/**
 * Builds the bounded visible node and edge set for the current controls.
 *
 * Deterministic: identical engine state and identical controls always yield an
 * identical view, including which entities survive truncation. Runtime timing
 * is never used to decide what remains visible.
 */
export function buildGraphView(
  engine: GraphQueryEngine,
  request: GraphViewRequest,
): GraphView {
  const graphHash = engine.source.version.contentHash;

  if (!request.rootId) return emptyView(request, graphHash, "no-root");

  let rootNode: GraphNode | null;
  try {
    rootNode = engine.getNode(request.rootId);
  } catch (error) {
    return emptyView(request, graphHash, "query-failed", null, [], messageOf(error));
  }
  if (!rootNode) return emptyView(request, graphHash, "unknown-entity");

  // An empty relationship-type selection means "show nothing", never "show
  // everything". The query engine treats an empty filter list as unfiltered, so
  // this case is decided here rather than delegated.
  if (request.edgeTypes.length === 0) {
    return emptyView(request, graphHash, "no-matching-relationships", rootNode);
  }


  const warnings: QueryWarning[] = [];
  const discovered = new Map<string, Discovered>();

  try {
    if (request.direction === "dependencies" || request.direction === "both") {
      collect(engine, rootNode.id, "out", "dependency", request, discovered, warnings);
    }
    if (request.direction === "dependents" || request.direction === "both") {
      collect(engine, rootNode.id, "in", "dependent", request, discovered, warnings);
    }
  } catch (error) {
    return emptyView(request, graphHash, "query-failed", rootNode, warnings, messageOf(error));
  }

  if (discovered.size === 0) {
    return emptyView(request, graphHash, diagnoseEmpty(engine, rootNode.id), rootNode, warnings);
  }

  /* ------------------------------------------------ bounded node retention */

  const ordered = [...discovered.values()].sort(compareDiscovered);
  const nodeTotalAvailable = ordered.length + 1; // + root
  const retained = ordered.slice(0, Math.max(0, MAX_VISIBLE_NODES - 1));
  const nodesTruncated = retained.length < ordered.length;

  const viewNodes: GraphViewNode[] = [
    { id: rootNode.id, node: rootNode, depth: 0, side: "root", isRoot: true },
    ...retained.map((d) => ({
      id: d.node.id,
      node: d.node,
      depth: d.depth,
      side: d.side,
      isRoot: false,
    })),
  ];

  /* ------------------------------------------------ bounded edge retention */

  const visibleIds = new Set(viewNodes.map((n) => n.id));
  const allEdges = collectEdges(
    engine,
    visibleIds,
    request.edgeTypes,
    request.includeCandidates,
  ).sort(compareViewEdges);
  const edgeTotalAvailable = allEdges.length;
  const viewEdges = allEdges.slice(0, MAX_VISIBLE_EDGES);
  const edgesTruncated = viewEdges.length < allEdges.length;

  const truncationReason: GraphTruncationReason | null =
    nodesTruncated && edgesTruncated
      ? "both"
      : nodesTruncated
        ? "nodes"
        : edgesTruncated
          ? "edges"
          : null;

  if (nodesTruncated) {
    warnings.push({
      code: "results-truncated",
      message: `Showing ${viewNodes.length} of ${nodeTotalAvailable} entities in this neighbourhood (node limit ${MAX_VISIBLE_NODES}).`,
      subject: rootNode.id,
    });
  }
  if (edgesTruncated) {
    warnings.push({
      code: "results-truncated",
      message: `Showing ${viewEdges.length} of ${edgeTotalAvailable} relationships between visible entities (relationship limit ${MAX_VISIBLE_EDGES}).`,
      subject: rootNode.id,
    });
  }

  return {
    request,
    rootId: rootNode.id,
    rootNode,
    nodes: viewNodes,
    edges: viewEdges,
    nodeTotalAvailable,
    edgeTotalAvailable,
    truncated: truncationReason !== null,
    truncationReason,
    emptyReason: null,
    warnings,
    graphHash,
    errorMessage: null,
  };
}

/**
 * Distinguishes the reasons a root can produce nothing: a genuine orphan, a
 * filter that excludes every relationship, or confirmed-empty with candidate
 * relationships available.
 */
function diagnoseEmpty(engine: GraphQueryEngine, rootId: string): GraphViewEmptyReason {
  const allConfirmed = engine.getEdges(rootId, { direction: "both" }).resultCount;
  if (allConfirmed === 0) {
    const withCandidates = engine.getEdges(rootId, {
      direction: "both",
      includeCandidateRelationships: true,
    }).resultCount;
    return withCandidates > 0 ? "confirmed-none-candidates-exist" : "orphan-root";
  }
  return "no-matching-relationships";
}

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : "The graph query could not be completed.";

/* ------------------------------------------------------------ selection */

/** Ids directly connected to `nodeId` inside the already-visible edge set. */
export function neighborsWithinView(
  view: Pick<GraphView, "edges">,
  nodeId: string | null,
): { nodeIds: ReadonlySet<string>; edgeIds: ReadonlySet<string> } {
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();
  if (!nodeId) return { nodeIds, edgeIds };
  for (const e of view.edges) {
    if (e.edge.from === nodeId) {
      nodeIds.add(e.edge.to);
      edgeIds.add(e.id);
    } else if (e.edge.to === nodeId) {
      nodeIds.add(e.edge.from);
      edgeIds.add(e.id);
    }
  }
  return { nodeIds, edgeIds };
}
