// Public forgot-password endpoint.
// Generates a Supabase recovery link + OTP via the admin API and emails
// them to the user via Resend. Uses external Supabase (no built-in email queue).
//
// Always returns { ok: true } to prevent user enumeration — actual delivery
// success/failure is logged server-side only.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body: any = {};
  try { body = await req.json(); } catch { return json({ error: "invalid json" }, 400); }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "A valid email is required" }, 400);
  }

  const origin = (() => {
    const o = req.headers.get("Origin");
    if (o) return o;
    const r = req.headers.get("Referer");
    if (!r) return null;
    try { return new URL(r).origin; } catch { return null; }
  })();
  const redirectTo = origin
    ? `${origin}/reset-password?email=${encodeURIComponent(email)}`
    : `${String(body.redirect_to ?? "")}?email=${encodeURIComponent(email)}`;

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Generate the recovery link + OTP. Do not leak "user not found" to the client.
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error || !data?.properties) {
    console.log("forgot-password: no link generated for", email, error?.message);
    return json({ ok: true });
  }

  const actionLink = data.properties.action_link;
  const otp = data.properties.email_otp;

  if (!RESEND_API_KEY) {
    console.error("forgot-password: RESEND_API_KEY not set — cannot send email");
    return json({ ok: true });
  }

  const SITE_NAME = "NeuGain";
  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#ffffff;color:hsl(222,47%,11%);margin:0;padding:32px;">
    <div style="max-width:560px;margin:0 auto;">
      <h1 style="font-size:22px;margin:0 0 20px;">Reset your ${SITE_NAME} password</h1>
      <p style="font-size:15px;line-height:1.6;color:hsl(220,12%,35%);margin:0 0 20px;">We received a request to reset your password. Enter the code below on the reset page to continue.</p>
      <p style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:hsl(220,12%,45%);margin:24px 0 6px;">Your verification code</p>
      <p style="font-family:monospace;font-size:26px;font-weight:700;letter-spacing:0.28em;background:hsl(232,82%,96%);color:hsl(232,82%,22%);border-radius:10px;padding:16px 20px;margin:0 0 24px;text-align:center;">${escapeHtml(otp ?? "")}</p>
      <p style="font-size:12px;color:hsl(220,12%,55%);margin:20px 0 0;">This code expires shortly. If you didn't request this, you can safely ignore this email — your password won't change.</p>
    </div>
  </body></html>`;

  const text = `Reset your ${SITE_NAME} password\n\nYour verification code: ${otp ?? ""}\n\nEnter this code on the reset page to choose a new password.\n\nIf you didn't request this, you can safely ignore this email.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [email],
        subject: `Reset your ${SITE_NAME} password`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("forgot-password: resend failed", res.status, errText);
    }
  } catch (e) {
    console.error("forgot-password: resend exception", (e as Error).message);
  }

  return json({ ok: true });
});
