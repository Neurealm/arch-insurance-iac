import { describe, expect, it } from "vitest";
import {
  attainment, cshKpis, customerServices, DEFAULT_SERVICE_ID, errorBudgetBurn,
  matrixBand, matrixColumns, performanceSeries, protectionScenario, riskBreakdown,
  serviceRecommendation, serviceRoute, sloObjectives,
} from "@/pages/agentic-sre-noc/data/cshFixtures";

const chennai = customerServices.find((s) => s.id === DEFAULT_SERVICE_ID)!;

describe("customer service health fixtures", () => {
  it("provides a populated portfolio with unique ids", () => {
    expect(customerServices.length).toBeGreaterThanOrEqual(12);
    expect(new Set(customerServices.map((s) => s.id)).size).toBe(customerServices.length);
  });

  it("exposes eight outcome KPIs", () => {
    expect(cshKpis).toHaveLength(8);
    cshKpis.forEach((k) => expect(k.spark.length).toBeGreaterThan(3));
  });

  it("computes throughput attainment from committed capacity", () => {
    expect(attainment(chennai)).toBe(Math.round((chennai.deliveredGbps / chennai.committedGbps) * 1000) / 10);
    expect(attainment(chennai)).toBeLessThan(100);
  });

  it("scores every matrix dimension for every service", () => {
    customerServices.forEach((s) =>
      matrixColumns.forEach((c) => {
        const v = s.matrix[c.key];
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }),
    );
  });

  it("bands matrix scores deterministically", () => {
    expect(matrixBand(95)).toBe("good");
    expect(matrixBand(65)).toBe("watch");
    expect(matrixBand(40)).toBe("risk");
  });

  it("builds deterministic performance, SLO and burn series", () => {
    const a = performanceSeries(chennai);
    const b = performanceSeries(chennai);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(8);
    expect(sloObjectives(chennai).length).toBeGreaterThanOrEqual(4);
    expect(errorBudgetBurn(chennai).length).toBeGreaterThan(5);
  });

  it("builds an end to end route with an active path", () => {
    const route = serviceRoute(chennai);
    expect(route.nodes.length).toBeGreaterThanOrEqual(4);
    expect(route.edges.length).toBeGreaterThanOrEqual(2);
    expect(route.edges.some((e) => e.id === route.activeEdgeId)).toBe(true);
  });

  it("recommends a governed preventive action with evidence", () => {
    const rec = serviceRecommendation(chennai);
    expect(rec.evidence.length).toBeGreaterThanOrEqual(3);
    expect(rec.confidence).toBeGreaterThan(0);
    expect(rec.alternatives.length).toBeGreaterThanOrEqual(2);
    expect(riskBreakdown(chennai).length).toBeGreaterThanOrEqual(3);
  });

  it("requires human approval inside the protection scenario", () => {
    expect(protectionScenario.length).toBeGreaterThanOrEqual(8);
    expect(protectionScenario.some((s) => s.requiresApproval)).toBe(true);
  });
});
