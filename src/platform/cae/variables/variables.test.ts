import { describe, expect, it, vi } from "vitest";
import { buildRegistry, extractTokens } from "./registry";
import { resolveVariables, buildResolutionLog } from "./resolve";
import { formatDisplayValue, formatSpokenValue } from "./format";
import type { CaeVariableContext, CaeVariableDefinition } from "./types";

const TENANT = "11111111-1111-1111-1111-111111111111";
const OTHER_TENANT = "22222222-2222-2222-2222-222222222222";

function def(over: Partial<CaeVariableDefinition> & Pick<CaeVariableDefinition, "variableKey" | "moduleKey" | "resolverKey">): CaeVariableDefinition {
  return {
    displayName: over.variableKey,
    description: null,
    requiredContext: ["tenant"],
    valueType: "text",
    displayFormat: "text",
    spokenFormat: "text",
    missingFallback: "this value is not available",
    sensitivity: "internal",
    requiredPermissionCode: null,
    isEnabled: true,
    isAuthorized: true,
    ...over,
  } as CaeVariableDefinition;
}

const REGISTRY = buildRegistry([
  def({ variableKey: "platform.tenant_name", moduleKey: "platform", resolverKey: "platform.tenant_name", sensitivity: "public" }),
  def({ variableKey: "commercial.scenario_name", moduleKey: "commercial", resolverKey: "commercial.scenario_name" }),
  def({
    variableKey: "commercial.ebitda", moduleKey: "commercial", resolverKey: "commercial.ebitda",
    displayFormat: "currency_usd", spokenFormat: "currency_usd", sensitivity: "restricted",
    requiredPermissionCode: "commercial.view", missingFallback: "not yet calculated",
  }),
  def({
    variableKey: "commercial.ebitda_margin", moduleKey: "commercial", resolverKey: "commercial.ebitda_margin",
    displayFormat: "percentage", spokenFormat: "percentage", sensitivity: "restricted",
    requiredPermissionCode: "commercial.view", isAuthorized: false, missingFallback: "not yet calculated",
  }),
  def({
    variableKey: "runops.open_incident_count", moduleKey: "runops", resolverKey: "runops.open_incident_count",
    displayFormat: "integer", spokenFormat: "integer", isEnabled: false, missingFallback: "not currently measured",
  }),
  def({
    variableKey: "runops.health_score", moduleKey: "runops", resolverKey: "runops.health_score",
    displayFormat: "integer", spokenFormat: "integer", missingFallback: "not currently measured",
  }),
  def({
    variableKey: "avep.coverage_percentage", moduleKey: "avep", resolverKey: "avep.coverage_percentage",
    displayFormat: "percentage", spokenFormat: "percentage", requiredContext: ["program"],
    missingFallback: "not currently tracked",
  }),
  // Deliberately mis-declared: commercial variable pointing at a RunOps resolver.
  def({ variableKey: "commercial.total_cost", moduleKey: "commercial", resolverKey: "runops.service_name" }),
]);

const context: CaeVariableContext = {
  tenantId: TENANT,
  platform: { tenantId: TENANT, tenantName: "NeuGAIN Commercial", moduleName: "Commercial", pageName: "P&L" },
  commercial: {
    tenantId: TENANT,
    scenarioName: "Project Momentous — Base",
    ebitda: 12_400_000,
    ebitdaMarginPercent: 18.4,
  },
  runops: { tenantId: TENANT, healthScore: 92, openIncidentCount: 3 },
  avep: { coveragePercentage: 93.4, requirementCount: 142 },
};

describe("token extraction", () => {
  it("only recognises {{module.variable_name}} tokens", () => {
    const tokens = extractTokens("A {{platform.tenant_name}} B {{ commercial.scenario_name }} C {{2+2}}");
    expect(tokens.map((t) => t.variableKey)).toEqual([
      "platform.tenant_name", "commercial.scenario_name", null,
    ]);
  });
});

describe("valid resolution", () => {
  it("resolves text, currency and percentage variables", () => {
    const result = resolveVariables(
      "{{platform.tenant_name}} · {{commercial.scenario_name}} · {{commercial.ebitda}}",
      REGISTRY, context,
    );
    expect(result.displayText).toBe("NeuGAIN Commercial · Project Momentous — Base · $12,400,000");
    expect(result.spokenText).toBe("NeuGAIN Commercial · Project Momentous — Base · 12.4 million dollars");
    expect(result.resolvedKeys).toEqual(["commercial.ebitda", "commercial.scenario_name", "platform.tenant_name"]);
    expect(result.hasBlockingIssues).toBe(false);
  });

  it("produces natural spoken formats", () => {
    expect(formatDisplayValue(93.4, "percentage")).toBe("93.4%");
    expect(formatSpokenValue(93.4, "percentage")).toBe("93.4 percent");
    expect(formatSpokenValue(1200, "currency_usd")).toBe("1200 dollars");
    expect(formatSpokenValue(-2_500_000, "currency_usd")).toBe("negative 2.5 million dollars");
    expect(formatSpokenValue("2026-07-27T00:00:00Z", "date")).toBe("July 27, 2026");
    expect(formatDisplayValue(1234, "integer")).toBe("1,234");
  });
});

describe("missing values", () => {
  it("uses the approved fallback when the value is absent", () => {
    const result = resolveVariables("Health is {{runops.health_score}}.", REGISTRY, { ...context, runops: { tenantId: TENANT } });
    expect(result.spokenText).toBe("Health is not currently measured.");
    expect(result.diagnostics[0].code).toBe("missing_value");
  });

  it("uses the fallback when the module context is absent entirely", () => {
    const result = resolveVariables("Coverage {{avep.coverage_percentage}}", REGISTRY, { tenantId: TENANT });
    expect(result.spokenText).toBe("Coverage not currently tracked");
    expect(result.diagnostics[0].code).toBe("missing_context");
  });
});

describe("malformed and unknown tokens", () => {
  it("warns about malformed tokens and never evaluates them", () => {
    const result = resolveVariables("{{ 2 + 2 }} and {{DROP TABLE users}}", REGISTRY, context);
    expect(result.displayText).toBe("this value is not available and this value is not available");
    expect(result.diagnostics.every((d) => d.code === "malformed_token")).toBe(true);
    expect(result.hasBlockingIssues).toBe(true);
  });

  it("rejects unknown variables", () => {
    const result = resolveVariables("{{commercial.secret_number}}", REGISTRY, context);
    expect(result.diagnostics[0].code).toBe("unknown_variable");
    expect(result.displayText).toBe("this value is not available");
  });
});

describe("disabled, restricted and cross boundary requests", () => {
  it("does not resolve disabled variables", () => {
    const result = resolveVariables("{{runops.open_incident_count}}", REGISTRY, context);
    expect(result.diagnostics[0].code).toBe("disabled_variable");
    expect(result.spokenText).toBe("not currently measured");
  });

  it("never speaks a restricted value to an unauthorised user", () => {
    const result = resolveVariables("Margin {{commercial.ebitda_margin}}", REGISTRY, context);
    expect(result.diagnostics[0].code).toBe("unauthorized_variable");
    expect(result.spokenText).toBe("Margin not yet calculated");
    expect(result.spokenText).not.toContain("18.4");
  });

  it("refuses context captured for another tenant", () => {
    const result = resolveVariables("{{commercial.ebitda}}", REGISTRY, {
      ...context,
      commercial: { ...context.commercial, tenantId: OTHER_TENANT },
    });
    expect(result.diagnostics[0].code).toBe("cross_tenant_context");
    expect(result.displayText).toBe("not yet calculated");
  });

  it("refuses a variable declared against another module's resolver", () => {
    const result = resolveVariables("{{commercial.total_cost}}", REGISTRY, context);
    expect(result.diagnostics[0].code).toBe("cross_module_resolver");
  });

  it("keeps module adapters isolated from each other's context", () => {
    const spy = vi.fn();
    const isolated: CaeVariableContext = {
      tenantId: TENANT,
      commercial: { tenantId: TENANT, scenarioName: "Base", get ebitda() { spy(); return 1; } },
      runops: { tenantId: TENANT, healthScore: 92 },
    };
    const result = resolveVariables("{{runops.health_score}}", REGISTRY, isolated);
    expect(result.resolvedKeys).toEqual(["runops.health_score"]);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("telemetry", () => {
  it("logs variable keys without resolved values", () => {
    const result = resolveVariables("{{commercial.ebitda}} {{commercial.ebitda_margin}}", REGISTRY, context);
    const log = buildResolutionLog(result);
    expect(log.resolvedKeys).toEqual(["commercial.ebitda"]);
    expect(log.issues).toEqual([{ variableKey: "commercial.ebitda_margin", code: "unauthorized_variable" }]);
    expect(JSON.stringify(log)).not.toContain("12400000");
    expect(JSON.stringify(log)).not.toContain("18.4");
  });
});
