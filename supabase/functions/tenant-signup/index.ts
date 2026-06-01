import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { email, password, fullName, tenantSlug } = await req.json();
    if (!email || !password || !tenantSlug) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: tenant, error: tErr } = await admin
      .from("tenants").select("id,status").eq("slug", tenantSlug).maybeSingle();
    if (tErr || !tenant) {
      return new Response(JSON.stringify({ error: "Workspace not found" }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (!tenant.status) {
      return new Response(JSON.stringify({ error: "Workspace inactive" }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Try to create the user. If they already exist, look them up.
    let userId: string | null = null;
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName ?? "" },
    });
    if (created?.user?.id) {
      userId = created.user.id;
    } else if (cErr && /already|registered|exists/i.test(cErr.message)) {
      // Find existing user by email via listUsers (paged search)
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const match = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!match) {
        return new Response(JSON.stringify({ error: "Account exists. Please sign in instead." }), {
          status: 200, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      userId = match.id;
    } else if (cErr) {
      console.error("createUser error", cErr);
      // Surface the trigger / validation message (e.g. "Please use your work email")
      const msg = cErr.message?.includes("work email")
        ? "Please use your work email — personal email domains are not allowed."
        : cErr.message || "Could not create account";
      return new Response(JSON.stringify({ error: msg }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Could not create user" }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Insert membership (pending approval via profiles.approval_status).
    const { error: mErr } = await admin.from("tenant_memberships").insert({
      user_id: userId, tenant_id: tenant.id, role: "tenant_member",
    });
    if (mErr && !/duplicate|unique/i.test(mErr.message)) {
      console.error("membership insert error", mErr);
      return new Response(JSON.stringify({ error: mErr.message }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Ensure profile stays pending (handle_new_user trigger sets it; reinforce defensively).
    await admin.from("profiles").update({ approval_status: "pending" })
      .eq("user_id", userId).eq("approval_status", "pending");

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tenant-signup fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});