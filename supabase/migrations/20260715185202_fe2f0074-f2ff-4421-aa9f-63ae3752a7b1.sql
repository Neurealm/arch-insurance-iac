
-- 1. New branding-asset metadata columns on etdm_technologies
ALTER TABLE public.etdm_technologies
  ADD COLUMN IF NOT EXISTS technology_image_url text,
  ADD COLUMN IF NOT EXISTS technology_image_storage_path text,
  ADD COLUMN IF NOT EXISTS technology_image_original_filename text,
  ADD COLUMN IF NOT EXISTS technology_image_type text,
  ADD COLUMN IF NOT EXISTS technology_image_width integer,
  ADD COLUMN IF NOT EXISTS technology_image_height integer,
  ADD COLUMN IF NOT EXISTS technology_image_crop_metadata jsonb,
  ADD COLUMN IF NOT EXISTS technology_image_scale numeric,
  ADD COLUMN IF NOT EXISTS technology_image_last_updated timestamptz,
  ADD COLUMN IF NOT EXISTS technology_image_last_updated_by uuid;

-- 2. Update clone function to carry the branding-asset reference into the copy.
CREATE OR REPLACE FUNCTION public.etdm_clone_technology(_source_id uuid)
 RETURNS etdm_technologies
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    technology_tower, neurealm_practice, primary_domain, secondary_domains,
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
    technology_image_url, technology_image_storage_path, technology_image_original_filename,
    technology_image_type, technology_image_width, technology_image_height,
    technology_image_crop_metadata, technology_image_scale,
    technology_image_last_updated, technology_image_last_updated_by,
    cloned_from_technology_id, created_by, updated_by
  )
  SELECT
    tenant_id, technology_name || ' (Copy)', short_name, slug || '-copy-' || substr(gen_random_uuid()::text, 1, 6),
    description, category, technology_type,
    vendor_name, product_family, product_name, version, edition, lifecycle_status,
    technology_icon_url, banner_image_url, color_theme, tags,
    technology_tower, neurealm_practice, primary_domain, secondary_domains,
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
    technology_image_url, technology_image_storage_path, technology_image_original_filename,
    technology_image_type, technology_image_width, technology_image_height,
    technology_image_crop_metadata, technology_image_scale,
    technology_image_last_updated, technology_image_last_updated_by,
    id, auth.uid(), auth.uid()
  FROM public.etdm_technologies
  WHERE id = _source_id AND is_deleted = false
  RETURNING * INTO v_new;

  IF v_new IS NULL THEN
    RAISE EXCEPTION 'source_not_found';
  END IF;

  RETURN v_new;
END;
$function$;

-- 3. Storage policies on the private `etdm-assets` bucket for technology branding.
DROP POLICY IF EXISTS "etdm_assets_read_authenticated" ON storage.objects;
CREATE POLICY "etdm_assets_read_authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'etdm-assets');

DROP POLICY IF EXISTS "etdm_assets_admin_insert" ON storage.objects;
CREATE POLICY "etdm_assets_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'etdm-assets' AND public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "etdm_assets_admin_update" ON storage.objects;
CREATE POLICY "etdm_assets_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'etdm-assets' AND public.is_platform_admin(auth.uid()))
  WITH CHECK (bucket_id = 'etdm-assets' AND public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "etdm_assets_admin_delete" ON storage.objects;
CREATE POLICY "etdm_assets_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'etdm-assets' AND public.is_platform_admin(auth.uid()));
