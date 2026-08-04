/**
 * Stage 3.5.4.3 — recommendation selection policy and workspace behaviour.
 *
 * The selection policy tests are pure and run against synthetic
 * recommendations so every tie break can be exercised in isolation. The
 * behaviour tests mount the real route element over the REAL repository graph.
 */

import { describe, it, expect, vi, beforeAll } from "vitest";
import { Suspense } from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import type { IntelligenceRecommendation } from "@/modules/graph/intelligence/index";
import {
  affectedEntityCount,
  compareRecommendationsForDefault,
  defaultRecommendation,
  normalizeRecommendationParam,
  orderRecommendationsForDefault,
  remediationLinkFor,
  resolveRecommendationSelection,
  severityRank,
} from "@/platform/capability-intelligence/remediation/recommendationSelection";

const auth = {
  user: { id: "u1" },
  loading: false,
  isAdmin: false,
  approvalStatus: "approved",
  mustChangePassword: false,
  roleLoading: false,
};
const access = { loading: false, isPlatformAdmin: true, activeTenantId: "t1", hasPermission: () => false };

vi.mock("@/context/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/platform/access/AccessContext", () => ({ useAccess: () => access }));

import { capabilityIntelligenceRoutes } from "@/platform/capability-intelligence/routes";
import {
  __resetCapabilityIntelligenceCache,
  __capabilityIntelligenceComputeCount,
  computeCapabilityIntelligence,
} from "@/platform/capability-intelligence/CapabilityIntelligenceProvider";
import { __resetRemediationEngines } from "@/platform/capability-intelligence/RemediationWorkspaceProvider";

beforeAll(() => {
  const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>;
  proto.hasPointerCapture = () => false;
  proto.setPointerCapture = () => {};
  proto.releasePointerCapture = () => {};
  proto.scrollIntoView = () => {};
});

/* ------------------------------------------------------------- fixtures */

function rec(
  id: string,
  overrides: Partial<IntelligenceRecommendation> = {},
): IntelligenceRecommendation {
  return {
    id,
    policyId: "policy-a",
    category: "ownership",
    severity: "warning",
    status: "open",
    priority: "medium",
    priorityScore: 50,
    priorityExplanation: {} as IntelligenceRecommendation["priorityExplanation"],
    title: `Recommendation ${id}`,
    summary: "",
    subject: id,
    affected: {
      nodeIds: [],
      routeIds: [],
      moduleIds: [],
      capabilityIds: [],
      serviceIds: [],
      platformIds: [],
      owners: [],
    },
    evidence: [],
    sourceFindingIds: [],
    reasoningAnalyses: [],
    confidence: "high",
    confidenceRationale: "",
    candidateInvolved: false,
    expectedByDesign: false,
    expectedBenefit: "",
    remediation: { complexity: "low" } as IntelligenceRecommendation["remediation"],
    consolidation: {} as IntelligenceRecommendation["consolidation"],
    exclusions: [],
    lineage: {} as IntelligenceRecommendation["lineage"],
    ...overrides,
  } as IntelligenceRecommendation;
}

/* ----------------------------------------------------- selection policy */

describe("Stage 3.5.4.3 — deterministic default recommendation", () => {
  it("prefers the highest canonical priority band", () => {
    const list = [rec("b", { priority: "low" }), rec("a", { priority: "critical" })];
    expect(defaultRecommendation(list)?.id).toBe("a");
  });

  it("breaks a priority tie on the higher priority score", () => {
    const list = [rec("a", { priorityScore: 40 }), rec("b", { priorityScore: 90 })];
    expect(defaultRecommendation(list)?.id).toBe("b");
  });

  it("breaks a score tie on the higher canonical severity", () => {
    const list = [rec("a", { severity: "info" }), rec("b", { severity: "critical" })];
    expect(defaultRecommendation(list)?.id).toBe("b");
    expect(severityRank("critical")).toBeLessThan(severityRank("info"));
    expect(severityRank("nonsense")).toBeGreaterThan(severityRank("info"));
  });

  it("breaks a severity tie on the higher affected-entity count", () => {
    const many = rec("a", {
      affected: { ...rec("a").affected, nodeIds: ["n1", "n2", "n3"] },
    });
    const few = rec("b", { affected: { ...rec("b").affected, nodeIds: ["n1"] } });
    expect(affectedEntityCount(many)).toBe(3);
    expect(defaultRecommendation([few, many])?.id).toBe("a");
  });

  it("breaks every remaining tie on the canonical identifier", () => {
    expect(defaultRecommendation([rec("z"), rec("a"), rec("m")])?.id).toBe("a");
  });

  it("is independent of input order", () => {
    const list = [
      rec("c", { priority: "high", priorityScore: 70 }),
      rec("a", { priority: "high", priorityScore: 70 }),
      rec("b", { priority: "critical", priorityScore: 95 }),
    ];
    const forward = orderRecommendationsForDefault(list).map((r) => r.id);
    const reversed = orderRecommendationsForDefault([...list].reverse()).map((r) => r.id);
    expect(reversed).toEqual(forward);
    expect(forward[0]).toBe("b");
  });

  it("returns null for an empty recommendation set", () => {
    expect(defaultRecommendation([])).toBeNull();
    expect(resolveRecommendationSelection([], null).source).toBe("none");
  });

  it("is a strict weak ordering (comparator is antisymmetric)", () => {
    const a = rec("a", { priority: "high" });
    const b = rec("b", { priority: "low" });
    expect(compareRecommendationsForDefault(a, b)).toBeLessThan(0);
    expect(compareRecommendationsForDefault(b, a)).toBeGreaterThan(0);
    expect(compareRecommendationsForDefault(a, a)).toBe(0);
  });
});

describe("Stage 3.5.4.3 — ?recommendation= parameter contract", () => {
  const list = [rec("a", { priority: "critical" }), rec("needs space", { priority: "low" })];

  it("treats a missing parameter as no selection", () => {
    expect(normalizeRecommendationParam(null)).toBeNull();
    expect(normalizeRecommendationParam(undefined)).toBeNull();
  });

  it("treats an empty or whitespace-only parameter as no selection", () => {
    expect(normalizeRecommendationParam("")).toBeNull();
    expect(normalizeRecommendationParam("   ")).toBeNull();
    expect(resolveRecommendationSelection(list, "").source).toBe("default");
  });

  it("accepts a valid identifier", () => {
    const selection = resolveRecommendationSelection(list, "a");
    expect(selection.source).toBe("parameter");
    expect(selection.recommendation?.id).toBe("a");
    expect(selection.unknownParameter).toBeNull();
  });

  it("decodes a percent-encoded identifier", () => {
    expect(normalizeRecommendationParam("needs%20space")).toBe("needs space");
    expect(resolveRecommendationSelection(list, "needs%20space").recommendation?.id).toBe(
      "needs space",
    );
  });

  it("tolerates a malformed escape sequence rather than throwing", () => {
    expect(normalizeRecommendationParam("100%broken")).toBe("100%broken");
  });

  it("falls back to the deterministic default for an unknown identifier and says so", () => {
    const selection = resolveRecommendationSelection(list, "does-not-exist");
    expect(selection.source).toBe("default");
    expect(selection.recommendation?.id).toBe("a");
    expect(selection.unknownParameter).toBe("does-not-exist");
  });

  it("builds an encoded deep link", () => {
    expect(remediationLinkFor("needs space")).toBe(
      "/platform/capability-intelligence/remediation?recommendation=needs%20space",
    );
  });
});

/* -------------------------------------------------------- real workspace */

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

const canonicalRecommendations = () => computeCapabilityIntelligence().intelligence.recommendations;

describe("Stage 3.5.4.3 — workspace over the real repository graph", () => {
  it("opens a deep-linked recommendation and reports no fallback", async () => {
    __resetCapabilityIntelligenceCache();
    __resetRemediationEngines();
    const target = canonicalRecommendations()[3];
    renderApp(
      `/platform/capability-intelligence/remediation?recommendation=${encodeURIComponent(target.id)}`,
    );
    await waitFor(() => expect(screen.getByTestId("stage-progress")).toBeTruthy(), {
      timeout: 20000,
    });
    await waitFor(() => expect(screen.getAllByText(target.id).length).toBeGreaterThan(0), {
      timeout: 20000,
    });
    expect(screen.queryByTestId("selection-source")).toBeNull();
  }, 40000);

  it("falls back to the deterministic default for an unknown id and explains the fallback", async () => {
    __resetCapabilityIntelligenceCache();
    __resetRemediationEngines();
    renderApp("/platform/capability-intelligence/remediation?recommendation=NOT-A-REAL-ID");
    const notice = await screen.findByTestId("selection-source", undefined, { timeout: 20000 });
    expect(notice.textContent).toContain("NOT-A-REAL-ID");
    const expected = defaultRecommendation(canonicalRecommendations());
    await waitFor(() => expect(screen.getAllByText(expected!.id).length).toBeGreaterThan(0), {
      timeout: 20000,
    });
  }, 40000);

  it("never runs a simulation or a plan automatically", async () => {
    __resetCapabilityIntelligenceCache();
    __resetRemediationEngines();
    renderApp(`/platform/capability-intelligence/remediation?recommendation=${simulatableId()}`);
    await selectFirstProposal();
    expect(screen.queryByTestId("simulation-result")).toBeNull();
    expect(screen.queryByTestId("change-plan")).toBeNull();
    // The plan action stays disabled until a simulation exists.
    expect(screen.getByTestId("build-change-plan").hasAttribute("disabled")).toBe(true);
  }, 60000);

  it("computes the intelligence analysis exactly once for the whole workspace", async () => {
    __resetCapabilityIntelligenceCache();
    __resetRemediationEngines();
    renderApp("/platform/capability-intelligence/remediation");
    await waitFor(() => expect(screen.getByTestId("stage-progress")).toBeTruthy(), {
      timeout: 20000,
    });
    expect(__capabilityIntelligenceComputeCount()).toBe(1);
  }, 40000);

  it("runs a simulation only on explicit invocation and announces the outcome", async () => {
    __resetCapabilityIntelligenceCache();
    __resetRemediationEngines();
    renderApp(`/platform/capability-intelligence/remediation?recommendation=${simulatableId()}`);
    const run = await selectFirstProposal();
    await waitFor(() => expect(run.hasAttribute("disabled")).toBe(false), { timeout: 20000 });
    fireEvent.click(run);
    const result = await screen.findByTestId("simulation-result", undefined, { timeout: 30000 });
    expect(result).toBeTruthy();
    // Every canonical resolution classification is reported, including empties.
    const classifications = screen.getByTestId("resolution-classifications");
    for (const c of [
      "resolved",
      "partially-resolved",
      "unresolved",
      "superseded",
      "invalidated",
      "regressed",
    ]) {
      expect(classifications.querySelector(`[data-classification="${c}"]`)).toBeTruthy();
    }
    const announcement = screen.getByTestId("remediation-announcement");
    expect(announcement.textContent).toContain("Simulation");
    expect(announcement.getAttribute("aria-live")).toBe("polite");
  }, 60000);


  it("exposes read-only status and no approval or execution control", async () => {
    __resetCapabilityIntelligenceCache();
    __resetRemediationEngines();
    renderApp("/platform/capability-intelligence/remediation");
    await waitFor(() => expect(screen.getByTestId("stage-progress")).toBeTruthy(), {
      timeout: 20000,
    });
    expect(screen.getAllByText(/read only/i).length).toBeGreaterThan(0);
    for (const label of [/^approve/i, /^reject/i, /^execute/i, /apply patch/i, /assign owner/i]) {
      expect(screen.queryAllByRole("button", { name: label })).toHaveLength(0);
    }
  }, 40000);

  it("labels the workflow progress list for assistive technology", async () => {
    __resetCapabilityIntelligenceCache();
    __resetRemediationEngines();
    renderApp("/platform/capability-intelligence/remediation");
    const progress = await screen.findByTestId("stage-progress", undefined, { timeout: 20000 });
    expect(progress.getAttribute("aria-label")).toBe("Remediation workflow progress");
    expect(progress.tagName.toLowerCase()).toBe("ol");
    expect(progress.querySelectorAll("li")).toHaveLength(5);
  }, 40000);
});

describe("Stage 3.5.4.3 — Recommendation Center hand-off", () => {
  it("links each recommendation to the workspace with its canonical id", async () => {
    __resetCapabilityIntelligenceCache();
    __resetRemediationEngines();
    renderApp("/platform/capability-intelligence/recommendations");
    const links = await screen.findAllByTestId("evaluate-remediation", undefined, {
      timeout: 20000,
    });
    const href = links[0].getAttribute("href") ?? "";
    expect(href.startsWith("/platform/capability-intelligence/remediation?recommendation=")).toBe(
      true,
    );
    const id = decodeURIComponent(href.split("recommendation=")[1]);
    expect(canonicalRecommendations().some((r) => r.id === id)).toBe(true);
  }, 40000);
});
