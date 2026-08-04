/**
 * Stage 3.5.3.4 — immutable graph overlay.
 *
 * The overlay is a *virtual* graph: it starts from the canonical graph, applies
 * proposed operations to freshly allocated arrays, and returns a new
 * `CapabilityGraph` document with a deterministic content hash. The canonical
 * graph object, its nodes, its edges and every downstream index are left
 * untouched, and the overlay can be discarded at any point.
 */

import {
  GRAPH_SCHEMA_VERSION,
  type CapabilityGraph,
  type GraphEdge,
  type GraphNode,
} from "../types";
import { computeGraphHash } from "../serialize";
import {
  SIMULATION_GENERATOR,
  sortedUnique,
  type OverlayConstruction,
  type ProposedChange,
  type ProposedEdgePayload,
  type ProposedNodePayload,
} from "./SimulationTypes";

export const edgeIdFor = (edge: Pick<GraphEdge, "from" | "to" | "type">): string =>
  `${edge.from}|${edge.type}|${edge.to}`;

const nodeFromPayload = (payload: ProposedNodePayload, changeId: string): GraphNode => ({
  id: payload.id,
  type: payload.type,
  label: payload.label,
  moduleId: payload.moduleId,
  ownership: payload.moduleId ? "module-owned" : "unassigned",
  source: "derived",
  confidence: "medium",
  filePath: null,
  evidence: [`simulation:${changeId}`],
  attributes: { ...(payload.attributes ?? {}), simulated: true },
});

const edgeFromPayload = (payload: ProposedEdgePayload, changeId: string): GraphEdge => ({
  id: edgeIdFor(payload),
  type: payload.type,
  from: payload.from,
  to: payload.to,
  source: "derived",
  confidence: "medium",
  evidence: [`simulation:${changeId}`],
  attributes: { ...(payload.attributes ?? {}), simulated: true },
});

export interface OverlayResult {
  graph: CapabilityGraph;
  construction: OverlayConstruction;
}

/**
 * Applies changes to an isolated copy of the graph. Unknown or inapplicable
 * operations are skipped and reported rather than throwing; validation is the
 * dedicated concern of `ProposalValidation`.
 */
export function buildOverlay(
  canonical: CapabilityGraph,
  changes: readonly ProposedChange[],
): OverlayResult {
  const nodes = new Map<string, GraphNode>(canonical.nodes.map((n) => [n.id, n]));
  const edges = new Map<string, GraphEdge>(canonical.edges.map((e) => [e.id, e]));

  const applied: string[] = [];
  const skipped: string[] = [];
  const addedNodes: string[] = [];
  const removedNodes: string[] = [];
  const modifiedNodes: string[] = [];
  const addedEdges: string[] = [];
  const removedEdges: string[] = [];
  const notes: string[] = [];

  const addNode = (payload: ProposedNodePayload, changeId: string): boolean => {
    if (nodes.has(payload.id)) return false;
    nodes.set(payload.id, nodeFromPayload(payload, changeId));
    addedNodes.push(payload.id);
    return true;
  };

  const addEdge = (payload: ProposedEdgePayload, changeId: string): boolean => {
    const id = edgeIdFor(payload);
    if (edges.has(id)) return false;
    if (!nodes.has(payload.from) || !nodes.has(payload.to)) return false;
    edges.set(id, edgeFromPayload(payload, changeId));
    addedEdges.push(id);
    return true;
  };

  const removeEdgeById = (id: string): boolean => {
    if (!edges.has(id)) return false;
    edges.delete(id);
    removedEdges.push(id);
    return true;
  };

  const patchNode = (
    id: string,
    patch: Partial<Pick<GraphNode, "moduleId" | "ownership" | "label">>,
    attributes: Readonly<Record<string, GraphNode["attributes"][string]>> = {},
  ): boolean => {
    const current = nodes.get(id);
    if (!current) return false;
    nodes.set(id, {
      ...current,
      ...patch,
      attributes: { ...current.attributes, ...attributes },
    });
    modifiedNodes.push(id);
    return true;
  };

  for (const change of [...changes].sort((a, b) => a.id.localeCompare(b.id))) {
    let ok = false;
    switch (change.operation) {
      case "add-node":
        ok = change.node ? addNode(change.node, change.id) : false;
        break;

      case "add-edge":
      case "add-lineage-relationship":
      case "promote-candidate-edge":
      case "add-route-registration":
      case "add-service-registration":
      case "add-capability-registration":
      case "add-platform-registration":
      case "add-module-registration": {
        // Registration operations may introduce the registered node first.
        if (change.node && !nodes.has(change.node.id)) addNode(change.node, change.id);
        ok = change.edge ? addEdge(change.edge, change.id) : false;
        break;
      }

      case "remove-node": {
        const id = change.target.id;
        if (nodes.has(id)) {
          nodes.delete(id);
          removedNodes.push(id);
          for (const [edgeId, edge] of [...edges]) {
            if (edge.from === id || edge.to === id) removeEdgeById(edgeId);
          }
          ok = true;
        }
        break;
      }

      case "remove-edge":
        ok = removeEdgeById(change.target.id);
        break;

      case "replace-edge": {
        const removed = removeEdgeById(change.target.id);
        const added = change.replacementEdge ? addEdge(change.replacementEdge, change.id) : false;
        ok = removed && added;
        break;
      }

      case "update-node-metadata":
        ok = patchNode(change.target.id, {}, change.metadata ?? {});
        break;

      case "update-edge-metadata": {
        const current = edges.get(change.target.id);
        if (current) {
          edges.set(current.id, {
            ...current,
            attributes: { ...current.attributes, ...(change.metadata ?? {}) },
          });
          ok = true;
        }
        break;
      }

      case "declare-ownership":
      case "replace-ownership": {
        const owner = change.ownerModuleId ?? null;
        ok = patchNode(
          change.target.id,
          { moduleId: owner, ownership: owner ? "module-owned" : "unassigned" },
          { ownershipDeclared: true },
        );
        if (ok && change.edge) addEdge(change.edge, change.id);
        break;
      }

      case "mark-expected-by-design":
        ok = patchNode(change.target.id, {}, {
          expectedByDesign: true,
          expectedByDesignJustification: String(
            change.metadata?.expectedByDesignJustification ?? "",
          ),
        });
        break;

      case "reject-candidate-edge":
        // A rejection records a governance decision; the canonical graph never
        // contained the candidate edge, so the overlay content is unchanged.
        ok = true;
        notes.push(`Candidate edge "${change.target.id}" rejected; overlay content unchanged.`);
        break;

      default:
        ok = false;
    }
    if (ok) applied.push(change.id);
    else skipped.push(change.id);
  }

  const nextNodes = [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id));
  const nextEdges = [...edges.values()].sort((a, b) => a.id.localeCompare(b.id));
  const contentHash = computeGraphHash(nextNodes, nextEdges);

  const graph: CapabilityGraph = {
    schemaVersion: GRAPH_SCHEMA_VERSION,
    version: {
      version: canonical.version.version,
      contentHash,
      generator: SIMULATION_GENERATOR,
      // Fixed epoch: the overlay must never carry a runtime timestamp.
      generatedAt: new Date(0).toISOString(),
      previousContentHash: canonical.version.contentHash,
    },
    nodes: nextNodes,
    edges: nextEdges,
  };

  return {
    graph,
    construction: {
      baseContentHash: canonical.version.contentHash,
      overlayContentHash: contentHash,
      appliedChangeIds: sortedUnique(applied),
      skippedChangeIds: sortedUnique(skipped),
      addedNodeIds: sortedUnique(addedNodes),
      removedNodeIds: sortedUnique(removedNodes),
      modifiedNodeIds: sortedUnique(modifiedNodes.filter((id) => !removedNodes.includes(id))),
      addedEdgeIds: sortedUnique(addedEdges),
      removedEdgeIds: sortedUnique(removedEdges),
      nodeCountBefore: canonical.nodes.length,
      nodeCountAfter: nextNodes.length,
      edgeCountBefore: canonical.edges.length,
      edgeCountAfter: nextEdges.length,
      notes,
    },
  };
}
