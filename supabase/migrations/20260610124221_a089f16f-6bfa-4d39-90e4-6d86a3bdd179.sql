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
  SELECT
    a.id,
    a.created_at,
    a.ip_address::text,
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
    COALESCE(a.payload->'auth_event'->>'actor_id', a.payload->>'actor_id') = _user_id::text
    OR (
      _email IS NOT NULL
      AND lower(COALESCE(a.payload->'auth_event'->>'actor_username', a.payload->>'actor_username')) = lower(_email)
    )
  ORDER BY a.created_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) FROM anon;
REVOKE ALL ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) TO service_role;