/**
 * Token resolution.
 *
 * The resolver is intentionally not an interpreter. It performs a single pass
 * over the narrative text, substituting only tokens that resolve to a governed
 * registry entry through an approved, module-owned adapter. Anything else is
 * replaced with approved fallback language and reported to the author.
 */
import { formatDisplayValue, formatSpokenValue } from "./format";
import { extractTokens, getAdapter } from "./registry";
import type {
  CaeModuleSlice,
  CaeTokenDiagnostic,
  CaeTokenIssueCode,
  CaeVariableContext,
  CaeVariableDefinition,
  CaeVariableRegistry,
  CaeVariableResolution,
} from "./types";

const GENERIC_FALLBACK = "this value is not available";

const MESSAGES: Record<CaeTokenIssueCode, (key: string) => string> = {
  malformed_token: (t) => `"${t}" is not a valid variable token. Use {{module.variable_name}}.`,
  unknown_variable: (k) => `${k} is not in the approved variable registry.`,
  disabled_variable: (k) => `${k} is currently disabled and will not be spoken.`,
  unauthorized_variable: (k) => `You are not authorised to use ${k} in this workspace.`,
  cross_tenant_context: (k) => `${k} was requested with data from another tenant and was refused.`,
  cross_module_resolver: (k) => `${k} is not served by its declared module resolver.`,
  missing_context: (k) => `${k} needs record context that is not present on this page.`,
  missing_value: (k) => `${k} has no value in the current context.`,
  no_adapter: (k) => `No approved resolver adapter is registered for ${k}.`,
};

function sliceFor(context: CaeVariableContext, moduleKey: string): CaeModuleSlice | undefined {
  // Each adapter receives only its own namespace: module resolvers stay isolated.
  switch (moduleKey) {
    case "platform": return context.platform;
    case "commercial": return context.commercial;
    case "runops": return context.runops;
    case "avep": return context.avep;
    default: return undefined;
  }
}

function fallbackFor(definition: CaeVariableDefinition | null): string {
  return definition?.missingFallback?.trim() || GENERIC_FALLBACK;
}

type TokenOutcome = {
  display: string;
  spoken: string;
  diagnostic: CaeTokenDiagnostic;
};

function issue(
  token: string,
  variableKey: string | null,
  code: CaeTokenIssueCode,
  definition: CaeVariableDefinition | null,
): TokenOutcome {
  const fallback = fallbackFor(definition);
  return {
    display: fallback,
    spoken: fallback,
    diagnostic: { token, variableKey, code, message: MESSAGES[code](variableKey ?? token) },
  };
}

function resolveToken(
  token: string,
  variableKey: string | null,
  registry: CaeVariableRegistry,
  context: CaeVariableContext,
): TokenOutcome {
  if (!variableKey) return issue(token, null, "malformed_token", null);

  const definition = registry.get(variableKey) ?? null;
  if (!definition) return issue(token, variableKey, "unknown_variable", null);
  if (!definition.isEnabled) return issue(token, variableKey, "disabled_variable", definition);
  // Authorisation is decided server-side; the client only honours the verdict.
  if (!definition.isAuthorized) return issue(token, variableKey, "unauthorized_variable", definition);

  const adapter = getAdapter(definition.moduleKey);
  if (!adapter) return issue(token, variableKey, "no_adapter", definition);
  if (!adapter.resolverKeys.includes(definition.resolverKey)
    || !definition.resolverKey.startsWith(`${definition.moduleKey}.`)) {
    return issue(token, variableKey, "cross_module_resolver", definition);
  }

  const slice = sliceFor(context, definition.moduleKey);
  if (!slice) return issue(token, variableKey, "missing_context", definition);

  const sliceTenant = slice.tenantId ?? null;
  if (sliceTenant !== null && sliceTenant !== context.tenantId) {
    return issue(token, variableKey, "cross_tenant_context", definition);
  }
  if (definition.requiredContext.includes("tenant") && !context.tenantId) {
    return issue(token, variableKey, "missing_context", definition);
  }

  const outcome = adapter.resolve(definition.resolverKey, slice);
  if (outcome.status === "unsupported_resolver") {
    return issue(token, variableKey, "cross_module_resolver", definition);
  }
  if (outcome.status === "missing") {
    return issue(token, variableKey, "missing_value", definition);
  }

  const display = formatDisplayValue(outcome.value, definition.displayFormat);
  const spoken = formatSpokenValue(outcome.value, definition.spokenFormat);
  if (display === null || spoken === null) {
    return issue(token, variableKey, "missing_value", definition);
  }

  return {
    display,
    spoken,
    diagnostic: { token, variableKey, code: "resolved", message: `${variableKey} resolved.` },
  };
}

const BLOCKING: readonly string[] = [
  "malformed_token", "unknown_variable", "disabled_variable",
  "unauthorized_variable", "cross_tenant_context", "cross_module_resolver", "no_adapter",
];

/**
 * Resolves every token in a narrative body.
 *
 * `displayText` is used for transcripts and author previews; `spokenText` is
 * handed to the speech layer. Unresolvable tokens never leak their key into
 * the spoken output — approved fallback language is substituted instead.
 */
export function resolveVariables(
  text: string,
  registry: CaeVariableRegistry,
  context: CaeVariableContext,
): CaeVariableResolution {
  const source = text ?? "";
  const tokens = extractTokens(source);
  if (tokens.length === 0) {
    return { displayText: source, spokenText: source, resolvedKeys: [], diagnostics: [], hasBlockingIssues: false };
  }

  const diagnostics: CaeTokenDiagnostic[] = [];
  const resolvedKeys = new Set<string>();
  const displayByToken = new Map<string, string>();
  const spokenByToken = new Map<string, string>();

  for (const { token, variableKey } of tokens) {
    if (displayByToken.has(token)) continue;
    const outcome = resolveToken(token, variableKey, registry, context);
    displayByToken.set(token, outcome.display);
    spokenByToken.set(token, outcome.spoken);
    diagnostics.push(outcome.diagnostic);
    if (outcome.diagnostic.code === "resolved" && variableKey) resolvedKeys.add(variableKey);
  }

  const substitute = (map: Map<string, string>) => {
    let output = source;
    for (const [token, value] of map) output = output.split(token).join(value);
    return output;
  };

  return {
    displayText: substitute(displayByToken),
    spokenText: substitute(spokenByToken),
    resolvedKeys: [...resolvedKeys].sort(),
    diagnostics,
    hasBlockingIssues: diagnostics.some((d) => BLOCKING.includes(d.code)),
  };
}

/**
 * Telemetry payload for a resolution.
 *
 * Only variable keys and issue codes are recorded. Resolved values — which may
 * be restricted financial data — are never logged.
 */
export function buildResolutionLog(resolution: CaeVariableResolution) {
  return {
    resolvedKeys: resolution.resolvedKeys,
    issues: resolution.diagnostics
      .filter((d) => d.code !== "resolved")
      .map((d) => ({ variableKey: d.variableKey, code: d.code })),
  };
}
