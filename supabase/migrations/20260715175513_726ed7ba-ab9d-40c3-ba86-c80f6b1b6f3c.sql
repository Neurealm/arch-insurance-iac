
-- ============================================================
-- ETDM (Enterprise Technology Domain Model) — Phase 1
-- ============================================================

-- 1) TECHNOLOGY TABLE ----------------------------------------
CREATE TABLE public.etdm_technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,

  -- Identity
  technology_name text NOT NULL,
  short_name text,
  slug text NOT NULL,
  description text,
  category text,
  technology_type text,
  vendor_name text,
  product_family text,
  product_name text,
  version text,
  edition text,
  lifecycle_status text,
  technology_icon_url text,
  banner_image_url text,
  color_theme text,
  tags text[] DEFAULT '{}'::text[],

  -- Classification & ownership
  technology_tower text,
  primary_domain text,
  secondary_domains text[] DEFAULT '{}'::text[],
  technology_owner_id uuid,
  business_owner_id uuid,
  engineering_owner_id uuid,
  operations_owner_id uuid,
  security_owner_id uuid,
  data_owner_id uuid,
  support_group text,
  escalation_group text,

  -- Vendor & lifecycle
  product_website_url text,
  documentation_url text,
  support_url text,
  community_url text,
  licensing_model text,
  support_contract_reference text,
  general_availability_date date,
  end_of_sale_date date,
  end_of_mainstream_support_date date,
  end_of_extended_support_date date,
  end_of_life_date date,
  replacement_technology_id uuid,
  upgrade_path text,
  lifecycle_notes text,

  -- Business context
  business_purpose text,
  typical_use_cases jsonb DEFAULT '[]'::jsonb,
  supported_industries text[] DEFAULT '{}'::text[],
  business_criticality text,
  target_audiences text[] DEFAULT '{}'::text[],
  supported_business_services jsonb DEFAULT '[]'::jsonb,
  typical_deployment_size text,
  business_impact_if_unavailable text,
  strategic_importance text,
  business_outcome_summary text,

  -- Technical profile
  deployment_models text[] DEFAULT '{}'::text[],
  supported_operating_systems text[] DEFAULT '{}'::text[],
  supported_cloud_providers text[] DEFAULT '{}'::text[],
  supported_hypervisors text[] DEFAULT '{}'::text[],
  supported_databases text[] DEFAULT '{}'::text[],
  supported_architectures text[] DEFAULT '{}'::text[],
  api_available boolean DEFAULT false,
  rest_api_available boolean DEFAULT false,
  graphql_available boolean DEFAULT false,
  sdk_available boolean DEFAULT false,
  cli_available boolean DEFAULT false,
  powershell_available boolean DEFAULT false,
  webhooks_available boolean DEFAULT false,
  agent_required boolean DEFAULT false,
  agentless_supported boolean DEFAULT false,
  high_availability_supported boolean DEFAULT false,
  clustering_supported boolean DEFAULT false,
  disaster_recovery_supported boolean DEFAULT false,
  backup_supported boolean DEFAULT false,
  multi_region_supported boolean DEFAULT false,
  scalability_model text,
  technical_prerequisites text,
  technical_limitations text,

  -- Integration profile
  native_integrations jsonb DEFAULT '[]'::jsonb,
  third_party_integrations jsonb DEFAULT '[]'::jsonb,
  authentication_methods text[] DEFAULT '{}'::text[],
  monitoring_integrations jsonb DEFAULT '[]'::jsonb,
  itsm_integrations jsonb DEFAULT '[]'::jsonb,
  siem_integrations jsonb DEFAULT '[]'::jsonb,
  automation_integrations jsonb DEFAULT '[]'::jsonb,
  data_integrations jsonb DEFAULT '[]'::jsonb,
  integration_notes text,

  -- Security & compliance
  authentication_types text[] DEFAULT '{}'::text[],
  authorization_model text,
  mfa_supported boolean DEFAULT false,
  rbac_supported boolean DEFAULT false,
  encryption_at_rest boolean DEFAULT false,
  encryption_in_transit boolean DEFAULT false,
  audit_logging_supported boolean DEFAULT false,
  security_certifications text[] DEFAULT '{}'::text[],
  compliance_standards text[] DEFAULT '{}'::text[],
  data_classification text,
  data_residency_requirements text,
  known_security_considerations text,
  required_security_controls jsonb DEFAULT '[]'::jsonb,

  -- Automation & AI
  automation_ready boolean DEFAULT false,
  ai_ready boolean DEFAULT false,
  infrastructure_as_code_supported boolean DEFAULT false,
  available_automation_interfaces jsonb DEFAULT '[]'::jsonb,
  digital_coworkers_available boolean DEFAULT false,
  automations_available boolean DEFAULT false,
  runbooks_available boolean DEFAULT false,
  sop_library_available boolean DEFAULT false,
  knowledge_articles_available boolean DEFAULT false,
  ai_playbooks_available boolean DEFAULT false,
  automation_opportunity_summary text,
  ai_opportunity_summary text,

  -- Maturity & readiness
  technology_maturity text,
  operational_maturity_score integer,
  automation_maturity_score integer,
  ai_maturity_score integer,
  security_maturity_score integer,
  documentation_completeness_percentage integer,
  support_readiness_score integer,
  digital_twin_readiness_score integer,
  overall_maturity_notes text,
  last_assessment_date date,
  assessed_by_id uuid,

  -- Governance
  approval_status text NOT NULL DEFAULT 'Draft',
  record_steward_id uuid,
  visibility text NOT NULL DEFAULT 'Internal Restricted',
  tenant_scope text,
  effective_date date,
  review_date date,
  expiration_date date,
  governance_notes text,
  source_of_record text,
  external_reference_id text,

  -- System metadata
  published_version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  is_sample boolean NOT NULL DEFAULT false,
  cloned_from_technology_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_by uuid,
  deleted_at timestamptz,

  -- Constraints
  CONSTRAINT etdm_technologies_slug_unique UNIQUE (slug),
  CONSTRAINT etdm_tech_approval_status_check CHECK (approval_status IN ('Draft','In Review','Approved','Rejected','Retired')),
  CONSTRAINT etdm_tech_visibility_check CHECK (visibility IN ('Internal Restricted','Internal','Future Customer Eligible')),
  CONSTRAINT etdm_tech_lifecycle_check CHECK (lifecycle_status IS NULL OR lifecycle_status IN (
    'Emerging','Evaluation','Strategic','Active','Maintenance','Legacy','Deprecated','End of Support','Retired'
  )),
  CONSTRAINT etdm_tech_criticality_check CHECK (business_criticality IS NULL OR business_criticality IN (
    'Mission Critical','Business Critical','Important','Standard','Noncritical'
  )),
  CONSTRAINT etdm_tech_maturity_check CHECK (technology_maturity IS NULL OR technology_maturity IN (
    'Emerging','Developing','Established','Mature','Strategic','Legacy'
  )),
  CONSTRAINT etdm_tech_scores_range CHECK (
    (operational_maturity_score IS NULL OR operational_maturity_score BETWEEN 0 AND 100) AND
    (automation_maturity_score IS NULL OR automation_maturity_score BETWEEN 0 AND 100) AND
    (ai_maturity_score IS NULL OR ai_maturity_score BETWEEN 0 AND 100) AND
    (security_maturity_score IS NULL OR security_maturity_score BETWEEN 0 AND 100) AND
    (documentation_completeness_percentage IS NULL OR documentation_completeness_percentage BETWEEN 0 AND 100) AND
    (support_readiness_score IS NULL OR support_readiness_score BETWEEN 0 AND 100) AND
    (digital_twin_readiness_score IS NULL OR digital_twin_readiness_score BETWEEN 0 AND 100)
  ),
  CONSTRAINT etdm_tech_eol_after_ga CHECK (
    end_of_life_date IS NULL OR general_availability_date IS NULL OR end_of_life_date >= general_availability_date
  ),
  CONSTRAINT etdm_tech_deleted_inactive CHECK (is_deleted = false OR is_active = false)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.etdm_technologies TO authenticated;
GRANT ALL ON public.etdm_technologies TO service_role;

-- Indexes
CREATE INDEX etdm_tech_name_idx           ON public.etdm_technologies (lower(technology_name));
CREATE INDEX etdm_tech_short_name_idx     ON public.etdm_technologies (lower(short_name));
CREATE INDEX etdm_tech_vendor_idx         ON public.etdm_technologies (vendor_name);
CREATE INDEX etdm_tech_product_family_idx ON public.etdm_technologies (product_family);
CREATE INDEX etdm_tech_category_idx       ON public.etdm_technologies (category);
CREATE INDEX etdm_tech_type_idx           ON public.etdm_technologies (technology_type);
CREATE INDEX etdm_tech_lifecycle_idx      ON public.etdm_technologies (lifecycle_status);
CREATE INDEX etdm_tech_approval_idx       ON public.etdm_technologies (approval_status);
CREATE INDEX etdm_tech_active_idx         ON public.etdm_technologies (is_active);
CREATE INDEX etdm_tech_deleted_idx        ON public.etdm_technologies (is_deleted);
CREATE INDEX etdm_tech_tenant_idx         ON public.etdm_technologies (tenant_id);
CREATE INDEX etdm_tech_updated_idx        ON public.etdm_technologies (updated_at DESC);
CREATE INDEX etdm_tech_tags_gin           ON public.etdm_technologies USING gin (tags);
CREATE INDEX etdm_tech_search_gin ON public.etdm_technologies USING gin (
  to_tsvector('simple',
    coalesce(technology_name,'') || ' ' ||
    coalesce(short_name,'') || ' ' ||
    coalesce(vendor_name,'') || ' ' ||
    coalesce(product_family,'') || ' ' ||
    coalesce(product_name,'') || ' ' ||
    coalesce(description,'')
  )
);

-- updated_at maintenance
CREATE TRIGGER etdm_tech_set_updated_at
  BEFORE UPDATE ON public.etdm_technologies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.etdm_technologies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "etdm_tech_admin_select"
  ON public.etdm_technologies FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "etdm_tech_admin_insert"
  ON public.etdm_technologies FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "etdm_tech_admin_update"
  ON public.etdm_technologies FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "etdm_tech_admin_delete"
  ON public.etdm_technologies FOR DELETE TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- Convenience view for the app: default excludes soft-deleted rows.
CREATE OR REPLACE VIEW public.etdm_technologies_active AS
  SELECT * FROM public.etdm_technologies WHERE is_deleted = false;

GRANT SELECT ON public.etdm_technologies_active TO authenticated;
GRANT ALL ON public.etdm_technologies_active TO service_role;

-- 2) AUDIT LOG -----------------------------------------------
CREATE TABLE public.etdm_record_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  previous_values jsonb,
  new_values jsonb,
  changed_fields text[] DEFAULT '{}'::text[],
  reason text,
  source text,
  correlation_id text
);

GRANT SELECT, INSERT ON public.etdm_record_audit_log TO authenticated;
GRANT ALL ON public.etdm_record_audit_log TO service_role;

CREATE INDEX etdm_audit_entity_idx ON public.etdm_record_audit_log (entity_type, entity_id, changed_at DESC);
CREATE INDEX etdm_audit_changed_at_idx ON public.etdm_record_audit_log (changed_at DESC);

ALTER TABLE public.etdm_record_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "etdm_audit_admin_select"
  ON public.etdm_record_audit_log FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "etdm_audit_admin_insert"
  ON public.etdm_record_audit_log FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Audit trigger writer
CREATE OR REPLACE FUNCTION public.etdm_write_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_prev jsonb;
  v_new jsonb;
  v_changed text[];
  k text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_prev := NULL;
    v_new := to_jsonb(NEW);
    v_changed := ARRAY[]::text[];
  ELSIF TG_OP = 'UPDATE' THEN
    v_prev := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_changed := ARRAY[]::text[];
    FOR k IN SELECT jsonb_object_keys(v_new) LOOP
      IF v_prev->k IS DISTINCT FROM v_new->k THEN
        v_changed := array_append(v_changed, k);
      END IF;
    END LOOP;
    IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
      v_action := 'soft_delete';
    ELSIF NEW.is_deleted = false AND OLD.is_deleted = true THEN
      v_action := 'restore';
    ELSIF NEW.is_active <> OLD.is_active THEN
      v_action := CASE WHEN NEW.is_active THEN 'activate' ELSE 'deactivate' END;
    ELSIF NEW.approval_status <> OLD.approval_status THEN
      v_action := 'approval_status_change';
    ELSE
      v_action := 'update';
    END IF;
  ELSE
    v_action := 'delete';
    v_prev := to_jsonb(OLD);
    v_new := NULL;
    v_changed := ARRAY[]::text[];
  END IF;

  INSERT INTO public.etdm_record_audit_log(
    tenant_id, entity_type, entity_id, action, changed_by,
    previous_values, new_values, changed_fields, source
  ) VALUES (
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    'technology',
    COALESCE(NEW.id, OLD.id),
    v_action,
    auth.uid(),
    v_prev, v_new, v_changed,
    'portal'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER etdm_tech_audit_ins
  AFTER INSERT ON public.etdm_technologies
  FOR EACH ROW EXECUTE FUNCTION public.etdm_write_audit();

CREATE TRIGGER etdm_tech_audit_upd
  AFTER UPDATE ON public.etdm_technologies
  FOR EACH ROW EXECUTE FUNCTION public.etdm_write_audit();

CREATE TRIGGER etdm_tech_audit_del
  AFTER DELETE ON public.etdm_technologies
  FOR EACH ROW EXECUTE FUNCTION public.etdm_write_audit();

-- 3) CLONE RPC -----------------------------------------------
CREATE OR REPLACE FUNCTION public.etdm_clone_technology(_source_id uuid)
RETURNS public.etdm_technologies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new public.etdm_technologies;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.etdm_technologies (
    tenant_id, technology_name, short_name, slug, description, category, technology_type,
    vendor_name, product_family, product_name, version, edition, lifecycle_status,
    technology_icon_url, banner_image_url, color_theme, tags,
    technology_tower, primary_domain, secondary_domains,
    technology_owner_id, business_owner_id, engineering_owner_id, operations_owner_id, security_owner_id, data_owner_id,
    support_group, escalation_group,
    product_website_url, documentation_url, support_url, community_url,
    licensing_model, support_contract_reference,
    general_availability_date, end_of_sale_date, end_of_mainstream_support_date, end_of_extended_support_date, end_of_life_date,
    replacement_technology_id, upgrade_path, lifecycle_notes,
    business_purpose, typical_use_cases, supported_industries, business_criticality, target_audiences,
    supported_business_services, typical_deployment_size, business_impact_if_unavailable, strategic_importance, business_outcome_summary,
    deployment_models, supported_operating_systems, supported_cloud_providers, supported_hypervisors, supported_databases, supported_architectures,
    api_available, rest_api_available, graphql_available, sdk_available, cli_available, powershell_available, webhooks_available,
    agent_required, agentless_supported, high_availability_supported, clustering_supported, disaster_recovery_supported, backup_supported, multi_region_supported,
    scalability_model, technical_prerequisites, technical_limitations,
    native_integrations, third_party_integrations, authentication_methods,
    monitoring_integrations, itsm_integrations, siem_integrations, automation_integrations, data_integrations, integration_notes,
    authentication_types, authorization_model, mfa_supported, rbac_supported, encryption_at_rest, encryption_in_transit, audit_logging_supported,
    security_certifications, compliance_standards, data_classification, data_residency_requirements, known_security_considerations, required_security_controls,
    automation_ready, ai_ready, infrastructure_as_code_supported, available_automation_interfaces,
    digital_coworkers_available, automations_available, runbooks_available, sop_library_available, knowledge_articles_available, ai_playbooks_available,
    automation_opportunity_summary, ai_opportunity_summary,
    technology_maturity, operational_maturity_score, automation_maturity_score, ai_maturity_score, security_maturity_score,
    documentation_completeness_percentage, support_readiness_score, digital_twin_readiness_score, overall_maturity_notes,
    visibility, tenant_scope, governance_notes, source_of_record,
    approval_status, is_active, is_deleted,
    cloned_from_technology_id, created_by, updated_by
  )
  SELECT
    tenant_id, technology_name || ' (Copy)', short_name, slug || '-copy-' || substr(gen_random_uuid()::text, 1, 6),
    description, category, technology_type,
    vendor_name, product_family, product_name, version, edition, lifecycle_status,
    technology_icon_url, banner_image_url, color_theme, tags,
    technology_tower, primary_domain, secondary_domains,
    technology_owner_id, business_owner_id, engineering_owner_id, operations_owner_id, security_owner_id, data_owner_id,
    support_group, escalation_group,
    product_website_url, documentation_url, support_url, community_url,
    licensing_model, support_contract_reference,
    general_availability_date, end_of_sale_date, end_of_mainstream_support_date, end_of_extended_support_date, end_of_life_date,
    replacement_technology_id, upgrade_path, lifecycle_notes,
    business_purpose, typical_use_cases, supported_industries, business_criticality, target_audiences,
    supported_business_services, typical_deployment_size, business_impact_if_unavailable, strategic_importance, business_outcome_summary,
    deployment_models, supported_operating_systems, supported_cloud_providers, supported_hypervisors, supported_databases, supported_architectures,
    api_available, rest_api_available, graphql_available, sdk_available, cli_available, powershell_available, webhooks_available,
    agent_required, agentless_supported, high_availability_supported, clustering_supported, disaster_recovery_supported, backup_supported, multi_region_supported,
    scalability_model, technical_prerequisites, technical_limitations,
    native_integrations, third_party_integrations, authentication_methods,
    monitoring_integrations, itsm_integrations, siem_integrations, automation_integrations, data_integrations, integration_notes,
    authentication_types, authorization_model, mfa_supported, rbac_supported, encryption_at_rest, encryption_in_transit, audit_logging_supported,
    security_certifications, compliance_standards, data_classification, data_residency_requirements, known_security_considerations, required_security_controls,
    automation_ready, ai_ready, infrastructure_as_code_supported, available_automation_interfaces,
    digital_coworkers_available, automations_available, runbooks_available, sop_library_available, knowledge_articles_available, ai_playbooks_available,
    automation_opportunity_summary, ai_opportunity_summary,
    technology_maturity, operational_maturity_score, automation_maturity_score, ai_maturity_score, security_maturity_score,
    documentation_completeness_percentage, support_readiness_score, digital_twin_readiness_score, overall_maturity_notes,
    visibility, tenant_scope, governance_notes, source_of_record,
    'Draft', false, false,
    id, auth.uid(), auth.uid()
  FROM public.etdm_technologies
  WHERE id = _source_id AND is_deleted = false
  RETURNING * INTO v_new;

  IF v_new IS NULL THEN
    RAISE EXCEPTION 'source_not_found';
  END IF;

  RETURN v_new;
END;
$$;

-- 4) STORAGE BUCKET ------------------------------------------
-- (Bucket itself is created via the storage tool; policies are here.)

-- 5) SEED SAMPLE DATA ----------------------------------------
INSERT INTO public.etdm_technologies
  (technology_name, short_name, slug, description, category, technology_type, vendor_name, product_family, product_name, lifecycle_status, business_criticality, technology_maturity, approval_status, is_active, is_sample, tags)
VALUES
  ('Microsoft Windows Server','Windows Server','windows-server','Enterprise server operating system.','Operating System','Infrastructure','Microsoft','Windows Server','Windows Server','Active','Business Critical','Mature','Draft', false, true, ARRAY['sample_data','os','microsoft']),
  ('Microsoft SQL Server','SQL Server','sql-server','Relational database management system.','Database','Platform','Microsoft','SQL Server','SQL Server','Active','Mission Critical','Mature','Draft', false, true, ARRAY['sample_data','database','microsoft']),
  ('Citrix Virtual Apps and Desktops','Citrix VAD','citrix-virtual-apps-and-desktops','Application and desktop virtualization platform.','Virtualization','Platform','Citrix','CVAD','Citrix Virtual Apps and Desktops','Active','Business Critical','Mature','Draft', false, true, ARRAY['sample_data','citrix','vdi']);
