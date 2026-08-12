
-- 1. Additive columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS preferred_contact_method text,
  ADD COLUMN IF NOT EXISTS working_location_type text,
  ADD COLUMN IF NOT EXISTS office_site text,
  ADD COLUMN IF NOT EXISTS hybrid_days text[],
  ADD COLUMN IF NOT EXISTS weekly_hours jsonb,
  ADD COLUMN IF NOT EXISTS ooo_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ooo_start date,
  ADD COLUMN IF NOT EXISTS ooo_end date,
  ADD COLUMN IF NOT EXISTS ooo_delegate_user_id uuid,
  ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_preferred_contact_method_check') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_preferred_contact_method_check
      CHECK (preferred_contact_method IS NULL OR preferred_contact_method IN ('email','sms','phone','push'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_working_location_type_check') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_working_location_type_check
      CHECK (working_location_type IS NULL OR working_location_type IN ('remote','hybrid','onsite'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_ooo_delegate_fk') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_ooo_delegate_fk
      FOREIGN KEY (ooo_delegate_user_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. user_contact_methods
CREATE TABLE IF NOT EXISTS public.user_contact_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  method_type text NOT NULL CHECK (method_type IN ('email','sms','phone','push')),
  value text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS user_contact_methods_unique
  ON public.user_contact_methods (user_id, method_type, lower(value));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_contact_methods TO authenticated;
GRANT ALL ON public.user_contact_methods TO service_role;

ALTER TABLE public.user_contact_methods ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_contact_methods' AND policyname='own_contact_methods_select') THEN
    CREATE POLICY own_contact_methods_select ON public.user_contact_methods FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_contact_methods' AND policyname='own_contact_methods_insert') THEN
    CREATE POLICY own_contact_methods_insert ON public.user_contact_methods FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_contact_methods' AND policyname='own_contact_methods_update') THEN
    CREATE POLICY own_contact_methods_update ON public.user_contact_methods FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_contact_methods' AND policyname='own_contact_methods_delete') THEN
    CREATE POLICY own_contact_methods_delete ON public.user_contact_methods FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TRIGGER user_contact_methods_touch
  BEFORE UPDATE ON public.user_contact_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. user_notification_rules
CREATE TABLE IF NOT EXISTS public.user_notification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  priority text NOT NULL CHECK (priority IN ('P1','P2','P3','P4')),
  channels text[] NOT NULL DEFAULT ARRAY[]::text[],
  timing text,
  escalate_after_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, priority)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notification_rules TO authenticated;
GRANT ALL ON public.user_notification_rules TO service_role;

ALTER TABLE public.user_notification_rules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_notification_rules' AND policyname='own_notif_rules_select') THEN
    CREATE POLICY own_notif_rules_select ON public.user_notification_rules FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_notification_rules' AND policyname='own_notif_rules_insert') THEN
    CREATE POLICY own_notif_rules_insert ON public.user_notification_rules FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_notification_rules' AND policyname='own_notif_rules_update') THEN
    CREATE POLICY own_notif_rules_update ON public.user_notification_rules FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_notification_rules' AND policyname='own_notif_rules_delete') THEN
    CREATE POLICY own_notif_rules_delete ON public.user_notification_rules FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TRIGGER user_notification_rules_touch
  BEFORE UPDATE ON public.user_notification_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Seeding helper — used by trigger and backfill
CREATE OR REPLACE FUNCTION public.seed_user_defaults(_user_id uuid, _email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_notification_rules (user_id, priority, channels, timing, escalate_after_minutes)
  VALUES
    (_user_id, 'P1', ARRAY['sms','push','phone'], 'Immediately', 3),
    (_user_id, 'P2', ARRAY['sms','push'],         'Immediately', 10),
    (_user_id, 'P3', ARRAY['email','push'],       'Within 30 minutes', NULL),
    (_user_id, 'P4', ARRAY['email'],              'Daily digest, 8:00 AM local', NULL)
  ON CONFLICT (user_id, priority) DO NOTHING;

  IF _email IS NOT NULL AND length(_email) > 0 THEN
    INSERT INTO public.user_contact_methods (user_id, method_type, value, verified, label)
    VALUES (_user_id, 'email', _email, true, 'Primary email')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- 5. Update handle_new_user to also seed defaults (preserves existing logic)
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
  is_oauth boolean;
  email_domain text;
BEGIN
  email_domain := lower(split_part(NEW.email, '@', 2));
  is_super := lower(NEW.email) = ANY(super_admin_emails);
  is_invited := (NEW.raw_user_meta_data ? 'invited_to_tenant')
                OR (NEW.raw_user_meta_data ? 'invited')
                OR (NEW.invited_at IS NOT NULL);
  is_oauth := coalesce(NEW.raw_app_meta_data->>'provider', 'email') <> 'email';

  IF NOT is_super AND NOT is_invited AND NOT is_oauth AND email_domain = ANY(blocked_domains) THEN
    RAISE EXCEPTION 'Please use your work email — personal email domains are not allowed';
  END IF;

  INSERT INTO public.profiles (user_id, email, display_name, approval_status, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN is_super OR is_invited THEN 'approved' ELSE 'pending' END,
    CASE WHEN is_super OR is_invited THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email;

  IF is_super THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'platform_admin')
    ON CONFLICT DO NOTHING;
  ELSIF is_invited THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'platform_support')
    ON CONFLICT DO NOTHING;
  END IF;

  PERFORM public.seed_user_defaults(NEW.id, NEW.email);

  RETURN NEW;
END;
$function$;

-- 6. Backfill for existing users
UPDATE public.profiles
   SET first_name = split_part(full_name, ' ', 1),
       last_name  = NULLIF(regexp_replace(full_name, '^\S+\s*', ''), '')
 WHERE first_name IS NULL AND full_name IS NOT NULL AND length(full_name) > 0;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT user_id, email FROM public.profiles LOOP
    PERFORM public.seed_user_defaults(r.user_id, r.email);
  END LOOP;
END $$;
