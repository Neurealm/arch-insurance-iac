/**
 * Stage 3.5.3.1 — Graph Query Engine: type model.
 *
 * Read-only, deterministic, strongly typed. Nothing here mutates the graph or
 * introduces inference: the engine only reads the authoritative Stage 3.5.2
 * output plus, on explicit opt-in, the held-out candidate edges.
 */

import { GRAPH_EDGE_TYPES, GRAPH_NODE_TYPES } from "../types";
import type { GraphEdge, GraphEdgeType, GraphNode, GraphNodeType, GraphOwnership } from "../types";

/* -------------------------------------------------------------------------- */
/* Relationship semantics policy                                               */
/* -------------------------------------------------------------------------- */

/**
 * Classification of every existing relationship type. Dependency and impact
 * queries are driven by this table, never by relationship-name heuristics.
 */
export type RelationshipSemantics =
  | "dependency"
  | "ownership"
  | "composition"
  | "membership"
  | "consumption"
  | "evidence"
  | "support"
  | "association"
  | "none";

export const RELATIONSHIP_SEMANTICS: Readonly<Record<GraphEdgeType, RelationshipSemantics>> = {
  BELONGS_TO: "membership",
  IMPLEMENTS: "composition",
  USES: "dependency",
  DEPENDS_ON: "dependency",
  CONSUMES: "consumption",
  PROVIDES: "support",
  EXPOSES: "composition",
  INVOKES: "dependency",
  STORES: "dependency",
  REFERENCES: "association",
  SECURES: "support",
  REPORTS_TO: "association",
  EXTENDS: "dependency",
  SHARES: "association",
  OWNS: "ownership",
};

/** Edge types whose *outgoing* direction means "the source relies on the target". */
export const DEPENDENCY_EDGE_TYPES: readonly GraphEdgeType[] = [
  "CONSUMES",
  "DEPENDS_ON",
  "EXTENDS",
  "INVOKES",
  "STORES",
  "USES",
];

/**
 * Edge types that carry change-impact. A change to a node can affect anything
 * that depends on it, implements it, is exposed by it or belongs to it.
 */
export const IMPACT_EDGE_TYPES: readonly GraphEdgeType[] = [
  "BELONGS_TO",
  "CONSUMES",
  "DEPENDS_ON",
  "EXPOSES",
  "EXTENDS",
  "IMPLEMENTS",
  "INVOKES",
  "STORES",
  "USES",
];

export const isKnownNodeType = (value: string): value is GraphNodeType =>
  (GRAPH_NODE_TYPES as readonly string[]).includes(value);

export const isKnownEdgeType = (value: string): value is GraphEdgeType =>
  (GRAPH_EDGE_TYPES as readonly string[]).includes(value);

/* -------------------------------------------------------------------------- */
/* Attribute fields                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Logical query fields. Each maps to a typed selector over the real schema;
 * fields with no backing in the current schema are declared unsupported and
 * produce a warning plus an empty result rather than a silent match.
 */
export const QUERY_ATTRIBUTE_FIELDS = [
  "owner",
  "domain",
  "category",
  "persona",
  "status",
  "route",
  "application",
  "service",
  "technology",
  "tag",
] as const;

export type QueryAttributeField = (typeof QUERY_ATTRIBUTE_FIELDS)[number];

/** Fields with no representation in the current 19-node-type schema. */
export const UNSUPPORTED_ATTRIBUTE_FIELDS: readonly QueryAttributeField[] = ["technology", "tag"];

/* -------------------------------------------------------------------------- */
/* Filters                                                                     */
/* -------------------------------------------------------------------------- */

export type TextMatchOperator =
  | "exact"
  | "iexact"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "token";

export interface PropertyFilter {
  /** Node attribute key, or one of `id`, `label`, `description`, `filePath`. */
  property: string;
  operator: TextMatchOperator | "equals";
  value: string | number | boolean;
}

export interface NodeQueryFilters {
  nodeTypes?: readonly GraphNodeType[];
  ownership?: readonly GraphOwnership[];
  owners?: readonly string[];
  domains?: readonly string[];
  categories?: readonly string[];
  personas?: readonly string[];
  statuses?: readonly string[];
  routes?: readonly string[];
  applications?: readonly string[];
  services?: readonly string[];
  technologies?: readonly string[];
  tags?: readonly string[];
  /** Free text matched against id, label and description (case-insensitive contains). */
  text?: string;
  properties?: readonly PropertyFilter[];
  /** `all` (default) requires every supplied criterion; `any` requires one. */
  matchMode?: MatchMode;
}

export type MatchMode = "all" | "any";

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface NodeQueryOptions extends PaginationOptions {
  explain?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Search                                                                      */
/* -------------------------------------------------------------------------- */

export const SEARCH_FIELDS = ["id", "label", "description", "filePath"] as const;
export type SearchField = (typeof SEARCH_FIELDS)[number];

export type SearchMatchType =
  | "exact-id"
  | "exact-label"
  | "prefix"
  | "suffix"
  | "token"
  | "contains"
  | "property";

export interface SearchOptions extends PaginationOptions {
  nodeTypes?: readonly GraphNodeType[];
  fields?: readonly SearchField[];
  /** Restrict matching to a single operator instead of the full ranked ladder. */
  operator?: TextMatchOperator;
  /** Additional attribute keys to search (property-scoped search). */
  properties?: readonly string[];
  caseSensitive?: boolean;
  explain?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Traversal                                                                   */
/* -------------------------------------------------------------------------- */

export type TraversalDirection = "out" | "in" | "both";
export type TraversalStrategy = "bfs" | "dfs";

export const DEFAULT_MAX_DEPTH = 6;
export const DEFAULT_TRAVERSAL_LIMIT = 500;
export const MAX_TRAVERSAL_DEPTH = 64;

export interface TraversalQueryOptions extends PaginationOptions {
  direction?: TraversalDirection;
  strategy?: TraversalStrategy;
  maxDepth?: number;
  edgeTypes?: readonly GraphEdgeType[];
  excludeEdgeTypes?: readonly GraphEdgeType[];
  nodeTypes?: readonly GraphNodeType[];
  includeStart?: boolean;
  includePaths?: boolean;
  /** Weakly-inferred Stage 3.5.2 edges. Excluded from every default query. */
  includeCandidateRelationships?: boolean;
  explain?: boolean;
}

export interface PathQueryOptions extends TraversalQueryOptions {
  /** Cap for `findAllPaths`; guards against combinatorial blowup. */
  maxPaths?: number;
}

export interface GraphPath {
  nodeIds: readonly string[];
  edgeIds: readonly string[];
  length: number;
}

export interface TraversalHitRecord {
  node: GraphNode;
  depth: number;
  path?: GraphPath;
  viaEdgeType: GraphEdgeType | null;
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                      */
/* -------------------------------------------------------------------------- */

export type QueryErrorCode =
  | "unknown-node"
  | "unknown-node-type"
  | "unknown-edge-type"
  | "invalid-depth"
  | "invalid-limit"
  | "invalid-offset"
  | "invalid-direction"
  | "contradictory-filter"
  | "unsupported-property";

export interface QueryValidationIssue {
  code: QueryErrorCode;
  field: string;
  message: string;
}

/** Thrown only for programmer errors: malformed query definitions. */
export class GraphQueryError extends Error {
  constructor(readonly issues: readonly QueryValidationIssue[]) {
    super(`Invalid graph query: ${issues.map((i) => `${i.field}: ${i.message}`).join("; ")}`);
    this.name = "GraphQueryError";
  }
}

/** Candidate edges surfaced through opt-in queries are always labelled. */
export interface LabelledEdge extends GraphEdge {
  candidate: boolean;
}
