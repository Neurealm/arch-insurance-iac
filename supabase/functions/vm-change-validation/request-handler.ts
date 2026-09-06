import { assertAppliedApproval, assertRemoteApplied, buildValidationChecks, record, text, type Check, type Json } from "./rules.ts";

export type ValidationDependencies = {
  authenticate: (request: Request) => Promise<string | null>;
  loadPackage: (id: string) => Promise<Json | null>;
  isAdministrator: (actor: string) => Promise<boolean>;
  loadExecution: (packageId: string) => Promise<{ apply: Json; plan: Json; review: Json; targets: string[] }>;
  remoteApply: (apply: Json) => Promise<Json>;
  observe: (target: string, request: Request) => Promise<Json>;
  persist: (input: { packageId: string; actor: string; applyId: string; checks: Check[]; observations: Json[]; close: boolean }) => Promise<unknown>;
  reply: (request: Request, body: unknown, status?: number) => Response;
};

export function createValidationHandler(deps: ValidationDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") return deps.reply(request, {});
    if (request.method !== "POST") return deps.reply(request, { error: "POST is required." }, 405);
    try {
      const actor = await deps.authenticate(request);
      if (!actor) return deps.reply(request, { error: "A valid user session is required." }, 401);
      let body: Json;
      try { body = record(await request.json()); } catch { return deps.reply(request, { error: "A JSON request is required." }, 400); }
      const packageId = text(body.packageId);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(packageId) || !["verify", "close"].includes(text(body.action)) || Object.keys(body).some(key => !["action", "packageId"].includes(key))) return deps.reply(request, { error: "Send only action (verify or close) and packageId. Evidence cannot be supplied by clients." }, 400);
      const pkg = await deps.loadPackage(packageId);
      if (!pkg || (pkg.created_by !== actor && !await deps.isAdministrator(actor))) return deps.reply(request, { error: "This package is not available to your account." }, 404);
      const { apply, plan, review, targets } = await deps.loadExecution(packageId);
      assertAppliedApproval(pkg, apply, plan, review);
      assertRemoteApplied(await deps.remoteApply(apply), apply);
      // Read from the exact declared ARM IDs. Never fall back to names or browser data.
      const observations: Json[] = [];
      for (const target of targets) observations.push(await deps.observe(target, request));
      const checks = buildValidationChecks(pkg, apply, plan, targets, observations);
      const result = await deps.persist({ packageId, actor, applyId: text(apply.id), checks, observations, close: body.action === "close" });
      return deps.reply(request, result);
    } catch (error) {
      // Expected failure messages are deliberately local, never raw upstream responses.
      return deps.reply(request, { error: error instanceof Error ? error.message : "Authoritative validation could not be completed." }, 409);
    }
  };
}
