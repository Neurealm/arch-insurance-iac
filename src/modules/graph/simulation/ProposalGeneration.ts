/**
 * Stage 3.5.3.4 — deterministic proposal generation.
 *
 * Proposals are derived from Stage 3.5.3.3 intelligence recommendations. The
 * generator never invents factual values: when a value cannot be derived
 * deterministically from the graph it is emitted as an explicit, typed
 * parameter, and when several remediation paths are equally valid it emits
 * separate alternatives rather than choosing one.
 */

import type { GraphEdgeType, GraphNode } from "../types";
import type { GraphQueryEngine } from "../query/index";
import type { ReasoningEvidence } from "../reasoning/index";
import type { IntelligenceRecommendation } from "../intelligence/index";
import {
  simSlug,
  sortedUnique,
  stableHash,
  type ChangeProposal,
  type ChangeSource,
  type ExpectedImprovement,
  type ParameterCandidate,
  type ParameterDefinition,
  type ProposalKind,
  type ProposalRisk,
  type ProposedChange,
  type ProposedEdgePayload,
  type ProposedNodePayload,
  type ValidationRuleId,
} from "./SimulationTypes";
import { edgeIdFor } from "./GraphOverlay";

/** Deterministic cap on the number of entities a single proposal touches. */
export const MAX_CHANGES_PER_PROPOSAL = 25;

const changeId = (
  operation: ProposedChange["operation"],
  targetId: string,
  payload: unknown,
): string =>
  `chg:${operation}:${simSlug(targetId)}:${stableHash(`${operation}|${targetId}|${JSON.stringify(payload ?? null)}`)}`;

const source = (rec: IntelligenceRecommendation): ChangeSource => ({
  kind: "intelligence-recommendation",
  id: rec.id,
  policyId: rec.policyId,
});

const rationale = (rec: IntelligenceRecommendation, statement: string) => ({
  statement,
  analyses: rec.reasoningAnalyses,
  evidence: rec.evidence.slice(0, 5),
});

const complexityFor = (changeCount: number): ChangeProposal["complexity"] => {
  if (changeCount <= 1) return "trivial";
  if (changeCount <= 5) return "low";
  if (changeCount <= 15) return "moderate";
  return "high";
};

/* -------------------------------------------------------------------------- */
/* Parameter candidate derivation                                              */
/* -------------------------------------------------------------------------- */

/** Owner candidates are the owning modules of a node's immediate neighbours. */
export function ownerCandidates(
  engine: GraphQueryEngine,
  nodeIds: readonly string[],
): readonly ParameterCandidate[] {
  const counts = new Map<string, number>();
  for (const id of [...nodeIds].sort().slice(0, MAX_CHANGES_PER_PROPOSAL)) {
    if (!engine.hasNode(id)) continue;
    for (const hit of engine.getNeighbors(id, { maxDepth: 1 }).results) {
      const owner = hit.node.moduleId;
      if (!owner) continue;
      counts.set(owner, (counts.get(owner) ?? 0) + 1);
    }
  }
  const total = [...counts.values()].reduce((sum, v) => sum + v, 0);
  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      label: `Module "${value}" owns ${count} adjacent node(s)`,
      support: total === 0 ? 0 : Math.round((count / total) * 100),
      evidence: [
        {
          kind: "aggregate" as const,
          subject: value,
          statement: `${count} of ${total} adjacent owned nodes are owned by "${value}".`,
          confidence: "medium" as const,
          candidate: false,
        },
      ] as readonly ReasoningEvidence[],
    }))
    .sort((a, b) => b.support - a.support || a.value.localeCompare(b.value));
}

const nodesOfType = (engine: GraphQueryEngine, type: GraphNode["type"]): readonly GraphNode[] =>
  engine.source.nodes.filter((n) => n.type === type);

function nodeCandidates(
  engine: GraphQueryEngine,
  type: GraphNode["type"],
  limit = 10,
): readonly ParameterCandidate[] {
  return [...nodesOfType(engine, type)]
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, limit)
    .map((n) => ({
      value: n.id,
      label: `${n.type} "${n.label}"`,
      support: 0,
      evidence: [
        {
          kind: "node-fact" as const,
          subject: n.id,
          statement: `Existing ${n.type} node "${n.label}" is a valid assignment target.`,
          nodeIds: [n.id],
          confidence: "high" as const,
          candidate: false,
        },
      ] as readonly ReasoningEvidence[],
    }));
}

const parameter = (
  name: string,
  type: ParameterDefinition["type"],
  description: string,
  candidates: readonly ParameterCandidate[],
  constraints: readonly string[],
  allowedValues: readonly string[] = [],
): ParameterDefinition => ({
  name,
  type,
  required: true,
  description,
  allowedValues,
  candidates,
  constraints,
  // A default is only deterministically justified when exactly one candidate
  // exists; anything else would be an arbitrary choice.
  defaultValue: candidates.length === 1 ? candidates[0].value : null,
});

/* -------------------------------------------------------------------------- */
/* Proposal assembly                                                           */
/* -------------------------------------------------------------------------- */

interface DraftInput {
  rec: IntelligenceRecommendation;
  kind: ProposalKind;
  variant: string;
  title: string;
  summary: string;
  changes: readonly ProposedChange[];
  parameters: readonly ParameterDefinition[];
  prerequisites: readonly string[];
  validationRules: readonly ValidationRuleId[];
  expectedImprovement: ExpectedImprovement;
  risks: readonly ProposalRisk[];
  reversible: boolean;
}

function draft(input: DraftInput): ChangeProposal {
  const { rec } = input;
  const required = sortedUnique(input.changes.flatMap((c) => c.requiredParameters));
  const unresolved = input.parameters.filter(
    (p) => p.required && p.defaultValue === null,
  );
  return {
    id: `prop:${rec.policyId}:${simSlug(rec.subject)}:${input.variant}`,
    kind: input.kind,
    variant: input.variant,
    alternativeProposalIds: [],
    title: input.title,
    summary: input.summary,
    subject: rec.subject,
    category: rec.category,
    priority: rec.priority,
    priorityScore: rec.priorityScore,
    recommendationId: rec.id,
    policyId: rec.policyId,
    sourceFindingIds: rec.sourceFindingIds,
    changes: [...input.changes].sort((a, b) => a.id.localeCompare(b.id)),
    parameters: [...input.parameters].sort((a, b) => a.name.localeCompare(b.name)),
    prerequisites: sortedUnique([...rec.remediation.prerequisites, ...input.prerequisites]),
    validationRules: sortedUnique(input.validationRules) as readonly ValidationRuleId[],
    expectedImprovement: input.expectedImprovement,
    risks: input.risks,
    confidence: rec.confidence,
    evidence: rec.evidence,
    lineage: {
      graphVersion: rec.lineage.graphVersion,
      canonicalGraphHash: rec.lineage.graphContentHash,
      nodeIds: rec.lineage.nodeIds,
      edgeIds: rec.lineage.edgeIds,
      reasoningAnalyses: rec.reasoningAnalyses,
      recommendationId: rec.id,
      policyId: rec.policyId,
    },
    incomplete: unresolved.length > 0 || required.length > 0,
    complexity: complexityFor(input.changes.length),
    reversible: input.reversible && input.changes.every((c) => c.reversible),
  };
}

const targets = (rec: IntelligenceRecommendation): readonly string[] =>
  [...rec.affected.nodeIds].sort((a, b) => a.localeCompare(b)).slice(0, MAX_CHANGES_PER_PROPOSAL);

const truncationRisk = (rec: IntelligenceRecommendation): readonly ProposalRisk[] =>
  rec.affected.nodeIds.length > MAX_CHANGES_PER_PROPOSAL
    ? [
        {
          id: `risk:truncated:${simSlug(rec.id)}`,
          severity: "advisory" as const,
          statement: `Only the first ${MAX_CHANGES_PER_PROPOSAL} of ${rec.affected.nodeIds.length} affected nodes are simulated; the remainder require further proposals.`,
          entityIds: [],
        },
      ]
    : [];

/* -------------------------------------------------------------------------- */
/* Policy-specific generators                                                  */
/* -------------------------------------------------------------------------- */

function ownershipDeclaration(
  engine: GraphQueryEngine,
  rec: IntelligenceRecommendation,
  kind: ProposalKind,
  parameterName: string,
): readonly ChangeProposal[] {
  const nodeIds = targets(rec);
  if (nodeIds.length === 0) return [];
  const declaredOwner =
    rec.subject.startsWith("module:") ? rec.subject.slice("module:".length) : null;
  const candidates =
    declaredOwner !== null
      ? [
          {
            value: declaredOwner,
            label: `Module "${declaredOwner}" already owns these nodes by propagation`,
            support: 100,
            evidence: rec.evidence.slice(0, 2),
          },
        ]
      : rec.affected.owners.length > 0
        ? rec.affected.owners.map((o) => ({
            value: o,
            label: `Module "${o}" is a declared claimant`,
            support: 50,
            evidence: rec.evidence.slice(0, 2),
          }))
        : ownerCandidates(engine, nodeIds);

  const param = parameter(
    parameterName,
    "module-id",
    "Owning module to declare for the affected nodes. No owner is invented when it cannot be derived.",
    candidates,
    ["Must reference a registered module.", "Must be identical for every node in this proposal."],
    rec.affected.owners,
  );

  const owner = param.defaultValue;
  const changes: ProposedChange[] = nodeIds.map((nodeId) => {
    const operation = kind === "ownership-adjudication" ? "replace-ownership" : "declare-ownership";
    return {
      id: changeId(operation, nodeId, { owner }),
      operation,
      target: { kind: "node", id: nodeId, nodeIds: [nodeId], edgeIds: [] },
      source: source(rec),
      rationale: rationale(
        rec,
        `Ownership of "${nodeId}" is ${kind === "ownership-adjudication" ? "contested" : "unresolved"}; a formal owning module must be declared.`,
      ),
      dependencies: [],
      ownerModuleId: owner,
      reversible: true,
      inverseOperation: "declare-ownership",
      requiredParameters: owner === null ? [param.name] : [],
    };
  });

  return [
    draft({
      rec,
      kind,
      variant: "primary",
      title: rec.title,
      summary: `Declare an owning module for ${nodeIds.length} node(s) currently ${kind === "ownership-adjudication" ? "claimed by multiple modules" : "without a resolvable owner"}.`,
      changes,
      parameters: [param],
      prerequisites: ["Owning module agreed and registered in the module registry."],
      validationRules: [
        "node-exists",
        "ownership-conflict",
        "required-metadata",
        "parameter-completeness",
        "contradictory-operations",
      ],
      expectedImprovement: {
        metrics: [
          {
            key: "unresolvedOwnershipCount",
            direction: "decrease",
            statement: `Up to ${nodeIds.length} nodes move from unresolved or conflicting to declared ownership.`,
          },
          {
            key: "ownershipResolutionRate",
            direction: "increase",
            statement: "Ownership resolution rate increases as declarations replace inference.",
          },
        ],
        resolvesRecommendationIds: [rec.id],
      },
      risks: truncationRisk(rec),
      reversible: true,
    }),
  ];
}

function registrationProposals(
  engine: GraphQueryEngine,
  rec: IntelligenceRecommendation,
): readonly ChangeProposal[] {
  const nodeIds = targets(rec);
  if (nodeIds.length === 0) return [];

  const capabilityParam = parameter(
    "capabilityId",
    "capability-id",
    "Capability the affected implementation nodes should be registered against.",
    nodeCandidates(engine, "capability"),
    ["Must be an existing capability or sub-capability node."],
  );

  const buildChanges = (
    operation: ProposedChange["operation"],
    edgeType: GraphEdgeType,
    targetId: string | null,
  ): ProposedChange[] =>
    nodeIds.map((nodeId) => {
      const edge: ProposedEdgePayload | undefined =
        targetId === null
          ? undefined
          : { from: nodeId, to: targetId, type: edgeType, attributes: { registration: true } };
      return {
        id: changeId(operation, nodeId, { edgeType, targetId }),
        operation,
        target: {
          kind: edge ? "node-pair" : "node",
          id: edge ? edgeIdFor(edge) : nodeId,
          nodeIds: sortedUnique([nodeId, ...(targetId ? [targetId] : [])]),
          edgeIds: [],
        },
        source: source(rec),
        rationale: rationale(
          rec,
          `"${nodeId}" has no ${edgeType} relationship to a registered owner; registration restores coverage.`,
        ),
        dependencies: [],
        ...(edge ? { edge } : {}),
        reversible: true,
        inverseOperation: "remove-edge",
        requiredParameters: targetId === null ? [capabilityParam.name] : [],
      };
    });

  const improvement = (statement: string): ExpectedImprovement => ({
    metrics: [
      { key: "coverageGapCount", direction: "decrease", statement },
      {
        key: "routeTraceabilityRate",
        direction: "increase",
        statement: "Registered implementations extend route lineage towards the module layer.",
      },
    ],
    resolvesRecommendationIds: [rec.id],
  });

  const capabilityTarget = capabilityParam.defaultValue;

  const direct = draft({
    rec,
    kind: "capability-registration",
    variant: "direct-capability",
    title: `${rec.title} — register directly against a capability`,
    summary: `Add IMPLEMENTS relationships from ${nodeIds.length} node(s) to an existing capability.`,
    changes: buildChanges("add-capability-registration", "IMPLEMENTS", capabilityTarget),
    parameters: [capabilityParam],
    prerequisites: ["Target capability agreed with the owning module."],
    validationRules: [
      "endpoint-exists",
      "endpoint-policy",
      "duplicate-edge",
      "registration-hierarchy",
      "parameter-completeness",
      "cycle-introduction",
    ],
    expectedImprovement: improvement(
      `${nodeIds.length} registration gap(s) close once the capability relationship exists.`,
    ),
    risks: truncationRisk(rec),
    reversible: true,
  });

  // Alternative: introduce an explicit service layer instead of a direct link.
  const serviceNodeId = `service:simulated:${simSlug(rec.subject)}`;
  const serviceNode: ProposedNodePayload = {
    id: serviceNodeId,
    type: "service",
    label: `Simulated service for ${rec.subject}`,
    moduleId: rec.affected.moduleIds[0] ?? null,
    attributes: { registration: true },
  };
  const serviceChanges: ProposedChange[] = [
    {
      id: changeId("add-node", serviceNodeId, serviceNode),
      operation: "add-node",
      target: { kind: "node", id: serviceNodeId, nodeIds: [serviceNodeId], edgeIds: [] },
      source: source(rec),
      rationale: rationale(
        rec,
        `A service layer is missing between the affected nodes and the capability layer.`,
      ),
      dependencies: [],
      node: serviceNode,
      reversible: true,
      inverseOperation: "remove-node",
      requiredParameters: [],
    },
    ...nodeIds.map<ProposedChange>((nodeId) => {
      const edge: ProposedEdgePayload = { from: nodeId, to: serviceNodeId, type: "USES" };
      return {
        id: changeId("add-service-registration", nodeId, { serviceNodeId }),
        operation: "add-service-registration",
        target: { kind: "node-pair", id: edgeIdFor(edge), nodeIds: [nodeId, serviceNodeId], edgeIds: [] },
        source: source(rec),
        rationale: rationale(rec, `"${nodeId}" is routed through the registered service layer.`),
        dependencies: [
          { changeId: changeId("add-node", serviceNodeId, serviceNode), reason: "The service node must exist first." },
        ],
        edge,
        reversible: true,
        inverseOperation: "remove-edge",
        requiredParameters: [],
      };
    }),
  ];

  const viaService = draft({
    rec,
    kind: "service-registration",
    variant: "via-service",
    title: `${rec.title} — register through an explicit service`,
    summary: `Introduce a service node and route ${nodeIds.length} node(s) through it.`,
    changes: serviceChanges,
    parameters: [],
    prerequisites: ["Service boundary agreed with the owning module."],
    validationRules: [
      "node-absent",
      "endpoint-exists",
      "endpoint-policy",
      "duplicate-node",
      "duplicate-edge",
      "registration-hierarchy",
      "orphan-creation",
    ],
    expectedImprovement: improvement("Coverage gaps close via an explicit, owned service layer."),
    risks: [
      ...truncationRisk(rec),
      {
        id: `risk:new-node:${simSlug(rec.id)}`,
        severity: "warning",
        statement: "Introduces a new architectural node that must be implemented and owned.",
        entityIds: [serviceNodeId],
      },
    ],
    reversible: true,
  });

  return withAlternatives([direct, viaService]);
}

function lineageProposal(
  engine: GraphQueryEngine,
  rec: IntelligenceRecommendation,
): readonly ChangeProposal[] {
  const nodeIds = targets(rec);
  if (nodeIds.length === 0) return [];
  const platformParam = parameter(
    "platformCapabilityId",
    "platform-id",
    "Platform capability the affected chains should consume.",
    nodeCandidates(engine, "platform-capability"),
    ["Must be an existing platform capability node."],
  );
  const target = platformParam.defaultValue;
  const changes: ProposedChange[] = nodeIds.map((nodeId) => {
    const edge: ProposedEdgePayload | undefined = target
      ? { from: nodeId, to: target, type: "CONSUMES" }
      : undefined;
    return {
      id: changeId("add-lineage-relationship", nodeId, { target }),
      operation: "add-lineage-relationship",
      target: {
        kind: edge ? "node-pair" : "node",
        id: edge ? edgeIdFor(edge) : nodeId,
        nodeIds: sortedUnique([nodeId, ...(target ? [target] : [])]),
        edgeIds: [],
      },
      source: source(rec),
      rationale: rationale(rec, `The lineage chain from "${nodeId}" never reaches the platform layer.`),
      dependencies: [],
      ...(edge ? { edge } : {}),
      reversible: true,
      inverseOperation: "remove-edge",
      requiredParameters: target === null ? [platformParam.name] : [],
    };
  });

  return [
    draft({
      rec,
      kind: "lineage-relationship",
      variant: "primary",
      title: rec.title,
      summary: `Connect ${nodeIds.length} chain(s) to the missing lineage layer(s).`,
      changes,
      parameters: [platformParam],
      prerequisites: ["Platform capability owner confirms the consuming relationship."],
      validationRules: [
        "endpoint-exists",
        "endpoint-policy",
        "duplicate-edge",
        "route-lineage",
        "parameter-completeness",
        "cycle-introduction",
      ],
      expectedImprovement: {
        metrics: [
          {
            key: "missingLineageLayerCount",
            direction: "decrease",
            statement: "Missing lineage layers are supplied by the new relationships.",
          },
          {
            key: "routeTraceabilityRate",
            direction: "increase",
            statement: "Route chains reach further towards the platform layer.",
          },
        ],
        resolvesRecommendationIds: [rec.id],
      },
      risks: truncationRisk(rec),
      reversible: true,
    }),
  ];
}

function routeTraceabilityProposals(
  engine: GraphQueryEngine,
  rec: IntelligenceRecommendation,
): readonly ChangeProposal[] {
  return registrationProposals(engine, rec).map((p) => ({
    ...p,
    kind: p.variant === "via-service" ? "service-registration" : "route-registration",
  }));
}

function spofProposals(
  engine: GraphQueryEngine,
  rec: IntelligenceRecommendation,
): readonly ChangeProposal[] {
  const subjectId = rec.subject;
  if (!engine.hasNode(subjectId)) return [];
  const node = engine.source.nodes.find((n) => n.id === subjectId)!;
  const replicaId = `${subjectId}:simulated-redundant`;
  const replica: ProposedNodePayload = {
    id: replicaId,
    type: node.type,
    label: `${node.label} (redundant provider)`,
    moduleId: node.moduleId,
    attributes: { redundancyFor: subjectId },
  };
  const dependants = engine
    .getNeighbors(subjectId, { maxDepth: 1, direction: "in" })
    .results.map((r) => r.node)
    .filter((n) => n.id !== subjectId)
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, MAX_CHANGES_PER_PROPOSAL);

  const addReplica: ProposedChange = {
    id: changeId("add-node", replicaId, replica),
    operation: "add-node",
    target: { kind: "node", id: replicaId, nodeIds: [replicaId], edgeIds: [] },
    source: source(rec),
    rationale: rationale(rec, `"${subjectId}" is a sole provider; a redundant provider removes the single point of failure.`),
    dependencies: [],
    node: replica,
    reversible: true,
    inverseOperation: "remove-node",
    requiredParameters: [],
  };

  const redundancy = draft({
    rec,
    kind: "redundancy",
    variant: "add-redundancy",
    title: `${rec.title} — introduce a redundant provider`,
    summary: `Add a redundant provider for "${node.label}" and connect ${dependants.length} dependant(s).`,
    changes: [
      addReplica,
      ...dependants.map<ProposedChange>((dep) => {
        const existing = engine.source.edges.find((e) => e.from === dep.id && e.to === subjectId);
        const edge: ProposedEdgePayload = {
          from: dep.id,
          to: replicaId,
          type: (existing?.type ?? "USES") as GraphEdgeType,
        };
        return {
          id: changeId("add-edge", dep.id, { replicaId, type: edge.type }),
          operation: "add-edge",
          target: { kind: "node-pair", id: edgeIdFor(edge), nodeIds: [dep.id, replicaId], edgeIds: [] },
          source: source(rec),
          rationale: rationale(rec, `"${dep.id}" gains an alternative provider.`),
          dependencies: [{ changeId: addReplica.id, reason: "The redundant provider must exist first." }],
          edge,
          reversible: true,
          inverseOperation: "remove-edge",
          requiredParameters: [],
        };
      }),
    ],
    parameters: [],
    prerequisites: ["Redundant provider funded, built and owned."],
    validationRules: [
      "node-absent",
      "endpoint-exists",
      "endpoint-policy",
      "duplicate-node",
      "duplicate-edge",
      "cycle-introduction",
      "orphan-creation",
    ],
    expectedImprovement: {
      metrics: [
        {
          key: "singlePointOfFailureCount",
          direction: "decrease",
          statement: `"${node.label}" ceases to be a sole provider.`,
        },
      ],
      resolvesRecommendationIds: [rec.id],
    },
    risks: [
      {
        id: `risk:duplication:${simSlug(rec.id)}`,
        severity: "warning",
        statement: "Redundancy duplicates capability surface and increases operating cost.",
        entityIds: [subjectId, replicaId],
      },
    ],
    reversible: true,
  });

  const justification = parameter(
    "expectedByDesignJustification",
    "justification",
    "Written justification for accepting the single point of failure by design.",
    [],
    ["Must be recorded in the governance exception register."],
  );
  const accept = draft({
    rec,
    kind: "expected-by-design",
    variant: "accept-by-design",
    title: `${rec.title} — accept as expected by design`,
    summary: `Record "${node.label}" as an accepted single point of failure with written justification.`,
    changes: [
      {
        id: changeId("mark-expected-by-design", subjectId, { policy: rec.policyId }),
        operation: "mark-expected-by-design",
        target: { kind: "node", id: subjectId, nodeIds: [subjectId], edgeIds: [] },
        source: source(rec),
        rationale: rationale(rec, `The sole-provider condition is accepted and registered as an exception.`),
        dependencies: [],
        metadata: { expectedByDesign: true },
        reversible: true,
        inverseOperation: "update-node-metadata",
        requiredParameters: [justification.name],
      },
    ],
    parameters: [justification],
    prerequisites: ["Architecture review board records the exception."],
    validationRules: [
      "node-exists",
      "expected-by-design-justification",
      "parameter-completeness",
    ],
    expectedImprovement: {
      metrics: [
        {
          key: "expectedByDesignGapCount",
          direction: "increase",
          statement: "The condition moves from an open risk to a registered exception.",
        },
      ],
      resolvesRecommendationIds: [rec.id],
    },
    risks: [
      {
        id: `risk:accepted-spof:${simSlug(rec.id)}`,
        severity: "advisory",
        statement: "The resilience exposure remains; only its governance status changes.",
        entityIds: [subjectId],
      },
    ],
    reversible: true,
  });

  return withAlternatives([redundancy, accept]);
}

function expectedByDesignProposal(rec: IntelligenceRecommendation): readonly ChangeProposal[] {
  const nodeIds = targets(rec);
  if (nodeIds.length === 0) return [];
  const justification = parameter(
    "expectedByDesignJustification",
    "justification",
    "Justification recorded against each expected-by-design classification.",
    [],
    ["Must reference the governing architecture decision."],
  );
  return [
    draft({
      rec,
      kind: "expected-by-design",
      variant: "primary",
      title: rec.title,
      summary: `Formally classify ${nodeIds.length} structural gap(s) as expected by design.`,
      changes: nodeIds.map((nodeId) => ({
        id: changeId("mark-expected-by-design", nodeId, { policy: rec.policyId }),
        operation: "mark-expected-by-design",
        target: { kind: "node", id: nodeId, nodeIds: [nodeId], edgeIds: [] },
        source: source(rec),
        rationale: rationale(rec, `"${nodeId}" is a structural gap that the architecture intends.`),
        dependencies: [],
        metadata: { expectedByDesign: true },
        reversible: true,
        inverseOperation: "update-node-metadata",
        requiredParameters: [justification.name],
      })),
      parameters: [justification],
      prerequisites: ["Exception register entry approved."],
      validationRules: ["node-exists", "expected-by-design-justification", "parameter-completeness"],
      expectedImprovement: {
        metrics: [
          {
            key: "expectedByDesignGapCount",
            direction: "increase",
            statement: "Gaps become auditable exceptions rather than open defects.",
          },
        ],
        resolvesRecommendationIds: [rec.id],
      },
      risks: truncationRisk(rec),
      reversible: true,
    }),
  ];
}

function cycleProposals(
  engine: GraphQueryEngine,
  rec: IntelligenceRecommendation,
): readonly ChangeProposal[] {
  const memberIds = [...rec.affected.nodeIds].sort((a, b) => a.localeCompare(b));
  const cycleEdges = engine.source.edges
    .filter((e) => memberIds.includes(e.from) && memberIds.includes(e.to))
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, 2);
  if (cycleEdges.length === 0) return [];

  return withAlternatives(
    cycleEdges.map((edge, index) =>
      draft({
        rec,
        kind: "cycle-break",
        variant: `break-${index + 1}`,
        title: `${rec.title} — remove ${edge.type} ${edge.from} → ${edge.to}`,
        summary: `Break the cycle by removing the ${edge.type} relationship from "${edge.from}" to "${edge.to}".`,
        changes: [
          {
            id: changeId("remove-edge", edge.id, null),
            operation: "remove-edge",
            target: { kind: "edge", id: edge.id, nodeIds: [edge.from, edge.to], edgeIds: [edge.id] },
            source: source(rec),
            rationale: rationale(rec, `Removing this relationship breaks the dependency cycle.`),
            dependencies: [],
            reversible: true,
            inverseOperation: "add-edge",
            requiredParameters: [],
          },
        ],
        parameters: [],
        prerequisites: ["Confirm the relationship is genuinely removable in the implementation."],
        validationRules: ["edge-exists", "removal-safety", "orphan-creation", "broken-dependency"],
        expectedImprovement: {
          metrics: [
            { key: "dependencyCycleCount", direction: "decrease", statement: "The cycle is eliminated." },
          ],
          resolvesRecommendationIds: [rec.id],
        },
        risks: [
          {
            id: `risk:removal:${simSlug(edge.id)}`,
            severity: "warning",
            statement: "Edge removal can strand dependants or orphan nodes.",
            entityIds: [edge.from, edge.to],
          },
        ],
        reversible: true,
      }),
    ),
  );
}

function candidateDecisionProposals(
  engine: GraphQueryEngine,
  rec: IntelligenceRecommendation,
): readonly ChangeProposal[] {
  const nodeIds = targets(rec).slice(0, 5);
  if (nodeIds.length === 0) return [];
  const decision = parameter(
    "candidateDecision",
    "candidate-decision",
    "Governance decision for the weakly-inferred relationships.",
    [],
    ["Must be recorded against the candidate edge register."],
    ["promote", "reject"],
  );

  const promote = draft({
    rec,
    kind: "candidate-decision",
    variant: "promote",
    title: `${rec.title} — promote the candidate relationships`,
    summary: `Promote ${nodeIds.length} weakly-inferred relationship(s) to declared facts.`,
    changes: nodeIds.map((nodeId) => ({
      id: changeId("promote-candidate-edge", nodeId, { policy: rec.policyId }),
      operation: "promote-candidate-edge" as const,
      target: { kind: "node" as const, id: nodeId, nodeIds: [nodeId], edgeIds: [] },
      source: { kind: "candidate-edge" as const, id: nodeId, policyId: rec.policyId },
      rationale: rationale(rec, `The candidate relationship touching "${nodeId}" is confirmed and declared.`),
      dependencies: [],
      reversible: true,
      inverseOperation: "remove-edge" as const,
      requiredParameters: [decision.name],
    })),
    parameters: [decision],
    prerequisites: ["Owning module confirms the inferred relationship is real."],
    validationRules: ["candidate-edge-state", "endpoint-policy", "duplicate-edge", "parameter-completeness"],
    expectedImprovement: {
      metrics: [
        { key: "edgeCount", direction: "increase", statement: "Confirmed relationships become declared graph facts." },
      ],
      resolvesRecommendationIds: [rec.id],
    },
    risks: [
      {
        id: `risk:promote-candidate:${simSlug(rec.id)}`,
        severity: "warning",
        statement: "Promoting an incorrect inference embeds a false fact in the canonical graph.",
        entityIds: nodeIds,
      },
    ],
    reversible: true,
  });

  const reject = draft({
    rec,
    kind: "candidate-decision",
    variant: "reject",
    title: `${rec.title} — reject the candidate relationships`,
    summary: `Reject ${nodeIds.length} weakly-inferred relationship(s) and record the decision.`,
    changes: nodeIds.map((nodeId) => ({
      id: changeId("reject-candidate-edge", nodeId, { policy: rec.policyId }),
      operation: "reject-candidate-edge" as const,
      target: { kind: "node" as const, id: nodeId, nodeIds: [nodeId], edgeIds: [] },
      source: { kind: "candidate-edge" as const, id: nodeId, policyId: rec.policyId },
      rationale: rationale(rec, `The candidate relationship touching "${nodeId}" is rejected.`),
      dependencies: [],
      reversible: true,
      inverseOperation: "promote-candidate-edge" as const,
      requiredParameters: [decision.name],
    })),
    parameters: [decision],
    prerequisites: ["Owning module confirms the inference is incorrect."],
    validationRules: ["candidate-edge-state", "parameter-completeness"],
    expectedImprovement: {
      metrics: [
        {
          key: "recommendationCount",
          direction: "decrease",
          statement: "Rejected candidates stop generating governance recommendations.",
        },
      ],
      resolvesRecommendationIds: [rec.id],
    },
    risks: [
      {
        id: `risk:reject-candidate:${simSlug(rec.id)}`,
        severity: "advisory",
        statement: "Rejecting a true relationship leaves a real dependency unmodelled.",
        entityIds: nodeIds,
      },
    ],
    reversible: true,
  });

  return withAlternatives([promote, reject]);
}

function governanceMetadataProposal(
  rec: IntelligenceRecommendation,
  kind: ProposalKind,
  attribute: string,
): readonly ChangeProposal[] {
  const nodeIds = targets(rec);
  if (nodeIds.length === 0) return [];
  return [
    draft({
      rec,
      kind,
      variant: "primary",
      title: rec.title,
      summary: `Record a governance marker on ${nodeIds.length} node(s) so change to them is controlled.`,
      changes: nodeIds.map((nodeId) => ({
        id: changeId("update-node-metadata", nodeId, { attribute }),
        operation: "update-node-metadata" as const,
        target: { kind: "node" as const, id: nodeId, nodeIds: [nodeId], edgeIds: [] },
        source: source(rec),
        rationale: rationale(rec, `"${nodeId}" requires governed change control.`),
        dependencies: [],
        metadata: { [attribute]: true },
        reversible: true,
        inverseOperation: "update-node-metadata" as const,
        requiredParameters: [],
      })),
      parameters: [],
      prerequisites: [],
      validationRules: ["node-exists", "required-metadata"],
      expectedImprovement: {
        metrics: [
          {
            key: "recommendationCount",
            direction: "decrease",
            statement: "The advisory closes once the governance marker is recorded.",
          },
        ],
        resolvesRecommendationIds: [rec.id],
      },
      risks: truncationRisk(rec),
      reversible: true,
    }),
  ];
}

/** Cross-links a set of proposals as mutually exclusive alternatives. */
function withAlternatives(proposals: readonly ChangeProposal[]): readonly ChangeProposal[] {
  if (proposals.length < 2) return proposals;
  const ids = proposals.map((p) => p.id).sort((a, b) => a.localeCompare(b));
  return proposals.map((p) => ({
    ...p,
    alternativeProposalIds: ids.filter((id) => id !== p.id),
  }));
}

/* -------------------------------------------------------------------------- */
/* Public generation API                                                       */
/* -------------------------------------------------------------------------- */

/** Deterministically generates proposals for one intelligence recommendation. */
export function generateProposals(
  engine: GraphQueryEngine,
  rec: IntelligenceRecommendation,
): readonly ChangeProposal[] {
  let produced: readonly ChangeProposal[];
  switch (rec.policyId) {
    case "POL-OWN-001":
      produced = ownershipDeclaration(engine, rec, "ownership-declaration", "ownerModuleId");
      break;
    case "POL-OWN-002":
      produced = ownershipDeclaration(engine, rec, "ownership-adjudication", "ownerModuleId");
      break;
    case "POL-OWN-003":
      produced = ownershipDeclaration(engine, rec, "ownership-declaration", "ownerModuleId");
      break;
    case "POL-TRACE-001":
      produced = routeTraceabilityProposals(engine, rec);
      break;
    case "POL-TRACE-002":
      produced = lineageProposal(engine, rec);
      break;
    case "POL-REG-001":
    case "POL-REG-002":
      produced = registrationProposals(engine, rec);
      break;
    case "POL-REG-003":
      produced = expectedByDesignProposal(rec);
      break;
    case "POL-RES-001":
      produced = spofProposals(engine, rec);
      break;
    case "POL-RES-002":
      produced = governanceMetadataProposal(rec, "chain-decomposition", "criticalChainReviewed");
      break;
    case "POL-ARCH-001":
      produced = governanceMetadataProposal(rec, "chain-decomposition", "changeGoverned");
      break;
    case "POL-ARCH-002":
      produced = governanceMetadataProposal(rec, "chain-decomposition", "bottleneckReviewed");
      break;
    case "POL-ARCH-003":
      produced = cycleProposals(engine, rec);
      break;
    case "POL-GOV-001":
      produced = candidateDecisionProposals(engine, rec);
      break;
    default:
      produced = [];
  }
  return [...produced].sort((a, b) => a.id.localeCompare(b.id));
}

/** Generates proposals for a whole intelligence result, deterministically ordered. */
export function generateProposalsFromRecommendations(
  engine: GraphQueryEngine,
  recommendations: readonly IntelligenceRecommendation[],
): readonly ChangeProposal[] {
  return [...recommendations]
    .sort((a, b) => a.id.localeCompare(b.id))
    .flatMap((rec) => generateProposals(engine, rec))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Applies operator-supplied parameter bindings to a proposal. */
export function bindParameters(
  proposal: ChangeProposal,
  bindings: Readonly<Record<string, string>>,
): ChangeProposal {
  const parameters = proposal.parameters.map((p) =>
    bindings[p.name] !== undefined ? { ...p, defaultValue: bindings[p.name] } : p,
  );
  const bound = (name: string): string | undefined => bindings[name];

  const changes = proposal.changes.map((change) => {
    const remaining = change.requiredParameters.filter((name) => bound(name) === undefined);
    let next: ProposedChange = { ...change, requiredParameters: remaining };

    if (
      (change.operation === "declare-ownership" || change.operation === "replace-ownership") &&
      bound("ownerModuleId") !== undefined
    ) {
      next = { ...next, ownerModuleId: bound("ownerModuleId")! };
    }
    if (change.operation === "add-capability-registration" && bound("capabilityId") !== undefined) {
      const edge: ProposedEdgePayload = {
        from: change.target.nodeIds[0],
        to: bound("capabilityId")!,
        type: "IMPLEMENTS",
      };
      next = {
        ...next,
        edge,
        target: { ...change.target, kind: "node-pair", id: edgeIdFor(edge), nodeIds: sortedUnique([edge.from, edge.to]) },
      };
    }
    if (change.operation === "add-lineage-relationship" && bound("platformCapabilityId") !== undefined) {
      const edge: ProposedEdgePayload = {
        from: change.target.nodeIds[0],
        to: bound("platformCapabilityId")!,
        type: "CONSUMES",
      };
      next = {
        ...next,
        edge,
        target: { ...change.target, kind: "node-pair", id: edgeIdFor(edge), nodeIds: sortedUnique([edge.from, edge.to]) },
      };
    }
    if (change.operation === "mark-expected-by-design" && bound("expectedByDesignJustification") !== undefined) {
      next = {
        ...next,
        metadata: {
          ...(change.metadata ?? {}),
          expectedByDesignJustification: bound("expectedByDesignJustification")!,
        },
      };
    }
    return next;
  });

  const incomplete =
    parameters.some((p) => p.required && p.defaultValue === null) ||
    changes.some((c) => c.requiredParameters.length > 0);

  return { ...proposal, parameters, changes, incomplete };
}
