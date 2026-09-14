// Dependency-injected HTTP handler for the agentic ServiceNow intake --
// separated from index.ts so it can be unit tested the same way
// terraform-ci-remediation-agent/handler.ts is: every Supabase/GitHub/
// ServiceNow/model boundary is a named function on `Dependencies`, and
// index.ts wires the real implementations while tests wire fakes.
//
// This file owns request parsing, mode dispatch, and response shaping. It
// makes NO decisions about whether a request is safe to act on -- that
// still lives entirely in _shared/servicenow-intake-agent-core.ts and
// tools.ts, called through the injected functions below.
import type { NormalizedTicket, RecordValue } from "../_shared/servicenow-intake-agent-core.ts";
import type { AgentOutcome } from "./tools.ts";
import type { AgentRunResult } from "./agent-loop.ts";

export type ExistingRequest = { id: string; status: string; changePackageId: string | null };
export type CanonicalResult = { ticketId: string; snapshotId: string | null; inserted: boolean; workflowVersion: number; identityConflict: boolean };

export type Dependencies = {
  headers: (request: Request) => Record<string, string>;
  redact: (body: RecordValue) => RecordValue;
  verifyServiceNowWebhook: (request: Request, rawBody: string) => Promise<{ status: number; message: string } | null>;
  authenticateDemoCaller: (request: Request) => Promise<string | null>;
  authorizeResume: (request: Request) => Promise<boolean>;
  resume: (request: Request, onlyIntakeRequestId: string | null) => Promise<Response>;
  normalizeTicket: (body: RecordValue, history?: unknown[]) => NormalizedTicket;
  sha256: (value: unknown) => Promise<string>;
  findExisting: (ticketNumber: string, payloadHash: string) => Promise<ExistingRequest | null>;
  resetForReanalysis: (requestId: string) => Promise<{ error?: string }>;
  createIntakeRequest: (fields: { ticketNumber: string; sysId: string | null; sourceUpdatedAt: string | null; payloadHash: string; callerId: string | null; rawBody: RecordValue; normalized: NormalizedTicket }) => Promise<{ id: string } | { error: string }>;
  loadTicketHistory: (ticketNumber: string) => Promise<unknown[]>;
  recordCanonical: (body: RecordValue, ticket: NormalizedTicket, ticketNumber: string, sysId: string | null, callerId: string | null, payloadHash: string, demoMode: boolean) => Promise<CanonicalResult>;
  linkCanonical: (requestId: string, ticket: NormalizedTicket, canonicalTicketId: string) => Promise<void>;
  markIdentityConflict: (requestId: string, message: string) => Promise<void>;
  markCanonicalFailure: (requestId: string, message: string) => Promise<void>;
  runAgent: (opts: { ticket: NormalizedTicket; requestId: string; demoMode: boolean; callerId: string | null; userAuthorization?: string }) => Promise<AgentRunResult>;
  persistOutcome: (requestId: string, outcome: AgentOutcome, run: AgentRunResult) => Promise<void>;
  markDemoGenerated: (requestId: string, note: string) => Promise<void>;
  postComment: (ticket: NormalizedTicket, note: string) => Promise<void>;
  markCommentPosted: (requestId: string, note: string) => Promise<void>;
  markCommentFailed: (requestId: string, message: string) => Promise<void>;
  logEvent: (requestId: string, type: string, detail: RecordValue) => Promise<void>;
};

function record(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
}
function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function statusForOutcome(kind: AgentOutcome["kind"]): string {
  if (kind === "ready") return "ready_for_engineering";
  if (kind === "gap_opened") return "engineering_gap_opened";
  return "needs_clarification"; // covers "needs_clarification" and "blocked" -- both are "a human needs to look at this", same as the one-shot function's status vocabulary.
}

export function createIntakeAgentHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    const headers = { ...deps.headers(request), "content-type": "application/json", "cache-control": "no-store" };
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

    if (request.method === "OPTIONS") return new Response("ok", { headers: deps.headers(request) });
    if (request.method !== "POST") return reply({ error: "method not allowed" }, 405);

    const rawBody = await request.text();
    let body: RecordValue;
    try { body = record(JSON.parse(rawBody)); } catch { return reply({ error: "invalid json" }, 400); }
    body = deps.redact(body);
    const mode = text(body.mode).toLowerCase();

    if (mode === "resume") {
      const permitted = await deps.authorizeResume(request);
      if (!permitted) return reply({ error: "a platform administrator or the platform service may resume tickets" }, 403);
      return await deps.resume(request, text(body.intakeRequestId) || null);
    }

    const demoMode = mode === "demo";
    const callerId = demoMode ? await deps.authenticateDemoCaller(request) : null;
    if (demoMode) {
      if (!callerId) return reply({ error: "authenticated demo submission required" }, 401);
    } else {
      const authError = await deps.verifyServiceNowWebhook(request, rawBody);
      if (authError) return reply({ error: authError.message }, authError.status);
    }

    const incomingTicket = deps.normalizeTicket(body);
    if (!incomingTicket.ticketNumber) return reply({ error: "ticket number is required" }, 400);

    const payloadHash = await deps.sha256(body);
    const existing = await deps.findExisting(incomingTicket.ticketNumber, payloadHash);
    if (existing?.status === "comment_posted") {
      return reply({ duplicate: true, requestId: existing.id, status: existing.status, changePackageId: existing.changePackageId }, 200);
    }

    let requestId: string | undefined = existing?.id;
    if (requestId) {
      const { error: resetError } = await deps.resetForReanalysis(requestId);
      if (resetError) return reply({ error: resetError }, 500);
    } else {
      const created = await deps.createIntakeRequest({
        ticketNumber: incomingTicket.ticketNumber, sysId: incomingTicket.sysId, sourceUpdatedAt: incomingTicket.sourceUpdatedAt,
        payloadHash, callerId, rawBody: body, normalized: incomingTicket,
      });
      if ("error" in created) return reply({ error: created.error }, 500);
      requestId = created.id;
    }
    if (!requestId) return reply({ error: "unable to resolve intake request id" }, 500);

    const history = await deps.loadTicketHistory(incomingTicket.ticketNumber);
    const ticket = deps.normalizeTicket(body, history);

    try {
      const canonical = await deps.recordCanonical(body, ticket, incomingTicket.ticketNumber, incomingTicket.sysId, demoMode ? callerId : null, payloadHash, demoMode);
      await deps.linkCanonical(requestId, ticket, canonical.ticketId);
      await deps.logEvent(requestId, "ticket_received", { ticketNumber: ticket.ticketNumber, historySnapshots: history.length, canonicalTicketId: canonical.ticketId, canonicalSnapshotId: canonical.snapshotId, canonicalSnapshotInserted: canonical.inserted, identityConflict: canonical.identityConflict, engine: "agent" });
      if (canonical.identityConflict) {
        const message = "The incoming ServiceNow ticket number and sys_id do not match the permanent conversation identity. A human must reconcile the source record before analysis can continue.";
        await deps.markIdentityConflict(requestId, message);
        await deps.logEvent(requestId, "identity_conflict_quarantined", { canonicalTicketId: canonical.ticketId });
        return reply({ requestId, status: "identity_conflict", error: message }, 409);
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to record canonical ServiceNow history.";
      await deps.markCanonicalFailure(requestId, message);
      await deps.logEvent(requestId, "canonical_history_failed", { message });
      return reply({ requestId, error: message }, 502);
    }

    try {
      const run = await deps.runAgent({ ticket, requestId, demoMode, callerId, userAuthorization: request.headers.get("authorization") ?? undefined });
      const { outcome } = run;
      await deps.persistOutcome(requestId, outcome, run);
      await deps.logEvent(requestId, "agent_analysis_completed", { outcome: outcome.kind, turnsUsed: run.turnsUsed, action: outcome.analysis?.action ?? "unknown", confidence: outcome.analysis?.confidence ?? null, gapId: outcome.gap?.id ?? null, changePackageId: outcome.draft?.id ?? null });

      if (demoMode) {
        await deps.markDemoGenerated(requestId, outcome.note);
        await deps.logEvent(requestId, "demo_customer_comment_generated", { field: "comments", simulated: true });
        return reply({ requestId, status: "demo_comment_generated", outcome: outcome.kind, action: outcome.analysis?.action ?? "unknown", confidence: outcome.analysis?.confidence ?? null, turnsUsed: run.turnsUsed, changePackageNumber: outcome.draft?.package_number ?? null, comment: outcome.note }, 200);
      }
      await deps.postComment(ticket, outcome.note);
      await deps.markCommentPosted(requestId, outcome.note);
      await deps.logEvent(requestId, "servicenow_customer_comment_posted", { field: "comments" });
      return reply({ requestId, status: "comment_posted", outcome: outcome.kind, action: outcome.analysis?.action ?? "unknown", confidence: outcome.analysis?.confidence ?? null, turnsUsed: run.turnsUsed, changePackageNumber: outcome.draft?.package_number ?? null }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "ServiceNow intake agent processing failed.";
      await deps.markCommentFailed(requestId, message);
      await deps.logEvent(requestId, "processing_failed", { message });
      return reply({ requestId, error: message }, 502);
    }
  };
}

export { statusForOutcome };
