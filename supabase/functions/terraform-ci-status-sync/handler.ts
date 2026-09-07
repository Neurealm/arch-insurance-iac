import { inspectCi } from "./ci-evidence.ts";
import type { Evidence, Gap, Get } from "./ci-evidence.ts";

export type GapRecord = Gap & { ci_version: number; ci_head_sha: string | null; requested_by: string | null; status: string; reviewedCapabilitySnapshot: Record<string, unknown> };
export type Principal = { kind: "service" } | { kind: "human"; id: string; isAdmin: boolean };
export type Dependencies = {
  authenticate: (request: Request) => Promise<Principal | null>;
  getGap: (id: string) => Promise<GapRecord | null>;
  pendingGaps: () => Promise<GapRecord[]>;
  githubGet: Get;
  record: (gap: GapRecord, evidence: Evidence) => Promise<{ ci_version: number }>;
  approve: (gap: GapRecord, version: number, head: string, actorId: string, comment: string) => Promise<unknown>;
  headers: (request: Request) => Record<string, string>;
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REVIEWABLE = new Set(["pr_opened", "ci_running", "ci_passed", "ci_failed", "ready_for_review"]);
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
function stable(value: unknown): string { return Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([key,item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}` : JSON.stringify(value); }

export function createCiHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    const headers = { ...deps.headers(request), "content-type": "application/json", "cache-control": "no-store" };
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (request.method === "OPTIONS") return new Response("ok", { headers });
    if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
    try {
      const principal = await deps.authenticate(request);
      if (!principal) return reply({ error: "Authentication required." }, 401);
      if (principal.kind === "human" && !principal.isAdmin) return reply({ error: "Platform administrator required." }, 403);
      let body: Record<string, unknown>;
      try { body = object(await request.json()); } catch { return reply({ error: "Invalid JSON request." }, 400); }
      const operation = body.operation ?? "sync";
      if (operation !== "sync" && operation !== "approve") return reply({ error: "Unknown operation." }, 400);
      if (body.gapId !== undefined && (typeof body.gapId !== "string" || !UUID.test(body.gapId))) return reply({ error: "Invalid engineering gap ID." }, 400);
      if (operation === "approve") {
        if (principal.kind !== "human") return reply({ error: "Service automation cannot approve capabilities. A human session is required." }, 403);
        if (!body.gapId || typeof body.expectedHeadSha !== "string" || !/^[0-9a-f]{40}$/.test(body.expectedHeadSha) || !Number.isSafeInteger(body.expectedCiVersion) || Number(body.expectedCiVersion) < 0 || typeof body.comment !== "string" || body.comment.trim().length < 10 || body.comment.length > 4000) {
          return reply({ error: "Approval requires gapId, expectedHeadSha, expectedCiVersion and a substantive comment." }, 400);
        }
      }
      const selected = body.gapId ? await deps.getGap(String(body.gapId)) : null;
      if (body.gapId && !selected) return reply({ error: "Engineering gap not found." }, 404);
      const gaps = selected ? [selected] : await deps.pendingGaps();
      const results: unknown[] = [];
      for (const gap of gaps) {
        if (!REVIEWABLE.has(gap.status)) return reply({ error: "Engineering gap is not awaiting CI/review." }, 409);
        if (operation === "approve" && principal.kind === "human") {
          if (!gap.requested_by || gap.requested_by === principal.id) return reply({ error: "An independent reviewer and an identified requester are required." }, 403);
          if (gap.ci_version !== body.expectedCiVersion || gap.ci_head_sha !== body.expectedHeadSha) return reply({ error: "Evidence changed since review. Refresh and review the new evidence." }, 409);
          if (stable(gap.capabilitySnapshot) !== stable(gap.reviewedCapabilitySnapshot)) return reply({ error: "Capability settings changed since review. Synchronize and review them again." }, 409);
        }
        const evidence = await inspectCi(deps.githubGet, gap);
        const stored = await deps.record(gap, evidence);
        if (operation === "approve" && principal.kind === "human") {
          if (typeof evidence.headSha !== "string" || evidence.headSha !== body.expectedHeadSha || evidence.status !== "passed" || !evidence.promotionReady) return reply({ error: "Fresh GitHub evidence does not authorize this promotion.", evidence, ciVersion: stored.ci_version }, 409);
          const capability = await deps.approve(gap, stored.ci_version, evidence.headSha, principal.id, String(body.comment).trim());
          return reply({ capability, evidence, message: "Exact reviewed source promoted. Any ticket waiting on this capability is queued for re-analysis; no Terraform or Azure operation was performed." });
        }
        results.push({ gapId: gap.id, ciVersion: stored.ci_version, evidence });
      }
      return reply({ processed: results.length, results });
    } catch (cause) {
      const code = object(cause).code;
      if (code === "40001" || code === "23505") return reply({ error: "Concurrent evidence or capability update. Refresh before retrying." }, 409);
      if (code === "42501") return reply({ error: "Capability promotion is not authorized." }, 403);
      if (code === "22023") return reply({ error: "Evidence does not satisfy the capability promotion policy." }, 409);
      // Never forward database details, credentials, request contents or opaque
      // upstream payloads into the API response.
      return reply({ error: "Unable to persist or verify capability evidence. No promotion was completed." }, 500);
    }
  };
}
