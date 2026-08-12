/**
 * Stage 3.5.4.2 — node visual taxonomy.
 *
 * The canonical schema declares 19 node types. Nineteen unique visual
 * treatments would be unreadable on a bounded canvas, so the explorer groups
 * them into six documented visual families. The canonical node type is always
 * rendered as text on the node and in every accessible label, so the grouping
 * never hides the underlying taxonomy and never replaces it.
 */

import { GRAPH_NODE_TYPES, type GraphNodeType } from "@/modules/graph/types";
import type { StatusTone } from "@/runops/components/variants";

export type NodeVisualGroup =
  | "capability"
  | "surface"
  | "service"
  | "module"
  | "automation"
  | "governance";

export const NODE_VISUAL_GROUPS: readonly NodeVisualGroup[] = [
  "capability",
  "surface",
  "service",
  "module",
  "automation",
  "governance",
];

/** Every canonical node type maps to exactly one visual group. */
export const NODE_GROUP_BY_TYPE: Readonly<Record<GraphNodeType, NodeVisualGroup>> = {
  capability: "capability",
  "sub-capability": "capability",
  "shared-capability": "capability",
  "platform-capability": "capability",
  route: "surface",
  page: "surface",
  component: "surface",
  dashboard: "surface",
  report: "surface",
  service: "service",
  api: "service",
  integration: "service",
  "database-entity": "service",
  module: "module",
  "customer-extension": "module",
  workflow: "automation",
  "ai-agent": "automation",
  persona: "governance",
  permission: "governance",
};

export interface NodeGroupSpec {
  group: NodeVisualGroup;
  label: string;
  /** Short non-colour marker rendered alongside the label. */
  marker: string;
  tone: StatusTone;
  description: string;
}

export const NODE_GROUP_SPECS: Readonly<Record<NodeVisualGroup, NodeGroupSpec>> = {
  capability: {
    group: "capability",
    label: "Capability",
    marker: "CAP",
    tone: "connected",
    description: "Capabilities, sub-capabilities, shared and platform capabilities.",
  },
  surface: {
    group: "surface",
    label: "Application surface",
    marker: "APP",
    tone: "recovering",
    description: "Routes, pages, components, dashboards and reports.",
  },
  service: {
    group: "service",
    label: "Service and data",
    marker: "SVC",
    tone: "healthy",
    description: "Services, APIs, integrations and database entities.",
  },
  module: {
    group: "module",
    label: "Module",
    marker: "MOD",
    tone: "simulation",
    description: "Modules and customer extensions.",
  },
  automation: {
    group: "automation",
    label: "Automation",
    marker: "AUT",
    tone: "degraded",
    description: "Workflows and AI agents.",
  },
  governance: {
    group: "governance",
    label: "Governance",
    marker: "GOV",
    tone: "neutral",
    description: "Personas and permissions.",
  },
};

export const groupForNodeType = (type: GraphNodeType): NodeVisualGroup => NODE_GROUP_BY_TYPE[type];

export const specForNodeType = (type: GraphNodeType): NodeGroupSpec =>
  NODE_GROUP_SPECS[NODE_GROUP_BY_TYPE[type]];

/** Guard used by tests: no canonical node type may be left unmapped. */
export const unmappedNodeTypes = (): readonly GraphNodeType[] =>
  GRAPH_NODE_TYPES.filter((t) => !(t in NODE_GROUP_BY_TYPE));
