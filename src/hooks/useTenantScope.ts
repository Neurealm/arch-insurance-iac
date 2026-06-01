import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

export type TenantScope = {
  scoped: boolean;
  loading: boolean;
  tenantId: string | null;
  tenantName: string | null;
  tenantSlug: string | null;
  routes: Set<string>;
  keys: Set<string>;
};

export function useTenantScope(): TenantScope {
  const { user, isAdmin, loading, roleLoading } = useAuth();
  const enabled = !!user?.id && !isAdmin && !roleLoading;

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-scope", user?.id],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: m } = await supabase
        .from("tenant_memberships")
        .select("tenant_id, tenants ( id, name, slug )")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!m) return null;
      const tenantId = (m as any).tenant_id as string;
      const tenant = (m as any).tenants as { name: string; slug: string } | null;
      const { data: assigns } = await supabase
        .from("tenant_tool_assignments")
        .select("tool_id, enabled, tools_catalog ( key, route )")
        .eq("tenant_id", tenantId)
        .eq("enabled", true);
      const routes = new Set<string>();
      const keys = new Set<string>();
      (assigns ?? []).forEach((a: any) => {
        if (a.tools_catalog?.route) routes.add(a.tools_catalog.route);
        if (a.tools_catalog?.key) keys.add(a.tools_catalog.key);
      });
      return { tenantId, tenant, routes, keys };
    },
  });

  const emptySet = useMemo(() => new Set<string>(), []);
  return {
    scoped: enabled && !!data,
    loading: loading || roleLoading || (enabled && isLoading),
    tenantId: data?.tenantId ?? null,
    tenantName: data?.tenant?.name ?? null,
    tenantSlug: data?.tenant?.slug ?? null,
    routes: data?.routes ?? emptySet,
    keys: data?.keys ?? emptySet,
  };
}