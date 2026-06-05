import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

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

    // Verify caller is platform_admin
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "platform_admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden — platform admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const full_name = String(body.full_name ?? "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Valid email is required" }, 400);
    }

    const siteUrl = req.headers.get("origin") ?? body.redirect_to ?? undefined;

    // Invite via Supabase Auth — sends invitation email
    const { data: invited, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name,
        invited_to_tenant: true, // triggers auto-approval in handle_new_user
        invited_as: "platform_viewer",
        invited_by: callerId,
      },
      redirectTo: siteUrl ? `${siteUrl}/reset-password` : undefined,
    });

    if (invErr || !invited?.user) {
      return json({ error: invErr?.message ?? "Failed to invite user" }, 400);
    }

    const newUserId = invited.user.id;

    // Make sure profile exists & is approved (the trigger should handle this, but be safe)
    await admin
      .from("profiles")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: callerId,
        full_name: full_name || null,
      })
      .eq("user_id", newUserId);

    // Assign read-only platform_support role
    await admin
      .from("user_roles")
      .insert({ user_id: newUserId, role: "platform_support" })
      .select();

    return json({ ok: true, user_id: newUserId, email });
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
