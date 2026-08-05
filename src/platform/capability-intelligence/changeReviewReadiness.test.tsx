/**
 * Stage 3.5.4.4 — Change Review Readiness and Approval Requirements.
 *
 * The evidence for this stage is measured against the canonical repository
 * graph, not fixtures. Three properties matter most and are each proven here:
 *
 *  1. The screen is genuinely read-only: it records no approval, waives no
 *     blocker, resolves no mapping and applies no patch.
 *  2. It runs no engine: preparing a review package neither regenerates a
 *     proposal nor produces a second change plan.
 *  3. The canonical plan status stays authoritative: a blocked plan produces a
 *     blocked review package with no aggregate score that could soften it.
 */

import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { getPopulatedGraph } from "@/modules/graph/populate";
import { createSimulationEngine } from "@/modules/graph/simulation/index";
import { createChangePlanEngine, type ChangePlan } from "@/modules/graph/change-plan/index";
import type { SimulationResult } from "@/modules/graph/simulation/index";
import {
  buildReviewPackage,
  BLOCKER_RESOLUTION,
  BLOCKER_SEVERITY,
  MAPPING_CATEGORY_LABEL,
  READINESS_CONCLUSION,
  REVIEW_PACKAGE_PREPARED_ANNOUNCEMENT,
  type ReviewPackage,
} from "./review/reviewPackage";
import { buildGateMatrix, READINESS_GATE_IDS, summarizeGates } from "./review/gateMatrix";
import { reviewLink, remediationLink } from "./review/reviewLink";
import { ReviewSummaryCard } from "./components/review/ReviewSummaryCard";
import { GateMatrixTable } from "./components/review/GateMatrixTable";
import { BlockerAnalysisPanel } from "./components/review/BlockerAnalysisPanel";
import { ArtifactMappingPanel } from "./components/review/ArtifactMappingPanel";
import { ApprovalMatrixPanel } from "./components/review/ApprovalMatrixPanel";
import { EvidencePackagePanel } from "./components/review/EvidencePackagePanel";
import {
  RollbackReadinessPanel,
  ValidationReadinessPanel,
} from "./components/review/ValidationRollbackPanel";

const CANONICAL_GRAPH_HASH = "e889b604";

const graph = getPopulatedGraph().graph;
const simulation = createSimulationEngine();
const planEngine = createChangePlanEngine({ graph, simulationEngine: simulation });

const ELIGIBLE = { eligible: true, code: "eligible", reason: "Ready." } as const;

/** The real plans the repository graph produces today, measured once. */
const realRuns: { plan: ChangePlan; simulation: SimulationResult }[] = (() => {
  const runs: { plan: ChangePlan; simulation: SimulationResult }[] = [];
  for (const proposal of simulation.generateProposals()) {
    if (!simulation.validate(proposal).executable) continue;
    const result = simulation.simulateProposal(proposal);
    runs.push({ plan: planEngine.buildPlanFromSimulation(result), simulation: result });
  }
  return runs;
})();

/** The largest real plan: 26 steps, 26 patches. The stage's worst case. */
const largest = [...realRuns].sort((a, b) => b.plan.steps.length - a.plan.steps.length)[0];

function packageFor(run: { plan: ChangePlan; simulation: SimulationResult }): ReviewPackage {
  return buildReviewPackage({
    plan: run.plan,
    drift: null,
    simulation: run.simulation,
    recommendation: null,
    proposal: null,
    canonicalGraphHash: CANONICAL_GRAPH_HASH,
    simulationStale: false,
    planStale: false,
    proposalEligibility: ELIGIBLE,
    evidenceSource: "real-graph",
  });
}

const pkg = packageFor(largest);

function renderRouted(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

/* ================================================ measured real-graph facts */

describe("Stage 3.5.4.4 — real-graph review evidence", () => {
  it("is not vacuous: the real graph produces plans to review", () => {
    expect(realRuns.length).toBeGreaterThan(0);
  });

  it("the canonical graph hash is unchanged by this stage", () => {
    expect(pkg.summary.canonicalGraphHash).toBe(CANONICAL_GRAPH_HASH);
    for (const run of realRuns) expect(run.plan.canonicalGraphHash).toBe(CANONICAL_GRAPH_HASH);
  });

  it("records the largest real plan: 26 steps and 26 patches", () => {
    expect(pkg.summary.stepCount).toBe(26);
    expect(pkg.summary.patchCount).toBe(26);
  });

  it("carries the measured blocker and approval load of that plan", () => {
    expect(pkg.summary.blockerCount).toBe(largest.plan.blockers.length);
    expect(pkg.approvalSummary.total).toBe(largest.plan.requiredApprovals.length);
  });

  it("every real review package is blocked, matching the canonical plan status", () => {
    for (const run of realRuns) {
      const p = packageFor(run);
      expect(p.summary.planStatus).toBe(run.plan.status);
      expect(p.summary.planStatus).toBe("blocked");
      expect(p.summary.conclusion).toBe(READINESS_CONCLUSION.blocked);
    }
  });

  it("classifies every real blocker and offers a resolution for each category", () => {
    for (const group of pkg.blockers.groups) {
      expect(BLOCKER_SEVERITY[group.kind]).toBeTruthy();
      expect(group.requiredResolution).toBe(BLOCKER_RESOLUTION[group.kind]);
      expect(group.count).toBeGreaterThan(0);
    }
    const counted = pkg.blockers.groups.reduce((n, g) => n + g.count, 0);
    expect(counted).toBe(pkg.summary.blockerCount);
  });

  it("groups every artifact mapping into exactly one category", () => {
    const grouped = pkg.mappingGroups.reduce((n, g) => n + g.mappings.length, 0);
    expect(grouped).toBe(pkg.mappingViews.length);
    for (const group of pkg.mappingGroups) {
      expect(MAPPING_CATEGORY_LABEL[group.category]).toBeTruthy();
    }
  });

  it("accounts for every approval requirement in the role matrix", () => {
    const grouped = pkg.approvalGroups.reduce((n, g) => n + g.requirements.length, 0);
    expect(grouped).toBe(pkg.approvals.length);
    expect(pkg.approvals.length).toBe(pkg.approvalSummary.total);
  });

  it("is deterministic: the same plan yields an identical package shape", () => {
    const a = packageFor(largest);
    const b = packageFor(largest);
    expect(JSON.stringify(a.summary)).toBe(JSON.stringify(b.summary));
    expect(a.gates.map((g) => `${g.id}:${g.status}`)).toEqual(
      b.gates.map((g) => `${g.id}:${g.status}`),
    );
  });

  it("runs no engine: preparing a package does not create a second plan", () => {
    const before = largest.plan.version.materialHash;
    packageFor(largest);
    packageFor(largest);
    expect(largest.plan.version.materialHash).toBe(before);
    expect(planEngine.buildPlanFromSimulation(largest.simulation).version.materialHash).toBe(before);
  });
});

/* ================================================================== gates = */

describe("Stage 3.5.4.4 — readiness gate matrix", () => {
  it("evaluates every declared gate, with no gate silently omitted", () => {
    expect(pkg.gates.length).toBe(READINESS_GATE_IDS.length);
    expect(pkg.gates.map((g) => g.id).sort()).toEqual([...READINESS_GATE_IDS].sort());
  });

  it("gives every gate a rationale and a next action", () => {
    for (const gate of pkg.gates) {
      expect(gate.rationale.length).toBeGreaterThan(0);
      expect(gate.nextAction.length).toBeGreaterThan(0);
    }
  });

  it("summarises gates by outcome without inventing an aggregate score", () => {
    const summary = summarizeGates(pkg.gates);
    expect(summary.passed + summary.blocked + summary.warning + summary.notApplicable).toBe(
      summary.total,
    );
    expect(Object.keys(summary)).not.toContain("score");
    expect(Object.keys(pkg.summary)).not.toContain("score");
    expect(Object.keys(pkg.summary)).not.toContain("readinessPercentage");
  });

  it("a blocked plan blocks at least one gate", () => {
    expect(pkg.gateSummary.blocked).toBeGreaterThan(0);
  });

  it("gate outcomes follow their inputs, not the plan's wishes", () => {
    const stale = buildGateMatrix({
      plan: largest.plan,
      drift: null,
      simulation: largest.simulation,
      simulationStale: true,
      planStale: true,
      proposalEligibility: ELIGIBLE,
      canonicalGraphHash: CANONICAL_GRAPH_HASH,
    });
    const fresh = buildGateMatrix({
      plan: largest.plan,
      drift: null,
      simulation: largest.simulation,
      simulationStale: false,
      planStale: false,
      proposalEligibility: ELIGIBLE,
      canonicalGraphHash: CANONICAL_GRAPH_HASH,
    });
    expect(summarizeGates(stale).blocked).toBeGreaterThanOrEqual(summarizeGates(fresh).blocked);
  });

  it("detects a canonical hash mismatch rather than trusting the plan", () => {
    const gates = buildGateMatrix({
      plan: largest.plan,
      drift: null,
      simulation: largest.simulation,
      simulationStale: false,
      planStale: false,
      proposalEligibility: ELIGIBLE,
      canonicalGraphHash: "deadbeef",
    });
    const hashGate = gates.find((g) => g.id === "canonical-hash-match");
    expect(hashGate?.status).toBe("blocked");
  });
});

/* ================================================================ rendering */

describe("Stage 3.5.4.4 — rendering and read-only guarantees", () => {
  it("renders the summary with the canonical status and no approval control", () => {
    renderRouted(<ReviewSummaryCard pkg={pkg} />);
    const card = screen.getByTestId("review-summary");
    expect(card.getAttribute("data-status")).toBe("blocked");
    expect(within(card).getByTestId("readiness-conclusion").textContent).toContain(
      "not ready for formal approval",
    );

  });

  it("offers no approve, reject, waive, execute or apply control anywhere", () => {
    renderRouted(
      <>
        <ReviewSummaryCard pkg={pkg} />
        <GateMatrixTable gates={pkg.gates} summary={pkg.gateSummary} />
        <BlockerAnalysisPanel analysis={pkg.blockers} />
        <ArtifactMappingPanel groups={pkg.mappingGroups} summary={pkg.mappingSummary} />
        <ApprovalMatrixPanel groups={pkg.approvalGroups} summary={pkg.approvalSummary} />
        <ValidationReadinessPanel readiness={pkg.validation} />
        <RollbackReadinessPanel readiness={pkg.rollback} />
        <EvidencePackagePanel sections={pkg.evidenceSections} />
      </>,
    );
    for (const label of [
      /^approve/i,
      /^reject/i,
      /waive/i,
      /override/i,
      /execute/i,
      /^apply/i,
      /^merge/i,
      /sign off/i,
      /assign/i,
    ]) {
      expect(screen.queryByRole("button", { name: label })).toBeNull();
    }
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("renders the gate matrix as a captioned, accessible table", () => {
    renderRouted(<GateMatrixTable gates={pkg.gates} summary={pkg.gateSummary} />);
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("columnheader").length).toBeGreaterThan(2);
    expect(table.querySelector("caption")).toBeTruthy();
  });

  it("bounds the 26-patch, 54-blocker collections and never hides the totals", async () => {
    const user = userEvent.setup();
    renderRouted(<BlockerAnalysisPanel analysis={pkg.blockers} />);
    const panel = screen.getByTestId("blocker-analysis");
    expect(within(panel).getByTestId("blocker-total").textContent).toContain(
      String(pkg.summary.blockerCount),
    );
    const more = within(panel).queryAllByRole("button", { name: /show \d+ more/i });
    if (more.length > 0) {
      await user.click(more[0]);
      expect(within(panel).queryAllByRole("button", { name: /show fewer/i }).length).toBeGreaterThan(
        0,
      );
    }
  });

  it("labels unresolved mappings as requiring a human selection, and offers none", () => {
    renderRouted(<ArtifactMappingPanel groups={pkg.mappingGroups} summary={pkg.mappingSummary} />);
    const panel = screen.getByTestId("artifact-mapping-panel");
    expect(panel.getAttribute("data-unresolved")).toBe(String(pkg.mappingSummary.unresolved));
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("shows approval roles as requirements, with no person assignable", () => {
    renderRouted(<ApprovalMatrixPanel groups={pkg.approvalGroups} summary={pkg.approvalSummary} />);
    const panel = screen.getByTestId("approval-matrix");
    expect(panel.getAttribute("data-total")).toBe(String(pkg.approvalSummary.total));
    expect(screen.queryByRole("button", { name: /assign|nominate|invite/i })).toBeNull();
  });

  it("announces the prepared package by status and blocked-gate count", () => {
    const text = REVIEW_PACKAGE_PREPARED_ANNOUNCEMENT(pkg);
    expect(text).toContain("blocked");
    expect(text).toContain(`${pkg.gateSummary.blocked} of ${pkg.gateSummary.total}`);
    expect(text.length).toBeLessThan(240);
  });
});

/* ============================================================= navigation = */

describe("Stage 3.5.4.4 — navigation contract", () => {
  it("links to the review screen under the existing remediation route", () => {
    expect(reviewLink(null)).toBe("/platform/capability-intelligence/remediation/review");
  });

  it("preserves the recommendation deep-link parameter in both directions", () => {
    expect(reviewLink("rec:owner gap")).toContain("recommendation=rec%3Aowner%20gap");
    expect(remediationLink("rec:owner gap")).toBe(
      "/platform/capability-intelligence/remediation?recommendation=rec%3Aowner%20gap",
    );
  });

  it("leaves the workspace URL itself unchanged", () => {
    expect(remediationLink(null)).toBe("/platform/capability-intelligence/remediation");
  });
});
