CREATE POLICY "Public read tenant basics" ON public.tenants FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.tenants TO anon;