export type Principal = { id: string; isAdmin: boolean };
export type Claim = { claimed: boolean; exhausted: boolean; attempt: number; headSha: string };
export type RepairResult = { outcome: "committed" | "rejected"; model: string; summary: string; newHeadSha?: string };
export type GapRecord = Record<string, unknown> & { id: string };
export type CompleteInput = { gapId: string; expectedHeadSha: string; attempt: number; outcome: "committed" | "rejected" | "failed"; newHeadSha?: string; model: string; summary: string };
export type Dependencies = {
  headers: (request: Request) => Record<string, string>;
  authenticate: (request: Request) => Promise<Principal | null>;
  ready: () => { ready: boolean; reason?: string };
  getGap: (gapId: string) => Promise<GapRecord | null>;
  claim: (gapId: string, expectedVersion: number, expectedHeadSha: string) => Promise<Claim>;
  repair: (gap: GapRecord, attempt: number, expectedHeadSha: string) => Promise<RepairResult>;
  complete: (input: CompleteInput) => Promise<Record<string, unknown>>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHA = /^[0-9a-f]{40}$/;
const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function createRemediationHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    const headers = { ...deps.headers(request), "content-type": "application/json", "cache-control": "no-store" };
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (request.method === "OPTIONS") return new Response("ok", { headers });
    if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);

    let claimed: Claim | null = null;
    let gapId = "";
    try {
      const principal = await deps.authenticate(request);
      if (!principal) return reply({ error: "Authentication required." }, 401);
      if (!principal.isAdmin) return reply({ error: "Platform administrator required." }, 403);
      const readiness = deps.ready();
      if (!readiness.ready) return reply({ error: readiness.reason ?? "CI remediation agent is not configured." }, 503);

      let body: Record<string, unknown>;
      try { body = obj(await request.json()); } catch { return reply({ error: "Invalid JSON request." }, 400); }
      gapId = typeof body.gapId === "string" ? body.gapId : "";
      if (!UUID.test(gapId) || !SHA.test(String(body.expectedHeadSha ?? "")) || !Number.isSafeInteger(body.expectedCiVersion) || Number(body.expectedCiVersion) < 0) {
        return reply({ error: "A gap ID, exact failed head SHA, and CI evidence version are required." }, 400);
      }
      const gap = await deps.getGap(gapId);
      if (!gap) return reply({ error: "Engineering gap not found." }, 404);
      claimed = await deps.claim(gapId, Number(body.expectedCiVersion), String(body.expectedHeadSha));
      if (!claimed.claimed) return reply({ outcome: "exhausted", attempt: claimed.attempt, remediationStatus: "exhausted", message: "The three-attempt repair limit has been reached. Human review is required." });

      const repaired = await deps.repair(gap, claimed.attempt, claimed.headSha);
      const completed = await deps.complete({
        gapId, expectedHeadSha: claimed.headSha, attempt: claimed.attempt,
        outcome: repaired.outcome, newHeadSha: repaired.newHeadSha,
        model: repaired.model, summary: repaired.summary,
      });
      return reply({ ...completed, outcome: repaired.outcome, attempt: claimed.attempt, model: repaired.model, summary: repaired.summary, newHeadSha: repaired.newHeadSha ?? null });
    } catch (cause) {
      if (claimed?.claimed && gapId) {
        try {
          const completed = await deps.complete({ gapId, expectedHeadSha: claimed.headSha, attempt: claimed.attempt, outcome: "failed", model: "not-reported", summary: "The repair attempt failed before a validated commit could be created." });
          return reply({ ...completed, outcome: "failed", attempt: claimed.attempt, model: null, summary: "The repair attempt failed before a validated commit could be created.", newHeadSha: null });
        } catch { /* The original failure remains authoritative; a later sync can recover stale state. */ }
      }
      const code = obj(cause).code;
      if (code === "40001" || code === "23505") return reply({ error: "CI evidence or the draft branch changed. Synchronize before retrying." }, 409);
      if (code === "42501") return reply({ error: "CI remediation is not authorized." }, 403);
      if (code === "22023") return reply({ error: "This failed draft is outside the remediation policy." }, 409);
      return reply({ error: "The remediation attempt failed without creating a commit." }, 500);
    }
  };
}
