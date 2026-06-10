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

    const { data, error } = await admin.rpc("admin_get_user_login_history", {
      _user_id: userId || "00000000-0000-0000-0000-000000000000",
      _email: email || null,
      _limit: 20,
    });

    if (error) return json({ events: [], error: error.message }, 200);

    const events = (data ?? []).map((r: any) => ({
      id: r.id,
      timestamp: r.created_at,
      ip: r.ip_address,
      action: r.action ?? "unknown",
      actor_email: r.actor_email ?? null,
      traits: r.traits ?? null,
    }));

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
