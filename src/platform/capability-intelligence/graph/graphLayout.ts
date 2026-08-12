/**
 * Stage 3.5.4.2 — deterministic layered layout.
 *
 * No layout library exists in the repository and none is added. This is a
 * pure, arithmetic layered layout: no force simulation, no physics, no runtime
 * timing. Identical inputs always produce identical positions, and input array
 * ordering never affects output, because every layer is sorted by canonical
 * keys before positions are assigned.
 *
 * Layering
 *  - Both directions: root at layer 0, dependencies at negative layers (left),
 *    dependents at positive layers (right); |layer| is traversal depth.
 *  - Single direction: root at layer 0, traversal layers flow left to right.
 *
 * Within a layer, nodes are ordered by node type, then normalized label, then
 * canonical node identifier — the same tie-break ladder used for initial-root
 * selection.
 */

import type { GraphDirection, GraphView, GraphViewNode } from "./graphViewTypes";

/** Horizontal distance between traversal layers, in canvas units. */
export const LAYER_SPACING = 260;
/** Vertical distance between sibling nodes inside a layer. */
export const ROW_SPACING = 96;

export interface LayoutPosition {
  x: number;
  y: number;
  /** Signed layer index; 0 is the root layer. */
  layer: number;
  /** Position of the node within its layer, top to bottom. */
  indexInLayer: number;
}

export interface GraphLayout {
  positions: ReadonlyMap<string, LayoutPosition>;
  /** Signed layer indices actually used, ascending. */
  layers: readonly number[];
  /** Node ids per layer, in render order. */
  layerMembers: ReadonlyMap<number, readonly string[]>;
}

/**
 * Signed layer for a node. Cycles are safe: depth comes from the Query
 * Engine's breadth-first traversal, which visits each node once at its minimum
 * depth, so a cycle can never extend the layer set indefinitely.
 */
export function layerFor(node: GraphViewNode, direction: GraphDirection): number {
  if (node.isRoot || node.side === "root") return 0;
  if (direction === "both") return node.side === "dependency" ? -node.depth : node.depth;
  return node.depth;
}

const compareInLayer = (a: GraphViewNode, b: GraphViewNode): number =>
  a.node.type.localeCompare(b.node.type) ||
  a.node.label.trim().toLowerCase().localeCompare(b.node.label.trim().toLowerCase()) ||
  a.id.localeCompare(b.id);

/** Deterministic layered layout over an already-bounded graph view. */
export function layoutGraphView(view: Pick<GraphView, "nodes" | "request">): GraphLayout {
  const direction = view.request.direction;
  const byLayer = new Map<number, GraphViewNode[]>();
  for (const node of view.nodes) {
    const layer = layerFor(node, direction);
    const bucket = byLayer.get(layer);
    if (bucket) bucket.push(node);
    else byLayer.set(layer, [node]);
  }

  const layers = [...byLayer.keys()].sort((a, b) => a - b);
  const positions = new Map<string, LayoutPosition>();
  const layerMembers = new Map<number, readonly string[]>();

  for (const layer of layers) {
    const members = [...(byLayer.get(layer) ?? [])].sort(compareInLayer);
    const count = members.length;
    members.forEach((node, index) => {
      positions.set(node.id, {
        x: layer * LAYER_SPACING,
        y: Math.round((index - (count - 1) / 2) * ROW_SPACING),
        layer,
        indexInLayer: index,
      });
    });
    layerMembers.set(
      layer,
      members.map((m) => m.id),
    );
  }

  return { positions, layers, layerMembers };
}
