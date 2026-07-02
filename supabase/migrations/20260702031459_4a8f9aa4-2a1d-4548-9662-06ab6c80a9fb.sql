
-- 1. User category enum + column on profiles
DO $$ BEGIN
  CREATE TYPE public.user_category AS ENUM ('neurealm_employee', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_category public.user_category;

-- Backfill existing rows from email domain
UPDATE public.profiles
   SET user_category = CASE
     WHEN lower(split_part(coalesce(email,''), '@', 2)) = 'neurealm.com' THEN 'neurealm_employee'::public.user_category
     ELSE 'customer'::public.user_category
   END
 WHERE user_category IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN user_category SET DEFAULT 'customer';

-- Auto-assign on insert based on email domain
CREATE OR REPLACE FUNCTION public.set_user_category_from_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.user_category IS NULL THEN
    IF NEW.email IS NOT NULL AND lower(split_part(NEW.email, '@', 2)) = 'neurealm.com' THEN
      NEW.user_category := 'neurealm_employee';
    ELSE
      NEW.user_category := 'customer';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_set_user_category ON public.profiles;
CREATE TRIGGER trg_profiles_set_user_category
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_user_category_from_email();

-- 2. Page activity log (lightweight)
CREATE TABLE IF NOT EXISTS public.user_page_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  page_title TEXT,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_page_activity_user_time
  ON public.user_page_activity (user_id, entered_at DESC);

GRANT SELECT, INSERT ON public.user_page_activity TO authenticated;
GRANT ALL ON public.user_page_activity TO service_role;

ALTER TABLE public.user_page_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own page activity" ON public.user_page_activity;
CREATE POLICY "Users insert own page activity" ON public.user_page_activity
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all page activity" ON public.user_page_activity;
CREATE POLICY "Admins read all page activity" ON public.user_page_activity
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Users read own page activity" ON public.user_page_activity;
CREATE POLICY "Users read own page activity" ON public.user_page_activity
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. Admin RPC to fetch a user's page activity
CREATE OR REPLACE FUNCTION public.admin_user_page_activity(
  _user_id uuid,
  _days integer DEFAULT 7,
  _limit integer DEFAULT 500
)
RETURNS TABLE (
  id uuid,
  session_id text,
  path text,
  page_title text,
  referrer_path text,
  entered_at timestamptz,
  left_at timestamptz,
  duration_ms bigint,
  user_agent text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
  SELECT a.id,
         NULL::text AS session_id,
         a.path,
         a.page_title,
         NULL::text AS referrer_path,
         a.entered_at,
         NULL::timestamptz AS left_at,
         NULL::bigint AS duration_ms,
         NULL::text AS user_agent
    FROM public.user_page_activity a
   WHERE a.user_id = _user_id
     AND a.entered_at >= now() - make_interval(days => GREATEST(1, _days))
   ORDER BY a.entered_at DESC
   LIMIT GREATEST(1, LEAST(_limit, 2000));
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_user_page_activity(uuid, integer, integer) TO authenticated;
