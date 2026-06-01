DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'org_business_units','org_practices','org_capability_areas',
    'org_service_functions','org_workflows','org_activities','org_tasks'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Platform admins manage %I" ON public.%I', t, t);
    EXECUTE format($f$CREATE POLICY "Authenticated manage %I" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)$f$, t, t);
  END LOOP;
END $$;