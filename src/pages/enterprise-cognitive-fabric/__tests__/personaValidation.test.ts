import { describe, expect, it } from "vitest";
import {
  activeValidationFilterCount, applyValidationFilters, approvalChain, conflictSummary,
  defaultValidationFilters, defaultWorkbenchSection, dependencyValidations, downstreamConsumers,
  evidenceValidationRows, gapSummary, personaSections, qualityMetrics, reviewToRecord,
  sectionMatrix, thinkingCategories, validationConflicts, validationGaps, validationHistory,
  validationKpis, validationNotifications, validationReviews, validationScenarios, validationStages,
  validationStory, versionDiff, workbenchConditions,
} from "../persona-validation/data";

describe("Persona Validation data model", () => {
  it("seeds the eleven lifecycle stages in order", () => {
    expect(validationStages).toHaveLength(11);
    expect(validationStages.map((s) => s.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(validationStages[6].name).toBe("Resolve Conflicts and Gaps");
    expect(validationStages[6].status).toBe("Review Required");
  });

  it("exposes six KPIs with the required seeded values", () => {
    expect(validationKpis).toHaveLength(6);
    expect(validationKpis.map((k) => k.value)).toEqual(["14", "27", "91 / 100", "9", "12", "7 Personas"]);
    validationKpis.forEach((k) => {
      expect(k.tooltip.length).toBeGreaterThan(10);
      expect(k.trend.length).toBeGreaterThan(3);
    });
  });

  it("seeds the six validation queue reviews", () => {
    expect(validationReviews.map((r) => r.id)).toEqual(["PVR 3401", "PVR 3402", "PVR 3403", "PVR 3404", "PVR 3405", "PVR 3406"]);
    const first = validationReviews[0];
    expect(first.persona).toBe("Payments Platform");
    expect(first.reviewType).toBe("Team Owner Review");
    expect(first.quality).toBe(94);
    expect(first.downstreamImpact).toBe("2 active evaluations");
    const identity = validationReviews[1];
    expect(identity.priority).toBe("Critical");
    expect(identity.status).toBe("Blocked");
    expect(identity.conflicts).toBe(3);
  });

  it("filters reviews and counts active filters", () => {
    expect(applyValidationFilters(validationReviews, defaultValidationFilters, "")).toHaveLength(6);
    const critical = applyValidationFilters(validationReviews, { ...defaultValidationFilters, priority: "Critical" }, "");
    expect(critical.map((r) => r.id)).toEqual(["PVR 3402"]);
    const overdue = applyValidationFilters(validationReviews, { ...defaultValidationFilters, overdueOnly: "Overdue only" }, "");
    expect(overdue).toHaveLength(1);
    expect(applyValidationFilters(validationReviews, defaultValidationFilters, "fraud").length).toBeGreaterThan(0);
    expect(activeValidationFilterCount({ ...defaultValidationFilters, priority: "High", team: "Payments Platform" })).toBe(2);
  });

  it("supports 26 or more global filters", () => {
    expect(Object.keys(defaultValidationFilters).length).toBeGreaterThanOrEqual(26);
  });

  it("provides the fifteen selectable Persona sections and workbench content", () => {
    expect(personaSections.length).toBe(15);
    const section = defaultWorkbenchSection("approval-requirements");
    expect(section.statement).toContain("10 percent");
    expect(defaultWorkbenchSection("controls").persona).toBe("Payments Platform");
  });

  it("links conditions, evidence and Persona sections", () => {
    const approval = workbenchConditions.filter((c) => c.sectionId === "approval-requirements");
    expect(approval).toHaveLength(2);
    expect(approval[0].authority).toBe("Primary");
    expect(approval[1].authority).toBe("Supporting");
    expect(approval.every((c) => c.passage.length > 20 && c.artifact.length > 3)).toBe(true);
  });

  it("covers the full section validation matrix", () => {
    expect(sectionMatrix.length).toBe(21);
    expect(sectionMatrix.map((r) => r.section)).toContain("Approval Requirements");
    expect(sectionMatrix.every((r) => personaSections.some((s) => s.id === r.sectionId))).toBe(true);
  });

  it("seeds conflicts with comparison dimensions and resolutions", () => {
    expect(conflictSummary.reduce((a, c) => a + c.value, 0)).toBe(23);
    expect(validationConflicts).toHaveLength(4);
    const retry = validationConflicts[0];
    expect(retry.conflictType).toBe("Threshold Conflict");
    expect(retry.recommendedResolution).toContain("10 percent");
    expect(validationConflicts.map((c) => c.severity)).toEqual(["High", "Critical", "High", "High"]);
  });

  it("seeds gaps and gap summary categories", () => {
    expect(gapSummary).toHaveLength(9);
    expect(gapSummary.find((g) => g.type === "Stale Evidence")?.value).toBe(12);
    expect(validationGaps.some((g) => g.gapType === "Missing Owners")).toBe(true);
  });

  it("seeds evidence validation with exact passages", () => {
    expect(evidenceValidationRows.length).toBeGreaterThanOrEqual(5);
    expect(evidenceValidationRows.every((e) => e.passage.length > 20)).toBe(true);
    expect(evidenceValidationRows.some((e) => e.freshness === "Stale")).toBe(true);
  });

  it("seeds dependency owner validation states", () => {
    expect(dependencyValidations).toHaveLength(4);
    expect(dependencyValidations.filter((d) => d.status === "Approved")).toHaveLength(2);
    expect(dependencyValidations.filter((d) => d.status === "Pending")).toHaveLength(2);
    expect(dependencyValidations[2].relationship).toBe("CONSUMES");
  });

  it("validates How This Team Thinks categories", () => {
    expect(thinkingCategories).toHaveLength(7);
    const priorities = thinkingCategories[0];
    expect(priorities.items).toContain("Payment integrity");
    expect(thinkingCategories.every((c) => c.conditionCount > 0 && c.evidenceCoverage > 0)).toBe(true);
  });

  it("models the eight stage approval chain", () => {
    expect(approvalChain).toHaveLength(8);
    expect(approvalChain.map((a) => a.name)).toEqual([
      "Draft Complete", "Persona Owner Review", "Team Owner Approval", "Dependency Owner Review",
      "Architecture Review", "Governance Approval", "Approved", "Published",
    ]);
  });

  it("reports twelve validation quality dimensions", () => {
    expect(qualityMetrics).toHaveLength(12);
    expect(qualityMetrics.find((m) => m.name === "Dependency Validation")?.score).toBe(88);
    expect(qualityMetrics.every((m) => m.target === 95)).toBe(true);
  });

  it("models downstream consumers and blocked state", () => {
    expect(downstreamConsumers.map((c) => c.consumer)).toEqual([
      "Cognitive Intake", "Persona Impact Analysis", "Cross Team Impact Matrix",
      "Decision Intelligence", "Cognitive Search", "MCP Context Services",
    ]);
    expect(downstreamConsumers.filter((c) => c.status === "Blocked")).toHaveLength(4);
  });

  it("models version validation changes", () => {
    expect(versionDiff.some((r) => r.section === "Approval Requirements" && r.current.includes("10 percent"))).toBe(true);
    expect(versionDiff.filter((r) => r.change === "Unchanged").length).toBeGreaterThan(0);
    expect(versionDiff.filter((r) => r.change === "Changed").length).toBeGreaterThan(5);
  });

  it("preserves validation history including drift reopen", () => {
    expect(validationHistory[0].action).toBe("Persona Constructed");
    expect(validationHistory.some((h) => h.action === "Drift Detected")).toBe(true);
    expect(validationHistory.every((h) => h.auditId.startsWith("AUD"))).toBe(true);
  });

  it("provides notification categories and unread items", () => {
    expect(validationNotifications.filter((n) => !n.read).length).toBeGreaterThan(0);
    const categories = validationNotifications.map((n) => n.category);
    expect(categories).toContain("Conflict Detected");
    expect(categories).toContain("Validation Reopened Due to Drift");
  });

  it("provides ten demo story steps with captions and notes", () => {
    expect(validationStory).toHaveLength(10);
    expect(validationStory[0].caption).toContain("trusted enterprise context");
    expect(validationStory.every((s) => s.notes.length > 5)).toBe(true);
  });

  it("provides nineteen demo scenarios that stay internally consistent", () => {
    expect(validationScenarios).toHaveLength(19);
    const ids = validationScenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("reset");
    validationScenarios.forEach((s) => {
      expect(s.banner.length).toBeGreaterThan(10);
      Object.keys(s.reviewOverrides).forEach((id) => {
        expect(validationReviews.some((r) => r.id === id)).toBe(true);
      });
      Object.keys(s.kpiOverrides).forEach((id) => {
        expect(validationKpis.some((k) => k.id === id)).toBe(true);
      });
    });
    const approvedScenario = validationScenarios.find((s) => s.id === "approved")!;
    expect(approvedScenario.reviewOverrides["PVR 3401"].status).toBe("Approved");
    expect(approvedScenario.reviewOverrides["PVR 3401"].conflicts).toBe(0);
  });

  it("exports review records for CSV and JSON generation", () => {
    const record = reviewToRecord(validationReviews[0]);
    expect(Object.keys(record)).toContain("evidenceCoverage");
    expect(Object.values(record)).toContain("PVR 3401");
  });
});
