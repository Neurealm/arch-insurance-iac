/**
 * Stage 3.5.3.4 — Graph Change Simulation and Remediation Proposal Engine
 * public API.
 *
 * Read-only, deterministic and simulation-only. The canonical graph, the
 * registries, the manifests, the route table and every source file are never
 * modified by anything in this module.
 */

export * from "./SimulationTypes";
export { buildOverlay, edgeIdFor, type OverlayResult } from "./GraphOverlay";
export {
  generateProposals,
  generateProposalsFromRecommendations,
  bindParameters,
  ownerCandidates,
  MAX_CHANGES_PER_PROPOSAL,
} from "./ProposalGeneration";
export { validateProposal } from "./ProposalValidation";
export {
  detectConflicts,
  detectOrderingConflicts,
  proposalDependencyCycles,
} from "./ConflictDetection";
export {
  analyzeGraphSnapshot,
  classifyResolutions,
  compareMetrics,
  COMPARED_METRICS,
  detectRegressions,
  buildResidualRisks,
  type AnalysisSnapshot,
  type SnapshotOptions,
} from "./SimulationMetrics";
export {
  scoreProposal,
  BENEFIT_WEIGHTS,
  RISK_WEIGHTS,
  COMPLEXITY_WEIGHTS,
  CONFIDENCE_SCORE,
  type ScoreInput,
} from "./ProposalScoring";
export { sequenceProposals, proposalDependencies, bundleIdFor } from "./ProposalBundling";
export {
  GraphSimulationEngine,
  createSimulationEngine,
  getSimulationEngine,
  __resetSimulationEngineCache,
  simulationScopeLabel,
  type SimulationEngineInput,
} from "./SimulationEngine";
