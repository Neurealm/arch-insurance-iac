CREATE TABLE IF NOT EXISTS public.user_login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  action text NOT NULL DEFAULT 'login',
  login_method text,
  ip_address text,
  user_agent text,
  source text NOT NULL DEFAULT 'portal',
  traits jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.user_login_events TO authenticated;
GRANT ALL ON public.user_login_events TO service_role;

ALTER TABLE public.user_login_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can record their own login events" ON public.user_login_events;
CREATE POLICY "Users can record their own login events"
ON public.user_login_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own login events" ON public.user_login_events;
CREATE POLICY "Users can view their own login events"
ON public.user_login_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_platform_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS user_login_events_user_created_idx
ON public.user_login_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_login_events_email_created_idx
ON public.user_login_events (lower(email), created_at DESC)
WHERE email IS NOT NULL;

CREATE OR REPLACE FUNCTION public.record_user_login_event(
  _user_id uuid,
  _email text DEFAULT NULL,
  _action text DEFAULT 'login',
  _login_method text DEFAULT NULL,
  _ip_address text DEFAULT NULL,
  _user_agent text DEFAULT NULL,
  _source text DEFAULT 'portal',
  _traits jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.user_login_events (
    user_id,
    email,
    action,
    login_method,
    ip_address,
    user_agent,
    source,
    traits
  ) VALUES (
    _user_id,
    lower(nullif(_email, '')),
    COALESCE(nullif(_action, ''), 'login'),
    nullif(_login_method, ''),
    nullif(_ip_address, ''),
    nullif(_user_agent, ''),
    COALESCE(nullif(_source, ''), 'portal'),
    COALESCE(_traits, '{}'::jsonb)
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.record_user_login_event(uuid, text, text, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_user_login_event(uuid, text, text, text, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_user_login_event(uuid, text, text, text, text, text, text, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_get_user_login_history(
  _user_id uuid,
  _email text DEFAULT NULL,
  _limit integer DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  created_at timestamp with time zone,
  ip_address text,
  action text,
  actor_email text,
  traits jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN QUERY
  WITH durable_events AS (
    SELECT
      e.id,
      e.created_at,
      e.ip_address::text AS ip_address,
      e.action::text AS action,
      e.email::text AS actor_email,
      jsonb_strip_nulls(
        COALESCE(e.traits, '{}'::jsonb) || jsonb_build_object(
          'source', e.source,
          'login_method', e.login_method,
          'user_agent', e.user_agent
        )
      ) AS traits
    FROM public.user_login_events e
    WHERE e.user_id = _user_id
      OR (
        _email IS NOT NULL
        AND e.email IS NOT NULL
        AND lower(e.email) = lower(_email)
      )
  ),
  audit_events AS (
    SELECT
      a.id,
      a.created_at,
      a.ip_address::text AS ip_address,
      COALESCE(
        a.payload->'auth_event'->>'action',
        a.payload->>'action',
        'unknown'
      ) AS action,
      COALESCE(
        a.payload->'auth_event'->>'actor_username',
        a.payload->>'actor_username'
      ) AS actor_email,
      COALESCE(
        a.payload->'auth_event'->'traits',
        a.payload->'traits',
        '{}'::jsonb
      ) AS traits
    FROM auth.audit_log_entries a
    WHERE
      COALESCE(
        a.payload->'auth_event'->>'actor_id',
        a.payload->>'actor_id',
        a.payload->>'user_id'
      ) = _user_id::text
      OR (
        _email IS NOT NULL
        AND lower(COALESCE(
          a.payload->'auth_event'->>'actor_username',
          a.payload->>'actor_username',
          a.payload->>'email'
        )) = lower(_email)
      )
  )
  SELECT combined.id, combined.created_at, combined.ip_address, combined.action, combined.actor_email, combined.traits
  FROM (
    SELECT * FROM durable_events
    UNION ALL
    SELECT * FROM audit_events
  ) combined
  ORDER BY combined.created_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) FROM anon;
REVOKE ALL ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) TO service_role;