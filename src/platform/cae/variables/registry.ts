/**
 * Governed variable registry.
 *
 * The registry is loaded from `audio_variable_registry`, a SECURITY DEFINER
 * function that resolves tenant membership and permission requirements
 * server-side. The client never widens authorisation: it can only narrow it.
 */
import { CAE_VARIABLE_KEY_PATTERN, CAE_VARIABLE_TOKEN_PATTERN } from "./types";
import type {
  CaeVariableAdapter,
  CaeVariableDefinition,
  CaeVariableFormat,
  CaeVariableRegistry,
  CaeVariableSensitivity,
} from "./types";
import { platformAdapter } from "./adapters/platform";
import { commercialAdapter } from "./adapters/commercial";
import { runopsAdapter } from "./adapters/runops";
import { avepAdapter } from "./adapters/avep";

/** Module adapters shipped with the platform. Isolated from one another. */
export const CAE_ADAPTERS: readonly CaeVariableAdapter[] = [
  platformAdapter,
  commercialAdapter,
  runopsAdapter,
  avepAdapter,
];

export function getAdapter(moduleKey: string): CaeVariableAdapter | null {
  return CAE_ADAPTERS.find((a) => a.moduleKey === moduleKey) ?? null;
}

const FORMATS: readonly CaeVariableFormat[] = [
  "text", "integer", "decimal", "currency_usd", "percentage", "date", "status",
];

function asFormat(value: unknown): CaeVariableFormat {
  return FORMATS.includes(value as CaeVariableFormat) ? (value as CaeVariableFormat) : "text";
}

function asSensitivity(value: unknown): CaeVariableSensitivity {
  return value === "public" || value === "restricted" ? value : "internal";
}

/** Normalises one row returned by `audio_variable_registry`. */
export function toVariableDefinition(row: Record<string, unknown>): CaeVariableDefinition {
  return {
    variableKey: String(row.variable_key ?? ""),
    displayName: String(row.display_name ?? row.variable_key ?? ""),
    description: (row.description as string | null) ?? null,
    moduleKey: String(row.module_key ?? ""),
    resolverKey: String(row.resolver_key ?? ""),
    requiredContext: Array.isArray(row.required_context) ? (row.required_context as unknown[]).map(String) : [],
    valueType: String(row.value_type ?? "text"),
    displayFormat: asFormat(row.display_format),
    spokenFormat: asFormat(row.spoken_format),
    missingFallback: String(row.missing_fallback ?? "this value is not available"),
    sensitivity: asSensitivity(row.sensitivity),
    requiredPermissionCode: (row.required_permission_code as string | null) ?? null,
    isEnabled: row.is_enabled !== false,
    isAuthorized: row.is_authorized === true,
  };
}

export function buildRegistry(definitions: readonly CaeVariableDefinition[]): CaeVariableRegistry {
  const map = new Map<string, CaeVariableDefinition>();
  for (const definition of definitions) {
    if (!isValidVariableKey(definition.variableKey)) continue;
    map.set(definition.variableKey, definition);
  }
  return map;
}

export function isValidVariableKey(value: unknown): value is string {
  return typeof value === "string" && CAE_VARIABLE_KEY_PATTERN.test(value);
}

export type CaeToken = {
  /** Raw token text including braces. */
  token: string;
  /** Inner text with surrounding whitespace removed. */
  raw: string;
  /** Non-null only when the token is well formed. */
  variableKey: string | null;
};

/** Extracts every `{{...}}` token, well formed or not. */
export function extractTokens(text: string): CaeToken[] {
  const tokens: CaeToken[] = [];
  const re = new RegExp(CAE_VARIABLE_TOKEN_PATTERN.source, "g");
  let match = re.exec(text ?? "");
  while (match) {
    const raw = match[1].trim();
    tokens.push({ token: match[0], raw, variableKey: isValidVariableKey(raw) ? raw : null });
    match = re.exec(text ?? "");
  }
  return tokens;
}
