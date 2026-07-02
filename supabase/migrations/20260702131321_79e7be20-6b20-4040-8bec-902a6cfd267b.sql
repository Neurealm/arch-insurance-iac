-- All new signups get auto-approved and receive platform_support (read-only) role by default.
-- Super-admin emails still get platform_admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  super_admin_emails text[] := ARRAY[
    'ryan.blackwell@neurealm.com',
    'vidyarth.v@neurealm.com',
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
  is_invited boolean;
  email_domain text;
BEGIN
  email_domain := lower(split_part(NEW.email, '@', 2));
  is_super := lower(NEW.email) = ANY(super_admin_emails);
  is_invited := (NEW.raw_user_meta_data ? 'invited_to_tenant')
                OR (NEW.invited_at IS NOT NULL);

  IF NOT is_super AND NOT is_invited AND email_domain = ANY(blocked_domains) THEN
    RAISE EXCEPTION 'Please use your work email — personal email domains are not allowed';
  END IF;

  INSERT INTO public.profiles (user_id, email, display_name, approval_status, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'approved',
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        approval_status = 'approved',
        approved_at = COALESCE(public.profiles.approved_at, now());

  IF is_super THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'platform_admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'platform_support')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;