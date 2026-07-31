import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialCashGuide } from "@/features/commercial-guide/content/pages/commercialCash";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialCash.tsx", "utf8");

/** Targets applied as literal JSX attributes on the page. */
const STATIC_TARGETS = [
  "cash-context",
  "cash-run-header",
  "cash-scenario",
  "cash-timing",
  "cash-peak-need",
  "cash-summary",
  "cash-breakeven",
  "cash-payback",
  "cash-sustainability",
];

/** Targets carried on row definitions and rendered via {r.target}. */
const ROW_TARGETS = [
  "cash-accrued",
  "cash-inflows",
  "cash-outflows",
  "cash-net",
  "cash-cumulative",
  "cash-annual-net",
  "cash-annual-cumulative",
  "cash-conversion",
  "cash-wc-requirement",
];

const ALL_TARGETS = [...STATIC_TARGETS, ...ROW_TARGETS];

describe("CDT-COMMERCIAL-GUIDE-CASH", () => {
  it("resolves page-specific content on the cash route", () => {
    const guide = resolveGuideForRoute("/commercial/model/cash");
    expect(guide?.pageId).toBe("commercial-cash");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("Cash & Sustainability — When the Money Actually Moves");
  });

  it("uses the exact registered page title and route", () => {
    expect(commercialCashGuide.pageTitle).toBe("Cash & Sustainability");
    expect(commercialCashGuide.route).toBe("/commercial/model/cash");
    expect(PAGE_SRC).toContain("Cash Flow, Working Capital, Break-even & Sustainability");
  });

  it("declares only targets that exist on the page", () => {
    for (const t of commercialCashGuide.showOnPageTargets) {
      expect(ALL_TARGETS).toContain(t.targetId);
      expect(PAGE_SRC).toContain(`"${t.targetId}"`);
    }
  });

  it("anchors static targets as JSX data-guide-target attributes", () => {
    for (const t of STATIC_TARGETS) {
      expect(PAGE_SRC).toContain(`data-guide-target="${t}"`);
    }
  });

  it("passes row targets through the table row contract", () => {
    expect(PAGE_SRC).toContain("data-guide-target={r.target}");
    for (const t of ROW_TARGETS) {
      expect(PAGE_SRC).toContain(`target: "${t}"`);
    }
  });

  it("maps every section target to a declared show-on-page target", () => {
    const declared = new Set(commercialCashGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialCashGuide.sections) {
      if (s.targetId) expect(declared.has(s.targetId)).toBe(true);
    }
  });

  it("describes only metric codes that the page actually renders", () => {
    for (const code of [
      "CASH-ACCRUED-REV",
      "CASH-COLLECTED",
      "CASH-COSTS-PAID",
      "CASH-NCF-QTR",
      "CASH-CUM-NCF-QTR",
      "CASH-NCF-ANNUAL",
      "CASH-CUM-ANNUAL",
      "CASH-CONVERSION",
      "WC-REQUIREMENT",
      "WC-PEAK-TROUGH-Y1",
      "WC-MAX-FUNDING",
      "BE-EBITDA-YEAR",
      "BE-CASH-YEAR",
      "BE-STATUS",
      "PB-YEAR",
      "PB-MONTHS",
      "SUS-NEG-YEARS",
      "SUS-FUNDING-DEPENDENCY",
      "SUS-STATUS",
      "SUS-MODEL-HEALTH",
    ]) {
      expect(PAGE_SRC).toContain(code);
    }
  });

  it("does not invent periods the page does not render", () => {
    expect(PAGE_SRC).toContain("FY2027-Q1");
    expect(PAGE_SRC).toContain("FY2031");
    expect(PAGE_SRC).toContain("FY2027-FY2031");
    // The page renders no monthly granularity.
    expect(PAGE_SRC).not.toContain("monthly");
  });

  it("distinguishes recognition, collection, EBITDA and cash", () => {
    const rules = commercialCashGuide.businessRules.map((r) => r.rule.toLowerCase()).join(" | ");
    expect(rules).toContain("revenue recognition is not cash receipt");
    expect(rules).toContain("ebitda is not cash flow");
    expect(rules).toContain("payment lag must be modelled explicitly");
    expect(rules).toContain("one-time funding is not recurring cash");
    expect(commercialCashGuide.businessRules.length).toBeGreaterThanOrEqual(13);
  });

  it("records the EBITDA proxy limitation as a known gap", () => {
    const gaps = commercialCashGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    expect(gaps).toContain("proxy");
    expect(gaps).toContain("quarterly detail exists for fy2027 only");
    expect(gaps).toContain("invoice-level timing is not modelled");
  });

  it("covers the required audiences, lifecycle stages and prerequisites", () => {
    for (const a of ["Finance", "Executive", "Commercial Lead", "Delivery", "Operations"] as const) {
      expect(commercialCashGuide.audiences).toContain(a);
    }
    for (const s of [
      "Commercial Structuring",
      "Financial Modeling",
      "Executive Review",
      "Negotiation",
      "Mobilization",
      "Operations",
    ] as const) {
      expect(commercialCashGuide.lifecycleStages).toContain(s);
    }
    expect(commercialCashGuide.prerequisites.length).toBeGreaterThanOrEqual(9);
  });

  it("declares ownership across the required roles", () => {
    const o = commercialCashGuide.ownership;
    expect(o.businessOwner).toBe("Finance Lead");
    expect(o.commercialOwner).toBe("Commercial Lead");
    expect(o.executiveApprover).toBe("Executive Sponsor");
    expect(o.consumersOfOutput).toContain("Scenario Comparison");
    expect(o.consumersOfOutput).toContain("Negotiation");
  });

  it("maps the commercial relationship in both directions", () => {
    const r = commercialCashGuide.relationship;
    expect(r.receivesFrom.length).toBeGreaterThanOrEqual(8);
    expect(r.models.length).toBeGreaterThanOrEqual(7);
    expect(r.feeds).toContain("Funding decisions");
    expect(r.feeds).toContain("Sensitivity Analysis");
  });

  it("answers the required user questions", () => {
    const qs = commercialCashGuide.questionsAnswered.join(" ").toLowerCase();
    for (const fragment of ["how much cash", "payback", "staffing", "payment lag", "sustainab"]) {
      expect(qs).toContain(fragment);
    }
    expect(commercialCashGuide.questionsAnswered.length).toBeGreaterThanOrEqual(8);
  });

  it("provides the required outputs, workflow and interpretation bands", () => {
    expect(commercialCashGuide.outputs.length).toBeGreaterThanOrEqual(10);
    expect(commercialCashGuide.workflow.length).toBeGreaterThanOrEqual(12);
    expect(commercialCashGuide.workflow.map((w) => w.step)).toEqual(
      commercialCashGuide.workflow.map((_, i) => i + 1),
    );
    expect(commercialCashGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });

  it("includes the payment-lag worked example with unchanged revenue and EBITDA", () => {
    const ex = commercialCashGuide.workedExamples[0];
    expect(ex.title.toLowerCase()).toContain("payment lag");
    const text = `${ex.narrative} ${(ex.steps ?? []).join(" ")} ${ex.result ?? ""}`.toLowerCase();
    expect(text).toContain("revenue does not change");
    expect(text).toContain("ebitda");
    expect(text).toContain("trough");
    expect(text).toContain("payback");
  });

  it("covers the required FAQs and glossary terms", () => {
    const questions = commercialCashGuide.faqs.map((f) => f.question.toLowerCase()).join(" | ");
    for (const fragment of [
      "why is cash lower than ebitda",
      "what is working capital",
      "what is peak cash need",
      "break-even and payback",
      "payment lag affect",
      "activation fund recurring",
      "profitable deal need funding",
      "cash-timing assumption be changed",
    ]) {
      expect(questions).toContain(fragment);
    }
    const terms = commercialCashGuide.glossary.map((g) => g.term);
    for (const t of [
      "Cash Inflow",
      "Cash Outflow",
      "Net Cash Flow",
      "Cumulative Cash",
      "Working Capital",
      "Cash Trough",
      "Break-Even",
      "Payback",
      "Payment Lag",
      "Sustainability",
    ]) {
      expect(terms).toContain(t);
    }
  });

  it("keeps the page read-only — no calculation or mutation added", () => {
    expect(PAGE_SRC).not.toContain("useMutation(");
    expect(PAGE_SRC).toContain("useTriggerCashRun");
    expect(commercialCashGuide.dataQuality.changeControl.toLowerCase()).toContain("read-only");
  });
});
