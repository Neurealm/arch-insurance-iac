import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { reconcileRoutes, routeMatrix, PLATFORM_ROUTE_PREFIXES } from "./routeOwnership";
import { APPLICATION_ROUTES } from "./generated/routeTable";
import { NAVIGATION_ENTRIES } from "./generated/implementationInventory";
import sreManifest from "./sre/module.manifest";
import type { ModuleManifest } from "./types";
import type { ApplicationRoute } from "./routeTypes";

const clone = (m: ModuleManifest): ModuleManifest => JSON.parse(JSON.stringify(m));

const route = (over: Partial<ApplicationRoute> = {}): ApplicationRoute => ({
  path: "/example",
  routeId: null,
  component: "Example",
  componentFile: "src/pages/Example.tsx",
  lazy: false,
  parentLayout: null,
  parentPath: null,
  isIndex: false,
  isLayout: false,
  isDynamic: false,
  isCatchAll: false,
  guards: [],
  permission: null,
  redirectTo: null,
  resolution: "static",
  declaredIn: "src/App.tsx",
  ...over,
});

describe("generated route table", () => {
  it("captures the real application router", () => {
    expect(APPLICATION_ROUTES.length).toBeGreaterThan(100);
    expect(APPLICATION_ROUTES.every((r) => r.path.startsWith("/") || r.path === "*")).toBe(true);
  });

  it("resolves page files that exist on disk", () => {
    const missing = APPLICATION_ROUTES.filter(
      (r) => r.componentFile && !existsSync(r.componentFile),
    );
    expect(missing).toEqual([]);
  });
});

describe("route ownership against the real route table", () => {
  const report = reconcileRoutes();

  it("classifies every application route", () => {
    expect(report.routes.length).toBe(APPLICATION_ROUTES.length);
    expect(report.routes.every((r) => typeof r.ownership === "string")).toBe(true);
    const summed = Object.values(report.counts.byOwnership).reduce((a, b) => a + b, 0);
    expect(summed).toBe(report.counts.total);
  });

  it("assigns every SRE manifest route to the sre module", () => {
    const owned = report.routes.filter((r) => r.moduleId === "sre").map((r) => r.route.path);
    for (const declared of sreManifest.boundaries.routes) {
      expect(owned).toContain(declared);
    }
  });

  it("classifies platform shell routes as platform-owned", () => {
    const platformRoutes = report.routes.filter((r) =>
      PLATFORM_ROUTE_PREFIXES.some((p) => r.route.path === p || r.route.path.startsWith(`${p}/`)),
    );
    expect(platformRoutes.length).toBeGreaterThan(0);
    expect(platformRoutes.every((r) => r.ownership === "platform-owned")).toBe(true);
  });

  it("reports no ownership conflicts with the current manifests", () => {
    expect(report.counts.conflicts).toBe(0);
  });

  it("groups routes into a route-to-module matrix", () => {
    const matrix = routeMatrix(report);
    expect(Object.keys(matrix)).toContain("sre");
    expect(matrix.sre.length).toBe(sreManifest.boundaries.routes.length);
  });
});

describe("route ownership rules", () => {
  it("detects a route claimed by two modules", () => {
    const a = clone(sreManifest);
    const b = clone(sreManifest);
    b.identity.moduleId = "other";
    const report = reconcileRoutes({
      routes: [route({ path: "/sre-operating-model" })],
      navigation: [],
      modules: [a, b],
    });
    expect(report.routes[0].ownership).toBe("ownership-conflict");
    expect(report.findings.some((f) => f.severity === "ownership-conflict")).toBe(true);
  });

  it("detects an unregistered route", () => {
    const report = reconcileRoutes({
      routes: [route({ path: "/totally-unclaimed" })],
      navigation: [],
      modules: [clone(sreManifest)],
    });
    expect(report.routes[0].ownership).toBe("unregistered");
    expect(
      report.findings.some(
        (f) => f.ruleId === "unregistered-implementation" && f.subject === "/totally-unclaimed",
      ),
    ).toBe(true);
  });

  it("detects a manifest route missing from the router", () => {
    const m = clone(sreManifest);
    m.boundaries = { ...m.boundaries, routes: [...m.boundaries.routes, "/ghost-route"] };
    const report = reconcileRoutes({ routes: [], navigation: [], modules: [m] });
    expect(
      report.findings.some(
        (f) => f.ruleId === "missing-referenced-file" && f.subject === "/ghost-route",
      ),
    ).toBe(true);
  });

  it("detects a route mapped to a missing page", () => {
    const report = reconcileRoutes({
      routes: [route({ path: "/sre-operating-model", componentFile: "src/pages/Gone.tsx" })],
      navigation: [],
      modules: [clone(sreManifest)],
      existingFiles: [],
    });
    expect(report.counts.missingPages).toBe(1);
    expect(report.findings.some((f) => f.severity === "missing-reference")).toBe(true);
  });

  it("detects an unreachable page with no navigation entry", () => {
    const report = reconcileRoutes({
      routes: [route({ path: "/hidden-page" })],
      navigation: [],
      modules: [],
    });
    expect(report.routes[0].reachable).toBe(false);
    expect(report.counts.unreachable).toBe(1);
  });

  it("detects a navigation entry pointing at an invalid route", () => {
    const report = reconcileRoutes({
      routes: [route({ path: "/real" })],
      navigation: [{ navId: "broken", label: "Broken", to: "/nowhere", declaredIn: "nav.ts" }],
      modules: [],
    });
    expect(
      report.findings.some(
        (f) => f.subject === "/nowhere" && f.message.includes("no matching route"),
      ),
    ).toBe(true);
  });

  it("detects duplicated routes", () => {
    const report = reconcileRoutes({
      routes: [route({ path: "/dup" }), route({ path: "/dup" })],
      navigation: [],
      modules: [],
    });
    expect(report.routes.every((r) => r.duplicatePath)).toBe(true);
  });

  it("marks dynamically generated routes as unable-to-verify", () => {
    const report = reconcileRoutes({
      routes: [route({ path: "/x/<computed>", resolution: "unable-to-verify" })],
      navigation: [],
      modules: [],
    });
    expect(report.routes[0].ownership).toBe("unable-to-verify");
  });

  it("detects overlapping route prefixes between modules", () => {
    const a = clone(sreManifest);
    a.boundaries = { ...a.boundaries, routePrefixes: ["/shared-area"] };
    const b = clone(sreManifest);
    b.identity.moduleId = "other";
    b.boundaries = { ...b.boundaries, routePrefixes: ["/shared-area/sub"] };
    const report = reconcileRoutes({ routes: [], navigation: [], modules: [a, b] });
    expect(
      report.findings.some(
        (f) => f.severity === "ownership-conflict" && f.subject.startsWith("/shared-area"),
      ),
    ).toBe(true);
  });
});

describe("navigation table", () => {
  it("was extracted from the real navigation sources", () => {
    expect(NAVIGATION_ENTRIES.length).toBeGreaterThan(20);
    expect(NAVIGATION_ENTRIES.every((n) => n.to.startsWith("/"))).toBe(true);
  });
});
