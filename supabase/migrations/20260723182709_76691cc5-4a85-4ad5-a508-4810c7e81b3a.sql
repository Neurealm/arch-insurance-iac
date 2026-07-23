
-- =========================================================================
-- BP1.1A: Canonical Platform Data Foundation
-- Additive only. No changes to app_role, user_roles, is_platform_admin,
-- has_role, handle_new_user, or any runops_* object.
-- =========================================================================

-- ---------- ENUMS -------------------------------------------------------

CREATE TYPE public.tenant_status         AS ENUM ('active','suspended','archived');
CREATE TYPE public.membership_status     AS ENUM ('invited','active','suspended','deactivated');
CREATE TYPE public.tenant_role_status    AS ENUM ('active','archived');
CREATE TYPE public.invitation_status     AS ENUM ('pending','accepted','expired','cancelled');

-- ---------- HELPERS -----------------------------------------------------

-- IANA timezone validator
CREATE OR REPLACE FUNCTION public.is_valid_timezone(_tz text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  PERFORM now() AT TIME ZONE _tz;
  RETURN true;
EXCEPTION WHEN others THEN
  RETURN false;
END $$;

-- Slug normalizer: lowercase, hyphenated, alnum only
CREATE OR REPLACE FUNCTION public.normalize_slug(_s text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' FROM
    regexp_replace(
      regexp_replace(lower(coalesce(_s,'')), '[^a-z0-9]+', '-', 'g'),
      '-+', '-', 'g'
    )
  );
$$;

-- ---------- TENANTS -----------------------------------------------------

CREATE TABLE public.tenants (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL CHECK (btrim(name) <> ''),
  slug                  text NOT NULL CHECK (btrim(slug) <> ''),
  status                public.tenant_status NOT NULL DEFAULT 'active',
  default_currency_code text NOT NULL DEFAULT 'USD' CHECK (default_currency_code ~ '^[A-Z]{3}$'),
  default_timezone      text NOT NULL DEFAULT 'UTC' CHECK (public.is_valid_timezone(default_timezone)),
  created_by            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  archived_at           timestamptz
);
CREATE UNIQUE INDEX tenants_slug_ci_uidx ON public.tenants (lower(slug));
CREATE INDEX tenants_status_idx ON public.tenants (status) WHERE archived_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_admin_read  ON public.tenants FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY tenants_admin_write ON public.tenants FOR ALL    TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- Slug normalization + basic guardrails
CREATE OR REPLACE FUNCTION public.tenants_before_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.slug := public.normalize_slug(NEW.slug);
  IF NEW.slug = '' THEN RAISE EXCEPTION 'invalid_slug'; END IF;
  NEW.default_currency_code := upper(NEW.default_currency_code);
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    IF NEW.status = 'archived' AND OLD.status <> 'archived' AND NEW.archived_at IS NULL THEN
      NEW.archived_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER tenants_before_write_trg
BEFORE INSERT OR UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.tenants_before_write();

-- ---------- MEMBERSHIPS -------------------------------------------------

CREATE TABLE public.memberships (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  status           public.membership_status NOT NULL DEFAULT 'invited',
  joined_at        timestamptz,
  last_active_at   timestamptz,
  created_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deactivated_at   timestamptz,
  UNIQUE (tenant_id, user_id)
);
CREATE INDEX memberships_user_idx   ON public.memberships (user_id);
CREATE INDEX memberships_tenant_idx ON public.memberships (tenant_id) WHERE status <> 'deactivated';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY memberships_admin_read  ON public.memberships FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY memberships_admin_write ON public.memberships FOR ALL    TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.memberships_before_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    IF NEW.status = 'active' AND OLD.status <> 'active' AND NEW.joined_at IS NULL THEN
      NEW.joined_at := now();
    END IF;
    IF NEW.status = 'deactivated' AND OLD.status <> 'deactivated' AND NEW.deactivated_at IS NULL THEN
      NEW.deactivated_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER memberships_before_write_trg
BEFORE INSERT OR UPDATE ON public.memberships
FOR EACH ROW EXECUTE FUNCTION public.memberships_before_write();

-- ---------- PERMISSIONS -------------------------------------------------

CREATE TABLE public.permissions (
  code                                text PRIMARY KEY CHECK (code ~ '^[a-z][a-z0-9_.]*$'),
  category                            text NOT NULL,
  description                         text NOT NULL,
  is_system                           boolean NOT NULL DEFAULT true,
  required_for_tenant_administration  boolean NOT NULL DEFAULT false,
  created_at                          timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL    ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY permissions_read       ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY permissions_admin_write ON public.permissions FOR ALL   TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

INSERT INTO public.permissions (code, category, description, is_system, required_for_tenant_administration) VALUES
  ('platform.access',    'platform', 'Access the platform',                       true, true),
  ('tenant.view',        'tenant',   'View tenant profile and settings',          true, true),
  ('tenant.update',      'tenant',   'Update tenant profile and settings',        true, true),
  ('members.view',       'members',  'View tenant members',                       true, true),
  ('members.invite',     'members',  'Invite users to the tenant',                true, true),
  ('members.manage',     'members',  'Manage member status and role assignments', true, true),
  ('roles.view',         'roles',    'View tenant roles and permission mappings', true, true),
  ('roles.manage',       'roles',    'Create, rename, and assign tenant roles',   true, true),
  ('audit.view',         'audit',    'View tenant audit events',                  true, true),
  ('profile.update_own', 'profile',  'Update own user profile',                   true, false)
ON CONFLICT (code) DO NOTHING;

-- ---------- TENANT_ROLES -----------------------------------------------

CREATE TABLE public.tenant_roles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code                text NOT NULL CHECK (code ~ '^[a-z][a-z0-9_]*$'),
  name                text NOT NULL CHECK (btrim(name) <> ''),
  description         text,
  status              public.tenant_role_status NOT NULL DEFAULT 'active',
  is_system_protected boolean NOT NULL DEFAULT false,
  created_by          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  archived_at         timestamptz,
  UNIQUE (tenant_id, code)
);
CREATE INDEX tenant_roles_tenant_active_idx ON public.tenant_roles (tenant_id) WHERE status = 'active';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_roles TO authenticated;
GRANT ALL ON public.tenant_roles TO service_role;
ALTER TABLE public.tenant_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_roles_admin_read  ON public.tenant_roles FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY tenant_roles_admin_write ON public.tenant_roles FOR ALL    TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- Immutable code once assigned to any membership or role-permission mapping
CREATE OR REPLACE FUNCTION public.tenant_roles_before_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    IF NEW.code <> OLD.code THEN
      IF EXISTS (SELECT 1 FROM public.membership_roles         WHERE role_id = OLD.id)
      OR EXISTS (SELECT 1 FROM public.tenant_role_permissions  WHERE role_id = OLD.id)
      OR EXISTS (SELECT 1 FROM public.tenant_invitation_roles  WHERE role_id = OLD.id) THEN
        RAISE EXCEPTION 'tenant_role_code_immutable_after_use';
      END IF;
    END IF;
    IF NEW.status = 'archived' AND OLD.status <> 'archived' AND NEW.archived_at IS NULL THEN
      NEW.archived_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- ---------- TENANT_ROLE_PERMISSIONS ------------------------------------

CREATE TABLE public.tenant_role_permissions (
  tenant_id        uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role_id          uuid NOT NULL REFERENCES public.tenant_roles(id) ON DELETE CASCADE,
  permission_code  text NOT NULL REFERENCES public.permissions(code) ON UPDATE CASCADE,
  assigned_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_code)
);
CREATE INDEX tenant_role_permissions_tenant_idx ON public.tenant_role_permissions (tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_role_permissions TO authenticated;
GRANT ALL ON public.tenant_role_permissions TO service_role;
ALTER TABLE public.tenant_role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY trp_admin_read  ON public.tenant_role_permissions FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY trp_admin_write ON public.tenant_role_permissions FOR ALL    TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- Enforce role.tenant_id matches
CREATE OR REPLACE FUNCTION public.trp_enforce_same_tenant()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_role_tenant uuid;
BEGIN
  SELECT tenant_id INTO v_role_tenant FROM public.tenant_roles WHERE id = NEW.role_id;
  IF v_role_tenant IS NULL OR v_role_tenant <> NEW.tenant_id THEN
    RAISE EXCEPTION 'tenant_role_permission_cross_tenant';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trp_enforce_same_tenant_trg
BEFORE INSERT OR UPDATE ON public.tenant_role_permissions
FOR EACH ROW EXECUTE FUNCTION public.trp_enforce_same_tenant();

-- ---------- MEMBERSHIP_ROLES -------------------------------------------

CREATE TABLE public.membership_roles (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  membership_id  uuid NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  role_id        uuid NOT NULL REFERENCES public.tenant_roles(id) ON DELETE CASCADE,
  assigned_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (membership_id, role_id)
);
CREATE INDEX membership_roles_tenant_idx ON public.membership_roles (tenant_id);
CREATE INDEX membership_roles_role_idx   ON public.membership_roles (role_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.membership_roles TO authenticated;
GRANT ALL ON public.membership_roles TO service_role;
ALTER TABLE public.membership_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY mroles_admin_read  ON public.membership_roles FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY mroles_admin_write ON public.membership_roles FOR ALL    TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.membership_roles_enforce_same_tenant()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_mem_tenant uuid; v_role_tenant uuid;
BEGIN
  SELECT tenant_id INTO v_mem_tenant  FROM public.memberships  WHERE id = NEW.membership_id;
  SELECT tenant_id INTO v_role_tenant FROM public.tenant_roles WHERE id = NEW.role_id;
  IF v_mem_tenant IS NULL OR v_role_tenant IS NULL OR v_mem_tenant <> NEW.tenant_id OR v_role_tenant <> NEW.tenant_id THEN
    RAISE EXCEPTION 'membership_role_cross_tenant';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER membership_roles_enforce_same_tenant_trg
BEFORE INSERT OR UPDATE ON public.membership_roles
FOR EACH ROW EXECUTE FUNCTION public.membership_roles_enforce_same_tenant();

-- ---------- TENANT_INVITATIONS -----------------------------------------

CREATE TABLE public.tenant_invitations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email            text NOT NULL CHECK (btrim(email) <> ''),
  normalized_email text NOT NULL,
  token_hash       bytea NOT NULL,
  status           public.invitation_status NOT NULL DEFAULT 'pending',
  expires_at       timestamptz NOT NULL,
  invited_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at      timestamptz,
  cancelled_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cancelled_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX tenant_invitations_token_uidx ON public.tenant_invitations (token_hash);
CREATE UNIQUE INDEX tenant_invitations_active_uidx
  ON public.tenant_invitations (tenant_id, normalized_email)
  WHERE status = 'pending';
CREATE INDEX tenant_invitations_tenant_idx ON public.tenant_invitations (tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_invitations TO authenticated;
GRANT ALL ON public.tenant_invitations TO service_role;
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY invites_admin_read  ON public.tenant_invitations FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY invites_admin_write ON public.tenant_invitations FOR ALL    TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.tenant_invitations_before_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.normalized_email := lower(btrim(NEW.email));
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER tenant_invitations_before_write_trg
BEFORE INSERT OR UPDATE ON public.tenant_invitations
FOR EACH ROW EXECUTE FUNCTION public.tenant_invitations_before_write();

-- ---------- TENANT_INVITATION_ROLES ------------------------------------

CREATE TABLE public.tenant_invitation_roles (
  tenant_id     uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invitation_id uuid NOT NULL REFERENCES public.tenant_invitations(id) ON DELETE CASCADE,
  role_id       uuid NOT NULL REFERENCES public.tenant_roles(id) ON DELETE CASCADE,
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (invitation_id, role_id)
);
CREATE INDEX tenant_invitation_roles_tenant_idx ON public.tenant_invitation_roles (tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_invitation_roles TO authenticated;
GRANT ALL ON public.tenant_invitation_roles TO service_role;
ALTER TABLE public.tenant_invitation_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY tir_admin_read  ON public.tenant_invitation_roles FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY tir_admin_write ON public.tenant_invitation_roles FOR ALL    TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.tir_enforce_same_tenant()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_inv_tenant uuid; v_role_tenant uuid;
BEGIN
  SELECT tenant_id INTO v_inv_tenant  FROM public.tenant_invitations WHERE id = NEW.invitation_id;
  SELECT tenant_id INTO v_role_tenant FROM public.tenant_roles       WHERE id = NEW.role_id;
  IF v_inv_tenant IS NULL OR v_role_tenant IS NULL OR v_inv_tenant <> NEW.tenant_id OR v_role_tenant <> NEW.tenant_id THEN
    RAISE EXCEPTION 'invitation_role_cross_tenant';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER tir_enforce_same_tenant_trg
BEFORE INSERT OR UPDATE ON public.tenant_invitation_roles
FOR EACH ROW EXECUTE FUNCTION public.tir_enforce_same_tenant();

-- Now that all child tables exist, install the tenant_roles trigger that
-- references them.
CREATE TRIGGER tenant_roles_before_write_trg
BEFORE INSERT OR UPDATE ON public.tenant_roles
FOR EACH ROW EXECUTE FUNCTION public.tenant_roles_before_write();

-- ---------- AUDIT_EVENTS (append-only) ---------------------------------

CREATE TABLE public.audit_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  actor_user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_code       text NOT NULL CHECK (btrim(action_code) <> ''),
  object_type       text NOT NULL,
  object_id         text,
  before_values     jsonb,
  after_values      jsonb,
  reason            text,
  source            text NOT NULL DEFAULT 'server',
  correlation_id    uuid,
  metadata          jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at       timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_tenant_time_idx ON public.audit_events (tenant_id, occurred_at DESC);
CREATE INDEX audit_events_actor_idx       ON public.audit_events (actor_user_id, occurred_at DESC);
CREATE INDEX audit_events_object_idx      ON public.audit_events (object_type, object_id);
CREATE INDEX audit_events_correlation_idx ON public.audit_events (correlation_id) WHERE correlation_id IS NOT NULL;

-- Insert allowed for platform admins; server-side (service_role) bypasses RLS.
-- No UPDATE/DELETE grants → append-only for clients.
GRANT SELECT, INSERT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_admin_read   ON public.audit_events FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY audit_admin_insert ON public.audit_events FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin(auth.uid()));
-- Deliberately no UPDATE or DELETE policies → clients cannot mutate or delete.

-- Belt-and-braces trigger blocks UPDATE/DELETE even if a future policy is added.
CREATE OR REPLACE FUNCTION public.audit_events_reject_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_events_is_append_only';
END $$;
CREATE TRIGGER audit_events_no_update BEFORE UPDATE ON public.audit_events
  FOR EACH ROW EXECUTE FUNCTION public.audit_events_reject_mutation();
CREATE TRIGGER audit_events_no_delete BEFORE DELETE ON public.audit_events
  FOR EACH ROW EXECUTE FUNCTION public.audit_events_reject_mutation();

-- ---------- PROFILE GOVERNED-FIELD PROTECTION --------------------------

CREATE OR REPLACE FUNCTION public.profiles_protect_governed_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_is_admin boolean := false;
BEGIN
  -- service_role and SECURITY DEFINER trigger flows (handle_new_user) have auth.uid() IS NULL
  IF v_caller IS NULL THEN
    RETURN NEW;
  END IF;

  -- Platform admins may set governed fields
  SELECT public.is_platform_admin(v_caller) INTO v_is_admin;
  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Only guard self-inserts; foreign profiles are already denied by RLS.
    IF NEW.user_id = v_caller THEN
      IF NEW.approval_status IS NOT NULL AND NEW.approval_status <> 'pending' THEN
        RAISE EXCEPTION 'profile_governed_field_forbidden: approval_status';
      END IF;
      IF NEW.company_id IS NOT NULL THEN
        RAISE EXCEPTION 'profile_governed_field_forbidden: company_id';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  IF NEW.user_id = v_caller THEN
    IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
      RAISE EXCEPTION 'profile_governed_field_forbidden: approval_status';
    END IF;
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'profile_governed_field_forbidden: company_id';
    END IF;
    IF NEW.user_category IS DISTINCT FROM OLD.user_category THEN
      RAISE EXCEPTION 'profile_governed_field_forbidden: user_category';
    END IF;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_protect_governed_fields_trg ON public.profiles;
CREATE TRIGGER profiles_protect_governed_fields_trg
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_protect_governed_fields();
