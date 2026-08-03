import { describe, expect, it } from "vitest";
import { classifyUnregistered } from "./classification";
import { discoverCandidateModules } from "./candidates";
import { runGovernance } from "./governance";
import { SHARED_CAPABILITIES } from "./shared/sharedCapabilities";
import { PLATFORM_CAPABILITIES } from "./platform/platformCapabilities";
import { SRE_CAPABILITY_HIERARCHY } from "./sre/capabilityHierarchy";
import { getModule } from "./registry";

describe("stage 3 classification", () => {
  const report = classifyUnregistered();

  it("classifies every inventory item exactly once", () => {
    const ids = report.items.map((i) => i.itemId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("counts sum to the item total", () => {
    const total = Object.values(report.byClassification).reduce((a, b) => a + b, 0);
    expect(total).toBe(report.items.length);
  });

  it("flags low-confidence dispositions for human review", () => {
    const lowUnreviewed = report.items.filter(
      (i) => i.confidence === "low" && !i.humanReviewRequired,
    );
    expect(lowUnreviewed).toHaveLength(0);
  });

  it("never leaves an item without evidence", () => {
    expect(report.items.filter((i) => i.evidence.length === 0)).toHaveLength(0);
  });
});

describe("candidate modules", () => {
  const candidates = discoverCandidateModules();

  it("excludes already-registered modules", () => {
    expect(candidates.map((c) => c.proposedModuleId)).not.toContain("sre");
  });

  it("gives every candidate a purpose, boundary and readiness", () => {
    for (const c of candidates) {
      expect(c.businessPurpose.length).toBeGreaterThan(20);
      expect(c.sourceBoundaries.length).toBeGreaterThan(0);
      expect(c.readiness).toBeTruthy();
      expect(c.evidence.length).toBeGreaterThan(0);
    }
  });

  it("never marks a candidate ready without route, file and navigation evidence", () => {
    for (const c of candidates.filter((x) => x.readiness === "ready-to-register")) {
      expect(c.metrics.routeCount).toBeGreaterThanOrEqual(3);
      expect(c.metrics.fileCount).toBeGreaterThanOrEqual(10);
      expect(c.metrics.navigationCount).toBeGreaterThan(0);
    }
  });

  it("proposes commercial as a candidate with database evidence", () => {
    const commercial = candidates.find((c) => c.proposedModuleId === "commercial");
    expect(commercial).toBeDefined();
    expect(commercial!.databaseEntities.length).toBeGreaterThan(0);
  });
});

describe("shared and platform registries", () => {
  it("uses unique identifiers", () => {
    const shared = SHARED_CAPABILITIES.map((c) => c.sharedCapabilityId);
    const platform = PLATFORM_CAPABILITIES.map((c) => c.platformCapabilityId);
    expect(new Set(shared).size).toBe(shared.length);
    expect(new Set(platform).size).toBe(platform.length);
  });

  it("records at least one consumer for every shared capability", () => {
    for (const c of SHARED_CAPABILITIES) {
      expect(c.consumingModules.length).toBeGreaterThan(0);
    }
  });

  it("resolves shared dependencies declared by the SRE manifest", () => {
    const sre = getModule("sre");
    const declared = (sre?.capabilities ?? [])
      .flatMap((c) => c.dependencies ?? [])
      .filter((d) => d.startsWith("shared."));
    const known = new Set(SHARED_CAPABILITIES.map((c) => c.sharedCapabilityId));
    for (const dep of declared) expect(known.has(dep)).toBe(true);
  });
});

describe("SRE capability hierarchy", () => {
  const nodes = SRE_CAPABILITY_HIERARCHY.nodes;

  it("has exactly one domain root", () => {
    expect(nodes.filter((n) => n.parentCapabilityId === null)).toHaveLength(1);
  });

  it("resolves every parent reference", () => {
    const ids = new Set(nodes.map((n) => n.capabilityId));
    for (const n of nodes) {
      if (n.parentCapabilityId) expect(ids.has(n.parentCapabilityId)).toBe(true);
    }
  });

  it("preserves Stage 1 capability lineage", () => {
    const superseded = new Set(
      nodes.map((n) => n.supersedesCapabilityId).filter(Boolean) as string[],
    );
    const stage1 = (getModule("sre")?.capabilities ?? []).map((c) => c.capabilityId);
    for (const id of stage1) expect(superseded.has(id)).toBe(true);
  });

  it("classifies no SRE node as an operational implementation", () => {
    expect(
      nodes.filter((n) => n.implementationClassification === "operational-implementation"),
    ).toHaveLength(0);
  });
});

describe("governance", () => {
  const report = runGovernance();

  it("gives every finding a subject, message and remediation", () => {
    for (const f of report.findings) {
      expect(f.subject).toBeTruthy();
      expect(f.message.length).toBeGreaterThan(10);
      expect(f.remediation.length).toBeGreaterThan(10);
    }
  });

  it("keeps severity counts consistent", () => {
    expect(report.errorCount + report.warningCount + report.infoCount).toBe(
      report.findings.length,
    );
  });

  it("only gates release on errors", () => {
    expect(report.blocksRelease).toBe(report.errorCount > 0);
  });

  it("reports unowned shared capabilities", () => {
    const rule = report.findings.filter(
      (f) => f.ruleId === "shared-capability-without-primary-owner",
    );
    expect(rule.length).toBe(
      SHARED_CAPABILITIES.filter((c) => c.primaryOwner === "unassigned").length,
    );
  });
});
