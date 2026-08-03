/**
 * Stage 3.5.3.2 — shared read-only accessors over the query engine.
 *
 * Nothing here re-implements traversal or indexing: it derives small,
 * deterministic facts (confidence of a path, candidate participation, module
 * attribution) that several analyses need.
 */

import type { GraphEdge, GraphEdgeType, GraphNode } from "../types";
import type { GraphQueryEngine, GraphPath } from "../query/index";
import { DEPENDENCY_EDGE_TYPES } from "../query/index";
import type { LineageLayer, ReasoningConfidence } from "./ReasoningTypes";
import { downgradeConfidence, weakestConfidence } from "./ReasoningTypes";

export interface ReasoningContext {
  readonly engine: GraphQueryEngine;
  readonly candidateEdgeIds: ReadonlySet<string>;
  readonly edgeById: ReadonlyMap<string, GraphEdge>;
  readonly dependencyOut: ReadonlyMap<string, readonly GraphEdge[]>;
  readonly dependencyIn: ReadonlyMap<string, readonly GraphEdge[]>;
}

const pushEdge = (map: Map<string, GraphEdge[]>, key: string, edge: GraphEdge): void => {
  const bucket = map.get(key);
  if (bucket) bucket.push(edge);
  else map.set(key, [edge]);
};

const DEPENDENCY_SET = new Set<GraphEdgeType>(DEPENDENCY_EDGE_TYPES);

/** Builds the per-analysis context. Cheap: one linear pass over the edges. */
export function createReasoningContext(
  engine: GraphQueryEngine,
  includeCandidateRelationships = false,
): ReasoningContext {
  const candidateEdges = engine.candidateEdgesAsEdges();
  const candidateEdgeIds = new Set(candidateEdges.map((e) => e.id));
  const edgeById = new Map<string, GraphEdge>();
  const dependencyOut = new Map<string, GraphEdge[]>();
  const dependencyIn = new Map<string, GraphEdge[]>();

  const consider = (edges: readonly GraphEdge[]) => {
    for (const edge of edges) {
      edgeById.set(edge.id, edge);
      if (!DEPENDENCY_SET.has(edge.type)) continue;
      pushEdge(dependencyOut, edge.from, edge);
      pushEdge(dependencyIn, edge.to, edge);
    }
  };

  consider(engine.source.edges);
  if (includeCandidateRelationships) consider(candidateEdges);

  return { engine, candidateEdgeIds, edgeById, dependencyOut, dependencyIn };
}

export const isCandidateEdge = (ctx: ReasoningContext, edgeId: string): boolean =>
  ctx.candidateEdgeIds.has(edgeId);

/** A path is only as trustworthy as its weakest edge, and its weakest node. */
export function pathConfidence(
  ctx: ReasoningContext,
  path: GraphPath | undefined,
): { confidence: ReasoningConfidence; candidate: boolean } {
  if (!path || path.edgeIds.length === 0) return { confidence: "high", candidate: false };
  const values: ReasoningConfidence[] = [];
  let candidate = false;
  for (const edgeId of path.edgeIds) {
    if (isCandidateEdge(ctx, edgeId)) candidate = true;
    const edge = ctx.edgeById.get(edgeId);
    values.push(edge ? edge.confidence : "unable-to-verify");
  }
  for (const nodeId of path.nodeIds) {
    const node = ctx.engine.getNode(nodeId);
    values.push(node ? node.confidence : "unable-to-verify");
  }
  const base = weakestConfidence(values);
  return { confidence: candidate ? downgradeConfidence(base) : base, candidate };
}

export const moduleOf = (node: GraphNode): string => node.moduleId ?? "(unowned)";

export const LINEAGE_LAYER_BY_NODE_TYPE: Readonly<Record<string, LineageLayer>> = {
  route: "route",
  page: "page",
  component: "component",
  service: "service",
  api: "api",
  capability: "capability",
  "sub-capability": "capability",
  module: "module",
  "shared-capability": "shared-capability",
  "platform-capability": "platform-capability",
  "database-entity": "database-entity",
};

export const layerOf = (node: GraphNode): LineageLayer =>
  LINEAGE_LAYER_BY_NODE_TYPE[node.type] ?? "other";

/** Deterministic, stable numeric ranking helper: descending score, then id. */
export const byScoreThenId = <T extends { score: number; node: { id: string } }>(a: T, b: T): number =>
  b.score - a.score || a.node.id.localeCompare(b.node.id);

/** Scales a raw value into 0–100 against a maximum, deterministically rounded. */
export const scaleScore = (value: number, max: number): number =>
  max <= 0 ? 0 : Math.round((value / max) * 100);
