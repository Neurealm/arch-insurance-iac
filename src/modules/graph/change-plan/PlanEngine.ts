/**
 * Stage 3.5.3.5 — Controlled Change Plan engine.
 *
 * Converts a validated Stage 3.5.3.4 simulation result into a structured,
 * reviewable change plan. Planning only: nothing here mutates the canonical
 * graph, the simulation results, or any repository file, and no patch is ever
 * applied. Every identifier, ordering and status is deterministic.
 */

import type { CapabilityGraph, GraphNode } from "../types";
import type { ReasoningConfidence, ReasoningEvidence } from "../reasoning/index";
import { getModules } from "../registry";
import { getCapabilityGraph } from "../build";
import {
  createSimulationEngine,
  GraphSimulationEngine,
  type ChangeOperation,
  type ChangeProposal,
  type MetricDelta,
  type ProposedChange,
  type SimulationMetrics,
  type SimulationResult,
} from "../simulation/index";
import {
  ARTIFACT_CATALOG,
  artifactPaths,
  mapChangesToArtifacts,
  type ArtifactMappingInput,
} from "./ArtifactMapping";
import {
  buildPatchSpecification,
  detectPatchConflicts,
} from "./PatchSpecification";
import {
  byString,
  CHANGE_PLAN_GENERATOR,
  planHash,
  planSlug,
  planSortedUnique,
  type ApprovalRequirement,
  type ApprovalRole,
  type ApprovalTrigger,
  type ChangeObjective,
  type ChangePlan,
  type ChangePlanRequest,
  type ChangeStep,
  type ChangeWorkstream,
  type ComparisonOutcome,
  type DriftFinding,
  type DriftReport,
  type EmittablePlanStatus,
  type ExecutionConstraint,
  type ExpectedMetricEffect,
  type ImplementationComparison,
  type PatchSpecification,
  type PlanBlocker,
  type PlanComparison,
  type PlanConflict,
  type PlanExplanation,
  type PlanLineage,
  type PlanRisk,
  type PlanScope,
  type PlanScopeKind,
  type RiskClassification,
  type RollbackCheckpoint,
  type RollbackPlan,
  type StepPrerequisite,
  type StepValidation,
  type ToleranceComparison,
  type ToleranceKey,
  type ToleranceRule,
  type ValidationCheckpoint,
  type WorkstreamKind,
} from "./ChangePlanTypes";

/* -------------------------------------------------------------------------- */
/* Static decomposition tables                                                 */
/* -------------------------------------------------------------------------- */

export const WORKSTREAM_FOR_OPERATION: Readonly<Record<ChangeOperation, WorkstreamKind>> = {
  "declare-ownership": "ownership-remediation",
  "replace-ownership": "ownership-remediation",
  "add-route-registration": "route-registration",
  "add-service-registration": "service-registration",
  "add-capability-registration": "capability-registration",
  "add-platform-registration": "platform-registration",
  "add-module-registration": "module-registration",
  "add-lineage-relationship": "lineage-remediation",
  "mark-expected-by-design": "expected-by-design-governance",
  "promote-candidate-edge": "candidate-edge-adjudication",
  "reject-candidate-edge": "candidate-edge-adjudication",
  "add-node": "graph-regeneration",
  "add-edge": "dependency-remediation",
  "remove-node": "resilience-remediation",
  "remove-edge": "resilience-remediation",
  "replace-edge": "dependency-remediation",
  "update-node-metadata": "graph-regeneration",
  "update-edge-metadata": "graph-regeneration",
};

/** Workstreams execute in this fixed order; declarations precede validation. */
export const WORKSTREAM_ORDER: readonly WorkstreamKind[] = [
  "module-registration",
  "platform-registration",
  "capability-registration",
  "ownership-remediation",
  "route-registration",
  "page-registration",
  "service-registration",
  "lineage-remediation",
  "dependency-remediation",
  "resilience-remediation",
  "candidate-edge-adjudication",
  "expected-by-design-governance",
  "graph-regeneration",
  "test-updates",
  "documentation-updates",
  "graph-validation",
];

const workstreamRank = (kind: WorkstreamKind): number => {
  const index = WORKSTREAM_ORDER.indexOf(kind);
  return index === -1 ? WORKSTREAM_ORDER.length : index;
};

const APPROVAL_ROLE_FOR_WORKSTREAM: Readonly<Record<WorkstreamKind, ApprovalRole>> = {
  "ownership-remediation": "module-owner",
  "route-registration": "module-owner",
  "page-registration": "module-owner",
  "service-registration": "module-owner",
  "capability-registration": "capability-owner",
  "platform-registration": "platform-owner",
  "module-registration": "architecture-reviewer",
  "lineage-remediation": "capability-owner",
  "resilience-remediation": "architecture-reviewer",
  "dependency-remediation": "architecture-reviewer",
  "candidate-edge-adjudication": "graph-governance-reviewer",
  "expected-by-design-governance": "graph-governance-reviewer",
  "test-updates": "repository-maintainer",
  "documentation-updates": "repository-maintainer",
  "graph-regeneration": "repository-maintainer",
  "graph-validation": "graph-governance-reviewer",
};

export const DEFAULT_TOLERANCES: readonly ToleranceRule[] = [
  { key: "nodeCount", absolute: 0, relative: 0, regressionProhibited: false, statement: "Node count must match the simulated overlay exactly." },
  { key: "edgeCount", absolute: 0, relative: 0, regressionProhibited: false, statement: "Edge count must match the simulated overlay exactly." },
  { key: "ownershipResolutionRate", absolute: 0.01, relative: 0, regressionProhibited: true, statement: "Ownership resolution must not fall below the simulated rate by more than 0.01." },
  { key: "routeTraceabilityRate", absolute: 0.01, relative: 0, regressionProhibited: true, statement: "Route traceability must not fall below the simulated rate by more than 0.01." },
  { key: "coverageGapCount", absolute: 0, relative: 0, regressionProhibited: true, statement: "Coverage gaps must not exceed the simulated count." },
  { key: "singlePointOfFailureCount", absolute: 0, relative: 0, regressionProhibited: true, statement: "Single points of failure must not exceed the simulated count." },
  { key: "dependencyCycleCount", absolute: 0, relative: 0, regressionProhibited: true, statement: "Dependency cycles must not exceed the simulated count." },
  { key: "recommendationCount", absolute: 1, relative: 0, regressionProhibited: true, statement: "Recommendation count may exceed the simulated count by at most 1." },
  { key: "priorityScoreTotal", absolute: 5, relative: 0, regressionProhibited: true, statement: "Total priority score may exceed the simulated total by at most 5." },
  { key: "incidentalChanges", absolute: 0, relative: 0, regressionProhibited: true, statement: "No incidental graph changes are permitted." },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const fact = (
  subject: string,
  statement: string,
  confidence: ReasoningConfidence = "high",
): ReasoningEvidence => ({ kind: "node-fact", subject, statement, confidence, candidate: false });

const pad = (n: number): string => String(n).padStart(3, "0");

const riskFor = (operation: ChangeOperation, regressionCount: number): RiskClassification => {
  if (operation.startsWith("remove-")) return regressionCount > 0 ? "critical" : "high";
  if (operation === "replace-ownership" || operation === "replace-edge") return "high";
  if (regressionCount > 0) return "moderate";
  if (operation.startsWith("add-")) return "low";
  return "moderate";
};

const metricValue = (metrics: SimulationMetrics, key: ToleranceKey): number | null => {
  if (key === "incidentalChanges" || key === "confidence") return null;
  const value = (metrics as unknown as Record<string, unknown>)[key];
  return typeof value === "number" ? value : null;
};

/* -------------------------------------------------------------------------- */
/* Engine                                                                      */
/* -------------------------------------------------------------------------- */

export interface ChangePlanEngineInput {
  graph?: CapabilityGraph;
  simulationEngine?: GraphSimulationEngine;
  knownModuleIds?: readonly string[];
}

export class GraphChangePlanEngine {
  readonly generator = CHANGE_PLAN_GENERATOR;
  private readonly graph: CapabilityGraph;
  private readonly simulation: GraphSimulationEngine;
  private readonly moduleIds: readonly string[];
  private readonly nodesById: Map<string, GraphNode>;

  constructor(input: ChangePlanEngineInput = {}) {
    this.graph = input.graph ?? getCapabilityGraph();
    this.simulation = input.simulationEngine ?? createSimulationEngine();
    this.moduleIds =
      input.knownModuleIds ?? getModules().map((m) => m.identity.moduleId).sort(byString);
    this.nodesById = new Map(this.graph.nodes.map((n) => [n.id, n]));
  }

  /* ---------------------------------------------------------------------- */
  /* Scope                                                                   */
  /* ---------------------------------------------------------------------- */

  resolveScope(
    kind: PlanScopeKind,
    subject: string | null,
    changes: readonly ProposedChange[],
  ): PlanScope {
    const changeNodeIds = planSortedUnique(changes.flatMap((c) => [...c.target.nodeIds, c.target.id]));
    if (kind === "graph" || subject === null) {
      return {
        kind,
        subject,
        resolvedNodeIds: changeNodeIds,
        explanation: `Scope "${kind}" resolves to the ${changeNodeIds.length} entities touched by the proposal.`,
      };
    }
    const matches = changeNodeIds.filter((id) => {
      const node = this.nodesById.get(id);
      if (!node) return id === subject;
      return (
        id === subject ||
        node.moduleId === subject ||
        node.type === subject ||
        node.label === subject
      );
    });
    return {
      kind,
      subject,
      resolvedNodeIds: matches,
      explanation:
        matches.length > 0
          ? `Scope "${kind}:${subject}" resolves to ${matches.length} entity/entities within the proposal.`
          : `Scope "${kind}:${subject}" matched no proposal entity; the plan covers no in-scope work.`,
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Approvals                                                              */
  /* ---------------------------------------------------------------------- */

  private approvalFor(
    kind: WorkstreamKind,
    subject: string,
    triggers: readonly ApprovalTrigger[],
    moduleId: string | null,
  ): ApprovalRequirement {
    const role = APPROVAL_ROLE_FOR_WORKSTREAM[kind];
    const manifest = moduleId
      ? getModules().find((m) => m.identity.moduleId === moduleId)
      : undefined;
    const declared = manifest?.identity.technicalOwner ?? null;
    const resolved = declared && declared !== "unassigned" && declared.trim() !== "" ? declared : null;
    return {
      id: `apr:${role}:${planSlug(subject)}`,
      role,
      subject,
      triggers: [...triggers].sort(byString),
      assignee: resolved,
      assigneeSource: resolved ? "module-manifest" : "unresolved",
      mandatory: true,
      blocker: resolved === null,
      rationale: resolved
        ? `Manifest for module "${moduleId}" declares technical owner "${resolved}".`
        : `No owner is declared for "${subject}"; the ${role} approval cannot be assigned deterministically.`,
      evidence: [
        fact(
          subject,
          resolved
            ? `Approval assignee read from module manifest "${moduleId}".`
            : "No manifest owner declaration exists; assignee is unresolved.",
          resolved ? "high" : "unable-to-verify",
        ),
      ],
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Validation checkpoints                                                  */
  /* ---------------------------------------------------------------------- */

  validationCheckpoints(stepIds: readonly string[]): readonly ValidationCheckpoint[] {
    const defs: readonly {
      kind: StepValidation["kind"];
      statement: string;
      command: string | null;
      rule: string | null;
      blocking: boolean;
      derivation: string;
    }[] = [
      {
        kind: "graph-builder",
        statement: "Regenerate the canonical capability graph from the updated registries.",
        command: null,
        rule: "graph.build.buildCapabilityGraph",
        blocking: true,
        derivation: "Every declaration change alters graph inputs, so the graph must be rebuilt.",
      },
      {
        kind: "graph-schema-validation",
        statement: "Graph validation must report zero errors.",
        command: null,
        rule: "graph.validate.validateGraph",
        blocking: true,
        derivation: "Stage 3.5.1 validation is the schema gate for any graph-affecting change.",
      },
      {
        kind: "graph-endpoint-policy",
        statement: "Every new relationship must satisfy the edge endpoint policy.",
        command: null,
        rule: "graph.types.EDGE_ENDPOINT_POLICY",
        blocking: true,
        derivation: "Relationship changes are only legal between declared endpoint types.",
      },
      {
        kind: "graph-hash-check",
        statement: "The canonical content hash must change only where the plan predicts.",
        command: null,
        rule: "graph.serialize.computeGraphHash",
        blocking: true,
        derivation: "Hash comparison detects incidental changes outside the plan.",
      },
      {
        kind: "recommendation-resolution-check",
        statement: "Targeted recommendations must reach their simulated resolution class.",
        command: null,
        rule: "simulation.SimulationMetrics.classifyResolutions",
        blocking: true,
        derivation: "The plan's objectives are stated as recommendation resolutions.",
      },
      {
        kind: "regression-check",
        statement: "No critical regression may be present after implementation.",
        command: null,
        rule: "simulation.SimulationMetrics.detectRegressions",
        blocking: true,
        derivation: "Critical regressions gate the approved simulation and therefore the plan.",
      },
      {
        kind: "metric-delta-comparison",
        statement: "Observed metrics must fall within the plan tolerances.",
        command: null,
        rule: "change-plan.PlanEngine.compareImplementation",
        blocking: true,
        derivation: "Tolerances define the acceptable deviation from the approved simulation.",
      },
      {
        kind: "unit-test",
        statement: "Run the repository test suite.",
        command: "npm run test",
        blocking: true,
        rule: null,
        derivation: "The `test` script exists in package.json.",
      },
      {
        kind: "type-check",
        statement: "Run the production build, which type-checks the application project.",
        command: "npm run build",
        blocking: true,
        rule: null,
        derivation: "The `build` script exists in package.json.",
      },
      {
        kind: "determinism-check",
        statement: "Rebuild twice and confirm identical graph and plan hashes.",
        command: null,
        rule: "change-plan.PlanEngine.buildPlan",
        blocking: false,
        derivation: "The planning layer guarantees identical output for identical inputs.",
      },
    ];

    return defs.map((def, index) => ({
      id: `chk:${pad(index + 1)}:${def.kind}`,
      order: index + 1,
      kind: def.kind,
      statement: def.statement,
      command: def.command,
      rule: def.rule,
      blocking: def.blocking,
      appliesToStepIds: [...stepIds].sort(byString),
      derivation: def.derivation,
    }));
  }

  /* ---------------------------------------------------------------------- */
  /* Plan construction                                                       */
  /* ---------------------------------------------------------------------- */

  buildPlanFromSimulation(result: SimulationResult, request: ChangePlanRequest = {}): ChangePlan {
    const proposal: ChangeProposal = result.proposal;
    const canonicalGraphHash = this.graph.version.contentHash;
    const expectedBaselineHash = request.expectedBaselineHash ?? canonicalGraphHash;

    const selectedChanges = request.changeIds
      ? result.proposedChanges.filter((c) => request.changeIds!.includes(c.id))
      : result.proposedChanges;
    const changes = [...selectedChanges].sort((a, b) => byString(a.id, b.id));
    const skippedChangeIds = planSortedUnique(
      result.proposedChanges.filter((c) => !changes.includes(c)).map((c) => c.id),
    );

    const scope = this.resolveScope(
      request.scope?.kind ?? "proposal",
      request.scope?.subject ?? proposal.id,
      changes,
    );

    const mappingInput: ArtifactMappingInput = {
      graph: this.graph,
      knownModuleIds: this.moduleIds,
      catalog: ARTIFACT_CATALOG,
    };
    const artifactMappings = mapChangesToArtifacts(mappingInput, changes);
    const mappingByEntity = new Map(
      artifactMappings.map((m) => [`${m.entityId}|${m.operation}`, m]),
    );

    const lineage: PlanLineage = {
      graphVersion: this.graph.version.version,
      canonicalGraphHash,
      overlayContentHash: result.overlayContentHash,
      recommendationIds: planSortedUnique([proposal.recommendationId]),
      policyIds: planSortedUnique([proposal.policyId]),
      findingIds: planSortedUnique(proposal.sourceFindingIds),
      proposalIds: planSortedUnique([proposal.id]),
      simulationIds: planSortedUnique([result.simulationId]),
      reasoningAnalyses: proposal.lineage.reasoningAnalyses,
      nodeIds: planSortedUnique(changes.flatMap((c) => c.target.nodeIds)),
      edgeIds: planSortedUnique(changes.flatMap((c) => c.target.edgeIds)),
    };

    const materialHash = planHash(
      [
        canonicalGraphHash,
        result.overlayContentHash,
        proposal.id,
        changes.map((c) => c.id).join(","),
        scope.kind,
        scope.subject ?? "",
        JSON.stringify(request.parameters ?? {}),
      ].join("|"),
    );
    const planId = `plan:${canonicalGraphHash}:${materialHash}`;

    /* Steps and patches, grouped by workstream in declaration order. */
    const grouped = new Map<WorkstreamKind, ProposedChange[]>();
    for (const change of changes) {
      const kind = WORKSTREAM_FOR_OPERATION[change.operation];
      grouped.set(kind, [...(grouped.get(kind) ?? []), change]);
    }
    const orderedKinds = [...grouped.keys()].sort(
      (a, b) => workstreamRank(a) - workstreamRank(b) || byString(a, b),
    );

    const patches: PatchSpecification[] = [];
    const steps: ChangeStep[] = [];
    const workstreams: ChangeWorkstream[] = [];
    const approvals = new Map<string, ApprovalRequirement>();
    const stepIdByChangeId = new Map<string, string>();
    let order = 0;

    for (const kind of orderedKinds) {
      const wsChanges = [...(grouped.get(kind) ?? [])].sort((a, b) => byString(a.id, b.id));
      const workstreamId = `ws:${materialHash}:${kind}`;
      const wsStepIds: string[] = [];
      const wsRisks: PlanRisk[] = [];
      const wsPatchPaths: string[] = [];

      for (const change of wsChanges) {
        order += 1;
        const stepId = `step:${materialHash}:${pad(order)}:${planSlug(change.operation + "-" + change.target.id)}`;
        stepIdByChangeId.set(change.id, stepId);
        wsStepIds.push(stepId);

        const mapping =
          mappingByEntity.get(`${change.target.id}|${change.operation}`) ??
          artifactMappings.find((m) => change.target.nodeIds.includes(m.entityId)) ??
          artifactMappings[0];

        const dependencyStepIds = change.dependencies
          .map((d) => stepIdByChangeId.get(d.changeId))
          .filter((id): id is string => Boolean(id));

        const moduleId =
          change.ownerModuleId ?? this.nodesById.get(change.target.id)?.moduleId ?? null;
        const approval = this.approvalFor(
          kind,
          moduleId ?? change.target.id,
          [
            "change-category",
            ...(change.operation.includes("ownership") ? (["ownership-change"] as const) : []),
            ...(change.operation.startsWith("remove-") ? (["removal-operation"] as const) : []),
            ...(result.regressions.length > 0 ? (["regression-exposure"] as const) : []),
          ],
          moduleId,
        );
        approvals.set(approval.id, approval);

        const patch = buildPatchSpecification({
          planId,
          stepId,
          change,
          mapping,
          graph: this.graph,
          lineage,
          conditions: {
            canonicalGraphHash,
            expectedBaselineHash,
            approvalsResolved: !approval.blocker,
            parametersResolved: change.requiredParameters.length === 0,
            supersededBy: null,
            dependencyStepIds,
            simulationValid: result.validation.executable,
          },
          order,
          dependentPatchIds: [],
          confidence: proposal.confidence,
        });
        patches.push(patch);
        if (patch.artifact.path) wsPatchPaths.push(patch.artifact.path);

        const risk = riskFor(change.operation, result.regressions.length);
        if (risk === "high" || risk === "critical") {
          wsRisks.push({
            id: `prsk:${planSlug(change.target.id)}:${planHash(change.id)}`,
            classification: risk,
            subject: change.target.id,
            statement: `Operation "${change.operation}" on "${change.target.id}" is classified ${risk}.`,
            entityIds: planSortedUnique(change.target.nodeIds),
            mitigations: [
              "Capture the before-state evidence prior to execution.",
              "Execute in isolation and revalidate the graph before continuing.",
            ],
          });
        }

        const preconditions: StepPrerequisite[] = [
          {
            kind: "baseline",
            subject: expectedBaselineHash,
            statement: `The canonical graph hash must equal "${expectedBaselineHash}".`,
            satisfied: canonicalGraphHash === expectedBaselineHash,
          },
          {
            kind: "artifact",
            subject: patch.artifact.path ?? "unresolved",
            statement: patch.artifact.path
              ? `Artifact "${patch.artifact.path}" is the authoritative target.`
              : "No authoritative artifact was resolved.",
            satisfied: patch.artifact.path !== null,
          },
          {
            kind: "approval",
            subject: approval.id,
            statement: approval.rationale,
            satisfied: !approval.blocker,
          },
          {
            kind: "parameter",
            subject: change.id,
            statement:
              change.requiredParameters.length > 0
                ? `Unbound parameters: ${[...change.requiredParameters].sort(byString).join(", ")}.`
                : "All required parameters are bound.",
            satisfied: change.requiredParameters.length === 0,
          },
          ...dependencyStepIds.map((id) => ({
            kind: "step" as const,
            subject: id,
            statement: `Step "${id}" must complete first.`,
            satisfied: false,
          })),
        ];

        steps.push({
          id: stepId,
          order,
          workstreamId,
          workstreamKind: kind,
          title: `${change.operation} — ${change.target.id}`,
          description: change.rationale.statement,
          operation: change.operation,
          patchIds: [patch.id],
          targetArtifactPaths: patch.artifact.path ? [patch.artifact.path] : [],
          targetEntityIds: planSortedUnique([...change.target.nodeIds, change.target.id]),
          preconditions,
          requiredInputs: [...change.requiredParameters].sort(byString),
          dependencies: change.dependencies
            .filter((d) => stepIdByChangeId.has(d.changeId))
            .map((d) => ({ stepId: stepIdByChangeId.get(d.changeId)!, reason: d.reason }))
            .sort((a, b) => byString(a.stepId, b.stepId)),
          parallelizable: dependencyStepIds.length === 0,
          expectedResult: patch.afterState.statement,
          validations: [
            {
              kind: "graph-schema-validation",
              statement: "Graph validation reports zero errors after this step.",
              command: null,
              rule: "graph.validate.validateGraph",
              derivation: "Every declaration change is a graph input change.",
            },
            {
              kind: "graph-hash-check",
              statement: "The canonical hash changes only for the declared entities.",
              command: null,
              rule: "graph.serialize.computeGraphHash",
              derivation: "Detects incidental changes introduced by the step.",
            },
          ],
          rollback: {
            statement: patch.rollback.explanation,
            reverseOperation: patch.rollback.reverseOperation,
            manual: patch.rollback.manualRollbackRequired,
            order,
          },
          risk,
          confidence: proposal.confidence,
          evidence: change.rationale.evidence.slice(0, 6),
          lineage,
          explanation: `${change.rationale.statement} Derived from recommendation "${proposal.recommendationId}" via proposal "${proposal.id}".`,
        });
      }

      const wsOperations = planSortedUnique(wsChanges.map((c) => c.operation)) as readonly ChangeOperation[];
      workstreams.push({
        id: workstreamId,
        kind,
        objective: `Apply ${wsChanges.length} ${kind} change(s) derived from "${proposal.recommendationId}".`,
        changeIds: wsChanges.map((c) => c.id).sort(byString),
        operations: wsOperations,
        artifactPaths: planSortedUnique(wsPatchPaths),
        stepIds: wsStepIds,
        dependencies: [],
        preconditions: [],
        validationCriteria: [
          "Graph validation reports zero errors.",
          "Targeted recommendations reach their simulated resolution class.",
        ],
        rollbackCriteria: [
          "Any blocking validation failure triggers rollback of the whole workstream.",
        ],
        requiredApprovalIds: planSortedUnique(
          [...approvals.values()]
            .filter((a) => a.role === APPROVAL_ROLE_FOR_WORKSTREAM[kind])
            .map((a) => a.id),
        ),
        expectedMetricEffects: this.expectedEffects(result.metricDeltas),
        risks: wsRisks.sort((a, b) => byString(a.id, b.id)),
        evidence: wsChanges.flatMap((c) => c.rationale.evidence.slice(0, 2)),
      });
    }

    /* Workstream dependency wiring follows the fixed workstream order. */
    const orderedWorkstreams = workstreams.map((ws, index) => ({
      ...ws,
      dependencies: workstreams.slice(0, index).map((prev) => prev.id),
    }));

    const patchConflicts = detectPatchConflicts(patches);
    const blockers = this.blockersFor(patches, [...approvals.values()], result, canonicalGraphHash, expectedBaselineHash);
    const status: EmittablePlanStatus =
      blockers.length > 0 ? "blocked" : patches.length > 0 ? "ready-for-review" : "draft";

    const rollbackPlan = this.rollbackPlan(materialHash, patches, orderedWorkstreams, steps);
    const checkpoints = this.validationCheckpoints(steps.map((s) => s.id));

    const objectives: readonly ChangeObjective[] = [
      {
        id: `obj:${planSlug(proposal.subject)}:${planHash(proposal.recommendationId)}`,
        statement: proposal.summary,
        recommendationIds: [proposal.recommendationId],
        policyIds: [proposal.policyId],
        expectedMetricKeys: planSortedUnique(
          result.metricDeltas.filter((d) => d.direction === "improved").map((d) => d.key),
        ),
        evidence: proposal.evidence.slice(0, 8),
      },
    ];

    const risks = planSortedUnique(orderedWorkstreams.flatMap((ws) => ws.risks.map((r) => r.id)))
      .map((id) => orderedWorkstreams.flatMap((ws) => ws.risks).find((r) => r.id === id)!)
      .sort((a, b) => byString(a.id, b.id));

    const explanation: PlanExplanation = {
      initiatingRecommendations: [proposal.recommendationId],
      generatingPolicies: [proposal.policyId],
      supportingFindings: planSortedUnique(proposal.sourceFindingIds),
      selectedProposal: proposal.id,
      proposalPassedSimulationBecause: result.score.explanation,
      expectedResolutions: result.resolvedRecommendations.map((r) => r.explanation),
      expectedMetricImprovements: result.metricDeltas
        .filter((d) => d.direction === "improved")
        .map((d) => `${d.label}: ${d.baseline} → ${d.simulated}`),
      artifactSelectionRationale: artifactMappings.map((m) => m.explanation),
      stepRationale: steps.map((s) => s.explanation),
      orderingRationale:
        "Steps follow the fixed workstream order: registrations precede ownership, lineage, resilience, governance, regeneration and validation.",
      approvalRationale: [...approvals.values()].map((a) => a.rationale).sort(byString),
      validationDerivation: checkpoints.map((c) => c.derivation),
      rollbackDerivation: rollbackPlan.stepRollbacks.map((r) => r.explanation),
      statusRationale:
        blockers.length > 0
          ? `Status is "blocked" because ${blockers.length} blocker(s) remain: ${blockers.map((b) => b.kind).join(", ")}.`
          : patches.length > 0
            ? "Status is \"ready-for-review\": every patch is specified with a resolved artifact and no blockers remain."
            : "Status is \"draft\": the plan contains no executable patches.",
      lineageStatement: `Plan derives from recommendation "${proposal.recommendationId}" (policy "${proposal.policyId}") through proposal "${proposal.id}" and simulation "${result.simulationId}" at graph hash "${canonicalGraphHash}".`,
    };

    return {
      generator: CHANGE_PLAN_GENERATOR,
      id: planId,
      version: {
        version: 1,
        materialHash,
        generator: CHANGE_PLAN_GENERATOR,
        previousMaterialHash: null,
      },
      status,
      graphVersion: this.graph.version.version,
      canonicalGraphHash,
      sourceSimulation: {
        simulationId: result.simulationId,
        canonicalGraphHash: result.canonicalGraphHashBefore,
        graphVersion: result.graphVersion,
        overlayContentHash: result.overlayContentHash,
        validationOutcome: result.validation.outcome,
        scoreBand: result.score.band,
        score: result.score.score,
      },
      sourceProposals: [
        {
          proposalId: proposal.id,
          bundleId: null,
          variant: proposal.variant,
          kind: proposal.kind,
          subject: proposal.subject,
          alternativeProposalIds: [...proposal.alternativeProposalIds].sort(byString),
          selectedFromComparisonId: null,
          changeIds: changes.map((c) => c.id).sort(byString),
        },
      ],
      sourceRecommendations: [
        {
          recommendationId: proposal.recommendationId,
          policyId: proposal.policyId,
          category: proposal.category,
          priority: proposal.priority,
          priorityScore: proposal.priorityScore,
          findingIds: planSortedUnique(proposal.sourceFindingIds),
          reasoningAnalyses: proposal.lineage.reasoningAnalyses,
        },
      ],
      scope,
      title: `${proposal.title} — controlled change plan`,
      objectives,
      workstreams: orderedWorkstreams,
      steps,
      patches: patches.sort((a, b) => byString(a.id, b.id)),
      artifactMappings,
      artifactTargets: artifactPaths(artifactMappings),
      dependencies: steps.map((s) => ({
        stepId: s.id,
        dependsOn: s.dependencies.map((d) => d.stepId),
      })),
      preconditions: patches.flatMap((p) => p.preconditions),
      postconditions: patches.flatMap((p) => p.postconditions),
      validationCheckpoints: checkpoints,
      rollbackPlan,
      executionConstraints: this.executionConstraints(patches),
      tolerances: request.tolerances ?? DEFAULT_TOLERANCES,
      risks,
      conflicts: this.planConflicts(planId, patches, request.existingPlans ?? []),
      patchConflicts,
      blockers,
      requiredApprovals: [...approvals.values()].sort((a, b) => byString(a.id, b.id)),
      approvalDecisions: [...approvals.values()]
        .map((a) => ({
          requirementId: a.id,
          state: "pending" as const,
          decidedBy: null,
          rationale: "No approval decision has been recorded by this planning layer.",
        }))
        .sort((a, b) => byString(a.requirementId, b.requirementId)),
      baselineMetrics: result.baselineMetrics,
      simulatedMetrics: result.simulatedMetrics,
      metricDeltas: result.metricDeltas,
      evidence: {
        recommendationEvidence: proposal.evidence.slice(0, 20),
        simulationEvidence: result.evidence.slice(0, 20),
        artifactEvidence: artifactMappings.flatMap((m) => m.selected?.evidence ?? []),
        metricEvidence: result.metricDeltas,
        resolutionEvidence: [
          ...result.resolvedRecommendations,
          ...result.partiallyResolvedRecommendations,
        ],
        regressionEvidence: result.regressions,
      },
      confidence: proposal.confidence,
      lineage,
      explanation,
      diagnostics: {
        notes: [
          "Planning only: no repository file, registry, manifest or graph was modified.",
          `Canonical graph hash "${canonicalGraphHash}" is unchanged by plan generation.`,
        ],
        unresolvedArtifactEntityIds: planSortedUnique(
          artifactMappings.filter((m) => !m.resolved).map((m) => m.entityId),
        ),
        unresolvedParameters: planSortedUnique(changes.flatMap((c) => c.requiredParameters)),
        skippedChangeIds,
        deterministic: true,
        repositoryImmutable: true,
        generator: CHANGE_PLAN_GENERATOR,
      },
    };
  }

  /** Generates, binds and simulates a proposal, then plans it. */
  buildPlan(proposal: ChangeProposal, request: ChangePlanRequest = {}): ChangePlan {
    const bound = request.parameters
      ? this.simulation.bind(proposal, request.parameters)
      : proposal;
    const result = this.simulation.simulateProposal(bound);
    return this.buildPlanFromSimulation(result, request);
  }

  /* ---------------------------------------------------------------------- */
  /* Derived sections                                                        */
  /* ---------------------------------------------------------------------- */

  private expectedEffects(deltas: readonly MetricDelta[]): readonly ExpectedMetricEffect[] {
    return deltas
      .filter((d) => d.direction !== "unchanged")
      .map((d) => ({
        key: d.key,
        direction: d.delta > 0 ? ("increase" as const) : d.delta < 0 ? ("decrease" as const) : ("unchanged" as const),
        baseline: d.baseline,
        simulated: d.simulated,
        delta: d.delta,
        statement: `${d.label} moves from ${d.baseline} to ${d.simulated} (${d.direction}).`,
      }))
      .sort((a, b) => byString(a.key, b.key));
  }

  private executionConstraints(patches: readonly PatchSpecification[]): readonly ExecutionConstraint[] {
    const constraints: ExecutionConstraint[] = [
      {
        kind: "requires-approval-first",
        subject: "plan",
        statement: "No patch may be applied before every mandatory approval is recorded.",
      },
      {
        kind: "requires-graph-regeneration",
        subject: "capability-graph",
        statement: "The canonical graph must be regenerated after each workstream.",
      },
    ];
    const paths = planSortedUnique(patches.flatMap((p) => (p.artifact.path ? [p.artifact.path] : [])));
    for (const path of paths) {
      const writers = patches.filter((p) => p.artifact.path === path);
      if (writers.length > 1) {
        constraints.push({
          kind: "single-artifact-writer",
          subject: path,
          statement: `${writers.length} patches write "${path}"; they must be applied sequentially by one writer.`,
        });
      }
    }
    if (patches.some((p) => p.status !== "specified")) {
      constraints.push({
        kind: "no-partial-application",
        subject: "plan",
        statement: "The plan contains blocked patches; partial application is not permitted.",
      });
    }
    return constraints.sort((a, b) => byString(a.kind, b.kind) || byString(a.subject, b.subject));
  }

  private rollbackPlan(
    materialHash: string,
    patches: readonly PatchSpecification[],
    workstreams: readonly ChangeWorkstream[],
    steps: readonly ChangeStep[],
  ): RollbackPlan {
    const reverseSteps = [...steps].sort((a, b) => b.order - a.order);
    const checkpoints: RollbackCheckpoint[] = reverseSteps.map((step, index) => ({
      id: `rchk:${pad(index + 1)}:${planSlug(step.title)}`,
      order: index + 1,
      subject: step.title,
      statement: `Reverse step ${step.order} and revalidate the graph before continuing.`,
      patchIds: [...step.patchIds].sort(byString),
      manual: step.rollback.manual,
    }));

    return {
      id: `rbp:${materialHash}`,
      stepRollbacks: patches.map((p) => p.rollback).sort((a, b) => b.order - a.order),
      workstreamRollbackOrder: [...workstreams].map((w) => w.id).reverse(),
      fullPlanRollbackOrder: reverseSteps.map((s) => s.id),
      reverseDependencyOrder: reverseSteps.map((s) => s.id),
      checkpoints,
      partialRollbackConstraints: [
        "A workstream may only be rolled back after every later workstream is rolled back.",
        "Rollback of a manual patch requires a recorded before-state.",
      ],
      manualRollbackPatchIds: planSortedUnique(
        patches.filter((p) => p.rollback.manualRollbackRequired).map((p) => p.id),
      ),
      graphRegenerationRequired: true,
      risks: patches
        .filter((p) => p.rollback.manualRollbackRequired)
        .map((p) => ({
          id: `prsk:rollback:${planHash(p.id)}`,
          classification: "high" as const,
          subject: p.selector.value,
          statement: `Patch "${p.id}" has no deterministic inverse and requires manual rollback design.`,
          entityIds: [p.selector.value],
          mitigations: ["Capture and store the full before-state before execution."],
        }))
        .sort((a, b) => byString(a.id, b.id)),
      limitations: [
        "Rollback restores declarations, not derived downstream artifacts such as generated documentation.",
      ],
    };
  }

  private blockersFor(
    patches: readonly PatchSpecification[],
    approvals: readonly ApprovalRequirement[],
    result: SimulationResult,
    canonicalGraphHash: string,
    expectedBaselineHash: string,
  ): readonly PlanBlocker[] {
    const blockers: PlanBlocker[] = [];

    if (!result.validation.executable) {
      blockers.push({
        id: `blk:invalid-proposal:${planSlug(result.proposalId)}`,
        kind: result.validation.outcome === "incomplete" ? "incomplete-proposal" : "invalid-proposal",
        subject: result.proposalId,
        statement: `Simulation validation outcome is "${result.validation.outcome}"; the proposal is not executable.`,
        resolutionOptions: ["Bind the missing parameters.", "Resolve the reported validation issues."],
      });
    }
    if (result.score.band === "not-recommended" || result.score.band === "invalid") {
      blockers.push({
        id: `blk:not-recommended-proposal:${planSlug(result.proposalId)}`,
        kind: "not-recommended-proposal",
        subject: result.proposalId,
        statement: `Proposal score band is "${result.score.band}".`,
        resolutionOptions: ["Select an alternative proposal.", "Re-simulate after resolving regressions."],
      });
    }
    if (result.score.band === "conditional") {
      blockers.push({
        id: `blk:conditional-proposal:${planSlug(result.proposalId)}`,
        kind: "conditional-proposal",
        subject: result.proposalId,
        statement: "Proposal is conditionally recommended and requires human adjudication.",
        resolutionOptions: ["Record an explicit governance decision before implementation."],
      });
    }
    for (const regression of result.regressions.filter((r) => r.severity === "critical")) {
      blockers.push({
        id: `blk:critical-regression:${planSlug(regression.subject)}`,
        kind: "critical-regression",
        subject: regression.subject,
        statement: regression.statement,
        resolutionOptions: ["Choose an alternative proposal.", "Add a compensating change and re-simulate."],
      });
    }
    for (const patch of patches.filter((p) => p.artifact.path === null)) {
      blockers.push({
        id: `blk:unresolved-artifact-mapping:${planSlug(patch.selector.value)}`,
        kind: "unresolved-artifact-mapping",
        subject: patch.selector.value,
        statement: `No authoritative artifact resolved for "${patch.selector.value}".`,
        resolutionOptions: ["Declare the artifact in the change-plan artifact catalog."],
      });
    }
    for (const patch of patches.filter((p) => p.selector.ambiguity === "ambiguous")) {
      blockers.push({
        id: `blk:ambiguous-selector:${planSlug(patch.selector.value)}`,
        kind: "ambiguous-selector",
        subject: patch.selector.value,
        statement: `Selector "${patch.selector.type}:${patch.selector.value}" matches multiple authoritative artifacts.`,
        resolutionOptions: ["Record a human artifact selection."],
      });
    }
    for (const approval of approvals.filter((a) => a.blocker)) {
      blockers.push({
        id: `blk:unresolved-approval-role:${planSlug(approval.subject)}`,
        kind: "unresolved-approval-role",
        subject: approval.subject,
        statement: approval.rationale,
        resolutionOptions: [`Declare a technical owner for "${approval.subject}" in its module manifest.`],
      });
    }
    if (canonicalGraphHash !== expectedBaselineHash) {
      blockers.push({
        id: `blk:baseline-drift:${planSlug(expectedBaselineHash)}`,
        kind: "baseline-drift",
        subject: expectedBaselineHash,
        statement: `Plan baseline "${expectedBaselineHash}" does not match the canonical hash "${canonicalGraphHash}".`,
        resolutionOptions: ["Re-simulate against the current canonical graph."],
      });
    }

    const unique = new Map(blockers.map((b) => [b.id, b]));
    return [...unique.values()].sort((a, b) => byString(a.kind, b.kind) || byString(a.id, b.id));
  }

  private planConflicts(
    planId: string,
    patches: readonly PatchSpecification[],
    existing: readonly ChangePlan[],
  ): readonly PlanConflict[] {
    const conflicts: PlanConflict[] = [];
    const targets = new Set(
      patches.map((p) => `${p.artifact.path ?? "unresolved"}|${p.selector.value}`),
    );

    for (const other of [...existing].sort((a, b) => byString(a.id, b.id))) {
      if (other.id === planId) continue;
      const shared = other.patches
        .filter((p) => targets.has(`${p.artifact.path ?? "unresolved"}|${p.selector.value}`))
        .map((p) => p.id)
        .sort(byString);
      if (shared.length === 0) continue;
      conflicts.push({
        id: `pcl:same-source-record:${planHash([planId, other.id].sort(byString).join("|"))}`,
        type: "same-source-record",
        severity: "blocking",
        planIds: [planId, other.id].sort(byString),
        patchIds: shared,
        subjects: planSortedUnique(other.patches.map((p) => p.selector.value)),
        explanation: `Plans "${planId}" and "${other.id}" both modify ${shared.length} identical source record(s).`,
        resolutionOptions: ["Supersede one plan.", "Merge the overlapping patches into one plan."],
      });
      if (other.canonicalGraphHash !== this.graph.version.contentHash) {
        conflicts.push({
          id: `pcl:baseline-hash-mismatch:${planHash(other.id)}`,
          type: "baseline-hash-mismatch",
          severity: "warning",
          planIds: [other.id],
          patchIds: [],
          subjects: [other.canonicalGraphHash],
          explanation: `Existing plan "${other.id}" was built against hash "${other.canonicalGraphHash}".`,
          resolutionOptions: ["Re-simulate the older plan against the current canonical graph."],
        });
      }
    }

    return conflicts.sort((a, b) => byString(a.type, b.type) || byString(a.id, b.id));
  }

  /* ---------------------------------------------------------------------- */
  /* Drift, comparison, implementation validation                            */
  /* ---------------------------------------------------------------------- */

  detectDrift(plan: ChangePlan, currentCanonicalHash?: string): DriftReport {
    const observed = currentCanonicalHash ?? this.graph.version.contentHash;
    const findings: DriftFinding[] = [];

    if (observed !== plan.canonicalGraphHash) {
      findings.push({
        id: `drf:canonical-hash-changed:${planSlug(plan.canonicalGraphHash)}`,
        kind: "canonical-hash-changed",
        subject: "capability-graph",
        expected: plan.canonicalGraphHash,
        observed,
        classification: "resimulation-required",
        statement: "The canonical graph changed after the plan was generated.",
      });
    }
    for (const mapping of plan.artifactMappings.filter((m) => !m.resolved)) {
      findings.push({
        id: `drf:selector-unresolved:${planSlug(mapping.entityId)}`,
        kind: "selector-unresolved",
        subject: mapping.entityId,
        expected: "resolved authoritative artifact",
        observed: "unresolved",
        classification: "review-required",
        statement: mapping.explanation,
      });
    }

    const rank: Record<DriftFinding["classification"], number> = {
      none: 0,
      nonmaterial: 1,
      "review-required": 2,
      "resimulation-required": 3,
      "plan-invalidated": 4,
    };
    const classification = findings.reduce<DriftFinding["classification"]>(
      (worst, f) => (rank[f.classification] > rank[worst] ? f.classification : worst),
      "none",
    );

    return {
      planId: plan.id,
      classification,
      findings: findings.sort((a, b) => byString(a.kind, b.kind) || byString(a.id, b.id)),
      explanation:
        findings.length === 0
          ? "No drift detected: the plan still matches the canonical graph and its artifact mappings."
          : `${findings.length} drift finding(s); the plan is classified "${classification}".`,
    };
  }

  compareImplementation(
    plan: ChangePlan,
    observed: SimulationMetrics,
    incidentalChanges = 0,
  ): ImplementationComparison {
    const comparisons: ToleranceComparison[] = [];
    const criticalRegressionKeys: string[] = [];

    for (const rule of [...plan.tolerances].sort((a, b) => byString(a.key, b.key))) {
      const approvedValue =
        rule.key === "incidentalChanges" ? 0 : metricValue(plan.simulatedMetrics, rule.key);
      const observedValue =
        rule.key === "incidentalChanges" ? incidentalChanges : metricValue(observed, rule.key);

      if (approvedValue === null || observedValue === null) {
        comparisons.push({
          key: rule.key,
          approved: 0,
          observed: 0,
          delta: 0,
          allowed: 0,
          outcome: "invalid-comparison",
          statement: `Metric "${rule.key}" is not numerically comparable.`,
        });
        continue;
      }

      const delta = Math.round((observedValue - approvedValue) * 1e6) / 1e6;
      const allowed = rule.absolute + Math.abs(approvedValue) * rule.relative;
      const higherIsBetter =
        rule.key === "ownershipResolutionRate" ||
        rule.key === "routeTraceabilityRate";
      const worse = higherIsBetter ? delta < 0 : delta > 0;

      let outcome: ComparisonOutcome;
      if (delta === 0) outcome = "exact-match";
      else if (Math.abs(delta) <= allowed) outcome = "within-tolerance";
      else if (worse && rule.regressionProhibited) outcome = "regression";
      else outcome = "material-deviation";

      if (outcome === "regression") criticalRegressionKeys.push(rule.key);

      comparisons.push({
        key: rule.key,
        approved: approvedValue,
        observed: observedValue,
        delta,
        allowed,
        outcome,
        statement: `${rule.key}: approved ${approvedValue}, observed ${observedValue} (allowed ±${allowed}) → ${outcome}.`,
      });
    }

    const outcome: ComparisonOutcome = criticalRegressionKeys.length > 0
      ? "regression"
      : comparisons.some((c) => c.outcome === "material-deviation")
        ? "material-deviation"
        : comparisons.some((c) => c.outcome === "invalid-comparison")
          ? "invalid-comparison"
          : comparisons.every((c) => c.outcome === "exact-match")
            ? "exact-match"
            : "within-tolerance";

    return {
      outcome,
      comparisons,
      criticalRegressionKeys: planSortedUnique(criticalRegressionKeys),
      explanation:
        outcome === "regression"
          ? `Implementation regressed on ${criticalRegressionKeys.length} prohibited metric(s).`
          : `Implementation outcome is "${outcome}" across ${comparisons.length} tolerance rule(s).`,
    };
  }

  comparePlans(plans: readonly ChangePlan[]): PlanComparison {
    const ordered = [...plans].sort((a, b) => byString(a.id, b.id));
    const ids = ordered.map((p) => p.id);
    const pathSets = ordered.map((p) => new Set(p.artifactTargets));
    const allPaths = planSortedUnique(ordered.flatMap((p) => [...p.artifactTargets]));
    const shared = allPaths.filter((path) => pathSets.every((set) => set.has(path)));
    const divergent = allPaths.filter((path) => !pathSets.every((set) => set.has(path)));

    return {
      id: `pcmp:${planHash(ids.join("|"))}`,
      planIds: ids,
      identical:
        ordered.length > 1 &&
        planSortedUnique(ordered.map((p) => p.version.materialHash)).length === 1,
      sharedArtifactPaths: shared,
      divergentArtifactPaths: divergent,
      statusDifferences: ordered.map((p) => ({ planId: p.id, status: p.status })),
      conflicts: ordered.flatMap((p) => p.conflicts).sort((a, b) => byString(a.id, b.id)),
      explanation: `${ordered.length} plans compared: ${shared.length} shared artifact path(s), ${divergent.length} divergent.`,
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Factories                                                                   */
/* -------------------------------------------------------------------------- */

let cached: GraphChangePlanEngine | null = null;

export const createChangePlanEngine = (input: ChangePlanEngineInput = {}): GraphChangePlanEngine =>
  new GraphChangePlanEngine(input);

export function getChangePlanEngine(): GraphChangePlanEngine {
  if (!cached) cached = new GraphChangePlanEngine();
  return cached;
}

export function __resetChangePlanEngineCache(): void {
  cached = null;
}
