/**
 * Stage 3.5.4.3.1 — Remediation workflow gating.
 *
 * These tests drive the real page, the real provider and the real panels
 * against a stand-in engine pair. That is deliberate: the gates being proven
 * here are workflow gates, and a stand-in engine lets every validation
 * classification, every failure and every retry path be reached in
 * milliseconds, with an exact call count for each engine method.
 *
 * The engine's own behaviour over the real 1,291-node graph is proven in
 * `remediationWorkspace.test.tsx` and `remediationPlanStatus.test.tsx`.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import type {
  ChangeProposal,
  ProposalConflict,
  SimulationResult,
  ValidationOutcome,
  ValidationResult,
} from "@/modules/graph/simulation/index";
import type { ChangePlan } from "@/modules/graph/change-plan/index";
import type { IntelligenceRecommendation } from "@/modules/graph/intelligence/index";

/* ---------------------------------------------------------------- fixtures */

const RECOMMENDATION = {
  id: "rec:TEST:subject",
  title: "Restore ownership for the test subject",
  summary: "The test subject has no accountable owner.",
  priority: "medium",
  priorityScore: 50,
  severity: "critical",
  category: "ownership",
  remediation: { complexity: "low", steps: [], effort: "low" },
  affected: {
    nodeIds: ["node:a"],
    routeIds: [],
    moduleIds: [],
    capabilityIds: [],
    serviceIds: [],
    platformIds: [],
  },
} as unknown as IntelligenceRecommendation;


function makeProposal(id: string, overrides: Partial<ChangeProposal> = {}): ChangeProposal {
  return {
    id,
    kind: "ownership-declaration",
    variant: "primary",
    alternativeProposalIds: [],
    title: `Proposal ${id}`,
    summary: `Summary for ${id}`,
    subject: "node:a",
    category: "ownership",
    priority: "medium",
    priorityScore: 50,
    recommendationId: RECOMMENDATION.id,
    policyId: "POL-TEST",
    sourceFindingIds: [],
    changes: [],
    parameters: [],
    prerequisites: [],
    validationRules: [],
    expectedImprovement: {},
    risks: [],
    confidence: "high",
    evidence: [],
    lineage: {},
    incomplete: false,
    complexity: "low",
    reversible: true,
    ...overrides,
  } as unknown as ChangeProposal;
}

function makeValidation(
  proposalId: string,
  outcome: ValidationOutcome,
  missingParameters: readonly string[] = [],
): ValidationResult {
  return {
    proposalId,
    outcome,
    rulesApplied: ["structural"],
    issues: [],
    missingParameters,
    executable: outcome === "valid" || outcome === "valid-with-warnings",
  } as unknown as ValidationResult;
}

function makeSimulation(
  proposalId: string,
  hash: string,
  regressions: readonly { severity: string }[] = [],
): SimulationResult {
  return {
    simulationId: `sim:${proposalId}`,
    proposalId,
    proposal: makeProposal(proposalId),
    score: { band: "recommended", score: 70 },
    regressions: regressions.map((r, i) => ({
      id: `reg:${i}`,
      severity: r.severity,
      statement: `regression ${i}`,
    })),
    metricDeltas: [],
    simulatedMetrics: {},
    resolvedRecommendations: [],
    unresolvedRecommendations: [],
    residualRisks: [],
    resolutions: {},
    confidence: "high",
    overlayContentHash: "overlay0",
    canonicalGraphHashBefore: hash,
    canonicalGraphHashAfter: hash,
    canonicalGraphHashPreserved: true,
  } as unknown as SimulationResult;
}

export function makePlan(overrides: Partial<ChangePlan> = {}): ChangePlan {
  return {
    id: "plan:test",
    title: "Test change plan",
    status: "blocked",
    confidence: "high",
    canonicalGraphHash: "88ceb819",
    version: { materialHash: "mat0" },
    lineage: { overlayContentHash: "overlay0" },
    explanation: { statusRationale: "Status rationale.", lineageStatement: "Lineage statement." },
    workstreams: [],
    steps: [],
    patches: [],
    blockers: [],
    requiredApprovals: [],
    validationCheckpoints: [],
    rollbackPlan: {
      fullPlanRollbackOrder: [],
      manualRollbackPatchIds: [],
      graphRegenerationRequired: false,
      limitations: [],
    },
    diagnostics: { repositoryImmutable: true, deterministic: true },
    ...overrides,
  } as unknown as ChangePlan;
}

/* ----------------------------------------------------------- engine double */

const HASH = "88ceb819";

interface EngineScript {
  proposals: readonly ChangeProposal[];
  validations: Readonly<Record<string, ValidationResult>>;
  conflicts: readonly ProposalConflict[];
  unresolved: Readonly<Record<string, readonly string[]>>;
  generateThrows: boolean;
  validateThrows: boolean;
  simulateThrows: boolean;
  compareThrows: boolean;
  planThrows: boolean;
  simulationHash: string;
  regressions: readonly { severity: string }[];
}

let script: EngineScript;
const calls = {
  generate: vi.fn(),
  validate: vi.fn(),
  simulate: vi.fn(),
  compare: vi.fn(),
  buildPlan: vi.fn(),
};

function installEngines() {
  const simulation = {
    canonicalGraphHash: HASH,
    canonicalGraph: {},
    generateProposalFromRecommendation: (rec: IntelligenceRecommendation) => {
      calls.generate(rec.id);
      if (script.generateThrows) throw new Error("generation exploded");
      return script.proposals;
    },
    inspectConflicts: () => script.conflicts,
    // The real engine returns a fresh, bound proposal rather than mutating.
    bind: (proposal: ChangeProposal) => ({ ...proposal }),

    unresolvedParameters: (proposal: ChangeProposal) => script.unresolved[proposal.id] ?? [],
    validate: (proposal: ChangeProposal) => {
      calls.validate(proposal.id);
      if (script.validateThrows) throw new Error("validation exploded");
      return script.validations[proposal.id] ?? makeValidation(proposal.id, "valid");
    },
    simulateProposal: (proposal: ChangeProposal) => {
      calls.simulate(proposal.id);
      if (script.simulateThrows) throw new Error("simulation exploded");
      return makeSimulation(proposal.id, script.simulationHash, script.regressions);
    },
    compareAlternatives: (proposals: readonly ChangeProposal[]) => {
      calls.compare(proposals.map((p) => p.id));
      if (script.compareThrows) throw new Error("comparison exploded");
      return {
        comparisonId: "alt:test",
        subject: "node:a",
        alternatives: proposals.map((p) => ({
          proposalId: p.id,
          variant: p.variant,
          score: { band: "recommended", score: 70 },
          metrics: {},
          deltas: [],
          resolvedRecommendationIds: [],
          residualRecommendationIds: [],
          regressions: [],
          risks: [],
          complexity: "low",
          confidence: "high",
        })),
        verdict: "equivalent",
        preferredProposalId: null,
        rationale: "Alternatives are equivalent.",
        discriminators: [],
        canonicalGraphHashPreserved: true,
      };
    },
  };
  const plan = {
    buildPlanFromSimulation: (sim: SimulationResult) => {
      calls.buildPlan(sim.proposalId);
      if (script.planThrows) throw new Error("planning exploded");
      return makePlan({ status: "blocked" });
    },
    detectDrift: () => ({ planId: "plan:test", classification: "none", explanation: "No drift.", findings: [] }),
  };
  __setRemediationEngines({ simulation, plan } as never);
}

/* --------------------------------------------------------------- harness */

vi.mock("@/platform/capability-intelligence/CapabilityIntelligenceProvider", () => ({
  useCapabilityIntelligence: () => ({
    snapshot: { intelligence: { recommendations: [RECOMMENDATION] } },
  }),
  __resetCapabilityIntelligenceCache: () => {},
}));

import RemediationWorkspace from "@/platform/capability-intelligence/pages/RemediationWorkspace";
import {
  RemediationWorkspaceProvider,
  __resetRemediationEngines,
  __setRemediationEngines,
  useRemediationWorkspace,
  type RemediationWorkspaceValue,
} from "@/platform/capability-intelligence/RemediationWorkspaceProvider";
import {
  evaluateComparisonEligibility,
  evaluateSimulationEligibility,
  summarizePlanBlockers,
  summarizeWorkflowBlocker,
  MAX_COMPARISON_ALTERNATIVES,
} from "@/platform/capability-intelligence/remediation/eligibility";

function renderWorkspace() {
  return render(
    <MemoryRouter initialEntries={[`/?recommendation=${RECOMMENDATION.id}`]}>
      <RemediationWorkspace />
    </MemoryRouter>,
  );
}

/** Captures the live context value so a handler can be invoked directly. */
let live: RemediationWorkspaceValue | null = null;
function Probe(): null {
  live = useRemediationWorkspace();
  return null;
}
function renderProvider(children: ReactNode = null) {
  return render(
    <MemoryRouter initialEntries={[`/?recommendation=${RECOMMENDATION.id}`]}>
      <RemediationWorkspaceProvider recommendations={[RECOMMENDATION]}>
        <Probe />
        {children}
      </RemediationWorkspaceProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  script = {
    proposals: [makeProposal("prop:a")],
    validations: {},
    conflicts: [],
    unresolved: {},
    generateThrows: false,
    validateThrows: false,
    simulateThrows: false,
    compareThrows: false,
    planThrows: false,
    simulationHash: HASH,
    regressions: [],
  };
  for (const fn of Object.values(calls)) fn.mockClear();
  live = null;
  installEngines();
});

afterEach(() => {
  __resetRemediationEngines();
});

/* ================================================== proposal generation == */

describe("Stage 3.5.4.3.1 — proposal generation is explicit", () => {
  it("does not generate anything on initial render", async () => {
    renderWorkspace();
    await screen.findByTestId("generate-proposals");
    expect(calls.generate).not.toHaveBeenCalled();
    expect(screen.getByTestId("proposal-stage").getAttribute("data-status")).toBe("not-generated");
    expect(screen.getByTestId("generation-explainer").textContent).toContain(
      "never generates on your behalf",
    );
  });

  it("generates exactly once per explicit invocation", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(await screen.findByTestId("generate-proposals"));
    await waitFor(() => expect(screen.getByTestId("proposal-options")).toBeTruthy());
    expect(calls.generate).toHaveBeenCalledTimes(1);
  });

  it("does not start a concurrent generation when clicked twice", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    const button = await screen.findByTestId("generate-proposals");
    await act(async () => {
      button.click();
      button.click();
      button.click();
    });
    await waitFor(() => expect(screen.getByTestId("proposal-options")).toBeTruthy());
    expect(calls.generate).toHaveBeenCalledTimes(1);
  });

  it("announces completion politely and never assertively", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(await screen.findByTestId("generate-proposals"));
    await waitFor(() =>
      expect(screen.getByTestId("remediation-announcement").textContent).toContain(
        "Proposal generation complete",
      ),
    );
    expect(screen.getByTestId("remediation-error-announcement").textContent).toBe("");
  });

  it("reports the no-proposal outcome without calling it a failure", async () => {
    script.proposals = [];
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(await screen.findByTestId("generate-proposals"));
    await waitFor(() =>
      expect(screen.getByTestId("proposal-stage").getAttribute("data-status")).toBe("empty"),
    );
    expect(screen.getByText("No proposal could be generated")).toBeTruthy();
  });

  it("surfaces a generation failure assertively, then clears it on a successful retry", async () => {
    script.generateThrows = true;
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(await screen.findByTestId("generate-proposals"));
    await waitFor(() =>
      expect(screen.getByTestId("remediation-error-announcement").textContent).toContain(
        "generation exploded",
      ),
    );
    expect(screen.getByTestId("workspace-error")).toBeTruthy();

    script.generateThrows = false;
    await user.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(screen.queryByTestId("workspace-error")).toBeNull());
    expect(screen.getByTestId("remediation-error-announcement").textContent).toBe("");
    // Retry ran once more; it never looped.
    expect(calls.generate).toHaveBeenCalledTimes(2);
  });

  it("preserves the engine's proposal ordering", async () => {
    script.proposals = [makeProposal("prop:b"), makeProposal("prop:a")];
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(await screen.findByTestId("generate-proposals"));
    await waitFor(() => expect(screen.getByTestId("proposal-options")).toBeTruthy());
    const rendered = [...screen.getByTestId("proposal-options").querySelectorAll("li")].map(
      (li) => li.textContent ?? "",
    );
    expect(rendered[0]).toContain("prop:b");
    expect(rendered[1]).toContain("prop:a");
  });

  it("clears every downstream result when the recommendation changes", async () => {
    const other = { ...RECOMMENDATION, id: "rec:TEST:other" } as IntelligenceRecommendation;
    render(
      <MemoryRouter initialEntries={[`/?recommendation=${RECOMMENDATION.id}`]}>
        <RemediationWorkspaceProvider recommendations={[RECOMMENDATION, other]}>
          <Probe />
        </RemediationWorkspaceProvider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(live).toBeTruthy());
    await act(async () => live!.generateProposals());
    await waitFor(() => expect(live!.proposals.length).toBe(1));
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.validation).toBeTruthy());

    await act(async () => live!.selectRecommendation(other));
    await waitFor(() => expect(live!.recommendation?.id).toBe(other.id));
    expect(live!.proposalStatus).toBe("not-generated");
    expect(live!.proposals).toEqual([]);
    expect(live!.proposal).toBeNull();
    expect(live!.validation).toBeNull();
    expect(live!.simulation).toBeNull();
    expect(live!.plan).toBeNull();
    expect(live!.activeStage).toBe("proposals");
    // Switching subject never silently regenerates on the operator's behalf.
    expect(calls.generate).toHaveBeenCalledTimes(1);
  });

});

/* ================================================== proposal validation == */

describe("Stage 3.5.4.3.1 — proposal validation is explicit", () => {
  async function generated() {
    renderProvider();
    await waitFor(() => expect(live).toBeTruthy());
    await act(async () => live!.generateProposals());
    await waitFor(() => expect(live!.proposal).toBeTruthy());
  }

  it("does not validate when a proposal is selected", async () => {
    script.proposals = [makeProposal("prop:a"), makeProposal("prop:b")];
    renderProvider();
    await waitFor(() => expect(live).toBeTruthy());
    await act(async () => live!.generateProposals());
    await waitFor(() => expect(live!.proposals.length).toBe(2));
    // Two proposals means a real choice, so nothing is auto-selected either.
    expect(live!.proposal).toBeNull();
    expect(calls.validate).not.toHaveBeenCalled();
    await act(async () => live!.selectProposal("prop:b"));
    expect(live!.proposal?.id).toBe("prop:b");
    expect(calls.validate).not.toHaveBeenCalled();
    expect(live!.validationStatus).toBe("not-validated");
  });


  it("does not validate when a parameter is bound", async () => {
    await generated();
    await act(async () => live!.setBinding("owner", "module:sre"));
    expect(calls.validate).not.toHaveBeenCalled();
  });

  it("validates exactly once per explicit invocation", async () => {
    await generated();
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.validationStatus).toBe("validated"));
    expect(calls.validate).toHaveBeenCalledTimes(1);
  });

  it.each<[ValidationOutcome, boolean]>([
    ["valid", true],
    ["valid-with-warnings", true],
    ["incomplete", false],
    ["conflicting", false],
    ["invalid", false],
  ])("renders the %s classification the engine returned", async (outcome, executable) => {
    script.validations = { "prop:a": makeValidation("prop:a", outcome) };
    await generated();
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.validation?.outcome).toBe(outcome));
    expect(live!.validation?.executable).toBe(executable);
    expect(live!.simulationEligibility.eligible).toBe(executable);
  });

  it("marks validation stale after a parameter change and refuses to re-validate itself", async () => {
    await generated();
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.validationStatus).toBe("validated"));

    await act(async () => live!.setBinding("owner", "module:sre"));
    expect(live!.validationStatus).toBe("stale");
    expect(live!.simulationEligibility.eligible).toBe(false);
    expect(live!.simulationEligibility.code).toBe("stale-validation");
    expect(calls.validate).toHaveBeenCalledTimes(1);

    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.validationStatus).toBe("validated"));
    expect(live!.simulationEligibility.eligible).toBe(true);
  });

  it("surfaces a validation failure assertively and retries on demand", async () => {
    script.validateThrows = true;
    await generated();
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.validationStatus).toBe("failed"));
    expect(live!.errorAnnouncement).toContain("validation exploded");

    script.validateThrows = false;
    await act(async () => live!.retry());
    await waitFor(() => expect(live!.validationStatus).toBe("validated"));
    expect(calls.validate).toHaveBeenCalledTimes(2);
  });
});

/* ================================================ simulation eligibility = */

describe("Stage 3.5.4.3.1 — simulation eligibility gate", () => {
  async function ready(outcome: ValidationOutcome, unresolved: readonly string[] = []) {
    script.validations = { "prop:a": makeValidation("prop:a", outcome, unresolved) };
    script.unresolved = { "prop:a": unresolved };
    renderProvider();
    await waitFor(() => expect(live).toBeTruthy());
    await act(async () => live!.generateProposals());
    await waitFor(() => expect(live!.proposal).toBeTruthy());
  }

  it("refuses when there is no proposal", () => {
    const gate = evaluateSimulationEligibility({
      proposal: null,
      validation: null,
      validationStale: false,
      unresolvedParameters: [],
      conflicts: [],
      busy: false,
    });
    expect(gate.eligible).toBe(false);
    expect(gate.code).toBe("no-proposal");
  });

  it("refuses an unvalidated proposal", async () => {
    await ready("valid");
    expect(live!.simulationEligibility.code).toBe("not-validated");
    await act(async () => live!.runSimulation());
    expect(calls.simulate).not.toHaveBeenCalled();
  });

  it.each<ValidationOutcome>(["incomplete", "conflicting", "invalid"])(
    "refuses a %s proposal and never reaches simulateProposal",
    async (outcome) => {
      await ready(outcome);
      await act(async () => live!.validateProposal());
      await waitFor(() => expect(live!.validation?.outcome).toBe(outcome));
      expect(live!.simulationEligibility.eligible).toBe(false);
      await act(async () => live!.runSimulation());
      expect(calls.simulate).not.toHaveBeenCalled();
      expect(live!.blockerAnnouncement).toContain("Simulation blocked");
      expect(live!.simulation).toBeNull();
    },
  );

  it("refuses while a required parameter is unresolved", async () => {
    await ready("valid", ["owner"]);
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.validation).toBeTruthy());
    expect(live!.simulationEligibility.code).toBe("unresolved-parameters");
    expect(live!.simulationEligibility.reason).toContain("owner");
    await act(async () => live!.runSimulation());
    expect(calls.simulate).not.toHaveBeenCalled();
  });

  it("refuses when a blocking conflict names the proposal", async () => {
    script.conflicts = [
      {
        id: "cfl:x",
        type: "mutually-exclusive",
        severity: "blocking",
        proposalIds: ["prop:a"],
        changeIds: [],
        entityIds: [],
        explanation: "Another proposed change removes the same edge.",
        resolutionOptions: [],
        evidence: [],
        consolidationRationale: null,
      } as unknown as ProposalConflict,
    ];
    await ready("valid");
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.validation).toBeTruthy());
    expect(live!.simulationEligibility.code).toBe("conflicting");
    await act(async () => live!.runSimulation());
    expect(calls.simulate).not.toHaveBeenCalled();
  });

  it.each<ValidationOutcome>(["valid", "valid-with-warnings"])(
    "allows a %s proposal the engine marks executable",
    async (outcome) => {
      await ready(outcome);
      await act(async () => live!.validateProposal());
      await waitFor(() => expect(live!.simulationEligibility.eligible).toBe(true));
      await act(async () => live!.runSimulation());
      await waitFor(() => expect(live!.simulation).toBeTruthy());
      expect(calls.simulate).toHaveBeenCalledTimes(1);
    },
  );

  it("resolving a parameter and re-validating re-opens the gate", async () => {
    await ready("incomplete", ["owner"]);
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.simulationEligibility.eligible).toBe(false));

    script.validations = { "prop:a": makeValidation("prop:a", "valid") };
    script.unresolved = { "prop:a": [] };
    await act(async () => live!.setBinding("owner", "module:sre"));
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.simulationEligibility.eligible).toBe(true));
  });

  it("a direct programmatic invocation cannot bypass the gate", async () => {
    await ready("invalid");
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.validation?.outcome).toBe("invalid"));
    const hashBefore = live!.canonicalGraphHash;
    // Called straight off the context value, with no button involved at all.
    await act(async () => live!.runSimulation());
    await act(async () => live!.runSimulation());
    expect(calls.simulate).not.toHaveBeenCalled();
    expect(live!.canonicalGraphHash).toBe(hashBefore);
    expect(live!.simulation).toBeNull();
  });

  it("states the blocker as text and associates it with the control", async () => {
    script.validations = { "prop:a": makeValidation("prop:a", "incomplete", ["owner"]) };
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(await screen.findByTestId("generate-proposals"));
    await user.click(await screen.findByTestId("validate-proposal"));
    await waitFor(() =>
      expect(screen.getByTestId("simulation-stage").getAttribute("data-eligible")).toBe("false"),
    );
    const reason = screen.getByTestId("simulation-gate-reason");
    expect(reason.textContent?.length).toBeGreaterThan(10);
    const button = screen.getByTestId("run-simulation");
    expect(button.getAttribute("aria-describedby")).toBe("simulation-gate-reason");
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(reason.id).toBe("simulation-gate-reason");
  });

});

/* ============================================== alternatives eligibility = */

describe("Stage 3.5.4.3.1 — alternative comparison eligibility", () => {
  function withAlternatives(count: number, outcomes: readonly ValidationOutcome[]) {
    const ids = Array.from({ length: count }, (_, i) => `prop:${i}`);
    script.proposals = ids.map((id) =>
      makeProposal(id, { alternativeProposalIds: ids.filter((x) => x !== id) }),
    );
    script.validations = Object.fromEntries(
      ids.map((id, i) => [id, makeValidation(id, outcomes[i] ?? "valid")]),
    );
    return ids;
  }

  async function assessed(count: number, outcomes: readonly ValidationOutcome[]) {
    const ids = withAlternatives(count, outcomes);
    renderProvider();
    await waitFor(() => expect(live).toBeTruthy());
    await act(async () => live!.generateProposals());
    await waitFor(() => expect(live!.proposals.length).toBe(count));
    await act(async () => live!.selectProposal(ids[0]));
    await act(async () => live!.assessAlternatives());
    await waitFor(() => expect(live!.alternativesAssessed).toBe(true));
    return ids;
  }

  it("compares two eligible alternatives", async () => {
    await assessed(2, ["valid", "valid"]);
    expect(live!.comparisonEligibility.eligible).toBe(true);
    await act(async () => live!.runAlternativeComparison());
    await waitFor(() => expect(live!.comparison).toBeTruthy());
    expect(calls.compare).toHaveBeenCalledTimes(1);
  });

  it.each<ValidationOutcome>(["incomplete", "conflicting", "invalid"])(
    "keeps a %s alternative visible but never sends it to the engine",
    async (outcome) => {
      const ids = await assessed(2, ["valid", outcome]);
      const ineligible = live!.alternativeEligibility.find((e) => e.proposalId === ids[1]);
      expect(ineligible?.verdict.eligible).toBe(false);
      // Auto-selection only picked the eligible one, so the count gate refuses.
      expect(live!.selectedAlternativeIds).toEqual([ids[0]]);
      expect(live!.comparisonEligibility.code).toBe("too-few-alternatives");

      // Ticking the ineligible one names it rather than silently dropping it.
      await act(async () => live!.toggleAlternative(ids[1]));
      expect(live!.comparisonEligibility.code).toBe("ineligible-alternatives");
      expect(live!.comparisonEligibility.reason).toContain(ids[1]);
      await act(async () => live!.runAlternativeComparison());
      expect(calls.compare).not.toHaveBeenCalled();
    },
  );

  it("refuses more than four alternatives", () => {
    const eligibility = Array.from({ length: 5 }, (_, i) => ({
      proposalId: `prop:${i}`,
      validation: makeValidation(`prop:${i}`, "valid"),
      verdict: { eligible: true, code: "eligible" as const, reason: "ok" },
    }));
    const gate = evaluateComparisonEligibility({
      selectedIds: eligibility.map((e) => e.proposalId),
      eligibility,
      busy: false,
    });
    expect(gate.eligible).toBe(false);
    expect(gate.code).toBe("too-many-alternatives");
    expect(MAX_COMPARISON_ALTERNATIVES).toBe(4);
  });

  it("auto-selects at most four eligible alternatives after assessment", async () => {
    await assessed(5, ["valid", "valid", "valid", "valid", "valid"]);
    expect(live!.selectedAlternativeIds.length).toBe(MAX_COMPARISON_ALTERNATIVES);
    expect(live!.comparisonEligibility.eligible).toBe(true);
  });

  it("reports when no alternative is comparable", async () => {
    await assessed(2, ["invalid", "invalid"]);
    expect(live!.alternativeEligibility.every((e) => !e.verdict.eligible)).toBe(true);
    expect(live!.selectedAlternativeIds).toEqual([]);
    await act(async () => live!.runAlternativeComparison());
    expect(calls.compare).not.toHaveBeenCalled();
  });

  it("marks a comparison stale when the selection changes and never re-compares itself", async () => {
    const ids = await assessed(3, ["valid", "valid", "valid"]);
    await act(async () => live!.runAlternativeComparison());
    await waitFor(() => expect(live!.comparison).toBeTruthy());
    await act(async () => live!.toggleAlternative(ids[2]));
    expect(live!.comparisonStale).toBe(true);
    expect(calls.compare).toHaveBeenCalledTimes(1);
  });

  it("never invents a preferred alternative the engine did not name", async () => {
    await assessed(2, ["valid", "valid"]);
    await act(async () => live!.runAlternativeComparison());
    await waitFor(() => expect(live!.comparison).toBeTruthy());
    expect(live!.comparison?.preferredProposalId).toBeNull();
    expect(live!.comparison?.verdict).toBe("equivalent");
  });
});

/* =================================================== change-plan gating == */

describe("Stage 3.5.4.3.1 — change-plan generation gate", () => {
  async function simulated(regressions: readonly { severity: string }[] = [], hash = HASH) {
    script.validations = { "prop:a": makeValidation("prop:a", "valid") };
    script.regressions = regressions;
    script.simulationHash = hash;
    renderProvider();
    await waitFor(() => expect(live).toBeTruthy());
    await act(async () => live!.generateProposals());
    await waitFor(() => expect(live!.proposal).toBeTruthy());
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.simulationEligibility.eligible).toBe(true));
    await act(async () => live!.runSimulation());
    await waitFor(() => expect(live!.simulation).toBeTruthy());
  }

  it("refuses without a simulation", async () => {
    renderProvider();
    await waitFor(() => expect(live).toBeTruthy());
    expect(live!.planEligibility.code).toBe("no-simulation");
    await act(async () => live!.buildChangePlan());
    expect(calls.buildPlan).not.toHaveBeenCalled();
  });

  it("refuses a stale simulation", async () => {
    await simulated();
    await act(async () => live!.setBinding("owner", "module:sre"));
    expect(live!.simulationStale).toBe(true);
    expect(live!.planEligibility.code).toBe("stale-simulation");
    await act(async () => live!.buildChangePlan());
    expect(calls.buildPlan).not.toHaveBeenCalled();
  });

  it("refuses when the simulation carries a critical regression", async () => {
    await simulated([{ severity: "critical" }]);
    expect(live!.planEligibility.code).toBe("critical-regression");
    await act(async () => live!.buildChangePlan());
    expect(calls.buildPlan).not.toHaveBeenCalled();
  });

  it("refuses when the simulation's canonical hash does not match the workspace", async () => {
    await simulated([], "deadbeef");
    expect(live!.planEligibility.code).toBe("graph-hash-mismatch");
    expect(live!.planEligibility.reason).toContain("deadbeef");
    await act(async () => live!.buildChangePlan());
    expect(calls.buildPlan).not.toHaveBeenCalled();
  });

  it("builds only from an eligible, current simulation, and never automatically", async () => {
    await simulated();
    expect(calls.buildPlan).not.toHaveBeenCalled();
    expect(live!.planEligibility.eligible).toBe(true);
    await act(async () => live!.buildChangePlan());
    await waitFor(() => expect(live!.plan).toBeTruthy());
    expect(calls.buildPlan).toHaveBeenCalledTimes(1);
    expect(live!.plan?.status).toBe("blocked");
  });

  it("surfaces a plan failure assertively and retries on demand", async () => {
    await simulated();
    script.planThrows = true;
    await act(async () => live!.buildChangePlan());
    await waitFor(() => expect(live!.errorAnnouncement).toContain("planning exploded"));
    script.planThrows = false;
    await act(async () => live!.retry());
    await waitFor(() => expect(live!.plan).toBeTruthy());
    expect(calls.buildPlan).toHaveBeenCalledTimes(2);
  });
});

/* ================================================ blocker announcements == */

describe("Stage 3.5.4.3.1 — blocker announcements", () => {
  it("summarises a large blocker set by count and representative kinds", () => {
    const plan = makePlan({
      blockers: [
        ...Array.from({ length: 30 }, (_, i) => ({
          id: `b${i}`,
          kind: "unresolved-artifact-mapping",
          subject: "x",
          statement: "s",
          resolutionOptions: [],
        })),
        ...Array.from({ length: 20 }, (_, i) => ({
          id: `c${i}`,
          kind: "unresolved-approval-role",
          subject: "x",
          statement: "s",
          resolutionOptions: [],
        })),
        { id: "d0", kind: "incomplete-proposal", subject: "x", statement: "s", resolutionOptions: [] },
        { id: "e0", kind: "critical-regression", subject: "x", statement: "s", resolutionOptions: [] },
      ],
    } as never);
    const summary = summarizePlanBlockers(plan);
    expect(summary).toContain("52 conditions");
    expect(summary).toContain("unresolved-artifact-mapping");
    expect(summary).toContain("unresolved-approval-role");
    // Four distinct kinds: three are named and the remainder is counted.
    expect(summary).toContain("1 other kind");
    // It never enumerates every blocker.
    expect(summary.length).toBeLessThan(240);
  });

  it("prefers a produced plan's blockers over the gate the operator is standing in front of", () => {
    const blocked = summarizeWorkflowBlocker({
      simulationEligibility: { eligible: false, code: "incomplete", reason: "incomplete" },
      comparisonEligibility: { eligible: true, code: "eligible", reason: "ok" },
      planEligibility: { eligible: true, code: "eligible", reason: "ok" },
      plan: makePlan({
        blockers: [
          { id: "b0", kind: "unresolved-approval-role", subject: "x", statement: "s", resolutionOptions: [] },
        ],
      } as never),
    });
    expect(blocked).toContain("Change plan blocked by 1 condition");
  });

  it("is silent when nothing is blocked", () => {
    expect(
      summarizeWorkflowBlocker({
        simulationEligibility: { eligible: true, code: "eligible", reason: "ok" },
        comparisonEligibility: { eligible: true, code: "eligible", reason: "ok" },
        planEligibility: { eligible: true, code: "eligible", reason: "ok" },
        plan: null,
      }),
    ).toBe("");
  });

  it("announces a blocker once, then announces that it cleared", async () => {
    script.validations = { "prop:a": makeValidation("prop:a", "incomplete") };
    renderProvider();
    await waitFor(() => expect(live).toBeTruthy());
    await act(async () => live!.generateProposals());
    await waitFor(() => expect(live!.proposal).toBeTruthy());
    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.blockerAnnouncement).toContain("Simulation blocked"));
    const announced = live!.blockerAnnouncement;

    // A re-render with no state change must not re-announce.
    await act(async () => live!.toggleAlternative("prop:zzz"));
    expect(live!.blockerAnnouncement).toBe(announced);

    script.validations = { "prop:a": makeValidation("prop:a", "valid") };
    await act(async () => live!.validateProposal());
    await waitFor(() =>
      expect(live!.blockerAnnouncement).toBe("The workflow is no longer blocked. The next step is available."),
    );
  });
});

/* ============================================ workflow and read-only ==== */

describe("Stage 3.5.4.3.1 — workflow semantics and read-only posture", () => {
  it("labels seven steps and marks exactly one as current", async () => {
    renderWorkspace();
    const progress = await screen.findByTestId("stage-progress");
    const steps = [...progress.querySelectorAll("li")];
    expect(steps.length).toBe(7);
    expect(steps.filter((li) => li.getAttribute("aria-current") === "step").length).toBe(1);
    expect(progress.textContent).toContain("2. Generate proposals");
    expect(progress.textContent).toContain("4. Validate proposal");
  });

  it("communicates blocked, stale and complete stage states programmatically", async () => {
    script.validations = { "prop:a": makeValidation("prop:a", "valid") };
    renderProvider();
    await waitFor(() => expect(live).toBeTruthy());
    await act(async () => live!.generateProposals());
    await waitFor(() => expect(live!.proposal).toBeTruthy());
    expect(live!.stageStates.validation).toBe("available");
    expect(live!.stageStates.simulation).toBe("blocked");

    await act(async () => live!.validateProposal());
    await waitFor(() => expect(live!.stageStates.validation).toBe("complete"));
    expect(live!.stageStates.simulation).toBe("available");

    await act(async () => live!.setBinding("owner", "module:sre"));
    expect(live!.stageStates.validation).toBe("stale");
  });

  it("offers no approve, reject, execute or apply control anywhere", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(await screen.findByTestId("generate-proposals"));
    await waitFor(() => expect(screen.getByTestId("proposal-options")).toBeTruthy());
    for (const label of [/^approve/i, /^reject/i, /execute/i, /apply patch/i, /commit/i]) {
      expect(screen.queryByRole("button", { name: label })).toBeNull();
    }
  });
});
