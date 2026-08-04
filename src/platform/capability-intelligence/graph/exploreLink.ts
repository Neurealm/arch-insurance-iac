/**
 * Stage 3.5.4.2 — cross-screen "Explore relationships" navigation contract.
 *
 * Other Capability Intelligence screens deep-link into the Graph Explorer with
 * a root entity. Navigation is a plain client-side route change inside the
 * existing route group, so the Capability Intelligence provider (and therefore
 * `analyzeGraph()`) is never remounted or recomputed.
 */

export const GRAPH_EXPLORER_PATH = "/platform/capability-intelligence/graph";

/** Query-string parameter carrying the requested root node id. */
export const GRAPH_ROOT_PARAM = "root";

/** Builds the Graph Explorer URL rooted at `nodeId`. */
export function graphExplorerLink(nodeId: string): string {
  return `${GRAPH_EXPLORER_PATH}?${GRAPH_ROOT_PARAM}=${encodeURIComponent(nodeId)}`;
}

/** Accessible, consistent label for every cross-screen entry point. */
export function exploreRelationshipsLabel(label?: string): string {
  return label ? `Explore relationships for ${label}` : "Explore relationships";
}
