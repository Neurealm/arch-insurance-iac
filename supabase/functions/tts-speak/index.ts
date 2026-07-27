const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500, headers: corsHeaders });

  const { text } = await req.json();
  if (!text) return new Response("Missing text", { status: 400, headers: corsHeaders });

  const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini-tts",
      input: text,
      voice: "onyx",
      response_format: "mp3",
      instructions: "Speak in a natural, professional male voice.",
    }),
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: res.status, headers: corsHeaders });
  }

  return new Response(res.body, {
    headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
  });
});
