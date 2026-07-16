
DROP POLICY IF EXISTS "Users can record their own login events" ON public.user_login_events;
REVOKE INSERT ON public.user_login_events FROM authenticated, anon;
-- Keep SELECT for users to read their own events (existing policy remains).
