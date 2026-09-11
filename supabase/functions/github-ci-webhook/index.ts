import { adminClient, corsHeaders, jsonReply, obj, str, type Json } from "../_shared/platform-function.ts";
import { verifyHmacSignatureHeader } from "../_shared/webhook-auth.ts";

// Push side of CI-evidence sync: GitHub calls this whenever a workflow run
// on the repository finishes. This function does no evidence collection
// itself -- ci-evidence.ts's inspectCi (invoked via terraform-ci-status-sync)
// remains the single source of truth for what "passed" means. This is
// purely a signature-verified adapter that translates "a workflow run just
// completed" into "go re-sync the specific engineering gap(s) whose draft
// branch that run belongs to", using the service-role key server-to-server.
// A missed or duplicate delivery is harmless: re-syncing an unaffected or
// already-current gap is always a safe no-op.
//
// Configure the repository's webhook (Settings -> Webhooks) with:
//   Payload URL: this function's URL
//   Content type: application/json
//   Secret: the same value as GITHUB_WEBHOOK_SECRET
//   Events: "Workflow runs" (workflow_run) only

const REVIEWABLE_STATUSES = ["pr_opened", "ci_running", "ci_passed", "ci_failed", "ready_for_review"];

async function triggerSync(gapId: string, functionsBaseUrl: string, serviceRoleKey: string): Promise<Json> {
  const response = await fetch(`${functionsBaseUrl}/terraform-ci-status-sync`, {
    method: "POST",
    headers: { authorization: `Bearer ${serviceRoleKey}`, "content-type": "application/json" },
    body: JSON.stringify({ operation: "sync", gapId }),
  });
  const body = obj(await response.json().catch(() => ({})));
  if (!response.ok) throw new Error(`terraform-ci-status-sync returned ${response.status}: ${str(body.error) || "sync failed"}`);
  return body;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return jsonReply(request, { error: "method not allowed" }, 405);

  const secret = Deno.env.get("GITHUB_WEBHOOK_SECRET");
  if (!secret) return jsonReply(request, { error: "webhook is not configured" }, 503);

  const rawBody = await request.text();
  const signatureOk = await verifyHmacSignatureHeader(request.headers.get("x-hub-signature-256"), secret, rawBody);
  if (!signatureOk) return jsonReply(request, { error: "unauthorized" }, 401);

  const event = request.headers.get("x-github-event") ?? "";
  let payload: Json;
  try { payload = obj(JSON.parse(rawBody)); } catch { return jsonReply(request, { error: "invalid json" }, 400); }

  // Only a completed workflow_run can change any gap's CI evidence; other
  // event types (or workflow_run's own "requested"/"in_progress" actions)
  // are acknowledged but never trigger a sync.
  if (event !== "workflow_run" || str(obj(payload.workflow_run).status) !== "completed") {
    return jsonReply(request, { ignored: true, event, action: str(payload.action) }, 200);
  }
  const headBranch = str(obj(payload.workflow_run).head_branch);
  if (!headBranch.startsWith("ai-draft/")) return jsonReply(request, { ignored: true, reason: "not an AI-draft branch" }, 200);

  let db: ReturnType<typeof adminClient>;
  try { db = adminClient(); } catch { return jsonReply(request, { error: "Server configuration unavailable." }, 503); }

  const { data: gaps, error } = await db.client.from("iac_engineering_gaps")
    .select("id, status").eq("draft_branch", headBranch).in("status", REVIEWABLE_STATUSES);
  if (error) return jsonReply(request, { error: error.message }, 500);
  if (!gaps?.length) return jsonReply(request, { ignored: true, reason: "no matching in-flight gap", branch: headBranch }, 200);

  const functionsBaseUrl = `${(Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "")}/functions/v1`;
  const results: Json[] = [];
  for (const gap of gaps) {
    try { results.push({ gapId: gap.id, ...(await triggerSync(str(gap.id), functionsBaseUrl, db.key)) }); }
    catch (cause) { results.push({ gapId: gap.id, error: cause instanceof Error ? cause.message : String(cause) }); }
  }
  return jsonReply(request, { branch: headBranch, processed: results.length, results }, 200);
});
