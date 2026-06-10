import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type TenantRole = "tenant_admin" | "tenant_manager" | "tenant_member";

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
    const tenantId = String(body.tenantId ?? "").trim();
    const role = body.role as TenantRole | null | "";
    if (!userId || !tenantId) return json({ error: "userId and tenantId required" }, 400);
    if (role && !["tenant_admin", "tenant_manager", "tenant_member"].includes(role as string)) {
      return json({ error: "Invalid role" }, 400);
    }

    if (!role) {
      const { error: delErr } = await admin
        .from("tenant_memberships")
        .delete()
        .eq("user_id", userId)
        .eq("tenant_id", tenantId);
      if (delErr) return json({ error: delErr.message }, 400);
      return json({ ok: true, removed: true });
    }

    // Upsert membership
    const { data: existing } = await admin
      .from("tenant_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (existing?.id) {
      const { error: upErr } = await admin
        .from("tenant_memberships")
        .update({ role })
        .eq("id", existing.id);
      if (upErr) return json({ error: upErr.message }, 400);
    } else {
      const { error: insErr } = await admin
        .from("tenant_memberships")
        .insert({ user_id: userId, tenant_id: tenantId, role });
      if (insErr) return json({ error: insErr.message }, 400);
    }

    return json({ ok: true, role });
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
