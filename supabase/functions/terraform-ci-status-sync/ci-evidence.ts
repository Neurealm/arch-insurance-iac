// Read-only GitHub observations. No check-name-only trust, GitHub writes,
// workflow dispatch, cloud credentials, plan or apply operations live here.
import { arr, obj, str } from "../_shared/github.ts";
import type { Json } from "../_shared/github.ts";

export const REPOSITORY = "Neurealm/arch-insurance-iac";
const PREFIX = `/repos/${REPOSITORY}`;
const SHA = /^[0-9a-f]{40}$/;
export type Get = (path: string) => Promise<unknown>;
export type Gap = { id: string; draft_pr_number: number; draft_branch: string; module_source: string; capabilityId: string; capabilitySnapshot: Json };
export type Evidence = {
  schemaVersion: 1; repository: string; prNumber: number; branch: string;
  headSha: string | null; observedAt: string; status: "unknown" | "running" | "passed" | "failed";
  reason: string; workflows: Json[]; promotionReady: boolean; promotionReason: string;
  capabilityId: string; capabilitySnapshot: Json;
  prState?: string; merged?: boolean; mergeSha?: string; review?: Json;
};
// Job names AND security-relevant steps must have actually succeeded.
export const REQUIRED_WORKFLOWS = [
  { path: ".github/workflows/terraform-static-validation.yml", job: "validate", steps: ["Formatting", "Validate every Terraform module and pilot root"] },
  { path: ".github/workflows/bp1-1-platform-foundation.yml", job: "Terraform governance SQL", steps: ["Apply governance contract and migration", "Verify Terraform governance"] },
] as const;

function integer(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1) throw new Error("GitHub returned an invalid numeric identity.");
  return Number(value);
}
function sha(value: unknown): string {
  if (!SHA.test(str(value))) throw new Error("GitHub returned an invalid immutable revision.");
  return str(value);
}
function repository(value: unknown) { return str(obj(value).full_name).toLowerCase() === REPOSITORY.toLowerCase(); }
function assertPullRequest(pr: Json, gap: Gap) {
  if (pr.number !== gap.draft_pr_number || !repository(obj(pr.head).repo) || !repository(obj(pr.base).repo) || str(obj(pr.base).ref) !== "main" || str(obj(pr.head).ref) !== gap.draft_branch) {
    throw new Error("Pull request repository, branch or target does not match the engineering gap.");
  }
  sha(obj(pr.head).sha);
  sha(obj(pr.base).sha);
}
async function list(get: Get, path: string, field?: string): Promise<Json[]> {
  const all: Json[] = [];
  for (let page = 1; page <= 10; page++) {
    const response = await get(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    const values = field ? obj(response)[field] : response;
    if (!Array.isArray(values)) throw new Error("GitHub returned an incomplete result list.");
    all.push(...values.map(obj));
    if (values.length < 100) return all;
  }
  throw new Error("GitHub evidence pagination limit exceeded; human investigation required.");
}
function matchesRun(run: Json, workflowId: number, path: string, gap: Gap, head: string) {
  return run.workflow_id === workflowId && str(run.path) === path && str(run.event) === "pull_request" &&
    str(run.head_sha) === head && str(run.head_branch) === gap.draft_branch && repository(run.repository) && repository(run.head_repository);
}
function runVersion(run: Json) { return `${run.id}:${run.run_attempt}:${run.status}:${run.conclusion}:${run.head_sha}`; }

/**
 * GitHub's workflow-run API only lists a run's associated `pull_requests`
 * while that PR is still open -- once merged (observed directly: a run's
 * `pull_requests` field goes from populated to `[]` the moment its PR
 * merges, even though the run itself and its head_sha are unchanged), that
 * field can no longer be used to confirm which PR a run belongs to. Since
 * promotion is only ever evaluated *after* merge, relying on it there would
 * make every promotion permanently stuck at "no matching pull-request run
 * for the current head" despite CI having genuinely passed pre-merge.
 * `GET /commits/{sha}/pulls` remains accurate regardless of merge state, so
 * it replaces the run's own `pull_requests` field as the source of truth.
 */
async function confirmCommitBelongsToPr(get: Get, gap: Gap, head: string): Promise<boolean> {
  const associated = await list(get, `${PREFIX}/commits/${head}/pulls`);
  return associated.some((pull) => pull.number === gap.draft_pr_number && str(obj(pull.head).sha) === head);
}

async function workflowEvidence(get: Get, required: typeof REQUIRED_WORKFLOWS[number], gap: Gap, pr: Json, prConfirmed: boolean) {
  const head = sha(obj(pr.head).sha), base = sha(obj(pr.base).sha);
  if (!prConfirmed) return { status: "unknown" as const, evidence: { path: required.path, reason: "GitHub no longer associates this commit with the expected pull request." } };
  const workflow = obj(await get(`${PREFIX}/actions/workflows/${required.path.split("/").pop()}`));
  const workflowId = integer(workflow.id);
  if (workflow.path !== required.path || workflow.state !== "active") throw new Error("Required validation workflow is not active at its trusted path.");
  // A PR must not change the workflow that claims to validate its own code.
  const baseFile = obj(await get(`${PREFIX}/contents/${required.path}?ref=${base}`));
  const headFile = obj(await get(`${PREFIX}/contents/${required.path}?ref=${head}`));
  if (baseFile.type !== "file" || headFile.type !== "file" || sha(baseFile.sha) !== sha(headFile.sha)) throw new Error("Draft changes a trusted validation workflow; separate workflow review is required.");
  const runs = (await list(get, `${PREFIX}/actions/workflows/${workflowId}/runs?event=pull_request&head_sha=${head}`, "workflow_runs"))
    .filter((run) => matchesRun(run, workflowId, required.path, gap, head))
    .sort((a, b) => integer(b.id) - integer(a.id));
  if (!runs.length) return { status: "unknown" as const, evidence: { path: required.path, workflowId, reason: "No matching pull-request run for the current head." } };
  const run = obj(await get(`${PREFIX}/actions/runs/${integer(runs[0].id)}`));
  if (!matchesRun(run, workflowId, required.path, gap, head)) throw new Error("Workflow run identity changed during synchronization.");
  const attempt = integer(run.run_attempt);
  const jobs = await list(get, `${PREFIX}/actions/runs/${integer(run.id)}/attempts/${attempt}/jobs`, "jobs");
  const requiredJobs = jobs.filter((job) => job.name === required.job);
  const evidence: Json = { path: required.path, workflowId, workflowBlobSha: sha(headFile.sha), runId: run.id, attempt, headSha: head, status: run.status, conclusion: run.conclusion, jobs: requiredJobs.map((job) => ({ id: job.id, name: job.name, status: job.status, conclusion: job.conclusion, steps: arr(job.steps).filter((value) => required.steps.includes(str(obj(value).name) as never)).map((value) => { const step = obj(value); return { name: step.name, status: step.status, conclusion: step.conclusion }; }) })) };
  const after = obj(await get(`${PREFIX}/actions/runs/${integer(run.id)}`));
  if (runVersion(after) !== runVersion(run)) return { status: "unknown" as const, evidence: { ...evidence, reason: "Workflow reran or changed while evidence was collected." } };
  if (run.status !== "completed") return { status: "running" as const, evidence };
  if (run.conclusion !== "success") return { status: "failed" as const, evidence };
  if (requiredJobs.length !== 1) return { status: "unknown" as const, evidence: { ...evidence, reason: "Required job is absent or ambiguous." } };
  const job = requiredJobs[0];
  if (job.run_id !== run.id || job.head_sha !== head) throw new Error("Required job does not belong to the observed run/head.");
  if (job.status !== "completed") return { status: "running" as const, evidence };
  if (job.conclusion !== "success") return { status: "failed" as const, evidence };
  for (const name of required.steps) {
    const steps = arr(job.steps).map(obj).filter((step) => step.name === name);
    if (steps.length !== 1 || steps[0].status !== "completed" || steps[0].conclusion !== "success") return { status: "failed" as const, evidence: { ...evidence, reason: `Required step did not succeed: ${name}` } };
  }
  return { status: "passed" as const, evidence };
}

async function sourceTree(get: Get, revision: string, moduleSource: string) {
  if (!/^terraform\/modules\/[a-z0-9_-]+$/.test(moduleSource)) throw new Error("Capability module path is invalid.");
  const root = `terraform/environments/pilot/${moduleSource.split("/").pop()}`;
  const tree = obj(await get(`${PREFIX}/git/trees/${revision}?recursive=1`));
  if (tree.truncated !== false || !Array.isArray(tree.tree)) throw new Error("Cannot verify a truncated source tree.");
  const entries = arr(tree.tree).map(obj).filter((entry) => str(entry.path).startsWith(`${moduleSource}/`) || str(entry.path).startsWith(`${root}/`));
  const blobs = entries.filter((entry) => entry.type !== "tree");
  if (!blobs.some((entry) => entry.path === `${moduleSource}/main.tf`) || !blobs.some((entry) => entry.path === `${root}/main.tf`)) throw new Error("Reviewed module and HCP root must both exist.");
  if (blobs.some((entry) => entry.type !== "blob" || entry.mode !== "100644")) throw new Error("Reviewed Terraform source must not contain symlinks, executables or submodules.");
  return JSON.stringify(blobs.map((entry) => [str(entry.path), sha(entry.sha)]).sort((a, b) => a[0].localeCompare(b[0])));
}
async function promotionEvidence(get: Get, gap: Gap, pr: Json): Promise<{ ready: boolean; reason: string; mergeSha?: string; review?: Json }> {
  if (pr.merged !== true || pr.state !== "closed") return { ready: false, reason: "A human must review and merge this PR into main before capability promotion." };
  const head = sha(obj(pr.head).sha), mergeSha = sha(pr.merge_commit_sha);
  const comparison = obj(await get(`${PREFIX}/compare/${mergeSha}...main`));
  if (!["ahead", "identical"].includes(str(comparison.status))) return { ready: false, reason: "Merged revision is not an ancestor of trusted main." };
  const [tested, merged] = await Promise.all([sourceTree(get, head, gap.module_source), sourceTree(get, mergeSha, gap.module_source)]);
  if (tested !== merged) return { ready: false, reason: "Merged Terraform module/root differs from the exact CI-tested source." };
  const reviews = await list(get, `${PREFIX}/pulls/${gap.draft_pr_number}/reviews`);
  const latest = new Map<string, Json>();
  for (const review of reviews.sort((a, b) => integer(a.id) - integer(b.id))) {
    if (!["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(str(review.state))) continue;
    const reviewer = obj(review.user);
    if (reviewer.type !== "User" || str(reviewer.login) === str(obj(pr.user).login)) continue;
    latest.set(str(reviewer.login), review);
  }
  if ([...latest.values()].some((review) => review.state === "CHANGES_REQUESTED")) return { ready: false, reason: "An independent reviewer still requests changes." };
  const approved = [...latest.values()].find((review) => review.state === "APPROVED" && review.commit_id === head);
  if (!approved) return { ready: false, reason: "An independent human GitHub approval of the exact current head is required." };
  return { ready: true, reason: "Reviewed, merged and CI-tested source matches; independent platform approval is still required.", mergeSha, review: { id: approved.id, reviewer: str(obj(approved.user).login), commitId: approved.commit_id, state: approved.state } };
}

export async function inspectCi(get: Get, gap: Gap, now = () => new Date()): Promise<Evidence> {
  const result: Evidence = { schemaVersion: 1, repository: REPOSITORY, prNumber: gap.draft_pr_number, branch: gap.draft_branch, headSha: null, observedAt: now().toISOString(), status: "unknown", reason: "CI evidence is not available.", workflows: [], promotionReady: false, promotionReason: "CI must pass before promotion can be considered.", capabilityId: gap.capabilityId, capabilitySnapshot: gap.capabilitySnapshot };
  try {
    integer(gap.draft_pr_number);
    const pr = obj(await get(`${PREFIX}/pulls/${gap.draft_pr_number}`));
    assertPullRequest(pr, gap);
    result.headSha = sha(obj(pr.head).sha); result.prState = str(pr.state); result.merged = pr.merged === true;
    if (pr.state === "closed" && pr.merged !== true) { result.status = "failed"; result.reason = "Pull request was closed without merging."; return result; }
    if (!["open", "closed"].includes(str(pr.state))) throw new Error("Pull request state is unknown.");
    const prConfirmed = await confirmCommitBelongsToPr(get, gap, result.headSha);
    const statuses: Evidence["status"][] = [];
    for (const required of REQUIRED_WORKFLOWS) {
      const observation = await workflowEvidence(get, required, gap, pr, prConfirmed);
      result.workflows.push(observation.evidence); statuses.push(observation.status);
    }
    result.status = statuses.includes("failed") ? "failed" : statuses.includes("unknown") ? "unknown" : statuses.includes("running") ? "running" : "passed";
    result.reason = result.status === "passed" ? "All required current-head workflow jobs and validation steps succeeded. This is static evidence, not execution approval." : "Required current-head CI is incomplete or did not succeed.";
    if (result.status === "passed") {
      const promotion = await promotionEvidence(get, gap, pr);
      result.promotionReady = promotion.ready; result.promotionReason = promotion.reason;
      if (promotion.mergeSha) result.mergeSha = promotion.mergeSha;
      if (promotion.review) result.review = promotion.review;
    }
    // Re-read PR after collecting evidence: never store success for a moved head.
    const after = obj(await get(`${PREFIX}/pulls/${gap.draft_pr_number}`));
    assertPullRequest(after, gap);
    if (obj(after.head).sha !== result.headSha || after.state !== pr.state || after.merged !== pr.merged || after.merge_commit_sha !== pr.merge_commit_sha) throw new Error("Pull request changed while evidence was collected; synchronize again.");
  } catch (cause) {
    result.status = "unknown"; result.promotionReady = false;
    result.reason = cause instanceof Error ? cause.message : "Unable to verify GitHub evidence.";
    result.promotionReason = "Unknown evidence cannot authorize promotion.";
  }
  return result;
}
