/**
 * Stage 3.5.3.3 — graph intelligence and recommendation layer tests.
 *
 * Two layers: a hand-built fixture graph where every policy outcome can be
 * reasoned about by hand, and assertions against the real populated graph for
 * scale, determinism and graph-hash preservation.
 */

import { describe, expect, it } from "vitest";
import type { CapabilityGraph, GraphEdge, GraphEdgeType, GraphNode, GraphNodeType } from "../types";
import { GRAPH_SCHEMA_VERSION } from "../types";
import type { CandidateEdge } from "../populationTypes";
import { createQueryEngine } from "../query/index";
import { createReasoningEngine } from "../reasoning/index";
import {
  CANDIDATE_PENALTY,
  INTELLIGENCE_GENERATOR,
  INTELLIGENCE_POLICIES,
  PRIORITY_BANDS,
  PRIORITY_FACTORS,
  bandForScore,
  consolidateCandidates,
  createIntelligenceEngine,
  getIntelligenceEngine,
  policyById,
  scorePriority,
  slugify,
  type IntelligenceRecommendation,
} from "./index";

/* -------------------------------------------------------------------------- */
/* Fixture                                                                     */
/* -------------------------------------------------------------------------- */

const node = (
  id: string,
  type: GraphNodeType,
  moduleId: string | null,
  overrides: Partial<GraphNode> = {},
): GraphNode => ({
  id,
  type,
  label: id,
  moduleId,
  ownership: moduleId ? "module-owned" : "unassigned",
  source: "declared",
  confidence: "high",
  evidence: [`fixture:${id}`],
  attributes: {},
  ...overrides,
});

const edge = (from: string, type: GraphEdgeType, to: string, overrides: Partial<GraphEdge> = {}): GraphEdge => ({
  id: `${from}|${type}|${to}`,
  type,
  from,
  to,
  source: "declared",
  confidence: "high",
  evidence: [`fixture:${from}->${to}`],
  attributes: {},
  ...overrides,
});

const nodes: GraphNode[] = [
  node("module:alpha", "module", "alpha"),
  node("module:beta", "module", "beta"),
  node("capability:alpha.core", "capability", "alpha"),
  node("capability:beta.core", "capability", "beta"),
  node("service:shared-db", "service", "platform"),
  node("service:alpha-api", "service", "alpha"),
  node("service:beta-api", "service", "beta"),
  node("page:alpha-home", "page", "alpha"),
  node("route:/alpha", "route", "alpha", { attributes: { route: "/alpha" } }),
  node("route:/orphan", "route", null, { attributes: { route: "/orphan" } }),
  node("persona:alpha-owner", "persona", "alpha"),
  node("platform-capability:auth", "platform-capability", "platform"),
  node("component:lonely", "component", null),
  node("component:shared", "component", null),
  node("service:cycle-a", "service", "alpha"),
  node("service:cycle-b", "service", "beta"),
];

const edges: GraphEdge[] = [
  edge("capability:alpha.core", "BELONGS_TO", "module:alpha"),
  edge("capability:beta.core", "BELONGS_TO", "module:beta"),
  edge("page:alpha-home", "IMPLEMENTS", "capability:alpha.core"),
  edge("module:alpha", "EXPOSES", "route:/alpha"),
  edge("route:/alpha", "IMPLEMENTS", "capability:alpha.core"),
  edge("module:alpha", "OWNS", "persona:alpha-owner"),
  edge("service:alpha-api", "USES", "service:shared-db"),
  edge("service:beta-api", "USES", "service:shared-db"),
  edge("page:alpha-home", "USES", "service:alpha-api"),
  edge("capability:alpha.core", "USES", "service:alpha-api"),
  edge("capability:beta.core", "USES", "service:beta-api"),
  edge("module:alpha", "DEPENDS_ON", "platform-capability:auth"),
  edge("service:cycle-a", "DEPENDS_ON", "service:cycle-b"),
  edge("service:cycle-b", "DEPENDS_ON", "service:cycle-a"),
  /* Two modules claim the same component: an ownership conflict. */
  edge("component:shared", "BELONGS_TO", "module:alpha"),
  edge("component:shared", "BELONGS_TO", "module:beta"),
  /* A route with no capability of its own: a traceability gap. */
  edge("route:/orphan", "REFERENCES", "component:shared"),
];

const fixtureGraph: CapabilityGraph = {
  schemaVersion: GRAPH_SCHEMA_VERSION,
  version: {
    version: 1,
    contentHash: "fixture",
    generator: "test",
    generatedAt: "1970-01-01T00:00:00.000Z",
    previousContentHash: null,
  },
  nodes,
  edges,
};

const candidateEdges: readonly CandidateEdge[] = [
  {
    id: "capability:beta.core|USES|service:shared-db",
    from: "capability:beta.core",
    to: "service:shared-db",
    type: "USES",
    rationale: "Weak co-occurrence signal only.",
    provenance: {
      sourceType: "fixture",
      sourceId: "fixture:candidate",
      sourcePath: null,
      evidenceMethod: "co-occurrence",
      evidenceClassification: "weakly-inferred",
      evidenceStrength: null,
      validationState: "unvalidated",
      confidence: "low",
    },
  },
];

const fixtureEngine = () => {
  const queryEngine = createQueryEngine({ graph: fixtureGraph, candidateEdges });
  return createIntelligenceEngine({
    reasoningEngine: createReasoningEngine({ queryEngine }),
    queryEngine,
  });
};

const byPolicy = (recs: readonly IntelligenceRecommendation[], policyId: string) =>
  recs.filter((r) => r.policyId === policyId);

/* -------------------------------------------------------------------------- */
/* Policy registry                                                             */
/* -------------------------------------------------------------------------- */

describe("policy registry", () => {
  it("registers every required policy with a complete declared contract", () => {
    expect(INTELLIGENCE_POLICIES.length).toBeGreaterThanOrEqual(14);
    for (const policy of INTELLIGENCE_POLICIES) {
      expect(policy.id).toMatch(/^POL-[A-Z]+-\d{3}$/);
      expect(policy.trigger.length).toBeGreaterThan(0);
      expect(policy.exclusions.length).toBeGreaterThan(0);
      expect(policy.confidenceHandling.length).toBeGreaterThan(0);
      expect(policy.evidenceRequirement.length).toBeGreaterThan(0);
      expect(policy.deduplication.length).toBeGreaterThan(0);
      expect(policy.escalation.length).toBeGreaterThan(0);
      expect(policy.analyses.length).toBeGreaterThan(0);
    }
  });

  it("has unique, deterministically ordered policy ids", () => {
    const ids = INTELLIGENCE_POLICIES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort((a, b) => a.localeCompare(b))).toEqual(ids);
    expect(policyById("POL-RES-001")?.category).toBe("resilience");
    expect(policyById("POL-NOPE")).toBeUndefined();
  });
});

/* -------------------------------------------------------------------------- */
/* Prioritization                                                              */
/* -------------------------------------------------------------------------- */

describe("prioritization model", () => {
  it("publishes weights that sum to 100", () => {
    expect(PRIORITY_FACTORS.reduce((sum, f) => sum + f.weight, 0)).toBe(100);
  });

  it("explains every factor contribution", () => {
    const score = scorePriority({
      signals: { blastRadius: 50, criticality: 100 },
      severity: "critical",
      confidence: "high",
      candidateInvolved: false,
      expectedByDesign: false,
      complexity: "moderate",
    });
    expect(score.factors).toHaveLength(PRIORITY_FACTORS.length);
    for (const factor of score.factors) {
      expect(factor.explanation).toContain(String(factor.weight));
      expect(factor.contribution).toBeCloseTo(factor.normalized * factor.weight, 1);
    }
    expect(score.explanation).toContain("weighted subtotal");
  });

  it("maps scores onto the published priority bands", () => {
    expect(bandForScore(100)).toBe("critical");
    expect(bandForScore(80)).toBe("critical");
    expect(bandForScore(79)).toBe("high");
    expect(bandForScore(60)).toBe("high");
    expect(bandForScore(59)).toBe("medium");
    expect(bandForScore(40)).toBe("medium");
    expect(bandForScore(39)).toBe("low");
    expect(bandForScore(20)).toBe("low");
    expect(bandForScore(19)).toBe("informational");
    expect(bandForScore(0)).toBe("informational");
    expect(PRIORITY_BANDS).toHaveLength(5);
  });

  it("scales by confidence and penalises candidate-edge involvement", () => {
    const base = {
      signals: { blastRadius: 50, criticality: 100, ownershipRisk: 1 },
      severity: "critical" as const,
      expectedByDesign: false,
      complexity: "moderate" as const,
    };
    const high = scorePriority({ ...base, confidence: "high", candidateInvolved: false });
    const low = scorePriority({ ...base, confidence: "low", candidateInvolved: false });
    const candidate = scorePriority({ ...base, confidence: "high", candidateInvolved: true });
    expect(low.score).toBeLessThan(high.score);
    expect(low.confidenceFactor).toBe(0.7);
    expect(candidate.candidatePenalty).toBe(CANDIDATE_PENALTY);
    expect(candidate.score).toBe(high.score - CANDIDATE_PENALTY);
  });

  it("clamps expected-by-design issues into the informational band", () => {
    const score = scorePriority({
      signals: { blastRadius: 500, criticality: 100 },
      severity: "critical",
      confidence: "high",
      candidateInvolved: false,
      expectedByDesign: true,
      complexity: "trivial",
    });
    expect(score.band).toBe("informational");
    expect(score.score).toBeLessThanOrEqual(10);
    expect(score.expectedByDesignClamp).toBe(true);
    expect(score.explanation).toContain("expected by design");
  });

  it("is a pure function of its inputs", () => {
    const input = {
      signals: { blastRadius: 7, breadth: 3 },
      severity: "warning" as const,
      confidence: "medium" as const,
      candidateInvolved: false,
      expectedByDesign: false,
      complexity: "low" as const,
    };
    expect(scorePriority(input)).toEqual(scorePriority(input));
  });
});

/* -------------------------------------------------------------------------- */
/* Fixture policy outcomes                                                     */
/* -------------------------------------------------------------------------- */

describe("policy outcomes on the fixture graph", () => {
  const result = fixtureEngine().analyzeGraph();

  it("returns the standard intelligence envelope", () => {
    expect(result.success).toBe(true);
    expect(result.generator).toBe(INTELLIGENCE_GENERATOR);
    expect(result.execution.deterministic).toBe(true);
    expect(result.graph.contentHash).toBe("fixture");
    expect(result.summaries).toHaveLength(7);
    expect(result.statistics.totalRecommendations).toBe(result.recommendations.length);
  });

  it("raises a critical recommendation for conflicting ownership", () => {
    const conflict = byPolicy(result.recommendations, "POL-OWN-002");
    expect(conflict).toHaveLength(1);
    expect(conflict[0].subject).toBe("component:shared");
    expect(conflict[0].severity).toBe("critical");
    expect(conflict[0].affected.owners).toEqual(expect.arrayContaining(["alpha", "beta"]));
    expect(conflict[0].consolidation.consolidated).toBe(false);
  });

  it("raises consolidated recommendations for unresolved ownership", () => {
    const unresolved = byPolicy(result.recommendations, "POL-OWN-001");
    expect(unresolved.length).toBeGreaterThan(0);
    for (const rec of unresolved) {
      expect(rec.category).toBe("ownership");
      expect(rec.affected.nodeIds.length).toBeGreaterThan(0);
      expect(rec.remediation.validationCriteria.length).toBeGreaterThan(0);
    }
  });

  it("raises a dependency-cycle recommendation for the fixture cycle", () => {
    const cycles = byPolicy(result.recommendations, "POL-ARCH-003");
    expect(cycles).toHaveLength(1);
    expect(cycles[0].severity).toBe("critical");
    expect(cycles[0].affected.nodeIds).toEqual(
      expect.arrayContaining(["service:cycle-a", "service:cycle-b"]),
    );
    expect(cycles[0].evidence[0].path).toBeDefined();
  });

  it("raises single-point-of-failure recommendations with stranded dependants", () => {
    const spofs = byPolicy(result.recommendations, "POL-RES-001");
    expect(spofs.length).toBeGreaterThan(0);
    const shared = spofs.find((r) => r.subject === "service:shared-db");
    expect(shared).toBeDefined();
    expect(shared!.category).toBe("resilience");
    expect(shared!.evidence[0].kind).toBe("degree");
  });

  it("raises registration and traceability recommendations for the orphan route", () => {
    const registration = byPolicy(result.recommendations, "POL-REG-001");
    const traceability = byPolicy(result.recommendations, "POL-TRACE-001");
    expect(registration.length).toBeGreaterThan(0);
    expect(traceability.length).toBeGreaterThan(0);
    expect(
      traceability.some((r) => r.affected.routeIds.includes("route:/orphan")),
    ).toBe(true);
    expect(traceability[0].remediation.sequence[0].order).toBe(1);
  });

  it("records expected-by-design gaps as informational exceptions", () => {
    const expected = byPolicy(result.recommendations, "POL-REG-003");
    for (const rec of expected) {
      expect(rec.status).toBe("expected-by-design");
      expect(rec.priority).toBe("informational");
      expect(rec.priorityScore).toBeLessThanOrEqual(10);
      expect(rec.remediation.expectedGraphImprovement).toContain("accepted");
    }
    expect(expected.length).toBeGreaterThan(0);
  });

  it("raises a governance recommendation for candidate relationships and penalises its score", () => {
    const governance = byPolicy(result.recommendations, "POL-GOV-001");
    expect(governance).toHaveLength(1);
    expect(governance[0].candidateInvolved).toBe(true);
    expect(governance[0].confidence).toBe("low");
    expect(governance[0].priorityExplanation.candidatePenalty).toBe(CANDIDATE_PENALTY);
    expect(governance[0].evidence.every((e) => e.candidate)).toBe(true);
  });

  it("reports policies that produced nothing rather than hiding them", () => {
    const produced = new Set(result.recommendations.map((r) => r.policyId));
    for (const id of result.diagnostics.policiesWithoutRecommendations) {
      expect(produced.has(id)).toBe(false);
    }
    expect(
      result.diagnostics.policiesWithoutRecommendations.length + produced.size,
    ).toBe(INTELLIGENCE_POLICIES.length);
  });
});

/* -------------------------------------------------------------------------- */
/* Explainability                                                              */
/* -------------------------------------------------------------------------- */

describe("explainability", () => {
  const result = fixtureEngine().analyzeGraph();

  it("gives every recommendation supporting evidence, a policy and lineage", () => {
    expect(result.recommendations.length).toBeGreaterThan(0);
    for (const rec of result.recommendations) {
      expect(rec.evidence.length).toBeGreaterThan(0);
      expect(policyById(rec.policyId)).toBeDefined();
      expect(rec.reasoningAnalyses.length).toBeGreaterThan(0);
      expect(rec.lineage.graphContentHash).toBe("fixture");
      expect(rec.lineage.nodeIds.length).toBeGreaterThan(0);
      expect(rec.confidenceRationale).toContain(rec.confidence);
      expect(rec.priorityExplanation.explanation).toContain("weighted subtotal");
      expect(rec.consolidation.rationale.length).toBeGreaterThan(0);
      expect(rec.remediation.advisoryOnly).toBe(true);
    }
  });

  it("derives deterministic recommendation identifiers", () => {
    for (const rec of result.recommendations) {
      expect(rec.id).toBe(`rec:${rec.policyId}:${slugify(rec.consolidation.mergeKey)}`);
    }
    const ids = result.recommendations.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("orders recommendations by score, band, policy then id", () => {
    for (let i = 1; i < result.recommendations.length; i += 1) {
      const previous = result.recommendations[i - 1];
      const current = result.recommendations[i];
      expect(previous.priorityScore).toBeGreaterThanOrEqual(current.priorityScore);
      if (previous.priorityScore === current.priorityScore) {
        expect(
          previous.policyId.localeCompare(current.policyId) <= 0 ||
            previous.id.localeCompare(current.id) <= 0,
        ).toBe(true);
      }
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Consolidation                                                               */
/* -------------------------------------------------------------------------- */

describe("consolidation", () => {
  it("merges candidates that share a merge key and preserves all evidence", () => {
    const engine = fixtureEngine();
    const result = engine.analyzeGraph();
    const consolidatedRecs = result.recommendations.filter((r) => r.consolidation.consolidated);
    for (const rec of consolidatedRecs) {
      expect(rec.consolidation.mergedFindingCount).toBeGreaterThan(1);
      expect(rec.consolidation.rationale).toContain("preserved");
      expect(rec.affected.nodeIds.length).toBeGreaterThanOrEqual(rec.consolidation.mergedFindingCount);
    }
  });

  it("keeps candidates with distinct merge keys separate and records why", () => {
    const result = fixtureEngine().analyzeGraph();
    const spofs = result.recommendations.filter((r) => r.policyId === "POL-RES-001");
    const keys = new Set(spofs.map((r) => r.consolidation.mergeKey));
    expect(keys.size).toBe(spofs.length);
    for (const rec of spofs) {
      expect(rec.consolidation.consolidated).toBe(false);
    }
  });

  it("consolidateCandidates is deterministic and order-independent", () => {
    const engine = fixtureEngine();
    const a = engine.analyzeGraph().recommendations.map((r) => r.id);
    const b = engine.analyzeGraph().recommendations.map((r) => r.id);
    expect(a).toEqual(b);
    expect(consolidateCandidates([])).toEqual([]);
  });

  it("suppresses the critical-chain recommendation when a SPOF covers the same node", () => {
    const result = fixtureEngine().analyzeGraph();
    const spofSubjects = new Set(
      result.recommendations.filter((r) => r.policyId === "POL-RES-001").map((r) => r.subject),
    );
    for (const rec of result.recommendations.filter((r) => r.policyId === "POL-RES-002")) {
      expect(spofSubjects.has(rec.subject)).toBe(false);
    }
    for (const exclusion of result.diagnostics.exclusions) {
      expect(exclusion.reason.length).toBeGreaterThan(0);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Remediation                                                                 */
/* -------------------------------------------------------------------------- */

describe("remediation planning", () => {
  const result = fixtureEngine().analyzeGraph();

  it("produces an ordered, advisory-only remediation plan for every recommendation", () => {
    for (const rec of result.recommendations) {
      const plan = rec.remediation;
      expect(plan.advisoryOnly).toBe(true);
      expect(plan.sequence.length).toBeGreaterThan(0);
      expect(plan.sequence.map((s) => s.order)).toEqual(
        plan.sequence.map((_, index) => index + 1),
      );
      expect(plan.action.length).toBeGreaterThan(0);
      expect(plan.expectedGraphImprovement.length).toBeGreaterThan(0);
      expect(["trivial", "low", "moderate", "high"]).toContain(plan.complexity);
    }
  });

  it("states the expected metric impact of the change", () => {
    const ownership = result.recommendations.find((r) => r.policyId === "POL-OWN-001");
    expect(ownership?.remediation.expectedMetricImpact.ownership).toContain("Ownership");
  });
});

/* -------------------------------------------------------------------------- */
/* Scoped analysis and filtering                                               */
/* -------------------------------------------------------------------------- */

describe("scoped intelligence", () => {
  it("scopes by module", () => {
    const result = fixtureEngine().analyzeModule("alpha");
    expect(result.scope.kind).toBe("module");
    expect(result.scope.resolvedNodeIds).toContain("capability:alpha.core");
    expect(result.scope.resolvedNodeIds).not.toContain("capability:beta.core");
  });

  it("scopes by node, route, capability, platform and owner", () => {
    const engine = fixtureEngine();
    expect(engine.analyzeNode("service:shared-db").scope.resolvedNodeIds).toContain("service:shared-db");
    expect(engine.analyzeRoute("/orphan").scope.resolvedNodeIds).toContain("route:/orphan");
    expect(engine.analyzeCapability("capability:alpha.core").scope.resolvedNodeIds).toContain(
      "capability:alpha.core",
    );
    expect(engine.analyzePlatform("platform-capability:auth").scope.resolvedNodeIds).toContain(
      "platform-capability:auth",
    );
    expect(engine.analyzeOwner("beta").scope.resolvedNodeIds).toContain("capability:beta.core");
  });

  it("fails cleanly for a scope that resolves to nothing", () => {
    const result = fixtureEngine().analyzeNode("service:does-not-exist");
    expect(result.success).toBe(false);
    expect(result.recommendations).toEqual([]);
    expect(result.diagnostics.warnings.some((w) => w.code === "unknown-node")).toBe(true);
    expect(result.diagnostics.warnings.some((w) => w.code === "empty-result")).toBe(true);
  });

  it("filters recommendations by category, priority, severity and confidence", () => {
    const engine = fixtureEngine();
    const all = engine.analyzeGraph();
    const resilience = engine.analyzeGraph({ filter: { categories: ["resilience"] } });
    expect(resilience.recommendations.every((r) => r.category === "resilience")).toBe(true);
    expect(resilience.recommendations.length).toBeLessThan(all.recommendations.length);

    expect(
      engine
        .filterRecommendations(all, { severities: ["critical"] })
        .every((r) => r.severity === "critical"),
    ).toBe(true);
    expect(
      engine.filterRecommendations(all, { confidences: ["low"] }).every((r) => r.confidence === "low"),
    ).toBe(true);
    expect(
      engine.filterRecommendations(all, { minScore: 30 }).every((r) => r.priorityScore >= 30),
    ).toBe(true);
    expect(
      engine.filterRecommendations(all, { policyIds: ["POL-OWN-002"] }).every((r) => r.policyId === "POL-OWN-002"),
    ).toBe(true);
    expect(
      engine.filterRecommendations(all, { priorities: ["informational"] }).every((r) => r.priority === "informational"),
    ).toBe(true);
  });

  it("reports an empty result rather than throwing when a filter matches nothing", () => {
    const result = fixtureEngine().analyzeGraph({ filter: { policyIds: ["POL-DOES-NOT-EXIST"] } });
    expect(result.recommendations).toEqual([]);
    expect(result.statistics.totalRecommendations).toBe(0);
    expect(result.diagnostics.warnings.some((w) => w.code === "empty-result")).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Summaries                                                                   */
/* -------------------------------------------------------------------------- */

describe("summaries and statistics", () => {
  const result = fixtureEngine().analyzeGraph();

  it("produces all seven structured summaries with metrics", () => {
    expect(result.summaries.map((s) => s.key)).toEqual([
      "executive",
      "architecture",
      "engineering",
      "governance",
      "registration-coverage",
      "resilience",
      "route-traceability",
    ]);
    for (const summary of result.summaries) {
      expect(summary.metrics.length).toBeGreaterThan(0);
      expect(summary.highlights.length).toBeGreaterThan(0);
      for (const metric of summary.metrics) {
        expect(["count", "percent"]).toContain(metric.unit);
        expect(Number.isFinite(metric.value)).toBe(true);
      }
    }
  });

  it("computes ownership and traceability rates between 0 and 100", () => {
    expect(result.statistics.ownershipResolutionRate).toBeGreaterThanOrEqual(0);
    expect(result.statistics.ownershipResolutionRate).toBeLessThanOrEqual(100);
    expect(result.statistics.routeTraceabilityRate).toBeGreaterThanOrEqual(0);
    expect(result.statistics.routeTraceabilityRate).toBeLessThanOrEqual(100);
    expect(result.statistics.cycleCount).toBe(1);
  });

  it("counts recommendations consistently across every breakdown", () => {
    const total = result.statistics.totalRecommendations;
    const sum = (record: Record<string, number>) => Object.values(record).reduce((a, b) => a + b, 0);
    expect(sum(result.statistics.recommendationsByCategory)).toBe(total);
    expect(sum(result.statistics.recommendationsByPriority)).toBe(total);
    expect(sum(result.statistics.recommendationsBySeverity)).toBe(total);
    expect(sum(result.statistics.recommendationsByStatus)).toBe(total);
  });
});

/* -------------------------------------------------------------------------- */
/* Determinism, immutability and the real graph                                */
/* -------------------------------------------------------------------------- */

describe("determinism and immutability", () => {
  it("does not mutate the graph or its reasoning inputs", () => {
    const queryEngine = createQueryEngine({ graph: fixtureGraph, candidateEdges });
    const before = JSON.stringify(queryEngine.source);
    const engine = createIntelligenceEngine({ queryEngine });
    engine.analyzeGraph();
    engine.analyzeModule("alpha");
    expect(JSON.stringify(queryEngine.source)).toBe(before);
  });

  it("preserves the graph content hash across execution", () => {
    const result = fixtureEngine().analyzeGraph();
    expect(result.execution.graphContentHashBefore).toBe(result.execution.graphContentHashAfter);
    expect(result.execution.graphHashPreserved).toBe(true);
  });

  it("produces byte-identical output for repeated executions", () => {
    const engine = fixtureEngine();
    const first = engine.analyzeGraph();
    const second = engine.analyzeGraph();
    const strip = (r: typeof first) =>
      JSON.stringify({ recs: r.recommendations, stats: r.statistics, summaries: r.summaries });
    expect(strip(first)).toBe(strip(second));
  });
});

describe("real populated graph", () => {
  const engine = getIntelligenceEngine();
  const result = engine.analyzeGraph();

  it("runs at production scale and preserves the graph hash", () => {
    expect(result.success).toBe(true);
    expect(result.graph.contentHash).toBe("e889b604");
    expect(result.execution.graphHashPreserved).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.findings.length).toBeGreaterThan(0);
  });

  it("attaches evidence, lineage and a remediation plan to every recommendation", () => {
    for (const rec of result.recommendations) {
      expect(rec.evidence.length).toBeGreaterThan(0);
      expect(rec.lineage.graphContentHash).toBe(result.graph.contentHash);
      expect(rec.remediation.sequence.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic on the real graph", () => {
    const again = engine.analyzeGraph();
    expect(again.recommendations.map((r) => r.id)).toEqual(result.recommendations.map((r) => r.id));
    expect(again.recommendations.map((r) => r.priorityScore)).toEqual(
      result.recommendations.map((r) => r.priorityScore),
    );
  });

  it("supports scoped analysis over the real graph", () => {
    const scoped = engine.analyzeModule("sre");
    expect(scoped.scope.kind).toBe("module");
    expect(scoped.scope.resolvedNodeIds.length).toBeGreaterThan(0);
    expect(scoped.recommendations.length).toBeLessThanOrEqual(result.recommendations.length);
  });
});
