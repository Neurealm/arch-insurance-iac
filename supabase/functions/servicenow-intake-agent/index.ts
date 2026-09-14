// Thin wiring only. All control flow lives in handler.ts (unit tested in
// handler.test.ts against fakes); this file's only job is to build the real
// Dependencies object -- actual Supabase/GitHub/ServiceNow/model calls --
// and hand it to Deno.serve. See docs/servicenow-intake-agent.md for the
// design and rollout checklist.
import {
  record, text, corsHeaders, normalizeTicket, sha256, supabaseAdmin,
  authenticatedCaller, isPlatformAdmin, addEvent, ticketPayloadHistory, recordCanonicalSnapshot,
  postCustomerComment, verifyServiceNowWebhook,
} from "../_shared/servicenow-intake-agent-core.ts";
import { redactSensitiveData } from "../_shared/servicenow-change-agent.ts";
import { serviceRoleKeyCandidates } from "../_shared/platform-function.ts";
import { analyzeTicketWithAgent } from "./agent-loop.ts";
import { createIntakeAgentHandler, statusForOutcome, type Dependencies } from "./handler.ts";
import { resumeQueued } from "./resume.ts";

const deps: Dependencies = {
  headers: (request) => corsHeaders(request),
  redact: (body) => record(redactSensitiveData(body)),

  verifyServiceNowWebhook,
  authenticateDemoCaller: authenticatedCaller,

  authorizeResume: async (request) => {
    const admin = supabaseAdmin();
    const authorization = request.headers.get("authorization") ?? "";
    const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (bearer !== "" && serviceRoleKeyCandidates().includes(bearer)) return true;
    const actor = await authenticatedCaller(request);
    return !!actor && await isPlatformAdmin(admin, actor);
  },
  resume: (request, onlyIntakeRequestId) => resumeQueued(supabaseAdmin(), request, onlyIntakeRequestId),

  normalizeTicket,
  sha256,

  findExisting: async (ticketNumber, payloadHash) => {
    const admin = supabaseAdmin();
    const { data } = await admin.from("servicenow_intake_requests").select("id, status, change_package_id").eq("ticket_number", ticketNumber).eq("payload_hash", payloadHash).maybeSingle();
    if (!data) return null;
    return { id: text(data.id), status: text(data.status), changePackageId: text(data.change_package_id) || null };
  },

  resetForReanalysis: async (requestId) => {
    const admin = supabaseAdmin();
    const { error } = await admin.from("servicenow_intake_requests").update({ status: "analyzing", error_message: null }).eq("id", requestId);
    return error ? { error: error.message } : {};
  },

  createIntakeRequest: async (fields) => {
    const admin = supabaseAdmin();
    const { data, error } = await admin.from("servicenow_intake_requests").insert({
      ticket_number: fields.ticketNumber, service_now_sys_id: fields.sysId, ticket_updated_at: fields.sourceUpdatedAt,
      payload_hash: fields.payloadHash, status: "analyzing", requested_by_user_id: fields.callerId,
      ticket_payload: fields.rawBody, normalized_request: fields.normalized,
    }).select("id").single();
    if (error || !data) return { error: error?.message ?? "unable to persist intake request" };
    return { id: data.id as string };
  },

  loadTicketHistory: (ticketNumber) => ticketPayloadHistory(supabaseAdmin(), ticketNumber),

  recordCanonical: (body, ticket, ticketNumber, sysId, callerId, payloadHash, demoMode) =>
    recordCanonicalSnapshot(supabaseAdmin(), body, ticket, ticketNumber, sysId, callerId, payloadHash, demoMode),

  linkCanonical: async (requestId, ticket, canonicalTicketId) => {
    const admin = supabaseAdmin();
    const { error } = await admin.from("servicenow_intake_requests").update({ normalized_request: ticket, ticket_id: canonicalTicketId }).eq("id", requestId);
    if (error) throw new Error(`Unable to link intake revision to canonical ticket: ${error.message}`);
  },

  markIdentityConflict: async (requestId, message) => {
    await supabaseAdmin().from("servicenow_intake_requests").update({ status: "identity_conflict", error_message: message }).eq("id", requestId);
  },
  markCanonicalFailure: async (requestId, message) => {
    await supabaseAdmin().from("servicenow_intake_requests").update({ status: "comment_failed", error_message: message }).eq("id", requestId);
  },

  runAgent: (opts) => analyzeTicketWithAgent({ admin: supabaseAdmin(), ...opts }),

  persistOutcome: async (requestId, outcome, run) => {
    const admin = supabaseAdmin();
    await admin.from("servicenow_intake_requests").update({
      status: statusForOutcome(outcome.kind),
      llm_analysis: outcome.analysis ? { ...outcome.analysis, validation: outcome.validation } : null,
      clarification_note: outcome.note, change_package_id: outcome.draft?.id ?? null,
      analyzed_at: new Date().toISOString(), error_message: null, azure_observation: run.azureObservation,
    }).eq("id", requestId);
  },

  markDemoGenerated: async (requestId, note) => {
    await supabaseAdmin().from("servicenow_intake_requests").update({ status: "demo_comment_generated", clarification_note: note }).eq("id", requestId);
  },
  postComment: postCustomerComment,
  markCommentPosted: async (requestId, note) => {
    await supabaseAdmin().from("servicenow_intake_requests").update({ status: "comment_posted", clarification_note: note }).eq("id", requestId);
  },
  markCommentFailed: async (requestId, message) => {
    await supabaseAdmin().from("servicenow_intake_requests").update({ status: "comment_failed", error_message: message }).eq("id", requestId);
  },

  logEvent: (requestId, type, detail) => addEvent(supabaseAdmin(), requestId, type, detail),
};

Deno.serve(createIntakeAgentHandler(deps));
