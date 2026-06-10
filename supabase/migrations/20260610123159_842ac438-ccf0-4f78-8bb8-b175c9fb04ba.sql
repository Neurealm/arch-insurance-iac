
CREATE OR REPLACE FUNCTION public.admin_get_user_login_history(_user_id uuid, _email text DEFAULT NULL, _limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  ip_address text,
  action text,
  actor_email text,
  traits jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.created_at,
    a.ip_address::text,
    COALESCE(a.payload->>'action', 'unknown') AS action,
    a.payload->>'actor_username' AS actor_email,
    COALESCE(a.payload->'traits', '{}'::jsonb) AS traits
  FROM auth.audit_log_entries a
  WHERE
    (a.payload->>'actor_id') = _user_id::text
    OR (_email IS NOT NULL AND lower(a.payload->>'actor_username') = lower(_email))
  ORDER BY a.created_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_user_login_history(uuid, text, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_login_history(uuid, text, int) TO service_role;
