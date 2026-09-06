import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { fetchFileBytes, fetchTree, filesUnder, resolveRevision } from "../_shared/github.ts";

type Json = Record<string, unknown>;
const VM_TYPE = "Microsoft.Compute/virtualMachines";
const HCP_API = "https://app.terraform.io/api/v2";
const HCP_ORGANIZATION = "Arch-Neugain";
const REPOSITORY = "Neurealm/arch-insurance-iac";
const PLAN_SUCCESS = new Set(["planned", "planned_and_finished", "planned_and_saved"]);
const FAILURE = new Set(["errored", "canceled", "force_canceled", "discarded", "policy_soft_failed", "policy_override"]);

const obj = (value: unknown): Json => value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
const str = (value: unknown) => typeof value === "string" ? value.trim() : "";
const arr = (value: unknown) => Array.isArray(value) ? value : [];
const iso = () => new Date().toISOString();
// Postgres jsonb does not preserve object key insertion order, so a value
// round-tripped through the database rarely JSON.stringify-matches a freshly
// built object with the same fields; sort keys before comparing.
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value as Json).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Json)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function admin() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? (() => { try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default; } catch { return undefined; } })();
  if (!url || !key) throw new Error("Supabase server credentials are not configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
function cors(request: Request) {
  const origin = request.headers.get("origin");
  const origins = (Deno.env.get("APP_ORIGINS") ?? Deno.env.get("APP_ORIGIN") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return { "access-control-allow-origin": origin && origins.includes(origin) ? origin : origins[0] ?? "null", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS", vary: "Origin" };
}
function reply(request: Request, body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...cors(request), "content-type": "application/json", "cache-control": "no-store" } }); }
async function user(request: Request, db: ReturnType<typeof admin>) {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const { data, error } = await db.auth.getUser(auth.slice(7));
  return error ? null : data.user;
}
async function isAdmin(db: ReturnType<typeof admin>, id: string) { return !!(await db.from("user_roles").select("user_id").eq("user_id", id).eq("role", "platform_admin").maybeSingle()).data; }
async function addEvent(db: ReturnType<typeof admin>, id: string, type: string, detail: Json = {}) { await db.from("iac_terraform_run_events").insert({ run_id: id, event_type: type, detail }); }

function environment(pkg: Json) {
  const parameters = obj(pkg.parameters); const vm = obj(obj(pkg.current_state).vm); const tags = obj(vm.tags);
  return (str(parameters.environment) || str(tags.environment) || str(tags.Environment) || "development").toLowerCase();
}
function workspace(env: string) {
  const key = env === "development" ? "DEVELOPMENT" : ["pre-production", "preproduction"].includes(env) ? "PREPRODUCTION" : "";
  const id = key ? str(Deno.env.get(`HCP_TERRAFORM_${key}_WORKSPACE_ID`)) : "";
  const name = key ? str(Deno.env.get(`HCP_TERRAFORM_${key}_WORKSPACE_NAME`)) : "";
  if (!id || !name) throw new Error(`No configured HCP Terraform workspace is approved for ${env}.`);
  return { id, name };
}
function dotpath(source: Json, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => obj(value)[key], source);
}
/**
 * Computes Terraform inputs entirely from the capability's own
 * input_schema.fields (see the typed shape documented in migration
 * 20260906050000): each field declares where its value comes from
 * ("target", "package_number_or_ticket", or "parameters.<dotpath>") and how
 * to validate it. Adding a new approved capability with the right schema
 * makes it usable without any code change here.
 */
function inputsFor(pkg: Json, capability: Json, targetResourceId: string) {
  const schema = obj(capability.input_schema);
  const inputs: Json = {};
  if (typeof schema.action === "string") inputs.action = schema.action;
  for (const rawField of arr(schema.fields)) {
    const field = obj(rawField);
    const key = str(field.key);
    if (!key) continue;
    let value: unknown;
    if (field.source === "target") value = targetResourceId;
    else if (field.source === "package_number_or_ticket") value = str(obj(pkg.parameters).serviceNowTicket) || str(pkg.package_number);
    else if (typeof field.source === "string" && field.source.startsWith("parameters.")) value = dotpath(obj(pkg.parameters), field.source.slice("parameters.".length));
    if (field.required && (value === undefined || value === null || value === "")) throw new Error(`Required Terraform input "${key}" could not be resolved.`);
    if (typeof value === "string") {
      if (typeof field.pattern === "string" && !new RegExp(field.pattern).test(value)) throw new Error(`Terraform input "${key}" failed validation.`);
      if (typeof field.minLength === "number" && value.length < field.minLength) throw new Error(`Terraform input "${key}" is too short.`);
    }
    if (value !== undefined) inputs[key] = value;
  }
  return inputs;
}
async function packageCapability(db: ReturnType<typeof admin>, packageId: string) {
  const { data: pkg, error } = await db.from("iac_change_packages").select("*").eq("id", packageId).maybeSingle();
  if (error || !pkg) throw new Error("Change package was not found.");
  const { data: capability } = await db.from("iac_automation_capabilities").select("*").eq("provider", "azure").eq("resource_type", VM_TYPE).eq("action_type", pkg.action_type).eq("lifecycle_status", "approved").maybeSingle();
  if (!capability) throw new Error(`No approved Terraform capability exists for ${pkg.action_type}.`);
  const env = environment(pkg as Json);
  if (!(capability.allowed_environments ?? []).map((value: string) => value.toLowerCase()).includes(env)) throw new Error(`${capability.display_name} is not approved for ${env}.`);
  return { pkg: pkg as Json, capability: capability as Json, inputs: inputsFor(pkg as Json, capability as Json, str(pkg.target_resource_id)), env };
}
async function bind(db: ReturnType<typeof admin>, actor: string, pkg: Json, capability: Json, inputs: Json) {
  const { data: old } = await db.from("iac_package_automation_bindings").select("*").eq("package_id", pkg.id).maybeSingle();
  if (old) { if (old.capability_id !== capability.id || stableStringify(old.resolved_inputs) !== stableStringify(inputs)) throw new Error("The package is already bound to different Terraform inputs."); return old; }
  const { data, error } = await db.from("iac_package_automation_bindings").insert({ package_id: pkg.id, capability_id: capability.id, module_source: capability.module_source, module_version: capability.module_version, resolved_inputs: inputs, resolved_by: actor }).select("*").single();
  if (error) throw error; return data;
}

function token(kind: "plan" | "apply") { const value = str(Deno.env.get(kind === "apply" ? "HCP_TERRAFORM_APPLY_TOKEN" : "HCP_TERRAFORM_PLAN_TOKEN")); if (!value) throw new Error(`HCP_TERRAFORM_${kind.toUpperCase()}_TOKEN is not configured.`); return value; }
async function hcp(path: string, tokenValue: string, init: RequestInit = {}) {
  const response = await fetch(`${HCP_API}${path}`, { ...init, headers: { accept: "application/vnd.api+json", authorization: `Bearer ${tokenValue}`, ...(init.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) { const error = obj(arr(obj(body).errors)[0]); throw new Error((str(error.detail) || str(error.title) || `HCP Terraform returned ${response.status}.`).slice(0, 500)); }
  return body;
}
async function digest(value: ArrayBuffer | Uint8Array | string) { const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value; return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
function put(target: Uint8Array, offset: number, length: number, value: string) { target.set(new TextEncoder().encode(value).slice(0, length), offset); }
function octal(target: Uint8Array, offset: number, length: number, value: number) { put(target, offset, length, value.toString(8).padStart(length - 1, "0").slice(-(length - 1)) + "\0"); }
function tarPart(path: string, content: Uint8Array) {
  if (!/^[A-Za-z0-9._/-]{1,100}$/.test(path) || path.includes("..")) throw new Error("Unsafe Terraform bundle path.");
  const head = new Uint8Array(512); put(head, 0, 100, path); octal(head, 100, 8, 0o644); octal(head, 108, 8, 0); octal(head, 116, 8, 0); octal(head, 124, 12, content.byteLength); octal(head, 136, 12, 0); head.fill(32, 148, 156); head[156] = 48; put(head, 257, 6, "ustar\0"); put(head, 263, 2, "00"); put(head, 148, 8, head.reduce((sum, byte) => sum + byte, 0).toString(8).padStart(6, "0") + "\0 ");
  return [head, content, new Uint8Array((512 - content.byteLength % 512) % 512)];
}
async function archive(files: Array<{ path: string; content: Uint8Array }>) {
  const parts = [...files.sort((a, b) => a.path.localeCompare(b.path)).flatMap((file) => tarPart(file.path, file.content)), new Uint8Array(1024)];
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.byteLength, 0)); let offset = 0; for (const part of parts) { result.set(part, offset); offset += part.byteLength; }
  return new Uint8Array(await new Response(new Blob([result]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
}
/** Root + module GitHub paths for a capability, derived from its own module_source column instead of a hardcoded action switch. */
function sourcePaths(capability: Json) {
  const moduleSource = str(capability.module_source);
  if (!/^terraform\/modules\/[a-z0-9_-]+$/.test(moduleSource)) throw new Error(`Capability "${str(capability.display_name)}" has an invalid module_source.`);
  const name = moduleSource.split("/").pop();
  return [`terraform/environments/pilot/${name}`, moduleSource];
}
/**
 * Resolves the git revision to build a capability's Terraform bundle from.
 * Prefers an immutable per-module tag (terraform-modules/<name>/<version>) so
 * approving a new version of one capability can never silently change what
 * source another capability resolves to; falls back to the existing global
 * HCP_TERRAFORM_SOURCE_REF when no such tag exists yet (true for every
 * capability today, so behavior is unchanged until modules start being tagged).
 */
async function moduleRevision(moduleName: string, moduleVersion: string, secret: string, errorPrefix: string) {
  const globalRef = str(Deno.env.get("HCP_TERRAFORM_SOURCE_REF")) || "main";
  if (!/^[A-Za-z0-9._/-]{1,160}$/.test(globalRef) || globalRef.includes("..")) throw new Error("HCP_TERRAFORM_SOURCE_REF is invalid.");
  const pinnedRef = `terraform-modules/${moduleName}/${moduleVersion}`;
  if (/^[A-Za-z0-9._/-]{1,160}$/.test(pinnedRef) && !pinnedRef.includes("..")) {
    try { return await resolveRevision(REPOSITORY, pinnedRef, secret, errorPrefix); } catch { /* fall through to the global ref */ }
  }
  return await resolveRevision(REPOSITORY, globalRef, secret, errorPrefix);
}
async function sourceBundle(capability: Json) {
  const secret = str(Deno.env.get("GITHUB_TERRAFORM_SOURCE_TOKEN")); if (!secret) throw new Error("GITHUB_TERRAFORM_SOURCE_TOKEN is not configured.");
  const errorPrefix = "Unable to read approved Terraform source from GitHub";
  const [root, module] = sourcePaths(capability);
  const moduleName = str(module.split("/").pop()); const moduleVersion = str(capability.module_version) || "v1.0.0";
  const revision = await moduleRevision(moduleName, moduleVersion, secret, errorPrefix);
  const tree = await fetchTree(REPOSITORY, revision, secret, errorPrefix);
  const rootFiles = filesUnder(tree, root, ".tf");
  const moduleFiles = filesUnder(tree, module, ".tf");
  if (!rootFiles.length || !moduleFiles.length) throw new Error("Approved Terraform source is incomplete at the resolved revision.");
  const files: Array<{ path: string; content: Uint8Array }> = [];
  for (const path of rootFiles) { const bytes = await fetchFileBytes(REPOSITORY, path, revision, secret, errorPrefix); const rewritten = new TextDecoder().decode(bytes).replace(/source\s*=\s*"\.\.\/\.\.\/\.\.\/modules\/[-a-z0-9_]+"/, 'source = "./module"'); files.push({ path: path.slice(root.length + 1), content: new TextEncoder().encode(rewritten) }); }
  for (const path of moduleFiles) { const bytes = await fetchFileBytes(REPOSITORY, path, revision, secret, errorPrefix); files.push({ path: `module/${path.slice(module.length + 1)}`, content: bytes }); }
  const bytes = await archive(files); return { bytes, revision, sha256: await digest(bytes) };
}

async function savedPlan(ws: { id: string; name: string }, capability: Json, inputs: Json, packageNumber: string) {
  const planToken = token("plan"); const source = await sourceBundle(capability);
  const cv = obj((await hcp(`/workspaces/${ws.id}/configuration-versions`, planToken, { method: "POST", headers: { "content-type": "application/vnd.api+json" }, body: JSON.stringify({ data: { type: "configuration-versions", attributes: { "auto-queue-runs": false, provisional: true } } }) })).data);
  const cvId = str(cv.id); const upload = str(obj(cv.attributes)["upload-url"]); if (!cvId || !upload) throw new Error("HCP Terraform did not return an uploadable configuration version.");
  const sent = await fetch(upload, { method: "PUT", headers: { "content-type": "application/octet-stream" }, body: source.bytes }); if (!sent.ok) throw new Error(`HCP Terraform configuration upload failed (${sent.status}).`);
  let uploaded = false;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const current = obj((await hcp(`/configuration-versions/${cvId}`, planToken)).data);
    const status = str(obj(current.attributes).status);
    if (status === "uploaded") { uploaded = true; break; }
    if (status === "errored") throw new Error("HCP Terraform rejected the generated configuration archive.");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!uploaded) throw new Error("HCP Terraform did not finish receiving the configuration archive.");
  const run = obj((await hcp("/runs", planToken, { method: "POST", headers: { "content-type": "application/vnd.api+json" }, body: JSON.stringify({ data: { type: "runs", attributes: { "auto-apply": false, "is-destroy": false, refresh: true, "save-plan": true, message: `Governed VM package ${packageNumber}; source ${source.revision}`, variables: Object.entries(inputs).map(([key, value]) => ({ key, value: JSON.stringify(value), category: "terraform", hcl: false })) }, relationships: { workspace: { data: { type: "workspaces", id: ws.id } }, "configuration-version": { data: { type: "configuration-versions", id: cvId } } } } }) })).data);
  if (!str(run.id)) throw new Error("HCP Terraform did not return a saved-plan run ID."); return { configurationVersionId: cvId, runId: str(run.id), source };
}
function relation(run: Json, name: string) { return str(obj(obj(obj(run.relationships)[name]).data).id); }
function resourceIds(value: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((item) => resourceIds(item, found));
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value as Json)) {
    if (key === "resource_id" && typeof item === "string" && item.startsWith("/subscriptions/")) found.add(item.toLowerCase());
    else resourceIds(item, found);
  }
  return found;
}
function safeguards(plan: Json, target: string) { const changes = arr(plan.resource_changes).map(obj); const destroy = changes.some((item) => arr(obj(item.change).actions).map(str).includes("delete")); const replace = changes.some((item) => { const actions = arr(obj(item.change).actions).map(str); return actions.includes("delete") && actions.includes("create"); }); const affected = [...resourceIds(obj(plan.planned_values))]; const actions = changes.reduce((result, item) => { for (const action of arr(obj(item.change).actions).map(str)) result[action] = Number(result[action] ?? 0) + 1; return result; }, {} as Json); return { destroy, replace, affected, actions, matched: affected.length === 1 && affected[0] === target.toLowerCase() && !destroy && !replace }; }
function runUrl(ws: string, run: string) { return `https://app.terraform.io/app/${encodeURIComponent(HCP_ORGANIZATION)}/workspaces/${encodeURIComponent(ws)}/runs/${encodeURIComponent(run)}`; }
async function sync(db: ReturnType<typeof admin>, run: Json) {
  const remote = obj((await hcp(`/runs/${encodeURIComponent(str(run.hcp_run_id))}`, token("plan"))).data); const hcpStatus = str(obj(remote.attributes).status); const planId = relation(remote, "plan") || str(run.hcp_plan_id);
  const update: Json = { hcp_run_status: hcpStatus, hcp_plan_id: planId || null, hcp_synced_at: iso() };
  if (run.run_type === "plan" && PLAN_SUCCESS.has(hcpStatus) && planId) { const plan = obj(await hcp(`/plans/${encodeURIComponent(planId)}/json-output`, token("plan"))); const guard = safeguards(plan, str(obj(run.resolved_inputs).target_resource_id)); Object.assign(update, { status: guard.matched ? "succeeded" : "blocked", completed_at: iso(), artifact_uri: runUrl(str(run.hcp_workspace_name), str(run.hcp_run_id)), plan_sha256: await digest(JSON.stringify(plan)), plan_summary: { actions: guard.actions, hcpStatus, sourceRevision: run.source_revision }, reconciliation: { matched: guard.matched, expectedTarget: str(obj(run.resolved_inputs).target_resource_id).toLowerCase(), affectedResourceIds: guard.affected }, has_destroy: guard.destroy, has_replace: guard.replace, hcp_plan_json: { formatVersion: str(plan.format_version), terraformVersion: str(plan.terraform_version), resourceChanges: arr(plan.resource_changes).length, guardrails: guard }, error_message: guard.matched ? null : "HCP Terraform plan did not match the approved VM boundary." }); }
  else if (run.run_type === "apply" && hcpStatus === "applied") Object.assign(update, { status: "succeeded", completed_at: iso(), artifact_uri: runUrl(str(run.hcp_workspace_name), str(run.hcp_run_id)), error_message: null });
  else if (FAILURE.has(hcpStatus)) Object.assign(update, { status: hcpStatus === "policy_soft_failed" ? "blocked" : "failed", completed_at: iso(), error_message: `HCP Terraform run ended with ${hcpStatus}.` });
  const { data, error } = await db.from("iac_terraform_runs").update(update).eq("id", run.id).select("*").single(); if (error) throw error;
  if (data.status !== run.status || data.hcp_run_status !== run.hcp_run_status) await addEvent(db, str(run.id), "hcp_run_synchronized", { status: data.status, hcpStatus });
  if (run.run_type === "apply" && ["succeeded", "failed", "blocked"].includes(data.status)) await db.from("iac_change_packages").update({ status: data.status === "succeeded" ? "executed" : "execution_failed", execution_completed_at: iso(), execution_message: data.status === "succeeded" ? "The exact approved HCP Terraform saved plan was applied." : data.error_message }).eq("id", run.package_id).eq("status", "executing");
  return data as Json;
}
async function plan(request: Request, db: ReturnType<typeof admin>, actor: string, packageId: string) {
  const resolved = await packageCapability(db, packageId); if (resolved.pkg.status !== "submitted") throw new Error("Only a submitted package can be planned."); const binding = await bind(db, actor, resolved.pkg, resolved.capability, resolved.inputs); const ws = workspace(resolved.env); const hcpRun = await savedPlan(ws, resolved.capability, resolved.inputs, str(resolved.pkg.package_number));
  const { data, error } = await db.from("iac_terraform_runs").insert({ package_id: packageId, capability_id: resolved.capability.id, run_type: "plan", status: "running", requested_by: actor, module_source: binding.module_source, module_version: binding.module_version, resolved_inputs: resolved.inputs, runner_correlation_id: `hcp-plan:${hcpRun.runId}`, execution_engine: "hcp_terraform", hcp_organization: HCP_ORGANIZATION, hcp_workspace_id: ws.id, hcp_workspace_name: ws.name, hcp_configuration_version_id: hcpRun.configurationVersionId, hcp_run_id: hcpRun.runId, hcp_run_status: "pending", source_revision: hcpRun.source.revision, started_at: iso() }).select("*").single();
  if (error) throw error; await addEvent(db, data.id, "hcp_saved_plan_queued", { hcpRunId: hcpRun.runId, configurationVersionId: hcpRun.configurationVersionId, sourceRevision: hcpRun.source.revision, configurationSha256: hcpRun.source.sha256 }); return reply(request, { runId: data.id, hcpRunId: hcpRun.runId, status: data.status }, 202);
}
async function apply(request: Request, db: ReturnType<typeof admin>, actor: string, packageId: string) {
  const resolved = await packageCapability(db, packageId); if (resolved.pkg.status !== "approved") throw new Error("Only an approved package can be applied."); if (resolved.pkg.created_by !== actor && !await isAdmin(db, actor)) throw new Error("The caller is not authorized to execute this package.");
  const { data: saved } = await db.from("iac_terraform_runs").select("*").eq("package_id", packageId).eq("run_type", "plan").eq("execution_engine", "hcp_terraform").eq("status", "succeeded").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!saved || saved.capability_id !== resolved.capability.id || saved.has_destroy || saved.has_replace || saved.reconciliation?.matched !== true || !saved.hcp_run_id || !saved.hcp_plan_id || stableStringify(saved.resolved_inputs) !== stableStringify(resolved.inputs)) throw new Error("A clean, request-matched HCP Terraform saved plan is required.");
  const { data: claimed } = await db.from("iac_change_packages").update({ status: "executing", execution_started_at: iso(), executed_by: actor }).eq("id", packageId).eq("status", "approved").select("id").maybeSingle(); if (!claimed) throw new Error("The package was already claimed for execution.");
  const { data, error } = await db.from("iac_terraform_runs").insert({ package_id: packageId, capability_id: saved.capability_id, run_type: "apply", status: "running", requested_by: actor, plan_run_id: saved.id, module_source: saved.module_source, module_version: saved.module_version, resolved_inputs: resolved.inputs, runner_correlation_id: `hcp-apply:${saved.hcp_run_id}`, execution_engine: "hcp_terraform", hcp_organization: saved.hcp_organization, hcp_workspace_id: saved.hcp_workspace_id, hcp_workspace_name: saved.hcp_workspace_name, hcp_run_id: saved.hcp_run_id, hcp_plan_id: saved.hcp_plan_id, hcp_run_status: saved.hcp_run_status, source_revision: saved.source_revision, artifact_uri: saved.artifact_uri, plan_sha256: saved.plan_sha256, started_at: iso() }).select("*").single();
  if (error) { const message = `Unable to record the apply run: ${error.message}`; await db.from("iac_change_packages").update({ status: "execution_failed", execution_completed_at: iso(), execution_message: message }).eq("id", packageId).eq("status", "executing"); throw new Error(message); }
  try { await hcp(`/runs/${encodeURIComponent(saved.hcp_run_id)}/actions/apply`, token("apply"), { method: "POST", headers: { "content-type": "application/vnd.api+json" }, body: JSON.stringify({ data: { type: "apply-actions" } }) }); await addEvent(db, data.id, "hcp_saved_plan_apply_requested", { hcpRunId: saved.hcp_run_id, hcpPlanId: saved.hcp_plan_id }); }
  catch (cause) { const message = cause instanceof Error ? cause.message : "HCP Terraform apply request failed."; await db.from("iac_terraform_runs").update({ status: "failed", completed_at: iso(), error_message: message }).eq("id", data.id); await db.from("iac_change_packages").update({ status: "execution_failed", execution_completed_at: iso(), execution_message: message }).eq("id", packageId).eq("status", "executing"); throw cause; }
  return reply(request, { runId: data.id, hcpRunId: saved.hcp_run_id, status: data.status }, 202);
}
async function refresh(request: Request, db: ReturnType<typeof admin>, actor: string, packageId: string) { const { data: pkg } = await db.from("iac_change_packages").select("created_by").eq("id", packageId).maybeSingle(); if (!pkg || (pkg.created_by !== actor && !await isAdmin(db, actor))) throw new Error("The caller is not authorized to inspect this package."); const { data, error } = await db.from("iac_terraform_runs").select("*").eq("package_id", packageId).eq("execution_engine", "hcp_terraform").in("status", ["queued", "running"]).order("created_at", { ascending: false }); if (error) throw error; return reply(request, { runs: await Promise.all((data ?? []).map((run) => sync(db, run as Json))) }); }

async function diagnose(request: Request, db: ReturnType<typeof admin>, actor: string) {
  if (!await isAdmin(db, actor)) return reply(request, { error: "platform administrator required" }, 403);
  const report: Json = { repository: REPOSITORY, tokenConfigured: Boolean(str(Deno.env.get("GITHUB_TERRAFORM_SOURCE_TOKEN"))), ref: str(Deno.env.get("HCP_TERRAFORM_SOURCE_REF")) || "main (default)" };
  const secret = str(Deno.env.get("GITHUB_TERRAFORM_SOURCE_TOKEN"));
  if (!secret) { report.problem = "GITHUB_TERRAFORM_SOURCE_TOKEN is not configured."; return reply(request, report); }
  const ref = str(Deno.env.get("HCP_TERRAFORM_SOURCE_REF")) || "main";
  if (!/^[A-Za-z0-9._/-]{1,160}$/.test(ref) || ref.includes("..")) { report.problem = "HCP_TERRAFORM_SOURCE_REF contains characters that are not allowed."; return reply(request, report); }
  const head = async (path: string) => { const response = await fetch(`https://api.github.com${path}`, { headers: { accept: "application/vnd.github+json", authorization: `Bearer ${secret}`, "x-github-api-version": "2022-11-28" } }); return { status: response.status, body: await response.json().catch(() => ({})) }; };
  const repo = await head(`/repos/${REPOSITORY}`);
  report.repositoryAccess = repo.status;
  if (repo.status !== 200) { report.problem = repo.status === 401 ? "The GitHub token is invalid or expired." : repo.status === 404 ? "The GitHub token cannot see this repository (wrong account, missing repository access, or SSO not authorized)." : `GitHub returned ${repo.status} for the repository.`; return reply(request, report); }
  const commit = await head(`/repos/${REPOSITORY}/commits/${encodeURIComponent(ref)}`);
  report.refResolution = commit.status;
  if (commit.status !== 200) { report.problem = `The source ref "${ref}" does not exist in ${REPOSITORY} (GitHub returned ${commit.status}).`; return reply(request, report); }
  const revision = str(obj(commit.body).sha); report.revision = revision;
  const tree = await head(`/repos/${REPOSITORY}/git/trees/${revision}?recursive=1`);
  const paths = arr(obj(tree.body).tree).map(obj).map((item) => str(item.path));
  const present = (prefix: string) => paths.some((path) => path.startsWith(`${prefix}/`) && path.endsWith(".tf"));
  const { data: capabilities } = await db.from("iac_automation_capabilities").select("action_type, module_source").eq("lifecycle_status", "approved");
  const terraformSource: Record<string, boolean> = {};
  for (const capability of capabilities ?? []) {
    const moduleSource = str(capability.module_source); const name = moduleSource.split("/").pop();
    if (!name) continue;
    terraformSource[`${capability.action_type}Root`] = present(`terraform/environments/pilot/${name}`);
    terraformSource[`${capability.action_type}Module`] = present(moduleSource);
  }
  report.terraformSource = terraformSource;
  const missing = Object.entries(terraformSource).filter(([, ok]) => !ok).map(([name]) => name);
  report.problem = missing.length ? `The approved Terraform source is missing at this revision: ${missing.join(", ")}. The ref probably points at a branch or tag that predates it.` : null;
  return reply(request, report);
}



Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) }); if (request.method !== "POST") return reply(request, { error: "method not allowed" }, 405);
  const db = admin(); let body: Json; try { body = obj(await request.json()); } catch { return reply(request, { error: "invalid json" }, 400); } const actor = await user(request, db); if (!actor) return reply(request, { error: "authentication required" }, 401);
  if (body.operation === "diagnose") { try { return await diagnose(request, db, actor.id); } catch (cause) { return reply(request, { error: cause instanceof Error ? cause.message : "Diagnostics failed." }, 409); } }
  const packageId = str(body.packageId); if (!/^[0-9a-f-]{36}$/i.test(packageId)) return reply(request, { error: "valid packageId required" }, 400);
  try { if (body.operation === "resolve") { const result = await packageCapability(db, packageId); return reply(request, { capability: result.capability, binding: await bind(db, actor.id, result.pkg, result.capability, result.inputs), environment: result.env }); } if (body.operation === "plan") return await plan(request, db, actor.id, packageId); if (body.operation === "apply") return await apply(request, db, actor.id, packageId); if (body.operation === "sync") return await refresh(request, db, actor.id, packageId); return reply(request, { error: "unsupported operation" }, 400); }
  catch (cause) { return reply(request, { error: cause instanceof Error ? cause.message : "Terraform orchestration failed." }, 409); }
});
