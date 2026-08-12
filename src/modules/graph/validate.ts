/**
 * Stage 3.5.1 — graph validation rules.
 *
 * Validation is advisory: it never throws and never blocks a build. Errors mark
 * a graph as structurally unsound (dangling edges, duplicates, illegal endpoint
 * pairs); warnings and info flag modelling gaps a human should look at.
 */

import {
  EDGE_ENDPOINT_POLICY,
  GRAPH_EDGE_TYPES,
  GRAPH_NODE_TYPES,
  GRAPH_SCHEMA_VERSION,
  type CapabilityGraph,
  type GraphEdge,
  type GraphNode,
  type GraphValidationFinding,
  type GraphValidationReport,
} from "./types";

const NODE_TYPES = new Set<string>(GRAPH_NODE_TYPES);
const EDGE_TYPES = new Set<string>(GRAPH_EDGE_TYPES);

/** Node types that are meaningless in isolation and should be connected. */
const MUST_CONNECT = new Set<string>([
  "capability",
  "sub-capability",
  "route",
  "page",
  "shared-capability",
  "platform-capability",
  "customer-extension",
]);

export function validateGraph(graph: {
  schemaVersion?: string;
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
}): GraphValidationReport {
  const findings: GraphValidationFinding[] = [];
  const add = (f: GraphValidationFinding) => findings.push(f);

  if (graph.schemaVersion && graph.schemaVersion !== GRAPH_SCHEMA_VERSION) {
    add({
      ruleId: "schema-version-mismatch",
      severity: "error",
      subject: graph.schemaVersion,
      message: `Graph schema version ${graph.schemaVersion} does not match ${GRAPH_SCHEMA_VERSION}.`,
      remediation: "Rebuild the graph with the current builder, or migrate the serialized document.",
    });
  }

  /* ------------------------------------------------------------------ nodes */
  const byId = new Map<string, GraphNode>();
  for (const node of graph.nodes) {
    if (byId.has(node.id)) {
      add({
        ruleId: "duplicate-node-id",
        severity: "error",
        subject: node.id,
        message: `Node id "${node.id}" is declared more than once.`,
        remediation: "Give each architectural object one node; merge the duplicate declarations.",
      });
      continue;
    }
    byId.set(node.id, node);

    if (!NODE_TYPES.has(node.type)) {
      add({
        ruleId: "unknown-node-type",
        severity: "error",
        subject: node.id,
        message: `Node "${node.id}" uses unknown type "${node.type}".`,
        remediation: "Use one of the registered GRAPH_NODE_TYPES.",
      });
    }

    if (!node.label || !node.label.trim()) {
      add({
        ruleId: "missing-node-label",
        severity: "warning",
        subject: node.id,
        message: `Node "${node.id}" has no label.`,
        remediation: "Give the node a human-readable label so intelligence answers stay readable.",
      });
    }

    if (
      (node.type === "capability" || node.type === "sub-capability") &&
      !node.moduleId
    ) {
      add({
        ruleId: "capability-without-module",
        severity: "warning",
        subject: node.id,
        message: `Capability "${node.id}" is not attributed to a module.`,
        remediation: "Set moduleId, or reclassify it as a shared or platform capability.",
      });
    }

    if (node.type === "shared-capability" && (!node.moduleId || node.moduleId === "unassigned")) {
      add({
        ruleId: "shared-capability-without-owner",
        severity: "warning",
        subject: node.id,
        message: `Shared capability "${node.id}" has no primary owner.`,
        remediation: "Agree a primary owner in the shared capability registry.",
      });
    }
  }

  /* ------------------------------------------------------------------ edges */
  const seenEdges = new Set<string>();
  const connected = new Set<string>();
  const belongsTo = new Map<string, string[]>();

  for (const edge of graph.edges) {
    if (seenEdges.has(edge.id)) {
      add({
        ruleId: "duplicate-edge-id",
        severity: "error",
        subject: edge.id,
        message: `Edge "${edge.id}" is declared more than once.`,
        remediation: "Deduplicate the relationship; identical triples are a single edge.",
      });
      continue;
    }
    seenEdges.add(edge.id);

    if (!EDGE_TYPES.has(edge.type)) {
      add({
        ruleId: "unknown-edge-type",
        severity: "error",
        subject: edge.id,
        message: `Edge "${edge.id}" uses unknown relationship type "${edge.type}".`,
        remediation: "Use one of the registered GRAPH_EDGE_TYPES.",
      });
      continue;
    }

    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) {
      add({
        ruleId: "dangling-edge-endpoint",
        severity: "error",
        subject: edge.id,
        message: `Edge "${edge.id}" references ${!from ? `unknown node "${edge.from}"` : `unknown node "${edge.to}"`}.`,
        remediation: "Register the missing node, or remove the relationship.",
      });
      continue;
    }

    if (edge.from === edge.to) {
      add({
        ruleId: "self-referencing-edge",
        severity: "error",
        subject: edge.id,
        message: `Edge "${edge.id}" points a node at itself.`,
        remediation: "Remove the self-loop; relationships must connect two distinct objects.",
      });
      continue;
    }

    const policy = EDGE_ENDPOINT_POLICY[edge.type];
    if (!policy.from.includes(from.type) || !policy.to.includes(to.type)) {
      add({
        ruleId: "invalid-edge-endpoint-type",
        severity: "error",
        subject: edge.id,
        message: `${edge.type} is not allowed from "${from.type}" to "${to.type}".`,
        remediation: `Allowed: ${policy.from.join("|")} → ${policy.to.join("|")}. Pick a relationship type that matches the endpoints.`,
      });
      continue;
    }

    connected.add(edge.from);
    connected.add(edge.to);
    if (edge.type === "BELONGS_TO") {
      belongsTo.set(edge.from, [...(belongsTo.get(edge.from) ?? []), edge.to]);
    }
  }

  /* --------------------------------------------------------------- topology */
  for (const node of byId.values()) {
    if (MUST_CONNECT.has(node.type) && !connected.has(node.id)) {
      add({
        ruleId: "orphan-node",
        severity: "info",
        subject: node.id,
        message: `Node "${node.id}" has no relationships.`,
        remediation: "Attach it to its owning module or capability so it can be reasoned about.",
      });
    }
  }

  for (const start of belongsTo.keys()) {
    const cycle = findCycle(start, belongsTo);
    if (cycle) {
      add({
        ruleId: "cyclic-belongs-to",
        severity: "error",
        subject: start,
        message: `BELONGS_TO containment cycle: ${cycle.join(" → ")}.`,
        remediation: "Containment must be a tree; break the cycle at the incorrect parent.",
      });
      break;
    }
  }

  const errorCount = findings.filter((f) => f.severity === "error").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const infoCount = findings.filter((f) => f.severity === "info").length;

  return {
    nodeCount: byId.size,
    edgeCount: seenEdges.size,
    findings,
    errorCount,
    warningCount,
    infoCount,
    ok: errorCount === 0,
  };
}

function findCycle(start: string, parents: Map<string, string[]>): string[] | null {
  const stack: { id: string; path: string[] }[] = [{ id: start, path: [start] }];
  const seen = new Set<string>();
  while (stack.length) {
    const { id, path } = stack.pop()!;
    for (const parent of parents.get(id) ?? []) {
      if (parent === start) return [...path, parent];
      if (seen.has(parent)) continue;
      seen.add(parent);
      stack.push({ id: parent, path: [...path, parent] });
    }
  }
  return null;
}
