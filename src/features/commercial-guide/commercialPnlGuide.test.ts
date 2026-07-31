import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialPnlGuide } from "@/features/commercial-guide/content/pages/commercialPnl";

const PAGE_SRC = readFileSync("src/commercial/pages/CommercialPnl.tsx", "utf8");

/** Targets applied as literal JSX attributes on the page. */
const STATIC_TARGETS = ["pnl-context", "pnl-run-header", "pnl-scenario"];

/** Targets passed through typed props / row definitions. */
const PROP_TARGETS = [
  "pnl-summary",
  "pnl-by-period",
  "pnl-costs",
  "pnl-opex",
  "pnl-staffing-memo",
  "pnl-gross-profit",
  "pnl-ebitda",
  "pnl-margin",
  "pnl-staffing-cost",
  "pnl-support-cost",
  "pnl-delivery-cost",
  "pnl-marketing-cost",
  "pnl-shared-services",
  "pnl-detail",
];

const ALL_TARGETS = [...STATIC_TARGETS, ...PROP_TARGETS];

describe("CDT-COMMERCIAL-GUIDE-PNL", () => {
  it("resolves page-specific content on the P&L route", () => {
    const guide = resolveGuideForRoute("/commercial/model/pnl");
    expect(guide?.pageId).toBe("commercial-pnl");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("P&L — What the Deal Costs and What It Earns");
  });

  it("uses the exact registered page title and route", () => {
    expect(commercialPnlGuide.pageTitle).toBe("P&L (Cost & EBITDA)");
    expect(commercialPnlGuide.route).toBe("/commercial/model/pnl");
    expect(PAGE_SRC).toContain("Project Momentous — Cost, OPEX &amp; EBITDA");
  });

  it("declares only targets that exist on the page", () => {
    for (const t of commercialPnlGuide.showOnPageTargets) {
      expect(ALL_TARGETS).toContain(t.targetId);
      expect(PAGE_SRC).toContain(`"${t.targetId}"`);
    }
  });

  it("anchors static targets as JSX data-guide-target attributes", () => {
    for (const t of STATIC_TARGETS) {
      expect(PAGE_SRC).toContain(`data-guide-target="${t}"`);
    }
  });

  it("passes prop/row targets through the MetricTable contract", () => {
    expect(PAGE_SRC).toContain("data-guide-target={targetId}");
    expect(PAGE_SRC).toContain("data-guide-target={periodTargetId}");
    expect(PAGE_SRC).toContain("data-guide-target={r.target}");
    for (const t of PROP_TARGETS) {
      expect(PAGE_SRC).toContain(`"${t}"`);
    }
  });

  it("maps every section target to a declared show-on-page target", () => {
    const declared = new Set(commercialPnlGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialPnlGuide.sections) {
      if (s.targetId) expect(declared.has(s.targetId)).toBe(true);
    }
  });

  it("describes only cost categories that exist in the model", () => {
    for (const code of [
      "COD-01_POD_LEAD",
      "COD-06_L1L2",
      "COD-09_DEL_LEAD",
      "COD-09B_DEL_VAR",
      "COD-10_TOOLS",
      "COD-11_TRAVEL",
      "COD-TOTAL",
      "OPEX-05_MKT",
      "OPEX-08_GA",
      "OPEX-TOTAL",
      "PL-GROSS-PROFIT",
      "PL-GROSS-MARGIN-PCT",
      "PL-EBITDA",
      "PL-EBITDA-MARGIN-PCT",
      "POD-FTE",
    ]) {
      expect(PAGE_SRC).toContain(code);
    }
  });

  it("records absent concepts as known gaps rather than inventing them", () => {
    const gaps = commercialPnlGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    expect(gaps).toContain("revenue is not displayed");
    expect(gaps).toContain("funding");
    expect(gaps).toContain("break-even");
    expect(gaps).toContain("trend chart");
    expect(gaps).toContain("brand royalty");
  });

  it("covers the required audiences and lifecycle stages", () => {
    for (const a of ["Finance", "Commercial Lead", "Executive", "Delivery", "Operations"] as const) {
      expect(commercialPnlGuide.audiences).toContain(a);
    }
    for (const s of [
      "Financial Modeling",
      "Commercial Structuring",
      "Executive Review",
      "Negotiation",
      "Delivery Planning",
    ] as const) {
      expect(commercialPnlGuide.lifecycleStages).toContain(s);
    }
  });

  it("documents the prescribed business rules", () => {
    const rules = commercialPnlGuide.businessRules.map((r) => `${r.rule} ${r.explanation}`).join(" ").toLowerCase();
    expect(rules).toContain("ebitda is not cash flow");
    expect(rules).toContain("reconcile to staffing & resources");
    expect(rules).toContain("counted twice");
    expect(rules).toContain("operationally feasible");
    expect(rules).toContain("loaded basis");
    expect(rules).toContain("consistent scope");
  });

  it("provides the required workflow, outputs and relationship map", () => {
    expect(commercialPnlGuide.workflow).toHaveLength(12);
    expect(commercialPnlGuide.workflow.map((w) => w.step)).toEqual([...Array(12)].map((_, i) => i + 1));
    expect(commercialPnlGuide.relationship.feeds).toContain("Cash & Sustainability");
    expect(commercialPnlGuide.relationship.receivesFrom.join(" ")).toContain("Revenue");
    const outputs = commercialPnlGuide.outputs.map((o) => o.label).join(" ");
    expect(outputs).toContain("EBITDA");
    expect(outputs).toContain("EBITDA margin");
    expect(outputs).toContain("Cost by category");
  });

  it("answers the required FAQs and defines the required glossary terms", () => {
    const qs = commercialPnlGuide.faqs.map((f) => f.question.toLowerCase()).join(" | ");
    expect(qs).toContain("what is ebitda");
    expect(qs).toContain("different from cash");
    expect(qs).toContain("staffing costs are included");
    expect(qs).toContain("funding offsets");
    expect(qs).toContain("margin falls");
    expect(qs).toContain("fixed cost");
    expect(qs).toContain("differ by scenario");
    expect(qs).toContain("cost assumption be changed");
    const terms = commercialPnlGuide.glossary.map((g) => g.term);
    for (const t of [
      "P&L",
      "Direct Cost",
      "Fixed Cost",
      "Variable Cost",
      "Loaded FTE Cost",
      "EBITDA",
      "EBITDA Margin",
      "Cost Offset",
      "Contribution",
      "Break-Even",
    ]) {
      expect(terms).toContain(t);
    }
  });

  it("includes the RunOps staffing worked example with all six effects", () => {
    const we = commercialPnlGuide.workedExamples[0];
    expect(we.title.toLowerCase()).toContain("runops");
    const text = `${we.narrative} ${we.result}`.toLowerCase();
    expect(text).toContain("capacity");
    expect(text).toContain("staffing");
    expect(text).toContain("ebitda");
    expect(text).toContain("stability");
    expect(text).toContain("cash");
    expect(text).toContain("feasib");
  });

  it("provides healthy, warning and critical interpretation bands", () => {
    expect(commercialPnlGuide.interpretation.map((i) => i.band)).toEqual(["healthy", "warning", "critical"]);
    for (const band of commercialPnlGuide.interpretation) {
      expect(band.criteria.length).toBeGreaterThanOrEqual(6);
    }
  });

  it("lists the prescribed common mistakes", () => {
    const text = commercialPnlGuide.commonMistakes.map((m) => m.description).join(" ").toLowerCase();
    expect(commercialPnlGuide.commonMistakes).toHaveLength(8);
    expect(text).toContain("ebitda as cash");
    expect(text).toContain("pre-revenue staffing");
    expect(text).toContain("shared services");
    expect(text).toContain("contractor premium");
    expect(text).toContain("peak capacity");
  });

  it("changes no financial logic on the page", () => {
    expect(PAGE_SRC).toContain("const PL_ROWS = [");
    expect(PAGE_SRC).toContain('label: "TOTAL Cost of Delivery"');
    expect(PAGE_SRC).toContain('label: "TOTAL Operating Expenses"');
    expect(PAGE_SRC).not.toContain("commercialPnlGuide");
  });
});
