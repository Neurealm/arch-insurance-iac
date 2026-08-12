/**
 * Stage 3.5.3.3 — the recommendation policy engine.
 *
 * Every policy is typed, deterministic and testable code. A policy converts
 * Stage 3.5.3.2 reasoning records into policy candidates; it never traverses
 * the graph, never mutates anything and never invents facts. Prose lives only
 * in the declared metadata fields, which exist so the policy set is auditable.
 */

import type { GraphNode } from "../types";
import type {
  CircularDependencyRecord,
  CoverageGapRecord,
  CriticalNodeRecord,
  BottleneckRecord,
  LineageLayer,
  LineageRecord,
  OwnershipRecord,
  ReasoningAnalysis,
  ReasoningConfidence,
  ReasoningEvidence,
  ReasoningResult,
  ReasoningSeverity,
  SinglePointOfFailureRecord,
  TraceabilityRecord,
} from "../reasoning/index";
import { evidence, weakestConfidence } from "../reasoning/index";
import type { GraphQueryEngine } from "../query/index";
import type {
  AffectedEntities,
  ExpectedMetricImpact,
  RecommendationCategory,
  RemediationComplexity,
} from "./IntelligenceTypes";
import { EMPTY_AFFECTED, uniqueSorted } from "./IntelligenceTypes";
import type { PrioritySignals } from "./Prioritization";

/* -------------------------------------------------------------------------- */
/* Inputs                                                                      */
/* -------------------------------------------------------------------------- */

export interface ReasoningBundle {
  ownership: ReasoningResult<OwnershipRecord>;
  coverage: ReasoningResult<CoverageGapRecord>;
  spof: ReasoningResult<SinglePointOfFailureRecord>;
  critical: ReasoningResult<CriticalNodeRecord>;
  bottlenecks: ReasoningResult<BottleneckRecord>;
  cycles: ReasoningResult<CircularDependencyRecord>;
  traceability: ReasoningResult<TraceabilityRecord>;
  lineage: readonly ReasoningResult<LineageRecord>[];
  candidateEdgeCount: number;
}

export interface PolicyInput {
  engine: GraphQueryEngine;
  bundle: ReasoningBundle;
  /** null means whole-graph. Otherwise only these node ids are in scope. */
  scopeNodeIds: ReadonlySet<string> | null;
  candidateRelationshipsIncluded: boolean;
}

/* -------------------------------------------------------------------------- */
/* Candidates                                                                  */
/* -------------------------------------------------------------------------- */

export interface PolicyCandidate {
  policyId: string;
  /** Deterministic grouping key. Candidates sharing it are consolidated. */
  mergeKey: string;
  subject: string;
  title: string;
  summary: string;
  affected: AffectedEntities;
  evidence: readonly ReasoningEvidence[];
  sourceFindingIds: readonly string[];
  analyses: readonly ReasoningAnalysis[];
  confidence: ReasoningConfidence;
  candidateInvolved: boolean;
  expectedByDesign: boolean;
  severity: ReasoningSeverity;
  signals: PrioritySignals;
  complexity: RemediationComplexity;
  expectedBenefit: string;
  action: string;
  requiredUpdates: readonly string[];
  prerequisites: readonly string[];
  validationCriteria: readonly string[];
  expectedGraphImprovement: string;
  metricImpact: ExpectedMetricImpact;
  layers: readonly LineageLayer[];
  edgeIds: readonly string[];
  /** Why this candidate is kept separate from adjacent ones. */
  separationRationale: string;
}

export interface IntelligencePolicy {
  id: string;
  category: RecommendationCategory;
  severity: ReasoningSeverity;
  description: string;
  /** Declared, auditable policy contract. */
  trigger: string;
  exclusions: readonly string[];
  confidenceHandling: string;
  evidenceRequirement: string;
  deduplication: string;
  escalation: string;
  analyses: readonly ReasoningAnalysis[];
  evaluate(input: PolicyInput): readonly PolicyCandidate[];
}

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                              */
/* -------------------------------------------------------------------------- */

const NO_IMPACT: ExpectedMetricImpact = {
  coverage: null,
  ownership: null,
  traceability: null,
  resilience: null,
};

const inScope = (input: PolicyInput, nodeId: string): boolean =>
  input.scopeNodeIds === null || input.scopeNodeIds.has(nodeId);

/** Groups values under deterministic keys and iterates keys in sorted order. */
function groupBy<T>(items: readonly T[], key: (item: T) => string): readonly [string, readonly T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

const findingIdSet = (result: ReasoningResult<unknown>): ReadonlySet<string> =>
  new Set(result.findings.map((f) => f.id));

const knownFindingIds = (
  available: ReadonlySet<string>,
  analysis: ReasoningAnalysis,
  subjects: readonly string[],
): readonly string[] =>
  uniqueSorted(subjects.map((s) => `${analysis}:${s}`).filter((id) => available.has(id)));

const affectedFrom = (
  input: PolicyInput,
  nodeIds: readonly string[],
  extraOwners: readonly string[] = [],
): AffectedEntities => {
  const nodes = nodeIds
    .map((id) => input.engine.getNode(id))
    .filter((n): n is GraphNode => n !== null);
  const pick = (...types: string[]) => uniqueSorted(nodes.filter((n) => types.includes(n.type)).map((n) => n.id));
  return {
    nodeIds: uniqueSorted(nodeIds),
    routeIds: pick("route"),
    moduleIds: uniqueSorted([
      ...nodes.filter((n) => n.type === "module").map((n) => n.id),
      ...nodes.map((n) => n.moduleId).filter((m): m is string => typeof m === "string"),
    ]),
    capabilityIds: pick("capability", "sub-capability", "shared-capability"),
    serviceIds: pick("service", "api"),
    platformIds: pick("platform-capability"),
    owners: uniqueSorted([
      ...extraOwners,
      ...nodes.map((n) => n.moduleId).filter((m): m is string => typeof m === "string"),
    ]),
  };
};

const breadthOf = (affected: AffectedEntities): number =>
  affected.routeIds.length + affected.moduleIds.length;

/* -------------------------------------------------------------------------- */
/* Ownership policies                                                          */
/* -------------------------------------------------------------------------- */

const unresolvedOwnership: IntelligencePolicy = {
  id: "POL-OWN-001",
  category: "ownership",
  severity: "warning",
  description: "Nodes whose owning module cannot be resolved by declaration or propagation.",
  trigger: "An ownership record with resolution = 'unresolved'.",
  exclusions: [
    "Records with a declared, propagated or conflicting resolution.",
    "Nodes outside the requested analysis scope.",
  ],
  confidenceHandling: "Weakest confidence across the contributing ownership records.",
  evidenceRequirement: "One absence-evidence item per unresolved node.",
  deduplication: "Consolidated by node type; one recommendation per unowned node type.",
  escalation: "Escalates to critical severity when more than 100 nodes of one type are unowned.",
  analyses: ["ownership-propagation"],
  evaluate(input) {
    const available = findingIdSet(input.bundle.ownership);
    const records = input.bundle.ownership.results.filter(
      (r) => r.resolution === "unresolved" && inScope(input, r.nodeId),
    );
    return groupBy(records, (r) => r.nodeType).map(([nodeType, group]) => {
      const nodeIds = uniqueSorted(group.map((r) => r.nodeId));
      const affected = affectedFrom(input, nodeIds);
      return {
        policyId: this.id,
        mergeKey: `ownership-unresolved:${nodeType}`,
        subject: `nodeType:${nodeType}`,
        title: `Declare an owning module for ${group.length} unowned ${nodeType} node(s)`,
        summary: `${group.length} ${nodeType} node(s) have no declared owner and no ownership path to a module, so accountability cannot be established from the graph.`,
        affected,
        evidence: group
          .slice(0, 25)
          .map((r) =>
            evidence(
              "absence",
              r.nodeId,
              `"${r.label}" (${r.nodeType}) has no declared owner and no ownership edge reaching a module.`,
              r.confidence,
            ),
          ),
        sourceFindingIds: knownFindingIds(available, "ownership-propagation", nodeIds),
        analyses: ["ownership-propagation"] as const,
        confidence: weakestConfidence(group.map((r) => r.confidence)),
        candidateInvolved: false,
        expectedByDesign: false,
        severity: group.length > 100 ? ("critical" as const) : this.severity,
        signals: {
          ownershipRisk: 1,
          blastRadius: nodeIds.length,
          breadth: breadthOf(affected),
        },
        complexity: "low" as const,
        expectedBenefit: `Raises the ownership resolution rate and makes ${group.length} ${nodeType} node(s) accountable to a named module.`,
        action: `Register the ${group.length} unowned ${nodeType} node(s) against an owning module manifest.`,
        requiredUpdates: [
          `Add each node to the owning module manifest so a declared moduleId exists.`,
          `Re-run graph population so ownership edges are emitted.`,
        ],
        prerequisites: ["An owning module must exist and be registered."],
        validationCriteria: [
          `ownershipPropagation() reports resolution = 'declared' for every listed node id.`,
        ],
        expectedGraphImprovement: `${group.length} ownership record(s) move from 'unresolved' to 'declared'.`,
        metricImpact: {
          ...NO_IMPACT,
          ownership: `Ownership resolution rate increases by up to ${group.length} node(s).`,
        },
        layers: [],
        edgeIds: [],
        separationRationale: "Kept separate from other node types because each type is registered through a different manifest section.",
      };
    });
  },
};

const conflictingOwnership: IntelligencePolicy = {
  id: "POL-OWN-002",
  category: "governance",
  severity: "critical",
  description: "Nodes where two or more modules claim ownership.",
  trigger: "An ownership record with resolution = 'conflicting'.",
  exclusions: ["Records with a single candidate owner.", "Nodes outside scope."],
  confidenceHandling: "Inherits the ownership record confidence; never upgraded.",
  evidenceRequirement: "One node-fact per conflicting node listing every claimant.",
  deduplication: "One recommendation per node: each conflict needs its own adjudication.",
  escalation: "Always critical; ownership conflicts block governance sign-off.",
  analyses: ["ownership-propagation"],
  evaluate(input) {
    const available = findingIdSet(input.bundle.ownership);
    return input.bundle.ownership.results
      .filter((r) => r.resolution === "conflicting" && inScope(input, r.nodeId))
      .map((r) => {
        const affected = affectedFrom(input, [r.nodeId], r.candidateOwners);
        return {
          policyId: this.id,
          mergeKey: `ownership-conflict:${r.nodeId}`,
          subject: r.nodeId,
          title: `Adjudicate conflicting ownership of "${r.label}"`,
          summary: `"${r.label}" (${r.nodeType}) is claimed by ${r.candidateOwners.length} modules: ${r.candidateOwners.join(", ")}.`,
          affected,
          evidence: [
            evidence(
              "node-fact",
              r.nodeId,
              `Ownership propagation resolved multiple competing owners: ${r.candidateOwners.join(", ")}.`,
              r.confidence,
              { nodeIds: [r.nodeId] },
            ),
          ],
          sourceFindingIds: knownFindingIds(available, "ownership-propagation", [r.nodeId]),
          analyses: ["ownership-propagation"] as const,
          confidence: r.confidence,
          candidateInvolved: false,
          expectedByDesign: false,
          severity: this.severity,
          signals: {
            ownershipRisk: 1,
            breadth: r.candidateOwners.length,
            blastRadius: 1 + r.candidateOwners.length,
          },
          complexity: "moderate" as const,
          expectedBenefit: "Removes an ownership ambiguity that blocks accountable change management.",
          action: `Decide a single owning module for "${r.label}" and remove the competing claim(s).`,
          requiredUpdates: [
            "Amend the losing module manifest(s) to drop the claim.",
            "Confirm the winning module declares the node explicitly.",
          ],
          prerequisites: ["Governance decision recorded between the claiming module owners."],
          validationCriteria: ["ownershipPropagation() reports resolution = 'declared' for the node."],
          expectedGraphImprovement: "One conflicting ownership record becomes declared.",
          metricImpact: { ...NO_IMPACT, ownership: "Removes one ownership conflict." },
          layers: [],
          edgeIds: [],
          separationRationale: "Each conflict requires an independent governance decision, so conflicts are never merged.",
        };
      });
  },
};

const propagatedOwnership: IntelligencePolicy = {
  id: "POL-OWN-003",
  category: "governance",
  severity: "advisory",
  description: "Ownership that is only inferred through propagation and should be declared formally.",
  trigger: "An ownership record with resolution = 'propagated'.",
  exclusions: ["Declared, conflicting or unresolved records.", "Nodes outside scope."],
  confidenceHandling: "Weakest confidence across the group; propagation never raises confidence.",
  evidenceRequirement: "The propagation path walked to reach the inferred owner.",
  deduplication: "Consolidated by resolved owning module.",
  escalation: "Escalates to warning when a single module carries more than 50 inferred nodes.",
  analyses: ["ownership-propagation"],
  evaluate(input) {
    const available = findingIdSet(input.bundle.ownership);
    const records = input.bundle.ownership.results.filter(
      (r) => r.resolution === "propagated" && inScope(input, r.nodeId),
    );
    return groupBy(records, (r) => r.resolvedModuleId ?? "(unknown)").map(([owner, group]) => {
      const nodeIds = uniqueSorted(group.map((r) => r.nodeId));
      const affected = affectedFrom(input, nodeIds, [owner]);
      return {
        policyId: this.id,
        mergeKey: `ownership-propagated:${owner}`,
        subject: `module:${owner}`,
        title: `Formally declare ${group.length} node(s) inferred to be owned by "${owner}"`,
        summary: `${group.length} node(s) resolve to "${owner}" only by walking ownership edges. Declaring them makes accountability explicit rather than derived.`,
        affected,
        evidence: group
          .slice(0, 25)
          .map((r) =>
            evidence(
              "path",
              r.nodeId,
              `Ownership inferred via ${r.propagationPath.join(" -> ") || "a direct ownership edge"}.`,
              r.confidence,
              { nodeIds: [r.nodeId, ...r.propagationPath] },
            ),
          ),
        sourceFindingIds: knownFindingIds(available, "ownership-propagation", nodeIds),
        analyses: ["ownership-propagation"] as const,
        confidence: weakestConfidence(group.map((r) => r.confidence)),
        candidateInvolved: false,
        expectedByDesign: false,
        severity: group.length > 50 ? ("warning" as const) : this.severity,
        signals: { ownershipRisk: 0.5, blastRadius: nodeIds.length, breadth: breadthOf(affected) },
        complexity: "trivial" as const,
        expectedBenefit: "Converts inferred accountability into declared accountability for one module.",
        action: `Declare the ${group.length} inferred node(s) explicitly in the "${owner}" module manifest.`,
        requiredUpdates: [`Add explicit ownership declarations to the "${owner}" manifest.`],
        prerequisites: [],
        validationCriteria: ["ownershipPropagation() reports resolution = 'declared' for the listed nodes."],
        expectedGraphImprovement: `${group.length} record(s) move from 'propagated' to 'declared'.`,
        metricImpact: { ...NO_IMPACT, ownership: "Increases declared-ownership share." },
        layers: [],
        edgeIds: [],
        separationRationale: "Grouped per owning module because one manifest edit resolves the whole group.",
      };
    });
  },
};

/* -------------------------------------------------------------------------- */
/* Traceability policies                                                       */
/* -------------------------------------------------------------------------- */

const routeTraceabilityGap: IntelligencePolicy = {
  id: "POL-TRACE-001",
  category: "traceability",
  severity: "warning",
  description: "Routes that cannot be traced through to a capability and owning module.",
  trigger: "A route traceability record with complete = false.",
  exclusions: ["Complete traceability chains.", "Routes outside scope."],
  confidenceHandling: "Weakest confidence across the group, downgraded when candidate edges were followed.",
  evidenceRequirement: "One absence-evidence item per route naming the missing layers.",
  deduplication: "Consolidated by the exact set of missing layers, so one fix pattern maps to one recommendation.",
  escalation: "Escalates to critical when the module layer is missing for more than 25 routes.",
  analyses: ["route-traceability"],
  evaluate(input) {
    const available = findingIdSet(input.bundle.traceability);
    const records = input.bundle.traceability.results.filter(
      (r) => !r.complete && inScope(input, r.routeId),
    );
    return groupBy(records, (r) => [...r.layersMissing].sort().join("+") || "(none)").map(
      ([missingKey, group]) => {
        const missing = group[0].layersMissing;
        const routeIds = uniqueSorted(group.map((r) => r.routeId));
        const affected = affectedFrom(input, [
          ...routeIds,
          ...group.flatMap((r) => [...r.serviceIds, ...r.capabilityIds]),
        ]);
        const candidateInvolved = group.some((r) => r.candidate);
        return {
          policyId: this.id,
          mergeKey: `route-traceability:${missingKey}`,
          subject: `missing-layers:${missingKey}`,
          title: `Restore ${missing.join(", ")} traceability for ${group.length} route(s)`,
          summary: `${group.length} route(s) never reach the ${missing.join(", ")} layer(s), so their business capability and owner cannot be traced from the graph.`,
          affected,
          evidence: group
            .slice(0, 25)
            .map((r) =>
              evidence(
                "absence",
                r.routeId,
                `Route ${r.routePath ?? r.routeId} covers ${r.layersCovered.join(", ") || "no layer"} and never reaches ${r.layersMissing.join(", ")}.`,
                r.confidence,
                { nodeIds: [r.routeId] },
              ),
            ),
          sourceFindingIds: knownFindingIds(available, "route-traceability", routeIds),
          analyses: ["route-traceability"] as const,
          confidence: weakestConfidence(group.map((r) => r.confidence)),
          candidateInvolved,
          expectedByDesign: false,
          severity:
            missing.includes("module") && group.length > 25 ? ("critical" as const) : this.severity,
          signals: {
            traceabilityRisk: Math.min(1, missing.length / 5),
            blastRadius: routeIds.length,
            breadth: breadthOf(affected),
            dependencyDepth: group[0].steps.length,
          },
          complexity: missing.length > 2 ? ("high" as const) : ("moderate" as const),
          expectedBenefit: `Raises the route traceability rate and lets ${group.length} route(s) be attributed to a capability and owner.`,
          action: `Register the missing ${missing.join(", ")} relationship(s) for the ${group.length} affected route(s).`,
          requiredUpdates: [
            `Declare the ${missing.join(", ")} layer entities in the owning module manifest.`,
            "Emit the relationships that connect the route to those entities.",
          ],
          prerequisites: ["The target capability or module must exist before the route can point at it."],
          validationCriteria: ["routeTraceability() reports complete = true for the listed routes."],
          expectedGraphImprovement: `${group.length} traceability record(s) become complete.`,
          metricImpact: {
            ...NO_IMPACT,
            traceability: `Route traceability rate improves by up to ${group.length} route(s).`,
          },
          layers: missing,
          edgeIds: [],
          separationRationale: "Grouped by identical missing-layer signature: routes missing different layers need different fixes.",
        };
      },
    );
  },
};

const missingLineageLayer: IntelligencePolicy = {
  id: "POL-TRACE-002",
  category: "architecture",
  severity: "advisory",
  description: "Capabilities whose lineage never reaches the platform layers it should.",
  trigger: "A capability lineage record with at least one missing expected layer.",
  exclusions: ["Complete lineage chains.", "Capabilities outside scope."],
  confidenceHandling: "Weakest confidence across the group; downgraded when candidate edges contributed.",
  evidenceRequirement: "One absence-evidence item per capability naming the unreached layers.",
  deduplication: "Consolidated by the missing-layer signature.",
  escalation: "Escalates to warning when the module layer is unreachable.",
  analyses: ["capability-lineage"],
  evaluate(input) {
    const records = input.bundle.lineage
      .flatMap((r) => r.results)
      .filter((r) => r.layersMissing.length > 0 && inScope(input, r.subjectId));
    return groupBy(records, (r) => [...r.layersMissing].sort().join("+")).map(([missingKey, group]) => {
      const missing = group[0].layersMissing;
      const nodeIds = uniqueSorted(group.map((r) => r.subjectId));
      const affected = affectedFrom(input, nodeIds);
      return {
        policyId: this.id,
        mergeKey: `lineage-missing:${missingKey}`,
        subject: `missing-layers:${missingKey}`,
        title: `Connect ${group.length} capability chain(s) to the ${missing.join(", ")} layer(s)`,
        summary: `${group.length} capability lineage chain(s) never reach ${missing.join(", ")}, so platform dependence cannot be proven from the graph.`,
        affected,
        evidence: group
          .slice(0, 25)
          .map((r) =>
            evidence(
              "absence",
              r.subjectId,
              `Lineage covers ${r.layersCovered.join(", ") || "no layer"} and never reaches ${r.layersMissing.join(", ")}.`,
              r.confidence,
              { nodeIds: [r.subjectId] },
            ),
          ),
        sourceFindingIds: [],
        analyses: ["capability-lineage"] as const,
        confidence: weakestConfidence(group.map((r) => r.confidence)),
        candidateInvolved: group.some((r) => r.candidate),
        expectedByDesign: false,
        severity: missing.includes("module") ? ("warning" as const) : this.severity,
        signals: {
          traceabilityRisk: Math.min(1, missing.length / 4),
          blastRadius: nodeIds.length,
          breadth: breadthOf(affected),
        },
        complexity: "moderate" as const,
        expectedBenefit: "Makes platform and shared-capability dependence explicit for the affected capabilities.",
        action: `Declare the relationships that link the affected capabilities to their ${missing.join(", ")} layer entities.`,
        requiredUpdates: [`Register ${missing.join(", ")} relationships in the owning module manifests.`],
        prerequisites: ["The target platform or shared capability must be registered."],
        validationCriteria: ["capabilityLineage() reports no missing layers for the listed capabilities."],
        expectedGraphImprovement: `${group.length} lineage chain(s) become complete.`,
        metricImpact: { ...NO_IMPACT, traceability: "Increases lineage completeness." },
        layers: missing,
        edgeIds: [],
        separationRationale: "Grouped by identical missing-layer signature.",
      };
    });
  },
};

/* -------------------------------------------------------------------------- */
/* Registration and coverage policies                                          */
/* -------------------------------------------------------------------------- */

const REGISTRATION_GAP_KINDS: readonly CoverageGapRecord["kind"][] = [
  "route-without-capability",
  "capability-without-implementation",
  "unowned-implementation",
];

const STRUCTURAL_GAP_KINDS: readonly CoverageGapRecord["kind"][] = [
  "service-never-consumed",
  "module-without-persona",
  "isolated-node",
];

export const COVERAGE_GAP_WEIGHT: Readonly<Record<CoverageGapRecord["kind"], number>> = {
  "route-without-capability": 1,
  "capability-without-implementation": 0.9,
  "unowned-implementation": 0.8,
  "isolated-node": 0.6,
  "service-never-consumed": 0.5,
  "module-without-persona": 0.3,
};

const gapPolicy = (
  id: string,
  category: RecommendationCategory,
  severity: ReasoningSeverity,
  kinds: readonly CoverageGapRecord["kind"][],
  description: string,
): IntelligencePolicy => ({
  id,
  category,
  severity,
  description,
  trigger: `An unexpected coverage gap of kind ${kinds.join(", ")}.`,
  exclusions: [
    "Gaps flagged expected-by-design (handled by POL-REG-003).",
    "Gap kinds owned by another policy.",
    "Nodes outside scope.",
  ],
  confidenceHandling: "Coverage gaps are structural absences observed directly; confidence is high unless the node itself is unverified.",
  evidenceRequirement: "One absence-evidence item per gap node with the analysis rationale.",
  deduplication: "Consolidated by gap kind and owning module.",
  escalation: "Escalates to critical when a single kind/module pair exceeds 100 nodes.",
  analyses: ["coverage-gaps"],
  evaluate(input) {
    const available = findingIdSet(input.bundle.coverage);
    const records = input.bundle.coverage.results.filter(
      (g) => kinds.includes(g.kind) && !g.expected && inScope(input, g.nodeId),
    );
    return groupBy(records, (g) => `${g.kind}|${g.moduleId ?? "(unowned)"}`).map(([key, group]) => {
      const [kind, owner] = key.split("|");
      const nodeIds = uniqueSorted(group.map((g) => g.nodeId));
      const affected = affectedFrom(input, nodeIds, owner === "(unowned)" ? [] : [owner]);
      const weight = COVERAGE_GAP_WEIGHT[group[0].kind];
      return {
        policyId: id,
        mergeKey: `coverage:${kind}:${owner}`,
        subject: `${kind}@${owner}`,
        title: `Resolve ${group.length} "${kind}" gap(s) in ${owner}`,
        summary: `${group.length} node(s) owned by ${owner} exhibit the "${kind}" coverage gap: ${group[0].rationale}`,
        affected,
        evidence: group
          .slice(0, 25)
          .map((g) => evidence("absence", g.nodeId, `${g.label} (${g.nodeType}): ${g.rationale}`, "high", {
            nodeIds: [g.nodeId],
          })),
        sourceFindingIds: knownFindingIds(available, "coverage-gaps", nodeIds),
        analyses: ["coverage-gaps"] as const,
        confidence: "high" as const,
        candidateInvolved: false,
        expectedByDesign: false,
        severity: group.length > 100 ? ("critical" as const) : severity,
        signals: {
          coverageGap: weight,
          blastRadius: nodeIds.length,
          breadth: breadthOf(affected),
        },
        complexity: group.length > 50 ? ("high" as const) : ("moderate" as const),
        expectedBenefit: `Closes ${group.length} registration/coverage gap(s) and increases the share of the graph that can be reasoned about.`,
        action: `Register the missing relationships for the ${group.length} "${kind}" node(s) in ${owner}.`,
        requiredUpdates: [
          `Declare the missing relationship implied by "${kind}" in the owning module manifest.`,
          "Re-run graph population and validation.",
        ],
        prerequisites: owner === "(unowned)" ? ["An owning module must be assigned first (see POL-OWN-001)."] : [],
        validationCriteria: [`coverageGaps() no longer reports "${kind}" for the listed node ids.`],
        expectedGraphImprovement: `${group.length} coverage gap(s) removed.`,
        metricImpact: { ...NO_IMPACT, coverage: `Coverage gap count falls by up to ${group.length}.` },
        layers: [],
        edgeIds: [],
        separationRationale: "Grouped per gap kind and owning module because each pair is fixed by one manifest change.",
      };
    });
  },
});

const missingRegistration = gapPolicy(
  "POL-REG-001",
  "registration",
  "warning",
  REGISTRATION_GAP_KINDS,
  "Routes, capabilities and implementations that are not registered against the layer above them.",
);

const structuralCoverageGap = gapPolicy(
  "POL-REG-002",
  "architecture",
  "advisory",
  STRUCTURAL_GAP_KINDS,
  "Structural coverage gaps: unconsumed services, persona-less modules and isolated nodes.",
);

const expectedByDesignException: IntelligencePolicy = {
  id: "POL-REG-003",
  category: "governance",
  severity: "info",
  description: "Coverage gaps that are expected by design, retained as an auditable exception register.",
  trigger: "A coverage gap flagged expected = true.",
  exclusions: ["Unexpected gaps, which belong to POL-REG-001/002."],
  confidenceHandling: "High: the exception is observed, not inferred.",
  evidenceRequirement: "One aggregate-evidence item per gap kind.",
  deduplication: "Consolidated by gap kind into a single exception entry.",
  escalation: "Never escalates; the priority score is clamped to the informational band.",
  analyses: ["coverage-gaps"],
  evaluate(input) {
    const records = input.bundle.coverage.results.filter((g) => g.expected && inScope(input, g.nodeId));
    return groupBy(records, (g) => g.kind).map(([kind, group]) => {
      const nodeIds = uniqueSorted(group.map((g) => g.nodeId));
      const affected = affectedFrom(input, nodeIds);
      return {
        policyId: this.id,
        mergeKey: `expected-by-design:${kind}`,
        subject: `${kind}@expected`,
        title: `Acknowledge ${group.length} expected "${kind}" exception(s)`,
        summary: `${group.length} "${kind}" gap(s) are expected by design and are recorded as accepted exceptions rather than defects.`,
        affected,
        evidence: [
          evidence(
            "aggregate",
            `expected:${kind}`,
            `${group.length} node(s) exhibit "${kind}" and were classified expected by design by coverage analysis.`,
            "high",
            { nodeIds: nodeIds.slice(0, 25) },
          ),
        ],
        sourceFindingIds: [],
        analyses: ["coverage-gaps"] as const,
        confidence: "high" as const,
        candidateInvolved: false,
        expectedByDesign: true,
        severity: this.severity,
        signals: { coverageGap: COVERAGE_GAP_WEIGHT[group[0].kind], blastRadius: nodeIds.length },
        complexity: "trivial" as const,
        expectedBenefit: "Keeps the exception register explicit so accepted gaps are never mistaken for defects.",
        action: `Record the ${group.length} "${kind}" exception(s) in the governance exception register and review them periodically.`,
        requiredUpdates: ["No graph change required; governance record only."],
        prerequisites: [],
        validationCriteria: ["The exception register lists every node id shown here."],
        expectedGraphImprovement: "None: the gap is accepted.",
        metricImpact: NO_IMPACT,
        layers: [],
        edgeIds: [],
        separationRationale: "One entry per gap kind so each exception class is reviewed on its own cadence.",
      };
    });
  },
};

/* -------------------------------------------------------------------------- */
/* Resilience policies                                                         */
/* -------------------------------------------------------------------------- */

const singlePointOfFailure: IntelligencePolicy = {
  id: "POL-RES-001",
  category: "resilience",
  severity: "critical",
  description: "Nodes whose removal strands dependants with no redundant provider.",
  trigger: "A single-point-of-failure record with at least one stranded dependant.",
  exclusions: ["Nodes with a redundant provider.", "Nodes outside scope."],
  confidenceHandling: "High when derived from declared dependency edges; downgraded if candidate edges were followed.",
  evidenceRequirement: "The stranded dependant set plus the affected modules.",
  deduplication: "One recommendation per SPOF node: redundancy is designed per node.",
  escalation: "Escalates when more than three modules are affected.",
  analyses: ["single-points-of-failure"],
  evaluate(input) {
    const available = findingIdSet(input.bundle.spof);
    return input.bundle.spof.results
      .filter((r) => inScope(input, r.node.id))
      .map((r) => {
        const affected = affectedFrom(input, [r.node.id, ...r.strandedNodeIds], r.affectedModules);
        return {
          policyId: this.id,
          mergeKey: `spof:${r.node.id}`,
          subject: r.node.id,
          title: `Introduce redundancy for single point of failure "${r.node.label}"`,
          summary: `"${r.node.label}" (${r.node.type}) is the sole provider for ${r.strandedCount} dependant(s) across ${r.affectedModules.length} module(s); its loss strands all of them.`,
          affected,
          evidence: [
            evidence(
              "degree",
              r.node.id,
              `${r.strandedCount} dependant(s) have no alternative provider for the relationship supplied by this node.`,
              "high",
              { nodeIds: [r.node.id, ...r.strandedNodeIds.slice(0, 25)] },
            ),
          ],
          sourceFindingIds: knownFindingIds(available, "single-points-of-failure", [r.node.id]),
          analyses: ["single-points-of-failure"] as const,
          confidence: "high" as const,
          candidateInvolved: input.candidateRelationshipsIncluded,
          expectedByDesign: false,
          severity: this.severity,
          signals: {
            blastRadius: r.strandedCount,
            criticality: Math.min(100, r.strandedCount * 10),
            breadth: r.affectedModules.length,
            dependencyDepth: 1,
          },
          complexity: "high" as const,
          expectedBenefit: `Removes a single point of failure affecting ${r.strandedCount} dependant(s).`,
          action: `Provide a redundant provider for "${r.node.label}", or explicitly accept the risk in the resilience register.`,
          requiredUpdates: [
            "Register an alternative provider relationship for the stranded dependants, or",
            "Record an accepted-risk entry naming this node.",
          ],
          prerequisites: ["A viable alternative provider must exist or be built."],
          validationCriteria: ["singlePointsOfFailure() no longer lists this node, or a risk acceptance is recorded."],
          expectedGraphImprovement: "One SPOF removed from the resilience profile.",
          metricImpact: { ...NO_IMPACT, resilience: "Single-point-of-failure count falls by one." },
          layers: [],
          edgeIds: [],
          separationRationale: "Redundancy is designed per node, so SPOFs are never consolidated.",
        };
      });
  },
};

const criticalDependencyChain: IntelligencePolicy = {
  id: "POL-RES-002",
  category: "resilience",
  severity: "warning",
  description: "Highly connected nodes that also sit on deep dependency chains.",
  trigger: "A critical node with score >= 40 that is a sole provider or has upstream reach >= 5.",
  exclusions: ["Nodes below the score threshold.", "Nodes already covered by POL-RES-001 with no additional chain depth."],
  confidenceHandling: "Derived from declared dependency edges; downgraded when candidate edges are included.",
  evidenceRequirement: "Degree and reach counts from criticality analysis.",
  deduplication: "One per node; consolidated away when a SPOF recommendation covers the same node.",
  escalation: "Escalates to critical at score >= 80.",
  analyses: ["critical-nodes"],
  evaluate(input) {
    const available = findingIdSet(input.bundle.critical);
    return input.bundle.critical.results
      .filter(
        (r) =>
          inScope(input, r.node.id) &&
          r.score >= 40 &&
          (r.soleProvider || r.upstreamReach >= 5),
      )
      .map((r) => {
        const affected = affectedFrom(input, [r.node.id]);
        return {
          policyId: this.id,
          mergeKey: `critical-chain:${r.node.id}`,
          subject: r.node.id,
          title: `Review the critical dependency chain through "${r.node.label}"`,
          summary: `"${r.node.label}" scores ${r.score}/100 on structural criticality with ${r.dependentCount} dependant(s), ${r.dependencyCount} dependency(ies) and an upstream reach of ${r.upstreamReach}.`,
          affected,
          evidence: [
            evidence("degree", r.node.id, r.basis.join("; "), "high", { nodeIds: [r.node.id] }),
          ],
          sourceFindingIds: knownFindingIds(available, "critical-nodes", [r.node.id]),
          analyses: ["critical-nodes"] as const,
          confidence: "high" as const,
          candidateInvolved: input.candidateRelationshipsIncluded,
          expectedByDesign: false,
          severity: r.score >= 80 ? ("critical" as const) : this.severity,
          signals: {
            criticality: r.score,
            blastRadius: r.downstreamReach,
            breadth: r.distinctDependentModules,
            dependencyDepth: r.upstreamReach,
          },
          complexity: "moderate" as const,
          expectedBenefit: "Documents and de-risks the deepest supply chain in the affected area.",
          action: `Document the dependency chain through "${r.node.label}" and confirm each hop has an owner and a recovery path.`,
          requiredUpdates: ["Record the chain in the operational runbook for the owning module."],
          prerequisites: [],
          validationCriteria: ["The chain is documented and each hop has a declared owner."],
          expectedGraphImprovement: "No structural change; improves operational readiness.",
          metricImpact: { ...NO_IMPACT, resilience: "Improves recovery readiness for a critical chain." },
          layers: [],
          edgeIds: [],
          separationRationale: "Kept per node because chains differ; superseded when a SPOF recommendation exists for the same node.",
        };
      });
  },
};

/* -------------------------------------------------------------------------- */
/* Architecture policies                                                       */
/* -------------------------------------------------------------------------- */

const highImpactNode: IntelligencePolicy = {
  id: "POL-ARCH-001",
  category: "architecture",
  severity: "warning",
  description: "Nodes with an outsized blast radius across module boundaries.",
  trigger: "A critical node with score >= 60 and dependants in two or more modules.",
  exclusions: ["Nodes below the score threshold.", "Nodes confined to a single module."],
  confidenceHandling: "High; degree facts are observed directly from declared edges.",
  evidenceRequirement: "Criticality basis statements and reach counts.",
  deduplication: "One per node.",
  escalation: "Escalates to critical at score >= 90.",
  analyses: ["critical-nodes"],
  evaluate(input) {
    const available = findingIdSet(input.bundle.critical);
    return input.bundle.critical.results
      .filter((r) => inScope(input, r.node.id) && r.score >= 60 && r.distinctDependentModules >= 2)
      .map((r) => {
        const affected = affectedFrom(input, [r.node.id]);
        return {
          policyId: this.id,
          mergeKey: `high-impact:${r.node.id}`,
          subject: r.node.id,
          title: `Govern change to high-impact node "${r.node.label}"`,
          summary: `"${r.node.label}" affects ${r.downstreamReach} downstream node(s) across ${r.distinctDependentModules} module(s); changes need cross-module review.`,
          affected,
          evidence: [evidence("degree", r.node.id, r.basis.join("; "), "high", { nodeIds: [r.node.id] })],
          sourceFindingIds: knownFindingIds(available, "critical-nodes", [r.node.id]),
          analyses: ["critical-nodes"] as const,
          confidence: "high" as const,
          candidateInvolved: input.candidateRelationshipsIncluded,
          expectedByDesign: false,
          severity: r.score >= 90 ? ("critical" as const) : this.severity,
          signals: {
            criticality: r.score,
            blastRadius: r.downstreamReach,
            breadth: r.distinctDependentModules,
          },
          complexity: "low" as const,
          expectedBenefit: "Prevents unreviewed cross-module breakage from a single change.",
          action: `Add "${r.node.label}" to the cross-module change-review list and require impact analysis before changes.`,
          requiredUpdates: ["Record the node in the governance change-control list."],
          prerequisites: [],
          validationCriteria: ["The node appears in the change-control list with a named reviewer."],
          expectedGraphImprovement: "No structural change; reduces change risk.",
          metricImpact: { ...NO_IMPACT, resilience: "Reduces unmanaged cross-module change risk." },
          layers: [],
          edgeIds: [],
          separationRationale: "Change control is applied per node.",
        };
      });
  },
};

const structuralBottleneck: IntelligencePolicy = {
  id: "POL-ARCH-002",
  category: "architecture",
  severity: "warning",
  description: "Nodes that broker throughput between many upstream and downstream neighbours.",
  trigger: "A bottleneck record with brokerage score >= 3.",
  exclusions: ["Low-brokerage nodes.", "Nodes outside scope."],
  confidenceHandling: "High; fan-in and fan-out are counted from declared edges.",
  evidenceRequirement: "Fan-in, fan-out and mediated module counts.",
  deduplication: "One per node.",
  escalation: "Escalates to critical when the node mediates four or more modules.",
  analyses: ["bottlenecks"],
  evaluate(input) {
    const available = findingIdSet(input.bundle.bottlenecks);
    return input.bundle.bottlenecks.results
      .filter((r) => inScope(input, r.node.id) && r.brokerageScore >= 3)
      .map((r) => {
        const affected = affectedFrom(input, [r.node.id]);
        return {
          policyId: this.id,
          mergeKey: `bottleneck:${r.node.id}`,
          subject: r.node.id,
          title: `Decompose or protect bottleneck "${r.node.label}"`,
          summary: `"${r.node.label}" mediates ${r.fanIn} inbound and ${r.fanOut} outbound relationship(s) across ${r.mediatedModuleCount} module(s).`,
          affected,
          evidence: [evidence("degree", r.node.id, r.basis.join("; "), "high", { nodeIds: [r.node.id] })],
          sourceFindingIds: knownFindingIds(available, "bottlenecks", [r.node.id]),
          analyses: ["bottlenecks"] as const,
          confidence: "high" as const,
          candidateInvolved: input.candidateRelationshipsIncluded,
          expectedByDesign: false,
          severity: r.mediatedModuleCount >= 4 ? ("critical" as const) : this.severity,
          signals: {
            criticality: Math.min(100, r.brokerageScore * 10),
            blastRadius: r.fanIn + r.fanOut,
            breadth: r.mediatedModuleCount,
          },
          complexity: "high" as const,
          expectedBenefit: "Reduces coupling concentrated in one node.",
          action: `Assess whether "${r.node.label}" should be decomposed, or protect it with explicit interface contracts.`,
          requiredUpdates: ["Architecture decision record covering the brokerage role of this node."],
          prerequisites: [],
          validationCriteria: ["An ADR exists, or the brokerage score falls after decomposition."],
          expectedGraphImprovement: "Lower brokerage concentration.",
          metricImpact: { ...NO_IMPACT, resilience: "Reduces coupling concentration." },
          layers: [],
          edgeIds: [],
          separationRationale: "Decomposition is designed per node.",
        };
      });
  },
};

const dependencyCycle: IntelligencePolicy = {
  id: "POL-ARCH-003",
  category: "architecture",
  severity: "critical",
  description: "Circular dependencies between graph nodes.",
  trigger: "A circular dependency record of size >= 2.",
  exclusions: ["Self-referential nodes handled by validation.", "Cycles outside scope."],
  confidenceHandling: "Weakest confidence on the cycle path; downgraded when a candidate edge closes the cycle.",
  evidenceRequirement: "The representative cycle path and its edge ids.",
  deduplication: "One per strongly connected component.",
  escalation: "Always critical; escalates further when the cycle spans modules.",
  analyses: ["circular-dependencies"],
  evaluate(input) {
    const available = findingIdSet(input.bundle.cycles);
    return input.bundle.cycles.results
      .filter((r) => r.memberNodeIds.some((id) => inScope(input, id)))
      .map((r) => {
        const affected = affectedFrom(input, r.memberNodeIds, r.spansModules);
        return {
          policyId: this.id,
          mergeKey: `cycle:${r.id}`,
          subject: r.id,
          title: `Break the ${r.size}-node dependency cycle ${r.memberNodeIds.join(" -> ")}`,
          summary: `${r.size} nodes form a dependency cycle spanning ${r.spansModules.length} module(s); no acyclic build or change order exists for them.`,
          affected,
          evidence: [
            evidence("path", r.id, `Representative cycle: ${r.representativePath.nodeIds.join(" -> ")}.`, r.confidence, {
              nodeIds: r.memberNodeIds,
              edgeIds: r.edgeIds,
              path: r.representativePath,
            }),
          ],
          sourceFindingIds: knownFindingIds(available, "circular-dependencies", [r.id]),
          analyses: ["circular-dependencies"] as const,
          confidence: r.confidence,
          candidateInvolved: r.candidate,
          expectedByDesign: false,
          severity: this.severity,
          signals: {
            criticality: Math.min(100, r.size * 20),
            blastRadius: r.size,
            breadth: r.spansModules.length,
            dependencyDepth: r.size,
          },
          complexity: "high" as const,
          expectedBenefit: "Restores an acyclic dependency order for the affected nodes.",
          action: `Invert or extract one relationship in the cycle so the ${r.size} member nodes form an acyclic chain.`,
          requiredUpdates: ["Refactor one dependency in the cycle and update the owning manifest."],
          prerequisites: ["Agreement on which direction of the relationship is authoritative."],
          validationCriteria: ["circularDependencies() no longer reports this component."],
          expectedGraphImprovement: "Cycle count falls by one.",
          metricImpact: { ...NO_IMPACT, resilience: "Removes one dependency cycle." },
          layers: [],
          edgeIds: r.edgeIds,
          separationRationale: "One recommendation per strongly connected component.",
        };
      });
  },
};

/* -------------------------------------------------------------------------- */
/* Governance policy: candidate-edge evidence                                  */
/* -------------------------------------------------------------------------- */

const candidateEdgeEvidence: IntelligencePolicy = {
  id: "POL-GOV-001",
  category: "governance",
  severity: "advisory",
  description: "Weakly-inferred candidate relationships held out of the graph awaiting confirmation.",
  trigger: "The graph carries at least one Stage 3.5.2 candidate edge.",
  exclusions: ["Graphs with no candidate edges."],
  confidenceHandling: "Confidence is fixed at 'low' because the underlying relationships are unconfirmed by definition.",
  evidenceRequirement: "The candidate relationship set, labelled as candidate evidence.",
  deduplication: "A single register-level recommendation; never fanned out per edge.",
  escalation: "Escalates to warning when candidate relationships are actively included in analysis.",
  analyses: ["coverage-gaps"],
  evaluate(input) {
    if (input.bundle.candidateEdgeCount === 0) return [];
    if (input.scopeNodeIds !== null) return [];
    const candidates = input.engine.candidateEdgesAsEdges();
    return [
      {
        policyId: this.id,
        mergeKey: "candidate-edges:register",
        subject: "graph:candidate-edges",
        title: `Confirm or reject ${input.bundle.candidateEdgeCount} weakly-inferred candidate relationship(s)`,
        summary: `${input.bundle.candidateEdgeCount} relationship(s) were inferred too weakly to enter the graph. Until they are confirmed, any conclusion that depends on them is downgraded.`,
        affected: affectedFrom(input, uniqueSorted(candidates.flatMap((e) => [e.from, e.to]))),
        evidence: candidates.slice(0, 25).map((e) =>
          evidence(
            "candidate-relationship",
            e.id,
            `Candidate ${e.type} from ${e.from} to ${e.to} is held out of the graph pending confirmation.`,
            "low",
            { edgeIds: [e.id], nodeIds: [e.from, e.to], candidate: true },
          ),
        ),
        sourceFindingIds: [],
        analyses: ["coverage-gaps"] as const,
        confidence: "low" as const,
        candidateInvolved: true,
        expectedByDesign: false,
        severity: input.candidateRelationshipsIncluded ? ("warning" as const) : this.severity,
        signals: { blastRadius: input.bundle.candidateEdgeCount, coverageGap: 0.4 },
        complexity: "low" as const,
        expectedBenefit: "Removes the confidence penalty applied to every conclusion that touches a candidate relationship.",
        action: "Review each candidate relationship and either declare it in the owning manifest or reject it explicitly.",
        requiredUpdates: ["Declare confirmed relationships; record rejected ones in the exception register."],
        prerequisites: [],
        validationCriteria: ["The candidate edge count reaches zero, or every remaining candidate has a recorded decision."],
        expectedGraphImprovement: "Confirmed relationships become first-class edges; conclusions stop being downgraded.",
        metricImpact: { ...NO_IMPACT, coverage: "Improves evidence strength across the graph." },
        layers: [],
        edgeIds: uniqueSorted(candidates.map((e) => e.id)),
        separationRationale: "Held as a single register entry so the review is done once, not per edge.",
      },
    ];
  },
};

/* -------------------------------------------------------------------------- */
/* Registry                                                                    */
/* -------------------------------------------------------------------------- */

/** The complete, deterministically ordered policy set. */
export const INTELLIGENCE_POLICIES: readonly IntelligencePolicy[] = [
  conflictingOwnership,
  unresolvedOwnership,
  propagatedOwnership,
  routeTraceabilityGap,
  missingLineageLayer,
  missingRegistration,
  structuralCoverageGap,
  expectedByDesignException,
  singlePointOfFailure,
  criticalDependencyChain,
  highImpactNode,
  structuralBottleneck,
  dependencyCycle,
  candidateEdgeEvidence,
].sort((a, b) => a.id.localeCompare(b.id));

export const policyById = (id: string): IntelligencePolicy | undefined =>
  INTELLIGENCE_POLICIES.find((p) => p.id === id);

export { EMPTY_AFFECTED };
