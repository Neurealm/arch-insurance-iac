/**
 * Stage 3.5.3.4 — the GraphSimulationEngine facade.
 *
 * Read-only and deterministic. The canonical graph hash is captured before and
 * after every simulation and reported in the envelope; every overlay is
 * discarded once its metrics have been read.
 */

import type { CapabilityGraph } from "../types";
import { getQueryEngine, GraphQueryEngine, type QueryWarning } from "../query/index";
import type { ReasoningEvidence } from "../reasoning/index";
import { GraphIntelligenceEngine, type IntelligenceRecommendation } from "../intelligence/index";
import {
  SIMULATION_GENERATOR,
  simSlug,
  sortedUnique,
  stableHash,
  round2,
  type AlternativeComparison,
  type AlternativeOutcome,
  type ChangeProposal,
  type IntermediateState,
  type ParameterBinding,
  type ProposalBundleResult,
  type ProposalConflict,
  type ProposalSequence,
  type ProposedChange,
  type RecommendationResolution,
  type RegressionFinding,
  type SimulationDiagnostics,
  type SimulationFilter,
  type SimulationMetrics,
  type SimulationRequest,
  type SimulationResult,
  type SimulationScope,
  type SimulationScopeKind,
  type ValidationResult,
} from "./SimulationTypes";
import { buildOverlay } from "./GraphOverlay";
import {
  bindParameters,
  generateProposals,
  generateProposalsFromRecommendations,
} from "./ProposalGeneration";
import { validateProposal } from "./ProposalValidation";
import { detectConflicts, detectOrderingConflicts } from "./ConflictDetection";
import {
  analyzeGraphSnapshot,
  buildResidualRisks,
  classifyResolutions,
  compareMetrics,
  COMPARED_METRICS,
  detectRegressions,
  type AnalysisSnapshot,
} from "./SimulationMetrics";
import { scoreProposal } from "./ProposalScoring";
import { bundleIdFor, sequenceProposals } from "./ProposalBundling";

export interface SimulationEngineInput {
  queryEngine?: GraphQueryEngine;
  intelligenceEngine?: GraphIntelligenceEngine;
  /** Deterministic cap on capability lineage sampling. */
  lineageSampleLimit?: number;
}

const emptyDiagnostics = (
  warnings: readonly QueryWarning[] = [],
  skipped: readonly string[] = [],
  unresolved: readonly { proposalId: string; parameters: readonly string[] }[] = [],
  notes: readonly string[] = [],
): SimulationDiagnostics => ({
  warnings,
  skippedProposalIds: skipped,
  unresolvedParameters: unresolved,
  notes,
  deterministic: true,
  generator: SIMULATION_GENERATOR,
});

export class GraphSimulationEngine {
  readonly generator = SIMULATION_GENERATOR;
  private readonly query: GraphQueryEngine;
  private readonly intelligence: GraphIntelligenceEngine;
  private readonly lineageSampleLimit: number | undefined;
  private baselineSnapshot: AnalysisSnapshot | null = null;

  constructor(input: SimulationEngineInput = {}) {
    this.query = input.queryEngine ?? input.intelligenceEngine?.queryEngine ?? getQueryEngine();
    this.intelligence =
      input.intelligenceEngine ?? new GraphIntelligenceEngine({ queryEngine: this.query });
    this.lineageSampleLimit = input.lineageSampleLimit;
  }

  get queryEngine(): GraphQueryEngine {
    return this.query;
  }

  get canonicalGraph(): CapabilityGraph {
    return this.query.source;
  }

  get canonicalGraphHash(): string {
    return this.query.graphMetadata.contentHash;
  }

  /** Baseline analysis of the canonical graph. Computed once and reused. */
  baseline(): AnalysisSnapshot {
    return (this.baselineSnapshot ??= analyzeGraphSnapshot(this.canonicalGraph, {
      ...(this.lineageSampleLimit !== undefined
        ? { lineageSampleLimit: this.lineageSampleLimit }
        : {}),
    }));
  }

  /* ------------------------------------------------------------ proposals */

  /** Generates proposals for a single intelligence recommendation. */
  generateProposalFromRecommendation(
    recommendation: IntelligenceRecommendation,
  ): readonly ChangeProposal[] {
    return generateProposals(this.query, recommendation);
  }

  /** Generates proposals from a whole intelligence result. */
  generateProposals(filter?: SimulationFilter): readonly ChangeProposal[] {
    const recommendations = this.filterRecommendations(
      this.baseline().intelligence.recommendations,
      filter,
    );
    return generateProposalsFromRecommendations(this.query, recommendations);
  }

  private filterRecommendations(
    recommendations: readonly IntelligenceRecommendation[],
    filter: SimulationFilter | undefined,
  ): readonly IntelligenceRecommendation[] {
    if (!filter) return recommendations;
    return recommendations.filter((r) => {
      if (filter.categories && !filter.categories.includes(r.category)) return false;
      if (filter.priorities && !filter.priorities.includes(r.priority)) return false;
      if (filter.confidences && !filter.confidences.includes(r.confidence)) return false;
      if (filter.policyIds && !filter.policyIds.includes(r.policyId)) return false;
      return true;
    });
  }

  /** Applies parameter bindings to a proposal without simulating it. */
  bind(proposal: ChangeProposal, bindings: ParameterBinding): ChangeProposal {
    return bindParameters(proposal, bindings);
  }

  /** Validates a proposal against the canonical graph. */
  validate(proposal: ChangeProposal): ValidationResult {
    return validateProposal(this.canonicalGraph, proposal);
  }

  /** Unresolved required parameters for a proposal. */
  unresolvedParameters(proposal: ChangeProposal): readonly string[] {
    return sortedUnique([
      ...proposal.parameters.filter((p) => p.required && p.defaultValue === null).map((p) => p.name),
      ...proposal.changes.flatMap((c) => c.requiredParameters),
    ]);
  }

  /** Conflicts across a proposal set, including ordering conflicts. */
  inspectConflicts(proposals: readonly ChangeProposal[]): readonly ProposalConflict[] {
    return [...detectConflicts(proposals), ...detectOrderingConflicts(proposals)].sort(
      (a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id),
    );
  }

  /* ------------------------------------------------------------- scoping */

  private resolveScope(
    kind: SimulationScopeKind = "graph",
    subject: string | null = null,
  ): SimulationScope {
    if (kind === "graph" || subject === null) {
      return { kind, subject, resolvedNodeIds: [] };
    }
    if (kind === "recommendation" || kind === "proposal" || kind === "bundle") {
      return { kind, subject, resolvedNodeIds: [] };
    }
    const nodes = this.query.source.nodes;
    const ids =
      kind === "node"
        ? nodes.filter((n) => n.id === subject).map((n) => n.id)
        : kind === "owner" || kind === "module"
          ? nodes.filter((n) => n.moduleId === subject || n.id === subject).map((n) => n.id)
          : nodes
              .filter((n) => n.id === subject || n.label === subject)
              .map((n) => n.id);
    return { kind, subject, resolvedNodeIds: sortedUnique(ids) };
  }

  /* ---------------------------------------------------------- simulation */

  /** Simulates one proposal against an isolated overlay. */
  simulateProposal(
    proposal: ChangeProposal,
    request: SimulationRequest = {},
  ): SimulationResult {
    const canonicalGraphHashBefore = this.canonicalGraphHash;
    const bindings = request.parameters?.[proposal.id];
    const bound = bindings ? bindParameters(proposal, bindings) : proposal;

    const scope: SimulationScope =
      request.scope && "resolvedNodeIds" in request.scope
        ? request.scope
        : this.resolveScope(
            request.scope?.kind ?? "proposal",
            request.scope?.subject ?? proposal.id,
          );

    const validation = validateProposal(this.canonicalGraph, bound);
    const conflicts = this.inspectConflicts([bound]);
    const baseline = this.baseline();

    const executableChanges: readonly ProposedChange[] = validation.executable
      ? bound.changes
      : [];
    const { graph: overlayGraph, construction } = buildOverlay(
      this.canonicalGraph,
      executableChanges,
    );
    const simulated: AnalysisSnapshot = validation.executable
      ? analyzeGraphSnapshot(overlayGraph, {
          ...(this.lineageSampleLimit !== undefined
            ? { lineageSampleLimit: this.lineageSampleLimit }
            : {}),
        })
      : baseline;

    const metricDeltas = compareMetrics(baseline.metrics, simulated.metrics);
    const resolutions = validation.executable ? classifyResolutions(baseline, simulated) : [];
    const relevant = resolutions.filter((r) =>
      bound.expectedImprovement.resolvesRecommendationIds.includes(r.recommendationId),
    );
    const regressions = validation.executable
      ? detectRegressions(baseline, simulated, `proposal:${bound.id}`)
      : [];
    const residualRisks = buildResidualRisks(relevant, regressions);
    const newFindings = simulated.findingIds.filter((id) => !baseline.findingIds.includes(id));

    const score = scoreProposal({
      proposal: bound,
      validation,
      conflicts,
      resolutions: relevant,
      regressions,
      deltas: metricDeltas,
    });

    const sequence: ProposalSequence = sequenceProposals([bound]);
    const canonicalGraphHashAfter = this.canonicalGraphHash;

    const evidence: readonly ReasoningEvidence[] = sortedUnique(
      bound.evidence.map((e) => `${e.kind}|${e.subject}|${e.statement}`),
    )
      .slice(0, 25)
      .map((key) => bound.evidence.find((e) => `${e.kind}|${e.subject}|${e.statement}` === key)!)
      .filter(Boolean);

    const simulationId = `sim:${canonicalGraphHashBefore}:${stableHash(
      `${bound.id}|${JSON.stringify(bindings ?? null)}|${construction.overlayContentHash}`,
    )}`;

    const warnings: QueryWarning[] = [];
    if (!validation.executable) {
      warnings.push({
        code: "empty-result",
        message: `Proposal "${bound.id}" is ${validation.outcome}; no overlay analysis was executed.`,
        subject: bound.id,
      });
    }

    return {
      success: validation.executable,
      generator: SIMULATION_GENERATOR,
      simulationId,
      proposalId: bound.id,
      graphVersion: this.query.graphMetadata.version,
      canonicalGraphHashBefore,
      canonicalGraphHashAfter,
      canonicalGraphHashPreserved: canonicalGraphHashBefore === canonicalGraphHashAfter,
      overlayContentHash: construction.overlayContentHash,
      scope,
      graph: this.query.graphMetadata,
      proposal: bound,
      proposedChanges: bound.changes,
      validation,
      conflicts,
      baselineMetrics: baseline.metrics,
      simulatedMetrics: simulated.metrics,
      metricDeltas,
      resolvedRecommendations: resolutions.filter(
        (r) => r.classification === "resolved" || r.classification === "invalidated",
      ),
      partiallyResolvedRecommendations: resolutions.filter(
        (r) => r.classification === "partially-resolved" || r.classification === "superseded",
      ),
      unresolvedRecommendations: resolutions.filter(
        (r) => r.classification === "unresolved" || r.classification === "regressed",
      ),
      newFindings,
      residualRisks,
      regressions,
      executionSequence: sequence,
      score,
      evidence,
      confidence: bound.confidence,
      lineage: {
        graphVersion: this.query.graphMetadata.version,
        canonicalGraphHash: canonicalGraphHashBefore,
        overlayContentHash: construction.overlayContentHash,
        nodeIdsBefore: baseline.nodeIds,
        nodeIdsAfter: simulated.nodeIds,
        edgeIdsBefore: baseline.edgeIds,
        edgeIdsAfter: simulated.edgeIds,
        reasoningAnalyses: bound.lineage.reasoningAnalyses,
        policyIds: [bound.policyId],
        recommendationIds: [bound.recommendationId],
      },
      overlay: construction,
      explanation: {
        recommendationId: bound.recommendationId,
        policyId: bound.policyId,
        findingIds: bound.sourceFindingIds,
        changeStatements: bound.changes.map((c) => `${c.operation} → ${c.target.id}: ${c.rationale.statement}`),
        validationRulesApplied: validation.rulesApplied,
        conflictIds: conflicts.map((c) => c.id),
        overlayConstruction: `Overlay derived from canonical hash ${construction.baseContentHash}: ${construction.appliedChangeIds.length} change(s) applied, ${construction.skippedChangeIds.length} skipped, producing overlay hash ${construction.overlayContentHash}.`,
        metricsCompared: COMPARED_METRICS.map((m) => String(m.key)),
        resolutionBasis: relevant.map((r) => `${r.recommendationId}: ${r.classification} — ${r.explanation}`),
        regressionBasis: regressions.map((r) => `${r.kind}: ${r.statement}`),
        scoreExplanation: score.explanation,
        outcomeExplanation: `Validation "${validation.outcome}", ${conflicts.length} conflict(s), ${regressions.length} regression(s); band "${score.band}".`,
      },
      diagnostics: emptyDiagnostics(
        warnings,
        validation.executable ? [] : [bound.id],
        validation.missingParameters.length
          ? [{ proposalId: bound.id, parameters: validation.missingParameters }]
          : [],
        construction.notes,
      ),
    };
  }

  /** Simulates a bundle of proposals, applying them in dependency order. */
  simulateBundle(
    proposals: readonly ChangeProposal[],
    request: SimulationRequest = {},
  ): ProposalBundleResult {
    const canonicalGraphHashBefore = this.canonicalGraphHash;
    const bound = proposals
      .map((p) => (request.parameters?.[p.id] ? bindParameters(p, request.parameters[p.id]) : p))
      .sort((a, b) => a.id.localeCompare(b.id));

    const sequence = sequenceProposals(bound);
    const conflicts = this.inspectConflicts(bound);
    const validationResults = bound.map((p) => validateProposal(this.canonicalGraph, p));
    const blocking = conflicts.some((c) => c.severity === "blocking");

    const baseline = this.baseline();
    const executableIds = new Set(
      validationResults.filter((v) => v.executable).map((v) => v.proposalId),
    );

    const orderedIds = sequence.steps.flatMap((s) => s.proposalIds);
    const applied: ProposedChange[] = [];
    const intermediateStates: IntermediateState[] = [];
    let latest = baseline;
    let overlayConstruction = buildOverlay(this.canonicalGraph, []).construction;

    if (!blocking) {
      let order = 1;
      for (const proposalId of orderedIds) {
        if (!executableIds.has(proposalId)) continue;
        const proposal = bound.find((p) => p.id === proposalId)!;
        applied.push(...proposal.changes);
        const { graph, construction } = buildOverlay(this.canonicalGraph, applied);
        overlayConstruction = construction;
        latest = analyzeGraphSnapshot(graph, {
          ...(this.lineageSampleLimit !== undefined
            ? { lineageSampleLimit: this.lineageSampleLimit }
            : {}),
        });
        intermediateStates.push({
          order,
          proposalId,
          overlayContentHash: construction.overlayContentHash,
          metrics: latest.metrics,
          deltas: compareMetrics(baseline.metrics, latest.metrics),
        });
        order += 1;
      }
    }

    const deltas = compareMetrics(baseline.metrics, latest.metrics);
    const resolutions = applied.length > 0 ? classifyResolutions(baseline, latest) : [];
    const regressions =
      applied.length > 0
        ? detectRegressions(baseline, latest, `bundle:${bundleIdFor(bound.map((p) => p.id))}`)
        : [];

    const targeted = new Set(bound.flatMap((p) => p.expectedImprovement.resolvesRecommendationIds));
    const relevant = resolutions.filter((r) => targeted.has(r.recommendationId));

    const score = scoreProposal({
      proposal: {
        ...bound[0],
        changes: applied,
        incomplete: bound.some((p) => p.incomplete),
        reversible: bound.every((p) => p.reversible),
        expectedImprovement: {
          metrics: bound.flatMap((p) => p.expectedImprovement.metrics),
          resolvesRecommendationIds: sortedUnique([...targeted]),
        },
      },
      validation: {
        proposalId: bundleIdFor(bound.map((p) => p.id)),
        outcome: validationResults.some((v) => v.outcome === "invalid")
          ? "invalid"
          : validationResults.some((v) => v.outcome === "incomplete")
            ? "incomplete"
            : blocking
              ? "conflicting"
              : "valid",
        rulesApplied: validationResults[0]?.rulesApplied ?? [],
        issues: validationResults.flatMap((v) => v.issues),
        missingParameters: sortedUnique(validationResults.flatMap((v) => v.missingParameters)),
        executable: !blocking && validationResults.every((v) => v.executable),
      },
      conflicts,
      resolutions: relevant,
      regressions,
      deltas,
    });

    const canonicalGraphHashAfter = this.canonicalGraphHash;

    return {
      bundleId: bundleIdFor(bound.map((p) => p.id)),
      proposalIds: bound.map((p) => p.id),
      sequence,
      conflicts,
      validationResults,
      intermediateStates,
      finalMetrics: latest.metrics,
      baselineMetrics: baseline.metrics,
      deltas,
      resolutions,
      regressions,
      cumulativeBenefit: score.benefitScore,
      cumulativeRisk: score.riskScore,
      score,
      overlay: overlayConstruction,
      canonicalGraphHashBefore,
      canonicalGraphHashAfter,
      canonicalGraphHashPreserved: canonicalGraphHashBefore === canonicalGraphHashAfter,
      diagnostics: emptyDiagnostics(
        blocking
          ? [
              {
                code: "empty-result",
                message: "Bundle contains blocking conflicts; no overlay analysis was executed.",
              },
            ]
          : [],
        bound.filter((p) => !executableIds.has(p.id)).map((p) => p.id),
        bound
          .filter((p) => this.unresolvedParameters(p).length > 0)
          .map((p) => ({ proposalId: p.id, parameters: this.unresolvedParameters(p) })),
      ),
    };
  }

  /** Compares mutually exclusive remediation alternatives. */
  compareAlternatives(
    proposals: readonly ChangeProposal[],
    request: SimulationRequest = {},
  ): AlternativeComparison {
    const canonicalBefore = this.canonicalGraphHash;
    const sorted = [...proposals].sort((a, b) => a.id.localeCompare(b.id));
    const results = sorted.map((p) => this.simulateProposal(p, request));

    const alternatives: readonly AlternativeOutcome[] = results.map((result) => ({
      proposalId: result.proposalId,
      variant: result.proposal.variant,
      score: result.score,
      metrics: result.simulatedMetrics,
      deltas: result.metricDeltas,
      resolvedRecommendationIds: result.resolvedRecommendations.map((r) => r.recommendationId),
      residualRecommendationIds: result.unresolvedRecommendations.map((r) => r.recommendationId),
      regressions: result.regressions,
      risks: result.proposal.risks,
      complexity: result.proposal.complexity,
      confidence: result.confidence,
    }));

    const discriminators: string[] = [];
    const best = [...alternatives].sort(
      (a, b) => b.score.score - a.score.score || a.proposalId.localeCompare(b.proposalId),
    );
    const bandRank = (band: string): number =>
      [
        "strongly-recommended",
        "recommended",
        "conditional",
        "low-value",
        "not-recommended",
        "invalid",
      ].indexOf(band);

    let verdict: AlternativeComparison["verdict"] = "decision-required";
    let preferred: string | null = null;
    let rationale: string;

    if (alternatives.length === 0) {
      verdict = "decision-required";
      rationale = "No alternatives were supplied.";
    } else if (best.length === 1) {
      verdict = "preferred";
      preferred = best[0].proposalId;
      rationale = "Only one alternative was supplied.";
      discriminators.push("single-alternative");
    } else {
      const [first, second] = best;
      const bandDelta = bandRank(second.score.band) - bandRank(first.score.band);
      const scoreDelta = round2(first.score.score - second.score.score);
      if (bandDelta > 0) discriminators.push(`band:${first.score.band} beats ${second.score.band}`);
      if (scoreDelta >= 10) discriminators.push(`score:+${scoreDelta}`);
      if (
        first.regressions.filter((r) => r.severity === "critical").length <
        second.regressions.filter((r) => r.severity === "critical").length
      ) {
        discriminators.push("fewer-critical-regressions");
      }

      if (discriminators.length > 0) {
        verdict = "preferred";
        preferred = first.proposalId;
        rationale = `"${first.proposalId}" is preferred on ${discriminators.join(", ")}.`;
      } else if (scoreDelta === 0 && first.score.band === second.score.band) {
        verdict = "equivalent";
        rationale = "Alternatives produce identical scores, bands and regression profiles.";
      } else {
        verdict = "decision-required";
        rationale =
          "No deterministic policy distinguishes the alternatives; the choice requires a governance decision.";
      }
    }

    return {
      comparisonId: `alt:${stableHash(sorted.map((p) => p.id).join("|"))}`,
      subject: sorted[0]?.subject ?? "none",
      alternatives,
      verdict,
      preferredProposalId: preferred,
      rationale,
      discriminators,
      canonicalGraphHashPreserved: canonicalBefore === this.canonicalGraphHash,
    };
  }

  /* ----------------------------------------------------------- inspection */

  /** Metric deltas for an already-executed simulation. */
  inspectMetricDeltas(result: SimulationResult): readonly SimulationResult["metricDeltas"][number][] {
    return result.metricDeltas.filter((d) => d.direction !== "unchanged");
  }

  /** Recommendation resolution records for an already-executed simulation. */
  inspectRecommendationResolution(result: SimulationResult): readonly RecommendationResolution[] {
    return [
      ...result.resolvedRecommendations,
      ...result.partiallyResolvedRecommendations,
      ...result.unresolvedRecommendations,
    ].sort((a, b) => a.recommendationId.localeCompare(b.recommendationId));
  }

  /** Filters simulation results by scope, category, priority or regression severity. */
  filterResults(
    results: readonly SimulationResult[],
    filter: SimulationFilter,
  ): readonly SimulationResult[] {
    const severityRank = (value: RegressionFinding["severity"]): number =>
      ["info", "warning", "critical"].indexOf(value);
    return results.filter((result) => {
      const p = result.proposal;
      if (filter.categories && !filter.categories.includes(p.category)) return false;
      if (filter.priorities && !filter.priorities.includes(p.priority)) return false;
      if (filter.confidences && !filter.confidences.includes(p.confidence)) return false;
      if (filter.policyIds && !filter.policyIds.includes(p.policyId)) return false;
      if (filter.maxRegressionSeverity) {
        const worst = result.regressions.reduce(
          (rank, r) => Math.max(rank, severityRank(r.severity)),
          -1,
        );
        if (worst > severityRank(filter.maxRegressionSeverity)) return false;
      }
      return true;
    });
  }

  /** Scoped simulation: generates and simulates proposals for one scope. */
  simulateScope(
    kind: SimulationScopeKind,
    subject: string | null,
    request: SimulationRequest = {},
  ): readonly SimulationResult[] {
    const scope = this.resolveScope(kind, subject);
    const nodeIds = new Set(scope.resolvedNodeIds);
    const recommendations = this.filterRecommendations(
      this.baseline().intelligence.recommendations,
      request.filter,
    ).filter((rec) => {
      if (kind === "graph" || subject === null) return true;
      if (kind === "recommendation") return rec.id === subject;
      if (nodeIds.size === 0) return false;
      return rec.affected.nodeIds.some((id) => nodeIds.has(id));
    });

    const proposals = generateProposalsFromRecommendations(this.query, recommendations).filter(
      (p) => !request.proposalIds || request.proposalIds.includes(p.id),
    );

    return proposals
      .map((p) => this.simulateProposal(p, { ...request, scope }))
      .sort((a, b) => a.proposalId.localeCompare(b.proposalId));
  }

  /** Deterministic simulation identifier for a proposal and its bindings. */
  simulationIdFor(proposal: ChangeProposal, bindings?: ParameterBinding): string {
    const { construction } = buildOverlay(this.canonicalGraph, proposal.changes);
    return `sim:${this.canonicalGraphHash}:${stableHash(
      `${proposal.id}|${JSON.stringify(bindings ?? null)}|${construction.overlayContentHash}`,
    )}`;
  }

  /** Metrics for an arbitrary overlay; used by tests and diagnostics. */
  metricsForChanges(changes: readonly ProposedChange[]): SimulationMetrics {
    const { graph } = buildOverlay(this.canonicalGraph, changes);
    return analyzeGraphSnapshot(graph, {
      ...(this.lineageSampleLimit !== undefined
        ? { lineageSampleLimit: this.lineageSampleLimit }
        : {}),
    }).metrics;
  }
}

let cached: GraphSimulationEngine | null = null;

/** Process-wide simulation engine over the populated graph. */
export const getSimulationEngine = (): GraphSimulationEngine =>
  (cached ??= new GraphSimulationEngine());

/** Test hook: clears the cached simulation engine. */
export const __resetSimulationEngineCache = (): void => {
  cached = null;
};

export const createSimulationEngine = (
  input: SimulationEngineInput = {},
): GraphSimulationEngine => new GraphSimulationEngine(input);

export const simulationScopeLabel = (scope: SimulationScope): string =>
  `${scope.kind}:${simSlug(scope.subject ?? "graph")}`;
