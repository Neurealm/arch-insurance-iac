import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const form = await req.formData();
    const respondent_token = String(form.get("respondent_token") ?? "");
    const question_id = (form.get("question_id") as string | null) || null;
    const file = form.get("file") as File | null;

    if (!respondent_token || !file) return json({ error: "Missing fields" }, 400);
    if (file.size > MAX_BYTES) return json({ error: "File too large (max 25 MB)" }, 413);

    const { data: resp } = await admin
      .from("questionnaire_responses")
      .select("id, status")
      .eq("respondent_token", respondent_token)
      .maybeSingle();
    if (!resp) return json({ error: "Response not found" }, 404);
    if (resp.status === "submitted") return json({ error: "Already submitted" }, 409);

    const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 180);
    const path = `questionnaire-public/${resp.id}/${crypto.randomUUID()}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: upErr } = await admin.storage
      .from("evidence")
      .upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false });
    if (upErr) throw upErr;

    const { data: row, error } = await admin
      .from("questionnaire_response_files")
      .insert({
        response_id: resp.id,
        question_id: question_id || null,
        storage_bucket: "evidence",
        storage_path: path,
        file_name: safeName,
        content_type: file.type || null,
        size_bytes: file.size,
      })
      .select("id, file_name, content_type, size_bytes, created_at")
      .single();
    if (error) throw error;

    return json({ ok: true, file: row });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
