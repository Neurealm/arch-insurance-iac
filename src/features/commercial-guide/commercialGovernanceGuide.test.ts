import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialGovernanceGuide } from "@/features/commercial-guide/content/pages/commercialGovernance";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialNeurealmGovernance.tsx", "utf8");
const DATA_SRC = readFileSync("src/data/neurealmGovernanceMockData.ts", "utf8");

const COMPONENT_FILES = [
  "GovernanceHeader",
  "GovernanceSummaryCards",
  "GovernanceOperatingModel",
  "OperationalPhaseCards",
  "GovernanceForumsTable",
  "RaciSnapshot",
  "GovernanceRisksTable",
  "GovernanceDecisionsTable",
  "GovernanceKpiTable",
  "ExecutiveAttentionPanel",
  "GovernanceCalendar",
  "GovernanceActivityFeed",
];

const COMPONENT_SRC = COMPONENT_FILES.map((f) =>
  readFileSync(`src/commercial/governance/${f}.tsx`, "utf8"),
).join("\n");

const EXPECTED_TARGETS = [
  "governance-summary",
  "governance-health",
  "governance-tiers",
  "governance-operational-focus",
  "governance-forums",
  "governance-raci",
  "governance-risks",
  "governance-decisions",
  "governance-kpis",
  "governance-executive-attention",
  "governance-calendar",
  "governance-activity",
];

describe("CDT-COMMERCIAL-GUIDE-GOVERNANCE", () => {
  it("resolves page-specific content on the governance route", () => {
    const guide = resolveGuideForRoute("/commercial/neurealm-governance");
    expect(guide?.pageId).toBe("commercial-governance");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("Governance — Who Decides, Who Owns, and What Is Blocked");
  });

  it("uses the exact registered page title and route", () => {
    expect(commercialGovernanceGuide.pageTitle).toBe("Governance");
    expect(commercialGovernanceGuide.route).toBe("/commercial/neurealm-governance");
    expect(DATA_SRC).toContain('title: "Governance"');
  });

  it("declares every requested show-on-page target", () => {
    const declared = commercialGovernanceGuide.showOnPageTargets.map((t) => t.targetId);
    for (const t of EXPECTED_TARGETS) {
      expect(declared, `guide missing target ${t}`).toContain(t);
    }
    expect(declared).toHaveLength(EXPECTED_TARGETS.length);
  });

  it("anchors every declared target in real rendered markup", () => {
    for (const t of commercialGovernanceGuide.showOnPageTargets) {
      expect(COMPONENT_SRC, `missing anchor ${t.targetId}`).toContain(
        `data-guide-target="${t.targetId}"`,
      );
    }
  });

  it("keeps every section bound to a declared target", () => {
    const declared = new Set(commercialGovernanceGuide.showOnPageTargets.map((t) => t.targetId));
    for (const section of commercialGovernanceGuide.sections) {
      expect(section.targetId, `section ${section.id} has no target`).toBeTruthy();
      expect(declared, `section ${section.id} targets an undeclared id`).toContain(section.targetId);
    }
  });

  it("mounts the governance sections the guide describes", () => {
    for (const c of [
      "GovernanceSummaryCards",
      "GovernanceOperatingModel",
      "OperationalPhaseCards",
      "GovernanceForumsTable",
      "RaciSnapshot",
      "GovernanceRisksTable",
      "GovernanceDecisionsTable",
      "GovernanceKpiTable",
      "ExecutiveAttentionPanel",
      "GovernanceCalendar",
      "GovernanceActivityFeed",
    ]) {
      expect(PAGE_SRC, `page does not render ${c}`).toContain(`<${c}`);
    }
  });

  it("quotes governance facts that exist in the source data", () => {
    const body = JSON.stringify(commercialGovernanceGuide);
    for (const fact of [
      "Executive Steering Committee",
      "Program Management Office",
      "Delivery and Operations Pods",
      "Commercial Governance Council",
      "Technical Advisory Board",
      "Change Advisory Board",
      "Customer Success Council",
      "RunOps and SRE Council",
    ]) {
      expect(DATA_SRC, `${fact} missing from data`).toContain(fact);
      expect(body, `${fact} missing from guide`).toContain(fact);
    }
  });

  it("covers the mandated business rules and glossary terms", () => {
    expect(commercialGovernanceGuide.businessRules).toHaveLength(13);
    const terms = commercialGovernanceGuide.glossary.map((g) => g.term);
    for (const t of [
      "Governance",
      "Forum",
      "RACI",
      "Risk",
      "Issue",
      "Decision",
      "Escalation",
      "Gate",
      "Mitigation",
      "Decision Evidence",
    ]) {
      expect(terms).toContain(t);
    }
  });

  it("answers the mandated FAQs and questions", () => {
    expect(commercialGovernanceGuide.faqs).toHaveLength(8);
    expect(commercialGovernanceGuide.questionsAnswered).toHaveLength(8);
    expect(commercialGovernanceGuide.workedExamples).toHaveLength(1);
    expect(commercialGovernanceGuide.workedExamples[0].title).toContain("Commercial framework approval");
  });

  it("provides all three interpretation bands", () => {
    const bands = commercialGovernanceGuide.interpretation.map((i) => i.band);
    expect(bands).toEqual(["healthy", "warning", "critical"]);
  });

  it("declares the primary governance outputs", () => {
    const labels = commercialGovernanceGuide.outputs.map((o) => o.label);
    for (const l of [
      "Decision record",
      "Risk record",
      "Issue record",
      "Approval",
      "RACI",
      "Forum schedule",
      "Gate decision",
      "Executive escalation",
      "Governance KPI",
      "Action register",
    ]) {
      expect(labels).toContain(l);
    }
  });

  it("records the prototype/mock limitation as a known gap", () => {
    const gaps = commercialGovernanceGuide.dataQuality.knownGaps.join(" ");
    expect(gaps.toLowerCase()).toContain("prototype");
  });
});
