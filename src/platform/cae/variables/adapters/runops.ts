/**
 * RunOps module resolver adapter.
 *
 * Backed by `runops_services`, `runops_incidents`, and `runops_slos`. Sees
 * only the `runops` slice.
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

export const runopsAdapter: CaeVariableAdapter = {
  moduleKey: "runops",
  resolverKeys: [
    "runops.service_name",
    "runops.health_score",
    "runops.open_incident_count",
    "runops.slo_status",
  ],
  resolve(resolverKey, slice) {
    switch (resolverKey) {
      case "runops.service_name":
        return text(slice, "serviceName");
      case "runops.health_score":
        return numeric(slice, "healthScore");
      case "runops.open_incident_count":
        return numeric(slice, "openIncidentCount");
      case "runops.slo_status":
        return text(slice, "sloStatus");
      default:
        return { status: "unsupported_resolver" };
    }
  },
};
