-- Phase 5: exact VM names, declared per batch by a named human.
--
-- For the four mutate-an-existing-VM capabilities, HCP_TERRAFORM_SCOPE_BINDINGS
-- names the exact resources a module may touch, and resolveExecutionScope
-- requires set-equality against them. That guarantee is unconditional and does
-- not change here: the server, not the request, decides which VM gets stopped.
--
-- Creation cannot work that way. The machines do not exist yet and their names
-- come from a ticket, so no server secret can enumerate them in advance. The
-- owner's decision was to keep exact set-equality rather than authorise a name
-- pattern -- so the exact set is declared per batch by a platform administrator
-- in this table, and resolveExecutionScope requires the plan's declared targets
-- to equal it.
--
-- The declaration lives in the database rather than in the secret so that it is
-- made in the console, records who authorised what and when, and does not
-- require editing a server secret -- which the Edge Function reads per request
-- and could otherwise serve stale -- for every batch.

CREATE TABLE public.iac_provisioning_authorizations (
  package_id uuid PRIMARY KEY REFERENCES public.iac_change_packages(id) ON DELETE CASCADE,
  target_resource_ids text[] NOT NULL,
  authorized_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  authorized_at timestamptz NOT NULL DEFAULT now(),
  comment text NOT NULL CHECK (length(btrim(comment)) >= 10)
);

ALTER TABLE public.iac_provisioning_authorizations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.iac_provisioning_authorizations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.iac_provisioning_authorizations TO authenticated;
GRANT ALL ON public.iac_provisioning_authorizations TO service_role;

-- Readable by the package's author and by platform administrators, so the
-- console can show whether a batch has been authorised. Never client-writable.
CREATE POLICY iac_provisioning_authorizations_select_requester_or_admin
ON public.iac_provisioning_authorizations FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.iac_change_packages p
    WHERE p.id = package_id
      AND ((SELECT auth.uid()) = p.created_by OR (SELECT public.is_platform_admin(auth.uid())))
  )
);

-- Immutable once written. Re-authorising a different set means a new package,
-- so an approved plan can never be re-pointed at different machines.
CREATE FUNCTION public.protect_iac_provisioning_authorization() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $guard$
BEGIN
  RAISE EXCEPTION 'a provisioning authorization is immutable; create a new change package'
    USING ERRCODE = '42501';
END;
$guard$;
CREATE TRIGGER protect_iac_provisioning_authorization
  BEFORE UPDATE OR DELETE ON public.iac_provisioning_authorizations
  FOR EACH ROW EXECUTE FUNCTION public.protect_iac_provisioning_authorization();

-- A platform administrator, who is not the requester, names the exact machines.
CREATE FUNCTION public.authorize_iac_provisioning_targets(
  p_package_id uuid,
  p_target_resource_ids text[],
  p_comment text
) RETURNS public.iac_provisioning_authorizations
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $auth$
DECLARE
  v_actor uuid := auth.uid();
  v_pkg public.iac_change_packages%ROWTYPE;
  v_declared text[];
  v_supplied text[];
  v_row public.iac_provisioning_authorizations%ROWTYPE;
BEGIN
  IF v_actor IS NULL OR NOT coalesce(public.is_platform_admin(v_actor), false) THEN
    RAISE EXCEPTION 'a platform administrator must authorize provisioning targets' USING ERRCODE = '42501';
  END IF;
  IF p_comment IS NULL OR length(btrim(p_comment)) < 10 THEN
    RAISE EXCEPTION 'a substantive authorization comment is required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_pkg FROM public.iac_change_packages WHERE id = p_package_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'change_package_not_found' USING ERRCODE = '22023'; END IF;
  IF v_pkg.created_by = v_actor THEN
    RAISE EXCEPTION 'the requester cannot authorize their own provisioning targets' USING ERRCODE = '42501';
  END IF;
  IF v_pkg.action_type <> 'create_vm' THEN
    RAISE EXCEPTION 'only a provisioning package requires target authorization' USING ERRCODE = '22023';
  END IF;
  IF v_pkg.status NOT IN ('draft', 'submitted') THEN
    RAISE EXCEPTION 'targets can only be authorized before review completes' USING ERRCODE = '22023';
  END IF;

  -- The authoriser must name exactly what the package declares. Requiring them
  -- to retype the set is the point: it is an explicit act, not a rubber stamp
  -- on whatever the ticket happened to contain.
  SELECT array_agg(lower(target_resource_id) ORDER BY lower(target_resource_id))
    INTO v_declared FROM public.iac_change_package_targets WHERE package_id = p_package_id;
  SELECT array_agg(DISTINCT lower(btrim(id)) ORDER BY lower(btrim(id)))
    INTO v_supplied FROM unnest(coalesce(p_target_resource_ids, ARRAY[]::text[])) id;
  IF v_declared IS NULL OR v_supplied IS DISTINCT FROM v_declared THEN
    RAISE EXCEPTION 'the authorized targets must match the package''s declared targets exactly' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.iac_provisioning_authorizations (package_id, target_resource_ids, authorized_by, comment)
  VALUES (p_package_id, v_declared, v_actor, btrim(p_comment))
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$auth$;

REVOKE ALL ON FUNCTION public.authorize_iac_provisioning_targets(uuid, text[], text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.authorize_iac_provisioning_targets(uuid, text[], text) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.protect_iac_provisioning_authorization() FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.iac_provisioning_authorizations IS
  'The exact machines a platform administrator authorized a create_vm package to create. resolveExecutionScope requires the package''s declared targets to equal this set, which is how exact set-equality is preserved for resources that do not exist yet.';
