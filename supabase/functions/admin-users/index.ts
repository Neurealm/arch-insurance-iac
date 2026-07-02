// Admin-only user management edge function.
// Caller must have a `platform_admin` role in `public.user_roles`.
// All redirect_to URLs are locked to the caller's own origin to prevent
// admin-triggered off-site email links.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const callerOrigin = (() => {
    const o = req.headers.get("Origin");
    if (o) return o;
    const r = req.headers.get("Referer");
    if (!r) return null;
    try { return new URL(r).origin; } catch { return null; }
  })();
  const safeRedirect = (raw: string): string | undefined => {
    if (!raw) return undefined;
    let u: URL;
    try { u = new URL(raw); } catch { return undefined; }
    if (u.protocol !== "https:" && u.protocol !== "http:") return undefined;
    if (!callerOrigin) return undefined;
    return u.origin === callerOrigin ? u.toString() : undefined;
  };

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
  const token = authHeader.slice("Bearer ".length);
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
  const callerId = claimsData?.claims?.sub as string | undefined;
  const callerEmail = claimsData?.claims?.email as string | undefined;
  if (claimsError || !callerId) return json({ error: "Not authenticated" }, 401);
  const caller = { id: callerId, email: callerEmail } as { id: string; email?: string };

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "platform_admin")
    .maybeSingle();
  if (!roleRow) return json({ error: "Forbidden" }, 403);

  let body: any = {};
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const action = String(body.action ?? "");

  try {
    switch (action) {
      case "list_users": {
        const all: any[] = [];
        let page = 1;
        while (true) {
          const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
          if (error) throw error;
          all.push(...(data?.users ?? []));
          if (!data?.users || data.users.length < 200) break;
          page += 1;
          if (page > 25) break;
        }
        const userIds = all.map((u) => u.id);
        const [{ data: profiles }, { data: roles }] = await Promise.all([
          admin.from("profiles").select("*").in("user_id", userIds),
          admin.from("user_roles").select("user_id, role").in("user_id", userIds),
        ]);
        const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
        const rolesMap = new Map<string, string[]>();
        (roles ?? []).forEach((r: any) => {
          const arr = rolesMap.get(r.user_id) ?? [];
          arr.push(r.role);
          rolesMap.set(r.user_id, arr);
        });
        const users = all.map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
          banned_until: (u as any).banned_until ?? null,
          provider: (u.app_metadata as any)?.provider ?? null,
          profile: profileMap.get(u.id) ?? null,
          roles: rolesMap.get(u.id) ?? [],
        }));
        return json({ users });
      }

      case "get_user_auth_logs": {
        const userId = String(body.user_id ?? "");
        const email = body.email ? String(body.email) : null;
        if (!userId) return json({ error: "user_id required" }, 400);
        const { data, error } = await admin.rpc("admin_get_user_login_history", {
          _user_id: userId,
          _email: email,
          _limit: 100,
        });
        if (error) return json({ error: `auth log lookup failed: ${error.message}` }, 500);
        return json({ events: data ?? [] });
      }

      case "set_approval_status": {
        const userId = String(body.user_id ?? "");
        const status = String(body.status ?? "");
        if (!userId || !["pending", "approved", "rejected"].includes(status)) {
          return json({ error: "invalid args" }, 400);
        }
        const { error } = await admin
          .from("profiles")
          .update({
            approval_status: status,
            approved_at: status === "approved" ? new Date().toISOString() : null,
            approved_by: status === "approved" ? caller.id : null,
          })
          .eq("user_id", userId);
        if (error) throw error;
        return json({ ok: true });
      }

      case "set_user_category": {
        const userId = String(body.user_id ?? "");
        const category = String(body.category ?? "");
        if (!userId || !["neurealm_employee", "customer"].includes(category)) {
          return json({ error: "invalid args" }, 400);
        }
        const { error } = await admin
          .from("profiles")
          .update({ user_category: category })
          .eq("user_id", userId);
        if (error) throw error;
        return json({ ok: true });
      }

      case "set_platform_admin": {
        const userId = String(body.user_id ?? "");
        const enable = !!body.enable;
        if (!userId) return json({ error: "user_id required" }, 400);
        if (userId === caller.id && !enable) {
          return json({ error: "You cannot remove platform_admin from yourself." }, 400);
        }
        if (enable) {
          const { error } = await admin
            .from("user_roles")
            .upsert({ user_id: userId, role: "platform_admin" }, { onConflict: "user_id,role" });
          if (error) throw error;
        } else {
          const { error } = await admin
            .from("user_roles").delete()
            .eq("user_id", userId).eq("role", "platform_admin");
          if (error) throw error;
        }
        return json({ ok: true });
      }

      case "invite_user": {
        const email = String(body.email ?? "").trim();
        const redirectTo = String(body.redirect_to ?? "");
        if (!email) return json({ error: "email required" }, 400);
        const safe = safeRedirect(redirectTo);
        if (redirectTo && !safe) return json({ error: "redirect_to must match caller origin" }, 400);
        const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo: safe,
          data: { invited_to_tenant: true },
        });
        if (error) throw error;
        if (data?.user?.id) {
          await admin
            .from("profiles")
            .update({
              approval_status: "approved",
              approved_at: new Date().toISOString(),
              approved_by: caller.id,
            })
            .eq("user_id", data.user.id);
        }
        return json({ ok: true });
      }

      case "send_password_reset": {
        const email = String(body.email ?? "");
        const redirectTo = String(body.redirect_to ?? "");
        if (!email) return json({ error: "email required" }, 400);
        const safe = safeRedirect(redirectTo);
        if (redirectTo && !safe) return json({ error: "redirect_to must match caller origin" }, 400);
        const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo: safe });
        if (error) throw error;
        return json({ ok: true });
      }

      case "set_user_password": {
        const userId = String(body.user_id ?? "");
        const password = String(body.password ?? "");
        if (!userId) return json({ error: "user_id required" }, 400);
        if (userId === caller.id) {
          return json({ error: "Use the self-service change-password page for your own account." }, 400);
        }
        const strong =
          password.length >= 12 && password.length <= 72 &&
          /[A-Z]/.test(password) && /[a-z]/.test(password) &&
          /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
        if (!strong) {
          return json({ error: "Password must be 12–72 chars with upper, lower, number and symbol." }, 400);
        }
        const { data: target, error: getErr } = await admin.auth.admin.getUserById(userId);
        if (getErr) throw getErr;
        const updates: Record<string, unknown> = { password };
        if (!target?.user?.email_confirmed_at) updates.email_confirm = true;
        const { error } = await admin.auth.admin.updateUserById(userId, updates as any);
        if (error) {
          const msg = error.message || String(error);
          if (/weak|pwned|leaked|breach/i.test(msg)) {
            return json({ error: "This password appears in known breach lists. Please choose a different one." }, 400);
          }
          return json({ error: msg }, 400);
        }
        return json({ ok: true });
      }

      case "set_user_banned": {
        const userId = String(body.user_id ?? "");
        const banned = !!body.banned;
        if (!userId) return json({ error: "user_id required" }, 400);
        if (userId === caller.id && banned) return json({ error: "You cannot suspend yourself." }, 400);
        const { error } = await admin.auth.admin.updateUserById(userId, {
          ban_duration: banned ? "876000h" : "none",
        } as any);
        if (error) throw error;
        return json({ ok: true });
      }

      case "delete_user": {
        const userId = String(body.user_id ?? "");
        if (!userId) return json({ error: "user_id required" }, 400);
        if (userId === caller.id) return json({ error: "You cannot delete yourself." }, 400);
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) throw error;
        return json({ ok: true });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
