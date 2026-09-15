import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { fetchFileBytes, fetchTree, filesUnder } from "../_shared/github.ts";
import { createTerraformRequestHandler } from "./request-handler.ts";
import { digest } from "./plan-digest.ts";
import { assessPlan, hclLiteral, resolveExecutionScope, typedInputs, type ExecutionScope } from "./execution-policy.ts";

type Json = Record<string, unknown>;
const VM_TYPE = "Microsoft.Compute/virtualMachines";
const HCP_API = "https://app.terraform.io/api/v2";
const HCP_ORGANIZATION = "Arch-Neugain";
const REPOSITORY = "Neurealm/arch-insurance-iac";
const PLAN_SUCCESS = new Set(["planned_and_saved"]);
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
async function isAdmin(db: ReturnType<typeof admin>, id: string) {
  const { data, error } = await db.from("user_roles").select("user_id").eq("user_id", id).eq("role", "platform_admin").maybeSingle();
  if (error) throw error;
  return !!data;
}
async function addEvent(db: ReturnType<typeof admin>, id: string, type: string, detail: Json = {}) { await db.from("iac_terraform_run_events").insert({ run_id: id, event_type: type, detail }); }

/** Every target resource this package declares, from the immutable-once-submitted child table. */
async function packageTargets(db: ReturnType<typeof admin>, packageId: string) {
  const { data, error } = await db.from("iac_change_package_targets").select("target_resource_id").eq("package_id", packageId);
  if (error) throw error;
  const targets = (data ?? []).map((row) => str(row.target_resource_id)).filter(Boolean);
  if (!targets.length) throw new Error("The change package has no declared target resources.");
  return targets;
}
async function packageCapability(db: ReturnType<typeof admin>, packageId: string) {
  const { data: pkg, error } = await db.from("iac_change_packages").select("*").eq("id", packageId).maybeSingle();
  if (error || !pkg) throw new Error("Change package was not found.");
  const { data: capability } = await db.from("iac_automation_capabilities").select("*").eq("provider", "azure").eq("resource_type", VM_TYPE).eq("action_type", pkg.action_type).eq("lifecycle_status", "approved").maybeSingle();
  if (!capability) throw new Error(`No approved Terraform capability exists for ${pkg.action_type}.`);
  const targets = await packageTargets(db, packageId);
  // A provisioning package creates machines that do not exist yet, so no server
  // secret can name them in advance. The exact set is authorized per batch by a
  // platform administrator instead; resolveExecutionScope requires it to equal
  // the declared targets. Nothing else reads this.
  let authorizedTargets: string[] | null = null;
  if (capability.execution_mode === "azapi_resource") {
    const { data: authorization, error: authorizationError } = await db
      .from("iac_provisioning_authorizations").select("target_resource_ids").eq("package_id", packageId).maybeSingle();
    if (authorizationError) throw authorizationError;
    authorizedTargets = (authorization?.target_resource_ids ?? []).map((value: unknown) => str(value)).filter(Boolean);
  }
  const scope = resolveExecutionScope(Deno.env.get("HCP_TERRAFORM_SCOPE_BINDINGS"), pkg, capability, targets, authorizedTargets);
  return { pkg: pkg as Json, capability: capability as Json, inputs: typedInputs(pkg, capability, str(pkg.target_resource_id)), env: scope.environment, targets, scope };
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
async function sourceBundle(capability: Json, revision: string) {
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error("An immutable reviewed Terraform commit is required.");
  const secret = str(Deno.env.get("GITHUB_TERRAFORM_SOURCE_TOKEN")); if (!secret) throw new Error("GITHUB_TERRAFORM_SOURCE_TOKEN is not configured.");
  const errorPrefix = "Unable to read approved Terraform source from GitHub";
  const [root, module] = sourcePaths(capability);
  const tree = await fetchTree(REPOSITORY, revision, secret, errorPrefix);
  const rootFiles = filesUnder(tree, root, ".tf");
  const moduleFiles = filesUnder(tree, module, ".tf");
  if (!rootFiles.length || !moduleFiles.length) throw new Error("Approved Terraform source is incomplete at the resolved revision.");
  const files: Array<{ path: string; content: Uint8Array }> = [];
  for (const path of rootFiles) { const bytes = await fetchFileBytes(REPOSITORY, path, revision, secret, errorPrefix); const rewritten = new TextDecoder().decode(bytes).replace(/source\s*=\s*"\.\.\/\.\.\/\.\.\/modules\/[-a-z0-9_]+"/, 'source = "./module"'); files.push({ path: path.slice(root.length + 1), content: new TextEncoder().encode(rewritten) }); }
  for (const path of moduleFiles) { const bytes = await fetchFileBytes(REPOSITORY, path, revision, secret, errorPrefix); files.push({ path: `module/${path.slice(module.length + 1)}`, content: bytes }); }
  const bytes = await archive(files); return { bytes, revision, sha256: await digest(bytes) };
}

async function savedPlan(ws: { id: string; name: string }, source: Awaited<ReturnType<typeof sourceBundle>>, inputs: Json, packageNumber: string) {
  const planToken = token("plan");
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
  const run = obj((await hcp("/runs", planToken, { method: "POST", headers: { "content-type": "application/vnd.api+json" }, body: JSON.stringify({ data: { type: "runs", attributes: { "auto-apply": false, "is-destroy": false, refresh: true, "save-plan": true, message: `Governed VM package ${packageNumber}; source ${source.revision}`, variables: Object.entries(inputs).map(([key, value]) => ({ key, value: hclLiteral(value) })) }, relationships: { workspace: { data: { type: "workspaces", id: ws.id } }, "configuration-version": { data: { type: "configuration-versions", id: cvId } } } } }) })).data);
  if (!str(run.id)) throw new Error("HCP Terraform did not return a saved-plan run ID."); return { configurationVersionId: cvId, runId: str(run.id), source };
}
function relation(run: Json, name: string) { return str(obj(obj(obj(run.relationships)[name]).data).id); }
function runUrl(ws: string, run: string) { return `https://app.terraform.io/app/${encodeURIComponent(HCP_ORGANIZATION)}/workspaces/${encodeURIComponent(ws)}/runs/${encodeURIComponent(run)}`; }
async function verifyWorkspace(scope: ExecutionScope, credential: string) {
  const ws = obj((await hcp(`/workspaces/${scope.workspaceId}`, credential)).data), a = obj(ws.attributes);
  if (ws.id !== scope.workspaceId || a.name !== scope.workspaceName || relation(ws, "organization") !== HCP_ORGANIZATION ||
    a["auto-apply"] !== false || a["execution-mode"] !== "remote" || str(a["working-directory"]) || a["vcs-repo"])
    throw new Error("HCP workspace must match the reviewed API-driven, remote, manual-apply configuration.");
}
async function sync(db: ReturnType<typeof admin>, run: Json) {
  const remote = obj((await hcp(`/runs/${encodeURIComponent(str(run.hcp_run_id))}`, token("plan"))).data);
  if (remote.id !== run.hcp_run_id || relation(remote, "workspace") !== run.hcp_workspace_id) throw new Error("HCP run identity changed.");
  const hcpStatus = str(obj(remote.attributes).status), planId = relation(remote, "plan") || str(run.hcp_plan_id);
  if (run.run_type === "apply" && planId !== run.hcp_plan_id) throw new Error("HCP apply plan identity changed.");
  const update: Json = { hcp_run_status: hcpStatus, hcp_plan_id: planId || null, hcp_synced_at: iso() };
  if (run.run_type === "plan" && PLAN_SUCCESS.has(hcpStatus) && planId) {
    const { data: capability, error } = await db.from("iac_automation_capabilities").select("*").eq("id", run.capability_id).single();
    if (error) throw error;
    const plan = obj(await hcp(`/plans/${encodeURIComponent(planId)}/json-output`, token("plan")));
    const targets = await packageTargets(db, str(run.package_id)), guard = assessPlan(plan, targets, obj(run.resolved_inputs), capability, { allowDestroy: true });
    Object.assign(update, { status: guard.matched ? "succeeded" : "blocked", completed_at: iso(), artifact_uri: runUrl(str(run.hcp_workspace_name), str(run.hcp_run_id)),
      plan_sha256: await digest(stableStringify(plan)), plan_summary: { actions: guard.actions, hcpStatus, sourceRevision: run.source_revision },
      reconciliation: { matched: guard.matched, expectedTargets: targets.map(target => target.toLowerCase()), affectedResourceIds: guard.affected, unexpected: guard.unexpected, missingFromPlan: guard.missingFromPlan, violations: guard.violations },
      has_destroy: guard.destroy, has_replace: guard.replace,
      hcp_plan_json: { formatVersion: str(plan.format_version), terraformVersion: str(plan.terraform_version), resourceChanges: arr(plan.resource_changes).length, guardrails: guard },
      error_message: guard.matched ? null : "Saved plan failed the exact target/action policy. Review the guardrail evidence." });
    // A plan HCP is willing to confirm, but that our own policy refuses, must
    // not sit forever as a live, appliable run someone could still confirm by
    // hand in the HCP UI -- and must not permanently hold this workspace's one
    // claim hostage, since the claim only releases once HCP reports a genuine
    // terminal status. Tell HCP to stand down and record the real resulting
    // status, so the existing terminal-status release logic in
    // synchronize_iac_terraform_run picks it up automatically, the same way it
    // already does for an apply or an HCP-side error. A failed discard is not
    // fatal -- the run is still recorded as blocked exactly as before this
    // change, just without the automatic self-heal.
    if (!guard.matched) {
      try {
        await hcp(`/runs/${encodeURIComponent(str(run.hcp_run_id))}/actions/discard`, token("plan"), {
          method: "POST", headers: { "content-type": "application/vnd.api+json" },
          body: JSON.stringify({ comment: "Discarded automatically: saved plan failed the exact target/action policy." }),
        });
        update.hcp_run_status = "discarded";
      } catch (cause) {
        await addEvent(db, str(run.id), "hcp_discard_failed", { message: cause instanceof Error ? cause.message : "Unable to discard the blocked HCP run." });
      }
    }
  } else if (run.run_type === "plan" && hcpStatus === "planned_and_finished") {
    Object.assign(update, { status: "blocked", completed_at: iso(), error_message: "This is a no-change or plan-only run, not an executable saved plan." });
  } else if (run.run_type === "apply" && hcpStatus === "applied") {
    Object.assign(update, { status: "succeeded", completed_at: iso(), artifact_uri: runUrl(str(run.hcp_workspace_name), str(run.hcp_run_id)), error_message: null });
  } else if (FAILURE.has(hcpStatus)) {
    Object.assign(update, { status: ["policy_soft_failed", "policy_override"].includes(hcpStatus) ? "blocked" : "failed", completed_at: iso(), error_message: `HCP Terraform run ended with ${hcpStatus}.` });
  }
  const { data, error } = await db.rpc("synchronize_iac_terraform_run", { p_run_id: run.id, p_observation: update });
  if (error || !data) throw error ?? new Error("Unable to persist the HCP observation.");

  return data as Json;
}
async function plan(request: Request, db: ReturnType<typeof admin>, actor: string, packageId: string) {
  const resolved = await packageCapability(db, packageId);
  if (resolved.pkg.status !== "submitted") throw new Error("Only a submitted package can be planned.");
  await verifyWorkspace(resolved.scope, token("plan"));
  const source = await sourceBundle(resolved.capability, resolved.scope.sourceRevision);
  const binding = await bind(db, actor, resolved.pkg, resolved.capability, resolved.inputs);
  const configurationKey = await digest(stableStringify({ module: resolved.capability.module_source, targets: [...resolved.targets].map(id => id.toLowerCase()).sort() }));
  const { data: claimId, error: claimError } = await db.rpc("reserve_iac_terraform_plan", { p_package_id: packageId, p_actor: actor, p_workspace_id: resolved.scope.workspaceId,
    p_configuration_key: configurationKey, p_source_revision: source.revision, p_scope_evidence: resolved.scope });
  if (claimError || !claimId) throw claimError ?? new Error("Unable to reserve the workspace.");
  try {
    const ws = { id: resolved.scope.workspaceId, name: resolved.scope.workspaceName };
    const hcpRun = await savedPlan(ws, source, resolved.inputs, str(resolved.pkg.package_number));
    const { data, error } = await db.from("iac_terraform_runs").insert({ package_id: packageId, capability_id: resolved.capability.id, run_type: "plan", status: "running", requested_by: actor,
      module_source: binding.module_source, module_version: binding.module_version, resolved_inputs: resolved.inputs, runner_correlation_id: `hcp-plan:${hcpRun.runId}`,
      execution_engine: "hcp_terraform", hcp_organization: HCP_ORGANIZATION, hcp_workspace_id: ws.id, hcp_workspace_name: ws.name,
      hcp_configuration_version_id: hcpRun.configurationVersionId, hcp_run_id: hcpRun.runId, hcp_run_status: "pending", source_revision: source.revision, plan_claim_id: claimId, started_at: iso() }).select("*").single();
    if (error) throw error;
    await addEvent(db, data.id, "hcp_saved_plan_queued", { hcpRunId: hcpRun.runId, configurationVersionId: hcpRun.configurationVersionId, sourceRevision: source.revision, configurationSha256: source.sha256 });
    return reply(request, { runId: data.id, hcpRunId: hcpRun.runId, status: data.status }, 202);
  } catch (cause) {
    // HCP may have accepted the POST despite a lost response. Keep the durable
    // reservation; never queue a duplicate or release an ambiguous workspace.
    await db.from("iac_terraform_plan_claims").update({ status: "uncertain" }).eq("id", claimId).eq("status", "reserved");
    throw new Error("HCP plan submission is unresolved. An administrator must reconcile the workspace claim before retrying.", { cause });
  }
}
async function apply(request: Request, db: ReturnType<typeof admin>, actor: string, packageId: string) {
  const resolved = await packageCapability(db, packageId);
  if (resolved.pkg.status !== "approved") throw new Error("Only an approved package can be applied.");
  if (!resolved.scope.applyEnabled) throw new Error("Apply is disabled for this reviewed scope.");
  const applyToken = token("apply");
  await verifyWorkspace(resolved.scope, applyToken);
  const { data: review, error: reviewError } = await db.from("iac_change_package_reviews").select("*").eq("package_id", packageId).eq("decision", "approved").order("reviewed_at", { ascending: false }).limit(1).maybeSingle();
  if (reviewError) throw reviewError;
  if (!review?.approved_plan_run_id) throw new Error("Approval does not identify an exact saved plan. A new reviewed package is required.");
  const { data: saved, error: savedError } = await db.from("iac_terraform_runs").select("*").eq("id", review.approved_plan_run_id).eq("package_id", packageId).single();
  if (savedError) throw savedError;
  if (saved.status !== "succeeded" || saved.run_type !== "plan" || saved.execution_engine !== "hcp_terraform" || saved.capability_id !== resolved.capability.id ||
    saved.hcp_workspace_id !== resolved.scope.workspaceId || saved.source_revision !== resolved.scope.sourceRevision ||
    saved.plan_sha256 !== review.approved_plan_sha256 || saved.source_revision !== review.approved_source_revision ||
    saved.hcp_run_id !== review.approved_hcp_run_id || saved.hcp_plan_id !== review.approved_hcp_plan_id ||
    stableStringify(saved.resolved_inputs) !== stableStringify(resolved.inputs)) throw new Error("The package, capability or scope no longer matches the reviewed saved plan.");
  const remote = obj((await hcp(`/runs/${encodeURIComponent(saved.hcp_run_id)}`, applyToken)).data);
  if (remote.id !== saved.hcp_run_id || relation(remote, "workspace") !== saved.hcp_workspace_id || relation(remote, "plan") !== saved.hcp_plan_id ||
    relation(remote, "configuration-version") !== saved.hcp_configuration_version_id || obj(remote.attributes).status !== "planned_and_saved" ||
    obj(obj(remote.attributes).actions)["is-confirmable"] !== true || obj(remote.attributes)["auto-apply"] !== false)
    throw new Error("The exact HCP saved plan is no longer available for manual apply.");
  const rawPlan = obj(await hcp(`/plans/${encodeURIComponent(saved.hcp_plan_id)}/json-output`, applyToken));
  const applyGuard = assessPlan(rawPlan, resolved.targets, resolved.inputs, resolved.capability, { allowDestroy: true });
  if (await digest(stableStringify(rawPlan)) !== saved.plan_sha256 || !applyGuard.matched)
    throw new Error("The remote saved-plan digest or policy evidence changed.");
  // Destroying plans may be reviewed but never executed by this endpoint.
  if (applyGuard.destroy || applyGuard.replace)
    throw new Error("This saved plan deletes or replaces existing resources. Applying a destructive plan is not permitted; adjust the module or use a dedicated workspace.");

  const { data, error } = await db.rpc("claim_iac_terraform_apply", { p_package_id: packageId, p_actor: actor, p_run_id: saved.id, p_plan_sha256: saved.plan_sha256 });
  if (error || !data) throw error ?? new Error("Unable to atomically claim the reviewed plan.");
  try {
    await hcp(`/runs/${encodeURIComponent(saved.hcp_run_id)}/actions/apply`, applyToken, { method: "POST", headers: { "content-type": "application/vnd.api+json" }, body: JSON.stringify({ data: { type: "apply-actions" } }) });
    await addEvent(db, data.id, "hcp_saved_plan_apply_requested", { hcpRunId: saved.hcp_run_id, hcpPlanId: saved.hcp_plan_id });
  } catch {
    // An HTTP failure is not proof that Azure execution failed. Do not retry.
    await db.from("iac_terraform_runs").update({ error_message: "Apply acknowledgement is uncertain. Refresh to reconcile the existing HCP run; do not submit another apply." }).eq("id", data.id).eq("status", "running");
    await addEvent(db, data.id, "hcp_apply_acknowledgement_uncertain", { hcpRunId: saved.hcp_run_id });
  }
  return reply(request, { runId: data.id, hcpRunId: saved.hcp_run_id, status: "running" }, 202);
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



Deno.serve(createTerraformRequestHandler({
  database: admin,
  authenticate: user,
  packageOwner: async (db, packageId) => {
    const { data, error } = await db.from("iac_change_packages").select("created_by").eq("id", packageId).maybeSingle();
    if (error) throw error;
    return data?.created_by ?? null;
  },
  isAdministrator: isAdmin,
  operations: {
    resolve: async (request, db, actor, packageId) => {
      const result = await packageCapability(db, packageId);
      return reply(request, { capability: result.capability, binding: await bind(db, actor, result.pkg, result.capability, result.inputs), environment: result.env });
    },
    plan,
    apply,
    sync: refresh,
  },
  diagnose,
  reply,
  cors,
}));
