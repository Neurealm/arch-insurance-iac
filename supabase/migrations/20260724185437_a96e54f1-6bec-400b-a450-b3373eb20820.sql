
-- =============================================================================
-- BP2.1 Commercial Foundation — schema, permissions, RLS, cross-tenant guards
-- =============================================================================

-- 1) Permission catalog additions -------------------------------------------------

INSERT INTO public.permissions (code, category, description, is_system, required_for_tenant_administration)
VALUES
  ('commercial.view',                'commercial', 'Read Commercial programs, scenarios, metrics, sources, and accounts within the active tenant.', true, false),
  ('commercial.program.manage',      'commercial', 'Create, edit, and retire Commercial programs and their stage gates.', true, false),
  ('commercial.scenario.manage',     'commercial', 'Create and edit Commercial financial scenarios.', true, false),
  ('commercial.assumption.manage',   'commercial', 'Create and edit assumptions inside Commercial scenarios.', true, false),
  ('commercial.account.manage',      'commercial', 'Create and edit Commercial account records.', true, false),
  ('commercial.source.manage',       'commercial', 'Register and edit Commercial source references (metadata only).', true, false),
  ('commercial.admin',               'commercial', 'Full Commercial module administration inside the active tenant.', true, false)
ON CONFLICT (code) DO NOTHING;

-- 2) SECURITY DEFINER helpers ----------------------------------------------------

CREATE OR REPLACE FUNCTION public.commercial_is_member_with_view(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND _tenant_id IS NOT NULL
    AND (
      public.is_platform_admin(auth.uid())
      OR (
        EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.tenant_id = _tenant_id
            AND m.user_id  = auth.uid()
            AND m.status   = 'active'
        )
        AND public.has_permission(auth.uid(), _tenant_id, 'commercial.view')
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.commercial_can_write(_tenant_id uuid, _permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND _tenant_id IS NOT NULL
    AND _permission_code IS NOT NULL
    AND (
      public.is_platform_admin(auth.uid())
      OR (
        EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.tenant_id = _tenant_id
            AND m.user_id  = auth.uid()
            AND m.status   = 'active'
        )
        AND public.has_permission(auth.uid(), _tenant_id, _permission_code)
        AND public.has_permission(auth.uid(), _tenant_id, 'commercial.view')
      )
    );
$$;

REVOKE ALL ON FUNCTION public.commercial_is_member_with_view(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.commercial_can_write(uuid, text)     FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_is_member_with_view(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.commercial_can_write(uuid, text)     TO authenticated, service_role;

-- 3) Shared updated_at + actor trigger -----------------------------------------

CREATE OR REPLACE FUNCTION public.commercial_set_actor_and_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_by IS NULL THEN NEW.created_by := auth.uid(); END IF;
    NEW.updated_by := COALESCE(NEW.updated_by, auth.uid());
    NEW.created_at := COALESCE(NEW.created_at, now());
    NEW.updated_at := now();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_by := COALESCE(auth.uid(), NEW.updated_by);
    NEW.updated_at := now();
    NEW.created_at := OLD.created_at;
    NEW.created_by := OLD.created_by;
  END IF;
  RETURN NEW;
END $$;

-- =============================================================================
-- 4) TABLES
-- =============================================================================

-- commercial_programs -----------------------------------------------------------
CREATE TABLE public.commercial_programs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  code                text NOT NULL,
  name                text NOT NULL,
  partner_name        text,
  market_segment      text,
  description         text,
  status              text NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','active','on_hold','closed','archived')),
  current_gate_code   text,
  source_status       text NOT NULL DEFAULT 'directional'
                        CHECK (source_status IN ('validated','directional','indicative','unverified','disputed')),
  metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          uuid,
  updated_by          uuid,
  UNIQUE (tenant_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_programs TO authenticated;
GRANT ALL ON public.commercial_programs TO service_role;
ALTER TABLE public.commercial_programs ENABLE ROW LEVEL SECURITY;

CREATE INDEX commercial_programs_tenant_idx  ON public.commercial_programs (tenant_id);
CREATE INDEX commercial_programs_status_idx  ON public.commercial_programs (tenant_id, status);

CREATE POLICY commercial_programs_select ON public.commercial_programs
  FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY commercial_programs_insert ON public.commercial_programs
  FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.program.manage'));
CREATE POLICY commercial_programs_update ON public.commercial_programs
  FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.program.manage'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.program.manage'));
CREATE POLICY commercial_programs_delete ON public.commercial_programs
  FOR DELETE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.program.manage'));

CREATE TRIGGER commercial_programs_actor
  BEFORE INSERT OR UPDATE ON public.commercial_programs
  FOR EACH ROW EXECUTE FUNCTION public.commercial_set_actor_and_timestamp();

-- commercial_stage_gates --------------------------------------------------------
CREATE TABLE public.commercial_stage_gates (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  program_id           uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  gate_code            text NOT NULL,
  sequence_number      integer NOT NULL,
  name                 text NOT NULL,
  account_scope_label  text,
  account_scope_count  integer,
  operating_objective  text,
  economic_objective   text,
  unlock_conditions    jsonb NOT NULL DEFAULT '[]'::jsonb,
  status               text NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','ready','in_review','passed','held','failed','skipped')),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_by           uuid,
  UNIQUE (program_id, gate_code),
  UNIQUE (program_id, sequence_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_stage_gates TO authenticated;
GRANT ALL ON public.commercial_stage_gates TO service_role;
ALTER TABLE public.commercial_stage_gates ENABLE ROW LEVEL SECURITY;

CREATE INDEX commercial_stage_gates_tenant_idx  ON public.commercial_stage_gates (tenant_id);
CREATE INDEX commercial_stage_gates_program_idx ON public.commercial_stage_gates (program_id);

CREATE POLICY commercial_stage_gates_select ON public.commercial_stage_gates
  FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY commercial_stage_gates_insert ON public.commercial_stage_gates
  FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.program.manage'));
CREATE POLICY commercial_stage_gates_update ON public.commercial_stage_gates
  FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.program.manage'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.program.manage'));
CREATE POLICY commercial_stage_gates_delete ON public.commercial_stage_gates
  FOR DELETE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.program.manage'));

CREATE TRIGGER commercial_stage_gates_actor
  BEFORE INSERT OR UPDATE ON public.commercial_stage_gates
  FOR EACH ROW EXECUTE FUNCTION public.commercial_set_actor_and_timestamp();

-- commercial_scenarios ----------------------------------------------------------
CREATE TABLE public.commercial_scenarios (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  program_id         uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  code               text NOT NULL,
  name               text NOT NULL,
  description        text,
  status             text NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','active','archived')),
  is_baseline        boolean NOT NULL DEFAULT false,
  source_status      text NOT NULL DEFAULT 'directional'
                       CHECK (source_status IN ('validated','directional','indicative','unverified','disputed')),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  created_by         uuid,
  updated_by         uuid,
  UNIQUE (program_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_scenarios TO authenticated;
GRANT ALL ON public.commercial_scenarios TO service_role;
ALTER TABLE public.commercial_scenarios ENABLE ROW LEVEL SECURITY;

CREATE INDEX commercial_scenarios_tenant_idx  ON public.commercial_scenarios (tenant_id);
CREATE INDEX commercial_scenarios_program_idx ON public.commercial_scenarios (program_id);

CREATE POLICY commercial_scenarios_select ON public.commercial_scenarios
  FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY commercial_scenarios_insert ON public.commercial_scenarios
  FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.scenario.manage'));
CREATE POLICY commercial_scenarios_update ON public.commercial_scenarios
  FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.scenario.manage'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.scenario.manage'));
CREATE POLICY commercial_scenarios_delete ON public.commercial_scenarios
  FOR DELETE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.scenario.manage'));

CREATE TRIGGER commercial_scenarios_actor
  BEFORE INSERT OR UPDATE ON public.commercial_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.commercial_set_actor_and_timestamp();

-- commercial_source_references --------------------------------------------------
CREATE TABLE public.commercial_source_references (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  program_id           uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  source_code          text NOT NULL,
  title                text NOT NULL,
  source_type          text NOT NULL,
  source_date          date,
  confidentiality      text NOT NULL DEFAULT 'confidential'
                         CHECK (confidentiality IN ('public','internal','confidential','restricted')),
  status               text NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','superseded','retired')),
  external_filename    text,
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_by           uuid,
  UNIQUE (program_id, source_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_source_references TO authenticated;
GRANT ALL ON public.commercial_source_references TO service_role;
ALTER TABLE public.commercial_source_references ENABLE ROW LEVEL SECURITY;

CREATE INDEX commercial_source_refs_tenant_idx  ON public.commercial_source_references (tenant_id);
CREATE INDEX commercial_source_refs_program_idx ON public.commercial_source_references (program_id);

CREATE POLICY commercial_source_refs_select ON public.commercial_source_references
  FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY commercial_source_refs_insert ON public.commercial_source_references
  FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.source.manage'));
CREATE POLICY commercial_source_refs_update ON public.commercial_source_references
  FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.source.manage'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.source.manage'));
CREATE POLICY commercial_source_refs_delete ON public.commercial_source_references
  FOR DELETE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.source.manage'));

CREATE TRIGGER commercial_source_refs_actor
  BEFORE INSERT OR UPDATE ON public.commercial_source_references
  FOR EACH ROW EXECUTE FUNCTION public.commercial_set_actor_and_timestamp();

-- commercial_scenario_assumptions ----------------------------------------------
CREATE TABLE public.commercial_scenario_assumptions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  scenario_id          uuid NOT NULL REFERENCES public.commercial_scenarios(id) ON DELETE CASCADE,
  assumption_code      text NOT NULL,
  label                text NOT NULL,
  numeric_value        numeric,
  text_value           text,
  unit                 text,
  confidence           text NOT NULL DEFAULT 'directional'
                         CHECK (confidence IN ('validated','directional','indicative','unverified','disputed')),
  source_reference_id  uuid REFERENCES public.commercial_source_references(id) ON DELETE SET NULL,
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_by           uuid,
  UNIQUE (scenario_id, assumption_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_scenario_assumptions TO authenticated;
GRANT ALL ON public.commercial_scenario_assumptions TO service_role;
ALTER TABLE public.commercial_scenario_assumptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX commercial_scenario_assumptions_tenant_idx  ON public.commercial_scenario_assumptions (tenant_id);
CREATE INDEX commercial_scenario_assumptions_scenario_idx ON public.commercial_scenario_assumptions (scenario_id);
CREATE INDEX commercial_scenario_assumptions_source_idx  ON public.commercial_scenario_assumptions (source_reference_id);

CREATE POLICY commercial_scenario_assumptions_select ON public.commercial_scenario_assumptions
  FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY commercial_scenario_assumptions_insert ON public.commercial_scenario_assumptions
  FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.assumption.manage'));
CREATE POLICY commercial_scenario_assumptions_update ON public.commercial_scenario_assumptions
  FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.assumption.manage'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.assumption.manage'));
CREATE POLICY commercial_scenario_assumptions_delete ON public.commercial_scenario_assumptions
  FOR DELETE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.assumption.manage'));

CREATE TRIGGER commercial_scenario_assumptions_actor
  BEFORE INSERT OR UPDATE ON public.commercial_scenario_assumptions
  FOR EACH ROW EXECUTE FUNCTION public.commercial_set_actor_and_timestamp();

-- commercial_program_metrics ---------------------------------------------------
CREATE TABLE public.commercial_program_metrics (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  program_id           uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  metric_code          text NOT NULL,
  label                text NOT NULL,
  numeric_value        numeric,
  text_value           text,
  unit                 text,
  metric_date          date,
  confidence           text NOT NULL DEFAULT 'directional'
                         CHECK (confidence IN ('validated','directional','indicative','unverified','disputed')),
  source_reference_id  uuid REFERENCES public.commercial_source_references(id) ON DELETE SET NULL,
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_by           uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_program_metrics TO authenticated;
GRANT ALL ON public.commercial_program_metrics TO service_role;
ALTER TABLE public.commercial_program_metrics ENABLE ROW LEVEL SECURITY;

CREATE INDEX commercial_program_metrics_tenant_idx  ON public.commercial_program_metrics (tenant_id);
CREATE INDEX commercial_program_metrics_program_idx ON public.commercial_program_metrics (program_id);
CREATE INDEX commercial_program_metrics_code_idx    ON public.commercial_program_metrics (program_id, metric_code, metric_date);
CREATE INDEX commercial_program_metrics_source_idx  ON public.commercial_program_metrics (source_reference_id);

CREATE POLICY commercial_program_metrics_select ON public.commercial_program_metrics
  FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY commercial_program_metrics_insert ON public.commercial_program_metrics
  FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.program.manage'));
CREATE POLICY commercial_program_metrics_update ON public.commercial_program_metrics
  FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.program.manage'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.program.manage'));
CREATE POLICY commercial_program_metrics_delete ON public.commercial_program_metrics
  FOR DELETE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.program.manage'));

CREATE TRIGGER commercial_program_metrics_actor
  BEFORE INSERT OR UPDATE ON public.commercial_program_metrics
  FOR EACH ROW EXECUTE FUNCTION public.commercial_set_actor_and_timestamp();

-- commercial_accounts ----------------------------------------------------------
CREATE TABLE public.commercial_accounts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  program_id          uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  external_key        text NOT NULL,
  account_name        text NOT NULL,
  partner_status      text NOT NULL DEFAULT 'none'
                        CHECK (partner_status IN ('none','partner','co_sell','reseller','other')),
  arr_amount          numeric,
  arr_currency        text DEFAULT 'USD',
  renewal_date        date,
  account_status      text NOT NULL DEFAULT 'prospect'
                        CHECK (account_status IN ('prospect','pursuit','active','on_hold','lost','won','archived')),
  source_status       text NOT NULL DEFAULT 'directional'
                        CHECK (source_status IN ('validated','directional','indicative','unverified','disputed')),
  source_reference_id uuid REFERENCES public.commercial_source_references(id) ON DELETE SET NULL,
  metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          uuid,
  updated_by          uuid,
  UNIQUE (program_id, external_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_accounts TO authenticated;
GRANT ALL ON public.commercial_accounts TO service_role;
ALTER TABLE public.commercial_accounts ENABLE ROW LEVEL SECURITY;

CREATE INDEX commercial_accounts_tenant_idx  ON public.commercial_accounts (tenant_id);
CREATE INDEX commercial_accounts_program_idx ON public.commercial_accounts (program_id);
CREATE INDEX commercial_accounts_status_idx  ON public.commercial_accounts (program_id, account_status);
CREATE INDEX commercial_accounts_source_idx  ON public.commercial_accounts (source_reference_id);

CREATE POLICY commercial_accounts_select ON public.commercial_accounts
  FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY commercial_accounts_insert ON public.commercial_accounts
  FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.account.manage'));
CREATE POLICY commercial_accounts_update ON public.commercial_accounts
  FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.account.manage'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.account.manage'));
CREATE POLICY commercial_accounts_delete ON public.commercial_accounts
  FOR DELETE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.account.manage'));

CREATE TRIGGER commercial_accounts_actor
  BEFORE INSERT OR UPDATE ON public.commercial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.commercial_set_actor_and_timestamp();

-- =============================================================================
-- 5) Same-tenant enforcement triggers
-- =============================================================================

CREATE OR REPLACE FUNCTION public.commercial_enforce_same_tenant_program()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v uuid;
BEGIN
  SELECT tenant_id INTO v FROM public.commercial_programs WHERE id = NEW.program_id;
  IF v IS NULL OR v <> NEW.tenant_id THEN
    RAISE EXCEPTION 'commercial_cross_tenant_program_link';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.commercial_enforce_same_tenant_scenario()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v uuid;
BEGIN
  SELECT tenant_id INTO v FROM public.commercial_scenarios WHERE id = NEW.scenario_id;
  IF v IS NULL OR v <> NEW.tenant_id THEN
    RAISE EXCEPTION 'commercial_cross_tenant_scenario_link';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.commercial_enforce_same_tenant_source()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v uuid;
BEGIN
  IF NEW.source_reference_id IS NULL THEN RETURN NEW; END IF;
  SELECT tenant_id INTO v FROM public.commercial_source_references WHERE id = NEW.source_reference_id;
  IF v IS NULL OR v <> NEW.tenant_id THEN
    RAISE EXCEPTION 'commercial_cross_tenant_source_link';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER commercial_stage_gates_same_tenant
  BEFORE INSERT OR UPDATE ON public.commercial_stage_gates
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_program();

CREATE TRIGGER commercial_scenarios_same_tenant
  BEFORE INSERT OR UPDATE ON public.commercial_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_program();

CREATE TRIGGER commercial_source_refs_same_tenant
  BEFORE INSERT OR UPDATE ON public.commercial_source_references
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_program();

CREATE TRIGGER commercial_program_metrics_same_tenant_prog
  BEFORE INSERT OR UPDATE ON public.commercial_program_metrics
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_program();

CREATE TRIGGER commercial_program_metrics_same_tenant_src
  BEFORE INSERT OR UPDATE ON public.commercial_program_metrics
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_source();

CREATE TRIGGER commercial_scenario_assumptions_same_tenant_scn
  BEFORE INSERT OR UPDATE ON public.commercial_scenario_assumptions
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_scenario();

CREATE TRIGGER commercial_scenario_assumptions_same_tenant_src
  BEFORE INSERT OR UPDATE ON public.commercial_scenario_assumptions
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_source();

CREATE TRIGGER commercial_accounts_same_tenant_prog
  BEFORE INSERT OR UPDATE ON public.commercial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_program();

CREATE TRIGGER commercial_accounts_same_tenant_src
  BEFORE INSERT OR UPDATE ON public.commercial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_source();

-- Ensure anon has no direct table privileges (defensive)
REVOKE ALL ON public.commercial_programs             FROM anon;
REVOKE ALL ON public.commercial_stage_gates          FROM anon;
REVOKE ALL ON public.commercial_scenarios            FROM anon;
REVOKE ALL ON public.commercial_scenario_assumptions FROM anon;
REVOKE ALL ON public.commercial_program_metrics      FROM anon;
REVOKE ALL ON public.commercial_source_references    FROM anon;
REVOKE ALL ON public.commercial_accounts             FROM anon;
