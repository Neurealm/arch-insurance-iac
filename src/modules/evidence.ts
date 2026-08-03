/**
 * Stage 2 — evidence-strength model.
 *
 * Stage 1 recorded a coarse `implementationStatus` per capability. Stage 2 adds
 * a finer, evidence-backed view: what actually backs each screen, traced
 * through the import graph rather than inferred from route presence or UI.
 *
 * Rule of the model: route presence, UI controls and static data can never
 * raise a capability above `client-side-functional`.
 */

import { SRE_PAGE_EVIDENCE } from "./sre/evidence.generated";
import {
  EVIDENCE_STRENGTH_ORDER,
  type DataBacking,
  type EvidenceRecord,
  type EvidenceStrength,
} from "./routeTypes";
import type { ImplementationStatus } from "./types";

export { SRE_PAGE_EVIDENCE };

export const evidenceRank = (s: EvidenceStrength): number =>
  EVIDENCE_STRENGTH_ORDER.indexOf(s);

/** Strongest evidence in a set; `unable-to-verify` never wins. */
export function strongestEvidence(
  records: readonly EvidenceRecord[],
): EvidenceStrength {
  const ranked = records
    .map((r) => r.evidenceStrength)
    .filter((s) => evidenceRank(s) >= 0)
    .sort((a, b) => evidenceRank(b) - evidenceRank(a));
  return ranked[0] ?? "unable-to-verify";
}

/**
 * Maps evidence strength onto the Stage 1 capability status vocabulary without
 * ever overstating maturity: only API-, database-, integration- or
 * workflow-backed evidence can produce `partial`/`implemented`.
 */
export function statusFromEvidence(strength: EvidenceStrength): ImplementationStatus {
  switch (strength) {
    case "visual-only":
      return "static";
    case "static-data":
      return "static";
    case "mock-service":
      return "mock";
    case "client-side-functional":
      return "mock";
    case "shared-service-backed":
      // Shared hooks/services alone do not prove a backend data path.
      return "mock";
    case "api-backed":
    case "database-backed":
    case "integration-backed":
    case "workflow-backed":
      return "partial";
    case "runtime-verified":
      return "implemented";
    default:
      return "planned";
  }
}

export interface EvidenceSummary {
  recordCount: number;
  byStrength: Record<string, number>;
  byBacking: Record<string, number>;
  /** Pages whose only backend reach is inherited platform chrome. */
  chromeOnlyPages: readonly string[];
  strongest: EvidenceStrength;
  /** Highest status the evidence can justify for the module as a whole. */
  maxJustifiableStatus: ImplementationStatus;
}

export function summarizeEvidence(
  records: readonly EvidenceRecord[] = SRE_PAGE_EVIDENCE,
): EvidenceSummary {
  const byStrength: Record<string, number> = {};
  const byBacking: Record<string, number> = {};
  const chromeOnlyPages: string[] = [];

  for (const r of records) {
    byStrength[r.evidenceStrength] = (byStrength[r.evidenceStrength] ?? 0) + 1;
    for (const b of r.dataBacking) byBacking[b] = (byBacking[b] ?? 0) + 1;
    const realBacking: readonly DataBacking[] = [
      "supabase",
      "edge-function",
      "internal-api",
      "external-integration",
    ];
    if (r.platformChrome.length > 0 && !r.dataBacking.some((b) => realBacking.includes(b))) {
      chromeOnlyPages.push(r.ref);
    }
  }

  const strongest = strongestEvidence(records);
  return {
    recordCount: records.length,
    byStrength,
    byBacking,
    chromeOnlyPages,
    strongest,
    maxJustifiableStatus: statusFromEvidence(strongest),
  };
}

/** Evidence records for one capability, matched by its related pages. */
export function evidenceForPages(
  pages: readonly string[],
  records: readonly EvidenceRecord[] = SRE_PAGE_EVIDENCE,
): readonly EvidenceRecord[] {
  return records.filter((r) => pages.includes(r.ref));
}
