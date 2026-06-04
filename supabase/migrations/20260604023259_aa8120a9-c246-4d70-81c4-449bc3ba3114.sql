
-- Status enum for answers
CREATE TYPE public.answer_status AS ENUM (
  'Not Started','In Progress','Answered','Needs Follow Up','Needs Evidence','Validated','Deferred','Not Applicable'
);

-- 1. programs
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read programs" ON public.programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage programs" ON public.programs FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- 2. workstreams
CREATE TABLE public.workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.workstreams TO authenticated;
GRANT ALL ON public.workstreams TO service_role;
ALTER TABLE public.workstreams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read workstreams" ON public.workstreams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage workstreams" ON public.workstreams FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- 3. questionnaires
CREATE TABLE public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workstream_id UUID NOT NULL REFERENCES public.workstreams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questionnaires TO authenticated;
GRANT ALL ON public.questionnaires TO service_role;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant members read assigned questionnaires" ON public.questionnaires FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR (assigned_to_tenant_id IS NOT NULL AND public.is_tenant_member(auth.uid(), assigned_to_tenant_id))
  );
CREATE POLICY "Admins manage questionnaires" ON public.questionnaires FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- 4. questionnaire_sections
CREATE TABLE public.questionnaire_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questionnaire_sections TO authenticated;
GRANT ALL ON public.questionnaire_sections TO service_role;
ALTER TABLE public.questionnaire_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read sections via questionnaire access" ON public.questionnaire_sections FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.questionnaires q
      WHERE q.id = questionnaire_id
        AND q.assigned_to_tenant_id IS NOT NULL
        AND public.is_tenant_member(auth.uid(), q.assigned_to_tenant_id)
    )
  );
CREATE POLICY "Admins manage sections" ON public.questionnaire_sections FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- 5. questions
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.questionnaire_sections(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  why_asking TEXT,
  follow_up_questions TEXT,
  evidence_requested TEXT,
  question_type TEXT NOT NULL DEFAULT 'text',
  priority TEXT,
  display_order INT NOT NULL DEFAULT 0,
  customer_visible BOOLEAN NOT NULL DEFAULT true,
  required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read questions via section access" ON public.questions FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.questionnaire_sections s
      JOIN public.questionnaires q ON q.id = s.questionnaire_id
      WHERE s.id = section_id
        AND q.assigned_to_tenant_id IS NOT NULL
        AND public.is_tenant_member(auth.uid(), q.assigned_to_tenant_id)
        AND (customer_visible = true)
    )
  );
CREATE POLICY "Admins manage questions" ON public.questions FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- 6. answers
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  answer_text TEXT,
  status public.answer_status NOT NULL DEFAULT 'Not Started',
  answered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question_id, tenant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.answers TO authenticated;
GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant members read own answers" ON public.answers FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "Tenant members insert own answers" ON public.answers FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "Tenant members update own answers" ON public.answers FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id))
  WITH CHECK (public.is_platform_admin(auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "Admins delete answers" ON public.answers FOR DELETE TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- 7. evidence_files
CREATE TABLE public.evidence_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_files TO authenticated;
GRANT ALL ON public.evidence_files TO service_role;
ALTER TABLE public.evidence_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant members access evidence" ON public.evidence_files FOR ALL TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.answers a WHERE a.id = answer_id AND public.is_tenant_member(auth.uid(), a.tenant_id))
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.answers a WHERE a.id = answer_id AND public.is_tenant_member(auth.uid(), a.tenant_id))
  );

-- 8. answer_notes
CREATE TABLE public.answer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'customer_visible' CHECK (note_type IN ('internal','customer_visible')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.answer_notes TO authenticated;
GRANT ALL ON public.answer_notes TO service_role;
ALTER TABLE public.answer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read notes for tenant" ON public.answer_notes FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR (
      note_type = 'customer_visible'
      AND EXISTS (SELECT 1 FROM public.answers a WHERE a.id = answer_id AND public.is_tenant_member(auth.uid(), a.tenant_id))
    )
  );
CREATE POLICY "Tenant insert customer notes" ON public.answer_notes FOR INSERT TO authenticated
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR (
      note_type = 'customer_visible'
      AND EXISTS (SELECT 1 FROM public.answers a WHERE a.id = answer_id AND public.is_tenant_member(auth.uid(), a.tenant_id))
    )
  );
CREATE POLICY "Admins manage notes" ON public.answer_notes FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- 9. action_items
CREATE TABLE public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.action_items TO authenticated;
GRANT ALL ON public.action_items TO service_role;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant members access action items" ON public.action_items FOR ALL TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.answers a WHERE a.id = answer_id AND public.is_tenant_member(auth.uid(), a.tenant_id))
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.answers a WHERE a.id = answer_id AND public.is_tenant_member(auth.uid(), a.tenant_id))
  );

-- updated_at triggers
CREATE TRIGGER trg_programs_updated BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workstreams_updated BEFORE UPDATE ON public.workstreams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_questionnaires_updated BEFORE UPDATE ON public.questionnaires FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_questionnaire_sections_updated BEFORE UPDATE ON public.questionnaire_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_questions_updated BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_answers_updated BEFORE UPDATE ON public.answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_action_items_updated BEFORE UPDATE ON public.action_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
