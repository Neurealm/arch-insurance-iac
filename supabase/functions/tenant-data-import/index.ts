// Bulk-import tenant data (currently: incidents) from CSV rows.
// Caller must be a platform admin OR a tenant_admin of the target tenant.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const IncidentRow = z.object({
  incident_number: z.string().trim().max(64).optional().nullable(),
  title: z.string().trim().min(1).max(500),
  severity: z
    .string()
    .trim()
    .transform((v) => v.toLowerCase())
    .pipe(z.enum(["critical", "high", "medium", "low"]))
    .default("medium"),
  status: z
    .string()
    .trim()
    .transform((v) => v.toLowerCase())
    .pipe(z.enum(["open", "in_progress", "on_hold", "pending", "resolved"]))
    .default("open"),
  service: z.string().trim().max(200).optional().nullable(),
  owner: z.string().trim().max(200).optional().nullable(),
  opened_at: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v).toISOString() : new Date().toISOString())),
  resolved_at: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v).toISOString() : null)),
  external_id: z.string().trim().max(200).optional().nullable(),
});

const Body = z.object({
  tenantId: z.string().uuid(),
  domain: z.literal("incidents"),
  rows: z.array(z.record(z.string(), z.any())).min(1).max(5000),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Identify the caller from their JWT.
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);
    const userId = userData.user.id;

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, 400);
    }
    const { tenantId, rows } = parsed.data;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Authorize: platform admin OR tenant_admin for this tenant.
    const [{ data: isPlatformAdmin }, { data: isTenantAdmin }] = await Promise.all([
      admin.rpc("is_platform_admin", { _user_id: userId }),
      admin.rpc("has_tenant_role", {
        _user_id: userId,
        _tenant_id: tenantId,
        _role: "tenant_admin",
      }),
    ]);
    if (!isPlatformAdmin && !isTenantAdmin) {
      return json({ error: "Forbidden" }, 403);
    }

    const errors: { index: number; message: string }[] = [];
    const prepared: Record<string, unknown>[] = [];
    rows.forEach((raw, idx) => {
      const r = IncidentRow.safeParse(raw);
      if (!r.success) {
        errors.push({ index: idx, message: JSON.stringify(r.error.flatten().fieldErrors) });
        return;
      }
      const d = r.data;
      prepared.push({
        tenant_id: tenantId,
        incident_number: d.incident_number ?? null,
        title: d.title,
        severity: d.severity,
        status: d.status,
        service: d.service ?? null,
        owner: d.owner ?? null,
        opened_at: d.opened_at,
        resolved_at: d.resolved_at,
        source: "csv",
        external_id:
          d.external_id ??
          d.incident_number ??
          `csv:${cryptoHash(d.title + (d.opened_at ?? ""))}`,
        raw,
        created_by: userId,
      });
    });

    if (prepared.length === 0) {
      return json({ inserted: 0, updated: 0, errors }, 200);
    }

    const { data: upserted, error: upsertErr } = await admin
      .from("tenant_incidents")
      .upsert(prepared, {
        onConflict: "tenant_id,source,external_id",
        ignoreDuplicates: false,
      })
      .select("id");

    if (upsertErr) {
      return json({ error: upsertErr.message, errors }, 500);
    }

    return json(
      {
        processed: prepared.length,
        upserted: upserted?.length ?? 0,
        errors,
      },
      200,
    );
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cryptoHash(s: string): string {
  // Cheap stable hash for idempotency keys (not cryptographic).
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
