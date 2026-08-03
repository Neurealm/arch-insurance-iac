/**
 * Stage 3.5.3.3 — deterministic, structured intelligence summaries.
 *
 * Summaries are metric tables plus template-generated statements. No free-form
 * prose is produced anywhere in this layer.
 */

import type {
  CoverageGapRecord,
  OwnershipRecord,
  ReasoningResult,
  SinglePointOfFailureRecord,
  TraceabilityRecord,
  CircularDependencyRecord,
} from "../reasoning/index";
import type {
  IntelligenceRecommendation,
  IntelligenceStatistics,
  IntelligenceSummary,
  PriorityBand,
  RecommendationCategory,
  RecommendationSeverity,
  RecommendationStatus,
} from "./IntelligenceTypes";
import {
  PRIORITY_BANDS,
  RECOMMENDATION_CATEGORIES,
  uniqueSorted,
} from "./IntelligenceTypes";

export interface SummaryInput {
  recommendations: readonly IntelligenceRecommendation[];
  findingCount: number;
  ownership: ReasoningResult<OwnershipRecord>;
  coverage: ReasoningResult<CoverageGapRecord>;
  spof: ReasoningResult<SinglePointOfFailureRecord>;
  cycles: ReasoningResult<CircularDependencyRecord>;
  traceability: ReasoningResult<TraceabilityRecord>;
}

const rate = (numerator: number, denominator: number): number =>
  denominator === 0 ? 100 : Math.round((numerator / denominator) * 1000) / 10;

const countBy = <K extends string>(
  keys: readonly K[],
  items: readonly IntelligenceRecommendation[],
  select: (item: IntelligenceRecommendation) => K,
): Readonly<Record<K, number>> => {
  const result = Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
  for (const item of items) result[select(item)] += 1;
  return result;
};

const SEVERITIES: readonly RecommendationSeverity[] = ["critical", "warning", "advisory", "info"];
const STATUSES: readonly RecommendationStatus[] = [
  "open",
  "expected-by-design",
  "informational",
  "consolidated",
];

export function buildStatistics(input: SummaryInput): IntelligenceStatistics {
  const recs = input.recommendations;
  const ownershipResolved = input.ownership.results.filter(
    (r) => r.resolution === "declared" || r.resolution === "propagated",
  ).length;
  const tracedComplete = input.traceability.results.filter((r) => r.complete).length;
  const expectedGaps = input.coverage.results.filter((g) => g.expected).length;

  return {
    totalFindings: input.findingCount,
    totalRecommendations: recs.length,
    recommendationsByCategory: countBy<RecommendationCategory>(
      RECOMMENDATION_CATEGORIES,
      recs,
      (r) => r.category,
    ),
    recommendationsByPriority: countBy<PriorityBand>(PRIORITY_BANDS, recs, (r) => r.priority),
    recommendationsBySeverity: countBy<RecommendationSeverity>(SEVERITIES, recs, (r) => r.severity),
    recommendationsByStatus: countBy<RecommendationStatus>(STATUSES, recs, (r) => r.status),
    affectedRouteCount: uniqueSorted(recs.flatMap((r) => r.affected.routeIds)).length,
    affectedModuleCount: uniqueSorted(recs.flatMap((r) => r.affected.moduleIds)).length,
    affectedCapabilityCount: uniqueSorted(recs.flatMap((r) => r.affected.capabilityIds)).length,
    affectedNodeCount: uniqueSorted(recs.flatMap((r) => r.affected.nodeIds)).length,
    ownershipResolutionRate: rate(ownershipResolved, input.ownership.results.length),
    routeTraceabilityRate: rate(tracedComplete, input.traceability.results.length),
    singlePointOfFailureCount: input.spof.results.length,
    cycleCount: input.cycles.results.length,
    coverageGapCount: input.coverage.results.length,
    expectedByDesignExclusionCount: expectedGaps,
    candidateInfluencedRecommendationCount: recs.filter((r) => r.candidateInvolved).length,
  };
}

const topIds = (
  recs: readonly IntelligenceRecommendation[],
  predicate: (r: IntelligenceRecommendation) => boolean,
  limit = 5,
): readonly string[] => recs.filter(predicate).slice(0, limit).map((r) => r.id);

export function buildSummaries(
  input: SummaryInput,
  statistics: IntelligenceStatistics,
): readonly IntelligenceSummary[] {
  const recs = input.recommendations;
  const byCategory = (category: RecommendationCategory) => (r: IntelligenceRecommendation) =>
    r.category === category;

  const summaries: IntelligenceSummary[] = [
    {
      key: "executive",
      title: "Executive summary",
      metrics: [
        { key: "findings", label: "Reasoning findings", value: statistics.totalFindings, unit: "count" },
        { key: "recommendations", label: "Recommendations", value: statistics.totalRecommendations, unit: "count" },
        { key: "critical", label: "Critical priority", value: statistics.recommendationsByPriority.critical, unit: "count" },
        { key: "high", label: "High priority", value: statistics.recommendationsByPriority.high, unit: "count" },
        { key: "ownership-rate", label: "Ownership resolution rate", value: statistics.ownershipResolutionRate, unit: "percent" },
        { key: "traceability-rate", label: "Route traceability rate", value: statistics.routeTraceabilityRate, unit: "percent" },
      ],
      highlights: [
        `${statistics.totalRecommendations} recommendation(s) derived from ${statistics.totalFindings} reasoning finding(s).`,
        `${statistics.recommendationsByPriority.critical} critical and ${statistics.recommendationsByPriority.high} high-priority item(s) require attention.`,
        `${statistics.expectedByDesignExclusionCount} coverage gap(s) are accepted as expected by design.`,
      ],
      topRecommendationIds: recs.slice(0, 5).map((r) => r.id),
    },
    {
      key: "architecture",
      title: "Architecture summary",
      metrics: [
        { key: "architecture-recs", label: "Architecture recommendations", value: statistics.recommendationsByCategory.architecture, unit: "count" },
        { key: "cycles", label: "Dependency cycles", value: statistics.cycleCount, unit: "count" },
        { key: "affected-capabilities", label: "Affected capabilities", value: statistics.affectedCapabilityCount, unit: "count" },
      ],
      highlights: [
        `${statistics.cycleCount} dependency cycle(s) detected.`,
        `${statistics.recommendationsByCategory.architecture} architecture recommendation(s) raised.`,
      ],
      topRecommendationIds: topIds(recs, byCategory("architecture")),
    },
    {
      key: "engineering",
      title: "Engineering summary",
      metrics: [
        { key: "affected-nodes", label: "Affected nodes", value: statistics.affectedNodeCount, unit: "count" },
        { key: "affected-modules", label: "Affected modules", value: statistics.affectedModuleCount, unit: "count" },
        { key: "open", label: "Open recommendations", value: statistics.recommendationsByStatus.open, unit: "count" },
      ],
      highlights: [
        `${statistics.recommendationsByStatus.open} open recommendation(s) across ${statistics.affectedModuleCount} module(s).`,
        `${statistics.affectedNodeCount} graph node(s) are referenced by at least one recommendation.`,
      ],
      topRecommendationIds: topIds(recs, (r) => r.status === "open"),
    },
    {
      key: "governance",
      title: "Governance and ownership summary",
      metrics: [
        { key: "ownership-recs", label: "Ownership recommendations", value: statistics.recommendationsByCategory.ownership, unit: "count" },
        { key: "governance-recs", label: "Governance recommendations", value: statistics.recommendationsByCategory.governance, unit: "count" },
        { key: "ownership-rate", label: "Ownership resolution rate", value: statistics.ownershipResolutionRate, unit: "percent" },
        { key: "candidate-influenced", label: "Candidate-influenced recommendations", value: statistics.candidateInfluencedRecommendationCount, unit: "count" },
      ],
      highlights: [
        `Ownership resolves for ${statistics.ownershipResolutionRate}% of analysed nodes.`,
        `${statistics.candidateInfluencedRecommendationCount} recommendation(s) rest partly on weakly-inferred relationships and carry a confidence penalty.`,
      ],
      topRecommendationIds: topIds(recs, (r) => r.category === "ownership" || r.category === "governance"),
    },
    {
      key: "registration-coverage",
      title: "Registration coverage summary",
      metrics: [
        { key: "registration-recs", label: "Registration recommendations", value: statistics.recommendationsByCategory.registration, unit: "count" },
        { key: "coverage-gaps", label: "Coverage gaps", value: statistics.coverageGapCount, unit: "count" },
        { key: "expected", label: "Expected-by-design exclusions", value: statistics.expectedByDesignExclusionCount, unit: "count" },
      ],
      highlights: [
        `${statistics.coverageGapCount} coverage gap(s) observed, ${statistics.expectedByDesignExclusionCount} of which are expected by design.`,
      ],
      topRecommendationIds: topIds(recs, byCategory("registration")),
    },
    {
      key: "resilience",
      title: "Resilience summary",
      metrics: [
        { key: "spof", label: "Single points of failure", value: statistics.singlePointOfFailureCount, unit: "count" },
        { key: "resilience-recs", label: "Resilience recommendations", value: statistics.recommendationsByCategory.resilience, unit: "count" },
        { key: "cycles", label: "Dependency cycles", value: statistics.cycleCount, unit: "count" },
      ],
      highlights: [
        `${statistics.singlePointOfFailureCount} single point(s) of failure identified.`,
        `${statistics.cycleCount} dependency cycle(s) present.`,
      ],
      topRecommendationIds: topIds(recs, byCategory("resilience")),
    },
    {
      key: "route-traceability",
      title: "Route traceability summary",
      metrics: [
        { key: "traceability-rate", label: "Route traceability rate", value: statistics.routeTraceabilityRate, unit: "percent" },
        { key: "affected-routes", label: "Affected routes", value: statistics.affectedRouteCount, unit: "count" },
        { key: "traceability-recs", label: "Traceability recommendations", value: statistics.recommendationsByCategory.traceability, unit: "count" },
      ],
      highlights: [
        `${statistics.routeTraceabilityRate}% of analysed routes trace through to a capability and owning module.`,
        `${statistics.affectedRouteCount} route(s) appear in at least one recommendation.`,
      ],
      topRecommendationIds: topIds(recs, byCategory("traceability")),
    },
  ];

  return summaries;
}
