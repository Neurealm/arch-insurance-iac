/**
 * Stage 3.5.1 — Capability Relationship Graph: schema.
 *
 * A generic, declarative graph model able to represent every architectural
 * object in Neugain.io and the relationships between them. This is the data
 * layer behind the future Module Capability Intelligence feature: no
 * visualization, no application behaviour, no side effects.
 *
 * The graph is *derived*: it is built from the Stage 1–3 registries (module
 * manifests, shared and platform capability registries, capability hierarchies)
 * and the generated route table. Nothing here mutates those sources.
 */

import type { ConfidenceLevel } from "../types";

export const GRAPH_SCHEMA_VERSION = "1.0.0" as const;

/* -------------------------------------------------------------------------- */
/* Node model                                                                  */
/* -------------------------------------------------------------------------- */

export const GRAPH_NODE_TYPES = [
  "module",
  "capability",
  "sub-capability",
  "persona",
  "route",
  "page",
  "component",
  "service",
  "workflow",
  "ai-agent",
  "integration",
  "api",
  "database-entity",
  "dashboard",
  "report",
  "permission",
  "shared-capability",
  "platform-capability",
  "customer-extension",
] as const;

export type GraphNodeType = (typeof GRAPH_NODE_TYPES)[number];

/** Where a node or edge came from. Declared facts outrank derived inference. */
export type GraphFactSource =
  | "declared" // read from a manifest or registry
  | "observed" // read from generated scans of the real application
  | "derived"; // inferred by the builder from other facts

export type GraphOwnership =
  | "module-owned"
  | "shared"
  | "platform-owned"
  | "customer-owned"
  | "unassigned";

export type GraphAttributeValue = string | number | boolean | null;

export interface GraphNode {
  /** Stable identifier, conventionally `<type>:<ref>`. */
  id: string;
  type: GraphNodeType;
  label: string;
  description?: string;
  /** Owning module ID, `"platform"`, or null when unowned. */
  moduleId: string | null;
  ownership: GraphOwnership;
  source: GraphFactSource;
  confidence: ConfidenceLevel;
  /** Repo-relative file backing the node, when one exists. */
  filePath?: string | null;
  evidence: readonly string[];
  attributes: Readonly<Record<string, GraphAttributeValue>>;
}

/* -------------------------------------------------------------------------- */
/* Edge model                                                                  */
/* -------------------------------------------------------------------------- */

export const GRAPH_EDGE_TYPES = [
  "BELONGS_TO",
  "IMPLEMENTS",
  "USES",
  "DEPENDS_ON",
  "CONSUMES",
  "PROVIDES",
  "EXPOSES",
  "INVOKES",
  "STORES",
  "REFERENCES",
  "SECURES",
  "REPORTS_TO",
  "EXTENDS",
  "SHARES",
  "OWNS",
] as const;

export type GraphEdgeType = (typeof GRAPH_EDGE_TYPES)[number];

export interface GraphEdge {
  /** Stable identifier: `<from>|<TYPE>|<to>`. */
  id: string;
  type: GraphEdgeType;
  from: string;
  to: string;
  source: GraphFactSource;
  confidence: ConfidenceLevel;
  evidence: readonly string[];
  attributes: Readonly<Record<string, GraphAttributeValue>>;
}

/**
 * Endpoint policy. An edge type may only connect node types listed here.
 * Empty arrays are not permitted; every edge type declares its domain.
 */
export const EDGE_ENDPOINT_POLICY: Readonly<
  Record<GraphEdgeType, { from: readonly GraphNodeType[]; to: readonly GraphNodeType[] }>
> = {
  BELONGS_TO: {
    from: [
      "capability",
      "sub-capability",
      "route",
      "page",
      "component",
      "service",
      "dashboard",
      "report",
      "workflow",
      "customer-extension",
    ],
    to: ["module", "capability", "sub-capability", "shared-capability", "platform-capability"],
  },
  IMPLEMENTS: {
    from: ["page", "component", "service", "route", "workflow", "ai-agent", "api"],
    to: ["capability", "sub-capability", "shared-capability", "platform-capability"],
  },
  USES: {
    from: [
      "module",
      "capability",
      "sub-capability",
      "page",
      "component",
      "service",
      "workflow",
      "ai-agent",
      "dashboard",
      "report",
      "customer-extension",
    ],
    to: [
      "component",
      "service",
      "api",
      "integration",
      "ai-agent",
      "workflow",
      "shared-capability",
      "platform-capability",
      "database-entity",
    ],
  },
  DEPENDS_ON: {
    from: ["module", "capability", "sub-capability", "customer-extension"],
    to: [
      "module",
      "capability",
      "sub-capability",
      "shared-capability",
      "platform-capability",
      "service",
      "api",
      "integration",
    ],
  },
  CONSUMES: {
    from: ["module", "capability", "sub-capability", "customer-extension"],
    to: ["shared-capability", "platform-capability", "api", "integration", "service"],
  },
  PROVIDES: {
    from: ["module", "shared-capability", "platform-capability", "service"],
    to: ["capability", "sub-capability", "api", "service", "integration", "report", "dashboard"],
  },
  EXPOSES: {
    from: ["module", "capability", "sub-capability", "service", "shared-capability", "platform-capability"],
    to: ["route", "api", "dashboard", "report"],
  },
  INVOKES: {
    from: ["page", "component", "service", "workflow", "ai-agent", "api", "route"],
    to: ["api", "service", "workflow", "ai-agent", "integration"],
  },
  STORES: {
    from: ["module", "capability", "sub-capability", "service", "api", "workflow", "shared-capability", "platform-capability"],
    to: ["database-entity"],
  },
  REFERENCES: { from: [...GRAPH_NODE_TYPES], to: [...GRAPH_NODE_TYPES] },
  SECURES: {
    from: ["permission"],
    to: [
      "route",
      "api",
      "module",
      "capability",
      "sub-capability",
      "database-entity",
      "dashboard",
      "report",
      "service",
      "shared-capability",
      "platform-capability",
    ],
  },
  REPORTS_TO: {
    from: ["dashboard", "report"],
    to: ["module", "capability", "sub-capability", "persona"],
  },
  EXTENDS: {
    from: ["customer-extension", "module", "capability", "sub-capability"],
    to: ["module", "capability", "sub-capability", "shared-capability", "platform-capability"],
  },
  SHARES: {
    from: ["module", "shared-capability"],
    to: ["module", "shared-capability", "component", "service"],
  },
  OWNS: {
    from: ["module", "persona", "platform-capability"],
    to: [...GRAPH_NODE_TYPES],
  },
};

/* -------------------------------------------------------------------------- */
/* Graph document + versioning                                                 */
/* -------------------------------------------------------------------------- */

export interface GraphVersion {
  /** Monotonic integer, incremented whenever the content hash changes. */
  version: number;
  /** Deterministic hash of the node and edge content. */
  contentHash: string;
  /** Identifier of the code that produced the graph. */
  generator: string;
  /** ISO timestamp; excluded from the content hash so rebuilds stay stable. */
  generatedAt: string;
  /** Content hash of the previous version, when known. */
  previousContentHash: string | null;
}

export interface CapabilityGraph {
  schemaVersion: typeof GRAPH_SCHEMA_VERSION;
  version: GraphVersion;
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
}

/* -------------------------------------------------------------------------- */
/* Validation model                                                            */
/* -------------------------------------------------------------------------- */

export type GraphValidationRuleId =
  | "duplicate-node-id"
  | "duplicate-edge-id"
  | "unknown-node-type"
  | "unknown-edge-type"
  | "dangling-edge-endpoint"
  | "self-referencing-edge"
  | "invalid-edge-endpoint-type"
  | "missing-node-label"
  | "orphan-node"
  | "capability-without-module"
  | "shared-capability-without-owner"
  | "cyclic-belongs-to"
  | "schema-version-mismatch";

export type GraphValidationSeverity = "info" | "warning" | "error";

export interface GraphValidationFinding {
  ruleId: GraphValidationRuleId;
  severity: GraphValidationSeverity;
  subject: string;
  message: string;
  remediation: string;
}

export interface GraphValidationReport {
  nodeCount: number;
  edgeCount: number;
  findings: readonly GraphValidationFinding[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  ok: boolean;
}

/* -------------------------------------------------------------------------- */
/* Query model                                                                 */
/* -------------------------------------------------------------------------- */

export type EdgeDirection = "out" | "in" | "both";

export interface NodeFilter {
  types?: readonly GraphNodeType[];
  moduleIds?: readonly string[];
  ownership?: readonly GraphOwnership[];
  sources?: readonly GraphFactSource[];
  /** Case-insensitive substring match against id, label and description. */
  search?: string;
}

export interface TraversalOptions {
  direction?: EdgeDirection;
  edgeTypes?: readonly GraphEdgeType[];
  nodeTypes?: readonly GraphNodeType[];
  maxDepth?: number;
  includeStart?: boolean;
}

export interface TraversalHit {
  node: GraphNode;
  depth: number;
  /** Edge IDs walked from the start node to this node. */
  path: readonly string[];
}
