/**
 * Stage 3.5.3.2 — criticality, bottleneck and single-point-of-failure analysis.
 *
 * All three are structural: they are computed from real dependency edges only,
 * with no weighting heuristics beyond the documented composite score.
 */

import type { GraphNode } from "../types";
import type { GraphQueryEngine } from "../query/index";
import type {
  BottleneckRecord,
  CriticalNodeRecord,
  CriticalityOptions,
  ReasoningResult,
  SinglePointOfFailureRecord,
} from "./ReasoningTypes";
import { buildReasoningResult, evidence, finding, nowMs, perf, recommendation } from "./ReasoningResults";
import { createReasoningContext, moduleOf, scaleScore, type ReasoningContext } from "./ReasoningContext";

const applies = (node: GraphNode, options: CriticalityOptions): boolean => {
  if (options.nodeTypes && !options.nodeTypes.includes(node.type)) return false;
  if (options.moduleId && node.moduleId !== options.moduleId) return false;
  return true;
};

/** Reach counted over dependency edges only, cycle-safe, depth-bounded. */
function reach(ctx: ReasoningContext, startId: string, direction: "out" | "in", maxDepth: number): number {
  const adjacency = direction === "out" ? ctx.dependencyOut : ctx.dependencyIn;
  const seen = new Set<string>([startId]);
  let frontier = [startId];
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth += 1) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const edge of adjacency.get(id) ?? []) {
        const nextId = direction === "out" ? edge.to : edge.from;
        if (seen.has(nextId)) continue;
        seen.add(nextId);
        next.push(nextId);
      }
    }
    frontier = next.sort();
  }
  return seen.size - 1;
}

/**
 * Composite criticality score, 0–100:
 *   40% dependent count, 30% downstream reach, 20% distinct dependent modules,
 *   10% brokerage (min of fan-in and fan-out). Each component is scaled against
 *   the graph maximum, so the ranking is relative and deterministic.
 */
export function analyzeCriticalNodes(
  engine: GraphQueryEngine,
  options: CriticalityOptions = {},
): ReasoningResult<CriticalNodeRecord> {
  const startedAt = nowMs();
  const includeCandidates = options.includeCandidateRelationships === true;
  const ctx = createReasoningContext(engine, includeCandidates);
  const maxDepth = options.maxDepth ?? 6;

  interface Raw {
    node: GraphNode;
    dependents: number;
    dependencies: number;
    downstreamReach: number;
    upstreamReach: number;
    modules: Set<string>;
    soleProvider: boolean;
  }

  const raws: Raw[] = [];
  for (const node of engine.source.nodes) {
    if (!applies(node, options)) continue;
    const incoming = ctx.dependencyIn.get(node.id) ?? [];
    const outgoing = ctx.dependencyOut.get(node.id) ?? [];
    if (incoming.length === 0 && outgoing.length === 0) continue;

    const modules = new Set<string>();
    for (const edge of incoming) {
      const dependent = engine.getNode(edge.from);
      if (dependent) modules.add(moduleOf(dependent));
    }
    const soleProvider = incoming.some((edge) => (ctx.dependencyOut.get(edge.from) ?? []).length === 1);

    raws.push({
      node,
      dependents: incoming.length,
      dependencies: outgoing.length,
      downstreamReach: reach(ctx, node.id, "in", maxDepth),
      upstreamReach: reach(ctx, node.id, "out", maxDepth),
      modules,
      soleProvider,
    });
  }

  const max = (pick: (r: Raw) => number): number => raws.reduce((m, r) => Math.max(m, pick(r)), 0);
  const maxDependents = max((r) => r.dependents);
  const maxReach = max((r) => r.downstreamReach);
  const maxModules = max((r) => r.modules.size);
  const maxBrokerage = max((r) => Math.min(r.dependents, r.dependencies));

  const minScore = options.minScore ?? 1;
  const records: CriticalNodeRecord[] = raws
    .map((raw) => {
      const brokerage = Math.min(raw.dependents, raw.dependencies);
      const score = Math.round(
        0.4 * scaleScore(raw.dependents, maxDependents) +
          0.3 * scaleScore(raw.downstreamReach, maxReach) +
          0.2 * scaleScore(raw.modules.size, maxModules) +
          0.1 * scaleScore(brokerage, maxBrokerage),
      );
      const basis = [
        `dependents=${raw.dependents}`,
        `downstreamReach=${raw.downstreamReach}`,
        `dependentModules=${raw.modules.size}`,
        `brokerage=${brokerage}`,
      ];
      if (raw.soleProvider) basis.push("soleProvider");
      return {
        node: raw.node,
        score,
        dependentCount: raw.dependents,
        dependencyCount: raw.dependencies,
        downstreamReach: raw.downstreamReach,
        upstreamReach: raw.upstreamReach,
        distinctDependentModules: raw.modules.size,
        soleProvider: raw.soleProvider,
        basis,
      };
    })
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score || a.node.id.localeCompare(b.node.id));

  const page = options.limit === undefined ? records : records.slice(0, options.limit);

  const findings = page.slice(0, 5).map((record) =>
    finding(
      "critical-nodes",
      record.score >= 60 ? "critical" : record.score >= 30 ? "warning" : "advisory",
      record.node.id,
      `${record.node.label} scores ${record.score}/100 for criticality (${record.dependentCount} direct dependents across ${record.distinctDependentModules} module(s)).`,
      [
        evidence("degree", record.node.id, record.basis.join(", "), record.node.confidence),
        evidence(
          "aggregate",
          record.node.id,
          `Downstream reach within depth ${maxDepth}: ${record.downstreamReach} node(s).`,
          record.node.confidence,
        ),
      ],
    ),
  );

  const recommendations = page
    .filter((r) => r.score >= 60)
    .map((r) =>
      recommendation(
        "critical-nodes",
        "P1",
        r.node.id,
        "Add change-control and regression coverage",
        `${r.node.label} is a top-ranked structural dependency for ${r.dependentCount} nodes; changes need explicit approval and contract tests.`,
        [r.node.id],
        r.node.confidence,
      ),
    );

  return buildReasoningResult<CriticalNodeRecord>({
    analysis: "critical-nodes",
    subject: options.moduleId ?? null,
    results: page,
    findings,
    recommendations,
    candidateRelationshipsIncluded: includeCandidates,
    performance: perf(startedAt, ["nodeById", "outgoing", "incoming"], raws.length, ctx.edgeById.size),
    graph: engine.graphMetadata,
  });
}

/** Nodes that mediate flow: substantial fan-in *and* fan-out on dependency edges. */
export function analyzeBottlenecks(
  engine: GraphQueryEngine,
  options: CriticalityOptions = {},
): ReasoningResult<BottleneckRecord> {
  const startedAt = nowMs();
  const includeCandidates = options.includeCandidateRelationships === true;
  const ctx = createReasoningContext(engine, includeCandidates);

  const records: BottleneckRecord[] = [];
  for (const node of engine.source.nodes) {
    if (!applies(node, options)) continue;
    const fanIn = (ctx.dependencyIn.get(node.id) ?? []).length;
    const fanOut = (ctx.dependencyOut.get(node.id) ?? []).length;
    const brokerage = Math.min(fanIn, fanOut);
    if (brokerage < 2) continue; // a broker must mediate at least two in and two out

    const modules = new Set<string>();
    for (const edge of ctx.dependencyIn.get(node.id) ?? []) {
      const other = engine.getNode(edge.from);
      if (other) modules.add(moduleOf(other));
    }
    for (const edge of ctx.dependencyOut.get(node.id) ?? []) {
      const other = engine.getNode(edge.to);
      if (other) modules.add(moduleOf(other));
    }

    records.push({
      node,
      fanIn,
      fanOut,
      brokerageScore: brokerage,
      mediatedModuleCount: modules.size,
      basis: [`fanIn=${fanIn}`, `fanOut=${fanOut}`, `mediatedModules=${modules.size}`],
    });
  }

  records.sort(
    (a, b) =>
      b.brokerageScore - a.brokerageScore ||
      b.mediatedModuleCount - a.mediatedModuleCount ||
      a.node.id.localeCompare(b.node.id),
  );
  const page = options.limit === undefined ? records : records.slice(0, options.limit);

  const findings = page.slice(0, 5).map((record) =>
    finding(
      "bottlenecks",
      record.mediatedModuleCount > 2 ? "warning" : "advisory",
      record.node.id,
      `${record.node.label} mediates ${record.brokerageScore} dependency flow(s) between ${record.mediatedModuleCount} module(s).`,
      [evidence("degree", record.node.id, record.basis.join(", "), record.node.confidence)],
    ),
  );

  return buildReasoningResult<BottleneckRecord>({
    analysis: "bottlenecks",
    subject: options.moduleId ?? null,
    results: page,
    findings,
    candidateRelationshipsIncluded: includeCandidates,
    performance: perf(startedAt, ["outgoing", "incoming"], engine.source.nodes.length, ctx.edgeById.size),
    graph: engine.graphMetadata,
  });
}

/**
 * A single point of failure is a node that is the *only* dependency provider for
 * at least one other node: removing it strands those dependents entirely.
 */
export function analyzeSinglePointsOfFailure(
  engine: GraphQueryEngine,
  options: CriticalityOptions = {},
): ReasoningResult<SinglePointOfFailureRecord> {
  const startedAt = nowMs();
  const includeCandidates = options.includeCandidateRelationships === true;
  const ctx = createReasoningContext(engine, includeCandidates);

  const records: SinglePointOfFailureRecord[] = [];
  for (const node of engine.source.nodes) {
    if (!applies(node, options)) continue;
    const dependents = ctx.dependencyIn.get(node.id) ?? [];
    if (dependents.length === 0) continue;

    const stranded: string[] = [];
    const modules = new Set<string>();
    for (const edge of dependents) {
      const suppliers = new Set((ctx.dependencyOut.get(edge.from) ?? []).map((e) => e.to));
      if (suppliers.size !== 1) continue; // the dependent has an alternative supply
      stranded.push(edge.from);
      const dependent = engine.getNode(edge.from);
      if (dependent) modules.add(moduleOf(dependent));
    }
    if (stranded.length === 0) continue;

    const siblings = new Set<string>();
    for (const edge of dependents) {
      for (const alt of ctx.dependencyIn.get(edge.from) ?? []) siblings.add(alt.from);
    }

    records.push({
      node,
      strandedNodeIds: [...new Set(stranded)].sort(),
      strandedCount: new Set(stranded).size,
      affectedModules: [...modules].sort(),
      noRedundantProvider: true,
    });
  }

  records.sort(
    (a, b) =>
      b.strandedCount - a.strandedCount ||
      b.affectedModules.length - a.affectedModules.length ||
      a.node.id.localeCompare(b.node.id),
  );
  const page = options.limit === undefined ? records : records.slice(0, options.limit);

  const findings = page.slice(0, 10).map((record) =>
    finding(
      "single-points-of-failure",
      record.strandedCount >= 3 ? "critical" : "warning",
      record.node.id,
      `${record.node.label} is the sole dependency provider for ${record.strandedCount} node(s).`,
      [
        evidence(
          "absence",
          record.node.id,
          `No alternative provider exists for: ${record.strandedNodeIds.slice(0, 10).join(", ")}.`,
          record.node.confidence,
          { nodeIds: record.strandedNodeIds },
        ),
      ],
    ),
  );

  const recommendations = page
    .filter((r) => r.strandedCount >= 3)
    .map((r) =>
      recommendation(
        "single-points-of-failure",
        "P1",
        r.node.id,
        "Introduce redundancy or an explicit resilience decision",
        `${r.strandedCount} node(s) have no supply path if ${r.node.label} is unavailable.`,
        [r.node.id, ...r.strandedNodeIds],
        r.node.confidence,
      ),
    );

  return buildReasoningResult<SinglePointOfFailureRecord>({
    analysis: "single-points-of-failure",
    subject: options.moduleId ?? null,
    results: page,
    findings,
    recommendations,
    candidateRelationshipsIncluded: includeCandidates,
    performance: perf(startedAt, ["incoming", "outgoing"], engine.source.nodes.length, ctx.edgeById.size),
    graph: engine.graphMetadata,
  });
}
