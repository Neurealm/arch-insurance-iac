/**
 * Stage 3.5.4.4 — Change Review Readiness presentation model.
 *
 * `buildReviewPackage` is a *presentation-model constructor*, not an engine.
 * It groups, counts and explains results that the Change Plan Engine and the
 * Simulation Engine have already produced. It:
 *
 *  - never generates a proposal, runs a validation, runs a simulation or
 *    builds a second change plan;
 *  - never mutates the canonical graph, a registry, a manifest or a file;
 *  - never records, implies or enables an approval decision;
 *  - is pure and deterministic: identical inputs produce an identical package.
 *
 * The canonical plan status remains authoritative throughout. Nothing here
 * can promote a blocked plan, and there is no aggregate readiness score.
 */

import type {
  ApprovalRequirement,
  ApprovalRole,
  ArtifactMapping,
  ChangePlan,
  ChangeStep,
  ChangeWorkstream,
  DriftReport,
  PatchSpecification,
  PlanBlocker,
  RollbackPlan,
  ToleranceRule,
  ValidationCheckpoint,
} from "@/modules/graph/change-plan/index";
import type { ChangeProposal, SimulationResult } from "@/modules/graph/simulation/index";
import type { IntelligenceRecommendation } from "@/modules/graph/intelligence/index";
import type { EligibilityVerdict } from "../remediation/eligibility";
import { buildGateMatrix, summarizeGates, type GateMatrixSummary, type ReadinessGate } from "./gateMatrix";

/* -------------------------------------------------------------- evidence */

/** Where the rendered plan came from. Fixtures are always labelled. */
export type EvidenceSource = "real-graph" | "fixture";

export const FIXTURE_EVIDENCE_LABEL = "Fixture — not derived from the repository graph";
export const REPOSITORY_EVIDENCE_LABEL = "Derived from the canonical repository graph";

/* -------------------------------------------------------------- blockers */

export type BlockerSeverity = "critical" | "high" | "medium";

/**
 * Severity per canonical blocker kind. Fixed and declarative: severity is a
 * property of the blocker taxonomy, never of how many happen to be present.
 */
export const BLOCKER_SEVERITY: Readonly<Record<PlanBlocker["kind"], BlockerSeverity>> = {
  "invalid-proposal": "critical",
  "critical-regression": "critical",
  "baseline-drift": "critical",
  "conflicting-proposal": "high",
  "unresolved-artifact-mapping": "high",
  "unresolved-approval-role": "high",
  "ambiguous-selector": "high",
  "incomplete-proposal": "medium",
  "not-recommended-proposal": "medium",
  "conditional-proposal": "medium",
};

const SEVERITY_RANK: Readonly<Record<BlockerSeverity, number>> = {
  critical: 0,
  high: 1,
  medium: 2,
};

/** Canonical resolution guidance per blocker kind. */
export const BLOCKER_RESOLUTION: Readonly<Record<PlanBlocker["kind"], string>> = {
  "invalid-proposal": "Revise or discard the proposal; an invalid proposal cannot be planned.",
  "critical-regression": "Revise the proposal so the simulated graph no longer regresses.",
  "baseline-drift": "Re-run the simulation against the current canonical graph and regenerate the plan.",
  "conflicting-proposal": "Choose between the conflicting proposals before planning either of them.",
  "unresolved-artifact-mapping":
    "A human must select the authoritative repository artifact for the affected entity.",
  "unresolved-approval-role":
    "Record an owner for the role in the module manifest or registry so the engine can resolve it.",
  "ambiguous-selector": "Disambiguate the target selector so the patch matches exactly one target.",
  "incomplete-proposal": "Supply the required parameter values and regenerate the plan.",
  "not-recommended-proposal": "The engine does not recommend this proposal; consider an alternative.",
  "conditional-proposal": "Satisfy the stated condition, or accept it explicitly during review.",
};

export interface BlockerGroup {
  kind: PlanBlocker["kind"];
  severity: BlockerSeverity;
  count: number;
  blockers: readonly PlanBlocker[];
  /** Workstream ids whose steps carry a patch naming one of these blockers. */
  affectedWorkstreamIds: readonly string[];
  affectedStepIds: readonly string[];
  affectedPatchIds: readonly string[];
  /** Artifact paths, or mapping ids where the artifact is unresolved. */
  affectedArtifacts: readonly string[];
  explanation: string;
  requiredResolution: string;
  evidence: readonly string[];
}

export interface BlockerAnalysis {
  totalBlockers: number;
  totalCategories: number;
  highestSeverity: BlockerSeverity | null;
  /** Categories tied for the largest count, in canonical severity order. */
  dominantKinds: readonly PlanBlocker["kind"][];
  groups: readonly BlockerGroup[];
}

function analyzeBlockers(plan: ChangePlan): BlockerAnalysis {
  const byKind = new Map<PlanBlocker["kind"], PlanBlocker[]>();
  for (const blocker of plan.blockers) {
    const bucket = byKind.get(blocker.kind);
    if (bucket) bucket.push(blocker);
    else byKind.set(blocker.kind, [blocker]);
  }

  const stepById = new Map(plan.steps.map((s) => [s.id, s] as const));

  const groups: BlockerGroup[] = [...byKind.entries()]
    .map(([kind, blockers]) => {
      const ids = new Set(blockers.map((b) => b.id));
      const patches = plan.patches.filter((p) => p.blockers.some((id) => ids.has(id)));
      const stepIds = [...new Set(patches.map((p) => p.stepId))].filter((id) => stepById.has(id));
      const workstreamIds = [
        ...new Set(stepIds.map((id) => stepById.get(id)!.workstreamId)),
      ];
      const artifacts = [
        ...new Set(patches.map((p) => p.artifact.path ?? `unresolved:${p.id}`)),
      ];
      const severity = BLOCKER_SEVERITY[kind] ?? "medium";
      return {
        kind,
        severity,
        count: blockers.length,
        blockers,
        affectedWorkstreamIds: workstreamIds,
        affectedStepIds: stepIds,
        affectedPatchIds: patches.map((p) => p.id),
        affectedArtifacts: artifacts,
        explanation: blockers[0]?.statement ?? kind,
        requiredResolution:
          BLOCKER_RESOLUTION[kind] ?? blockers[0]?.resolutionOptions[0] ?? "Resolve the condition.",
        evidence: blockers.slice(0, 10).map((b) => b.id),
      } satisfies BlockerGroup;
    })
    // Deterministic: most severe first, then largest, then alphabetical.
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
        b.count - a.count ||
        a.kind.localeCompare(b.kind),
    );

  const maxCount = groups.reduce((max, g) => Math.max(max, g.count), 0);

  return {
    totalBlockers: plan.blockers.length,
    totalCategories: groups.length,
    highestSeverity: groups[0]?.severity ?? null,
    dominantKinds: groups.filter((g) => g.count === maxCount && maxCount > 0).map((g) => g.kind),
    groups,
  };
}

/* ------------------------------------------------------ artifact mappings */

export type MappingCategory =
  | "authoritative-resolved"
  | "multiple-candidates"
  | "unresolved"
  | "human-selection-required";

export const MAPPING_CATEGORY_LABEL: Readonly<Record<MappingCategory, string>> = {
  "authoritative-resolved": "Authoritative mapping resolved",
  "multiple-candidates": "Multiple candidate mappings",
  unresolved: "Unresolved mapping",
  "human-selection-required": "Human selection required",
};

export interface MappingView {
  mapping: ArtifactMapping;
  category: MappingCategory;
  /** Patch specifications whose artifact derives from this mapping's entity. */
  relatedPatchIds: readonly string[];
  relatedWorkstreamIds: readonly string[];
}

export interface MappingGroup {
  category: MappingCategory;
  label: string;
  count: number;
  mappings: readonly MappingView[];
}

export interface MappingSummary {
  total: number;
  resolved: number;
  candidates: number;
  unresolved: number;
  humanSelectionRequired: number;
  /**
   * Resolved ÷ total, expressed as a whole percentage. `null` when the plan
   * declares no mapping — a percentage is never inferred from an empty set or
   * from categories that do not share a denominator.
   */
  completenessPercent: number | null;
}

/** Deterministic classification. Order matters: the first match wins. */
function categorizeMapping(mapping: ArtifactMapping): MappingCategory {
  if (mapping.humanSelectionRequired) return "human-selection-required";
  if (mapping.multipleCandidates) return "multiple-candidates";
  if (mapping.resolved && mapping.selected) return "authoritative-resolved";
  return "unresolved";
}

const MAPPING_CATEGORY_ORDER: readonly MappingCategory[] = [
  "unresolved",
  "human-selection-required",
  "multiple-candidates",
  "authoritative-resolved",
];

function analyzeMappings(plan: ChangePlan): {
  groups: readonly MappingGroup[];
  summary: MappingSummary;
  views: readonly MappingView[];
} {
  const stepById = new Map(plan.steps.map((s) => [s.id, s] as const));

  const views: MappingView[] = plan.artifactMappings.map((mapping) => {
    const patches = plan.patches.filter(
      (p) =>
        (mapping.selected?.path != null && p.artifact.path === mapping.selected.path) ||
        p.lineage.nodeIds.includes(mapping.entityId),
    );
    const workstreamIds = [
      ...new Set(
        patches
          .map((p) => stepById.get(p.stepId)?.workstreamId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    return {
      mapping,
      category: categorizeMapping(mapping),
      relatedPatchIds: patches.map((p) => p.id),
      relatedWorkstreamIds: workstreamIds,
    };
  });

  const groups = MAPPING_CATEGORY_ORDER.map((category) => {
    const mappings = views.filter((v) => v.category === category);
    return {
      category,
      label: MAPPING_CATEGORY_LABEL[category],
      count: mappings.length,
      mappings,
    } satisfies MappingGroup;
  }).filter((g) => g.count > 0);

  const total = plan.artifactMappings.length;
  const resolved = plan.artifactMappings.filter((m) => m.resolved).length;

  return {
    groups,
    views,
    summary: {
      total,
      resolved,
      candidates: plan.artifactMappings.filter((m) => m.multipleCandidates).length,
      unresolved: plan.artifactMappings.filter((m) => !m.resolved).length,
      humanSelectionRequired: plan.artifactMappings.filter((m) => m.humanSelectionRequired).length,
      completenessPercent: total === 0 ? null : Math.round((resolved / total) * 100),
    },
  };
}

/* --------------------------------------------------------- approvals */

export const APPROVAL_ROLE_LABEL: Readonly<Record<ApprovalRole, string>> = {
  "module-owner": "Module owner",
  "capability-owner": "Capability owner",
  "platform-owner": "Platform owner",
  "architecture-reviewer": "Architecture reviewer",
  "graph-governance-reviewer": "Graph governance reviewer",
  "security-reviewer": "Security reviewer",
  "repository-maintainer": "Repository maintainer",
};

export const UNRESOLVED_ROLE_TEXT = "Approval role unresolved";

export interface ApprovalView {
  requirement: ApprovalRequirement;
  role: ApprovalRole;
  roleLabel: string;
  /** True only when the engine or registry data already names a person. */
  resolved: boolean;
  /** The engine's assignee verbatim, or the canonical unresolved text. */
  assigneeText: string;
  blocking: boolean;
  affectedEntityIds: readonly string[];
  affectedArtifacts: readonly string[];
}

export interface ApprovalRoleGroup {
  role: ApprovalRole;
  roleLabel: string;
  count: number;
  resolved: number;
  unresolved: number;
  requirements: readonly ApprovalView[];
}

export interface ApprovalSummary {
  total: number;
  resolved: number;
  unresolved: number;
  blocking: number;
  byRole: readonly { role: ApprovalRole; roleLabel: string; count: number }[];
}

function analyzeApprovals(plan: ChangePlan): {
  views: readonly ApprovalView[];
  groups: readonly ApprovalRoleGroup[];
  summary: ApprovalSummary;
} {
  const views: ApprovalView[] = plan.requiredApprovals.map((requirement) => {
    const resolved = requirement.assigneeSource !== "unresolved" && Boolean(requirement.assignee);
    const workstreams = plan.workstreams.filter((w) =>
      w.requiredApprovalIds.includes(requirement.id),
    );
    return {
      requirement,
      role: requirement.role,
      roleLabel: APPROVAL_ROLE_LABEL[requirement.role] ?? requirement.role,
      resolved,
      assigneeText: resolved ? requirement.assignee! : UNRESOLVED_ROLE_TEXT,
      blocking: requirement.blocker,
      affectedEntityIds: requirement.evidence.flatMap((e) => e.nodeIds ?? []),
      affectedArtifacts: [...new Set(workstreams.flatMap((w) => w.artifactPaths))],
    };
  });

  const roles = [...new Set(views.map((v) => v.role))].sort((a, b) => a.localeCompare(b));
  const groups = roles.map((role) => {
    const requirements = views.filter((v) => v.role === role);
    return {
      role,
      roleLabel: APPROVAL_ROLE_LABEL[role] ?? role,
      count: requirements.length,
      resolved: requirements.filter((r) => r.resolved).length,
      unresolved: requirements.filter((r) => !r.resolved).length,
      requirements,
    } satisfies ApprovalRoleGroup;
  });

  return {
    views,
    groups,
    summary: {
      total: views.length,
      resolved: views.filter((v) => v.resolved).length,
      unresolved: views.filter((v) => !v.resolved).length,
      blocking: views.filter((v) => v.blocking).length,
      byRole: groups.map((g) => ({ role: g.role, roleLabel: g.roleLabel, count: g.count })),
    },
  };
}

/* ---------------------------------------------------------- evidence */

export interface EvidenceItem {
  /** Canonical identifier, preserved verbatim from the engine result. */
  id: string;
  statement: string;
  detail: string | null;
}

export interface EvidenceSection {
  id: string;
  title: string;
  items: readonly EvidenceItem[];
}

function buildEvidenceSections(
  plan: ChangePlan,
  simulation: SimulationResult | null,
  recommendation: IntelligenceRecommendation | null,
): readonly EvidenceSection[] {
  const sections: EvidenceSection[] = [];

  sections.push({
    id: "intelligence-recommendation",
    title: "Intelligence recommendation",
    items: plan.sourceRecommendations.map((r) => ({
      id: r.recommendationId,
      statement: recommendation?.id === r.recommendationId ? recommendation.title : r.category,
      detail: `Policy ${r.policyId} · priority ${r.priority} (${r.priorityScore}) · ${r.findingIds.length} finding(s)`,
    })),
  });

  sections.push({
    id: "intelligence-policy",
    title: "Intelligence policy",
    items: [...new Set(plan.sourceRecommendations.map((r) => r.policyId))].map((policyId) => ({
      id: policyId,
      statement: `Policy ${policyId} generated the initiating recommendation.`,
      detail: null,
    })),
  });

  sections.push({
    id: "reasoning-findings",
    title: "Reasoning findings",
    items: plan.sourceRecommendations
      .flatMap((r) => r.findingIds)
      .map((id) => ({ id, statement: `Reasoning finding ${id}.`, detail: null })),
  });

  sections.push({
    id: "query-evidence",
    title: "Query evidence",
    items: plan.evidence.recommendationEvidence.map((e, i) => ({
      id: `${e.kind}:${e.subject}:${i}`,
      statement: e.statement,
      detail: `${e.kind} · confidence ${e.confidence}${e.candidate ? " · candidate relationship" : ""}`,
    })),
  });

  sections.push({
    id: "simulation-proposal",
    title: "Simulation proposal",
    items: plan.sourceProposals.map((p) => ({
      id: p.proposalId,
      statement: `${p.kind} on ${p.subject} (variant ${p.variant}).`,
      detail: `${p.changeIds.length} change(s)${p.bundleId ? ` · bundle ${p.bundleId}` : ""}`,
    })),
  });

  sections.push({
    id: "proposal-validation",
    title: "Proposal validation",
    items: [
      {
        id: plan.sourceSimulation.simulationId,
        statement: `Validation outcome “${plan.sourceSimulation.validationOutcome}”.`,
        detail: `Score band ${plan.sourceSimulation.scoreBand} (${plan.sourceSimulation.score}).`,
      },
    ],
  });

  sections.push({
    id: "simulation-result",
    title: "Simulation result",
    items: [
      {
        id: plan.sourceSimulation.simulationId,
        statement: `Simulation executed against canonical graph ${plan.sourceSimulation.canonicalGraphHash}.`,
        detail: `Overlay ${plan.sourceSimulation.overlayContentHash} · graph version ${plan.sourceSimulation.graphVersion}`,
      },
    ],
  });

  sections.push({
    id: "metric-deltas",
    title: "Metric deltas",
    items: plan.evidence.metricEvidence.map((m) => ({
      id: m.key,
      statement: `${m.label}: ${m.baseline} → ${m.simulated} (${m.delta >= 0 ? "+" : ""}${m.delta}).`,
      detail: `Direction ${m.direction}${m.higherIsBetter ? " · higher is better" : ""}`,
    })),
  });

  sections.push({
    id: "recommendation-resolutions",
    title: "Recommendation-resolution results",
    items: plan.evidence.resolutionEvidence.map((r) => ({
      id: r.recommendationId,
      statement: `${r.classification}: ${r.explanation}`,
      detail: r.remainingWork.length > 0 ? `Remaining work: ${r.remainingWork.join("; ")}` : null,
    })),
  });

  sections.push({
    id: "regression-findings",
    title: "Regression findings",
    items: plan.evidence.regressionEvidence.map((r) => ({
      id: r.id,
      statement: r.statement,
      detail: `${r.severity} · ${r.kind} · ${r.reversible ? "reversible" : "not reversible"}`,
    })),
  });

  sections.push({
    id: "residual-risks",
    title: "Residual risks",
    items: (simulation?.residualRisks ?? []).map((risk, i) => ({
      id: (risk as { id?: string }).id ?? `risk:${i}`,
      statement: (risk as { statement?: string }).statement ?? String(risk),
      detail: (risk as { classification?: string }).classification ?? null,
    })),
  });

  sections.push({
    id: "change-plan-evidence",
    title: "Change-plan evidence",
    items: plan.evidence.simulationEvidence.map((e, i) => ({
      id: `${e.kind}:${e.subject}:${i}`,
      statement: e.statement,
      detail: `${e.kind} · confidence ${e.confidence}`,
    })),
  });

  sections.push({
    id: "artifact-mapping-evidence",
    title: "Artifact-mapping evidence",
    items: plan.evidence.artifactEvidence.map((e, i) => ({
      id: `${e.kind}:${e.subject}:${i}`,
      statement: e.statement,
      detail: `${e.kind} · confidence ${e.confidence}`,
    })),
  });

  sections.push({
    id: "approval-requirement-evidence",
    title: "Approval-requirement evidence",
    items: plan.requiredApprovals.flatMap((a) =>
      a.evidence.map((e, i) => ({
        id: `${a.id}:${i}`,
        statement: e.statement,
        detail: `${a.role} · ${a.assigneeSource}`,
      })),
    ),
  });

  sections.push({
    id: "graph-lineage",
    title: "Graph lineage",
    items: [
      {
        id: plan.lineage.canonicalGraphHash,
        statement: `Canonical graph ${plan.lineage.canonicalGraphHash} at version ${plan.lineage.graphVersion}.`,
        detail: `${plan.lineage.nodeIds.length} node(s), ${plan.lineage.edgeIds.length} edge(s) referenced.`,
      },
      {
        id: plan.lineage.overlayContentHash,
        statement: `Simulation overlay ${plan.lineage.overlayContentHash}.`,
        detail: null,
      },
    ],
  });

  sections.push({
    id: "source-lineage",
    title: "Source lineage",
    items: [
      ...plan.lineage.recommendationIds.map((id) => ({
        id,
        statement: `Recommendation ${id}.`,
        detail: null,
      })),
      ...plan.lineage.policyIds.map((id) => ({ id, statement: `Policy ${id}.`, detail: null })),
      ...plan.lineage.proposalIds.map((id) => ({ id, statement: `Proposal ${id}.`, detail: null })),
      ...plan.lineage.simulationIds.map((id) => ({
        id,
        statement: `Simulation ${id}.`,
        detail: null,
      })),
    ],
  });

  return sections;
}

/* -------------------------------------------------------- validation */

export type CheckpointKindLabel = "repository-command" | "rule-only" | "manual";

export interface CheckpointView {
  checkpoint: ValidationCheckpoint;
  /** How the checkpoint is satisfied. Never invents a command. */
  requirementKind: CheckpointKindLabel;
  dependencyStepIds: readonly string[];
  expectedOutcome: string;
}

export interface ValidationReadiness {
  checkpoints: readonly CheckpointView[];
  total: number;
  withCommand: number;
  ruleOnly: number;
  manual: number;
  blocking: number;
  tolerances: readonly ToleranceRule[];
}

function analyzeValidation(plan: ChangePlan): ValidationReadiness {
  const checkpoints: CheckpointView[] = plan.validationCheckpoints.map((checkpoint) => ({
    checkpoint,
    requirementKind: checkpoint.command
      ? "repository-command"
      : checkpoint.rule
        ? "rule-only"
        : "manual",
    dependencyStepIds: checkpoint.appliesToStepIds,
    expectedOutcome: checkpoint.blocking
      ? "Must pass. A failure blocks the change."
      : "Should pass. A failure is recorded for review.",
  }));
  return {
    checkpoints,
    total: checkpoints.length,
    withCommand: checkpoints.filter((c) => c.requirementKind === "repository-command").length,
    ruleOnly: checkpoints.filter((c) => c.requirementKind === "rule-only").length,
    manual: checkpoints.filter((c) => c.requirementKind === "manual").length,
    blocking: checkpoints.filter((c) => c.checkpoint.blocking).length,
    tolerances: plan.tolerances,
  };
}

/* ---------------------------------------------------------- rollback */

export type RollbackReadinessLevel =
  | "fully-specified"
  | "partially-specified"
  | "manual-design-required"
  | "blocked";

export const ROLLBACK_READINESS_LABEL: Readonly<Record<RollbackReadinessLevel, string>> = {
  "fully-specified": "Fully specified",
  "partially-specified": "Partially specified",
  "manual-design-required": "Manual design required",
  blocked: "Blocked",
};

export interface RollbackReadiness {
  plan: RollbackPlan;
  level: RollbackReadinessLevel;
  statement: string;
  stepRollbackCount: number;
  workstreamRollbackCount: number;
  fullPlanRollbackCount: number;
  manualRollbackCount: number;
  reverseDependencyOrder: readonly string[];
  graphRegenerationRequired: boolean;
  postRollbackValidation: readonly string[];
}

function analyzeRollback(plan: ChangePlan): RollbackReadiness {
  const rollback = plan.rollbackPlan;
  const manual = rollback.manualRollbackPatchIds.length;
  const total = rollback.stepRollbacks.length;

  const level: RollbackReadinessLevel =
    plan.patches.length > 0 && rollback.fullPlanRollbackOrder.length === 0
      ? "blocked"
      : manual > 0 && manual === total && total > 0
        ? "manual-design-required"
        : manual > 0
          ? "partially-specified"
          : "fully-specified";

  return {
    plan: rollback,
    level,
    statement:
      level === "fully-specified"
        ? "Every patch has a deterministic reverse operation and an ordered position in the rollback sequence."
        : level === "partially-specified"
          ? `${manual} of ${total} patch rollbacks require a manually designed reversal.`
          : level === "manual-design-required"
            ? "No patch in this plan has a deterministic inverse; the entire rollback must be designed manually."
            : "The plan specifies patches but carries no ordered rollback, so it cannot be reversed as specified.",
    stepRollbackCount: total,
    workstreamRollbackCount: rollback.workstreamRollbackOrder.length,
    fullPlanRollbackCount: rollback.fullPlanRollbackOrder.length,
    manualRollbackCount: manual,
    reverseDependencyOrder: rollback.reverseDependencyOrder,
    graphRegenerationRequired: rollback.graphRegenerationRequired,
    postRollbackValidation: [
      ...new Set(rollback.stepRollbacks.flatMap((r) => r.validationRequirements)),
    ],
  };
}

/* -------------------------------------------------------- workstreams */

export type WorkstreamReadiness = "ready" | "blocked" | "warning" | "not-applicable";

export interface WorkstreamView {
  workstream: ChangeWorkstream;
  readiness: WorkstreamReadiness;
  rationale: string;
  steps: readonly ChangeStep[];
  patchIds: readonly string[];
  blockerIds: readonly string[];
  unresolvedApprovalIds: readonly string[];
  parallelizableStepCount: number;
}

function analyzeWorkstreams(plan: ChangePlan): readonly WorkstreamView[] {
  const unresolvedApprovalIds = new Set(
    plan.requiredApprovals.filter((a) => !a.assignee || a.assigneeSource === "unresolved").map((a) => a.id),
  );

  return plan.workstreams.map((workstream) => {
    const steps = plan.steps.filter((s) => workstream.stepIds.includes(s.id));
    const patches = plan.patches.filter((p) => steps.some((s) => s.id === p.stepId));
    const blockerIds = [...new Set(patches.flatMap((p) => p.blockers))];
    const unresolved = workstream.requiredApprovalIds.filter((id) => unresolvedApprovalIds.has(id));
    const unmetPrecondition = workstream.preconditions.some((p) => !p.satisfied);

    const readiness: WorkstreamReadiness =
      steps.length === 0
        ? "not-applicable"
        : blockerIds.length > 0 || unresolved.length > 0
          ? "blocked"
          : unmetPrecondition || workstream.risks.some((r) => r.classification === "critical")
            ? "warning"
            : "ready";

    return {
      workstream,
      readiness,
      rationale:
        readiness === "blocked"
          ? `${blockerIds.length} patch blocker(s) and ${unresolved.length} unresolved approval role(s) affect this workstream.`
          : readiness === "warning"
            ? "This workstream carries an unmet precondition or a critical risk that a reviewer must accept."
            : readiness === "not-applicable"
              ? "This workstream contributes no execution step."
              : "Every step, patch and approval requirement in this workstream is satisfied.",
      steps,
      patchIds: patches.map((p) => p.id),
      blockerIds,
      unresolvedApprovalIds: unresolved,
      parallelizableStepCount: steps.filter((s) => s.parallelizable).length,
    };
  });
}

/* ------------------------------------------------------------ summary */

export const READINESS_CONCLUSION: Readonly<Record<ChangePlan["status"], string>> = {
  blocked:
    "This plan is not ready for formal approval. Resolve the listed blockers before submitting it for review.",
  draft: "This plan remains in draft and requires completion before formal approval review.",
  "ready-for-review":
    "This plan satisfies the current Change Plan Engine readiness requirements and may proceed to a governed approval workflow.",
};

export interface ReviewSummary {
  planId: string;
  planStatus: ChangePlan["status"];
  evidenceSource: EvidenceSource;
  recommendationId: string | null;
  recommendationTitle: string | null;
  proposalId: string | null;
  simulationId: string;
  canonicalGraphHash: string;
  overlayHash: string;
  workstreamCount: number;
  stepCount: number;
  patchCount: number;
  blockerCount: number;
  mapping: MappingSummary;
  approval: ApprovalSummary;
  validation: { total: number; blocking: number; withCommand: number };
  rollback: { level: RollbackReadinessLevel; label: string };
  highestRisk: string;
  conclusion: string;
}

/* ------------------------------------------------------------ package */

export interface ReviewPackageInput {
  plan: ChangePlan;
  drift: DriftReport | null;
  simulation: SimulationResult | null;
  recommendation: IntelligenceRecommendation | null;
  proposal: ChangeProposal | null;
  canonicalGraphHash: string;
  simulationStale: boolean;
  planStale: boolean;
  proposalEligibility: EligibilityVerdict;
  evidenceSource?: EvidenceSource;
}

export interface ReviewPackage {
  summary: ReviewSummary;
  gates: readonly ReadinessGate[];
  gateSummary: GateMatrixSummary;
  blockers: BlockerAnalysis;
  mappingGroups: readonly MappingGroup[];
  mappingViews: readonly MappingView[];
  mappingSummary: MappingSummary;
  approvals: readonly ApprovalView[];
  approvalGroups: readonly ApprovalRoleGroup[];
  approvalSummary: ApprovalSummary;
  evidenceSections: readonly EvidenceSection[];
  validation: ValidationReadiness;
  rollback: RollbackReadiness;
  patches: readonly PatchSpecification[];
  workstreams: readonly WorkstreamView[];
  drift: DriftReport | null;
  /** Always true. Asserted by tests as a structural read-only guarantee. */
  readOnly: true;
}

const RISK_RANK: Readonly<Record<string, number>> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

/**
 * Constructs the review presentation model from results that already exist.
 * Calls no engine, and produces no second plan.
 */
export function buildReviewPackage(input: ReviewPackageInput): ReviewPackage {
  const {
    plan,
    drift,
    simulation,
    recommendation,
    proposal,
    canonicalGraphHash,
    simulationStale,
    planStale,
    proposalEligibility,
    evidenceSource = "real-graph",
  } = input;

  const gates = buildGateMatrix({
    plan,
    drift,
    simulation,
    simulationStale,
    planStale,
    proposalEligibility,
    canonicalGraphHash,
  });
  const blockers = analyzeBlockers(plan);
  const mapping = analyzeMappings(plan);
  const approvals = analyzeApprovals(plan);
  const validation = analyzeValidation(plan);
  const rollback = analyzeRollback(plan);
  const workstreams = analyzeWorkstreams(plan);

  const highestRisk =
    [...plan.risks].sort(
      (a, b) => (RISK_RANK[a.classification] ?? 9) - (RISK_RANK[b.classification] ?? 9),
    )[0] ?? null;

  const summary: ReviewSummary = {
    planId: plan.id,
    planStatus: plan.status,
    evidenceSource,
    recommendationId: plan.sourceRecommendations[0]?.recommendationId ?? recommendation?.id ?? null,
    recommendationTitle: recommendation?.title ?? null,
    proposalId: plan.sourceProposals[0]?.proposalId ?? proposal?.id ?? null,
    simulationId: plan.sourceSimulation.simulationId,
    canonicalGraphHash: plan.canonicalGraphHash,
    overlayHash: plan.lineage.overlayContentHash,
    workstreamCount: plan.workstreams.length,
    stepCount: plan.steps.length,
    patchCount: plan.patches.length,
    blockerCount: plan.blockers.length,
    mapping: mapping.summary,
    approval: approvals.summary,
    validation: {
      total: validation.total,
      blocking: validation.blocking,
      withCommand: validation.withCommand,
    },
    rollback: { level: rollback.level, label: ROLLBACK_READINESS_LABEL[rollback.level] },
    highestRisk: highestRisk
      ? `${highestRisk.classification}: ${highestRisk.statement}`
      : "No plan-level risk was recorded.",
    conclusion: READINESS_CONCLUSION[plan.status] ?? READINESS_CONCLUSION.blocked,
  };

  return {
    summary,
    gates,
    gateSummary: summarizeGates(gates),
    blockers,
    mappingGroups: mapping.groups,
    mappingViews: mapping.views,
    mappingSummary: mapping.summary,
    approvals: approvals.views,
    approvalGroups: approvals.groups,
    approvalSummary: approvals.summary,
    evidenceSections: buildEvidenceSections(plan, simulation, recommendation),
    validation,
    rollback,
    patches: plan.patches,
    workstreams,
    drift,
    readOnly: true,
  };
}

/* ------------------------------------------------------------- copy */

export const NO_PACKAGE_MESSAGE =
  "No current review package is available in this browser session. Return to the Remediation Workspace, validate a proposal, run a simulation, and generate a change-plan preview.";

export const REVIEW_READ_ONLY_NOTICE =
  "This review experience is read-only. It shows whether a change plan is ready to enter formal review; it records no approval decision, waives no blocker, resolves no artifact mapping and applies no patch.";

export const REVIEW_PACKAGE_PREPARED_ANNOUNCEMENT = (pkg: ReviewPackage): string =>
  `Review package prepared for plan ${pkg.summary.planId}. Status ${pkg.summary.planStatus}. ` +
  `${pkg.gateSummary.blocked} of ${pkg.gateSummary.total} readiness gates are blocked. ` +
  `${pkg.summary.blockerCount} blocker${pkg.summary.blockerCount === 1 ? "" : "s"} recorded.`;
