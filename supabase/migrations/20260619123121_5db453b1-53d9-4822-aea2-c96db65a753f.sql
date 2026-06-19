
-- 1. Share links (one link = one questionnaire OR one section)
CREATE TABLE public.questionnaire_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  questionnaire_id uuid NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.questionnaire_sections(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('full','section')),
  label text,
  created_by uuid,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((scope = 'section' AND section_id IS NOT NULL) OR (scope = 'full' AND section_id IS NULL))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_share_links TO authenticated;
GRANT ALL ON public.questionnaire_share_links TO service_role;
ALTER TABLE public.questionnaire_share_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read share links" ON public.questionnaire_share_links FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins manage share links" ON public.questionnaire_share_links FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE TRIGGER trg_qsl_updated BEFORE UPDATE ON public.questionnaire_share_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_qsl_questionnaire ON public.questionnaire_share_links(questionnaire_id);

-- 2. Responses (one per respondent device/session)
CREATE TABLE public.questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid NOT NULL REFERENCES public.questionnaire_share_links(id) ON DELETE CASCADE,
  respondent_token text NOT NULL UNIQUE,
  org_name text NOT NULL,
  respondent_name text NOT NULL,
  respondent_email text NOT NULL,
  respondent_role text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted')),
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_responses TO authenticated;
GRANT ALL ON public.questionnaire_responses TO service_role;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read responses" ON public.questionnaire_responses FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins manage responses" ON public.questionnaire_responses FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE TRIGGER trg_qr_updated BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_qr_share_link ON public.questionnaire_responses(share_link_id);

-- 3. Answers per question
CREATE TABLE public.questionnaire_response_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES public.questionnaire_responses(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (response_id, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_response_answers TO authenticated;
GRANT ALL ON public.questionnaire_response_answers TO service_role;
ALTER TABLE public.questionnaire_response_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read response answers" ON public.questionnaire_response_answers FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins manage response answers" ON public.questionnaire_response_answers FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE TRIGGER trg_qra_updated BEFORE UPDATE ON public.questionnaire_response_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_qra_response ON public.questionnaire_response_answers(response_id);

-- 4. Files uploaded by respondents (stored in existing 'evidence' bucket under questionnaire-public/<response_id>/...)
CREATE TABLE public.questionnaire_response_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES public.questionnaire_responses(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.questions(id) ON DELETE SET NULL,
  storage_bucket text NOT NULL DEFAULT 'evidence',
  storage_path text NOT NULL,
  file_name text NOT NULL,
  content_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_response_files TO authenticated;
GRANT ALL ON public.questionnaire_response_files TO service_role;
ALTER TABLE public.questionnaire_response_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read response files" ON public.questionnaire_response_files FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins manage response files" ON public.questionnaire_response_files FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE INDEX idx_qrf_response ON public.questionnaire_response_files(response_id);

-- 5. Allow platform admins to read evidence files uploaded via public submissions
CREATE POLICY "Admins read questionnaire-public objects"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'evidence'
    AND public.is_platform_admin(auth.uid())
    AND name LIKE 'questionnaire-public/%'
  );
