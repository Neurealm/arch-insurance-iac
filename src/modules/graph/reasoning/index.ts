/**
 * Stage 3.5.3.2 — Enterprise Graph Reasoning and Analysis Engine public API.
 */

export * from "./ReasoningTypes";
export {
  GraphReasoningEngine,
  createReasoningEngine,
  getReasoningEngine,
  __resetReasoningEngineCache,
  type ReasoningEngineInput,
} from "./ReasoningEngine";
export { analyzeImpact, analyzeDependencyChains, type ImpactAnalysisResult } from "./ImpactAnalysis";
export {
  analyzeCriticalNodes,
  analyzeBottlenecks,
  analyzeSinglePointsOfFailure,
} from "./CriticalityAnalysis";
export { analyzeOwnershipPropagation } from "./OwnershipAnalysis";
export { analyzeCoverageGaps } from "./CoverageAnalysis";
export { analyzeCircularDependencies } from "./CycleAnalysis";
export {
  analyzeCapabilityLineage,
  analyzeRouteTraceability,
  CAPABILITY_LINEAGE_LAYERS,
  ROUTE_TRACE_LAYERS,
} from "./LineageAnalysis";
export {
  buildReasoningResult,
  reasoningFailure,
  evidence,
  finding,
  recommendation,
} from "./ReasoningResults";
export { createReasoningContext, type ReasoningContext } from "./ReasoningContext";
