/**
 * Stage 3.5.3.5 — target selectors, patch specifications and rollback
 * specifications.
 *
 * A patch specification describes *intent*. It never contains free-form source
 * code and is never applied by this layer. Operations are typed and semantic;
 * targets are addressed with typed selectors rather than text matches.
 */

import type { CapabilityGraph, GraphNode } from "../types";
import type { ReasoningConfidence, ReasoningEvidence } from "../reasoning/index";
import type { ChangeOperation, ProposedChange } from "../simulation/index";
import {
  byString,
  planHash,
  planSlug,
  planSortedUnique,
  type ArtifactLocator,
  type ArtifactMapping,
  type ArtifactType,
  type PatchConflict,
  type PatchOperation,
  type PatchPostcondition,
  type PatchPrecondition,
  type PatchSpecification,
  type PatchStateExpectation,
  type PatchStatus,
  type PlanLineage,
  type RollbackSpecification,
  type SelectorType,
  type TargetSelector,
} from "./ChangePlanTypes";

/* -------------------------------------------------------------------------- */
/* Operation mapping                                                           */
/* -------------------------------------------------------------------------- */

export const PATCH_OPERATION_FOR_CHANGE: Readonly<Record<ChangeOperation, PatchOperation>> = {
  "add-node": "add-record",
  "add-edge": "add-relationship",
  "remove-node": "remove-record",
  "remove-edge": "remove-relationship",
  "replace-edge": "update-relationship",
  "update-node-metadata": "update-record",
  "update-edge-metadata": "update-relationship",
  "declare-ownership": "add-ownership-declaration",
  "replace-ownership": "replace-ownership-declaration",
  "add-route-registration": "add-registration",
  "add-service-registration": "add-registration",
  "add-capability-registration": "add-registration",
  "add-platform-registration": "add-registration",
  "add-module-registration": "add-registration",
  "add-lineage-relationship": "add-relationship",
  "mark-expected-by-design": "add-expected-by-design-exception",
  "promote-candidate-edge": "promote-candidate-relationship",
  "reject-candidate-edge": "reject-candidate-relationship",
};

/** Deterministic semantic inverse. `null` means no deterministic inverse. */
export const INVERSE_PATCH_OPERATION: Readonly<Record<PatchOperation, PatchOperation | null>> = {
  "add-record": "remove-record",
  "update-record": "update-record",
  "remove-record": null,
  "add-relationship": "remove-relationship",
  "update-relationship": "update-relationship",
  "remove-relationship": "add-relationship",
  "add-ownership-declaration": "remove-record",
  "replace-ownership-declaration": "replace-ownership-declaration",
  "add-registration": "remove-registration",
  "update-registration": "update-registration",
  "remove-registration": "add-registration",
  "add-expected-by-design-exception": "remove-expected-by-design-exception",
  "remove-expected-by-design-exception": "add-expected-by-design-exception",
  "promote-candidate-relationship": "reject-candidate-relationship",
  "reject-candidate-relationship": null,
  "add-test-fixture": null,
  "update-test-fixture": "update-test-fixture",
  "add-documentation-entry": "update-documentation-entry",
  "update-documentation-entry": "update-documentation-entry",
};

/* -------------------------------------------------------------------------- */
/* Selectors                                                                   */
/* -------------------------------------------------------------------------- */

const SELECTOR_FOR_ARTIFACT: Readonly<Record<ArtifactType, SelectorType>> = {
  "module-manifest": "manifest-entry",
  "shared-capability-registry": "registry-record-id",
  "platform-capability-registry": "registry-record-id",
  "capability-hierarchy": "capability-id",
  "route-registry": "route-path",
  "implementation-inventory": "registry-record-id",
  "candidate-edge-registry": "relationship-tuple",
  "governance-registry": "typescript-exported-constant",
  "graph-builder": "typescript-exported-constant",
  "graph-population": "typescript-exported-constant",
  "graph-validation-fixture": "test-fixture-id",
  "test-suite": "test-fixture-id",
  documentation: "documentation-heading",
  "source-file": "typescript-exported-constant",
  unresolved: "unresolved",
};

const nodeFact = (
  subject: string,
  statement: string,
  confidence: ReasoningConfidence = "high",
): ReasoningEvidence => ({ kind: "node-fact", subject, statement, confidence, candidate: false });

/**
 * Builds the typed selector for a change against a resolved artifact. Selector
 * value derivation is driven by the change target, never by text search.
 */
export function buildSelector(
  change: ProposedChange,
  artifact: ArtifactLocator,
  node: GraphNode | null,
  candidateCount: number,
): TargetSelector {
  if (!artifact.path) {
    return {
      type: "unresolved",
      value: change.target.id,
      expectedMatchCount: 0,
      evidence: [nodeFact(change.target.id, "No authoritative artifact resolved.", "unable-to-verify")],
      ambiguity: "unresolved",
      failureBehavior: "block-patch",
      explanation: "The artifact for this change is unresolved, so no selector can be derived.",
    };
  }

  let type = SELECTOR_FOR_ARTIFACT[artifact.type];
  let value = change.target.id;

  if (change.target.kind === "edge" || change.target.kind === "node-pair") {
    type = "relationship-tuple";
    value = change.edge
      ? `${change.edge.from}|${change.edge.type}|${change.edge.to}`
      : change.target.id;
  } else if (change.operation === "declare-ownership" || change.operation === "replace-ownership") {
    type = "owner-id";
    value = `${change.target.id}→${change.ownerModuleId ?? "unresolved"}`;
  } else if (change.operation === "add-route-registration" || node?.type === "route") {
    type = "route-path";
    value = node?.label ?? change.target.id;
  } else if (node?.type === "service") {
    type = "service-id";
  } else if (node?.type === "capability" || node?.type === "sub-capability") {
    type = "capability-id";
  } else if (node?.type === "platform-capability") {
    type = "platform-id";
  } else if (node?.type === "module") {
    type = "module-id";
  }

  // An additive operation expects the target to be absent (0 matches); an
  // update or removal expects exactly one.
  const additive =
    change.operation.startsWith("add-") ||
    change.operation === "declare-ownership" ||
    change.operation === "mark-expected-by-design";
  const expectedMatchCount = additive ? 0 : 1;
  const ambiguity = candidateCount > 1 ? "ambiguous" : "unambiguous";

  return {
    type,
    value,
    expectedMatchCount,
    evidence: [
      nodeFact(
        change.target.id,
        `Selector derived from change target (${change.target.kind}) against ${artifact.type} "${artifact.path}".`,
      ),
    ],
    ambiguity,
    failureBehavior: ambiguity === "ambiguous" ? "require-human-selection" : "block-patch",
    explanation:
      ambiguity === "ambiguous"
        ? `${candidateCount} authoritative artifacts match; the target cannot be selected deterministically.`
        : `Expect ${expectedMatchCount} existing match for ${type} "${value}" in "${artifact.path}".`,
  };
}

/* -------------------------------------------------------------------------- */
/* Pre and post conditions                                                     */
/* -------------------------------------------------------------------------- */

export interface PatchConditionInput {
  canonicalGraphHash: string;
  expectedBaselineHash: string;
  artifact: ArtifactLocator;
  selector: TargetSelector;
  change: ProposedChange;
  approvalsResolved: boolean;
  parametersResolved: boolean;
  supersededBy: string | null;
  dependencyStepIds: readonly string[];
  simulationValid: boolean;
}

export function buildPreconditions(input: PatchConditionInput): readonly PatchPrecondition[] {
  const { change, selector, artifact } = input;
  const conditions: PatchPrecondition[] = [
    {
      kind: "canonical-graph-hash-matches",
      subject: input.expectedBaselineHash,
      statement: `Canonical graph hash must equal the simulation baseline "${input.expectedBaselineHash}".`,
      checkable: "planning-time",
      satisfied: input.canonicalGraphHash === input.expectedBaselineHash,
      evidence: [nodeFact("canonical-graph", `Current canonical hash is "${input.canonicalGraphHash}".`)],
    },
    {
      kind: "artifact-exists",
      subject: artifact.path ?? "unresolved",
      statement: artifact.path
        ? `Repository artifact "${artifact.path}" must exist.`
        : "An authoritative repository artifact must be selected before execution.",
      checkable: "planning-time",
      satisfied: artifact.path !== null,
      evidence: [nodeFact(artifact.path ?? "unresolved", `Artifact type "${artifact.type}", method "${artifact.method}".`)],
    },
    {
      kind: "target-exists",
      subject: selector.value,
      statement:
        selector.expectedMatchCount === 0
          ? `Target "${selector.value}" must not already be declared.`
          : `Target "${selector.value}" must already be declared.`,
      checkable: "execution-time",
      satisfied: null,
      evidence: selector.evidence,
    },
    {
      kind: "target-count-matches",
      subject: selector.value,
      statement: `Selector "${selector.type}" must match exactly ${selector.expectedMatchCount} record(s).`,
      checkable: "execution-time",
      satisfied: null,
      evidence: [],
    },
    {
      kind: "before-state-matches",
      subject: change.target.id,
      statement: "The recorded before-state expectation must match the artifact's current state.",
      checkable: "execution-time",
      satisfied: null,
      evidence: [],
    },
    {
      kind: "parameters-resolved",
      subject: change.id,
      statement:
        change.requiredParameters.length > 0
          ? `Required parameters must be bound: ${[...change.requiredParameters].sort(byString).join(", ")}.`
          : "The change declares no required parameters.",
      checkable: "planning-time",
      satisfied: input.parametersResolved && change.requiredParameters.length === 0,
      evidence: [],
    },
    {
      kind: "approvals-present",
      subject: change.id,
      statement: "Every mandatory approval must be recorded before execution.",
      checkable: "planning-time",
      satisfied: input.approvalsResolved,
      evidence: [],
    },
    {
      kind: "no-superseding-plan",
      subject: input.supersededBy ?? "none",
      statement: input.supersededBy
        ? `Plan is superseded by "${input.supersededBy}".`
        : "No newer plan supersedes this plan.",
      checkable: "planning-time",
      satisfied: input.supersededBy === null,
      evidence: [],
    },
    {
      kind: "dependent-steps-complete",
      subject: change.id,
      statement:
        input.dependencyStepIds.length > 0
          ? `Dependent steps must complete first: ${[...input.dependencyStepIds].sort(byString).join(", ")}.`
          : "The change has no step dependencies.",
      checkable: "execution-time",
      satisfied: input.dependencyStepIds.length === 0 ? true : null,
      evidence: [],
    },
    {
      kind: "simulation-still-valid",
      subject: change.id,
      statement: "The source simulation must remain valid against the current baseline.",
      checkable: "planning-time",
      satisfied: input.simulationValid,
      evidence: [],
    },
  ];
  return conditions;
}

export function buildPostconditions(change: ProposedChange): readonly PatchPostcondition[] {
  const removal = change.operation.startsWith("remove-") || change.operation === "reject-candidate-edge";
  const relationship =
    change.target.kind === "edge" ||
    change.target.kind === "node-pair" ||
    change.operation === "add-lineage-relationship";

  const conditions: PatchPostcondition[] = [
    {
      kind: removal ? "declaration-absent" : "declaration-exists",
      subject: change.target.id,
      statement: removal
        ? `The declaration for "${change.target.id}" no longer exists in the authoritative artifact.`
        : `The intended declaration for "${change.target.id}" exists in the authoritative artifact.`,
      evidence: [],
    },
    {
      kind: "graph-validation-passes",
      subject: "capability-graph",
      statement: "Graph validation reports zero errors after regeneration.",
      evidence: [],
    },
    {
      kind: "graph-regenerates",
      subject: "capability-graph",
      statement: "The canonical graph regenerates successfully from the updated registries.",
      evidence: [],
    },
    {
      kind: "expected-entities-exist",
      subject: change.target.id,
      statement: `Expected graph entities exist after regeneration: ${planSortedUnique([
        ...change.target.nodeIds,
        ...change.target.edgeIds,
      ]).join(", ") || change.target.id}.`,
      evidence: [],
    },
    {
      kind: "no-prohibited-regression",
      subject: change.id,
      statement: "No critical regression is introduced relative to the approved simulation.",
      evidence: [],
    },
    {
      kind: "metrics-within-tolerance",
      subject: change.id,
      statement: "Observed metrics remain within the approved simulation tolerances.",
      evidence: [],
    },
    {
      kind: "content-hash-changes-only-where-expected",
      subject: "capability-graph",
      statement:
        "The canonical content hash changes only as a result of the declared entities and relationships.",
      evidence: [],
    },
  ];

  if (relationship) {
    conditions.push({
      kind: "endpoint-policy-satisfied",
      subject: change.target.id,
      statement: "The relationship satisfies the graph endpoint policy for its edge type.",
      evidence: [],
    });
  }

  return conditions.sort((a, b) => byString(a.kind, b.kind) || byString(a.subject, b.subject));
}

/* -------------------------------------------------------------------------- */
/* Before / after state                                                        */
/* -------------------------------------------------------------------------- */

const stateFields = (change: ProposedChange): Readonly<Record<string, string | number | boolean | null>> => ({
  targetKind: change.target.kind,
  targetId: change.target.id,
  ...(change.node
    ? { nodeType: change.node.type, nodeLabel: change.node.label, moduleId: change.node.moduleId }
    : {}),
  ...(change.edge ? { edgeType: change.edge.type, from: change.edge.from, to: change.edge.to } : {}),
  ...(change.ownerModuleId !== undefined ? { ownerModuleId: change.ownerModuleId } : {}),
});

export function buildBeforeState(change: ProposedChange): PatchStateExpectation {
  const additive = change.operation.startsWith("add-") || change.operation === "declare-ownership";
  return {
    kind: additive ? "absent" : "present",
    subject: change.target.id,
    fields: stateFields(change),
    statement: additive
      ? `"${change.target.id}" is not yet declared in the authoritative artifact.`
      : `"${change.target.id}" is currently declared in the authoritative artifact.`,
  };
}

export function buildAfterState(change: ProposedChange): PatchStateExpectation {
  const removal = change.operation.startsWith("remove-") || change.operation === "reject-candidate-edge";
  return {
    kind: removal ? "absent" : "present-with-value",
    subject: change.target.id,
    fields: stateFields(change),
    statement: removal
      ? `"${change.target.id}" is removed from the authoritative artifact.`
      : `"${change.target.id}" is declared with the intended values in the authoritative artifact.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Rollback                                                                    */
/* -------------------------------------------------------------------------- */

export function buildRollback(
  patchId: string,
  operation: PatchOperation,
  change: ProposedChange,
  order: number,
  dependentPatchIds: readonly string[],
): RollbackSpecification {
  const reverse = INVERSE_PATCH_OPERATION[operation];
  const manual = reverse === null;
  return {
    id: `rbk:${patchId}`,
    patchId,
    reverseOperation: reverse,
    reversible: !manual && change.reversible,
    manualRollbackRequired: manual || !change.reversible,
    requiredBeforeStateEvidence: [
      `Recorded before-state for "${change.target.id}" must be captured prior to execution.`,
    ],
    requiredAfterStateEvidence: [
      `Observed after-state for "${change.target.id}" must be captured before rollback is attempted.`,
    ],
    order,
    dependentPatchIds: [...dependentPatchIds].sort(byString),
    graphRegenerationRequired: true,
    validationRequirements: [
      "Regenerate the canonical graph.",
      "Run graph validation and confirm zero errors.",
      "Confirm the canonical content hash returns to the recorded baseline.",
    ],
    risks: manual
      ? [`Operation "${operation}" has no deterministic inverse; rollback requires manual design.`]
      : [],
    limitations: manual
      ? ["Removal and rejection operations discard declarations that cannot be reconstructed deterministically."]
      : [],
    explanation: manual
      ? `No deterministic inverse exists for "${operation}"; manual rollback design is required.`
      : `Rollback applies "${reverse}" against the same target selector in reverse dependency order.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Patch specification                                                         */
/* -------------------------------------------------------------------------- */

export interface PatchBuildInput {
  planId: string;
  stepId: string;
  change: ProposedChange;
  mapping: ArtifactMapping;
  graph: CapabilityGraph;
  lineage: PlanLineage;
  conditions: Omit<PatchConditionInput, "artifact" | "selector" | "change">;
  order: number;
  dependentPatchIds: readonly string[];
  confidence: ReasoningConfidence;
}

export function buildPatchSpecification(input: PatchBuildInput): PatchSpecification {
  const { change, mapping } = input;
  const node = input.graph.nodes.find((n) => n.id === change.target.id) ?? null;
  const artifact: ArtifactLocator =
    mapping.selected ??
    ({
      path: null,
      type: "unresolved",
      authoritative: false,
      method: "none",
      confidence: "unable-to-verify",
      evidence: [],
    } satisfies ArtifactLocator);

  const authoritativeCount = mapping.candidates.filter((c) => c.authoritative).length;
  const selector = buildSelector(change, artifact, node, authoritativeCount);
  const operation = PATCH_OPERATION_FOR_CHANGE[change.operation];

  const preconditions = buildPreconditions({
    ...input.conditions,
    artifact,
    selector,
    change,
  });

  const blockers: string[] = [];
  if (!mapping.resolved) blockers.push(`Unresolved authoritative artifact for "${change.target.id}".`);
  if (mapping.humanSelectionRequired && mapping.resolved) {
    blockers.push(`Human artifact selection required for "${change.target.id}".`);
  }
  if (selector.ambiguity !== "unambiguous") {
    blockers.push(`Selector "${selector.type}:${selector.value}" is ${selector.ambiguity}.`);
  }
  if (change.requiredParameters.length > 0) {
    blockers.push(`Unresolved parameters: ${[...change.requiredParameters].sort(byString).join(", ")}.`);
  }
  for (const condition of preconditions) {
    if (condition.checkable === "planning-time" && condition.satisfied === false) {
      blockers.push(`Precondition "${condition.kind}" is not satisfied: ${condition.statement}`);
    }
  }

  const status: PatchStatus = blockers.length === 0
    ? "specified"
    : mapping.humanSelectionRequired && mapping.resolved
      ? "manual-review-required"
      : "blocked";

  const id = `patch:${planHash(
    `${input.planId}|${change.id}|${operation}|${artifact.path ?? "unresolved"}|${selector.type}|${selector.value}`,
  )}`;

  const rollback = buildRollback(id, operation, change, input.order, input.dependentPatchIds);

  return {
    id,
    planId: input.planId,
    stepId: input.stepId,
    changeId: change.id,
    operation,
    sourceOperation: change.operation,
    artifact,
    artifactType: artifact.type,
    selector,
    status,
    blockers: planSortedUnique(blockers),
    beforeState: buildBeforeState(change),
    afterState: buildAfterState(change),
    preconditions,
    postconditions: buildPostconditions(change),
    validationRules: [
      "graph-schema-validation",
      "graph-endpoint-policy",
      "graph-hash-check",
      "recommendation-resolution-check",
    ],
    rollback,
    evidence: [
      ...change.rationale.evidence.slice(0, 10),
      ...(mapping.selected?.evidence ?? []),
    ],
    confidence: input.confidence,
    lineage: input.lineage,
    explanation: `${change.rationale.statement} Operation "${operation}" targets ${
      artifact.path ? `"${artifact.path}" (${artifact.type})` : "an unresolved artifact"
    } via ${selector.type} "${selector.value}". ${selector.explanation}`,
  };
}

/* -------------------------------------------------------------------------- */
/* Patch-level conflicts                                                       */
/* -------------------------------------------------------------------------- */

export function detectPatchConflicts(
  patches: readonly PatchSpecification[],
): readonly PatchConflict[] {
  const conflicts: PatchConflict[] = [];
  const byTarget = new Map<string, PatchSpecification[]>();

  for (const patch of patches) {
    const key = `${patch.artifact.path ?? "unresolved"}|${patch.selector.type}|${patch.selector.value}`;
    byTarget.set(key, [...(byTarget.get(key) ?? []), patch]);
  }

  for (const [key, group] of [...byTarget.entries()].sort((a, b) => byString(a[0], b[0]))) {
    if (group.length < 2) continue;
    const ids = group.map((p) => p.id).sort(byString);
    const operations = planSortedUnique(group.map((p) => p.operation));
    const removalAndUpdate =
      operations.some((o) => o.startsWith("remove-")) &&
      operations.some((o) => o.startsWith("update-") || o.startsWith("add-"));
    const divergentOwner =
      operations.every((o) => o.includes("ownership")) &&
      planSortedUnique(group.map((p) => String(p.afterState.fields.ownerModuleId ?? ""))).length > 1;

    conflicts.push({
      id: `pcf:${removalAndUpdate ? "overlapping-removal" : divergentOwner ? "divergent-owner" : "same-target"}:${planHash(ids.join("|"))}`,
      kind: removalAndUpdate ? "overlapping-removal" : divergentOwner ? "divergent-owner" : "same-target",
      patchIds: ids,
      subject: key,
      explanation: `${group.length} patches target the same selector "${key}" with operations ${operations.join(", ")}.`,
    });
  }

  for (const patch of patches) {
    if (patch.artifact.path !== null) continue;
    conflicts.push({
      id: `pcf:unresolved-artifact:${planHash(patch.id)}`,
      kind: "unresolved-artifact",
      patchIds: [patch.id],
      subject: patch.selector.value,
      explanation: `Patch "${patch.id}" has no authoritative artifact and cannot be executed.`,
    });
  }

  return conflicts.sort((a, b) => byString(a.kind, b.kind) || byString(a.id, b.id));
}

export const patchSlug = (patch: PatchSpecification): string => planSlug(patch.selector.value);
