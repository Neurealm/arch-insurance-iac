/**
 * Typed error hierarchy for OperationsProvider and AiProvider.
 */

export type OperationsErrorCode =
  | "not_found"
  | "invalid_state"
  | "policy_denied"
  | "approval_required"
  | "feature_disabled"
  | "not_implemented"
  | "network"
  | "unauthorized"
  | "conflict"
  | "unknown";

export class OperationsError extends Error {
  readonly code: OperationsErrorCode;
  readonly detail?: string;
  constructor(code: OperationsErrorCode, message: string, detail?: string) {
    super(message);
    this.name = "OperationsError";
    this.code = code;
    this.detail = detail;
  }
}

export class NotFoundError extends OperationsError {
  constructor(entity: string, id: string) {
    super("not_found", `${entity} not found: ${id}`);
    this.name = "NotFoundError";
  }
}

export class InvalidStateError extends OperationsError {
  constructor(message: string, detail?: string) {
    super("invalid_state", message, detail);
    this.name = "InvalidStateError";
  }
}

export class FeatureDisabledError extends OperationsError {
  constructor(flag: string) {
    super("feature_disabled", `Feature disabled: ${flag}`);
    this.name = "FeatureDisabledError";
  }
}

export class NotImplementedError extends OperationsError {
  constructor(what: string) {
    super("not_implemented", `Not implemented: ${what}`);
    this.name = "NotImplementedError";
  }
}

export type AiErrorCode = "unavailable" | "rate_limited" | "invalid_input" | "feature_disabled" | "unknown";

export class AiError extends Error {
  readonly code: AiErrorCode;
  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.name = "AiError";
    this.code = code;
  }
}
