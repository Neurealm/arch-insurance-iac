/**
 * Deterministic core of the ServiceNow Terraform Change Agent.
 *
 * Ticket text and model output are untrusted candidates. This module never
 * invokes an LLM, writes to GitHub, or runs Terraform; it only preserves
 * evidence, reconciles facts, validates governed inputs, and decides whether
 * a workflow transition is legal.
 */

export type JsonRecord = Record<string, unknown>;
export type FieldState = "VALID" | "MISSING" | "INVALID" | "CONTRADICTORY";
export type WorkflowState =
  | "INGESTED" | "ANALYZING" | "WAITING_FOR_INFORMATION" | "REQUEST_COMPLETE"
  | "GAP_CREATED" | "PACKAGE_GENERATED" | "PACKAGE_VALIDATED" | "DRAFT_PR_CREATED"
  | "HANDOFF_COMPLETE" | "BLOCKED" | "FAILED";

export type FactSource =
  | "requester_correction" | "requester_reply" | "structured_ticket"
  | "requester_prose" | "policy_default" | "inference";

export type CandidateFact = {
  field: string;
  value: unknown;
  dataType: "string" | "string_list" | "number" | "boolean" | "json";
  source: FactSource;
  sourceRecordId: string;
  sourceAuthor: string | null;
  sourceAt: string | null;
  supportingText: string;
  confidence: number;
  state?: Exclude<FieldState, "CONTRADICTORY">;
};

export type ReconciledFact = Omit<CandidateFact, "state"> & { state: FieldState; supersedes: string[] };
export type FactConflict = { field: string; values: ReconciledFact[] };
export type QuestionRegistryEntry = {
  field: string;
  fingerprint: string;
  question: string;
  answer: string | null;
  resolution: "OPEN" | "ANSWERED" | "INVALID" | "SUPERSEDED";
};

export type TicketConversation = {
  ticketNumber: string;
  sysId: string | null;
  identityConflicts: string[];
  requester: string;
  application: string;
  environment: string;
  description: string;
  maintenanceWindow: string;
  businessImpact: string;
  applicationOwner: string;
  rollbackPlan: string;
  priorQuestions: string[];
  clarificationAnswers: string[];
  snapshots: JsonRecord[];
};

const ENVELOPES = ["ticket", "change_request", "request"];
const TICKET_NUMBER_KEYS = ["number", "ticket_number", "ticketNumber", "change_number", "id"];
const SYS_ID_KEYS = ["sys_id", "sysId"];
const SOURCE_WEIGHT: Record<FactSource, number> = {
  requester_correction: 6,
  requester_reply: 5,
  structured_ticket: 4,
  requester_prose: 3,
  policy_default: 2,
  inference: 1,
};

const WORKFLOW_TRANSITIONS: Record<WorkflowState, ReadonlySet<WorkflowState>> = {
  INGESTED: new Set(["ANALYZING", "FAILED"]),
  ANALYZING: new Set(["WAITING_FOR_INFORMATION", "REQUEST_COMPLETE", "BLOCKED", "FAILED"]),
  WAITING_FOR_INFORMATION: new Set(["ANALYZING", "BLOCKED", "FAILED"]),
  REQUEST_COMPLETE: new Set(["GAP_CREATED", "BLOCKED", "FAILED"]),
  GAP_CREATED: new Set(["PACKAGE_GENERATED", "BLOCKED", "FAILED"]),
  PACKAGE_GENERATED: new Set(["PACKAGE_VALIDATED", "BLOCKED", "FAILED"]),
  PACKAGE_VALIDATED: new Set(["DRAFT_PR_CREATED", "BLOCKED", "FAILED"]),
  DRAFT_PR_CREATED: new Set(["HANDOFF_COMPLETE", "BLOCKED", "FAILED"]),
  HANDOFF_COMPLETE: new Set(),
  BLOCKED: new Set(["ANALYZING", "FAILED"]),
  FAILED: new Set(["ANALYZING"]),
};

// Exported so servicenow-intake/index.ts can validate and sanitize governed
// Terraform provisioning inputs against exactly these patterns instead of
// keeping a second, driftable copy.
export const ARM_GROUP = /^\/subscriptions\/[0-9a-fA-F-]{36}\/resourceGroups\/[A-Za-z0-9_.()-]+$/;
export const ARM_SUBNET = /^\/subscriptions\/[0-9a-fA-F-]{36}\/resourceGroups\/[A-Za-z0-9_.()-]+\/providers\/Microsoft\.Network\/virtualNetworks\/[A-Za-z0-9_.-]+\/subnets\/[A-Za-z0-9_.-]+$/;
export const SSH_KEY = /^(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp(256|384|521)) [A-Za-z0-9+/=]+(?: .*)?$/;
export const VM_NAME = /^[A-Za-z0-9][A-Za-z0-9-]{0,62}$/;
export const VM_SIZE = /^Standard_[A-Za-z0-9_]+$/;
export const ADMIN_USERNAME = /^[a-z_][a-z0-9_-]{0,31}$/;
export const ADMIN_USERNAME_RESERVED = ["root", "admin", "administrator"];
export const IMAGE_PART = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
export const LOCATION = /^[a-z][a-z0-9]{2,30}$/;
const CREATE_VM_FIELDS = [
  "requester", "application", "environment", "maintenanceWindow", "businessImpact", "applicationOwner", "rollbackPlan",
  "resourceGroupArmId", "subnetArmId", "location", "vmNames", "vmSize", "adminUsername", "sshPublicKey",
  "osPublisher", "osOffer", "osSku", "osVersion",
] as const;

export const PROHIBITED_INFRASTRUCTURE_ACTIONS = new Set([
  "terraform plan", "terraform apply", "terraform destroy", "terraform import",
  "terragrunt plan", "terragrunt apply", "terragrunt destroy", "hcp terraform run",
  "merge pull request", "auto approve", "deployment pipeline", "promotion pipeline",
]);

const SENSITIVE_FIELD = /(authorization|api[-_ ]?key|access[-_ ]?key|client[-_ ]?secret|connection[-_ ]?string|pass(word|phrase)?|private[-_ ]?key|secret|token)/i;
const SENSITIVE_TEXT = /-----BEGIN(?: [A-Z0-9]+)? PRIVATE KEY-----[\s\S]*?-----END(?: [A-Z0-9]+)? PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16})\b|\b(?:authorization|api[-_ ]?key|access[-_ ]?key|client[-_ ]?secret|connection[-_ ]?string|pass(word|phrase)?|private[-_ ]?key|secret|token)\s*[:=]\s*[^\s,;]+/gi;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}
function text(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function list(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : []; }
function unique(values: string[]): string[] { return [...new Set(values.filter(Boolean))]; }
function nonEmpty(value: unknown): boolean { return typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined; }

/**
 * Redact credentials before ticket material is stored in the durable agent
 * ledger, placed in an LLM prompt, surfaced in a requester comment, or added
 * to audit metadata. The original ServiceNow payload remains in ServiceNow;
 * this agent has no legitimate use for any secret value.
 */
export function redactSensitiveData(value: unknown, depth = 0): unknown {
  if (depth > 12) return "[REDACTED: nesting limit]";
  if (typeof value === "string") return value.replace(SENSITIVE_TEXT, "[REDACTED]");
  if (Array.isArray(value)) return value.map((item) => redactSensitiveData(item, depth + 1));
  const source = record(value);
  if (!Object.keys(source).length) return value;
  return Object.fromEntries(Object.entries(source).map(([key, item]) => [
    key,
    SENSITIVE_FIELD.test(key) ? "[REDACTED]" : redactSensitiveData(item, depth + 1),
  ]));
}

/**
 * The console used to store its transport envelope as ticket_payload, then
 * accidentally submit that envelope inside another `ticket` envelope when a
 * requester added a note. Recursively unwrap it, retaining older non-empty
 * fields and allowing a newer non-empty correction to take precedence.
 */
export function unwrapTicketPayload(value: unknown): JsonRecord {
  const visited = new Set<object>();
  const layers: JsonRecord[] = [];
  const visit = (candidate: unknown, depth = 0) => {
    if (depth > 8) return;
    const current = record(candidate);
    if (!Object.keys(current).length || visited.has(current)) return;
    visited.add(current);
    for (const envelope of ENVELOPES) visit(current[envelope], depth + 1);
    layers.push(current);
  };
  visit(value);
  const flattened: JsonRecord = {};
  const immutableSeen = new Set<"ticket" | "sysId">();
  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer)) {
      if (ENVELOPES.includes(key) || !nonEmpty(value)) continue;
      const identityGroup = TICKET_NUMBER_KEYS.includes(key) ? "ticket" : SYS_ID_KEYS.includes(key) ? "sysId" : null;
      if (identityGroup && immutableSeen.has(identityGroup)) continue;
      flattened[key] = value;
      if (identityGroup) immutableSeen.add(identityGroup);
    }
  }
  return flattened;
}

function first(source: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = text(source[key]);
    if (value) return value;
  }
  return "";
}

function descriptions(value: unknown): string[] {
  const visited = new Set<object>();
  const found: string[] = [];
  const visit = (candidate: unknown, depth = 0) => {
    if (depth > 8) return;
    const current = record(candidate);
    if (!Object.keys(current).length || visited.has(current)) return;
    visited.add(current);
    for (const envelope of ENVELOPES) visit(current[envelope], depth + 1);
    const description = first(current, ["description", "short_description", "details", "justification"]);
    if (description) found.push(description);
  };
  visit(value);
  return unique(found);
}

function nestedIdentityValues(value: unknown, keys: string[]): string[] {
  const visited = new Set<object>();
  const found: string[] = [];
  const visit = (candidate: unknown, depth = 0) => {
    if (depth > 8) return;
    const current = record(candidate);
    if (!Object.keys(current).length || visited.has(current)) return;
    visited.add(current);
    for (const envelope of ENVELOPES) visit(current[envelope], depth + 1);
    for (const key of keys) {
      const value = text(current[key]);
      if (value) found.push(value);
    }
  };
  visit(value);
  return unique(found);
}

/** Merge every historical snapshot. A blank or absent newer field cannot erase history. */
export function mergeTicketHistory(payloads: unknown[]): TicketConversation {
  const snapshots = payloads.map(unwrapTicketPayload);
  const values: JsonRecord = {};
  const allDescriptions: string[] = [];
  const priorQuestions: string[] = [];
  const clarificationAnswers: string[] = [];
  let ticketNumber = "";
  let sysId = "";
  const identityConflicts: string[] = [];
  for (const payload of payloads) {
    const flattened = unwrapTicketPayload(payload);
    for (const observedTicketNumber of nestedIdentityValues(payload, TICKET_NUMBER_KEYS)) {
      if (ticketNumber && observedTicketNumber !== ticketNumber) {
        identityConflicts.push(`Ticket number conflict: expected ${ticketNumber}, but an update supplied ${observedTicketNumber}.`);
      } else if (observedTicketNumber) ticketNumber = observedTicketNumber;
    }
    for (const observedSysId of nestedIdentityValues(payload, SYS_ID_KEYS)) {
      if (sysId && observedSysId !== sysId) {
        identityConflicts.push(`ServiceNow record identity conflict: expected ${sysId}, but an update supplied ${observedSysId}.`);
      } else if (observedSysId) sysId = observedSysId;
    }
    for (const [key, value] of Object.entries(flattened)) if (nonEmpty(value)) values[key] = value;
    allDescriptions.push(...descriptions(payload));
    priorQuestions.push(...list(flattened.prior_questions ?? flattened.priorQuestions));
    clarificationAnswers.push(...list(flattened.clarification_answers ?? flattened.clarificationAnswers));
  }
  const requestedBy = record(values.requested_by);
  const requestedFor = record(values.requested_for);
  return {
    ticketNumber,
    sysId: sysId || null,
    identityConflicts: unique(identityConflicts),
    requester: first(values, ["requester", "requested_by_email", "requested_by_name"])
      || first(requestedBy, ["email", "name", "user_name"])
      || first(requestedFor, ["email", "name", "user_name"]),
    application: first(values, ["application", "business_service", "service", "cmdb_ci_name"]),
    environment: first(values, ["environment", "u_environment"]),
    description: unique(allDescriptions).join("\n\n"),
    maintenanceWindow: first(values, ["maintenance_window", "planned_start", "planned_end", "u_maintenance_window"]),
    businessImpact: first(values, ["business_impact", "impact", "u_business_impact"]),
    applicationOwner: first(values, ["application_owner", "service_owner", "u_application_owner"]),
    rollbackPlan: first(values, ["rollback_plan", "backout_plan", "u_rollback_plan"]),
    priorQuestions: unique(priorQuestions),
    clarificationAnswers: unique(clarificationAnswers),
    snapshots,
  };
}

function normalized(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => normalized(item)).sort().join(",");
  return text(value).toLowerCase().replace(/\s+/g, " ");
}
function later(left: CandidateFact, right: CandidateFact): CandidateFact {
  const leftAt = Date.parse(left.sourceAt ?? "") || 0;
  const rightAt = Date.parse(right.sourceAt ?? "") || 0;
  return rightAt >= leftAt ? right : left;
}

/** Implements provenance-aware precedence without deleting losing evidence. */
export function reconcileFacts(candidates: CandidateFact[]): { facts: ReconciledFact[]; conflicts: FactConflict[] } {
  const valid = candidates.filter((item) => nonEmpty(item.value) && (item.state ?? "VALID") === "VALID");
  const byField = new Map<string, CandidateFact[]>();
  for (const candidate of valid) byField.set(candidate.field, [...(byField.get(candidate.field) ?? []), candidate]);
  const facts: ReconciledFact[] = [];
  const conflicts: FactConflict[] = [];
  for (const [field, values] of byField) {
    const highestWeight = Math.max(...values.map((item) => SOURCE_WEIGHT[item.source]));
    const top = values.filter((item) => SOURCE_WEIGHT[item.source] === highestWeight);
    const chosen = top.reduce(later);
    const competing = top.filter((item) => normalized(item.value) !== normalized(chosen.value));
    if (competing.length && competing.some((item) => (Date.parse(item.sourceAt ?? "") || 0) === (Date.parse(chosen.sourceAt ?? "") || 0))) {
      conflicts.push({ field, values: [chosen, ...competing].map((item) => ({ ...item, state: "CONTRADICTORY", supersedes: [] })) });
      continue;
    }
    facts.push({ ...chosen, state: "VALID", supersedes: values.filter((item) => item !== chosen).map((item) => item.sourceRecordId) });
  }
  return { facts, conflicts };
}

export function questionFingerprint(field: string): string {
  // A canonical field is stronger than wording: “subnet identifier” and
  // “subnet ARM ID” are the same question once mapped by the request schema.
  return `${field}:valid-value-required`;
}

export function shouldAskForField(field: string, registry: QuestionRegistryEntry[], state: FieldState): boolean {
  if (state === "VALID") return false;
  const fingerprint = questionFingerprint(field);
  const prior = registry.find((entry) => entry.field === field && entry.fingerprint === fingerprint);
  // An invalid answer warrants one targeted correction. An open question must
  // not be emitted again, and an answered question is not re-asked merely
  // because a later transport snapshot forgot to include it.
  if (state === "INVALID") return true;
  return !prior || prior.resolution === "INVALID";
}

export function transitionAllowed(from: WorkflowState, to: WorkflowState): boolean {
  return WORKFLOW_TRANSITIONS[from].has(to);
}

export function assertTransition(from: WorkflowState, to: WorkflowState): void {
  if (!transitionAllowed(from, to)) throw new Error(`Illegal ServiceNow Terraform Change Agent transition: ${from} -> ${to}.`);
}

export function isProhibitedInfrastructureAction(value: string): boolean {
  const command = value.trim().toLowerCase().replace(/\s+/g, " ");
  return [...PROHIBITED_INFRASTRUCTURE_ACTIONS].some((blocked) => command === blocked || command.startsWith(`${blocked} `));
}

export function validateCreateVmField(field: string, value: unknown): FieldState {
  const source = text(value);
  if (!nonEmpty(value)) return "MISSING";
  if (field === "environment") return /^(development|pre-production|preproduction|production)$/i.test(source) ? "VALID" : "INVALID";
  if (field === "maintenanceWindow") return /\b(utc|gmt|est|edt|cst|cdt|mst|mdt|pst|pdt|[+-]\d{2}:?\d{2})\b/i.test(source) ? "VALID" : "INVALID";
  if (field === "rollbackPlan") return source.length >= 10 ? "VALID" : "INVALID";
  if (field === "resourceGroupArmId") return ARM_GROUP.test(source) ? "VALID" : "INVALID";
  if (field === "subnetArmId") return ARM_SUBNET.test(source) ? "VALID" : "INVALID";
  if (field === "location") return LOCATION.test(source.toLowerCase()) ? "VALID" : "INVALID";
  if (field === "vmNames") return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && VM_NAME.test(item)) ? "VALID" : "INVALID";
  if (field === "vmSize") return VM_SIZE.test(source) ? "VALID" : "INVALID";
  if (field === "adminUsername") return ADMIN_USERNAME.test(source) && !ADMIN_USERNAME_RESERVED.includes(source) ? "VALID" : "INVALID";
  if (field === "sshPublicKey") return SSH_KEY.test(source) ? "VALID" : "INVALID";
  if (field === "osPublisher" || field === "osOffer" || field === "osSku" || field === "osVersion") return IMAGE_PART.test(source) ? "VALID" : "INVALID";
  return source ? "VALID" : "MISSING";
}

export function createVmFieldStates(values: Record<string, unknown>, conflicts: FactConflict[] = []): Record<string, FieldState> {
  const conflictFields = new Set(conflicts.map((conflict) => conflict.field));
  return Object.fromEntries(CREATE_VM_FIELDS.map((field) => [field, conflictFields.has(field) ? "CONTRADICTORY" : validateCreateVmField(field, values[field])])) as Record<string, FieldState>;
}

export function conciseQuestions(states: Record<string, FieldState>, registry: QuestionRegistryEntry[]): string[] {
  const labels: Record<string, string> = {
    requester: "requester", application: "application or business service", environment: "environment", maintenanceWindow: "maintenance window with timezone",
    businessImpact: "expected business impact", applicationOwner: "application owner", rollbackPlan: "rollback plan",
    resourceGroupArmId: "destination resource group ARM ID", subnetArmId: "subnet ARM ID", location: "Azure region", vmNames: "VM name",
    vmSize: "approved VM SKU", adminUsername: "administrator username", sshPublicKey: "SSH public key", osPublisher: "OS image publisher",
    osOffer: "OS image offer", osSku: "OS image SKU", osVersion: "OS image version",
  };
  return Object.entries(states).flatMap(([field, state]) => {
    if (!shouldAskForField(field, registry, state)) return [];
    if (state === "CONTRADICTORY") return [`Please choose or correct the conflicting value for ${labels[field] ?? field}.`];
    if (state === "INVALID") return [`The supplied ${labels[field] ?? field} is invalid. Please provide a corrected value.`];
    return [`Please provide a valid ${labels[field] ?? field}.`];
  });
}
