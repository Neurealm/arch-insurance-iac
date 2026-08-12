
-- 1) runops_profiles: restrict SELECT to owner + platform admin (drop tenant-wide read)
DROP POLICY IF EXISTS "runops_profiles_read" ON public.runops_profiles;
CREATE POLICY "runops_profiles_read"
  ON public.runops_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin(auth.uid()));

-- 2) storage.objects: drop duplicate overlapping policies on the 'evidence' bucket
DROP POLICY IF EXISTS "Owners can delete their evidence" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update their evidence" ON storage.objects;
