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

function isEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function clip(v: unknown, max = 500) { return typeof v === "string" ? v.trim().slice(0, max) : ""; }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const action = body.action as string;

    if (action === "start") {
      const token = clip(body.token, 200);
      const org_name = clip(body.org_name, 200);
      const respondent_name = clip(body.respondent_name, 200);
      const respondent_email = clip(body.respondent_email, 200).toLowerCase();
      const respondent_role = clip(body.respondent_role, 200);
      if (!token || !org_name || !respondent_name || !respondent_email || !respondent_role) {
        return json({ error: "All identity fields are required" }, 400);
      }
      if (!isEmail(respondent_email)) return json({ error: "Invalid email" }, 400);

      const { data: link } = await admin
        .from("questionnaire_share_links")
        .select("id, revoked_at")
        .eq("token", token)
        .maybeSingle();
      if (!link || link.revoked_at) return json({ error: "Link not found or revoked" }, 404);

      const respondent_token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
      const { data: created, error } = await admin
        .from("questionnaire_responses")
        .insert({
          share_link_id: link.id,
          respondent_token,
          org_name, respondent_name, respondent_email, respondent_role,
        })
        .select("id, respondent_token")
        .single();
      if (error) throw error;
      return json({ response_id: created.id, respondent_token: created.respondent_token });
    }

    if (action === "save") {
      const respondent_token = clip(body.respondent_token, 200);
      const answers = Array.isArray(body.answers) ? body.answers : [];
      if (!respondent_token) return json({ error: "Missing respondent_token" }, 400);

      const { data: resp } = await admin
        .from("questionnaire_responses")
        .select("id, status, share_link_id")
        .eq("respondent_token", respondent_token)
        .maybeSingle();
      if (!resp) return json({ error: "Response not found" }, 404);
      if (resp.status === "submitted") return json({ error: "Already submitted" }, 409);

      // Validate question_ids belong to the share link's questionnaire (and section if scoped)
      const { data: link } = await admin
        .from("questionnaire_share_links")
        .select("questionnaire_id, section_id, scope")
        .eq("id", resp.share_link_id)
        .single();
      let allowedSections = admin
        .from("questionnaire_sections")
        .select("id")
        .eq("questionnaire_id", link!.questionnaire_id);
      if (link!.scope === "section" && link!.section_id) {
        allowedSections = allowedSections.eq("id", link!.section_id);
      }
      const { data: secs = [] } = await allowedSections;
      const allowedSectionIds = (secs ?? []).map((s: any) => s.id);
      const qIds = answers.map((a: any) => String(a.question_id)).filter(Boolean);
      const { data: validQs = [] } = await admin
        .from("questions")
        .select("id")
        .in("id", qIds)
        .in("section_id", allowedSectionIds);
      const validSet = new Set((validQs ?? []).map((q: any) => q.id));

      const rows = answers
        .filter((a: any) => validSet.has(a.question_id))
        .map((a: any) => ({
          response_id: resp.id,
          question_id: a.question_id,
          answer: a.answer ?? null,
          updated_at: new Date().toISOString(),
        }));
      if (rows.length) {
        const { error } = await admin
          .from("questionnaire_response_answers")
          .upsert(rows, { onConflict: "response_id,question_id" });
        if (error) throw error;
      }
      await admin
        .from("questionnaire_responses")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", resp.id);
      return json({ ok: true, saved: rows.length });
    }

    if (action === "submit") {
      const respondent_token = clip(body.respondent_token, 200);
      if (!respondent_token) return json({ error: "Missing respondent_token" }, 400);
      const { data: resp } = await admin
        .from("questionnaire_responses")
        .select("id, status")
        .eq("respondent_token", respondent_token)
        .maybeSingle();
      if (!resp) return json({ error: "Response not found" }, 404);
      if (resp.status === "submitted") return json({ ok: true, already: true });
      const { error } = await admin
        .from("questionnaire_responses")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", resp.id);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("public-questionnaire-save error", e);
    return json({ error: "An internal error occurred" }, 500);
  }
});
