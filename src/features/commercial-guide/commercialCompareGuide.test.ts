import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialCompareGuide } from "@/features/commercial-guide/content/pages/commercialCompare";

const LIST_SRC = readFileSync("src/commercial/pages/CommercialCompare.tsx", "utf8");
const DETAIL_SRC = readFileSync("src/commercial/pages/CommercialCompareDetail.tsx", "utf8");
const PAGE_SRC = `${LIST_SRC}\n${DETAIL_SRC}`;

describe("CDT-COMMERCIAL-GUIDE-SCENARIO-COMPARISON", () => {
  it("resolves page-specific content on the list and detail routes", () => {
    const guide = resolveGuideForRoute("/commercial/model/compare");
    expect(guide?.pageId).toBe("commercial-compare");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe(
      "Scenario Comparison — Choosing a Planning Case on Tradeoffs, Not One Metric",
    );
    expect(resolveGuideForRoute("/commercial/model/compare/abc")?.pageId).toBe(
      "commercial-compare",
    );
  });

  it("uses the exact registered page title, route and match", () => {
    expect(commercialCompareGuide.pageTitle).toBe("Scenario Comparison");
    expect(commercialCompareGuide.route).toBe("/commercial/model/compare");
    expect(commercialCompareGuide.match).toBe("prefix");
    expect(LIST_SRC).toContain("Scenario Comparison");
  });

  it("every show-on-page target exists in the real page sources", () => {
    expect(commercialCompareGuide.showOnPageTargets.length).toBe(12);
    for (const t of commercialCompareGuide.showOnPageTargets) {
      expect(PAGE_SRC, `missing target ${t.targetId}`).toContain(
        `data-guide-target="${t.targetId}"`,
      );
    }
  });

  it("declares no target that the pages do not render", () => {
    const rendered = new Set(
      [...PAGE_SRC.matchAll(/data-guide-target="([^"]+)"/g)].map((m) => m[1]),
    );
    expect(rendered.size).toBe(12);
    for (const id of rendered) {
      expect(
        commercialCompareGuide.showOnPageTargets.some((t) => t.targetId === id),
        `undocumented target ${id}`,
      ).toBe(true);
    }
  });

  it("every documented section maps to a declared target", () => {
    const known = new Set(commercialCompareGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialCompareGuide.sections) {
      expect(s.targetId, `section ${s.id} has no target`).toBeTruthy();
      expect(known.has(s.targetId!), `section ${s.id} target unknown`).toBe(true);
    }
    expect(commercialCompareGuide.sections.length).toBe(12);
  });

  it("documents only the real modes, scopes and statuses", () => {
    for (const token of ["pairwise", "three_way", "historical", "revenue", "pnl", "cash"]) {
      expect(LIST_SRC).toContain(token);
    }
    for (const status of ["draft", "saved", "archived"]) {
      expect(PAGE_SRC).toContain(status);
    }
    const body = JSON.stringify(commercialCompareGuide);
    expect(body).toContain("Pairwise");
    expect(body).toContain("Three-way");
    expect(body).toContain("Historical runs");
  });

  it("documents only the summary metric codes actually rendered", () => {
    for (const code of [
      "PNL-REVENUE",
      "PNL-GROSS-PROFIT",
      "PNL-EBITDA",
      "PNL-EBITDA-MARGIN",
      "CASH-MAX-FUNDING",
      "CASH-PAYBACK",
    ]) {
      expect(DETAIL_SRC).toContain(code);
      expect(JSON.stringify(commercialCompareGuide)).toContain(code);
    }
  });

  it("documents the real delta, readiness and lineage fields", () => {
    for (const field of [
      "baseline_value",
      "compared_value",
      "absolute_variance",
      "percentage_variance",
      "variance_direction",
      "is_stale",
      "is_missing",
      "stale_at_creation",
      "source_run_manifest_hash",
      "content_hash",
      "differs_from_baseline",
    ]) {
      expect(DETAIL_SRC).toContain(field);
    }
  });

  it("records absent capabilities as known gaps rather than inventing them", () => {
    const lower = PAGE_SRC.toLowerCase();
    expect(lower).not.toContain("data-guide-target=\"comparison-staffing\"");
    expect(lower).not.toContain("data-guide-target=\"comparison-risk\"");
    const gaps = commercialCompareGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    for (const gap of ["staffing", "activation", "risk", "recommendation", "scope", "export"]) {
      expect(gaps, `gap ${gap} not recorded`).toContain(gap);
    }
  });

  it("states that comparisons never re-run the model", () => {
    expect(LIST_SRC).toContain("No formulas are recomputed.");
    expect(DETAIL_SRC).toContain("No model execution will occur.");
    const body = JSON.stringify(commercialCompareGuide);
    expect(body).toContain("never re-run");
    expect(commercialCompareGuide.calculationLogic[0]).toContain("No formula is executed");
  });

  it("prevents single-metric selection as an explicit rule and mistake", () => {
    const rule = commercialCompareGuide.businessRules.find((r) =>
      r.rule.toLowerCase().includes("highest ebitda"),
    );
    expect(rule).toBeTruthy();
    const mistakes = commercialCompareGuide.commonMistakes.map((m) => m.description.toLowerCase());
    expect(mistakes.some((m) => m.includes("highest revenue"))).toBe(true);
    expect(mistakes.some((m) => m.includes("highest ebitda"))).toBe(true);
    const critical = commercialCompareGuide.interpretation.find((i) => i.band === "critical")!;
    expect(critical.criteria.join(" ").toLowerCase()).toContain("single metric");
  });

  it("covers the required rules, mistakes, faqs, workflow, glossary and bands", () => {
    expect(commercialCompareGuide.businessRules.length).toBe(12);
    expect(commercialCompareGuide.commonMistakes.length).toBe(8);
    expect(commercialCompareGuide.faqs.length).toBe(8);
    expect(commercialCompareGuide.workflow.length).toBe(14);
    expect(commercialCompareGuide.questionsAnswered.length).toBe(8);
    expect(commercialCompareGuide.outputs.length).toBeGreaterThanOrEqual(7);
    expect(commercialCompareGuide.workedExamples.length).toBe(1);
    expect(commercialCompareGuide.glossary.length).toBeGreaterThanOrEqual(10);
    expect(commercialCompareGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });

  it("workflow steps are sequentially numbered", () => {
    commercialCompareGuide.workflow.forEach((w, i) => expect(w.step).toBe(i + 1));
  });

  it("covers the requested audiences and lifecycle placement", () => {
    for (const a of ["Executive", "Commercial Lead", "Finance", "Delivery", "Operations"] as const) {
      expect(commercialCompareGuide.audiences).toContain(a);
    }
    for (const stage of ["Financial Modeling", "Executive Review", "Negotiation"] as const) {
      expect(commercialCompareGuide.lifecycleStages).toContain(stage);
    }
    expect(commercialCompareGuide.ownership.businessOwner).toBe("Deal Lead");
    expect(commercialCompareGuide.ownership.executiveApprover).toBe("Executive Sponsor");
  });

  it("worked example compares Base and Upside", () => {
    const we = commercialCompareGuide.workedExamples[0];
    expect(we.title).toContain("Base");
    expect(we.title).toContain("Upside");
    const n = we.narrative.toLowerCase();
    for (const t of ["activation", "staff", "funding", "payback", "access"]) {
      expect(n, `narrative missing ${t}`).toContain(t);
    }
  });

  it("faqs answer the required questions", () => {
    const qs = commercialCompareGuide.faqs.map((f) => f.question.toLowerCase());
    for (const key of [
      "comparable",
      "recommended",
      "highest ebitda",
      "risk",
      "cash",
      "account scope",
      "saved",
      "after a scenario is selected",
    ]) {
      expect(qs.some((q) => q.includes(key)), `missing faq ${key}`).toBe(true);
    }
  });
});
