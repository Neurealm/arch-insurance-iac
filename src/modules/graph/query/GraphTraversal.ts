/**
 * Stage 3.5.3.1 — cycle-safe traversal engine.
 *
 * BFS and DFS over the authoritative graph, with deterministic neighbour
 * ordering, depth limits, edge/node type filtering and optional path capture.
 * Candidate (weakly-inferred) relationships are excluded unless explicitly
 * requested, and are always labelled when included.
 */

import type { GraphEdge, GraphEdgeType, GraphNode } from "../types";
import type { GraphIndexes } from "./GraphIndexes";
import type {
  GraphPath,
  TraversalDirection,
  TraversalHitRecord,
  TraversalQueryOptions,
} from "./QueryTypes";
import { DEFAULT_MAX_DEPTH, MAX_TRAVERSAL_DEPTH } from "./QueryTypes";

export interface TraversalRun {
  hits: readonly TraversalHitRecord[];
  visitedNodeCount: number;
  scannedEdgeCount: number;
  reachedDepth: number;
  edgeTypesTraversed: readonly GraphEdgeType[];
  depthLimitReached: boolean;
}

interface Step {
  edge: GraphEdge;
  nextId: string;
}

/** Deterministic neighbour ordering: edge type, then target id, then edge id. */
const orderSteps = (steps: Step[]): Step[] =>
  [...steps].sort(
    (a, b) =>
      a.edge.type.localeCompare(b.edge.type) ||
      a.nextId.localeCompare(b.nextId) ||
      a.edge.id.localeCompare(b.edge.id),
  );

function stepsFrom(
  indexes: GraphIndexes,
  nodeId: string,
  direction: TraversalDirection,
  edgeTypes: ReadonlySet<GraphEdgeType> | null,
  excluded: ReadonlySet<GraphEdgeType>,
  includeCandidates: boolean,
): Step[] {
  const steps: Step[] = [];
  const collect = (edges: readonly GraphEdge[], forward: boolean) => {
    for (const edge of edges) {
      if (edgeTypes && !edgeTypes.has(edge.type)) continue;
      if (excluded.has(edge.type)) continue;
      steps.push({ edge, nextId: forward ? edge.to : edge.from });
    }
  };
  if (direction !== "in") {
    collect(indexes.outgoing.get(nodeId) ?? [], true);
    if (includeCandidates) collect(indexes.candidateOutgoing.get(nodeId) ?? [], true);
  }
  if (direction !== "out") {
    collect(indexes.incoming.get(nodeId) ?? [], false);
    if (includeCandidates) collect(indexes.candidateIncoming.get(nodeId) ?? [], false);
  }
  return orderSteps(steps);
}

export function resolveMaxDepth(requested?: number): number {
  if (requested === undefined) return DEFAULT_MAX_DEPTH;
  return Math.min(requested, MAX_TRAVERSAL_DEPTH);
}

/**
 * Traverses from `startId`. Every node is visited at most once (cycle-safe);
 * BFS therefore yields shortest-hop depths.
 */
export function traverse(
  indexes: GraphIndexes,
  startId: string,
  options: TraversalQueryOptions = {},
): TraversalRun {
  const start = indexes.nodeById.get(startId);
  if (!start) {
    return {
      hits: [],
      visitedNodeCount: 0,
      scannedEdgeCount: 0,
      reachedDepth: 0,
      edgeTypesTraversed: [],
      depthLimitReached: false,
    };
  }

  const direction = options.direction ?? "out";
  const strategy = options.strategy ?? "bfs";
  const maxDepth = resolveMaxDepth(options.maxDepth);
  const edgeTypes = options.edgeTypes?.length ? new Set(options.edgeTypes) : null;
  const excluded = new Set(options.excludeEdgeTypes ?? []);
  const nodeTypes = options.nodeTypes?.length ? new Set(options.nodeTypes) : null;
  const includeCandidates = options.includeCandidateRelationships === true;
  const wantPaths = options.includePaths !== false;

  const hits: TraversalHitRecord[] = [];
  const visited = new Set<string>([startId]);
  const usedEdgeTypes = new Set<GraphEdgeType>();
  let scannedEdgeCount = 0;
  let reachedDepth = 0;
  let depthLimitReached = false;

  const emit = (node: GraphNode, depth: number, path: GraphPath, viaEdgeType: GraphEdgeType | null) => {
    if (nodeTypes && !nodeTypes.has(node.type)) return;
    hits.push({ node, depth, viaEdgeType, ...(wantPaths ? { path } : {}) });
  };

  const startPath: GraphPath = { nodeIds: [startId], edgeIds: [], length: 0 };
  if (options.includeStart) emit(start, 0, startPath, null);

  if (strategy === "bfs") {
    let frontier: { node: GraphNode; depth: number; path: GraphPath }[] = [
      { node: start, depth: 0, path: startPath },
    ];
    while (frontier.length > 0) {
      const next: { node: GraphNode; depth: number; path: GraphPath }[] = [];
      for (const current of frontier) {
        if (current.depth >= maxDepth) {
          depthLimitReached = true;
          continue;
        }
        for (const step of stepsFrom(indexes, current.node.id, direction, edgeTypes, excluded, includeCandidates)) {
          scannedEdgeCount += 1;
          if (visited.has(step.nextId)) continue;
          const node = indexes.nodeById.get(step.nextId);
          if (!node) continue;
          visited.add(step.nextId);
          usedEdgeTypes.add(step.edge.type);
          const depth = current.depth + 1;
          reachedDepth = Math.max(reachedDepth, depth);
          const path: GraphPath = {
            nodeIds: [...current.path.nodeIds, node.id],
            edgeIds: [...current.path.edgeIds, step.edge.id],
            length: depth,
          };
          emit(node, depth, path, step.edge.type);
          next.push({ node, depth, path });
        }
      }
      frontier = next;
    }
  } else {
    const stack: { node: GraphNode; depth: number; path: GraphPath }[] = [
      { node: start, depth: 0, path: startPath },
    ];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current.depth >= maxDepth) {
        depthLimitReached = true;
        continue;
      }
      const steps = stepsFrom(indexes, current.node.id, direction, edgeTypes, excluded, includeCandidates);
      /* Reversed so the deterministic first neighbour is expanded first. */
      for (let i = steps.length - 1; i >= 0; i -= 1) {
        const step = steps[i];
        scannedEdgeCount += 1;
        if (visited.has(step.nextId)) continue;
        const node = indexes.nodeById.get(step.nextId);
        if (!node) continue;
        visited.add(step.nextId);
        usedEdgeTypes.add(step.edge.type);
        const depth = current.depth + 1;
        reachedDepth = Math.max(reachedDepth, depth);
        const path: GraphPath = {
          nodeIds: [...current.path.nodeIds, node.id],
          edgeIds: [...current.path.edgeIds, step.edge.id],
          length: depth,
        };
        emit(node, depth, path, step.edge.type);
        stack.push({ node, depth, path });
      }
    }
  }

  return {
    hits,
    visitedNodeCount: visited.size,
    scannedEdgeCount,
    reachedDepth,
    edgeTypesTraversed: [...usedEdgeTypes].sort(),
    depthLimitReached,
  };
}

/** Shortest path by hop count, or null when unreachable. */
export function shortestPath(
  indexes: GraphIndexes,
  fromId: string,
  toId: string,
  options: TraversalQueryOptions = {},
): { path: GraphPath | null; run: TraversalRun } {
  if (fromId === toId) {
    const empty: GraphPath = { nodeIds: [fromId], edgeIds: [], length: 0 };
    return {
      path: indexes.nodeById.has(fromId) ? empty : null,
      run: {
        hits: [],
        visitedNodeCount: 1,
        scannedEdgeCount: 0,
        reachedDepth: 0,
        edgeTypesTraversed: [],
        depthLimitReached: false,
      },
    };
  }
  const run = traverse(indexes, fromId, { ...options, strategy: "bfs", includePaths: true, nodeTypes: undefined });
  const hit = run.hits.find((h) => h.node.id === toId);
  return { path: hit?.path ?? null, run };
}

/** All simple paths up to `maxDepth`, capped by `maxPaths`. */
export function allPaths(
  indexes: GraphIndexes,
  fromId: string,
  toId: string,
  options: TraversalQueryOptions & { maxPaths?: number } = {},
): { paths: readonly GraphPath[]; scannedEdgeCount: number; capped: boolean } {
  const maxPaths = options.maxPaths ?? 25;
  const maxDepth = resolveMaxDepth(options.maxDepth);
  const direction = options.direction ?? "out";
  const edgeTypes = options.edgeTypes?.length ? new Set(options.edgeTypes) : null;
  const excluded = new Set(options.excludeEdgeTypes ?? []);
  const includeCandidates = options.includeCandidateRelationships === true;

  const paths: GraphPath[] = [];
  let scannedEdgeCount = 0;
  let capped = false;
  if (!indexes.nodeById.has(fromId) || !indexes.nodeById.has(toId)) {
    return { paths, scannedEdgeCount, capped };
  }

  const walk = (nodeId: string, nodeIds: string[], edgeIds: string[], onPath: Set<string>) => {
    if (paths.length >= maxPaths) {
      capped = true;
      return;
    }
    if (nodeIds.length - 1 >= maxDepth) return;
    for (const step of stepsFrom(indexes, nodeId, direction, edgeTypes, excluded, includeCandidates)) {
      scannedEdgeCount += 1;
      if (onPath.has(step.nextId)) continue; // simple paths only: cycle-safe
      if (step.nextId === toId) {
        if (paths.length >= maxPaths) {
          capped = true;
          return;
        }
        paths.push({
          nodeIds: [...nodeIds, toId],
          edgeIds: [...edgeIds, step.edge.id],
          length: edgeIds.length + 1,
        });
        continue;
      }
      onPath.add(step.nextId);
      walk(step.nextId, [...nodeIds, step.nextId], [...edgeIds, step.edge.id], onPath);
      onPath.delete(step.nextId);
    }
  };

  walk(fromId, [fromId], [], new Set([fromId]));
  paths.sort((a, b) => a.length - b.length || a.nodeIds.join(">").localeCompare(b.nodeIds.join(">")));
  return { paths, scannedEdgeCount, capped };
}
