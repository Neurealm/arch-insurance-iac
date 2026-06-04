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
  const { user, isAdmin, loading, roleLoading, activeWorkspace } = useAuth();
  const enabled = !!user?.id && !isAdmin && !roleLoading;

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-scope", user?.id, activeWorkspace],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      // Fetch all memberships for this user, then pick the one matching the
      // active workspace slug. This keeps tenants isolated even when the same
      // identity belongs to multiple workspaces.
      const { data: memberships } = await supabase
        .from("tenant_memberships")
        .select("tenant_id, tenants ( id, name, slug )")
        .eq("user_id", user!.id);
      if (!memberships || memberships.length === 0) return null;
      const picked =
        (activeWorkspace
          ? memberships.find((m: any) => m.tenants?.slug === activeWorkspace)
          : null) ?? memberships[0];
      const tenantId = (picked as any).tenant_id as string;
      const tenant = (picked as any).tenants as { name: string; slug: string } | null;
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