
-- CRM tables: drop public policies, add authenticated-only policies
DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOR t IN SELECT unnest(ARRAY['crm_companies','crm_departments','crm_teams','crm_stakeholders','crm_activities','crm_notes','stakeholder_registers']) LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format('CREATE POLICY "Authenticated read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "Authenticated insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "Authenticated update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "Authenticated delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (true)', t);
  END LOOP;
END $$;

-- Org tables: drop anonymous policies
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['org_business_units','org_practices','org_capability_areas','org_service_functions','org_workflows','org_activities','org_tasks']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Anonymous manage %s" ON public.%I', t, t);
  END LOOP;
END $$;
