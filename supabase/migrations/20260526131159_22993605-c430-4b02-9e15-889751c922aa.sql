
-- 1. Server-side enforcement of work-email domain on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  super_admin_emails text[] := ARRAY[
    'ryan.blackwell@neurealm.com',
    'bala.janagaraja@neurealm.com',
    'srikanth.burra@neurealm.com'
  ];
  blocked_domains text[] := ARRAY[
    'gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','yahoo.co.in','ymail.com','rocketmail.com',
    'hotmail.com','outlook.com','live.com','msn.com','passport.com',
    'aol.com','icloud.com','me.com','mac.com','proton.me','protonmail.com','pm.me',
    'zoho.com','gmx.com','gmx.net','mail.com','yandex.com','yandex.ru','tutanota.com',
    'fastmail.com','hey.com','duck.com','qq.com','163.com','126.com','sina.com','naver.com','rediffmail.com'
  ];
  is_super boolean;
  email_domain text;
BEGIN
  email_domain := lower(split_part(NEW.email, '@', 2));
  is_super := lower(NEW.email) = ANY(super_admin_emails);

  IF NOT is_super AND email_domain = ANY(blocked_domains) THEN
    RAISE EXCEPTION 'Please use your work email — personal email domains are not allowed';
  END IF;

  INSERT INTO public.profiles (user_id, email, display_name, approval_status, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN is_super THEN 'approved' ELSE 'pending' END,
    CASE WHEN is_super THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

  IF is_super THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'platform_admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2. Revoke EXECUTE on SECURITY DEFINER helpers from anon role
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_tenant_role(uuid, uuid, tenant_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_user_approved(uuid) FROM anon;

-- 3. CRM tables: limit writes/reads to approved users
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['crm_companies','crm_stakeholders','crm_departments','crm_teams','crm_notes','crm_activities','stakeholder_registers']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated read %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated insert %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated update %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated delete %1$s" ON public.%1$s', t);

    EXECUTE format('CREATE POLICY "Approved read %1$s" ON public.%1$s FOR SELECT TO authenticated USING (public.is_user_approved(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Approved insert %1$s" ON public.%1$s FOR INSERT TO authenticated WITH CHECK (public.is_user_approved(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Approved update %1$s" ON public.%1$s FOR UPDATE TO authenticated USING (public.is_user_approved(auth.uid())) WITH CHECK (public.is_user_approved(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Approved delete %1$s" ON public.%1$s FOR DELETE TO authenticated USING (public.is_user_approved(auth.uid()))', t);
  END LOOP;
END$$;

-- 4. Org hierarchy tables: read for approved, writes restricted to platform admins
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['org_business_units','org_practices','org_capability_areas','org_service_functions','org_workflows','org_activities','org_tasks']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated read %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated manage %1$s" ON public.%1$s', t);

    EXECUTE format('CREATE POLICY "Approved read %1$s" ON public.%1$s FOR SELECT TO authenticated USING (public.is_user_approved(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Platform admins manage %1$s" ON public.%1$s FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()))', t);
  END LOOP;
END$$;
