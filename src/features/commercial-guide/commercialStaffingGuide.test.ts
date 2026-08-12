import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialStaffingGuide } from "@/features/commercial-guide/content/pages/commercialStaffing";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialStaffingResources.tsx", "utf8");
const DATA_SRC = readFileSync("src/data/staffingResourcesMockData.ts", "utf8");

const TARGET_SOURCES: Record<string, string> = {
  "staffing-scenario": "src/commercial/staffing/StaffingHeader.tsx",
  "staffing-summary": "src/commercial/staffing/StaffingSummaryCards.tsx",
  "staffing-filters": "src/commercial/staffing/StaffingFilters.tsx",
  "staffing-role-plan": "src/commercial/staffing/RoleStaffingTable.tsx",
  "staffing-function-allocation": "src/commercial/staffing/FunctionalAllocationChart.tsx",
  "staffing-resource-health": "src/commercial/staffing/ResourceHealthPanel.tsx",
  "staffing-phase-cards": "src/commercial/staffing/OperationalPhaseCards.tsx",
  "staffing-forecast": "src/commercial/staffing/StaffingForecastChart.tsx",
  "staffing-critical-roles": "src/commercial/staffing/CriticalRoleCoverage.tsx",
  "staffing-pipeline": "src/commercial/staffing/ResourcePipeline.tsx",
  "staffing-operating-structures": "src/commercial/staffing/OperatingStructureCards.tsx",
  "staffing-capacity-gaps": "src/commercial/staffing/CapacityGapTable.tsx",
  "staffing-risks": "src/commercial/staffing/ResourceRiskTable.tsx",
  "staffing-executive-attention": "src/commercial/staffing/ExecutiveStaffingAttention.tsx",
};

const ALL_TARGETS = Object.keys(TARGET_SOURCES);

describe("CDT-COMMERCIAL-GUIDE-STAFFING", () => {
  it("resolves page-specific content on the staffing route", () => {
    const guide = resolveGuideForRoute("/commercial/staffing-resources");
    expect(guide?.pageId).toBe("commercial-staffing-resources");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toContain("Staffing & Resources");
  });

  it("uses the exact registered page title and route", () => {
    expect(commercialStaffingGuide.pageTitle).toBe("Staffing & Resources");
    expect(commercialStaffingGuide.route).toBe("/commercial/staffing-resources");
    expect(PAGE_SRC).toContain("StaffingSummaryCards");
  });

  it("declares only targets that exist on the page", () => {
    for (const t of commercialStaffingGuide.showOnPageTargets) {
      expect(ALL_TARGETS).toContain(t.targetId);
    }
    expect(commercialStaffingGuide.showOnPageTargets).toHaveLength(ALL_TARGETS.length);
  });

  it("anchors every target as a real data-guide-target attribute", () => {
    for (const [target, file] of Object.entries(TARGET_SOURCES)) {
      expect(readFileSync(file, "utf8")).toContain(`data-guide-target="${target}"`);
    }
  });

  it("maps every section target to a declared show-on-page target", () => {
    const declared = new Set(commercialStaffingGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialStaffingGuide.sections) {
      if (s.targetId) expect(declared.has(s.targetId)).toBe(true);
    }
  });

  it("describes only values the page actually renders", () => {
    for (const fact of ["48.5", "54.5", "93%", "42 of 45", "August 16 to October 15, 2026"]) {
      expect(DATA_SRC).toContain(fact);
    }
    for (const name of [
      "SRE Lead",
      "Transition Lead",
      "Automation Lead",
      "Problem Manager",
      "RunOps and SRE CoE",
      "Enterprise Shared Services",
      "Account Pods",
      "Delivery Pods",
    ]) {
      expect(DATA_SRC).toContain(name);
    }
    expect(DATA_SRC).toContain("factor: 0.88");
    expect(DATA_SRC).toContain("factor: 1.15");
  });

  it("distinguishes the twelve staffing concepts the guide must teach", () => {
    const corpus = [
      commercialStaffingGuide.purpose,
      ...commercialStaffingGuide.businessRules.map((r) => `${r.rule} ${r.explanation}`),
      ...commercialStaffingGuide.faqs.map((f) => `${f.question} ${f.answer}`),
      ...commercialStaffingGuide.glossary.map((g) => `${g.term} ${g.definition}`),
      ...commercialStaffingGuide.outputs.map((o) => `${o.label} ${o.description}`),
    ]
      .join(" | ")
      .toLowerCase();
    for (const concept of [
      "peak",
      "planned",
      "filled",
      "open position",
      "shared resource",
      "dedicated",
      "contractor",
      "internal transfer",
      "coe",
      "available",
      "utilization",
      "staffing cost",
    ]) {
      expect(corpus).toContain(concept);
    }
    for (const term of [
      "FTE",
      "Peak FTE",
      "Named Resource",
      "Filled Position",
      "Open Position",
      "Shared Resource",
      "Dedicated Resource",
      "Contractor",
      "Utilization",
      "Capacity Gap",
      "CoE",
      "Loaded Cost",
    ]) {
      expect(commercialStaffingGuide.glossary.map((g) => g.term)).toContain(term);
    }
  });

  it("covers the required audiences, lifecycle stages and prerequisites", () => {
    for (const a of ["Delivery", "Operations", "Commercial Lead", "Finance", "Executive"] as const) {
      expect(commercialStaffingGuide.audiences).toContain(a);
    }
    for (const s of [
      "Commercial Structuring",
      "Financial Modeling",
      "Delivery Planning",
      "Mobilization",
      "Execution",
      "Operations",
      "Continuous Improvement",
    ] as const) {
      expect(commercialStaffingGuide.lifecycleStages).toContain(s);
    }
    expect(commercialStaffingGuide.prerequisites).toHaveLength(10);
    const users = commercialStaffingGuide.ownership.primaryUsers ?? [];
    for (const r of [
      "Staffing Lead",
      "Delivery Lead",
      "RunOps Lead",
      "SRE Lead",
      "Program Director",
      "Finance",
      "Commercial Lead",
      "Customer Success Lead",
      "Executive Sponsor",
      "Functional Managers",
    ]) {
      expect(users).toContain(r);
    }
  });

  it("declares ownership and the relationship map in both directions", () => {
    const o = commercialStaffingGuide.ownership;
    expect(o.businessOwner).toBe("Delivery Executive");
    expect(o.commercialOwner).toBe("Commercial Lead");
    expect(o.technicalOwner).toBe("RunOps Lead");
    expect(o.executiveApprover).toBe("Executive Sponsor");
    const r = commercialStaffingGuide.relationship;
    expect(r.receivesFrom).toHaveLength(10);
    expect(r.models).toContain("FTE demand");
    expect(r.models).toContain("Hiring pipeline");
    expect(r.feeds).toContain("P&L");
    expect(r.feeds).toContain("Cash");
    expect(r.feeds).toContain("Scenario feasibility");
  });

  it("answers the eight required user questions", () => {
    expect(commercialStaffingGuide.questionsAnswered).toHaveLength(8);
    const qs = commercialStaffingGuide.questionsAnswered.join(" ").toLowerCase();
    for (const fragment of [
      "how many resources",
      "when are they needed",
      "critical",
      "open",
      "capacity sufficient",
      "overallocated",
      "cost impact",
      "activation plan",
    ]) {
      expect(qs).toContain(fragment);
    }
  });

  it("states the fifteen required business rules", () => {
    expect(commercialStaffingGuide.businessRules).toHaveLength(15);
    const rules = commercialStaffingGuide.businessRules.map((r) => r.rule.toLowerCase()).join(" | ");
    for (const fragment of [
      "peak fte demand is not the same as total named headcount",
      "filled does not mean available",
      "must not be counted as fully dedicated",
      "contractor and employee costs",
      "must align with activation",
      "cannot be considered feasible without capacity",
      "may gate day 0 or day 1 readiness",
      "utilization above the defined threshold",
      "required-by dates",
      "must include skills",
      "must reconcile to p&l",
      "must reconcile to cash",
      "automation assumptions must not reduce day 1 staffing",
      "location mix",
      "sourcing strategy",
    ]) {
      expect(rules).toContain(fragment);
    }
  });

  it("provides the twelve required outputs and the recommended workflow", () => {
    expect(commercialStaffingGuide.outputs).toHaveLength(12);
    expect(commercialStaffingGuide.workflow).toHaveLength(13);
    expect(commercialStaffingGuide.workflow.map((w) => w.step)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    ]);
  });

  it("covers required team activities and all three interpretation bands", () => {
    const roles = commercialStaffingGuide.teamActivities.map((t) => t.role);
    for (const r of [
      "Staffing Lead",
      "Delivery Lead",
      "RunOps Lead",
      "SRE Lead",
      "Customer Success Lead",
      "Finance",
      "Program Director",
      "Commercial Lead",
      "Governance Lead",
      "Executive Sponsor",
    ]) {
      expect(roles).toContain(r);
    }
    expect(commercialStaffingGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
    const critical = commercialStaffingGuide.interpretation.find((i) => i.band === "critical")!;
    expect(critical.criteria.join(" ").toLowerCase()).toContain("cannot be staffed");
  });

  it("includes the ten common mistakes, ten FAQs and the activation worked example", () => {
    expect(commercialStaffingGuide.commonMistakes).toHaveLength(10);
    expect(commercialStaffingGuide.faqs).toHaveLength(10);
    expect(commercialStaffingGuide.workedExamples).toHaveLength(1);
    const we = commercialStaffingGuide.workedExamples[0];
    const text = `${we.narrative} ${we.steps?.join(" ")} ${we.result}`.toLowerCase();
    for (const fragment of ["activation", "runops", "customer success", "hiring", "cash", "schedule risk", "capacity"]) {
      expect(text).toContain(fragment);
    }
  });

  it("records prototype limitations honestly", () => {
    const gaps = commercialStaffingGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    expect(gaps).toContain("cost");
    expect(gaps).toContain("persist");
    expect(commercialStaffingGuide.dataQuality.changeControl.toLowerCase()).toContain("local react state");
  });
});
