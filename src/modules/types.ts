/**
 * Module Registration & Boundary Framework — manifest schema.
 *
 * Every Neugain.io module declares what it is, who owns it, where its
 * implementation begins and ends, which capabilities it contains, which shared
 * and platform capabilities it consumes, and what is explicitly outside its
 * boundary.
 *
 * Manifests are declarative data only. They must never import application
 * components, perform side effects, or read from the network or database.
 */

export const MODULE_MANIFEST_SCHEMA_VERSION = "1.0.0" as const;

export type ModuleStatus =
  | "active"
  | "prototype"
  | "deprecated"
  | "planned";

/**
 * Declared maturity of a capability. `implemented` is reserved for capabilities
 * backed by a real service, API or database entity; a page that only renders
 * static or mock data is never `implemented`.
 */
export type ImplementationStatus =
  | "implemented"
  | "partial"
  | "mock"
  | "static"
  | "planned";

export type OwnershipKind = "module-owned" | "shared" | "platform-owned";

export type SharedRelationship =
  | "consumes"
  | "extends"
  | "co-owns"
  | "delegates-to";

export type ConfidenceLevel =
  | "high"
  | "medium"
  | "low"
  | "unable-to-verify";

export interface ModuleIdentity {
  moduleId: string;
  name: string;
  description: string;
  moduleVersion: string;
  status: ModuleStatus;
  businessDomain: string;
  productOwner: string;
  technicalOwner: string;
  /** Confidence that this module boundary is correctly identified. */
  identificationConfidence: ConfidenceLevel;
}

/** Physical and logical extent of a module. All fields are reference lists. */
export interface ModuleBoundaries {
  /** Glob-ish source paths, relative to the repository root. */
  sourcePaths: readonly string[];
  /** Route prefixes owned by the module (may be empty for flat route sets). */
  routePrefixes: readonly string[];
  /** Exact routes owned by the module, as registered in the router. */
  routes: readonly string[];
  /** Navigation entry keys owned by the module. */
  navigationIds: readonly string[];
  pageIds: readonly string[];
  componentRefs: readonly string[];
  serviceRefs: readonly string[];
  apiPrefixes: readonly string[];
  databaseEntities: readonly string[];
  workflowIds: readonly string[];
  integrationIds: readonly string[];
  aiAgentIds: readonly string[];
  automationActionIds: readonly string[];
  dashboardIds: readonly string[];
  reportIds: readonly string[];
  permissionIds: readonly string[];
}

export interface CapabilityDeclaration {
  capabilityId: string;
  name: string;
  description: string;
  domain: string;
  subdomain: string;
  businessPurpose: string;
  primaryPersona: string;
  secondaryPersonas: readonly string[];
  implementationStatus: ImplementationStatus;
  relatedPages: readonly string[];
  relatedRoutes: readonly string[];
  relatedComponents: readonly string[];
  relatedServices: readonly string[];
  relatedWorkflows: readonly string[];
  relatedEntities: readonly string[];
  relatedApis: readonly string[];
  relatedIntegrations: readonly string[];
  relatedAgents: readonly string[];
  relatedAutomationActions: readonly string[];
  /** Free-form pointers a reviewer can follow to confirm the declaration. */
  evidenceHints: readonly string[];
  /** Capability IDs (any module) this capability depends on. */
  dependencies: readonly string[];
  knownLimitations: readonly string[];
}

/** A capability or asset that is shared across modules. */
export interface SharedOwnershipDeclaration {
  /** Reference to the shared asset (path, capability ID or service ID). */
  ref: string;
  ownership: OwnershipKind;
  /** Module ID that owns the shared asset. */
  primaryOwner: string;
  /** Module IDs that consume it. */
  consumingModules: readonly string[];
  relationship: SharedRelationship;
  /** Concrete implementation references backing the shared asset. */
  implementationRefs: readonly string[];
  notes?: string;
}

export interface DependencyDeclaration {
  /** Owning module ID, or "platform" for platform-owned capabilities. */
  owner: string;
  ref: string;
  relationship: SharedRelationship;
  notes?: string;
}

/** Everything explicitly outside the module boundary. */
export interface ModuleExclusions {
  sourcePaths: readonly string[];
  routes: readonly string[];
  components: readonly string[];
  capabilities: readonly string[];
  databaseEntities: readonly string[];
  workflows: readonly string[];
  integrations: readonly string[];
  agents: readonly string[];
  permissions: readonly string[];
  reason?: string;
}

export interface ModuleManifest {
  schemaVersion: typeof MODULE_MANIFEST_SCHEMA_VERSION;
  identity: ModuleIdentity;
  boundaries: ModuleBoundaries;
  capabilities: readonly CapabilityDeclaration[];
  /** Shared assets this module owns or co-owns. */
  sharedOwnership: readonly SharedOwnershipDeclaration[];
  /** Shared capabilities owned by other modules that this module consumes. */
  sharedDependencies: readonly DependencyDeclaration[];
  /** Platform capabilities this module depends on. */
  platformDependencies: readonly DependencyDeclaration[];
  exclusions: ModuleExclusions;
  /** Items that could not be confidently assigned during registration. */
  unableToVerify: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* Validation result model                                                     */
/* -------------------------------------------------------------------------- */

export type FindingSeverity =
  | "valid"
  | "warning"
  | "error"
  | "ownership-conflict"
  | "missing-reference"
  | "unable-to-verify";

export type ValidationRuleId =
  | "duplicate-module-id"
  | "duplicate-capability-id"
  | "invalid-route-ownership"
  | "missing-referenced-file"
  | "missing-workflow"
  | "missing-database-entity"
  | "missing-permission"
  | "conflicting-inclusion-exclusion"
  | "duplicate-database-ownership"
  | "duplicate-workflow-ownership"
  | "invalid-shared-capability-ownership"
  | "missing-owner"
  | "missing-capability-declaration"
  | "unregistered-implementation"
  | "schema-version-mismatch";

export interface ValidationFinding {
  ruleId: ValidationRuleId;
  severity: FindingSeverity;
  moduleId: string | null;
  /** The manifest field, route, path or ID the finding is about. */
  subject: string;
  message: string;
}

export interface RegistryValidationReport {
  moduleCount: number;
  capabilityCount: number;
  findings: readonly ValidationFinding[];
  errorCount: number;
  warningCount: number;
  conflictCount: number;
  ok: boolean;
}
