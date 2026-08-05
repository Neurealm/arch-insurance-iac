/**
 * Stage 3.5.4.4 — Review readiness gate matrix.
 *
 * Pure, deterministic and derived. Every gate is a projection of the Change
 * Plan Engine's own result (plus the workspace's freshness bookkeeping); no
 * gate re-implements engine logic, and no combination of gates ever overrides
 * `plan.status`, which remains the single authoritative readiness verdict.
 *
 * There is deliberately no aggregate "readiness score": a summed number would
 * let a UI arithmetic accident promote a blocked plan.
 */

import type {
  ChangePlan,
  DriftReport,
  PlanBlocker,
} from "@/modules/graph/change-plan/index";
import type { SimulationResult } from "@/modules/graph/simulation/index";
import type { EligibilityVerdict } from "../remediation/eligibility";

export type GateStatus = "passed" | "blocked" | "warning" | "not-applicable";

export interface ReadinessGate {
  /** Stable, canonical gate identifier. Used as the test hook and the anchor. */
  id: string;
  name: string;
  status: GateStatus;
  /** Why the gate reached this status. Always populated. */
  rationale: string;
  /** Canonical `PlanBlocker` ids that caused a blocked status. */
  blockerIds: readonly string[];
  /** Canonical identifiers or measured counts supporting the rationale. */
  evidence: readonly string[];
  /** What must happen next. "None required." when the gate has passed. */
  nextAction: string;
}

/** The canonical gate order. Never re-sorted for presentation. */
export const READINESS_GATE_IDS = [
  "plan-status",
  "proposal-eligibility",
  "simulation-currency",
  "canonical-hash-match",
  "critical-regression",
  "artifact-mapping-completeness",
  "approval-role-completeness",
  "required-parameter-completeness",
  "validation-checkpoint-definition",
  "rollback-plan-completeness",
  "patch-specification-completeness",
  "target-selector-completeness",
  "precondition-completeness",
  "postcondition-completeness",
  "evidence-completeness",
  "lineage-completeness",
] as const;

export type ReadinessGateId = (typeof READINESS_GATE_IDS)[number];

export interface GateMatrixInput {
  plan: ChangePlan;
  drift: DriftReport | null;
  simulation: SimulationResult | null;
  simulationStale: boolean;
  planStale: boolean;
  /** The workspace's own eligibility verdict for the underlying proposal. */
  proposalEligibility: EligibilityVerdict;
  /** Canonical hash the Capability Intelligence surfaces report right now. */
  canonicalGraphHash: string;
}

const NONE = "None required.";

const blockersOfKind = (plan: ChangePlan, kind: PlanBlocker["kind"]): readonly string[] =>
  plan.blockers.filter((b) => b.kind === kind).map((b) => b.id);

/**
 * Builds the deterministic readiness matrix for a change plan.
 *
 * The result is stable for identical inputs: nothing here reads a clock,
 * randomises, sorts non-deterministically or calls an engine.
 */
export function buildGateMatrix(input: GateMatrixInput): readonly ReadinessGate[] {
  const {
    plan,
    drift,
    simulation,
    simulationStale,
    planStale,
    proposalEligibility,
    canonicalGraphHash,
  } = input;

  const gates: ReadinessGate[] = [];

  /* ------------------------------------------------------- 1. plan status */

  gates.push(
    plan.status === "ready-for-review"
      ? {
          id: "plan-status",
          name: "Plan status",
          status: "passed",
          rationale: `The Change Plan Engine emitted “ready-for-review”. ${plan.explanation.statusRationale}`,
          blockerIds: [],
          evidence: [plan.id, `status=${plan.status}`],
          nextAction: NONE,
        }
      : plan.status === "blocked"
        ? {
            id: "plan-status",
            name: "Plan status",
            status: "blocked",
            rationale: `The Change Plan Engine emitted “blocked” with ${plan.blockers.length} unresolved condition${
              plan.blockers.length === 1 ? "" : "s"
            }. ${plan.explanation.statusRationale}`,
            blockerIds: plan.blockers.map((b) => b.id),
            evidence: [plan.id, `status=${plan.status}`, `blockers=${plan.blockers.length}`],
            nextAction:
              "Resolve every listed blocker and regenerate the change-plan preview in the Remediation Workspace.",
          }
        : {
            id: "plan-status",
            name: "Plan status",
            status: "warning",
            rationale: `The Change Plan Engine emitted “draft”. ${plan.explanation.statusRationale}`,
            blockerIds: [],
            evidence: [plan.id, `status=${plan.status}`, `patches=${plan.patches.length}`],
            nextAction:
              "A draft plan specifies no executable patch. Complete the plan before formal approval review.",
          },
  );

  /* ----------------------------------------------- 2. proposal eligibility */

  gates.push({
    id: "proposal-eligibility",
    name: "Proposal eligibility",
    status: proposalEligibility.eligible ? "passed" : "blocked",
    rationale: proposalEligibility.reason,
    blockerIds: proposalEligibility.eligible
      ? []
      : [
          ...blockersOfKind(plan, "invalid-proposal"),
          ...blockersOfKind(plan, "incomplete-proposal"),
          ...blockersOfKind(plan, "conflicting-proposal"),
          ...blockersOfKind(plan, "not-recommended-proposal"),
          ...blockersOfKind(plan, "conditional-proposal"),
        ],
    evidence: plan.sourceProposals.map((p) => p.proposalId),
    nextAction: proposalEligibility.eligible
      ? NONE
      : "Return to the Remediation Workspace and re-validate the proposal.",
  });

  /* ------------------------------------------------- 3. simulation currency */

  gates.push(
    !simulation
      ? {
          id: "simulation-currency",
          name: "Simulation currency",
          status: "blocked",
          rationale:
            "No simulation is present in this browser session, so the plan cannot be traced to a simulated outcome.",
          blockerIds: [],
          evidence: [plan.sourceSimulation.simulationId],
          nextAction: "Run a simulation in the Remediation Workspace.",
        }
      : simulationStale || planStale
        ? {
            id: "simulation-currency",
            name: "Simulation currency",
            status: "warning",
            rationale: simulationStale
              ? "The workflow inputs changed after this simulation ran, so the plan may no longer describe the current selection."
              : "The workflow inputs changed after this plan was generated.",
            blockerIds: [],
            evidence: [plan.sourceSimulation.simulationId, `stale=${simulationStale ? "simulation" : "plan"}`],
            nextAction:
              "Re-run the simulation and regenerate the change-plan preview before submitting for review.",
          }
        : {
            id: "simulation-currency",
            name: "Simulation currency",
            status: "passed",
            rationale: `The plan was derived from simulation ${plan.sourceSimulation.simulationId}, which is current for the selected proposal.`,
            blockerIds: [],
            evidence: [
              plan.sourceSimulation.simulationId,
              `outcome=${plan.sourceSimulation.validationOutcome}`,
              `band=${plan.sourceSimulation.scoreBand}`,
            ],
            nextAction: NONE,
          },
  );

  /* --------------------------------------------------- 4. canonical hash */

  const hashMatches = plan.canonicalGraphHash === canonicalGraphHash;
  const driftHashFindings = (drift?.findings ?? []).filter(
    (f) => f.kind === "canonical-hash-changed" || f.kind === "baseline-mismatch",
  );
  gates.push({
    id: "canonical-hash-match",
    name: "Canonical graph hash match",
    status: hashMatches && driftHashFindings.length === 0 ? "passed" : "blocked",
    rationale: hashMatches
      ? driftHashFindings.length === 0
        ? `The plan baseline ${plan.canonicalGraphHash} matches the canonical graph the workspace reports.`
        : `The plan baseline matches, but drift detection reported ${driftHashFindings.length} baseline finding${
            driftHashFindings.length === 1 ? "" : "s"
          }.`
      : `The plan was built against canonical graph ${plan.canonicalGraphHash}, but the workspace now reports ${canonicalGraphHash}.`,
    blockerIds: blockersOfKind(plan, "baseline-drift"),
    evidence: [
      `plan=${plan.canonicalGraphHash}`,
      `workspace=${canonicalGraphHash}`,
      ...driftHashFindings.map((f) => f.id),
    ],
    nextAction:
      hashMatches && driftHashFindings.length === 0
        ? NONE
        : "Re-run the simulation against the current canonical graph and regenerate the plan.",
  });

  /* ------------------------------------------------- 5. critical regression */

  const criticalRegressions = (simulation?.regressions ?? []).filter(
    (r) => r.severity === "critical",
  );
  gates.push({
    id: "critical-regression",
    name: "Critical regression",
    status: criticalRegressions.length > 0 ? "blocked" : "passed",
    rationale:
      criticalRegressions.length > 0
        ? `The simulation produced ${criticalRegressions.length} critical regression${
            criticalRegressions.length === 1 ? "" : "s"
          }. A plan carrying a critical regression may not enter approval review.`
        : simulation
          ? "The simulation produced no critical regression."
          : "No simulation is present in this session; regression status is taken from the plan's own evidence.",
    blockerIds: blockersOfKind(plan, "critical-regression"),
    evidence: criticalRegressions.map((r) => r.id),
    nextAction:
      criticalRegressions.length > 0
        ? "Revise the proposal so the graph no longer regresses, then re-simulate."
        : NONE,
  });

  /* ------------------------------------------- 6. artifact mapping coverage */

  const mappings = plan.artifactMappings;
  const resolvedMappings = mappings.filter((m) => m.resolved);
  const unresolvedMappings = mappings.filter((m) => !m.resolved);
  gates.push({
    id: "artifact-mapping-completeness",
    name: "Artifact mapping completeness",
    status:
      mappings.length === 0
        ? "not-applicable"
        : unresolvedMappings.length > 0
          ? "blocked"
          : "passed",
    rationale:
      mappings.length === 0
        ? "This plan declares no artifact mapping, so there is nothing to resolve."
        : `${resolvedMappings.length} of ${mappings.length} artifact mapping${
            mappings.length === 1 ? "" : "s"
          } resolve to a known repository artifact.`,
    blockerIds: blockersOfKind(plan, "unresolved-artifact-mapping"),
    evidence: unresolvedMappings.slice(0, 10).map((m) => m.id),
    nextAction:
      unresolvedMappings.length > 0
        ? "A human must select the authoritative artifact for each unresolved mapping. This experience never resolves a mapping."
        : NONE,
  });

  /* ------------------------------------------- 7. approval role completeness */

  const approvals = plan.requiredApprovals;
  const unresolvedApprovals = approvals.filter((a) => a.assigneeSource === "unresolved" || !a.assignee);
  gates.push({
    id: "approval-role-completeness",
    name: "Approval role completeness",
    status:
      approvals.length === 0
        ? "not-applicable"
        : unresolvedApprovals.length > 0
          ? "blocked"
          : "passed",
    rationale:
      approvals.length === 0
        ? "The engine derived no approval requirement for this plan."
        : `${approvals.length - unresolvedApprovals.length} of ${approvals.length} required approval role${
            approvals.length === 1 ? "" : "s"
          } resolve to an owner recorded in graph or registry data.`,
    blockerIds: blockersOfKind(plan, "unresolved-approval-role"),
    evidence: unresolvedApprovals.slice(0, 10).map((a) => a.id),
    nextAction:
      unresolvedApprovals.length > 0
        ? "Record an owner for each unresolved role in the module manifest or registry. No person is ever assigned here."
        : NONE,
  });

  /* --------------------------------------------- 8. required parameters */

  const missingParameters = plan.diagnostics.unresolvedParameters;
  gates.push({
    id: "required-parameter-completeness",
    name: "Required parameter completeness",
    status: missingParameters.length > 0 ? "blocked" : "passed",
    rationale:
      missingParameters.length > 0
        ? `${missingParameters.length} required parameter${
            missingParameters.length === 1 ? " remains" : "s remain"
          } unresolved: ${missingParameters.join(", ")}.`
        : "Every parameter the engine requires carries a value.",
    blockerIds: blockersOfKind(plan, "incomplete-proposal"),
    evidence: missingParameters,
    nextAction:
      missingParameters.length > 0
        ? "Supply the missing parameter values in the Remediation Workspace and regenerate the plan."
        : NONE,
  });

  /* ----------------------------------------- 9. validation checkpoints */

  const checkpoints = plan.validationCheckpoints;
  const blockingCheckpoints = checkpoints.filter((c) => c.blocking);
  gates.push({
    id: "validation-checkpoint-definition",
    name: "Validation checkpoint definition",
    status:
      plan.steps.length === 0
        ? "not-applicable"
        : checkpoints.length === 0
          ? "blocked"
          : blockingCheckpoints.length === 0
            ? "warning"
            : "passed",
    rationale:
      plan.steps.length === 0
        ? "This plan specifies no execution step, so no validation checkpoint is required."
        : checkpoints.length === 0
          ? "The plan specifies execution steps but no validation checkpoint."
          : `${checkpoints.length} validation checkpoint${checkpoints.length === 1 ? "" : "s"} defined, ${blockingCheckpoints.length} of which ${
              blockingCheckpoints.length === 1 ? "is" : "are"
            } blocking.`,
    blockerIds: [],
    evidence: checkpoints.slice(0, 10).map((c) => c.id),
    nextAction:
      checkpoints.length === 0 && plan.steps.length > 0
        ? "Regenerate the plan; a plan with steps must carry validation checkpoints."
        : blockingCheckpoints.length === 0 && checkpoints.length > 0
          ? "Confirm during review that no blocking validation is expected for this change class."
          : NONE,
  });

  /* --------------------------------------------- 10. rollback completeness */

  const rollback = plan.rollbackPlan;
  const manualRollbacks = rollback.manualRollbackPatchIds;
  gates.push({
    id: "rollback-plan-completeness",
    name: "Rollback plan completeness",
    status:
      plan.patches.length === 0
        ? "not-applicable"
        : rollback.fullPlanRollbackOrder.length === 0
          ? "blocked"
          : manualRollbacks.length > 0
            ? "warning"
            : "passed",
    rationale:
      plan.patches.length === 0
        ? "This plan specifies no patch, so no rollback is required."
        : rollback.fullPlanRollbackOrder.length === 0
          ? "The plan specifies patches but carries no ordered full-plan rollback."
          : `${rollback.fullPlanRollbackOrder.length} ordered reversal${
              rollback.fullPlanRollbackOrder.length === 1 ? "" : "s"
            } are specified; ${manualRollbacks.length} patch rollback${
              manualRollbacks.length === 1 ? "" : "s"
            } require manual design.`,
    blockerIds: [],
    evidence: [rollback.id, `manual=${manualRollbacks.length}`],
    nextAction:
      rollback.fullPlanRollbackOrder.length === 0 && plan.patches.length > 0
        ? "Regenerate the plan; a rollback order is mandatory before approval."
        : manualRollbacks.length > 0
          ? "A reviewer must confirm the manual rollback design for the listed patches."
          : NONE,
  });

  /* ---------------------------------------- 11. patch specification coverage */

  const blockedPatches = plan.patches.filter((p) => p.status !== "specified");
  gates.push({
    id: "patch-specification-completeness",
    name: "Patch specification completeness",
    status:
      plan.patches.length === 0
        ? "not-applicable"
        : blockedPatches.length > 0
          ? "blocked"
          : "passed",
    rationale:
      plan.patches.length === 0
        ? "This plan specifies no patch. A plan with no executable patch remains a draft."
        : `${plan.patches.length - blockedPatches.length} of ${plan.patches.length} patch specification${
            plan.patches.length === 1 ? " is" : "s are"
          } fully specified.`,
    blockerIds: blockedPatches.flatMap((p) => p.blockers),
    evidence: blockedPatches.slice(0, 10).map((p) => p.id),
    nextAction:
      blockedPatches.length > 0
        ? "Each blocked patch names its own blocker. Resolve those before review."
        : NONE,
  });

  /* --------------------------------------------- 12. target selectors */

  const badSelectors = plan.patches.filter((p) => p.selector.ambiguity !== "unambiguous");
  gates.push({
    id: "target-selector-completeness",
    name: "Target selector completeness",
    status:
      plan.patches.length === 0
        ? "not-applicable"
        : badSelectors.length > 0
          ? "blocked"
          : "passed",
    rationale:
      plan.patches.length === 0
        ? "This plan specifies no patch, so no target selector is required."
        : `${plan.patches.length - badSelectors.length} of ${plan.patches.length} target selector${
            plan.patches.length === 1 ? " is" : "s are"
          } unambiguous.`,
    blockerIds: blockersOfKind(plan, "ambiguous-selector"),
    evidence: badSelectors.slice(0, 10).map((p) => `${p.id}:${p.selector.ambiguity}`),
    nextAction:
      badSelectors.length > 0
        ? "A human must disambiguate each selector before the patch can be reviewed."
        : NONE,
  });

  /* ------------------------------------------------ 13/14. pre/postconditions */

  const unsatisfiedPlanningPreconditions = plan.preconditions.filter(
    (p) => p.checkable === "planning-time" && p.satisfied === false,
  );
  gates.push({
    id: "precondition-completeness",
    name: "Precondition completeness",
    status:
      plan.preconditions.length === 0
        ? "not-applicable"
        : unsatisfiedPlanningPreconditions.length > 0
          ? "blocked"
          : "passed",
    rationale:
      plan.preconditions.length === 0
        ? "This plan declares no precondition."
        : `${plan.preconditions.length} precondition${
            plan.preconditions.length === 1 ? "" : "s"
          } declared; ${unsatisfiedPlanningPreconditions.length} planning-time precondition${
            unsatisfiedPlanningPreconditions.length === 1 ? " is" : "s are"
          } currently unsatisfied.`,
    blockerIds: [],
    evidence: plan.preconditions.slice(0, 10).map((p) => `${p.kind}:${p.subject}`),
    nextAction:
      unsatisfiedPlanningPreconditions.length > 0
        ? "Satisfy the unmet planning-time preconditions before review; execution-time preconditions are checked at execution."
        : NONE,
  });

  gates.push({
    id: "postcondition-completeness",
    name: "Postcondition completeness",
    status:
      plan.patches.length === 0
        ? "not-applicable"
        : plan.postconditions.length === 0
          ? "blocked"
          : "passed",
    rationale:
      plan.patches.length === 0
        ? "This plan specifies no patch, so no postcondition is required."
        : `${plan.postconditions.length} postcondition${
            plan.postconditions.length === 1 ? "" : "s"
          } state what must hold once the change is applied.`,
    blockerIds: [],
    evidence: plan.postconditions.slice(0, 10).map((p) => `${p.kind}:${p.subject}`),
    nextAction:
      plan.patches.length > 0 && plan.postconditions.length === 0
        ? "Regenerate the plan; a patched plan must declare postconditions."
        : NONE,
  });

  /* --------------------------------------------------- 15. evidence */

  const evidenceCount =
    plan.evidence.recommendationEvidence.length +
    plan.evidence.simulationEvidence.length +
    plan.evidence.artifactEvidence.length +
    plan.evidence.metricEvidence.length +
    plan.evidence.resolutionEvidence.length +
    plan.evidence.regressionEvidence.length;
  gates.push({
    id: "evidence-completeness",
    name: "Evidence completeness",
    status: evidenceCount === 0 ? "blocked" : "passed",
    rationale:
      evidenceCount === 0
        ? "The plan carries no supporting evidence, so no reviewer can trace its conclusions."
        : `${evidenceCount} evidence record${evidenceCount === 1 ? "" : "s"} support this plan across recommendation, simulation, artifact, metric, resolution and regression sources.`,
    blockerIds: [],
    evidence: [
      `recommendation=${plan.evidence.recommendationEvidence.length}`,
      `simulation=${plan.evidence.simulationEvidence.length}`,
      `artifact=${plan.evidence.artifactEvidence.length}`,
      `metric=${plan.evidence.metricEvidence.length}`,
      `resolution=${plan.evidence.resolutionEvidence.length}`,
      `regression=${plan.evidence.regressionEvidence.length}`,
    ],
    nextAction: evidenceCount === 0 ? "Regenerate the plan from a current simulation." : NONE,
  });

  /* ---------------------------------------------------- 16. lineage */

  const lineage = plan.lineage;
  const lineageComplete =
    lineage.canonicalGraphHash.length > 0 &&
    lineage.overlayContentHash.length > 0 &&
    lineage.proposalIds.length > 0 &&
    lineage.simulationIds.length > 0 &&
    lineage.recommendationIds.length > 0;
  gates.push({
    id: "lineage-completeness",
    name: "Lineage completeness",
    status: lineageComplete ? "passed" : "warning",
    rationale: lineageComplete
      ? "The plan traces to its recommendation, proposal, simulation, overlay and canonical graph baseline."
      : "The plan's lineage is missing at least one canonical reference, so full traceability cannot be demonstrated.",
    blockerIds: [],
    evidence: [
      `graph=${lineage.canonicalGraphHash}`,
      `overlay=${lineage.overlayContentHash}`,
      ...lineage.recommendationIds.slice(0, 4),
      ...lineage.proposalIds.slice(0, 4),
      ...lineage.simulationIds.slice(0, 4),
    ],
    nextAction: lineageComplete
      ? NONE
      : "Regenerate the plan so every canonical lineage reference is present.",
  });

  return gates;
}

export interface GateMatrixSummary {
  total: number;
  passed: number;
  blocked: number;
  warning: number;
  notApplicable: number;
  /** Gate ids that are blocked, in canonical order. */
  blockedGateIds: readonly string[];
}

export function summarizeGates(gates: readonly ReadinessGate[]): GateMatrixSummary {
  return {
    total: gates.length,
    passed: gates.filter((g) => g.status === "passed").length,
    blocked: gates.filter((g) => g.status === "blocked").length,
    warning: gates.filter((g) => g.status === "warning").length,
    notApplicable: gates.filter((g) => g.status === "not-applicable").length,
    blockedGateIds: gates.filter((g) => g.status === "blocked").map((g) => g.id),
  };
}
