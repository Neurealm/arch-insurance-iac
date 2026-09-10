import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { decodeBase64, githubGet, obj, str } from "../_shared/github.ts";
import { createRemediationHandler, type Claim, type CompleteInput, type GapRecord } from "./handler.ts";
import {
  REPAIR_OUTPUT_SCHEMA, buildRepairInput, buildRepairInstructions, failedJobIds,
  governedModule, parseRepairResponse, redactCiLog, validateRepairProposal,
  type Json, type RepairFiles, type RepairGap,
} from "./policy.ts";

const REPOSITORY = "Neurealm/arch-insurance-iac";
const PREFIX = `/repos/${REPOSITORY}`;
const DEFAULT_MODEL = "gpt-6-astra";
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
    headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "x-github-api-version": "2022-11-28", ...(init.headers ?? {}) },
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

async function moduleFiles(gap: RepairGap, token: string): Promise<RepairFiles> {
  const file = async (name: string) => {
    const result = obj(await githubGet(`${PREFIX}/contents/${gap.module_source}/${name}?ref=${gap.ci_head_sha}`, token, "Unable to read failed Terraform source"));
    if (result.type !== "file" || result.encoding !== "base64") throw new Error("GitHub returned an invalid Terraform source file.");
    const decoded = new TextDecoder().decode(decodeBase64(str(result.content)));
    if (!decoded || decoded.length > 20_000) throw new Error("Terraform source file is empty or oversized.");
    return decoded;
  };
  const [mainTf, variablesTf, outputsTf] = await Promise.all([file("main.tf"), file("variables.tf"), file("outputs.tf")]);
  return { mainTf, variablesTf, outputsTf };
}

function assertOpenPullRequest(pr: Json, gap: RepairGap) {
  if (pr.number !== gap.draft_pr_number || pr.state !== "open" || pr.merged === true || !repo(obj(pr.head).repo) || !repo(obj(pr.base).repo)
    || str(obj(pr.base).ref) !== "main" || str(obj(pr.head).ref) !== gap.draft_branch || str(obj(pr.head).sha) !== gap.ci_head_sha) {
    throw new Error("The pull request no longer matches the failed draft head.");
  }
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

async function updateBranch(token: string, gap: RepairGap, current: RepairFiles, proposal: RepairFiles, message: string) {
  if (current.mainTf === proposal.mainTf && current.variablesTf === proposal.variablesTf && current.outputsTf === proposal.outputsTf) throw new Error("The proposed repair did not change the module.");
  const ref = await ghJson(`${PREFIX}/git/ref/heads/${gap.draft_branch}`, token);
  const head = str(obj(ref.object).sha);
  if (head !== gap.ci_head_sha || !SHA.test(head)) throw new Error("The draft branch moved before the repair commit.");
  const commit = await ghJson(`${PREFIX}/git/commits/${head}`, token);
  const baseTree = str(obj(commit.tree).sha);
  if (!SHA.test(baseTree)) throw new Error("GitHub returned an invalid base tree.");
  const replacements = [
    { path: `${gap.module_source}/main.tf`, content: proposal.mainTf },
    { path: `${gap.module_source}/variables.tf`, content: proposal.variablesTf },
    { path: `${gap.module_source}/outputs.tf`, content: proposal.outputsTf },
  ];
  const blobs = await Promise.all(replacements.map(async (replacement) => {
    const blob = await ghJson(`${PREFIX}/git/blobs`, token, { method: "POST", body: JSON.stringify({ content: replacement.content, encoding: "utf-8" }) });
    if (!SHA.test(str(blob.sha))) throw new Error("GitHub did not create an immutable source blob.");
    return { path: replacement.path, mode: "100644", type: "blob", sha: str(blob.sha) };
  }));
  const tree = await ghJson(`${PREFIX}/git/trees`, token, { method: "POST", body: JSON.stringify({ base_tree: baseTree, tree: blobs }) });
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

  const ids = failedJobIds(gap.ci_evidence);
  const logParts: string[] = [`Recorded CI evidence:\n${JSON.stringify(gap.ci_evidence).slice(0, 25_000)}`];
  for (const id of ids) {
    try { logParts.push(`GitHub Actions job ${id}:\n${await jobLog(id, readToken)}`); }
    catch { logParts.push(`GitHub Actions job ${id}: detailed log was unavailable; use the recorded evidence.`); }
  }
  const logs = redactCiLog(logParts.join("\n\n"));
  const current = await moduleFiles(gap, readToken);
  const { model, proposal } = await askCodingModel(gap, current, logs);
  const problems = validateRepairProposal(gap, proposal);
  if (problems.length) return { outcome: "rejected" as const, model, summary: `Model repair was rejected by policy: ${problems.slice(0, 6).join(" ")}`.slice(0, 1000) };
  const newHeadSha = await updateBranch(writeToken, gap, current, proposal, `AI-repair: CI remediation attempt ${attempt}`);
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
