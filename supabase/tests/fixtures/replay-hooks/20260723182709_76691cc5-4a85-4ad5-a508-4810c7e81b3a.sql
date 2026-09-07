-- Replay hook for BP1.1A (20260723182709_…): retire the legacy tenant model.
--
-- The pre-BP1.1 landing-zone migrations created a different public.tenants
-- (boolean status, logo_url) plus public.tenant_memberships. In the live
-- database those legacy objects were removed directly, outside migration
-- history, before BP1.1A ran — which is why BP1.1A creates public.tenants
-- unconditionally and why a from-empty replay collides.
--
-- This hook reproduces that out-of-band cleanup so CI replays the same
-- sequence the live database actually went through. Disposable DB only.

DROP TABLE IF EXISTS public.tenant_memberships CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;
