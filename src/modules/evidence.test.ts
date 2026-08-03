import { describe, it, expect } from "vitest";
import {
  SRE_PAGE_EVIDENCE,
  evidenceForPages,
  evidenceRank,
  statusFromEvidence,
  strongestEvidence,
  summarizeEvidence,
} from "./evidence";
import sreManifest from "./sre/module.manifest";
import type { EvidenceRecord } from "./routeTypes";

const record = (over: Partial<EvidenceRecord> = {}): EvidenceRecord => ({
  ref: "src/pages/prod-twin/Example.tsx",
  route: "/example",
  evidenceStrength: "static-data",
  dataBacking: ["local-fixture"],
  tracedDependencies: [],
  interactive: false,
  evidence: [],
  platformChrome: [],
  confidence: "high",
  ...over,
});

describe("SRE indirect dependency trace", () => {
  it("covers every routed SRE page", () => {
    expect(SRE_PAGE_EVIDENCE.length).toBeGreaterThanOrEqual(30);
    expect(SRE_PAGE_EVIDENCE.every((r) => r.ref.startsWith("src/pages/prod-twin/"))).toBe(true);
  });

  it("finds no capability data path to Supabase, edge functions or external APIs", () => {
    const backend = SRE_PAGE_EVIDENCE.filter((r) =>
      r.dataBacking.some((b) => ["supabase", "edge-function", "internal-api", "external-integration"].includes(b)),
    );
    expect(backend).toEqual([]);
  });

  it("attributes inherited platform chrome separately from capability data", () => {
    const summary = summarizeEvidence();
    expect(summary.chromeOnlyPages.length).toBeGreaterThan(0);
    const chromeRefs = SRE_PAGE_EVIDENCE.flatMap((r) => r.platformChrome);
    expect(chromeRefs.some((c) => c.startsWith("src/components/eoc/"))).toBe(true);
  });

  it("detects static fixture imports", () => {
    const fixtureBacked = SRE_PAGE_EVIDENCE.filter((r) => r.dataBacking.includes("local-fixture"));
    expect(fixtureBacked.length).toBeGreaterThan(0);
    expect(
      fixtureBacked.some((r) => r.tracedDependencies.some((d) => d.startsWith("src/data/"))),
    ).toBe(true);
  });

  it("classifies shared React contexts as client state, never as a service", () => {
    const shared = SRE_PAGE_EVIDENCE.filter((r) => r.dataBacking.includes("shared-service"));
    expect(shared.every((r) => r.tracedDependencies.length > 0)).toBe(true);
    const contextBacked = SRE_PAGE_EVIDENCE.filter((r) =>
      r.tracedDependencies.some((d) => d.startsWith("src/context/")),
    );
    expect(contextBacked.every((r) => r.dataBacking.includes("client-generated-state"))).toBe(true);
  });


  it("maps every capability's pages onto evidence records", () => {
    for (const cap of sreManifest.capabilities) {
      const records = evidenceForPages(cap.relatedPages);
      expect(records.length).toBeGreaterThan(0);
    }
  });
});

describe("evidence-strength model", () => {
  it("orders strengths weakest to strongest", () => {
    expect(evidenceRank("visual-only")).toBeLessThan(evidenceRank("static-data"));
    expect(evidenceRank("client-side-functional")).toBeLessThan(evidenceRank("database-backed"));
    expect(evidenceRank("unable-to-verify")).toBe(-1);
  });

  it("never promotes UI-only or static evidence to implemented", () => {
    for (const s of ["visual-only", "static-data", "mock-service", "client-side-functional"] as const) {
      expect(statusFromEvidence(s)).not.toBe("implemented");
    }
  });

  it("takes the strongest record and ignores unverifiable ones", () => {
    expect(
      strongestEvidence([
        record({ evidenceStrength: "unable-to-verify" }),
        record({ evidenceStrength: "client-side-functional" }),
        record({ evidenceStrength: "static-data" }),
      ]),
    ).toBe("client-side-functional");
    expect(strongestEvidence([record({ evidenceStrength: "unable-to-verify" })])).toBe("unable-to-verify");
  });

  it("summarizes the SRE surface without overstating maturity", () => {
    const summary = summarizeEvidence();
    expect(summary.recordCount).toBe(SRE_PAGE_EVIDENCE.length);
    expect(["static", "mock", "partial"]).toContain(summary.maxJustifiableStatus);
    expect(summary.maxJustifiableStatus).not.toBe("implemented");
  });
});
