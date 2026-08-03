/**
 * Stage 3.5.3.2 — impact and dependency-chain analysis.
 *
 * Built directly on the Stage 3.5.3.1 traversal API. Downstream impact answers
 * "what breaks if this changes"; upstream impact answers "what must be correct
 * for this to work". Dependency chains expose the full supply path to every
 * terminal dependency.
 */

import type { GraphEdgeType } from "../types";
import type { GraphQueryEngine, TraversalHitRecord, TraversalQueryOptions } from "../query/index";
import type {
  BlastRadius,
  DependencyChainRecord,
  ImpactOptions,
  ImpactedNodeRecord,
  ReasoningResult,
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
import { createReasoningContext, moduleOf, pathConfidence } from "./ReasoningContext";

export interface ImpactAnalysisResult extends ReasoningResult<ImpactedNodeRecord> {
  blastRadius: BlastRadius;
}

const EMPTY_RADIUS = (nodeId: string): BlastRadius => ({
  nodeId,
  totalImpacted: 0,
  directImpacted: 0,
  maxDepth: 0,
  byNodeType: {},
  byModule: {},
  impactedModuleCount: 0,
});

const traversalOptions = (options: ImpactOptions): TraversalQueryOptions => ({
  ...(options.maxDepth !== undefined ? { maxDepth: options.maxDepth } : {}),
  ...(options.limit !== undefined ? { limit: options.limit } : {}),
  ...(options.nodeTypes ? { nodeTypes: options.nodeTypes } : {}),
  ...(options.edgeTypes ? { edgeTypes: options.edgeTypes } : {}),
  includePaths: options.includePaths !== false,
  includeCandidateRelationships: options.includeCandidateRelationships === true,
});

/** Upstream, downstream or bidirectional impact with derived blast radius. */
export function analyzeImpact(
  engine: GraphQueryEngine,
  nodeId: string,
  options: ImpactOptions = {},
): ImpactAnalysisResult {
  const startedAt = nowMs();
  const meta = engine.graphMetadata;
  const includeCandidates = options.includeCandidateRelationships === true;

  if (!engine.hasNode(nodeId)) {
    return {
      ...reasoningFailure<ImpactedNodeRecord>(
        "impact",
        nodeId,
        [{ code: "unknown-node", message: `Node "${nodeId}" is not in the graph.`, subject: nodeId }],
        perf(startedAt, ["nodeById"]),
        meta,
      ),
      blastRadius: EMPTY_RADIUS(nodeId),
    };
  }

  const ctx = createReasoningContext(engine, includeCandidates);
  const direction = options.direction ?? "downstream";
  const opts = traversalOptions(options);

  const collect = (
    hits: readonly TraversalHitRecord[],
    dir: "downstream" | "upstream",
  ): ImpactedNodeRecord[] =>
    hits.map((hit) => {
      const { confidence, candidate } = pathConfidence(ctx, hit.path);
      return {
        node: hit.node,
        depth: hit.depth,
        direction: dir,
        viaEdgeType: hit.viaEdgeType,
        ...(hit.path ? { path: hit.path } : {}),
        confidence,
        candidate,
      };
    });

  const records: ImpactedNodeRecord[] = [];
  let scannedEdges = 0;
  if (direction === "downstream" || direction === "both") {
    const run = engine.getDownstreamImpact(nodeId, opts);
    scannedEdges += run.performance.scannedEdgeCount;
    records.push(...collect(run.results, "downstream"));
  }
  if (direction === "upstream" || direction === "both") {
    const run = engine.getUpstreamImpact(nodeId, opts);
    scannedEdges += run.performance.scannedEdgeCount;
    records.push(...collect(run.results, "upstream"));
  }

  records.sort(
    (a, b) =>
      a.direction.localeCompare(b.direction) ||
      a.depth - b.depth ||
      a.node.type.localeCompare(b.node.type) ||
      a.node.id.localeCompare(b.node.id),
  );

  const byNodeType: Record<string, number> = {};
  const byModule: Record<string, number> = {};
  let maxDepth = 0;
  let direct = 0;
  for (const record of records) {
    byNodeType[record.node.type] = (byNodeType[record.node.type] ?? 0) + 1;
    const mod = moduleOf(record.node);
    byModule[mod] = (byModule[mod] ?? 0) + 1;
    maxDepth = Math.max(maxDepth, record.depth);
    if (record.depth === 1) direct += 1;
  }

  const blastRadius: BlastRadius = {
    nodeId,
    totalImpacted: records.length,
    directImpacted: direct,
    maxDepth,
    byNodeType,
    byModule,
    impactedModuleCount: Object.keys(byModule).length,
  };

  const subject = engine.getNode(nodeId);
  const label = subject?.label ?? nodeId;
  const confidence = weakestConfidence(records.map((r) => r.confidence));

  const findings = [
    finding(
      "impact",
      records.length === 0 ? "info" : blastRadius.impactedModuleCount > 1 ? "warning" : "advisory",
      nodeId,
      `${label} has ${records.length} impacted node(s) across ${blastRadius.impactedModuleCount} module(s), to depth ${maxDepth}.`,
      [
        evidence("aggregate", nodeId, `Direct impact: ${direct} node(s).`, confidence, {
          nodeIds: records.filter((r) => r.depth === 1).map((r) => r.node.id),
        }),
        evidence(
          "aggregate",
          nodeId,
          `Impacted modules: ${Object.keys(byModule).sort().join(", ") || "none"}.`,
          confidence,
        ),
      ],
    ),
  ];

  const recommendations =
    blastRadius.impactedModuleCount > 1
      ? [
          recommendation(
            "impact",
            blastRadius.impactedModuleCount > 3 ? "P1" : "P2",
            nodeId,
            "Coordinate change across owning modules",
            `A change to ${label} propagates into ${blastRadius.impactedModuleCount} modules; require cross-module review before altering its contract.`,
            Object.keys(byModule).sort(),
            confidence,
          ),
        ]
      : [];

  return {
    ...buildReasoningResult<ImpactedNodeRecord>({
      analysis: "impact",
      subject: nodeId,
      results: records,
      findings,
      recommendations,
      candidateRelationshipsIncluded: includeCandidates,
      confidence: records.length === 0 ? "high" : confidence,
      performance: perf(startedAt, ["outgoing", "incoming", "nodeById"], records.length, scannedEdges),
      graph: meta,
    }),
    blastRadius,
  };
}

/**
 * Every dependency chain from the subject to a terminal dependency (a node with
 * no further outgoing dependency edges within the traversal frontier).
 */
export function analyzeDependencyChains(
  engine: GraphQueryEngine,
  nodeId: string,
  options: ImpactOptions = {},
): ReasoningResult<DependencyChainRecord> {
  const startedAt = nowMs();
  const meta = engine.graphMetadata;
  const includeCandidates = options.includeCandidateRelationships === true;

  if (!engine.hasNode(nodeId)) {
    return reasoningFailure<DependencyChainRecord>(
      "dependency-chain",
      nodeId,
      [{ code: "unknown-node", message: `Node "${nodeId}" is not in the graph.`, subject: nodeId }],
      perf(startedAt, ["nodeById"]),
      meta,
    );
  }

  const ctx = createReasoningContext(engine, includeCandidates);
  const subject = engine.getNode(nodeId);
  const subjectModule = subject ? moduleOf(subject) : "(unowned)";

  const run = engine.getDependencies(nodeId, {
    ...traversalOptions(options),
    includePaths: true,
  });

  const hitById = new Map(run.results.map((hit) => [hit.node.id, hit]));
  const chains: DependencyChainRecord[] = [];

  for (const hit of run.results) {
    if (!hit.path) continue;
    const outgoing = ctx.dependencyOut.get(hit.node.id) ?? [];
    const continues = outgoing.some((edge) => hitById.has(edge.to));
    if (continues) continue; // not terminal: a longer chain covers it

    const { confidence, candidate } = pathConfidence(ctx, hit.path);
    const edgeTypes = hit.path.edgeIds
      .map((id) => ctx.edgeById.get(id)?.type)
      .filter((t): t is GraphEdgeType => Boolean(t));
    const crosses = hit.path.nodeIds.some((id) => {
      const node = engine.getNode(id);
      return node ? moduleOf(node) !== subjectModule : false;
    });

    chains.push({
      path: hit.path,
      terminalNodeId: hit.node.id,
      terminalNodeType: hit.node.type,
      edgeTypes,
      crossesModuleBoundary: crosses,
      confidence,
      candidate,
    });
  }

  chains.sort(
    (a, b) =>
      b.path.length - a.path.length ||
      a.terminalNodeType.localeCompare(b.terminalNodeType) ||
      a.terminalNodeId.localeCompare(b.terminalNodeId),
  );

  const deepest = chains[0];
  const crossing = chains.filter((c) => c.crossesModuleBoundary);
  const findings = deepest
    ? [
        finding(
          "dependency-chain",
          crossing.length > 0 ? "advisory" : "info",
          nodeId,
          `${chains.length} terminal dependency chain(s); longest is ${deepest.path.length} hop(s) ending at ${deepest.terminalNodeId}.`,
          [
            evidence("path", nodeId, "Longest dependency chain.", deepest.confidence, {
              path: deepest.path,
              nodeIds: deepest.path.nodeIds,
              edgeIds: deepest.path.edgeIds,
              candidate: deepest.candidate,
            }),
            evidence(
              "aggregate",
              nodeId,
              `${crossing.length} chain(s) leave the owning module (${subjectModule}).`,
              deepest.confidence,
            ),
          ],
        ),
      ]
    : [];

  return buildReasoningResult<DependencyChainRecord>({
    analysis: "dependency-chain",
    subject: nodeId,
    results: chains,
    findings,
    candidateRelationshipsIncluded: includeCandidates,
    performance: perf(
      startedAt,
      ["outgoing", "nodeById"],
      run.performance.scannedNodeCount,
      run.performance.scannedEdgeCount,
    ),
    graph: meta,
  });
}
