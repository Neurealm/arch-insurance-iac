/**
 * Stage 3.5.3.2 — shared reasoning result envelope and evidence helpers.
 *
 * Every analysis returns the same contract so consumers can treat reasoning
 * output uniformly, exactly as Stage 3.5.3.1 does for queries.
 */

import type { QueryGraphMetadata, QueryPerformance, QueryWarning } from "../query/index";
import type {
  ReasoningAnalysis,
  ReasoningConfidence,
  ReasoningEvidence,
  ReasoningFinding,
  ReasoningRecommendation,
  ReasoningResult,
  ReasoningSeverity,
} from "./ReasoningTypes";
import { REASONING_GENERATOR, weakestConfidence } from "./ReasoningTypes";

export const nowMs = (): number =>
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();

export const perf = (
  startedAt: number,
  indexesUsed: readonly string[],
  scannedNodeCount = 0,
  scannedEdgeCount = 0,
): QueryPerformance => ({
  executionTimeMs: Math.max(0, nowMs() - startedAt),
  indexesUsed,
  scannedNodeCount,
  scannedEdgeCount,
});

export const evidence = (
  kind: ReasoningEvidence["kind"],
  subject: string,
  statement: string,
  confidence: ReasoningConfidence,
  extra: Partial<Omit<ReasoningEvidence, "kind" | "subject" | "statement" | "confidence">> = {},
): ReasoningEvidence => ({
  kind,
  subject,
  statement,
  confidence,
  candidate: extra.candidate ?? false,
  ...(extra.nodeIds ? { nodeIds: extra.nodeIds } : {}),
  ...(extra.edgeIds ? { edgeIds: extra.edgeIds } : {}),
  ...(extra.path ? { path: extra.path } : {}),
});

export const finding = (
  analysis: ReasoningAnalysis,
  severity: ReasoningSeverity,
  subject: string,
  summary: string,
  supporting: readonly ReasoningEvidence[],
): ReasoningFinding => ({
  id: `${analysis}:${subject}`,
  analysis,
  severity,
  subject,
  summary,
  evidence: supporting,
  confidence: weakestConfidence(supporting.map((e) => e.confidence)),
});

export const recommendation = (
  analysis: ReasoningAnalysis,
  priority: ReasoningRecommendation["priority"],
  subject: string,
  action: string,
  rationale: string,
  targets: readonly string[],
  confidence: ReasoningConfidence,
): ReasoningRecommendation => ({
  id: `${analysis}:${subject}:${action
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`,
  analysis,
  priority,
  subject,
  action,
  rationale,
  targets,
  confidence,
});

export interface ReasoningEnvelopeInput<T> {
  analysis: ReasoningAnalysis;
  subject: string | null;
  results: readonly T[];
  findings?: readonly ReasoningFinding[];
  recommendations?: readonly ReasoningRecommendation[];
  warnings?: readonly QueryWarning[];
  candidateRelationshipsIncluded?: boolean;
  confidence?: ReasoningConfidence;
  performance: QueryPerformance;
  graph: QueryGraphMetadata;
  success?: boolean;
}

export function buildReasoningResult<T>(input: ReasoningEnvelopeInput<T>): ReasoningResult<T> {
  const findings = [...(input.findings ?? [])].sort((a, b) => a.id.localeCompare(b.id));
  const recommendations = [...(input.recommendations ?? [])].sort(
    (a, b) => a.priority.localeCompare(b.priority) || a.id.localeCompare(b.id),
  );
  const warnings = [...(input.warnings ?? [])];
  if (input.results.length === 0 && !warnings.some((w) => w.code === "empty-result")) {
    warnings.push({
      code: "empty-result",
      message: `No ${input.analysis} results for ${input.subject ?? "the whole graph"}.`,
      ...(input.subject ? { subject: input.subject } : {}),
    });
  }
  if (input.candidateRelationshipsIncluded) {
    warnings.push({
      code: "candidate-relationships-included",
      message:
        "This analysis followed weakly-inferred candidate relationships; conclusions are downgraded accordingly.",
      ...(input.subject ? { subject: input.subject } : {}),
    });
  }
  return {
    success: input.success ?? true,
    analysis: input.analysis,
    generator: REASONING_GENERATOR,
    subject: input.subject,
    results: input.results,
    resultCount: input.results.length,
    findings,
    recommendations,
    warnings,
    candidateRelationshipsIncluded: input.candidateRelationshipsIncluded === true,
    confidence:
      input.confidence ??
      weakestConfidence(findings.length > 0 ? findings.map((f) => f.confidence) : ["high"]),
    performance: input.performance,
    graph: input.graph,
  };
}

export function reasoningFailure<T>(
  analysis: ReasoningAnalysis,
  subject: string,
  warnings: readonly QueryWarning[],
  performance: QueryPerformance,
  graph: QueryGraphMetadata,
): ReasoningResult<T> {
  return {
    success: false,
    analysis,
    generator: REASONING_GENERATOR,
    subject,
    results: [],
    resultCount: 0,
    findings: [],
    recommendations: [],
    warnings,
    candidateRelationshipsIncluded: false,
    confidence: "unable-to-verify",
    performance,
    graph,
  };
}
