/**
 * Stage 3.5.3.2 — ownership and accountability propagation.
 *
 * Declared ownership always wins. Where ownership is absent, it is propagated
 * along ownership-bearing edges (BELONGS_TO, OWNS, IMPLEMENTS, EXPOSES) to the
 * nearest owning ancestor. Conflicting ancestors are reported, never resolved
 * by guesswork.
 */

import type { GraphEdge, GraphEdgeType, GraphNode } from "../types";
import type { GraphQueryEngine } from "../query/index";
import type { OwnershipRecord, ReasoningOptions, ReasoningResult } from "./ReasoningTypes";
import { downgradeConfidence } from "./ReasoningTypes";
import { buildReasoningResult, evidence, finding, nowMs, perf, recommendation } from "./ReasoningResults";

/** Edges along which accountability legitimately flows from target to source. */
const OWNERSHIP_UP_EDGES: readonly GraphEdgeType[] = ["BELONGS_TO", "IMPLEMENTS", "EXPOSES"];
/** Edges along which accountability flows from source to target. */
const OWNERSHIP_DOWN_EDGES: readonly GraphEdgeType[] = ["OWNS", "EXPOSES", "PROVIDES"];

const UP = new Set<GraphEdgeType>(OWNERSHIP_UP_EDGES);
const DOWN = new Set<GraphEdgeType>(OWNERSHIP_DOWN_EDGES);

const MAX_PROPAGATION_DEPTH = 8;

export function analyzeOwnershipPropagation(
  engine: GraphQueryEngine,
  options: ReasoningOptions = {},
): ReasoningResult<OwnershipRecord> {
  const startedAt = nowMs();
  const graph = engine.source;

  const up = new Map<string, GraphEdge[]>();
  const down = new Map<string, GraphEdge[]>();
  for (const edge of graph.edges) {
    if (UP.has(edge.type)) {
      const bucket = up.get(edge.from);
      if (bucket) bucket.push(edge);
      else up.set(edge.from, [edge]);
    }
    if (DOWN.has(edge.type)) {
      const bucket = down.get(edge.to);
      if (bucket) bucket.push(edge);
      else down.set(edge.to, [edge]);
    }
  }

  const ownerOf = (node: GraphNode | null): string | null =>
    node && node.moduleId && node.moduleId.length > 0 ? node.moduleId : null;

  const records: OwnershipRecord[] = [];
  const maxDepth = Math.min(options.maxDepth ?? MAX_PROPAGATION_DEPTH, MAX_PROPAGATION_DEPTH);

  for (const node of graph.nodes) {
    if (options.nodeTypes && !options.nodeTypes.includes(node.type)) continue;
    const declared = ownerOf(node);

    if (declared) {
      if (options.moduleId && declared !== options.moduleId) continue;
      records.push({
        nodeId: node.id,
        nodeType: node.type,
        label: node.label,
        declaredModuleId: declared,
        resolvedModuleId: declared,
        resolution: "declared",
        propagationPath: [],
        candidateOwners: [declared],
        confidence: node.confidence,
      });
      continue;
    }

    /* Breadth-first walk over ownership-bearing edges, nearest owner wins. */
    const seen = new Set<string>([node.id]);
    const parents = new Map<string, string>();
    let frontier = [node.id];
    const owners = new Set<string>();
    let ownerNodeId: string | null = null;

    for (let depth = 0; depth < maxDepth && frontier.length > 0 && owners.size === 0; depth += 1) {
      const next: string[] = [];
      for (const id of frontier) {
        const neighbours = [
          ...(up.get(id) ?? []).map((e) => e.to),
          ...(down.get(id) ?? []).map((e) => e.from),
        ].sort();
        for (const neighbourId of neighbours) {
          if (seen.has(neighbourId)) continue;
          seen.add(neighbourId);
          parents.set(neighbourId, id);
          const neighbour = engine.getNode(neighbourId);
          const owner = ownerOf(neighbour);
          if (owner) {
            owners.add(owner);
            if (!ownerNodeId) ownerNodeId = neighbourId;
          } else {
            next.push(neighbourId);
          }
        }
      }
      frontier = next;
    }

    const sortedOwners = [...owners].sort();
    const resolved = sortedOwners.length === 1 ? sortedOwners[0] : null;
    if (options.moduleId && resolved !== options.moduleId) continue;

    const path: string[] = [];
    let cursor = ownerNodeId;
    while (cursor && cursor !== node.id) {
      path.push(cursor);
      cursor = parents.get(cursor) ?? null;
    }

    records.push({
      nodeId: node.id,
      nodeType: node.type,
      label: node.label,
      declaredModuleId: null,
      resolvedModuleId: resolved,
      resolution:
        sortedOwners.length === 0 ? "unresolved" : sortedOwners.length === 1 ? "propagated" : "conflicting",
      propagationPath: path.reverse(),
      candidateOwners: sortedOwners,
      confidence:
        sortedOwners.length === 1 ? downgradeConfidence(node.confidence) : "unable-to-verify",
    });
  }

  records.sort(
    (a, b) =>
      a.resolution.localeCompare(b.resolution) ||
      a.nodeType.localeCompare(b.nodeType) ||
      a.nodeId.localeCompare(b.nodeId),
  );
  const page = options.limit === undefined ? records : records.slice(0, options.limit);

  const unresolved = records.filter((r) => r.resolution === "unresolved");
  const conflicting = records.filter((r) => r.resolution === "conflicting");
  const propagated = records.filter((r) => r.resolution === "propagated");

  const findings = [
    finding(
      "ownership-propagation",
      unresolved.length > 0 ? "warning" : "info",
      "accountability-coverage",
      `${records.length - unresolved.length} of ${records.length} node(s) have resolvable ownership; ${propagated.length} propagated, ${conflicting.length} conflicting, ${unresolved.length} unresolved.`,
      [
        evidence(
          "aggregate",
          "accountability-coverage",
          `Unresolved sample: ${unresolved.slice(0, 10).map((r) => r.nodeId).join(", ") || "none"}.`,
          "high",
          { nodeIds: unresolved.map((r) => r.nodeId) },
        ),
      ],
    ),
    ...conflicting.slice(0, 10).map((record) =>
      finding(
        "ownership-propagation",
        "warning",
        record.nodeId,
        `${record.label} has ${record.candidateOwners.length} competing owners: ${record.candidateOwners.join(", ")}.`,
        [
          evidence(
            "node-fact",
            record.nodeId,
            "Ownership propagation reached more than one owning module at equal distance.",
            "unable-to-verify",
          ),
        ],
      ),
    ),
  ];

  const recommendations = conflicting.slice(0, 10).map((record) =>
    recommendation(
      "ownership-propagation",
      "P2",
      record.nodeId,
      "Declare the owning module explicitly",
      `Ownership of ${record.label} is ambiguous between ${record.candidateOwners.join(" and ")}; record it in the owning module manifest.`,
      [record.nodeId],
      "unable-to-verify",
    ),
  );

  return buildReasoningResult<OwnershipRecord>({
    analysis: "ownership-propagation",
    subject: options.moduleId ?? null,
    results: page,
    findings,
    recommendations,
    performance: perf(startedAt, ["nodeById", "edgesByType"], graph.nodes.length, graph.edges.length),
    graph: engine.graphMetadata,
  });
}
