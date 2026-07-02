import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
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
    const callerId = claims.claims.sub as string;

    const admin = createClient(url, service);

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "platform_admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden — platform admin only" }, 403);

    const body = await req.json().catch(() => ({} as any));
    const userId = String(body.userId ?? "").trim();
    const mode = (body.mode ?? "email") as "email" | "set";
    if (!userId) return json({ error: "userId is required" }, 400);

    if (mode === "set") {
      const newPassword = String(body.password ?? "");
      const strong =
        newPassword.length >= 12 &&
        newPassword.length <= 72 &&
        /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[^A-Za-z0-9]/.test(newPassword);
      if (!strong) {
        return json({
          error:
            "Password must be 12-72 characters and include uppercase, lowercase, number, and symbol",
        }, 400);
      }
      const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, mode: "set" });
    }

    // mode === "email": send a recovery email via SMTP
    const { data: userRes, error: gErr } = await admin.auth.admin.getUserById(userId);
    if (gErr || !userRes?.user?.email) {
      return json({ error: gErr?.message ?? "User has no email" }, 400);
    }
    const email = userRes.user.email;

    const publicSite = (Deno.env.get("PUBLIC_SITE_URL") || "https://neugain.io").replace(/\/$/, "");
    const origin = req.headers.get("origin");
    const isSafe =
      typeof origin === "string" &&
      /^https:\/\/(neugain\.io|www\.neugain\.io|[^/]+\.lovable\.app)(\/|$)/i.test(origin);
    const redirectTo = `${isSafe ? origin : publicSite}/reset-password`;

    const { error: rErr } = await userClient.auth.resetPasswordForEmail(email, { redirectTo });
    if (rErr) {
      // Fallback: generate a manual recovery link
      const { data: link, error: lErr } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });
      if (lErr) return json({ error: lErr.message }, 400);
      return json({ ok: true, mode: "email", inviteLink: link?.properties?.action_link ?? null });
    }
    return json({ ok: true, mode: "email", email });
  } catch (e) {
    return json({ error: (e as Error).message ?? "Unexpected error" }, 500);
  }
});
