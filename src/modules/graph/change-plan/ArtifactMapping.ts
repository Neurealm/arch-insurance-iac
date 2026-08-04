/**
 * Stage 3.5.3.5 — deterministic mapping from graph entities and simulated
 * change operations to repository source artifacts.
 *
 * The mapper never invents a path. Every candidate comes from one of five
 * deterministic sources: the declared artifact catalog, module-registry
 * metadata, graph node provenance (`filePath`), graph entity source
 * references (`evidence`), or a documented path convention. When no source
 * yields a candidate the mapping is reported as unresolved.
 */

import type { CapabilityGraph, GraphNode, GraphNodeType } from "../types";
import type { ReasoningEvidence } from "../reasoning/index";
import type { ChangeOperation, ProposedChange } from "../simulation/index";
import {
  byString,
  planHash,
  planSlug,
  planSortedUnique,
  type ArtifactLocator,
  type ArtifactMapping,
  type ArtifactMappingMethod,
  type ArtifactType,
  type MappingConfidence,
} from "./ChangePlanTypes";

/* -------------------------------------------------------------------------- */
/* Declared artifact catalog                                                   */
/* -------------------------------------------------------------------------- */

export interface CatalogEntry {
  path: string;
  type: ArtifactType;
  /** Change operations for which this file is the system of record. */
  authoritativeFor: readonly ChangeOperation[];
  description: string;
}

/**
 * Repository artifacts that exist today and are authoritative for graph-derived
 * declarations. Verified against the repository tree at authoring time; the
 * catalog is data, not an assumption about arbitrary paths.
 */
export const ARTIFACT_CATALOG: readonly CatalogEntry[] = [
  {
    path: "src/modules/sre/module.manifest.ts",
    type: "module-manifest",
    authoritativeFor: [
      "declare-ownership",
      "replace-ownership",
      "add-route-registration",
      "add-service-registration",
      "add-capability-registration",
      "add-module-registration",
      "mark-expected-by-design",
    ],
    description: "SRE module manifest: boundaries, capabilities and ownership declarations.",
  },
  {
    path: "src/modules/shared/sharedCapabilities.ts",
    type: "shared-capability-registry",
    authoritativeFor: ["add-capability-registration", "declare-ownership", "replace-ownership"],
    description: "Shared capability registry.",
  },
  {
    path: "src/modules/platform/platformCapabilities.ts",
    type: "platform-capability-registry",
    authoritativeFor: ["add-platform-registration", "declare-ownership", "replace-ownership"],
    description: "Platform capability registry.",
  },
  {
    path: "src/modules/sre/capabilityHierarchy.ts",
    type: "capability-hierarchy",
    authoritativeFor: ["add-capability-registration", "add-lineage-relationship"],
    description: "SRE capability hierarchy (capability and sub-capability declarations).",
  },
  {
    path: "src/modules/generated/routeTable.ts",
    type: "route-registry",
    authoritativeFor: ["add-route-registration"],
    description: "Generated route table extracted from the application router.",
  },
  {
    path: "src/modules/generated/implementationInventory.ts",
    type: "implementation-inventory",
    authoritativeFor: ["add-service-registration"],
    description: "Generated implementation inventory (pages, components, services).",
  },
  {
    path: "src/modules/candidates.ts",
    type: "candidate-edge-registry",
    authoritativeFor: ["promote-candidate-edge", "reject-candidate-edge"],
    description: "Candidate module and relationship records.",
  },
  {
    path: "src/modules/governance.ts",
    type: "governance-registry",
    authoritativeFor: ["mark-expected-by-design"],
    description: "Governance rules, including expected-by-design exceptions.",
  },
  {
    path: "src/modules/graph/build.ts",
    type: "graph-builder",
    authoritativeFor: ["add-node", "add-edge", "remove-node", "remove-edge", "replace-edge"],
    description: "Capability graph builder inputs.",
  },
  {
    path: "src/modules/graph/populate.ts",
    type: "graph-population",
    authoritativeFor: [
      "add-node",
      "add-edge",
      "add-lineage-relationship",
      "update-node-metadata",
      "update-edge-metadata",
    ],
    description: "Graph population from the Stage 1–3 registries.",
  },
  {
    path: "src/modules/graph/graph.test.ts",
    type: "graph-validation-fixture",
    authoritativeFor: [],
    description: "Graph schema and validation fixtures.",
  },
  {
    path: "src/modules/graph/population.test.ts",
    type: "test-suite",
    authoritativeFor: [],
    description: "Graph population and reconciliation tests.",
  },
  {
    path: "docs/modules/module-map.md",
    type: "documentation",
    authoritativeFor: [],
    description: "Module map documentation.",
  },
  {
    path: "docs/modules/route-ownership-report.md",
    type: "documentation",
    authoritativeFor: [],
    description: "Route ownership documentation.",
  },
  {
    path: "docs/modules/shared-and-platform-capability-map.md",
    type: "documentation",
    authoritativeFor: [],
    description: "Shared and platform capability documentation.",
  },
];

const catalogByPath = new Map(ARTIFACT_CATALOG.map((entry) => [entry.path, entry]));

/** Whether a path is a known repository artifact. Never guesses. */
export const isKnownArtifact = (path: string): boolean => catalogByPath.has(path);

export const catalogEntry = (path: string): CatalogEntry | undefined => catalogByPath.get(path);

/* -------------------------------------------------------------------------- */
/* Path conventions                                                            */
/* -------------------------------------------------------------------------- */

/** Documented manifest convention: `src/modules/<moduleId>/module.manifest.ts`. */
export const manifestPathFor = (moduleId: string): string =>
  `src/modules/${moduleId}/module.manifest.ts`;

/* -------------------------------------------------------------------------- */
/* Mapping                                                                     */
/* -------------------------------------------------------------------------- */

const evidenceOf = (
  subject: string,
  statement: string,
  confidence: MappingConfidence,
): ReasoningEvidence => ({
  kind: "node-fact",
  subject,
  statement,
  confidence,
  candidate: false,
});

const locator = (
  path: string | null,
  type: ArtifactType,
  authoritative: boolean,
  method: ArtifactMappingMethod,
  confidence: MappingConfidence,
  evidence: readonly ReasoningEvidence[],
): ArtifactLocator => ({ path, type, authoritative, method, confidence, evidence });

const sortLocators = (locators: readonly ArtifactLocator[]): readonly ArtifactLocator[] =>
  [...locators].sort(
    (a, b) =>
      Number(b.authoritative) - Number(a.authoritative) ||
      byString(a.type, b.type) ||
      byString(a.path ?? "", b.path ?? ""),
  );

/** Node types that have a documented registry system of record. */
const REGISTRY_TYPE_FOR_NODE: Partial<Record<GraphNodeType, ArtifactType>> = {
  "shared-capability": "shared-capability-registry",
  "platform-capability": "platform-capability-registry",
  capability: "capability-hierarchy",
  "sub-capability": "capability-hierarchy",
  route: "route-registry",
  service: "implementation-inventory",
  page: "implementation-inventory",
  component: "implementation-inventory",
  module: "module-manifest",
};

export interface ArtifactMappingInput {
  graph: CapabilityGraph;
  /** Module ids known to the registry, used for manifest-path resolution. */
  knownModuleIds: readonly string[];
  /** Overrides the catalog; used by focused test fixtures. */
  catalog?: readonly CatalogEntry[];
}

/**
 * Maps one graph entity plus the operation applied to it onto repository
 * artifacts. Returns every deterministic candidate, and only selects one when
 * exactly one authoritative candidate exists.
 */
export function mapEntityToArtifacts(
  input: ArtifactMappingInput,
  entityId: string,
  operation: ChangeOperation,
  node: GraphNode | null,
): ArtifactMapping {
  const catalog = input.catalog ?? ARTIFACT_CATALOG;
  const candidates: ArtifactLocator[] = [];
  const rationale: string[] = [];

  // 1. Registry metadata: a module-owned entity resolves to its manifest when
  //    the module id is registered and the manifest convention is documented.
  const moduleId = node?.moduleId ?? null;
  if (moduleId && moduleId !== "platform" && input.knownModuleIds.includes(moduleId)) {
    const path = manifestPathFor(moduleId);
    if (catalog.some((c) => c.path === path)) {
      candidates.push(
        locator(path, "module-manifest", true, "registry-metadata", "high", [
          evidenceOf(entityId, `Owned by registered module "${moduleId}".`, "high"),
        ]),
      );
      rationale.push(`Module "${moduleId}" is registered; its manifest is the system of record.`);
    }
  }

  // 2. Node provenance: the graph already records the backing source file.
  if (node?.filePath) {
    const known = catalog.find((c) => c.path === node.filePath);
    candidates.push(
      locator(
        node.filePath,
        known?.type ?? "source-file",
        false,
        "node-provenance",
        known ? "high" : "medium",
        [evidenceOf(entityId, `Graph node provenance records "${node.filePath}".`, "high")],
      ),
    );
    rationale.push(`Node provenance points at "${node.filePath}".`);
  }

  // 3. Graph source references carried in node evidence.
  for (const ref of node?.evidence ?? []) {
    const entry = catalog.find((c) => c.path === ref);
    if (!entry) continue;
    candidates.push(
      locator(entry.path, entry.type, entry.authoritativeFor.includes(operation), "graph-source-reference", "high", [
        evidenceOf(entityId, `Graph evidence references "${entry.path}".`, "high"),
      ]),
    );
    rationale.push(`Graph evidence references "${entry.path}".`);
  }

  // 4. Declared catalog: files authoritative for this operation.
  for (const entry of catalog) {
    if (!entry.authoritativeFor.includes(operation)) continue;
    candidates.push(
      locator(entry.path, entry.type, true, "declared-catalog", "medium", [
        evidenceOf(entityId, `${entry.description} Authoritative for "${operation}".`, "medium"),
      ]),
    );
  }

  // 5. Path convention by node type when the registry type is documented.
  const registryType = node ? REGISTRY_TYPE_FOR_NODE[node.type] : undefined;
  if (registryType) {
    for (const entry of catalog.filter((c) => c.type === registryType)) {
      candidates.push(
        locator(entry.path, entry.type, false, "path-convention", "medium", [
          evidenceOf(
            entityId,
            `Node type "${node?.type}" is declared in ${registryType} artifacts.`,
            "medium",
          ),
        ]),
      );
    }
  }

  // Deduplicate by path, keeping the strongest candidate for each.
  const byPath = new Map<string, ArtifactLocator>();
  for (const candidate of sortLocators(candidates)) {
    const key = candidate.path ?? "unresolved";
    if (!byPath.has(key)) byPath.set(key, candidate);
  }
  const unique = sortLocators([...byPath.values()]);
  const authoritative = unique.filter((c) => c.authoritative);
  const resolved = authoritative.length > 0;
  const selected = authoritative.length === 1 ? authoritative[0] : null;
  const humanSelectionRequired = authoritative.length > 1 || (!resolved && unique.length > 0);

  const explanation = resolved
    ? selected
      ? `Selected "${selected.path}" (${selected.type}) via ${selected.method}: ${rationale[0] ?? "authoritative for the operation"}.`
      : `${authoritative.length} authoritative candidates exist for "${entityId}"; human selection is required.`
    : unique.length > 0
      ? `No authoritative artifact for operation "${operation}" on "${entityId}"; ${unique.length} non-authoritative candidate(s) found.`
      : `No deterministic artifact mapping exists for operation "${operation}" on "${entityId}". No path was invented.`;

  return {
    id: `map:${planSlug(entityId)}:${planHash(`${entityId}|${operation}|${unique.map((c) => c.path).join(",")}`)}`,
    entityId,
    entityType: node?.type ?? "graph",
    operation,
    resolved,
    selected,
    candidates: unique,
    multipleCandidates: unique.length > 1,
    humanSelectionRequired,
    explanation,
  };
}

/** Maps every change in a proposal, deterministically ordered by entity id. */
export function mapChangesToArtifacts(
  input: ArtifactMappingInput,
  changes: readonly ProposedChange[],
): readonly ArtifactMapping[] {
  const nodesById = new Map(input.graph.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const mappings: ArtifactMapping[] = [];

  for (const change of [...changes].sort((a, b) => byString(a.id, b.id))) {
    const entityIds = planSortedUnique([
      ...change.target.nodeIds,
      ...(change.target.kind === "node" ? [change.target.id] : []),
    ]);
    const subjects = entityIds.length > 0 ? entityIds : [change.target.id];
    for (const entityId of subjects) {
      const key = `${entityId}|${change.operation}`;
      if (seen.has(key)) continue;
      seen.add(key);
      mappings.push(
        mapEntityToArtifacts(input, entityId, change.operation, nodesById.get(entityId) ?? null),
      );
    }
  }

  return mappings.sort((a, b) => byString(a.entityId, b.entityId) || byString(a.id, b.id));
}

/** Unresolved mappings, deterministically ordered. */
export const unresolvedMappings = (
  mappings: readonly ArtifactMapping[],
): readonly ArtifactMapping[] => mappings.filter((m) => !m.resolved);

/** All distinct artifact paths targeted by a mapping set. */
export const artifactPaths = (mappings: readonly ArtifactMapping[]): readonly string[] =>
  planSortedUnique(
    mappings.flatMap((m) => (m.selected?.path ? [m.selected.path] : [])),
  );
