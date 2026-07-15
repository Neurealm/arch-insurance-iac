
-- Recreate view with security_invoker so it enforces caller's RLS on the base table
DROP VIEW IF EXISTS public.etdm_technologies_active;
CREATE VIEW public.etdm_technologies_active
  WITH (security_invoker = on)
  AS SELECT * FROM public.etdm_technologies WHERE is_deleted = false;
GRANT SELECT ON public.etdm_technologies_active TO authenticated;
GRANT ALL ON public.etdm_technologies_active TO service_role;

-- Restrict clone RPC executable to authenticated only (function itself enforces platform admin)
REVOKE EXECUTE ON FUNCTION public.etdm_clone_technology(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.etdm_clone_technology(uuid) TO authenticated;

-- Storage policies for etdm-assets bucket (platform admins only)
CREATE POLICY "etdm_assets_admin_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'etdm-assets' AND public.is_platform_admin(auth.uid()));

CREATE POLICY "etdm_assets_admin_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'etdm-assets' AND public.is_platform_admin(auth.uid()));

CREATE POLICY "etdm_assets_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'etdm-assets' AND public.is_platform_admin(auth.uid()))
  WITH CHECK (bucket_id = 'etdm-assets' AND public.is_platform_admin(auth.uid()));

CREATE POLICY "etdm_assets_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'etdm-assets' AND public.is_platform_admin(auth.uid()));
