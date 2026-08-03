/**
 * Stage 3.5.2 — graph population and reconciliation.
 *
 * Takes the Stage 3.5.1 declared-registry projection as its base and populates
 * it from every machine-readable Stage 1–3 source of truth:
 *
 *   - generated route table            (all routes, not only declared ones)
 *   - navigation registry              (route reachability + nav references)
 *   - implementation inventory         (pages, components, hooks, providers,
 *                                       stores, services, api clients, edge fns)
 *   - route reconciliation report      (ownership classification per route)
 *   - unregistered classification      (ownership + customer/experimental flags)
 *   - SRE evidence records             (traced dependencies, evidence strength)
 *   - observed domain signals          (database entities, RPCs, integrations)
 *
 * Rules:
 *   - Node IDs stay `<type>:<ref>` — deterministic, never positional.
 *   - Every populated node and edge carries provenance in `attributes`.
 *   - Weakly-inferred relationships are returned as candidate edges and are
 *     never added to the authoritative graph.
 */

import { buildCapabilityGraph } from "./build";
import { nextGraphVersion } from "./serialize";
import { GRAPH_SCHEMA_VERSION, type CapabilityGraph, type GraphEdge, type GraphEdgeType, type GraphFactSource, type GraphNode, type GraphNodeType, type GraphOwnership } from "./types";
import type { CandidateEdge, EvidenceClassification, FactProvenance, GraphInputSource, PopulatedGraph, ValidationState } from "./populationTypes";
import type { ConfidenceLevel } from "../types";
import type { EvidenceStrength, ImplementationType } from "../routeTypes";
import { APPLICATION_ROUTES } from "../generated/routeTable";
import { IMPLEMENTATION_INVENTORY, NAVIGATION_ENTRIES } from "../generated/implementationInventory";
import { DOMAIN_SIGNALS } from "../generated/domainSignals";
import { SRE_PAGE_EVIDENCE } from "../sre/evidence.generated";
import { reconcileRoutes } from "../routeOwnership";
import { classifyUnregistered } from "../classification";
import { SHARED_CAPABILITIES } from "../shared/sharedCapabilities";
import { PLATFORM_CAPABILITIES } from "../platform/platformCapabilities";
import { getModules } from "../registry";

export const POPULATION_GENERATOR = "src/modules/graph/populate.ts@1.0.0";

/* -------------------------------------------------------------------------- */

const FACT_SOURCE: Record<EvidenceClassification, GraphFactSource> = {
  declared: "declared",
  "deterministically-discovered": "observed",
  "strongly-inferred": "derived",
  "weakly-inferred": "derived",
  "human-reviewed": "declared",
  "unable-to-verify": "derived",
};

/** Inventory implementation types projected onto graph node types. */
const INVENTORY_NODE_TYPE: Partial<Record<ImplementationType, GraphNodeType>> = {
  page: "page",
  component: "component",
  layout: "component",
  hook: "service",
  "context-provider": "service",
  "state-store": "service",
  service: "service",
  "api-client": "service",
  "edge-function": "api",
};

const provenanceAttributes = (p: FactProvenance): Record<string, string | number | boolean | null> => ({
  sourceType: p.sourceType,
  sourceId: p.sourceId,
  sourcePath: p.sourcePath,
  evidenceMethod: p.evidenceMethod,
  evidenceClassification: p.evidenceClassification,
  evidenceStrength: p.evidenceStrength,
  validationState: p.validationState,
  provenanceConfidence: p.confidence,
});

interface EdgeFactInput {
  sourceType: string;
  sourceId: string;
  sourcePath?: string | null;
  method: string;
  classification: EvidenceClassification;
  strength?: EvidenceStrength | null;
  validation?: ValidationState;
  confidence?: ConfidenceLevel;
  evidence?: readonly string[];
}

const toProvenance = (f: EdgeFactInput): FactProvenance => ({
  sourceType: f.sourceType,
  sourceId: f.sourceId,
  sourcePath: f.sourcePath ?? null,
  evidenceMethod: f.method,
  evidenceClassification: f.classification,
  evidenceStrength: f.strength ?? null,
  validationState: f.validation ?? "validated",
  confidence: f.confidence ?? "medium",
});

/* -------------------------------------------------------------------------- */

class PopulationBuilder {
  readonly nodes = new Map<string, GraphNode>();
  readonly edges = new Map<string, GraphEdge>();
  readonly candidates = new Map<string, CandidateEdge>();

  constructor(base: CapabilityGraph) {
    for (const n of base.nodes) this.nodes.set(n.id, n);
    for (const e of base.edges) this.edges.set(e.id, e);
  }

  has(id: string): boolean {
    return this.nodes.has(id);
  }

  /** Create a node, or enrich an existing one without changing its identity. */
  node(input: {
    type: GraphNodeType;
    ref: string;
    label?: string;
    description?: string;
    moduleId?: string | null;
    ownership?: GraphOwnership;
    confidence?: ConfidenceLevel;
    filePath?: string | null;
    evidence?: readonly string[];
    attributes?: Record<string, string | number | boolean | null>;
    provenance: FactProvenance;
  }): string {
    const id = `${input.type}:${input.ref}`;
    const attrs = { ...provenanceAttributes(input.provenance), ...(input.attributes ?? {}) };
    const existing = this.nodes.get(id);

    if (existing) {
      this.nodes.set(id, {
        ...existing,
        // Declared facts win on identity fields; population only fills gaps.
        moduleId: existing.moduleId ?? input.moduleId ?? null,
        ownership: existing.ownership === "unassigned" ? (input.ownership ?? "unassigned") : existing.ownership,
        filePath: existing.filePath ?? input.filePath ?? null,
        description: existing.description ?? input.description,
        evidence: [...new Set([...existing.evidence, ...(input.evidence ?? [])])],
        attributes: { ...attrs, ...existing.attributes },
      });
      return id;
    }

    this.nodes.set(id, {
      id,
      type: input.type,
      label: input.label ?? input.ref,
      description: input.description,
      moduleId: input.moduleId ?? null,
      ownership: input.ownership ?? "unassigned",
      source: FACT_SOURCE[input.provenance.evidenceClassification],
      confidence: input.confidence ?? input.provenance.confidence,
      filePath: input.filePath ?? null,
      evidence: input.evidence ?? [],
      attributes: attrs,
    });
    return id;
  }

  /** Authoritative edge. Weak inferences must use `candidate` instead. */
  edge(from: string, type: GraphEdgeType, to: string, fact: EdgeFactInput): void {
    if (from === to) return;
    if (!this.nodes.has(from) || !this.nodes.has(to)) return;
    if (fact.classification === "weakly-inferred") {
      this.candidate(from, type, to, fact.method, fact);
      return;
    }
    const id = `${from}|${type}|${to}`;
    const provenance = toProvenance(fact);
    const existing = this.edges.get(id);
    if (existing) {
      this.edges.set(id, {
        ...existing,
        evidence: [...new Set([...existing.evidence, ...(fact.evidence ?? [])])],
        attributes: { ...provenanceAttributes(provenance), ...existing.attributes },
      });
      return;
    }
    this.edges.set(id, {
      id,
      type,
      from,
      to,
      source: FACT_SOURCE[fact.classification],
      confidence: fact.confidence ?? "medium",
      evidence: fact.evidence ?? [],
      attributes: provenanceAttributes(provenance),
    });
  }

  candidate(from: string, type: GraphEdgeType, to: string, rationale: string, fact: EdgeFactInput): void {
    if (from === to) return;
    const id = `${from}|${type}|${to}`;
    if (this.edges.has(id) || this.candidates.has(id)) return;
    this.candidates.set(id, {
      id,
      from,
      to,
      type,
      rationale,
      provenance: toProvenance({ ...fact, classification: "weakly-inferred" }),
    });
  }
}

/* -------------------------------------------------------------------------- */

export interface PopulateInput {
  generatedAt?: string;
  previousVersion?: CapabilityGraph["version"] | null;
}

export function populateCapabilityGraph(input: PopulateInput = {}): PopulatedGraph {
  const base = buildCapabilityGraph({ generatedAt: input.generatedAt });
  const b = new PopulationBuilder(base);

  const modules = getModules();
  const moduleIds = new Set(modules.map((m) => m.identity.moduleId));
  const routeReport = reconcileRoutes();
  const classification = classifyUnregistered();
  const classificationByRef = new Map(classification.items.map((i) => [i.ref, i]));

  /* ------------------------------------------------------- routes + pages */
  const navByRoute = new Map<string, string[]>();
  for (const nav of [...NAVIGATION_ENTRIES].sort((a, c) => a.to.localeCompare(c.to))) {
    navByRoute.set(nav.to, [...(navByRoute.get(nav.to) ?? []), nav.navId ?? nav.label ?? nav.to]);
  }

  for (const owned of [...routeReport.routes].sort((a, c) => a.route.path.localeCompare(c.route.path))) {
    const route = owned.route;
    if (route.isLayout) continue;
    const ownership: GraphOwnership =
      owned.ownership === "module-owned"
        ? "module-owned"
        : owned.ownership === "shared"
          ? "shared"
          : owned.ownership === "platform-owned"
            ? "platform-owned"
            : "unassigned";

    const routeId = b.node({
      type: "route",
      ref: route.path,
      label: route.path,
      moduleId: owned.moduleId,
      ownership,
      confidence: owned.confidence,
      filePath: route.componentFile,
      evidence: [`Registered in ${route.declaredIn}`, ...owned.notes],
      attributes: {
        ownershipClass: owned.ownership,
        declaredInManifest: owned.declaredInManifest,
        reachable: owned.reachable,
        duplicatePath: owned.duplicatePath,
        isDynamic: route.isDynamic,
        isCatchAll: route.isCatchAll,
        redirectTo: route.redirectTo,
        navigationRefs: (navByRoute.get(route.path) ?? []).join(","),
        claimedBy: owned.claimedBy.join(","),
        lastObservedSource: route.declaredIn,
      },
      provenance: {
        sourceType: "generated-route-table",
        sourceId: route.path,
        sourcePath: route.declaredIn,
        evidenceMethod: "static route extraction from src/App.tsx",
        evidenceClassification: "deterministically-discovered",
        evidenceStrength: null,
        validationState: owned.ownership === "ownership-conflict" ? "conflicting" : "validated",
        confidence: owned.confidence,
      },
    });

    if (owned.moduleId && b.has(`module:${owned.moduleId}`)) {
      b.edge(routeId, "BELONGS_TO", `module:${owned.moduleId}`, {
        sourceType: "route-reconciliation",
        sourceId: route.path,
        sourcePath: route.declaredIn,
        method: "manifest route boundary matched against the real route table",
        classification: owned.declaredInManifest ? "declared" : "strongly-inferred",
        confidence: owned.confidence,
      });
      b.edge(`module:${owned.moduleId}`, "EXPOSES", routeId, {
        sourceType: "route-reconciliation",
        sourceId: route.path,
        sourcePath: route.declaredIn,
        method: "module exposes the reconciled route",
        classification: owned.declaredInManifest ? "declared" : "strongly-inferred",
        confidence: owned.confidence,
      });
    }

    if (route.componentFile) {
      const pageId = b.node({
        type: "page",
        ref: route.componentFile,
        label: route.component ?? route.componentFile.split("/").pop() ?? route.componentFile,
        moduleId: owned.moduleId,
        ownership,
        filePath: route.componentFile,
        attributes: { routeRef: route.path, lazy: route.lazy },
        provenance: {
          sourceType: "generated-route-table",
          sourceId: route.componentFile,
          sourcePath: route.componentFile,
          evidenceMethod: "route element resolved to a page module",
          evidenceClassification: "deterministically-discovered",
          evidenceStrength: null,
          validationState: owned.pageExists ? "validated" : "unvalidated",
          confidence: "high",
        },
      });
      b.edge(routeId, "REFERENCES", pageId, {
        sourceType: "generated-route-table",
        sourceId: route.path,
        sourcePath: route.declaredIn,
        method: "route element renders the page component",
        classification: "deterministically-discovered",
        confidence: "high",
      });
    }

    if (route.permission) {
      const permId = b.node({
        type: "permission",
        ref: route.permission,
        label: route.permission,
        ownership: "platform-owned",
        moduleId: null,
        provenance: {
          sourceType: "generated-route-table",
          sourceId: route.permission,
          sourcePath: route.declaredIn,
          evidenceMethod: "permission guard observed on the route element",
          evidenceClassification: "deterministically-discovered",
          evidenceStrength: null,
          validationState: "validated",
          confidence: "high",
        },
      });
      b.edge(permId, "SECURES", routeId, {
        sourceType: "generated-route-table",
        sourceId: route.permission,
        sourcePath: route.declaredIn,
        method: "route guard declares the permission",
        classification: "deterministically-discovered",
        confidence: "high",
      });
    }
  }

  /* ------------------------------------------------ implementation inventory */
  for (const item of [...IMPLEMENTATION_INVENTORY].sort((a, c) => a.ref.localeCompare(c.ref))) {
    const mapped = INVENTORY_NODE_TYPE[item.implementationType];
    if (!mapped) continue;
    /* Duplicate-node reconciliation: one implementation file is one node. If the
       file is already represented (typically as a route-backed page), reuse that
       node instead of minting a second one under a different type. */
    const existingType = (["page", "component", "service", "api"] as const).find((t) => b.has(`${t}:${item.ref}`));
    const type = existingType ?? mapped;
    const classified = classificationByRef.get(item.ref);
    const declaringModule = modules.find((m) =>
      [...m.boundaries.pageIds, ...m.boundaries.componentRefs, ...m.boundaries.serviceRefs].includes(item.ref),
    )?.identity.moduleId;

    const ownerModule = declaringModule ?? classified?.likelyOwner ?? null;
    const ownership: GraphOwnership =
      declaringModule
        ? "module-owned"
        : classified
          ? (classified.ownershipClassification as GraphOwnership)
          : "unassigned";

    b.node({
      type,
      ref: item.ref,
      label: item.ref.split("/").pop() ?? item.ref,
      moduleId: ownerModule && moduleIds.has(ownerModule) ? ownerModule : ownerModule,
      ownership,
      filePath: item.ref,
      evidence: [item.evidence],
      attributes: {
        implementationType: item.implementationType,
        consumerCount: item.consumerCount,
        reachableViaRoute: item.reachableViaRoute,
        activity: item.activity,
        usesSupabase: item.usesSupabase,
        registered: Boolean(declaringModule),
        classification: classified?.classification ?? null,
        humanReviewRequired: classified?.humanReviewRequired ?? false,
      },
      provenance: {
        sourceType: "implementation-inventory",
        sourceId: item.ref,
        sourcePath: item.ref,
        evidenceMethod: "static source scan (scripts/scan-implementation.mjs)",
        evidenceClassification: declaringModule ? "declared" : "deterministically-discovered",
        evidenceStrength: null,
        validationState: "validated",
        confidence: declaringModule ? "high" : (classified?.confidence ?? "medium"),
      },
    });

    /* Customer-specific implementation is modelled as an extension, never as core. */
    if (classified?.classification === "customer-specific") {
      const extId = b.node({
        type: "customer-extension",
        ref: item.ref,
        label: item.ref.split("/").pop() ?? item.ref,
        moduleId: ownerModule,
        ownership: "customer-owned",
        filePath: item.ref,
        evidence: classified.evidence,
        attributes: { classification: classified.classification },
        provenance: {
          sourceType: "unregistered-classification",
          sourceId: classified.itemId,
          sourcePath: item.ref,
          evidenceMethod: "Stage 3 classification of unregistered implementation",
          evidenceClassification: "strongly-inferred",
          evidenceStrength: null,
          validationState: classified.humanReviewRequired ? "unvalidated" : "validated",
          confidence: classified.confidence,
        },
      });
      if (ownerModule && b.has(`module:${ownerModule}`)) {
        b.edge(extId, "EXTENDS", `module:${ownerModule}`, {
          sourceType: "unregistered-classification",
          sourceId: classified.itemId,
          sourcePath: item.ref,
          method: "customer-specific implementation located inside the module source boundary",
          classification: "strongly-inferred",
          confidence: classified.confidence,
        });
      }
    }
  }

  /* --------------------------------------------------- SRE evidence records */
  for (const record of [...SRE_PAGE_EVIDENCE].sort((a, c) => a.ref.localeCompare(c.ref))) {
    const pageId = b.node({
      type: "page",
      ref: record.ref,
      label: record.ref.split("/").pop() ?? record.ref,
      moduleId: "sre",
      ownership: "module-owned",
      filePath: record.ref,
      evidence: record.evidence,
      attributes: {
        evidenceStrength: record.evidenceStrength,
        dataBacking: record.dataBacking.join(","),
        interactive: record.interactive,
        platformChrome: record.platformChrome.join(","),
        routeRef: record.route,
      },
      provenance: {
        sourceType: "sre-evidence-records",
        sourceId: record.ref,
        sourcePath: record.ref,
        evidenceMethod: "transitive import tracing (scripts/analyze-sre-evidence.mjs)",
        evidenceClassification: "deterministically-discovered",
        evidenceStrength: record.evidenceStrength,
        validationState: record.confidence === "unable-to-verify" ? "unvalidated" : "validated",
        confidence: record.confidence,
      },
    });

    /* Traced imports are deterministic: they are real, observed dependencies.
       Platform chrome is deliberately excluded from capability evidence. */
    for (const dep of [...record.tracedDependencies].sort()) {
      if (record.platformChrome.includes(dep)) continue;
      const existingDepType = (["page", "component", "service", "api"] as const).find((t) => b.has(`${t}:${dep}`));
      const depType: GraphNodeType =
        existingDepType ??
        (dep.includes("/hooks/") || dep.includes("/data/") || dep.includes("/domain/")
          ? "service"
          : dep.endsWith(".tsx")
            ? "component"
            : "service");
      const depId = b.node({
        type: depType,
        ref: dep,
        label: dep.split("/").pop() ?? dep,
        moduleId: "sre",
        ownership: "module-owned",
        filePath: dep,
        attributes: { tracedFrom: record.ref },
        provenance: {
          sourceType: "sre-evidence-records",
          sourceId: dep,
          sourcePath: dep,
          evidenceMethod: "import graph traversal",
          evidenceClassification: "deterministically-discovered",
          evidenceStrength: null,
          validationState: "validated",
          confidence: "high",
        },
      });
      /* USES may not target a page; page-to-page imports are REFERENCES. */
      b.edge(pageId, depType === "page" ? "REFERENCES" : "USES", depId, {
        sourceType: "sre-evidence-records",
        sourceId: record.ref,
        sourcePath: record.ref,
        method: "observed import from the page module",
        classification: "deterministically-discovered",
        strength: record.evidenceStrength,
        confidence: record.confidence,
        evidence: [`Traced dependency of ${record.ref}`],
      });
    }
  }

  /* ------------------------------------------------------- domain signals */
  /* Observed clusters give database, RPC and integration signals. The cluster
     is not a module, so any capability attribution is weak by construction. */
  for (const signal of [...DOMAIN_SIGNALS].sort((a, c) => a.clusterId.localeCompare(c.clusterId))) {
    const moduleNode = `module:${signal.clusterId}`;
    if (!b.has(moduleNode)) continue;
    for (const entity of [...signal.databaseEntities].sort()) {
      const entityId = b.node({
        type: "database-entity",
        ref: entity,
        label: entity,
        moduleId: signal.clusterId,
        ownership: "module-owned",
        attributes: { observedInCluster: signal.clusterId },
        provenance: {
          sourceType: "domain-signals",
          sourceId: entity,
          sourcePath: "src/modules/generated/domainSignals.ts",
          evidenceMethod: "Supabase table reference scan",
          evidenceClassification: "deterministically-discovered",
          evidenceStrength: "database-backed",
          validationState: "validated",
          confidence: "medium",
        },
      });
      b.edge(moduleNode, "STORES", entityId, {
        sourceType: "domain-signals",
        sourceId: entity,
        sourcePath: "src/modules/generated/domainSignals.ts",
        method: "observed Supabase table usage inside the module source boundary",
        classification: "strongly-inferred",
        strength: "database-backed",
        confidence: "medium",
      });
    }
    for (const fn of [...signal.edgeFunctions].sort()) {
      const apiId = b.node({
        type: "api",
        ref: `supabase/functions/${fn}`,
        label: fn,
        moduleId: signal.clusterId,
        ownership: "module-owned",
        filePath: `supabase/functions/${fn}/index.ts`,
        provenance: {
          sourceType: "domain-signals",
          sourceId: fn,
          sourcePath: "src/modules/generated/domainSignals.ts",
          evidenceMethod: "edge-function invocation scan",
          evidenceClassification: "deterministically-discovered",
          evidenceStrength: "api-backed",
          validationState: "validated",
          confidence: "medium",
        },
      });
      b.edge(moduleNode, "EXPOSES", apiId, {
        sourceType: "domain-signals",
        sourceId: fn,
        sourcePath: "src/modules/generated/domainSignals.ts",
        method: "edge function invoked from the module source boundary",
        classification: "strongly-inferred",
        strength: "api-backed",
        confidence: "medium",
      });
    }
    for (const integration of [...signal.integrationRefs].sort()) {
      const intId = b.node({
        type: "integration",
        ref: integration,
        label: integration,
        moduleId: signal.clusterId,
        ownership: "module-owned",
        provenance: {
          sourceType: "domain-signals",
          sourceId: integration,
          sourcePath: "src/modules/generated/domainSignals.ts",
          evidenceMethod: "integration reference scan",
          evidenceClassification: "deterministically-discovered",
          evidenceStrength: null,
          validationState: "unvalidated",
          confidence: "low",
        },
      });
      /* Weak by design: a textual reference is not proof of consumption. */
      b.candidate(moduleNode, "USES", intId, "Integration name referenced inside the module source cluster", {
        sourceType: "domain-signals",
        sourceId: integration,
        sourcePath: "src/modules/generated/domainSignals.ts",
        method: "textual integration reference",
        classification: "weakly-inferred",
        confidence: "low",
      });
    }
    for (const agent of [...signal.agentRefs].sort()) {
      const agentId = b.node({
        type: "ai-agent",
        ref: agent,
        label: agent,
        moduleId: signal.clusterId,
        ownership: "module-owned",
        provenance: {
          sourceType: "domain-signals",
          sourceId: agent,
          sourcePath: "src/modules/generated/domainSignals.ts",
          evidenceMethod: "agent reference scan",
          evidenceClassification: "deterministically-discovered",
          evidenceStrength: null,
          validationState: "unvalidated",
          confidence: "low",
        },
      });
      b.candidate(moduleNode, "USES", agentId, "Agent name referenced inside the module source cluster", {
        sourceType: "domain-signals",
        sourceId: agent,
        sourcePath: "src/modules/generated/domainSignals.ts",
        method: "textual agent reference",
        classification: "weakly-inferred",
        confidence: "low",
      });
    }
    for (const workflow of [...signal.workflowRefs].sort()) {
      const wfId = b.node({
        type: "workflow",
        ref: workflow,
        label: workflow,
        moduleId: signal.clusterId,
        ownership: "module-owned",
        provenance: {
          sourceType: "domain-signals",
          sourceId: workflow,
          sourcePath: "src/modules/generated/domainSignals.ts",
          evidenceMethod: "workflow reference scan",
          evidenceClassification: "deterministically-discovered",
          evidenceStrength: null,
          validationState: "unvalidated",
          confidence: "low",
        },
      });
      b.candidate(moduleNode, "USES", wfId, "Workflow name referenced inside the module source cluster", {
        sourceType: "domain-signals",
        sourceId: workflow,
        sourcePath: "src/modules/generated/domainSignals.ts",
        method: "textual workflow reference",
        classification: "weakly-inferred",
        confidence: "low",
      });
    }
  }

  /* ----------------------------------------- page → capability attribution */
  /* A page that a capability already declares is a declared edge (handled by
     the Stage 3.5.1 builder). A page that merely sits on a capability's route
     is a candidate only. */
  for (const cap of b.nodes.values()) {
    if (cap.type !== "capability" && cap.type !== "sub-capability") continue;
    for (const edge of [...b.edges.values()]) {
      if (edge.type !== "EXPOSES" || edge.from !== cap.id) continue;
      const route = b.nodes.get(edge.to);
      if (!route || route.type !== "route" || !route.filePath) continue;
      const pageId = `page:${route.filePath}`;
      if (!b.has(pageId)) continue;
      b.candidate(pageId, "IMPLEMENTS", cap.id, "Page is rendered by a route the capability exposes", {
        sourceType: "route-capability-join",
        sourceId: route.id,
        sourcePath: route.filePath,
        method: "route-to-capability join",
        classification: "weakly-inferred",
        confidence: "low",
      });
    }
  }

  /* ------------------------------------------------------------- assemble */
  const nodes = [...b.nodes.values()].sort((a, c) => a.id.localeCompare(c.id));
  const edges = [...b.edges.values()].sort((a, c) => a.id.localeCompare(c.id));
  const version = nextGraphVersion(nodes, edges, {
    generator: POPULATION_GENERATOR,
    generatedAt: input.generatedAt,
    previous: input.previousVersion ?? null,
  });

  return {
    graph: { schemaVersion: GRAPH_SCHEMA_VERSION, version, nodes, edges },
    candidateEdges: [...b.candidates.values()].sort((a, c) => a.id.localeCompare(c.id)),
    inputs: describeInputs(routeReport.counts.total, classification.items.length),
  };
}

/* -------------------------------------------------------------------------- */

function describeInputs(routeCount: number, classifiedCount: number): readonly GraphInputSource[] {
  return [
    { name: "Module registry", kind: "registry", path: "src/modules/registry.ts", itemCount: getModules().length, used: true, notes: "Manifest discovery via import.meta.glob." },
    { name: "SRE module manifest", kind: "manifest", path: "src/modules/sre/module.manifest.ts", itemCount: 1, used: true, notes: "Only fully registered module." },
    { name: "SRE capability hierarchy", kind: "registry", path: "src/modules/sre/capabilityHierarchy.ts", itemCount: 1, used: true, notes: "Sub-capability containment." },
    { name: "Shared capability catalog", kind: "registry", path: "src/modules/shared/sharedCapabilities.ts", itemCount: SHARED_CAPABILITIES.length, used: true, notes: "Ownership and consumption edges." },
    { name: "Platform capability catalog", kind: "registry", path: "src/modules/platform/platformCapabilities.ts", itemCount: PLATFORM_CAPABILITIES.length, used: true, notes: "Kept out of module-owned counts." },
    { name: "Application route table", kind: "generated-inventory", path: "src/modules/generated/routeTable.ts", itemCount: APPLICATION_ROUTES.length, used: true, notes: "Observed route, page and permission facts." },
    { name: "Navigation registry", kind: "generated-inventory", path: "src/modules/generated/implementationInventory.ts", itemCount: NAVIGATION_ENTRIES.length, used: true, notes: "Route reachability, stored as route attributes." },
    { name: "Implementation inventory", kind: "generated-inventory", path: "src/modules/generated/implementationInventory.ts", itemCount: IMPLEMENTATION_INVENTORY.length, used: true, notes: "Pages, components, hooks, providers, stores, services, API clients, edge functions." },
    { name: "Observed domain signals", kind: "generated-inventory", path: "src/modules/generated/domainSignals.ts", itemCount: DOMAIN_SIGNALS.length, used: true, notes: "Database entities and edge functions (strong); agents, workflows, integrations (candidate only)." },
    { name: "Route reconciliation report", kind: "derived-report", path: "src/modules/routeOwnership.ts", itemCount: routeCount, used: true, notes: "Route ownership classification and conflicts." },
    { name: "Unregistered classification", kind: "derived-report", path: "src/modules/classification.ts", itemCount: classifiedCount, used: true, notes: "Ownership decisions, customer-specific and experimental flags." },
    { name: "SRE evidence records", kind: "generated-inventory", path: "src/modules/sre/evidence.generated.ts", itemCount: SRE_PAGE_EVIDENCE.length, used: true, notes: "Evidence strength, data backing, traced dependencies." },
    { name: "Stage 1–3 documentation", kind: "documentation", path: "docs/modules/", itemCount: 0, used: false, notes: "Narrative only; never overrides code or registry evidence." },
  ];
}

/* -------------------------------------------------------------------------- */

let cached: PopulatedGraph | null = null;

/** Memoized populated graph for the current registry state. */
export function getPopulatedGraph(): PopulatedGraph {
  cached ??= populateCapabilityGraph();
  return cached;
}

/** Test-only: clear the memoized populated graph. */
export function __resetPopulationCache(): void {
  cached = null;
}
