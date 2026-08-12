/**
 * Stage 3.5.4.3.1 — remediation workflow eligibility policy.
 *
 * Pure, side-effect free and engine-derived. Nothing here re-implements
 * validation: every verdict is a projection of the Simulation Engine's own
 * `ValidationResult` (canonically, its `executable` flag and `outcome` token)
 * plus the workspace's own freshness bookkeeping.
 *
 * The workspace uses these verdicts twice, deliberately:
 *   1. to decide whether a control is offered, and to explain it when it is not;
 *   2. inside the action handler itself, so a stale render, a programmatic call
 *      or a resurrected DOM node can never reach an engine it is not allowed to.
 */

import type {
  ChangeProposal,
  ProposalConflict,
  SimulationResult,
  ValidationResult,
} from "@/modules/graph/simulation/index";
import type { ChangePlan } from "@/modules/graph/change-plan/index";

/* ------------------------------------------------------------------ codes */

export type EligibilityCode =
  | "eligible"
  | "no-proposal"
  | "busy"
  | "not-validated"
  | "stale-validation"
  | "validation-mismatch"
  | "unresolved-parameters"
  | "incomplete"
  | "conflicting"
  | "invalid"
  | "not-executable"
  | "no-simulation"
  | "stale-simulation"
  | "critical-regression"
  | "graph-hash-mismatch"
  | "too-few-alternatives"
  | "too-many-alternatives"
  | "ineligible-alternatives";

export interface EligibilityVerdict {
  /** True only when every gate passes. Never inferred from presence alone. */
  eligible: boolean;
  code: EligibilityCode;
  /** Operator-facing explanation. Always populated, including when eligible. */
  reason: string;
}

const verdict = (code: EligibilityCode, reason: string): EligibilityVerdict => ({
  eligible: code === "eligible",
  code,
  reason,
});

/** Baseline copy used whenever the engine offers nothing more specific. */
export const SIMULATION_GATE_NOTICE =
  "Simulation is unavailable until the proposal passes validation and all required parameters are resolved.";

/* ------------------------------------------------- simulation eligibility */

export interface SimulationEligibilityInput {
  proposal: ChangeProposal | null;
  /** Engine validation of exactly this proposal, or null when never run. */
  validation: ValidationResult | null;
  /** True when an input changed after the validation was produced. */
  validationStale: boolean;
  /** Engine-reported required parameters that still carry no value. */
  unresolvedParameters: readonly string[];
  /** Conflicts the engine detected across the generated proposal set. */
  conflicts: readonly ProposalConflict[];
  /** True while any engine call is in flight. */
  busy: boolean;
}

/**
 * Canonical answer to "may this proposal be simulated?".
 *
 * Order matters: the operator is told the *first* thing they must fix, not a
 * generic refusal.
 */
export function evaluateSimulationEligibility(
  input: SimulationEligibilityInput,
): EligibilityVerdict {
  const { proposal, validation, validationStale, unresolvedParameters, conflicts, busy } = input;

  if (!proposal) {
    return verdict("no-proposal", "Select a proposal before running a simulation.");
  }
  if (busy) {
    return verdict("busy", "An engine call is already running. Wait for it to finish.");
  }
  if (!validation) {
    return verdict(
      "not-validated",
      "This proposal has not been validated yet. Run “Validate proposal” first — the workspace never validates on your behalf.",
    );
  }
  if (validation.proposalId !== proposal.id) {
    return verdict(
      "validation-mismatch",
      "The validation on screen describes a different proposal. Re-validate the current selection.",
    );
  }
  if (validationStale) {
    return verdict(
      "stale-validation",
      "Parameters changed after this proposal was validated. Re-validate before simulating.",
    );
  }
  if (unresolvedParameters.length > 0) {
    return verdict(
      "unresolved-parameters",
      `Required parameter${unresolvedParameters.length === 1 ? "" : "s"} still unresolved: ${unresolvedParameters.join(", ")}.`,
    );
  }

  // A "simultaneous-alternatives" conflict describes variants that are
  // mutually exclusive *if applied together*. Simulating one of them in
  // isolation is exactly how an operator chooses between them, so it is not
  // a blocker here — it is a blocker for the comparison stage instead.
  const blockingConflict = conflicts.find(
    (c) =>
      c.severity === "blocking" &&
      c.type !== "simultaneous-alternatives" &&
      c.proposalIds.includes(proposal.id),
  );

  if (blockingConflict) {
    return verdict(
      "conflicting",
      `Blocked by a ${blockingConflict.type} conflict with another proposed change: ${blockingConflict.explanation}`,
    );
  }

  switch (validation.outcome) {
    case "incomplete":
      return verdict(
        "incomplete",
        `The engine classified this proposal as incomplete${
          validation.missingParameters.length > 0
            ? ` (missing: ${validation.missingParameters.join(", ")})`
            : ""
        }. Incomplete proposals cannot be simulated.`,
      );
    case "conflicting":
      return verdict(
        "conflicting",
        "The engine classified this proposal as conflicting. Conflicting proposals cannot be simulated.",
      );
    case "invalid":
      return verdict(
        "invalid",
        "The engine classified this proposal as invalid. Invalid proposals cannot be simulated.",
      );
    default:
      break;
  }

  // The engine's own executability flag is the last word, so a future outcome
  // token the UI has never heard of still cannot slip past this gate.
  if (!validation.executable) {
    return verdict(
      "not-executable",
      `The engine does not mark this proposal executable (outcome “${validation.outcome}”). It cannot be simulated.`,
    );
  }

  return verdict(
    "eligible",
    validation.outcome === "valid-with-warnings"
      ? "The engine marked this proposal executable with warnings. It may be simulated."
      : "The engine marked this proposal valid and executable. It may be simulated.",
  );
}

/* ------------------------------------------------ comparison eligibility */

/** Engine-supported bounds for an executable alternative comparison. */
export const MIN_COMPARISON_ALTERNATIVES = 2;
export const MAX_COMPARISON_ALTERNATIVES = 4;

export interface AlternativeEligibility {
  proposalId: string;
  /** Validation of this alternative, or null when it has not been assessed. */
  validation: ValidationResult | null;
  verdict: EligibilityVerdict;
}

/**
 * Per-alternative eligibility. An alternative that has not been assessed is
 * reported as `not-validated` rather than optimistically assumed eligible.
 */
export function evaluateAlternativeEligibility(
  alternatives: readonly ChangeProposal[],
  validations: Readonly<Record<string, ValidationResult>>,
  conflicts: readonly ProposalConflict[],
  unresolvedFor: (proposal: ChangeProposal) => readonly string[],
): readonly AlternativeEligibility[] {
  return alternatives.map((proposal) => {
    const validation = validations[proposal.id] ?? null;
    return {
      proposalId: proposal.id,
      validation,
      verdict: evaluateSimulationEligibility({
        proposal,
        validation,
        validationStale: false,
        unresolvedParameters: validation ? unresolvedFor(proposal) : [],
        conflicts,
        busy: false,
      }),
    };
  });
}

export interface ComparisonEligibilityInput {
  /** Alternatives the operator ticked for comparison. */
  selectedIds: readonly string[];
  eligibility: readonly AlternativeEligibility[];
  /** True while any engine call is in flight. */
  busy: boolean;
}

/**
 * Whether the comparison engine may be invoked. Ineligible selections are
 * rejected *before* the engine is reached, and every rejection is named.
 */
export function evaluateComparisonEligibility(
  input: ComparisonEligibilityInput,
): EligibilityVerdict {
  const { selectedIds, eligibility, busy } = input;
  if (busy) {
    return verdict("busy", "An engine call is already running. Wait for it to finish.");
  }
  if (selectedIds.length > MAX_COMPARISON_ALTERNATIVES) {
    return verdict(
      "too-many-alternatives",
      `Select at most ${MAX_COMPARISON_ALTERNATIVES} alternatives; ${selectedIds.length} are selected.`,
    );
  }

  const byId = new Map(eligibility.map((e) => [e.proposalId, e]));
  const rejected = selectedIds
    .map((id) => byId.get(id))
    .filter((e): e is AlternativeEligibility => Boolean(e) && !e!.verdict.eligible);

  if (rejected.length > 0) {
    return verdict(
      "ineligible-alternatives",
      `${rejected.length} selected alternative${rejected.length === 1 ? " is" : "s are"} not comparable: ${rejected
        .map((r) => `${r.proposalId} — ${r.verdict.reason}`)
        .join(" ")}`,
    );
  }
  if (selectedIds.length < MIN_COMPARISON_ALTERNATIVES) {
    return verdict(
      "too-few-alternatives",
      `Select at least ${MIN_COMPARISON_ALTERNATIVES} comparable alternatives; ${selectedIds.length} ${
        selectedIds.length === 1 ? "is" : "are"
      } selected.`,
    );
  }
  return verdict(
    "eligible",
    `${selectedIds.length} comparable alternatives selected. Each is simulated on its own isolated overlay.`,
  );
}

/* ------------------------------------------------ change-plan eligibility */

export interface ChangePlanEligibilityInput {
  simulation: SimulationResult | null;
  simulationStale: boolean;
  /** The simulation eligibility of the proposal the plan would describe. */
  proposalEligibility: EligibilityVerdict;
  /** Canonical hash the workspace engines report right now. */
  canonicalGraphHash: string;
  busy: boolean;
}

/**
 * Whether the change-plan engine may be invoked. This is intentionally
 * stricter than "a simulation object exists".
 */
export function evaluateChangePlanEligibility(
  input: ChangePlanEligibilityInput,
): EligibilityVerdict {
  const { simulation, simulationStale, proposalEligibility, canonicalGraphHash, busy } = input;

  if (busy) {
    return verdict("busy", "An engine call is already running. Wait for it to finish.");
  }
  if (!simulation) {
    return verdict(
      "no-simulation",
      "Run a simulation first: a change plan is derived from a simulation result, never from a proposal alone.",
    );
  }
  if (simulationStale) {
    return verdict(
      "stale-simulation",
      "The inputs changed after this simulation ran. Re-run the simulation before planning.",
    );
  }
  if (!proposalEligibility.eligible && proposalEligibility.code !== "busy") {
    return verdict(
      proposalEligibility.code,
      `The proposal is no longer eligible: ${proposalEligibility.reason}`,
    );
  }
  if (
    simulation.canonicalGraphHashAfter !== canonicalGraphHash ||
    simulation.canonicalGraphHashBefore !== canonicalGraphHash
  ) {
    return verdict(
      "graph-hash-mismatch",
      `The simulation was produced against canonical graph ${simulation.canonicalGraphHashBefore}, but the workspace now reports ${canonicalGraphHash}. Re-run the simulation.`,
    );
  }
  const critical = simulation.regressions.filter((r) => r.severity === "critical");
  if (critical.length > 0) {
    return verdict(
      "critical-regression",
      `The simulation produced ${critical.length} unresolved critical regression${
        critical.length === 1 ? "" : "s"
      }. Planning is blocked until the proposal no longer regresses the graph.`,
    );
  }
  return verdict("eligible", "The simulation is current and the change-plan engine accepts it.");
}

/* ------------------------------------------------- blocker summarisation */

/** Readiness criteria the change-plan engine applies, stated for the operator. */
export const PLAN_READINESS_CRITERIA: readonly string[] = [
  "Every blocker is resolved — a single blocker forces the status to “blocked”.",
  "Every patch resolves to a known repository artifact.",
  "Every required approval role resolves to an owner.",
  "At least one executable patch is specified, otherwise the plan is a draft.",
];

/**
 * A single, short, spoken summary of why the workflow is currently blocked.
 *
 * Never enumerates every blocker: a real plan can carry more than fifty, and
 * reading them aloud is hostile. The visible panel keeps the full detail.
 */
export function summarizePlanBlockers(plan: ChangePlan | null): string {
  if (!plan || plan.blockers.length === 0) return "";
  const kinds = [...new Set(plan.blockers.map((b) => b.kind))];
  const shown = kinds.slice(0, 3).join(", ");
  const remainder = kinds.length > 3 ? `, and ${kinds.length - 3} other kind${kinds.length - 3 === 1 ? "" : "s"}` : "";
  return `Change plan blocked by ${plan.blockers.length} condition${
    plan.blockers.length === 1 ? "" : "s"
  }, including ${shown}${remainder}.`;
}

export interface BlockerSummaryInput {
  simulationEligibility: EligibilityVerdict;
  comparisonEligibility: EligibilityVerdict;
  planEligibility: EligibilityVerdict;
  plan: ChangePlan | null;
}

/**
 * Codes that mean "you have not got there yet" rather than "you are blocked".
 * Announcing these would nag the operator at every step of a workflow they are
 * calmly working through, so they are deliberately silent.
 */
const NOT_YET_REACHED: ReadonlySet<EligibilityCode> = new Set<EligibilityCode>([
  "busy",
  "no-proposal",
  "not-validated",
  "no-simulation",
  "too-few-alternatives",
]);

const isRealBlocker = (v: EligibilityVerdict): boolean =>
  !v.eligible && !NOT_YET_REACHED.has(v.code);

/**
 * The one blocker worth announcing, chosen deterministically: a produced plan's
 * blockers first (the operator has already spent the work), then the gate the
 * operator is standing in front of.
 */
export function summarizeWorkflowBlocker(input: BlockerSummaryInput): string {
  const planBlockers = summarizePlanBlockers(input.plan);
  if (planBlockers) return planBlockers;
  if (isRealBlocker(input.simulationEligibility)) {
    return `Simulation blocked. ${input.simulationEligibility.reason}`;
  }
  if (isRealBlocker(input.planEligibility)) {
    return `Change plan blocked. ${input.planEligibility.reason}`;
  }
  if (isRealBlocker(input.comparisonEligibility)) {
    return `Alternative comparison blocked. ${input.comparisonEligibility.reason}`;
  }
  return "";
}


export const BLOCKERS_CLEARED_ANNOUNCEMENT =
  "The workflow is no longer blocked. The next step is available.";
