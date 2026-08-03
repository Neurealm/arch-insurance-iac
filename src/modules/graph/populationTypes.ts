/**
 * Stage 3.5.2 — types for graph population, reconciliation, orphan analysis and
 * statistics.
 *
 * These types sit *on top of* the Stage 3.5.1 schema; nothing here changes the
 * node, edge or validation model. Provenance is carried in node and edge
 * `attributes`, which the 3.5.1 schema already supports.
 */

import type { CapabilityGraph, GraphEdgeType, GraphNode, GraphNodeType, GraphOwnership } from "./types";
import type { ConfidenceLevel } from "../types";
import type { EvidenceStrength } from "../routeTypes";

/** How a fact entered the graph. Weak inferences never enter the authoritative graph. */
export type EvidenceClassification =
  | "declared"
  | "deterministically-discovered"
  | "strongly-inferred"
  | "weakly-inferred"
  | "human-reviewed"
  | "unable-to-verify";

export type ValidationState = "validated" | "unvalidated" | "conflicting";

/** Provenance recorded on every populated node and edge. */
export interface FactProvenance {
  sourceType: string;
  sourceId: string;
  sourcePath: string | null;
  evidenceMethod: string;
  evidenceClassification: EvidenceClassification;
  evidenceStrength: EvidenceStrength | null;
  validationState: ValidationState;
  confidence: ConfidenceLevel;
}

/** A weakly-inferred relationship, isolated from the authoritative graph. */
export interface CandidateEdge {
  id: string;
  from: string;
  to: string;
  type: GraphEdgeType;
  rationale: string;
  provenance: FactProvenance;
}

export interface GraphInputSource {
  /** Registry, inventory or generated artefact used as a graph input. */
  name: string;
  kind: "registry" | "manifest" | "generated-inventory" | "derived-report" | "documentation";
  path: string;
  itemCount: number;
  used: boolean;
  notes: string;
}

export interface PopulatedGraph {
  /** Authoritative graph: declared, discovered, strongly-inferred and reviewed facts only. */
  graph: CapabilityGraph;
  /** Weakly-inferred relationships held back for human review. */
  candidateEdges: readonly CandidateEdge[];
  inputs: readonly GraphInputSource[];
}

/* -------------------------------------------------------------------------- */
/* Reconciliation                                                              */
/* -------------------------------------------------------------------------- */

export type ReconciliationRuleId =
  | "declared-node-without-implementation"
  | "implementation-node-not-registered"
  | "declared-edge-without-implementation-evidence"
  | "implementation-relationship-not-declared"
  | "duplicate-node-representation"
  | "duplicate-edge-representation"
  | "conflicting-ownership"
  | "conflicting-relationship-direction"
  | "missing-parent-relationship"
  | "shared-capability-modelled-as-module-owned"
  | "platform-capability-counted-as-module-capability"
  | "customer-specific-assigned-to-core"
  | "deprecated-implementation-linked-to-active-capability";

export type ReconciliationSeverity = "info" | "warning" | "conflict";

export interface ReconciliationFinding {
  ruleId: ReconciliationRuleId;
  severity: ReconciliationSeverity;
  subject: string;
  message: string;
  evidence: readonly string[];
  /** Low-confidence ownership conflicts are never auto-resolved. */
  requiresHumanReview: boolean;
  confidence: ConfidenceLevel;
}

export interface ReconciliationReport {
  findings: readonly ReconciliationFinding[];
  byRule: Readonly<Record<string, number>>;
  conflictCount: number;
  warningCount: number;
  infoCount: number;
  humanReviewCount: number;
}

/* -------------------------------------------------------------------------- */
/* Orphan analysis                                                             */
/* -------------------------------------------------------------------------- */

export type OrphanClass =
  | "isolated"
  | "ownership-only"
  | "capability-without-implementation"
  | "page-without-capability"
  | "route-without-page"
  | "workflow-without-capability"
  | "agent-not-invoked"
  | "integration-not-consumed"
  | "permission-unattached"
  | "entity-without-consumer"
  | "report-without-capability"
  | "dashboard-without-capability"
  | "shared-capability-without-consumer"
  | "platform-capability-without-consumer";

export interface OrphanFinding {
  orphanClass: OrphanClass;
  nodeId: string;
  nodeType: GraphNodeType;
  label: string;
  moduleId: string | null;
  degree: number;
  /** True when low connectivity is expected for this kind of node. */
  legitimate: boolean;
  rationale: string;
}

export interface OrphanReport {
  findings: readonly OrphanFinding[];
  byClass: Readonly<Record<string, number>>;
  likelyOmissions: number;
  legitimate: number;
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                  */
/* -------------------------------------------------------------------------- */

export interface GraphStatistics {
  schemaVersion: string;
  generator: string;
  contentHash: string;
  version: number;
  totals: {
    nodes: number;
    edges: number;
    candidateEdges: number;
    connectedComponents: number;
    orphanNodes: number;
    unregisteredNodes: number;
    ownershipConflicts: number;
    averageEdgesPerNode: number;
    maxGraphDepth: number;
  };
  nodesByType: Readonly<Record<string, number>>;
  edgesByType: Readonly<Record<string, number>>;
  nodesByOwnership: Readonly<Record<GraphOwnership, number>>;
  nodesByEvidenceStrength: Readonly<Record<string, number>>;
  edgesByEvidenceClassification: Readonly<Record<string, number>>;
  mostConnectedNodes: readonly { id: string; label: string; degree: number }[];
  modulesByDependencyCount: readonly { moduleId: string; dependencies: number }[];
  capabilitiesByImplementationSurface: readonly { id: string; label: string; implementations: number }[];
}

/* -------------------------------------------------------------------------- */
/* SRE slice                                                                   */
/* -------------------------------------------------------------------------- */

export interface SreGraphSlice {
  moduleNode: GraphNode | null;
  byType: Readonly<Record<string, readonly GraphNode[]>>;
  countsByType: Readonly<Record<string, number>>;
  consumedSharedCapabilities: readonly GraphNode[];
  consumedPlatformCapabilities: readonly GraphNode[];
  evidenceStrengths: Readonly<Record<string, number>>;
  implementationClassifications: Readonly<Record<string, number>>;
  platformChromeExcluded: readonly string[];
  promotedMockNodes: readonly string[];
  subgraph: CapabilityGraph;
}
