import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type AppRole = "platform_admin" | "platform_support";

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
    const role = body.role as AppRole | null | "";
    if (!userId) return json({ error: "userId required" }, 400);
    if (role && role !== "platform_admin" && role !== "platform_support") {
      return json({ error: "Invalid role" }, 400);
    }

    // Remove all existing platform roles for this user
    const { data: existing } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const wasAdmin = existing?.some((r: any) => r.role === "platform_admin");

    // Guardrail: don't remove the last platform_admin
    if (wasAdmin && role !== "platform_admin") {
      const { count } = await admin
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "platform_admin");
      if ((count ?? 0) <= 1) {
        return json({ error: "Cannot remove the last platform admin" }, 400);
      }
    }

    await admin.from("user_roles").delete().eq("user_id", userId);

    if (role) {
      const { error: insErr } = await admin
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (insErr) return json({ error: insErr.message }, 400);
    }

    return json({ ok: true, role: role || null });
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
