import { REPOSITORY, REQUIRED_WORKFLOWS } from "./ci-evidence.ts";
import type { GapRecord } from "./handler.ts";

export const HEAD = "a".repeat(40), BASE = "b".repeat(40), MERGE = "c".repeat(40), BLOB = "d".repeat(40);
export const GAP: GapRecord = {
  id: "10000000-0000-0000-0000-000000000001", draft_pr_number: 13, draft_branch: "ai-draft/vm-create-test", module_source: "terraform/modules/vm-create",
  ci_version: 3, ci_head_sha: HEAD, requested_by: "10000000-0000-0000-0000-000000000002", status: "ci_passed",
  capabilityId: "10000000-0000-0000-0000-000000000004", capabilitySnapshot: { module_source: "terraform/modules/vm-create" }, reviewedCapabilitySnapshot: { module_source: "terraform/modules/vm-create" },
};
export const REVIEWER = "10000000-0000-0000-0000-000000000003";
type ObjectValue = Record<string, unknown>;
export function fixture(merged = false, transform?: (path: string, value: unknown, count: number) => unknown) {
  const requests: string[] = [];
  const repo = { full_name: REPOSITORY };
  const pr = { number: 13, head: { sha: HEAD, ref: GAP.draft_branch, repo }, base: { sha: BASE, ref: "main", repo }, state: merged ? "closed" : "open", merged, merge_commit_sha: merged ? MERGE : null, user: { login: "drafter", type: "User" } };
  const run = (index: number) => ({ id: 100 + index, workflow_id: 10 + index, path: REQUIRED_WORKFLOWS[index].path, run_attempt: 1, event: "pull_request", head_sha: HEAD, head_branch: GAP.draft_branch, repository: repo, head_repository: repo, pull_requests: [{ number: 13, head: { sha: HEAD } }], status: "completed", conclusion: "success" });
  const jobs = (index: number) => ({ jobs: [{ id: 1000 + index, run_id: 100 + index, head_sha: HEAD, name: REQUIRED_WORKFLOWS[index].job, status: "completed", conclusion: "success", steps: REQUIRED_WORKFLOWS[index].steps.map((name) => ({ name, status: "completed", conclusion: "success" })) }] });
  const get = async (path: string): Promise<unknown> => {
    requests.push(path);
    let value: unknown;
    if (/\/pulls\/13$/.test(path)) value = pr;
    else if (path.includes("/contents/")) value = { sha: BLOB, type: "file" };
    else if (path.includes("/compare/")) value = { status: "ahead" };
    else if (path.includes("/git/trees/")) value = { truncated: false, tree: ["terraform/modules/vm-create/main.tf", "terraform/environments/pilot/vm-create/main.tf"].map((name) => ({ path: name, sha: BLOB, mode: "100644", type: "blob" })) };
    else if (path.includes("/pulls/13/reviews")) value = [{ id: 200, state: "APPROVED", commit_id: HEAD, user: { login: "reviewer", type: "User" } }];
    else if (path.includes(`/commits/${HEAD}/pulls`)) value = [{ number: 13, head: { sha: HEAD } }];
    else {
      for (const [index, required] of REQUIRED_WORKFLOWS.entries()) {
        if (path.endsWith(`/actions/workflows/${required.path.split("/").pop()}`)) value = { id: 10 + index, state: "active", path: required.path };
        else if (path.includes(`/actions/workflows/${10 + index}/runs?`)) value = { workflow_runs: [run(index)] };
        else if (path.endsWith(`/actions/runs/${100 + index}`)) value = run(index);
        else if (path.includes(`/actions/runs/${100 + index}/attempts/1/jobs?`)) value = jobs(index);
      }
    }
    if (value === undefined) throw new Error(`Unexpected test request: ${path}`);
    const copy = structuredClone(value);
    return transform ? transform(path, copy, requests.filter((item) => item === path).length) : copy;
  };
  return { get, requests };
}
export const object = (value: unknown) => value as ObjectValue;
