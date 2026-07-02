DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN
        SELECT c.relname AS table_name
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relkind = 'r' AND n.nspname = 'public'
    LOOP
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl.table_name);
        EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl.table_name);
    END LOOP;
END;
$$;

-- Ensure RLS-helper functions remain executable
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_user_approved(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_tenant_role(uuid, uuid, tenant_role) TO authenticated, anon;