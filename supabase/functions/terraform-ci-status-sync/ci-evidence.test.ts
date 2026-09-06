import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectCi } from "./ci-evidence.ts";
import { fixture, GAP, HEAD, MERGE, object } from "./test-fixture.ts";

test("current exact-head required jobs pass but an open PR never authorizes promotion", async () => {
  const f = fixture(); const result = await inspectCi(f.get, GAP);
  assert.equal(result.status, "passed"); assert.equal(result.promotionReady, false);
  assert.equal(result.headSha, HEAD); assert.equal(result.workflows.length, 2);
  assert.ok(f.requests.every((path) => path.startsWith("/repos/Neurealm/arch-insurance-iac/")));
});
test("merged code, exact-head human review and source equality permit only a future human decision", async () => {
  const result = await inspectCi(fixture(true).get, GAP);
  assert.equal(result.status, "passed"); assert.equal(result.promotionReady, true); assert.equal(result.mergeSha, MERGE);
});
for (const key of ["repo", "branch", "base", "number", "head"]) test(`rejects mismatched PR ${key}`, async () => {
  const result = await inspectCi(fixture(false, (path, raw) => {
    if (!path.endsWith("/pulls/13")) return raw;
    const pr = object(raw);
    if (key === "repo") object(pr.head).repo = { full_name: "attacker/fork" };
    if (key === "branch") object(pr.head).ref = "other";
    if (key === "base") object(pr.base).ref = "other";
    if (key === "number") pr.number = 14;
    if (key === "head") object(pr.head).sha = "main";
    return pr;
  }).get, GAP); assert.equal(result.status, "unknown"); assert.equal(result.promotionReady, false);
});
test("closed unmerged PR fails", async () => {
  const result = await inspectCi(fixture(false, (path, raw) => path.endsWith("/pulls/13") ? { ...object(raw), state: "closed" } : raw).get, GAP);
  assert.equal(result.status, "failed");
});
for (const state of ["disabled_manually", "deleted"]) test(`rejects ${state} required workflow`, async () => {
  const result = await inspectCi(fixture(false, (path, raw) => path.endsWith("terraform-static-validation.yml") ? { ...object(raw), state } : raw).get, GAP);
  assert.equal(result.status, "unknown");
});
test("a workflow changed inside the draft cannot validate itself", async () => {
  const result = await inspectCi(fixture(false, (path, raw) => path.includes("/contents/") && path.endsWith(HEAD) ? { ...object(raw), sha: "f".repeat(40) } : raw).get, GAP);
  assert.equal(result.status, "unknown"); assert.match(result.reason, /trusted validation workflow/);
});
for (const key of ["head_sha", "event", "workflow_id", "path", "repository", "head_repository", "pull_requests", "head_branch"]) test(`does not trust a green run with wrong ${key}`, async () => {
  const result = await inspectCi(fixture(false, (path, raw) => {
    if (!path.includes("/runs?")) return raw;
    const response = object(raw), run = object((response.workflow_runs as unknown[])[0]);
    run[key] = key === "workflow_id" ? 999 : key === "pull_requests" ? [] : key.includes("repository") ? { full_name: "attacker/fork" } : "wrong";
    return response;
  }).get, GAP); assert.equal(result.status, "unknown");
});
for (const conclusion of ["failure", "cancelled", "skipped", "neutral", "timed_out", "action_required", "stale"]) test(`run ${conclusion} cannot be passing evidence`, async () => {
  const result = await inspectCi(fixture(false, (path, raw) => path.endsWith("/actions/runs/100") ? { ...object(raw), conclusion } : raw).get, GAP);
  assert.equal(result.status, "failed");
});
test("queued/in-progress latest run supersedes previous green result", async () => {
  const result = await inspectCi(fixture(false, (path, raw) => path.endsWith("/actions/runs/100") ? { ...object(raw), status: "in_progress", conclusion: null } : raw).get, GAP);
  assert.equal(result.status, "running");
});
test("a rerun started during job collection invalidates the snapshot", async () => {
  const result = await inspectCi(fixture(false, (path, raw, count) => path.endsWith("/actions/runs/100") && count > 1 ? { ...object(raw), run_attempt: 2 } : raw).get, GAP);
  assert.equal(result.status, "unknown");
});
for (const kind of ["missing", "duplicate", "skipped", "spoofed", "stepSkipped", "stepMissing"]) test(`required job ${kind} fails closed`, async () => {
  const result = await inspectCi(fixture(false, (path, raw) => {
    if (!path.includes("/attempts/1/jobs?")) return raw;
    const response = object(raw), jobs = response.jobs as Record<string, unknown>[];
    if (kind === "missing") response.jobs = [];
    if (kind === "duplicate") jobs.push(structuredClone(jobs[0]));
    if (kind === "skipped") jobs[0].conclusion = "skipped";
    if (kind === "spoofed") jobs[0].run_id = 999;
    if (kind === "stepSkipped") (jobs[0].steps as Record<string, unknown>[])[0].conclusion = "skipped";
    if (kind === "stepMissing") jobs[0].steps = [];
    return response;
  }).get, GAP); assert.notEqual(result.status, "passed");
});
test("a moved head at the final PR re-read invalidates all green checks", async () => {
  const result = await inspectCi(fixture(false, (path, raw, count) => {
    if (path.endsWith("/pulls/13") && count > 1) object(object(raw).head).sha = "f".repeat(40);
    return raw;
  }).get, GAP); assert.equal(result.status, "unknown");
});
test("API outage or permission denial clears success and cannot promote", async () => {
  const result = await inspectCi(async () => { throw new Error("Cannot verify GitHub evidence (403)."); }, GAP);
  assert.equal(result.status, "unknown"); assert.equal(result.promotionReady, false);
});
for (const kind of ["unrelatedMain", "mergeChangedSource", "symlink", "truncatedTree", "missingRoot", "oldReview", "botReview", "selfReview", "changesRequested", "dismissedReview"]) test(`promotion rejects ${kind}`, async () => {
  const result = await inspectCi(fixture(true, (path, raw) => {
    if (kind === "unrelatedMain" && path.includes("/compare/")) return { status: "diverged" };
    if (path.includes("/git/trees/")) {
      const response = object(raw), entries = response.tree as Record<string, unknown>[];
      if (kind === "mergeChangedSource" && path.includes(MERGE)) entries[0].sha = "f".repeat(40);
      if (kind === "symlink") entries[0].mode = "120000";
      if (kind === "truncatedTree") response.truncated = true;
      if (kind === "missingRoot") response.tree = entries.slice(0, 1);
    }
    if (path.includes("/reviews?")) {
      const reviews = raw as Record<string, unknown>[];
      if (kind === "oldReview") reviews[0].commit_id = "f".repeat(40);
      if (kind === "botReview") object(reviews[0].user).type = "Bot";
      if (kind === "selfReview") object(reviews[0].user).login = "drafter";
      if (kind === "changesRequested") reviews.push({ id: 201, state: "CHANGES_REQUESTED", commit_id: HEAD, user: { login: "other", type: "User" } });
      if (kind === "dismissedReview") reviews[0].state = "DISMISSED";
    }
    return raw;
  }).get, GAP); assert.equal(result.promotionReady, false);
});
test("pagination is followed; an older approval cannot override a later dismissal", async () => {
  const result = await inspectCi(fixture(true, (path, raw) => {
    if (!path.includes("/reviews?")) return raw;
    if (path.endsWith("page=1")) return Array.from({ length: 100 }, (_, i) => ({ id: i + 1, state: "APPROVED", commit_id: HEAD, user: { login: "reviewer", type: "User" } }));
    return [{ id: 101, state: "DISMISSED", commit_id: HEAD, user: { login: "reviewer", type: "User" } }];
  }).get, GAP); assert.equal(result.promotionReady, false);
});
