import { it } from "vitest";
import { getIntelligenceEngine } from "@/modules/graph";
it("real graph", () => {
  const e = getIntelligenceEngine();
  const r = e.analyzeGraph();
  console.log(JSON.stringify({
    hashBefore: r.execution.graphContentHashBefore,
    hashAfter: r.execution.graphContentHashAfter,
    preserved: r.execution.graphHashPreserved,
    findings: r.findings.length,
    recs: r.recommendations.length,
    byPriority: r.statistics.recommendationsByPriority,
    byCategory: r.statistics.recommendationsByCategory,
    byStatus: r.statistics.recommendationsByStatus,
    ownershipRate: r.statistics.ownershipResolutionRate,
    traceRate: r.statistics.routeTraceabilityRate,
    spof: r.statistics.singlePointOfFailureCount,
    cycles: r.statistics.cycleCount,
    gaps: r.statistics.coverageGapCount,
    expected: r.statistics.expectedByDesignExclusionCount,
    noRecPolicies: r.diagnostics.policiesWithoutRecommendations,
    top: r.recommendations.slice(0, 12).map(x => [x.id, x.priority, x.priorityScore, x.category]),
  }, null, 1));
}, 120000);
