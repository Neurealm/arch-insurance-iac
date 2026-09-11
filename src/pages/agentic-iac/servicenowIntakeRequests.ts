import { supabase } from "@/integrations/supabase/client";

export type ServiceNowIntakeRequest = {
  id: string;
  ticketNumber: string;
  serviceNowSysId: string | null;
  status: string;
  requestedByUserId: string | null;
  normalizedRequest: Record<string, unknown>;
  /** The original submission, replayed into the form when a ticket is revised. */
  ticketPayload: Record<string, unknown>;
  llmAnalysis: Record<string, unknown>;
  azureObservation: Record<string, unknown>;
  clarificationNote: string | null;
  changePackageId: string | null;
  errorMessage: string | null;
  receivedAt: string;
  analyzedAt: string | null;
  updatedAt: string;
};

const table = () => supabase as unknown as { from: (name: string) => any };

type Payload = Record<string, unknown>;
const envelopes = ["ticket", "change_request", "request"];
const aggregateArrays = new Set(["prior_questions", "priorQuestions", "clarification_answers", "clarificationAnswers"]);
const immutableIdentityKeys = new Set(["sys_id", "sysId"]);
const ticketIdentityKeys = new Set(["number", "ticket_number", "ticketNumber", "change_number"]);
const payload = (value: unknown): Payload => value && typeof value === "object" && !Array.isArray(value) ? value as Payload : {};
const hasValue = (value: unknown) => typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;
const stringList = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];
const unique = (values: string[]) => [...new Set(values)];

function mergeTicketText(previous: string, next: string) {
  if (!previous) return next;
  if (!next || previous === next || previous.includes(next)) return previous;
  if (next.includes(previous)) return next;
  return `${previous}\n\n${next}`;
}

/**
 * Stored demo submissions include a transport envelope (`{ mode, ticket }`).
 * A clarification submitted by an older UI can even contain prior envelopes.
 * Flatten every layer from oldest to newest so a later note cannot erase the
 * original requester, service, environment, or other ticket facts.
 */
export function canonicalTicketPayload(stored: unknown): Payload {
  const seen = new Set<object>();
  const layers: Payload[] = [];
  const visit = (value: unknown, depth = 0) => {
    if (depth > 8) return;
    const current = payload(value);
    if (!Object.keys(current).length || seen.has(current)) return;
    seen.add(current);
    envelopes.forEach((key) => visit(current[key], depth + 1));
    layers.push(current);
  };
  visit(stored);
  const flat: Payload = {};
  let description = "";
  const answers: string[] = [];
  const questions: string[] = [];
  for (const layer of layers) {
    const nextDescription = typeof layer.description === "string" ? layer.description.trim() : "";
    description = mergeTicketText(description, nextDescription);
    questions.push(...stringList(layer.prior_questions), ...stringList(layer.priorQuestions));
    answers.push(...stringList(layer.clarification_answers), ...stringList(layer.clarificationAnswers));
    for (const [key, value] of Object.entries(layer)) {
      if (key === "mode" || key === "description" || envelopes.includes(key) || aggregateArrays.has(key) || !hasValue(value)) continue;
      // A later demo revision used to generate a fresh sys_id. The permanent
      // ServiceNow identity is the earliest non-empty one, not the last value
      // accidentally replayed by a browser transport envelope.
      if (immutableIdentityKeys.has(key) && hasValue(flat.sys_id ?? flat.sysId)) continue;
      if (ticketIdentityKeys.has(key) && hasValue(flat.number ?? flat.ticket_number ?? flat.ticketNumber ?? flat.change_number)) continue;
      flat[key] = value;
    }
  }
  if (description) flat.description = description;
  if (questions.length) flat.prior_questions = unique(questions);
  if (answers.length) flat.clarification_answers = unique(answers);
  return flat;
}

/** Merge immutable ticket events into the form-friendly compatibility view. */
export function mergeTicketPayloadHistory(events: unknown[]): Payload {
  const merged: Payload = {};
  let description = "";
  const answers: string[] = [];
  const questions: string[] = [];
  for (const event of events) {
    const payload = canonicalTicketPayload(event);
    description = mergeTicketText(description, typeof payload.description === "string" ? payload.description.trim() : "");
    answers.push(...stringList(payload.clarification_answers));
    questions.push(...stringList(payload.prior_questions));
    for (const [key, value] of Object.entries(payload)) {
      if (key === "description" || key === "clarification_answers" || key === "prior_questions" || !hasValue(value)) continue;
      if (immutableIdentityKeys.has(key) && hasValue(merged.sys_id ?? merged.sysId)) continue;
      if (ticketIdentityKeys.has(key) && hasValue(merged.number ?? merged.ticket_number ?? merged.ticketNumber ?? merged.change_number)) continue;
      merged[key] = value;
    }
  }
  if (description) merged.description = description;
  if (answers.length) merged.clarification_answers = unique(answers);
  if (questions.length) merged.prior_questions = unique(questions);
  return merged;
}

function map(row: Record<string, any>): ServiceNowIntakeRequest {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    serviceNowSysId: row.service_now_sys_id ?? null,
    status: row.status,
    requestedByUserId: row.requested_by_user_id ?? null,
    normalizedRequest: row.normalized_request ?? {},
    ticketPayload: canonicalTicketPayload(row.ticket_payload),
    llmAnalysis: row.llm_analysis ?? {},
    azureObservation: row.azure_observation ?? {},
    clarificationNote: row.clarification_note ?? null,
    changePackageId: row.change_package_id ?? null,
    errorMessage: row.error_message ?? null,
    receivedAt: row.received_at,
    analyzedAt: row.analyzed_at ?? null,
    updatedAt: row.updated_at,
  };
}

export async function listServiceNowIntakeRequests() {
  // This remains a compatibility read while the canonical ticket table rolls
  // out. Keep enough immutable revisions to reconstruct a ticket rather than
  // letting the global queue's old 25-row cap hide its original submission.
  const { data, error } = await table().from("servicenow_intake_requests").select("id, ticket_number, service_now_sys_id, status, requested_by_user_id, normalized_request, ticket_payload, llm_analysis, azure_observation, clarification_note, change_package_id, error_message, received_at, analyzed_at, updated_at").order("updated_at", { ascending: false }).limit(500);
  if (error) throw error;
  return (data ?? []).map(map);
}

/** Read every compatibility revision for one ticket, in source order. */
export async function listServiceNowIntakeTicketHistory(ticketNumber: string) {
  const rows: Record<string, any>[] = [];
  const escaped = ticketNumber.replace(/[\\%_]/g, "\\$&");
  const pageSize = 1_000;
  for (let from = 0;; from += pageSize) {
    const { data, error } = await table().from("servicenow_intake_requests")
      .select("id, ticket_number, service_now_sys_id, status, requested_by_user_id, normalized_request, ticket_payload, llm_analysis, azure_observation, clarification_note, change_package_id, error_message, received_at, analyzed_at, updated_at")
      .ilike("ticket_number", escaped)
      .order("received_at", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const batch = (data ?? []).filter((row: Record<string, any>) => String(row.ticket_number).toLowerCase() === ticketNumber.toLowerCase());
    rows.push(...batch);
    if ((data ?? []).length < pageSize) break;
  }
  return rows.map(map);
}

export type IntakeResumeResult = { intakeRequestId: string; outcome: string; changePackageNumber?: string | null; action?: string; error?: string };

/**
 * Re-analyse tickets whose capability has since been approved.
 *
 * Called with no argument this drains the queue the approval trigger fills, so
 * the loop closes without a scheduler. Called with a ticket it re-analyses that
 * one, which is what the per-ticket Resume control is for when a request was
 * incomplete at the moment the capability landed.
 */
export async function resumeServiceNowIntake(intakeRequestId?: string): Promise<IntakeResumeResult[]> {
  const { data, error } = await supabase.functions.invoke("servicenow-intake", {
    body: intakeRequestId ? { mode: "resume", intakeRequestId } : { mode: "resume" },
  });
  if (error) {
    const response = (error as { context?: Response }).context;
    if (response && typeof response.json === "function") {
      const parsed = await response.json().catch(() => ({}));
      if (parsed && typeof parsed.error === "string" && parsed.error) throw new Error(parsed.error);
    }
    throw error;
  }
  const results = (data as { results?: unknown })?.results;
  return Array.isArray(results) ? results as IntakeResumeResult[] : [];
}

export async function submitDemoServiceNowTicket(ticket: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("servicenow-intake", { body: { mode: "demo", ticket } });
  if (error) throw error;
  return data as { requestId: string; status: string; action: string; confidence: number; readyForEngineering: boolean; changePackageNumber: string | null; comment: string };
}
