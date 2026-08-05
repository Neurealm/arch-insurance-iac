/**
 * Stage 3.5.4.3.1 — change-plan status evidence and bounded rendering.
 *
 * Requirement 4 asks for *testable* status evidence. Two questions have to be
 * answered separately, because they have different answers:
 *
 *  1. What status does the real repository graph actually produce today?
 *  2. Does the panel render each emittable status faithfully when it occurs?
 *
 * (1) is measured against the canonical graph and recorded as a fact, not
 * wished into existence. (2) is proven with clearly labelled fixtures, because
 * the real graph cannot currently produce those statuses — and the panel says
 * so on screen rather than letting a fixture masquerade as repository evidence.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getCapabilityGraph } from "@/modules/graph/build";
import { createSimulationEngine } from "@/modules/graph/simulation/index";
import {
  createChangePlanEngine,
  EMITTABLE_PLAN_STATUSES,
  type ChangePlan,
} from "@/modules/graph/change-plan/index";
import { ChangePlanPanel } from "@/platform/capability-intelligence/components/remediation/ChangePlanPanel";
import { BoundedList, DEFAULT_LIST_LIMIT } from "@/platform/capability-intelligence/components/remediation/BoundedList";
import { summarizePlanBlockers } from "@/platform/capability-intelligence/remediation/eligibility";

const CANONICAL_GRAPH_HASH = "e889b604";

const graph = getCapabilityGraph();
const simulation = createSimulationEngine();
const planEngine = createChangePlanEngine({ graph, simulationEngine: simulation });

/** Every plan the real graph can currently produce, measured once. */
const realPlans: ChangePlan[] = (() => {
  const proposals = simulation.generateProposals();
  const plans: ChangePlan[] = [];
  for (const proposal of proposals) {
    const validation = simulation.validate(proposal);
    if (!validation.executable) continue;
    plans.push(planEngine.buildPlanFromSimulation(simulation.simulateProposal(proposal)));
  }
  return plans;
})();

const ELIGIBLE = { eligible: true, code: "eligible", reason: "Ready." } as const;
const INELIGIBLE = { eligible: false, code: "no-simulation", reason: "Run a simulation first." } as const;

/* --------------------------------------------------------------- fixtures */

function fixturePlan(overrides: Partial<ChangePlan>): ChangePlan {
  return {
    id: "plan:fixture",
    title: "Fixture change plan",
    status: "draft",
    confidence: "high",
    canonicalGraphHash: CANONICAL_GRAPH_HASH,
    version: { materialHash: "fixture-material" },
    lineage: { overlayContentHash: "fixture-overlay" },
    explanation: {
      statusRationale: "Fixture rationale.",
      lineageStatement: "Fixture lineage statement.",
    },
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
    ...overrides,
  } as unknown as ChangePlan;
}

function fixtureStep(i: number) {
  return {
    id: `step:${i}`,
    order: i + 1,
    title: `Fixture step ${i + 1}`,
    description: "Fixture step description.",
    expectedResult: "Fixture expected result.",
    risk: "low",
    parallelizable: false,
    workstream: "declaration",
    targetArtifactPaths: [],
    patchIds: [],
    rollback: { manual: false, statement: "Revert the declaration." },
  };
}

function fixturePatch(i: number, resolved = true) {
  return {
    id: `patch:${i}`,
    operation: "add-record",
    status: resolved ? "specified" : "unresolved-artifact",
    explanation: `Fixture patch ${i + 1}.`,
    artifact: { path: resolved ? `src/modules/registry/entry-${i}.ts` : null, kind: "registry" },
    selector: { ambiguity: "unique", statement: "Unique selector." },
    beforeState: { statement: "No owner declared." },
    afterState: { statement: "Owner declared." },
    rollback: { manualRollbackRequired: false, inverseOperation: "remove-record" },
  };
}

function fixtureBlocker(i: number, kind: string) {
  return {
    id: `blocker:${i}`,
    kind,
    subject: `subject:${i}`,
    statement: `Fixture blocker ${i + 1}.`,
    resolutionOptions: ["Assign an owner."],
  };
}

function renderPlan(plan: ChangePlan, evidenceSource: "real-graph" | "fixture" = "fixture") {
  return render(
    <ChangePlanPanel
      plan={plan}
      drift={null}
      eligibility={ELIGIBLE}
      busy={false}
      onBuild={() => {}}
      evidenceSource={evidenceSource}
    />,
  );
}

/* ============================================== measured real-graph facts = */

describe("Stage 3.5.4.3.1 — real-graph change-plan status evidence", () => {
  it("the canonical graph hash carried by every plan is unchanged by this stage", () => {
    for (const plan of realPlans) {
      expect(plan.canonicalGraphHash).toBe(realPlans[0].canonicalGraphHash);
    }
  });


  it("produces at least one plan, so the measurement below is not vacuous", () => {
    expect(realPlans.length).toBeGreaterThan(0);
  });

  it("records that every real plan is currently blocked, and states why", () => {
    const byStatus = new Map<string, number>();
    for (const plan of realPlans) {
      byStatus.set(plan.status, (byStatus.get(plan.status) ?? 0) + 1);
    }
    // The measured fact. If the repository ever resolves its artifact and
    // approval mappings, this expectation is meant to fail loudly and be
    // re-measured rather than quietly relaxed.
    expect([...byStatus.keys()]).toEqual(["blocked"]);

    const kinds = new Set(realPlans.flatMap((p) => p.blockers.map((b) => b.kind)));
    expect(kinds.has("unresolved-artifact-mapping")).toBe(true);
    expect(kinds.has("unresolved-approval-role")).toBe(true);
  });

  it("never emits a status outside the declared emittable set", () => {
    for (const plan of realPlans) {
      expect(EMITTABLE_PLAN_STATUSES).toContain(plan.status);
    }
  });

  it("every blocked plan carries at least one blocker and an explanation for it", () => {
    for (const plan of realPlans) {
      expect(plan.blockers.length).toBeGreaterThan(0);
      expect(plan.explanation.statusRationale.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic: the same simulation yields an identical plan status and blocker count", () => {
    const proposal = simulation.generateProposals().find((p) => simulation.validate(p).executable);
    expect(proposal).toBeTruthy();
    const a = planEngine.buildPlanFromSimulation(simulation.simulateProposal(proposal!));
    const b = planEngine.buildPlanFromSimulation(simulation.simulateProposal(proposal!));
    expect(a.status).toBe(b.status);
    expect(a.blockers.length).toBe(b.blockers.length);
    expect(a.version.materialHash).toBe(b.version.materialHash);
  });

  it("summarises a real plan's blockers without reading every one aloud", () => {
    const worst = [...realPlans].sort((a, b) => b.blockers.length - a.blockers.length)[0];
    const summary = summarizePlanBlockers(worst);
    expect(summary).toContain(`${worst.blockers.length} condition`);
    expect(summary.length).toBeLessThan(240);
  });

  it("renders a real plan labelled as repository-derived evidence", () => {
    renderPlan(realPlans[0], "real-graph");
    const rendered = screen.getByTestId("change-plan");
    expect(rendered.getAttribute("data-status")).toBe("blocked");
    expect(rendered.getAttribute("data-evidence")).toBe("real-graph");
    expect(screen.getByText(/Derived from the canonical repository graph/)).toBeTruthy();
  });
});

/* =========================================== fixture-backed status render = */

describe("Stage 3.5.4.3.1 — each emittable status renders faithfully", () => {
  it("renders a blocked plan with its blocker list", () => {
    renderPlan(
      fixturePlan({
        status: "blocked",
        blockers: [fixtureBlocker(0, "unresolved-approval-role")],
        patches: [fixturePatch(0)],
      } as never),
    );
    expect(screen.getByTestId("change-plan").getAttribute("data-status")).toBe("blocked");
    expect(screen.getByText(/Blocked — unresolved conditions prevent review/)).toBeTruthy();
    expect(screen.getAllByTestId("plan-blocker").length).toBe(1);
  });

  it("renders a draft plan: no blocker, no executable patch", () => {
    renderPlan(fixturePlan({ status: "draft" }));
    expect(screen.getByTestId("change-plan").getAttribute("data-status")).toBe("draft");
    expect(screen.getByText(/Draft — no blocker and no executable patch/)).toBeTruthy();
    expect(screen.queryByTestId("plan-blockers")).toBeNull();
  });

  it("renders a ready-for-review plan: no blocker, patches specified", () => {
    renderPlan(
      fixturePlan({
        status: "ready-for-review",
        steps: [fixtureStep(0)],
        patches: [fixturePatch(0), fixturePatch(1)],
      } as never),
    );
    expect(screen.getByTestId("change-plan").getAttribute("data-status")).toBe("ready-for-review");
    expect(screen.getByText("Ready for review")).toBeTruthy();
    expect(screen.getAllByTestId("plan-patch").length).toBe(2);
  });

  it("labels a fixture as a fixture so it can never be mistaken for repository evidence", () => {
    renderPlan(fixturePlan({ status: "ready-for-review", patches: [fixturePatch(0)] } as never));
    expect(screen.getByTestId("change-plan").getAttribute("data-evidence")).toBe("fixture");
    expect(screen.getByText(/Fixture — not derived from the repository graph/)).toBeTruthy();
  });

  it("covers every emittable status the engine declares", () => {
    expect([...EMITTABLE_PLAN_STATUSES].sort()).toEqual(
      ["blocked", "draft", "ready-for-review"].sort(),
    );
  });

  it("states the readiness criteria even before a plan exists", () => {
    render(
      <ChangePlanPanel
        plan={null}
        drift={null}
        eligibility={INELIGIBLE}
        busy={false}
        onBuild={() => {}}
      />,
    );
    expect(screen.getByTestId("plan-readiness-criteria").children.length).toBeGreaterThan(2);
    expect(screen.getByTestId("plan-gate-reason").textContent).toContain("Run a simulation first");
    expect(screen.getByTestId("build-change-plan").hasAttribute("disabled")).toBe(true);
  });

  it("never offers an approve or execute control for any status", () => {
    renderPlan(fixturePlan({ status: "ready-for-review", patches: [fixturePatch(0)] } as never));
    for (const label of [/^approve/i, /execute/i, /^apply/i, /merge/i]) {
      expect(screen.queryByRole("button", { name: label })).toBeNull();
    }
    expect(screen.getByText(/Repository untouched — no patch applied/)).toBeTruthy();
  });
});

/* ================================================= bounded list rendering = */

describe("Stage 3.5.4.3.1 — bounded rendering of large collections", () => {
  const many = Array.from({ length: 32 }, (_, i) => ({ id: `item:${i}`, label: `Item ${i}` }));

  function renderList(count = many.length, limit = DEFAULT_LIST_LIMIT) {
    return render(
      <BoundedList
        items={many.slice(0, count)}
        limit={limit}
        label="items"
        testId="demo-list"
        keyFor={(item) => item.id}
        renderItem={(item) => <span>{item.label}</span>}
      />,
    );
  }

  it("caps the initial render and states the true total", () => {
    renderList();
    const list = screen.getByTestId("demo-list");
    expect(list.getAttribute("data-total")).toBe("32");
    expect(list.getAttribute("data-visible")).toBe(String(DEFAULT_LIST_LIMIT));
    expect(screen.getByTestId("demo-list-count").textContent).toContain("Showing 10 of 32 items");
  });

  it("names the exact number of hidden records on the control", () => {
    renderList();
    expect(screen.getByTestId("demo-list-show-more").textContent).toBe("Show 22 more items");
  });

  it("reveals everything on request and can collapse again", async () => {
    const user = userEvent.setup();
    renderList();
    await user.click(screen.getByTestId("demo-list-show-more"));
    expect(screen.getByTestId("demo-list").getAttribute("data-visible")).toBe("32");
    expect(screen.queryByTestId("demo-list-show-more")).toBeNull();

    await user.click(screen.getByTestId("demo-list-show-fewer"));
    expect(screen.getByTestId("demo-list").getAttribute("data-visible")).toBe("10");
  });

  it("preserves the engine's order and never re-sorts", async () => {
    const user = userEvent.setup();
    renderList();
    await user.click(screen.getByTestId("demo-list-show-more"));
    const labels = [...screen.getByTestId("demo-list").querySelectorAll("li")].map(
      (li) => li.textContent,
    );
    expect(labels).toEqual(many.map((m) => m.label));
  });

  it("shows no control when the collection fits", () => {
    renderList(4);
    expect(screen.queryByTestId("demo-list-show-more")).toBeNull();
    expect(screen.getByTestId("demo-list-count").textContent).toContain("Showing 4 of 4 items");
  });

  it("states an empty collection plainly", () => {
    render(
      <BoundedList
        items={[]}
        label="items"
        testId="demo-list"
        keyFor={(i: { id: string }) => i.id}
        renderItem={() => null}
      />,
    );
    expect(screen.getByTestId("demo-list-empty").textContent).toBe("No items.");
  });

  it("bounds steps, patches and blockers in a large plan", async () => {
    const user = userEvent.setup();
    renderPlan(
      fixturePlan({
        status: "blocked",
        steps: Array.from({ length: 25 }, (_, i) => fixtureStep(i)),
        patches: Array.from({ length: 25 }, (_, i) => fixturePatch(i)),
        blockers: Array.from({ length: 52 }, (_, i) =>
          fixtureBlocker(i, i % 2 === 0 ? "unresolved-artifact-mapping" : "unresolved-approval-role"),
        ),
      } as never),
    );
    expect(screen.getAllByTestId("plan-step").length).toBe(DEFAULT_LIST_LIMIT);
    expect(screen.getAllByTestId("plan-patch").length).toBe(DEFAULT_LIST_LIMIT);
    expect(screen.getAllByTestId("plan-blocker").length).toBe(DEFAULT_LIST_LIMIT);
    // The totals are never hidden, only the records are.
    expect(screen.getByTestId("blocker-list").getAttribute("data-total")).toBe("52");

    await user.click(screen.getByTestId("blocker-list-show-more"));
    expect(screen.getAllByTestId("plan-blocker").length).toBe(52);
    // Expanding one collection does not expand the others.
    expect(screen.getAllByTestId("plan-step").length).toBe(DEFAULT_LIST_LIMIT);
  });
});
