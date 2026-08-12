import { describe, expect, it } from "vitest";
import { customerServices } from "../data/cshFixtures";
import { links } from "../data/goocFixtures";
import {
  evidenceItems, hypotheses, situationAgents, situationEvents, situationHeader,
  situationKpis, situationRoute, situationScenario, situationSeries,
  SITUATION_STATES, validationChecks, WORKSTREAM_COLUMNS, workItems,
} from "../data/situationFixtures";

describe("situationFixtures", () => {
  it("reuses existing customer service and link identifiers", () => {
    expect(customerServices.some((s) => s.id === situationHeader.serviceId)).toBe(true);
    expect(links.some((l) => l.id === situationHeader.linkId)).toBe(true);
  });

  it("exposes eight KPI cards with unique ids", () => {
    expect(situationKpis).toHaveLength(8);
    expect(new Set(situationKpis.map((k) => k.id)).size).toBe(8);
  });

  it("models a route from the customer network to downstream traffic", () => {
    expect(situationRoute.nodes).toHaveLength(9);
    expect(situationRoute.nodes[0].id).toBe("n-customer");
    expect(situationRoute.nodes[situationRoute.nodes.length - 1].id).toBe("n-downstream");
    const ids = new Set(situationRoute.nodes.map((n) => n.id));
    situationRoute.edges.forEach((e) => {
      expect(ids.has(e.from)).toBe(true);
      expect(ids.has(e.to)).toBe(true);
    });
    expect(situationRoute.edges.some((e) => e.transport === "RF fallback" && e.state === "Active")).toBe(true);
  });

  it("ranks fog as the leading hypothesis", () => {
    expect(hypotheses[0].confidence).toBe(94);
    expect(hypotheses[0].leading).toBe(true);
    hypotheses.slice(1).forEach((h) => expect(h.confidence).toBeLessThan(hypotheses[0].confidence));
  });

  it("provides eight digital coworkers and a full scenario", () => {
    expect(situationAgents).toHaveLength(8);
    expect(situationScenario).toHaveLength(18);
    situationScenario.forEach((s) => expect(SITUATION_STATES).toContain(s.state));
    expect(situationScenario.some((s) => s.requiresApproval)).toBe(true);
  });

  it("keeps workstream items inside the declared columns", () => {
    workItems.forEach((i) => expect(WORKSTREAM_COLUMNS).toContain(i.status));
  });

  it("produces a deterministic telemetry series that degrades then recovers", () => {
    expect(situationSeries).toHaveLength(21);
    const start = situationSeries[0];
    const worst = situationSeries[13];
    const end = situationSeries[situationSeries.length - 1];
    expect(worst.marginA).toBeLessThan(start.marginA);
    expect(worst.attenuation).toBeGreaterThan(start.attenuation);
    expect(end.marginA).toBeGreaterThan(worst.marginA);
  });

  it("links timeline events to known evidence records", () => {
    const evidenceIds = new Set(evidenceItems.map((e) => e.id));
    situationEvents.forEach((e) => expect(evidenceIds.has(e.evidence)).toBe(true));
  });

  it("tracks validation checks with allowed statuses", () => {
    validationChecks.forEach((v) =>
      expect(["Passed", "Pending", "Failed", "Not applicable"]).toContain(v.status));
  });
});
