/**
 * Stage 3.5.3.3 — Graph Intelligence and Recommendation Layer public API.
 *
 * Read-only and deterministic. No graph mutation, no UI, no LLMs, no
 * embeddings, no network calls.
 */

export * from "./IntelligenceTypes";
export {
  PRIORITY_FACTORS,
  SEVERITY_IMPACT,
  REMEDIATION_LEVERAGE,
  CANDIDATE_PENALTY,
  scorePriority,
  type PriorityFactorDefinition,
  type PriorityInput,
  type PrioritySignals,
} from "./Prioritization";
export {
  INTELLIGENCE_POLICIES,
  COVERAGE_GAP_WEIGHT,
  policyById,
  type IntelligencePolicy,
  type PolicyCandidate,
  type PolicyInput,
  type ReasoningBundle,
} from "./Policies";
export {
  buildRecommendations,
  consolidateCandidates,
  type BuildRecommendationsInput,
  type BuildRecommendationsOutput,
} from "./Consolidation";
export { buildRemediationPlan } from "./Remediation";
export { buildStatistics, buildSummaries, type SummaryInput } from "./Summaries";
export {
  GraphIntelligenceEngine,
  createIntelligenceEngine,
  getIntelligenceEngine,
  __resetIntelligenceEngineCache,
  type IntelligenceEngineInput,
} from "./IntelligenceEngine";
