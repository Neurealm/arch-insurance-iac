
-- 1. Add company_id column on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- 2. Trigger function to sync profile.company -> crm_companies
CREATE OR REPLACE FUNCTION public.sync_profile_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_id uuid;
BEGIN
  v_name := nullif(btrim(NEW.company), '');

  IF v_name IS NULL THEN
    NEW.company_id := NULL;
    RETURN NEW;
  END IF;

  SELECT id INTO v_id
  FROM public.crm_companies
  WHERE lower(name) = lower(v_name)
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.crm_companies (
      name, industry, company_type, website, email, phone, address,
      account_owner, status, priority, notes, tags, lifecycle_stage
    ) VALUES (
      v_name, '', 'Customer', '', '', '', '',
      '', true, 'Medium', '', ARRAY[]::text[], 'prospect'
    )
    RETURNING id INTO v_id;
  END IF;

  NEW.company_id := v_id;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_profile_company() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_profiles_sync_company ON public.profiles;
CREATE TRIGGER trg_profiles_sync_company
  BEFORE INSERT OR UPDATE OF company ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_company();

-- 3. Backfill existing rows
DO $$
DECLARE
  r RECORD;
  v_id uuid;
  v_name text;
BEGIN
  FOR r IN
    SELECT user_id, company
    FROM public.profiles
    WHERE company IS NOT NULL AND btrim(company) <> '' AND company_id IS NULL
  LOOP
    v_name := btrim(r.company);
    SELECT id INTO v_id FROM public.crm_companies WHERE lower(name) = lower(v_name) ORDER BY created_at ASC LIMIT 1;
    IF v_id IS NULL THEN
      INSERT INTO public.crm_companies (
        name, industry, company_type, website, email, phone, address,
        account_owner, status, priority, notes, tags, lifecycle_stage
      ) VALUES (
        v_name, '', 'Customer', '', '', '', '',
        '', true, 'Medium', '', ARRAY[]::text[], 'prospect'
      )
      RETURNING id INTO v_id;
    END IF;
    UPDATE public.profiles SET company_id = v_id WHERE user_id = r.user_id;
  END LOOP;
END $$;
