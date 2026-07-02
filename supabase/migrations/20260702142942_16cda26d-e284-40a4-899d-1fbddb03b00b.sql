
-- 1) Storage: evidence bucket — replace broad policies with owner-scoped ones
DROP POLICY IF EXISTS "Authenticated can read evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read evidence files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload evidence files" ON storage.objects;

CREATE POLICY "Owners read own evidence"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'evidence'
    AND (
      owner = auth.uid()
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_platform_admin(auth.uid())
    )
  );

CREATE POLICY "Users upload own evidence"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'evidence'
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2) profiles: restrict SELECT to self or admin
DROP POLICY IF EXISTS "Profiles readable by authenticated" ON public.profiles;
CREATE POLICY "Profiles readable by self or admin"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_platform_admin(auth.uid()));

-- 3) tenants: remove anon public read
DROP POLICY IF EXISTS "Public read tenant basics" ON public.tenants;

-- 4) CRM tables: restrict SELECT to platform admins (tenant model retired)
DROP POLICY IF EXISTS "Approved users read crm_companies" ON public.crm_companies;
CREATE POLICY "Platform admins read crm_companies"
  ON public.crm_companies FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Approved users read crm_stakeholders" ON public.crm_stakeholders;
CREATE POLICY "Platform admins read crm_stakeholders"
  ON public.crm_stakeholders FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Approved users read crm_activities" ON public.crm_activities;
CREATE POLICY "Platform admins read crm_activities"
  ON public.crm_activities FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Approved users read crm_notes" ON public.crm_notes;
CREATE POLICY "Platform admins read crm_notes"
  ON public.crm_notes FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Approved users read crm_departments" ON public.crm_departments;
CREATE POLICY "Platform admins read crm_departments"
  ON public.crm_departments FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Approved users read crm_teams" ON public.crm_teams;
CREATE POLICY "Platform admins read crm_teams"
  ON public.crm_teams FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- 5) stakeholder_registers: restrict SELECT to platform admins
DROP POLICY IF EXISTS "Approved users read stakeholder_registers" ON public.stakeholder_registers;
CREATE POLICY "Platform admins read stakeholder_registers"
  ON public.stakeholder_registers FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- 6) Revoke EXECUTE on SECURITY DEFINER helper functions from public API roles.
--    RLS policies invoke these as the postgres role, so revoking anon/authenticated
--    execute privileges does not affect policy evaluation.
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_user_approved(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_tenant_role(uuid, uuid, public.tenant_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_user_page_activity(uuid, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_user_login_event(uuid, text, text, text, text, text, text, jsonb) FROM anon, PUBLIC;
-- record_user_login_event is called from the client for the signed-in user;
-- keep EXECUTE for `authenticated` only.
GRANT EXECUTE ON FUNCTION public.record_user_login_event(uuid, text, text, text, text, text, text, jsonb) TO authenticated;
