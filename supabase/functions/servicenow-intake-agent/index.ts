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

  authenticateAdmin: async (request) => {
    const admin = supabaseAdmin();
    const actor = await authenticatedCaller(request);
    if (!actor) return null;
    const isAdmin = await isPlatformAdmin(admin, actor);
    return isAdmin ? actor : null;
  },

  authorizeResume: async (request) => {
    const admin = supabaseAdmin();
    const authorization = request.headers.get("authorization") ?? "";
    const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (bearer !== "" && serviceRoleKeyCandidates().includes(bearer)) return true;
    const actor = await authenticatedCaller(request);
    return !!actor && await isPlatformAdmin(admin, actor);
  },
  resume: (request, onlyIntakeRequestId) => resumeQueued(supabaseAdmin(), request, onlyIntakeRequestId),

  rejectProposal: async (request, proposalId, reason, _adminId) => {
    const admin = supabaseAdmin();
    const headers = { ...corsHeaders(request), "content-type": "application/json", "cache-control": "no-store" };
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

    // Load proposal + intake request in one join
    const { data: proposal, error: fetchErr } = await admin
      .from("iac_proposed_actions")
      .select("*, servicenow_intake_requests(ticket_number, ticket_payload)")
      .eq("id", proposalId)
      .maybeSingle();

    if (fetchErr) return reply({ error: fetchErr.message }, 500);
    if (!proposal) return reply({ error: "proposal not found" }, 404);
    if (text(proposal.status) !== "pending") return reply({ error: `proposal already reviewed (status: ${proposal.status})` }, 409);

    // Mark rejected in DB
    const { error: updateErr } = await admin
      .from("iac_proposed_actions")
      .update({ status: "rejected", rejection_reason: reason, reviewed_at: new Date().toISOString() })
      .eq("id", proposalId)
      .eq("status", "pending"); // optimistic lock: bail if another admin just reviewed it

    if (updateErr) return reply({ error: updateErr.message }, 500);

    // Update the originating intake request status so the ticket is fully settled
    if (proposal.intake_request_id) {
      await admin.from("servicenow_intake_requests")
        .update({ status: "comment_failed", error_message: null, clarification_note: null })
        .eq("id", proposal.intake_request_id)
        // Only reset if still in action_proposed / comment states; don't overwrite a
        // request that has since been re-submitted and reached a different terminal state.
        .in("status", ["action_proposed", "comment_posted"]);
    }

    // Post rejection comment to ServiceNow
    const intakeRow = record(proposal.servicenow_intake_requests);
    const ticketNumber = text(intakeRow.ticket_number) || text(proposal.ticket_number);
    const ticketPayload = record(intakeRow.ticket_payload);
    const ticket = normalizeTicket(ticketPayload);
    if (!ticket.ticketNumber && ticketNumber) ticket.ticketNumber = ticketNumber;

    const rejectionNote = [
      "[NeuGAIN Infrastructure Intake] Request reviewed – action type not approved",
      "",
      `Thank you for your ServiceNow ticket ${ticketNumber}.`,
      "",
      `After reviewing your request for a new infrastructure action type (${text(proposal.display_name)}), the Cloud Platform Engineering team has determined it cannot be added to the platform at this time.`,
      "",
      `Reason: ${reason}`,
      "",
      "If you believe this decision should be reconsidered, or if you have a different request we can assist with, please open a new ticket or contact the Cloud Platform Engineering team directly.",
    ].join("\n");

    let commentPosted = false;
    try {
      await postCustomerComment(ticket, rejectionNote);
      commentPosted = true;
      if (proposal.intake_request_id) {
        await admin.from("servicenow_intake_requests")
          .update({ status: "comment_posted", clarification_note: rejectionNote })
          .eq("id", proposal.intake_request_id);
      }
      await addEvent(admin, proposal.intake_request_id ?? proposalId, "proposal_rejection_comment_posted", { proposalId, ticketNumber });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "ServiceNow comment failed";
      await addEvent(admin, proposal.intake_request_id ?? proposalId, "proposal_rejection_comment_failed", { proposalId, ticketNumber, message });
      // The rejection is still recorded; just the ServiceNow comment failed.
      return reply({ rejected: true, proposalId, commentPosted: false, commentError: message }, 200);
    }

    return reply({ rejected: true, proposalId, commentPosted }, 200);
  },

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
