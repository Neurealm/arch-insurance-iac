/**
 * Stage 3.5.3.3 — the IntelligenceEngine facade.
 *
 * Executes the Stage 3.5.3.2 analyses, applies the policy set, consolidates,
 * scores and summarises. Read-only and deterministic: the graph content hash is
 * captured before and after every run and reported in the envelope.
 */

import type { GraphNode } from "../types";
import type { GraphQueryEngine, QueryWarning } from "../query/index";
import { getQueryEngine } from "../query/index";
import type {
  LineageRecord,
  ReasoningAnalysis,
  ReasoningConfidence,
  ReasoningFinding,
  ReasoningResult,
} from "../reasoning/index";
import { GraphReasoningEngine, getReasoningEngine, weakestConfidence } from "../reasoning/index";
import type {
  IntelligenceFinding,
  IntelligenceOptions,
  IntelligenceRecommendation,
  IntelligenceResult,
  IntelligenceScope,
  IntelligenceScopeKind,
  RecommendationFilter,
} from "./IntelligenceTypes";
import {
  INTELLIGENCE_GENERATOR,
  toIntelligenceFinding,
  uniqueSorted,
} from "./IntelligenceTypes";
import { INTELLIGENCE_POLICIES, type PolicyCandidate, type ReasoningBundle } from "./Policies";
import { buildRecommendations } from "./Consolidation";
import { buildStatistics, buildSummaries } from "./Summaries";

const DEFAULT_LINEAGE_SAMPLE_LIMIT = 150;

const ANALYSES: readonly ReasoningAnalysis[] = [
  "capability-lineage",
  "circular-dependencies",
  "coverage-gaps",
  "critical-nodes",
  "bottlenecks",
  "ownership-propagation",
  "route-traceability",
  "single-points-of-failure",
];

export interface IntelligenceEngineInput {
  queryEngine?: GraphQueryEngine;
  reasoningEngine?: GraphReasoningEngine;
}

export class GraphIntelligenceEngine {
  readonly generator = INTELLIGENCE_GENERATOR;
  private readonly query: GraphQueryEngine;
  private readonly reasoning: GraphReasoningEngine;

  constructor(input: IntelligenceEngineInput = {}) {
    this.reasoning =
      input.reasoningEngine ??
      (input.queryEngine
        ? new GraphReasoningEngine({ queryEngine: input.queryEngine })
        : getReasoningEngine());
    this.query = input.queryEngine ?? this.reasoning.query;
  }

  get queryEngine(): GraphQueryEngine {
    return this.query;
  }

  get reasoningEngine(): GraphReasoningEngine {
    return this.reasoning;
  }

  get graphMetadata() {
    return this.query.graphMetadata;
  }

  /* ----------------------------------------------------------- scoping */

  private scopeNodes(kind: IntelligenceScopeKind, subject: string | null): readonly string[] {
    if (kind === "graph" || subject === null) return [];
    const nodes = this.query.source.nodes;
    const include = (predicate: (node: GraphNode) => boolean): readonly string[] =>
      uniqueSorted(nodes.filter(predicate).map((n) => n.id));

    switch (kind) {
      case "node": {
        if (!this.query.hasNode(subject)) return [];
        const neighbours = this.query.getNeighbors(subject, { maxDepth: 1 }).results.map((r) => r.node.id);
        return uniqueSorted([subject, ...neighbours]);
      }
      case "route":
        return include(
          (n) =>
            n.id === subject ||
            (n.type === "route" && (n.label === subject || String(n.attributes.route ?? "") === subject)),
        );
      case "module":
        return include((n) => n.moduleId === subject || n.id === subject || (n.type === "module" && n.label === subject));
      case "capability":
        return include(
          (n) =>
            n.id === subject ||
            ((n.type === "capability" || n.type === "sub-capability" || n.type === "shared-capability") &&
              n.label === subject),
        );
      case "platform":
        return include(
          (n) => n.id === subject || (n.type === "platform-capability" && (n.label === subject || n.moduleId === subject)),
        );
      case "owner":
        return include((n) => n.moduleId === subject);
      default:
        return [];
    }
  }

  /* --------------------------------------------------------- execution */

  private runAnalyses(options: IntelligenceOptions): {
    bundle: ReasoningBundle;
    warnings: QueryWarning[];
    findings: ReasoningFinding[];
    lineageTruncated: boolean;
  } {
    const base = {
      includeCandidateRelationships: options.includeCandidateRelationships === true,
      ...(options.nodeTypes ? { nodeTypes: options.nodeTypes } : {}),
    };
    const ownership = this.reasoning.ownershipPropagation(base);
    const coverage = this.reasoning.coverageGaps(base);
    const spof = this.reasoning.singlePointsOfFailure(base);
    const critical = this.reasoning.criticalNodes(base);
    const bottlenecks = this.reasoning.bottlenecks(base);
    const cycles = this.reasoning.circularDependencies(base);
    const traceability = this.reasoning.routeTraceability(base);

    const limit = options.lineageSampleLimit ?? DEFAULT_LINEAGE_SAMPLE_LIMIT;
    const capabilities = uniqueSorted(
      this.query.source.nodes
        .filter((n) => n.type === "capability" || n.type === "sub-capability")
        .map((n) => n.id),
    );
    const sampled = capabilities.slice(0, limit);
    const lineage: ReasoningResult<LineageRecord>[] = sampled.map((id) =>
      this.reasoning.capabilityLineage(id, base),
    );

    const results: readonly ReasoningResult<unknown>[] = [
      ownership,
      coverage,
      spof,
      critical,
      bottlenecks,
      cycles,
      traceability,
      ...lineage,
    ];

    return {
      bundle: {
        ownership,
        coverage,
        spof,
        critical,
        bottlenecks,
        cycles,
        traceability,
        lineage,
        candidateEdgeCount: this.query.graphMetadata.candidateEdgeCount,
      },
      warnings: results.flatMap((r) => r.warnings).filter((w) => w.code !== "empty-result"),
      findings: results.flatMap((r) => [...r.findings]),
      lineageTruncated: capabilities.length > sampled.length,
    };
  }

  private applyFilter(
    recommendations: readonly IntelligenceRecommendation[],
    filter: RecommendationFilter | undefined,
  ): readonly IntelligenceRecommendation[] {
    if (!filter) return recommendations;
    return recommendations.filter((r) => {
      if (filter.categories && !filter.categories.includes(r.category)) return false;
      if (filter.priorities && !filter.priorities.includes(r.priority)) return false;
      if (filter.severities && !filter.severities.includes(r.severity)) return false;
      if (filter.confidences && !filter.confidences.includes(r.confidence)) return false;
      if (filter.statuses && !filter.statuses.includes(r.status)) return false;
      if (filter.policyIds && !filter.policyIds.includes(r.policyId)) return false;
      if (filter.minScore !== undefined && r.priorityScore < filter.minScore) return false;
      return true;
    });
  }

  /** Core execution path shared by every scoped entry point. */
  analyze(
    scopeKind: IntelligenceScopeKind = "graph",
    subject: string | null = null,
    options: IntelligenceOptions = {},
  ): IntelligenceResult {
    const graphContentHashBefore = this.query.graphMetadata.contentHash;
    const resolvedNodeIds = this.scopeNodes(scopeKind, subject);
    const scope: IntelligenceScope = { kind: scopeKind, subject, resolvedNodeIds };
    const scopeNodeIds = scopeKind === "graph" || subject === null ? null : new Set(resolvedNodeIds);

    const { bundle, warnings, findings, lineageTruncated } = this.runAnalyses(options);

    const policyInput = {
      engine: this.query,
      bundle,
      scopeNodeIds,
      candidateRelationshipsIncluded: options.includeCandidateRelationships === true,
    };

    const candidates: PolicyCandidate[] = [];
    const policiesWithoutRecommendations: string[] = [];
    for (const policy of INTELLIGENCE_POLICIES) {
      const produced = policy.evaluate(policyInput);
      if (produced.length === 0) policiesWithoutRecommendations.push(policy.id);
      candidates.push(...produced);
    }

    const built = buildRecommendations({
      candidates,
      policies: INTELLIGENCE_POLICIES,
      graph: this.query.graphMetadata,
    });
    const recommendations = this.applyFilter(built.recommendations, options.filter);

    const scopedFindings: readonly IntelligenceFinding[] = findings
      .map((f) =>
        toIntelligenceFinding(
          f,
          bundle.coverage.results.some((g) => g.nodeId === f.subject && g.expected),
        ),
      )
      .filter((f) => scopeNodeIds === null || scopeNodeIds.has(f.subject))
      .sort((a, b) => a.id.localeCompare(b.id));

    const summaryInput = {
      recommendations,
      findingCount: scopedFindings.length,
      ownership: bundle.ownership,
      coverage: bundle.coverage,
      spof: bundle.spof,
      cycles: bundle.cycles,
      traceability: bundle.traceability,
    };
    const statistics = buildStatistics(summaryInput);
    const summaries = buildSummaries(summaryInput, statistics);

    const graphContentHashAfter = this.query.graphMetadata.contentHash;
    const confidence: ReasoningConfidence =
      recommendations.length === 0
        ? "high"
        : weakestConfidence(recommendations.map((r) => r.confidence));

    const scopeWarnings: QueryWarning[] = [...warnings];
    if (scopeKind !== "graph" && subject !== null && resolvedNodeIds.length === 0) {
      scopeWarnings.push({
        code: "unknown-node",
        message: `Scope "${scopeKind}:${subject}" resolved to no graph nodes.`,
        subject,
      });
    }
    if (recommendations.length === 0) {
      scopeWarnings.push({
        code: "empty-result",
        message: "No recommendations were produced for the requested scope and filter.",
        ...(subject ? { subject } : {}),
      });
    }

    return {
      success: !(scopeKind !== "graph" && subject !== null && resolvedNodeIds.length === 0),
      generator: INTELLIGENCE_GENERATOR,
      scope,
      execution: {
        deterministic: true,
        generator: INTELLIGENCE_GENERATOR,
        graphContentHashBefore,
        graphContentHashAfter,
        graphHashPreserved: graphContentHashBefore === graphContentHashAfter,
        analysesExecuted: ANALYSES,
        policiesEvaluated: INTELLIGENCE_POLICIES.map((p) => p.id),
        candidateRelationshipsIncluded: options.includeCandidateRelationships === true,
      },
      graph: this.query.graphMetadata,
      findings: scopedFindings,
      recommendations,
      summaries,
      statistics,
      confidence,
      lineage: {
        graphVersion: this.query.graphMetadata.version,
        graphContentHash: graphContentHashAfter,
        nodeIds: uniqueSorted(recommendations.flatMap((r) => r.lineage.nodeIds)),
        edgeIds: uniqueSorted(recommendations.flatMap((r) => r.lineage.edgeIds)),
        layers: uniqueSorted(recommendations.flatMap((r) => r.lineage.layers)) as never,
        reasoningAnalyses: ANALYSES,
      },
      diagnostics: {
        warnings: scopeWarnings,
        policiesWithoutRecommendations,
        exclusions: built.exclusions,
        lineageSampleTruncated: lineageTruncated,
      },
    };
  }

  /* ------------------------------------------------------ entry points */

  analyzeGraph(options: IntelligenceOptions = {}): IntelligenceResult {
    return this.analyze("graph", null, options);
  }

  analyzeNode(nodeId: string, options: IntelligenceOptions = {}): IntelligenceResult {
    return this.analyze("node", nodeId, options);
  }

  analyzeRoute(route: string, options: IntelligenceOptions = {}): IntelligenceResult {
    return this.analyze("route", route, options);
  }

  analyzeModule(moduleId: string, options: IntelligenceOptions = {}): IntelligenceResult {
    return this.analyze("module", moduleId, options);
  }

  analyzeCapability(capabilityId: string, options: IntelligenceOptions = {}): IntelligenceResult {
    return this.analyze("capability", capabilityId, options);
  }

  analyzePlatform(platformId: string, options: IntelligenceOptions = {}): IntelligenceResult {
    return this.analyze("platform", platformId, options);
  }

  analyzeOwner(owner: string, options: IntelligenceOptions = {}): IntelligenceResult {
    return this.analyze("owner", owner, options);
  }

  /** Filters an existing result set without re-running any analysis. */
  filterRecommendations(
    result: IntelligenceResult,
    filter: RecommendationFilter,
  ): readonly IntelligenceRecommendation[] {
    return this.applyFilter(result.recommendations, filter);
  }
}

let cached: GraphIntelligenceEngine | null = null;

/** Process-wide intelligence engine over the populated graph. */
export const getIntelligenceEngine = (): GraphIntelligenceEngine =>
  (cached ??= new GraphIntelligenceEngine());

/** Test hook: clears the cached intelligence engine. */
export const __resetIntelligenceEngineCache = (): void => {
  cached = null;
};

export const createIntelligenceEngine = (
  input: IntelligenceEngineInput = {},
): GraphIntelligenceEngine => new GraphIntelligenceEngine(input);
