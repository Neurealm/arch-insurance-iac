/**
 * Stage 3.5.3.4 — metric extraction, comparison, recommendation resolution and
 * regression detection.
 *
 * Every metric is computed by running the existing query, reasoning and
 * intelligence engines over a graph (canonical or overlay). Nothing here
 * reimplements traversal or reasoning.
 */

import type { CapabilityGraph } from "../types";
import { GraphQueryEngine } from "../query/index";
import { GraphReasoningEngine, weakestConfidence, type ReasoningEvidence } from "../reasoning/index";
import {
  GraphIntelligenceEngine,
  PRIORITY_BANDS,
  RECOMMENDATION_CATEGORIES,
  type IntelligenceRecommendation,
  type IntelligenceResult,
  type PriorityBand,
  type RecommendationCategory,
} from "../intelligence/index";
import {
  round2,
  simSlug,
  sortedUnique,
  type MetricDelta,
  type RecommendationResolution,
  type RegressionFinding,
  type RegressionKind,
  type ResidualRisk,
  type SimulationMetrics,
} from "./SimulationTypes";

export interface AnalysisSnapshot {
  metrics: SimulationMetrics;
  intelligence: IntelligenceResult;
  findingIds: readonly string[];
  /** Subjects of every reasoning finding, used for condition-level resolution. */
  findingSubjects: ReadonlySet<string>;
  nodeIds: readonly string[];
  edgeIds: readonly string[];
  contentHash: string;
}

export interface SnapshotOptions {
  includeCandidateRelationships?: boolean;
  lineageSampleLimit?: number;
}

const zeroByCategory = (): Record<RecommendationCategory, number> =>
  Object.fromEntries(RECOMMENDATION_CATEGORIES.map((c) => [c, 0])) as Record<
    RecommendationCategory,
    number
  >;

const zeroByPriority = (): Record<PriorityBand, number> =>
  Object.fromEntries(PRIORITY_BANDS.map((p) => [p, 0])) as Record<PriorityBand, number>;

/** Runs query → reasoning → intelligence over a graph and captures all metrics. */
export function analyzeGraphSnapshot(
  graph: CapabilityGraph,
  options: SnapshotOptions = {},
): AnalysisSnapshot {
  const query = new GraphQueryEngine({ graph });
  const reasoning = new GraphReasoningEngine({ queryEngine: query });
  const intelligence = new GraphIntelligenceEngine({ reasoningEngine: reasoning });

  const base = { includeCandidateRelationships: options.includeCandidateRelationships === true };
  const ownership = reasoning.ownershipPropagation(base);
  const coverage = reasoning.coverageGaps(base);
  const spof = reasoning.singlePointsOfFailure(base);
  const bottlenecks = reasoning.bottlenecks(base);
  const cycles = reasoning.circularDependencies(base);
  const traceability = reasoning.routeTraceability(base);

  const result = intelligence.analyzeGraph({
    includeCandidateRelationships: options.includeCandidateRelationships === true,
    ...(options.lineageSampleLimit !== undefined
      ? { lineageSampleLimit: options.lineageSampleLimit }
      : {}),
  });

  const ownershipRecords = ownership.results;
  const declared = ownershipRecords.filter((r) => r.resolution === "declared").length;
  const propagated = ownershipRecords.filter((r) => r.resolution === "propagated").length;
  const conflicting = ownershipRecords.filter((r) => r.resolution === "conflicting").length;
  const unresolved = ownershipRecords.filter((r) => r.resolution === "unresolved").length;
  const totalOwnership = ownershipRecords.length;

  const traceable = traceability.results.filter((r) => r.complete).length;
  const missingLayers = traceability.results.reduce((sum, r) => sum + r.layersMissing.length, 0);

  const connected = new Set<string>();
  for (const edge of graph.edges) {
    connected.add(edge.from);
    connected.add(edge.to);
  }
  const orphanNodeCount = graph.nodes.filter((n) => !connected.has(n.id)).length;

  const byCategory = zeroByCategory();
  const byPriority = zeroByPriority();
  let priorityTotal = 0;
  let priorityMax = 0;
  for (const rec of result.recommendations) {
    byCategory[rec.category] += 1;
    byPriority[rec.priority] += 1;
    priorityTotal += rec.priorityScore;
    priorityMax = Math.max(priorityMax, rec.priorityScore);
  }

  const metrics: SimulationMetrics = {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    ownershipResolutionRate:
      totalOwnership === 0 ? 0 : round2(((declared + propagated) / totalOwnership) * 100),
    declaredOwnershipCount: declared,
    propagatedOwnershipCount: propagated,
    conflictingOwnershipCount: conflicting,
    unresolvedOwnershipCount: unresolved,
    routeTraceabilityRate:
      traceability.results.length === 0
        ? 0
        : round2((traceable / traceability.results.length) * 100),
    fullyTraceableRouteCount: traceable,
    coverageGapCount: coverage.results.filter((g) => !g.expected).length,
    expectedByDesignGapCount: coverage.results.filter((g) => g.expected).length,
    singlePointOfFailureCount: spof.results.length,
    bottleneckCount: bottlenecks.results.length,
    dependencyCycleCount: cycles.results.length,
    missingLineageLayerCount: missingLayers,
    orphanNodeCount,
    recommendationCount: result.recommendations.length,
    recommendationsByCategory: byCategory,
    recommendationsByPriority: byPriority,
    priorityScoreTotal: round2(priorityTotal),
    priorityScoreMax: round2(priorityMax),
    priorityScoreMean:
      result.recommendations.length === 0
        ? 0
        : round2(priorityTotal / result.recommendations.length),
  };

  return {
    metrics,
    intelligence: result,
    findingIds: result.findings.map((f) => f.id).sort((a, b) => a.localeCompare(b)),
    findingSubjects: new Set(result.findings.map((f) => f.subject)),
    nodeIds: graph.nodes.map((n) => n.id).sort((a, b) => a.localeCompare(b)),
    edgeIds: graph.edges.map((e) => e.id).sort((a, b) => a.localeCompare(b)),
    contentHash: graph.version.contentHash,
  };
}

/* -------------------------------------------------------------------------- */
/* Metric comparison                                                           */
/* -------------------------------------------------------------------------- */

interface MetricSpec {
  key: keyof SimulationMetrics;
  label: string;
  higherIsBetter: boolean;
}

export const COMPARED_METRICS: readonly MetricSpec[] = [
  { key: "nodeCount", label: "Nodes", higherIsBetter: false },
  { key: "edgeCount", label: "Relationships", higherIsBetter: false },
  { key: "ownershipResolutionRate", label: "Ownership resolution rate", higherIsBetter: true },
  { key: "declaredOwnershipCount", label: "Declared ownership", higherIsBetter: true },
  { key: "propagatedOwnershipCount", label: "Propagated ownership", higherIsBetter: false },
  { key: "conflictingOwnershipCount", label: "Conflicting ownership", higherIsBetter: false },
  { key: "unresolvedOwnershipCount", label: "Unresolved ownership", higherIsBetter: false },
  { key: "routeTraceabilityRate", label: "Route traceability rate", higherIsBetter: true },
  { key: "fullyTraceableRouteCount", label: "Fully traceable routes", higherIsBetter: true },
  { key: "coverageGapCount", label: "Coverage gaps", higherIsBetter: false },
  { key: "expectedByDesignGapCount", label: "Expected-by-design gaps", higherIsBetter: true },
  { key: "singlePointOfFailureCount", label: "Single points of failure", higherIsBetter: false },
  { key: "bottleneckCount", label: "Bottlenecks", higherIsBetter: false },
  { key: "dependencyCycleCount", label: "Dependency cycles", higherIsBetter: false },
  { key: "missingLineageLayerCount", label: "Missing lineage layers", higherIsBetter: false },
  { key: "orphanNodeCount", label: "Orphan nodes", higherIsBetter: false },
  { key: "recommendationCount", label: "Recommendations", higherIsBetter: false },
  { key: "priorityScoreTotal", label: "Total priority score", higherIsBetter: false },
  { key: "priorityScoreMax", label: "Maximum priority score", higherIsBetter: false },
  { key: "priorityScoreMean", label: "Mean priority score", higherIsBetter: false },
];

export function compareMetrics(
  baseline: SimulationMetrics,
  simulated: SimulationMetrics,
): readonly MetricDelta[] {
  const deltas: MetricDelta[] = COMPARED_METRICS.map((spec) => {
    const before = baseline[spec.key] as number;
    const after = simulated[spec.key] as number;
    const delta = round2(after - before);
    const direction =
      delta === 0 ? "unchanged" : (delta > 0) === spec.higherIsBetter ? "improved" : "regressed";
    return {
      key: String(spec.key),
      label: spec.label,
      baseline: before,
      simulated: after,
      delta,
      higherIsBetter: spec.higherIsBetter,
      direction,
    };
  });

  for (const category of RECOMMENDATION_CATEGORIES) {
    const before = baseline.recommendationsByCategory[category];
    const after = simulated.recommendationsByCategory[category];
    deltas.push({
      key: `recommendations.category.${category}`,
      label: `Recommendations — ${category}`,
      baseline: before,
      simulated: after,
      delta: after - before,
      higherIsBetter: false,
      direction: after === before ? "unchanged" : after < before ? "improved" : "regressed",
    });
  }
  for (const band of PRIORITY_BANDS) {
    const before = baseline.recommendationsByPriority[band];
    const after = simulated.recommendationsByPriority[band];
    deltas.push({
      key: `recommendations.priority.${band}`,
      label: `Recommendations — ${band}`,
      baseline: before,
      simulated: after,
      delta: after - before,
      higherIsBetter: false,
      direction: after === before ? "unchanged" : after < before ? "improved" : "regressed",
    });
  }

  return deltas.sort((a, b) => a.key.localeCompare(b.key));
}

/* -------------------------------------------------------------------------- */
/* Recommendation resolution                                                   */
/* -------------------------------------------------------------------------- */

const evidenceFor = (statement: string, subject: string): ReasoningEvidence => ({
  kind: "aggregate",
  subject,
  statement,
  confidence: "high",
  candidate: false,
});

/**
 * Classifies each baseline recommendation against the simulated outputs. A
 * recommendation is only "resolved" when the *condition* is gone: the
 * disappearance of its identifier alone is never sufficient.
 */
export function classifyResolutions(
  baseline: AnalysisSnapshot,
  simulated: AnalysisSnapshot,
): readonly RecommendationResolution[] {
  const simulatedById = new Map(simulated.intelligence.recommendations.map((r) => [r.id, r]));
  const simulatedByPolicy = new Map<string, IntelligenceRecommendation[]>();
  for (const rec of simulated.intelligence.recommendations) {
    simulatedByPolicy.set(rec.policyId, [...(simulatedByPolicy.get(rec.policyId) ?? []), rec]);
  }
  const simulatedNodes = new Set(simulated.nodeIds);
  const baselineFindings = new Set(baseline.findingIds);
  const newFindingIds = simulated.findingIds.filter((id) => !baselineFindings.has(id));

  return [...baseline.intelligence.recommendations]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((rec) => {
      const after = simulatedById.get(rec.id) ?? null;
      const affected = rec.affected.nodeIds;
      const survivingSubjects = affected.filter((id) => simulated.findingSubjects.has(id));
      const stillPresentNodes = affected.filter((id) => simulatedNodes.has(id));
      const baselineFindingCount = rec.sourceFindingIds.length;
      const simulatedFindingCount = after?.sourceFindingIds.length ?? 0;
      const related = newFindingIds.filter((id) =>
        affected.some((nodeId) => id.includes(nodeId)),
      );

      let classification: RecommendationResolution["classification"];
      let explanation: string;
      const remainingWork: string[] = [];

      if (affected.length > 0 && stillPresentNodes.length === 0) {
        classification = "invalidated";
        explanation =
          "Every entity the recommendation referred to was removed from the simulated graph, so the recommendation no longer applies.";
      } else if (after === null) {
        const supersedingPolicy = (simulatedByPolicy.get(rec.policyId) ?? []).find((candidate) =>
          affected.every((id) => candidate.affected.nodeIds.includes(id)),
        );
        if (supersedingPolicy) {
          classification = "superseded";
          explanation = `The condition is now reported by "${supersedingPolicy.id}", which covers every affected entity.`;
          remainingWork.push(`Evaluate "${supersedingPolicy.id}".`);
        } else if (survivingSubjects.length === 0) {
          classification = "resolved";
          explanation =
            "The recommendation is absent and no simulated reasoning finding still names any affected entity, so the underlying condition is corrected.";
        } else {
          classification = "partially-resolved";
          explanation = `The recommendation is absent, but ${survivingSubjects.length} affected entity(ies) still appear in simulated reasoning findings.`;
          remainingWork.push(`Address ${survivingSubjects.length} remaining entity(ies).`);
        }
      } else if (after.priorityScore > rec.priorityScore) {
        classification = "regressed";
        explanation = `The recommendation persists and its priority score rose from ${rec.priorityScore} to ${after.priorityScore}.`;
        remainingWork.push("Re-plan remediation; the proposal made this condition worse.");
      } else if (after.affected.nodeIds.length < affected.length || simulatedFindingCount < baselineFindingCount) {
        classification = "partially-resolved";
        explanation = `The condition narrowed from ${affected.length} to ${after.affected.nodeIds.length} affected entity(ies).`;
        remainingWork.push(
          `Extend the remediation to the remaining ${after.affected.nodeIds.length} entity(ies).`,
        );
      } else {
        classification = "unresolved";
        explanation = "The recommendation persists unchanged in the simulated intelligence output.";
        remainingWork.push("The proposal does not address this condition.");
      }

      return {
        recommendationId: rec.id,
        policyId: rec.policyId,
        category: rec.category,
        classification,
        baselineState: {
          present: true as const,
          priority: rec.priority,
          priorityScore: rec.priorityScore,
          affectedNodeCount: affected.length,
          findingCount: baselineFindingCount,
        },
        simulatedState: {
          present: after !== null,
          priority: after?.priority ?? null,
          priorityScore: after?.priorityScore ?? null,
          affectedNodeCount: after?.affected.nodeIds.length ?? 0,
          findingCount: simulatedFindingCount,
        },
        evidence: [
          evidenceFor(
            `Baseline: ${affected.length} affected entity(ies), priority ${rec.priority} (${rec.priorityScore}).`,
            rec.id,
          ),
          evidenceFor(
            after
              ? `Simulated: ${after.affected.nodeIds.length} affected entity(ies), priority ${after.priority} (${after.priorityScore}).`
              : `Simulated: recommendation absent; ${survivingSubjects.length} affected entity(ies) still named by reasoning findings.`,
            rec.id,
          ),
        ],
        explanation,
        remainingWork,
        residualRiskIds: [],
        confidence: after ? weakestConfidence([rec.confidence, after.confidence]) : rec.confidence,
        relatedNewFindingIds: related.slice(0, 10),
      };
    });
}

/* -------------------------------------------------------------------------- */
/* Regression detection                                                        */
/* -------------------------------------------------------------------------- */

interface RegressionSpec {
  key: keyof SimulationMetrics;
  kind: RegressionKind;
  severity: RegressionFinding["severity"];
  statement: (delta: number) => string;
}

const REGRESSION_SPECS: readonly RegressionSpec[] = [
  {
    key: "dependencyCycleCount",
    kind: "new-dependency-cycle",
    severity: "critical",
    statement: (d) => `${d} new dependency cycle(s) introduced.`,
  },
  {
    key: "singlePointOfFailureCount",
    kind: "new-single-point-of-failure",
    severity: "critical",
    statement: (d) => `${d} new single point(s) of failure introduced.`,
  },
  {
    key: "conflictingOwnershipCount",
    kind: "new-ownership-conflict",
    severity: "critical",
    statement: (d) => `${d} new ownership conflict(s) introduced.`,
  },
  {
    key: "unresolvedOwnershipCount",
    kind: "increased-unresolved-ownership",
    severity: "warning",
    statement: (d) => `${d} additional node(s) lost a resolvable owner.`,
  },
  {
    key: "coverageGapCount",
    kind: "new-coverage-gap",
    severity: "warning",
    statement: (d) => `${d} new coverage gap(s) introduced.`,
  },
  {
    key: "missingLineageLayerCount",
    kind: "broken-lineage",
    severity: "warning",
    statement: (d) => `${d} additional missing lineage layer(s).`,
  },
  {
    key: "orphanNodeCount",
    kind: "orphaned-node",
    severity: "warning",
    statement: (d) => `${d} node(s) were orphaned.`,
  },
  {
    key: "bottleneckCount",
    kind: "increased-blast-radius",
    severity: "warning",
    statement: (d) => `${d} new bottleneck(s) increase the blast radius of change.`,
  },
];

export function detectRegressions(
  baseline: AnalysisSnapshot,
  simulated: AnalysisSnapshot,
  scope: string,
): readonly RegressionFinding[] {
  const findings: RegressionFinding[] = [];
  const push = (
    kind: RegressionKind,
    severity: RegressionFinding["severity"],
    subject: string,
    statement: string,
    entityIds: readonly string[],
    basis: readonly string[],
  ): void => {
    findings.push({
      id: `reg:${kind}:${simSlug(subject)}`,
      kind,
      severity,
      priority: severity === "critical" ? "critical" : severity === "warning" ? "medium" : "informational",
      scope,
      subject,
      statement,
      affectedEntityIds: sortedUnique(entityIds).slice(0, 25),
      reversible: true,
      confidence: "high",
      detectionBasis: basis,
    });
  };

  for (const spec of REGRESSION_SPECS) {
    const before = baseline.metrics[spec.key] as number;
    const after = simulated.metrics[spec.key] as number;
    if (after > before) push(spec.kind, spec.severity, spec.key, spec.statement(after - before), [], [String(spec.key)]);
  }

  if (simulated.metrics.routeTraceabilityRate < baseline.metrics.routeTraceabilityRate) {
    push(
      "reduced-traceability",
      "critical",
      "routeTraceabilityRate",
      `Route traceability fell from ${baseline.metrics.routeTraceabilityRate}% to ${simulated.metrics.routeTraceabilityRate}%.`,
      [],
      ["routeTraceabilityRate"],
    );
  }

  const baselineNodes = new Set(baseline.nodeIds);
  const removedNodes = baseline.nodeIds.filter((id) => !simulated.nodeIds.includes(id));
  const baselineEdges = new Set(baseline.edgeIds);
  const removedEdges = baseline.edgeIds.filter((id) => !simulated.edgeIds.includes(id));
  if (removedEdges.length > 0) {
    push(
      "removed-required-evidence",
      "warning",
      "removed-relationships",
      `${removedEdges.length} relationship(s) carrying graph evidence were removed.`,
      removedEdges,
      ["edgeIds"],
    );
  }
  if (removedNodes.length > 0 && baselineNodes.size > 0) {
    push(
      "invalid-route-relationship",
      "warning",
      "removed-nodes",
      `${removedNodes.length} node(s) were removed from the graph.`,
      removedNodes,
      ["nodeIds"],
    );
  }

  const baselineById = new Map(baseline.intelligence.recommendations.map((r) => [r.id, r]));
  for (const rec of [...simulated.intelligence.recommendations].sort((a, b) => a.id.localeCompare(b.id))) {
    const before = baselineById.get(rec.id);
    if (before && rec.priorityScore > before.priorityScore) {
      push(
        "higher-priority-recommendation",
        rec.priority === "critical" || rec.priority === "high" ? "critical" : "warning",
        rec.id,
        `Recommendation "${rec.id}" rose from ${before.priorityScore} to ${rec.priorityScore}.`,
        rec.affected.nodeIds,
        [rec.id],
      );
    }
    if (!before) {
      const isNew = true;
      if (isNew && (rec.priority === "critical" || rec.priority === "high")) {
        push(
          "unexpected-recommendation-growth",
          "critical",
          rec.id,
          `New ${rec.priority} recommendation "${rec.id}" appeared after simulation.`,
          rec.affected.nodeIds,
          [rec.id],
        );
      }
    }
  }
  if (simulated.metrics.recommendationCount > baseline.metrics.recommendationCount) {
    push(
      "unexpected-recommendation-growth",
      "warning",
      "recommendationCount",
      `Total recommendations grew from ${baseline.metrics.recommendationCount} to ${simulated.metrics.recommendationCount}.`,
      [],
      ["recommendationCount"],
    );
  }

  if (
    simulated.intelligence.confidence !== baseline.intelligence.confidence &&
    confidenceWorse(simulated.intelligence.confidence, baseline.intelligence.confidence)
  ) {
    push(
      "reduced-confidence",
      "warning",
      "intelligence-confidence",
      `Overall intelligence confidence fell from "${baseline.intelligence.confidence}" to "${simulated.intelligence.confidence}".`,
      [],
      ["confidence"],
    );
  }

  return findings.sort((a, b) => a.id.localeCompare(b.id));
}

const CONFIDENCE_ORDER = ["high", "medium", "low", "unable-to-verify"] as const;
const confidenceWorse = (a: string, b: string): boolean =>
  CONFIDENCE_ORDER.indexOf(a as never) > CONFIDENCE_ORDER.indexOf(b as never);

/** Residual risks are unresolved conditions plus every detected regression. */
export function buildResidualRisks(
  resolutions: readonly RecommendationResolution[],
  regressions: readonly RegressionFinding[],
): readonly ResidualRisk[] {
  const risks: ResidualRisk[] = [];
  for (const resolution of resolutions) {
    if (resolution.classification === "unresolved" || resolution.classification === "partially-resolved") {
      risks.push({
        id: `residual:${simSlug(resolution.recommendationId)}`,
        severity: resolution.classification === "unresolved" ? "warning" : "advisory",
        subject: resolution.recommendationId,
        statement: resolution.explanation,
        entityIds: [],
        confidence: resolution.confidence,
      });
    }
  }
  for (const regression of regressions) {
    risks.push({
      id: `residual:${regression.id}`,
      severity: regression.severity === "critical" ? "blocking" : "warning",
      subject: regression.subject,
      statement: regression.statement,
      entityIds: regression.affectedEntityIds,
      confidence: regression.confidence,
    });
  }
  return risks.sort((a, b) => a.id.localeCompare(b.id));
}
