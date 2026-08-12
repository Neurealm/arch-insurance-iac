import { describe, expect, it } from "vitest";
import { customerServices } from "../data/cshFixtures";
import { links } from "../data/goocFixtures";
import { situationHeader, situationRoute } from "../data/situationFixtures";
import { INVESTIGATION_ID } from "../data/investigationFixtures";
import {
  actionOptions, affectedInventory, APPROVAL_ID, APPROVAL_STATES, approvalEvidence,
  approvalHeader, approvalKpis, approvalScenario, approvalStateStages, approvers,
  auditEvents, autonomyLevels, autonomyMatrix, AUTONOMY_MATRIX_COLUMNS,
  autonomyReadiness, availableConditions, blastRadius, decisionOptions,
  emergencyControls, EVIDENCE_CATEGORIES, expectedOutcomes, governanceComparison,
  guardrails, maturityStages, measuredOutcomes, pendingActions, policyRules,
  QUEUE_COLUMNS, rollbackSteps, separationOfDutiesRules, topologyImpactRoles,
  validationCriteria,
} from "../data/approvalFixtures";

describe("approvalFixtures", () => {
  it("reuses the existing situation, customer service, link and investigation identifiers", () => {
    expect(approvalHeader.situationId).toBe(situationHeader.id);
    expect(approvalHeader.investigationId).toBe(INVESTIGATION_ID);
    expect(customerServices.some((s) => s.id === approvalHeader.serviceId)).toBe(true);
    expect(links.some((l) => l.id === approvalHeader.linkId)).toBe(true);
    expect(approvalHeader.region).toBe(situationHeader.region);
    expect(approvalHeader.product).toBe(situationHeader.product);
  });

  it("uses the default Chennai approval request", () => {
    expect(APPROVAL_ID).toBe("APR-2026-0417-03");
    expect(approvalHeader.id).toBe(APPROVAL_ID);
    expect(approvalHeader.autonomyLevel).toBe(3);
    expect(approvalHeader.confidence).toBe(94);
    expect(pendingActions[0].id).toBe(APPROVAL_ID);
  });

  it("exposes eight KPI cards with unique ids and the required values", () => {
    expect(approvalKpis).toHaveLength(8);
    expect(new Set(approvalKpis.map((k) => k.id)).size).toBe(8);
    expect(approvalKpis.find((k) => k.id === "kpi-pending")?.value).toBe("7");
    expect(approvalKpis.find((k) => k.id === "kpi-autonomous")?.value).toBe("18");
    expect(approvalKpis.find((k) => k.id === "kpi-time")?.value).toBe("3m 16s");
    expect(approvalKpis.find((k) => k.id === "kpi-policy")?.value).toBe("98.9%");
  });

  it("covers all sixteen approval states with stage metadata", () => {
    expect(APPROVAL_STATES).toHaveLength(16);
    APPROVAL_STATES.forEach((s) => {
      expect(approvalStateStages.some((x) => x.state === s)).toBe(true);
    });
    expect(approvalStateStages.filter((s) => s.status === "Active")).toHaveLength(1);
  });

  it("provides at least ten pending actions with unique identifiers", () => {
    expect(pendingActions.length).toBeGreaterThanOrEqual(10);
    expect(new Set(pendingActions.map((a) => a.id)).size).toBe(pendingActions.length);
    expect(QUEUE_COLUMNS.length).toBeGreaterThanOrEqual(23);
  });

  it("ranks the recommended action first among seven candidate actions", () => {
    expect(actionOptions).toHaveLength(7);
    const recommended = actionOptions.filter((a) => a.recommended);
    expect(recommended).toHaveLength(1);
    expect(recommended[0].rank).toBe(1);
    expect(recommended[0].reversibility).toBe("Fully reversible");
    actionOptions.forEach((a) => {
      expect(a.likelihood).toBeGreaterThanOrEqual(1);
      expect(a.likelihood).toBeLessThanOrEqual(5);
      expect(a.impact).toBeGreaterThanOrEqual(1);
      expect(a.impact).toBeLessThanOrEqual(5);
    });
  });

  it("lists ten expected outcomes, measurable results and four decision options", () => {
    expect(expectedOutcomes).toHaveLength(10);
    expect(measuredOutcomes.length).toBeGreaterThanOrEqual(10);
    expect(decisionOptions).toHaveLength(4);
    expect(decisionOptions.filter((o) => o.recommended)).toHaveLength(1);
  });

  it("maps every topology impact role onto a real shared route object", () => {
    const ids = new Set([...situationRoute.nodes.map((n) => n.id), ...situationRoute.edges.map((e) => e.id)]);
    Object.keys(topologyImpactRoles).forEach((id) => expect(ids.has(id)).toBe(true));
    expect(blastRadius.length).toBeGreaterThanOrEqual(7);
    expect(affectedInventory.length).toBeGreaterThanOrEqual(15);
  });

  it("defines a ten step rollback plan with owners and failure handling", () => {
    expect(rollbackSteps).toHaveLength(10);
    rollbackSteps.forEach((s) => {
      expect(s.owner.length).toBeGreaterThan(0);
      expect(s.failureHandling.length).toBeGreaterThan(0);
      expect(["Agent", "Human"]).toContain(s.actor);
    });
  });

  it("defines twelve validation criteria with owners and failure responses", () => {
    expect(validationCriteria).toHaveLength(12);
    validationCriteria.forEach((c) => {
      expect(c.owner.length).toBeGreaterThan(0);
      expect(c.failureResponse.length).toBeGreaterThan(0);
    });
  });

  it("covers fifteen evidence categories with unique evidence items", () => {
    expect(EVIDENCE_CATEGORIES).toHaveLength(15);
    expect(new Set(approvalEvidence.map((e) => e.id)).size).toBe(approvalEvidence.length);
    EVIDENCE_CATEGORIES.forEach((c) => {
      expect(approvalEvidence.some((e) => e.category === c)).toBe(true);
    });
  });

  it("defines six autonomy levels and eight policy rules", () => {
    expect(autonomyLevels).toHaveLength(6);
    expect(autonomyLevels.map((l) => l.level)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(policyRules).toHaveLength(8);
    expect(policyRules.filter((r) => r.applies === "Applies").length).toBeGreaterThan(0);
  });

  it("evaluates guardrails across every group with a valid status", () => {
    expect(guardrails.length).toBeGreaterThanOrEqual(10);
    guardrails.forEach((g) => {
      expect(["Passed", "Warning", "Blocked", "Not applicable"]).toContain(g.status);
      expect(["Blocking", "Advisory"]).toContain(g.enforcement);
    });
  });

  it("requires two independent approvers and satisfies separation of duties", () => {
    const required = approvers.filter((a) => a.kind === "Required");
    expect(required).toHaveLength(2);
    expect(required.map((a) => a.role)).toEqual(["Service Reliability Owner", "Network Operations Approver"]);
    expect(approvers.filter((a) => a.kind === "Reviewer").length).toBeGreaterThanOrEqual(2);
    expect(separationOfDutiesRules).toHaveLength(5);
    separationOfDutiesRules.forEach((r) => expect(r.status).toBe("Satisfied"));
    expect(availableConditions).toHaveLength(8);
  });

  it("records an audit history that ends awaiting the required decision", () => {
    expect(auditEvents.length).toBeGreaterThanOrEqual(11);
    expect(auditEvents[auditEvents.length - 1].status).toBe("In progress");
    auditEvents.forEach((e) => expect(APPROVAL_STATES).toContain(e.state));
  });

  it("describes the progressive autonomy matrix and maturity stages", () => {
    expect(autonomyMatrix).toHaveLength(12);
    autonomyMatrix.forEach((r) => expect(AUTONOMY_MATRIX_COLUMNS).toContain(r.assignment));
    expect(autonomyMatrix.find((r) => r.id === "am-critical")?.assignment).toBe("Approval required");
    expect(autonomyMatrix.find((r) => r.id === "am-firmware")?.assignment).toBe("Prohibited");
    expect(maturityStages).toHaveLength(5);
    expect(maturityStages.filter((s) => s.state === "Current")).toHaveLength(1);
    expect(autonomyReadiness).toHaveLength(8);
  });

  it("defines ten emergency controls with a required authority and audit requirement", () => {
    expect(emergencyControls).toHaveLength(10);
    emergencyControls.forEach((c) => {
      expect(c.requiredAuthority.length).toBeGreaterThan(0);
      expect(c.auditRequirement.length).toBeGreaterThan(0);
    });
  });

  it("runs a twenty stage governed approval scenario that ends completed", () => {
    expect(approvalScenario).toHaveLength(20);
    approvalScenario.forEach((s, i) => {
      expect(s.index).toBe(i + 1);
      expect(APPROVAL_STATES).toContain(s.state);
    });
    expect(approvalScenario[0].state).toBe("Recommendation created");
    expect(approvalScenario[9].state).toBe("Awaiting required approver");
    expect(approvalScenario[19].state).toBe("Completed");
    expect(approvalScenario[19].validationPassed).toBe(12);
  });

  it("compares governed action with ungoverned automation across twelve dimensions", () => {
    expect(governanceComparison).toHaveLength(12);
    governanceComparison.forEach((r) => {
      expect(r.ungoverned.length).toBeGreaterThan(0);
      expect(r.governed.length).toBeGreaterThan(0);
    });
  });
});
