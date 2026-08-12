import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { getModules, getModule, resolveRouteOwner, getCapabilities, validateRegistry } from "./registry";
import { validateManifests } from "./validate";
import { MODULE_MANIFEST_SCHEMA_VERSION, type ModuleManifest } from "./types";
import sreManifest from "./sre/module.manifest";

const clone = (m: ModuleManifest): ModuleManifest => JSON.parse(JSON.stringify(m));

describe("module discovery", () => {
  it("discovers at least the SRE manifest", () => {
    const ids = getModules().map((m) => m.identity.moduleId);
    expect(ids).toContain("sre");
  });

  it("exposes modules by id", () => {
    expect(getModule("sre")?.identity.name).toBe("SRE Practice");
    expect(getModule("does-not-exist")).toBeUndefined();
  });

  it("resolves route ownership by exact match and prefix", () => {
    expect(resolveRouteOwner("/sre-operating-model")).toBe("sre");
    expect(resolveRouteOwner("/reliability-foundations/google-sre")).toBe("sre");
    expect(resolveRouteOwner("/commercial/overview")).toBeNull();
  });

  it("flattens capabilities with their module id", () => {
    const caps = getCapabilities();
    expect(caps.length).toBeGreaterThan(0);
    expect(caps.every((c) => typeof c.moduleId === "string")).toBe(true);
  });
});

describe("discovered registry validity", () => {
  const report = validateRegistry();

  it("has no errors or ownership conflicts", () => {
    const blocking = report.findings.filter(
      (f) => f.severity === "error" || f.severity === "ownership-conflict",
    );
    expect(blocking).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("uses the current schema version everywhere", () => {
    for (const m of getModules()) {
      expect(m.schemaVersion).toBe(MODULE_MANIFEST_SCHEMA_VERSION);
    }
  });
});

describe("validation rules", () => {
  it("flags duplicate module ids", () => {
    const report = validateManifests([clone(sreManifest), clone(sreManifest)]);
    expect(report.findings.some((f) => f.ruleId === "duplicate-module-id")).toBe(true);
    expect(report.ok).toBe(false);
  });

  it("flags a route claimed by two modules", () => {
    const other = clone(sreManifest);
    other.identity.moduleId = "other";
    other.capabilities = [];
    const report = validateManifests([clone(sreManifest), other]);
    expect(
      report.findings.some(
        (f) => f.ruleId === "invalid-route-ownership" && f.severity === "ownership-conflict",
      ),
    ).toBe(true);
  });

  it("flags an item that is both included and excluded", () => {
    const m = clone(sreManifest);
    m.exclusions = { ...m.exclusions, routes: [...m.exclusions.routes, "/sre-operating-model"] };
    const report = validateManifests([m]);
    expect(report.findings.some((f) => f.ruleId === "conflicting-inclusion-exclusion")).toBe(true);
  });

  it("flags a capability referencing an unclaimed route", () => {
    const m = clone(sreManifest);
    m.capabilities = [{ ...m.capabilities[0], relatedRoutes: ["/not-claimed"] }];
    const report = validateManifests([m]);
    expect(
      report.findings.some(
        (f) => f.ruleId === "invalid-route-ownership" && f.subject === "/not-claimed",
      ),
    ).toBe(true);
  });

  it("flags an 'implemented' capability with no backing service, api or entity", () => {
    const m = clone(sreManifest);
    m.capabilities = [{ ...m.capabilities[0], implementationStatus: "implemented" }];
    const report = validateManifests([m]);
    expect(report.findings.some((f) => f.ruleId === "unregistered-implementation")).toBe(true);
  });

  it("flags missing owners", () => {
    const m = clone(sreManifest);
    m.identity = { ...m.identity, productOwner: "", technicalOwner: "" };
    const report = validateManifests([m]);
    expect(report.findings.some((f) => f.ruleId === "missing-owner")).toBe(true);
  });

  it("reports application routes that no module claims", () => {
    const report = validateManifests([clone(sreManifest)], {
      routes: [...sreManifest.boundaries.routes, "/delivery-org-twin"],
    });
    expect(
      report.findings.some(
        (f) => f.ruleId === "unregistered-implementation" && f.subject === "/delivery-org-twin",
      ),
    ).toBe(true);
  });

  it("marks unverifiable references when no known list is supplied", () => {
    const m = clone(sreManifest);
    m.boundaries = { ...m.boundaries, databaseEntities: ["some_table"] };
    const report = validateManifests([m]);
    expect(report.findings.some((f) => f.severity === "unable-to-verify")).toBe(true);
  });
});

describe("SRE manifest evidence discipline", () => {
  it("declares no backend surface, matching the codebase", () => {
    const b = sreManifest.boundaries;
    expect(b.databaseEntities).toEqual([]);
    expect(b.serviceRefs).toEqual([]);
    expect(b.workflowIds).toEqual([]);
    expect(b.aiAgentIds).toEqual([]);
    expect(b.permissionIds).toEqual([]);
  });

  it("marks no capability as implemented", () => {
    expect(
      sreManifest.capabilities.every((c) => c.implementationStatus !== "implemented"),
    ).toBe(true);
  });

  it("references only source paths and pages that exist on disk", () => {
    const missing = [...sreManifest.boundaries.sourcePaths, ...sreManifest.boundaries.pageIds, ...sreManifest.boundaries.componentRefs].filter(
      (p) => !existsSync(p),
    );
    expect(missing).toEqual([]);
  });
});
