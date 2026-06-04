-- Storage policies for the evidence bucket
DROP POLICY IF EXISTS "Authenticated can read evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update their evidence" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete their evidence" ON storage.objects;

CREATE POLICY "Authenticated can read evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidence');

CREATE POLICY "Authenticated can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence');

CREATE POLICY "Owners can update their evidence"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'evidence' AND owner = auth.uid())
WITH CHECK (bucket_id = 'evidence' AND owner = auth.uid());

CREATE POLICY "Owners can delete their evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'evidence' AND owner = auth.uid());