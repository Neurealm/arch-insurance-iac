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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const respondentToken = url.searchParams.get("respondent_token");
    if (!token) return json({ error: "Missing token" }, 400);

    const { data: link, error: linkErr } = await admin
      .from("questionnaire_share_links")
      .select("id, token, questionnaire_id, section_id, scope, label, revoked_at")
      .eq("token", token)
      .maybeSingle();
    if (linkErr) throw linkErr;
    if (!link || link.revoked_at) return json({ error: "Link not found or revoked" }, 404);

    const { data: questionnaire } = await admin
      .from("questionnaires")
      .select("id, title, description")
      .eq("id", link.questionnaire_id)
      .maybeSingle();
    if (!questionnaire) return json({ error: "Questionnaire missing" }, 404);

    let sectionsQuery = admin
      .from("questionnaire_sections")
      .select("id, title, description, display_order")
      .eq("questionnaire_id", link.questionnaire_id)
      .order("display_order");
    if (link.scope === "section" && link.section_id) {
      sectionsQuery = sectionsQuery.eq("id", link.section_id);
    }
    const { data: sections = [] } = await sectionsQuery;

    const sectionIds = (sections ?? []).map((s) => s.id);
    let questions: any[] = [];
    if (sectionIds.length) {
      const { data: qs = [] } = await admin
        .from("questions")
        .select("id, section_id, question_id, question_text, why_asking, follow_up_questions, evidence_requested, question_type, priority, display_order, customer_visible, required")
        .in("section_id", sectionIds)
        .eq("customer_visible", true)
        .order("display_order");
      questions = qs ?? [];
    }

    let response: any = null;
    let answers: any[] = [];
    let files: any[] = [];
    if (respondentToken) {
      const { data: r } = await admin
        .from("questionnaire_responses")
        .select("id, respondent_token, org_name, respondent_name, respondent_email, respondent_role, status, submitted_at")
        .eq("respondent_token", respondentToken)
        .eq("share_link_id", link.id)
        .maybeSingle();
      response = r ?? null;
      if (response) {
        const [{ data: ans = [] }, { data: fls = [] }] = await Promise.all([
          admin.from("questionnaire_response_answers").select("question_id, answer").eq("response_id", response.id),
          admin.from("questionnaire_response_files").select("id, question_id, file_name, content_type, size_bytes, created_at").eq("response_id", response.id),
        ]);
        answers = ans ?? [];
        files = fls ?? [];
      }
    }

    return json({
      share: { scope: link.scope, label: link.label },
      questionnaire,
      sections,
      questions,
      response,
      answers,
      files,
    });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
