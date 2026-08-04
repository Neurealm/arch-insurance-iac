/**
 * Stage 3.5.4.3 — Simulation and Change Planning workspace.
 *
 * Two concerns are covered here:
 *
 *  1. Engine contract over the REAL repository graph. The workspace only ever
 *     renders what the Stage 3.5.3.4 simulation engine and the Stage 3.5.3.5
 *     change-plan engine produce, so these tests prove the pipeline the UI
 *     depends on is deterministic and leaves the canonical graph untouched.
 *  2. Route wiring and authorization, mounted from the same
 *     `capabilityIntelligenceRoutes` element `src/App.tsx` renders.
 */

import { describe, it, expect, vi, beforeAll } from "vitest";
import { Suspense } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

const auth = {
  user: { id: "u1" },
  loading: false,
  isAdmin: false,
  approvalStatus: "approved",
  mustChangePassword: false,
  roleLoading: false,
};
const access = { loading: false, isPlatformAdmin: false, activeTenantId: "t1", hasPermission: () => false };

vi.mock("@/context/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/platform/access/AccessContext", () => ({ useAccess: () => access }));

import { capabilityIntelligenceRoutes } from "@/platform/capability-intelligence/routes";
import { __resetCapabilityIntelligenceCache } from "@/platform/capability-intelligence/CapabilityIntelligenceProvider";
import {
  REMEDIATION_STAGES,
  getRemediationEngines,
  __resetRemediationEngines,
} from "@/platform/capability-intelligence/RemediationWorkspaceProvider";
import {
  formatMetricDelta,
  formatMetricValue,
  metricLabel,
  planStatusTone,
  scoreBandTone,
  validationLabel,
} from "@/platform/capability-intelligence/remediationPresentation";

beforeAll(() => {
  const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>;
  proto.hasPointerCapture = () => false;
  proto.setPointerCapture = () => {};
  proto.releasePointerCapture = () => {};
  proto.scrollIntoView = () => {};
});

function renderApp(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Suspense fallback={<span>route-loading</span>}>
        <Routes>
          <Route path="/platform" element={<Outlet />}>
            {capabilityIntelligenceRoutes}
          </Route>
        </Routes>
      </Suspense>
    </MemoryRouter>,
  );
}

/* -------------------------------------------------------------- engines */

describe("Stage 3.5.4.3 — engine pipeline the workspace renders", () => {
  it("shares one simulation engine between the simulation and the plan engine", () => {
    __resetRemediationEngines();
    const a = getRemediationEngines();
    const b = getRemediationEngines();
    expect(b.simulation).toBe(a.simulation);
    expect(b.plan).toBe(a.plan);
  });

  it("generates deterministic proposals for a real recommendation", () => {
    const { simulation } = getRemediationEngines();
    const recommendation = simulation.baseline().intelligence.recommendations[0];
    expect(recommendation).toBeTruthy();
    const first = simulation.generateProposalFromRecommendation(recommendation);
    const second = simulation.generateProposalFromRecommendation(recommendation);
    expect(second.map((p) => p.id)).toEqual(first.map((p) => p.id));
  });

  it("preserves the canonical graph hash across a simulation", () => {
    const { simulation } = getRemediationEngines();
    const before = simulation.canonicalGraphHash;
    const recommendation = simulation.baseline().intelligence.recommendations[0];
    const [proposal] = simulation.generateProposalFromRecommendation(recommendation);
    if (!proposal) return;
    const result = simulation.simulateProposal(proposal);
    expect(result.canonicalGraphHashBefore).toBe(before);
    expect(result.canonicalGraphHashAfter).toBe(before);
    expect(result.canonicalGraphHashPreserved).toBe(true);
    expect(simulation.canonicalGraphHash).toBe(before);
  });

  it("produces byte-identical simulations for identical inputs", () => {
    const { simulation } = getRemediationEngines();
    const recommendation = simulation.baseline().intelligence.recommendations[0];
    const [proposal] = simulation.generateProposalFromRecommendation(recommendation);
    if (!proposal) return;
    const a = simulation.simulateProposal(proposal);
    const b = simulation.simulateProposal(proposal);
    expect(a.simulationId).toBe(b.simulationId);
    expect(a.overlayContentHash).toBe(b.overlayContentHash);
    expect(JSON.stringify(a.metricDeltas)).toBe(JSON.stringify(b.metricDeltas));
  });

  it("builds a plan whose status is one of the three emittable statuses and which applies nothing", () => {
    const engines = getRemediationEngines();
    const recommendation = engines.simulation.baseline().intelligence.recommendations[0];
    const [proposal] = engines.simulation.generateProposalFromRecommendation(recommendation);
    if (!proposal) return;
    const result = engines.simulation.simulateProposal(proposal);
    const plan = engines.plan.buildPlanFromSimulation(result);
    expect(["draft", "blocked", "ready-for-review"]).toContain(plan.status);
    expect(plan.diagnostics.repositoryImmutable).toBe(true);
    expect(plan.diagnostics.deterministic).toBe(true);
    expect(plan.canonicalGraphHash).toBe(engines.simulation.canonicalGraphHash);
    // Patches are specifications, never source code.
    for (const patch of plan.patches) {
      expect(typeof patch.explanation).toBe("string");
      expect(patch.rollback.patchId).toBe(patch.id);
    }
  });

  it("reports no drift for a freshly built plan", () => {
    const engines = getRemediationEngines();
    const recommendation = engines.simulation.baseline().intelligence.recommendations[0];
    const [proposal] = engines.simulation.generateProposalFromRecommendation(recommendation);
    if (!proposal) return;
    const plan = engines.plan.buildPlanFromSimulation(
      engines.simulation.simulateProposal(proposal),
    );
    const drift = engines.plan.detectDrift(plan);
    expect(drift.planId).toBe(plan.id);
    expect(["none", "review-required"]).toContain(drift.classification);
    expect(
      drift.findings.every((f) => f.kind !== "canonical-hash-changed"),
    ).toBe(true);
  });
});

/* --------------------------------------------------------- presentation */

describe("Stage 3.5.4.3 — presentation mapping never softens an engine verdict", () => {
  it("maps validation outcomes without inventing a passing state", () => {
    expect(validationLabel("valid")).toContain("Valid");
    expect(validationLabel("invalid")).toContain("cannot be simulated");
    expect(validationLabel("incomplete")).toContain("unresolved");
    expect(validationLabel("unheard-of")).toBe("unheard-of");
  });

  it("maps score bands and plan statuses onto honest tones", () => {
    expect(scoreBandTone("not-recommended")).toBe("critical");
    expect(scoreBandTone("strongly-recommended")).toBe("positive");
    expect(planStatusTone("blocked")).toBe("critical");
    expect(planStatusTone("ready-for-review")).toBe("positive");
  });

  it("formats rates as percentages and counts as counts", () => {
    expect(formatMetricValue("ownershipResolutionRate", 0.732)).toBe("73.2%");
    expect(formatMetricValue("nodeCount", 1291)).toBe("1,291");
    expect(formatMetricDelta("nodeCount", 0)).toBe("no change");
    expect(formatMetricDelta("nodeCount", -3)).toBe("−3");
    expect(formatMetricDelta("nodeCount", 3)).toBe("+3");
  });

  it("falls back to the engine label, then the raw key", () => {
    expect(metricLabel("nodeCount")).toBe("Entities");
    expect(metricLabel("madeUpKey", "Engine label")).toBe("Engine label");
    expect(metricLabel("madeUpKey")).toBe("madeUpKey");
  });
});

/* -------------------------------------------------------------- routing */

describe("Stage 3.5.4.3 — remediation route wiring", () => {
  it("declares exactly one remediation stage order", () => {
    expect([...REMEDIATION_STAGES]).toEqual([
      "recommendation",
      "proposal",
      "simulation",
      "alternatives",
      "change-plan",
    ]);
  });

  it("blocks an authenticated non-administrator", async () => {
    __resetCapabilityIntelligenceCache();
    access.isPlatformAdmin = false;
    renderApp("/platform/capability-intelligence/remediation");
    expect(await screen.findByText("Access denied")).toBeTruthy();
    expect(screen.queryByTestId("stage-progress")).toBeNull();
  });

  it("renders the workspace for a platform administrator with later stages gated", async () => {
    __resetCapabilityIntelligenceCache();
    access.isPlatformAdmin = true;
    renderApp("/platform/capability-intelligence/remediation");

    expect(await screen.findByText("Remediation workspace")).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId("stage-progress")).toBeTruthy(), { timeout: 20000 });

    // A deterministic default recommendation opens the workspace, so stage 1 is
    // complete; stages that need a simulation remain locked until one is run.
    await waitFor(
      () =>
        expect(screen.getByTestId("stage-recommendation").getAttribute("data-state")).toBe(
          "complete",
        ),
      { timeout: 20000 },
    );
    expect(screen.getByTestId("stage-change-plan").getAttribute("data-state")).toBe("locked");

    // The read-only contract is stated on the surface itself.
    expect(screen.getByText(/no patch is ever applied/i)).toBeTruthy();
  }, 30000);
});

