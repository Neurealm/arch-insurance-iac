
-- ============================================================================
-- BP3.6 — Scenario Comparison Workspace Foundation
-- ============================================================================

-- 1. PERMISSIONS ------------------------------------------------------------
INSERT INTO public.permissions (code, category, description, is_system, required_for_tenant_administration) VALUES
  ('commercial.comparison.view',    'commercial', 'View Commercial scenario comparisons and Saved snapshots.', true, false),
  ('commercial.comparison.create',  'commercial', 'Create and edit Draft Commercial scenario comparisons.',    true, false),
  ('commercial.comparison.save',    'commercial', 'Save (persist immutable) Commercial scenario comparisons.', true, false),
  ('commercial.comparison.archive', 'commercial', 'Archive Saved Commercial scenario comparisons.',            true, false)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.tenant_role_permissions (tenant_id, role_id, permission_code, assigned_at)
SELECT r.tenant_id, r.id, p.code, now()
FROM public.tenant_roles r
CROSS JOIN (VALUES
  ('commercial_admin',   'commercial.comparison.view'),
  ('commercial_admin',   'commercial.comparison.create'),
  ('commercial_admin',   'commercial.comparison.save'),
  ('commercial_admin',   'commercial.comparison.archive'),
  ('commercial_analyst', 'commercial.comparison.view'),
  ('commercial_analyst', 'commercial.comparison.create'),
  ('commercial_analyst', 'commercial.comparison.save')
) AS p(role_code, code)
WHERE r.code = p.role_code
ON CONFLICT (role_id, permission_code) DO NOTHING;

-- 2. TABLE: commercial_metric_directionality --------------------------------
CREATE TABLE public.commercial_metric_directionality (
  metric_code           text PRIMARY KEY,
  metric_group          text NOT NULL,
  higher_is_favorable   boolean NOT NULL,
  category              text NOT NULL DEFAULT 'financial',
  description           text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.commercial_metric_directionality TO authenticated;
GRANT ALL   ON public.commercial_metric_directionality TO service_role;
ALTER TABLE public.commercial_metric_directionality ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cmd_select" ON public.commercial_metric_directionality FOR SELECT TO authenticated USING (true);

-- Seed directionality metadata (metric_code pattern matches BP3.2–BP3.4 outputs).
INSERT INTO public.commercial_metric_directionality (metric_code, metric_group, higher_is_favorable, category, description) VALUES
  ('REV-TOTAL',          'revenue', true,  'financial', 'Total Revenue: higher is favorable.'),
  ('REV-SUBSCRIPTION',   'revenue', true,  'financial', 'Subscription Revenue.'),
  ('REV-PROFESSIONAL',   'revenue', true,  'financial', 'Professional Services Revenue.'),
  ('VOL-ACCOUNTS',       'revenue', true,  'volume',    'Account volume.'),
  ('PNL-REVENUE',        'pnl',     true,  'financial', 'P&L Revenue.'),
  ('PNL-DIRECT-COST',    'pnl',     false, 'financial', 'Direct Cost: lower is favorable.'),
  ('PNL-GROSS-PROFIT',   'pnl',     true,  'financial', 'Gross Profit.'),
  ('PNL-GROSS-MARGIN',   'pnl',     true,  'ratio',     'Gross Margin.'),
  ('PNL-STAFFING-COST',  'pnl',     false, 'financial', 'Staffing Cost: lower is favorable.'),
  ('PNL-OPEX',           'pnl',     false, 'financial', 'Operating Expense: lower is favorable.'),
  ('PNL-EBITDA',         'pnl',     true,  'financial', 'EBITDA.'),
  ('PNL-EBITDA-MARGIN',  'pnl',     true,  'ratio',     'EBITDA Margin.'),
  ('CASH-QUARTERLY',     'cash',    true,  'financial', 'Quarterly Cash.'),
  ('CASH-ANNUAL',        'cash',    true,  'financial', 'Annual Cash.'),
  ('WC-PEAK-TROUGH-Y1',  'cash',    true,  'financial', 'Y1 WC peak-trough (higher/less-negative is favorable).'),
  ('WC-TROUGH',          'cash',    true,  'financial', 'WC Trough (higher/less-negative is favorable).'),
  ('CASH-MAX-FUNDING',   'cash',    false, 'financial', 'Maximum Funding: lower is favorable.'),
  ('CASH-BREAK-EVEN',    'cash',    false, 'period',    'Break-even period: earlier/lower is favorable.'),
  ('CASH-PAYBACK',       'cash',    false, 'period',    'Payback period: shorter is favorable.'),
  ('CASH-SUSTAINABILITY','cash',    true,  'ratio',     'Financial sustainability score.')
ON CONFLICT (metric_code) DO NOTHING;

-- 3. TABLE: commercial_scenario_comparisons ---------------------------------
CREATE TABLE public.commercial_scenario_comparisons (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id                  uuid NOT NULL REFERENCES public.commercial_programs(id) ON DELETE CASCADE,
  model_version_id            uuid NOT NULL REFERENCES public.commercial_model_versions(id) ON DELETE RESTRICT,
  title                       text NOT NULL,
  description                 text,
  status                      text NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft','saved','archived')),
  mode                        text NOT NULL
                                 CHECK (mode IN ('pairwise','three_way','historical')),
  baseline_scenario_id        uuid NOT NULL REFERENCES public.commercial_scenarios(id) ON DELETE RESTRICT,
  compared_scenario_ids       uuid[] NOT NULL,
  included_scopes             text[] NOT NULL DEFAULT ARRAY['revenue','pnl','cash']::text[],
  source_run_manifest         jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_run_manifest_hash    text,
  content_hash                text,
  stale_at_creation           boolean NOT NULL DEFAULT false,
  warning_summary             jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by                  uuid,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_by                  uuid,
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  saved_by                    uuid,
  saved_at                    timestamptz,
  archived_by                 uuid,
  archived_at                 timestamptz,
  CHECK (array_length(compared_scenario_ids,1) BETWEEN 1 AND 3),
  CHECK (included_scopes <@ ARRAY['revenue','pnl','cash']::text[] AND array_length(included_scopes,1) >= 1)
);
CREATE INDEX csc_tenant_program_status ON public.commercial_scenario_comparisons (tenant_id, program_id, status, created_at DESC);
CREATE INDEX csc_model_version         ON public.commercial_scenario_comparisons (model_version_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_scenario_comparisons TO authenticated;
GRANT ALL ON public.commercial_scenario_comparisons TO service_role;
ALTER TABLE public.commercial_scenario_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "csc_select" ON public.commercial_scenario_comparisons FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
CREATE POLICY "csc_insert" ON public.commercial_scenario_comparisons FOR INSERT TO authenticated
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.comparison.create'));
CREATE POLICY "csc_update" ON public.commercial_scenario_comparisons FOR UPDATE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.comparison.create'))
  WITH CHECK (public.commercial_can_write(tenant_id, 'commercial.comparison.create'));
CREATE POLICY "csc_delete" ON public.commercial_scenario_comparisons FOR DELETE TO authenticated
  USING (public.commercial_can_write(tenant_id, 'commercial.comparison.create'));

-- Same-tenant linkage
CREATE OR REPLACE FUNCTION public.commercial_enforce_same_tenant_comparison()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE vp uuid; vv uuid; vb uuid;
BEGIN
  SELECT tenant_id INTO vp FROM public.commercial_programs       WHERE id = NEW.program_id;
  SELECT tenant_id INTO vv FROM public.commercial_model_versions WHERE id = NEW.model_version_id;
  SELECT tenant_id INTO vb FROM public.commercial_scenarios      WHERE id = NEW.baseline_scenario_id;
  IF vp IS NULL OR vp <> NEW.tenant_id OR vv <> NEW.tenant_id OR vb <> NEW.tenant_id THEN
    RAISE EXCEPTION 'commercial_cross_tenant_comparison_link';
  END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(NEW.compared_scenario_ids) sid
    LEFT JOIN public.commercial_scenarios s ON s.id = sid
    WHERE s.tenant_id IS DISTINCT FROM NEW.tenant_id
  ) THEN
    RAISE EXCEPTION 'commercial_cross_tenant_comparison_scenario';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_csc_actor       BEFORE INSERT OR UPDATE ON public.commercial_scenario_comparisons
  FOR EACH ROW EXECUTE FUNCTION public.commercial_set_actor_and_timestamp();
CREATE TRIGGER trg_csc_same_tenant BEFORE INSERT OR UPDATE ON public.commercial_scenario_comparisons
  FOR EACH ROW EXECUTE FUNCTION public.commercial_enforce_same_tenant_comparison();

-- Immutability guard: only server-side RPCs may transition status; Saved/Archived immutable
CREATE OR REPLACE FUNCTION public.commercial_comparison_header_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE v_marker text;
BEGIN
  v_marker := current_setting('app.commercial_comparison_op', true);
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'archived' THEN
      RAISE EXCEPTION 'commercial_comparison_archived_immutable';
    END IF;
    IF OLD.status = 'saved' THEN
      -- Only server-side archive allowed; block anything else.
      IF v_marker IS DISTINCT FROM 'server' THEN
        RAISE EXCEPTION 'commercial_comparison_saved_immutable';
      END IF;
    END IF;
    -- Prevent direct status jumps outside server RPCs
    IF NEW.status <> OLD.status AND v_marker IS DISTINCT FROM 'server' THEN
      RAISE EXCEPTION 'commercial_comparison_status_must_use_rpc';
    END IF;
    IF (NEW.source_run_manifest IS DISTINCT FROM OLD.source_run_manifest
        OR NEW.source_run_manifest_hash IS DISTINCT FROM OLD.source_run_manifest_hash
        OR NEW.content_hash IS DISTINCT FROM OLD.content_hash)
       AND OLD.status = 'saved' THEN
      RAISE EXCEPTION 'commercial_comparison_snapshot_immutable';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('saved','archived') THEN
      RAISE EXCEPTION 'commercial_comparison_terminal_undeletable';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_csc_guard BEFORE UPDATE OR DELETE ON public.commercial_scenario_comparisons
  FOR EACH ROW EXECUTE FUNCTION public.commercial_comparison_header_guard();

-- 4. TABLE: commercial_scenario_comparison_results --------------------------
CREATE TABLE public.commercial_scenario_comparison_results (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id               uuid NOT NULL REFERENCES public.commercial_scenario_comparisons(id) ON DELETE CASCADE,
  tenant_id                   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  metric_code                 text NOT NULL,
  metric_group                text NOT NULL,
  fiscal_period               text,
  period_sequence             integer,
  unit                        text,
  baseline_scenario_id        uuid NOT NULL REFERENCES public.commercial_scenarios(id) ON DELETE RESTRICT,
  compared_scenario_id        uuid NOT NULL REFERENCES public.commercial_scenarios(id) ON DELETE RESTRICT,
  baseline_run_id             uuid REFERENCES public.commercial_model_runs(id) ON DELETE RESTRICT,
  compared_run_id             uuid REFERENCES public.commercial_model_runs(id) ON DELETE RESTRICT,
  baseline_value              numeric,
  compared_value              numeric,
  absolute_variance           numeric,
  percentage_variance         numeric,
  variance_direction          text NOT NULL DEFAULT 'not_applicable'
                                CHECK (variance_direction IN ('favorable','unfavorable','neutral','not_applicable')),
  direction_reason            text,
  comparison_rule             text NOT NULL DEFAULT 'compared_minus_baseline',
  source_refs                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  lineage_refs                jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at                  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cscr_comparison ON public.commercial_scenario_comparison_results (comparison_id, metric_group, period_sequence);
CREATE INDEX cscr_metric     ON public.commercial_scenario_comparison_results (metric_code, fiscal_period);

GRANT SELECT ON public.commercial_scenario_comparison_results TO authenticated;
GRANT ALL   ON public.commercial_scenario_comparison_results TO service_role;
ALTER TABLE public.commercial_scenario_comparison_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cscr_select" ON public.commercial_scenario_comparison_results FOR SELECT TO authenticated
  USING (public.commercial_is_member_with_view(tenant_id));
-- No client writes: results only inserted via SECURITY DEFINER save RPC.

CREATE OR REPLACE FUNCTION public.commercial_comparison_result_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE v_marker text; v_status text;
BEGIN
  v_marker := current_setting('app.commercial_comparison_op', true);
  IF v_marker IS DISTINCT FROM 'server' THEN
    RAISE EXCEPTION 'commercial_comparison_results_write_via_rpc';
  END IF;
  IF TG_OP = 'INSERT' THEN
    SELECT status INTO v_status FROM public.commercial_scenario_comparisons WHERE id = NEW.comparison_id;
    IF v_status NOT IN ('draft','saved') THEN
      RAISE EXCEPTION 'commercial_comparison_results_locked (status=%)', v_status;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    SELECT status INTO v_status FROM public.commercial_scenario_comparisons WHERE id = COALESCE(NEW.comparison_id, OLD.comparison_id);
    IF v_status IN ('saved','archived') THEN
      RAISE EXCEPTION 'commercial_comparison_results_immutable (status=%)', v_status;
    END IF;
    RETURN COALESCE(NEW, OLD);
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_cscr_guard BEFORE INSERT OR UPDATE OR DELETE ON public.commercial_scenario_comparison_results
  FOR EACH ROW EXECUTE FUNCTION public.commercial_comparison_result_guard();

-- ============================================================================
-- 5. SUPPORTING HELPERS
-- ============================================================================

-- Selectable runs: latest completed non-superseded per (program, model_version, scenario, scope)
CREATE OR REPLACE FUNCTION public.commercial_comparison_list_selectable_runs(
  _program_id uuid, _model_version_id uuid, _scenario_id uuid, _scope text
) RETURNS TABLE (
  run_id uuid, run_scope text, status text, completed_at timestamptz, input_hash text, is_latest boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tenant uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT tenant_id INTO v_tenant FROM public.commercial_programs WHERE id = _program_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'program_not_found'; END IF;
  IF NOT public.commercial_is_member_with_view(v_tenant) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  RETURN QUERY
    WITH ranked AS (
      SELECT r.id AS run_id, r.run_scope, r.status, r.completed_at, r.input_hash,
             row_number() OVER (ORDER BY r.completed_at DESC NULLS LAST) AS rn
        FROM public.commercial_model_runs r
       WHERE r.tenant_id = v_tenant
         AND r.program_id = _program_id
         AND r.model_version_id = _model_version_id
         AND r.scenario_id = _scenario_id
         AND r.run_scope = _scope
         AND r.status = 'completed'
    )
    SELECT run_id, run_scope, status, completed_at, input_hash, (rn = 1) AS is_latest FROM ranked;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_list_selectable_runs(uuid, uuid, uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_list_selectable_runs(uuid, uuid, uuid, text) TO authenticated, service_role;

-- Deterministic content hash: normalized JSON of manifest + normalized row set
CREATE OR REPLACE FUNCTION public.commercial_comparison_compute_hash(_comparison_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_header record; v_manifest jsonb; v_rows jsonb; v_payload text;
BEGIN
  SELECT * INTO v_header FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_header.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  v_manifest := COALESCE(v_header.source_run_manifest, '{}'::jsonb);
  SELECT COALESCE(jsonb_agg(row_to_jsonb(o) ORDER BY o.metric_code, o.fiscal_period, o.compared_scenario_id), '[]'::jsonb)
    INTO v_rows
    FROM (
      SELECT metric_code, metric_group, fiscal_period, period_sequence, unit,
             baseline_scenario_id, compared_scenario_id, baseline_run_id, compared_run_id,
             baseline_value, compared_value, absolute_variance, percentage_variance,
             variance_direction, comparison_rule
        FROM public.commercial_scenario_comparison_results
       WHERE comparison_id = _comparison_id
    ) o;
  v_payload := 'v1|' || v_header.tenant_id::text || '|' || v_header.program_id::text || '|'
    || v_header.model_version_id::text || '|' || v_header.mode || '|' || v_header.baseline_scenario_id::text
    || '|' || array_to_string(v_header.compared_scenario_ids, ',')
    || '|' || array_to_string(v_header.included_scopes, ',')
    || '|' || v_manifest::text || '|' || v_rows::text;
  RETURN encode(digest(v_payload, 'sha256'), 'hex');
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_compute_hash(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_compute_hash(uuid) TO authenticated, service_role;

-- ============================================================================
-- 6. LIFECYCLE RPCs
-- ============================================================================

-- CREATE
CREATE OR REPLACE FUNCTION public.commercial_comparison_create(
  _program_id uuid,
  _model_version_id uuid,
  _mode text,
  _baseline_scenario_id uuid,
  _compared_scenario_ids uuid[],
  _included_scopes text[],
  _title text,
  _description text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tenant uuid; v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT tenant_id INTO v_tenant FROM public.commercial_programs WHERE id = _program_id;
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'program_not_found'; END IF;
  IF NOT public.commercial_can_write(v_tenant, 'commercial.comparison.create') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF _mode NOT IN ('pairwise','three_way','historical') THEN RAISE EXCEPTION 'invalid_mode'; END IF;
  IF _title IS NULL OR btrim(_title) = '' THEN RAISE EXCEPTION 'title_required'; END IF;
  IF array_length(_compared_scenario_ids,1) IS NULL THEN RAISE EXCEPTION 'compared_scenarios_required'; END IF;

  PERFORM set_config('app.commercial_comparison_op','server', true);
  INSERT INTO public.commercial_scenario_comparisons (
    tenant_id, program_id, model_version_id, title, description, status, mode,
    baseline_scenario_id, compared_scenario_ids, included_scopes,
    created_by, updated_by
  ) VALUES (
    v_tenant, _program_id, _model_version_id, _title, _description, 'draft', _mode,
    _baseline_scenario_id, _compared_scenario_ids,
    COALESCE(_included_scopes, ARRAY['revenue','pnl','cash']::text[]),
    auth.uid(), auth.uid()
  ) RETURNING id INTO v_id;

  PERFORM public.emit_audit_event(v_tenant, 'commercial.comparison.created',
    'commercial_scenario_comparison', v_id::text, NULL,
    jsonb_build_object('mode', _mode, 'baseline', _baseline_scenario_id, 'compared', _compared_scenario_ids),
    NULL, '{}'::jsonb);
  RETURN v_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_create(uuid, uuid, text, uuid, uuid[], text[], text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_create(uuid, uuid, text, uuid, uuid[], text[], text, text) TO authenticated, service_role;

-- UPDATE DRAFT
CREATE OR REPLACE FUNCTION public.commercial_comparison_update_draft(
  _comparison_id uuid,
  _title text DEFAULT NULL,
  _description text DEFAULT NULL,
  _mode text DEFAULT NULL,
  _baseline_scenario_id uuid DEFAULT NULL,
  _compared_scenario_ids uuid[] DEFAULT NULL,
  _included_scopes text[] DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_scenario_comparisons;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_row FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  IF NOT public.commercial_can_write(v_row.tenant_id, 'commercial.comparison.create') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_row.status <> 'draft' THEN RAISE EXCEPTION 'comparison_not_draft'; END IF;

  PERFORM set_config('app.commercial_comparison_op','server', true);
  UPDATE public.commercial_scenario_comparisons SET
    title                 = COALESCE(_title, title),
    description           = COALESCE(_description, description),
    mode                  = COALESCE(_mode, mode),
    baseline_scenario_id  = COALESCE(_baseline_scenario_id, baseline_scenario_id),
    compared_scenario_ids = COALESCE(_compared_scenario_ids, compared_scenario_ids),
    included_scopes       = COALESCE(_included_scopes, included_scopes),
    updated_by = auth.uid(), updated_at = now()
  WHERE id = _comparison_id;

  PERFORM public.emit_audit_event(v_row.tenant_id, 'commercial.comparison.updated',
    'commercial_scenario_comparison', _comparison_id::text, NULL, '{}'::jsonb, NULL, '{}'::jsonb);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_update_draft(uuid, text, text, text, uuid, uuid[], text[]) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_update_draft(uuid, text, text, text, uuid, uuid[], text[]) TO authenticated, service_role;

-- Internal: build manifest for a comparison (current runs)
CREATE OR REPLACE FUNCTION public.commercial_comparison_build_manifest(_comparison_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_scenario_comparisons; v_scenarios uuid[]; v_manifest jsonb := '{}'::jsonb;
        v_scope text; v_scen uuid; v_run record;
BEGIN
  SELECT * INTO v_row FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  v_scenarios := array_prepend(v_row.baseline_scenario_id, v_row.compared_scenario_ids);
  FOREACH v_scope IN ARRAY v_row.included_scopes LOOP
    FOREACH v_scen IN ARRAY v_scenarios LOOP
      SELECT id, input_hash, completed_at, status, run_scope
        INTO v_run
        FROM public.commercial_model_runs
       WHERE tenant_id = v_row.tenant_id
         AND program_id = v_row.program_id
         AND model_version_id = v_row.model_version_id
         AND scenario_id = v_scen
         AND run_scope = v_scope
         AND status = 'completed'
       ORDER BY completed_at DESC NULLS LAST
       LIMIT 1;
      v_manifest := v_manifest || jsonb_build_object(
        v_scope || ':' || v_scen::text,
        jsonb_build_object(
          'scenario_id', v_scen,
          'scope', v_scope,
          'run_id', v_run.id,
          'input_hash', v_run.input_hash,
          'completed_at', v_run.completed_at,
          'status', COALESCE(v_run.status,'missing')
        )
      );
    END LOOP;
  END LOOP;
  RETURN v_manifest;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_build_manifest(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_build_manifest(uuid) TO authenticated, service_role;

-- CALCULATE (returns rows, does not persist unless snapshot_into_results is true)
CREATE OR REPLACE FUNCTION public.commercial_comparison_calculate(_comparison_id uuid)
RETURNS TABLE (
  metric_code text, metric_group text, fiscal_period text, period_sequence integer, unit text,
  compared_scenario_id uuid, baseline_value numeric, compared_value numeric,
  absolute_variance numeric, percentage_variance numeric,
  variance_direction text, direction_reason text,
  baseline_run_id uuid, compared_run_id uuid
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_scenario_comparisons; v_manifest jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_row FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  IF NOT public.commercial_is_member_with_view(v_row.tenant_id) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  v_manifest := public.commercial_comparison_build_manifest(_comparison_id);

  RETURN QUERY
    WITH manifest AS (
      SELECT (v->>'scope')::text AS scope,
             (v->>'scenario_id')::uuid AS scenario_id,
             (v->>'run_id')::uuid AS run_id
        FROM jsonb_each(v_manifest) e, LATERAL (SELECT e.value AS v) x
    ),
    base_runs AS (
      SELECT scope, run_id FROM manifest WHERE scenario_id = v_row.baseline_scenario_id
    ),
    comp_runs AS (
      SELECT scope, scenario_id, run_id FROM manifest WHERE scenario_id = ANY(v_row.compared_scenario_ids)
    ),
    base_results AS (
      SELECT r.metric_code, r.metric_group, r.fiscal_period, r.period_sequence, r.unit,
             r.value_numeric, r.run_id AS baseline_run_id, br.scope
        FROM public.commercial_model_results r
        JOIN base_runs br ON br.run_id = r.run_id
    ),
    comp_results AS (
      SELECT r.metric_code, r.metric_group, r.fiscal_period, r.period_sequence, r.unit,
             r.value_numeric AS compared_value, r.run_id AS compared_run_id,
             cr.scenario_id AS compared_scenario_id, cr.scope
        FROM public.commercial_model_results r
        JOIN comp_runs cr ON cr.run_id = r.run_id
    ),
    joined AS (
      SELECT b.metric_code, b.metric_group, b.fiscal_period, b.period_sequence, b.unit,
             c.compared_scenario_id,
             b.value_numeric AS baseline_value, c.compared_value,
             b.baseline_run_id, c.compared_run_id
        FROM base_results b
        JOIN comp_results c
          ON c.metric_code = b.metric_code
         AND c.metric_group = b.metric_group
         AND c.fiscal_period IS NOT DISTINCT FROM b.fiscal_period
         AND c.unit IS NOT DISTINCT FROM b.unit
         AND c.scope = b.scope
    )
    SELECT j.metric_code, j.metric_group, j.fiscal_period, j.period_sequence, j.unit,
           j.compared_scenario_id, j.baseline_value, j.compared_value,
           (j.compared_value - j.baseline_value) AS absolute_variance,
           CASE
             WHEN j.baseline_value IS NULL OR j.compared_value IS NULL THEN NULL
             WHEN j.baseline_value = 0 AND j.compared_value = 0 THEN 0
             WHEN j.baseline_value = 0 THEN NULL
             ELSE (j.compared_value - j.baseline_value) / abs(j.baseline_value)
           END AS percentage_variance,
           CASE
             WHEN j.baseline_value IS NULL OR j.compared_value IS NULL THEN 'not_applicable'
             WHEN j.compared_value = j.baseline_value THEN 'neutral'
             WHEN d.higher_is_favorable IS NULL THEN 'not_applicable'
             WHEN d.higher_is_favorable AND j.compared_value > j.baseline_value THEN 'favorable'
             WHEN d.higher_is_favorable AND j.compared_value < j.baseline_value THEN 'unfavorable'
             WHEN NOT d.higher_is_favorable AND j.compared_value < j.baseline_value THEN 'favorable'
             ELSE 'unfavorable'
           END AS variance_direction,
           CASE
             WHEN j.baseline_value = 0 AND j.compared_value <> 0 THEN 'undefined_zero_baseline'
             WHEN d.higher_is_favorable IS NULL THEN 'no_directionality_metadata'
             ELSE NULL
           END AS direction_reason,
           j.baseline_run_id, j.compared_run_id
      FROM joined j
      LEFT JOIN public.commercial_metric_directionality d ON d.metric_code = j.metric_code
      ORDER BY j.metric_group, j.metric_code, j.period_sequence NULLS LAST, j.compared_scenario_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_calculate(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_calculate(uuid) TO authenticated, service_role;

-- READINESS
CREATE OR REPLACE FUNCTION public.commercial_comparison_readiness(_comparison_id uuid)
RETURNS TABLE (scenario_id uuid, scope text, is_stale boolean, latest_run_id uuid, latest_completed_at timestamptz, latest_apply_at timestamptz, is_missing boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_scenario_comparisons; v_scenarios uuid[];
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_row FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  IF NOT public.commercial_is_member_with_view(v_row.tenant_id) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  v_scenarios := array_prepend(v_row.baseline_scenario_id, v_row.compared_scenario_ids);
  RETURN QUERY
    SELECT s.scenario_id, s.scope,
           COALESCE(s.is_stale, false) AS is_stale,
           s.latest_run_id,
           s.latest_completed_at,
           s.latest_apply_at,
           (s.latest_run_id IS NULL) AS is_missing
      FROM public.commercial_program_run_staleness(v_row.program_id) s
     WHERE s.scenario_id = ANY(v_scenarios)
       AND s.scope = ANY(v_row.included_scopes);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_readiness(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_readiness(uuid) TO authenticated, service_role;

-- ASSUMPTION COMPARE — uses effective scenario_assumptions only (excludes Draft/Cancelled proposals)
CREATE OR REPLACE FUNCTION public.commercial_comparison_assumptions(_comparison_id uuid)
RETURNS TABLE (
  assumption_code text, label text, unit text,
  scenario_id uuid, numeric_value numeric, text_value text,
  is_baseline boolean, differs_from_baseline boolean
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_scenario_comparisons; v_scenarios uuid[];
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_row FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  IF NOT public.commercial_is_member_with_view(v_row.tenant_id) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  v_scenarios := array_prepend(v_row.baseline_scenario_id, v_row.compared_scenario_ids);
  RETURN QUERY
    WITH sa AS (
      SELECT a.assumption_code, a.scenario_id, a.numeric_value, a.text_value, a.unit
        FROM public.commercial_scenario_assumptions a
       WHERE a.tenant_id = v_row.tenant_id
         AND a.scenario_id = ANY(v_scenarios)
    ),
    baseline AS (
      SELECT assumption_code, numeric_value, text_value
        FROM sa WHERE scenario_id = v_row.baseline_scenario_id
    )
    SELECT sa.assumption_code, NULL::text AS label, sa.unit,
           sa.scenario_id, sa.numeric_value, sa.text_value,
           (sa.scenario_id = v_row.baseline_scenario_id) AS is_baseline,
           (sa.scenario_id <> v_row.baseline_scenario_id
             AND (sa.numeric_value IS DISTINCT FROM b.numeric_value
                  OR sa.text_value IS DISTINCT FROM b.text_value)) AS differs_from_baseline
      FROM sa
      LEFT JOIN baseline b ON b.assumption_code = sa.assumption_code
      ORDER BY sa.assumption_code, sa.scenario_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_assumptions(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_assumptions(uuid) TO authenticated, service_role;

-- SAVE
CREATE OR REPLACE FUNCTION public.commercial_comparison_save(_comparison_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_scenario_comparisons; v_manifest jsonb; v_stale boolean := false;
        v_hash text; v_manifest_hash text; v_count int := 0;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_row FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  IF NOT public.commercial_can_write(v_row.tenant_id, 'commercial.comparison.save') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_row.status <> 'draft' THEN RAISE EXCEPTION 'comparison_not_draft (status=%)', v_row.status; END IF;

  PERFORM set_config('app.commercial_comparison_op','server', true);

  -- Persist manifest
  v_manifest := public.commercial_comparison_build_manifest(_comparison_id);
  v_manifest_hash := encode(digest(v_manifest::text, 'sha256'), 'hex');

  -- Detect staleness at creation
  SELECT bool_or(is_stale) INTO v_stale
    FROM public.commercial_comparison_readiness(_comparison_id);
  v_stale := COALESCE(v_stale, false);

  -- Clear any prior draft snapshot rows (should be none) and insert fresh
  DELETE FROM public.commercial_scenario_comparison_results WHERE comparison_id = _comparison_id;

  INSERT INTO public.commercial_scenario_comparison_results (
    comparison_id, tenant_id, metric_code, metric_group, fiscal_period, period_sequence, unit,
    baseline_scenario_id, compared_scenario_id, baseline_run_id, compared_run_id,
    baseline_value, compared_value, absolute_variance, percentage_variance,
    variance_direction, direction_reason, source_refs
  )
  SELECT _comparison_id, v_row.tenant_id, c.metric_code, c.metric_group, c.fiscal_period, c.period_sequence, c.unit,
         v_row.baseline_scenario_id, c.compared_scenario_id, c.baseline_run_id, c.compared_run_id,
         c.baseline_value, c.compared_value, c.absolute_variance, c.percentage_variance,
         c.variance_direction, c.direction_reason,
         jsonb_build_object('baseline_run_id', c.baseline_run_id, 'compared_run_id', c.compared_run_id)
    FROM public.commercial_comparison_calculate(_comparison_id) c;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE public.commercial_scenario_comparisons
     SET source_run_manifest = v_manifest,
         source_run_manifest_hash = v_manifest_hash,
         stale_at_creation = v_stale,
         updated_by = auth.uid(), updated_at = now()
   WHERE id = _comparison_id;

  v_hash := public.commercial_comparison_compute_hash(_comparison_id);

  UPDATE public.commercial_scenario_comparisons
     SET status = 'saved',
         content_hash = v_hash,
         saved_by = auth.uid(), saved_at = now(),
         updated_by = auth.uid(), updated_at = now()
   WHERE id = _comparison_id;

  PERFORM public.emit_audit_event(v_row.tenant_id, 'commercial.comparison.saved',
    'commercial_scenario_comparison', _comparison_id::text, NULL,
    jsonb_build_object('row_count', v_count, 'stale_at_creation', v_stale,
                       'content_hash', v_hash, 'manifest_hash', v_manifest_hash),
    NULL, '{}'::jsonb);

  RETURN jsonb_build_object('saved', true, 'row_count', v_count, 'content_hash', v_hash,
                            'manifest_hash', v_manifest_hash, 'stale_at_creation', v_stale);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_save(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_save(uuid) TO authenticated, service_role;

-- ARCHIVE
CREATE OR REPLACE FUNCTION public.commercial_comparison_archive(_comparison_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.commercial_scenario_comparisons;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO v_row FROM public.commercial_scenario_comparisons WHERE id = _comparison_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'comparison_not_found'; END IF;
  IF NOT public.commercial_can_write(v_row.tenant_id, 'commercial.comparison.archive') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE='insufficient_privilege';
  END IF;
  IF v_row.status <> 'saved' THEN RAISE EXCEPTION 'only_saved_can_be_archived (status=%)', v_row.status; END IF;
  PERFORM set_config('app.commercial_comparison_op','server', true);
  UPDATE public.commercial_scenario_comparisons
     SET status='archived', archived_by=auth.uid(), archived_at=now(),
         updated_by=auth.uid(), updated_at=now()
   WHERE id = _comparison_id;
  PERFORM public.emit_audit_event(v_row.tenant_id, 'commercial.comparison.archived',
    'commercial_scenario_comparison', _comparison_id::text, NULL, '{}'::jsonb, NULL, '{}'::jsonb);
END $$;
REVOKE EXECUTE ON FUNCTION public.commercial_comparison_archive(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.commercial_comparison_archive(uuid) TO authenticated, service_role;
