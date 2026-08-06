import { describe, expect, it } from "vitest";
import {
  applyLibraryFilters, defaultLibraryFilters, libraryKpis, libraryPersonas, libraryScenarios,
  libraryStory, personaToRecord, qualityDimensions, relationshipEdges, versionDiff,
} from "../persona-library/data";
import { viewColumns } from "../persona-library/panels";

describe("Team Persona Library data", () => {
  it("seeds nine Personas with the expected identifiers", () => {
    expect(libraryPersonas).toHaveLength(9);
    expect(libraryPersonas[0].id).toBe("PERSONA 1001");
    expect(libraryPersonas[0].teamName).toBe("Payments Platform");
  });

  it("renders six KPI cards", () => {
    expect(libraryKpis).toHaveLength(6);
    expect(libraryKpis.map((k) => k.value)).toContain("72");
  });

  it("fully represents How This Team Thinks for every Persona", () => {
    for (const p of libraryPersonas) {
      const t = p.thinking;
      expect(t.decisionPriorities.length).toBeGreaterThan(0);
      expect(t.successCriteria.length).toBeGreaterThan(0);
      expect(t.failureModes.length).toBeGreaterThan(0);
      expect(t.commonTradeoffs.length).toBeGreaterThan(0);
      expect(t.preferredEvidence.length).toBeGreaterThan(0);
      expect(t.escalationPhilosophy.length).toBeGreaterThan(0);
      expect(t.riskAppetite.length).toBeGreaterThan(0);
    }
  });

  it("filters by business unit, status and freshness", () => {
    const byUnit = applyLibraryFilters(libraryPersonas, { ...defaultLibraryFilters, businessUnit: "Commerce Engineering" }, "");
    expect(byUnit.every((p) => p.businessUnit === "Commerce Engineering")).toBe(true);
    const review = applyLibraryFilters(libraryPersonas, { ...defaultLibraryFilters, personaStatus: "Review Required" }, "");
    expect(review.length).toBe(2);
    const aging = applyLibraryFilters(libraryPersonas, { ...defaultLibraryFilters, freshness: "Aging" }, "");
    expect(aging.every((p) => p.freshnessStatus === "Aging")).toBe(true);
  });

  it("clears filters back to the full library", () => {
    expect(applyLibraryFilters(libraryPersonas, defaultLibraryFilters, "")).toHaveLength(9);
  });

  it("searches across teams and services", () => {
    expect(applyLibraryFilters(libraryPersonas, defaultLibraryFilters, "fraud")[0].teamName).toBe("Fraud Engineering");
    expect(applyLibraryFilters(libraryPersonas, defaultLibraryFilters, "zzz")).toHaveLength(0);
  });

  it("defines distinct columns per view", () => {
    expect(viewColumns.portfolio.map((c) => c.label)).toContain("Primary Mission");
    expect(viewColumns["operating-model"].map((c) => c.label)).toContain("Decision Rules");
    expect(viewColumns.relationship.map((c) => c.label)).toContain("Upstream Teams");
    expect(viewColumns.governance.map((c) => c.label)).toContain("Drift");
  });

  it("provides twelve quality dimensions with targets", () => {
    expect(qualityDimensions).toHaveLength(12);
    expect(qualityDimensions.every((d) => d.target === 95)).toBe(true);
  });

  it("provides relationship edges with supporting conditions", () => {
    expect(relationshipEdges.length).toBeGreaterThan(10);
    expect(relationshipEdges.every((e) => e.conditions.length > 0)).toBe(true);
  });

  it("provides a version diff including the retry threshold change", () => {
    const row = versionDiff.find((r) => r.section === "Approval Requirements");
    expect(row?.previous).toContain("20 percent");
    expect(row?.current).toContain("10 percent");
  });

  it("provides sixteen demo scenarios and ten story steps", () => {
    expect(libraryScenarios).toHaveLength(16);
    expect(libraryStory).toHaveLength(10);
    const drift = libraryScenarios.find((s) => s.id === "material-drift")!;
    expect(drift.personaOverrides["PERSONA 1001"].driftStatus).toBe("Material");
    expect(drift.extraNotification).toBeDefined();
    expect(drift.extraAttention).toBeDefined();
    expect(drift.extraActivity).toBeDefined();
  });

  it("exports a flat record for CSV and JSON generation", () => {
    const rec = personaToRecord(libraryPersonas[0]);
    expect(Object.keys(rec)).toContain("mission");
    expect(rec.quality).toBe(94);
  });
});
