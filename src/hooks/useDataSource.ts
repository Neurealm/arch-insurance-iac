import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTenantScope } from "@/hooks/useTenantScope";

export type DataMode = "demo" | "live";

/**
 * Returns the current tenant context and whether to render demo or live data.
 *
 * - Tenant users: tenant comes from their membership; mode is `tenants.data_mode`.
 * - Platform admins (and unauthenticated visitors): always demo. Live preview
 *   for a specific tenant happens inside that tenant's workspace, not here.
 */
export function useDataSource(tenantIdOverride?: string | null): {
  mode: DataMode;
  tenantId: string | null;
  loading: boolean;
} {
  const { user, isAdmin, loading: authLoading, roleLoading } = useAuth();
  const scope = useTenantScope();

  const tenantId = tenantIdOverride ?? scope.tenantId ?? null;
  const enabled = !!tenantId;

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-data-mode", tenantId],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tenants")
        .select("data_mode")
        .eq("id", tenantId!)
        .maybeSingle();
      if (error) throw error;
      return (data?.data_mode ?? "demo") as DataMode;
    },
  });

  // No tenant context (admin browsing, anon, marketing pages) → demo.
  if (!user || isAdmin || !tenantId) {
    return {
      mode: "demo",
      tenantId,
      loading: authLoading || roleLoading || scope.loading,
    };
  }

  return {
    mode: data ?? "demo",
    tenantId,
    loading: authLoading || roleLoading || scope.loading || isLoading,
  };
}
