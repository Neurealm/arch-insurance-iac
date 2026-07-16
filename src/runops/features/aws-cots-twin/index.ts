// AWS COTS Digital Twin — feature root exports.
//
// Phase 1 exposes the placeholder page, the typed data model, and the
// repository layer. UI components must consume data only through the
// repository interface (never import from ./data/seed directly).

export { default as AwsCotsDigitalTwinPage } from "./pages/AwsCotsDigitalTwin";
export * from "./types";
export {
  getAwsCotsRepository,
  setAwsCotsRepository,
  getBusinessService,
  getApplication,
  getResources,
  getResourceById,
  getResourceRelationships,
  getResourceTelemetry,
  getAlerts,
  getRunbooks,
  getIncidents,
  getChanges,
  getSecurityFindings,
  getCostObservations,
  getSimulationScenario,
  saveSimulationState,
  resetSimulationState,
  type AwsCotsRepository,
  type ResourceFilter,
} from "./repositories";
