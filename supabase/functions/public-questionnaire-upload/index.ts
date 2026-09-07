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

const ALLOWED_MIME = new Set<string>([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/json",
]);

const ALLOWED_EXT = new Set<string>([
  "pdf","png","jpg","jpeg","gif","webp","txt","csv",
  "doc","docx","xls","xlsx","ppt","pptx","zip","json",
]);

// Magic-byte signatures for common types we care most about.
function sniff(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "application/pdf";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "image/gif";
  if (b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07)) return "application/zip"; // also docx/xlsx/pptx
  if (b.length >= 4 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return "image/webp";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const form = await req.formData();
    const respondent_token = String(form.get("respondent_token") ?? "");
    const question_id = (form.get("question_id") as string | null) || null;
    const file = form.get("file") as File | null;

    if (!respondent_token || !file) return json({ error: "Missing fields" }, 400);
    if (file.size > MAX_BYTES) return json({ error: "File too large (max 25 MB)" }, 413);

    const declaredType = (file.type || "").toLowerCase();
    if (!ALLOWED_MIME.has(declaredType)) {
      return json({ error: "Unsupported file type" }, 415);
    }
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return json({ error: "Unsupported file extension" }, 415);
    }
    // Reject double extensions like report.html.pdf
    const nameNoPath = file.name.replace(/^.*[\\/]/, "");
    const parts = nameNoPath.split(".");
    if (parts.length > 2) {
      const inner = parts.slice(1, -1).map((p) => p.toLowerCase());
      const suspicious = ["html","htm","svg","exe","js","sh","php","bat","cmd","jsp","asp","aspx"];
      if (inner.some((p) => suspicious.includes(p))) {
        return json({ error: "Suspicious file name" }, 415);
      }
    }

    const { data: resp } = await admin
      .from("questionnaire_responses")
      .select("id, status")
      .eq("respondent_token", respondent_token)
      .maybeSingle();
    if (!resp) return json({ error: "Response not found" }, 404);
    if (resp.status === "submitted") return json({ error: "Already submitted" }, 409);

    const safeName = file.name.replace(/[^\w.-]+/g, "_").slice(0, 180);
    const path = `questionnaire-public/${resp.id}/${crypto.randomUUID()}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    // Verify magic bytes for types we can sniff. If sniffable and mismatched, reject.
    const sniffed = sniff(bytes.slice(0, 16));
    if (sniffed && sniffed !== declaredType) {
      // Allow zip-based Office docs (docx/xlsx/pptx) which sniff as application/zip
      const zipOffice = sniffed === "application/zip" && (
        declaredType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        declaredType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        declaredType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        declaredType === "application/zip"
      );
      if (!zipOffice) {
        return json({ error: "File contents do not match declared type" }, 415);
      }
    }

    const { error: upErr } = await admin.storage
      .from("evidence")
      .upload(path, bytes, { contentType: declaredType, upsert: false });
    if (upErr) throw upErr;

    const { data: row, error } = await admin
      .from("questionnaire_response_files")
      .insert({
        response_id: resp.id,
        question_id: question_id || null,
        storage_bucket: "evidence",
        storage_path: path,
        file_name: safeName,
        content_type: declaredType,
        size_bytes: file.size,
      })
      .select("id, file_name, content_type, size_bytes, created_at")
      .single();
    if (error) throw error;

    return json({ ok: true, file: row });
  } catch (e) {
    console.error("public-questionnaire-upload error", e);
    return json({ error: "An internal error occurred" }, 500);
  }
});
