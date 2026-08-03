/**
 * Stage 3.5.3.2 — capability-to-platform lineage and route traceability.
 *
 * Lineage walks the architectural layers in a fixed order and reports which
 * layers a chain reaches and which it never reaches. A missing layer is a
 * traceability gap, reported explicitly rather than being papered over.
 */

import type { GraphEdge, GraphEdgeType, GraphNode } from "../types";
import type { GraphQueryEngine, GraphPath } from "../query/index";
import type {
  LineageLayer,
  LineageRecord,
  LineageStep,
  ReasoningOptions,
  ReasoningResult,
  TraceabilityRecord,
} from "./ReasoningTypes";
import { weakestConfidence } from "./ReasoningTypes";
import {
  buildReasoningResult,
  evidence,
  finding,
  nowMs,
  perf,
  reasoningFailure,
  recommendation,
} from "./ReasoningResults";
import { createReasoningContext, layerOf, pathConfidence, type ReasoningContext } from "./ReasoningContext";

/** Layers a fully traceable capability chain is expected to reach. */
export const CAPABILITY_LINEAGE_LAYERS: readonly LineageLayer[] = [
  "capability",
  "module",
  "shared-capability",
  "platform-capability",
];

/** Layers a fully traceable route chain is expected to reach. */
export const ROUTE_TRACE_LAYERS: readonly LineageLayer[] = ["route", "page", "service", "capability", "module"];

const LINEAGE_EDGES: readonly GraphEdgeType[] = [
  "BELONGS_TO",
  "IMPLEMENTS",
  "USES",
  "CONSUMES",
  "DEPENDS_ON",
  "EXPOSES",
  "INVOKES",
  "EXTENDS",
];

/** Deterministic layered walk outward from a subject over lineage edges. */
function walkLineage(
  engine: GraphQueryEngine,
  ctx: ReasoningContext,
  startId: string,
  maxDepth: number,
  includeCandidates: boolean,
): { steps: LineageStep[]; path: GraphPath } {
  const run = engine.traverseFrom(startId, {
    direction: "both",
    strategy: "bfs",
    maxDepth,
    edgeTypes: LINEAGE_EDGES,
    includeStart: true,
    includePaths: true,
    includeCandidateRelationships: includeCandidates,
  });

  const steps: LineageStep[] = [];
  const nodeIds: string[] = [];
  const edgeIds: string[] = [];
  const seenLayers = new Set<LineageLayer>();

  for (const hit of run.results) {
    const layer = layerOf(hit.node);
    if (seenLayers.has(layer) && hit.node.id !== startId) continue; // one representative per layer
    seenLayers.add(layer);
    steps.push({
      nodeId: hit.node.id,
      nodeType: hit.node.type,
      label: hit.node.label,
      viaEdgeType: hit.viaEdgeType,
      layer,
    });
    nodeIds.push(hit.node.id);
    if (hit.path) for (const edgeId of hit.path.edgeIds) if (!edgeIds.includes(edgeId)) edgeIds.push(edgeId);
  }

  return { steps, path: { nodeIds, edgeIds, length: edgeIds.length } };
}

const buildLineageRecord = (
  ctx: ReasoningContext,
  subjectId: string,
  steps: readonly LineageStep[],
  path: GraphPath,
  expected: readonly LineageLayer[],
): LineageRecord => {
  const covered = [...new Set(steps.map((s) => s.layer))].sort();
  const missing = expected.filter((layer) => !covered.includes(layer));
  const { confidence, candidate } = pathConfidence(ctx, path);
  return {
    subjectId,
    steps,
    layersCovered: covered,
    layersMissing: missing,
    complete: missing.length === 0,
    confidence,
    candidate,
  };
};

/** Capability -> module -> shared/platform capability lineage for one node. */
export function analyzeCapabilityLineage(
  engine: GraphQueryEngine,
  nodeId: string,
  options: ReasoningOptions = {},
): ReasoningResult<LineageRecord> {
  const startedAt = nowMs();
  const meta = engine.graphMetadata;
  if (!engine.hasNode(nodeId)) {
    return reasoningFailure<LineageRecord>(
      "capability-lineage",
      nodeId,
      [{ code: "unknown-node", message: `Node "${nodeId}" is not in the graph.`, subject: nodeId }],
      perf(startedAt, ["nodeById"]),
      meta,
    );
  }

  const includeCandidates = options.includeCandidateRelationships === true;
  const ctx = createReasoningContext(engine, includeCandidates);
  const { steps, path } = walkLineage(engine, ctx, nodeId, options.maxDepth ?? 5, includeCandidates);
  const record = buildLineageRecord(ctx, nodeId, steps, path, CAPABILITY_LINEAGE_LAYERS);

  const findings = [
    finding(
      "capability-lineage",
      record.complete ? "info" : "advisory",
      nodeId,
      record.complete
        ? `Lineage is complete across ${record.layersCovered.length} layer(s).`
        : `Lineage stops short: missing ${record.layersMissing.join(", ")}.`,
      [
        evidence("path", nodeId, `Layers reached: ${record.layersCovered.join(" -> ")}.`, record.confidence, {
          path,
          nodeIds: path.nodeIds,
          edgeIds: path.edgeIds,
          candidate: record.candidate,
        }),
      ],
    ),
  ];

  const recommendations = record.complete
    ? []
    : [
        recommendation(
          "capability-lineage",
          "P2",
          nodeId,
          "Declare the missing lineage relationship",
          `No path reaches ${record.layersMissing.join(", ")}; register the owning module or platform capability relationship.`,
          [nodeId],
          record.confidence,
        ),
      ];

  return buildReasoningResult<LineageRecord>({
    analysis: "capability-lineage",
    subject: nodeId,
    results: [record],
    findings,
    recommendations,
    candidateRelationshipsIncluded: includeCandidates,
    confidence: record.confidence,
    performance: perf(startedAt, ["outgoing", "incoming", "nodeById"], steps.length, path.edgeIds.length),
    graph: meta,
  });
}

const collectByType = (engine: GraphQueryEngine, steps: readonly LineageStep[], type: string): string[] =>
  steps.filter((s) => s.nodeType === type).map((s) => s.nodeId).sort();

/** Route -> page -> service -> capability -> module traceability across all routes. */
export function analyzeRouteTraceability(
  engine: GraphQueryEngine,
  options: ReasoningOptions = {},
): ReasoningResult<TraceabilityRecord> {
  const startedAt = nowMs();
  const includeCandidates = options.includeCandidateRelationships === true;
  const ctx = createReasoningContext(engine, includeCandidates);
  const maxDepth = options.maxDepth ?? 4;

  const routes = engine.source.nodes
    .filter((n) => n.type === "route")
    .filter((n) => (options.moduleId ? n.moduleId === options.moduleId : true))
    .sort((a, b) => a.id.localeCompare(b.id));

  const limited = options.limit === undefined ? routes : routes.slice(0, options.limit);

  const records: TraceabilityRecord[] = limited.map((route: GraphNode) => {
    const { steps, path } = walkLineage(engine, ctx, route.id, maxDepth, includeCandidates);
    const base = buildLineageRecord(ctx, route.id, steps, path, ROUTE_TRACE_LAYERS);
    const capabilityIds = steps
      .filter((s) => s.nodeType === "capability" || s.nodeType === "sub-capability")
      .map((s) => s.nodeId)
      .sort();
    const moduleStep = steps.find((s) => s.nodeType === "module");
    return {
      ...base,
      routeId: route.id,
      routePath: typeof route.attributes.route === "string" ? route.attributes.route : null,
      pageId: collectByType(engine, steps, "page")[0] ?? null,
      serviceIds: collectByType(engine, steps, "service"),
      capabilityIds,
      moduleId: route.moduleId ?? moduleStep?.nodeId ?? null,
    };
  });

  const incomplete = records.filter((r) => !r.complete);
  const findings = [
    finding(
      "route-traceability",
      incomplete.length === 0 ? "info" : incomplete.length > routes.length / 2 ? "warning" : "advisory",
      "route-coverage",
      `${records.length - incomplete.length} of ${records.length} route(s) trace end-to-end to an owning module.`,
      [
        evidence(
          "aggregate",
          "route-coverage",
          `Incomplete sample: ${incomplete.slice(0, 10).map((r) => r.routeId).join(", ") || "none"}.`,
          weakestConfidence(records.map((r) => r.confidence)),
          { nodeIds: incomplete.map((r) => r.routeId) },
        ),
      ],
    ),
  ];

  const recommendations =
    incomplete.length === 0
      ? []
      : [
          recommendation(
            "route-traceability",
            "P2",
            "route-coverage",
            "Complete route to capability traceability",
            `${incomplete.length} route(s) cannot be traced to a capability and owning module; register them in the owning module manifest.`,
            incomplete.map((r) => r.routeId),
            weakestConfidence(incomplete.map((r) => r.confidence)),
          ),
        ];

  return buildReasoningResult<TraceabilityRecord>({
    analysis: "route-traceability",
    subject: options.moduleId ?? null,
    results: records,
    findings,
    recommendations,
    candidateRelationshipsIncluded: includeCandidates,
    performance: perf(startedAt, ["nodesByType", "outgoing", "incoming"], routes.length, ctx.edgeById.size),
    graph: engine.graphMetadata,
  });
}

/** Unused import guard: keeps the edge type contract explicit for readers. */
export type LineageEdge = GraphEdge;
