// Agentic rebuild of supabase/functions/servicenow-intake. Same job (turn a
// ServiceNow ticket into a change package, an engineering gap, or a
// clarification request) but the model orchestrates its own tool calls
// instead of being handed one forced JSON response. See
// docs/servicenow-intake-agent.md for the design and how to test this
// safely before pointing real ServiceNow traffic at it.
//
// Deliberately does NOT replace supabase/functions/servicenow-intake -- that
// function is untouched and keeps serving the live webhook. Point ServiceNow
// here only after the checklist in the design doc is done.
import {
  type RecordValue, record, text, json, corsHeaders, normalizeTicket, sha256, supabaseAdmin,
  authenticatedCaller, isPlatformAdmin, addEvent, ticketPayloadHistory, recordCanonicalSnapshot,
  postCustomerComment, verifyServiceNowWebhook,
} from "../_shared/servicenow-intake-agent-core.ts";
import { redactSensitiveData } from "../_shared/servicenow-change-agent.ts";
import { serviceRoleKeyCandidates } from "../_shared/platform-function.ts";
import { analyzeTicketWithAgent } from "./agent-loop.ts";

async function resumeQueued(admin: ReturnType<typeof supabaseAdmin>, request: Request, onlyIntakeRequestId: string | null) {
  let queue: Array<RecordValue>;
  if (onlyIntakeRequestId) {
    const { data, error } = await admin.from("iac_intake_resumptions").select("*").eq("intake_request_id", onlyIntakeRequestId).in("status", ["queued", "running"]).limit(1);
    if (error) return json({ error: error.message }, 500, request);
    queue = (data ?? []).length ? (data as RecordValue[]) : [{ id: null, intake_request_id: onlyIntakeRequestId }];
  } else {
    const { data, error } = await admin.rpc("claim_iac_intake_resumptions", { p_limit: 5 });
    if (error) return json({ error: error.message }, 500, request);
    queue = (Array.isArray(data) ? data : []) as RecordValue[];
  }

  const results: RecordValue[] = [];
  for (const item of queue) {
    const resumptionId = text(item.id) || null;
    const intakeRequestId = text(item.intake_request_id);
    const finish = async (status: string, error?: string) => {
      if (resumptionId) await admin.rpc("finish_iac_intake_resumption", { p_id: resumptionId, p_status: status, p_error: error ?? null });
    };
    try {
      const { data: intake } = await admin.from("servicenow_intake_requests").select("id, ticket_number, ticket_payload, clarification_note, change_package_id, requested_by_user_id").eq("id", intakeRequestId).maybeSingle();
      if (!intake) { await finish("skipped", "intake request no longer exists"); results.push({ intakeRequestId, outcome: "skipped" }); continue; }
      if (intake.change_package_id) { await finish("skipped", "a change package already exists"); results.push({ intakeRequestId, outcome: "already_resumed" }); continue; }

      const ticket = normalizeTicket(record(intake.ticket_payload), await ticketPayloadHistory(admin, text(intake.ticket_number)));
      const requestedBy = text(intake.requested_by_user_id) || null;
      const run = await analyzeTicketWithAgent({ admin, ticket, requestId: intakeRequestId, demoMode: false, callerId: requestedBy });
      const { outcome } = run;
      const status = outcome.kind === "ready" ? "ready_for_engineering" : outcome.kind === "gap_opened" ? "engineering_gap_opened" : "needs_clarification";
      await admin.from("servicenow_intake_requests").update({
        status, llm_analysis: outcome.analysis ? { ...outcome.analysis, validation: outcome.validation } : null, clarification_note: outcome.note,
        change_package_id: outcome.draft?.id ?? null, analyzed_at: new Date().toISOString(), error_message: null,
      }).eq("id", intakeRequestId);
      await addEvent(admin, intakeRequestId, "agent_intake_resumed", { outcome: outcome.kind, turnsUsed: run.turnsUsed, changePackageId: outcome.draft?.id ?? null });

      // Only speak up if the answer changed -- a resume that reaches the same
      // conclusion must not post the requester an identical comment again.
      if (outcome.note !== text(intake.clarification_note)) {
        try { await postCustomerComment(ticket, outcome.note); await addEvent(admin, intakeRequestId, "servicenow_customer_comment_posted", { field: "comments", resumed: true }); }
        catch { /* the analysis stands even when ServiceNow is unreachable */ }
      }
      await finish(outcome.draft ? "succeeded" : "failed", outcome.draft ? undefined : "resumed but still not ready for engineering");
      results.push({ intakeRequestId, outcome: outcome.draft ? "package_created" : "still_blocked", changePackageNumber: outcome.draft?.package_number ?? null, action: outcome.analysis?.action ?? "unknown", turnsUsed: run.turnsUsed });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "resume failed";
      await finish("failed", message);
      await admin.from("servicenow_intake_requests").update({ error_message: message }).eq("id", intakeRequestId);
      results.push({ intakeRequestId, outcome: "failed", error: message });
    }
  }
  return json({ processed: results.length, results }, 200, request);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405, request);

  const rawBody = await request.text();
  let body: RecordValue;
  try { body = record(JSON.parse(rawBody)); } catch { return json({ error: "invalid json" }, 400, request); }
  body = record(redactSensitiveData(body));
  const mode = text(body.mode).toLowerCase();

  if (mode === "resume") {
    const admin = supabaseAdmin();
    const authorization = request.headers.get("authorization") ?? "";
    const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    let permitted = bearer !== "" && serviceRoleKeyCandidates().includes(bearer);
    if (!permitted) {
      const actor = await authenticatedCaller(request);
      permitted = !!actor && await isPlatformAdmin(admin, actor);
    }
    if (!permitted) return json({ error: "a platform administrator or the platform service may resume tickets" }, 403, request);
    return await resumeQueued(admin, request, text(body.intakeRequestId) || null);
  }

  const demoMode = mode === "demo";
  const callerId = demoMode ? await authenticatedCaller(request) : null;
  if (demoMode) {
    if (!callerId) return json({ error: "authenticated demo submission required" }, 401, request);
  } else {
    const authError = await verifyServiceNowWebhook(request, rawBody);
    if (authError) return json({ error: authError.message }, authError.status, request);
  }
  const incomingTicket = normalizeTicket(body);
  if (!incomingTicket.ticketNumber) return json({ error: "ticket number is required" }, 400, request);
  const admin = supabaseAdmin();
  const payloadHash = await sha256(body);
  const existing = await admin.from("servicenow_intake_requests").select("id, status, change_package_id").eq("ticket_number", incomingTicket.ticketNumber).eq("payload_hash", payloadHash).maybeSingle();
  if (existing.data?.status === "comment_posted") return json({ duplicate: true, requestId: existing.data.id, status: existing.data.status, changePackageId: existing.data.change_package_id }, 200, request);

  let requestId = existing.data?.id as string | undefined;
  if (requestId) {
    const { error: resetError } = await admin.from("servicenow_intake_requests").update({ status: "analyzing", error_message: null }).eq("id", requestId);
    if (resetError) return json({ error: resetError.message }, 500, request);
  } else {
    const { data: intake, error: insertError } = await admin.from("servicenow_intake_requests").insert({ ticket_number: incomingTicket.ticketNumber, service_now_sys_id: incomingTicket.sysId, ticket_updated_at: incomingTicket.sourceUpdatedAt, payload_hash: payloadHash, status: "analyzing", requested_by_user_id: callerId, ticket_payload: body, normalized_request: incomingTicket }).select("id").single();
    if (insertError || !intake) return json({ error: insertError?.message ?? "unable to persist intake request" }, 500, request);
    requestId = intake.id as string;
  }
  if (!requestId) return json({ error: "unable to resolve intake request id" }, 500, request);
  const history = await ticketPayloadHistory(admin, incomingTicket.ticketNumber);
  const ticket = normalizeTicket(body, history);

  try {
    const canonical = await recordCanonicalSnapshot(
      admin, body, ticket, incomingTicket.ticketNumber, incomingTicket.sysId,
      demoMode ? callerId : null, payloadHash, demoMode,
    );
    const { error: canonicalLinkError } = await admin.from("servicenow_intake_requests").update({ normalized_request: ticket, ticket_id: canonical.ticketId }).eq("id", requestId);
    if (canonicalLinkError) throw new Error(`Unable to link intake revision to canonical ticket: ${canonicalLinkError.message}`);
    await addEvent(admin, requestId, "ticket_received", { ticketNumber: ticket.ticketNumber, historySnapshots: history.length, canonicalTicketId: canonical.ticketId, canonicalSnapshotId: canonical.snapshotId, canonicalSnapshotInserted: canonical.inserted, identityConflict: canonical.identityConflict, engine: "agent" });
    if (canonical.identityConflict) {
      const message = "The incoming ServiceNow ticket number and sys_id do not match the permanent conversation identity. A human must reconcile the source record before analysis can continue.";
      await admin.from("servicenow_intake_requests").update({ status: "identity_conflict", error_message: message }).eq("id", requestId);
      await addEvent(admin, requestId, "identity_conflict_quarantined", { canonicalTicketId: canonical.ticketId });
      return json({ requestId, status: "identity_conflict", error: message }, 409, request);
    }
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unable to record canonical ServiceNow history.";
    await admin.from("servicenow_intake_requests").update({ status: "comment_failed", error_message: message }).eq("id", requestId);
    await addEvent(admin, requestId, "canonical_history_failed", { message });
    return json({ requestId, error: message }, 502, request);
  }

  try {
    const run = await analyzeTicketWithAgent({
      admin, ticket, requestId, demoMode, callerId,
      userAuthorization: request.headers.get("authorization") ?? undefined,
    });
    const { outcome } = run;
    const status = outcome.kind === "ready" ? "ready_for_engineering" : outcome.kind === "gap_opened" ? "engineering_gap_opened" : "needs_clarification";
    await admin.from("servicenow_intake_requests").update({
      status, llm_analysis: outcome.analysis ? { ...outcome.analysis, validation: outcome.validation } : null,
      clarification_note: outcome.note, change_package_id: outcome.draft?.id ?? null, analyzed_at: new Date().toISOString(), error_message: null,
      azure_observation: run.azureObservation,
    }).eq("id", requestId);
    await addEvent(admin, requestId, "agent_analysis_completed", { outcome: outcome.kind, turnsUsed: run.turnsUsed, action: outcome.analysis?.action ?? "unknown", confidence: outcome.analysis?.confidence ?? null, gapId: outcome.gap?.id ?? null, changePackageId: outcome.draft?.id ?? null });

    if (demoMode) {
      await admin.from("servicenow_intake_requests").update({ status: "demo_comment_generated", clarification_note: outcome.note }).eq("id", requestId);
      await addEvent(admin, requestId, "demo_customer_comment_generated", { field: "comments", simulated: true });
      return json({ requestId, status: "demo_comment_generated", outcome: outcome.kind, action: outcome.analysis?.action ?? "unknown", confidence: outcome.analysis?.confidence ?? null, turnsUsed: run.turnsUsed, changePackageNumber: outcome.draft?.package_number ?? null, comment: outcome.note }, 200, request);
    }
    await postCustomerComment(ticket, outcome.note);
    await admin.from("servicenow_intake_requests").update({ status: "comment_posted", clarification_note: outcome.note }).eq("id", requestId);
    await addEvent(admin, requestId, "servicenow_customer_comment_posted", { field: "comments" });
    return json({ requestId, status: "comment_posted", outcome: outcome.kind, action: outcome.analysis?.action ?? "unknown", confidence: outcome.analysis?.confidence ?? null, turnsUsed: run.turnsUsed, changePackageNumber: outcome.draft?.package_number ?? null }, 200, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "ServiceNow intake agent processing failed.";
    await admin.from("servicenow_intake_requests").update({ status: "comment_failed", error_message: message }).eq("id", requestId);
    await addEvent(admin, requestId, "processing_failed", { message });
    return json({ requestId, error: message }, 502, request);
  }
});
