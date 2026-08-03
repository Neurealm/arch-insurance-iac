/**
 * Stage 3.5.3.1 — deterministic graph indexes.
 *
 * Built exactly once per engine instance. Every map is insertion-ordered by the
 * graph's own node/edge order, which is itself deterministic, so index build
 * order can never change query output.
 */

import type { CapabilityGraph, GraphEdge, GraphEdgeType, GraphNode, GraphNodeType, GraphOwnership } from "../types";
import type { CandidateEdge } from "../populationTypes";
import { normalize, selectorValues, tokenize } from "./QueryFilters";

export interface GraphIndexes {
  readonly nodeById: ReadonlyMap<string, GraphNode>;
  readonly nodesByType: ReadonlyMap<GraphNodeType, readonly GraphNode[]>;
  readonly nodesByOwnership: ReadonlyMap<GraphOwnership, readonly GraphNode[]>;
  readonly nodesByModule: ReadonlyMap<string, readonly GraphNode[]>;
  readonly nodesByDomain: ReadonlyMap<string, readonly GraphNode[]>;
  readonly nodesByCategory: ReadonlyMap<string, readonly GraphNode[]>;
  readonly nodesByStatus: ReadonlyMap<string, readonly GraphNode[]>;
  readonly nodesByRoute: ReadonlyMap<string, readonly GraphNode[]>;
  readonly nodesByPersona: ReadonlyMap<string, readonly GraphNode[]>;
  readonly nodesByService: ReadonlyMap<string, readonly GraphNode[]>;

  readonly edgeById: ReadonlyMap<string, GraphEdge>;
  readonly edgesByType: ReadonlyMap<GraphEdgeType, readonly GraphEdge[]>;
  readonly outgoing: ReadonlyMap<string, readonly GraphEdge[]>;
  readonly incoming: ReadonlyMap<string, readonly GraphEdge[]>;

  readonly candidateEdgeById: ReadonlyMap<string, CandidateEdge>;
  readonly candidateOutgoing: ReadonlyMap<string, readonly GraphEdge[]>;
  readonly candidateIncoming: ReadonlyMap<string, readonly GraphEdge[]>;

  /** Normalized lexical indexes. */
  readonly byNormalizedLabel: ReadonlyMap<string, readonly GraphNode[]>;
  readonly byToken: ReadonlyMap<string, readonly GraphNode[]>;

  readonly names: readonly string[];
}

const push = <K, V>(map: Map<K, V[]>, key: K, value: V): void => {
  const bucket = map.get(key);
  if (bucket) bucket.push(value);
  else map.set(key, [value]);
};

/** Candidate edges are shaped as graph edges only for traversal; never stored in the graph. */
export const candidateAsEdge = (candidate: CandidateEdge): GraphEdge => ({
  id: candidate.id,
  type: candidate.type,
  from: candidate.from,
  to: candidate.to,
  source: "derived",
  confidence: candidate.provenance.confidence,
  evidence: [candidate.rationale],
  attributes: {
    candidate: true,
    evidenceClassification: candidate.provenance.evidenceClassification,
    validationState: candidate.provenance.validationState,
  },
});

export function buildGraphIndexes(
  graph: CapabilityGraph,
  candidateEdges: readonly CandidateEdge[],
): GraphIndexes {
  const nodeById = new Map<string, GraphNode>();
  const nodesByType = new Map<GraphNodeType, GraphNode[]>();
  const nodesByOwnership = new Map<GraphOwnership, GraphNode[]>();
  const nodesByModule = new Map<string, GraphNode[]>();
  const nodesByDomain = new Map<string, GraphNode[]>();
  const nodesByCategory = new Map<string, GraphNode[]>();
  const nodesByStatus = new Map<string, GraphNode[]>();
  const nodesByRoute = new Map<string, GraphNode[]>();
  const byNormalizedLabel = new Map<string, GraphNode[]>();
  const byToken = new Map<string, GraphNode[]>();

  for (const node of graph.nodes) {
    if (nodeById.has(node.id)) continue; // duplicate ids cannot occur; first wins deterministically
    nodeById.set(node.id, node);
    push(nodesByType, node.type, node);
    push(nodesByOwnership, node.ownership, node);
    if (node.moduleId) push(nodesByModule, normalize(node.moduleId), node);
    for (const value of selectorValues(node, "domain")) push(nodesByDomain, value, node);
    for (const value of selectorValues(node, "category")) push(nodesByCategory, value, node);
    for (const value of selectorValues(node, "status")) push(nodesByStatus, value, node);
    for (const value of selectorValues(node, "route")) push(nodesByRoute, value, node);
    push(byNormalizedLabel, normalize(node.label), node);
    const seen = new Set<string>();
    for (const token of [...tokenize(node.label), ...tokenize(node.id)]) {
      if (seen.has(token)) continue;
      seen.add(token);
      push(byToken, token, node);
    }
  }

  const edgeById = new Map<string, GraphEdge>();
  const edgesByType = new Map<GraphEdgeType, GraphEdge[]>();
  const outgoing = new Map<string, GraphEdge[]>();
  const incoming = new Map<string, GraphEdge[]>();

  for (const edge of graph.edges) {
    if (edgeById.has(edge.id)) continue;
    edgeById.set(edge.id, edge);
    push(edgesByType, edge.type, edge);
    if (nodeById.has(edge.from)) push(outgoing, edge.from, edge);
    if (nodeById.has(edge.to)) push(incoming, edge.to, edge);
  }

  const candidateEdgeById = new Map<string, CandidateEdge>();
  const candidateOutgoing = new Map<string, GraphEdge[]>();
  const candidateIncoming = new Map<string, GraphEdge[]>();
  for (const candidate of candidateEdges) {
    if (candidateEdgeById.has(candidate.id)) continue;
    candidateEdgeById.set(candidate.id, candidate);
    const edge = candidateAsEdge(candidate);
    if (nodeById.has(edge.from)) push(candidateOutgoing, edge.from, edge);
    if (nodeById.has(edge.to)) push(candidateIncoming, edge.to, edge);
  }

  /* Relational indexes: persona and service association are edge-backed, not
     attribute-backed, because the schema models them as nodes. */
  const nodesByPersona = new Map<string, GraphNode[]>();
  const nodesByService = new Map<string, GraphNode[]>();
  const relate = (
    target: Map<string, GraphNode[]>,
    anchorType: GraphNodeType,
  ): void => {
    for (const anchor of nodesByType.get(anchorType) ?? []) {
      const keys = new Set([normalize(anchor.label), normalize(anchor.id.split(":").slice(1).join(":"))]);
      const related = [
        ...(outgoing.get(anchor.id) ?? []).map((e) => nodeById.get(e.to)),
        ...(incoming.get(anchor.id) ?? []).map((e) => nodeById.get(e.from)),
      ].filter((n): n is GraphNode => Boolean(n));
      for (const key of keys) {
        if (!key) continue;
        for (const node of related) push(target, key, node);
      }
    }
  };
  relate(nodesByPersona, "persona");
  relate(nodesByService, "service");

  return {
    nodeById,
    nodesByType,
    nodesByOwnership,
    nodesByModule,
    nodesByDomain,
    nodesByCategory,
    nodesByStatus,
    nodesByRoute,
    nodesByPersona,
    nodesByService,
    edgeById,
    edgesByType,
    outgoing,
    incoming,
    candidateEdgeById,
    candidateOutgoing,
    candidateIncoming,
    byNormalizedLabel,
    byToken,
    names: [
      "nodeById",
      "nodesByType",
      "nodesByOwnership",
      "nodesByModule",
      "nodesByDomain",
      "nodesByCategory",
      "nodesByStatus",
      "nodesByRoute",
      "nodesByPersona",
      "nodesByService",
      "edgeById",
      "edgesByType",
      "outgoing",
      "incoming",
      "candidateEdges",
      "byNormalizedLabel",
      "byToken",
    ],
  };
}
