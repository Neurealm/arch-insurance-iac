import { createClient } from "npm:@supabase/supabase-js@2.112.4";

// Common scaffolding for the platform's internal automation edge functions
// (capability-resolver, terraform-drafting-agent, terraform-ci-status-sync,
// terraform-ci-remediation-agent, and any future one in this family): the
// admin Supabase client, CORS headers, a JSON reply helper, and caller
// resolution. Extracted so a future auth fix is made once, not four times.

export type Json = Record<string, unknown>;
export const obj = (value: unknown): Json => value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
export const str = (value: unknown) => typeof value === "string" ? value.trim() : "";
export const arr = (value: unknown) => Array.isArray(value) ? value : [];

/**
 * Supabase is mid-migration from the legacy SUPABASE_SERVICE_ROLE_KEY env
 * var to a JSON dictionary, SUPABASE_SECRET_KEYS (of which `.default` is the
 * equivalent full-access credential), issued through the newer JWT Signing
 * Keys system. The platform still auto-populates the legacy var for every
 * project even after a project has adopted the new system, so checking it
 * first and stopping there -- which every one of these functions used to do
 * -- silently authenticates against a DIFFERENT, older credential than
 * whatever a project's dashboard now shows as "the" service-role/secret
 * key. Returning every candidate (rather than picking one) means an
 * external caller (a GitHub Actions secret, a webhook adapter) is accepted
 * whichever one it was actually given, instead of this needing to guess
 * which key system a given project has migrated to.
 */
export function serviceRoleKeyCandidates(): string[] {
  const candidates: string[] = [];
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) candidates.push(legacy);
  try {
    const parsed = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    if (typeof parsed?.default === "string" && parsed.default) candidates.push(parsed.default);
  } catch { /* SUPABASE_SECRET_KEYS is absent or malformed; legacy candidate (if any) still applies */ }
  return [...new Set(candidates)];
}

export function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const keyCandidates = serviceRoleKeyCandidates();
  const key = keyCandidates[0];
  if (!url || !key) throw new Error("Supabase server credentials are not configured.");
  return { client: createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }), key, keyCandidates };
}

export function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const origins = (Deno.env.get("APP_ORIGINS") ?? Deno.env.get("APP_ORIGIN") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return { "access-control-allow-origin": origin && origins.includes(origin) ? origin : origins[0] ?? "null", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS", vary: "Origin" };
}

export function jsonReply(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(request), "content-type": "application/json", "cache-control": "no-store" } });
}

export type PlatformPrincipal = { kind: "service" } | { kind: "human"; id: string; isAdmin: boolean };

/**
 * Resolves the caller of an internal automation endpoint: either the service
 * role itself (the standard pattern for an unattended trigger -- a scheduled
 * GitHub Actions workflow or a webhook adapter sending
 * `Authorization: Bearer <service_role_key>`), or an interactively
 * authenticated user, tagged with whether they hold platform_admin. Never an
 * anonymous or ordinary caller.
 */
export async function resolvePrincipal(request: Request, db: ReturnType<typeof adminClient>): Promise<PlatformPrincipal | null> {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  if (db.keyCandidates.includes(token)) return { kind: "service" };
  const { data, error } = await db.client.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: role, error: roleError } = await db.client.from("user_roles").select("user_id").eq("user_id", data.user.id).eq("role", "platform_admin").maybeSingle();
  if (roleError) throw roleError;
  return { kind: "human", id: data.user.id, isAdmin: !!role };
}

/**
 * True for a service-role caller (unless explicitly disallowed) or an
 * authenticated platform admin. Never true for a non-admin human.
 */
export function isPlatformAuthorized(principal: PlatformPrincipal | null, opts: { allowService?: boolean } = {}): boolean {
  if (!principal) return false;
  if (principal.kind === "service") return opts.allowService !== false;
  return principal.isAdmin;
}

export async function addGapEvent(db: ReturnType<typeof adminClient>["client"], gapId: string, type: string, detail: Json = {}) {
  await db.from("iac_engineering_gap_events").insert({ gap_id: gapId, event_type: type, detail });
}
