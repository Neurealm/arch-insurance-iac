/**
 * Stage 3.5.2 — orphan and under-connectivity analysis.
 *
 * Distinguishes legitimate low connectivity (personas, permissions declared for
 * future use, catch-all routes) from likely omissions in the registries.
 */

import type { CapabilityGraph, GraphNode } from "./types";
import type { OrphanFinding, OrphanReport } from "./populationTypes";
import { getPopulatedGraph } from "./populate";
import { nodeDegrees } from "./reconcile";

const OWNERSHIP_EDGES = new Set(["BELONGS_TO", "OWNS", "SHARES"]);

export function analyzeOrphans(graph: CapabilityGraph = getPopulatedGraph().graph): OrphanReport {
  const findings: OrphanFinding[] = [];
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const degree = nodeDegrees(graph);

  const incident = new Map<string, { type: string; other: GraphNode | undefined; outgoing: boolean }[]>();
  for (const e of graph.edges) {
    incident.set(e.from, [...(incident.get(e.from) ?? []), { type: e.type, other: byId.get(e.to), outgoing: true }]);
    incident.set(e.to, [...(incident.get(e.to) ?? []), { type: e.type, other: byId.get(e.from), outgoing: false }]);
  }

  const push = (
    node: GraphNode,
    orphanClass: OrphanFinding["orphanClass"],
    legitimate: boolean,
    rationale: string,
  ) =>
    findings.push({
      orphanClass,
      nodeId: node.id,
      nodeType: node.type,
      label: node.label,
      moduleId: node.moduleId,
      degree: degree.get(node.id) ?? 0,
      legitimate,
      rationale,
    });

  for (const node of graph.nodes) {
    const edges = incident.get(node.id) ?? [];
    const has = (type: string, otherType?: string, outgoing?: boolean) =>
      edges.some(
        (e) =>
          e.type === type &&
          (otherType ? e.other?.type === otherType : true) &&
          (outgoing === undefined ? true : e.outgoing === outgoing),
      );

    const unregistered = node.attributes.registered === false;

    if (edges.length === 0) {
      push(
        node,
        "isolated",
        node.type === "persona" || unregistered,
        unregistered
          ? "Unregistered implementation: no manifest claims it, so no relationships exist yet (Stage 4 registration work)."
          : "No relationships of any kind.",
      );
      continue;
    }
    if (edges.every((e) => OWNERSHIP_EDGES.has(e.type))) {
      push(
        node,
        "ownership-only",
        node.type === "module",
        "Only containment or ownership relationships; no functional relationships.",
      );
    }

    switch (node.type) {
      case "capability":
      case "sub-capability": {
        const implemented = edges.some((e) => e.type === "IMPLEMENTS" && !e.outgoing);
        if (!implemented) {
          push(
            node,
            "capability-without-implementation",
            String(node.attributes.implementationStatus ?? "") === "planned",
            "No page, component, service or workflow IMPLEMENTS this capability.",
          );
        }
        break;
      }
      case "page": {
        if (!has("IMPLEMENTS", undefined, true)) {
          push(
            node,
            "page-without-capability",
            unregistered || node.moduleId === null,
            node.moduleId === null
              ? "Page belongs to no registered module, so capability attribution is not yet possible."
              : "Page is owned by a registered module but is not attributed to any capability.",
          );
        }
        break;
      }
      case "route": {
        if (!has("REFERENCES", "page", true)) {
          const redirect = Boolean(node.attributes.redirectTo);
          push(
            node,
            "route-without-page",
            redirect || node.attributes.isCatchAll === true,
            redirect ? "Redirect route; no page by design." : "Route element could not be resolved to a page.",
          );
        }
        break;
      }
      case "workflow": {
        if (!edges.some((e) => e.other?.type === "capability" || e.other?.type === "sub-capability")) {
          push(node, "workflow-without-capability", false, "Workflow is not attached to a capability.");
        }
        break;
      }
      case "ai-agent": {
        if (!edges.some((e) => (e.type === "INVOKES" || e.type === "USES") && !e.outgoing)) {
          push(node, "agent-not-invoked", false, "No capability, workflow or module invokes this agent.");
        }
        break;
      }
      case "integration": {
        if (!edges.some((e) => (e.type === "USES" || e.type === "CONSUMES") && !e.outgoing)) {
          push(node, "integration-not-consumed", false, "Integration has no declared consumer.");
        }
        break;
      }
      case "permission": {
        if (!has("SECURES", undefined, true)) {
          push(node, "permission-unattached", false, "Permission does not secure any route or capability.");
        }
        break;
      }
      case "database-entity": {
        if (!edges.some((e) => (e.type === "STORES" || e.type === "USES") && !e.outgoing)) {
          push(node, "entity-without-consumer", false, "No module, capability or service reads or writes this entity.");
        }
        break;
      }
      case "report": {
        if (!edges.some((e) => e.other?.type === "capability" || e.other?.type === "sub-capability")) {
          push(node, "report-without-capability", false, "Report is not linked to a capability.");
        }
        break;
      }
      case "dashboard": {
        if (!edges.some((e) => e.other?.type === "capability" || e.other?.type === "sub-capability")) {
          push(node, "dashboard-without-capability", false, "Dashboard is not linked to a capability.");
        }
        break;
      }
      case "shared-capability": {
        if (!edges.some((e) => e.type === "CONSUMES" && !e.outgoing)) {
          push(
            node,
            "shared-capability-without-consumer",
            String(node.attributes.status ?? "") === "proposed",
            "Registered as shared but no module consumes it.",
          );
        }
        break;
      }
      case "platform-capability": {
        if (!edges.some((e) => e.type === "CONSUMES" && !e.outgoing)) {
          push(
            node,
            "platform-capability-without-consumer",
            true,
            "Platform capability with no registered consuming module; expected while only SRE is registered.",
          );
        }
        break;
      }
      default:
        break;
    }
  }

  const byClass: Record<string, number> = {};
  for (const f of findings) byClass[f.orphanClass] = (byClass[f.orphanClass] ?? 0) + 1;

  return {
    findings,
    byClass,
    likelyOmissions: findings.filter((f) => !f.legitimate).length,
    legitimate: findings.filter((f) => f.legitimate).length,
  };
}
