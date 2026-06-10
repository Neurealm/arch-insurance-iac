import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const callerId = claimsData.claims.sub as string;

    const admin = createClient(url, service);

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "platform_admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden — platform admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    const userId = String(body.userId ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!userId && !email) return json({ error: "userId or email required" }, 400);

    // Query auth.audit_log_entries directly via PostgREST. The auth schema isn't
    // exposed by default, so we use a small SQL via rpc-less approach: a SECURITY
    // DEFINER view would be ideal, but we can hit it through PostgREST by enabling
    // the `auth` schema. As a portable fallback, we query via the REST raw endpoint.
    // Simpler: use a service-role SQL through pg_meta is not available; instead we
    // expose results by querying a SECURITY DEFINER function. To avoid a migration
    // here, we use the postgres connection through PostgREST `/rest/v1/rpc/...` if
    // present, otherwise we return an explanatory empty result.
    //
    // Implementation: use the supabase-js admin client and a raw fetch to the
    // Postgres REST endpoint for the `auth` schema.
    const restRes = await fetch(
      `${url}/rest/v1/audit_log_entries?select=id,created_at,ip_address,payload&order=created_at.desc&limit=50`,
      {
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
          "Accept-Profile": "auth",
        },
      },
    );

    if (!restRes.ok) {
      const txt = await restRes.text();
      return json({ events: [], note: "auth audit log not exposed", error: txt }, 200);
    }
    const rows: Array<{
      id: string;
      created_at: string;
      ip_address: string | null;
      payload: Record<string, unknown> | null;
    }> = await restRes.json();

    const events = rows
      .filter((r) => {
        const p = r.payload ?? {};
        const actorId = (p as any).actor_id as string | undefined;
        const actorEmail = ((p as any).actor_username as string | undefined)?.toLowerCase();
        const traitsEmail = ((p as any).traits?.user_email as string | undefined)?.toLowerCase();
        if (userId && actorId === userId) return true;
        if (email && (actorEmail === email || traitsEmail === email)) return true;
        return false;
      })
      .slice(0, 20)
      .map((r) => {
        const p = (r.payload ?? {}) as any;
        return {
          id: r.id,
          timestamp: r.created_at,
          ip: r.ip_address,
          action: p.action ?? "unknown",
          actor_email: p.actor_username ?? null,
          traits: p.traits ?? null,
        };
      });

    return json({ events });
  } catch (e) {
    return json({ error: (e as Error).message ?? "Unexpected error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
