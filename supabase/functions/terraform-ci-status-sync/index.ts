import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { githubGet, obj, str } from "../_shared/github.ts";
import { createCiHandler } from "./handler.ts";
import type { GapRecord } from "./handler.ts";

function admin() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? (() => { try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default; } catch { return undefined; } })();
  if (!url || !key) throw new Error("Supabase server credentials are not configured.");
  return { client: createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }), key };
}
function cors(request: Request) {
  const origin = request.headers.get("origin");
  const origins = (Deno.env.get("APP_ORIGINS") ?? Deno.env.get("APP_ORIGIN") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return { "access-control-allow-origin": origin && origins.includes(origin) ? origin : origins[0] ?? "null", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS", vary: "Origin" };
}
const COLUMNS = "id,status,requested_by,ci_version,ci_head_sha,ci_capability_snapshot,draft_pr_number,draft_branch,linked_capability_id,iac_automation_capabilities!linked_capability_id(*)";
function gapRecord(value: unknown): GapRecord {
  const row = obj(value);
  const capability = obj(row.iac_automation_capabilities);
  const keys = ["provider", "resource_type", "action_type", "module_source", "module_version", "input_schema", "execution_mode", "allowed_environments", "requires_managed_resource", "max_targets_per_run"];
  return { id: str(row.id), status: str(row.status), requested_by: str(row.requested_by) || null, ci_version: Number(row.ci_version), ci_head_sha: str(row.ci_head_sha) || null, draft_pr_number: Number(row.draft_pr_number), draft_branch: str(row.draft_branch), module_source: str(capability.module_source), capabilityId: str(row.linked_capability_id), capabilitySnapshot: Object.fromEntries(keys.map((key) => [key, capability[key]])), reviewedCapabilitySnapshot: obj(row.ci_capability_snapshot) };
}

Deno.serve(async (request) => {
  // Initialize lazily so startup does not log or throw credentials. The normal
  // handler still answers preflight and enforces all caller authorization.
  let db: ReturnType<typeof admin>;
  try { db = admin(); } catch { return new Response(JSON.stringify({ error: "Server configuration unavailable." }), { status: 503, headers: { ...cors(request), "content-type": "application/json", "cache-control": "no-store" } }); }
  return createCiHandler({
    headers: cors,
    authenticate: async (req) => {
      const auth = req.headers.get("authorization") ?? "";
      if (!auth.startsWith("Bearer ")) return null;
      const token = auth.slice(7);
      if (token === db.key) return { kind: "service" };
      const { data, error } = await db.client.auth.getUser(token);
      if (error || !data.user) return null;
      const role = await db.client.from("user_roles").select("user_id").eq("user_id", data.user.id).eq("role", "platform_admin").maybeSingle();
      if (role.error) throw role.error;
      return { kind: "human", id: data.user.id, isAdmin: !!role.data };
    },
    getGap: async (id) => {
      const { data, error } = await db.client.from("iac_engineering_gaps").select(COLUMNS).eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? gapRecord(data) : null;
    },
    pendingGaps: async () => {
      const { data, error } = await db.client.from("iac_engineering_gaps").select(COLUMNS).in("status", ["pr_opened", "ci_running", "ci_passed", "ci_failed", "ready_for_review"]).not("draft_pr_number", "is", null).order("updated_at", { ascending: true }).limit(10);
      if (error) throw error;
      return (data ?? []).map(gapRecord);
    },
    githubGet: (path) => {
      // Same read-only helper/token as the resolver. Requires GitHub Contents,
      // Pull requests and Actions READ permissions, never a draft/write token.
      const token = str(Deno.env.get("GITHUB_TERRAFORM_SOURCE_TOKEN"));
      if (!token) throw new Error("Read-only GitHub source token is not configured.");
      return githubGet(path, token, "Cannot verify GitHub evidence");
    },
    record: async (gap, evidence) => {
      const { data, error } = await db.client.rpc("record_iac_capability_ci", { p_gap_id: gap.id, p_expected_version: gap.ci_version, p_evidence: evidence });
      if (error) throw error;
      return { ci_version: Number(obj(data).ci_version) };
    },
    approve: async (gap, version, head, actorId, comment) => {
      const { data, error } = await db.client.rpc("approve_iac_capability", { p_gap_id: gap.id, p_expected_version: version, p_head_sha: head, p_actor_id: actorId, p_comment: comment });
      if (error) throw error;
      return data;
    },
  })(request);
});
