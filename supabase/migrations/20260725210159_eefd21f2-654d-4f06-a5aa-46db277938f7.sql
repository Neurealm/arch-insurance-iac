CREATE OR REPLACE FUNCTION public.commercial_change_set_cancel(_change_set_id uuid, _reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _tenant UUID; _status TEXT; _actor UUID := auth.uid();
BEGIN
  IF _actor IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE='28000'; END IF;

  SELECT tenant_id, status INTO _tenant, _status
    FROM public.commercial_assumption_change_sets WHERE id = _change_set_id;
  IF _tenant IS NULL THEN RAISE EXCEPTION 'change set not found' USING ERRCODE='23503'; END IF;
  IF _status NOT IN ('draft','validated') THEN
    RAISE EXCEPTION 'cannot cancel change set with status %', _status USING ERRCODE='22023';
  END IF;
  PERFORM public._commercial_require_perm(_tenant, 'commercial.assumption.change.cancel');

  PERFORM set_config('app.commercial_change_set_op', 'server', true);
  UPDATE public.commercial_assumption_change_sets
     SET status = 'cancelled',
         cancelled_by = _actor,
         cancelled_at = now(),
         updated_by = _actor,
         updated_at = now()
   WHERE id = _change_set_id;
  PERFORM set_config('app.commercial_change_set_op', '', true);

  INSERT INTO public.audit_events (tenant_id, actor_user_id, action_code, object_type, object_id, metadata, reason)
  VALUES (_tenant, _actor, 'commercial.assumption.change_set.cancelled',
          'commercial_assumption_change_set', _change_set_id::text,
          jsonb_build_object('reason', _reason, 'prior_status', _status), _reason);
END;
$function$;

REVOKE ALL ON FUNCTION public.commercial_change_set_cancel(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commercial_change_set_cancel(uuid, text) TO authenticated;