
-- Companies
CREATE TABLE public.crm_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text DEFAULT '',
  company_type text NOT NULL DEFAULT 'Customer',
  website text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  account_owner text DEFAULT '',
  status boolean NOT NULL DEFAULT true,
  priority text NOT NULL DEFAULT 'Medium',
  notes text DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.crm_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  head_stakeholder_id uuid,
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_crm_departments_company ON public.crm_departments(company_id);

CREATE TABLE public.crm_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.crm_departments(id) ON DELETE SET NULL,
  name text NOT NULL,
  lead_stakeholder_id uuid,
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_crm_teams_company ON public.crm_teams(company_id);
CREATE INDEX idx_crm_teams_department ON public.crm_teams(department_id);

CREATE TABLE public.crm_stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.crm_departments(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.crm_teams(id) ON DELETE SET NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  job_title text DEFAULT '',
  emails text[] NOT NULL DEFAULT '{}',
  phones text[] NOT NULL DEFAULT '{}',
  linkedin text DEFAULT '',
  influence_level text NOT NULL DEFAULT 'Medium',
  reporting_manager_id uuid REFERENCES public.crm_stakeholders(id) ON DELETE SET NULL,
  status boolean NOT NULL DEFAULT true,
  notes text DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  photo_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_crm_stakeholders_company ON public.crm_stakeholders(company_id);
CREATE INDEX idx_crm_stakeholders_department ON public.crm_stakeholders(department_id);
CREATE INDEX idx_crm_stakeholders_team ON public.crm_stakeholders(team_id);

CREATE TABLE public.crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  stakeholder_id uuid REFERENCES public.crm_stakeholders(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'Note',
  subject text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_crm_activities_company ON public.crm_activities(company_id);

CREATE TABLE public.crm_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  stakeholder_id uuid REFERENCES public.crm_stakeholders(id) ON DELETE SET NULL,
  body text NOT NULL DEFAULT '',
  author text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_crm_notes_company ON public.crm_notes(company_id);

-- RLS (permissive, matches existing stakeholder_registers pattern)
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['crm_companies','crm_departments','crm_teams','crm_stakeholders','crm_activities','crm_notes']
  LOOP
    EXECUTE format('CREATE POLICY "Anyone can view %1$s" ON public.%1$s FOR SELECT USING (true);', t);
    EXECUTE format('CREATE POLICY "Anyone can insert %1$s" ON public.%1$s FOR INSERT WITH CHECK (true);', t);
    EXECUTE format('CREATE POLICY "Anyone can update %1$s" ON public.%1$s FOR UPDATE USING (true);', t);
    EXECUTE format('CREATE POLICY "Anyone can delete %1$s" ON public.%1$s FOR DELETE USING (true);', t);
    EXECUTE format('CREATE TRIGGER trg_%1$s_updated_at BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t);
  END LOOP;
END $$;
