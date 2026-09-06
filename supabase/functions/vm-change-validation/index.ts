import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { createValidationHandler } from "./request-handler.ts";
import { record, text, type Json } from "./rules.ts";

const serverKey = () => Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? (() => { try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default; } catch { return undefined; } })();
function database() {
  const url = Deno.env.get("SUPABASE_URL"); const key = serverKey();
  if (!url || !key) throw new Error("Supabase server credentials are not configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function reply(request: Request, body: unknown, status = 200) {
  const origins = (Deno.env.get("APP_ORIGINS") ?? Deno.env.get("APP_ORIGIN") ?? "").split(",").map(value => value.trim()).filter(Boolean);
  const origin = request.headers.get("origin");
  return new Response(JSON.stringify(body), { status, headers: {
    "content-type": "application/json", "cache-control": "no-store", vary: "Origin",
    "access-control-allow-origin": origin && origins.includes(origin) ? origin : "null",
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
  } });
}

function configuredAzureUrl() {
  const value = text(Deno.env.get("AZURE_VM_OPERATIONS_URL"));
  if (!value) throw new Error("AZURE_VM_OPERATIONS_URL is not configured for server-side validation.");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error("The Azure operations endpoint must be a configured HTTPS origin.");
  return value.replace(/\/$/, "");
}

async function safeGet(url: string, authorization: string, source: string): Promise<Json> {
  const response = await fetch(url, { method: "GET", redirect: "error", cache: "no-store", headers: { authorization, accept: "application/json", "cache-control": "no-cache" }, signal: AbortSignal.timeout(45_000) });
  if (!response.ok) throw new Error(`${source} observation is unavailable (HTTP ${response.status}). No validation was recorded.`);
  try { return record(await response.json()); } catch { throw new Error(`${source} did not return a valid observation.`); }
}

Deno.serve(createValidationHandler({
  reply,
  authenticate: async request => {
    const authorization = request.headers.get("authorization") ?? "";
    if (!authorization.startsWith("Bearer ")) return null;
    const { data, error } = await database().auth.getUser(authorization.slice(7));
    return error ? null : data.user?.id ?? null;
  },
  loadPackage: async id => {
    const { data, error } = await database().from("iac_change_packages").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error("Unable to read the change package.");
    return data;
  },
  isAdministrator: async actor => {
    const { data, error } = await database().from("user_roles").select("user_id").eq("user_id", actor).eq("role", "platform_admin").maybeSingle();
    if (error) throw new Error("Unable to verify administrator access.");
    return !!data;
  },
  loadExecution: async packageId => {
    const db = database();
    const { data: apply, error } = await db.from("iac_terraform_runs").select("*").eq("package_id", packageId).eq("run_type", "apply").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error || !apply) throw new Error("No saved-plan apply evidence is available for this package.");
    const [planResult, reviewResult, targetResult] = await Promise.all([
      db.from("iac_terraform_runs").select("*").eq("id", apply.plan_run_id).single(),
      db.from("iac_change_package_reviews").select("*").eq("package_id", packageId).order("reviewed_at", { ascending: false }).limit(1).maybeSingle(),
      db.from("iac_change_package_targets").select("target_resource_id").eq("package_id", packageId).order("target_resource_id"),
    ]);
    if (planResult.error || reviewResult.error || targetResult.error) throw new Error("The approval, target, or saved-plan evidence could not be loaded.");
    return { apply, plan: planResult.data ?? {}, review: reviewResult.data ?? {}, targets: (targetResult.data ?? []).map(item => item.target_resource_id) };
  },
  remoteApply: async apply => {
    const token = text(Deno.env.get("HCP_TERRAFORM_PLAN_TOKEN"));
    if (!token) throw new Error("A read-capable HCP_TERRAFORM_PLAN_TOKEN is required to verify the saved apply.");
    if (!/^run-[a-zA-Z0-9]+$/.test(text(apply.hcp_run_id))) throw new Error("The HCP run identity is invalid.");
    return record((await safeGet(`https://app.terraform.io/api/v2/runs/${encodeURIComponent(text(apply.hcp_run_id))}`, `Bearer ${token}`, "HCP Terraform")).data);
  },
  observe: async (target, request) => {
    const match = /^\/subscriptions\/([0-9a-f-]{36})\/resourceGroups\/([\w.()_-]{1,90})\/providers\/Microsoft\.Compute\/virtualMachines\/([\w.()_-]{1,80})$/i.exec(target);
    if (!match) throw new Error("A declared target is not a supported Azure VM ARM ID.");
    const token = text(Deno.env.get("AZURE_VM_OPERATIONS_TOKEN")) || text(Deno.env.get("AZURE_CONTROL_PLANE_TOKEN"));
    const authorization = token ? `Bearer ${token}` : request.headers.get("authorization") ?? "";
    const [, subscription, group, name] = match;
    return await safeGet(`${configuredAzureUrl()}/api/v1/virtual-machines/${encodeURIComponent(subscription)}/${encodeURIComponent(group)}/${encodeURIComponent(name)}/operations`, authorization, "Azure VM");
  },
  persist: async input => {
    const { data, error } = await database().rpc("record_iac_vm_validation", {
      p_package_id: input.packageId, p_actor_id: input.actor, p_apply_run_id: input.applyId,
      p_checks: input.checks, p_observations: input.observations, p_close: input.close,
    });
    if (error) throw new Error(`Validation storage was rejected: ${error.message}`);
    return data;
  },
}));
