/**
 * AVEP module resolver adapter.
 *
 * Backed by the AVEP canonical verification dataset (`src/avep/data/canonical`):
 * tracked requirements, functional coverage, and signoff gate state. Sees only
 * the `avep` slice.
 */
import type { CaeModuleSlice, CaeResolverOutcome, CaeVariableAdapter } from "../types";

function text(slice: CaeModuleSlice, key: string): CaeResolverOutcome {
  const value = slice[key];
  if (typeof value !== "string" || value.trim() === "") return { status: "missing" };
  return { status: "ok", value: value.trim() };
}

function numeric(slice: CaeModuleSlice, key: string): CaeResolverOutcome {
  const value = slice[key];
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) return { status: "missing" };
  return { status: "ok", value: parsed };
}

export const avepAdapter: CaeVariableAdapter = {
  moduleKey: "avep",
  resolverKeys: ["avep.requirement_count", "avep.coverage_percentage", "avep.signoff_status"],
  resolve(resolverKey, slice) {
    switch (resolverKey) {
      case "avep.requirement_count":
        return numeric(slice, "requirementCount");
      case "avep.coverage_percentage":
        return numeric(slice, "coveragePercentage");
      case "avep.signoff_status":
        return text(slice, "signoffStatus");
      default:
        return { status: "unsupported_resolver" };
    }
  },
};
