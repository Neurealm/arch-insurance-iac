import { describe, it, expect } from "vitest";
import { buildUnregisteredReport, orphanedImplementation } from "./inventory";
import { IMPLEMENTATION_INVENTORY } from "./generated/implementationInventory";
import sreManifest from "./sre/module.manifest";
import type { InventoryItem } from "./routeTypes";

const item = (over: Partial<InventoryItem> = {}): InventoryItem => ({
  ref: "src/pages/Something.tsx",
  implementationType: "page",
  consumerCount: 1,
  reachableViaRoute: true,
  activity: "active",
  usesSupabase: false,
  evidence: "1 import site(s)",
  ...over,
});

describe("implementation inventory", () => {
  it("scanned the real codebase", () => {
    expect(IMPLEMENTATION_INVENTORY.length).toBeGreaterThan(200);
    expect(IMPLEMENTATION_INVENTORY.some((i) => i.implementationType === "edge-function")).toBe(true);
    expect(IMPLEMENTATION_INVENTORY.some((i) => i.implementationType === "hook")).toBe(true);
  });

  it("detects direct Supabase usage where it exists", () => {
    const supabaseBacked = IMPLEMENTATION_INVENTORY.filter((i) => i.usesSupabase);
    expect(supabaseBacked.length).toBeGreaterThan(0);
    expect(supabaseBacked.some((i) => i.ref.startsWith("src/pages/prod-twin/"))).toBe(false);
  });
});

describe("unregistered implementation report", () => {
  const report = buildUnregisteredReport();

  it("counts registered items and reports the rest", () => {
    expect(report.registeredItemCount).toBeGreaterThan(0);
    expect(report.items.length).toBeGreaterThan(0);
    expect(Object.keys(report.byType).length).toBeGreaterThan(1);
  });

  it("does not report files already declared by the SRE manifest", () => {
    const declared = new Set<string>(sreManifest.boundaries.pageIds);
    expect(report.items.some((i) => declared.has(i.ref))).toBe(false);
  });

  it("recommends a platform capability for platform-owned code", () => {
    const platformItem = report.items.find((i) => i.ref.startsWith("supabase/functions/"));
    expect(platformItem?.recommendedAction).toBe("register-as-platform-capability");
  });

  it("assigns a likely module for well-known implementation roots", () => {
    const commercial = report.items.find((i) => i.ref.startsWith("src/commercial/"));
    expect(commercial?.likelyModuleId).toBe("commercial");
  });

  it("reports unregistered routes as route items", () => {
    expect(report.items.some((i) => i.implementationType === "route")).toBe(true);
  });

  it("recommends removal review only for items with no consumers", () => {
    const removals = report.items.filter((i) => i.recommendedAction === "remove-if-confirmed-unused");
    expect(removals.every((i) => i.activity === "unused")).toBe(true);
  });
});

describe("orphaned and unreachable implementation", () => {
  it("isolates unused and unreachable items", () => {
    const orphans = orphanedImplementation(
      buildUnregisteredReport({
        inventory: [
          item({ ref: "src/pages/Used.tsx" }),
          item({ ref: "src/pages/Orphan.tsx", consumerCount: 0, reachableViaRoute: false, activity: "unused" }),
        ],
        navigation: [],
        modules: [],
      }),
    );
    expect(orphans.some((o) => o.ref === "src/pages/Orphan.tsx")).toBe(true);
    expect(orphans.some((o) => o.ref === "src/pages/Used.tsx")).toBe(false);
  });
});
