
-- Common columns macro (inline per table)
CREATE TABLE public.org_business_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.org_practices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL REFERENCES public.org_business_units(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_org_practices_parent ON public.org_practices(business_unit_id);

CREATE TABLE public.org_capability_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid NOT NULL REFERENCES public.org_practices(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_org_capability_areas_parent ON public.org_capability_areas(practice_id);

CREATE TABLE public.org_service_functions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_area_id uuid NOT NULL REFERENCES public.org_capability_areas(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_org_service_functions_parent ON public.org_service_functions(capability_area_id);

CREATE TABLE public.org_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_function_id uuid NOT NULL REFERENCES public.org_service_functions(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_org_workflows_parent ON public.org_workflows(service_function_id);

CREATE TABLE public.org_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.org_workflows(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_org_activities_parent ON public.org_activities(workflow_id);

CREATE TABLE public.org_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.org_activities(id) ON DELETE RESTRICT,
  name text NOT NULL,
  short_name text DEFAULT '',
  url text DEFAULT '',
  description text DEFAULT '',
  logo text DEFAULT '',
  tagline text DEFAULT '',
  mission text DEFAULT '',
  strategic_value text DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  semantic_tags text[] NOT NULL DEFAULT '{}',
  strategic_themes text[] NOT NULL DEFAULT '{}',
  ai_summary text DEFAULT '',
  embedding_text text DEFAULT '',
  created_by uuid,
  last_updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_org_tasks_parent ON public.org_tasks(activity_id);

-- Enable RLS + policies + updated_at trigger on each table
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'org_business_units','org_practices','org_capability_areas',
    'org_service_functions','org_workflows','org_activities','org_tasks'
  ]) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Authenticated read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "Platform admins manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()))', t);
    EXECUTE format('CREATE TRIGGER set_updated_at_%1$s BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
  END LOOP;
END $$;
