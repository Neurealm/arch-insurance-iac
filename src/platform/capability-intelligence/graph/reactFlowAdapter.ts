/**
 * Stage 3.5.4.2 — canonical graph → React Flow presentation adapter.
 *
 * Produces presentation-only view models for the existing RunOps React Flow
 * canvas (`src/runops/components/graphs.tsx`). No second graph domain model is
 * created: canonical nodes and edges stay the source of truth and are never
 * mutated here. Positions come from the deterministic layered layout.
 */

import type { GraphNode as RunOpsNode, GraphEdge as RunOpsEdge } from "@/runops/components/graphs";
import type { GraphLayout } from "./graphLayout";
import type { GraphView, GraphViewEdge, GraphViewNode } from "./graphViewTypes";
import { specForNodeType } from "./nodeTaxonomy";

/** Registration state, using the same mapping as the Explorer and Drawer. */
export const registrationOf = (node: GraphViewNode["node"]): string =>
  node.attributes.registered === false
    ? "unregistered"
    : node.attributes.registered === true
      ? "registered"
      : "n/a";

/** Accessible, colour-independent description of a visible node. */
export function nodeAccessibleLabel(view: GraphViewNode): string {
  const parts = [
    view.node.label,
    `type ${view.node.type}`,
    view.isRoot ? "root entity" : `${view.side}, depth ${view.depth}`,
    `registration ${registrationOf(view.node)}`,
  ];
  if (view.node.moduleId) parts.push(`owned by ${view.node.moduleId}`);
  return parts.join(", ");
}

/** Accessible description of a visible relationship. */
export function edgeAccessibleLabel(edge: GraphViewEdge): string {
  return [
    `${edge.edge.type} relationship`,
    `from ${edge.edge.from}`,
    `to ${edge.edge.to}`,
    edge.candidate ? "candidate relationship" : "confirmed relationship",
    `confidence ${edge.edge.confidence}`,
  ].join(", ");
}

/**
 * Node view models. The canonical node type is always rendered as text, so
 * type, root state and registration are never conveyed by colour alone.
 */
export function toCanvasNodes(view: GraphView, layout: GraphLayout): RunOpsNode[] {
  return view.nodes.map((n) => {
    const spec = specForNodeType(n.node.type);
    const position = layout.positions.get(n.id);
    const registration = registrationOf(n.node);
    const sublabel = [
      n.isRoot ? "★ ROOT" : spec.marker,
      n.node.type,
      registration === "n/a" ? null : registration,
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      id: n.id,
      label: n.node.label,
      sublabel,
      tone: n.isRoot ? "simulation" : spec.tone,
      kind: n.node.type,
      x: position?.x ?? 0,
      y: position?.y ?? 0,
    };
  });
}

/** Edge view models. Candidates render dashed and are labelled as candidates. */
export function toCanvasEdges(view: GraphView): RunOpsEdge[] {
  return view.edges.map((e) => ({
    id: e.id,
    source: e.edge.from,
    target: e.edge.to,
    label: e.candidate ? `${e.edge.type} (candidate)` : e.edge.type,
    dashed: e.candidate,
  }));
}
