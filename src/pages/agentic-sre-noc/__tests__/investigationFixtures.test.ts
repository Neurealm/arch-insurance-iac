import { describe, expect, it } from "vitest";
import { customerServices } from "../data/cshFixtures";
import { links } from "../data/goocFixtures";
import { situationHeader, situationRoute } from "../data/situationFixtures";
import {
  causeHypotheses, domainSignals, eliminatedCauses, EVIDENCE_DOMAINS,
  INVESTIGATION_STATES, investigationAgents, investigationComparison,
  investigationEvents, investigationHeader, investigationKpis,
  investigationScenario, investigationTasks, readinessChecks, recentChanges,
  routeSegmentEvidence, similarIncidents, TASK_COLUMNS, validationTests,
} from "../data/investigationFixtures";

describe("investigationFixtures", () => {
  it("reuses the existing situation, customer service and link identifiers", () => {
    expect(investigationHeader.situationId).toBe(situationHeader.id);
    expect(customerServices.some((s) => s.id === investigationHeader.serviceId)).toBe(true);
    expect(links.some((l) => l.id === investigationHeader.linkId)).toBe(true);
    expect(investigationHeader.region).toBe(situationHeader.region);
    expect(investigationHeader.product).toBe(situationHeader.product);
  });

  it("exposes eight KPI cards with unique ids", () => {
    expect(investigationKpis).toHaveLength(8);
    expect(new Set(investigationKpis.map((k) => k.id)).size).toBe(8);
  });

  it("ranks fog as the leading cause at 94 percent", () => {
    expect(causeHypotheses).toHaveLength(8);
    const leading = [...causeHypotheses].sort((a, b) => b.confidence - a.confidence)[0];
    expect(leading.id).toBe("hyp-fog");
    expect(leading.confidence).toBe(94);
    expect(leading.status).toBe("Leading Cause");
    expect(causeHypotheses.filter((h) => h.status === "Eliminated")).toHaveLength(6);
    expect(causeHypotheses.filter((h) => h.status === "Monitoring")).toHaveLength(1);
  });

  it("gives every hypothesis supporting and contradicting evidence", () => {
    causeHypotheses.forEach((h) => {
      expect(h.supporting.length).toBeGreaterThan(0);
      expect(h.contradicting.length).toBeGreaterThan(0);
      expect(h.confidenceHistory.length).toBeGreaterThan(1);
      expect(EVIDENCE_DOMAINS).toContain(h.domain);
    });
  });

  it("covers all six evidence domains with signals bound to known hypotheses", () => {
    const ids = new Set(causeHypotheses.map((h) => h.id));
    EVIDENCE_DOMAINS.forEach((d) => {
      expect(domainSignals.filter((s) => s.domain === d).length).toBeGreaterThanOrEqual(8);
    });
    domainSignals.forEach((s) => expect(ids.has(s.hypothesisId)).toBe(true));
  });

  it("keeps the eliminated register aligned with eliminated hypotheses", () => {
    expect(eliminatedCauses).toHaveLength(6);
    const ids = new Set(causeHypotheses.map((h) => h.id));
    eliminatedCauses.forEach((c) => {
      expect(ids.has(c.hypothesisId)).toBe(true);
      expect(c.currentConfidence).toBeLessThan(c.originalConfidence);
      expect(c.rationale.length).toBeGreaterThan(40);
    });
  });

  it("models the full customer to downstream route using shared node identifiers", () => {
    expect(routeSegmentEvidence).toHaveLength(situationRoute.nodes.length);
    const nodeIds = new Set(situationRoute.nodes.map((n) => n.id));
    routeSegmentEvidence.forEach((s) => expect(nodeIds.has(s.nodeId)).toBe(true));
  });

  it("ranks five similar incidents by descending similarity", () => {
    expect(similarIncidents).toHaveLength(5);
    for (let i = 1; i < similarIncidents.length; i += 1) {
      expect(similarIncidents[i].similarity).toBeLessThanOrEqual(similarIncidents[i - 1].similarity);
    }
  });

  it("provides recent changes and validation tests bound to hypotheses", () => {
    expect(recentChanges.length).toBeGreaterThanOrEqual(4);
    const ids = new Set(causeHypotheses.map((h) => h.id));
    validationTests.forEach((v) => expect(ids.has(v.hypothesisId)).toBe(true));
  });

  it("provides eight investigation agents and a task board inside declared columns", () => {
    expect(investigationAgents).toHaveLength(8);
    investigationTasks.forEach((t) => expect(TASK_COLUMNS).toContain(t.status));
    expect(investigationTasks.length).toBeGreaterThanOrEqual(10);
  });

  it("provides a twenty stage scenario using declared investigation states", () => {
    expect(investigationScenario).toHaveLength(20);
    investigationScenario.forEach((s) => expect(INVESTIGATION_STATES).toContain(s.state));
    expect(investigationScenario.some((s) => s.requiresApproval)).toBe(true);
    expect(investigationScenario[investigationScenario.length - 1].leadingConfidence).toBe(94);
  });

  it("tracks conclusion readiness checks with allowed statuses", () => {
    expect(readinessChecks).toHaveLength(12);
    readinessChecks.forEach((c) =>
      expect(["Passed", "Pending", "Failed", "Not applicable"]).toContain(c.status));
  });

  it("records timeline events with known domains", () => {
    expect(investigationEvents.length).toBeGreaterThanOrEqual(15);
    investigationEvents.forEach((e) => expect(EVIDENCE_DOMAINS).toContain(e.domain));
  });

  it("compares traditional and agentic investigation across ten dimensions", () => {
    expect(investigationComparison).toHaveLength(10);
    investigationComparison.forEach((r) => {
      expect(r.traditional.length).toBeGreaterThan(0);
      expect(r.agentic.length).toBeGreaterThan(0);
    });
  });
});
