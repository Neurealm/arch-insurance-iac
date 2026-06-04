import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Identify caller from JWT claims. This works with Lovable Cloud signing keys
    // and does not depend on a session lookup that can reject otherwise-valid tokens.
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(jwt);
    if (claimsErr || !claimsData?.claims?.sub) {
      console.warn("tenant-invite auth rejected", claimsErr?.message ?? "missing claims");
      return json({ error: "Unauthorized" }, 401);
    }
    const callerId = claimsData.claims.sub;

    // Caller must be a platform admin
    const { data: roleRow } = await admin
      .from("user_roles").select("role")
      .eq("user_id", callerId).eq("role", "platform_admin").maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const { email, fullName, tenantId, redirectTo, role } = await req.json();
    if (!email || !tenantId) return json({ error: "Missing fields" }, 400);

    const { data: tenant } = await admin
      .from("tenants").select("id,name,slug,status")
      .eq("id", tenantId).maybeSingle();
    if (!tenant) return json({ error: "Tenant not found" }, 404);

    // Always use the production app URL for invite links so emails never
    // point at localhost / preview. Override via PUBLIC_SITE_URL secret.
    const publicSite = (Deno.env.get("PUBLIC_SITE_URL") || "https://neugain.io").replace(/\/$/, "");
    const isSafeRedirect =
      typeof redirectTo === "string" &&
      /^https:\/\/(neugain\.io|www\.neugain\.io|[^/]+\.lovable\.app)(\/|$)/i.test(redirectTo);
    const finalRedirect = isSafeRedirect ? redirectTo : `${publicSite}/auth/${tenant.slug}`;

    // Invite or reuse existing user
    let userId: string | null = null;
    let inviteLink: string | null = null;

    const { data: invited, error: iErr } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: finalRedirect,
      data: { full_name: fullName ?? "", invited_to_tenant: tenant.slug },
    });

    if (invited?.user?.id) {
      userId = invited.user.id;
    } else if (iErr && /already|registered|exists/i.test(iErr.message)) {
      // Existing user — generate a recovery link so they can set a new password
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const match = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!match) return json({ error: "User exists but could not be located" }, 500);
      userId = match.id;
      const { data: link } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: redirectTo || undefined },
      });
      inviteLink = link?.properties?.action_link ?? null;
    } else if (iErr) {
      console.error("inviteUserByEmail error", iErr);
      return json({ error: iErr.message || "Could not invite user" }, 400);
    }

    if (!userId) return json({ error: "Could not resolve user" }, 500);

    // Membership
    const desiredRole = role === "tenant_admin" ? "tenant_admin" : "tenant_member";
    const { error: mErr } = await admin.from("tenant_memberships").upsert(
      { user_id: userId, tenant_id: tenant.id, role: desiredRole },
      { onConflict: "user_id,tenant_id" },
    );
    if (mErr && !/duplicate|unique/i.test(mErr.message)) {
      console.error("membership insert", mErr);
      return json({ error: mErr.message }, 500);
    }

    // Auto-approve invited users
    await admin.from("profiles").update({
      approval_status: "approved",
      approved_by: callerId,
      approved_at: new Date().toISOString(),
    }).eq("user_id", userId);

    return json({ ok: true, userId, inviteLink });
  } catch (e) {
    console.error("tenant-invite fatal", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});