/**
 * Stage 3.5.4.2 — deterministic initial root selection.
 *
 * The explorer must open on a meaningful neighbourhood rather than an empty
 * canvas, and the same graph content must always produce the same root. No
 * node identifier is hardcoded.
 *
 * Policy (in order):
 *   1. Capability-family node (`capability`, `sub-capability`,
 *      `shared-capability`, `platform-capability`) that is not explicitly
 *      unregistered (`attributes.registered !== false`), with the highest total
 *      graph degree.
 *   2. Otherwise the connected node with the highest total graph degree.
 *   3. Otherwise `null` — the shared empty state is shown.
 *
 * Ties are resolved by normalized label, then by canonical node identifier.
 *
 * Degree counts confirmed edges only, matching the canonical orphan definition
 * in `presentation.ts`: candidate relationships are not connectivity.
 */

import type { CapabilityGraph, GraphNode, GraphNodeType } from "@/modules/graph/types";

/** Node types that represent a capability in the canonical taxonomy. */
export const CAPABILITY_NODE_TYPES: readonly GraphNodeType[] = [
  "capability",
  "platform-capability",
  "shared-capability",
  "sub-capability",
];

const CAPABILITY_TYPE_SET = new Set<string>(CAPABILITY_NODE_TYPES);

export const normalizeLabel = (label: string): string => label.trim().toLowerCase();

/**
 * A node counts as registered unless registration is explicitly recorded as
 * `false`. Capability nodes in the current graph carry no registration
 * attribute at all, which the existing UI renders as "n/a" rather than
 * "unregistered"; treating absent registration as disqualifying would leave
 * the policy with no capability candidates at all.
 */
export const isRegistered = (node: GraphNode): boolean => node.attributes.registered !== false;

export const isCapabilityNode = (node: GraphNode): boolean => CAPABILITY_TYPE_SET.has(node.type);

/** Total confirmed-edge degree per node id. */
export function buildDegreeIndex(
  graph: Pick<CapabilityGraph, "edges">,
): ReadonlyMap<string, number> {
  const degree = new Map<string, number>();
  for (const edge of graph.edges) {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
  }
  return degree;
}

export type InitialRootBasis =
  | "registered-capability"
  | "highest-degree-connected"
  | "none";

export interface InitialRootSelection {
  nodeId: string | null;
  basis: InitialRootBasis;
  degree: number;
  /** Human-readable rationale rendered next to the root selector. */
  explanation: string;
}

const EXPLANATIONS: Readonly<Record<InitialRootBasis, string>> = {
  "registered-capability":
    "Initial focus selected deterministically from the most connected registered capability.",
  "highest-degree-connected":
    "Initial focus selected deterministically from the most connected graph entity; no registered capability was available.",
  none: "No connected entity exists in this graph, so no initial focus could be selected.",
};

/**
 * Picks the best node from a candidate set: highest degree, then normalized
 * label, then canonical identifier. Input ordering never affects the outcome.
 */
function pickBest(
  candidates: readonly GraphNode[],
  degree: ReadonlyMap<string, number>,
): GraphNode | null {
  let best: GraphNode | null = null;
  let bestDegree = -1;
  let bestLabel = "";
  for (const node of candidates) {
    const d = degree.get(node.id) ?? 0;
    const label = normalizeLabel(node.label);
    if (best === null) {
      best = node;
      bestDegree = d;
      bestLabel = label;
      continue;
    }
    if (d > bestDegree) {
      best = node;
      bestDegree = d;
      bestLabel = label;
      continue;
    }
    if (d < bestDegree) continue;
    const labelCmp = label.localeCompare(bestLabel);
    if (labelCmp < 0 || (labelCmp === 0 && node.id.localeCompare(best.id) < 0)) {
      best = node;
      bestDegree = d;
      bestLabel = label;
    }
  }
  return best;
}

/** Deterministic initial root for a graph. Pure; safe to memoize by graph hash. */
export function selectInitialRoot(
  graph: Pick<CapabilityGraph, "nodes" | "edges">,
): InitialRootSelection {
  const degree = buildDegreeIndex(graph);

  const capabilities = graph.nodes.filter(
    (n) => isCapabilityNode(n) && isRegistered(n) && (degree.get(n.id) ?? 0) > 0,
  );
  const capability = pickBest(capabilities, degree);
  if (capability) {
    return {
      nodeId: capability.id,
      basis: "registered-capability",
      degree: degree.get(capability.id) ?? 0,
      explanation: EXPLANATIONS["registered-capability"],
    };
  }

  const connected = graph.nodes.filter((n) => (degree.get(n.id) ?? 0) > 0);
  const fallback = pickBest(connected, degree);
  if (fallback) {
    return {
      nodeId: fallback.id,
      basis: "highest-degree-connected",
      degree: degree.get(fallback.id) ?? 0,
      explanation: EXPLANATIONS["highest-degree-connected"],
    };
  }

  return { nodeId: null, basis: "none", degree: 0, explanation: EXPLANATIONS.none };
}
