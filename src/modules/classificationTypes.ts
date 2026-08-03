/**
 * Stage 3 — enterprise catalog types.
 *
 * Stage 1 declared modules, Stage 2 reconciled them against the real router.
 * Stage 3 classifies everything that is still unregistered, proposes candidate
 * modules, and gives shared and platform capabilities a first-class ownership
 * model so they are never double-counted as module-owned.
 *
 * Everything here is declarative data. No side effects, no imports of
 * application components.
 */

import type { ConfidenceLevel, ImplementationStatus, SharedRelationship } from "./types";
import type { EvidenceStrength, ImplementationType, RecommendedAction } from "./routeTypes";

/* -------------------------------------------------------------------------- */
/* Unregistered item classification                                            */
/* -------------------------------------------------------------------------- */

/**
 * The disposition of a single unregistered implementation item.
 * `unable-to-determine` is a legitimate, final answer — low-confidence items are
 * never forced into a module.
 */
export type ClassificationKind =
  | "candidate-product-module"
  | "existing-module-extension"
  | "shared-capability"
  | "platform-capability"
  | "customer-specific"
  | "experimental"
  | "demonstration-or-prototype"
  | "test-support"
  | "utility-or-common-library"
  | "deprecated"
  | "orphaned"
  | "duplicate"
  | "unable-to-determine";

export type OwnershipClassification =
  | "module-owned"
  | "shared"
  | "platform-owned"
  | "unassigned";

export interface ClassifiedItem {
  /** Stable identifier: `<type>:<ref>`. */
  itemId: string;
  ref: string;
  filePath: string | null;
  implementationType: ImplementationType | "route" | "navigation-entry";
  relatedRoute: string | null;
  relatedNavigationId: string | null;
  /** Registered modules whose declared boundary references this item. */
  referencingModules: readonly string[];
  likelyOwner: string | null;
  ownershipClassification: OwnershipClassification;
  classification: ClassificationKind;
  confidence: ConfidenceLevel;
  evidence: readonly string[];
  recommendedAction: RecommendedAction | "register-in-shared-registry" | "register-in-platform-registry" | "no-action";
  humanReviewRequired: boolean;
}

export interface ClassificationReport {
  items: readonly ClassifiedItem[];
  byClassification: Readonly<Record<ClassificationKind, number>>;
  byOwnership: Readonly<Record<OwnershipClassification, number>>;
  humanReviewCount: number;
  unableToDetermineCount: number;
}

/* -------------------------------------------------------------------------- */
/* Observed domain signals (generated)                                         */
/* -------------------------------------------------------------------------- */

export interface DomainSignal {
  clusterId: string;
  fileCount: number;
  supabaseFileCount: number;
  databaseEntities: readonly string[];
  rpcFunctions: readonly string[];
  edgeFunctions: readonly string[];
  agentRefs: readonly string[];
  workflowRefs: readonly string[];
  integrationRefs: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* Candidate modules                                                           */
/* -------------------------------------------------------------------------- */

export type CandidateReadiness =
  | "ready-to-register"
  | "register-with-warnings"
  | "requires-architecture-cleanup"
  | "requires-product-owner-review"
  | "insufficient-evidence";

export interface CandidateModule {
  proposedModuleId: string;
  proposedName: string;
  businessPurpose: string;
  routeBoundaries: readonly string[];
  sourceBoundaries: readonly string[];
  navigationBoundaries: readonly string[];
  majorCapabilities: readonly string[];
  databaseEntities: readonly string[];
  workflows: readonly string[];
  integrations: readonly string[];
  aiAgents: readonly string[];
  sharedDependencies: readonly string[];
  platformDependencies: readonly string[];
  confidence: ConfidenceLevel;
  evidence: readonly string[];
  boundaryRisks: readonly string[];
  readiness: CandidateReadiness;
  /** Counts backing the assessment. */
  metrics: {
    routeCount: number;
    fileCount: number;
    navigationCount: number;
    supabaseFileCount: number;
  };
}

/* -------------------------------------------------------------------------- */
/* Shared and platform capability registries                                   */
/* -------------------------------------------------------------------------- */

export type CapabilityMaturity =
  | "experimental"
  | "emerging"
  | "established"
  | "hardened"
  | "deprecated";

export type SharedCapabilityStatus = "active" | "proposed" | "contested" | "deprecated";

interface CapabilityRecordBase {
  name: string;
  description: string;
  sourcePaths: readonly string[];
  routes: readonly string[];
  components: readonly string[];
  services: readonly string[];
  apis: readonly string[];
  databaseEntities: readonly string[];
  workflows: readonly string[];
  integrations: readonly string[];
  agents: readonly string[];
  permissions: readonly string[];
  evidence: readonly string[];
  evidenceStrength: EvidenceStrength;
  status: SharedCapabilityStatus;
  maturity: CapabilityMaturity;
  knownLimitations: readonly string[];
}

export interface SharedCapability extends CapabilityRecordBase {
  sharedCapabilityId: string;
  /**
   * Module ID that owns the shared capability, or `"unassigned"` when no owner
   * has been agreed. `"unassigned"` is reported as an ownership conflict.
   */
  primaryOwner: string;
  consumingModules: readonly string[];
  relationship: SharedRelationship;
}

export interface PlatformCapability extends CapabilityRecordBase {
  platformCapabilityId: string;
  /** Platform capabilities are always platform-owned; recorded for clarity. */
  owner: "platform";
  consumingModules: readonly string[];
  /** True when consuming modules routinely mistake this for their own feature. */
  frequentlyMiscounted: boolean;
}

/* -------------------------------------------------------------------------- */
/* Hierarchical capability model                                               */
/* -------------------------------------------------------------------------- */

export type CapabilityLevel = "domain" | "capability" | "sub-capability" | "feature";

/**
 * Whether a node represents product intent, a working screen, or an operating
 * capability. Kept separate from `declaredMaturity` so a polished prototype is
 * never mistaken for a running service.
 */
export type ImplementationClassification =
  | "product-representation"
  | "interactive-prototype"
  | "operational-implementation";

export interface CapabilityNode {
  capabilityId: string;
  parentCapabilityId: string | null;
  level: CapabilityLevel;
  name: string;
  description: string;
  relatedRoutes: readonly string[];
  relatedPages: readonly string[];
  relatedComponents: readonly string[];
  /** User-visible actions the node supports, as observed in the pages. */
  relatedActions: readonly string[];
  evidenceStrength: EvidenceStrength;
  declaredMaturity: ImplementationStatus;
  implementationClassification: ImplementationClassification;
  knownLimitations: readonly string[];
  /** Stage 1 capability ID this node preserves, when it is a rename or a split. */
  supersedesCapabilityId?: string;
}

export interface CapabilityHierarchy {
  moduleId: string;
  nodes: readonly CapabilityNode[];
}

/* -------------------------------------------------------------------------- */
/* Governance                                                                  */
/* -------------------------------------------------------------------------- */

export type GovernanceRuleId =
  | "route-without-module-ownership"
  | "page-without-registration"
  | "capability-consumed-without-dependency"
  | "shared-capability-without-primary-owner"
  | "platform-capability-declared-as-module-owned"
  | "agent-or-workflow-referenced-but-unregistered"
  | "registered-capability-without-evidence"
  | "capability-parent-missing"
  | "capability-level-mismatch"
  | "duplicate-capability-node";

export type GovernanceSeverity = "info" | "warning" | "error";

export interface GovernanceFinding {
  ruleId: GovernanceRuleId;
  severity: GovernanceSeverity;
  subject: string;
  moduleId: string | null;
  message: string;
  /** What a developer should do next. Never "stop working". */
  remediation: string;
}

export interface GovernanceReport {
  findings: readonly GovernanceFinding[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  /** Governance never blocks local development; errors gate release review. */
  blocksRelease: boolean;
}
