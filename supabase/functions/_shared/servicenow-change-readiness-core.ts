// ServiceNow Change Readiness Agent -- persistence and readiness-derivation
// layer on top of the deterministic core (servicenow-change-agent.ts) and
// the agent's own validation (servicenow-intake-agent-core.ts). Nothing here
// recomputes what's "ready" or "missing" -- it only:
//   1. mirrors the SAME in-memory reconciliation validate() already performs
//      into the durable ticket ledger (servicenow_intake_facts/
//      _requirement_revisions/_question_registry), via the SECURITY DEFINER
//      RPCs added in 20260914120000 (every one of these tables denies even
//      service_role table DML directly; writes only travel through them);
//   2. reads the versioned, admin-editable requirement catalog
//      (iac_request_schemas) instead of a hardcoded field list;
//   3. derives the spec's readiness-status vocabulary from the ticket's real
//      WorkflowState, driving it forward via transition_servicenow_intake_
//      ticket/complete_servicenow_ticket_request;
//   4. builds the structured JSON output contract and the handoff package.
//
// Calling buildCommonFacts()+reconcileFacts() a second time here (validate()
// already calls them once, internally) is deliberate: both calls are pure
// and deterministic over the same (ticket, analysis) input, so they always
// agree -- this exposes the intermediate per-field result for persistence
// without touching validate()'s tested contract at all.
import {
  type CandidateFact, type ReconciledFact, type FactConflict, type FieldState, type WorkflowState,
  reconcileFacts, createVmFieldStates, SOURCE_WEIGHT,
} from "./servicenow-change-agent.ts";
import {
  type NormalizedTicket, type Analysis, type AzureVm, type RecordValue, type ValidationResult,
  buildCommonFacts, requestedOsDiskSizeGb, PROVISIONING_FIELDS, FACT_FIELD_LABELS, record, text, array, unique, supabaseAdmin,
} from "./servicenow-intake-agent-core.ts";

type Admin = ReturnType<typeof supabaseAdmin>;

// One label vocabulary for every field the catalog can require -- reused for
// both requirement-revision explanations and clarifying-question text, so
// the two can never drift apart on what a field is called.
const FIELD_LABELS: Record<string, string> = {
  ...FACT_FIELD_LABELS,
  ...Object.fromEntries(PROVISIONING_FIELDS.map((f) => [f.key, f.label])),
  description: "request description", targetVm: "target VM", requestedVmSize: "requested VM size or SKU",
  requestedOsDiskSizeGb: "requested OS disk capacity", capability: "approved automation capability",
};
function fieldLabel(field: string): string { return FIELD_LABELS[field] ?? field; }
export function fieldQuestion(field: string): string { return `Please provide a valid ${fieldLabel(field)}.`; }

// ---------------------------------------------------------------------------
// Requirement catalog
// ---------------------------------------------------------------------------

export type RequestSchema = { schemaId: string | null; requiredFields: string[]; requiredApprovals: string[]; automationSupported: boolean };

/** The spec's own fallback for a change category this platform has no
 * automation for: the common checklist only, routed to a human/gap, never a
 * fabricated Azure-specific rule for a capability that doesn't exist. */
const GENERIC_SCHEMA: Omit<RequestSchema, "schemaId"> = {
  requiredFields: ["requester", "application", "environment", "maintenanceWindow", "businessImpact", "applicationOwner", "rollbackPlan", "targetVm"],
  requiredApprovals: [], automationSupported: false,
};

export async function loadActiveRequestSchema(admin: Admin, requestType: string): Promise<RequestSchema> {
  const { data, error } = await admin.from("iac_request_schemas").select("id, schema").eq("request_type", requestType).eq("active", true).maybeSingle();
  if (error) throw error;
  if (!data) {
    // Never proceed silently with zero requirements -- fall back to the
    // generic checklist and say so, loudly, in the function's own logs.
    console.error(`servicenow-change-readiness: no active request schema for "${requestType}"; using the generic checklist.`);
    return { ...GENERIC_SCHEMA, schemaId: null };
  }
  const schema = record(data.schema);
  return {
    schemaId: text(data.id),
    requiredFields: array(schema.requiredFields).filter((v): v is string => typeof v === "string"),
    requiredApprovals: array(schema.requiredApprovals).filter((v): v is string => typeof v === "string"),
    automationSupported: schema.automationSupported === true,
  };
}

// ---------------------------------------------------------------------------
// Readiness-status derivation (spec vocabulary <- durable WorkflowState)
// ---------------------------------------------------------------------------

export type ReadinessStatus =
  | "NEW" | "ANALYZING" | "NEEDS_CLARIFICATION" | "VALIDATION_BLOCKED" | "CONFLICT_DETECTED"
  | "READY_FOR_REVIEW" | "READY_FOR_CLOUD_TEAM" | "ROUTED" | "CANCELLED";

/**
 * Pure mapping from the ticket's real, DB-enforced WorkflowState (plus live
 * conflict/validation flags) onto the spec's readiness vocabulary. Open
 * conflicts and failed validations take priority over a bare "needs
 * clarification" reading when WAITING_FOR_INFORMATION, since each needs
 * different remediation (resolve a contradiction/failed check vs. simply
 * answer a missing-field question).
 */
export function deriveReadinessStatus(workflowState: WorkflowState, hasOpenConflicts: boolean, hasFailedValidation: boolean): ReadinessStatus {
  switch (workflowState) {
    case "INGESTED": return "NEW";
    case "ANALYZING": return "ANALYZING";
    case "WAITING_FOR_INFORMATION":
      if (hasOpenConflicts) return "CONFLICT_DETECTED";
      if (hasFailedValidation) return "VALIDATION_BLOCKED";
      return "NEEDS_CLARIFICATION";
    case "REQUEST_COMPLETE": return "READY_FOR_REVIEW";
    case "GAP_CREATED": case "PACKAGE_GENERATED": case "PACKAGE_VALIDATED": case "DRAFT_PR_CREATED":
      return "READY_FOR_CLOUD_TEAM";
    case "HANDOFF_COMPLETE": return "ROUTED";
    case "BLOCKED": return "VALIDATION_BLOCKED";
    case "FAILED": return "CANCELLED";
    default: return "NEW";
  }
}

// ---------------------------------------------------------------------------
// Field-state derivation for persistence. Reuses createVmFieldStates()/
// requestedOsDiskSizeGb() (already exported, already tested) rather than
// reimplementing them; the resize_vm SKU check is the one place a single
// regex test is duplicated from validate()'s inline check, documented here
// since it is genuinely tiny and low-risk rather than worth a refactor.
// ---------------------------------------------------------------------------

export type FieldStateEntry = { field: string; state: FieldState; selectedFactId: string | null; explanation: string; policyRuleCode: string | null };

/** Everything needed to persist one analysis attempt: the reconciled common
 * facts (with real provenance), any conflicts among them, and a field-state
 * map covering every field the active catalog actually requires. */
const PROVISIONING_KEYS = new Set(PROVISIONING_FIELDS.map((f) => f.key));

function explanationFor(field: string, state: FieldState, conflictValues?: string[]): string {
  if (state === "VALID") return "";
  if (state === "CONTRADICTORY") return `Conflicting values reported for ${fieldLabel(field)}: ${unique(conflictValues ?? []).join(" vs. ")}.`;
  if (state === "INVALID") return `The supplied ${fieldLabel(field)} did not pass validation.`;
  return `${fieldLabel(field)} was not provided by the requester.`;
}

export function computeReconciliation(ticket: NormalizedTicket, analysis: Analysis, validation: ValidationResult, requiredFields: string[]) {
  const { facts: reconciledFacts, conflicts: factConflicts } = reconcileFacts(buildCommonFacts(ticket, analysis));
  const conflictsByField = new Map(factConflicts.map((c) => [c.field, c]));
  const byField = new Map(reconciledFacts.map((f) => [f.field, f]));

  const states = new Map<string, FieldState>();
  for (const field of requiredFields) {
    const conflict = conflictsByField.get(field);
    if (conflict) { states.set(field, "CONTRADICTORY"); continue; }
    const fact = byField.get(field);
    if (fact) { states.set(field, fact.state); continue; }
    if (field === "description") { states.set(field, ticket.description.length >= 10 ? "VALID" : "MISSING"); continue; }
    if (field === "targetVm") { states.set(field, validation.target ? "VALID" : "MISSING"); continue; }
    if (field === "requestedVmSize") {
      const blob = `${ticket.description} ${JSON.stringify(analysis.extractedFields)}`.toLowerCase();
      states.set(field, /standard_[a-z0-9_]+/i.test(blob) || /\b\d+\s*(v?cpu|core|cores)\b/i.test(blob) ? "VALID" : "MISSING");
      continue;
    }
    if (field === "requestedOsDiskSizeGb") {
      const gb = requestedOsDiskSizeGb(analysis.extractedFields);
      states.set(field, Number.isSafeInteger(gb) && (gb as number) >= 64 && (gb as number) <= 4095 ? "VALID" : "MISSING");
      continue;
    }
    // create_vm's 11 provisioning fields, computed deterministically and
    // reused as-is -- never re-derived from the model's own missingFields.
    if (PROVISIONING_KEYS.has(field)) {
      const provisioningStates = createVmFieldStates(analysis.provisioning);
      states.set(field, provisioningStates[field] ?? "MISSING");
      continue;
    }
    states.set(field, "MISSING");
  }

  const revisions: FieldStateEntry[] = requiredFields.map((field) => {
    const state = states.get(field) ?? "MISSING";
    const conflictValues = state === "CONTRADICTORY" ? conflictsByField.get(field)?.values.map((v) => text(v.value)) : undefined;
    return { field, state, selectedFactId: null, explanation: explanationFor(field, state, conflictValues), policyRuleCode: null };
  });
  return { reconciledFacts, factConflicts, revisions };
}

// ---------------------------------------------------------------------------
// Persistence: wires the computation above into the durable ledger through
// the guarded RPCs. Every write here is idempotent by construction (natural
// unique constraints, or an explicit "unchanged since last revision" skip)
// so reprocessing an unchanged ticket never grows these tables.
// ---------------------------------------------------------------------------

export type PersistedAnalysis = { eventId: string; factIdsByField: Record<string, string>; contentSha256: string };

/**
 * The idempotency key is derived from the content itself (facts + revision
 * states), not caller-supplied: reprocessing byte-identical analysis output
 * -- a webhook redelivery, a resume-queue retry -- always derives the same
 * key, so the underlying RPC's own idempotency check makes it a true no-op.
 * Genuinely different content (a refined analysis, a requester's answer)
 * always derives a different key, so it is recorded as a new event.
 */
export async function persistAnalysis(
  admin: Admin, ticketId: string, actor: string,
  reconciled: ReturnType<typeof computeReconciliation>,
): Promise<PersistedAnalysis> {
  const contentSha256 = await sha256Hex(JSON.stringify({ facts: reconciled.reconciledFacts.map((f) => [f.field, f.value]), revisions: reconciled.revisions.map((r) => [r.field, r.state]) }));
  const { data: eventId, error: eventError } = await admin.rpc("record_servicenow_ticket_analysis_event", {
    p_ticket_id: ticketId,
    p_redacted_summary: { factCount: reconciled.reconciledFacts.length, conflictCount: reconciled.factConflicts.length },
    p_content_sha256: contentSha256, p_idempotency_key: contentSha256, p_actor: actor,
  });
  if (eventError) throw eventError;

  const factPayload = reconciled.reconciledFacts.map((f: ReconciledFact) => ({
    canonicalField: f.field, value: f.value, valueType: f.dataType, sourceType: f.source,
    sourceRecordId: f.sourceRecordId || null, sourceAuthor: f.sourceAuthor || null, sourceOccurredAt: f.sourceAt || null,
    supportingText: f.supportingText, confidence: Math.max(0, Math.min(1, f.confidence / 100)),
    validationStatus: f.state, precedenceRank: SOURCE_WEIGHT[f.source],
  }));
  const { data: factResult, error: factError } = await admin.rpc("record_servicenow_ticket_facts", {
    p_ticket_id: ticketId, p_source_event_id: eventId, p_facts: factPayload, p_actor: actor,
  });
  if (factError) throw factError;
  const factIdsByField: Record<string, string> = {};
  for (const row of array(record(factResult).facts).map(record)) {
    const field = text(row.canonicalField), factId = text(row.factId);
    if (field && factId) factIdsByField[field] = factId;
  }

  const revisionPayload = reconciled.revisions.map((r) => ({
    canonicalField: r.field, selectedFactId: factIdsByField[r.field] ?? null, fieldState: r.state,
    policyRuleCode: r.policyRuleCode, explanation: r.explanation,
  }));
  const { error: revisionError } = await admin.rpc("record_servicenow_requirement_revisions", {
    p_ticket_id: ticketId, p_revisions: revisionPayload, p_actor: actor,
  });
  if (revisionError) throw revisionError;

  return { eventId: text(eventId), factIdsByField, contentSha256 };
}

/** Syncs the durable question registry from the same field-state map, using
 * questionFingerprint()-equivalent hashing so re-asking the identical
 * question never creates a duplicate row -- the durable backing for
 * shouldAskForField()'s in-memory guarantee. */
const QUESTION_STATUS_FOR_FIELD_STATE: Record<FieldState, "OPEN" | "ANSWERED" | "INVALID"> = {
  VALID: "ANSWERED", MISSING: "OPEN", CONTRADICTORY: "OPEN", INVALID: "INVALID",
};

export async function syncQuestions(admin: Admin, ticketId: string, actor: string, revisions: FieldStateEntry[], factIdsByField: Record<string, string>) {
  const payload = revisions.map((r) => ({
    canonicalField: r.field, semanticFingerprint: `${r.field}:valid-value-required`,
    question: fieldQuestion(r.field), status: QUESTION_STATUS_FOR_FIELD_STATE[r.state],
    answerFactId: r.state === "VALID" ? factIdsByField[r.field] ?? null : null,
  }));
  const { error } = await admin.rpc("sync_servicenow_question_registry", { p_ticket_id: ticketId, p_questions: payload, p_actor: actor });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Workflow-state driver
// ---------------------------------------------------------------------------

export type TicketHeader = { id: string; workflowState: WorkflowState; workflowVersion: number };

export async function loadTicketHeader(admin: Admin, ticketId: string): Promise<TicketHeader> {
  const { data, error } = await admin.from("servicenow_intake_tickets").select("id, workflow_state, workflow_version").eq("id", ticketId).single();
  if (error) throw error;
  return { id: text(data.id), workflowState: text(data.workflow_state) as WorkflowState, workflowVersion: Number(data.workflow_version) };
}

/** Thin wrapper translating the RPC's optimistic-concurrency error (SQLSTATE
 * 40001) into a clear, retryable result instead of a raw DB error bubbling
 * up to the caller. */
export async function transitionTicket(admin: Admin, ticket: TicketHeader, toState: WorkflowState, reasonCode: string, actor: string, idempotencyKey: string, sourceEventId: string | null = null): Promise<{ ok: true; version: number } | { ok: false; retry: true }> {
  const { data, error } = await admin.rpc("transition_servicenow_intake_ticket", {
    p_ticket_id: ticket.id, p_expected_version: ticket.workflowVersion, p_to_state: toState,
    p_reason_code: reasonCode, p_idempotency_key: idempotencyKey, p_actor: actor, p_source_event_id: sourceEventId,
  });
  if (error) { if (error.code === "40001") return { ok: false, retry: true }; throw error; }
  return { ok: true, version: Number(data) };
}

export async function completeTicket(admin: Admin, ticket: TicketHeader, schemaId: string, actor: string, idempotencyKey: string, sourceEventId: string | null = null): Promise<{ ok: true; version: number } | { ok: false; retry: true } | { ok: false; retry: false; reason: string }> {
  const { data, error } = await admin.rpc("complete_servicenow_ticket_request", {
    p_ticket_id: ticket.id, p_expected_version: ticket.workflowVersion, p_request_schema_id: schemaId,
    p_idempotency_key: idempotencyKey, p_actor: actor, p_source_event_id: sourceEventId,
  });
  if (error) {
    if (error.code === "40001") return { ok: false, retry: true };
    return { ok: false, retry: false, reason: error.message };
  }
  return { ok: true, version: Number(data) };
}

// ---------------------------------------------------------------------------
// Read-only validators. Anything with no backing system honestly reports
// "not validated", per the spec's own rule -- never a fabricated pass.
// ---------------------------------------------------------------------------

export type FieldValidation = { field: string; status: "VALID" | "INVALID" | "NOT_VALIDATED"; detail: string };

export function validateAzureTarget(target: AzureVm | null, azureState: string): FieldValidation {
  if (target) return { field: "targetVm", status: "VALID", detail: `Found in live Azure inventory: ${target.name} (${target.powerState}).` };
  if (azureState !== "available") return { field: "targetVm", status: "NOT_VALIDATED", detail: "Not validated — system unavailable." };
  return { field: "targetVm", status: "INVALID", detail: "No matching VM found in the current Azure inventory." };
}

export function validateCapability(automationSupported: boolean, hasApprovedCapability: boolean): FieldValidation {
  if (!automationSupported) return { field: "capability", status: "NOT_VALIDATED", detail: "This change category has no automated Azure capability; a human engineer must evaluate it directly." };
  return { field: "capability", status: hasApprovedCapability ? "VALID" : "INVALID", detail: hasApprovedCapability ? "An approved Terraform capability exists for this action." : "No approved Terraform capability exists yet for this action." };
}

// ---------------------------------------------------------------------------
// Handoff package -- the spec's 20 sections, as a typed object (not a
// hand-formatted string) so the structured JSON output and any future UI
// can render requester-fact vs. agent-recommendation separately.
// ---------------------------------------------------------------------------

export type HandoffField = { value: unknown; source: "requester" | "agent_recommendation" | "system_validated" };
export type HandoffPackage = {
  executiveSummary: string; businessJustification: HandoffField; currentState: string; desiredState: string;
  targetResources: HandoffField[]; confirmedRequirements: Record<string, HandoffField>; dependencies: string[];
  securityAndCompliance: string[]; riskAndImpact: { level: string; detail: string };
  proposedImplementationApproach: string; preChangeChecks: string[]; validationAndSuccessCriteria: string[];
  rollbackPlan: HandoffField; rollbackTriggers: string[]; maintenanceWindow: HandoffField; approvals: string[];
  evidenceAndSources: FieldValidation[]; assumptionsForCloudTeamReview: string[]; validationResults: FieldValidation[];
  recommendedAssignmentGroup: string;
};

export function buildHandoffPackage(
  ticket: NormalizedTicket, analysis: Analysis, validation: ValidationResult,
  reconciled: ReturnType<typeof computeReconciliation>, validations: FieldValidation[], automationSupported: boolean,
): HandoffPackage {
  const factByField = new Map(reconciled.reconciledFacts.map((f) => [f.field, f]));
  const asHandoffField = (field: string, fallback: unknown): HandoffField => {
    const fact = factByField.get(field);
    return fact ? { value: fact.value, source: fact.source === "inference" ? "agent_recommendation" : "requester" } : { value: fallback, source: "agent_recommendation" };
  };
  return {
    executiveSummary: analysis.summary || `${analysis.action} request for ${ticket.application || "an unspecified application"}.`,
    businessJustification: asHandoffField("businessImpact", ""),
    currentState: validation.target ? `${validation.target.name}: ${validation.target.powerState}, ${validation.target.vmSize} in ${validation.target.location}.` : "Not yet observed against live Azure inventory.",
    desiredState: analysis.summary || "",
    targetResources: validation.target ? [{ value: validation.target.id, source: "system_validated" }] : [],
    confirmedRequirements: Object.fromEntries(reconciled.revisions.filter((r) => r.state === "VALID").map((r) => [r.field, asHandoffField(r.field, null)])),
    dependencies: [],
    securityAndCompliance: automationSupported ? [] : ["No automated Azure capability exists for this change category; security review must be performed manually by the assigned engineering team."],
    riskAndImpact: { level: automationSupported ? "standard" : "requires-manual-assessment", detail: text(analysis.extractedFields.businessImpact) || "Not stated by requester." },
    proposedImplementationApproach: automationSupported ? "Governed Terraform change package via the existing capability pipeline." : "Manual engineering review; no automated capability exists yet.",
    preChangeChecks: validations.filter((v) => v.status !== "NOT_VALIDATED").map((v) => `${v.field}: ${v.detail}`),
    validationAndSuccessCriteria: ["Confirm the change matches the approved Terraform plan.", "Confirm no unrelated resources were affected."],
    rollbackPlan: asHandoffField("rollbackPlan", ""),
    rollbackTriggers: ["Post-change validation fails.", "Unexpected service impact is observed."],
    maintenanceWindow: asHandoffField("maintenanceWindow", ""),
    approvals: [],
    evidenceAndSources: validations,
    assumptionsForCloudTeamReview: reconciled.revisions.filter((r) => r.state === "MISSING" || r.state === "CONTRADICTORY").map((r) => `${r.field}: ${r.state === "MISSING" ? "not provided by requester" : "conflicting values reported"}.`),
    validationResults: validations,
    recommendedAssignmentGroup: automationSupported ? "Cloud Platform Engineering" : "Cloud Engineering (manual review)",
  };
}

// ---------------------------------------------------------------------------
// Structured output contract + runtime shape validator. A failure here is
// itself logged and converted to the existing needs_clarification-style
// fallback -- never a silent partial write, per the spec's own rule.
// ---------------------------------------------------------------------------

export type ChangeReadinessOutput = {
  ticketId: string; ticketVersion: number; detectedChangeTypes: string[]; classificationConfidence: number;
  extractedFields: RecordValue; fieldProvenance: RecordValue; missingFields: string[]; invalidFields: string[];
  conflicts: string[]; validationResults: FieldValidation[]; clarifyingQuestions: string[]; assumptions: string[];
  riskFlags: string[]; readinessStatus: ReadinessStatus; readinessReason: string; recommendedAssignmentGroup: string;
  handoffPackage: HandoffPackage | null; terraformEligibility: { eligible: boolean; reason: string };
  auditMetadata: { requestId: string; analyzedAt: string; turnsUsed: number };
};

const REQUIRED_KEYS: Array<keyof ChangeReadinessOutput> = [
  "ticketId", "ticketVersion", "detectedChangeTypes", "classificationConfidence", "extractedFields", "fieldProvenance",
  "missingFields", "invalidFields", "conflicts", "validationResults", "clarifyingQuestions", "assumptions", "riskFlags",
  "readinessStatus", "readinessReason", "recommendedAssignmentGroup", "handoffPackage", "terraformEligibility", "auditMetadata",
];

/** Hand-written, matching this repo's existing style of manual validators
 * (see sanitizeAnalysis/sanitizeProvisioning) rather than a new schema
 * library. Returns every violation found, never just the first. */
export function validateChangeReadinessOutput(value: unknown): string[] {
  const problems: string[] = [];
  const body = record(value);
  for (const key of REQUIRED_KEYS) if (!(key in body)) problems.push(`missing required output key: ${String(key)}`);
  if (typeof body.ticketId !== "string" || !body.ticketId) problems.push("ticketId must be a non-empty string");
  if (typeof body.ticketVersion !== "number") problems.push("ticketVersion must be a number");
  if (!Array.isArray(body.detectedChangeTypes)) problems.push("detectedChangeTypes must be an array");
  if (typeof body.classificationConfidence !== "number" || body.classificationConfidence < 0 || body.classificationConfidence > 100) problems.push("classificationConfidence must be 0-100");
  for (const key of ["missingFields", "invalidFields", "conflicts", "clarifyingQuestions", "assumptions", "riskFlags"] as const) {
    if (!Array.isArray(body[key])) problems.push(`${key} must be an array`);
  }
  const validReadiness = new Set(["NEW", "ANALYZING", "NEEDS_CLARIFICATION", "VALIDATION_BLOCKED", "CONFLICT_DETECTED", "READY_FOR_REVIEW", "READY_FOR_CLOUD_TEAM", "ROUTED", "CANCELLED"]);
  if (!validReadiness.has(text(body.readinessStatus))) problems.push("readinessStatus must be one of the spec's 9 values");
  if (typeof body.terraformEligibility !== "object" || body.terraformEligibility === null) problems.push("terraformEligibility must be an object");
  return problems;
}

// ---------------------------------------------------------------------------
// Small local helpers (no external deps, matching this codebase's style)
// ---------------------------------------------------------------------------

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export { transitionAllowed } from "./servicenow-change-agent.ts";
export type { CandidateFact, ReconciledFact, FactConflict, FieldState, WorkflowState };
