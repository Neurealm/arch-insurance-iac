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

/**
 * Stage 3.5.4.2.1 — normalizes the `?root=` parameter.
 *
 * An absent, empty or whitespace-only parameter is treated as "no root
 * requested", so it resolves to the deterministic initial root exactly like a
 * missing parameter. A non-empty value is returned verbatim: canonical
 * identifiers are never trimmed or rewritten, so an id with stray whitespace
 * stays invalid rather than silently resolving to a different node.
 */
export function resolveRootParam(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  if (raw.trim().length === 0) return null;
  return raw;
}
