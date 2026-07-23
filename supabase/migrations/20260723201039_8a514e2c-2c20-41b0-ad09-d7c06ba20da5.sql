
DROP FUNCTION IF EXISTS public.list_authorized_tenants();
DROP FUNCTION IF EXISTS public.list_tenant_members(uuid, text, text, int, int);
DROP FUNCTION IF EXISTS public.list_tenant_invitations(uuid, text, int, int);
DROP FUNCTION IF EXISTS public.list_tenant_roles(uuid, boolean);
DROP FUNCTION IF EXISTS public.list_audit_events(uuid, timestamptz, timestamptz, uuid, text, text, text, int, int);

CREATE FUNCTION public.list_authorized_tenants()
RETURNS TABLE(
  tenant_id uuid, name text, slug text, status text,
  default_currency_code text, default_timezone text,
  membership_status text, platform_admin boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid(); pa boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
  pa := public.is_platform_admin(uid);
  RETURN QUERY
    SELECT t.id, t.name, t.slug, t.status::text,
           t.default_currency_code, t.default_timezone,
           m.status::text, pa
    FROM public.tenants t
    LEFT JOIN public.memberships m ON m.tenant_id = t.id AND m.user_id = uid
    WHERE pa OR (m.id IS NOT NULL AND m.status = 'active')
    ORDER BY t.name ASC;
END; $$;
REVOKE ALL ON FUNCTION public.list_authorized_tenants() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_authorized_tenants() TO authenticated;

CREATE FUNCTION public.list_tenant_members(
  p_tenant_id uuid, p_status text DEFAULT NULL,
  p_search text DEFAULT NULL, p_limit int DEFAULT 50, p_offset int DEFAULT 0
)
RETURNS TABLE(
  membership_id uuid, user_id uuid, email text, display_name text,
  status text, roles jsonb, joined_at timestamptz, last_active_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
  IF NOT public.has_permission(uid, p_tenant_id, 'members.view') THEN
    RAISE EXCEPTION 'members.view required' USING ERRCODE='42501';
  END IF;
  RETURN QUERY
    WITH base AS (
      SELECT m.id AS mid, m.user_id, p.email, p.display_name,
             m.status::text AS st, m.joined_at, m.last_active_at,
             COALESCE(
               (SELECT jsonb_agg(jsonb_build_object('code', tr.code, 'name', tr.name))
                FROM public.membership_roles mr
                JOIN public.tenant_roles tr ON tr.id = mr.role_id
                WHERE mr.membership_id = m.id AND tr.status = 'active'), '[]'::jsonb) AS rls
      FROM public.memberships m
      LEFT JOIN public.profiles p ON p.user_id = m.user_id
      WHERE m.tenant_id = p_tenant_id
        AND (p_status IS NULL OR m.status::text = p_status)
        AND (p_search IS NULL OR p.email ILIKE '%'||p_search||'%' OR p.display_name ILIKE '%'||p_search||'%')
    ),
    counted AS (SELECT COUNT(*) c FROM base)
    SELECT b.mid, b.user_id, b.email, b.display_name, b.st,
           b.rls, b.joined_at, b.last_active_at, c.c
    FROM base b CROSS JOIN counted c
    ORDER BY b.joined_at DESC NULLS LAST
    LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset);
END; $$;
REVOKE ALL ON FUNCTION public.list_tenant_members(uuid, text, text, int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_tenant_members(uuid, text, text, int, int) TO authenticated;

CREATE FUNCTION public.list_tenant_invitations(
  p_tenant_id uuid, p_status text DEFAULT NULL,
  p_limit int DEFAULT 50, p_offset int DEFAULT 0
)
RETURNS TABLE(
  invitation_id uuid, email text, status text, expires_at timestamptz,
  invited_by uuid, created_at timestamptz, roles jsonb, total_count bigint
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
  IF NOT public.has_permission(uid, p_tenant_id, 'members.view') THEN
    RAISE EXCEPTION 'members.view required' USING ERRCODE='42501';
  END IF;
  RETURN QUERY
    WITH base AS (
      SELECT i.id AS iid, i.email, i.status::text AS st, i.expires_at, i.invited_by, i.created_at,
             COALESCE(
               (SELECT jsonb_agg(jsonb_build_object('code', tr.code, 'name', tr.name))
                FROM public.tenant_invitation_roles ir
                JOIN public.tenant_roles tr ON tr.id = ir.role_id
                WHERE ir.invitation_id = i.id), '[]'::jsonb) AS rls
      FROM public.tenant_invitations i
      WHERE i.tenant_id = p_tenant_id
        AND (p_status IS NULL OR i.status::text = p_status)
    ),
    counted AS (SELECT COUNT(*) c FROM base)
    SELECT b.iid, b.email, b.st, b.expires_at, b.invited_by, b.created_at, b.rls, c.c
    FROM base b CROSS JOIN counted c
    ORDER BY b.created_at DESC
    LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset);
END; $$;
REVOKE ALL ON FUNCTION public.list_tenant_invitations(uuid, text, int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_tenant_invitations(uuid, text, int, int) TO authenticated;

CREATE FUNCTION public.list_tenant_roles(
  p_tenant_id uuid, p_include_archived boolean DEFAULT true
)
RETURNS TABLE(
  role_id uuid, code text, name text, description text, status text,
  is_system_protected boolean, member_count bigint, permission_codes text[]
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
  IF NOT public.has_permission(uid, p_tenant_id, 'roles.view') THEN
    RAISE EXCEPTION 'roles.view required' USING ERRCODE='42501';
  END IF;
  RETURN QUERY
    SELECT r.id, r.code, r.name, r.description, r.status::text,
           r.is_system_protected,
           (SELECT COUNT(*) FROM public.membership_roles mr WHERE mr.role_id = r.id),
           COALESCE(ARRAY(
             SELECT trp.permission_code FROM public.tenant_role_permissions trp
             WHERE trp.role_id = r.id ORDER BY trp.permission_code
           ), ARRAY[]::text[])
    FROM public.tenant_roles r
    WHERE r.tenant_id = p_tenant_id
      AND (p_include_archived OR r.status = 'active')
    ORDER BY r.is_system_protected DESC, r.name ASC;
END; $$;
REVOKE ALL ON FUNCTION public.list_tenant_roles(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_tenant_roles(uuid, boolean) TO authenticated;

CREATE FUNCTION public.list_audit_events(
  p_tenant_id uuid, p_from timestamptz DEFAULT NULL, p_to timestamptz DEFAULT NULL,
  p_actor uuid DEFAULT NULL, p_action text DEFAULT NULL,
  p_object_type text DEFAULT NULL, p_search text DEFAULT NULL,
  p_limit int DEFAULT 50, p_offset int DEFAULT 0
)
RETURNS TABLE(
  event_id uuid, occurred_at timestamptz, actor_user_id uuid, actor_email text,
  action_code text, object_type text, object_id text, reason text, source text,
  correlation_id text, before_values jsonb, after_values jsonb, total_count bigint
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
  IF NOT public.has_permission(uid, p_tenant_id, 'audit.view') THEN
    RAISE EXCEPTION 'audit.view required' USING ERRCODE='42501';
  END IF;
  RETURN QUERY
    WITH base AS (
      SELECT a.id AS eid, a.occurred_at, a.actor_user_id, p.email AS actor_email,
             a.action_code, a.object_type, a.object_id, a.reason, a.source,
             a.correlation_id, a.before_values, a.after_values
      FROM public.audit_events a
      LEFT JOIN public.profiles p ON p.user_id = a.actor_user_id
      WHERE a.tenant_id = p_tenant_id
        AND (p_from IS NULL OR a.occurred_at >= p_from)
        AND (p_to IS NULL OR a.occurred_at <= p_to)
        AND (p_actor IS NULL OR a.actor_user_id = p_actor)
        AND (p_action IS NULL OR a.action_code = p_action)
        AND (p_object_type IS NULL OR a.object_type = p_object_type)
        AND (p_search IS NULL OR a.object_id ILIKE '%'||p_search||'%'
                             OR a.correlation_id ILIKE '%'||p_search||'%')
    ),
    counted AS (SELECT COUNT(*) c FROM base)
    SELECT b.eid, b.occurred_at, b.actor_user_id, b.actor_email,
           b.action_code, b.object_type, b.object_id, b.reason, b.source,
           b.correlation_id, b.before_values, b.after_values, c.c
    FROM base b CROSS JOIN counted c
    ORDER BY b.occurred_at DESC
    LIMIT GREATEST(1, LEAST(p_limit, 200)) OFFSET GREATEST(0, p_offset);
END; $$;
REVOKE ALL ON FUNCTION public.list_audit_events(uuid, timestamptz, timestamptz, uuid, text, text, text, int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_audit_events(uuid, timestamptz, timestamptz, uuid, text, text, text, int, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_platform_home_summary(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  can_members boolean; can_roles boolean; can_audit boolean;
  active_members bigint := NULL; pending_invitations bigint := NULL;
  active_roles bigint := NULL; recent jsonb := NULL;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
  IF NOT public.has_permission(uid, p_tenant_id, 'tenant.view') THEN
    RAISE EXCEPTION 'tenant.view required' USING ERRCODE='42501';
  END IF;
  can_members := public.has_permission(uid, p_tenant_id, 'members.view');
  can_roles   := public.has_permission(uid, p_tenant_id, 'roles.view');
  can_audit   := public.has_permission(uid, p_tenant_id, 'audit.view');
  IF can_members THEN
    SELECT COUNT(*) INTO active_members FROM public.memberships
      WHERE tenant_id = p_tenant_id AND status = 'active';
    SELECT COUNT(*) INTO pending_invitations FROM public.tenant_invitations
      WHERE tenant_id = p_tenant_id AND status = 'pending';
  END IF;
  IF can_roles THEN
    SELECT COUNT(*) INTO active_roles FROM public.tenant_roles
      WHERE tenant_id = p_tenant_id AND status = 'active';
  END IF;
  IF can_audit THEN
    SELECT jsonb_agg(row_to_json(x)) INTO recent FROM (
      SELECT a.id, a.action_code, a.object_type, a.object_id, a.occurred_at, a.actor_user_id
      FROM public.audit_events a
      WHERE a.tenant_id = p_tenant_id
      ORDER BY a.occurred_at DESC LIMIT 10
    ) x;
  END IF;
  RETURN jsonb_build_object(
    'active_members', active_members,
    'pending_invitations', pending_invitations,
    'active_roles', active_roles,
    'recent_audit_events', COALESCE(recent, '[]'::jsonb),
    'permissions', jsonb_build_object(
      'members_view', can_members, 'roles_view', can_roles, 'audit_view', can_audit
    )
  );
END; $$;
REVOKE ALL ON FUNCTION public.get_platform_home_summary(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_platform_home_summary(uuid) TO authenticated;

DROP FUNCTION IF EXISTS public.update_tenant(uuid, text, text, text, text);
CREATE FUNCTION public.update_tenant(
  p_tenant_id uuid, p_name text, p_slug text,
  p_default_currency_code text, p_default_timezone text
)
RETURNS public.tenants
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  before jsonb;
  after_row public.tenants;
  normalized_slug text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='42501'; END IF;
  IF NOT public.has_permission(uid, p_tenant_id, 'tenant.update') THEN
    RAISE EXCEPTION 'tenant.update required' USING ERRCODE='42501';
  END IF;
  IF p_name IS NULL OR length(btrim(p_name)) < 2 THEN
    RAISE EXCEPTION 'name must be at least 2 characters';
  END IF;
  normalized_slug := public.normalize_slug(p_slug);
  IF length(normalized_slug) < 3 OR length(normalized_slug) > 64 THEN
    RAISE EXCEPTION 'slug must be 3-64 characters';
  END IF;
  IF p_default_currency_code !~ '^[A-Z]{3}$' THEN
    RAISE EXCEPTION 'currency must be a 3-letter ISO 4217 code';
  END IF;
  IF NOT public.is_valid_timezone(p_default_timezone) THEN
    RAISE EXCEPTION 'invalid IANA timezone';
  END IF;

  SELECT to_jsonb(t) INTO before FROM public.tenants t WHERE t.id = p_tenant_id;
  IF before IS NULL THEN RAISE EXCEPTION 'tenant not found'; END IF;

  UPDATE public.tenants
    SET name = btrim(p_name),
        slug = normalized_slug,
        default_currency_code = p_default_currency_code,
        default_timezone = p_default_timezone
    WHERE id = p_tenant_id
    RETURNING * INTO after_row;

  PERFORM public.emit_audit_event(
    p_tenant_id, 'tenant.updated', 'tenant', p_tenant_id::text,
    before, to_jsonb(after_row), NULL, '{}'::jsonb
  );
  RETURN after_row;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'slug already in use';
END; $$;
REVOKE ALL ON FUNCTION public.update_tenant(uuid, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_tenant(uuid, text, text, text, text) TO authenticated;
