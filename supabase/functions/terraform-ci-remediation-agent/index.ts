import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { decodeBase64, githubGet, obj, str } from "../_shared/github.ts";
import { CREATE_VM_VARIABLES } from "../_shared/terraform-draft-policy.ts";
import { OS_DISK_VARIABLES } from "../_shared/os-disk-draft-policy.ts";
import { formatGeneratedHclAssignments, moduleVersionsTf, templateRootFiles } from "../_shared/terraform-draft-template.ts";
import { createRemediationHandler, type Claim, type CompleteInput, type GapRecord } from "./handler.ts";
import {
  REPAIR_OUTPUT_SCHEMA, buildRepairInput, buildRepairInstructions, failedJobIds,
  governedModule, parseRepairResponse, redactCiLog, validateRepairArchive,
  type Json, type RepairFiles, type RepairGap,
} from "./policy.ts";

const REPOSITORY = "Neurealm/arch-insurance-iac";
const PREFIX = `/repos/${REPOSITORY}`;
const DEFAULT_MODEL = "gpt-5.6-terra";
const SHA = /^[0-9a-f]{40}$/;

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
function env(name: string) { return str(Deno.env.get(name)); }
function modelName() { return env("OPENAI_REMEDIATION_MODEL") || DEFAULT_MODEL; }
function repo(value: unknown) { return str(obj(value).full_name).toLowerCase() === REPOSITORY.toLowerCase(); }

async function ghJson(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`GitHub request failed (${response.status}).`);
  return obj(await response.json());
}

async function readTail(response: Response, limit: number) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    text += decoder.decode(chunk.value, { stream: true });
    if (text.length > limit) text = text.slice(-limit);
  }
  text += decoder.decode();
  return text.slice(-limit);
}

async function jobLog(jobId: number, token: string) {
  const response = await fetch(`https://api.github.com${PREFIX}/actions/jobs/${jobId}/logs`, {
    redirect: "manual",
    headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "x-github-api-version": "2022-11-28" },
  });
  if (response.status === 200) return readTail(response, 50_000);
  if (response.status !== 302) throw new Error(`GitHub job log is unavailable (${response.status}).`);
  const location = response.headers.get("location");
  if (!location) throw new Error("GitHub did not provide a job-log download URL.");
  const target = new URL(location);
  const host = target.hostname.toLowerCase();
  if (target.protocol !== "https:" || !(host.endsWith(".actions.githubusercontent.com") || host.endsWith(".githubusercontent.com") || host.endsWith(".blob.core.windows.net"))) {
    throw new Error("GitHub returned an unexpected job-log host.");
  }
  // The signed redirect is fetched without the GitHub Authorization header.
  const log = await fetch(target, { headers: { accept: "text/plain" } });
  if (!log.ok) throw new Error(`GitHub job-log download failed (${log.status}).`);
  return readTail(log, 50_000);
}

async function terraformFile(path: string, ref: string, token: string): Promise<string> {
  const result = await ghJson(`${PREFIX}/contents/${path}?ref=${ref}`, token);
  if (result.type !== "file" || result.encoding !== "base64") throw new Error("GitHub returned an invalid Terraform source file.");
  const decoded = new TextDecoder().decode(decodeBase64(str(result.content)));
  if (!decoded || decoded.length > 20_000) throw new Error("Terraform source file is empty or oversized.");
  return decoded;
}

async function optionalTerraformFile(path: string, ref: string, token: string): Promise<string | null> {
  try {
    return await terraformFile(path, ref, token);
  } catch (cause) {
    // A missing trusted template file is a deterministic repair case, not an
    // upstream error. Permission and transport failures still stop the agent.
    if (cause instanceof Error && cause.message.includes("(404)")) return null;
    throw cause;
  }
}

async function moduleFiles(gap: RepairGap, token: string): Promise<RepairFiles> {
  const [mainTf, variablesTf, outputsTf] = await Promise.all([
    terraformFile(`${gap.module_source}/main.tf`, gap.ci_head_sha, token),
    terraformFile(`${gap.module_source}/variables.tf`, gap.ci_head_sha, token),
    terraformFile(`${gap.module_source}/outputs.tf`, gap.ci_head_sha, token),
  ]);
  return { mainTf, variablesTf, outputsTf };
}

function assertOpenPullRequest(pr: Json, gap: RepairGap) {
  if (pr.number !== gap.draft_pr_number || pr.state !== "open" || pr.merged === true || !repo(obj(pr.head).repo) || !repo(obj(pr.base).repo)
    || str(obj(pr.base).ref) !== "main" || str(obj(pr.head).ref) !== gap.draft_branch || str(obj(pr.head).sha) !== gap.ci_head_sha) {
    throw new Error("The pull request no longer matches the failed draft head.");
  }
}

function assertRefreshedPullRequest(pr: Json, gap: RepairGap, previousHead: string) {
  if (pr.number !== gap.draft_pr_number || pr.state !== "open" || pr.merged === true || !repo(obj(pr.head).repo) || !repo(obj(pr.base).repo)
    || str(obj(pr.base).ref) !== "main" || str(obj(pr.head).ref) !== gap.draft_branch) {
    throw new Error("The pull request changed while trusted main was being synchronized.");
  }
  const head = str(obj(pr.head).sha);
  if (!SHA.test(head) || head === previousHead) throw new Error("GitHub did not finish synchronizing the draft branch with trusted main.");
  return head;
}

const wait = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

/**
 * A draft that was generated against an old base may fail a newer validation
 * policy even when its module is correct. GitHub's update-branch endpoint
 * merges only the trusted `main` base into the already-open draft branch; it
 * never merges the draft PR, changes a workflow, or force-pushes history.
 */
async function refreshFromTrustedMain(gap: RepairGap, pr: Json, readToken: string, writeToken: string): Promise<string | null> {
  const baseHead = str(obj(pr.base).sha);
  const mainRef = obj(await ghJson(`${PREFIX}/git/ref/heads/main`, readToken));
  const trustedMain = str(obj(mainRef.object).sha);
  if (!SHA.test(baseHead) || !SHA.test(trustedMain)) throw new Error("GitHub did not provide immutable base revisions.");
  if (baseHead === trustedMain) return null;

  await ghJson(`${PREFIX}/pulls/${gap.draft_pr_number}/update-branch`, writeToken, {
    method: "PUT",
    body: JSON.stringify({ expected_head_sha: gap.ci_head_sha }),
  });
  for (let poll = 0; poll < 12; poll += 1) {
    await wait(1_000);
    const updated = obj(await githubGet(`${PREFIX}/pulls/${gap.draft_pr_number}`, readToken, "Unable to verify trusted-main synchronization"));
    const head = str(obj(updated.head).sha);
    if (head !== gap.ci_head_sha) return assertRefreshedPullRequest(updated, gap, gap.ci_head_sha);
  }
  throw new Error("GitHub accepted the trusted-main synchronization but did not create a new draft head in time.");
}

async function askCodingModel(gap: RepairGap, current: RepairFiles, logs: string) {
  const model = modelName();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${env("OPENAI_API_KEY")}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: buildRepairInstructions(),
      input: buildRepairInput(gap, current, logs),
      reasoning: { effort: "high" },
      max_output_tokens: 16_000,
      store: false,
      text: { format: { type: "json_schema", name: "terraform_ci_repair", strict: true, schema: REPAIR_OUTPUT_SCHEMA } },
    }),
  });
  if (!response.ok) throw new Error(`Coding model request failed (${response.status}).`);
  return { model, proposal: parseRepairResponse(await response.json()) };
}

function repairArchive(gap: RepairGap, proposal: RepairFiles) {
  const { moduleName } = governedModule(gap);
  const variables = gap.action_type === "increase_os_disk" ? OS_DISK_VARIABLES : CREATE_VM_VARIABLES;
  const root = templateRootFiles(moduleName, variables);
  return [
    { path: `${gap.module_source}/main.tf`, content: proposal.mainTf },
    { path: `${gap.module_source}/variables.tf`, content: proposal.variablesTf },
    { path: `${gap.module_source}/outputs.tf`, content: proposal.outputsTf },
    { path: `${gap.module_source}/versions.tf`, content: moduleVersionsTf() },
    { path: `terraform/environments/pilot/${moduleName}/main.tf`, content: root.main },
    { path: `terraform/environments/pilot/${moduleName}/variables.tf`, content: root.variablesTf },
    { path: `terraform/environments/pilot/${moduleName}/versions.tf`, content: root.versions },
  ].map((file) => ({ ...file, content: formatGeneratedHclAssignments(file.content) }));
}

async function archiveMatchesDraft(gap: RepairGap, archive: Array<{ path: string; content: string }>, token: string) {
  const existing = await Promise.all(archive.map((file) => optionalTerraformFile(file.path, gap.ci_head_sha, token)));
  return archive.every((file, index) => file.content === existing[index]);
}

async function updateBranch(token: string, gap: RepairGap, replacements: Array<{ path: string; content: string }>, message: string) {
  const ref = await ghJson(`${PREFIX}/git/ref/heads/${gap.draft_branch}`, token);
  const head = str(obj(ref.object).sha);
  if (head !== gap.ci_head_sha || !SHA.test(head)) throw new Error("The draft branch moved before the repair commit.");
  const commit = await ghJson(`${PREFIX}/git/commits/${head}`, token);
  const baseTree = str(obj(commit.tree).sha);
  if (!SHA.test(baseTree)) throw new Error("GitHub returned an invalid base tree.");
  const blobs = await Promise.all(replacements.map(async (replacement) => {
    const blob = await ghJson(`${PREFIX}/git/blobs`, token, { method: "POST", body: JSON.stringify({ content: replacement.content, encoding: "utf-8" }) });
    if (!SHA.test(str(blob.sha))) throw new Error("GitHub did not create an immutable source blob.");
    return { path: replacement.path, mode: "100644", type: "blob", sha: str(blob.sha) };
  }));
  const tree = await ghJson(`${PREFIX}/git/trees`, token, { method: "POST", body: JSON.stringify({ base_tree: baseTree, tree: blobs }) });
  if (!SHA.test(str(tree.sha)) || str(tree.sha) === baseTree) throw new Error("The proposed repair did not change the governed archive.");
  const repaired = await ghJson(`${PREFIX}/git/commits`, token, { method: "POST", body: JSON.stringify({ message, tree: str(tree.sha), parents: [head] }) });
  const newHead = str(repaired.sha);
  if (!SHA.test(newHead) || newHead === head) throw new Error("GitHub did not create a new repair commit.");
  await ghJson(`${PREFIX}/git/refs/heads/${gap.draft_branch}`, token, { method: "PATCH", body: JSON.stringify({ sha: newHead, force: false }) });
  return newHead;
}

async function repairGap(value: GapRecord, attempt: number, expectedHeadSha: string) {
  const gap = value as RepairGap;
  governedModule(gap);
  if (gap.ci_head_sha !== expectedHeadSha || !SHA.test(expectedHeadSha)) throw new Error("The failed CI head changed.");
  const readToken = env("GITHUB_TERRAFORM_SOURCE_TOKEN");
  const writeToken = env("GITHUB_TERRAFORM_DRAFT_TOKEN");
  const pr = obj(await githubGet(`${PREFIX}/pulls/${gap.draft_pr_number}`, readToken, "Unable to verify draft pull request"));
  assertOpenPullRequest(pr, gap);

  const refreshedHeadSha = await refreshFromTrustedMain(gap, pr, readToken, writeToken);
  if (refreshedHeadSha) {
    return {
      outcome: "committed" as const,
      model: "trusted-main-refresh",
      summary: "Merged the latest trusted main branch into the existing draft branch so CI can validate the draft against current policy.",
      newHeadSha: refreshedHeadSha,
    };
  }

  // The model is not needed for missing trusted companion files or committed
  // HCL formatting. Regenerate only the governed seven-file archive first.
  const current = await moduleFiles(gap, readToken);
  const deterministicProposal = {
    summary: "Regenerated the governed Terraform archive with trusted companion files and committed formatting.",
    ...current,
  };
  const deterministicArchive = repairArchive(gap, deterministicProposal);
  const deterministicProblems = validateRepairArchive(gap, deterministicProposal, deterministicArchive);
  if (!deterministicProblems.length && !(await archiveMatchesDraft(gap, deterministicArchive, readToken))) {
    const newHeadSha = await updateBranch(writeToken, gap, deterministicArchive, `AI-repair: normalize governed Terraform archive (attempt ${attempt})`);
    return {
      outcome: "committed" as const,
      model: "deterministic-terraform-normalizer",
      summary: "Regenerated trusted companion Terraform files and committed Terraform formatting before requesting a model repair.",
      newHeadSha,
    };
  }

  const ids = failedJobIds(gap.ci_evidence);
  const logParts: string[] = [`Recorded CI evidence:\n${JSON.stringify(gap.ci_evidence).slice(0, 25_000)}`];
  for (const id of ids) {
    try { logParts.push(`GitHub Actions job ${id}:\n${await jobLog(id, readToken)}`); }
    catch { logParts.push(`GitHub Actions job ${id}: detailed log was unavailable; use the recorded evidence.`); }
  }
  const logs = redactCiLog(logParts.join("\n\n"));
  const { model, proposal } = await askCodingModel(gap, current, logs);
  const archive = repairArchive(gap, proposal);
  const problems = validateRepairArchive(gap, proposal, archive);
  if (problems.length) return { outcome: "rejected" as const, model, summary: `Model repair was rejected by policy: ${problems.slice(0, 6).join(" ")}`.slice(0, 1000) };
  if (await archiveMatchesDraft(gap, archive, readToken)) {
    return { outcome: "rejected" as const, model, summary: "The model proposed no governed Terraform change. A human must inspect the CI failure." };
  }
  const newHeadSha = await updateBranch(writeToken, gap, archive, `AI-repair: CI remediation attempt ${attempt}`);
  return { outcome: "committed" as const, model, summary: redactCiLog(proposal.summary, 1000), newHeadSha };
}

const COLUMNS = "id,status,provider,resource_type,action_type,draft_branch,draft_pr_number,ci_status,ci_head_sha,ci_evidence,ci_version,remediation_status,remediation_attempts,remediation_head_sha,linked_capability_id,iac_automation_capabilities!linked_capability_id(module_source,lifecycle_status,provider,resource_type,action_type)";
function mapGap(value: unknown): GapRecord {
  const row = obj(value);
  const capability = obj(row.iac_automation_capabilities);
  return {
    ...row,
    id: str(row.id), provider: str(row.provider), resource_type: str(row.resource_type), action_type: str(row.action_type),
    draft_branch: str(row.draft_branch), draft_pr_number: Number(row.draft_pr_number), ci_head_sha: str(row.ci_head_sha),
    ci_evidence: obj(row.ci_evidence), module_source: str(capability.module_source), capability_lifecycle_status: str(capability.lifecycle_status),
  };
}

Deno.serve(async (request) => {
  let db: ReturnType<typeof admin>;
  try { db = admin(); } catch { return new Response(JSON.stringify({ error: "Server configuration unavailable." }), { status: 503, headers: { ...cors(request), "content-type": "application/json", "cache-control": "no-store" } }); }
  return createRemediationHandler({
    headers: cors,
    authenticate: async (req) => {
      const auth = req.headers.get("authorization") ?? "";
      if (!auth.startsWith("Bearer ")) return null;
      const token = auth.slice(7);
      if (token === db.key) return null;
      const { data, error } = await db.client.auth.getUser(token);
      if (error || !data.user) return null;
      const role = await db.client.from("user_roles").select("user_id").eq("user_id", data.user.id).eq("role", "platform_admin").maybeSingle();
      if (role.error) throw role.error;
      return { id: data.user.id, isAdmin: !!role.data };
    },
    ready: () => {
      const model = modelName();
      const missing = ["GITHUB_TERRAFORM_SOURCE_TOKEN", "GITHUB_TERRAFORM_DRAFT_TOKEN", "OPENAI_API_KEY"].filter((name) => !env(name));
      if (missing.length) return { ready: false, reason: `CI remediation is not configured: missing ${missing.join(", ")}.` };
      if (!/^[A-Za-z0-9._:-]{1,100}$/.test(model)) return { ready: false, reason: "The remediation model setting is invalid." };
      return { ready: true };
    },
    getGap: async (gapId) => {
      const { data, error } = await db.client.from("iac_engineering_gaps").select(COLUMNS).eq("id", gapId).maybeSingle();
      if (error) throw error;
      return data ? mapGap(data) : null;
    },
    claim: async (gapId, expectedVersion, expectedHeadSha) => {
      const { data, error } = await db.client.rpc("claim_iac_ci_remediation", { p_gap_id: gapId, p_expected_version: expectedVersion, p_expected_head_sha: expectedHeadSha, p_max_attempts: 3 });
      if (error) throw error;
      const claim = obj(data);
      return { claimed: claim.claimed === true, exhausted: claim.exhausted === true, attempt: Number(claim.attempt), headSha: str(claim.headSha) } as Claim;
    },
    repair: repairGap,
    complete: async (input: CompleteInput) => {
      const { data, error } = await db.client.rpc("complete_iac_ci_remediation", {
        p_gap_id: input.gapId, p_expected_head_sha: input.expectedHeadSha, p_attempt: input.attempt,
        p_outcome: input.outcome, p_new_head_sha: input.newHeadSha ?? null,
        p_model: input.model, p_summary: input.summary,
      });
      if (error) throw error;
      return obj(data);
    },
  })(request);
});
