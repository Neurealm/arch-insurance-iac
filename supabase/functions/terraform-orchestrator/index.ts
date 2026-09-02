import { createClient } from "npm:@supabase/supabase-js@2.112.4";

type Json = Record<string, unknown>;
const VM_TYPE = "Microsoft.Compute/virtualMachines";
const ACTIONS: Record<string, string> = { start_vm: "start", stop_vm: "powerOff", restart_vm: "restart" };

const record = (value: unknown): Json => value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const list = (value: unknown) => Array.isArray(value) ? value : [];

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? (() => {
    try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default; } catch { return undefined; }
  })();
  if (!url || !key) throw new Error("Supabase server credentials are not configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function cors(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = (Deno.env.get("APP_ORIGINS") ?? Deno.env.get("APP_ORIGIN") ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const accepted = origin && allowed.includes(origin) ? origin : allowed[0] ?? "null";
  return { "access-control-allow-origin": accepted, "access-control-allow-headers": "authorization, apikey, content-type, x-runner-callback-secret", "access-control-allow-methods": "POST, OPTIONS", vary: "Origin" };
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(request), "content-type": "application/json", "cache-control": "no-store" } });
}

async function caller(request: Request, admin: ReturnType<typeof adminClient>) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return null;
  const { data, error } = await admin.auth.getUser(authorization.slice(7));
  return error ? null : data.user ?? null;
}

async function platformAdmin(admin: ReturnType<typeof adminClient>, userId: string) {
  const { data } = await admin.from("user_roles").select("user_id").eq("user_id", userId).eq("role", "platform_admin").maybeSingle();
  return !!data;
}

function environmentOf(pkg: Json) {
  const parameters = record(pkg.parameters);
  const state = record(pkg.current_state);
  const vm = record(state.vm);
  const tags = record(vm.tags);
  return (text(parameters.environment) || text(tags.environment) || text(tags.Environment) || "development").toLowerCase();
}

function resolvedInputs(pkg: Json, capability: Json) {
  const actionType = text(pkg.action_type);
  const parameters = record(pkg.parameters);
  const inputs: Json = {
    target_resource_id: text(pkg.target_resource_id),
    change_request_id: text(parameters.serviceNowTicket) || text(pkg.package_number),
  };
  if (ACTIONS[actionType]) inputs.action = ACTIONS[actionType];
  if (actionType === "resize_vm") {
    const requested = text(parameters.requestedVmSize);
    if (!/^Standard_[A-Za-z0-9_]+$/.test(requested)) throw new Error("A valid requested VM size is required.");
    inputs.requested_vm_size = requested;
  }
  const required = list(record(capability.input_schema).required).map(text);
  const missing = required.filter((key) => inputs[key] === undefined || inputs[key] === "");
  if (missing.length) throw new Error(`Required Terraform inputs are missing: ${missing.join(", ")}.`);
  return inputs;
}

async function packageAndCapability(admin: ReturnType<typeof adminClient>, packageId: string) {
  const { data: pkg, error } = await admin.from("iac_change_packages").select("*").eq("id", packageId).maybeSingle();
  if (error || !pkg) throw new Error("Change package was not found.");
  const { data: capability } = await admin.from("iac_automation_capabilities").select("*")
    .eq("provider", "azure").eq("resource_type", VM_TYPE).eq("action_type", pkg.action_type)
    .eq("lifecycle_status", "approved").maybeSingle();
  if (!capability) throw new Error(`No approved Terraform capability exists for ${pkg.action_type}.`);
  const environment = environmentOf(pkg);
  if (!(capability.allowed_environments ?? []).map((x: string) => x.toLowerCase()).includes(environment)) {
    throw new Error(`${capability.display_name} ${capability.module_version} is not approved for ${environment}.`);
  }
  return { pkg: pkg as Json, capability: capability as Json, inputs: resolvedInputs(pkg, capability), environment };
}

async function bind(admin: ReturnType<typeof adminClient>, actor: string, pkg: Json, capability: Json, inputs: Json) {
  const packageId = text(pkg.id);
  const { data: existing } = await admin.from("iac_package_automation_bindings").select("*").eq("package_id", packageId).maybeSingle();
  if (existing) {
    if (existing.capability_id !== capability.id || JSON.stringify(existing.resolved_inputs) !== JSON.stringify(inputs)) {
      throw new Error("The submitted package is already bound to different Terraform inputs.");
    }
    return existing;
  }
  const { data, error } = await admin.from("iac_package_automation_bindings").insert({
    package_id: packageId, capability_id: capability.id, module_source: capability.module_source,
    module_version: capability.module_version, resolved_inputs: inputs, resolved_by: actor,
  }).select("*").single();
  if (error) throw error;
  return data;
}

async function event(admin: ReturnType<typeof adminClient>, runId: string, eventType: string, detail: Json = {}) {
  await admin.from("iac_terraform_run_events").insert({ run_id: runId, event_type: eventType, detail });
}

async function enqueue(admin: ReturnType<typeof adminClient>, run: Json, payload: Json) {
  const runnerUrl = (Deno.env.get("TERRAFORM_RUNNER_URL") ?? "").replace(/\/$/, "");
  const token = Deno.env.get("TERRAFORM_RUNNER_TOKEN");
  const callbackSecret = Deno.env.get("TERRAFORM_RUNNER_CALLBACK_SECRET");
  const callbackUrl = Deno.env.get("TERRAFORM_CALLBACK_URL");
  if (!runnerUrl || !token || !callbackSecret || !callbackUrl) throw new Error("The Azure Terraform runner is not configured.");
  const response = await fetch(`${runnerUrl}/v1/jobs`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "idempotency-key": text(run.runner_correlation_id) },
    body: JSON.stringify({ ...payload, runId: run.id, correlationId: run.runner_correlation_id, callbackUrl, callbackSecret }),
  });
  if (!response.ok) throw new Error(`Terraform runner rejected the job with status ${response.status}.`);
  await admin.from("iac_terraform_runs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", run.id).eq("status", "queued");
  await event(admin, text(run.id), "runner_job_accepted", { status: response.status });
}

async function createPlan(request: Request, admin: ReturnType<typeof adminClient>, actor: string, packageId: string) {
  const { pkg, capability, inputs, environment } = await packageAndCapability(admin, packageId);
  if (pkg.status !== "submitted") throw new Error("Only a submitted package can be planned.");
  const binding = await bind(admin, actor, pkg, capability, inputs);
  const correlation = `tf-plan:${packageId}:${crypto.randomUUID()}`;
  const { data: run, error } = await admin.from("iac_terraform_runs").insert({
    package_id: packageId, capability_id: capability.id, run_type: "plan", status: "queued", requested_by: actor,
    module_source: binding.module_source, module_version: binding.module_version, resolved_inputs: inputs, runner_correlation_id: correlation,
  }).select("*").single();
  if (error) throw error;
  try {
    await enqueue(admin, run, { operation: "plan", packageId, moduleSource: binding.module_source, moduleVersion: binding.module_version, inputs, environment });
  } catch (cause) {
    await admin.from("iac_terraform_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_message: cause instanceof Error ? cause.message : "Runner enqueue failed." }).eq("id", run.id);
    throw cause;
  }
  return json(request, { runId: run.id, status: "running" }, 202);
}

async function createApply(request: Request, admin: ReturnType<typeof adminClient>, actor: string, packageId: string) {
  const { pkg, capability, inputs, environment } = await packageAndCapability(admin, packageId);
  if (pkg.status !== "approved") throw new Error("Only an approved package can be applied.");
  if (pkg.created_by !== actor && !await platformAdmin(admin, actor)) throw new Error("The caller is not authorized to execute this package.");
  const { data: plan } = await admin.from("iac_terraform_runs").select("*").eq("package_id", packageId)
    .eq("run_type", "plan").eq("status", "succeeded").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!plan || plan.capability_id !== capability.id || plan.has_destroy || plan.has_replace || plan.reconciliation?.matched !== true) {
    throw new Error("A clean, request-matched Terraform plan is required.");
  }
  const correlation = `tf-apply:${packageId}:${plan.id}`;
  const { data: run, error } = await admin.from("iac_terraform_runs").insert({
    package_id: packageId, capability_id: capability.id, run_type: "apply", status: "queued", requested_by: actor,
    plan_run_id: plan.id, module_source: plan.module_source, module_version: plan.module_version,
    resolved_inputs: inputs, runner_correlation_id: correlation, artifact_uri: plan.artifact_uri, plan_sha256: plan.plan_sha256,
  }).select("*").single();
  if (error) throw error;
  const { data: claimed } = await admin.from("iac_change_packages").update({ status: "executing", execution_started_at: new Date().toISOString(), executed_by: actor })
    .eq("id", packageId).eq("status", "approved").select("id").maybeSingle();
  if (!claimed) throw new Error("The package was already claimed for execution.");
  try {
    await enqueue(admin, run, { operation: "apply", packageId, planRunId: plan.id, artifactUri: plan.artifact_uri, planSha256: plan.plan_sha256, moduleSource: plan.module_source, moduleVersion: plan.module_version, inputs, environment });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Runner enqueue failed.";
    await admin.from("iac_terraform_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_message: message }).eq("id", run.id);
    await admin.from("iac_change_packages").update({ status: "execution_failed", execution_completed_at: new Date().toISOString(), execution_message: message }).eq("id", packageId).eq("status", "executing");
    throw cause;
  }
  return json(request, { runId: run.id, status: "running" }, 202);
}

async function callback(request: Request, admin: ReturnType<typeof adminClient>, body: Json) {
  const expected = Deno.env.get("TERRAFORM_RUNNER_CALLBACK_SECRET");
  if (!expected || request.headers.get("x-runner-callback-secret") !== expected) return json(request, { error: "unauthorized" }, 401);
  const runId = text(body.runId);
  const { data: run } = await admin.from("iac_terraform_runs").select("*").eq("id", runId).eq("status", "running").maybeSingle();
  if (!run) return json(request, { error: "active run not found" }, 404);
  const success = body.success === true;
  const changes = list(body.changes).map(record);
  const hasDestroy = changes.some((change) => list(change.actions).map(text).includes("delete"));
  const hasReplace = changes.some((change) => {
    const actions = list(change.actions).map(text); return actions.includes("delete") && actions.includes("create");
  });
  const target = text(run.resolved_inputs?.target_resource_id).toLowerCase();
  const affected = [...new Set(list(body.affectedResourceIds).map(text).filter(Boolean).map((x) => x.toLowerCase()))];
  const matched = affected.length === 1 && affected[0] === target && !hasDestroy && !hasReplace;
  const digest = text(body.planSha256).toLowerCase();
  const artifact = text(body.artifactUri);
  const validPlanArtifact = run.run_type !== "plan" || (/^[0-9a-f]{64}$/.test(digest) && artifact.startsWith("https://"));
  const status = success && matched && validPlanArtifact ? "succeeded" : success ? "blocked" : "failed";
  const errorMessage = status === "blocked" ? "Terraform output did not match the approved request boundary." : success ? null : text(body.error) || "Terraform runner failed.";
  await admin.from("iac_terraform_runs").update({
    status, completed_at: new Date().toISOString(), artifact_uri: artifact || run.artifact_uri,
    plan_sha256: digest || run.plan_sha256, plan_summary: record(body.summary),
    reconciliation: { matched, expectedTarget: target, affectedResourceIds: affected }, has_destroy: hasDestroy,
    has_replace: hasReplace, error_message: errorMessage,
  }).eq("id", runId).eq("status", "running");
  await event(admin, runId, "runner_completed", { status, matched, hasDestroy, hasReplace });
  if (run.run_type === "apply") {
    await admin.from("iac_change_packages").update({
      status: status === "succeeded" ? "executed" : "execution_failed",
      execution_completed_at: new Date().toISOString(),
      execution_message: status === "succeeded" ? "The exact approved Terraform plan was applied." : errorMessage,
    }).eq("id", run.package_id).eq("status", "executing");
  }
  return json(request, { accepted: true });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return json(request, { error: "method not allowed" }, 405);
  let body: Json;
  try { body = record(await request.json()); } catch { return json(request, { error: "invalid json" }, 400); }
  const admin = adminClient();
  if (text(body.operation) === "callback") return callback(request, admin, body);
  const user = await caller(request, admin);
  if (!user) return json(request, { error: "authentication required" }, 401);
  const packageId = text(body.packageId);
  if (!/^[0-9a-f-]{36}$/i.test(packageId)) return json(request, { error: "valid packageId required" }, 400);
  try {
    if (body.operation === "resolve") {
      const resolved = await packageAndCapability(admin, packageId);
      const binding = await bind(admin, user.id, resolved.pkg, resolved.capability, resolved.inputs);
      return json(request, { capability: resolved.capability, binding, environment: resolved.environment });
    }
    if (body.operation === "plan") return await createPlan(request, admin, user.id, packageId);
    if (body.operation === "apply") return await createApply(request, admin, user.id, packageId);
    return json(request, { error: "unsupported operation" }, 400);
  } catch (cause) {
    return json(request, { error: cause instanceof Error ? cause.message : "Terraform orchestration failed." }, 409);
  }
});
