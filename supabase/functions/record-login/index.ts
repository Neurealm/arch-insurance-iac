import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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
    const { data: claims, error: cErr } = await userClient.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;
    const email = (claims.claims as any).email ?? null;

    const body = await req.json().catch(() => ({} as any));
    const action = typeof body.action === "string" ? body.action.slice(0, 40) : "login";
    const login_method = typeof body.login_method === "string" ? body.login_method.slice(0, 60) : null;
    const source = typeof body.source === "string" ? body.source.slice(0, 40) : "portal";
    const user_agent = typeof body.user_agent === "string" ? body.user_agent.slice(0, 500) : null;
    const traits = body.traits && typeof body.traits === "object" ? body.traits : {};

    const forwarded = req.headers.get("x-forwarded-for") ?? "";
    const ip = forwarded.split(",")[0]?.trim() || null;

    const admin = createClient(url, service);
    const { error } = await admin.from("user_login_events").insert({
      user_id: userId,
      email: email ? String(email).toLowerCase() : null,
      action,
      login_method,
      ip_address: ip,
      user_agent,
      source,
      traits,
    });
    if (error) {
      console.error("record-login insert error", error);
      return json({ error: "Failed to record" }, 500);
    }
    return json({ ok: true });
  } catch (e) {
    console.error("record-login error", e);
    return json({ error: "Internal error" }, 500);
  }
});
