// The resume queue: re-analyzes tickets whose Terraform capability has since
// been approved. Kept as its own module (rather than folded into
// handler.ts's Dependencies) because it is a self-contained batch job with
// its own claim/finish lifecycle -- the main handler only needs to know
// "does this request authorize a resume, and what does calling it return."
import {
  type RecordValue, record, text, json, supabaseAdmin, normalizeTicket, addEvent,
  ticketPayloadHistory, postCustomerComment,
} from "../_shared/servicenow-intake-agent-core.ts";
import { analyzeTicketWithAgent } from "./agent-loop.ts";
import { statusForOutcome } from "./handler.ts";

export async function resumeQueued(admin: ReturnType<typeof supabaseAdmin>, request: Request, onlyIntakeRequestId: string | null) {
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
      const { data: intake } = await admin.from("servicenow_intake_requests").select("id, ticket_number, ticket_payload, ticket_id, clarification_note, change_package_id, requested_by_user_id").eq("id", intakeRequestId).maybeSingle();
      if (!intake) { await finish("skipped", "intake request no longer exists"); results.push({ intakeRequestId, outcome: "skipped" }); continue; }
      if (intake.change_package_id) { await finish("skipped", "a change package already exists"); results.push({ intakeRequestId, outcome: "already_resumed" }); continue; }
      const canonicalTicketId = text(intake.ticket_id);
      if (!canonicalTicketId) { await finish("skipped", "request has no canonical ledger ticket to resume against"); results.push({ intakeRequestId, outcome: "skipped" }); continue; }

      const ticket = normalizeTicket(record(intake.ticket_payload), await ticketPayloadHistory(admin, text(intake.ticket_number)));
      const requestedBy = text(intake.requested_by_user_id) || null;
      const run = await analyzeTicketWithAgent({ admin, ticket, requestId: intakeRequestId, canonicalTicketId, demoMode: false, callerId: requestedBy });
      const { outcome } = run;
      const status = statusForOutcome(outcome.kind);
      await admin.from("servicenow_intake_requests").update({
        status, llm_analysis: outcome.analysis ? { ...outcome.analysis, validation: outcome.validation } : null, clarification_note: outcome.note,
        change_package_id: outcome.draft?.id ?? null, analyzed_at: new Date().toISOString(), error_message: null,
        azure_observation: run.azureObservation,
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
