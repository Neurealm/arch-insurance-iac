/**
 * Stage 3.5.3.3 — deterministic consolidation and recommendation construction.
 *
 * Candidates sharing a merge key become one recommendation that preserves every
 * source finding, node, evidence item and lineage reference. Cross-policy
 * suppression is explicit: nothing is dropped silently, every exclusion is
 * recorded with its reason.
 */

import type { QueryGraphMetadata } from "../query/index";
import { weakestConfidence } from "../reasoning/index";
import type { ReasoningConfidence } from "../reasoning/index";
import type { PolicyCandidate, IntelligencePolicy } from "./Policies";
import type {
  AffectedEntities,
  ExclusionRecord,
  IntelligenceRecommendation,
  RecommendationStatus,
} from "./IntelligenceTypes";
import { CONFIDENCE_FACTOR, bandRank, slugify, uniqueSorted } from "./IntelligenceTypes";
import { scorePriority } from "./Prioritization";
import { buildRemediationPlan } from "./Remediation";
import { COMPLEXITY_ORDER } from "./IntelligenceTypes";

const mergeAffected = (values: readonly AffectedEntities[]): AffectedEntities => ({
  nodeIds: uniqueSorted(values.flatMap((v) => v.nodeIds)),
  routeIds: uniqueSorted(values.flatMap((v) => v.routeIds)),
  moduleIds: uniqueSorted(values.flatMap((v) => v.moduleIds)),
  capabilityIds: uniqueSorted(values.flatMap((v) => v.capabilityIds)),
  serviceIds: uniqueSorted(values.flatMap((v) => v.serviceIds)),
  platformIds: uniqueSorted(values.flatMap((v) => v.platformIds)),
  owners: uniqueSorted(values.flatMap((v) => v.owners)),
});

const maxSignal = (group: readonly PolicyCandidate[], key: keyof PolicyCandidate["signals"]): number =>
  group.reduce((max, c) => Math.max(max, c.signals[key] ?? 0), 0);

const worstSeverity = (group: readonly PolicyCandidate[]): PolicyCandidate["severity"] => {
  const order: PolicyCandidate["severity"][] = ["info", "advisory", "warning", "critical"];
  return group.reduce(
    (worst, c) => (order.indexOf(c.severity) > order.indexOf(worst) ? c.severity : worst),
    "info" as PolicyCandidate["severity"],
  );
};

const worstComplexity = (group: readonly PolicyCandidate[]): PolicyCandidate["complexity"] =>
  group.reduce(
    (worst, c) => (COMPLEXITY_ORDER.indexOf(c.complexity) > COMPLEXITY_ORDER.indexOf(worst) ? c.complexity : worst),
    "trivial" as PolicyCandidate["complexity"],
  );

/** Merges candidates that share a merge key into a single canonical candidate. */
export function consolidateCandidates(
  candidates: readonly PolicyCandidate[],
): readonly { candidate: PolicyCandidate; mergedCount: number; rationale: string }[] {
  const byKey = new Map<string, PolicyCandidate[]>();
  for (const candidate of candidates) {
    const key = `${candidate.policyId}|${candidate.mergeKey}`;
    const bucket = byKey.get(key);
    if (bucket) bucket.push(candidate);
    else byKey.set(key, [candidate]);
  }
  return [...byKey.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, group]) => {
      const sorted = [...group].sort((a, b) => a.subject.localeCompare(b.subject));
      const head = sorted[0];
      if (sorted.length === 1) {
        return { candidate: head, mergedCount: 1, rationale: head.separationRationale };
      }
      const merged: PolicyCandidate = {
        ...head,
        affected: mergeAffected(sorted.map((c) => c.affected)),
        evidence: sorted.flatMap((c) => c.evidence),
        sourceFindingIds: uniqueSorted(sorted.flatMap((c) => c.sourceFindingIds)),
        analyses: uniqueSorted(sorted.flatMap((c) => c.analyses)) as PolicyCandidate["analyses"],
        confidence: weakestConfidence(sorted.map((c) => c.confidence)),
        candidateInvolved: sorted.some((c) => c.candidateInvolved),
        expectedByDesign: sorted.every((c) => c.expectedByDesign),
        severity: worstSeverity(sorted),
        complexity: worstComplexity(sorted),
        layers: uniqueSorted(sorted.flatMap((c) => c.layers)) as PolicyCandidate["layers"],
        edgeIds: uniqueSorted(sorted.flatMap((c) => c.edgeIds)),
        signals: {
          blastRadius: maxSignal(sorted, "blastRadius"),
          criticality: maxSignal(sorted, "criticality"),
          ownershipRisk: maxSignal(sorted, "ownershipRisk"),
          traceabilityRisk: maxSignal(sorted, "traceabilityRisk"),
          coverageGap: maxSignal(sorted, "coverageGap"),
          breadth: maxSignal(sorted, "breadth"),
          dependencyDepth: maxSignal(sorted, "dependencyDepth"),
        },
      };
      return {
        candidate: merged,
        mergedCount: sorted.length,
        rationale: `Merged ${sorted.length} candidates sharing merge key "${head.mergeKey}"; all source findings, nodes and evidence are preserved.`,
      };
    });
}

const confidenceRationale = (candidate: PolicyCandidate): string =>
  [
    `Confidence "${candidate.confidence}" is the weakest confidence across ${candidate.evidence.length} evidence item(s)`,
    candidate.candidateInvolved
      ? "downgraded because at least one weakly-inferred candidate relationship contributed"
      : "with no candidate relationship contribution",
    `and scales the priority subtotal by ${CONFIDENCE_FACTOR[candidate.confidence]}.`,
  ].join(", ");

const statusFor = (candidate: PolicyCandidate): RecommendationStatus => {
  if (candidate.expectedByDesign) return "expected-by-design";
  if (candidate.severity === "info") return "informational";
  return "open";
};

export interface BuildRecommendationsInput {
  candidates: readonly PolicyCandidate[];
  policies: readonly IntelligencePolicy[];
  graph: QueryGraphMetadata;
}

export interface BuildRecommendationsOutput {
  recommendations: readonly IntelligenceRecommendation[];
  exclusions: readonly ExclusionRecord[];
}

/**
 * Consolidates, cross-suppresses, scores and deterministically orders every
 * recommendation.
 */
export function buildRecommendations(input: BuildRecommendationsInput): BuildRecommendationsOutput {
  const consolidated = consolidateCandidates(input.candidates);
  const policyOf = new Map(input.policies.map((p) => [p.id, p]));

  /* Cross-policy suppression: a SPOF recommendation supersedes the critical
     dependency-chain recommendation for the same node, because the redundancy
     action subsumes the documentation action. */
  const spofSubjects = new Set(
    consolidated.filter((c) => c.candidate.policyId === "POL-RES-001").map((c) => c.candidate.subject),
  );
  const exclusions: ExclusionRecord[] = [];
  const kept = consolidated.filter(({ candidate }) => {
    if (candidate.policyId === "POL-RES-002" && spofSubjects.has(candidate.subject)) {
      exclusions.push({
        findingId: `POL-RES-002:${candidate.subject}`,
        reason: `Superseded by the single-point-of-failure recommendation for "${candidate.subject}"; the redundancy action subsumes chain documentation.`,
      });
      return false;
    }
    return true;
  });

  const recommendations = kept
    .map(({ candidate, mergedCount, rationale }) => {
      const priority = scorePriority({
        signals: candidate.signals,
        severity: candidate.severity,
        confidence: candidate.confidence as ReasoningConfidence,
        candidateInvolved: candidate.candidateInvolved,
        expectedByDesign: candidate.expectedByDesign,
        complexity: candidate.complexity,
      });
      const policy = policyOf.get(candidate.policyId);
      const relatedExclusions = exclusions.filter((e) => e.findingId.endsWith(`:${candidate.subject}`));
      const recommendation: IntelligenceRecommendation = {
        id: `rec:${candidate.policyId}:${slugify(candidate.mergeKey)}`,
        policyId: candidate.policyId,
        category: policy?.category ?? "governance",
        severity: candidate.severity,
        status: statusFor(candidate),
        priority: priority.band,
        priorityScore: priority.score,
        priorityExplanation: priority,
        title: candidate.title,
        summary: candidate.summary,
        subject: candidate.subject,
        affected: candidate.affected,
        evidence: candidate.evidence,
        sourceFindingIds: candidate.sourceFindingIds,
        reasoningAnalyses: candidate.analyses,
        confidence: candidate.confidence,
        confidenceRationale: confidenceRationale(candidate),
        candidateInvolved: candidate.candidateInvolved,
        expectedByDesign: candidate.expectedByDesign,
        expectedBenefit: candidate.expectedBenefit,
        remediation: buildRemediationPlan(candidate),
        consolidation: {
          mergeKey: candidate.mergeKey,
          consolidated: mergedCount > 1,
          mergedFindingCount: mergedCount,
          rationale,
        },
        exclusions: relatedExclusions,
        lineage: {
          graphVersion: input.graph.version,
          graphContentHash: input.graph.contentHash,
          nodeIds: candidate.affected.nodeIds,
          edgeIds: candidate.edgeIds,
          layers: candidate.layers,
          reasoningAnalyses: candidate.analyses,
        },
      };
      return recommendation;
    })
    /* Deterministic ordering: score desc, band, policy, id. Never insertion order. */
    .sort(
      (a, b) =>
        b.priorityScore - a.priorityScore ||
        bandRank(a.priority) - bandRank(b.priority) ||
        a.policyId.localeCompare(b.policyId) ||
        a.id.localeCompare(b.id),
    );

  return { recommendations, exclusions };
}
