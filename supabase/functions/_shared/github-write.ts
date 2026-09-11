// Write-capable GitHub Git Data API client, shared by the two agents allowed
// to write to GitHub: terraform-drafting-agent (opens new branches/PRs) and
// terraform-ci-remediation-agent (updates an existing draft branch). Neither
// imports ./github.ts, which is deliberately read-only by contract (see its
// header comment) -- this module is the one place a write token is used.
//
// Previously each agent implemented its own minimal fetch wrapper; they had
// drifted so that one surfaced GitHub's actual error message on failure and
// the other discarded it (bare status code only). Unifying here means a
// production failure is debuggable from either caller's logs.

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
const str = (value: unknown) => typeof value === "string" ? value.trim() : "";

export function draftGitHubToken(): string {
  const token = str(Deno.env.get("GITHUB_TERRAFORM_DRAFT_TOKEN"));
  if (!token) throw new Error("GITHUB_TERRAFORM_DRAFT_TOKEN is not configured.");
  return token;
}

/**
 * Core write-capable GitHub REST fetch. Always surfaces GitHub's own error
 * message (never just the status code) so a production failure is
 * debuggable, and always parses the response body even on failure so the
 * caller has it available.
 */
export async function githubWriteRequest(path: string, token: string, init: RequestInit = {}): Promise<Json> {
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
  const body = obj(await response.json().catch(() => ({})));
  if (!response.ok) throw new Error(`GitHub ${path} returned ${response.status}: ${str(body.message) || "request failed"}`);
  return body;
}

/**
 * Opens a brand-new branch (from `baseBranch`'s current tip) containing
 * exactly `files`, and opens a PR for it. Used only by terraform-drafting-agent.
 */
export async function openPullRequest(
  token: string,
  repository: string,
  branch: string,
  baseBranch: string,
  files: Array<{ path: string; content: string }>,
  commitMessage: string,
  prTitle: string,
  prBody: string,
): Promise<{ number: number; url: string }> {
  const baseRef = await githubWriteRequest(`/repos/${repository}/git/ref/heads/${baseBranch}`, token);
  const baseCommitSha = str(obj(baseRef.object).sha);
  const baseCommit = await githubWriteRequest(`/repos/${repository}/git/commits/${baseCommitSha}`, token);
  const baseTreeSha = str(obj(baseCommit.tree).sha);

  const blobs = await Promise.all(files.map(async (file) => {
    const blob = await githubWriteRequest(`/repos/${repository}/git/blobs`, token, { method: "POST", body: JSON.stringify({ content: file.content, encoding: "utf-8" }) });
    return { path: file.path, mode: "100644", type: "blob", sha: str(blob.sha) };
  }));
  const tree = await githubWriteRequest(`/repos/${repository}/git/trees`, token, { method: "POST", body: JSON.stringify({ base_tree: baseTreeSha, tree: blobs }) });
  const commit = await githubWriteRequest(`/repos/${repository}/git/commits`, token, { method: "POST", body: JSON.stringify({ message: commitMessage, tree: str(tree.sha), parents: [baseCommitSha] }) });
  await githubWriteRequest(`/repos/${repository}/git/refs`, token, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: str(commit.sha) }) });
  const pr = await githubWriteRequest(`/repos/${repository}/pulls`, token, { method: "POST", body: JSON.stringify({ title: prTitle, head: branch, base: baseBranch, body: prBody }) });
  return { number: Number(pr.number), url: str(pr.html_url) };
}
