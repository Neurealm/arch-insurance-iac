CREATE POLICY "Users self-join tenant on signup"
ON public.tenant_memberships
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'tenant_member');