CREATE POLICY "Anonymous manage org_business_units"
ON public.org_business_units
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous manage org_practices"
ON public.org_practices
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous manage org_capability_areas"
ON public.org_capability_areas
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous manage org_service_functions"
ON public.org_service_functions
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous manage org_workflows"
ON public.org_workflows
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous manage org_activities"
ON public.org_activities
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous manage org_tasks"
ON public.org_tasks
FOR ALL
TO anon
USING (true)
WITH CHECK (true);