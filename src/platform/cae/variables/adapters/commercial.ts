/**
 * Commercial module resolver adapter.
 *
 * Backed by `commercial_scenarios`, `commercial_programs`, and
 * `commercial_model_results` (metric codes REV-TOTAL, COD-TOTAL, OPEX-TOTAL,
 * PL-GROSS-MARGIN-PCT, PL-EBITDA, PL-EBITDA-MARGIN-PCT). The page builds the
 * slice from data the session is already authorised to read; the adapter is a
 * pure projection over that slice.
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

export const commercialAdapter: CaeVariableAdapter = {
  moduleKey: "commercial",
  resolverKeys: [
    "commercial.scenario_name",
    "commercial.opportunity_name",
    "commercial.forecast_period",
    "commercial.total_revenue",
    "commercial.total_cost",
    "commercial.gross_margin",
    "commercial.ebitda",
    "commercial.ebitda_margin",
  ],
  resolve(resolverKey, slice) {
    switch (resolverKey) {
      case "commercial.scenario_name":
        return text(slice, "scenarioName");
      case "commercial.opportunity_name":
        return text(slice, "opportunityName");
      case "commercial.forecast_period":
        return text(slice, "forecastPeriod");
      case "commercial.total_revenue":
        return numeric(slice, "totalRevenue");
      case "commercial.total_cost":
        return numeric(slice, "totalCost");
      case "commercial.gross_margin":
        return numeric(slice, "grossMarginPercent");
      case "commercial.ebitda":
        return numeric(slice, "ebitda");
      case "commercial.ebitda_margin":
        return numeric(slice, "ebitdaMarginPercent");
      default:
        return { status: "unsupported_resolver" };
    }
  },
};

/** Converts a stored ratio metric (unit `ratio`) into a percentage number. */
export function ratioToPercent(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value * 100;
}
