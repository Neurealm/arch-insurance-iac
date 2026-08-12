/**
 * Stage 3.5.2 — graph statistics.
 *
 * Density is not a quality target: these numbers exist to expose completeness,
 * provenance and correctness gaps, not to be maximised.
 */

import type { CapabilityGraph, GraphOwnership } from "./types";
import type { CandidateEdge, GraphStatistics } from "./populationTypes";
import { getPopulatedGraph } from "./populate";
import { nodeDegrees } from "./reconcile";
import { analyzeOrphans } from "./orphans";
import { reconcileGraph } from "./reconcile";

export function graphStatistics(
  graph: CapabilityGraph = getPopulatedGraph().graph,
  candidateEdges: readonly CandidateEdge[] = getPopulatedGraph().candidateEdges,
): GraphStatistics {
  const nodesByType: Record<string, number> = {};
  const nodesByOwnership: Record<GraphOwnership, number> = {
    "module-owned": 0,
    shared: 0,
    "platform-owned": 0,
    "customer-owned": 0,
    unassigned: 0,
  };
  const nodesByEvidenceStrength: Record<string, number> = {};
  let unregistered = 0;

  for (const n of graph.nodes) {
    nodesByType[n.type] = (nodesByType[n.type] ?? 0) + 1;
    nodesByOwnership[n.ownership] += 1;
    const strength = String(n.attributes.evidenceStrength ?? "not-assessed");
    nodesByEvidenceStrength[strength] = (nodesByEvidenceStrength[strength] ?? 0) + 1;
    if (n.attributes.registered === false) unregistered += 1;
  }

  const edgesByType: Record<string, number> = {};
  const edgesByEvidenceClassification: Record<string, number> = {};
  for (const e of graph.edges) {
    edgesByType[e.type] = (edgesByType[e.type] ?? 0) + 1;
    const cls = String(e.attributes.evidenceClassification ?? "declared");
    edgesByEvidenceClassification[cls] = (edgesByEvidenceClassification[cls] ?? 0) + 1;
  }

  const degree = nodeDegrees(graph);
  const mostConnectedNodes = [...degree.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 15)
    .map(([id, d]) => ({ id, label: graph.nodes.find((n) => n.id === id)?.label ?? id, degree: d }));

  const modulesByDependencyCount = graph.nodes
    .filter((n) => n.type === "module")
    .map((m) => ({
      moduleId: m.id.replace("module:", ""),
      dependencies: graph.edges.filter(
        (e) => e.from === m.id && (e.type === "DEPENDS_ON" || e.type === "CONSUMES" || e.type === "USES"),
      ).length,
    }))
    .sort((a, b) => b.dependencies - a.dependencies || a.moduleId.localeCompare(b.moduleId));

  const capabilitiesByImplementationSurface = graph.nodes
    .filter((n) => n.type === "capability" || n.type === "sub-capability")
    .map((c) => ({
      id: c.id,
      label: c.label,
      implementations: graph.edges.filter((e) => e.to === c.id && e.type === "IMPLEMENTS").length,
    }))
    .sort((a, b) => b.implementations - a.implementations || a.id.localeCompare(b.id))
    .slice(0, 15);

  const orphans = analyzeOrphans(graph);
  const reconciliation = reconcileGraph(graph);

  return {
    schemaVersion: graph.schemaVersion,
    generator: graph.version.generator,
    contentHash: graph.version.contentHash,
    version: graph.version.version,
    totals: {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      candidateEdges: candidateEdges.length,
      connectedComponents: connectedComponents(graph),
      orphanNodes: [...degree.values()].filter((d) => d === 0).length,
      unregisteredNodes: unregistered,
      ownershipConflicts: reconciliation.findings.filter((f) => f.ruleId === "conflicting-ownership").length,
      averageEdgesPerNode: graph.nodes.length
        ? Number(((graph.edges.length * 2) / graph.nodes.length).toFixed(3))
        : 0,
      maxGraphDepth: maxDepth(graph),
    },
    nodesByType,
    edgesByType,
    nodesByOwnership,
    nodesByEvidenceStrength,
    edgesByEvidenceClassification,
    mostConnectedNodes,
    modulesByDependencyCount,
    capabilitiesByImplementationSurface,
  };
}

/** Undirected connected components. */
export function connectedComponents(graph: CapabilityGraph): number {
  const adjacency = new Map<string, string[]>();
  for (const e of graph.edges) {
    adjacency.set(e.from, [...(adjacency.get(e.from) ?? []), e.to]);
    adjacency.set(e.to, [...(adjacency.get(e.to) ?? []), e.from]);
  }
  const seen = new Set<string>();
  let components = 0;
  for (const node of graph.nodes) {
    if (seen.has(node.id)) continue;
    components += 1;
    const stack = [node.id];
    seen.add(node.id);
    while (stack.length) {
      const current = stack.pop()!;
      for (const next of adjacency.get(current) ?? []) {
        if (seen.has(next)) continue;
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return components;
}

/** Longest BELONGS_TO containment chain — the meaningful notion of depth. */
export function maxDepth(graph: CapabilityGraph): number {
  const parents = new Map<string, string[]>();
  for (const e of graph.edges) {
    if (e.type !== "BELONGS_TO") continue;
    parents.set(e.from, [...(parents.get(e.from) ?? []), e.to]);
  }
  const memo = new Map<string, number>();
  const depth = (id: string, guard: Set<string>): number => {
    if (memo.has(id)) return memo.get(id)!;
    if (guard.has(id)) return 0;
    guard.add(id);
    const value = Math.max(0, ...(parents.get(id) ?? []).map((p) => 1 + depth(p, guard)));
    guard.delete(id);
    memo.set(id, value);
    return value;
  };
  return Math.max(0, ...graph.nodes.map((n) => depth(n.id, new Set())));
}

/** Compact, machine-readable statistics payload for diagnostics tooling. */
export function graphStatisticsJson(stats: GraphStatistics = graphStatistics()): string {
  return `${JSON.stringify(stats, null, 2)}\n`;
}
