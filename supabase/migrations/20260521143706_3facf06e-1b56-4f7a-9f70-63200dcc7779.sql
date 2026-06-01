
-- 1. Extend profiles with approval fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Validation: approval_status must be one of pending/approved/rejected
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_approval_status_check') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_approval_status_check
      CHECK (approval_status IN ('pending','approved','rejected'));
  END IF;
END$$;

-- Unique user_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END$$;

-- 2. Helper: is user approved
CREATE OR REPLACE FUNCTION public.is_user_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND approval_status = 'approved'
  ) OR public.is_platform_admin(_user_id);
$$;

-- 3. Trigger to auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  super_admin_emails text[] := ARRAY[
    'ryan.blackwell@neurealm.com',
    'bala.janagaraja@neurealm.com',
    'srikanth.burra@neurealm.com'
  ];
  is_super boolean;
BEGIN
  is_super := lower(NEW.email) = ANY(super_admin_emails);

  INSERT INTO public.profiles (user_id, email, display_name, approval_status, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN is_super THEN 'approved' ELSE 'pending' END,
    CASE WHEN is_super THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email;

  IF is_super THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'platform_admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill profiles for existing users
INSERT INTO public.profiles (user_id, email, display_name, approval_status, approved_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  CASE WHEN lower(u.email) IN (
    'ryan.blackwell@neurealm.com',
    'bala.janagaraja@neurealm.com',
    'srikanth.burra@neurealm.com'
  ) THEN 'approved' ELSE 'pending' END,
  CASE WHEN lower(u.email) IN (
    'ryan.blackwell@neurealm.com',
    'bala.janagaraja@neurealm.com',
    'srikanth.burra@neurealm.com'
  ) THEN now() ELSE NULL END
FROM auth.users u
ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      approval_status = CASE
        WHEN lower(EXCLUDED.email) IN (
          'ryan.blackwell@neurealm.com',
          'bala.janagaraja@neurealm.com',
          'srikanth.burra@neurealm.com'
        ) THEN 'approved'
        ELSE public.profiles.approval_status
      END,
      approved_at = CASE
        WHEN lower(EXCLUDED.email) IN (
          'ryan.blackwell@neurealm.com',
          'bala.janagaraja@neurealm.com',
          'srikanth.burra@neurealm.com'
        ) AND public.profiles.approved_at IS NULL THEN now()
        ELSE public.profiles.approved_at
      END;

-- 5. Grant platform_admin to the three users (if they exist)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'platform_admin'::app_role
FROM auth.users u
WHERE lower(u.email) IN (
  'ryan.blackwell@neurealm.com',
  'bala.janagaraja@neurealm.com',
  'srikanth.burra@neurealm.com'
)
ON CONFLICT DO NOTHING;

-- 6. Update RLS: only platform admins can change approval-related fields
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Users update own profile basic fields"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Platform admins update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));
