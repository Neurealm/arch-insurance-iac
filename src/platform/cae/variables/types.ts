/**
 * Contextual Audio Enrichment — dynamic variable framework contract.
 *
 * A narrative may only reference values through declarative tokens of the form
 * `{{module.variable_name}}`. There is no expression language: no JavaScript,
 * SQL, formulas, HTTP calls, or database access can be embedded in narrative
 * text. Every token must map to an entry in the governed variable registry,
 * and every registry entry maps to a single approved, module-owned resolver.
 */

/** Only this shape is accepted. Anything else is malformed. */
export const CAE_VARIABLE_TOKEN_PATTERN = /\{\{([^{}]*)\}\}/g;
export const CAE_VARIABLE_KEY_PATTERN = /^[a-z][a-z0-9]*\.[a-z][a-z0-9_]*$/;

export type CaeVariableFormat =
  | "text"
  | "integer"
  | "decimal"
  | "currency_usd"
  | "percentage"
  | "date"
  | "status";

export type CaeVariableSensitivity = "public" | "internal" | "restricted";

/** One governed registry entry (mirrors `public.audio_variable_definitions`). */
export type CaeVariableDefinition = {
  variableKey: string;
  displayName: string;
  description: string | null;
  moduleKey: string;
  resolverKey: string;
  requiredContext: string[];
  valueType: string;
  displayFormat: CaeVariableFormat;
  spokenFormat: CaeVariableFormat;
  missingFallback: string;
  sensitivity: CaeVariableSensitivity;
  requiredPermissionCode: string | null;
  isEnabled: boolean;
  /** Server-computed. The client never decides authorisation for itself. */
  isAuthorized: boolean;
};

export type CaeVariableRegistry = ReadonlyMap<string, CaeVariableDefinition>;

/** Value returned by an approved resolver. */
export type CaeResolverOutcome =
  | { status: "ok"; value: string | number | Date }
  | { status: "missing" }
  | { status: "unsupported_resolver" };

/**
 * A module context slice. Adapters only ever see their own slice, so one
 * module's resolver can never read another module's data.
 */
export type CaeModuleSlice = {
  /** Tenant the slice was captured for. Mismatches are refused. */
  tenantId?: string | null;
  [key: string]: unknown;
};

export type CaeVariableContext = {
  /** Active, authorised tenant for the current session. */
  tenantId: string | null;
  platform?: CaeModuleSlice;
  commercial?: CaeModuleSlice;
  runops?: CaeModuleSlice;
  avep?: CaeModuleSlice;
};

export type CaeVariableAdapter = {
  moduleKey: string;
  resolverKeys: readonly string[];
  resolve: (resolverKey: string, slice: CaeModuleSlice) => CaeResolverOutcome;
};

export type CaeTokenIssueCode =
  | "malformed_token"
  | "unknown_variable"
  | "disabled_variable"
  | "unauthorized_variable"
  | "cross_tenant_context"
  | "cross_module_resolver"
  | "missing_context"
  | "missing_value"
  | "no_adapter";

export type CaeTokenDiagnostic = {
  token: string;
  variableKey: string | null;
  code: CaeTokenIssueCode | "resolved";
  /** Author-facing message. Never contains a resolved value. */
  message: string;
};

export type CaeVariableResolution = {
  displayText: string;
  spokenText: string;
  /** Keys only — resolved values are never logged. */
  resolvedKeys: string[];
  diagnostics: CaeTokenDiagnostic[];
  hasBlockingIssues: boolean;
};
