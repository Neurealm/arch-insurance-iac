import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { COMMERCIAL_GUIDE_REGISTRY, COMMERCIAL_GUIDE_PAGES, resolveGuideForRoute, getGuideByPageId } from "./content";
import type { CommercialGuideContent } from "./types";

/**
 * CDT-COMMERCIAL-GUIDE-FINAL-VALIDATION
 *
 * Cross-page validation for the Commercial Guide capability. This suite makes
 * the release checks executable: registry/route mapping, content completeness
 * on every registered page, Show-on-Page target integrity against real
 * `data-guide-target` attributes in the Commercial pages, cross-page
 * relationship consistency and terminology.
 *
 * It asserts state only — it changes no commercial behaviour.
 */

const SRC = path.resolve(__dirname, "../..");
const ASSUMPTIONS_TITLE = "Assumptions & Change Sets";

/** Every `data-guide-target` literal rendered anywhere in the app. */
function collectRenderedTargets(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!full.endsWith(".tsx")) continue;
      const source = fs.readFileSync(full, "utf8");
      for (const m of source.matchAll(/data-guide-target="([^"]+)"/g)) {
        found.set(m[1], [...(found.get(m[1]) ?? []), full]);
      }
      // Dynamic anchors, e.g. data-guide-target={`timelines-lane-${row.id}`}
      for (const m of source.matchAll(/data-guide-target=\{`([^`]+)`\}/g)) {
        const key = "DYNAMIC:" + m[1];
        found.set(key, [...(found.get(key) ?? []), full]);
      }
    }
  };
  walk(SRC);
  return found;
}

/** Static target values supplied to dynamic anchors from literal arrays. */
function collectDynamicTargetValues(): Set<string> {
  const values = new Set<string>();
  const files = [
    "commercial/pages/CommercialRevenue.tsx",
    "commercial/pages/CommercialPnl.tsx",
    "commercial/pages/CommercialCash.tsx",
    "commercial/pages/CommercialScenarios.tsx",
    "data/programTimelineMockData.ts",
  ];
  for (const rel of files) {
    const full = path.join(SRC, rel);
    if (!fs.existsSync(full)) continue;
    const source = fs.readFileSync(full, "utf8");
    for (const m of source.matchAll(/target(?:Id)?: "([^"]+)"/g)) values.add(m[1]);
    for (const m of source.matchAll(/periodTargetId: "([^"]+)"/g)) values.add(m[1]);
    for (const m of source.matchAll(/data-guide-target=\{[^}]*\?\s*"([^"]+)"/g)) values.add(m[1]);
    // Timeline lane ids feed `timelines-lane-${row.id}`.
    for (const m of source.matchAll(/\{ id: "([a-z]+)", name: "[^"]+" \}/g)) values.add("timelines-lane-" + m[1]);
  }
  return values;
}

const rendered = collectRenderedTargets();
const dynamicValues = collectDynamicTargetValues();
const renderedStatic = new Set([...rendered.keys()].filter((k) => !k.startsWith("DYNAMIC:")));

function targetExists(targetId: string): boolean {
  return renderedStatic.has(targetId) || dynamicValues.has(targetId);
}

const realPages = COMMERCIAL_GUIDE_REGISTRY.filter((g) => !g.isFallback);

describe("Commercial Guide — route and registry validation", () => {
  const appSource = fs.readFileSync(path.join(SRC, "App.tsx"), "utf8");
  const commercialBlock = appSource.slice(
    appSource.indexOf('<Route path="/commercial"'),
    appSource.indexOf("Internal CAE component fixture"),
  );
  const routePaths = [...commercialBlock.matchAll(/<Route path="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((p) => p !== "/commercial")
    .map((p) => "/commercial/" + p);

  it("registers every top-level Commercial route", () => {
    const registered = new Set(COMMERCIAL_GUIDE_PAGES.map((p) => p.route));
    const missing = routePaths
      .filter((r) => !r.includes(":"))
      .filter((r) => !registered.has(r));
    expect(missing).toEqual([]);
  });

  it("resolves every route — including parameterised detail routes — to a guide", () => {
    for (const route of routePaths) {
      const concrete = route.replace(/:[A-Za-z]+/g, "sample-id");
      const guide = resolveGuideForRoute(concrete);
      expect(guide, `no guide resolved for ${concrete}`).not.toBeNull();
    }
    expect(resolveGuideForRoute("/commercial")).not.toBeNull();
  });

  it("maps every registered page ID to its own unique route", () => {
    const ids = COMMERCIAL_GUIDE_PAGES.map((p) => p.pageId);
    expect(new Set(ids).size).toBe(ids.length);
    const routes = COMMERCIAL_GUIDE_PAGES.map((p) => p.route);
    expect(new Set(routes).size).toBe(routes.length);
    for (const page of COMMERCIAL_GUIDE_PAGES) {
      const guide = getGuideByPageId(page.pageId);
      expect(guide?.route).toBe(page.route);
      expect(guide?.pageId).toBe(page.pageId);
    }
  });

  it("mounts exactly one guide launcher, in the Commercial layout", () => {
    const layout = fs.readFileSync(path.join(SRC, "commercial/shell/CommercialLayout.tsx"), "utf8");
    expect(layout.match(/<CommercialGuideButton\s*\/>/g)?.length).toBe(1);
    expect(layout.match(/<CommercialGuideRoot>/g)?.length).toBe(1);

    let launchers = 0;
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (full.endsWith(".tsx") && !full.includes("features/commercial-guide")) {
          launchers += (fs.readFileSync(full, "utf8").match(/<CommercialGuideButton/g) ?? []).length;
        }
      }
    };
    walk(SRC);
    expect(launchers).toBe(1);
  });

  it("uses the exact assumptions page title everywhere it is referenced", () => {
    const registration = COMMERCIAL_GUIDE_PAGES.find((p) => p.pageId === "commercial-assumptions");
    expect(registration?.pageTitle).toBe(ASSUMPTIONS_TITLE);
    expect(getGuideByPageId("commercial-assumptions")?.pageTitle).toBe(ASSUMPTIONS_TITLE);
    for (const guide of realPages) {
      const link = guide.relatedPages.find((r) => r.pageId === "commercial-assumptions");
      if (link) expect(link.label, `${guide.pageId} related-page label`).toBe(ASSUMPTIONS_TITLE);
    }
  });

  it("resolves every related-page link to a registered page and its real route", () => {
    const byId = new Map(COMMERCIAL_GUIDE_PAGES.map((p) => [p.pageId, p]));
    for (const guide of realPages) {
      for (const related of guide.relatedPages) {
        const target = byId.get(related.pageId);
        expect(target, `${guide.pageId} → unknown related page ${related.pageId}`).toBeTruthy();
        expect(related.route, `${guide.pageId} → ${related.pageId} route`).toBe(target!.route);
        expect(related.pageId, `${guide.pageId} links to itself`).not.toBe(guide.pageId);
      }
      const ids = guide.relatedPages.map((r) => r.pageId);
      expect(new Set(ids).size, `${guide.pageId} duplicate related pages`).toBe(ids.length);
    }
  });

  it("keeps previous/next navigation order stable and complete", () => {
    const order = COMMERCIAL_GUIDE_REGISTRY.map((g) => g.pageId);
    expect(order).toEqual(COMMERCIAL_GUIDE_PAGES.map((p) => p.pageId));
    expect(order.length).toBe(COMMERCIAL_GUIDE_PAGES.length);
    for (let i = 0; i < order.length; i += 1) {
      const guide = getGuideByPageId(order[i]);
      expect(guide).not.toBeNull();
    }
  });
});

describe("Commercial Guide — content completeness on every page", () => {
  const requiredStrings: (keyof CommercialGuideContent)[] = [
    "pageTitle",
    "guideTitle",
    "purpose",
    "represents",
    "whyItMatters",
    "moduleConnection",
    "expectedOutcome",
    "confidenceGuidance",
    "executiveTakeaway",
  ];
  const requiredArrays: (keyof CommercialGuideContent)[] = [
    "audiences",
    "modes",
    "questionsAnswered",
    "lifecycleStages",
    "prerequisites",
    "sections",
    "inputs",
    "outputs",
    "businessRules",
    "calculationLogic",
    "downstreamImpacts",
    "readinessCriteria",
    "workflow",
    "actionsAvailable",
    "teamActivities",
    "roles",
    "raci",
    "reviewRequirements",
    "approvalRequirements",
    "decisions",
    "whatToDoNext",
    "relatedPages",
    "interpretation",
    "commonMistakes",
    "bestPractices",
    "workedExamples",
    "faqs",
    "glossary",
    "keyRisks",
    "showOnPageTargets",
    "confidenceBasis",
  ];

  it("has no page left on fallback content", () => {
    const fallbacks = COMMERCIAL_GUIDE_REGISTRY.filter((g) => g.isFallback).map((g) => g.pageId);
    expect(fallbacks).toEqual([]);
  });

  it.each(COMMERCIAL_GUIDE_REGISTRY.map((g) => [g.pageId, g] as const))(
    "%s carries every required guide element",
    (_pageId, guide) => {
      for (const key of requiredStrings) {
        expect(String(guide[key] ?? ""), `${guide.pageId}.${String(key)}`).not.toHaveLength(0);
      }
      for (const key of requiredArrays) {
        expect((guide[key] as unknown[]).length, `${guide.pageId}.${String(key)}`).toBeGreaterThan(0);
      }
      expect(guide.ownership.businessOwner ?? guide.ownership.commercialOwner).toBeTruthy();
      expect(guide.ownership.primaryUsers?.length ?? 0).toBeGreaterThan(0);
      expect(guide.ownership.consumersOfOutput?.length ?? 0).toBeGreaterThan(0);
      expect(guide.dataQuality.dataSources.length).toBeGreaterThan(0);
      expect(guide.dataQuality.knownGaps.length).toBeGreaterThan(0);
      expect(guide.dataQuality.updateFrequency).not.toHaveLength(0);
      expect(guide.dataQuality.changeControl).not.toHaveLength(0);
      expect(guide.modelConfidence).not.toBe("Not Assessed");
      expect(guide.commercialReadiness).toBeTruthy();
      expect(guide.relationship.receivesFrom.length + guide.relationship.feeds.length).toBeGreaterThan(0);
      expect(guide.relationship.models.length).toBeGreaterThan(0);
    },
  );

  it.each(COMMERCIAL_GUIDE_REGISTRY.map((g) => [g.pageId, g] as const))(
    "%s covers all three interpretation bands and all three modes",
    (_pageId, guide) => {
      expect(guide.interpretation.map((i) => i.band).sort()).toEqual(["critical", "healthy", "warning"]);
      for (const band of guide.interpretation) {
        expect(band.criteria.length).toBeGreaterThan(0);
        expect(band.action).not.toHaveLength(0);
      }
      expect([...guide.modes].sort()).toEqual(["administrator", "executive", "practitioner"]);
    },
  );

  it.each(COMMERCIAL_GUIDE_REGISTRY.map((g) => [g.pageId, g] as const))(
    "%s respects the authored word-count limits",
    (_pageId, guide) => {
      const words = (s: string) => s.trim().split(/\s+/).length;
      expect(words(guide.purpose)).toBeLessThanOrEqual(90);
      expect(words(guide.whyItMatters)).toBeLessThanOrEqual(90);
      expect(words(guide.moduleConnection)).toBeLessThanOrEqual(120);
      expect(words(guide.executiveTakeaway)).toBeLessThanOrEqual(120);
      for (const section of guide.sections) expect(words(section.explanation), section.id).toBeLessThanOrEqual(100);
      for (const rule of guide.businessRules) expect(words(rule.explanation), rule.id).toBeLessThanOrEqual(80);
      for (const step of guide.workflow) expect(words(step.description), step.id).toBeLessThanOrEqual(45);
      for (const mistake of guide.commonMistakes) expect(words(mistake.description), mistake.id).toBeLessThanOrEqual(60);
      for (const example of guide.workedExamples) expect(words(example.narrative), example.id).toBeLessThanOrEqual(220);
      for (const faq of guide.faqs) expect(words(faq.answer), faq.id).toBeLessThanOrEqual(90);
    },
  );
});

describe("Commercial Guide — Show on Page target audit", () => {
  it.each(COMMERCIAL_GUIDE_REGISTRY.map((g) => [g.pageId, g] as const))(
    "%s configures only real, unique targets",
    (_pageId, guide) => {
      const ids = guide.showOnPageTargets.map((t) => t.targetId);
      expect(new Set(ids).size, `${guide.pageId} duplicate Show on Page targets`).toBe(ids.length);
      const orphans = ids.filter((id) => !targetExists(id));
      expect(orphans, `${guide.pageId} orphaned targets`).toEqual([]);
      for (const target of guide.showOnPageTargets) expect(target.label).not.toHaveLength(0);
    },
  );

  it.each(COMMERCIAL_GUIDE_REGISTRY.map((g) => [g.pageId, g] as const))(
    "%s section targets resolve and match a configured Show on Page entry",
    (_pageId, guide) => {
      const configured = new Set(guide.showOnPageTargets.map((t) => t.targetId));
      for (const section of guide.sections) {
        if (!section.targetId) continue;
        expect(targetExists(section.targetId), `${guide.pageId} section ${section.id} → missing anchor`).toBe(true);
        expect(configured.has(section.targetId), `${guide.pageId} section ${section.id} not in Show on Page`).toBe(true);
      }
    },
  );

  it("renders no duplicated static anchor across the app", () => {
    const duplicated = [...rendered.entries()]
      .filter(([key, files]) => !key.startsWith("DYNAMIC:") && files.length > 1)
      .map(([key]) => key);
    expect(duplicated).toEqual([]);
  });
});

describe("Commercial Guide — cross-page consistency", () => {
  const byId = new Map(COMMERCIAL_GUIDE_REGISTRY.map((g) => [g.pageId, g]));
  const guide = (id: string) => byId.get(id)!;

  it("keeps the canonical page titles", () => {
    expect(guide("commercial-overview").pageTitle).toBe("Overview");
    expect(guide("commercial-program").pageTitle).toBe("Program");
    expect(guide("commercial-portfolio").pageTitle).toBe("Portfolio");
    expect(guide("commercial-sources").pageTitle).toBe("Sources");
    expect(guide("commercial-scenarios").pageTitle).toBe("Scenarios");
    expect(guide("commercial-revenue").pageTitle).toBe("Revenue");
    expect(guide("commercial-pnl").pageTitle).toBe("P&L (Cost & EBITDA)");
    expect(guide("commercial-cash").pageTitle).toBe("Cash & Sustainability");
    expect(guide("commercial-assumptions").pageTitle).toBe(ASSUMPTIONS_TITLE);
    expect(guide("commercial-compare").pageTitle).toBe("Scenario Comparison");
    expect(guide("commercial-sensitivity").pageTitle).toBe("Sensitivity Analysis");
    expect(guide("commercial-release").pageTitle).toBe("Release & Activation");
    expect(guide("commercial-governance").pageTitle).toBe("Governance");
    expect(guide("commercial-staffing-resources").pageTitle).toBe("Staffing & Resources");
  });

  it("keeps the financial chain directional — revenue feeds P&L feeds cash", () => {
    const revenue = guide("commercial-revenue");
    const pnl = guide("commercial-pnl");
    const cash = guide("commercial-cash");
    expect(revenue.relationship.feeds.join(" ")).toMatch(/P&L/i);
    expect(pnl.relationship.receivesFrom.join(" ")).toMatch(/Revenue/i);
    expect(pnl.relationship.feeds.join(" ")).toMatch(/Cash/i);
    expect(cash.relationship.receivesFrom.join(" ")).toMatch(/Revenue|P&L/i);
  });

  it("keeps assumptions upstream of the engines and scenarios upstream of comparison", () => {
    for (const id of ["commercial-revenue", "commercial-pnl", "commercial-cash"]) {
      const links = guide(id).relatedPages.map((r) => r.pageId);
      expect(links, `${id} must relate to assumptions`).toContain("commercial-assumptions");
    }
    const compare = guide("commercial-compare");
    expect(compare.relatedPages.map((r) => r.pageId)).toContain("commercial-scenarios");
    expect(compare.relationship.receivesFrom.join(" ")).toMatch(/Scenario/i);
  });

  it("keeps release downstream of the model and governance adjacent to it", () => {
    const release = guide("commercial-release");
    expect(release.relationship.receivesFrom.join(" ")).toMatch(/Assumptions/i);
    expect(release.relationship.feeds.join(" ")).toMatch(/Governance|Overview/i);
    expect(release.relatedPages.map((r) => r.pageId)).toContain("commercial-governance");
  });

  it("separates the integrated customer schedule from the internal readiness schedule", () => {
    const timelines = guide("commercial-program-timeline");
    const text = `${timelines.purpose} ${timelines.moduleConnection} ${timelines.represents}`;
    expect(text).toMatch(/internal/i);
    expect(text).toMatch(/customer/i);
  });

  it("keeps Overview consolidating rather than replacing the detail pages", () => {
    const overview = guide("commercial-overview");
    const text = `${overview.purpose} ${overview.represents} ${overview.moduleConnection}`;
    expect(text).toMatch(/consolidat|summar|roll[- ]up|aggregat/i);
    expect(overview.relatedPages.length).toBeGreaterThanOrEqual(4);
  });

  it("keeps staffing expressed as capacity and cost", () => {
    const staffing = guide("commercial-staffing-resources");
    const text = `${staffing.purpose} ${staffing.moduleConnection}`;
    expect(text).toMatch(/capacity|FTE/i);
    expect(staffing.relationship.feeds.join(" ")).toMatch(/P&L|Cost|Cash/i);
  });

  it("gives every page distinct, page-specific headline content", () => {
    const purposes = COMMERCIAL_GUIDE_REGISTRY.map((g) => g.purpose);
    expect(new Set(purposes).size).toBe(purposes.length);
    const titles = COMMERCIAL_GUIDE_REGISTRY.map((g) => g.guideTitle);
    expect(new Set(titles).size).toBe(titles.length);
    const takeaways = COMMERCIAL_GUIDE_REGISTRY.map((g) => g.executiveTakeaway);
    expect(new Set(takeaways).size).toBe(takeaways.length);
  });

  it("stores no persistence or secret material in guide content", () => {
    const dir = path.join(__dirname, "content");
    const files: string[] = [];
    const walk = (d: string) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) walk(full);
        else files.push(full);
      }
    };
    walk(dir);
    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/localStorage|sessionStorage/);
      expect(source, file).not.toMatch(/api[_-]?key|secret[_-]?key|service_role/i);
    }
  });
});
