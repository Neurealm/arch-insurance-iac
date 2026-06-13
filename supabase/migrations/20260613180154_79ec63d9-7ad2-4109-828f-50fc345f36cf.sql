CREATE OR REPLACE FUNCTION public.admin_get_user_login_history(_user_id uuid, _email text DEFAULT NULL::text, _limit integer DEFAULT 20)
RETURNS TABLE(id uuid, created_at timestamp with time zone, ip_address text, action text, actor_email text, traits jsonb)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
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
        (a.payload::jsonb)->'auth_event'->>'action',
        (a.payload::jsonb)->>'action',
        'unknown'
      ) AS action,
      COALESCE(
        (a.payload::jsonb)->'auth_event'->>'actor_username',
        (a.payload::jsonb)->>'actor_username',
        (a.payload::jsonb)->>'email'
      ) AS actor_email,
      COALESCE(
        (a.payload::jsonb)->'auth_event'->'traits',
        (a.payload::jsonb)->'traits',
        '{}'::jsonb
      ) AS traits
    FROM auth.audit_log_entries a
    WHERE
      COALESCE(
        (a.payload::jsonb)->'auth_event'->>'actor_id',
        (a.payload::jsonb)->>'actor_id',
        (a.payload::jsonb)->>'user_id'
      ) = _user_id::text
      OR (
        _email IS NOT NULL
        AND lower(COALESCE(
          (a.payload::jsonb)->'auth_event'->>'actor_username',
          (a.payload::jsonb)->>'actor_username',
          (a.payload::jsonb)->>'email'
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
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_user_login_history(uuid, text, integer) TO service_role;