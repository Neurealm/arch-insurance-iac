/**
 * Stage 3.5.1 — graph builder.
 *
 * Projects the Stage 1–3 registries into the generic relationship graph:
 *
 *  - module manifests            → module, capability, route, page, component,
 *                                  service, api, workflow, agent, integration,
 *                                  database-entity, dashboard, report,
 *                                  permission and persona nodes
 *  - shared capability registry  → shared-capability nodes + ownership edges
 *  - platform capability registry→ platform-capability nodes + consumption edges
 *  - capability hierarchies      → sub-capability containment + lineage
 *  - generated route table       → observed page/component backing for routes
 *
 * The builder is pure: same inputs, same graph, same content hash.
 */

import { getModules } from "../registry";
import { SHARED_CAPABILITIES } from "../shared/sharedCapabilities";
import { PLATFORM_CAPABILITIES } from "../platform/platformCapabilities";
import { SRE_CAPABILITY_HIERARCHY } from "../sre/capabilityHierarchy";
import { APPLICATION_ROUTES } from "../generated/routeTable";
import type { CapabilityHierarchy, PlatformCapability, SharedCapability } from "../classificationTypes";
import type { ConfidenceLevel, ModuleManifest } from "../types";
import { nextGraphVersion } from "./serialize";
import {
  GRAPH_SCHEMA_VERSION,
  type CapabilityGraph,
  type GraphEdge,
  type GraphEdgeType,
  type GraphFactSource,
  type GraphNode,
  type GraphNodeType,
  type GraphOwnership,
  type GraphVersion,
} from "./types";

export const GRAPH_GENERATOR = "src/modules/graph/build.ts@1.0.0";

export interface BuildGraphInput {
  modules?: readonly ModuleManifest[];
  sharedCapabilities?: readonly SharedCapability[];
  platformCapabilities?: readonly PlatformCapability[];
  hierarchies?: readonly CapabilityHierarchy[];
  routes?: readonly { path: string; componentFile: string | null; permission: string | null }[];
  previousVersion?: GraphVersion | null;
  generatedAt?: string;
}

/* -------------------------------------------------------------------------- */

class GraphBuilder {
  private readonly nodes = new Map<string, GraphNode>();
  private readonly edges = new Map<string, GraphEdge>();

  node(input: {
    type: GraphNodeType;
    ref: string;
    label: string;
    description?: string;
    moduleId?: string | null;
    ownership?: GraphOwnership;
    source?: GraphFactSource;
    confidence?: ConfidenceLevel;
    filePath?: string | null;
    evidence?: readonly string[];
    attributes?: Record<string, string | number | boolean | null>;
  }): string {
    const id = `${input.type}:${input.ref}`;
    const existing = this.nodes.get(id);
    if (existing) {
      // First declaration wins; later ones may only add evidence.
      if (input.evidence?.length) {
        this.nodes.set(id, {
          ...existing,
          evidence: [...new Set([...existing.evidence, ...input.evidence])],
        });
      }
      return id;
    }
    this.nodes.set(id, {
      id,
      type: input.type,
      label: input.label,
      description: input.description,
      moduleId: input.moduleId ?? null,
      ownership: input.ownership ?? "unassigned",
      source: input.source ?? "declared",
      confidence: input.confidence ?? "medium",
      filePath: input.filePath ?? null,
      evidence: input.evidence ?? [],
      attributes: input.attributes ?? {},
    });
    return id;
  }

  edge(
    from: string,
    type: GraphEdgeType,
    to: string,
    options: {
      source?: GraphFactSource;
      confidence?: ConfidenceLevel;
      evidence?: readonly string[];
      attributes?: Record<string, string | number | boolean | null>;
    } = {},
  ): void {
    if (from === to) return;
    const id = `${from}|${type}|${to}`;
    if (this.edges.has(id)) return;
    this.edges.set(id, {
      id,
      type,
      from,
      to,
      source: options.source ?? "declared",
      confidence: options.confidence ?? "medium",
      evidence: options.evidence ?? [],
      attributes: options.attributes ?? {},
    });
  }

  has(id: string): boolean {
    return this.nodes.has(id);
  }

  result() {
    return { nodes: [...this.nodes.values()], edges: [...this.edges.values()] };
  }
}

const personaRef = (persona: string) =>
  persona.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* -------------------------------------------------------------------------- */

export function buildCapabilityGraph(input: BuildGraphInput = {}): CapabilityGraph {
  const modules = input.modules ?? getModules();
  const shared = input.sharedCapabilities ?? SHARED_CAPABILITIES;
  const platform = input.platformCapabilities ?? PLATFORM_CAPABILITIES;
  const hierarchies = input.hierarchies ?? [SRE_CAPABILITY_HIERARCHY];
  const routes =
    input.routes ??
    APPLICATION_ROUTES.map((r) => ({
      path: r.path,
      componentFile: r.componentFile,
      permission: r.permission,
    }));

  const b = new GraphBuilder();
  const routeIndex = new Map(routes.map((r) => [r.path, r]));

  /* ------------------------------------------------------------- platform */
  for (const cap of platform) {
    const capId = b.node({
      type: "platform-capability",
      ref: cap.platformCapabilityId,
      label: cap.name,
      description: cap.description,
      moduleId: "platform",
      ownership: "platform-owned",
      confidence: "high",
      evidence: cap.evidence,
      attributes: {
        status: cap.status,
        maturity: cap.maturity,
        evidenceStrength: cap.evidenceStrength,
        frequentlyMiscounted: cap.frequentlyMiscounted,
      },
    });
    attachCapabilityImplementation(b, capId, cap, "platform", "platform-owned");
  }

  /* --------------------------------------------------------------- shared */
  for (const cap of shared) {
    const owner = cap.primaryOwner && cap.primaryOwner !== "unassigned" ? cap.primaryOwner : null;
    const capId = b.node({
      type: "shared-capability",
      ref: cap.sharedCapabilityId,
      label: cap.name,
      description: cap.description,
      moduleId: owner,
      ownership: "shared",
      confidence: owner ? "high" : "low",
      evidence: cap.evidence,
      attributes: {
        status: cap.status,
        maturity: cap.maturity,
        evidenceStrength: cap.evidenceStrength,
        relationship: cap.relationship,
        primaryOwner: cap.primaryOwner,
      },
    });
    attachCapabilityImplementation(b, capId, cap, owner, "shared");
  }

  /* -------------------------------------------------------------- modules */
  for (const manifest of modules) {
    const { identity, boundaries } = manifest;
    const moduleId = b.node({
      type: "module",
      ref: identity.moduleId,
      label: identity.name,
      description: identity.description,
      moduleId: identity.moduleId,
      ownership: "module-owned",
      confidence: identity.identificationConfidence,
      attributes: {
        status: identity.status,
        moduleVersion: identity.moduleVersion,
        businessDomain: identity.businessDomain,
        productOwner: identity.productOwner,
        technicalOwner: identity.technicalOwner,
      },
    });

    const mod = identity.moduleId;

    for (const route of boundaries.routes) {
      const observed = routeIndex.get(route);
      const routeNode = b.node({
        type: "route",
        ref: route,
        label: route,
        moduleId: mod,
        ownership: "module-owned",
        source: observed ? "observed" : "declared",
        confidence: observed ? "high" : "medium",
        filePath: observed?.componentFile ?? null,
        evidence: observed ? ["Present in generated route table"] : ["Declared in module manifest"],
        attributes: { declaredInManifest: true, presentInRouteTable: Boolean(observed) },
      });
      b.edge(routeNode, "BELONGS_TO", moduleId);
      b.edge(moduleId, "EXPOSES", routeNode);
      if (observed?.componentFile) {
        const pageNode = b.node({
          type: "page",
          ref: observed.componentFile,
          label: observed.componentFile.split("/").pop() ?? observed.componentFile,
          moduleId: mod,
          ownership: "module-owned",
          source: "observed",
          confidence: "high",
          filePath: observed.componentFile,
        });
        b.edge(pageNode, "BELONGS_TO", moduleId);
        b.edge(routeNode, "REFERENCES", pageNode, { source: "observed" });
      }
      if (observed?.permission) {
        const permNode = b.node({
          type: "permission",
          ref: observed.permission,
          label: observed.permission,
          moduleId: null,
          ownership: "platform-owned",
          source: "observed",
        });
        b.edge(permNode, "SECURES", routeNode, { source: "observed" });
      }
    }

    for (const page of boundaries.pageIds) {
      const id = b.node({
        type: "page",
        ref: page,
        label: page.split("/").pop() ?? page,
        moduleId: mod,
        ownership: "module-owned",
        filePath: page.endsWith(".tsx") ? page : null,
      });
      b.edge(id, "BELONGS_TO", moduleId);
    }

    for (const component of boundaries.componentRefs) {
      const id = b.node({
        type: "component",
        ref: component,
        label: component.split("/").pop() ?? component,
        moduleId: mod,
        ownership: "module-owned",
        filePath: component.includes("/") ? component : null,
      });
      b.edge(id, "BELONGS_TO", moduleId);
      b.edge(moduleId, "USES", id);
    }

    for (const service of boundaries.serviceRefs) {
      const id = b.node({ type: "service", ref: service, label: service, moduleId: mod, ownership: "module-owned" });
      b.edge(id, "BELONGS_TO", moduleId);
      b.edge(moduleId, "USES", id);
    }

    for (const api of boundaries.apiPrefixes) {
      const id = b.node({ type: "api", ref: api, label: api, moduleId: mod, ownership: "module-owned" });
      b.edge(moduleId, "EXPOSES", id);
    }

    for (const entity of boundaries.databaseEntities) {
      const id = b.node({ type: "database-entity", ref: entity, label: entity, moduleId: mod, ownership: "module-owned" });
      b.edge(moduleId, "STORES", id);
    }

    for (const workflow of boundaries.workflowIds) {
      const id = b.node({ type: "workflow", ref: workflow, label: workflow, moduleId: mod, ownership: "module-owned" });
      b.edge(id, "BELONGS_TO", moduleId);
      b.edge(moduleId, "USES", id);
    }

    for (const integration of boundaries.integrationIds) {
      const id = b.node({ type: "integration", ref: integration, label: integration, moduleId: mod, ownership: "module-owned" });
      b.edge(moduleId, "USES", id);
    }

    for (const agent of boundaries.aiAgentIds) {
      const id = b.node({ type: "ai-agent", ref: agent, label: agent, moduleId: mod, ownership: "module-owned" });
      b.edge(moduleId, "USES", id);
    }

    for (const dashboard of boundaries.dashboardIds) {
      const id = b.node({ type: "dashboard", ref: dashboard, label: dashboard, moduleId: mod, ownership: "module-owned" });
      b.edge(id, "BELONGS_TO", moduleId);
      b.edge(id, "REPORTS_TO", moduleId);
    }

    for (const report of boundaries.reportIds) {
      const id = b.node({ type: "report", ref: report, label: report, moduleId: mod, ownership: "module-owned" });
      b.edge(id, "BELONGS_TO", moduleId);
      b.edge(id, "REPORTS_TO", moduleId);
    }

    for (const permission of boundaries.permissionIds) {
      const id = b.node({ type: "permission", ref: permission, label: permission, moduleId: mod, ownership: "module-owned" });
      b.edge(id, "SECURES", moduleId);
    }

    /* --------------------------------------------------------- capabilities */
    for (const cap of manifest.capabilities) {
      const capId = b.node({
        type: "capability",
        ref: cap.capabilityId,
        label: cap.name,
        description: cap.description,
        moduleId: mod,
        ownership: "module-owned",
        confidence: "high",
        evidence: cap.evidenceHints,
        attributes: {
          domain: cap.domain,
          subdomain: cap.subdomain,
          implementationStatus: cap.implementationStatus,
          businessPurpose: cap.businessPurpose,
        },
      });
      b.edge(capId, "BELONGS_TO", moduleId);
      b.edge(moduleId, "PROVIDES", capId);

      if (cap.primaryPersona) {
        const personaId = b.node({
          type: "persona",
          ref: personaRef(cap.primaryPersona),
          label: cap.primaryPersona,
          moduleId: null,
          ownership: "shared",
        });
        b.edge(personaId, "OWNS", capId, { attributes: { role: "primary" } });
      }
      for (const persona of cap.secondaryPersonas) {
        const personaId = b.node({
          type: "persona",
          ref: personaRef(persona),
          label: persona,
          moduleId: null,
          ownership: "shared",
        });
        b.edge(personaId, "REFERENCES", capId, { attributes: { role: "secondary" } });
      }

      linkRefs(b, cap.relatedRoutes, "route", mod, (id) => b.edge(capId, "EXPOSES", id));
      linkRefs(b, cap.relatedPages, "page", mod, (id) => b.edge(id, "IMPLEMENTS", capId));
      linkRefs(b, cap.relatedComponents, "component", mod, (id) => b.edge(id, "IMPLEMENTS", capId));
      linkRefs(b, cap.relatedServices, "service", mod, (id) => b.edge(id, "IMPLEMENTS", capId));
      linkRefs(b, cap.relatedWorkflows, "workflow", mod, (id) => b.edge(capId, "USES", id));
      linkRefs(b, cap.relatedEntities, "database-entity", mod, (id) => b.edge(capId, "STORES", id));
      linkRefs(b, cap.relatedApis, "api", mod, (id) => b.edge(capId, "INVOKES", id));
      linkRefs(b, cap.relatedIntegrations, "integration", mod, (id) => b.edge(capId, "USES", id));
      linkRefs(b, cap.relatedAgents, "ai-agent", mod, (id) => b.edge(capId, "USES", id));
      linkRefs(b, cap.relatedAutomationActions, "workflow", mod, (id) => b.edge(capId, "INVOKES", id));

      for (const dependency of cap.dependencies) {
        const target = `capability:${dependency}`;
        if (b.has(target)) b.edge(capId, "DEPENDS_ON", target);
      }
    }

    /* -------------------------------------------------------- dependencies */
    for (const dep of manifest.sharedDependencies) {
      const target = `shared-capability:${dep.ref}`;
      if (!b.has(target)) continue;
      b.edge(moduleId, "CONSUMES", target, { evidence: dep.notes ? [dep.notes] : [] });
      b.edge(moduleId, "DEPENDS_ON", target);
    }
    for (const dep of manifest.platformDependencies) {
      const target = `platform-capability:${dep.ref}`;
      if (!b.has(target)) continue;
      b.edge(moduleId, "CONSUMES", target, { evidence: dep.notes ? [dep.notes] : [] });
      b.edge(moduleId, "DEPENDS_ON", target);
    }
    for (const owned of manifest.sharedOwnership) {
      const target = `shared-capability:${owned.ref}`;
      if (!b.has(target)) continue;
      if (owned.primaryOwner === mod) b.edge(moduleId, "OWNS", target);
      for (const consumer of owned.consumingModules) {
        const consumerId = `module:${consumer}`;
        if (b.has(consumerId)) b.edge(consumerId, "CONSUMES", target);
      }
    }
  }

  /* --------------------------------------- registry-declared consumption */
  for (const cap of shared) {
    const capId = `shared-capability:${cap.sharedCapabilityId}`;
    if (cap.primaryOwner && cap.primaryOwner !== "unassigned" && b.has(`module:${cap.primaryOwner}`)) {
      b.edge(`module:${cap.primaryOwner}`, "OWNS", capId);
    }
    for (const consumer of cap.consumingModules) {
      if (b.has(`module:${consumer}`)) b.edge(`module:${consumer}`, "CONSUMES", capId, { source: "declared" });
    }
  }
  for (const cap of platform) {
    const capId = `platform-capability:${cap.platformCapabilityId}`;
    for (const consumer of cap.consumingModules) {
      if (b.has(`module:${consumer}`)) b.edge(`module:${consumer}`, "CONSUMES", capId, { source: "declared" });
    }
  }

  /* ---------------------------------------------------------- hierarchies */
  for (const hierarchy of hierarchies) {
    const moduleNodeId = `module:${hierarchy.moduleId}`;
    for (const node of hierarchy.nodes) {
      const isRoot = node.parentCapabilityId === null;
      const type: GraphNodeType = isRoot || node.level === "capability" ? "capability" : "sub-capability";
      const nodeId = b.node({
        type,
        ref: node.capabilityId,
        label: node.name,
        description: node.description,
        moduleId: hierarchy.moduleId,
        ownership: "module-owned",
        source: "derived",
        confidence: "high",
        evidence: node.knownLimitations,
        attributes: {
          level: node.level,
          declaredMaturity: node.declaredMaturity,
          evidenceStrength: node.evidenceStrength,
          implementationClassification: node.implementationClassification,
        },
      });

      if (node.parentCapabilityId) {
        const parentType = b.has(`capability:${node.parentCapabilityId}`) ? "capability" : "sub-capability";
        const parentId = `${parentType}:${node.parentCapabilityId}`;
        if (b.has(parentId)) b.edge(nodeId, "BELONGS_TO", parentId, { source: "derived" });
      } else if (b.has(moduleNodeId)) {
        b.edge(nodeId, "BELONGS_TO", moduleNodeId, { source: "derived" });
      }

      if (node.supersedesCapabilityId) {
        const superseded = `capability:${node.supersedesCapabilityId}`;
        if (b.has(superseded) && superseded !== nodeId) {
          b.edge(nodeId, "EXTENDS", superseded, {
            source: "derived",
            evidence: ["Stage 3 hierarchy decomposition of a Stage 1 capability"],
          });
        }
      }

      for (const route of node.relatedRoutes) {
        const routeId = `route:${route}`;
        if (b.has(routeId)) b.edge(nodeId, "EXPOSES", routeId, { source: "derived" });
      }
      linkRefs(b, node.relatedPages, "page", hierarchy.moduleId, (id) =>
        b.edge(id, "IMPLEMENTS", nodeId, { source: "derived" }),
      );
      linkRefs(b, node.relatedComponents, "component", hierarchy.moduleId, (id) =>
        b.edge(id, "IMPLEMENTS", nodeId, { source: "derived" }),
      );
    }
  }

  const { nodes, edges } = b.result();
  const version = nextGraphVersion(nodes, edges, {
    generator: GRAPH_GENERATOR,
    generatedAt: input.generatedAt,
    previous: input.previousVersion ?? null,
  });

  return {
    schemaVersion: GRAPH_SCHEMA_VERSION,
    version,
    nodes: [...nodes].sort((a, c) => a.id.localeCompare(c.id)),
    edges: [...edges].sort((a, c) => a.id.localeCompare(c.id)),
  };
}

/* -------------------------------------------------------------------------- */

function linkRefs(
  b: GraphBuilder,
  refs: readonly string[],
  type: GraphNodeType,
  moduleId: string | null,
  link: (nodeId: string) => void,
): void {
  for (const ref of refs) {
    const id = b.node({
      type,
      ref,
      label: ref.includes("/") ? (ref.split("/").pop() ?? ref) : ref,
      moduleId,
      ownership: moduleId ? "module-owned" : "unassigned",
      filePath: ref.includes("/") && ref.includes(".") ? ref : null,
    });
    link(id);
  }
}

/** Shared and platform capabilities carry the same implementation reference set. */
function attachCapabilityImplementation(
  b: GraphBuilder,
  capId: string,
  cap: SharedCapability | PlatformCapability,
  moduleId: string | null,
  ownership: GraphOwnership,
): void {
  const make = (type: GraphNodeType, ref: string) =>
    b.node({
      type,
      ref,
      label: ref.includes("/") ? (ref.split("/").pop() ?? ref) : ref,
      moduleId,
      ownership,
      filePath: ref.includes("/") && ref.includes(".") ? ref : null,
    });

  for (const route of cap.routes) b.edge(capId, "EXPOSES", make("route", route));
  for (const component of cap.components) b.edge(make("component", component), "IMPLEMENTS", capId);
  for (const service of cap.services) b.edge(make("service", service), "IMPLEMENTS", capId);
  for (const api of cap.apis) b.edge(capId, "EXPOSES", make("api", api));
  for (const entity of cap.databaseEntities) b.edge(capId, "STORES", make("database-entity", entity));
  for (const workflow of cap.workflows) b.edge(capId, "USES", make("workflow", workflow));
  for (const integration of cap.integrations) b.edge(capId, "USES", make("integration", integration));
  for (const agent of cap.agents) b.edge(capId, "USES", make("ai-agent", agent));
  for (const permission of cap.permissions) b.edge(make("permission", permission), "SECURES", capId);
}

/* -------------------------------------------------------------------------- */

let cached: CapabilityGraph | null = null;

/** Memoized graph for the current registry state. */
export function getCapabilityGraph(): CapabilityGraph {
  cached ??= buildCapabilityGraph();
  return cached;
}

/** Test-only: clear the memoized graph. */
export function __resetGraphCache(): void {
  cached = null;
}
