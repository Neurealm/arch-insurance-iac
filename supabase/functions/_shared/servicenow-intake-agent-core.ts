// Deterministic building blocks shared by the agentic ServiceNow intake
// (supabase/functions/servicenow-intake-agent). Deliberately NOT imported by
// the existing one-shot supabase/functions/servicenow-intake -- that
// function stays exactly as it is so the live ServiceNow webhook is never at
// risk from this rebuild. This module intentionally mirrors a large part of
// servicenow-intake/index.ts's private logic; once the agent path has proven
// itself in demo/resume mode, the two should be consolidated onto one shared
// core instead of carrying near-duplicate business logic in two places.
//
// Every function here is pure or talks only to Supabase/ServiceNow/Azure --
// none of them call an LLM. That boundary is deliberate: the agent decides
// WHEN to call these, never HOW they validate.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  mergeTicketHistory, redactSensitiveData, unwrapTicketPayload, reconcileFacts, createVmFieldStates,
  ARM_GROUP, ARM_SUBNET, VM_NAME, VM_SIZE, ADMIN_USERNAME, ADMIN_USERNAME_RESERVED, SSH_KEY, IMAGE_PART, LOCATION,
  type CandidateFact,
} from "./servicenow-change-agent.ts";
import { timingSafeEqual, hmacSha256Hex } from "./webhook-auth.ts";
import { serviceRoleKeyCandidates } from "./platform-function.ts";

export const SERVICE_NOW_MARKER = "[NeuGAIN Infrastructure Intake]";
export const VM_RESOURCE_TYPE = "Microsoft.Compute/virtualMachines";
export const SUPPORTED_ACTIONS = new Set([
  "start_vm", "stop_vm", "restart_vm", "resize_vm", "increase_os_disk",
  "configure_backup", "enable_monitoring", "assess_patches", "create_vm",
]);

export type RecordValue = Record<string, unknown>;

export type NormalizedTicket = {
  ticketNumber: string;
  sysId: string | null;
  requester: string;
  application: string;
  environment: string;
  description: string;
  maintenanceWindow: string;
  businessImpact: string;
  applicationOwner: string;
  rollbackPlan: string;
  identityConflicts: string[];
  sourceUpdatedAt: string | null;
  priorQuestions: string[];
  clarificationAnswers: string[];
};

export type AzureVm = {
  id: string;
  name: string;
  resourceGroup: string;
  subscriptionId: string;
  location: string;
  powerState: string;
  provisioningState: string;
  vmSize: string;
  osType: string;
};

/**
 * What the model used to return in one shot (see servicenow-intake). In the
 * agent version this is what the `submit_analysis` tool call must supply --
 * still the exact same shape, still sanitized exactly the same way, just
 * delivered through a tool call instead of a forced JSON response body.
 */
export type Analysis = {
  action: string;
  confidence: number;
  summary: string;
  targetVmName: string | null;
  extractedFields: RecordValue;
  missingFields: string[];
  conflicts: string[];
  clarificationQuestions: string[];
  provisioning: RecordValue;
};

// --- small primitives --------------------------------------------------

export function record(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
}
export function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
export function timestamp(value: string) {
  if (!value) return null;
  const parsed = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
export function first(source: RecordValue, keys: string[]) { for (const key of keys) { const value = text(source[key]); if (value) return value; } return ""; }
export function array(value: unknown) { return Array.isArray(value) ? value : []; }
export function unique(values: string[]) { return [...new Set(values.filter(Boolean))]; }
export function requestedOsDiskSizeGb(fields: RecordValue): number | null {
  for (const key of ["requestedOsDiskSizeGB", "diskSizeGB", "osDiskSizeGB"]) {
    const value = fields[key];
    if (Number.isSafeInteger(value)) return value as number;
    if (typeof value === "string") {
      const match = value.trim().match(/^(\d{1,4})(?:\s*(gb|tb))?$/i);
      if (match) return Number(match[1]) * (match[2]?.toLowerCase() === "tb" ? 1024 : 1);
    }
  }
  return null;
}

export function corsHeaders(request?: Request) {
  const configuredOrigin = Deno.env.get("APP_ORIGIN")?.trim();
  const requestOrigin = request?.headers.get("origin")?.trim();
  const allowOrigin = configuredOrigin || requestOrigin || "*";
  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-servicenow-webhook-secret",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
}

export function json(body: unknown, status = 200, request?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), "content-type": "application/json", "cache-control": "no-store" },
  });
}

export function normalizeTicket(body: RecordValue, history: unknown[] = [body]): NormalizedTicket {
  const merged = mergeTicketHistory(history);
  const fields = unwrapTicketPayload(body);
  return {
    ticketNumber: merged.ticketNumber,
    sysId: merged.sysId,
    requester: merged.requester,
    application: merged.application,
    environment: merged.environment,
    description: merged.description,
    maintenanceWindow: merged.maintenanceWindow,
    businessImpact: merged.businessImpact,
    applicationOwner: merged.applicationOwner,
    rollbackPlan: merged.rollbackPlan,
    identityConflicts: merged.identityConflicts,
    sourceUpdatedAt: timestamp(first(fields, ["sys_updated_on", "updated_at", "source_updated_at"])),
    priorQuestions: merged.priorQuestions.slice(0, 40),
    clarificationAnswers: merged.clarificationAnswers.slice(0, 40),
  };
}

export async function sha256(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function supabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = serviceRoleKeyCandidates()[0];
  if (!url || !key) throw new Error("Supabase server credentials are not configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function authenticatedCaller(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return null;
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = serviceRoleKeyCandidates()[0];
  if (!url || !serviceRoleKey) throw new Error("Supabase server credentials are not configured.");
  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const token = authorization.slice("Bearer ".length);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function isPlatformAdmin(admin: ReturnType<typeof supabaseAdmin>, userId: string) {
  const { data } = await admin.from("user_roles").select("user_id").eq("user_id", userId).eq("role", "platform_admin").maybeSingle();
  return !!data;
}

/**
 * Every tool call, model turn, and terminal decision is logged here -- this
 * IS the agent's audit trace. servicenow_intake_events already accepts
 * arbitrary JSON detail, so the agent needs no new table to be inspectable.
 */
export async function addEvent(admin: ReturnType<typeof supabaseAdmin>, requestId: string, eventType: string, detail: RecordValue = {}) {
  await admin.from("servicenow_intake_events").insert({ request_id: requestId, event_type: eventType, detail });
}

export async function ticketPayloadHistory(admin: ReturnType<typeof supabaseAdmin>, ticketNumber: string): Promise<unknown[]> {
  const history: unknown[] = [];
  const escaped = ticketNumber.replace(/[\\%_]/g, "\\$&");
  const pageSize = 1_000;
  for (let from = 0;; from += pageSize) {
    const { data, error } = await admin.from("servicenow_intake_requests")
      .select("ticket_number, ticket_payload")
      .ilike("ticket_number", escaped)
      .order("received_at", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Unable to load complete ticket history: ${error.message}`);
    const rows = data ?? [];
    history.push(...rows
      .filter((row) => text(record(row).ticket_number).toLowerCase() === ticketNumber.toLowerCase())
      .map((row) => redactSensitiveData(record(row).ticket_payload)));
    if (rows.length < pageSize) break;
  }
  return history;
}

function upstreamEventKey(body: RecordValue, ticket: NormalizedTicket, observedSysId: string | null, payloadHash: string, demoMode: boolean) {
  const fields = unwrapTicketPayload(body);
  const eventId = first(fields, ["event_id", "eventId", "journal_entry_id", "sys_journal_field_id", "webhook_event_id"]);
  if (eventId) return `servicenow-event:${eventId}`;
  if (!demoMode && observedSysId && ticket.sourceUpdatedAt) return `servicenow-ticket:${observedSysId}:${ticket.sourceUpdatedAt}`;
  return `payload:${payloadHash}`;
}

export type CanonicalSnapshot = {
  ticketId: string;
  snapshotId: string | null;
  inserted: boolean;
  workflowVersion: number;
  identityConflict: boolean;
};

export async function recordCanonicalSnapshot(
  admin: ReturnType<typeof supabaseAdmin>,
  body: RecordValue,
  ticket: NormalizedTicket,
  observedTicketNumber: string,
  observedSysId: string | null,
  callerId: string | null,
  payloadHash: string,
  demoMode: boolean,
): Promise<CanonicalSnapshot> {
  const safePayload = redactSensitiveData(body);
  const safeFields = redactSensitiveData(unwrapTicketPayload(body));
  const { data, error } = await admin.rpc("ingest_servicenow_ticket_snapshot", {
    p_ticket_number: observedTicketNumber,
    p_service_now_sys_id: observedSysId,
    p_requested_by_user_id: callerId,
    p_upstream_event_key: upstreamEventKey(body, ticket, observedSysId, payloadHash, demoMode),
    p_source_updated_at: ticket.sourceUpdatedAt,
    p_redacted_payload: safePayload,
    p_canonical_structured_fields: safeFields,
    p_content_sha256: payloadHash,
  });
  if (error) throw new Error(`Unable to record canonical ServiceNow history: ${error.message}`);
  const result = record(array(data)[0] ?? data);
  const ticketId = text(result.ticket_id ?? result.ticketId);
  const snapshotId = text(result.snapshot_id ?? result.snapshotId);
  const workflowVersion = Number(result.workflow_version ?? result.workflowVersion);
  const identityConflict = result.identity_conflict === true || result.identityConflict === true;
  if (!ticketId || (!identityConflict && !snapshotId) || !Number.isSafeInteger(workflowVersion)) {
    throw new Error("Canonical ServiceNow history returned an invalid snapshot record.");
  }
  return { ticketId, snapshotId: snapshotId || null, inserted: result.inserted === true, workflowVersion, identityConflict };
}

// --- Azure -----------------------------------------------------------------

function normalizeVm(value: unknown): AzureVm | null {
  const vm = record(value);
  const id = first(vm, ["id", "resourceId", "resource_id"]);
  const name = first(vm, ["name"]) || id.split("/").filter(Boolean).at(-1) || "";
  if (!id || !name) return null;
  return {
    id, name,
    resourceGroup: first(vm, ["resourceGroup", "resource_group"]),
    subscriptionId: first(vm, ["subscriptionId", "subscription_id"]),
    location: first(vm, ["location", "region"]),
    powerState: first(vm, ["powerState", "power_state", "instanceViewPowerState"]) || "Unknown",
    provisioningState: first(vm, ["provisioningState", "provisioning_state"]) || "Unknown",
    vmSize: first(vm, ["vmSize", "vm_size", "size"]) || "Not reported",
    osType: first(vm, ["osType", "os_type", "operatingSystem"]) || "Not reported",
  };
}

export async function loadAzureInventory(userAuthorization?: string) {
  const baseUrl = (Deno.env.get("AZURE_CONTROL_PLANE_URL") ?? "").replace(/\/$/, "");
  const token = Deno.env.get("AZURE_CONTROL_PLANE_TOKEN");
  const authorization = token ? `Bearer ${token}` : userAuthorization;
  if (!baseUrl || !authorization) return { state: "not_configured", vms: [] as AzureVm[] };
  const response = await fetch(`${baseUrl}/api/v1/virtual-machines`, { headers: { authorization, accept: "application/json" } });
  if (!response.ok) throw new Error(`Azure inventory returned ${response.status}.`);
  const payload = record(await response.json());
  const values = Array.isArray(payload) ? payload : array(payload.items ?? payload.value ?? payload.virtualMachines);
  return { state: "available", vms: values.map(normalizeVm).filter((vm): vm is AzureVm => !!vm).slice(0, 500) };
}

// --- sanitization ------------------------------------------------------

export function sanitizeAnalysis(value: unknown): Analysis {
  const raw = record(value);
  const action = text(raw.action) || "unknown";
  const rawConfidence = typeof raw.confidence === "number" && Number.isFinite(raw.confidence) ? raw.confidence : 0;
  const confidence = Math.max(0, Math.min(100, Math.round(rawConfidence > 0 && rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence)));
  return {
    action: SUPPORTED_ACTIONS.has(action) ? action : "unknown",
    confidence,
    summary: text(raw.summary).slice(0, 1000),
    targetVmName: text(raw.targetVmName) || null,
    extractedFields: record(raw.extractedFields),
    missingFields: unique(array(raw.missingFields).filter((v): v is string => typeof v === "string").slice(0, 30)),
    conflicts: unique(array(raw.conflicts).filter((v): v is string => typeof v === "string").slice(0, 30)),
    clarificationQuestions: unique(array(raw.clarificationQuestions).filter((v): v is string => typeof v === "string").slice(0, 30)),
    provisioning: sanitizeProvisioning(raw.provisioning),
  };
}

export function actionLabel(action: string) {
  return ({ start_vm: "Start Azure VM", stop_vm: "Stop Azure VM", restart_vm: "Restart Azure VM", resize_vm: "Change VM size", increase_os_disk: "Increase OS disk capacity", configure_backup: "Configure Azure Backup", enable_monitoring: "Enable Azure Monitor / VM Insights", assess_patches: "Run patch assessment", create_vm: "Create Azure VM", unknown: "Unable to classify request" } as Record<string, string>)[action] ?? action;
}

export const PROVISIONING_FIELDS: Array<{ key: string; label: string }> = [
  { key: "resourceGroupArmId", label: "Destination resource group ARM ID" },
  { key: "subnetArmId", label: "Subnet ARM ID the machines attach to" },
  { key: "location", label: "Azure region, for example eastus" },
  { key: "vmNames", label: "Name for each virtual machine" },
  { key: "vmSize", label: "VM size or SKU, for example Standard_B2s" },
  { key: "adminUsername", label: "Administrator username" },
  { key: "sshPublicKey", label: "SSH public key for the administrator" },
  { key: "osPublisher", label: "OS image publisher, for example Canonical" },
  { key: "osOffer", label: "OS image offer" },
  { key: "osSku", label: "OS image SKU" },
  { key: "osVersion", label: "OS image version, for example latest" },
];

/**
 * The trust boundary for ticket/model-supplied infrastructure values -- the
 * SAME boundary as servicenow-intake, applied identically here. It does not
 * matter whether a value came from one forced JSON response or from a tool
 * call the agent chose to make eight turns in: it is either provably
 * well-shaped or it is dropped, never passed through.
 */
export function sanitizeProvisioning(value: unknown): RecordValue {
  const raw = record(value);
  const out: RecordValue = {};
  const group = text(raw.resourceGroupArmId);
  if (ARM_GROUP.test(group)) out.resourceGroupArmId = group;
  const subnet = text(raw.subnetArmId);
  if (ARM_SUBNET.test(subnet)) out.subnetArmId = subnet;
  const location = text(raw.location).toLowerCase().replace(/\s+/g, "");
  if (LOCATION.test(location)) out.location = location;
  const names = array(raw.vmNames).filter((item): item is string => typeof item === "string").map((item) => item.trim());
  const distinct = unique(names.map((name) => name.toLowerCase()));
  if (names.length >= 1 && names.length <= 20 && names.every((name) => VM_NAME.test(name)) && distinct.length === names.length) out.vmNames = names;
  const size = text(raw.vmSize);
  if (VM_SIZE.test(size)) out.vmSize = size;
  const admin = text(raw.adminUsername);
  if (ADMIN_USERNAME.test(admin) && !ADMIN_USERNAME_RESERVED.includes(admin)) out.adminUsername = admin;
  const key = text(raw.sshPublicKey);
  if (SSH_KEY.test(key)) out.sshPublicKey = key;
  for (const field of ["osPublisher", "osOffer", "osSku", "osVersion"]) {
    const part = text(raw[field]);
    if (IMAGE_PART.test(part)) out[field] = part;
  }
  const tags = record(raw.tags);
  const flat: RecordValue = {};
  for (const [name, item] of Object.entries(tags)) {
    if (/^[A-Za-z0-9_.-]{1,128}$/.test(name) && typeof item === "string" && item.length <= 256) flat[name] = item;
  }
  out.tags = flat;
  return out;
}

// --- fact reconciliation & validation -----------------------------------

const COMMON_FACT_FIELDS: Array<{ field: string; ticketKey: "requester" | "application" | "environment" | "maintenanceWindow" | "businessImpact" | "applicationOwner" | "rollbackPlan"; extractedKeys: string[] }> = [
  { field: "requester", ticketKey: "requester", extractedKeys: ["requester", "requestedBy", "requested_by"] },
  { field: "application", ticketKey: "application", extractedKeys: ["application", "businessService", "business_service", "service"] },
  { field: "environment", ticketKey: "environment", extractedKeys: ["environment"] },
  { field: "maintenanceWindow", ticketKey: "maintenanceWindow", extractedKeys: ["maintenanceWindow", "maintenance_window", "changeWindow"] },
  { field: "businessImpact", ticketKey: "businessImpact", extractedKeys: ["businessImpact", "business_impact", "impact"] },
  { field: "applicationOwner", ticketKey: "applicationOwner", extractedKeys: ["applicationOwner", "application_owner", "owner", "serviceOwner"] },
  { field: "rollbackPlan", ticketKey: "rollbackPlan", extractedKeys: ["rollbackPlan", "rollback_plan", "backoutPlan", "backout_plan"] },
];

const FACT_FIELD_LABELS: Record<string, string> = {
  requester: "requester", application: "application or business service", environment: "environment",
  maintenanceWindow: "maintenance window", businessImpact: "business impact",
  applicationOwner: "application owner", rollbackPlan: "rollback plan",
};

function buildCommonFacts(ticket: NormalizedTicket, analysis: Analysis): CandidateFact[] {
  const at = ticket.sourceUpdatedAt ?? new Date(0).toISOString();
  const facts: CandidateFact[] = [];
  for (const { field, ticketKey, extractedKeys } of COMMON_FACT_FIELDS) {
    const structuredValue = text(ticket[ticketKey]);
    const proseValue = first(analysis.extractedFields, extractedKeys);
    if (structuredValue) {
      facts.push({ field, value: structuredValue, dataType: "string", source: "structured_ticket", sourceRecordId: `${ticket.ticketNumber}:structured:${field}`, sourceAuthor: null, sourceAt: at, supportingText: structuredValue, confidence: 100 });
    }
    if (proseValue) {
      facts.push({ field, value: proseValue, dataType: "string", source: field === "environment" ? "structured_ticket" : "requester_prose", sourceRecordId: `${ticket.ticketNumber}:prose:${field}`, sourceAuthor: null, sourceAt: at, supportingText: proseValue, confidence: analysis.confidence });
    }
  }
  return facts;
}

export type ValidationResult = {
  target: AzureVm | null;
  missing: string[];
  conflicts: string[];
  questions: string[];
  ready: boolean;
  readyForGap: boolean;
};

/**
 * The single deterministic gate every proposed analysis must pass through,
 * whether it arrived from one forced JSON response (servicenow-intake) or
 * from an agent's submit_analysis tool call after however many turns it took
 * to get there. This function is the trust boundary -- it is intentionally
 * identical to servicenow-intake's validate() so the two paths can never
 * silently diverge on what "ready" means.
 */
export function validate(ticket: NormalizedTicket, analysis: Analysis, azure: { state: string; vms: AzureVm[] }, hasApprovedCapability = false): ValidationResult {
  const missing = analysis.action === "create_vm" ? [] : [...analysis.missingFields];
  const conflicts = [...analysis.conflicts, ...ticket.identityConflicts];

  const { facts: reconciledFacts, conflicts: factConflicts } = reconcileFacts(buildCommonFacts(ticket, analysis));
  const resolved = Object.fromEntries(reconciledFacts.map((fact) => [fact.field, text(fact.value)]));
  const conflictedFields = new Set(factConflicts.map((conflict) => conflict.field));
  const application = resolved.application ?? "";
  const environment = resolved.environment ?? "";
  const maintenanceWindow = resolved.maintenanceWindow ?? "";
  const businessImpact = resolved.businessImpact ?? "";
  const applicationOwner = resolved.applicationOwner ?? "";
  const rollbackPlan = resolved.rollbackPlan ?? "";

  if (!ticket.ticketNumber) missing.push("ServiceNow ticket number");
  if (!(resolved.requester ?? "") && !conflictedFields.has("requester")) missing.push("Requester");
  if (!application && !conflictedFields.has("application")) missing.push("Application or business service");
  if (!environment && !conflictedFields.has("environment")) missing.push("Environment");
  if (ticket.description.length < 10) missing.push("Request description");
  if (!maintenanceWindow && !conflictedFields.has("maintenanceWindow")) missing.push("Maintenance window with timezone");
  if (!businessImpact && !conflictedFields.has("businessImpact")) missing.push("Expected business impact");
  if (!applicationOwner && !conflictedFields.has("applicationOwner")) missing.push("Application owner");
  if (rollbackPlan.length < 10 && !conflictedFields.has("rollbackPlan")) missing.push("Rollback plan");
  if (analysis.action === "unknown" || analysis.confidence < 60) missing.push("A supported, unambiguous Azure VM action");

  for (const conflict of factConflicts) {
    const values = unique(conflict.values.map((candidate) => text(candidate.value)));
    conflicts.push(`The ticket gives conflicting values for ${FACT_FIELD_LABELS[conflict.field] ?? conflict.field}: ${values.join(" vs. ")}. Confirm which is correct.`);
  }

  const target = azure.vms.find((vm) => vm.name.toLowerCase() === (analysis.targetVmName ?? "").toLowerCase() || vm.id.toLowerCase() === (analysis.targetVmName ?? "").toLowerCase()) ?? null;
  if (analysis.action !== "create_vm") {
    if (!target) missing.push(azure.state === "available" ? "Target VM confirmed in Azure inventory" : "Azure target verification");
    if (target && analysis.action === "start_vm" && /running/i.test(target.powerState)) conflicts.push("The selected VM is already running.");
    if (target && analysis.action === "stop_vm" && !/running/i.test(target.powerState)) conflicts.push("The selected VM is not running; confirm that a stop operation is required.");
    if (target && analysis.action === "restart_vm" && !/running/i.test(target.powerState)) conflicts.push("Restart normally requires a running VM.");
  }
  const textBlob = `${ticket.description} ${JSON.stringify(analysis.extractedFields)}`.toLowerCase();
  if (analysis.action === "resize_vm" && !(/standard_[a-z0-9_]+/i.test(textBlob) || /\b\d+\s*(v?cpu|core|cores)\b/i.test(textBlob))) missing.push("Requested VM size or SKU");
  if (analysis.action === "increase_os_disk" && !/\b\d+\s*(gb|tb)\b/i.test(textBlob)) missing.push("Requested disk capacity");
  if (analysis.action === "increase_os_disk" && (!Number.isSafeInteger(requestedOsDiskSizeGb(analysis.extractedFields)) || (requestedOsDiskSizeGb(analysis.extractedFields) ?? 0) < 64 || (requestedOsDiskSizeGb(analysis.extractedFields) ?? 0) > 4095)) missing.push("Requested OS disk capacity from 64 through 4095 GB");
  if (analysis.action === "configure_backup" && !/\b(rpo|rto|hour|daily|weekly|retention|policy)\b/i.test(textBlob)) missing.push("Recovery objective or backup policy");
  if (analysis.action === "create_vm") {
    const provisioningStates = createVmFieldStates(analysis.provisioning);
    for (const field of PROVISIONING_FIELDS) {
      if (provisioningStates[field.key] !== "VALID") missing.push(field.label);
    }
    const names = array(analysis.provisioning.vmNames).filter((item): item is string => typeof item === "string");
    if (names.length && azure.state === "available") {
      const taken = names.filter((name) => azure.vms.some((vm) => vm.name.toLowerCase() === name.toLowerCase()));
      if (taken.length) conflicts.push(`These machine names already exist in Azure: ${taken.join(", ")}.`);
    }
    const group = text(analysis.provisioning.resourceGroupArmId).toLowerCase();
    const subnet = text(analysis.provisioning.subnetArmId).toLowerCase();
    if (group && subnet && subnet.split("/providers/")[0].split("/resourcegroups/")[0] !== group.split("/resourcegroups/")[0]) {
      conflicts.push("The subnet is in a different subscription from the destination resource group.");
    }
  }

  const asRequest = (field: string) => {
    const acronym = field.length > 1 && field[0] === field[0].toUpperCase() && field[1] === field[1].toUpperCase();
    return `Please provide the ${acronym ? field : field.charAt(0).toLowerCase() + field.slice(1)}.`;
  };
  const modelQuestions = analysis.action === "create_vm" ? [] : analysis.clarificationQuestions;
  const questions = unique([...modelQuestions, ...unique(missing).map(asRequest), ...unique(conflicts).map((conflict) => `Please resolve: ${conflict}`)]);
  const complete = analysis.action !== "unknown" && analysis.confidence >= 60 && !missing.length && !conflicts.length;
  return {
    target, missing: unique(missing), conflicts: unique(conflicts), questions,
    ready: complete && hasApprovedCapability,
    readyForGap: complete && !hasApprovedCapability,
  };
}

export function clarificationNote(ticket: NormalizedTicket, analysis: Analysis, result: ValidationResult, gap?: { id: string; reused: boolean } | null) {
  if (result.ready) return `${SERVICE_NOW_MARKER}\n\nThe request has passed initial intake checks for ${actionLabel(analysis.action)} (${analysis.confidence}% confidence). The platform will route it to Change Engineering for human approval. No Azure action was performed by this analysis.`;
  if (gap) return `${SERVICE_NOW_MARKER}\n\nNo approved Terraform capability exists yet for ${actionLabel(analysis.action)} (${analysis.confidence}% confidence). ${gap.reused ? `This request has been linked to the existing engineering gap GAP-${gap.id.slice(0, 8).toUpperCase()}.` : `An engineering gap (GAP-${gap.id.slice(0, 8).toUpperCase()}) has been opened.`} AI may draft a module, but the request pauses until tests and human approval finish. No Azure action was performed by this analysis.`;
  return [`${SERVICE_NOW_MARKER} Clarification required`, "", "The infrastructure team cannot process this change yet. Please update the ticket with:", ...result.questions.map((question) => `- ${question}`), "", `Detected request type: ${actionLabel(analysis.action)} (${analysis.confidence}% confidence).`, "No Azure action was performed by this analysis."].join("\n");
}

export function inFlightConflictNote(analysis: Analysis, detail: string) {
  return [
    `${SERVICE_NOW_MARKER} Clarification required`, "",
    "The infrastructure team cannot open a new governed change for this resource yet:",
    `- ${detail}`, "",
    "Please wait until that change is approved or rejected, then resubmit this request (or ask the platform team to resume this ticket).",
    "", `Detected request type: ${actionLabel(analysis.action)} (${analysis.confidence}% confidence).`,
    "No Azure action was performed by this analysis.",
  ].join("\n");
}

export async function postCustomerComment(ticket: NormalizedTicket, note: string) {
  const baseUrl = (Deno.env.get("SERVICENOW_BASE_URL") ?? "").replace(/\/$/, "");
  const clientId = Deno.env.get("SERVICENOW_CLIENT_ID");
  const clientSecret = Deno.env.get("SERVICENOW_CLIENT_SECRET");
  if (!baseUrl || !clientId || !clientSecret) throw new Error("ServiceNow connector secrets are not configured.");
  if (!ticket.sysId) throw new Error("ServiceNow sys_id is required to post a customer-visible comment.");
  const tokenResponse = await fetch(`${baseUrl}/oauth_token.do`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }) });
  const tokenPayload = record(await tokenResponse.json().catch(() => ({})));
  const token = text(tokenPayload.access_token);
  if (!tokenResponse.ok || !token) throw new Error("ServiceNow OAuth token request failed.");
  const table = Deno.env.get("SERVICENOW_CHANGE_TABLE") ?? "change_request";
  const update = await fetch(`${baseUrl}/api/now/table/${encodeURIComponent(table)}/${encodeURIComponent(ticket.sysId)}`, { method: "PATCH", headers: { authorization: `Bearer ${token}`, "content-type": "application/json", accept: "application/json" }, body: JSON.stringify({ comments: note }) });
  if (!update.ok) throw new Error(`ServiceNow comment update returned ${update.status}.`);
}

const IN_FLIGHT_CONFLICT_MARKER = "another_in_flight_change_package_already_targets_one_of_these_resources";

export class InFlightChangeConflict extends Error {}

export async function maybeCreateDraft(admin: ReturnType<typeof supabaseAdmin>, ticket: NormalizedTicket, analysis: Analysis, target: AzureVm | null, creatorOverride?: string | null) {
  const creator = creatorOverride || Deno.env.get("IAC_AUTOMATION_USER_ID");
  if (!creator || !SUPPORTED_ACTIONS.has(analysis.action)) return null;
  const packageNumber = `VM-CHG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

  if (analysis.action === "create_vm") {
    const provisioning = analysis.provisioning;
    const group = text(provisioning.resourceGroupArmId);
    const names = array(provisioning.vmNames).filter((item): item is string => typeof item === "string");
    if (!group || !names.length) return null;
    const { data: ids, error: idsError } = await admin.rpc("iac_vm_target_ids", { p_resource_group_arm_id: group, p_vm_names: names });
    if (idsError) throw new Error(`Unable to derive VM targets: ${idsError.message}`);
    const targetIds = array(ids).filter((item): item is string => typeof item === "string");
    if (!targetIds.length) return null;
    const subscription = group.split("/")[2] ?? "";
    const resourceGroup = group.split("/")[4] ?? "";
    const location = text(provisioning.location);
    const { data: created, error: createError } = await admin.rpc("save_iac_change_package", {
      p_package: {
        package_number: packageNumber, target_resource_id: targetIds[0], target_name: names[0],
        subscription_id: subscription, resource_group: resourceGroup, region: location,
        action_type: "create_vm", action_label: actionLabel("create_vm"),
        parameters: { ...provisioning, environment: ticket.environment.toLowerCase(), source: "servicenow_intake_agent", serviceNowTicket: ticket.ticketNumber, serviceNowSysId: ticket.sysId, confidence: analysis.confidence },
        rationale: `ServiceNow ${ticket.ticketNumber} requested by ${ticket.requester}: ${ticket.description}`,
        current_state: {},
        policy_evidence: [
          { check: "Agent classification", result: `create_vm · ${analysis.confidence}% confidence` },
          { check: "Provisioning inputs", result: `All ${PROVISIONING_FIELDS.length} required inputs validated from the ticket` },
          { check: "Name collision", result: `${targetIds.length} requested name(s) not present in live Azure inventory` },
        ],
        validation_plan: ["Confirm every requested machine exists in Azure after apply", "Confirm each machine has the approved size and image", "Confirm each NIC attached to the authorized subnet"],
        risk_score: 60, risk_level: "Medium", approval_required: true,
      },
      p_targets: targetIds.map((id, index) => ({
        target_resource_id: id, target_name: names[index], subscription_id: subscription,
        resource_group: resourceGroup, region: location, current_state: {},
      })),
      p_submit: false, p_package_id: null, p_created_by: creator,
    });
    if (createError) {
      if (createError.message.includes(IN_FLIGHT_CONFLICT_MARKER)) {
        throw new InFlightChangeConflict(`Another governed change is already in progress for one of the requested machines (${names.join(", ")}).`);
      }
      throw new Error(`Unable to create governed draft: ${createError.message}`);
    }
    const saved = record(created);
    return { id: text(saved.id), package_number: text(saved.package_number) };
  }

  if (!target) return null;
  const { data, error } = await admin.rpc("save_iac_change_package", {
    p_package: {
      package_number: packageNumber, target_resource_id: target.id, target_name: target.name,
      subscription_id: target.subscriptionId, resource_group: target.resourceGroup, region: target.location,
      action_type: analysis.action, action_label: actionLabel(analysis.action),
      parameters: { source: "servicenow_intake_agent", serviceNowTicket: ticket.ticketNumber, serviceNowSysId: ticket.sysId, confidence: analysis.confidence, extractedFields: analysis.extractedFields, ...(analysis.action === "increase_os_disk" ? { requestedOsDiskSizeGB: requestedOsDiskSizeGb(analysis.extractedFields) } : {}) },
      rationale: `ServiceNow ${ticket.ticketNumber} requested by ${ticket.requester}: ${ticket.description}`,
      current_state: target,
      policy_evidence: [{ check: "Agent classification", result: `${analysis.action} · ${analysis.confidence}% confidence` }, { check: "Azure target", result: `${target.name} matched live inventory` }],
      validation_plan: ["Reconcile target VM with Azure before approval", "Validate action-specific post-change state", "Review current Azure operations evidence"],
      risk_score: analysis.action === "restart_vm" ? 35 : 25, risk_level: "Low", approval_required: true,
    },
    p_targets: [{
      target_resource_id: target.id, target_name: target.name, subscription_id: target.subscriptionId,
      resource_group: target.resourceGroup, region: target.location, current_state: target,
    }],
    p_submit: false,
    p_package_id: null,
    p_created_by: creator,
  });
  if (error) {
    if (error.message.includes(IN_FLIGHT_CONFLICT_MARKER)) {
      throw new InFlightChangeConflict(`Another governed change is already in progress for ${target.name}.`);
    }
    throw new Error(`Unable to create governed draft: ${error.message}`);
  }
  const saved = record(data);
  return { id: text(saved.id), package_number: text(saved.package_number) };
}

export async function maybeCreateGap(admin: ReturnType<typeof supabaseAdmin>, ticket: NormalizedTicket, analysis: Analysis, requestId: string, requestedBy: string | null) {
  const { data: open } = await admin.from("iac_engineering_gaps").select("id, status").eq("provider", "azure").eq("resource_type", VM_RESOURCE_TYPE).eq("action_type", analysis.action).not("status", "in", "(capability_approved,abandoned)").maybeSingle();
  const link = async (gapId: string) => {
    const { error } = await admin.from("iac_engineering_gap_intake_requests").upsert({ gap_id: gapId, intake_request_id: requestId }, { onConflict: "gap_id,intake_request_id" });
    if (error) throw new Error(`Unable to link the ticket to its engineering gap: ${error.message}`);
  };
  if (open) {
    await link(open.id as string);
    await admin.from("iac_engineering_gap_events").insert({ gap_id: open.id, event_type: "ticket_linked", detail: { ticketNumber: ticket.ticketNumber, serviceNowSysId: ticket.sysId, intakeRequestId: requestId } });
    return { id: open.id as string, reused: true };
  }
  const { data: created, error } = await admin.from("iac_engineering_gaps").insert({
    provider: "azure", resource_type: VM_RESOURCE_TYPE, action_type: analysis.action, status: "open",
    requested_by: requestedBy, source_intake_request_id: requestId,
    context: { ticketNumber: ticket.ticketNumber, serviceNowSysId: ticket.sysId, requester: ticket.requester, description: ticket.description, extractedFields: analysis.extractedFields, confidence: analysis.confidence },
  }).select("id").single();
  if (error) throw new Error(`Unable to open an engineering gap: ${error.message}`);
  await link(created.id as string);
  await admin.from("iac_engineering_gap_events").insert({ gap_id: created.id, event_type: "gap_opened", detail: { ticketNumber: ticket.ticketNumber, intakeRequestId: requestId } });
  return { id: created.id as string, reused: false };
}

/**
 * See servicenow-intake/index.ts's verifyServiceNowWebhook for the same
 * caveat: the header name/format assumed for the optional HMAC layer is a
 * common convention, not a ServiceNow standard -- confirm against the real
 * instance's outbound webhook config before relying on it in production.
 */
export async function verifyServiceNowWebhook(request: Request, rawBody: string): Promise<{ status: number; message: string } | null> {
  const expectedSecret = Deno.env.get("SERVICENOW_WEBHOOK_SECRET");
  if (!expectedSecret) return { status: 503, message: "webhook is not configured" };
  const receivedSecret = request.headers.get("x-servicenow-webhook-secret") ?? "";
  if (!receivedSecret || !timingSafeEqual(receivedSecret, expectedSecret)) return { status: 401, message: "unauthorized" };

  const hmacSecret = Deno.env.get("SERVICENOW_WEBHOOK_HMAC_SECRET");
  if (hmacSecret) {
    const header = request.headers.get("x-servicenow-signature") ?? "";
    const signature = (header.startsWith("sha256=") ? header.slice(7) : header).toLowerCase();
    const expectedSignature = await hmacSha256Hex(hmacSecret, rawBody);
    if (!signature || !timingSafeEqual(signature, expectedSignature)) return { status: 401, message: "unauthorized" };
  }
  return null;
}
