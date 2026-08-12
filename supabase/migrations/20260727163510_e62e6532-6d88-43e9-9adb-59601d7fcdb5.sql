CREATE TABLE public.commercial_narrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  narration_key text NOT NULL,
  title text NOT NULL,
  description text,
  script text NOT NULL,
  voice text NOT NULL DEFAULT 'onyx',
  instructions text NOT NULL DEFAULT 'Speak in a natural, professional male voice.',
  speed numeric NOT NULL DEFAULT 1.0,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT commercial_narrations_key_unique UNIQUE (tenant_id, narration_key),
  CONSTRAINT commercial_narrations_speed_range CHECK (speed >= 0.25 AND speed <= 4.0),
  CONSTRAINT commercial_narrations_script_len CHECK (char_length(script) BETWEEN 1 AND 20000)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_narrations TO authenticated;
GRANT ALL ON public.commercial_narrations TO service_role;

ALTER TABLE public.commercial_narrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY commercial_narrations_select ON public.commercial_narrations
  FOR SELECT USING (commercial_is_member_with_view(tenant_id));

CREATE POLICY commercial_narrations_insert ON public.commercial_narrations
  FOR INSERT WITH CHECK (commercial_can_write(tenant_id, 'commercial.program.manage'));

CREATE POLICY commercial_narrations_update ON public.commercial_narrations
  FOR UPDATE USING (commercial_can_write(tenant_id, 'commercial.program.manage'))
  WITH CHECK (commercial_can_write(tenant_id, 'commercial.program.manage'));

CREATE POLICY commercial_narrations_delete ON public.commercial_narrations
  FOR DELETE USING (commercial_can_write(tenant_id, 'commercial.program.manage'));

CREATE OR REPLACE FUNCTION public.commercial_narrations_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := COALESCE(NEW.created_by, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER commercial_narrations_touch
BEFORE INSERT OR UPDATE ON public.commercial_narrations
FOR EACH ROW EXECUTE FUNCTION public.commercial_narrations_touch();

CREATE INDEX commercial_narrations_tenant_active_idx
  ON public.commercial_narrations (tenant_id, narration_key) WHERE is_active;