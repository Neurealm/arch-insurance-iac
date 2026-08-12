/**
 * Stage 3.5.3.5 — Controlled Change Plan and Patch Specification public API.
 *
 * Planning-only and deterministic. Nothing in this module mutates the
 * canonical graph, simulation results, registries, manifests, routes or any
 * repository file, and no patch is ever applied.
 */

export * from "./ChangePlanTypes";
export {
  ARTIFACT_CATALOG,
  artifactPaths,
  catalogEntry,
  isKnownArtifact,
  manifestPathFor,
  mapChangesToArtifacts,
  mapEntityToArtifacts,
  unresolvedMappings,
  type ArtifactMappingInput,
  type CatalogEntry,
} from "./ArtifactMapping";
export {
  buildAfterState,
  buildBeforeState,
  buildPatchSpecification,
  buildPostconditions,
  buildPreconditions,
  buildRollback,
  buildSelector,
  detectPatchConflicts,
  INVERSE_PATCH_OPERATION,
  PATCH_OPERATION_FOR_CHANGE,
  patchSlug,
  type PatchBuildInput,
  type PatchConditionInput,
} from "./PatchSpecification";
export {
  createChangePlanEngine,
  DEFAULT_TOLERANCES,
  getChangePlanEngine,
  GraphChangePlanEngine,
  WORKSTREAM_FOR_OPERATION,
  WORKSTREAM_ORDER,
  __resetChangePlanEngineCache,
  type ChangePlanEngineInput,
} from "./PlanEngine";
