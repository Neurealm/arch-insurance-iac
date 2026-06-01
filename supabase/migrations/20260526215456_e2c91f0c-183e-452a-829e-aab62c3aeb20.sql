
CREATE TABLE public.integrations_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  auth_type text NOT NULL DEFAULT 'oauth',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.integrations_catalog TO authenticated;
GRANT ALL ON public.integrations_catalog TO service_role;

ALTER TABLE public.integrations_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read integrations_catalog"
  ON public.integrations_catalog FOR SELECT TO authenticated USING (true);

CREATE POLICY "Platform admins manage integrations_catalog"
  ON public.integrations_catalog FOR ALL TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE TRIGGER trg_integrations_catalog_updated
  BEFORE UPDATE ON public.integrations_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.tenant_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  integration_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'not_installed',
  enabled boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, integration_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_integrations TO authenticated;
GRANT ALL ON public.tenant_integrations TO service_role;

ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read tenant_integrations"
  ON public.tenant_integrations FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()) OR is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Platform admins manage tenant_integrations"
  ON public.tenant_integrations FOR ALL TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE TRIGGER trg_tenant_integrations_updated
  BEFORE UPDATE ON public.tenant_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.integrations_catalog (key, name, description, category, icon, auth_type) VALUES
  ('servicenow', 'ServiceNow', 'ITSM tickets, incidents, change requests', 'ITSM', 'ticket', 'oauth'),
  ('jira', 'Jira', 'Issue and project tracking', 'DevOps', 'kanban', 'oauth'),
  ('slack', 'Slack', 'Team messaging and notifications', 'Collaboration', 'message-square', 'oauth'),
  ('github', 'GitHub', 'Source control and CI events', 'DevOps', 'github', 'oauth'),
  ('datadog', 'Datadog', 'Metrics, traces, and monitoring', 'Observability', 'activity', 'api_key'),
  ('splunk', 'Splunk', 'Log analytics and SIEM', 'Observability', 'search', 'api_key'),
  ('azure', 'Azure', 'Cloud resources and identity', 'Cloud', 'cloud', 'oauth'),
  ('aws', 'AWS', 'Cloud resources and services', 'Cloud', 'cloud', 'iam_role');
