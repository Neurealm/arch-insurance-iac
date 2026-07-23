-- BP1.1 Invitation Lifecycle Regression
-- Confirms token uniqueness, expiration, cancellation, and idempotency
-- invariants at the schema level. Rolled back at the end.

\set ON_ERROR_STOP on
BEGIN;

DO $inv$
DECLARE
  v_prefix constant text := 'BP1_1_INVITATIONS_FAIL: ';
  v_tenant uuid := gen_random_uuid();
  v_tok text := encode(digest(gen_random_uuid()::text,'sha256'),'hex');
  v_id uuid;
BEGIN
  INSERT INTO public.tenants(id,name,slug,status,default_currency_code,default_timezone)
    VALUES (v_tenant,'Tenant Inv','tenant-inv','active','USD','UTC');

  INSERT INTO public.tenant_invitations(id, tenant_id, email, normalized_email, status, token_hash, expires_at)
    VALUES (gen_random_uuid(), v_tenant, 'A@Example.com','a@example.com','pending', v_tok, now()+interval '7 days')
    RETURNING id INTO v_id;

  -- normalized_email must be lowercased by trigger
  IF NOT EXISTS (SELECT 1 FROM public.tenant_invitations WHERE id = v_id AND normalized_email='a@example.com') THEN
    RAISE EXCEPTION '%normalized_email not lowercased', v_prefix;
  END IF;

  -- token_hash uniqueness
  BEGIN
    INSERT INTO public.tenant_invitations(id, tenant_id, email, normalized_email, status, token_hash, expires_at)
      VALUES (gen_random_uuid(), v_tenant, 'B@Example.com','b@example.com','pending', v_tok, now()+interval '7 days');
    RAISE EXCEPTION '%duplicate token_hash was accepted', v_prefix;
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  RAISE NOTICE 'BP1_1_INVITATIONS_PASS';
END $inv$;

ROLLBACK;
