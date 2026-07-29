import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveGuideForRoute } from "@/features/commercial-guide/content";
import { commercialAssumptionsGuide } from "@/features/commercial-guide/content/pages/commercialAssumptions";
import { searchGuide } from "@/features/commercial-guide/guideText";

const REGISTER_SRC = readFileSync("src/commercial/pages/CommercialAssumptions.tsx", "utf8");
const DETAIL_SRC = readFileSync("src/commercial/pages/CommercialAssumptionChangeSet.tsx", "utf8");
const PAGE_SRC = `${REGISTER_SRC}\n${DETAIL_SRC}`;

describe("CDT-COMMERCIAL-GUIDE-ASSUMPTIONS", () => {
  it("resolves page-specific content on the register and detail routes", () => {
    const guide = resolveGuideForRoute("/commercial/model/assumptions");
    expect(guide?.pageId).toBe("commercial-assumptions");
    expect(guide?.isFallback).toBeFalsy();
    expect(guide?.guideTitle).toBe("Assumptions & Change Sets — Governed Assumption Editing");
    expect(resolveGuideForRoute("/commercial/model/assumptions/change-sets/abc")?.pageId).toBe(
      "commercial-assumptions",
    );
  });

  it("uses the exact registered page title", () => {
    expect(commercialAssumptionsGuide.pageTitle).toBe("Assumptions & Change Sets");
    expect(commercialAssumptionsGuide.route).toBe("/commercial/model/assumptions");
    expect(commercialAssumptionsGuide.match).toBe("prefix");
    // The rendered heading on the register page.
    expect(REGISTER_SRC).toContain("Governed Assumption Editing");
  });

  it("every show-on-page target exists in the real page sources", () => {
    for (const t of commercialAssumptionsGuide.showOnPageTargets) {
      expect(PAGE_SRC, `missing target ${t.targetId}`).toContain(`data-guide-target="${t.targetId}"`);
    }
  });

  it("every documented section maps to a real target", () => {
    const known = new Set(commercialAssumptionsGuide.showOnPageTargets.map((t) => t.targetId));
    for (const s of commercialAssumptionsGuide.sections) {
      expect(s.targetId, `section ${s.id} has no target`).toBeTruthy();
      expect(known.has(s.targetId!), `section ${s.id} target unknown`).toBe(true);
    }
  });

  it("documents only the real change-set lifecycle statuses", () => {
    const HOOK_SRC = readFileSync("src/commercial/hooks/useAssumptionChangeSets.ts", "utf8");
    expect(HOOK_SRC).toContain('"draft" | "validated" | "applied" | "cancelled"');
    const text = JSON.stringify(commercialAssumptionsGuide).toLowerCase();
    for (const real of ["draft", "validated", "applied", "cancelled"]) {
      expect(text).toContain(real);
    }
    const glossaryTerms = commercialAssumptionsGuide.glossary.map((g) => g.term.toLowerCase());
    // No invented status is presented as a lifecycle state.
    for (const invented of ["submitted", "rejected", "reverted", "superseded"]) {
      expect(glossaryTerms).not.toContain(invented);
    }
    const rules = commercialAssumptionsGuide.businessRules
      .map((r) => `${r.rule} ${r.explanation}`)
      .join(" ")
      .toLowerCase();
    expect(rules).toContain("there is no submitted, rejected, approved or reverted status in the product");
  });

  it("separates validation from approval and keeps approval off-page", () => {
    const rules = commercialAssumptionsGuide.businessRules.map((r) => r.rule.toLowerCase()).join(" | ");
    expect(rules).toContain("calculated outputs must not be edited as assumptions");
    expect(rules).toContain("values from different scenarios must not be mixed");
    expect(rules).toContain("cancellation should preserve history");
    const faq = commercialAssumptionsGuide.faqs.map((f) => f.question).join(" | ");
    expect(faq).toContain("What is the difference between validation and approval?");
    const gaps = commercialAssumptionsGuide.dataQuality.knownGaps.join(" ").toLowerCase();
    for (const gap of ["no owner field", "no confidence rating", "no approval status", "no history timeline", "no reversal action"]) {
      expect(gaps).toContain(gap);
    }
  });

  it("labels the activation worked example as illustrative", () => {
    const ex = commercialAssumptionsGuide.workedExamples[0];
    expect(ex.title.toLowerCase()).toContain("illustrative");
    expect(ex.narrative.toLowerCase()).toContain("illustrative example");
    expect(ex.narrative).toContain("35 percent to 50 percent");
  });

  it("related page routes are registered commercial routes", () => {
    for (const p of commercialAssumptionsGuide.relatedPages) {
      expect(p.route === "/commercial" || p.route.startsWith("/commercial/")).toBe(true);
    }
  });

  it("search finds page-specific content", () => {
    expect(searchGuide(commercialAssumptionsGuide, "change set").length).toBeGreaterThan(0);
    expect(searchGuide(commercialAssumptionsGuide, "materiality").length).toBeGreaterThan(0);
    expect(searchGuide(commercialAssumptionsGuide, "zzzznotpresent").length).toBe(0);
  });

  it("covers the required catalogue sizes", () => {
    expect(commercialAssumptionsGuide.inputs.length).toBe(20);
    expect(commercialAssumptionsGuide.outputs.length).toBe(8);
    expect(commercialAssumptionsGuide.businessRules.length).toBeGreaterThanOrEqual(13);
    expect(commercialAssumptionsGuide.faqs.length).toBeGreaterThanOrEqual(8);
    expect(commercialAssumptionsGuide.commonMistakes.length).toBeGreaterThanOrEqual(8);
    expect(commercialAssumptionsGuide.workflow.length).toBeGreaterThanOrEqual(12);
    expect(commercialAssumptionsGuide.teamActivities.length).toBeGreaterThanOrEqual(7);
    expect(commercialAssumptionsGuide.glossary.length).toBeGreaterThanOrEqual(10);
    expect(commercialAssumptionsGuide.lifecycleStages.length).toBeGreaterThanOrEqual(7);
    expect(commercialAssumptionsGuide.interpretation.map((i) => i.band)).toEqual([
      "healthy",
      "warning",
      "critical",
    ]);
  });
});
