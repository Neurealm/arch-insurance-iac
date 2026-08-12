/**
 * Stage 3.5.1 — graph serialization and versioning.
 *
 * Serialization is deterministic: the same graph content always produces the
 * same bytes and the same content hash, regardless of build order or clock.
 * `generatedAt` is deliberately excluded from the hash so that rebuilding an
 * unchanged codebase does not look like a change.
 */

import {
  GRAPH_SCHEMA_VERSION,
  type CapabilityGraph,
  type GraphEdge,
  type GraphNode,
  type GraphVersion,
} from "./types";
import { validateGraph } from "./validate";

/* -------------------------------------------------------------------------- */
/* Hashing                                                                     */
/* -------------------------------------------------------------------------- */

/** FNV-1a (32-bit), hex encoded. Deterministic and dependency free. */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

const sortedJson = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(sortedJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${sortedJson(v)}`).join(",")}}`;
};

export const sortNodes = (nodes: readonly GraphNode[]): GraphNode[] =>
  [...nodes].sort((a, b) => a.id.localeCompare(b.id));

export const sortEdges = (edges: readonly GraphEdge[]): GraphEdge[] =>
  [...edges].sort((a, b) => a.id.localeCompare(b.id));

/** Deterministic content hash of nodes and edges only. */
export function computeGraphHash(
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[],
): string {
  return fnv1a(
    `${GRAPH_SCHEMA_VERSION}|${sortedJson(sortNodes(nodes))}|${sortedJson(sortEdges(edges))}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Versioning                                                                  */
/* -------------------------------------------------------------------------- */

export interface VersionInput {
  generator: string;
  generatedAt?: string;
  previous?: GraphVersion | null;
}

/**
 * Produce the version record for a graph. The version integer only advances
 * when the content hash changes, so repeated builds are idempotent.
 */
export function nextGraphVersion(
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[],
  input: VersionInput,
): GraphVersion {
  const contentHash = computeGraphHash(nodes, edges);
  const previous = input.previous ?? null;
  const unchanged = previous?.contentHash === contentHash;
  return {
    version: previous ? (unchanged ? previous.version : previous.version + 1) : 1,
    contentHash,
    generator: input.generator,
    generatedAt: input.generatedAt ?? new Date(0).toISOString(),
    previousContentHash: previous?.contentHash ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Serialize / deserialize                                                     */
/* -------------------------------------------------------------------------- */

export function serializeGraph(graph: CapabilityGraph, pretty = false): string {
  const normalized: CapabilityGraph = {
    schemaVersion: graph.schemaVersion,
    version: graph.version,
    nodes: sortNodes(graph.nodes),
    edges: sortEdges(graph.edges),
  };
  return pretty ? JSON.stringify(normalized, null, 2) : sortedJson(normalized);
}

export interface DeserializeResult {
  graph: CapabilityGraph | null;
  errors: readonly string[];
}

export function deserializeGraph(json: string): DeserializeResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    return { graph: null, errors: [`Invalid JSON: ${(error as Error).message}`] };
  }

  const doc = parsed as Partial<CapabilityGraph>;
  const errors: string[] = [];
  if (doc?.schemaVersion !== GRAPH_SCHEMA_VERSION) {
    errors.push(
      `Unsupported schema version "${String(doc?.schemaVersion)}"; expected ${GRAPH_SCHEMA_VERSION}.`,
    );
  }
  if (!Array.isArray(doc?.nodes)) errors.push("Document has no nodes array.");
  if (!Array.isArray(doc?.edges)) errors.push("Document has no edges array.");
  if (!doc?.version || typeof doc.version.contentHash !== "string") {
    errors.push("Document has no version record.");
  }
  if (errors.length) return { graph: null, errors };

  const graph = doc as CapabilityGraph;
  const report = validateGraph(graph);
  if (!report.ok) {
    errors.push(...report.findings.filter((f) => f.severity === "error").map((f) => f.message));
    return { graph: null, errors };
  }

  const actualHash = computeGraphHash(graph.nodes, graph.edges);
  if (actualHash !== graph.version.contentHash) {
    errors.push(
      `Content hash mismatch: document declares ${graph.version.contentHash}, content hashes to ${actualHash}.`,
    );
    return { graph: null, errors };
  }

  return { graph, errors: [] };
}

/* -------------------------------------------------------------------------- */
/* Diffing                                                                     */
/* -------------------------------------------------------------------------- */

export interface GraphDiff {
  changed: boolean;
  addedNodes: readonly string[];
  removedNodes: readonly string[];
  modifiedNodes: readonly string[];
  addedEdges: readonly string[];
  removedEdges: readonly string[];
}

export function diffGraphs(before: CapabilityGraph, after: CapabilityGraph): GraphDiff {
  const beforeNodes = new Map(before.nodes.map((n) => [n.id, sortedJson(n)]));
  const afterNodes = new Map(after.nodes.map((n) => [n.id, sortedJson(n)]));
  const beforeEdges = new Set(before.edges.map((e) => e.id));
  const afterEdges = new Set(after.edges.map((e) => e.id));

  const addedNodes = [...afterNodes.keys()].filter((id) => !beforeNodes.has(id)).sort();
  const removedNodes = [...beforeNodes.keys()].filter((id) => !afterNodes.has(id)).sort();
  const modifiedNodes = [...afterNodes.keys()]
    .filter((id) => beforeNodes.has(id) && beforeNodes.get(id) !== afterNodes.get(id))
    .sort();
  const addedEdges = [...afterEdges].filter((id) => !beforeEdges.has(id)).sort();
  const removedEdges = [...beforeEdges].filter((id) => !afterEdges.has(id)).sort();

  return {
    changed:
      before.version.contentHash !== after.version.contentHash ||
      addedNodes.length > 0 ||
      removedNodes.length > 0 ||
      modifiedNodes.length > 0 ||
      addedEdges.length > 0 ||
      removedEdges.length > 0,
    addedNodes,
    removedNodes,
    modifiedNodes,
    addedEdges,
    removedEdges,
  };
}
