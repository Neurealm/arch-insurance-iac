
ALTER TABLE public.audio_variable_definitions
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS required_context text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS display_format text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS spoken_format text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS missing_fallback text NOT NULL DEFAULT 'this value is not available',
  ADD COLUMN IF NOT EXISTS sensitivity text NOT NULL DEFAULT 'internal';

UPDATE public.audio_variable_definitions SET display_name = COALESCE(display_name, variable_key);
ALTER TABLE public.audio_variable_definitions ALTER COLUMN display_name SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audio_variable_sensitivity_chk') THEN
    ALTER TABLE public.audio_variable_definitions
      ADD CONSTRAINT audio_variable_sensitivity_chk
      CHECK (sensitivity IN ('public','internal','restricted'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audio_variable_display_format_chk') THEN
    ALTER TABLE public.audio_variable_definitions
      ADD CONSTRAINT audio_variable_display_format_chk
      CHECK (display_format IN ('text','integer','decimal','currency_usd','percentage','date','status'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audio_variable_spoken_format_chk') THEN
    ALTER TABLE public.audio_variable_definitions
      ADD CONSTRAINT audio_variable_spoken_format_chk
      CHECK (spoken_format IN ('text','integer','decimal','currency_usd','percentage','date','status'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.audio_variable_registry(_tenant_id uuid DEFAULT NULL)
RETURNS TABLE (
  variable_key text,
  display_name text,
  description text,
  module_key text,
  resolver_key text,
  required_context text[],
  value_type text,
  display_format text,
  spoken_format text,
  missing_fallback text,
  sensitivity text,
  required_permission_code text,
  is_enabled boolean,
  is_authorized boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    v.variable_key,
    v.display_name,
    v.description,
    v.module_key,
    v.resolver_key,
    v.required_context,
    v.value_type,
    v.display_format,
    v.spoken_format,
    v.missing_fallback,
    v.sensitivity,
    v.required_permission_code,
    v.is_enabled,
    (
      v.required_permission_code IS NULL
      OR public.is_platform_admin(auth.uid())
      OR public.has_permission(auth.uid(), v.tenant_id, v.required_permission_code)
    ) AS is_authorized
  FROM public.audio_variable_definitions v
  WHERE v.tenant_id = COALESCE(_tenant_id, v.tenant_id)
    AND public.audio_can_view(v.tenant_id)
  ORDER BY v.variable_key;
$$;

REVOKE ALL ON FUNCTION public.audio_variable_registry(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.audio_variable_registry(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.audio_variable_registry(uuid) TO authenticated;

INSERT INTO public.audio_variable_definitions
  (tenant_id, variable_key, display_name, description, module_key, resolver_key,
   required_context, value_type, display_format, spoken_format, missing_fallback,
   sensitivity, required_permission_code, is_enabled)
SELECT t.id, d.variable_key, d.display_name, d.description, d.module_key, d.resolver_key,
       d.required_context, d.value_type, d.display_format, d.spoken_format, d.missing_fallback,
       d.sensitivity, d.required_permission_code, d.is_enabled
FROM public.tenants t
CROSS JOIN (VALUES
  ('platform.tenant_name','Tenant name','Name of the active tenant workspace.','platform','platform.tenant_name', ARRAY['tenant'], 'text','text','text','your workspace','public', NULL, true),
  ('platform.module_name','Module name','Display name of the module currently in view.','platform','platform.module_name', ARRAY['module'], 'text','text','text','this module','public', NULL, true),
  ('platform.current_page_name','Current page name','Display name of the page currently in view.','platform','platform.current_page_name', ARRAY['page'], 'text','text','text','this page','public', NULL, true),
  ('commercial.scenario_name','Scenario name','Name of the commercial scenario in context.','commercial','commercial.scenario_name', ARRAY['tenant','scenario'], 'text','text','text','the selected scenario','internal','commercial.view', true),
  ('commercial.opportunity_name','Opportunity name','Name of the commercial program or opportunity in context.','commercial','commercial.opportunity_name', ARRAY['tenant','program'], 'text','text','text','this opportunity','internal','commercial.view', true),
  ('commercial.forecast_period','Forecast period','Fiscal period covered by the active model run.','commercial','commercial.forecast_period', ARRAY['tenant','run'], 'text','text','text','the forecast period','internal','commercial.view', true),
  ('commercial.total_revenue','Total revenue','Total modelled revenue (REV-TOTAL) for the active run.','commercial','commercial.total_revenue', ARRAY['tenant','run'], 'currency','currency_usd','currency_usd','not yet calculated','restricted','commercial.view', true),
  ('commercial.total_cost','Total cost','Cost of delivery plus operating expense for the active run.','commercial','commercial.total_cost', ARRAY['tenant','run'], 'currency','currency_usd','currency_usd','not yet calculated','restricted','commercial.view', true),
  ('commercial.gross_margin','Gross margin','Gross margin percentage (PL-GROSS-MARGIN-PCT).','commercial','commercial.gross_margin', ARRAY['tenant','run'], 'percent','percentage','percentage','not yet calculated','restricted','commercial.view', true),
  ('commercial.ebitda','EBITDA','EBITDA for the active run (PL-EBITDA).','commercial','commercial.ebitda', ARRAY['tenant','run'], 'currency','currency_usd','currency_usd','not yet calculated','restricted','commercial.view', true),
  ('commercial.ebitda_margin','EBITDA margin','EBITDA margin percentage (PL-EBITDA-MARGIN-PCT).','commercial','commercial.ebitda_margin', ARRAY['tenant','run'], 'percent','percentage','percentage','not yet calculated','restricted','commercial.view', true),
  ('runops.service_name','Service name','Name of the RunOps service in context.','runops','runops.service_name', ARRAY['tenant','service'], 'text','text','text','this service','internal', NULL, true),
  ('runops.health_score','Service health score','Composite health score of the service in context.','runops','runops.health_score', ARRAY['tenant','service'], 'number','integer','integer','not currently measured','internal', NULL, true),
  ('runops.open_incident_count','Open incident count','Number of open incidents for the service in context.','runops','runops.open_incident_count', ARRAY['tenant','service'], 'number','integer','integer','not currently measured','internal', NULL, true),
  ('runops.slo_status','SLO status','Current service level objective status.','runops','runops.slo_status', ARRAY['tenant','service'], 'text','status','status','not currently reported','internal', NULL, true),
  ('avep.requirement_count','Requirement count','Number of tracked verification requirements.','avep','avep.requirement_count', ARRAY['program'], 'number','integer','integer','not currently tracked','internal', NULL, true),
  ('avep.coverage_percentage','Functional coverage','Functional coverage achieved for the active block.','avep','avep.coverage_percentage', ARRAY['program'], 'percent','percentage','percentage','not currently tracked','internal', NULL, true),
  ('avep.signoff_status','Signoff status','Aggregate signoff gate status for the active block.','avep','avep.signoff_status', ARRAY['program'], 'text','status','status','not currently tracked','internal', NULL, true)
) AS d(variable_key, display_name, description, module_key, resolver_key, required_context, value_type,
       display_format, spoken_format, missing_fallback, sensitivity, required_permission_code, is_enabled)
ON CONFLICT (tenant_id, module_key, variable_key) DO NOTHING;
