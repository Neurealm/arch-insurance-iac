// Keep the authorization boundary separate from HCP operations so it can be
// regression-tested without cloud credentials or a running Supabase project.
export type PackageOperation = "resolve" | "plan" | "apply" | "sync";
type Actor = { id: string };
type OperationHandler<Database> = (request: Request, db: Database, actor: string, packageId: string) => Promise<Response>;

export type TerraformRequestDependencies<Database> = {
  database: () => Database;
  authenticate: (request: Request, db: Database) => Promise<Actor | null>;
  packageOwner: (db: Database, packageId: string) => Promise<string | null>;
  isAdministrator: (db: Database, actor: string) => Promise<boolean>;
  operations: Record<PackageOperation, OperationHandler<Database>>;
  diagnose: (request: Request, db: Database, actor: string) => Promise<Response>;
  reply: (request: Request, body: unknown, status?: number) => Response;
  cors: (request: Request) => HeadersInit;
};

const PACKAGE_OPERATIONS = new Set<string>(["resolve", "plan", "apply", "sync"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

export function createTerraformRequestHandler<Database>(deps: TerraformRequestDependencies<Database>) {
  return async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") return new Response("ok", { headers: deps.cors(request) });
    if (request.method !== "POST") return deps.reply(request, { error: "method not allowed" }, 405);

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid json");
      body = parsed as Record<string, unknown>;
    } catch {
      return deps.reply(request, { error: "invalid json" }, 400);
    }

    let db: Database;
    let actor: Actor | null;
    try {
      db = deps.database();
      // Identity must come from verified Auth, never a request body/JWT claim
      // decoded without verification. The production adapter uses getUser().
      actor = await deps.authenticate(request, db);
    } catch {
      return deps.reply(request, { error: "Unable to verify request access. Try again later." }, 503);
    }
    if (!actor?.id) return deps.reply(request, { error: "authentication required" }, 401);

    const operation = text(body.operation);
    if (operation !== "diagnose" && !PACKAGE_OPERATIONS.has(operation)) {
      return deps.reply(request, { error: "unsupported operation" }, 400);
    }
    const packageId = text(body.packageId);
    if (operation !== "diagnose" && !UUID.test(packageId)) {
      return deps.reply(request, { error: "valid packageId required" }, 400);
    }

    try {
      if (operation === "diagnose") {
        if (!await deps.isAdministrator(db, actor.id)) {
          return deps.reply(request, { error: "platform administrator required" }, 403);
        }
      } else {
        // The orchestrator uses the service role, so RLS does NOT protect
        // these reads/writes. Authorize BEFORE loading capability/inputs,
        // inserting a binding, reading evidence, or contacting GitHub/HCP.
        const owner = await deps.packageOwner(db, packageId);
        if (!owner || (owner !== actor.id && !await deps.isAdministrator(db, actor.id))) {
          // Same response for a missing package and somebody else's package.
          return deps.reply(request, { error: "Change package not found or access denied." }, 404);
        }
      }
    } catch {
      // A lookup outage must not become an authorization bypass, and raw
      // database/authentication errors must not be exposed to the caller.
      return deps.reply(request, { error: "Unable to verify request access. Try again later." }, 503);
    }

    try {
      if (operation === "diagnose") return await deps.diagnose(request, db, actor.id);
      return await deps.operations[operation as PackageOperation](request, db, actor.id, packageId);
    } catch (cause) {
      // Preserve the existing business-operation error contract for callers.
      return deps.reply(request, { error: cause instanceof Error ? cause.message : "Terraform orchestration failed." }, 409);
    }
  };
}
