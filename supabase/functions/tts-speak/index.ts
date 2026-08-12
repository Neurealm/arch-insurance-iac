import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500, headers: corsHeaders });

  let body: { narration_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400, headers: corsHeaders });
  }

  const narrationId = typeof body.narration_id === "string" ? body.narration_id : "";
  if (!UUID_RE.test(narrationId)) {
    return new Response("narration_id must be a valid uuid", { status: 400, headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: narration, error } = await admin
    .from("commercial_narrations")
    .select("script, voice, instructions, speed, is_active")
    .eq("id", narrationId)
    .maybeSingle();

  if (error) return new Response(error.message, { status: 500, headers: corsHeaders });
  if (!narration || !narration.is_active) {
    return new Response("Narration not found", { status: 404, headers: corsHeaders });
  }

  const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini-tts",
      input: narration.script,
      voice: narration.voice ?? "onyx",
      response_format: "mp3",
      instructions: narration.instructions ?? undefined,
      speed: Number(narration.speed ?? 1),
    }),
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: res.status, headers: corsHeaders });
  }

  return new Response(res.body, {
    headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
  });
});
