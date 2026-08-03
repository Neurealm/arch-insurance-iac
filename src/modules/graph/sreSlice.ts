/**
 * Stage 3.5.2 — SRE graph slice.
 *
 * Extracts everything the graph knows about the SRE module and verifies two
 * invariants that Stage 2 and Stage 3 established:
 *
 *   1. platform chrome (shell, auth, telemetry) is not counted as SRE-owned
 *      capability evidence;
 *   2. mock or static representation is never promoted to operational
 *      implementation merely because the node is well connected.
 */

import { GRAPH_SCHEMA_VERSION, type CapabilityGraph, type GraphNode } from "./types";
import type { SreGraphSlice } from "./populationTypes";
import { getPopulatedGraph } from "./populate";
import { queryGraph } from "./query";
import { SRE_PAGE_EVIDENCE } from "../sre/evidence.generated";
import { SRE_CAPABILITY_HIERARCHY } from "../sre/capabilityHierarchy";

export const SRE_MODULE_ID = "sre";

export function buildSreGraphSlice(
  graph: CapabilityGraph = getPopulatedGraph().graph,
  moduleId: string = SRE_MODULE_ID,
): SreGraphSlice {
  const q = queryGraph(graph);
  const moduleNodeId = `module:${moduleId}`;
  const moduleNode = q.node(moduleNodeId) ?? null;

  const owned = graph.nodes.filter((n) => n.moduleId === moduleId || n.id === moduleNodeId);
  const ownedIds = new Set(owned.map((n) => n.id));

  const consumedShared = graph.edges
    .filter((e) => e.from === moduleNodeId && e.type === "CONSUMES")
    .map((e) => q.node(e.to))
    .filter((n): n is GraphNode => Boolean(n) && n!.type === "shared-capability");

  const consumedPlatform = graph.edges
    .filter((e) => e.from === moduleNodeId && e.type === "CONSUMES")
    .map((e) => q.node(e.to))
    .filter((n): n is GraphNode => Boolean(n) && n!.type === "platform-capability");

  for (const n of [...consumedShared, ...consumedPlatform]) ownedIds.add(n.id);

  const byType: Record<string, GraphNode[]> = {};
  const countsByType: Record<string, number> = {};
  for (const node of owned) {
    byType[node.type] = [...(byType[node.type] ?? []), node];
  }
  for (const [type, nodes] of Object.entries(byType)) countsByType[type] = nodes.length;

  const evidenceStrengths: Record<string, number> = {};
  for (const record of SRE_PAGE_EVIDENCE) {
    evidenceStrengths[record.evidenceStrength] = (evidenceStrengths[record.evidenceStrength] ?? 0) + 1;
  }

  const implementationClassifications: Record<string, number> = {};
  for (const node of SRE_CAPABILITY_HIERARCHY.nodes) {
    implementationClassifications[node.implementationClassification] =
      (implementationClassifications[node.implementationClassification] ?? 0) + 1;
  }

  const chrome = new Set(SRE_PAGE_EVIDENCE.flatMap((r) => r.platformChrome));
  const platformChromeExcluded = [...chrome]
    .sort()
    .filter((file) => !owned.some((n) => n.filePath === file && n.ownership === "module-owned"));

  /* A node is "promoted" if the graph implies operational implementation while
     the evidence record says the page is mock, static or visual only. */
  const weak = new Set(["visual-only", "static-data", "mock-service", "client-side-functional"]);
  const promotedMockNodes = graph.nodes
    .filter(
      (n) =>
        ownedIds.has(n.id) &&
        weak.has(String(n.attributes.evidenceStrength ?? "")) &&
        String(n.attributes.implementationClassification ?? "") === "operational-implementation",
    )
    .map((n) => n.id)
    .sort();

  const nodes = graph.nodes.filter((n) => ownedIds.has(n.id));
  const edges = graph.edges.filter((e) => ownedIds.has(e.from) && ownedIds.has(e.to));

  return {
    moduleNode,
    byType,
    countsByType,
    consumedSharedCapabilities: consumedShared,
    consumedPlatformCapabilities: consumedPlatform,
    evidenceStrengths,
    implementationClassifications,
    platformChromeExcluded,
    promotedMockNodes,
    subgraph: { schemaVersion: GRAPH_SCHEMA_VERSION, version: graph.version, nodes, edges },
  };
}
