
-- 1. Fix tenants public read exposing primary_admin_email
DROP POLICY IF EXISTS "Public read tenant basics" ON public.tenants;
REVOKE SELECT ON public.tenants FROM anon;
GRANT SELECT (id, name, slug, logo_url, status) ON public.tenants TO anon;
CREATE POLICY "Public read tenant basics"
  ON public.tenants FOR SELECT
  TO anon
  USING (true);

-- 2. Prevent profile self-approval
REVOKE UPDATE (approval_status, approved_by, approved_at) ON public.profiles FROM authenticated;

-- 3. Require approval to self-join tenant
DROP POLICY IF EXISTS "Users self-join tenant on signup" ON public.tenant_memberships;
CREATE POLICY "Users self-join tenant on signup"
  ON public.tenant_memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'tenant_member'::tenant_role
    AND public.is_user_approved(auth.uid())
  );

-- 4. Add approved-user SELECT policies to CRM tables
CREATE POLICY "Approved users read crm_companies"
  ON public.crm_companies FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users read crm_stakeholders"
  ON public.crm_stakeholders FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users read crm_departments"
  ON public.crm_departments FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users read crm_teams"
  ON public.crm_teams FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users read crm_notes"
  ON public.crm_notes FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users read crm_activities"
  ON public.crm_activities FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users read stakeholder_registers"
  ON public.stakeholder_registers FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

-- 5. Avatars bucket: stop anonymous listing while allowing access to specific files
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Authenticated read avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');
