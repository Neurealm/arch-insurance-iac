// Shared, read-only GitHub Contents/Trees API helpers used by every Agentic
// IaC background agent that needs to read approved Terraform source or
// inspect the repository tree (terraform-orchestrator, capability-resolver,
// terraform-ci-status-sync). Nothing here ever writes to GitHub -- agents
// that need to open branches/PRs (terraform-drafting-agent) use a separate,
// explicitly write-scoped token and their own commit/PR helpers, never this
// module, so a read-only caller can never accidentally be handed write
// credentials through a shared import.

export type Json = Record<string, unknown>;

export const obj = (value: unknown): Json =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : {};
export const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
export const arr = (value: unknown) => (Array.isArray(value) ? value : []);

/**
 * GET against the GitHub REST API with a bearer token. Throws with
 * `errorPrefix` + the HTTP status on failure, matching the message shape
 * terraform-orchestrator has always used so existing error text/behavior is
 * unchanged for callers that pass the same prefix.
 */
export async function githubGet(path: string, token: string, errorPrefix = "GitHub request failed"): Promise<unknown> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error(`${errorPrefix} (${response.status}).`);
  return response.json();
}

/** Decode a GitHub Contents API base64 payload (whitespace-tolerant) into raw bytes. */
export function decodeBase64(value: string): Uint8Array {
  const raw = atob(value.replace(/\s/g, ""));
  return Uint8Array.from(raw, (item) => item.charCodeAt(0));
}

/** Resolve a ref (branch/tag/sha) to its immutable 40-char commit SHA. */
export async function resolveRevision(repo: string, ref: string, token: string, errorPrefix = "Unable to resolve Terraform source revision"): Promise<string> {
  const commit = obj(await githubGet(`/repos/${repo}/commits/${encodeURIComponent(ref)}`, token, errorPrefix));
  const revision = str(commit.sha);
  if (!/^[0-9a-f]{40}$/i.test(revision)) throw new Error("GitHub did not return an immutable source revision.");
  return revision;
}

export type TreeEntry = { path: string; type: string };

/** Full recursive git tree for a resolved revision. */
export async function fetchTree(repo: string, revision: string, token: string, errorPrefix = "Unable to read repository tree"): Promise<TreeEntry[]> {
  const tree = arr(obj(await githubGet(`/repos/${repo}/git/trees/${revision}?recursive=1`, token, errorPrefix)).tree).map(obj);
  return tree.map((item) => ({ path: str(item.path), type: str(item.type) }));
}

/** Blob paths under `prefix/` ending in `suffix` (e.g. ".tf"). */
export function filesUnder(tree: TreeEntry[], prefix: string, suffix: string): string[] {
  return tree.filter((item) => item.type === "blob" && item.path.startsWith(`${prefix}/`) && item.path.endsWith(suffix)).map((item) => item.path);
}

/** Fetch and base64-decode one file's content at a resolved revision. */
export async function fetchFileBytes(repo: string, path: string, revision: string, token: string, errorPrefix = "Unable to read Terraform source file"): Promise<Uint8Array> {
  const content = str(obj(await githubGet(`/repos/${repo}/contents/${path}?ref=${revision}`, token, errorPrefix)).content);
  return decodeBase64(content);
}

/** Distinct top-level directory names directly under `prefix/` (one level deep, e.g. every module name under terraform/modules). */
export function directNamesUnder(tree: TreeEntry[], prefix: string): string[] {
  const names = new Set<string>();
  for (const item of tree) {
    if (!item.path.startsWith(`${prefix}/`)) continue;
    const rest = item.path.slice(prefix.length + 1);
    const name = rest.split("/")[0];
    if (name) names.add(name);
  }
  return [...names].sort();
}
